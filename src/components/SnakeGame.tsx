import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Play, AlertCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { CountryConfig } from '../types';

interface SnakeGameProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

type Point = { x: number; y: number };

export default function SnakeGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast
}: SnakeGameProps) {
  const isAr = lang === 'ar';
  const GRID_SIZE = 15; // 15x15 grid

  const [snake, setSnake] = useState<Point[]>([
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 7, y: 9 }
  ]);
  const [direction, setDirection] = useState<string>('UP');
  const [coin, setCoin] = useState<Point>({ x: 3, y: 3 });
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('cash_ai_snake_high');
    return saved ? parseInt(saved) : 0;
  });

  const nextDirectionRef = useRef<string>('UP');

  // Spawn coin at random spot avoiding snake body
  const spawnCoin = (currentSnake: Point[]): Point => {
    while (true) {
      const newCoin = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      if (!currentSnake.some(segment => segment.x === newCoin.x && segment.y === newCoin.y)) {
        return newCoin;
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') nextDirectionRef.current = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') nextDirectionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') nextDirectionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') nextDirectionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver]);

  // Main game tick
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameTick = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = nextDirectionRef.current;
        setDirection(currentDir);

        switch (currentDir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleGameOver(score);
          return prevSnake;
        }

        // Check self-collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          handleGameOver(score);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check coin collision
        if (head.x === coin.x && head.y === coin.y) {
          setScore(prevScore => {
            const nextScore = prevScore + 1;
            // Immediate point reward in the arcade
            awardPoints(20, 'ثعبان الكاش: أكل العملة', 'Snake Coin Collected');
            return nextScore;
          });
          setCoin(spawnCoin(newSnake));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    }, Math.max(120, 220 - score * 8)); // Accelerate speed as score increases

    return () => clearInterval(gameTick);
  }, [gameStarted, gameOver, coin, score]);

  const handleGameOver = (finalScore: number) => {
    setGameOver(true);
    setGameStarted(false);
    
    // Save high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('cash_ai_snake_high', finalScore.toString());
    }

    triggerToast(
      isAr 
        ? `🎮 انتهت اللعبة! رصيد الجولة: +${(finalScore * 20).toLocaleString()} نقطة.`
        : `🎮 Game Over! Session earnings: +${(finalScore * 20).toLocaleString()} points.`,
      'info'
    );
  };

  const startGame = () => {
    setSnake([
      { x: 7, y: 7 },
      { x: 7, y: 8 },
      { x: 7, y: 9 }
    ]);
    nextDirectionRef.current = 'UP';
    setDirection('UP');
    setCoin({ x: 3, y: 3 });
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const changeDirectionTouch = (newDir: string) => {
    if (!gameStarted || gameOver) return;
    if (newDir === 'UP' && direction !== 'DOWN') nextDirectionRef.current = 'UP';
    if (newDir === 'DOWN' && direction !== 'UP') nextDirectionRef.current = 'DOWN';
    if (newDir === 'LEFT' && direction !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    if (newDir === 'RIGHT' && direction !== 'LEFT') nextDirectionRef.current = 'RIGHT';
  };

  return (
    <div className="space-y-5 max-w-md mx-auto text-center">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <span>{isAr ? 'ثعبان الكاش الكلاسيكي 🐍' : 'Cash Snake Arena 🐍'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {isAr
            ? 'التقط العملات الذهبية! كل عملة تمنحك +٢٠ نقطة تضاف فورًا لحسابك!'
            : 'Collect golden coins! Every coin grants you +20 points added instantly!'}
        </p>
      </div>

      {/* Score and High Score HUD */}
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-150 dark:border-slate-850">
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'النقاط الحالية' : 'Current Points'}</span>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
            +{(score * 20).toLocaleString()} {isAr ? 'نقطة' : 'pts'}
          </span>
        </div>
        <div className="text-left">
          <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'أعلى نتيجة' : 'Personal Best'}</span>
          <span className="text-sm font-black text-amber-500 font-mono">
            {(highScore * 20).toLocaleString()} {isAr ? 'نقطة' : 'pts'}
          </span>
        </div>
      </div>

      {/* Grid Based Board with beautiful 3D Perspective */}
      <div className="py-4 [perspective:1000px]">
        <div className="relative aspect-square w-full max-w-[310px] mx-auto bg-slate-100/90 dark:bg-slate-950/90 p-2 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] grid grid-cols-15 grid-rows-15 gap-0.5 [transform:rotateX(22deg)_rotateY(-12deg)] hover:[transform:rotateX(10deg)_rotateY(-5deg)] transition-all duration-700 [transform-style:preserve-3d]">
          
          {/* Render Grid cells as pseudo-3D blocks */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.slice(1).some(seg => seg.x === x && seg.y === y);
            const isCoin = coin.x === x && coin.y === y;

            let cellClass = "bg-slate-200/40 dark:bg-slate-800/40 rounded-xs [transform:translateZ(0px)]";
            let customStyle = {};
            if (isSnakeHead) {
              cellClass = "bg-indigo-600 rounded-md scale-110 z-10 shadow-[0_4px_0_#312e81] border-t border-indigo-400";
              customStyle = { transform: 'translateZ(10px)' };
            } else if (isSnakeBody) {
              cellClass = "bg-indigo-400 rounded-xs scale-95 shadow-[0_3px_0_#1e1b4b]";
              customStyle = { transform: 'translateZ(6px)' };
            } else if (isCoin) {
              cellClass = "bg-amber-400 rounded-full scale-105 shadow-[0_5px_0_#92400e] border border-amber-300 animate-pulse";
              customStyle = { transform: 'translateZ(14px)' };
            }

            return (
              <div 
                key={idx} 
                className={`${cellClass} aspect-square transition-all duration-100 [transform-style:preserve-3d]`}
                style={customStyle}
              />
            );
          })}

          {/* Start Game Prompt Overlay */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 space-y-4 [transform:translateZ(20px)] border border-slate-800 shadow-2xl">
              <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
              <div className="text-white space-y-1">
                <h3 className="font-extrabold text-sm">
                  {gameOver 
                    ? (isAr ? 'انتهت اللعبة! 💥' : 'Game Over! 💥') 
                    : (isAr ? 'هل أنت مستعد للصيد؟' : 'Ready to Slide?')}
                </h3>
                <p className="text-[10px] text-slate-300">
                  {isAr ? 'استخدم أزرار الاتجاهات بالأسفل أو لوحة المفاتيح' : 'Use arrow buttons below or keyboard WASD'}
                </p>
              </div>
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-[0_4px_0_#312e81] border-t border-indigo-400 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'ابدأ اللعب الآن' : 'Start Play'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/On-screen Controller Grid */}
      <div className="flex flex-col items-center justify-center space-y-1 max-w-[200px] mx-auto pt-2">
        <button 
          onClick={() => changeDirectionTouch('UP')}
          className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-xs text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => changeDirectionTouch('LEFT')}
            className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-xs text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11" /> {/* Spacer */}
          <button 
            onClick={() => changeDirectionTouch('RIGHT')}
            className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-xs text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => changeDirectionTouch('DOWN')}
          className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-xs text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
