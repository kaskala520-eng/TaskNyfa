import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CountryConfig } from '../types';
import { Play, RotateCw, Award, ArrowRightLeft, Coins, Flame, ChevronRight, Gamepad2 } from 'lucide-react';
import { formatCurrencyValue } from '../utils/currency';

interface BrickBreakerProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  active: boolean;
  durability: number;
}

export default function BrickBreakerGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast,
  setActiveTab
}: BrickBreakerProps) {
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);

  const livesRef = useRef(3);

  // Sound generator
  const playSound = (freq: number, type: 'sine' | 'triangle' | 'square', duration: number, sweepTo?: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (sweepTo) {
        osc.frequency.exponentialRampToValueAtTime(sweepTo, ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Game Engine dimensions: 400 width, 450 height
  const paddleRef = useRef({ x: 160, width: 80, height: 12 });
  const ballRef = useRef({ x: 200, y: 380, vx: 3, vy: -4, radius: 7 });
  const bricksRef = useRef<Brick[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const colors = ['#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#a855f7'];

  // Initialize Bricks based on level
  const initBricks = (lvl: number) => {
    const rows = 3 + lvl;
    const cols = 7;
    const brickWidth = 48;
    const brickHeight = 15;
    const padding = 5;
    const offsetTop = 40;
    const offsetLeft = 17;

    const bricks: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const brickX = c * (brickWidth + padding) + offsetLeft;
        const brickY = r * (brickHeight + padding) + offsetTop;
        const color = colors[r % colors.length];
        bricks.push({
          x: brickX,
          y: brickY,
          width: brickWidth,
          height: brickHeight,
          color: color,
          points: (rows - r) * 20,
          active: true,
          durability: lvl > 2 && r === 0 ? 2 : 1 // multi-hit bricks for high levels
        });
      }
    }
    bricksRef.current = bricks;
  };

  useEffect(() => {
    initBricks(level);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [level]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (!ctx) return;
      // Clear background
      ctx.fillStyle = '#0f172a'; // slate 900
      ctx.fillRect(0, 0, 400, 450);

      // Draw starry ambient gold particles
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc((i * 67 + 23) % 400, (i * 37 + 11) % 450, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Paddle
      const paddle = paddleRef.current;
      const paddleGrad = ctx.createLinearGradient(paddle.x, 420, paddle.x + paddle.width, 420);
      paddleGrad.addColorStop(0, '#6366f1'); // Indigo
      paddleGrad.addColorStop(0.5, '#4f46e5');
      paddleGrad.addColorStop(1, '#818cf8');
      
      ctx.fillStyle = paddleGrad;
      ctx.beginPath();
      ctx.roundRect(paddle.x, 420, paddle.width, paddle.height, 6);
      ctx.fill();
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Bricks
      const bricks = bricksRef.current;
      let activeBricksCount = 0;
      bricks.forEach(brick => {
        if (!brick.active) return;
        activeBricksCount++;

        ctx.fillStyle = brick.color;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
        ctx.fill();

        // Highlight sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(brick.x, brick.y, brick.width, 3);

        // Durability border for multi hit
        if (brick.durability > 1) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Handle win state (all bricks broken)
      if (activeBricksCount === 0 && bricks.length > 0) {
        setIsPlaying(false);
        const winBonus = level * 500;
        awardPoints(winBonus, `إتمام مستوى قاذف الكرات ${level} 🏆`, `Brick Breaker Lvl ${level} Victory 🏆`);
        setSessionPoints(prev => prev + winBonus);
        triggerToast(
          isAr 
            ? `🏆 رائع! أكملت المستوى ${level}! حصلت على +${winBonus} نقطة` 
            : `🏆 Amazing! Level ${level} cleared! Awarded +${winBonus} Points`, 
          'success'
        );
        playSound(523, 'sine', 0.4, 1046);
        if (level < 5) {
          setLevel(prev => prev + 1);
        } else {
          setLevel(1);
        }
        return;
      }

      // Move Ball
      if (isPlaying) {
        const ball = ballRef.current;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce walls
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > 400) {
          ball.vx = -ball.vx;
          playSound(250, 'sine', 0.05);
        }
        if (ball.y - ball.radius < 0) {
          ball.vy = -ball.vy;
          playSound(250, 'sine', 0.05);
        }

        // Ball out bottom (Lose Life)
        if (ball.y + ball.radius > 450) {
          playSound(150, 'square', 0.25);
          const nextL = livesRef.current - 1;
          livesRef.current = nextL;
          setLives(nextL);

          if (nextL <= 0) {
            setIsPlaying(false);
            triggerToast(isAr ? '💀 انتهت المحاولات! حاول مجدداً.' : '💀 Game Over! Try again.', 'info');
            setCombo(0);
            livesRef.current = 3;
            setLives(3);
          } else {
            // Reset ball position on paddle
            ball.x = paddle.x + paddle.width / 2;
            ball.y = 410;
            ball.vx = (Math.random() - 0.5) * 4;
            ball.vy = -4;
          }
        }

        // Ball & Paddle collision
        if (
          ball.y + ball.radius >= 420 &&
          ball.y - ball.radius <= 420 + paddle.height &&
          ball.x >= paddle.x &&
          ball.x <= paddle.x + paddle.width
        ) {
          // Calculate bounce angle depending on hit location
          const relativeHit = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          ball.vx = relativeHit * 5;
          ball.vy = -Math.abs(ball.vy);
          playSound(350, 'sine', 0.08);
          setCombo(0); // reset brick consecutive combo
        }

        // Ball & Brick collision
        for (let i = 0; i < bricks.length; i++) {
          const b = bricks[i];
          if (!b.active) continue;

          if (
            ball.x + ball.radius >= b.x &&
            ball.x - ball.radius <= b.x + b.width &&
            ball.y + ball.radius >= b.y &&
            ball.y - ball.radius <= b.y + b.height
          ) {
            // Collision detected
            ball.vy = -ball.vy;
            b.durability--;
            if (b.durability <= 0) {
              b.active = false;
            }

            // Award Points dynamically for breaking
            const hitPoints = b.points + (combo * 5);
            setScore(s => s + hitPoints);
            setSessionPoints(p => p + 30);
            awardPoints(30, 'سحق قالب كاش بستر 🧱', 'Brick Breaker Smash 🧱');

            // Sound with combo pitches
            playSound(400 + (combo * 40), 'triangle', 0.1);
            setCombo(c => c + 1);
            break;
          }
        }
      }

      // Draw Ball with beautiful radial gradient
      const ball = ballRef.current;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      const bGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.radius);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(1, '#fbbf24'); // gold
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      if (isPlaying) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };

    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      // Draw static start message or current arena setup
      gameLoop();
    }

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, level, combo, isAr]);

  // Paddle Controller (Mouse & Touch Drag)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    
    // Set center of paddle to mouse position
    const paddle = paddleRef.current;
    let newX = clientX - paddle.width / 2;
    if (newX < 0) newX = 0;
    if (newX > 400 - paddle.width) newX = 400 - paddle.width;
    paddle.x = newX;
  };

  const handleStartGame = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    // Set initial ball placement
    ballRef.current.x = paddleRef.current.x + paddleRef.current.width / 2;
    ballRef.current.y = 410;
    ballRef.current.vx = 3;
    ballRef.current.vy = -4.5;
    playSound(440, 'sine', 0.2, 880);
  };

  return (
    <div className="space-y-6">
      {/* Game HUD */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">
          <Gamepad2 className="w-3.5 h-3.5 animate-bounce" />
          <span>{isAr ? 'المستوى ' : 'Level '}{level} / 5</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {isAr ? '🧱 قاذف كرات كاش: مدمّر القوالب' : '🧱 Brick Breaker: Coin Buster'}
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {isAr 
            ? 'حرك المضرب بلمس الشاشة لتفجير القوالب الذهبية! كل قالب مكسور يمنحك ٣٠ نقطة حقيقية قابلة للسحب فورا!'
            : 'Bounce the gold ball to demolish the brick matrix! Each brick broken directly credits 30 real withdrawable points!'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Game Area */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[400px] aspect-[8/9] bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={450}
              onMouseMove={handleMouseMove}
              className="w-full h-full block cursor-ew-resize"
            />

            {/* Overlays */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-full border border-indigo-500/30 flex items-center justify-center animate-bounce">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-extrabold text-base">
                    {isAr ? 'جاهز لتفجير قوالب الذهب؟' : 'Ready to demolish bricks?'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {isAr ? 'تفجير كل قالب يمنح +٣٠ نقطة فورا، مكافأة نهاية المرحلة +٥٠٠ نقطة!' : 'Every brick hit earns +30 points. Stage bonus up to +500 points!'}
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors cursor-pointer"
                >
                  {isAr ? 'ابدأ اللعب الآن 🎮' : 'Start Play 🎮'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Game Stats & Cash Out Integration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{isAr ? 'تفاصيل الجولة الحالية' : 'Caster Session HUD'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'النقاط المتراكمة:' : 'Session Cash pts:'}</span>
                <span className="text-lg font-black text-amber-500 font-mono mt-1 flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>+{sessionPoints.toLocaleString()}</span>
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'عدد المحاولات (القلوب):' : 'Ball Lifespans:'}</span>
                <span className="text-lg font-black text-rose-500 font-mono mt-1">
                  {'❤️'.repeat(lives)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-500">{isAr ? 'ضربات القوالب المتتالية:' : 'Active Combo Multiplier:'}</span>
              <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                x{combo} {isAr ? 'مضاعف' : 'Combo'}
              </span>
            </div>

            {/* Dynamic Value Payout */}
            <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>{isAr ? 'رصيد هذه الجولة محلياً:' : 'Withdrawable Money from Session:'}</span>
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

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-indigo-950 p-4 rounded-xl border border-amber-200/40 dark:border-indigo-950/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>{isAr ? 'مستويات صعبة مع مكافآت مضاعفة' : 'Harden Level Modifiers'}</span>
            </p>
            <p className="leading-relaxed">
              {isAr 
                ? 'يتكون التحدي من ٥ مستويات. مع صعودك في المستويات تزداد سرعة ارتداد الكرة ويزداد عدد الصفوف وتحصل على نقاط مضاعفة لقوالب الذهب!'
                : 'Brick Breaker includes 5 rich levels. Ascending levels increases ball velocity, brick stacks, and triples point yields for elite players.'}
            </p>

            {setActiveTab && (
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('conversion')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isAr ? 'سحب رصيد القوالب فوراً ⚡' : 'Cash out Brick Earnings ⚡'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
