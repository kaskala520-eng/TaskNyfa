import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CountryConfig } from '../types';
import { Play, Coins, RotateCw, Sparkles, Award, ArrowRightLeft, ArrowLeft, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { formatCurrencyValue } from '../utils/currency';

interface Wealth2048Props {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
}

export default function Wealth2048Game({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast,
  setActiveTab
}: Wealth2048Props) {
  const isAr = lang === 'ar';

  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [maxTile, setMaxTile] = useState(2);
  const [gameOver, setGameOver] = useState(false);
  const [sessionPoints, setSessionPoints] = useState(0);

  // Synth Audio generator
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
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Start / Init a 4x4 2048 Grid
  const initBoard = () => {
    let newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    // Add two random 2s or 4s
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setMaxTile(2);
    setGameOver(false);
  };

  const addRandomTile = (currentGrid: number[][]): number[][] => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) {
          // If level is 3, introduce some obstacles that cannot be merged
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length === 0) return currentGrid;

    const randCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[randCell.r][randCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  useEffect(() => {
    initBoard();
  }, [level]);

  // Handle Swipe/Slide operations
  const slideLeft = (board: number[][]): { board: number[][]; pointsGained: number } => {
    let pointsGained = 0;
    const newBoard = board.map(row => {
      // Filter out zeros
      let active = row.filter(val => val !== 0);
      // Merge matching neighbors
      for (let i = 0; i < active.length - 1; i++) {
        if (active[i] === active[i + 1]) {
          const mergedValue = active[i] * 2;
          active[i] = mergedValue;
          active[i + 1] = 0;
          pointsGained += mergedValue;
          
          // Trigger points award in cashout system
          const pointEquivalent = Math.round(mergedValue * 0.2); // merge 32 = 6 points
          if (pointEquivalent > 0) {
            awardPoints(pointEquivalent, `دمج بلاطات كاش ٢٠٤٨ 🧩`, `Wealth 2048 Tile Merge 🧩`);
            setSessionPoints(prev => prev + pointEquivalent);
          }
        }
      }
      // Filter zeros again
      active = active.filter(val => val !== 0);
      // Pad with zeros to size 4
      while (active.length < 4) {
        active.push(0);
      }
      return active;
    });

    return { board: newBoard, pointsGained };
  };

  // Rotate matrix 90 deg clockwise to reuse slideLeft logic
  const rotateClockwise = (matrix: number[][]): number[][] => {
    const size = matrix.length;
    let res = Array(size).fill(null).map(() => Array(size).fill(0));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        res[c][size - 1 - r] = matrix[r][c];
      }
    }
    return res;
  };

  const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    let current = grid;
    let points = 0;
    let moved = false;

    // We can handle all directions by rotating, sliding left, and rotating back
    let tempBoard = current.map(row => [...row]);

    if (direction === 'left') {
      const res = slideLeft(tempBoard);
      tempBoard = res.board;
      points = res.pointsGained;
    } else if (direction === 'right') {
      // Right is flip horizontal, slide left, flip back
      tempBoard = tempBoard.map(row => row.reverse());
      const res = slideLeft(tempBoard);
      tempBoard = res.board.map(row => row.reverse());
      points = res.pointsGained;
    } else if (direction === 'up') {
      // Up is rotate 270 deg (or 3x clockwise), slide left, rotate 90 deg back
      tempBoard = rotateClockwise(rotateClockwise(rotateClockwise(tempBoard)));
      const res = slideLeft(tempBoard);
      tempBoard = rotateClockwise(res.board);
      points = res.pointsGained;
    } else if (direction === 'down') {
      // Down is rotate 90 deg, slide left, rotate 270 deg back
      tempBoard = rotateClockwise(tempBoard);
      const res = slideLeft(tempBoard);
      tempBoard = rotateClockwise(rotateClockwise(rotateClockwise(res.board)));
      points = res.pointsGained;
    }

    // Check if the board actually changed
    const boardChanged = JSON.stringify(grid) !== JSON.stringify(tempBoard);

    if (boardChanged) {
      let nextBoard = addRandomTile(tempBoard);
      setGrid(nextBoard);
      setScore(prev => prev + points);
      
      // Calculate max tile
      let max = 2;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (nextBoard[r][c] > max) max = nextBoard[r][c];
        }
      }
      setMaxTile(max);

      // Level unlocks based on max tile
      if (max >= 256 && level === 1) {
        setLevel(2);
        awardPoints(500, `تجاوز مستوى كاش ٢٠٤٨ المبتدئ 🚀`, `Wealth 2048 Novice Clear 🚀`);
        setSessionPoints(p => p + 500);
        triggerToast(isAr ? '🔥 مستوى دمج فضي مفتوح! حصلت على +٥٠٠ نقطة' : '🔥 Silver Merge Level unlocked! Earned +500 Pts', 'success');
      } else if (max >= 1024 && level === 2) {
        setLevel(3);
        awardPoints(1500, `تجاوز مستوى كاش ٢٠٤٨ الذهبي 🏆`, `Wealth 2048 Gold Clear 🏆`);
        setSessionPoints(p => p + 1500);
        triggerToast(isAr ? '🏆 مستوى دمج ذهبي أسطوري مفتوح! حصلت على +١٥٠٠ نقطة' : '🏆 Legendary Gold Merge Level! Earned +1500 Pts', 'success');
      }

      playSound(300 + points, 'sine', 0.1);

      // Check if board has valid moves left
      if (checkGameOver(nextBoard)) {
        setGameOver(true);
        playSound(180, 'square', 0.4);
        triggerToast(isAr ? '💀 لا توجد حركات متاحة! انتهت اللعبة.' : '💀 No moves left! Game Over.', 'info');
      }
    }
  };

  const checkGameOver = (board: number[][]): boolean => {
    // Check for any empty spots
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return false;
      }
    }
    // Check for any adjacent identical spots
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (r < 3 && board[r + 1][c] === val) return false;
        if (c < 3 && board[r][c + 1] === val) return false;
      }
    }
    return true;
  };

  // Keypress listener for desktop players
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        handleMove('up');
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        handleMove('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        handleMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        handleMove('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver]);

  // Color mapping based on values
  const getTileStyles = (val: number) => {
    switch (val) {
      case 2: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100';
      case 4: return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300';
      case 8: return 'bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100';
      case 16: return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
      case 32: return 'bg-amber-400 text-amber-950 font-black';
      case 64: return 'bg-orange-500 text-white font-black';
      case 128: return 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/20';
      case 256: return 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/30';
      case 512: return 'bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/30';
      case 1024: return 'bg-cyan-500 text-white font-black shadow-lg shadow-cyan-500/30 animate-pulse';
      case 2048: return 'bg-yellow-400 text-amber-950 font-black shadow-xl shadow-yellow-400/50 animate-bounce';
      default: return 'bg-slate-900 text-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* HUD Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'المستوى ' : 'Level '}{level} / 3</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {isAr ? '🧩 دمج كاش ٢٠٤٨: باني الثروة' : '🧩 Merge Cash 2048: Wealth Grid'}
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {isAr 
            ? 'ادمج البلاطات المتطابقة لتصل إلى الرقم ٢٠٤٨! كل عملية دمج للبلاطات تمنحك نقاطاً حقيقية تضاف لمحفظتك!'
            : 'Slide and merge identical tiles to achieve the golden 2048 block! Every single merge grants you cashout points!'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Board Grid */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border-4 border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="grid grid-cols-4 gap-2.5 aspect-square w-full">
              {grid.map((row, r) => 
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-extrabold transition-all duration-150 ${
                      val === 0 ? 'bg-slate-200/50 dark:bg-slate-900/60' : getTileStyles(val)
                    }`}
                  >
                    {val > 0 && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-base font-black tracking-tight font-mono"
                      >
                        {val}
                      </motion.span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Controller Pad on Mobile */}
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-[180px] mx-auto sm:hidden">
              <div></div>
              <button
                onClick={() => handleMove('up')}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs hover:bg-indigo-700 cursor-pointer flex justify-center"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div></div>
              <button
                onClick={() => handleMove('left')}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs hover:bg-indigo-700 cursor-pointer flex justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={initBoard}
                className="p-2.5 bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-150 rounded-xl cursor-pointer flex justify-center"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMove('right')}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs hover:bg-indigo-700 cursor-pointer flex justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <div></div>
              <button
                onClick={() => handleMove('down')}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs hover:bg-indigo-700 cursor-pointer flex justify-center"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <div></div>
            </div>

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-4">
                <span className="text-3xl">💀</span>
                <div className="space-y-1">
                  <h3 className="text-white font-black text-base">{isAr ? 'انتهت الحركات المتاحة!' : 'No more valid merges!'}</h3>
                  <p className="text-xs text-slate-400">{isAr ? 'تم حفظ رصيد نقاطك وسحوباتك بأمان.' : 'All points earned have been secured safely.'}</p>
                </div>
                <button
                  onClick={initBoard}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  {isAr ? 'حاول مجدداً 🔄' : 'Try Again 🔄'}
                </button>
              </div>
            )}
          </div>
          {/* Keyboard tip */}
          <p className="text-[10px] text-slate-400 mt-2 hidden sm:block">
            {isAr ? '💡 استخدم أسهم لوحة المفاتيح للتوجيه والدمج السريع' : '💡 Use your keyboard Arrow keys for lightning slides'}
          </p>
        </div>

        {/* Right Column: Earnings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Coins className="w-4 h-4 text-indigo-500" />
              <span>{isAr ? 'رصيد الدمج والتقدم' : 'Merge Earnings Hub'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'أعلى بلاطة تم بلوغها:' : 'Max Tile achieved:'}</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {maxTile}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{isAr ? 'النقاط المحققة:' : 'Points Scored:'}</span>
                <span className="text-xl font-black text-amber-500 font-mono mt-1">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>{isAr ? 'أرباح الجولة كاش حقيقي:' : 'Withdrawable Money Worth:'}</span>
                <span className="text-emerald-400 font-mono">+{sessionPoints} pts</span>
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

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 p-4 rounded-xl border border-purple-100 dark:border-indigo-950 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>{isAr ? 'مكافآت الترقية بالأرقام' : 'Merge Tier Bonuses'}</span>
            </p>
            <p className="leading-relaxed">
              {isAr 
                ? 'الحصول على بلاطة ٢٥٦ يفتح المستوى الفضي ويمنحك +٥٠٠ نقطة كاش. الحصول على بلاطة ١٠٢٤ يفتح المستوى الذهبي الماسي ومكافأة +١٥٠٠ نقطة فورية!'
                : 'Unlocking tile 256 opens Silver Level with +500 Pts. Merging to tile 1024 opens Legendary Gold with +1500 Pts instantly.'}
            </p>

            {setActiveTab && (
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('conversion')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isAr ? 'سحب رصيد الدمج كاش 💸' : 'Cash out Merged Tiles 💸'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
