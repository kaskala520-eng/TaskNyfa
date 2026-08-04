import React, { useState } from 'react';
import { ShieldCheck, Mail, User, Sparkles, Lock, Link as LinkIcon, Globe, LogIn, Phone, Eye } from 'lucide-react';
import { RegisteredUser } from '../types';

interface AuthProps {
  lang: 'ar' | 'en';
  users: RegisteredUser[];
  onRegisterSuccess: (user: { 
    name: string; 
    email: string; 
    phone: string;
    phoneVisibility: 'everyone' | 'only_accepted' | 'only_admin';
    appUrl?: string; 
    password?: string;
  }) => void;
  onLoginSuccess: (user: RegisteredUser) => void;
  onSwitchToOwner?: () => void;
}

export default function Auth({ lang, users, onRegisterSuccess, onLoginSuccess, onSwitchToOwner }: AuthProps) {
  const isAr = lang === 'ar';

  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneVisibility, setPhoneVisibility] = useState<'everyone' | 'only_accepted' | 'only_admin'>('only_accepted');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email.trim()) {
        setError(isAr ? 'الرجاء إدخال ايميل المستخدم!' : 'Please enter your email!');
        return;
      }

      if (!password.trim()) {
        setError(isAr ? 'الرجاء إدخال كلمة السر!' : 'Please enter your password!');
        return;
      }

      const foundUser = users.find(u => u.email?.toLowerCase().trim() === email.toLowerCase().trim());
      if (!foundUser) {
        setError(isAr ? 'الحساب غير مسجل لدينا! يرجى إنشاء حساب جديد.' : 'No registered user found with this email! Please register.');
        return;
      }

      const correctPassword = foundUser.password || 'security123456';
      if (password !== correctPassword) {
        setError(isAr ? 'كلمة السر غير صحيحة!' : 'Incorrect password!');
        return;
      }

      if (foundUser.status === 'suspended') {
        setError(isAr ? '⚠️ هذا الحساب معطل مؤقتاً من قبل الإدارة العامة!' : '⚠️ This account has been suspended by the administrator!');
        return;
      }

      onLoginSuccess(foundUser);
    } else {
      if (!name.trim()) {
        setError(isAr ? 'الرجاء إدخال الاسم الكامل!' : 'Please enter your full name!');
        return;
      }

      if (!email.trim()) {
        setError(isAr ? 'الرجاء إدخال ايميل المستخدم!' : 'Please enter your email!');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(isAr 
          ? 'الرجاء إدخال بريد إلكتروني صحيح (مثال: user@example.com)' 
          : 'Please enter a valid email address (e.g., user@example.com)'
        );
        return;
      }

      if (!phone.trim()) {
        setError(isAr ? 'الرجاء إدخال رقم الهاتف المباشر!' : 'Please enter your phone number!');
        return;
      }

      if (!password.trim() || password.length < 6) {
        setError(isAr ? 'يجب أن تكون كلمة السر 6 أحرف أو أكثر!' : 'Password must be 6 characters or more!');
        return;
      }

      // Check if email already registered
      const emailExists = users.some(u => u.email?.toLowerCase().trim() === email.toLowerCase().trim());
      if (emailExists) {
        setError(isAr ? 'الايميل مسجل بالفعل! يرجى تسجيل الدخول بدلاً من ذلك.' : 'Email is already registered! Please sign in instead.');
        return;
      }

      // Check if phone already registered
      const phoneExists = users.some(u => u.phone?.trim() === phone.trim());
      if (phoneExists) {
        setError(isAr ? 'رقم الهاتف هذا مسجل بالفعل بحساب آخر!' : 'This phone number is already registered with another account!');
        return;
      }

      onRegisterSuccess({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneVisibility,
        appUrl: '',
        password: password.trim()
      });
    }
  };

  const autofillDemo = () => {
    if (isLogin) {
      const demoUser = users.find(u => u.email === 'ahmed.jassim@example.com') || users[0];
      if (demoUser) {
        setEmail(demoUser.email || 'ahmed.jassim@example.com');
        setPassword(demoUser.password || 'security123456');
      } else {
        setEmail('ahmed.jassim@example.com');
        setPassword('security123456');
      }
    } else {
      setName(isAr ? 'مصطفى صلاح الهاشمي' : 'Mustafa Salah Al-Hashimi');
      setEmail('mustafa.salah@example.com');
      setPhone('07712345678');
      setPhoneVisibility('only_accepted');
      setPassword('security123456');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle Decorative backgrounds */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand/Logo Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md shadow-indigo-100 dark:shadow-none">
            C
          </div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
            {isLogin 
              ? (isAr ? 'تسجيل الدخول إلى حسابك 🔐' : 'Sign In to Your Account 🔐')
              : (isAr ? 'إنشاء حساب جديد مجاني 🚀' : 'Register a New Free Account 🚀')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLogin
              ? (isAr ? 'أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة تحويل الكاش ومزامنة الأرباح.' : 'Enter your email and password to access the conversion dashboard and sync earnings.')
              : (isAr ? 'سجل حسابك الآن ببريدك الإلكتروني وكلمة السر لتجميع وتحويل النقاط بنجاح.' : 'Register now with your email and password to collect and convert points successfully.')}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800 relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all cursor-pointer ${
              !isLogin
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isAr ? 'إنشاء حساب ✨' : 'Register ✨'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all cursor-pointer ${
              isLogin
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isAr ? 'تسجيل الدخول 🔐' : 'Sign In 🔐'}
          </button>
        </div>

        {/* Free Registration Zero-Fee Badge Banner */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-xs font-bold relative z-10">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-extrabold">{isAr ? 'رسوم التسجيل والتحويل: مجاني بالكامل (0 د.ع)' : 'Registration & Transfer: 100% Free (0 IQD)'}</p>
            <p className="text-[10px] opacity-80 font-normal">
              {isAr 
                ? 'لا يتطلب هذا الموقع أي رسوم اشتراك، أو رسوم تفعيل، ويتم احتساب النقاط وتلقائيتها مباشرة.' 
                : 'This system does not require any sign-up or activation fees. Points are converted directly.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Full Name (Only for Registration) */}
          {!isLogin && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                {isAr ? 'الاسم الكامل أو اسم المستخدم:' : 'Full Username / Name:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  placeholder={isAr ? 'مثال: مصطفى صلاح الهاشمي' : 'e.g. Mustafa Salah'}
                />
              </div>
            </div>
          )}

          {/* User Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
              {isAr ? 'ايميل المستخدم الخاص بك:' : 'User Email Address:'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                placeholder="example@domain.com"
              />
            </div>
          </div>

          {/* User Phone (Only for Registration) */}
          {!isLogin && (
            <>
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                  {isAr ? 'رقم الهاتف للتواصل المباشر (إلزامي):' : 'Contact Phone Number (Mandatory):'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required={!isLogin}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                    placeholder={isAr ? 'مثال: 07701234567 أو +964...' : 'e.g. +9647701234567'}
                  />
                </div>
              </div>

              <div className="space-y-1.5 animate-fadeIn bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isAr ? 'من يمكنه رؤية رقم هاتفك؟' : 'Who can see your phone number?'}
                </label>
                <select
                  value={phoneVisibility}
                  onChange={(e) => setPhoneVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                >
                  <option value="only_accepted">
                    {isAr ? 'مقدمي/طالبي الطلبات المقبولة فقط (موصى به)' : 'Accepted request parties only (Recommended)'}
                  </option>
                  <option value="everyone">
                    {isAr ? 'الجميع (عرض عام)' : 'Everyone (Publicly visible)'}
                  </option>
                  <option value="only_admin">
                    {isAr ? 'الإدارة فقط (إخفاء عن الجميع)' : 'Admin only (Hidden from all users)'}
                  </option>
                </select>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isAr 
                    ? '⚠️ كمدير للموقع، يمكن للإدارة دائماً رؤية معلومات الاتصال الحقيقية لضمان مصداقية التعاملات حتى لو تم إخفاؤها.'
                    : '⚠️ The site administrator can always view contact info to guarantee deal authenticity even if hidden.'}
                </p>
              </div>
            </>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
              {isAr ? 'كلمة السر لربط وتأمين حسابك:' : 'Secure Password:'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-all mt-6"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>
              {isLogin
                ? (isAr ? 'تسجيل الدخول الآن 🔑' : 'Sign In Now 🔑')
                : (isAr ? 'سجل حسابك مجاناً الآن ✨' : 'Register Free Account Now ✨')}
            </span>
          </button>
        </form>

        {/* Demo Fast Fill Link */}
        <div className="text-center pt-2 relative z-10 border-t border-slate-50 dark:border-slate-850/60 flex flex-col gap-2">
          <button
            type="button"
            onClick={autofillDemo}
            className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 underline cursor-pointer"
          >
            {isLogin
              ? (isAr ? '💡 ملء تلقائي لبيانات الدخول التجريبي' : '💡 Auto-fill demo details for quick login')
              : (isAr ? '💡 ملء تلقائي للتجربة السريعة' : '💡 Auto-fill demo details for quick testing')}
          </button>

          {onSwitchToOwner && (
            <button
              type="button"
              onClick={onSwitchToOwner}
              className="text-[11px] font-black text-amber-600 dark:text-amber-500 hover:underline cursor-pointer flex items-center justify-center gap-1.5 mt-1"
            >
              <span>👑</span>
              <span>{isAr ? 'الدخول كـ صاحب الموقع (المالك)' : 'Login as Owner / Site Admin'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

