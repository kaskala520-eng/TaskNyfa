import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { CountryConfig } from '../types';

interface RPSProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

const choices = [
  { id: 'rock', nameAr: 'حجر ✊', nameEn: 'Rock ✊', beats: 'scissors', color: 'from-rose-500 to-red-600' },
  { id: 'paper', nameAr: 'ورقة ✋', nameEn: 'Paper ✋', beats: 'rock', color: 'from-indigo-500 to-blue-600' },
  { id: 'scissors', nameAr: 'مقص ✌️', nameEn: 'Scissors ✌️', beats: 'paper', color: 'from-amber-500 to-orange-600' }
];

export default function RPSGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast
}: RPSProps) {
  const isAr = lang === 'ar';

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [draws, setDraws] = useState(0);

  const [playerChoice, setPlayerChoice] = useState<any>(null);
  const [aiChoice, setAiChoice] = useState<any>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (choiceId: string) => {
    if (isPlaying) return;

    setIsPlaying(true);
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);

    const userChoice = choices.find(c => c.id === choiceId);
    setPlayerChoice(userChoice);

    // AI thinking delay
    setTimeout(() => {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      setAiChoice(randomChoice);

      if (userChoice?.id === randomChoice.id) {
        setResult('draw');
        setDraws(prev => prev + 1);
        awardPoints(30, 'تعادل حجر ورقة مقص', 'Rock Paper Scissors Draw');
        triggerToast(
          isAr ? '🤝 تعادل! حصلت على +٣٠ نقطة.' : '🤝 Draw! Gained +30 Points.',
          'info'
        );
      } else if (userChoice?.beats === randomChoice.id) {
        setResult('win');
        setPlayerScore(prev => prev + 1);
        awardPoints(100, 'فوز حجر ورقة مقص', 'Rock Paper Scissors Victory');
        triggerToast(
          isAr ? '🎉 مبروك! فزت بالجولة وحصلت على +١٠٠ نقطة!' : '🎉 Victory! You won and earned +100 Points!',
          'success'
        );
      } else {
        setResult('lose');
        setAiScore(prev => prev + 1);
        triggerToast(
          isAr ? '🤖 فاز الكمبيوتر! جرب مرة أخرى.' : '🤖 AI took this round! Try again.',
          'info'
        );
      }

      setIsPlaying(false);
    }, 1200);
  };

  const resetScore = () => {
    setPlayerScore(0);
    setAiScore(0);
    setDraws(0);
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <span>{isAr ? 'تحدي حجر ورقة مقص ✊✋✌️' : 'Rock Paper Scissors ✊✋✌️'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {isAr
            ? 'تحدَّ الذكاء الاصطناعي! الفوز يمنحك +١٠٠ نقطة والتعادل يمنحك +٣٠ نقطة.'
            : 'Challenge the AI! Wins grant +100 Points, draws grant +30 Points.'}
        </p>
      </div>

      {/* Score HUD */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs font-bold">
        <div>
          <span className="block text-indigo-600 dark:text-indigo-400 font-black">{isAr ? 'نقاطك' : 'Your Score'}</span>
          <span className="text-lg font-mono text-slate-800 dark:text-white mt-1 block">{playerScore}</span>
        </div>
        <div>
          <span className="block text-slate-400">{isAr ? 'تعادلات' : 'Draws'}</span>
          <span className="text-lg font-mono text-slate-800 dark:text-white mt-1 block">{draws}</span>
        </div>
        <div>
          <span className="block text-rose-500 font-black">{isAr ? 'الكمبيوتر' : 'AI Score'}</span>
          <span className="text-lg font-mono text-slate-800 dark:text-white mt-1 block">{aiScore}</span>
        </div>
      </div>

      {/* Main Playing Arena */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-150 dark:border-slate-850 p-6 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
        
        <div className="flex items-center justify-around w-full gap-4">
          {/* Player Choice Card */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isAr ? 'اختيارك' : 'Your Choice'}</span>
            <div className={`w-20 h-24 rounded-xl border flex items-center justify-center text-2xl font-black shadow-xs ${
              playerChoice 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}>
              {playerChoice ? (
                <span className="text-3xl">{playerChoice.nameEn.split(' ')[1]}</span>
              ) : (
                <HelpCircle className="w-8 h-8 opacity-40 animate-pulse" />
              )}
            </div>
            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              {playerChoice ? (isAr ? playerChoice.nameAr.split(' ')[0] : playerChoice.nameEn.split(' ')[0]) : (isAr ? 'انتظار...' : 'Waiting...')}
            </span>
          </div>

          {/* Versus Divider */}
          <div className="font-black text-slate-300 dark:text-slate-700 font-mono text-xl">
            {isPlaying ? (
              <span className="animate-ping text-indigo-500">⚡</span>
            ) : 'VS'}
          </div>

          {/* AI Choice Card */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isAr ? 'الكمبيوتر' : 'AI Choice'}</span>
            <div className={`w-20 h-24 rounded-xl border flex items-center justify-center text-2xl font-black shadow-xs ${
              aiChoice 
                ? 'bg-rose-500 border-rose-400 text-white' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}>
              {aiChoice ? (
                <span className="text-3xl">{aiChoice.nameEn.split(' ')[1]}</span>
              ) : (
                <HelpCircle className="w-8 h-8 opacity-40 animate-pulse" />
              )}
            </div>
            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              {aiChoice ? (isAr ? aiChoice.nameAr.split(' ')[0] : aiChoice.nameEn.split(' ')[0]) : (isAr ? 'انتظار...' : 'Waiting...')}
            </span>
          </div>
        </div>

        {/* Dynamic Winner Banner overlay */}
        {result && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute bottom-3 left-3 right-3 py-2 rounded-xl border text-xs font-black drop-shadow-xs ${
              result === 'win' 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : result === 'lose' 
                ? 'bg-rose-500 text-white border-rose-400' 
                : 'bg-indigo-500 text-white border-indigo-400'
            }`}
          >
            {result === 'win' && (isAr ? '🎉 لقد فزت! +١٠٠ نقطة' : '🎉 You Won! +100 Points')}
            {result === 'lose' && (isAr ? '😢 خسرت هذه الجولة! حاول مجدداً' : '😢 AI Won! Try Again')}
            {result === 'draw' && (isAr ? '🤝 تعادل عادل! +٣٠ نقطة' : '🤝 Draw Match! +30 Points')}
          </motion.div>
        )}
      </div>

      {/* Choice Buttons */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
          {isAr ? 'اختر سلاحك للهجوم:' : 'Choose your move to strike:'}
        </span>
        <div className="grid grid-cols-3 gap-3">
          {choices.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePlay(item.id)}
              disabled={isPlaying}
              className={`p-4 bg-gradient-to-br ${item.color} hover:brightness-110 active:scale-95 text-white rounded-2xl flex flex-col items-center gap-1.5 transition-all shadow-sm border border-white/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-2xl">{item.nameEn.split(' ')[1]}</span>
              <span className="text-xs font-extrabold">
                {isAr ? item.nameAr.split(' ')[0] : item.nameEn.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Restart/Reset scores */}
      <div className="pt-2">
        <button
          onClick={resetScore}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1 mx-auto underline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isAr ? 'تصفير النقاط والبدء من جديد' : 'Reset Scoreboard'}</span>
        </button>
      </div>
    </div>
  );
}
