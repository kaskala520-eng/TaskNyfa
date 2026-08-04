import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CountryConfig } from '../types';
import { 
  Trophy, 
  Sparkles, 
  Coins, 
  RotateCw, 
  ArrowRightLeft, 
  HelpCircle, 
  Gamepad2,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatCurrencyValue } from '../utils/currency';

interface MarbleCrushGameProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
}

interface MarbleTarget {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  life: number;
}

export default function MarbleCrushGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast,
  setActiveTab
}: MarbleCrushGameProps) {
  const isAr = lang === 'ar';
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states
  const [throws, setThrows] = useState(0);
  const [crushedCount, setCrushedCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [activeColor, setActiveColor] = useState('#818cf8'); // Active shooting color
  
  // Floating indicator state
  const [floatingIndicators, setFloatingIndicators] = useState<FloatingText[]>([]);
  
  // Web Audio Synth Player
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
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked by browser autoplay policy until user interaction
    }
  };

  // Convert points to cash values dynamically
  const totalSessionPoints = throws * 50;
  const realCashEquivalent = totalSessionPoints * selectedCountry.rate;

  // Set up game objects & physics refs
  const mousePosRef = useRef({ x: 200, y: 100 });
  const targetsRef = useRef<MarbleTarget[]>([]);
  const bulletRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number; active: boolean; color: string } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const colors = [
    { hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)' }, // Rose
    { hex: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' }, // Emerald
    { hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },  // Amber
    { hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' },  // Cyan
    { hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' }, // Purple
    { hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)' }  // Blue
  ];

  // Initialize targets once
  const initTargets = () => {
    const newTargets: MarbleTarget[] = [];
    for (let i = 0; i < 7; i++) {
      const colorObj = colors[Math.floor(Math.random() * colors.length)];
      newTargets.push({
        id: i,
        x: 50 + Math.random() * 300,
        y: 60 + Math.random() * 140,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 14 + Math.random() * 6,
        color: colorObj.hex,
        glowColor: colorObj.glow
      });
    }
    targetsRef.current = newTargets;
  };

  useEffect(() => {
    initTargets();
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateGame = () => {
      // Clear with elegant dark space background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 400, 500);

      // Draw starry galaxy dust background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 20; i++) {
        const starX = (i * 41 + 17) % 400;
        const starY = (i * 29 + 13) % 500;
        const size = ((i % 3) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(starX, starY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 1. Update and Draw Targets (Marbles)
      const targets = targetsRef.current;
      targets.forEach(target => {
        // Move targets
        target.x += target.vx;
        target.y += target.vy;

        // Boundaries bounce
        if (target.x < target.radius || target.x > 400 - target.radius) {
          target.vx = -target.vx;
          target.x = target.x < target.radius ? target.radius : 400 - target.radius;
        }
        if (target.y < 30 || target.y > 220) {
          target.vy = -target.vy;
          target.y = target.y < 30 ? 30 : 220;
        }

        // Draw marble glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = target.color;

        // Draw marble sphere with radial gradient for a gorgeous glossy looks
        const gradient = ctx.createRadialGradient(
          target.x - target.radius * 0.3,
          target.y - target.radius * 0.3,
          target.radius * 0.1,
          target.x,
          target.y,
          target.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, target.color);
        gradient.addColorStop(1, '#000000');

        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // High gloss flare overlay
        ctx.beginPath();
        ctx.ellipse(
          target.x - target.radius * 0.25, 
          target.y - target.radius * 0.25, 
          target.radius * 0.35, 
          target.radius * 0.2, 
          -Math.PI / 4, 
          0, 
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });

      // Reset shadows
      ctx.shadowBlur = 0;

      // 2. Aiming Guideline Dotted Line
      const shooterX = 200;
      const shooterY = 460;
      const mousePos = mousePosRef.current;
      const dx = mousePos.x - shooterX;
      const dy = mousePos.y - shooterY;
      const angle = Math.atan2(dy, dx);

      // Only draw guideline if no active bullet is flying
      if (!bulletRef.current || !bulletRef.current.active) {
        ctx.beginPath();
        ctx.setLineDash([5, 8]);
        ctx.moveTo(shooterX, shooterY);
        // Draw path line towards angle
        const lineLength = 220;
        ctx.lineTo(
          shooterX + Math.cos(angle) * lineLength,
          shooterY + Math.sin(angle) * lineLength
        );
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]); // Reset
      }

      // 3. Draw Launcher Shooter Base & Pipe
      ctx.save();
      ctx.translate(shooterX, shooterY);
      ctx.rotate(angle);

      // Launcher pipe
      const pipeGrad = ctx.createLinearGradient(-12, -25, 12, 15);
      pipeGrad.addColorStop(0, '#6366f1');
      pipeGrad.addColorStop(0.5, '#4f46e5');
      pipeGrad.addColorStop(1, '#312e81');

      ctx.beginPath();
      ctx.roundRect(-10, -25, 20, 45, 4);
      ctx.fillStyle = pipeGrad;
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing active marble loaded inside pipe
      ctx.shadowBlur = 8;
      ctx.shadowColor = activeColor;
      ctx.beginPath();
      ctx.arc(0, -18, 7, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.fill();

      ctx.restore();
      ctx.shadowBlur = 0; // Reset

      // Shooter metallic round hub base
      const baseGrad = ctx.createRadialGradient(200, 475, 5, 200, 475, 28);
      baseGrad.addColorStop(0, '#1e1b4b');
      baseGrad.addColorStop(0.7, '#312e81');
      baseGrad.addColorStop(1, '#020617');
      
      ctx.beginPath();
      ctx.arc(200, 475, 25, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Update and Draw Bullet
      const bullet = bulletRef.current;
      if (bullet && bullet.active) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Bounce walls
        if (bullet.x < bullet.radius || bullet.x > 400 - bullet.radius) {
          bullet.vx = -bullet.vx;
          bullet.x = bullet.x < bullet.radius ? bullet.radius : 400 - bullet.radius;
          playSound(350, 'sine', 0.08); // wall tick
        }

        // Check if out of bounds (top/bottom)
        if (bullet.y < -bullet.radius || bullet.y > 510) {
          bullet.active = false;
          setCombo(0); // reset streak
        }

        // Draw bullet sphere
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color;
        
        const bulletGradient = ctx.createRadialGradient(
          bullet.x - bullet.radius * 0.3,
          bullet.y - bullet.radius * 0.3,
          bullet.radius * 0.1,
          bullet.x,
          bullet.y,
          bullet.radius
        );
        bulletGradient.addColorStop(0, '#ffffff');
        bulletGradient.addColorStop(0.3, bullet.color);
        bulletGradient.addColorStop(1, '#111827');

        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = bulletGradient;
        ctx.fill();

        ctx.shadowBlur = 0; // Reset

        // Check Collisions with Targets
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          const dist = Math.hypot(bullet.x - target.x, bullet.y - target.y);
          if (dist < bullet.radius + target.radius) {
            // CRUSH MATCH TRIGGER!
            bullet.active = false;
            
            // Pop sounds (cascading pitch based on streak!)
            const currentStreak = combo + 1;
            const popFreq = 400 + (currentStreak * 80);
            playSound(popFreq, 'triangle', 0.22, popFreq * 0.1);

            // Spawn Particles
            for (let p = 0; p < 15; p++) {
              const speed = 1.5 + Math.random() * 4;
              const angle = Math.random() * Math.PI * 2;
              particlesRef.current.push({
                x: target.x,
                y: target.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + 0.6, // add slight gravity drop
                radius: 1.5 + Math.random() * 2.5,
                color: target.color,
                opacity: 1,
                life: 1
              });
            }

            // Move the target to a new randomized spot
            const newColor = colors[Math.floor(Math.random() * colors.length)];
            target.x = 40 + Math.random() * 320;
            target.y = 40 + Math.random() * 140;
            target.vx = (Math.random() - 0.5) * 3.5;
            target.vy = (Math.random() - 0.5) * 2;
            target.color = newColor.hex;
            target.glowColor = newColor.glow;

            // Trigger floating indicator text inside canvas
            const triggerX = target.x;
            const triggerY = target.y;
            const streakBonus = currentStreak > 1 ? ` (x${currentStreak} Combo!)` : '';
            
            setFloatingIndicators(prev => [
              ...prev,
              {
                id: Math.random(),
                x: triggerX,
                y: triggerY - 20,
                text: isAr ? `سحق رائع! ✨${streakBonus}` : `CRUSHED! ✨${streakBonus}`,
                opacity: 1,
                color: bullet.color
              }
            ]);

            // Increment crushed counter & combo
            setCrushedCount(prev => prev + 1);
            setCombo(prev => {
              const newCombo = prev + 1;
              if (newCombo > maxCombo) setMaxCombo(newCombo);
              return newCombo;
            });

            break; // Stop evaluating other collisions for this frame
          }
        }
      }

      // 5. Update and Draw Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025; // fade out speed
        p.opacity = p.life;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Reset

      // Request next frame
      animationIdRef.current = requestAnimationFrame(updateGame);
    };

    updateGame();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [combo, maxCombo, activeColor, isAr]);

  // Handle canvas move to update aiming angle
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Scale client coords to internal 400x500 canvas coordinates
    const scaleX = 400 / rect.width;
    const scaleY = 500 / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Restrict aim to above the shooter
    if (y < 450) {
      mousePosRef.current = { x, y };
    }
  };

  // Handle canvas shoot click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure only one bullet is flying at a time
    if (bulletRef.current && bulletRef.current.active) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 500 / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const shooterX = 200;
    const shooterY = 460;
    const dx = x - shooterX;
    const dy = y - shooterY;
    const angle = Math.atan2(dy, dx);

    // Bullet speed
    const speed = 12.5;
    bulletRef.current = {
      x: shooterX + Math.cos(angle) * 15,
      y: shooterY + Math.sin(angle) * 15,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 9,
      active: true,
      color: activeColor
    };

    // Shoot retro synth pitch sound
    playSound(260, 'sine', 0.2, 580);

    // CRITICAL MANDATE TRIGGER: award 50 points to users' actual account for every single ball thrown!
    awardPoints(50, 'رمية كرة ماربل كراش', 'Marble Crush Throw');

    // Create a local canvas floating indicator for points
    setFloatingIndicators(prev => [
      ...prev,
      {
        id: Math.random(),
        x: shooterX,
        y: shooterY - 40,
        text: isAr ? '+٥٠ نقطة 💰' : '+50 Points 💰',
        opacity: 1,
        color: '#fbbf24' // gold
      }
    ]);

    // Increment throws state
    setThrows(prev => prev + 1);

    // Pick next random color for launcher
    const nextColorObj = colors[Math.floor(Math.random() * colors.length)];
    setActiveColor(nextColorObj.hex);
  };

  // Floating indicators fade-out timers
  useEffect(() => {
    if (floatingIndicators.length === 0) return;
    const interval = setInterval(() => {
      setFloatingIndicators(prev => 
        prev
          .map(ind => ({ ...ind, y: ind.y - 1.2, opacity: ind.opacity - 0.05 }))
          .filter(ind => ind.opacity > 0)
      );
    }, 45);
    return () => clearInterval(interval);
  }, [floatingIndicators]);

  return (
    <div className="space-y-6">
      {/* Upper Title HUD */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Gamepad2 className="w-3.5 h-3.5 animate-bounce" />
          <span>Marble Crush - Match Master 🔮</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {isAr ? 'ماربل كراش: سيد مطابقة الكرات 🔮' : 'Marble Crush: Match Master 🔮'}
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          {isAr 
            ? 'صوب واقذف الكرات الملونة! كل رمية كرة تمنحك ٥٠ نقطة فورا بحسابك، قم بتجميع النقاط وتحويلها لأموال حقيقية في ثوانٍ!'
            : 'Aim and shoot matching color marbles! Every throw adds exactly +50 points to your account balance, withdrawable for real money!'}
        </p>
      </div>

      {/* Main Game Frame Row Layout */}
      <div className="grid grid-cols-1 lg:col-span-12 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Canvas Arena */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[360px] sm:max-w-[400px] aspect-[4/5] overflow-hidden select-none">
            
            {/* Canvas itself */}
            <canvas
              ref={canvasRef}
              width={400}
              height={500}
              onMouseMove={handleMouseMove}
              onClick={handleCanvasClick}
              className="w-full h-full bg-slate-950 rounded-2xl border-4 border-indigo-950/80 cursor-crosshair shadow-2xl block"
            />

            {/* DOM Overlay Floating points and match indicators */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden font-sans">
              {floatingIndicators.map(ind => (
                <div
                  key={ind.id}
                  style={{
                    left: `${(ind.x / 400) * 100}%`,
                    top: `${(ind.y / 500) * 100}%`,
                    opacity: ind.opacity,
                    color: ind.color,
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 font-black text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap animate-scale-up tracking-wide"
                >
                  {ind.text}
                </div>
              ))}
            </div>

            {/* Instructions Prompt Overlay when no throws yet */}
            {throws === 0 && (
              <div className="absolute inset-x-0 top-1/3 text-center pointer-events-none p-4 animate-pulse">
                <span className="bg-indigo-900/90 text-white px-4 py-2 rounded-xl border border-indigo-500/50 text-xs font-bold shadow-md">
                  {isAr ? '👆 انقر في أي مكان في المربع الأخضر للتصويب والقذف!' : '👆 Click anywhere in the arena to aim and fire!'}
                </span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold mt-2.5">
            {isAr ? '💡 تصطدم الكرات بالجدران الجانبية لارتدادات استراتيجية' : '💡 Balls bounce off side walls for strategic indirect shots'}
          </span>
        </div>

        {/* Right Column: Dynamic Real-time Account Accruals & Payout Integration */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Live Session Accrual Counters */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>{isAr ? 'إحصائيات جولة اللعب الحالية' : 'ACTIVE SESSION STATUS'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Throws Stat Box */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  {isAr ? 'عدد الرميات الكلي:' : 'Total Balls Thrown:'}
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {throws.toLocaleString()}
                </span>
              </div>

              {/* Crushed Match Score */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  {isAr ? 'الكرات المسحوقة:' : 'Marbles Crushed:'}
                </span>
                <span className="text-xl font-black text-emerald-500 font-mono mt-1">
                  {crushedCount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Streak Multiplier Indicators */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isAr ? 'سلسلة الضربات المتتالية (Combo):' : 'Current Combo Streak:'}
                </span>
              </div>
              <span className="text-sm font-black font-mono text-amber-500">
                x{combo} (Max: x{maxCombo})
              </span>
            </div>

            {/* Accrued Points Real-Time equivalent */}
            <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>{isAr ? 'النقاط المكتسبة من هذه الجلسة:' : 'Session Points Claimed:'}</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{totalSessionPoints.toLocaleString()} Pts</span>
                </span>
              </div>

              <div className="border-t border-indigo-900 pt-2 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {isAr ? 'القيمة المالية النقديّة الحقيقية:' : 'Real Cash Value Equivalent:'}
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    {formatCurrencyValue(realCashEquivalent, selectedCountry.currencyCode)}{' '}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 uppercase">
                    {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure real money cashout card info */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-indigo-950 p-5 rounded-2xl border border-amber-200/50 dark:border-indigo-950 space-y-3 shadow-xs">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <span>{isAr ? 'كيف يعمل سحب النقود الحقيقية؟ 💵' : 'Real Cash Withdrawal Guarantee'}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr 
                ? `مقابل كل كرة ترميها في لعبة ماربل كراش، يتم تعبئة حساب ألعابك فورا بـ ٥٠ نقطة. توجه إلى تبويب "محول النقاط" بالتبويب الجانبي لتحويل نقاطك المتراكمة إلى ${selectedCountry.currencySymbol} رصيد محفظة، ومن ثم يمكنك سحبه فوراً عبر Zain Cash، فودافون كاش، STC Pay، أو USDT!`
                : `Every single marble throw adds 50 points straight into your wallet. Visit the "Points Converter" in the sidebar to convert points into your currency, then dispatch a real payout via e-wallets or USDT TRC20 instantly!`}
            </p>

            {/* Quick action buttons to convert / withdraw */}
            {setActiveTab && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setActiveTab('conversion')}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحويل النقاط الآن كاش ⚡' : 'Convert Points to Cash ⚡'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('withdrawal')}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تقديم طلب سحب المحفظة 💰' : 'Request Wallet Withdrawal 💰'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
