import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Brain, Check, HelpCircle } from 'lucide-react';
import { CountryConfig } from '../types';

interface WordGuessProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

interface GameWord {
  word: string;
  scrambled: string;
  clueAr: string;
  clueEn: string;
}

const WORDS: GameWord[] = [
  { word: 'CASH', scrambled: 'SAHC', clueAr: 'الأموال السائلة أو الكاش المباشر السريع 💰', clueEn: 'Liquid money or immediate currency 💰' },
  { word: 'MONEY', scrambled: 'YNEOM', clueAr: 'العملات النقدية والورقية التي تبحث عنها 💵', clueEn: 'Coins and bills used for exchange 💵' },
  { word: 'LUDO', scrambled: 'DULO', clueAr: 'اللعبة اللوحية الشهيرة ذات الألوان الأربعة والنرد 🎲', clueEn: 'Famous board game of four colors & dice 🎲' },
  { word: 'GOLD', scrambled: 'DLGO', clueAr: 'المعدن الثمين الأصفر البراق الذي يحفظ الثروات 🪙', clueEn: 'Yellow precious metal to store wealth 🪙' },
  { word: 'WALLET', scrambled: 'LAWETL', clueAr: 'الحافظة الرقمية أو الجلدية لحفظ كاشك ومكافآتك 💳', clueEn: 'Digital or leather folder for holding cards & cash 💳' },
  { word: 'FINANCE', scrambled: 'CEFNANI', clueAr: 'إدارة الأموال وتخطيط الميزانيات والاستثمار 📈', clueEn: 'Management of money, budgeting & investment 📈' },
  { word: 'BONUS', scrambled: 'SUNOB', clueAr: 'المكافأة أو الهدية الإضافية التي تحصل عليها بالموقع 🎁', clueEn: 'Extra reward or gift you earn in the arcade 🎁' },
  { word: 'POINTS', scrambled: 'SNOTPI', clueAr: 'النقاط التي تجمعها من الألعاب لتحولها إلى كاش 🌟', clueEn: 'The score units you convert into cash 🌟' }
];

export default function WordGuessGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast
}: WordGuessProps) {
  const isAr = lang === 'ar';

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [scrambledList, setScrambledList] = useState<string[]>([]);

  const activeWord = WORDS[currentWordIndex];

  useEffect(() => {
    // Prepare scrambled letters list
    if (activeWord) {
      setScrambledList(activeWord.scrambled.split(''));
      setSelectedLetters([]);
      setSuccess(false);
    }
  }, [currentWordIndex]);

  const handleLetterClick = (letter: string, index: number) => {
    if (success) return;

    // Toggle select / deselect
    const isAlreadySelected = selectedLetters.includes(`${letter}_${index}`);
    
    if (isAlreadySelected) {
      setSelectedLetters(prev => prev.filter(item => item !== `${letter}_${index}`));
    } else {
      const nextSelection = [...selectedLetters, `${letter}_${index}`];
      setSelectedLetters(nextSelection);

      // Check if word complete
      const guessedWord = nextSelection.map(item => item.split('_')[0]).join('');
      if (guessedWord === activeWord.word) {
        setSuccess(true);
        setScore(prev => prev + 1);
        awardPoints(120, 'تخمين الكلمات المبعثرة', 'Word Scramble Solved');
        triggerToast(
          isAr 
            ? '✅ فك مذهل للغز! حصلت على +١٢٠ نقطة مكافأة.' 
            : '✅ Outstanding solver! Gained +120 Points reward.',
          'success'
        );
      } else if (nextSelection.length === activeWord.word.length) {
        // Full length but incorrect
        triggerToast(
          isAr ? '❌ ترتيب غير صحيح للكلمة! أعد المحاولة.' : '❌ Incorrect word order! Retry.',
          'info'
        );
        setSelectedLetters([]);
      }
    }
  };

  const handleNextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
  };

  const resetSelection = () => {
    setSelectedLetters([]);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <span>{isAr ? 'تخمين الكلمات المبعثرة 🧠' : 'Cash Word Unscrambler 🧠'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {isAr
            ? 'أعد ترتيب الحروف المبعثرة لتكوين الكلمة الصحيحة واكسب +١٢٠ نقطة!'
            : 'Reorder scrambled letters to form the correct word & earn +120 Points!'}
        </p>
      </div>

      {/* Score HUD */}
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-150 dark:border-slate-850">
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الكلمات المحلولة' : 'Solved Words'}</span>
          <span className="text-sm font-black text-slate-800 dark:text-white font-mono">
            {score} / {WORDS.length}
          </span>
        </div>
        <div className="text-left">
          <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'أرباحك المحققة' : 'Arcade Payout'}</span>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
            +{(score * 120).toLocaleString()} {isAr ? 'نقطة' : 'pts'}
          </span>
        </div>
      </div>

      {/* Scrambled Word Box */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-150 dark:border-slate-850 p-6 space-y-4">
        
        {/* Clue Label */}
        <div className="space-y-1">
          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest block font-mono">
            {isAr ? '💡 تلميح الذكاء' : '💡 INTELLIGENCE CLUE'}
          </span>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isAr ? activeWord.clueAr : activeWord.clueEn}
          </p>
        </div>

        {/* Display guessed letters so far */}
        <div className="flex items-center justify-center gap-2 min-h-[48px] py-1 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-3">
          {selectedLetters.map((item, idx) => (
            <motion.div
              key={`${item}_guessed`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black font-mono text-sm flex items-center justify-center shadow-xs"
            >
              {item.split('_')[0]}
            </motion.div>
          ))}
          {selectedLetters.length === 0 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isAr ? 'اختر الحروف بالأسفل لفك الشفرة' : 'Select letters below to solve'}
            </span>
          )}
        </div>
      </div>

      {/* Letters Pool to select from */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {scrambledList.map((letter, idx) => {
            const isSelected = selectedLetters.includes(`${letter}_${idx}`);

            return (
              <button
                key={`${letter}_${idx}`}
                disabled={isSelected || success}
                onClick={() => handleLetterClick(letter, idx)}
                className={`w-11 h-11 rounded-xl font-black font-mono text-lg flex items-center justify-center transition-all border shadow-xs cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-100 dark:bg-slate-850 text-slate-300 dark:text-slate-600 border-transparent scale-90 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action control buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={resetSelection}
          disabled={success || selectedLetters.length === 0}
          className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAr ? '🧹 مسح التحديد' : '🧹 Clear Selection'}
        </button>

        {success ? (
          <button
            onClick={handleNextWord}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isAr ? 'الكلمة التالية ➡️' : 'Next Word ➡️'}</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentWordIndex((prev) => (prev + 1) % WORDS.length)}
            className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
          >
            {isAr ? '⏭️ تخطي الكلمة' : '⏭️ Skip Word'}
          </button>
        )}
      </div>
    </div>
  );
}
