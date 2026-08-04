import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Award, Play, CheckCircle2 } from 'lucide-react';
import { CountryConfig } from '../types';

interface TicTacToeProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

export default function TicTacToeGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast
}: TicTacToeProps) {
  const isAr = lang === 'ar';
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // Player is X, AI is O
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null); // 'X', 'O', or 'draw'
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [draws, setDraws] = useState(0);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (squares: (string | null)[]) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(square => square !== null)) {
      return 'draw';
    }
    return null;
  };

  const getBestMove = (squares: (string | null)[]): number => {
    // 1. Try to win
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      const vals = [squares[a], squares[b], squares[c]];
      if (vals.filter(v => v === 'O').length === 2 && vals.filter(v => v === null).length === 1) {
        return combo[vals.indexOf(null)];
      }
    }

    // 2. Block player from winning
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      const vals = [squares[a], squares[b], squares[c]];
      if (vals.filter(v => v === 'X').length === 2 && vals.filter(v => v === null).length === 1) {
        return combo[vals.indexOf(null)];
      }
    }

    // 3. Take center if free
    if (squares[4] === null) return 4;

    // 4. Take corners
    const corners = [0, 2, 6, 8];
    const freeCorners = corners.filter(c => squares[c] === null);
    if (freeCorners.length > 0) {
      return freeCorners[Math.floor(Math.random() * freeCorners.length)];
    }

    // 5. Take any free square
    const freeSquares = squares.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
    return freeSquares[Math.floor(Math.random() * freeSquares.length)];
  };

  const makeAIMove = (currentBoard: (string | null)[]) => {
    const bestMove = getBestMove(currentBoard);
    const nextBoard = [...currentBoard];
    nextBoard[bestMove] = 'O';
    
    setBoard(nextBoard);
    setIsXNext(true);

    const gameWinner = checkWinner(nextBoard);
    if (gameWinner) {
      setGameEnded(true);
      setWinner(gameWinner);
      if (gameWinner === 'O') {
        setAiScore(prev => prev + 1);
        triggerToast(
          isAr ? '🤖 الكمبيوتر فاز بالجولة! حاول مرة أخرى.' : '🤖 AI won this round! Try again.',
          'info'
        );
      } else if (gameWinner === 'draw') {
        setDraws(prev => prev + 1);
        awardPoints(50, 'تعادل إكس أو الذكية', 'Tic Tac Toe Draw');
        triggerToast(
          isAr ? '🤝 تعادل رائع! حصلت على +٥٠ نقطة.' : '🤝 Solid draw! Earned +50 points.',
          'success'
        );
      }
    }
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || gameEnded || !isXNext) return;

    const nextBoard = [...board];
    nextBoard[index] = 'X';
    setBoard(nextBoard);
    setIsXNext(false);

    const gameWinner = checkWinner(nextBoard);
    if (gameWinner) {
      setGameEnded(true);
      setWinner(gameWinner);
      if (gameWinner === 'X') {
        setPlayerScore(prev => prev + 1);
        awardPoints(150, 'فوز إكس أو الذكية', 'Tic Tac Toe Victory');
        triggerToast(
          isAr ? '🎉 مبروك! هزمت الكمبيوتر وحصلت على +١٥٠ نقطة!' : '🎉 Congratulations! You beat the AI and earned +150 points!',
          'success'
        );
      } else if (gameWinner === 'draw') {
        setDraws(prev => prev + 1);
        awardPoints(50, 'تعادل إكس أو الذكية', 'Tic Tac Toe Draw');
        triggerToast(
          isAr ? '🤝 تعادل! حصلت على +٥٠ نقطة.' : '🤝 Draw game! Earned +50 points.',
          'success'
        );
      }
    } else {
      // Trigger AI move
      setTimeout(() => {
        makeAIMove(nextBoard);
      }, 500);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameEnded(false);
    setWinner(null);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <span>{isAr ? 'لعبة إكس أو الذكية 🤖' : 'Smart Tic-Tac-Toe 🤖'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {isAr 
            ? 'العب ضد الكمبيوتر الذكي! الفوز يمنحك +١٥٠ نقطة والتعادل يمنحك +٥٠ نقطة.'
            : 'Play against smart AI! Winning awards +150 points, Draw awards +50 points.'}
        </p>
      </div>

      {/* Score HUD */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs font-bold text-slate-600 dark:text-slate-300">
        <div>
          <span className="block text-indigo-600 dark:text-indigo-400 font-black">{isAr ? 'أنت (X)' : 'You (X)'}</span>
          <span className="text-lg font-mono text-slate-800 dark:text-white mt-1 block">{playerScore}</span>
        </div>
        <div>
          <span className="block text-slate-400">{isAr ? 'تعادلات' : 'Draws'}</span>
          <span className="text-lg font-mono text-slate-800 dark:text-white mt-1 block">{draws}</span>
        </div>
        <div>
          <span className="block text-rose-500 font-black">{isAr ? 'الكمبيوتر (O)' : 'AI (O)'}</span>
          <span className="text-lg font-mono text-slate-800 dark:text-white mt-1 block">{aiScore}</span>
        </div>
      </div>

      {/* Game Board Grid with beautiful 3D Perspective */}
      <div className="py-4 [perspective:1000px]">
        <div className="grid grid-cols-3 gap-4 aspect-square w-full max-w-[310px] mx-auto bg-slate-100/90 dark:bg-slate-950/90 p-4 rounded-3xl border-2 border-slate-200/80 dark:border-slate-800/85 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] [transform:rotateX(20deg)_rotateY(-10deg)] hover:[transform:rotateX(8deg)_rotateY(-4deg)] transition-all duration-700 [transform-style:preserve-3d]">
          {board.map((value, idx) => (
            <button
              key={idx}
              onClick={() => handleSquareClick(idx)}
              disabled={gameEnded || value !== null || !isXNext}
              className={`aspect-square w-full rounded-2xl flex items-center justify-center text-4xl font-black transition-all cursor-pointer relative [transform-style:preserve-3d] ${
                value === 'X'
                  ? 'bg-indigo-600 text-white shadow-[0_8px_0_#3730a3,0_12px_20px_rgba(79,70,229,0.35)] border-t border-indigo-400 active:translate-y-[6px] active:shadow-[0_2px_0_#3730a3]'
                  : value === 'O'
                  ? 'bg-rose-500 text-white shadow-[0_8px_0_#9f1239,0_12px_20px_rgba(244,63,94,0.35)] border-t border-rose-400 active:translate-y-[6px] active:shadow-[0_2px_0_#9f1239]'
                  : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700 hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-[0_8px_0_#cbd5e1,0_10px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_0_#0f172a,0_10px_12px_rgba(0,0,0,0.5)] border-t border-slate-100 dark:border-slate-800 active:translate-y-[6px] active:shadow-[0_2px_0_#cbd5e1] dark:active:shadow-[0_2px_0_#0f172a]'
              }`}
              style={{
                transform: 'translateZ(15px)',
              }}
            >
              {value && (
                <motion.span
                  initial={{ scale: 0.3, opacity: 0, z: 20 }}
                  animate={{ scale: 1, opacity: 1, z: 30 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                  className="[text-shadow:0_3px_6px_rgba(0,0,0,0.3)] filter drop-shadow-md select-none"
                >
                  {value}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Game Ended Overlay/Status */}
      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl border ${
            winner === 'X'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
              : winner === 'O'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
              : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-300'
          }`}
        >
          <div className="font-extrabold text-sm mb-2">
            {winner === 'X' && (isAr ? '🏆 فوز عظيم! تمت إضافة +١٥٠ نقطة.' : '🏆 Epic Victory! Added +150 Points.')}
            {winner === 'O' && (isAr ? '🤖 الكمبيوتر فاز هذه المرة. تحدَّه مجدداً!' : '🤖 AI took the win. Challenge again!')}
            {winner === 'draw' && (isAr ? '🤝 مباراة متكافئة وتعادل منصف! حصلت على +٥٠ نقطة.' : '🤝 Even game, fair draw! Earned +50 Points.')}
          </div>
          <button
            onClick={resetGame}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 mx-auto shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'العب جولة جديدة' : 'Play Again'}</span>
          </button>
        </motion.div>
      )}

      {/* Simple Instruction */}
      {!gameEnded && (
        <p className="text-[11px] text-slate-400 font-bold">
          {isAr
            ? isXNext ? '👉 دورك الآن! اختر مربعًا فارغًا.' : '🤖 الكمبيوتر يفكر تلقائيًا...'
            : isXNext ? '👉 Your turn! Select a free square.' : '🤖 AI is planning a move...'}
        </p>
      )}
    </div>
  );
}
