import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CountryConfig } from '../types';
import { Play, Coins, RotateCw, Sparkles, Award, ArrowRightLeft } from 'lucide-react';
import { formatCurrencyValue } from '../utils/currency';

interface FlappyCoinProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
  width: number;
}

export default function FlappyCoinGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast,
  setActiveTab
}: FlappyCoinProps) {
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);

  const scoreRef = useRef(0);

  // Sound Synth Generator
  const playSound = (freq: number, type: 'sine' | 'triangle' | 'sawtooth', duration: number, sweepTo?: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (sweepTo) {
        osc.frequency.exponentialRampToValueAtTime(sweepTo, ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // State refs for physics loop (Canvas size: 400x480)
  const coinRef = useRef({ y: 200, velocity: 0, gravity: 0.42, jump: -6.8, radius: 10 });
  const pipesRef = useRef<Pipe[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  // Difficulty metrics per level
  const speedMultiplier = 1 + (level - 1) * 0.25;
  const pipeGap = Math.max(110 - (level - 1) * 8, 80); // pipe gap decreases as level goes up

  // Spawn a pipe
  const spawnPipe = (xPos = 400) => {
    const minHeight = 40;
    const maxHeight = 480 - pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
    const bottomHeight = 480 - topHeight - pipeGap;
    return {
      x: xPos,
      topHeight,
      bottomHeight,
      passed: false,
      width: 52
    };
  };

  const initGame = () => {
    coinRef.current = { y: 200, velocity: 0, gravity: 0.42, jump: -6.8, radius: 10 };
    pipesRef.current = [spawnPipe(400), spawnPipe(620)];
    frameCountRef.current = 0;
    scoreRef.current = 0;
  };

  useEffect(() => {
    initGame();
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [level]);

  // Canvas update loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // 1. Background sky and clouds
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
      skyGrad.addColorStop(0, '#0284c7'); // Deep sky blue
      skyGrad.addColorStop(1, '#0c4a6e'); // Slate sunset blue
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 400, 480);

      // Draw stylized golden glowing stars
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.arc((i * 83 + 17) % 400, (i * 47 + frameCountRef.current * 0.1) % 480, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const coin = coinRef.current;
      const pipes = pipesRef.current;

      if (isPlaying) {
        frameCountRef.current++;

        // 2. Apply Gravity to Coin
        coin.velocity += coin.gravity;
        coin.y += coin.velocity;

        // Floor / Ceiling constraints
        if (coin.y + coin.radius > 480 || coin.y - coin.radius < 0) {
          // Game Over hit
          handleGameOver();
          return;
        }

        // 3. Move and Render Pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
          const pipe = pipes[i];
          pipe.x -= 2.2 * speedMultiplier;

          // Spawn new pipe as old one leaves
          if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
            pipes.push(spawnPipe(400));
            continue;
          }

          // Render Golden Pipes
          const pGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
          pGrad.addColorStop(0, '#eab308'); // gold
          pGrad.addColorStop(0.5, '#fef08a');
          pGrad.addColorStop(1, '#ca8a04');

          ctx.fillStyle = pGrad;
          ctx.strokeStyle = '#854d0e';
          ctx.lineWidth = 2;

          // Top Pipe
          ctx.beginPath();
          ctx.roundRect(pipe.x, 0, pipe.width, pipe.topHeight, [0, 0, 8, 8]);
          ctx.fill();
          ctx.stroke();

          // Bottom Pipe
          ctx.beginPath();
          ctx.roundRect(pipe.x, 480 - pipe.bottomHeight, pipe.width, pipe.bottomHeight, [8, 8, 0, 0]);
          ctx.fill();
          ctx.stroke();

          // Pass Check (Success)
          if (!pipe.passed && pipe.x + pipe.width / 2 < 100) {
            pipe.passed = true;
            const newScore = scoreRef.current + 1;
            scoreRef.current = newScore;
            setScore(newScore);

            if (newScore > bestScore) {
              setBestScore(newScore);
            }

            // Check level progression every 5 successful columns
            if (newScore % 5 === 0 && level < 5) {
              setLevel(l => l + 1);
              playSound(587.33, 'triangle', 0.3, 1174);
              triggerToast(
                isAr ? `⚡ رائع! انتقلت للمستوى ${level + 1} ومكافأة +٢٠٠ نقطة!` : `⚡ Upgraded to Level ${level + 1}! Bonus +200 Pts!`, 
                'success'
              );
              awardPoints(200, `تخطي مستوى قلعة كاش ${level + 1} 🚀`, `Flappy Coin Level Up ${level + 1} 🚀`);
              setSessionPoints(p => p + 200);
            } else {
              // Earn Points for each golden column passed (only if not level up to prevent concurrent awardPoints)
              awardPoints(40, 'عبور حاجز فلاپي كاش 🚀', 'Flappy Coin Clearance 🚀');
              setSessionPoints(p => p + 40);
              playSound(880, 'sine', 0.12, 1200);
            }
          }

          // Collision Check
          const coinX = 100;
          if (
            coinX + coin.radius > pipe.x &&
            coinX - coin.radius < pipe.x + pipe.width
          ) {
            if (coin.y - coin.radius < pipe.topHeight || coin.y + coin.radius > 480 - pipe.bottomHeight) {
              handleGameOver();
              return;
            }
          }
        }
      } else {
        // Draw static standby pipes
        pipes.forEach(pipe => {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
          ctx.fillRect(pipe.x, 480 - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
        });
      }

      // Draw Player Coin with spinning gloss look
      const coinX = 100;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';

      const radGrad = ctx.createRadialGradient(coinX - 3, coin.y - 3, 1, coinX, coin.y, coin.radius);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.3, '#fbbf24'); // gold
      radGrad.addColorStop(1, '#b45309');

      ctx.beginPath();
      ctx.arc(coinX, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fillStyle = radGrad;
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Coin currency "$" or "C" label
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', coinX, coin.y);

      ctx.shadowBlur = 0; // Reset

      if (isPlaying) {
        animationIdRef.current = requestAnimationFrame(gameLoop);
      }
    };

    const handleGameOver = () => {
      playSound(180, 'sawtooth', 0.4);
      setIsPlaying(false);
      triggerToast(isAr ? '💥 لقد اصطدمت بالبرج! حاول مجدداً.' : '💥 Collided! Try again.', 'info');
      initGame();
    };

    gameLoop();

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [isPlaying, level, isAr]);

  const handleTap = () => {
    if (!isPlaying) {
      initGame();
      setIsPlaying(true);
    }
    coinRef.current.velocity = coinRef.current.jump;
    playSound(400, 'sine', 0.1);
  };

  return (
    <div className="space-y-6">
      {/* HUD Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'المستوى ' : 'Level '}{level} / 5</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {isAr ? '🚀 فلاپي كاش: مغامرة الطيران والذهب' : '🚀 Flappy Coin: Sky Adventure'}
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {isAr 
            ? 'اضغط على الشاشة لرفع عملتك الذهبية وتخطي الأعمدة! عبور كل عمود يمنحك +٤٠ نقطة حقيقية فوراً في رصيدك!'
            : 'Tap the sky area to flap your golden coin! Safely passing each tower awards +40 points instantly!'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Area */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div 
            onClick={handleTap}
            className="relative w-full max-w-[360px] aspect-[5/6] bg-slate-950 rounded-2xl border-4 border-indigo-950 shadow-2xl overflow-hidden cursor-pointer select-none active:scale-[0.99] transition-transform"
          >
            <canvas
              ref={canvasRef}
              width={400}
              height={480}
              className="w-full h-full block"
            />

            {/* Tap Prompt Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30 text-amber-400 animate-pulse">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm">
                    {isAr ? 'انقر للطيران وتجميع الذهب 🪙' : 'Tap to Fly & Collect Gold 🪙'}
                  </h3>
                  <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                    {isAr ? 'عبور الحواجز يمنحك +٤٠ نقطة. كل ٥ أعمدة تصعد مستوى وتحصل على +٢٠٠ نقطة إضافية!' : 'Every barrier cleared awards +40 pts. Level up every 5 score for +200 pts!'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTap();
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  {isAr ? 'طيران الآن 🚀' : 'Fly Now 🚀'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Earnings HUD */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Coins className="w-4 h-4 text-indigo-500" />
              <span>{isAr ? 'نقاط الجولة الحالية' : 'Flapper Earnings Hub'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'حواجز ممرّرة:' : 'Score / Pipes:'}</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {score}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'أعلى سكور جولة:' : 'Best Sky Score:'}</span>
                <span className="text-2xl font-black text-emerald-500 font-mono mt-1">
                  {bestScore}
                </span>
              </div>
            </div>

            <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>{isAr ? 'أرباح الجولة الحالية كاش:' : 'Session Cash Equivalent:'}</span>
                <span className="text-amber-400 font-mono text-xs">+{sessionPoints} pts</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-left">
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    {formatCurrencyValue(sessionPoints * selectedCountry.rate, selectedCountry.currencyCode)}{' '}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 uppercase">
                    {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 p-4 rounded-xl border border-emerald-100 dark:border-indigo-950 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>{isAr ? 'نظام المستويات التقدمي' : 'Sky Speed Upgrades'}</span>
            </p>
            <p className="leading-relaxed">
              {isAr 
                ? 'يزداد صعوبة وتحدي اللعبة كلما حققت ٥ نقاط، حيث تزداد سرعة الأبراج وتقل فجوة الطيران لتحدي مهارتك المزدوجة!'
                : 'Difficulty rises progressively every 5 points passed. Speed ramps up, and pipes become tighter for maximum skill building.'}
            </p>

            {setActiveTab && (
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('withdrawal')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{isAr ? 'سحب رصيد فلاپي فوراً ⚡' : 'Withdraw Flappy Balance ⚡'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
