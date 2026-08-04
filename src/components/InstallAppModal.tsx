import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle2, 
  Sparkles,
  ArrowDownToLine,
  Layers,
  ChevronRight,
  Monitor
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export default function InstallAppModal({ isOpen, onClose, lang }: InstallAppModalProps) {
  const isAr = lang === 'ar';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReadyToInstall, setIsReadyToInstall] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android' | 'desktop'>('android');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsReadyToInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActivePlatform('ios');
    } else if (/android/.test(ua)) {
      setActivePlatform('android');
    } else {
      setActivePlatform('desktop');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
      setIsReadyToInstall(false);
      onClose();
    }
  };

  const t = {
    title: isAr ? 'تثبيت تطبيق كاش.ai على هاتفك 📱' : 'Install Cash.ai App on Your Phone 📱',
    subtitle: isAr 
      ? 'قم بتحويل الموقع إلى تطبيق متكامل على شاشتك الرئيسية للوصول السريع ومتابعة نقاطك بلمسة واحدة!'
      : 'Turn this website into a fully integrated app on your home screen for quick access and tracking!',
    nativeInstallBtn: isAr ? 'تثبيت التطبيق بنقرة واحدة ⚡' : 'Install App with One Click ⚡',
    guideTitle: isAr ? 'طريقة التثبيت اليدوية البسيطة:' : 'Easy Manual Installation Steps:',
    iosShareText: isAr 
      ? '1. افتح متصفح Safari واضغط على زر "مشاركة" (Share) أسفل الشاشة.'
      : '1. Open Safari browser and tap the "Share" button at the bottom.',
    iosAddText: isAr
      ? '2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen) من القائمة.'
      : '2. Select "Add to Home Screen" from the sharing options.',
    iosConfirmText: isAr
      ? '3. اضغط على "إضافة" (Add) في الزاوية العلوية لتأكيد التثبيت.'
      : '3. Tap "Add" in the top-right corner to finalize.',
    androidMenuText: isAr
      ? '1. اضغط على أيقونة الثلاث نقاط (⋮) في أعلى يمين المتصفح.'
      : '1. Tap the three dots (⋮) icon in the top right of Chrome.',
    androidAddText: isAr
      ? '2. اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'
      : '2. Select "Install App" or "Add to Home Screen" from the menu.',
    androidConfirmText: isAr
      ? '3. أكد عملية الإضافة لتشاهد الأيقونة الذهبية تظهر على هاتفك.'
      : '3. Confirm the selection to see our golden icon on your phone.',
    desktopMenuText: isAr
      ? '1. اضغط على أيقونة التثبيت (⊕) في شريط عنوان المتصفح.'
      : '1. Click the Install icon (⊕) in the browser address bar.',
    desktopAddText: isAr
      ? '2. اختر "تثبيت" لتشغيل كاش.ai كنافذة تطبيق مستقلة.'
      : '2. Select "Install" to run Cash.ai as a standalone app window.',
    closeBtn: isAr ? 'إغلاق' : 'Close',
    androidTab: isAr ? 'أندرويد' : 'Android',
    iosTab: isAr ? 'آيفون / آيباد' : 'iOS / iPhone',
    desktopTab: isAr ? 'كمبيوتر' : 'Desktop'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Luxury gold/indigo ambient light circle */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Content */}
              <div className="text-center space-y-6 mt-2 relative z-10">
                {/* App Icon Mockup Container */}
                <div className="flex justify-center">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                      className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 rounded-3xl blur-md opacity-30"
                    />
                    <img 
                      src="/app_icon.png" 
                      alt="Cash.ai App Icon" 
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl border-2 border-slate-900 dark:border-slate-800 shadow-xl object-cover relative z-10"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg z-20 border border-indigo-500">
                      <Download className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Headings */}
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                    {t.subtitle}
                  </p>
                </div>

                {/* Platform Selector Tabs */}
                <div className="p-1 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-1">
                  <button
                    onClick={() => setActivePlatform('android')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activePlatform === 'android'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{t.androidTab}</span>
                  </button>
                  <button
                    onClick={() => setActivePlatform('ios')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activePlatform === 'ios'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <Share className="w-4 h-4" />
                    <span>{t.iosTab}</span>
                  </button>
                  <button
                    onClick={() => setActivePlatform('desktop')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activePlatform === 'desktop'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>{t.desktopTab}</span>
                  </button>
                </div>

                {/* Native One-click Install Trigger */}
                {isReadyToInstall && deferredPrompt && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNativeInstall}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-amber-400/20"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span>{t.nativeInstallBtn}</span>
                  </motion.button>
                )}

                {/* Steps Guidelines Area */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 text-right space-y-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 justify-start">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>{t.guideTitle}</span>
                  </h4>

                  <div className="space-y-3.5">
                    {activePlatform === 'ios' && (
                      <>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            1
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.iosShareText}
                          </p>
                        </div>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            2
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.iosAddText}
                          </p>
                        </div>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            3
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.iosConfirmText}
                          </p>
                        </div>
                      </>
                    )}

                    {activePlatform === 'android' && (
                      <>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            1
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.androidMenuText}
                          </p>
                        </div>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            2
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.androidAddText}
                          </p>
                        </div>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            3
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.androidConfirmText}
                          </p>
                        </div>
                      </>
                    )}

                    {activePlatform === 'desktop' && (
                      <>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            1
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.desktopMenuText}
                          </p>
                        </div>
                        <div className="flex items-start gap-3 justify-start">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                            2
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {t.desktopAddText}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Close Button Trigger */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  {t.closeBtn}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
