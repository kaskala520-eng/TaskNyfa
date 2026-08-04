import React, { useState } from 'react';
import { RegisteredUser, CountryConfig, OnboardingData } from '../types';
import Onboarding from './Onboarding';
import { 
  User, 
  Mail, 
  Phone, 
  Wallet, 
  Award, 
  Calendar, 
  Sparkles, 
  CheckCircle,
  Globe,
  Camera,
  ShieldCheck,
  Copy,
  Users,
  Share2
} from 'lucide-react';

interface UserProfileProps {
  lang: 'ar' | 'en';
  currentUser: RegisteredUser | null;
  setCurrentUser: (user: RegisteredUser | null) => void;
  selectedCountry: CountryConfig;
  cashBalance: number;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  users?: RegisteredUser[];
  onUpdateOnboarding: (data: OnboardingData) => void;
}

export const PRESET_AVATARS = [
  { id: 'av_1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'رائد الفضاء', nameEn: 'Astronaut' },
  { id: 'av_2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'المحترفة', nameEn: 'Gamer Girl' },
  { id: 'av_3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'الذكي', nameEn: 'Samer AI' },
  { id: 'av_4', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'المطورة', nameEn: 'Developer' },
  { id: 'av_5', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'المرح', nameEn: 'Joyful Mascot' },
  { id: 'av_6', url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'المبتسم', nameEn: 'Cheerful Smile' },
  { id: 'av_7', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'الفنانة', nameEn: 'Artistic' },
  { id: 'av_8', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', nameAr: 'الصياد', nameEn: 'Mazen AI' }
];

export default function UserProfile({
  lang,
  currentUser,
  setCurrentUser,
  selectedCountry,
  cashBalance,
  triggerToast,
  users = [],
  onUpdateOnboarding
}: UserProfileProps) {
  const isAr = lang === 'ar';

  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [phoneVisibility, setPhoneVisibility] = useState<'everyone' | 'only_accepted' | 'only_admin'>(
    currentUser?.phoneVisibility || 'only_accepted'
  );
  const [walletType, setWalletType] = useState(currentUser?.walletType || 'zain_cash');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    (currentUser as any)?.avatar || PRESET_AVATARS[0].url
  );

  if (isEditingOnboarding) {
    return (
      <Onboarding
        lang={lang}
        currentUser={currentUser}
        isEditing={true}
        onCancel={() => setIsEditingOnboarding(false)}
        onComplete={(data) => {
          onUpdateOnboarding(data);
          setIsEditingOnboarding(false);
        }}
      />
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Track profile changes for the admin audit log
    const changes: { field: string; oldValue: string; newValue: string; changedAt: string }[] = [];
    const timestamp = new Date().toISOString();

    if (currentUser.name !== name.trim()) {
      changes.push({
        field: isAr ? 'الاسم' : 'Name',
        oldValue: currentUser.name || '',
        newValue: name.trim(),
        changedAt: timestamp
      });
    }
    if (currentUser.email !== email.trim()) {
      changes.push({
        field: isAr ? 'البريد الإلكتروني' : 'Email',
        oldValue: currentUser.email || '',
        newValue: email.trim(),
        changedAt: timestamp
      });
    }
    if (currentUser.phone !== phone.trim()) {
      changes.push({
        field: isAr ? 'رقم الهاتف' : 'Phone',
        oldValue: currentUser.phone || '',
        newValue: phone.trim(),
        changedAt: timestamp
      });
    }
    const currentVis = currentUser.phoneVisibility || 'only_accepted';
    if (currentVis !== phoneVisibility) {
      changes.push({
        field: isAr ? 'خصوصية رقم الهاتف' : 'Phone Visibility',
        oldValue: currentVis,
        newValue: phoneVisibility,
        changedAt: timestamp
      });
    }

    const previousHistory = currentUser.profileChangesHistory || [];
    const updatedHistory = [...changes, ...previousHistory];

    const updatedUser: RegisteredUser = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      walletType: walletType,
      avatar: selectedAvatar,
      phoneVisibility: phoneVisibility,
      profileChangesHistory: updatedHistory
    } as any;

    setCurrentUser(updatedUser);
    localStorage.setItem('cashai_current_user', JSON.stringify(updatedUser));

    // Also update this user in the registered users list in localStorage
    try {
      const savedUsers = localStorage.getItem('cashai_registered_users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers) as RegisteredUser[];
        const updatedList = parsedUsers.map(u => u.id === currentUser.id ? updatedUser : u);
        localStorage.setItem('cashai_registered_users', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error('Failed to update users list', e);
    }

    triggerToast(
      isAr 
        ? '💾 تم حفظ وتحديث بيانات الصفحة الشخصية بنجاح!' 
        : '💾 Personal profile successfully updated and saved!',
      'success'
    );
  };

  const getWalletLabel = (val: string) => {
    switch(val) {
      case 'zain_cash': return isAr ? 'محفظة زين كاش' : 'Zain Cash Wallet';
      case 'qi_card': return isAr ? 'بطاقة الكي كارد' : 'Qi Card Iraqi Payout';
      case 'vodafone_cash': return isAr ? 'فودافون كاش' : 'Vodafone Cash';
      case 'stc_pay': return isAr ? 'إس تي سي باي' : 'STC Pay';
      case 'asiapay': return isAr ? 'آسيا باي' : 'AsiaPay';
      case 'fastpay': return isAr ? 'فاست باي' : 'FastPay';
      case 'usdt_trc20': return 'USDT (TRC-20)';
      default: return val;
    }
  };

  return (
    <div className="space-y-8" id="profile-tab">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <img 
              src={selectedAvatar} 
              alt="Profile Avatar" 
              className="w-20 h-20 rounded-full border-4 border-indigo-500/20 shadow-md object-cover referrerPolicy='no-referrer'" 
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full border border-white dark:border-slate-900 shadow-sm">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-center sm:text-right space-y-1 flex-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <span>{currentUser?.name}</span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                {isAr ? 'عضو برونزي' : 'Bronze Member'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? `تاريخ الانضمام: ${new Date(currentUser?.registeredAt || '').toLocaleDateString('ar-IQ')}` : `Member since: ${new Date(currentUser?.registeredAt || '').toLocaleDateString()}`}
            </p>
            <button
              onClick={() => setIsEditingOnboarding(true)}
              className="mt-2.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 rounded-xl text-xs font-black transition-all flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer mx-auto sm:mx-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>{isAr ? 'تعديل الملف المهني وفئات الخدمات والمنتجات 💼' : 'Edit Professional Services & Products 💼'}</span>
            </button>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-2xl text-center sm:text-right">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">{isAr ? 'رصيد الكاش المتوفر' : 'Available Wallet Cash'}</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {cashBalance.toLocaleString()} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT CARD: EDIT FORM */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-md font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            <span>{isAr ? 'تعديل الملف الشخصي' : 'Edit Personal Settings'}</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            
            {/* Choose Avatar Sub-Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'اختر صورتك الشخصية المفضلة (الافتار):' : 'Select your favorite profile picture (Avatar):'}</span>
              </label>

              {/* Grid of presets */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {PRESET_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer hover:scale-105 ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 shadow-md ring-2 ring-indigo-500/20' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                      title={isAr ? av.nameAr : av.nameEn}
                    >
                      <img 
                        src={av.url} 
                        alt={av.nameEn} 
                        className="w-full h-full rounded-lg object-cover referrerPolicy='no-referrer'" 
                      />
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white rounded-bl-lg p-0.5">
                          <CheckCircle className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'الاسم الكامل أو المعرّف:' : 'Full Username / Name:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'البريد الإلكتروني للاتصال:' : 'Email Address:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'رقم الهاتف المحمول:' : 'Contact Mobile Number:'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isAr ? 'مثال: ٠٧٧٠١٢٣٤٥٦٧' : 'e.g. 07701234567'}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone Visibility Preferences */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'من يمكنه رؤية رقم هاتفك في الموقع 🔒:' : 'Who can see your phone number 🔒:'}
                </label>
                <select
                  value={phoneVisibility}
                  onChange={(e) => setPhoneVisibility(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="only_accepted">
                    {isAr ? 'مقدمي/طالبي الطلبات المقبولة فقط (موصى به)' : 'Only accepted request parties (Recommended)'}
                  </option>
                  <option value="everyone">
                    {isAr ? 'الجميع (عرض عام لكافة الزوار)' : 'Everyone (Publicly visible to all visitors)'}
                  </option>
                  <option value="only_admin">
                    {isAr ? 'الإدارة فقط (إخفاء عن الجميع بالكامل)' : 'Admin only (Hidden from all other users)'}
                  </option>
                </select>
              </div>

              {/* Default Wallet */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'المحفظة الافتراضية المفضلة لطلب السحب:' : 'Preferred Primary Cashout Wallet:'}
                </label>
                <div className="relative">
                  <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="zain_cash">{isAr ? 'زين كاش (العراق)' : 'Zain Cash (Iraq)'}</option>
                    <option value="qi_card">{isAr ? 'كي كارد (الرافدين)' : 'Qi Card (Rafidain)'}</option>
                    <option value="asiapay">{isAr ? 'آسيا باي' : 'AsiaPay'}</option>
                    <option value="fastpay">{isAr ? 'فاست باي' : 'FastPay'}</option>
                    <option value="vodafone_cash">{isAr ? 'فودافون كاش' : 'Vodafone Cash'}</option>
                    <option value="stc_pay">{isAr ? 'إس تي سي باي' : 'STC Pay'}</option>
                    <option value="usdt_trc20">USDT (TRC-20)</option>
                  </select>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 mt-2"
            >
              <span>{isAr ? 'حفظ وتحديث معلومات الحساب 💾' : 'Save and Update Profile Info 💾'}</span>
            </button>

          </form>
        </div>

        {/* RIGHT CARD: SUMMARY & METRICS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Account Integrity Badge */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-slate-900 dark:to-slate-900/60 p-5 rounded-3xl border border-indigo-100 dark:border-slate-800 text-center space-y-4">
            <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isAr ? 'حالة الحساب الموثق' : 'Verified Identity Hub'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isAr 
                  ? 'حسابك مربوط ومؤمن بالكامل بالرمز السري وتشفير SSL 256-bit. يمكنك مزامنة نقاطك وسحب الأموال فورياً دون أي عوائق.'
                  : 'Your account is secured with fully configured SSL wraps. Points sync and payout requests can be generated securely.'}
              </p>
            </div>
          </div>

          {/* Admin Messages & Notifications Section */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>{isAr ? 'الرسائل الإدارية المباشرة 📩' : 'Direct Admin Messages 📩'}</span>
            </h4>

            {(!currentUser?.messages || currentUser.messages.length === 0) ? (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                {isAr ? 'لا توجد أي رسائل جديدة من الإدارة حالياً.' : 'No new messages from the administration currently.'}
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {currentUser.messages.map((msg: any) => (
                  <div key={msg.id} className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/30 rounded-2xl space-y-1 relative">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100/50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                        {isAr ? 'المدير العام 👑' : 'General Manager 👑'}
                      </span>
                      <span className="text-[8px] text-slate-400 font-semibold">
                        {new Date(msg.date).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {isAr ? 'إحصائيات ومؤشرات العضوية' : 'Membership Metrics'}
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{isAr ? 'دولة الحساب النشطة:' : 'Active Country:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>{selectedCountry.flag}</span>
                  <span>{isAr ? selectedCountry.nameAr : selectedCountry.nameEn}</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{isAr ? 'عملة التداول الحالية:' : 'Current Currency:'}</span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {selectedCountry.currencyCode} ({selectedCountry.currencySymbol})
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{isAr ? 'المحفظة الافتراضية للمدفوعات:' : 'Primary Payout Channel:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {getWalletLabel(walletType)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">{isAr ? 'معرّف الحساب الفريد:' : 'Account UID:'}</span>
                <span className="font-mono text-[10px] text-slate-400 select-all">
                  {currentUser?.id}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Referrals Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>{isAr ? 'نظام الإحالة ودعوة الأصدقاء' : 'Referrals & Invite Friends'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'ادعُ أصدقاءك للتسجيل واحصل على مكافآت ترحيبية فورية قدرها 5,000 نقطة لك ولكل صديق!'
                : 'Invite your friends to register and receive an instant reward of 5,000 points for both of you!'}
            </p>
          </div>
        </div>

        {/* Link and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Link Copy Box */}
          <div className="lg:col-span-7 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/30 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'رابط الإحالة الخاص بك:' : 'Your Unique Referral Link:'}</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'انسخ هذا الرابط وشاركه مع أصدقائك عبر واتساب، فيسبوك أو تليغرام لتسجيل حساباتهم والحصول على المكافآت تلقائياً.'
                  : 'Copy this link and share it with your friends via WhatsApp, Facebook, or Telegram to earn rewards automatically.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}${window.location.pathname}?ref=${currentUser?.id || ''}`}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-400 focus:outline-none select-all overflow-ellipsis"
              />
              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname}?ref=${currentUser?.id || ''}`;
                  navigator.clipboard.writeText(link).then(() => {
                    triggerToast(
                      isAr
                        ? '📋 تم نسخ رابط الإحالة بنجاح!'
                        : '📋 Referral link copied to clipboard successfully!',
                      'success'
                    );
                  }).catch(err => {
                    console.error("Clipboard copy failed:", err);
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? 'نسخ' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isAr ? 'الأصدقاء المسجلين' : 'Referred Friends'}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {(currentUser?.referredUsers?.length || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold block">
                {isAr ? 'إحالات ناجحة' : 'Successful invites'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isAr ? 'النقاط المكتسبة' : 'Points Earned'}
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {(currentUser?.referralPoints || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold block">
                {isAr ? 'نقطة مكافآت' : 'Reward pts'}
              </span>
            </div>
          </div>
        </div>

        {/* Referred Friends Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{isAr ? 'قائمة الأصدقاء الذين سجلوا عن طريقك 👥' : 'Friends Registered via Your Link 👥'}</span>
          </h4>

          {(() => {
            const referredList = users.filter(u => u.referredBy === currentUser?.id);
            if (referredList.length === 0) {
              return (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  {isAr
                    ? 'لم يقم أي صديق بالتسجيل عبر رابطك بعد. ابدأ بمشاركة رابطك الآن لمضاعفة نقاطك!'
                    : 'No friends have signed up using your link yet. Start sharing your link to earn bonus points!'}
                </div>
              );
            }

            return (
              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-right sm:text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-extrabold uppercase">
                        <th className="px-4 py-3">{isAr ? 'اسم الصديق' : 'Friend Name'}</th>
                        <th className="px-4 py-3">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</th>
                        <th className="px-4 py-3">{isAr ? 'تاريخ التسجيل' : 'Registered Date'}</th>
                        <th className="px-4 py-3 text-left sm:text-left">{isAr ? 'المكافأة' : 'Bonus'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {referredList.map((friend) => {
                        // Mask email/phone for privacy
                        const maskEmail = (emailStr?: string) => {
                          if (!emailStr) return '***';
                          const parts = emailStr.split('@');
                          if (parts.length < 2) return '***';
                          const namePart = parts[0];
                          const domainPart = parts[1];
                          const visibleName = namePart.substring(0, Math.min(2, namePart.length));
                          return `${visibleName}***@${domainPart}`;
                        };

                        return (
                          <tr key={friend.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{friend.name}</td>
                            <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{maskEmail(friend.email || friend.phone)}</td>
                            <td className="px-4 py-3 text-slate-400 dark:text-slate-500">
                              {new Date(friend.registeredAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-4 py-3 text-left sm:text-left">
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black font-mono">
                                +5,000 pts
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
