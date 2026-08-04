import React, { useState } from 'react';
import { RegisteredUser, WalletOption, CountryConfig } from '../types';
import { WALLET_OPTIONS } from '../mockData';
import { formatCurrencyValue } from '../utils/currency';
import { 
  Users, 
  TrendingUp, 
  UserPlus, 
  Wallet, 
  CheckCircle, 
  Percent, 
  Ban, 
  UserCheck,
  Calendar,
  DollarSign,
  Smartphone,
  ShieldCheck,
  ArrowDownToLine,
  Trash2,
  Crown,
  UserCog,
  ShieldAlert,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';

interface OwnerPortalProps {
  lang: 'ar' | 'en';
  users: RegisteredUser[];
  onAddUser: (name: string, phone: string, walletType: string) => void;
  ownerWithdrawn: number;
  onWithdrawOwnerProfits: (amount: number, walletId: string, details: string) => void;
  onToggleUserStatus: (id: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  selectedCountry: CountryConfig;
  ownerBookingCommission?: number;
  onGoBackToAuth?: () => void;
  currentUser?: RegisteredUser | null;
  onDeleteUser?: (id: string) => void;
  onUpdateUserRole?: (id: string, role: 'owner' | 'manager' | 'assistant' | 'user') => void;
  onUpdateUserBalance?: (id: string, balance: number) => void;
  onUpdateUserWithdrawn?: (id: string, withdrawn: number) => void;
  onSendMessageToUser?: (id: string, messageText: string) => void;
  onToggleDistinguished?: (id: string) => void;
  convertUsdToLocal?: (usdAmount: number, countryId: string) => number;
}

export default function OwnerPortal({
  lang,
  users,
  onAddUser,
  ownerWithdrawn,
  onWithdrawOwnerProfits,
  onToggleUserStatus,
  triggerToast,
  selectedCountry,
  ownerBookingCommission = 0,
  onGoBackToAuth,
  currentUser = null,
  onDeleteUser,
  onUpdateUserRole,
  onUpdateUserBalance,
  onUpdateUserWithdrawn,
  onSendMessageToUser,
  onToggleDistinguished,
  convertUsdToLocal = (usd, countryId) => usd * 1450 // fallback local logic
}: OwnerPortalProps) {
  const isAr = lang === 'ar';

  // State for adding simulated user
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserWallet, setNewUserWallet] = useState('zain_cash');

  // State for user editing (balance, withdrawn, direct messages)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState<string>('');
  const [editWithdrawnVal, setEditWithdrawnVal] = useState<string>('');
  const [directMsgVal, setDirectMsgVal] = useState<string>('');

  const handleToggleEditUser = (user: RegisteredUser) => {
    if (editingUserId === user.id) {
      setEditingUserId(null);
    } else {
      setEditingUserId(user.id);
      setEditBalanceVal((user.balance !== undefined ? user.balance : 2500000).toString());
      setEditWithdrawnVal((user.withdrawn !== undefined ? user.withdrawn : 0).toString());
      setDirectMsgVal('');
    }
  };

  const handleSaveUserBalances = (userId: string) => {
    const bal = parseInt(editBalanceVal) || 0;
    const withdr = parseInt(editWithdrawnVal) || 0;
    onUpdateUserBalance?.(userId, bal);
    onUpdateUserWithdrawn?.(userId, withdr);
    triggerToast(
      isAr ? '✅ تم تحديث مبالغ العميل بنجاح!' : '✅ User balances successfully updated!',
      'success'
    );
  };

  const handleSendDirectMsg = (userId: string) => {
    if (!directMsgVal.trim()) {
      triggerToast(isAr ? 'الرجاء كتابة نص الرسالة أولاً!' : 'Please enter message content first!', 'info');
      return;
    }
    onSendMessageToUser?.(userId, directMsgVal.trim());
    setDirectMsgVal('');
    triggerToast(
      isAr ? '📩 تم إرسال الرسالة بنجاح إلى الصفحة الشخصية للمستخدم!' : '📩 Message successfully transmitted to user profile!',
      'success'
    );
  };

  // Admin Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeOwnerTab, setActiveOwnerTab] = useState<'users' | 'vips'>('users');
  const [vipSearchTerm, setVipSearchTerm] = useState('');

  // State for Owner Withdrawal
  const [selectedWalletId, setSelectedWalletId] = useState('zain_cash');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletDetails, setWalletDetails] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [successWithdraw, setSuccessWithdraw] = useState<any | null>(null);

  // Calculations
  const ratePerUser = 500 * selectedCountry.rate; // 500 points equivalent in selected country's currency
  const bookingCommissionLocal = ownerBookingCommission * (selectedCountry.rate / 1000);
  const totalOwnerEarnings = (users.length * ratePerUser) + bookingCommissionLocal;
  const availableOwnerBalance = totalOwnerEarnings - ownerWithdrawn;

  // Selected wallet config
  const activeWallet = WALLET_OPTIONS.find(w => w.id === selectedWalletId) || WALLET_OPTIONS[0];

  // Translations
  const t = {
    title: isAr ? 'بوابة مالك المنصة | Cash.ai Owner' : 'Cash.ai Owner Portal',
    subtitle: isAr 
      ? `إدارة المنصة، ومتابعة أرباح المالك الثابتة بقيمة ${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol} لكل مستخدم، بالإضافة إلى عمولة حجز الطيران والفيز المقدرة بـ 1,000,000 د.ع لكل حجز.` 
      : `Manage users and claim fixed owner profits of ${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencyCode} per user, plus 1,000,000 IQD commission per flight or visa booking.`,
    
    // Metrics
    totalUsers: isAr ? 'إجمالي المستخدمين المسجلين' : 'Total Registered Users',
    rateLabel: isAr ? 'العمولة الثابتة لكل مستخدم' : 'Fixed Profit Rate Per User',
    totalEarned: isAr ? 'إجمالي الأرباح المتراكمة' : 'Total Generated Profits',
    withdrawnProfits: isAr ? 'الأرباح المسحوبة سابقاً' : 'Withdrawn Owner Profits',
    availableProfits: isAr ? 'الرصيد المتاح للسحب حالياً' : 'Available Balance to Withdraw',
    
    // Register simulated user
    addUserTitle: isAr ? 'محاكاة تسجيل مستخدم جديد ➕' : 'Simulate New User Sign-Up ➕',
    addUserDesc: isAr 
      ? `قم بإضافة مستخدم وهمي جديد للمنصة لتجربة إضافة ${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol} فورياً لعمولتك كمالك للموقع.` 
      : `Add a simulated active user to credit your owner balance with +${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencyCode} instantly.`,
    nameLabel: isAr ? 'اسم المستخدم الكامل' : 'Full Name',
    phoneLabel: isAr ? 'رقم الهاتف / المحفظة الكاش' : 'Phone / Wallet Account',
    walletLabel: isAr ? 'المحفظة الإلكترونية للمستخدم' : 'User Wallet Provider',
    addUserBtn: isAr ? 'تسجيل المستخدم وتوليد الأرباح ⚡' : `Register User & Credit ${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencyCode} ⚡`,
    
    // Owner Withdrawal
    withdrawTitle: isAr ? 'سحب أرباح المالك (0% عمولة)' : 'Withdraw Owner Profits (0% Fees)',
    withdrawDesc: isAr ? 'اسحب أرباحك كصاحب للموقع مباشرة إلى محفظتك الخاصة بدون أي رسوم أو اقتطاعات.' : 'Transfer accumulated owner earnings directly into your personal e-wallet with zero fees.',
    amountLabel: isAr ? `المبلغ المراد سحبه بـ ${selectedCountry.currencySymbol}` : `Amount to Withdraw (${selectedCountry.currencyCode})`,
    walletDetailsLabel: isAr ? 'تفاصيل المحفظة المستلمة' : 'E-Wallet details',
    payoutBtn: isAr ? 'سحب الأرباح للمحفظة الآن 💸' : 'Disburse Owner Profits Now 💸',
    balanceError: isAr ? 'المبلغ المدخل يتجاوز رصيد أرباحك المتوفرة!' : 'Specified amount exceeds your available owner balance!',
    minAmountError: isAr 
      ? `الحد الأدنى للسحب هو ${formatCurrencyValue(50 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol}.` 
      : `Minimum owner payout is ${formatCurrencyValue(50 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencyCode}.`,
    feesNotice: isAr ? '💡 السحب بدون عمولة بالكامل للمالك والمستخدمين 0%.' : '💡 100% free with 0% fees for both owner and users.',
    
    // Users Table
    usersTableTitle: isAr ? 'قائمة مستخدمي نظام Cash.ai' : 'Registered Cash.ai User Ledger',
    usersTableDesc: isAr ? 'عرض بيانات المستخدمين النشطين والعمولة المحققة لصاحب الموقع لكل منهم.' : 'View active users and corresponding owner earnings credited per account.',
    colId: isAr ? 'رمز المستخدم' : 'User ID',
    colName: isAr ? 'الاسم الكامل' : 'Full Name',
    colContact: isAr ? 'بيانات الاتصال' : 'Wallet / Contact',
    colDate: isAr ? 'تاريخ الانضمام' : 'Join Date',
    colOwnerCredit: isAr ? 'أرباح المالك' : 'Owner Earnings',
    colStatus: isAr ? 'الحالة والتحكم' : 'Status & Action',
    activeUser: isAr ? 'نشط ومصرح' : 'Active',
    suspendedUser: isAr ? 'موقف مؤقتاً' : 'Suspended',
    toggleSuspend: isAr ? 'تغيير الحالة' : 'Toggle Status',
    
    // Success Withdrawal Modal
    successTitle: isAr ? '🎉 تم السحب بنجاح بدون عمولة!' : '🎉 Payout Dispatched with 0% Fees!',
    successDesc: isAr ? 'تم تحويل أرباح مالك المنصة بأمان إلى المحفظة المحددة.' : 'Owner profits successfully routed to your designated e-wallet.',
    withdrawnAmount: isAr ? 'المبلغ المسحوب:' : 'Withdrawn Amount:',
    targetWallet: isAr ? 'محفظة المستلم للمالك:' : 'Target E-Wallet:',
    closeBtn: isAr ? 'العودة للوحة التحكم' : 'Back to Panel'
  };

  const handleAddSimulatedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) {
      triggerToast(isAr ? 'الرجاء ملء جميع حقول المستخدم!' : 'Please fill all user fields!', 'info');
      return;
    }

    onAddUser(newUserName, newUserPhone, newUserWallet);
    setNewUserName('');
    setNewUserPhone('');
    triggerToast(
      isAr 
        ? `✅ تم تسجيل المستخدم بنجاح! تمت إضافة +${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol} لأرباحك كصاحب موقع.` 
        : `✅ User registered! Added +${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencyCode} to your owner profits balance.`,
      'success'
    );
  };

  const handleOwnerWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount) || 0;

    if (amount <= 0) {
      triggerToast(isAr ? 'الرجاء إدخال مبلغ صحيح!' : 'Please enter a valid amount!', 'info');
      return;
    }

    if (amount < 50 * selectedCountry.rate) {
      triggerToast(t.minAmountError, 'info');
      return;
    }

    if (amount > availableOwnerBalance) {
      triggerToast(t.balanceError, 'info');
      return;
    }

    if (!walletDetails.trim()) {
      triggerToast(isAr ? 'يرجى إدخال بيانات رقم المحفظة المستلمة!' : 'Please fill out e-wallet address details!', 'info');
      return;
    }

    setIsProcessingWithdraw(true);

    // Simulate owner withdrawal processing with 0% commission
    setTimeout(() => {
      onWithdrawOwnerProfits(amount, selectedWalletId, walletDetails);
      setIsProcessingWithdraw(false);
      setSuccessWithdraw({
        amount,
        walletId: selectedWalletId,
        details: walletDetails,
        date: new Date().toISOString()
      });
      setWithdrawAmount('');
      setWalletDetails('');
      triggerToast(
        isAr 
          ? `💸 تم سحب ${formatCurrencyValue(amount, selectedCountry.currencyCode)} ${isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode} بنجاح بدون عمولة (0%).` 
          : `💸 Successfully withdrew ${formatCurrencyValue(amount, selectedCountry.currencyCode)} ${selectedCountry.currencyCode} with zero fees (0%).`,
        'success'
      );
    }, 1200);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRole = user.role || 'user';
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8" id="owner-portal-tab">
      
      {/* Header Info */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            {onGoBackToAuth && (
              <button
                onClick={onGoBackToAuth}
                className="mb-4 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-[11px] font-black tracking-tight transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{isAr ? '➡️' : '⬅️'}</span>
                <span>{isAr ? 'العودة لتسجيل حسابات المستخدمين' : 'Back to User Registration'}</span>
              </button>
            )}
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-indigo-500/30">
              {isAr ? '🔐 لوحة تحكم المالك الخاصة' : '🔐 Owner Authorized Workspace'}
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-2 flex items-center gap-2">
              <span>{t.title}</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60 font-bold text-xs">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-slate-300">{isAr ? `سعر الصرف: ١ نقطة = ${formatCurrencyValue(selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol}` : `Rate: 1 pt = ${formatCurrencyValue(selectedCountry.rate, selectedCountry.currencyCode)} ${selectedCountry.currencyCode}`}</span>
          </div>
        </div>
      </div>

      {/* Owner Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Registered Users */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{t.totalUsers}</span>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              <span>{users.length}</span>
              <span className="text-sm font-medium text-slate-400">{isAr ? 'مستخدمين' : 'users'}</span>
            </div>
            <p className="text-[10px] text-indigo-500 font-semibold">
              {isAr ? `📈 مضاف +${formatCurrencyValue(ratePerUser, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol} لكل مستخدم` : `📈 +${formatCurrencyValue(ratePerUser, selectedCountry.currencyCode)} ${selectedCountry.currencyCode} credited per user`}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Owner Earnings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{t.totalEarned}</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight text-indigo-600 dark:text-indigo-400">
              {formatCurrencyValue(totalOwnerEarnings, selectedCountry.currencyCode)} <span className="text-xs font-semibold text-slate-400">{isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isAr 
                ? `يشمل أرباح الأعضاء وعمولات الحجوزات (+${formatCurrencyValue(bookingCommissionLocal, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol})` 
                : `Includes member registration & booking commissions (+${formatCurrencyValue(bookingCommissionLocal, selectedCountry.currencyCode)} ${selectedCountry.currencyCode})`}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Available Owner Balance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{t.availableProfits}</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrencyValue(availableOwnerBalance, selectedCountry.currencyCode)} <span className="text-xs font-semibold text-slate-400">{isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isAr ? `مسحوب سابقاً: ${formatCurrencyValue(ownerWithdrawn, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol}` : `Previously claimed: ${formatCurrencyValue(ownerWithdrawn, selectedCountry.currencyCode)} ${selectedCountry.currencyCode}`}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Simulated User creation AND Owner Payout split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Simulate User registration Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              <span>{t.addUserTitle}</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">{t.addUserDesc}</p>
          </div>

          <form onSubmit={handleAddSimulatedUser} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.nameLabel}</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                placeholder={isAr ? 'مثال: مصطفى صلاح الهاشمي' : 'e.g. Mustafa Salah'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.phoneLabel}</label>
                <input
                  type="text"
                  required
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="07XXXXXXXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.walletLabel}</label>
                <select
                  value={newUserWallet}
                  onChange={e => setNewUserWallet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {WALLET_OPTIONS.map(w => (
                    <option key={w.id} value={w.id}>
                      {isAr ? w.nameAr : w.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center gap-2 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
              <Percent className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>{isAr ? '💡 هذا الإجراء يحاكي قيام مستخدم بتنزيل تطبيقك والربط بنظام الـ API.' : '💡 This simulates a real user completing rewards integration on their client.'}</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.addUserBtn}</span>
            </button>
          </form>
        </div>

        {/* Owner Withdrawal Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span>{t.withdrawTitle}</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">{t.withdrawDesc}</p>
          </div>

          {/* Success Withdrawal Popup inline panel */}
          {successWithdraw ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t.successTitle}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.successDesc}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.withdrawnAmount}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    -{formatCurrencyValue(successWithdraw.amount, selectedCountry.currencyCode)} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.targetWallet}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold">
                    {WALLET_OPTIONS.find(w => w.id === successWithdraw.walletId)?.nameEn} ({successWithdraw.details})
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{isAr ? 'تاريخ العملية:' : 'Date:'}</span>
                  <span>{new Date(successWithdraw.date).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSuccessWithdraw(null)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleOwnerWithdraw} className="space-y-4 pt-2">
              
              {/* Wallet Select Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{isAr ? 'اختر محفظتك الخاصة كمالك' : 'Your Personal Owner Wallet'}</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {WALLET_OPTIONS.map(w => {
                    const isSelected = selectedWalletId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWalletId(w.id);
                          setWalletDetails('');
                        }}
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-slate-150 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } text-[10px] font-semibold`}
                      >
                        {w.nameEn.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount and Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.amountLabel}</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={50 * selectedCountry.rate}
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      className="w-full pl-4 pr-16 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-emerald-500 font-mono font-semibold"
                      placeholder={isAr ? `مثال: ${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)}` : `e.g. ${formatCurrencyValue(500 * selectedCountry.rate, selectedCountry.currencyCode)}`}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-[10px] font-bold">
                      {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {activeWallet.fields[0]?.labelAr ? (isAr ? activeWallet.fields[0].labelAr : activeWallet.fields[0].labelEn) : t.walletDetailsLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={walletDetails}
                    onChange={e => setWalletDetails(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                    placeholder={activeWallet.fields[0]?.placeholder || '077XXXXXXXX'}
                  />
                </div>
              </div>

              {/* Commission-free assurance */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{t.feesNotice}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessingWithdraw}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
              >
                <ArrowDownToLine className={`w-4 h-4 ${isProcessingWithdraw ? 'animate-bounce' : ''}`} />
                <span>{isProcessingWithdraw ? (isAr ? 'جاري معالجة التحويل الفوري المباشر...' : 'Routing payout safely...') : t.payoutBtn}</span>
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Users Table */}
      {currentUser?.role === 'owner' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden" id="chief-admin-management-panel">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-md font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <span>{isAr ? 'لوحة تحكم المدير الرئيسي ومصمم الموقع 🛡️' : 'Chief Manager & Developer Control Board 🛡️'}</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  {isAr 
                    ? 'بصفتك المدير الرئيسي، يمكنك مشاهدة تفاصيل كل المسجلين بالموقع، وحذفهم، وحظرهم، وترقية رتبهم إلى مدير ثانوي أو مساعد مدير.' 
                    : 'As the Chief Manager, you can monitor all registrations, delete, ban/suspend users, and upgrade roles to Secondary or Assistant Manager.'}
                </p>
              </div>
              
              {/* Quick stats badges */}
              <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                  {isAr ? `👥 الكل: ${users.length}` : `👥 Total: ${users.length}`}
                </span>
                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  {isAr ? `مدير رئيسي: ${users.filter(u => u.role === 'owner').length}` : `Chief: ${users.filter(u => u.role === 'owner').length}`}
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  {isAr ? `🥈 مدير ثانوي: ${users.filter(u => u.role === 'manager').length}` : `🥈 Secondary: ${users.filter(u => u.role === 'manager').length}`}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  {isAr ? `🥉 مساعد مدير: ${users.filter(u => u.role === 'assistant').length}` : `🥉 Assistant: ${users.filter(u => u.role === 'assistant').length}`}
                </span>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/80 -mx-6 px-6">
              <button
                onClick={() => setActiveOwnerTab('users')}
                className={`pb-3 pt-1 text-xs font-black border-b-2 px-4 transition-all cursor-pointer ${
                  activeOwnerTab === 'users'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                👥 {isAr ? 'قائمة مستخدمي نظام Cash.ai' : 'Registered Users Directory'}
              </button>
              <button
                onClick={() => {
                  if (currentUser?.email !== 'kaskala520@gmail.com') {
                    triggerToast(
                      isAr 
                        ? '⚠️ عذراً! التحكم في الأعضاء المتميزين متاح حصرياً للمصمم الرئيسي للموقع فقط.' 
                        : '⚠️ Restricted! Distinguished members can only be managed by the main site designer.',
                      'info'
                    );
                    return;
                  }
                  setActiveOwnerTab('vips');
                }}
                className={`pb-3 pt-1 text-xs font-black border-b-2 px-4 transition-all cursor-pointer relative flex items-center gap-1.5 ${
                  activeOwnerTab === 'vips'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                ⭐ {isAr ? 'إدارة الأعضاء المتميزين' : 'VIP Distinguished Members'}
                <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-500 text-[9px] font-black rounded-md">
                  {users.filter(u => u.isDistinguished).length}/50
                </span>
              </button>
            </div>

            {activeOwnerTab === 'users' && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isAr ? 'البحث بالاسم، الايميل، الهاتف، أو الرمز...' : 'Search by name, email, phone, ID...'}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 px-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تصفية الرتبة:' : 'Role Filter:'}</span>
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="all">{isAr ? 'كل المستخدمين 👤' : 'All Users 👤'}</option>
                    <option value="owner">{isAr ? '👑 المدير الرئيسي' : '👑 Chief Manager'}</option>
                    <option value="manager">{isAr ? '🥈 مدير ثانوي' : '🥈 Secondary Manager'}</option>
                    <option value="assistant">{isAr ? '🥉 مساعد مدير' : '🥉 Assistant Manager'}</option>
                    <option value="user">{isAr ? '👤 مستخدم عادي' : '👤 Regular User'}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {activeOwnerTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{t.colId}</th>
                    <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{t.colName}</th>
                    <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{t.colContact}</th>
                    <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{t.colDate}</th>
                    <th className={`px-6 py-3.5 ${isAr ? 'text-left' : 'text-right'}`}>{t.colOwnerCredit}</th>
                    <th className="px-6 py-3.5 text-center">{isAr ? 'ترقية الرتبة والتحكم بالصلاحيات' : 'Role Promotion & Admin Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                        {isAr ? '❌ لا يوجد مستخدمين يطابقون خيارات البحث !' : '❌ No users match search options.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const userRole = user.role || 'user';
                      const isExpanded = editingUserId === user.id;
                      
                      return (
                        <React.Fragment key={user.id}>
                          <tr className={`hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all ${user.status === 'suspended' ? 'bg-red-500/5 opacity-75' : ''}`}>
                            <td className="px-6 py-4 font-mono font-bold text-[11px] text-slate-400">
                              {user.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={(user as any).avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                  alt=""
                                  className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800"
                                />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">{user.name}</span>
                                    {userRole === 'owner' && (
                                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-0.5 shadow-xs">
                                        <Crown className="w-2.5 h-2.5" />
                                        <span>{isAr ? 'مدير رئيسي' : 'CHIEF'}</span>
                                      </span>
                                    )}
                                    {userRole === 'manager' && (
                                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded-md">
                                        {isAr ? 'مدير ثانوي 🥈' : 'SECONDARY 🥈'}
                                      </span>
                                    )}
                                    {userRole === 'assistant' && (
                                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-md">
                                        {isAr ? 'مساعد مدير 🥉' : 'ASSISTANT 🥉'}
                                      </span>
                                    )}
                                    {userRole === 'user' && (
                                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-semibold rounded-md">
                                        {isAr ? 'مستخدم' : 'USER'}
                                      </span>
                                    )}
                                    {user.isDistinguished && (
                                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider rounded-md">
                                        ⭐ {isAr ? 'متميز' : 'VIP'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 text-[9px] font-bold">
                                    {isAr ? 'بريد:' : 'Email:'}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{user.email || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-bold">
                                    {isAr ? 'هاتف:' : 'Phone:'}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300 font-bold">{user.onboarding?.contactPhone || user.phone || '—'}</span>
                                </div>
                                {user.appUrl && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold">
                                      {isAr ? 'موقع:' : 'Site:'}
                                    </span>
                                    <a href={user.appUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline max-w-[180px] truncate block text-[11px]">
                                      {user.appUrl}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[10px]">
                              {new Date(user.registeredAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className={`px-6 py-4 font-mono font-black text-emerald-600 dark:text-emerald-400 ${isAr ? 'text-left' : 'text-right'}`}>
                              +{formatCurrencyValue(user.earnedForOwner, selectedCountry.currencyCode)} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-4 flex-wrap">
                                
                                {/* Role Selector Upgrade/Downgrade */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400">{isAr ? 'تغيير الرتبة:' : 'Role:'}</span>
                                  <select
                                    value={userRole}
                                    disabled={user.id === 'usr_owner'} // Protect chief owner account
                                    onChange={(e) => onUpdateUserRole?.(user.id, e.target.value as any)}
                                    className="px-2 py-1 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                                  >
                                    <option value="user">{isAr ? '👤 مستخدم عادي' : '👤 User'}</option>
                                    <option value="assistant">{isAr ? '🥉 مساعد مدير' : '🥉 Assistant'}</option>
                                    <option value="manager">{isAr ? '🥈 مدير ثانوي' : '🥈 Secondary'}</option>
                                    <option value="owner">{isAr ? '👑 مدير رئيسي' : '👑 Chief Admin'}</option>
                                  </select>
                                </div>

                                <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-2">
                                  {/* Edit user stats & Send Message to user */}
                                  <button
                                    onClick={() => handleToggleEditUser(user)}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      isExpanded
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                        : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80 text-indigo-600 hover:bg-indigo-100'
                                    }`}
                                    title={isAr ? 'تعديل مبالغ العضو وإرسال إشعار ⚙️' : 'Adjust Balances & Send Alert ⚙️'}
                                  >
                                    <UserCog className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Toggle Distinguished / VIP Status */}
                                  <button
                                    onClick={() => {
                                      const confirmMsg = user.isDistinguished
                                        ? (isAr ? `هل أنت متأكد من إلغاء التميز عن العضو ${user.name}؟` : `Are you sure you want to revoke VIP status for ${user.name}?`)
                                        : (isAr ? `هل تريد تعيين العضو ${user.name} كعضو متميز؟` : `Do you want to make ${user.name} a VIP member?`);
                                      if (confirm(confirmMsg)) {
                                        onToggleDistinguished?.(user.id);
                                      }
                                    }}
                                    disabled={user.id === 'usr_owner'} // Protect chief owner
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      user.isDistinguished
                                        ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 hover:bg-amber-200'
                                        : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                                    } disabled:opacity-50`}
                                    title={user.isDistinguished ? (isAr ? 'إلغاء التميز ❌' : 'Revoke VIP ❌') : (isAr ? 'تعيين كتميز ⭐' : 'Make VIP ⭐')}
                                  >
                                    <Crown className={`w-3.5 h-3.5 ${user.isDistinguished ? 'fill-amber-500 text-amber-500' : ''}`} />
                                  </button>

                                  {/* Ban/Block action */}
                                  <button
                                    onClick={() => onToggleUserStatus(user.id)}
                                    disabled={user.id === 'usr_owner'} // Protect chief owner
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      user.status === 'suspended'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 text-emerald-600 hover:bg-emerald-100'
                                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80 text-amber-600 hover:bg-amber-100'
                                    } disabled:opacity-50`}
                                    title={user.status === 'active' ? (isAr ? 'حظر من الموقع' : 'Ban User') : (isAr ? 'إلغاء الحظر' : 'Unban User')}
                                  >
                                    {user.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                  </button>

                                  {/* Delete action */}
                                  <button
                                    onClick={() => {
                                      if (confirm(isAr ? `هل أنت متأكد من حذف حساب ${user.name} نهائياً؟` : `Are you sure you want to permanently delete ${user.name}?`)) {
                                        onDeleteUser?.(user.id);
                                      }
                                    }}
                                    disabled={user.id === 'usr_owner'} // Protect chief owner
                                    className="p-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/80 text-rose-600 hover:bg-rose-100 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                    title={isAr ? 'حذف الحساب نهائياً' : 'Delete Permanently'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                              </div>
                            </td>
                          </tr>

                           {isExpanded && (
                            <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                              <td colSpan={6} className="px-6 py-5 border-y border-slate-100 dark:border-slate-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
                                  
                                  {/* Controls: Balances */}
                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
                                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                      <Wallet className="w-4 h-4 text-emerald-500" />
                                      <span>{isAr ? 'التحكم في مبالغ وسحوبات العضو كاش 💰' : 'Control User Cash Balances 💰'}</span>
                                    </h4>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 block">
                                          {isAr ? 'الرصيد المتاح للسحب:' : 'Withdrawable Balance:'}
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={editBalanceVal}
                                            onChange={(e) => setEditBalanceVal(e.target.value)}
                                            className="w-full pl-2 pr-10 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                                          />
                                          <span className="absolute right-2 top-2 text-[9px] font-bold text-slate-400">
                                            {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 block">
                                          {isAr ? 'إجمالي المبالغ المسحوبة:' : 'Total Withdrawn Cash:'}
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={editWithdrawnVal}
                                            onChange={(e) => setEditWithdrawnVal(e.target.value)}
                                            className="w-full pl-2 pr-10 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                                          />
                                          <span className="absolute right-2 top-2 text-[9px] font-bold text-slate-400">
                                            {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* VIP Switch */}
                                    <div className="flex items-center justify-between p-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                      <div className="flex items-center gap-2">
                                        <Crown className={`w-4 h-4 text-amber-500 ${user.isDistinguished ? 'fill-amber-500' : ''}`} />
                                        <div className="text-right col-span-1">
                                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                                            {isAr ? 'العضو المتميز (VIP)' : 'Distinguished VIP status'}
                                          </span>
                                          <span className="text-[9px] text-slate-400 block">
                                            {user.isDistinguished 
                                              ? (isAr ? 'مستفيد من مكافآت التسجيل والسحب.' : 'Eligible for registration and withdrawal rewards.')
                                              : (isAr ? 'عضو عادي غير مميز.' : 'Regular member, not VIP.')
                                            }
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => onToggleDistinguished?.(user.id)}
                                        disabled={user.id === 'usr_owner'}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                          user.isDistinguished
                                            ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-100'
                                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                                        } disabled:opacity-50`}
                                      >
                                        {user.isDistinguished ? (isAr ? '❌ إلغاء التميز' : '❌ Revoke VIP') : (isAr ? '⭐ تعيين كمتميز' : '⭐ Make VIP')}
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => handleSaveUserBalances(user.id)}
                                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>{isAr ? 'تعديل وحفظ مبالغ العضو كاش 💾' : 'Save & Edit User Balances 💾'}</span>
                                    </button>
                                  </div>

                                  {/* Controls: Messages */}
                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
                                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                      <Smartphone className="w-4 h-4 text-indigo-500" />
                                      <span>{isAr ? 'إرسال رسالة تنبيهية مباشرة لصفحة العضو 📩' : 'Send Alert Message to User Page 📩'}</span>
                                    </h4>

                                    <div className="space-y-1">
                                      <textarea
                                        value={directMsgVal}
                                        onChange={(e) => setDirectMsgVal(e.target.value)}
                                        placeholder={isAr ? 'اكتب رسالة خاصة أو تفاصيل سحب أو إشعار مكافأة...' : 'Write private message, payout details, reward update...'}
                                        rows={2}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                                      />
                                    </div>

                                    <button
                                      onClick={() => handleSendDirectMsg(user.id)}
                                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      <span>{isAr ? 'إرسال الرسالة للمستخدم الآن 📨' : 'Transmit Direct Message Now 📨'}</span>
                                    </button>
                                  </div>

                                  {/* Controls: Audit Log (History of Profile Changes) */}
                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 col-span-1 md:col-span-2">
                                    <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                      <ShieldAlert className="w-4 h-4 text-indigo-500" />
                                      <span>
                                        {isAr 
                                          ? 'سجل تعديلات البيانات الشخصية وتغيير المعلومات (حماية ضد الاحتيال) 🛡️' 
                                          : 'Personal Information Audit & Changes Log (Anti-fraud Protection) 🛡️'}
                                      </span>
                                    </h4>
                                    
                                    {user.profileChangesHistory && user.profileChangesHistory.length > 0 ? (
                                      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                        {user.profileChangesHistory.map((log, idx) => (
                                          <div key={idx} className="p-2.5 text-[11px] hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold uppercase text-[9px]">
                                                  {log.field === 'phoneVisibility' ? (isAr ? 'خصوصية الهاتف' : 'Phone Visibility') : log.field}
                                                </span>
                                                <span className="text-slate-400 font-bold">
                                                  {isAr ? 'تم التغيير:' : 'Changed:'}
                                                </span>
                                              </div>
                                              <div className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                                                <span className="line-through bg-red-50 dark:bg-red-950/30 text-red-600 px-1.5 py-0.5 rounded">
                                                  {log.oldValue || '—'}
                                                </span>
                                                <span className="text-slate-400">➔</span>
                                                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                                                  {log.newValue || '—'}
                                                </span>
                                              </div>
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                              {new Date(log.changedAt).toLocaleString(isAr ? 'ar-IQ' : 'en-US')}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 font-bold text-[11px]">
                                        {isAr ? 'لم يقم هذا المستخدم بتغيير بياناته الشخصية بعد.' : 'No profile modifications recorded for this user yet.'}
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              
              {/* Add New VIP Member Panel */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-amber-500" />
                    <span>{isAr ? 'إضافة عضو متميز جديد (الحد الأقصى ٥٠ عضو)' : 'Add New Distinguished Member (Max 50)'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isAr
                      ? 'ابحث عن أي عضو مسجل في المنصة لترقيته إلى عضو متميز. سيحصل العضو المتميز تلقائياً على مكافأة قدرها 10 دولار على كل عملية تسجيل حساب جديد بالمنصة.'
                      : 'Search any registered user to designate them as a Distinguished VIP. They will receive $10 USD for every new account registration.'}
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={vipSearchTerm}
                    onChange={(e) => setVipSearchTerm(e.target.value)}
                    placeholder={isAr ? 'ابحث بالاسم أو الايميل لإضافة العضو المتميز...' : 'Search name or email to add VIP...'}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* VIP Search results */}
                {vipSearchTerm.trim() && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pt-1">
                    {users.filter(u => 
                      !u.isDistinguished && 
                      u.id !== 'usr_owner' &&
                      (u.name.toLowerCase().includes(vipSearchTerm.toLowerCase()) || 
                       (u.email || '').toLowerCase().includes(vipSearchTerm.toLowerCase()))
                    ).slice(0, 5).length === 0 ? (
                      <div className="text-[11px] text-slate-400 font-bold py-2 px-1">
                        {isAr ? '❌ لم يتم العثور على مستخدمين غير متميزين يطابقون البحث.' : '❌ No non-VIP users match this search.'}
                      </div>
                    ) : (
                      users.filter(u => 
                        !u.isDistinguished && 
                        u.id !== 'usr_owner' &&
                        (u.name.toLowerCase().includes(vipSearchTerm.toLowerCase()) || 
                         (u.email || '').toLowerCase().includes(vipSearchTerm.toLowerCase()))
                      ).slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium block font-mono">{u.email || u.phone}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              onToggleDistinguished?.(u.id);
                              setVipSearchTerm('');
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                          >
                            ⭐ <span>{isAr ? 'ترقية كمتميز' : 'Make VIP'}</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* VIP Members List Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? `الأعضاء المتميزون الحاليون (${users.filter(u => u.isDistinguished).length}/٥٠)` : `Current Distinguished VIP Members (${users.filter(u => u.isDistinguished).length}/50)`}</span>
                </h3>

                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-xs text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'رمز العضو' : 'User ID'}</th>
                        <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الاسم الكامل' : 'Full Name'}</th>
                        <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'بيانات الاتصال' : 'Contact'}</th>
                        <th className={`px-6 py-3.5 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'تاريخ التسجيل' : 'Join Date'}</th>
                        <th className={`px-6 py-3.5 ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'إجمالي مكافآت التسجيل' : 'Accumulated Rewards'}</th>
                        <th className="px-6 py-3.5 text-center">{isAr ? 'التحكم بالتميز' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {users.filter(u => u.isDistinguished).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                            {isAr ? '🌟 لا يوجد أعضاء متميزين حالياً. قم بالبحث وإضافتهم بالأعلى!' : '🌟 No distinguished members added yet. Search and add above!'}
                          </td>
                        </tr>
                      ) : (
                        users.filter(u => u.isDistinguished).map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-amber-500 text-[10px]">{u.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">{u.name}</td>
                            <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{u.email || u.phone}</td>
                            <td className="px-6 py-4 text-[10px]">
                              {new Date(u.registeredAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className={`px-6 py-4 font-mono font-black text-amber-600 dark:text-amber-400 ${isAr ? 'text-left' : 'text-right'}`}>
                              ${(u.distinguishedRewardsUSD || 0).toLocaleString()} USD
                              <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">
                                {isAr
                                  ? `(≈ ${formatCurrencyValue(convertUsdToLocal(u.distinguishedRewardsUSD || 0, selectedCountry.id), selectedCountry.currencyCode)} ${selectedCountry.currencySymbol})`
                                  : `(≈ ${formatCurrencyValue(convertUsdToLocal(u.distinguishedRewardsUSD || 0, selectedCountry.id), selectedCountry.currencyCode)} ${selectedCountry.currencyCode})`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  if (confirm(isAr ? `هل أنت متأكد من إلغاء صفة التميز عن ${u.name}؟` : `Are you sure you want to revoke VIP status for ${u.name}?`)) {
                                    onToggleDistinguished?.(u.id);
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/80 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-black transition-all cursor-pointer"
                              >
                                {isAr ? '❌ إلغاء التميز' : '❌ Revoke VIP'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-amber-500/10 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-500/20 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-xs font-black">
            {isAr 
              ? '⚠️ هذه اللوحة الإدارية مخصصة للمدير الرئيسي ومصمم الموقع فقط. يرجى تسجيل الدخول كمدير رئيسي للتمكن من تعديل الرتب، وحظر أو حذف المستخدمين المسجلين.' 
              : '⚠️ This management dashboard is restricted to the Chief Site Designer and Manager. Please log in with Chief Manager permissions to upgrade roles, ban, or delete users.'}
          </p>
        </div>
      )}

    </div>
  );
}
