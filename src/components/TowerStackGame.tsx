import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CountryConfig } from '../types';
import { Play, Coins, RotateCw, Sparkles, Award, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { formatCurrencyValue } from '../utils/currency';

interface TowerStackProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
}

interface StackBlock {
  x: number;
  width: number;
  color: string;
}

export default function TowerStackGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast,
  setActiveTab
}: TowerStackProps) {
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [perfectCombo, setPerfectCombo] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [lives, setLives] = useState(3);

  // Sound Synth Generator
  const playSound = (freq: number, type: 'sine' | 'triangle' | 'square' | 'sawtooth', duration: number, sweepTo?: number) => {
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
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // State refs for animation loop (Canvas size: 400x480)
  const currentBlockRef = useRef({ x: 0, y: 400, width: 140, speed: 3.5, dir: 1, height: 20 });
  const stackRef = useRef<StackBlock[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const colors = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', 
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', 
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316'
  ];

  const initGame = () => {
    // Ground anchor block
    stackRef.current = [
      { x: 130, width: 140, color: '#334155' }
    ];
    // First sliding block
    currentBlockRef.current = {
      x: 0,
      y: 380, // Stack starts at bottom, goes up
      width: 140,
      speed: 3.2 + (level * 0.6),
      dir: 1,
      height: 20
    };
    setScore(0);
    setPerfectCombo(0);
    setLives(3);
  };

  useEffect(() => {
    initGame();
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [level]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to lighten/darken hex colors dynamically for 3D extrusion
    const adjustColor = (hex: string, percent: number) => {
      try {
        let num = parseInt(hex.replace('#',''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
      } catch (err) {
        return hex;
      }
    };

    // Renders a true 3D isometric block
    const draw3DBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, baseColor: string) => {
      if (w <= 0) return;
      const topHeight = 6;
      const sideWidth = Math.min(12, w * 0.15);

      // 1. Right Side Face (Dark Shadow)
      ctx.fillStyle = adjustColor(baseColor, -25);
      ctx.beginPath();
      ctx.moveTo(x + w - sideWidth, y + topHeight);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - topHeight);
      ctx.lineTo(x + w - sideWidth, y + h);
      ctx.closePath();
      ctx.fill();

      // 2. Top Face (Light Highlight Lid)
      ctx.fillStyle = adjustColor(baseColor, 35);
      ctx.beginPath();
      ctx.moveTo(x, y + topHeight);
      ctx.lineTo(x + sideWidth, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - sideWidth, y + topHeight);
      ctx.closePath();
      ctx.fill();

      // 3. Front Face (Main Base Color)
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(x, y + topHeight);
      ctx.lineTo(x + w - sideWidth, y + topHeight);
      ctx.lineTo(x + w - sideWidth, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();

      // Clean border accent
      ctx.strokeStyle = adjustColor(baseColor, 10);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const gameLoop = () => {
      // 1. Draw elegant dark background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
      skyGrad.addColorStop(0, '#0f172a'); // Deep slate 900
      skyGrad.addColorStop(1, '#1e1b4b'); // Deep indigo 950
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 400, 480);

      // Star constellations
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc((i * 61 + 23) % 400, (i * 31 + 41) % 480, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      const stack = stackRef.current;
      const current = currentBlockRef.current;

      // 2. Render Stacked Blocks in 3D
      const stackOffset = Math.max(0, (stack.length - 8) * 20); // scroll camera up as stack grows
      
      stack.forEach((block, index) => {
        const renderY = 440 - (index * 20) + stackOffset;
        if (renderY < 0 || renderY > 480) return;

        draw3DBlock(ctx, block.x, renderY, block.width, 20, block.color);

        // Tower level numbers
        if (index > 0 && index % 5 === 0) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'black 9px monospace';
          ctx.fillText(`FL ${index}`, block.x + 4, renderY + 14);
        }
      });

      // 3. Render and Move Sliding Block
      if (isPlaying) {
        current.x += current.speed * current.dir;
        // Bounce on borders
        if (current.x <= 0) {
          current.x = 0;
          current.dir = 1;
        } else if (current.x + current.width >= 400) {
          current.x = 400 - current.width;
          current.dir = -1;
        }
      }

      // Render Active Block in 3D
      const currentRenderY = 440 - (stack.length * 20) + stackOffset;
      const activeColor = colors[stack.length % colors.length];
      draw3DBlock(ctx, current.x, currentRenderY, current.width, 20, activeColor);

      if (isPlaying) {
        animationIdRef.current = requestAnimationFrame(gameLoop);
      }
    };

    if (isPlaying) {
      animationIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      gameLoop();
    }

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [isPlaying, isAr]);

  // Drop sliding slab on top of the stack
  const handleDropSlab = () => {
    if (!isPlaying) return;
    
    const stack = stackRef.current;
    const current = currentBlockRef.current;
    const topBlock = stack[stack.length - 1];

    // Determine overlap boundaries
    const leftBound = topBlock.x;
    const rightBound = topBlock.x + topBlock.width;

    // Is the sliding block placed on top?
    if (
      current.x + current.width <= leftBound ||
      current.x >= rightBound
    ) {
      // Complete miss! Lose a life or Game Over
      playSound(120, 'square', 0.35);
      const nextL = lives - 1;
      if (nextL <= 0) {
        setIsPlaying(false);
        triggerToast(isAr ? '💀 سقط اللوح تماماً وانتهت المحاولات!' : '💀 Block completely fell! Game Over.', 'info');
        initGame();
      } else {
        // Keep current width but reset slide
        triggerToast(isAr ? '⚠️ سقط اللوح! فقدت محاولة.' : '⚠️ Slab missed! Lost 1 life.', 'info');
        current.x = 0;
        current.dir = 1;
        setLives(nextL);
      }
      return;
    }

    // Calculate sliced overlap size
    let overlapX = Math.max(current.x, topBlock.x);
    let overlapWidth = Math.min(current.x + current.width, topBlock.x + topBlock.width) - overlapX;

    // Check for "Perfect Alignment" bonus (within 6px offset)
    const offset = Math.abs(current.x - topBlock.x);
    let isPerfect = offset <= 6;

    if (isPerfect) {
      // Restore block width slightly for player ease (combo assist)
      overlapX = topBlock.x;
      overlapWidth = topBlock.width;
      
      const nextC = perfectCombo + 1;
      setPerfectCombo(nextC);
      
      // Award points with perfect streak multipliers
      const perfectBonus = 100 + (nextC * 30);
      awardPoints(perfectBonus, `ضربة مثالية لبناء البرج 🔥`, `Tower Stack Perfect Strike 🔥`);
      setSessionPoints(prev => prev + perfectBonus);
      triggerToast(
        isAr 
          ? `🔥 تطابق مثالي x${nextC}! حصلت على +${perfectBonus} نقطة!` 
          : `🔥 Perfect Match x${nextC}! Awarded +${perfectBonus} points!`, 
        'success'
      );
      playSound(500 + (nextC * 80), 'sine', 0.15, 900);
    } else {
      // Sliced block. Slice off excess!
      setPerfectCombo(0);
      const normalPoints = 40;
      awardPoints(normalPoints, 'وضع لوحة بناء برج كاش 🏗️', 'Tower Stack Normal Slab 🏗️');
      setSessionPoints(prev => prev + normalPoints);
      playSound(340, 'triangle', 0.1);
    }

    // Add new slab to stack
    const blockColor = colors[stack.length % colors.length];
    stackRef.current.push({
      x: overlapX,
      width: overlapWidth,
      color: blockColor
    });

    // Score is number of floors
    const newFloorCount = stackRef.current.length - 1;
    setScore(newFloorCount);

    // Reached level targets (Level Up targets: 8, 15, 25 slabs)
    if (newFloorCount === 8 && level === 1) {
      setLevel(2);
      awardPoints(400, `تخطي الطابق الثامن للبرج 🚀`, `Tower Stack Lvl 1 Clear 🚀`);
      setSessionPoints(p => p + 400);
      triggerToast(isAr ? '🚀 صعدت للمستوى الثاني! حصلت على +٤٠٠ نقطة كاش' : '🚀 Raised to Level 2! Earned +400 Cash pts', 'success');
    } else if (newFloorCount === 15 && level === 2) {
      setLevel(3);
      awardPoints(1000, `تخطي الطابق الخامس عشر 🏆`, `Tower Stack Lvl 2 Clear 🏆`);
      setSessionPoints(p => p + 1000);
      triggerToast(isAr ? '🏆 صعدت للمستوى الثالث الاحترافي! حصلت على +١٠٠٠ نقطة' : '🏆 Professional Level 3 reached! Earned +1000 pts', 'success');
    }

    // Prepare next sliding block
    currentBlockRef.current = {
      x: 0,
      y: 0, // calculated relative dynamically
      width: overlapWidth, // starts with newly sliced width
      speed: 3.2 + (level * 0.6) + (stack.length * 0.08), // accelerates slightly as stack gets higher
      dir: Math.random() > 0.5 ? 1 : -1,
      height: 20
    };
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    initGame();
    playSound(440, 'sine', 0.2, 880);
  };

  return (
    <div className="space-y-6">
      {/* HUD Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'المستوى ' : 'Level '}{level} / 3</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {isAr ? '🏗️ برج كاش: باني الأبراج الذهبية' : '🏗️ Tower Stack: Rich Builder'}
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {isAr 
            ? 'اضغط على زر الإنزال لتركيب السلالم فوق بعضها! كل تطابق مثالي يضاعف نقاطك المستلمة ويحميك من القص!'
            : 'Click DROP to stack the sliding slabs perfectly! Consecutive perfect stacks award massive combo cashouts!'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tower Stack Arena */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden aspect-[3/4]">
            <canvas
              ref={canvasRef}
              width={400}
              height={480}
              className="w-full h-full block"
            />

            {/* Lives Indicator inside gameplay */}
            {isPlaying && (
              <div className="absolute top-3 left-3 flex gap-1 pointer-events-none bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                {Array(lives).fill(0).map((_, i) => (
                  <span key={i} className="text-[10px] text-rose-500">❤️</span>
                ))}
              </div>
            )}

            {/* Dropper Button Layer */}
            {isPlaying && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button
                  onClick={handleDropSlab}
                  className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/30 cursor-pointer select-none transition-all"
                >
                  {isAr ? 'إسقاط اللوح 👇' : 'DROP SLAB 👇'}
                </button>
              </div>
            )}

            {/* Standby/Lobby Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 text-indigo-400 animate-bounce">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm">
                    {isAr ? 'بناء برج الثروة كاش 🏗️' : 'Build Tower Stack 🏗️'}
                  </h3>
                  <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                    {isAr ? `تطابق السلالم بشكل مثالي يرفع البرج للقمة! كل دور يمنحك +٤٠ نقطة، والضربات المتتالية تضاعف الأرباح!` : `Align slabs to build the highest stack. Slabs sliced upon misalignment. Each drop yields +40 pts with multiplier streaks!`}
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-lg"
                >
                  {isAr ? 'ابدأ البناء والربح 🧱' : 'Start Stacking 🧱'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stacker HUD */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Coins className="w-4 h-4 text-indigo-500" />
              <span>{isAr ? 'أرباح البناء الحالية' : 'Stacking Earnings Hub'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'عدد الطوابق المبنية:' : 'Slabs Stacked:'}</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {score} {isAr ? 'طابق' : 'fl'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'الضربات المتتالية Perfect:' : 'Consecutive Perfect:'}</span>
                <span className="text-2xl font-black text-emerald-500 font-mono mt-1">
                  x{perfectCombo}
                </span>
              </div>
            </div>

            <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>{isAr ? 'رصيد الجولة كاش حقيقي:' : 'Session Claimable Worth:'}</span>
                <span className="text-amber-400 font-mono text-xs">+{sessionPoints} pts</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                  {formatCurrencyValue(sessionPoints * selectedCountry.rate, selectedCountry.currencyCode)}{' '}
                </span>
                <span className="text-xs font-bold text-emerald-300 uppercase">
                  {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 p-4 rounded-xl border border-teal-100 dark:border-indigo-950 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>{isAr ? 'قوانين البناء والارتفاع' : 'Stacking Mechanics'}</span>
            </p>
            <p className="leading-relaxed">
              {isAr 
                ? 'عند إنزال اللوح بشكل خاطئ، سيتم قص الجزء الزائد، مما يقلل من عرض اللوح التالي ويجعل المغامرة أكثر إثارة وصعوبة!'
                : 'Failing to land perfectly cuts off the overhanging slab width, making subsequent placements narrower and harder.'}
            </p>

            {setActiveTab && (
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('conversion')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isAr ? 'سحب أرباح البناء كاش حقيقي 🏗️' : 'Cash out Builder Stack 🏗️'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
