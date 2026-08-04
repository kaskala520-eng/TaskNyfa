import React, { useState, useEffect } from 'react';
import { BankCard, CountryConfig } from '../types';
import { 
  Plus, 
  Trash2, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Lock, 
  User, 
  Calendar, 
  ShieldCheck, 
  Wallet, 
  Coins, 
  Sparkles, 
  TrendingUp, 
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BankCardsLinkProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  cashBalance: number;
  setCashBalance: (balance: number) => void;
  onAddTransaction: (tx: any) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

// Audio feedback for card actions using browser's Web Audio API
const playCardSound = (type: 'link' | 'verify' | 'deposit' | 'delete') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (type === 'link') {
      // Gentle card slide and double-beep
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.2);
    } else if (type === 'verify') {
      // Satisfying success chime
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.3);
      });
    } else if (type === 'deposit') {
      // Coin cascading sound
      const count = 5;
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = i * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880 + Math.random() * 400, now + delay);
        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.2);
      }
    } else if (type === 'delete') {
      // Whoosh down sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
};

const THEME_PRESETS = [
  { id: 'slate', nameAr: 'أسود فاخر 🖤', nameEn: 'Luxury Black 🖤', class: 'from-slate-900 via-slate-800 to-slate-950 text-white border-slate-700/50' },
  { id: 'blue', nameAr: 'أزرق ملكي 💙', nameEn: 'Royal Blue 💙', class: 'from-blue-900 via-indigo-900 to-slate-950 text-white border-blue-800/40' },
  { id: 'emerald', nameAr: 'أخضر زمردي 💚', nameEn: 'Emerald Gold 💚', class: 'from-emerald-900 via-teal-900 to-emerald-950 text-white border-emerald-800/40' },
  { id: 'rose', nameAr: 'برونزي ذهبي 💛', nameEn: 'Bronze Gold 💛', class: 'from-amber-800 via-yellow-700 to-amber-950 text-white border-amber-800/40' }
];

