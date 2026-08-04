import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Gift, 
  ArrowRight, 
  Trophy, 
  Award, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CountryConfig } from '../types';
import { formatCurrencyValue } from '../utils/currency';

export interface Task {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  points: number;
  actionTab: string;
  actionTextAr: string;
  actionTextEn: string;
}

interface TasksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  tasks: Task[];
  completedTaskIds: string[];
  claimedTaskIds: string[];
  onClaimReward: (taskId: string, points: number) => void;
  onNavigateTab: (tabName: string) => void;
}

export default function TasksPanel({
  isOpen,
  onClose,
  lang,
  selectedCountry,
  tasks,
  completedTaskIds,
  claimedTaskIds,
  onClaimReward,
  onNavigateTab
}: TasksPanelProps) {
  const isAr = lang === 'ar';

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => completedTaskIds.includes(t.id)).length;
  const claimedCount = tasks.filter(t => claimedTaskIds.includes(t.id)).length;
  const unclaimedCompletedCount = completedTaskIds.filter(id => !claimedTaskIds.includes(id)).length;
  
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const t = {
    panelTitle: isAr ? 'المهام الرئيسية والمكافآت' : 'Main Quests & Payouts',
    panelSubtitle: isAr ? 'أكمل المهام التالية للحصول على هدايا من النقاط وتحويلها مباشرة لكاش حقيقي!' : 'Complete the following challenges to score point bonuses and cash out instantly!',
    progressLabel: isAr ? 'نسبة إكمال المهام' : 'Quest Completion Progress',
    completedText: isAr ? 'مهام منجزة' : 'tasks completed',
    claimBtn: isAr ? 'استلام المكافأة 🎁' : 'Claim Reward 🎁',
    goBtn: isAr ? 'الذهاب للمهمة' : 'Go to Task',
    claimedText: isAr ? 'تم الاستلام ✓' : 'Claimed ✓',
    rewardLabel: isAr ? 'الجائزة:' : 'Reward:',
    pointsText: isAr ? 'نقطة' : 'pts',
    gainedText: isAr ? 'تضاف لرصيدك ككاش بقيمة:' : 'Converts to instant wallet cash:',
    backBtn: isAr ? 'إغلاق' : 'Close',
    noTasks: isAr ? 'لا توجد مهام نشطة حالياً.' : 'No active tasks found.',
    statusReady: isAr ? 'جاهزة للاستلام' : 'Ready to Claim',
    statusClaimed: isAr ? 'تم استلام المكافأة' : 'Bonus Claimed',
    statusInProgress: isAr ? 'قيد الإنجاز' : 'In Progress'
  };

  const handleTaskAction = (task: Task) => {
    onNavigateTab(task.actionTab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 cursor-pointer"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ x: isAr ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed top-0 ${isAr ? 'left-0' : 'right-0'} bottom-0 w-full sm:max-w-md bg-white dark:bg-slate-900 border-${isAr ? 'r' : 'l'} border-slate-100 dark:border-slate-800 shadow-2xl z-50 flex flex-col`}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Trophy className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {t.panelTitle}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.panelSubtitle}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Area */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {t.progressLabel}
                </span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {completedCount}/{totalTasks} ({progressPercent}%)
                </span>
              </div>

              {/* Progress bar track */}
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full shadow-sm relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>

              {unclaimedCompletedCount > 0 && (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-lg flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold justify-center animate-pulse">
                  <Gift className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isAr 
                      ? `لديك ${unclaimedCompletedCount} مكافأة جاهزة للاستلام حالاً! 🎁` 
                      : `You have ${unclaimedCompletedCount} rewards ready to claim! 🎁`}
                  </span>
                </div>
              )}
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Award className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">{t.noTasks}</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const isCompleted = completedTaskIds.includes(task.id);
                  const isClaimed = claimedTaskIds.includes(task.id);
                  const isReady = isCompleted && !isClaimed;

                  // Equivalent cash value
                  const cashEquivalent = Math.round(task.points * selectedCountry.rate);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isClaimed
                          ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-850 opacity-70'
                          : isReady
                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-150 dark:border-emerald-900/50 ring-2 ring-emerald-500/10'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Title and status tag */}
                      <div className="flex items-start justify-between gap-3 text-right">
                        <div className="flex-1 text-right">
                          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-relaxed">
                            {isAr ? task.titleAr : task.titleEn}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isClaimed
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                            : isReady
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 animate-pulse border border-emerald-100 dark:border-emerald-900/30'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                        }`}>
                          {isClaimed ? t.statusClaimed : isReady ? t.statusReady : t.statusInProgress}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed text-right">
                        {isAr ? task.descAr : task.descEn}
                      </p>

                      {/* Reward Info Box */}
                      <div className="my-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 flex justify-between items-center text-xs">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block">{t.gainedText}</span>
                          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrencyValue(cashEquivalent, selectedCountry.currencyCode)} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 block">{t.rewardLabel}</span>
                          <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                            +{task.points.toLocaleString()} <span className="text-[10px] font-bold">{t.pointsText}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-50 dark:border-slate-800/60 flex justify-end">
                        {isClaimed ? (
                          <button
                            disabled
                            className="w-full py-2 bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-not-allowed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.claimedText}</span>
                          </button>
                        ) : isReady ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onClaimReward(task.id, task.points)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-100 dark:shadow-none"
                          >
                            <Gift className="w-4 h-4 animate-bounce" />
                            <span>{t.claimBtn}</span>
                          </motion.button>
                        ) : (
                          <button
                            onClick={() => handleTaskAction(task)}
                            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <span>{isAr ? task.actionTextAr : task.actionTextEn}</span>
                            {isAr ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                {t.backBtn}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
