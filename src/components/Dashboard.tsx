import React, { useState, useEffect } from 'react';
import { Platform, Transaction, CountryConfig, RegisteredUser } from '../types';
import { 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Trophy,
  Smartphone,
  Download,
  LayoutGrid,
  User as UserIcon,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Send,
  Tag,
  MapPin,
  ListTodo,
  Plus
} from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc } from 'firebase/firestore';
import { SERVICE_CATEGORIES } from './Onboarding';

interface DashboardProps {
  lang: 'ar' | 'en';
  platforms: Platform[];
  transactions: Transaction[];
  cashBalance: number;
  onSyncAll: () => void;
  isSyncingAll: boolean;
  setActiveTab: (tab: string) => void;
  selectedCountry: CountryConfig;
  onShowTasks?: () => void;
  unclaimedTasksCount?: number;
  onShowInstall?: () => void;
  isSidebarVisible?: boolean;
  onToggleSidebar?: () => void;
  users?: RegisteredUser[];
  currentUser?: RegisteredUser | null;
  onAwardPoints?: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast?: (msg: string, type: 'success' | 'info') => void;
}

export default function Dashboard({
  lang,
  platforms,
  transactions,
  cashBalance,
  onSyncAll,
  isSyncingAll,
  setActiveTab,
  selectedCountry,
  onShowTasks,
  unclaimedTasksCount = 0,
  onShowInstall,
  isSidebarVisible = false,
  onToggleSidebar,
  users = [],
  currentUser = null,
  onAwardPoints,
  triggerToast
}: DashboardProps) {
  const isAr = lang === 'ar';

  const [acceptedServices, setAcceptedServices] = useState<any[]>([]);
  const [loadingAccepted, setLoadingAccepted] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Quick tasks states
  const [quickTasks, setQuickTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPoints, setTaskPoints] = useState(100);
  const [isPublishingTask, setIsPublishingTask] = useState(false);
  const [isAcceptingTask, setIsAcceptingTask] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load ALL accepted services in real time (to filter out accepted items for all users)
  useEffect(() => {
    const q = collection(db, 'accepted_services');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort desc by acceptedAt
      list.sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime());
      setAcceptedServices(list);
      setLoadingAccepted(false);
    }, (error) => {
      console.error("Error loading accepted services:", error);
      setLoadingAccepted(false);
    });

    return () => unsubscribe();
  }, []);

  // Load quick tasks in real-time
  useEffect(() => {
    const q = collection(db, 'quick_tasks');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort desc by createdAt
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setQuickTasks(list);
      setLoadingTasks(false);
    }, (error) => {
      console.error("Error loading quick tasks:", error);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePublishTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (triggerToast) triggerToast(isAr ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'info');
      return;
    }
    if (!taskTitle.trim() || !taskDesc.trim()) {
      if (triggerToast) triggerToast(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields', 'info');
      return;
    }

    setIsPublishingTask(true);
    try {
      await addDoc(collection(db, 'quick_tasks'), {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        points: Number(taskPoints),
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        countryId: currentUser?.onboarding?.countryId || selectedCountry.id,
        createdAt: new Date().toISOString(),
        acceptedBy: null,
        acceptedByName: null,
        acceptedAt: null
      });

      setTaskTitle('');
      setTaskDesc('');
      setTaskPoints(100);
      setIsFormOpen(false);

      if (triggerToast) {
        triggerToast(
          isAr 
            ? '🚀 تم نشر المهمة السريعة بنجاح! ستظهر لجميع المستخدمين.' 
            : '🚀 Quick task published successfully! It will appear to all users.',
          'success'
        );
      }
    } catch (err) {
      console.error("Error publishing quick task:", err);
      if (triggerToast) {
        triggerToast(isAr ? 'فشل نشر المهمة، حاول مجدداً' : 'Failed to publish task, please try again', 'info');
      }
    } finally {
      setIsPublishingTask(false);
    }
  };

  const handleAcceptTask = async (taskId: string, title: string, points: number) => {
    if (!currentUser) {
      if (triggerToast) triggerToast(isAr ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'info');
      return;
    }

    setIsAcceptingTask(taskId);
    try {
      const taskRef = doc(db, 'quick_tasks', taskId);
      
      // Update in Firestore to mark as accepted
      await updateDoc(taskRef, {
        acceptedBy: currentUser.id,
        acceptedByName: currentUser.name,
        acceptedAt: new Date().toISOString()
      });

      // Award points
      if (onAwardPoints) {
        onAwardPoints(points, `إنجاز مهمة سريعة: ${title}`, `Completed quick task: ${title}`);
      }

      if (triggerToast) {
        triggerToast(
          isAr 
            ? `🎉 مبروك! تم قبول وإنجاز المهمة بنجاح، وحصلت على ${points} نقطة مكافأة.` 
            : `🎉 Congrats! Task accepted successfully, earned ${points} bonus points.`,
          'success'
        );
      }
    } catch (err) {
      console.error("Error accepting quick task:", err);
      if (triggerToast) {
        triggerToast(isAr ? 'فشل قبول المهمة، حاول مجدداً' : 'Failed to accept task, please try again', 'info');
      }
    } finally {
      setIsAcceptingTask(null);
    }
  };

  const getCategoryName = (id: string) => {
    if (id.startsWith('custom_')) {
      return id.replace('custom_', '');
    }
    for (const cat of SERVICE_CATEGORIES) {
      const match = cat.items.find(item => item.id === id);
      if (match) return isAr ? match.nameAr : match.nameEn;
    }
    return id;
  };

  const handleAcceptService = async (provider: RegisteredUser, serviceName: string) => {
    if (!currentUser) {
      if (triggerToast) triggerToast(isAr ? 'يجب تسجيل الدخول أولاً' : 'Please login first', 'info');
      return;
    }

    // Check if already accepted
    const alreadyAccepted = acceptedServices.some(
      s => s.providerId === provider.id && s.serviceName === serviceName
    );
    if (alreadyAccepted) {
      if (triggerToast) triggerToast(
        isAr 
          ? 'لقد قمت بقبول هذه الخدمة بالفعل مسبقاً!' 
          : 'You have already accepted this service!', 
        'info'
      );
      return;
    }

    const keyId = `${provider.id}-${serviceName}`;
    setAcceptingId(keyId);
    try {
      // 1. Add to Firestore collection
      await addDoc(collection(db, 'accepted_services'), {
        userId: currentUser.id,
        userName: currentUser.name,
        providerId: provider.id,
        providerName: provider.name,
        serviceName: serviceName,
        points: 10,
        acceptedAt: new Date().toISOString()
      });

      // 2. Award 10 points
      if (onAwardPoints) {
        onAwardPoints(10, `قبول خدمة: ${serviceName} من ${provider.name}`, `Accepted service: ${serviceName} from ${provider.name}`);
      }

      if (triggerToast) {
        triggerToast(
          isAr 
            ? `🎉 تم قبول الخدمة بنجاح! حصلت على 10 نقاط مكافأة.` 
            : `🎉 Service accepted successfully! You earned 10 reward points.`, 
          'success'
        );
      }
    } catch (err) {
      console.error("Error accepting service:", err);
      if (triggerToast) {
        triggerToast(isAr ? 'فشل قبول الخدمة، حاول مجدداً' : 'Failed to accept service, please try again', 'info');
      }
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-8" id="dashboard-tab">
      {/* Top Greeting Banner - Replaces Balance Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{isAr ? `أهلاً بك، ${currentUser?.name || 'مستخدمنا الكريم'}` : `Welcome, ${currentUser?.name || 'Valued User'}`} 👋</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800/40">
              {isAr ? 'حساب نشط 🟢' : 'Active Account 🟢'}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isAr 
              ? 'تصفح منشورات المشتركين المطابقة لاهتماماتك، واقبل الخدمات لكسب مكافآت النقاط الفورية!' 
              : 'Browse matching subscriber listings, accept services, and claim instant point rewards!'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2 rounded-xl border border-indigo-100/40 dark:border-indigo-900/20">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {isAr ? 'منظومة الخدمات والمهام' : 'Services & Tasks Hub'}
          </span>
        </div>
      </div>

      {/* Sidebar Hidden Guide Alert */}
      {!isSidebarVisible && (
        <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse" id="sidebar_hidden_guide">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-black">
                {isAr 
                  ? 'هل ترغب بالانتقال إلى صالة الألعاب، أو سحب الكاش؟ 🎮💰' 
                  : 'Want to play games, or withdraw cash? 🎮💰'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr 
                  ? 'قائمة الأدوات مخفية لتوفير مساحة مريحة، انقر على زر "الأدوات الرئيسية" في أعلى الصفحة للتنقل!' 
                  : 'The navigation list is hidden for a cleaner view. Just click "Main Tools" in the top header to navigate!'}
              </p>
            </div>
          </div>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-97"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isAr ? 'إظهار الأدوات الآن' : 'Show Main Tools Now'}</span>
            </button>
          )}
        </div>
      )}

      {/* Premium Main Tasks Card Challenge */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-indigo-600/5 to-transparent dark:from-amber-500/5 dark:via-indigo-500/5 dark:to-transparent rounded-2xl border border-amber-500/20 dark:border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs relative overflow-hidden" id="dashboard_tasks_panel">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
          <Trophy className="w-48 h-48 text-indigo-500" />
        </div>
        
        <div className="space-y-1 z-10 text-right flex-1">
          <div className="flex items-center gap-2 justify-start">
            <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg animate-pulse">
              <Trophy className="w-4 h-4 text-amber-500" />
            </span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {isAr ? 'تحدي المهام الرئيسية والمكافآت 🎯' : 'Main Quests Challenge & Rewards 🎯'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            {isAr 
              ? 'أكمل المهام اليومية والترويجية لربح مكافآت ضخمة من النقاط تصل لأكثر من 12,000 نقطة مجانية وتحويلها لكاش حقيقي فوراً!' 
              : 'Complete key platform quests to claim over 12,000+ bonus reward points convertable to real cash instantly!'}
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0 self-stretch sm:self-auto justify-end w-full sm:w-auto">
          {unclaimedTasksCount > 0 && (
            <span className="text-[10px] font-black px-2.5 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800/40 animate-pulse">
              {isAr ? `🎁 ${unclaimedTasksCount} مكافأة جاهزة` : `🎁 ${unclaimedTasksCount} Claimable`}
            </span>
          )}
          <button
            onClick={onShowTasks}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-indigo-100 dark:shadow-none cursor-pointer transition-all flex items-center gap-1.5 active:scale-97"
            id="dashboard_tasks_show_btn"
          >
            <span>{isAr ? 'إظهار المهام' : 'Show Quests'}</span>
          </button>
        </div>
      </div>

      {/* Mobile App PWA Banner */}
      <div className="p-5 bg-indigo-600 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-indigo-500/10 border border-indigo-500 relative overflow-hidden" id="dashboard_pwa_banner">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
          <Smartphone className="w-48 h-48" />
        </div>

        <div className="flex items-center gap-4 z-10 text-right w-full md:w-auto">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs hidden sm:block">
            <Smartphone className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">
              {isAr ? 'تنزيل تطبيق Cash.ai على جوالك 📱' : 'Get Cash.ai App on Your Phone 📱'}
            </h3>
            <p className="text-xs text-indigo-100 mt-1 max-w-lg leading-normal">
              {isAr 
                ? 'استمتع بتجربة أسرع وسهلة مع إشعارات فورية عن نقاطك المكتسبة وتحويلات الكاش عن طريق تثبيت تطبيقنا على شاشتك الرئيسية!' 
                : 'Get a faster, lighter experience with push updates on your points and withdrawals by installing Cash.ai!'}
            </p>
          </div>
        </div>

        <button
          onClick={onShowInstall}
          className="w-full md:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-97 z-10"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'تثبيت التطبيق الآن' : 'Install App Now'}</span>
        </button>
      </div>

      {/* Quick Tasks Section */}
      <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-xs" id="quick-tasks-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-500" />
              <span>{isAr ? '⚡ منصة المهام السريعة المشتركة' : '⚡ Shared Quick Tasks Hub'}</span>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/20">
                {quickTasks.filter(t => t.acceptedBy === null && t.creatorId !== currentUser?.id && (t.countryId || 'IQ') === (currentUser?.onboarding?.countryId || selectedCountry.id)).length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              {isAr 
                ? 'انشر مهامك السريعة لطلب المساعدة من الآخرين، أو أنجز مهام المستخدمين فوراً لكسب رصيد نقاط فوري!' 
                : 'Publish tasks to get help, or complete tasks from other users to claim points rewards instantly!'}
            </p>
          </div>
          
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-97"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'نشر مهمة سريعة جديدة' : 'Publish New Quick Task'}</span>
          </button>
        </div>

        {/* Publish Task Form */}
        {isFormOpen && (
          <form onSubmit={handlePublishTask} className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? '📝 تفاصيل المهمة السريعة الجديدة' : '📝 New Quick Task Details'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{isAr ? 'عنوان المهمة (مثال: نحتاج تصميم شعار سريع):' : 'Task Title:'}</label>
                <input
                  type="text"
                  placeholder={isAr ? 'اكتب عنواناً واضحاً ومختصراً...' : 'Enter a short, descriptive title...'}
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">{isAr ? 'النقاط المكافئة المقترحة:' : 'Reward Points:'}</label>
                <div className="flex flex-wrap gap-1">
                  {[50, 100, 200, 500, 1000].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskPoints(p)}
                      className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                        taskPoints === p 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-250 dark:border-slate-850 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">{isAr ? 'تفاصيل وشروط المهمة بالتفصيل:' : 'Task Detailed Requirements:'}</label>
              <textarea
                rows={3}
                placeholder={isAr ? 'اكتب هنا ما هو المطلوب بالتفصيل وكيف يمكن للمستخدم الآخر التواصل معك أو إنجاز العمل...' : 'Describe exactly what is needed and how the claimant can deliver it...'}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isPublishingTask}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1"
              >
                {isPublishingTask && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>{isAr ? 'نشر المهمة الآن 🚀' : 'Publish Task Now 🚀'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Tasks Grid */}
        {(() => {
          const activeUserCountryId = currentUser?.onboarding?.countryId || selectedCountry.id;
          const availableTasks = quickTasks.filter(t => {
            const isMyTask = t.creatorId === currentUser?.id;
            if (isMyTask) return false;
            
            const isAccepted = t.acceptedBy !== null;
            if (isAccepted) return false;

            const taskCountryId = t.countryId || 'IQ';
            return taskCountryId === activeUserCountryId;
          });
          const myTasks = quickTasks.filter(t => t.creatorId === currentUser?.id);

          return (
            <div className="space-y-6">
              {/* Main Feed of available tasks */}
              <div>
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 mb-3 tracking-wide uppercase flex items-center justify-between gap-2">
                  <span>{isAr ? '📌 المهام المتاحة في بلدك:' : '📌 Available Quick Tasks in Your Country:'}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/20">
                    {selectedCountry.flag} {isAr ? selectedCountry.nameAr : selectedCountry.nameEn}
                  </span>
                </h3>

                {availableTasks.length === 0 ? (
                  <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? 'لا توجد مهام سريعة مفتوحة حالياً من قبل الآخرين' : 'No open quick tasks from others currently'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isAr ? 'تلميح: يمكنك أن تكون الأول وتنشر مهمة سريعة جديدة الآن ليراها الجميع!' : 'Tip: Be the first to publish a task so others can help you!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTasks.map(task => (
                      <div key={task.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[11px] font-black px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/20">
                              +{task.points} {isAr ? 'نقطة مكافأة' : 'Pts'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {isAr ? 'بواسطة: ' : 'By: '} {task.creatorName}
                            </span>
                          </div>
                          
                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-normal">
                            {task.title}
                          </h4>
                          
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                            {task.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100/40 dark:border-slate-800/40 flex justify-between items-center gap-2">
                          <span className="text-[9px] text-slate-400">
                            {new Date(task.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {hour: '2-digit', minute: '2-digit'})}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAcceptTask(task.id, task.title, task.points)}
                            disabled={isAcceptingTask !== null}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-white font-black text-[10px] rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                          >
                            {isAcceptingTask === task.id ? (
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            )}
                            <span>{isAr ? 'قبول وإنجاز المهمة' : 'Accept & Complete'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Published Tasks Accordion */}
              {myTasks.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 mb-3 tracking-wide uppercase">
                    {isAr ? '📋 مهامي السريعة المنشورة بواسطة كاش آب:' : '📋 My Published Quick Tasks:'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myTasks.map(task => (
                      <div key={task.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-400">
                              {new Date(task.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                            {task.acceptedBy ? (
                              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-0.5 animate-pulse">
                                🎉 {isAr ? `مكتملة بواسطة ${task.acceptedByName}` : `Completed by ${task.acceptedByName}`}
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-900/20">
                                ⏳ {isAr ? 'قيد الانتظار...' : 'Pending...'}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{task.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{task.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Subscribers & Services Matching Interests Section - Prominent and placed near the top */}
      <div className="space-y-4" id="matched-listings-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>{isAr ? '🎯 منشورات المشتركين المطابقة لخدمتك' : '🎯 Matched Subscriber Listings'}</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/20">
                {selectedCountry.flag} {isAr ? selectedCountry.nameAr : selectedCountry.nameEn}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr 
                ? 'عرض مقدمي الخدمات والباحثين عنها المطابقين للتخصصات التي حددتها في حسابك.' 
                : 'Browse service providers and seekers matching your selected specialties.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {isAr ? 'عرض الكل في السوق &larr;' : 'View all in Marketplace &larr;'}
          </button>
        </div>

        {(() => {
          const activeUserCountryId = currentUser?.onboarding?.countryId || selectedCountry.id;
          const currentUserCategories = currentUser?.onboarding?.selectedCategories || [];
          const isGeneralUser = currentUserCategories.includes('general_services');

          const matchedSubscribers = users.filter(u => {
            if (u.id === currentUser?.id) return false;
            if (!u.onboarding) return false;
            
            // Filter by country matching user's country
            const subscriberCountryId = u.onboarding.countryId || 'IQ';
            if (subscriberCountryId !== activeUserCountryId) return false;
            
            const otherCategories = u.onboarding.selectedCategories || [];
            
            // Filter out categories already accepted
            const activeCategories = otherCategories.filter(catId => {
              const catName = getCategoryName(catId);
              return !acceptedServices.some(s => s.providerId === u.id && s.serviceName === catName);
            });

            if (activeCategories.length === 0) return false;
            
            if (isGeneralUser || activeCategories.includes('general_services')) {
              return true;
            }
            
            return activeCategories.some(cat => currentUserCategories.includes(cat));
          });

          if (matchedSubscribers.length === 0) {
            return (
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <UserIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isAr ? 'لا توجد منشورات مطابقة لتخصصاتك حالياً' : 'No matching subscriber listings found'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {isAr 
                    ? 'تلميح: يمكنك تعديل تخصصاتك المفضلة من صفحة حسابك لتلقي منشورات مطابقة، أو تفعيل خيار "الخدمات العامة والشاملة" لتلقي جميع المنشورات!' 
                    : 'Tip: You can update your specialties in your Account tab to see more matches, or check "General Services" to match with everyone!'}
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
                >
                  {isAr ? 'تعديل التخصصات في حسابي' : 'Update My Specialties'}
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedSubscribers.slice(0, 6).map(sub => {
                const ob = sub.onboarding!;
                const purposeLabel = ob.purpose === 'provide' 
                  ? (isAr ? 'مقدم خدمات/منتجات 💼' : 'Offers services/products 💼')
                  : ob.purpose === 'search'
                  ? (isAr ? 'باحث عن خدمات/منتجات 🔍' : 'Looks for services/products 🔍')
                  : (isAr ? 'مقدم وباحث (كلاهما) 🔄' : 'Offers & Seeks (Both) 🔄');

                return (
                  <div 
                    key={sub.id} 
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-150 dark:hover:border-indigo-900/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <span>{sub.name}</span>
                              {sub.isDistinguished && (
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              )}
                            </h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{ob.location || (isAr ? 'غير محدد' : 'Not specified')}</span>
                            </p>
                          </div>
                        </div>
                        
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md shrink-0 ${
                          ob.purpose === 'provide' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20'
                            : ob.purpose === 'search'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/20'
                        }`}>
                          {purposeLabel}
                        </span>
                      </div>

                      {/* Bio */}
                      {ob.bio && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {ob.bio}
                        </p>
                      )}

                      {/* Categories Tags & Acceptance actions */}
                      <div className="space-y-2 pt-1 border-t border-slate-50 dark:border-slate-800/60">
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          {isAr ? 'الخدمات المتاحة للقبول والربح:' : 'Available Services to Accept & Earn:'}
                        </div>
                        <div className="flex flex-col gap-2">
                          {ob.selectedCategories.filter(catId => {
                            const catName = getCategoryName(catId);
                            return !acceptedServices.some(s => s.providerId === sub.id && s.serviceName === catName);
                          }).map((catId, idx) => {
                            const catName = getCategoryName(catId);
                            const isCurrentAccepting = acceptingId === `${sub.id}-${catName}`;

                            return (
                              <div 
                                key={idx} 
                                className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/40"
                              >
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 min-w-0">
                                  <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  <span className="truncate">{catName}</span>
                                </span>

                                <button
                                  onClick={() => handleAcceptService(sub, catName)}
                                  disabled={acceptingId !== null}
                                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:shadow-indigo-50 dark:shadow-none transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                                >
                                  {isCurrentAccepting ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-2.5 h-2.5" />
                                  )}
                                  <span>{isAr ? 'قبول والربح' : 'Accept & Earn'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {ob.contactMethods?.map((method, idx) => (
                          <span 
                            key={idx} 
                            title={method}
                            className="p-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 rounded-md"
                          >
                            {method === 'phone' && <Phone className="w-3.5 h-3.5" />}
                            {method === 'email' && <Mail className="w-3.5 h-3.5" />}
                            {method === 'chat' && <MessageSquare className="w-3.5 h-3.5" />}
                            {method === 'telegram' && <Send className="w-3.5 h-3.5" />}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveTab('marketplace')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm hover:shadow-indigo-50 dark:shadow-none transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{isAr ? 'تواصل الآن' : 'Contact Now'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* How it works block */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center">
          {isAr ? 'كيف تعمل المنصة؟' : 'How It Works'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900/60 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 text-center space-y-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{isAr ? '1. ربط الحسابات' : '1. Link Accounts'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? 'اربط حساباتك في التطبيقات أو المواقع المفضلة عبر مفتاح API أو اسم المستخدم.' : 'Connect your favorite apps/sites using username or API.'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 text-center space-y-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{isAr ? '2. قبول الخدمات والمهام' : '2. Accept Services & Tasks'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? 'اقبل المنشورات المطابقة لخدمتك لتقديم يد العون ومساعدة الآخرين وتجميع المكافآت الضخمة.' : 'Accept posts matching your service, help other users, and collect rich platform reward points.'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900/60 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 text-center space-y-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{isAr ? '3. السحب للمحفظة' : '3. Withdraw Cash'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? 'حول رصيدك المكتسب مباشرة واسحبه لمحفظتك الإلكترونية المفضلة بثوانٍ معدودة.' : 'Convert point values and cashout to your e-wallet of choice safely.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Table (جدول المهام) - Replaces Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <span>{isAr ? '📋 جدول المهام والخدمات المقبولة' : '📋 Tasks & Accepted Services Table'}</span>
          </h2>
          <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-100/40 dark:border-indigo-900/20 font-mono">
            {isAr ? `${acceptedServices.length} عملية خدمة` : `${acceptedServices.length} tasks`}
          </span>
        </div>

        {loadingAccepted ? (
          <div className="text-center py-8 text-slate-400">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" strokeWidth={3} />
            <span>{isAr ? 'جاري تحميل جدول المهام...' : 'Loading tasks table...'}</span>
          </div>
        ) : acceptedServices.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-750" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {isAr ? 'لا توجد خدمات مقبولة حالياً' : 'No accepted services yet'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {isAr 
                ? 'تلميح: تصفح المنشورات المطابقة لاهتماماتك في الأعلى واضغط على "قبول والربح" لربح +10 نقاط فورية على كل عملية خدمة!' 
                : 'Tip: Browse matching subscriber listings above and click "Accept & Earn" to earn +10 points instantly!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" dir={isAr ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-xs text-slate-400 uppercase font-mono">
                  <th className={`py-3 px-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الخدمة المقبولة' : 'Accepted Service'}</th>
                  <th className={`py-3 px-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'مقدم الخدمة' : 'Service Provider'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'النقاط المكافئة' : 'Reward Points'}</th>
                  <th className={`py-3 px-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'تاريخ القبول' : 'Accepted At'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-sm text-slate-600 dark:text-slate-300">
                {acceptedServices.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className={`py-3 px-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>
                      <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-xl text-xs border border-indigo-100/30 dark:border-indigo-900/20 inline-flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{task.serviceName}</span>
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${isAr ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs">
                          {task.providerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{task.providerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{task.points || 10} {isAr ? 'نقاط' : 'pts'}
                    </td>
                    <td className={`py-3 px-4 font-mono text-xs text-slate-400 ${isAr ? 'text-right' : 'text-left'}`}>
                      {new Date(task.acceptedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>{isAr ? 'مكتملة ✅' : 'Completed ✅'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
