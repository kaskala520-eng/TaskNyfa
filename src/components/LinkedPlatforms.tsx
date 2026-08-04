import React, { useState, useEffect } from 'react';
import { Platform } from '../types';
import { 
  Plus, 
  Link2, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Settings, 
  Trash2, 
  Smartphone, 
  Globe, 
  ShoppingBag, 
  Tv, 
  HelpCircle,
  Gamepad2,
  Lock,
  Mail,
  ExternalLink
} from 'lucide-react';

interface LinkedPlatformsProps {
  lang: 'ar' | 'en';
  platforms: Platform[];
  onConnect: (id: string, email: string, appUrl: string, password?: string) => void;
  onDisconnect: (id: string) => void;
  onDeletePlatform: (id: string) => void;
  onSyncPlatform: (id: string) => Promise<void>;
  onAddCustomPlatform: (name: string, nameAr: string, rate: number, url: string, email: string, password?: string) => void;
}

export default function LinkedPlatforms({
  lang,
  platforms,
  onConnect,
  onDisconnect,
  onDeletePlatform,
  onSyncPlatform,
  onAddCustomPlatform
}: LinkedPlatformsProps) {
  const isAr = lang === 'ar';
  
  // State for connecting an existing platform
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectUrl, setConnectUrl] = useState('');
  const [connectEmail, setConnectEmail] = useState('');
  const [connectPassword, setConnectPassword] = useState('');

  // State for adding a new custom platform
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNameAr, setCustomNameAr] = useState('');
  const [customRate, setCustomRate] = useState(1000);
  const [customUrl, setCustomUrl] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  // Status for sync animations
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Auto-fill or suggest default API url when connecting pre-defined platforms
  useEffect(() => {
    if (connectingId) {
      const p = platforms.find(pl => pl.id === connectingId);
      if (p) {
        setConnectUrl(p.apiUrl || `https://${p.id}.com/rewards-api`);
      }
    }
  }, [connectingId, platforms]);

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingId || !connectUrl || !connectEmail || !connectPassword) return;
    onConnect(connectingId, connectEmail, connectUrl, connectPassword);
    setConnectingId(null);
    setConnectUrl('');
    setConnectEmail('');
    setConnectPassword('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customUrl || !customEmail || !customPassword) return;
    onAddCustomPlatform(
      customName,
      customNameAr || customName,
      customRate,
      customUrl,
      customEmail,
      customPassword
    );
    setShowCustomModal(false);
    setCustomName('');
    setCustomNameAr('');
    setCustomRate(1000);
    setCustomUrl('');
    setCustomEmail('');
    setCustomPassword('');
  };

  const handleSyncClick = async (id: string) => {
    setSyncingId(id);
    await onSyncPlatform(id);
    setSyncingId(null);
  };

  // Icon mapper helper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-indigo-500" />;
      case 'Globe': return <Globe className="w-5 h-5 text-indigo-500" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-indigo-500" />;
      case 'Tv': return <Tv className="w-5 h-5 text-indigo-500" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-indigo-500" />;
      default: return <Link2 className="w-5 h-5 text-indigo-500" />;
    }
  };

  const t = {
    title: isAr ? 'ربط وإدارة حساباتك' : 'Connect & Manage Accounts',
    subtitle: isAr ? 'اربط مواقعك وتطبيقاتك المفضلة لبدء تجميع وتحويل النقاط فورًا' : 'Integrate your reward apps and sites to compile points instantly',
    addCustomBtn: isAr ? 'ربط تطبيق أو موقع جديد 🔗' : 'Link New App or Website 🔗',
    connect: isAr ? 'ربط الحساب' : 'Connect Account',
    disconnect: isAr ? 'قطع الاتصال' : 'Disconnect',
    sync: isAr ? 'مزامنة الآن' : 'Sync Now',
    syncing: isAr ? 'مزامنة...' : 'Syncing...',
    rateLabel: isAr ? 'سعر الصرف' : 'Rate',
    rateUnit: isAr ? 'د.ع لكل نقطة' : 'IQD per point',
    statusConnected: isAr ? 'متصل' : 'Connected',
    statusNotConnected: isAr ? 'غير متصل' : 'Not Connected',
    lastSynced: isAr ? 'آخر مزامنة:' : 'Last Synced:',
    points: isAr ? 'نقطة' : 'points',
    deleteBtn: isAr ? 'حذف الموقع' : 'Delete',
    
    // Connect Form modal
    connectTitle: isAr ? 'تأكيد معلومات ربط المنصة' : 'Confirm Platform Link Details',
    connectDesc: isAr ? 'أدخل رابط التطبيق، بريدك الإلكتروني، وكلمة المرور لاحتساب النقاط تلقائياً في حسابنا.' : 'Provide the app URL, email, and password to compute points on our portal.',
    urlLabel: isAr ? 'رابط التطبيق أو الموقع الإلكتروني:' : 'Application or Website Link URL:',
    emailLabel: isAr ? 'البريد الإلكتروني للمستخدم في المنصة:' : 'User Email on Platform:',
    passwordLabel: isAr ? 'كلمة المرور / كلمة السر لحسابك هناك:' : 'Platform Account Password:',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    confirmConnect: isAr ? 'تأكيد ربط الحساب 🟢' : 'Confirm Link Account 🟢',

    // Custom Modal
    customTitle: isAr ? 'ربط أي تطبيق أو موقع إلكتروني جديد' : 'Link Any New Website or Application',
    customDesc: isAr ? 'يمكنك ربط وتتبع النقاط من أي موقع خارجي عبر إدخال رابط المنصة وحسابك وسحب النقاط منه متى شئت.' : 'Connect and track points from any external site by providing its URL, user credentials, and withdraw any time.',
    appNameEn: isAr ? 'اسم الموقع/التطبيق (بالإنجليزي)' : 'Platform Name (English)',
    appNameAr: isAr ? 'اسم الموقع/التطبيق (بالعربي)' : 'Platform Name (Arabic)',
    apiRate: isAr ? 'سعر صرف النقاط (موحد لجميع المنصات)' : 'Exchange Rate (Unified)',
    addPlatformBtn: isAr ? 'ربط وإضافة الموقع الآن ✨' : 'Link & Add Platform Now ✨',
    sandboxNotice: isAr ? '💡 يمكنك حذف الموقع في أي وقت بعد سحب النقاط منه أو الاحتفاظ به لجمع النقاط مجدداً.' : '💡 You can delete this platform at any time after withdrawing points, or keep it to compile points again.'
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Custom */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowCustomModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCustomBtn}</span>
        </button>
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(platform => (
          <div 
            key={platform.id}
            className={`p-6 rounded-2xl border transition-all ${
              platform.connected 
                ? 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-950/40 shadow-sm' 
                : 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800/40 opacity-90'
            }`}
          >
            {/* Platform Top Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  platform.connected 
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600' 
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500'
                }`}>
                  {getIcon(platform.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-md">
                    {isAr ? platform.nameAr : platform.name}
                  </h3>
                  {platform.apiUrl && (
                    <span className="text-[10px] font-mono text-slate-400 block max-w-[200px] truncate" title={platform.apiUrl}>
                      {platform.apiUrl}
                    </span>
                  )}
                </div>
              </div>

              {/* Status pill & Delete Button */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  platform.connected 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${platform.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {platform.connected ? t.statusConnected : t.statusNotConnected}
                </span>

                {/* Trash delete button - can delete any platform after point withdrawal or keep it */}
                <button
                  onClick={() => onDeletePlatform(platform.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                  title={isAr ? 'إلغاء وحذف الموقع بالكامل' : 'Delete and remove platform completely'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle Section: Points Details */}
            {platform.connected && (
              <div className="my-6 bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block">{isAr ? 'النقاط المتاحة الجاهزة للسحب' : 'Available Redeemable Points'}</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {platform.points.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 ml-1 font-mono">{t.points}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{t.rateLabel}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {platform.rate} {t.rateUnit}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                {platform.connected && <HelpCircle className="w-3 h-3" />}
                <span>
                  {platform.connected ? `${t.lastSynced} ${platform.lastSynced}` : `معدل التحويل: ${platform.rate} د.ع / نقطة`}
                </span>
              </span>

              <div className="flex gap-2">
                {platform.connected ? (
                  <>
                    <button
                      onClick={() => handleSyncClick(platform.id)}
                      disabled={syncingId === platform.id}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      title={t.sync}
                    >
                      <RefreshCw className={`w-4.5 h-4.5 ${syncingId === platform.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => onDisconnect(platform.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
                    >
                      {t.disconnect}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConnectingId(platform.id)}
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 rounded-xl transition-all cursor-pointer"
                  >
                    {t.connect}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connect Existing Platform Modal */}
      {connectingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Settings className="w-5 h-5 text-indigo-500 animate-spin" />
              <span>{t.connectTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.connectDesc}</p>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.urlLabel}</label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    value={connectUrl}
                    onChange={e => setConnectUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="https://api.platform.com/rewards"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={connectEmail}
                    onChange={e => setConnectEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="your-email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={connectPassword}
                    onChange={e => setConnectPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConnectingId(null)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {t.confirmConnect}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom API Platform Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.customTitle}</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{t.customDesc}</p>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.appNameEn}</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. My Custom App"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.appNameAr}</label>
                  <input
                    type="text"
                    value={customNameAr}
                    onChange={e => setCustomNameAr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: تطبيقي الخاص"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.apiRate}</label>
                <input
                  type="number"
                  readOnly
                  value={customRate}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none cursor-not-allowed font-mono font-bold"
                />
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  {isAr ? '🔒 سعر الصرف ثابت وموحد لجميع المنصات: ١ نقطة = ١٠٠٠ دينار عراقي.' : '🔒 Exchange rate is fixed and unified for all platforms: 1 point = 1000 IQD.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.urlLabel}</label>
                <input
                  type="url"
                  required
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-left font-mono"
                  placeholder="https://myrewardsite.com/api"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.emailLabel}</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.passwordLabel}</label>
                  <input
                    type="password"
                    required
                    value={customPassword}
                    onChange={e => setCustomPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                {t.sandboxNotice}
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {t.addPlatformBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