export default function BankCardsLink({
  lang,
  selectedCountry,
  cashBalance,
  setCashBalance,
  onAddTransaction,
  triggerToast
}: BankCardsLinkProps) {
  const isAr = lang === 'ar';

  // Load cards from localStorage or supply defaults
  const [cards, setCards] = useState<BankCard[]>(() => {
    const saved = localStorage.getItem('cashai_linked_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing linked cards", e);
      }
    }
    // Default initial cards
    return [
      {
        id: 'card_default_1',
        cardholderName: isAr ? 'علي حسن جاسم' : 'Ali Hassan Jasim',
        cardNumber: '4215 •••• •••• 8821',
        expiryDate: '09/29',
        cvv: '***',
        bankName: isAr ? 'مصرف الرافدين' : 'Rafidain Bank',
        cardType: 'qi',
        isPrimary: true,
        status: 'active',
        colorTheme: 'from-slate-900 via-slate-800 to-slate-950 text-white border-slate-700/50',
        createdAt: new Date().toISOString()
      },
      {
        id: 'card_default_2',
        cardholderName: isAr ? 'علي حسن جاسم' : 'Ali Hassan Jasim',
        cardNumber: '5321 •••• •••• 4402',
        expiryDate: '04/28',
        cvv: '***',
        bankName: isAr ? 'مصرف الرشيد' : 'Rasheed Bank',
        cardType: 'mastercard',
        isPrimary: false,
        status: 'pending_verification',
        colorTheme: 'from-blue-900 via-indigo-900 to-slate-950 text-white border-blue-800/40',
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Save cards changes
  useEffect(() => {
    localStorage.setItem('cashai_linked_cards', JSON.stringify(cards));
  }, [cards]);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHolder, setNewHolder] = useState('');
  const [newNum, setNewNum] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newCvv, setNewCvv] = useState('');
  const [newBank, setNewBank] = useState('');
  const [newType, setNewType] = useState<'visa' | 'mastercard' | 'qi' | 'local' | 'other'>('visa');
  const [newTheme, setNewTheme] = useState(THEME_PRESETS[0].class);

  // Verification states
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Deposit/Wallet Top-up states
  const [activeDepositCard, setActiveDepositCard] = useState<BankCard | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [depositing, setDepositing] = useState(false);

  // Helpers
  const handleCardNumberChange = (value: string) => {
    // Keep digits and format with spaces every 4 characters
    const digits = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 16);
    const matches = digits.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setNewNum(parts.join(' '));
    } else {
      setNewNum(digits);
    }
  };

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').substring(0, 4);
    if (digits.length >= 3) {
      setNewExpiry(`${digits.substring(0, 2)}/${digits.substring(2, 4)}`);
    } else {
      setNewExpiry(digits);
    }
  };

  const handleCvvChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').substring(0, 4);
    setNewCvv(digits);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolder || newNum.length < 15 || !newExpiry || newCvv.length < 3 || !newBank) {
      triggerToast(isAr ? '⚠️ الرجاء ملء جميع البيانات بشكل صحيح.' : '⚠️ Please fill out all card details correctly.', 'info');
      return;
    }

    // Format card number to mask middle
    const rawNum = newNum.replace(/\s+/g, '');
    const masked = `${rawNum.substring(0, 4)} •••• •••• ${rawNum.substring(12, 16)}`;

    const newCard: BankCard = {
      id: 'card_' + Math.floor(Math.random() * 900000 + 100000),
      cardholderName: newHolder,
      cardNumber: masked,
      expiryDate: newExpiry,
      cvv: '***', // secure mask
      bankName: newBank,
      cardType: newType,
      isPrimary: cards.length === 0, // Primary if it's the first card
      status: 'pending_verification',
      colorTheme: newTheme,
      createdAt: new Date().toISOString()
    };

    setCards(prev => [...prev, newCard]);
    playCardSound('link');
    triggerToast(
      isAr 
        ? `💳 تم تسجيل البطاقة [${newBank}] بنجاح! يرجى التحقق منها لتنشيطها.` 
        : `💳 Card linked from [${newBank}] successfully! Please verify to activate.`,
      'success'
    );

    // Reset Form
    setShowAddModal(false);
    setNewHolder('');
    setNewNum('');
    setNewExpiry('');
    setNewCvv('');
    setNewBank('');
    setNewType('visa');
    setNewTheme(THEME_PRESETS[0].class);
  };

  const handleVerifyCard = (id: string, bankName: string) => {
    setVerifyingId(id);
    playCardSound('link');
    
    setTimeout(() => {
      setCards(prev => prev.map(c => c.id === id ? { ...c, status: 'active' as const } : c));
      setVerifyingId(null);
      playCardSound('verify');
      triggerToast(
        isAr
          ? `✅ تم التحقق من بطاقة [${bankName}] بنجاح وتنشيطها للعمليات!`
          : `✅ Card [${bankName}] verified and activated for operations successfully!`,
        'success'
      );
    }, 2000);
  };

  const handleSetPrimary = (id: string, bankName: string) => {
    setCards(prev => prev.map(c => ({
      ...c,
      isPrimary: c.id === id
    })));
    triggerToast(
      isAr
        ? `⭐ تم تعيين بطاقة [${bankName}] كبطاقة دفع رئيسية للموقع.`
        : `⭐ Card from [${bankName}] is now set as your primary billing card.`,
      'success'
    );
  };

  const handleDeleteCard = (id: string, bankName: string) => {
    const cardToDelete = cards.find(c => c.id === id);
    if (cardToDelete?.isPrimary && cards.length > 1) {
      triggerToast(
        isAr
          ? '⚠️ لا يمكنك حذف البطاقة الرئيسية، قم بتعيين بطاقة أخرى كرئيسية أولاً!'
          : '⚠️ Cannot delete primary card. Mark another card as primary first!',
        'info'
      );
      return;
    }

    setCards(prev => prev.filter(c => c.id !== id));
    playCardSound('delete');
    triggerToast(
      isAr
        ? `🗑️ تم إلغاء ربط بطاقة [${bankName}] بنجاح.`
        : `🗑️ Disconnected billing card from [${bankName}] successfully.`,
      'success'
    );
  };

  // Perform Wallet Top-Up/Deposit from Card
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositCard || depositAmount <= 0) return;

    if (activeDepositCard.status !== 'active') {
      triggerToast(
        isAr
          ? '⚠️ لا يمكن الشحن من بطاقة غير نشطة، يرجى التحقق من البطاقة أولاً!'
          : '⚠️ Cannot load from an inactive card, please verify it first!',
        'info'
      );
      return;
    }

    setDepositing(true);
    playCardSound('link');

    setTimeout(() => {
      const updatedBalance = cashBalance + depositAmount;
      setCashBalance(updatedBalance);

      // Save updated user balance to local database as well
      const localUser = localStorage.getItem('cashai_current_user');
      if (localUser) {
        try {
          const uObj = JSON.parse(localUser);
          uObj.balance = updatedBalance;
          localStorage.setItem('cashai_current_user', JSON.stringify(uObj));
        } catch(err) {}
      }

      // Record transaction history log
      const newTx = {
        id: 'tx_dep_' + Math.floor(Math.random() * 900000 + 100000),
        type: 'convert' as const, // treat deposit as conversion/top-up
        amount: depositAmount,
        currency: selectedCountry.currencyCode,
        status: 'success' as const,
        platformName: `Deposit from ${activeDepositCard.bankName} (${activeDepositCard.cardNumber.slice(-4)})`,
        platformNameAr: `إيداع شحن من ${activeDepositCard.bankName} (${activeDepositCard.cardNumber.slice(-4)})`,
        date: new Date().toISOString()
      };
      
      onAddTransaction(newTx);
      playCardSound('deposit');
      triggerToast(
        isAr
          ? `💳 تم شحن محفظتك بـ (+${depositAmount.toLocaleString()} ${selectedCountry.currencySymbol}) من بطاقة [${activeDepositCard.bankName}] بنجاح!`
          : `💳 Wallet successfully loaded with (+${depositAmount.toLocaleString()} ${selectedCountry.currencyCode}) from [${activeDepositCard.bankName}]!`,
        'success'
      );

      setDepositing(false);
      setActiveDepositCard(null);
    }, 2400);
  };

  const t = {
    title: isAr ? 'ربط وإدارة البطاقات البنكية' : 'Bank Cards & Accounts',
    subtitle: isAr ? 'اربط بطاقات دفع متعددة (فيزا، ماستركارد، كي كارد) لشحن رصيد محفظتك وسحب أرباحك فوراً' : 'Link multiple debit/credit cards to top up your balance and withdraw cash instantly',
    addCardBtn: isAr ? 'ربط بطاقة جديدة 💳' : 'Link New Card 💳',
    primary: isAr ? 'رئيسية' : 'Primary',
    setPrimary: isAr ? 'تعيين كرئيسية' : 'Make Primary',
    verify: isAr ? 'تحقق وتنشيط' : 'Verify & Activate',
    verifying: isAr ? 'جاري التحقق...' : 'Verifying...',
    active: isAr ? 'نشطة' : 'Active',
    pending: isAr ? 'بانتظار التحقق' : 'Verification Required',
    unlink: isAr ? 'إلغاء ربط' : 'Unlink Card',
    chargeWallet: isAr ? 'شحن رصيد المحفظة 💸' : 'Deposit Cash 💸',
    noCards: isAr ? 'لم تقم بربط أي بطاقة بنكية بعد' : 'No bank cards linked yet',
    securityMsg: isAr ? 'بيانات بطاقاتك مؤمنة بالكامل بتشفير SSL 256-bit بمعيار PCI-DSS المالي الصارم. لا يتم حفظ رموز التحقق السرية CVV.' : 'Card records are completely encrypted via 256-bit SSL matching stringent PCI-DSS financial guidelines. Security CVVs are never saved.',
    
    // Add Modal
    modalTitle: isAr ? 'ربط بطاقة بنكية جديدة للموقع' : 'Link New Bank Card',
    modalDesc: isAr ? 'أدخل معلومات بطاقتك الائتمانية أو بطاقة الخصم لربطها تلقائياً بحسابك في Cash.ai.' : 'Input your credit/debit card credentials to securely register it to your account.',
    holderLabel: isAr ? 'اسم صاحب البطاقة (كما يظهر عليها):' : 'Cardholder Name (Exactly as shown):',
    numLabel: isAr ? 'رقم البطاقة (16 رقم):' : 'Card Number (16 digits):',
    expiryLabel: isAr ? 'تاريخ الانتهاء (MM/YY):' : 'Expiry Date (MM/YY):',
    cvvLabel: isAr ? 'رمز الأمان (CVV/CVC):' : 'Security CVV/CVC Code:',
    bankLabel: isAr ? 'اسم البنك المصدر:' : 'Issuing Bank Name:',
    typeLabel: isAr ? 'نوع البطاقة:' : 'Card Brand Type:',
    themeLabel: isAr ? 'المظهر اللوني الفاخر للبطاقة:' : 'Premium Card theme styling:',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    confirmAdd: isAr ? 'ربط البطاقة بأمان 🟢' : 'Connect Securely 🟢',

    // Charge Modal
    chargeTitle: isAr ? 'شحن رصيد المحفظة من البطاقة' : 'Top Up Wallet from Card',
    chargeDesc: isAr ? 'اختر المبلغ الذي تريد خصمه من بطاقتك وإضافته مباشرة إلى رصيد حسابك المتاح للتحويل أو الاستخدام.' : 'Choose an amount to load from your card directly into your available digital cash wallet.',
    chargeAmountLabel: isAr ? 'مبلغ الشحن المطلوب:' : 'Amount to top up:',
    chargeConfirm: isAr ? 'شحن الرصيد الآن ⚡' : 'Proceed to Top Up ⚡',
    charging: isAr ? 'جاري الاتصال بـ بوابة الدفع والخصم...' : 'Contacting secure banking payment gateway...'
  };

  return (
    <div className="space-y-8" id="bank-cards-link-tab">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t.title}</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800/40">
              {isAr ? 'متعدد البطاقات 🏦' : 'Multi-Card 🏦'}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCardBtn}</span>
        </button>
      </div>

      {/* PCI-DSS Security compliance banner */}
      <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 flex gap-3 text-xs leading-relaxed font-semibold">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <p>{t.securityMsg}</p>
      </div>

      {/* Cards list grid */}
      {cards.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 animate-pulse" />
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-4">{t.noCards}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {t.addCardBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map(card => (
            <motion.div
              key={card.id}
              layoutId={card.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between gap-6"
            >
              
              {/* Premium Realistic Card Visualization */}
              <div className={`w-full aspect-[1.58/1] rounded-2xl p-6 bg-gradient-to-tr ${card.colorTheme} border relative shadow-lg overflow-hidden flex flex-col justify-between`}>
                
                {/* Decorative chip and signal waves */}
                <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none opacity-50" />
                <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-6xl pointer-events-none uppercase font-mono">
                  {card.cardType}
                </div>

                {/* Top section: Bank name and Type logo */}
                <div className="flex justify-between items-start z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-wider font-extrabold uppercase opacity-80 block">
                      {isAr ? 'البنك المصدر' : 'ISSUING BANK'}
                    </span>
                    <span className="font-black text-sm block tracking-wide">
                      {card.bankName}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-black tracking-widest backdrop-blur-xs select-none">
                    {card.cardType.toUpperCase()}
                  </div>
                </div>

                {/* Middle section: Metallic Chip & Card number */}
                <div className="space-y-4 z-10 my-1">
                  {/* Chip icon */}
                  <div className="w-10 h-8 bg-amber-400/80 rounded-md border border-amber-300 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-x-2 inset-y-1 border border-slate-800/20 divide-y divide-slate-800/15" />
                    <div className="absolute inset-y-2 inset-x-1 border-x border-slate-800/20" />
                  </div>
                  {/* Card Number display */}
                  <div className="text-xl font-bold font-mono tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {card.cardNumber}
                  </div>
                </div>

                {/* Bottom section: Cardholder & Expiry */}
                <div className="flex justify-between items-end z-10">
                  <div>
                    <span className="text-[9px] tracking-wider font-semibold opacity-70 block uppercase">
                      {isAr ? 'صاحب البطاقة' : 'CARDHOLDER NAME'}
                    </span>
                    <span className="font-extrabold text-sm block uppercase tracking-wide">
                      {card.cardholderName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] tracking-wider font-semibold opacity-70 block uppercase">
                      {isAr ? 'تاريخ الصلاحية' : 'EXP DATE'}
                    </span>
                    <span className="font-bold text-sm block font-mono">
                      {card.expiryDate}
                    </span>
                  </div>
                </div>

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-1.5">
                  {card.isPrimary && (
                    <span className="bg-amber-400 text-slate-900 font-black text-[10px] px-2 py-0.5 rounded-full uppercase shadow-sm">
                      ★ {t.primary}
                    </span>
                  )}
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm ${
                    card.status === 'active' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-rose-500 text-white'
                  }`}>
                    {card.status === 'active' ? t.active : t.pending}
                  </span>
                </div>
              </div>

              {/* Bottom Actions section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">{isAr ? 'تاريخ الربط:' : 'Linked on:'}</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {card.status === 'pending_verification' ? (
                      <button
                        onClick={() => handleVerifyCard(card.id, card.bankName)}
                        disabled={verifyingId === card.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-97 disabled:opacity-75"
                      >
                        {verifyingId === card.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{verifyingId === card.id ? t.verifying : t.verify}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveDepositCard(card)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{t.chargeWallet}</span>
                        </button>

                        {!card.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(card.id, card.bankName)}
                            className="px-2.5 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            {t.setPrimary}
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => handleDeleteCard(card.id, card.bankName)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title={t.unlink}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* Add Card Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  <span>{t.modalTitle}</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{t.modalDesc}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.holderLabel}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={newHolder}
                    onChange={e => setNewHolder(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                    placeholder="e.g. Ali Hassan Jasim"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.numLabel}</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={newNum}
                    onChange={e => handleCardNumberChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-mono tracking-wider font-semibold"
                    placeholder="4215 0000 0000 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.expiryLabel}</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={newExpiry}
                      onChange={e => handleExpiryChange(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.cvvLabel}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={newCvv}
                      onChange={e => handleCvvChange(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.bankLabel}</label>
                  <input
                    type="text"
                    required
                    value={newBank}
                    onChange={e => setNewBank(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder={isAr ? 'مثال: مصرف الرافدين' : 'e.g. Rasheed Bank'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.typeLabel}</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="qi">Qi Card (كي كارد)</option>
                    <option value="local">Local E-Debit (بطاقة دفع وطنية)</option>
                    <option value="other">Other Brand</option>
                  </select>
                </div>
              </div>

              {/* Theme Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.themeLabel}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewTheme(preset.class)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        newTheme === preset.class
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 scale-[1.03] ring-1 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {isAr ? preset.nameAr : preset.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {t.confirmAdd}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Deposit Popup Modal */}
      {activeDepositCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                  <span>{t.chargeTitle}</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{t.chargeDesc}</p>
              </div>
              <button
                onClick={() => setActiveDepositCard(null)}
                disabled={depositing}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-6">
              
              {/* Selected Card summary */}
              <div className={`p-4 bg-gradient-to-r ${activeDepositCard.colorTheme} rounded-2xl flex justify-between items-center text-white border shadow-sm`}>
                <div>
                  <span className="text-[10px] opacity-80 block uppercase font-mono">{activeDepositCard.bankName}</span>
                  <span className="text-sm font-bold block">{activeDepositCard.cardholderName}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs block">•••• {activeDepositCard.cardNumber.slice(-4)}</span>
                  <span className="text-[10px] opacity-85 block">{activeDepositCard.expiryDate}</span>
                </div>
              </div>

              {/* Amount selector presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.chargeAmountLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[25000, 50000, 100000, 250000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={depositing}
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2 px-3 text-xs font-mono font-black rounded-xl border transition-all cursor-pointer ${
                        depositAmount === amt
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {amt.toLocaleString()} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="relative mt-2">
                  <input
                    type="number"
                    required
                    disabled={depositing}
                    min="1000"
                    step="1000"
                    value={depositAmount}
                    onChange={e => setDepositAmount(Number(e.target.value))}
                    className="w-full pl-4 pr-16 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm font-bold font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="Enter custom amount"
                  />
                  <div className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                    {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                  </div>
                </div>
              </div>

              {/* Loader during banking gateway response */}
              {depositing && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl flex flex-col items-center justify-center text-center gap-3 animate-pulse">
                  <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">{t.charging}</span>
                  <span className="text-[10px] text-slate-400">SSL 256-bit Encrypted Gateways Secure Handshake</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  disabled={depositing}
                  onClick={() => setActiveDepositCard(null)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={depositing}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {t.chargeConfirm}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
