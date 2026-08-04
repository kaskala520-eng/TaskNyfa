import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CountryConfig } from '../types';
import { Play, Coins, RotateCw, Sparkles, Award, ArrowRightLeft, Target } from 'lucide-react';
import { formatCurrencyValue } from '../utils/currency';

interface GoldMinerProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
}

interface MiningObject {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'gold' | 'ruby' | 'stone';
  points: number;
  weight: number; // heavier pulls slower
  color: string;
}

export default function GoldMinerGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast,
  setActiveTab
}: GoldMinerProps) {
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(1200);
  const [timeLeft, setTimeLeft] = useState(45);
  const [sessionPoints, setSessionPoints] = useState(0);

  // Sound Synth Generator
  const playSound = (freq: number, type: 'sine' | 'triangle' | 'square', duration: number, sweepTo?: number) => {
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

  // State refs for physics loop (Canvas dimensions: 400x480)
  const clawRef = useRef({
    x: 200,
    y: 60,
    angle: 0,
    angleSpeed: 0.035,
    length: 25,
    state: 'swinging' as 'swinging' | 'shooting' | 'retracting',
    speed: 5,
    retractSpeed: 5,
    maxLen: 340,
    grabbedObj: null as MiningObject | null
  });

  const objectsRef = useRef<MiningObject[]>([]);
  const animationIdRef = useRef<number | null>(null);

  // Initialize mine treasures per level
  const initObjects = (lvl: number) => {
    const list: MiningObject[] = [];
    
    // Add gold nuggets
    list.push({ id: 1, x: 80, y: 180, radius: 15, type: 'gold', points: 150, weight: 2.2, color: '#eab308' });
    list.push({ id: 2, x: 300, y: 220, radius: 22, type: 'gold', points: 250, weight: 3.5, color: '#eab308' });
    list.push({ id: 3, x: 200, y: 350, radius: 12, type: 'gold', points: 100, weight: 1.6, color: '#eab308' });
    list.push({ id: 4, x: 140, y: 280, radius: 20, type: 'gold', points: 200, weight: 3.0, color: '#eab308' });

    // Add Rubies (premium high points, fast retract)
    list.push({ id: 5, x: 330, y: 380, radius: 9, type: 'ruby', points: 300, weight: 1.2, color: '#ec4899' });
    list.push({ id: 6, x: 50, y: 410, radius: 9, type: 'ruby', points: 300, weight: 1.2, color: '#ec4899' });

    // Add heavy obstacles/stones
    list.push({ id: 7, x: 220, y: 220, radius: 18, type: 'stone', points: 20, weight: 4.8, color: '#64748b' });
    list.push({ id: 8, x: 100, y: 360, radius: 24, type: 'stone', points: 30, weight: 5.5, color: '#64748b' });

    // Shuffle and randomize offsets depending on level
    list.forEach(obj => {
      obj.x += (Math.random() - 0.5) * 20;
      obj.y += (Math.random() - 0.5) * 15;
    });

    objectsRef.current = list;
    setTargetScore(1000 + (lvl * 350));
    setTimeLeft(45);
  };

  useEffect(() => {
    initObjects(level);
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [level]);

  // Game Countdown Timer (simple decrement)
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle game end / evaluation when time hits 0
  useEffect(() => {
    if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      // Evaluate target
      if (score >= targetScore) {
        const passBonus = level * 600;
        awardPoints(passBonus, `اجتياز مستوى منجم الذهب ${level} 💎`, `Gold Miner Level ${level} Pass 💎`);
        setSessionPoints(prev => prev + passBonus);
        triggerToast(
          isAr 
            ? `🎉 رائع! اجتزت الهدف! كسبت +${passBonus} نقطة مكافأة!` 
            : `🎉 Awesome! Target achieved! Earned +${passBonus} bonus points!`, 
          'success'
        );
        if (level < 5) {
          setLevel(prev => prev + 1);
        } else {
          setLevel(1);
        }
      } else {
        triggerToast(
          isAr 
            ? `⌛ انتهى الوقت! لم تصل للهدف (${targetScore} نقاط). حاول مجدداً!` 
            : `⌛ Out of time! Failed to reach target (${targetScore} score). Try again!`, 
          'info'
        );
        setScore(0);
        initObjects(level);
      }
    }
  }, [timeLeft, isPlaying, score, targetScore, level]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // 1. Underground Cave Background
      const bgGrad = ctx.createRadialGradient(200, 240, 50, 200, 240, 300);
      bgGrad.addColorStop(0, '#451a03'); // Warm brown soil
      bgGrad.addColorStop(1, '#1c0c02'); // Pitch black deep cave
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 400, 480);

      // Render Cave rock lines/cracks
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.04)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 100);
      ctx.lineTo(150, 150);
      ctx.lineTo(300, 120);
      ctx.lineTo(360, 280);
      ctx.stroke();

      // Top Miner base frame
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, 400, 50);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.lineTo(400, 50);
      ctx.stroke();

      // Draw the Crane winch hub
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.arc(200, 40, 12, 0, Math.PI * 2);
      ctx.fill();

      const claw = clawRef.current;
      const objects = objectsRef.current;

      // 2. Claw States & Physics Physics
      if (claw.state === 'swinging') {
        // Swing left/right
        claw.angle += claw.angleSpeed;
        if (claw.angle > Math.PI / 2.3 || claw.angle < -Math.PI / 2.3) {
          claw.angleSpeed = -claw.angleSpeed;
        }
      } else if (claw.state === 'shooting') {
        // Extend cable
        claw.length += claw.speed;
        
        // Out of boundary retraction
        if (
          claw.x + Math.sin(claw.angle) * claw.length < 10 ||
          claw.x + Math.sin(claw.angle) * claw.length > 390 ||
          claw.y + Math.cos(claw.angle) * claw.length > 470
        ) {
          claw.state = 'retracting';
        }

        // Check Object Collision
        const currentClawX = claw.x + Math.sin(claw.angle) * claw.length;
        const currentClawY = claw.y + Math.cos(claw.angle) * claw.length;

        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];
          const dist = Math.hypot(currentClawX - obj.x, currentClawY - obj.y);
          if (dist < obj.radius + 12) {
            // Grab item!
            claw.grabbedObj = obj;
            claw.state = 'retracting';
            // Play heavy item hit sound
            playSound(120, 'square', 0.15);
            break;
          }
        }
      } else if (claw.state === 'retracting') {
        // Pull cable back
        const currentWeightMultiplier = claw.grabbedObj ? claw.grabbedObj.weight : 1;
        claw.length -= claw.retractSpeed / currentWeightMultiplier;

        if (claw.length <= 25) {
          // Reached miner base
          claw.length = 25;
          claw.state = 'swinging';

          // Deliver points
          if (claw.grabbedObj) {
            const obj = claw.grabbedObj;
            // Remove item
            objectsRef.current = objects.filter(o => o.id !== obj.id);
            claw.grabbedObj = null;

            // Update UI Score
            setScore(prev => {
              const newScore = prev + obj.points;
              return newScore;
            });

            // Deliver dynamic Points
            const earnedPoints = Math.round(obj.points * 0.4); // 40% value conversion
            awardPoints(earnedPoints, `منجم الذهب: استخراج ${isAr ? (obj.type === 'ruby' ? 'ياقوت أحمر 💎' : obj.type === 'stone' ? 'حجر ثقيل 🪨' : 'ذهب خام 🪙') : obj.type}`, `Gold Miner: Claimed ${obj.type}`);
            setSessionPoints(prev => prev + earnedPoints);

            // Chime sound
            playSound(obj.type === 'ruby' ? 987 : 783, 'sine', 0.2, 1200);
            triggerToast(
              isAr 
                ? `🪙 تم استخراج ${obj.type === 'ruby' ? 'ياقوتة نادرة' : obj.type === 'stone' ? 'صخرة بلا فائدة' : 'كتلة ذهبية'}! تمت إضافة +${earnedPoints} نقطة!` 
                : `🪙 Recovered ${obj.type}! Added +${earnedPoints} points!`, 
              'success'
            );
          }
        }
      }

      // 3. Render Cable/Chain
      const endX = claw.x + Math.sin(claw.angle) * claw.length;
      const endY = claw.y + Math.cos(claw.angle) * claw.length;
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(claw.x, claw.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // 4. Render Claw Hook
      ctx.save();
      ctx.translate(endX, endY);
      ctx.rotate(-claw.angle);
      
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3.5;
      // Draw left claw hook curve
      ctx.beginPath();
      ctx.arc(-8, 5, 10, -Math.PI / 3, Math.PI / 2);
      ctx.stroke();
      // Draw right claw hook curve
      ctx.beginPath();
      ctx.arc(8, 5, 10, Math.PI / 2, Math.PI * 1.33);
      ctx.stroke();

      ctx.restore();

      // 5. Render Underground treasures
      objects.forEach(obj => {
        // Draw glow shadows
        ctx.shadowBlur = 10;
        ctx.shadowColor = obj.color;

        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();

        // High luster highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(obj.x - obj.radius * 0.3, obj.y - obj.radius * 0.3, obj.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      // 6. Render Grabbed Object riding on Claw tip
      if (claw.grabbedObj) {
        const obj = claw.grabbedObj;
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(endX, endY + 12, obj.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

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

  // Click handler to launch the claw hook
  const handleLaunchClaw = () => {
    if (!isPlaying) return;
    const claw = clawRef.current;
    if (claw.state === 'swinging') {
      claw.state = 'shooting';
      playSound(350, 'square', 0.2, 120);
    }
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    setScore(0);
    initObjects(level);
    playSound(440, 'triangle', 0.2, 880);
  };

  return (
    <div className="space-y-6">
      {/* Game HUD */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">
          <Target className="w-3.5 h-3.5 animate-pulse" />
          <span>{isAr ? 'المستوى ' : 'Level '}{level} / 5</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {isAr ? '🪙 منجم الذهب كاش: البحث عن الكنوز' : '🪙 Gold Miner: Gold Rush'}
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {isAr 
            ? 'اضغط على المنجم لإطلاق الخطاف عندما يشير نحو الذهب أو الياقوت! الياقوت يمنح مكافآت نقاط ضخمة وسحب كاش!'
            : 'Tap the mine to release your mechanical hook! Rubies and Gold chunks pull massive points and cashouts!'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Play Mine */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div 
            onClick={handleLaunchClaw}
            className="relative w-full max-w-[360px] aspect-[5/6] bg-amber-950 rounded-2xl border-4 border-amber-900 shadow-2xl overflow-hidden cursor-crosshair select-none active:scale-[0.99] transition-transform"
          >
            <canvas
              ref={canvasRef}
              width={400}
              height={480}
              className="w-full h-full block"
            />

            {/* In-game live HUD indicators */}
            {isPlaying && (
              <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between pointer-events-none">
                <span className="bg-slate-900/85 text-amber-400 px-3 py-1 rounded-lg text-[10px] font-black border border-amber-500/30 font-mono">
                  {isAr ? 'الهدف: ' : 'Goal: '}{targetScore}
                </span>
                <span className="bg-slate-900/85 text-rose-400 px-3 py-1 rounded-lg text-[10px] font-black border border-rose-500/30 font-mono">
                  ⏳ {timeLeft}s
                </span>
              </div>
            )}

            {/* Standby/Game Over overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30 text-amber-400 animate-bounce">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm">
                    {isAr ? 'استخراج كنوز منجم الذهب 🪙' : 'Mine treasures underground 🪙'}
                  </h3>
                  <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                    {isAr ? `احصد نقاط كافية للوصول لـ ${targetScore} في أقل من ٤٥ ثانية لتجاوز المستوى ومكافأة +${level * 600} نقطة كاش!` : `Reach target goal score of ${targetScore} under 45 seconds to secure Level clearance +${level * 600} pts bonus!`}
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-lg"
                >
                  {isAr ? 'ابدأ البحث والربح 💎' : 'Start Digging 💎'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Earnings & Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'إحصائيات التنقيب' : 'Mining Operations Hub'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'سكور المنجم الحالي:' : 'Current Mine Score:'}</span>
                <span className="text-2xl font-black text-amber-500 font-mono mt-1">
                  {score} / {targetScore}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'نقاط الكاش المستخرجة:' : 'Session Claimed pts:'}</span>
                <span className="text-2xl font-black text-emerald-500 font-mono mt-1 flex items-center gap-1">
                  <span>+{sessionPoints}</span>
                </span>
              </div>
            </div>

            <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>{isAr ? 'القيمة النقدية المستخرجة كاش:' : 'Extracted Cash Worth:'}</span>
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

          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-slate-900 dark:to-indigo-950/40 p-4 rounded-xl border border-amber-100 dark:border-indigo-950 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>{isAr ? 'معادن المنجم الثمينة' : 'Cave Ore Valuations'}</span>
            </p>
            <p className="leading-relaxed">
              {isAr 
                ? 'الياقوت الوردي خفيف الوزن ويسحب بسرعة فائقة ويمنح أعلى النقاط. كتل الذهب تزن أكثر وتسحب أبطأ، بينما الصخور ثقيلة جداً وبلا نقاط تذكر.'
                : 'Rubies are ultra-light, retract at maximum speed, and yield peak points. Gold slabs are heavy but valuable. Grey stones are extremely heavy waste.'}
            </p>

            {setActiveTab && (
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('conversion')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isAr ? 'سحب أرباح الذهب المحفظة 💰' : 'Request Gold Cashout 💰'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
