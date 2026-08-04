import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Power, 
  FileText, 
  Edit3, 
  Coins, 
  RefreshCw, 
  Save, 
  AlertTriangle,
  Globe,
  Database
} from 'lucide-react';
import { CountryConfig } from '../types';

interface SiteSettingsProps {
  lang: 'ar' | 'en';
  isSiteClosed: boolean;
  setIsSiteClosed: (closed: boolean) => void;
  siteCloseMessage: string;
  setSiteCloseMessage: (msg: string) => void;
  customAppName: string;
  setCustomAppName: (name: string) => void;
  customAppDesc: string;
  setCustomAppDesc: (desc: string) => void;
  ownerBookingCommission: number;
  setOwnerBookingCommission: (comm: number) => void;
  selectedCountry: CountryConfig;
  triggerToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function SiteSettings({
  lang,
  isSiteClosed,
  setIsSiteClosed,
  siteCloseMessage,
  setSiteCloseMessage,
  customAppName,
  setCustomAppName,
  customAppDesc,
  setCustomAppDesc,
  ownerBookingCommission,
  setOwnerBookingCommission,
  selectedCountry,
  triggerToast
}: SiteSettingsProps) {
  const isAr = lang === 'ar';

  // Local states for form editing before saving
  const [localAppName, setLocalAppName] = useState(customAppName);
  const [localAppDesc, setLocalAppDesc] = useState(customAppDesc);
  const [localCloseMsg, setLocalCloseMsg] = useState(siteCloseMessage);
  const [localCommission, setLocalCommission] = useState(ownerBookingCommission.toString());

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localAppName.trim()) {
      triggerToast(isAr ? 'اسم الموقع لا يمكن أن يكون فارغاً!' : 'App name cannot be empty!', 'error');
      return;
    }
    setCustomAppName(localAppName);
    setCustomAppDesc(localAppDesc);
    localStorage.setItem('cashai_custom_app_name', localAppName);
    localStorage.setItem('cashai_custom_app_desc', localAppDesc);
    triggerToast(
      isAr ? '✅ تم تحديث اسم وهوية الموقع بنجاح!' : '✅ App branding updated successfully!',
      'success'
    );
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteCloseMessage(localCloseMsg);
    localStorage.setItem('cashai_site_close_message', localCloseMsg);
    triggerToast(
      isAr ? '📝 تم تحديث رسالة الإغلاق بنجاح!' : '📝 Closure message updated successfully!',
      'success'
    );
  };

  const handleToggleSiteStatus = () => {
    const newStatus = !isSiteClosed;
    setIsSiteClosed(newStatus);
    localStorage.setItem('cashai_is_site_closed', String(newStatus));
    
    if (newStatus) {
      triggerToast(
        isAr ? '🔒 تم إغلاق الموقع عن العامة بنجاح!' : '🔒 Platform closed to the public successfully!',
        'success'
      );
    } else {
      triggerToast(
        isAr ? '🔓 تم فتح الموقع للجميع بنجاح!' : '🔓 Platform opened to the public successfully!',
        'success'
      );
    }
  };

  const handleSaveFinancials = (e: React.FormEvent) => {
    e.preventDefault();
    const commValue = parseFloat(localCommission) || 0;
    setOwnerBookingCommission(commValue);
    localStorage.setItem('cashai_owner_booking_commission', commValue.toString());
    triggerToast(
      isAr ? '💸 تم تعديل قيم العمولات المالية بنجاح!' : '💸 Commission settings updated successfully!',
      'success'
    );
  };

  return (
    <div className="space-y-8" id="site-settings-view">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div>
          <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 w-max mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'لوحة التحكم البرمجية للمصمم 🛡️' : 'Developer Admin Dashboard 🛡️'}</span>
          </span>
          <h1 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            <span>{isAr ? 'إدارة وتعديل خصائص المنصة' : 'Configure & Modify Platform Settings'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isAr 
              ? 'بصفتك المدير المصمم العام، تمنحك هذه اللوحة السيطرة الحصرية للتعديل والتغيير في الموقع وغلقه أو فتحه في أي وقت.' 
              : 'As the Chief Designer, this control board gives you exclusive options to edit values, names, rates, and open/close the site.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Site Status & Power switch */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Site Status Power Switch Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-md font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Power className="w-5 h-5 text-rose-500" />
                <span>{isAr ? 'حالة الموقع العامة (غلق / فتح)' : 'Global Site Status (Close / Open)'}</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {isAr ? 'قم بإغلاق الموقع مؤقتاً للصيانة لمنع تصفحه من المستخدمين العاديين.' : 'Temporarily close the platform for updates to block regular users.'}
              </p>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Giant Status Light indicator */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                isSiteClosed 
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400' 
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
              }`}>
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSiteClosed ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    isSiteClosed ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}></span>
                </span>
                <div>
                  <h3 className="text-xs font-bold">
                    {isSiteClosed 
                      ? (isAr ? '⛔ حالة النظام: مغلق ومقفل حالياً للعامة' : '⛔ System Status: CLOSED to public')
                      : (isAr ? '✅ حالة النظام: مفتوح ونشط بالكامل للعامة' : '✅ System Status: ACTIVE & OPEN to public')}
                  </h3>
                  <p className="text-[10px] opacity-80 mt-0.5">
                    {isSiteClosed 
                      ? (isAr ? 'فقط المدراء الرئيسيون يمكنهم تجاوز هذه الصفحة واستخدام المنصة.' : 'Only authorized chief accounts can bypass the lock screen.')
                      : (isAr ? 'جميع الزوار والمسجلين يمكنهم تصفح واستخدام كافة الأدوات مجاناً.' : 'All users can freely explore and use point synchronizations.')}
                  </p>
                </div>
              </div>

              {/* Status Action Switch Button */}
              <button
                type="button"
                onClick={handleToggleSiteStatus}
                className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                  isSiteClosed 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-100 dark:shadow-none' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-md shadow-rose-100 dark:shadow-none'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>
                  {isSiteClosed 
                    ? (isAr ? '🔓 إطلاق المنصة وفتح الموقع الآن للعامة' : '🔓 Publish & Open Platform Now')
                    : (isAr ? '🔒 غلق وإقفال الموقع مؤقتاً للصيانة' : '🔒 Close & Lock Platform Temporarily')}
                </span>
              </button>

              {/* Closure message configuration */}
              <form onSubmit={handleSaveStatus} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? 'رسالة الإغلاق التوضيحية للمستخدمين:' : 'Display Closure Notice to Public:'}</span>
                  </label>
                  <textarea
                    rows={4}
                    value={localCloseMsg}
                    onChange={(e) => setLocalCloseMsg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    placeholder={isAr ? 'اكتب الرسالة التي تظهر للزوار عند إغلاق الموقع...' : 'Specify details shown to locked out users...'}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ رسالة الإغلاق 📝' : 'Save Closure Message 📝'}</span>
                </button>
              </form>

            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-2xl p-6 space-y-4 shadow-lg border border-indigo-950">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'إحصائيات وقوة النظام الحالية' : 'System Engine State'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'دقة الخادم' : 'Server Status'}</span>
                <span className="text-sm font-mono font-black text-emerald-400">99.99% Online</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'زمن الاستجابة' : 'Ping Latency'}</span>
                <span className="text-sm font-mono font-black text-indigo-400">12ms (Secure)</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              {isAr 
                ? '💡 يتم حفظ جميع التغييرات والإعدادات المحدثة تلقائياً في ذاكرة المتصفح النشطة للحسابات المخولة.' 
                : '💡 All state configurations are committed and active globally for validated administrator context.'}
            </p>
          </div>

        </div>

        {/* Right Column: Platform Identity & Financial Values */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Identity & Custom Branding Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-md font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                <span>{isAr ? 'تعديل اسم وشعار المنصة وهويتها' : 'Edit App Branding & Visual Identity'}</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {isAr ? 'تغيير الاسم والوصف الإرشادي للمنصة بالكامل في ثوانٍ.' : 'Dynamically change the main title and slogan shown to users.'}
              </p>
            </div>

            <form onSubmit={handleSaveIdentity} className="p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                  {isAr ? 'اسم المنصة / التطبيق المكتوب:' : 'Platform Core Application Name:'}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={localAppName}
                    onChange={(e) => setLocalAppName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. Cash.ai"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                  {isAr ? 'شعار / وصف المنصة الفرعي:' : 'Dynamic Platform Slogan / Sub-description:'}
                </label>
                <textarea
                  rows={2}
                  value={localAppDesc}
                  onChange={(e) => setLocalAppDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  placeholder={isAr ? 'الوصف الترويجي الظاهر أسفل الشعار...' : 'Dynamic promo slogan shown below the main title...'}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ هوية واسم المنصة الجديد 💾' : 'Commit App Identity & Logo 💾'}</span>
              </button>

            </form>
          </div>

          {/* Financial Commissions Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-md font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>{isAr ? 'التحكم بالعمولات المالية والنسب والأسعار 💸' : 'Financial Variables & Fee Controls 💸'}</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {isAr ? 'تحرير عمولات المعاملات، عمولات حجز الطيران، ونقاط التسجيل الافتراضية.' : 'Modify commission weights, flight ticketing percentages, and point rates.'}
              </p>
            </div>

            <form onSubmit={handleSaveFinancials} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                    {isAr ? 'عمولة حجز الطيران والسفر (د.ع):' : 'Flight & Visa Commission (IQD):'}
                  </label>
                  <input
                    type="number"
                    value={localCommission}
                    onChange={(e) => setLocalCommission(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[9px] text-slate-400 block">
                    {isAr ? 'العمولة الافتراضية لكل حجز تذكرة طيران أو تأشيرة سفر.' : 'Amount credited to chief administrator wallet per flight booking.'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                    {isAr ? 'العمولة الثابتة لكل مستخدم نشط:' : 'Fixed Reward Points Rate Per User:'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`500 Points (${(500 * selectedCountry.rate).toLocaleString()} ${selectedCountry.currencyCode})`}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-850 text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                  />
                  <span className="text-[9px] text-slate-400 block">
                    {isAr ? 'معدل ربح المالك الثابت لكل مستخدم يسجل في النظام.' : 'Default fixed system commission per verified registration.'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-100 dark:shadow-none transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحديث النسب المالية والعمولات 💰' : 'Update Global Fee Configuration 💰'}</span>
              </button>

            </form>
          </div>

          {/* Safety Notice block */}
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{isAr ? 'تنبيه الأمان والخصوصية:' : 'Security & Access Integrity:'}</span>
              <span className="text-[10px] opacity-90 mt-0.5 block">
                {isAr 
                  ? 'أي تعديل يتم في هذه اللوحة سيتم تطبيقه فورياً على واجهات ومميزات تصفح جميع المستخدمين المسجلين في النظام. يرجى الحذر عند إغلاق أو تعديل النظام العام.'
                  : 'Modifications commit to real-time rendering layers for all user devices immediately. Exercise proper moderation before executing global status shifts.'}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
