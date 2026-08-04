import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Timer, Award, AlertTriangle } from 'lucide-react';
import { CountryConfig } from '../types';

interface WhackMoleProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

export default function WhackMoleGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast
}: WhackMoleProps) {
  const isAr = lang === 'ar';
  const GAME_DURATION = 30; // 30 seconds

  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [activeBomb, setActiveBomb] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('cash_ai_whack_high');
    return saved ? parseInt(saved) : 0;
  });

  const timerRef = useRef<any>(null);
  const moleTimerRef = useRef<any>(null);

  const startWhackGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActiveMole(null);
    setActiveBomb(null);

    // 1-second countdown interval
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Mole spawn tick
    spawnMoleCycle();
  };

  const spawnMoleCycle = () => {
    if (!isPlaying) return;

    // Pick random hole (0 to 8)
    const moleHole = Math.floor(Math.random() * 9);
    
    // Spawn bomb occasionally (25% chance)
    const spawnBomb = Math.random() < 0.25;
    const bombHole = spawnBomb ? Math.floor(Math.random() * 9) : null;

    setActiveMole(moleHole);
    setActiveBomb(bombHole !== moleHole ? bombHole : null);

    // Determine speed depending on time left (faster as time goes down)
    const speed = Math.max(500, 1000 - (GAME_DURATION - timeLeft) * 15);

    moleTimerRef.current = setTimeout(() => {
      spawnMoleCycle();
    }, speed);
  };

  // Re-sync cycle when playing
  useEffect(() => {
    if (isPlaying) {
      spawnMoleCycle();
    }
    return () => {
      clearTimeout(moleTimerRef.current);
    };
  }, [isPlaying]);

  const endGame = () => {
    setIsPlaying(false);
    setActiveMole(null);
    setActiveBomb(null);
    clearInterval(timerRef.current);
    clearTimeout(moleTimerRef.current);

    // Save High Score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('cash_ai_whack_high', score.toString());
    }

    // Award all collected points in a single lump sum payout!
    if (score > 0) {
      const payout = score * 30;
      awardPoints(payout, 'اضرب خلد الفقر: جولة مكتملة', 'Whack a Mole Score');
      triggerToast(
        isAr 
          ? `🏆 مبروك! جمعت +${payout.toLocaleString()} نقطة من ضرب الخلد!` 
          : `🏆 Splendid! You awarded +${payout.toLocaleString()} points from Whacking Moles!`,
        'success'
      );
    } else {
      triggerToast(
        isAr ? '⏱️ انتهى الوقت! جرب مرة أخرى لتجميع النقاط.' : '⏱️ Time up! Try again to stack points.',
        'info'
      );
    }
  };

  // Trigger end game when time runs out
  useEffect(() => {
    if (isPlaying && timeLeft <= 0) {
      endGame();
    }
  }, [timeLeft, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(moleTimerRef.current);
    };
  }, []);

  const handleMoleClick = (holeIndex: number) => {
    if (!isPlaying) return;

    if (holeIndex === activeMole) {
      setScore(prev => prev + 1);
      setActiveMole(null); // Whacked!
    }
  };

  const handleBombClick = (holeIndex: number) => {
    if (!isPlaying) return;

    if (holeIndex === activeBomb) {
      setScore(prev => Math.max(0, prev - 2)); // Penalty
      setActiveBomb(null); // Exploded
      triggerToast(
        isAr ? '💥 واك! ضربت القنبلة وخسرت نقطتين!' : '💥 Ouch! You clicked a bomb and lost 2 points!',
        'info'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <span>{isAr ? 'اضرب خلد الفقر والكاش 🐹' : 'Whack-A-Mole Arena 🐹'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {isAr
            ? 'اضرب خلد الفقر الذهبي قبل أن يختفي! كل خلد تضربه يمنحك +٣٠ نقطة! احذر القنابل!'
            : 'Click the golden moles before they hide! Each hit gives +30 Pts. Avoid clicking bombs!'}
        </p>
      </div>

      {/* Game HUD Bar */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs font-bold">
        <div className="text-right">
          <span className="text-slate-400 block">{isAr ? 'النقاط الحالية' : 'Current Pts'}</span>
          <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-black">
            +{(score * 30).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Timer className={`w-4 h-4 ${timeLeft < 8 ? 'text-red-500 animate-ping' : 'text-slate-500'}`} />
          <span className={`text-sm font-mono ${timeLeft < 8 ? 'text-red-500 font-black' : 'text-slate-700 dark:text-slate-300'}`}>
            {timeLeft}ث
          </span>
        </div>
        <div className="text-left">
          <span className="text-slate-400 block">{isAr ? 'أعلى نتيجة' : 'Top Payout'}</span>
          <span className="text-sm font-mono text-amber-500 font-black">
            +{(highScore * 30).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3x3 Mole Holes Grid */}
      <div className="relative aspect-square w-full max-w-[320px] mx-auto bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 grid-rows-3 gap-4 shadow-inner">
        {Array.from({ length: 9 }).map((_, idx) => {
          const isMoleUp = activeMole === idx;
          const isBombUp = activeBomb === idx;

          return (
            <div 
              key={idx}
              className="relative rounded-full aspect-square bg-slate-300 dark:bg-slate-800/80 border-b-4 border-slate-400 dark:border-slate-900 shadow-inner flex items-center justify-center overflow-hidden"
            >
              {/* Mole Element */}
              <AnimatePresence>
                {isMoleUp && (
                  <motion.button
                    initial={{ y: 50, scale: 0.5 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 50, scale: 0.5 }}
                    onClick={() => handleMoleClick(idx)}
                    className="absolute inset-x-0 bottom-0 top-1 bg-amber-400 rounded-t-3xl flex flex-col items-center justify-center cursor-pointer border border-amber-300 shadow-md outline-none"
                  >
                    <span className="text-2xl select-none leading-none">🐹</span>
                    <span className="text-[7px] font-black tracking-tighter bg-indigo-600 text-white px-1 rounded-full uppercase scale-90 leading-none">CASH</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Bomb Obstacle */}
              <AnimatePresence>
                {isBombUp && (
                  <motion.button
                    initial={{ y: 50, scale: 0.5 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 50, scale: 0.5 }}
                    onClick={() => handleBombClick(idx)}
                    className="absolute inset-x-0 bottom-0 top-1 bg-slate-800 rounded-t-3xl flex flex-col items-center justify-center cursor-pointer border border-slate-700 shadow-md outline-none"
                  >
                    <span className="text-2xl select-none leading-none">💣</span>
                    <AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-pulse mt-0.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Start Game prompt overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 space-y-4">
            <Award className="w-12 h-12 text-amber-400 animate-bounce" />
            <div className="text-white space-y-1">
              <h3 className="font-extrabold text-sm">
                {timeLeft === 0 ? (isAr ? 'انتهت الجولة! ⏱️' : 'Round Finished! ⏱️') : (isAr ? 'مستعد للتصويب؟' : 'Ready to Strike?')}
              </h3>
              <p className="text-[10px] text-slate-300">
                {isAr ? 'اضرب الخلد الذهبي وتجنب القنابل السوداء!' : 'Whack golden moles and dodge black bombs!'}
              </p>
            </div>
            <button
              onClick={startWhackGame}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{timeLeft === GAME_DURATION ? (isAr ? 'ابدأ اللعب الآن' : 'Start Play') : (isAr ? 'إعادة المحاولة' : 'Retry Game')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
