import React, { useState, useEffect } from 'react';
import { CountryConfig, RegisteredUser } from '../types';
import { COUNTRIES } from '../mockData';
import { 
  Send, 
  Globe, 
  Coins, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  User, 
  Wallet, 
  AlertCircle, 
  Info, 
  Sparkles,
  ArrowRightLeft,
  CreditCard,
  Plus
} from 'lucide-react';

interface MoneyTransferProps {
  lang: 'ar' | 'en';
  cashBalance: number;
  setCashBalance: (balance: number) => void;
  onTransfer: (
    usdAmount: number, 
    localAmountDeducted: number, 
    recipientName: string, 
    recipientCountryId: string, 
    recipientAmount: number, 
    recipientCurrency: string, 
    feeUsd: number, 
    walletType: string, 
    walletDetails: string,
    transferCurrency?: 'USD' | 'EUR',
    receiveMethod?: 'local' | 'same',
    isCardFunded?: boolean,
    cardDetails?: string
  ) => void;
  selectedCountry: CountryConfig;
  users: RegisteredUser[];
  currentUser: RegisteredUser | null;
  convertUsdToLocal: (usdAmount: number, countryId: string) => number;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

export default function MoneyTransfer({
  lang,
  cashBalance,
  setCashBalance,
  onTransfer,
  selectedCountry,
  users,
  currentUser,
  convertUsdToLocal,
  triggerToast
}: MoneyTransferProps) {
  const isAr = lang === 'ar';

  // Mode Selection: 'send' (Outgoing Transfer) or 'receive' (Incoming Transfer)
  const [transferMode, setTransferMode] = useState<'send' | 'receive'>('send');

  // Load linked bank cards from localStorage to allow direct funding / depositing
  const [linkedCards, setLinkedCards] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('cashai_linked_cards');
    if (saved) {
      try {
        setLinkedCards(JSON.parse(saved));
      } catch (e) {
        console.error("Failed loading cards in MoneyTransfer", e);
      }
    }
  }, [transferMode]); // Reload whenever mode changes

  // Outgoing 'send' states
  const [recipientType, setRecipientType] = useState<'custom' | 'registered'>('custom');
  const [selectedUserRecipientId, setSelectedUserRecipientId] = useState('');
  const [customRecipientName, setCustomRecipientName] = useState('');
  const [customRecipientPhone, setCustomRecipientPhone] = useState('');
  const [transferCurrency, setTransferCurrency] = useState<'USD' | 'EUR'>('USD');
  const [receiveMethod, setReceiveMethod] = useState<'local' | 'same'>('local');
  const [destCountryId, setDestCountryId] = useState('EG'); // default to Egypt
  const [usdAmount, setUsdAmount] = useState<number>(10);
  const [walletType, setWalletType] = useState('');
  const [walletDetails, setWalletDetails] = useState('');

  // Outgoing funding source states
  const [sendFundingSource, setSendFundingSource] = useState<'wallet' | 'card'>('wallet');
  const [sendSelectedCardId, setSendSelectedCardId] = useState<string>('custom');
  const [sendCustomCardNo, setSendCustomCardNo] = useState<string>('');
  const [sendCustomHolderName, setSendCustomHolderName] = useState<string>('');

  // Incoming 'receive' states
  const [receiveRecipientType, setReceiveRecipientType] = useState<'custom' | 'registered'>('custom');
  const [receiveSenderName, setReceiveSenderName] = useState('');
  const [receiveSenderPhone, setReceiveSenderPhone] = useState('');
  const [receiveAmount, setReceiveAmount] = useState<number>(10);

  // Incoming deposit destination states
  const [receiveFundingSource, setReceiveFundingSource] = useState<'wallet' | 'card'>('wallet');
  const [receiveSelectedCardId, setReceiveSelectedCardId] = useState<string>('custom');
  const [receiveCustomCardNo, setReceiveCustomCardNo] = useState<string>('');
  const [receiveCustomHolderName, setReceiveCustomHolderName] = useState<string>('');

  // General error & success states
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);

  const [receiveIsSuccess, setReceiveIsSuccess] = useState(false);
  const [receiveSuccessDetails, setReceiveSuccessDetails] = useState<any>(null);

  const destCountry = COUNTRIES.find(c => c.id === destCountryId) || COUNTRIES[0];

  // Dynamically change standard networks based on destination country
  const getPayoutNetworksForCountry = (countryId: string) => {
    switch (countryId.toUpperCase()) {
      case 'IQ':
        return [
          { id: 'zain_cash', nameAr: 'زين كاش العراق', nameEn: 'Zain Cash Iraq' },
          { id: 'qi_card', nameAr: 'بطاقة كي كارد', nameEn: 'Qi Card Iraq' },
          { id: 'fastpay', nameAr: 'فاست باي السليمانية', nameEn: 'FastPay' }
        ];
      case 'EG':
        return [
          { id: 'vodafone_cash', nameAr: 'فودافون كاش مصر', nameEn: 'Vodafone Cash Egypt' },
          { id: 'instapay', nameAr: 'إنستا باي مصر', nameEn: 'Instapay Egypt' },
          { id: 'fawry', nameAr: 'فوري مصر', nameEn: 'Fawry Cash-out' }
        ];
      case 'SA':
        return [
          { id: 'stc_pay', nameAr: 'إس تي سي باي السعودية', nameEn: 'STC Pay Saudi Arabia' },
          { id: 'urpay', nameAr: 'يور باي (urpay)', nameEn: 'urpay KSA' },
          { id: 'bank_transfer', nameAr: 'تحويل بنكي IBAN', nameEn: 'Local Bank Transfer (IBAN)' }
        ];
      case 'AE':
        return [
          { id: 'e_and_money', nameAr: 'إي آند موني الإمارات', nameEn: 'e& money UAE' },
          { id: 'stc_pay_ae', nameAr: 'إس تي سي باي الإمارات', nameEn: 'STC Pay UAE' },
          { id: 'bank_transfer', nameAr: 'تحويل بنكي محلي', nameEn: 'Bank Transfer (UAE)' }
        ];
      case 'JO':
        return [
          { id: 'cliq', nameAr: 'كليك الأردن (CliQ)', nameEn: 'CliQ Jordan' },
          { id: 'zain_cash_jo', nameAr: 'زين كاش الأردن', nameEn: 'Zain Cash Jordan' }
        ];
      case 'TR':
        return [
          { id: 'papara', nameAr: 'بابارا تركيا (Papara)', nameEn: 'Papara Turkey' },
          { id: 'pep', nameAr: 'بطاقة بيب تركيا (PeP)', nameEn: 'PeP Turkey' }
        ];
      case 'US':
      case 'EU':
      case 'GB':
        return [
          { id: 'paypal', nameAr: 'بايبال (PayPal)', nameEn: 'PayPal Transfer' },
          { id: 'bank_transfer', nameAr: 'حوالة بنكية دولية IBAN/SWIFT', nameEn: 'SWIFT/IBAN Bank Transfer' }
        ];
      default:
        return [
          { id: 'western_union', nameAr: 'ويسترن يونيون كاش', nameEn: 'Western Union Cash Payout' },
          { id: 'usdt_trc20', nameAr: 'عملة USDT المستقرة (TRC-20)', nameEn: 'USDT (TRC-20)' },
          { id: 'moneygram', nameAr: 'موني غرام (MoneyGram)', nameEn: 'MoneyGram Network' }
        ];
    }
  };

  const networks = getPayoutNetworksForCountry(destCountryId);

  // Auto-set the first network when destination country changes
  useEffect(() => {
    if (networks.length > 0) {
      setWalletType(networks[0].id);
    }
  }, [destCountryId]);

  // Handle selecting a registered user for Outgoing Transfer
  useEffect(() => {
    if (recipientType === 'registered' && selectedUserRecipientId) {
      const u = users.find(user => user.id === selectedUserRecipientId);
      if (u) {
        setCustomRecipientName(u.name);
        setCustomRecipientPhone(u.email || u.phone);
        const emailLower = (u.email || '').toLowerCase();
        if (emailLower.endsWith('.iq') || u.phone.includes('+964')) {
          setDestCountryId('IQ');
        } else if (emailLower.endsWith('.eg') || u.phone.includes('+20')) {
          setDestCountryId('EG');
        } else if (emailLower.endsWith('.sa') || u.phone.includes('+966')) {
          setDestCountryId('SA');
        }
      }
    }
  }, [selectedUserRecipientId, recipientType, users]);

  // Set default cards on-load
  useEffect(() => {
    if (linkedCards.length > 0) {
      // Set first active card as selected card by default
      setSendSelectedCardId(linkedCards[0].id);
      setReceiveSelectedCardId(linkedCards[0].id);
      setSendCustomCardNo(linkedCards[0].cardNumber);
      setSendCustomHolderName(linkedCards[0].cardholderName);
      setReceiveCustomCardNo(linkedCards[0].cardNumber);
      setReceiveCustomHolderName(linkedCards[0].cardholderName);
    } else {
      setSendSelectedCardId('custom');
      setReceiveSelectedCardId('custom');
    }
  }, [linkedCards]);

  // Calculations
  const convertTransferCurrencyToLocal = (amount: number, currency: 'USD' | 'EUR', countryId: string): number => {
    const usdAmount = currency === 'USD' ? amount : amount * (1 / 0.92);
    return convertUsdToLocal(usdAmount, countryId);
  };

  const feeAmount = 0; // 0% commission/fee, totally free!
  const totalBaseNeeded = usdAmount + feeAmount;
  
  // Calculate source local currency deduction
  const localDeduction = convertTransferCurrencyToLocal(totalBaseNeeded, transferCurrency, selectedCountry.id);
  const netAmountDeductedWithoutFee = convertTransferCurrencyToLocal(usdAmount, transferCurrency, selectedCountry.id);
  const localFee = convertTransferCurrencyToLocal(feeAmount, transferCurrency, selectedCountry.id);

  // Calculate recipient currency and amount received
  const recipientReceivedCurrency = receiveMethod === 'same' ? transferCurrency : destCountry.currencyCode;
  const recipientReceivedAmount = receiveMethod === 'same'
    ? usdAmount
    : convertTransferCurrencyToLocal(usdAmount, transferCurrency, destCountryId);

  // Validate balance
  const hasSufficientBalance = sendFundingSource === 'card' || cashBalance >= localDeduction;

  const t = {
    title: isAr ? 'تحويل واستقبل العملات بالدولار واليورو' : 'Transfer & Receive USD/EUR',
    subtitle: isAr ? 'أرسل واستقبل حوالات مالية بالدولار واليورو لأي مكان في العالم بسعر البنك المركزي وبدون عمولة (0%)' : 'Send and receive global money transfers in USD & EUR at official Central Bank rates with zero commission (0%)',
    sendTab: isAr ? 'إرسال أموال (حوالة صادرة) 📤' : 'Send Money (Outgoing Transfer) 📤',
    receiveTab: isAr ? 'استقبال أموال (حوالة واردة) 📥' : 'Receive Money (Incoming Transfer) 📥',
    recipientDetails: isAr ? 'بيانات المستلم' : 'Recipient Details',
    recipientTypeLabel: isAr ? 'نوع المستلم:' : 'Recipient Type:',
    customRecipient: isAr ? 'إدخال يدوي لبيانات مستلم جديد' : 'New Custom Recipient',
    registeredRecipient: isAr ? 'اختيار من قائمة الأعضاء المسجلين' : 'Select Registered User',
    selectUserPlaceholder: isAr ? '-- اختر عضواً من المنصة --' : '-- Choose site member --',
    fullName: isAr ? 'الاسم الكامل للمستلم' : 'Recipient Full Name',
    fullNamePlaceholder: isAr ? 'مثال: أحمد عبد الله الهاشمي' : 'e.g. John Doe',
    emailOrPhone: isAr ? 'البريد الإلكتروني أو رقم الهاتف' : 'Recipient Email or Phone',
    emailOrPhonePlaceholder: isAr ? 'مثال: recipient@example.com' : 'e.g. recipient@mail.com',
    destinationCountry: isAr ? 'دولة وجهة التحويل المستهدفة' : 'Destination Country',
    transferAmountUsd: isAr ? `مبلغ التحويل المستهدف (بال${transferCurrency === 'USD' ? 'دولار $' : 'يورو €'})` : `Transfer Amount (${transferCurrency === 'USD' ? 'USD $' : 'EUR €'})`,
    payoutNetwork: isAr ? 'شبكة صرف واستلام الحوالة' : 'Payout Transfer Network',
    payoutDetails: isAr ? 'تفاصيل حساب / محفظة الاستلام' : 'Recipient Wallet / Account Details',
    payoutDetailsPlaceholder: isAr ? 'أدخل رقم المحفظة أو الآيبان IBAN للاستلام' : 'Enter recipient wallet number, IBAN or phone',
    insufficientBalance: isAr ? '❌ رصيد حسابك غير كافٍ لتغطية مبلغ التحويل!' : '❌ Insufficient balance to cover the transfer amount!',
    validationRequired: isAr ? '⚠️ الرجاء ملء جميع الحقول المطلوبة بشكل صحيح.' : '⚠️ Please complete all required fields correctly.',
    balanceLabel: isAr ? 'رصيدك الحالي المتوفر في المحفظة:' : 'Your Available Wallet Balance:',
    confirmBtn: isAr ? 'تأكيد وإرسال الحوالة الآن 💸' : 'Confirm & Dispatch Transfer 💸',
    processing: isAr ? 'جاري تأمين وإرسال الأموال...' : 'Securing and routing funds...',
    successTitle: isAr ? '✅ تم إرسال الحوالة بنجاح!' : '✅ Money Transferred Successfully!',
    successSub: isAr ? 'تم خصم المبلغ وحجز الحوالة للإرسال الفوري لشبكة الاستلام المحددة بسعر البنك المركزي وبدون عمولة.' : 'Funds successfully routed to the destination payout network at official Central Bank rates with 0% fee.',
    receiptLabel: isAr ? 'إيصال التحويل المعتمد' : 'Official Transfer Receipt',
    senderCountryLabel: isAr ? 'بلد المرسل والعملة:' : 'Sender Country & Currency:',
    exchangeRateLabel: isAr ? 'سعر صرف البنك المركزي الرسمي للبلد:' : 'Official Central Bank Rate:',
    feeLabel: isAr ? 'رسوم المعالجة الإدارية (مجانًا 0%):' : 'Admin & Processing Fees (Free 0%):',
    netDeduction: isAr ? 'إجمالي خصم المعاملة الكلي:' : 'Total Transaction Value:',
    recipientWillReceive: isAr ? 'ما سيستلمه المستلم بالضبط:' : 'Recipient Will Safely Receive:',
    newTransferBtn: isAr ? 'إجراء عملية مالية جديدة 🔄' : 'Conduct New Operation 🔄',
    securityBadge: isAr ? 'حوالة آمنة ومضمونة بنظام التشفير الثنائي المتكامل بسعر البنك المركزي 0% عمولة' : 'Escrow locked with certified double cryptographic wrappers and Central Bank rates with 0% fee',
    
    // Funding Sources
    fundingSourceTitle: isAr ? 'اختر مصدر تمويل التحويل المالي' : 'Choose Funding Source for Transfer',
    fundingWallet: isAr ? 'محفظة الموقع الإلكتروني' : 'Website Wallet Balance',
    fundingCard: isAr ? 'بطاقة بنكية (فيزا / ماستر)' : 'Direct Bank Card Billing',
    fundingCardPlaceholder: isAr ? 'أدخل رقم البطاقة البنكية التي تريد التحويل منها' : 'Enter funding credit/debit bank card number',
    cardSelectLabel: isAr ? 'اختر بطاقة دفع مربوطة:' : 'Select a linked billing card:',
    customCardOption: isAr ? 'استخدام بطاقة أخرى جديدة' : 'Use another bank card',
    manualCardNo: isAr ? 'رقم البطاقة (16 رقم):' : 'Card Number (16 digits):',
    manualCardHolder: isAr ? 'اسم صاحب البطاقة:' : 'Cardholder Name:',

    // Receive Details
    receiveSuccessTitle: isAr ? '✅ تم استقبال وحفظ أموال الحوالة!' : '✅ Funds Received Successfully!',
    receiveSuccessSub: isAr ? 'تم تجميع قيمة الحوالة الواردة وإيداعها بنجاح حسب وجهة الاستلام المحددة.' : 'Received transaction cleared and credited securely into your chosen destination.',
    depositDestTitle: isAr ? 'حدد مكان إيداع واستلام أموال الحوالة' : 'Choose Destination to Deposit Funds'
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customRecipientName || !customRecipientPhone || !walletDetails || usdAmount <= 0) {
      setErrorMessage(t.validationRequired);
      return;
    }

    if (!hasSufficientBalance) {
      setErrorMessage(t.insufficientBalance);
      return;
    }

    // If card funding chosen, validate custom inputs
    const isCard = sendFundingSource === 'card';
    if (isCard && sendSelectedCardId === 'custom' && (!sendCustomCardNo || sendCustomCardNo.replace(/\s+/g, '').length < 15)) {
      setErrorMessage(isAr ? '⚠️ الرجاء إدخال رقم بطاقة بنكية صالح لتمويل العملية.' : '⚠️ Please enter a valid bank card number for billing.');
      return;
    }

    setErrorMessage('');
    
    let cardDetailString = '';
    if (isCard) {
      if (sendSelectedCardId !== 'custom') {
        const found = linkedCards.find(c => c.id === sendSelectedCardId);
        cardDetailString = found ? `${found.bankName} (${found.cardNumber.slice(-4)})` : 'Bank Card';
      } else {
        cardDetailString = `Visa (${sendCustomCardNo.slice(-4) || 'Custom'})`;
      }
    }

    // Execute state deduction & transaction logging in App.tsx
    onTransfer(
      usdAmount,
      localDeduction,
      customRecipientName,
      destCountryId,
      recipientReceivedAmount,
      recipientReceivedCurrency,
      feeAmount,
      walletType,
      walletDetails,
      transferCurrency,
      receiveMethod,
      isCard,
      cardDetailString
    );

    // Show beautiful success card
    const timestamp = new Date().toISOString();
    setSuccessDetails({
      id: 'tx_tr_' + Math.floor(Math.random() * 900000 + 100000),
      recipientName: customRecipientName,
      recipientPhone: customRecipientPhone,
      destCountry: destCountry,
      usdAmount: usdAmount,
      feeUsd: feeAmount,
      totalDeducted: localDeduction,
      recipientReceived: recipientReceivedAmount,
      walletType: walletType,
      walletDetails: walletDetails,
      date: timestamp,
      transferCurrency,
      receiveMethod,
      recipientReceivedCurrency,
      isCardFunded: isCard,
      cardDetails: cardDetailString
    });

    setIsSuccess(true);
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiveSenderName || !receiveSenderPhone || receiveAmount <= 0) {
      setErrorMessage(t.validationRequired);
      return;
    }

    const localAmountAdded = convertTransferCurrencyToLocal(receiveAmount, transferCurrency, selectedCountry.id);
    const isToCard = receiveFundingSource === 'card';

    // Validate card inputs
    if (isToCard && receiveSelectedCardId === 'custom' && (!receiveCustomCardNo || receiveCustomCardNo.replace(/\s+/g, '').length < 15)) {
      setErrorMessage(isAr ? '⚠️ الرجاء إدخال رقم بطاقة بنكية صالح للاستلام عليه.' : '⚠️ Please enter a valid bank card number for deposit.');
      return;
    }

    setErrorMessage('');

    let cardDetailString = '';
    if (isToCard) {
      if (receiveSelectedCardId !== 'custom') {
        const found = linkedCards.find(c => c.id === receiveSelectedCardId);
        cardDetailString = found ? `${found.bankName} (${found.cardNumber.slice(-4)})` : 'Bank Card';
      } else {
        cardDetailString = `Visa (${receiveCustomCardNo.slice(-4) || 'Custom'})`;
      }
    } else {
      // Deposit direct to Site Digital Wallet Balance
      const updatedBalance = cashBalance + localAmountAdded;
      setCashBalance(updatedBalance);

      // Persist in local storage current user profile as well
      const localUser = localStorage.getItem('cashai_current_user');
      if (localUser) {
        try {
          const uObj = JSON.parse(localUser);
          uObj.balance = updatedBalance;
          localStorage.setItem('cashai_current_user', JSON.stringify(uObj));
        } catch(err) {}
      }
    }

    // Log transaction
    const txId = 'tx_rec_' + Math.floor(Math.random() * 900000 + 100000);
    const appTx = {
      id: txId,
      type: 'convert' as const,
      amount: localAmountAdded,
      currency: selectedCountry.currencyCode,
      status: 'success' as const,
      platformName: isToCard ? `Received via Bank Card (${cardDetailString})` : 'Received to Website Wallet',
      platformNameAr: isToCard ? `استلام عبر بطاقة بنكية (${cardDetailString})` : 'استلام في محفظة الموقع المتاحة',
      date: new Date().toISOString()
    };

    // Callback to trigger transaction list additions in App.tsx
    // Since App.tsx has handleTransfer but maybe not a direct handleReceive, we can construct and trigger the addition
    // using setTransactions callback if we just store it in local state or push.
    // Let's invoke a beautiful local success screen!
    setReceiveSuccessDetails({
      id: txId,
      senderName: receiveSenderName,
      senderPhone: receiveSenderPhone,
      amount: receiveAmount,
      localAmount: localAmountAdded,
      isToCard,
      cardDetailString,
      date: appTx.date
    });

    // Save received transaction log to localStorage list
    const savedTxs = localStorage.getItem('cashai_custom_transactions');
    let txList = [];
    if (savedTxs) {
      try { txList = JSON.parse(savedTxs); } catch(e) {}
    }
    txList.unshift(appTx);
    localStorage.setItem('cashai_custom_transactions', JSON.stringify(txList));

    // Direct add dynamic transaction logs callback if supported via onTransfer
    // We can simulate an onTransfer log as well
    onTransfer(
      receiveAmount,
      -localAmountAdded, // negative deduction is addition!
      receiveSenderName,
      selectedCountry.id,
      receiveAmount,
      transferCurrency,
      0,
      isToCard ? 'bank_card' : 'site_wallet',
      isToCard ? cardDetailString : 'Main Wallet Address',
      transferCurrency,
      'same',
      isToCard,
      cardDetailString
    );

    // Instantly reflect balance update with a toast
    triggerToast(
      isAr 
        ? `✅ تم استقبال مبلغ الحوالة (+${localAmountAdded.toLocaleString()} ${selectedCountry.currencySymbol}) بنجاح!`
        : `✅ Received (+${localAmountAdded.toLocaleString()} ${selectedCountry.currencyCode}) successfully!`,
      'success'
    );

    setReceiveIsSuccess(true);
  };

  const handleReset = () => {
    setCustomRecipientName('');
    setCustomRecipientPhone('');
    setSelectedUserRecipientId('');
    setUsdAmount(10);
    setWalletDetails('');
    setIsSuccess(false);
    setSuccessDetails(null);

    setReceiveSenderName('');
    setReceiveSenderPhone('');
    setReceiveAmount(10);
    setReceiveIsSuccess(false);
    setReceiveSuccessDetails(null);
    setErrorMessage('');
  };

  // 1. Send Success Receipt View
  if (isSuccess && successDetails) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.successTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">{t.successSub}</p>
        </div>

        {/* Transfer Invoice Card */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400">{t.receiptLabel}</span>
            <span className="text-xs font-mono text-slate-400">{successDetails.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'المرسل:' : 'Sender:'}</span>
              <p className="font-bold text-slate-900 dark:text-white">{currentUser?.name || 'You'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'المستلم:' : 'Recipient:'}</span>
              <p className="font-bold text-slate-900 dark:text-white">{successDetails.recipientName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'تمويل الحوالة مقتطع من:' : 'Transfer Funded From:'}</span>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                {successDetails.isCardFunded ? `💳 ${isAr ? 'البطاقة البنكية' : 'Bank Card'} [${successDetails.cardDetails}]` : `💼 ${isAr ? 'محفظة الموقع' : 'Site Wallet'}`}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'إلى بلد وجهة الصرف:' : 'To Destination Country:'}</span>
              <p className="font-bold text-slate-900 dark:text-white">
                {successDetails.destCountry.flag} {isAr ? successDetails.destCountry.nameAr : successDetails.destCountry.nameEn} ({successDetails.destCountry.currencyCode})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'قناة صرف واستلام الأموال:' : 'Payout Channel Network:'}</span>
              <p className="font-bold text-slate-900 dark:text-white capitalize">
                {successDetails.walletType.replace('_', ' ')}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'تفاصيل حساب / محفظة المستلم:' : 'Recipient Account Details:'}</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white">{successDetails.walletDetails}</p>
            </div>
          </div>

          <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{isAr ? 'مبلغ الحوالة المرسل الكلي:' : 'Sent Transfer Amount:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {successDetails.usdAmount.toLocaleString()} {successDetails.transferCurrency || 'USD'}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{isAr ? 'رسوم التحويل الإدارية الحالية:' : 'Administrative Fees:'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'مجاناً 0%' : 'Free 0%'}
              </span>
            </div>
            
            <div className="flex justify-between text-xs border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 text-red-500 font-bold">
              <span>{t.netDeduction}</span>
              <span className="font-mono text-sm">{successDetails.totalDeducted.toLocaleString()} {selectedCountry.currencySymbol}</span>
            </div>

            <div className="flex justify-between text-sm bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black">
              <span>{t.recipientWillReceive}</span>
              <span className="font-mono text-base">
                {successDetails.recipientReceived.toLocaleString()} {successDetails.recipientReceivedCurrency || successDetails.destCountry.currencySymbol}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-99 cursor-pointer text-center"
          >
            {t.newTransferBtn}
          </button>
        </div>
      </div>
    );
  }

  // 2. Receive Success Receipt View
  if (receiveIsSuccess && receiveSuccessDetails) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.receiveSuccessTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">{t.receiveSuccessSub}</p>
        </div>

        {/* Receive Invoice Card */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400">{isAr ? 'إيصال استقبال معتمد' : 'Official Receive Receipt'}</span>
            <span className="text-xs font-mono text-slate-400">{receiveSuccessDetails.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'المرسل والدافع الكلي:' : 'Sender / Remitter:'}</span>
              <p className="font-bold text-slate-900 dark:text-white">{receiveSuccessDetails.senderName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'المستلم والوصول:' : 'Recipient:'}</span>
              <p className="font-bold text-slate-900 dark:text-white">{currentUser?.name || 'You'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'مكان إيداع واستلام المبلغ:' : 'Deposited Destination:'}</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {receiveSuccessDetails.isToCard ? `💳 ${isAr ? 'بطاقة بنكية' : 'Bank Card'} [${receiveSuccessDetails.cardDetailString}]` : `💼 ${isAr ? 'محفظة الموقع' : 'Site Wallet'}`}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">{isAr ? 'تاريخ المعاملة:' : 'Transaction Date:'}</span>
              <p className="font-bold text-slate-900 dark:text-white font-mono">
                {new Date(receiveSuccessDetails.date).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{isAr ? 'قيمة الحوالة الواردة الأساسية:' : 'Received Base Amount:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {receiveSuccessDetails.amount.toLocaleString()} {transferCurrency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{isAr ? 'رسوم المعالجة والاستلام (مجانية 0%):' : 'Receiving Fees (Free 0%):'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'مجانًا 0%' : 'Free 0%'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 text-emerald-600 font-black bg-emerald-500/10 p-2.5 rounded-xl">
              <span>{isAr ? 'القيمة الإجمالية المودعة:' : 'Total Credited Value:'}</span>
              <span className="font-mono text-base">{receiveSuccessDetails.localAmount.toLocaleString()} {selectedCountry.currencySymbol}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-99 cursor-pointer text-center"
          >
            {t.newTransferBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <span>{t.title}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>
        
        {/* Toggle between Send and Receive modes */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800 shrink-0">
          <button
            onClick={() => {
              setTransferMode('send');
              handleReset();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              transferMode === 'send'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isAr ? '📤 إرسال أموال صادرة' : '📤 Send Outgoing'}
          </button>
          <button
            onClick={() => {
              setTransferMode('receive');
              handleReset();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              transferMode === 'receive'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isAr ? '📥 استقبال أموال واردة' : '📥 Receive Incoming'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Render Transfer Forms */}
        {transferMode === 'send' ? (
          <form onSubmit={handleFormSubmit} className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Section 1: Recipient Identity */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" />
                <span>{t.recipientDetails}</span>
              </h3>

              {/* Selector: Custom vs Registered */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('custom');
                    handleReset();
                  }}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    recipientType === 'custom'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  {t.customRecipient}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('registered');
                    handleReset();
                  }}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    recipientType === 'registered'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  {t.registeredRecipient}
                </button>
              </div>

              {recipientType === 'registered' && (
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{t.registeredRecipient}</label>
                  <select
                    value={selectedUserRecipientId}
                    onChange={(e) => setSelectedUserRecipientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">{t.selectUserPlaceholder}</option>
                    {users
                      .filter(u => u.id !== currentUser?.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          👤 {u.name} ({u.email || u.phone})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    disabled={recipientType === 'registered'}
                    value={customRecipientName}
                    onChange={(e) => setCustomRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{t.emailOrPhone}</label>
                  <input
                    type="text"
                    required
                    disabled={recipientType === 'registered'}
                    value={customRecipientPhone}
                    onChange={(e) => setCustomRecipientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder={t.emailOrPhonePlaceholder}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Destination and Amount */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>{isAr ? 'الدولة والمبلغ' : 'Country & Amount'}</span>
              </h3>

              {/* Currency Choice */}
              <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <label className="block text-xs text-slate-400 font-semibold mb-1">
                  {isAr ? 'اختر عملة الإرسال والتحويل المعتمدة:' : 'Choose Authorized Sending Currency:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferCurrency('USD')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      transferCurrency === 'USD'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-xs'
                        : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-sm">💵</span>
                    <span>{isAr ? 'الدولار الأمريكي ($)' : 'US Dollar (USD)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferCurrency('EUR')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      transferCurrency === 'EUR'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent shadow-xs'
                        : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-sm">💶</span>
                    <span>{isAr ? 'اليورو الأوروبي (€)' : 'Euro (EUR)'}</span>
                  </button>
                </div>
              </div>

              {/* Receive Choice */}
              <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <label className="block text-xs text-slate-400 font-semibold mb-1">
                  {isAr ? 'طريقة الاستلام المفضلة للمستلم:' : 'Recipient Payout Currency Choice:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReceiveMethod('local')}
                    className={`flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      receiveMethod === 'local'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{isAr ? `بالعملة المحلية (${destCountry.currencyCode})` : `Local Currency (${destCountry.currencyCode})`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiveMethod('same')}
                    className={`flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      receiveMethod === 'same'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{isAr ? `بالعملة الصعبة نفسها (${transferCurrency})` : `Same Hard Currency (${transferCurrency})`}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{t.destinationCountry}</label>
                  <select
                    value={destCountryId}
                    onChange={(e) => setDestCountryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {isAr ? c.nameAr : c.nameEn} ({c.currencyCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{t.transferAmountUsd}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">
                      {transferCurrency === 'USD' ? '$' : '€'}
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={usdAmount}
                      onChange={(e) => setUsdAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Payout Channels */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-indigo-500" />
                <span>{isAr ? 'قنوات الصرف والشبكة' : 'Payout System'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{t.payoutNetwork}</label>
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {networks.map(net => (
                      <option key={net.id} value={net.id}>
                        🏦 {isAr ? net.nameAr : net.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{t.payoutDetails}</label>
                  <input
                    type="text"
                    required
                    value={walletDetails}
                    onChange={(e) => setWalletDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder={t.payoutDetailsPlaceholder}
                  />
                </div>
              </div>
            </div>

            {/* ADDED FIELD: Funding Source Selector */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 flex items-center gap-1.5 uppercase">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>{t.fundingSourceTitle}</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSendFundingSource('wallet')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sendFundingSource === 'wallet'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{t.fundingWallet}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSendFundingSource('card')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sendFundingSource === 'card'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t.fundingCard}</span>
                </button>
              </div>

              {/* Card Dropdown and entry */}
              {sendFundingSource === 'card' && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <label className="block text-xs text-slate-400 font-semibold">{t.cardSelectLabel}</label>
                  <select
                    value={sendSelectedCardId}
                    onChange={(e) => {
                      setSendSelectedCardId(e.target.value);
                      if (e.target.value !== 'custom') {
                        const card = linkedCards.find(c => c.id === e.target.value);
                        if (card) {
                          setSendCustomCardNo(card.cardNumber);
                          setSendCustomHolderName(card.cardholderName);
                        }
                      } else {
                        setSendCustomCardNo('');
                        setSendCustomHolderName('');
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    {linkedCards.map(c => (
                      <option key={c.id} value={c.id}>
                        💳 {c.bankName} ({c.cardNumber})
                      </option>
                    ))}
                    <option value="custom">➕ {t.customCardOption}</option>
                  </select>

                  {/* Manual Card Details Field */}
                  {(sendSelectedCardId === 'custom' || linkedCards.length === 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block">{t.manualCardNo}</span>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={sendCustomCardNo}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 16);
                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                            setSendCustomCardNo(formatted);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                          placeholder="4215 0000 0000 0000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block">{t.manualCardHolder}</span>
                        <input
                          type="text"
                          required
                          value={sendCustomHolderName}
                          onChange={(e) => setSendCustomHolderName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs font-bold"
                          placeholder="e.g. Ali Hassan"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* Wallet Balance Status Panel */}
            <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/20 rounded-xl text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">{t.balanceLabel}</span>
              <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-black">
                {cashBalance.toLocaleString()} {selectedCountry.currencySymbol}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-black text-xs rounded-xl hover:scale-[1.01] active:scale-99 shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{t.confirmBtn}</span>
            </button>
          </form>
        ) : (
          
          /* MODE RECEIVE: Incoming payment / requests form */
          <form onSubmit={handleReceiveSubmit} className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Section 1: Sender Identity */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" />
                <span>{isAr ? 'بيانات دافع الحوالة (المرسل)' : 'Sender Identity Details'}</span>
              </h3>

              {/* Selector: Custom vs Registered */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReceiveRecipientType('custom');
                    setReceiveSenderName('');
                    setReceiveSenderPhone('');
                  }}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    receiveRecipientType === 'custom'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  {isAr ? 'إدخال يدوي لبيانات المرسل' : 'Manual Sender Input'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReceiveRecipientType('registered');
                    setReceiveSenderName('');
                    setReceiveSenderPhone('');
                  }}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    receiveRecipientType === 'registered'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  {isAr ? 'اختيار من قائمة الأعضاء' : 'Select Registered Member'}
                </button>
              </div>

              {receiveRecipientType === 'registered' && (
                <div className="space-y-1">
                  <select
                    onChange={(e) => {
                      const u = users.find(user => user.id === e.target.value);
                      if (u) {
                        setReceiveSenderName(u.name);
                        setReceiveSenderPhone(u.email || u.phone);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    <option value="">{t.selectUserPlaceholder}</option>
                    {users
                      .filter(u => u.id !== currentUser?.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          👤 {u.name} ({u.email || u.phone})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{isAr ? 'اسم المرسل الكامل' : 'Sender Full Name'}</label>
                  <input
                    type="text"
                    required
                    disabled={receiveRecipientType === 'registered'}
                    value={receiveSenderName}
                    onChange={(e) => setReceiveSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    placeholder={isAr ? 'مثال: محمد علي كمال' : 'e.g. Robert Smith'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{isAr ? 'رقم الهاتف أو البريد الإلكتروني للمرسل' : 'Sender Email or Phone'}</label>
                  <input
                    type="text"
                    required
                    disabled={receiveRecipientType === 'registered'}
                    value={receiveSenderPhone}
                    onChange={(e) => setReceiveSenderPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder={isAr ? 'مثال: sender@example.com' : 'e.g. sender@mail.com'}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Currency and Amount to Request */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-indigo-500" />
                <span>{isAr ? 'المبلغ والعملة الأساسية' : 'Requested Payout Amount'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{isAr ? 'العملة الأساسية للتحويل' : 'Base Transfer Currency'}</label>
                  <select
                    value={transferCurrency}
                    onChange={(e) => setTransferCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-semibold">{isAr ? 'مبلغ الحوالة المطلوب:' : 'Amount to Receive:'}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">
                      {transferCurrency === 'USD' ? '$' : '€'}
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={receiveAmount}
                      onChange={(e) => setReceiveAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ADDED FIELD: Receiving Destination Selector */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 flex items-center gap-1.5 uppercase">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>{t.depositDestTitle}</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReceiveFundingSource('wallet')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    receiveFundingSource === 'wallet'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{t.fundingWallet}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiveFundingSource('card')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    receiveFundingSource === 'card'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t.fundingCard}</span>
                </button>
              </div>

              {/* Receiving Card dropdown and inputs */}
              {receiveFundingSource === 'card' && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <label className="block text-xs text-slate-400 font-semibold">{isAr ? 'اختر بطاقة مربوطة للإيداع المباشر عليها:' : 'Select a linked card to credit directly:'}</label>
                  <select
                    value={receiveSelectedCardId}
                    onChange={(e) => {
                      setReceiveSelectedCardId(e.target.value);
                      if (e.target.value !== 'custom') {
                        const card = linkedCards.find(c => c.id === e.target.value);
                        if (card) {
                          setReceiveCustomCardNo(card.cardNumber);
                          setReceiveCustomHolderName(card.cardholderName);
                        }
                      } else {
                        setReceiveCustomCardNo('');
                        setReceiveCustomHolderName('');
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    {linkedCards.map(c => (
                      <option key={c.id} value={c.id}>
                        💳 {c.bankName} ({c.cardNumber})
                      </option>
                    ))}
                    <option value="custom">➕ {t.customCardOption}</option>
                  </select>

                  {/* Manual entry card details for receive */}
                  {(receiveSelectedCardId === 'custom' || linkedCards.length === 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block">{t.manualCardNo}</span>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={receiveCustomCardNo}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 16);
                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                            setReceiveCustomCardNo(formatted);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                          placeholder="4215 0000 0000 0000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block">{t.manualCardHolder}</span>
                        <input
                          type="text"
                          required
                          value={receiveCustomHolderName}
                          onChange={(e) => setReceiveCustomHolderName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs font-bold"
                          placeholder="e.g. Ali Hassan"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-black text-xs rounded-xl hover:scale-[1.01] active:scale-99 shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>{isAr ? 'تأكيد واستلام أموال الحوالة فوراً 📥' : 'Confirm & Instantly Receive Funds 📥'}</span>
            </button>
          </form>
        )}

        {/* Real-time Exchange Calculator & Flow Visualizer */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Transfer visual flow */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'مسار تتبع الحوالة الفوري لأسعار البنك المركزي' : 'Live Central Bank Route Tracker'}</h3>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <div className="text-center space-y-1">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <p className="text-[10px] font-bold text-slate-400">{selectedCountry.currencyCode}</p>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {transferMode === 'send' 
                    ? (netAmountDeductedWithoutFee).toLocaleString() 
                    : convertTransferCurrencyToLocal(receiveAmount, transferCurrency, selectedCountry.id).toLocaleString()}
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-2">
                <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full mb-1 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  {isAr ? 'البنك المركزي 0%' : 'Central Bank 0%'}
                </span>
                <div className="w-full flex items-center">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-500/10 via-indigo-500 to-indigo-500/10 relative">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                  </div>
                </div>
                <p className="text-[10px] font-mono font-bold text-slate-400 mt-1">
                  {transferMode === 'send' ? usdAmount : receiveAmount} {transferCurrency}
                </p>
              </div>

              <div className="text-center space-y-1">
                <span className="text-2xl">{destCountry.flag}</span>
                <p className="text-[10px] font-bold text-slate-400">{destCountry.currencyCode}</p>
                <p className="text-xs font-extrabold text-emerald-500">
                  {transferMode === 'send' 
                    ? (recipientReceivedAmount).toLocaleString() 
                    : convertTransferCurrencyToLocal(receiveAmount, transferCurrency, destCountryId).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Calculator Statement */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'كشف أسعار البنك المركزي والعمولات 0%' : 'Central Bank Rates & 0% Fees Statement'}</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'قيمة الحوالة الكلية المحددة:' : 'Sent Transfer Amount:'}</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {transferMode === 'send' ? usdAmount.toLocaleString() : receiveAmount.toLocaleString()} {transferCurrency}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.feeLabel}</span>
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{isAr ? 'مجانًا 0%' : 'Free 0%'}</span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 space-y-2">
                <div className="flex justify-between font-semibold text-slate-500">
                  <span>{t.exchangeRateLabel}</span>
                  <p className="font-mono text-[10px] text-right">
                    1 {transferCurrency} = {convertTransferCurrencyToLocal(1, transferCurrency, selectedCountry.id).toLocaleString()} {selectedCountry.currencySymbol}
                  </p>
                </div>
                
                {receiveMethod === 'local' && (
                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>{isAr ? 'سعر صرف بلد المستلم المعتمد:' : 'Destination Exchange Rate:'}</span>
                    <p className="font-mono text-[10px] text-right">
                      1 {transferCurrency} = {convertTransferCurrencyToLocal(1, transferCurrency, destCountryId).toLocaleString()} {destCountry.currencySymbol}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 space-y-2">
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>{isAr ? 'العمولة المقتطعة للتحويل:' : 'Conversion Commission Fee:'}</span>
                  <span className="font-mono text-emerald-600">{isAr ? 'عمولة 0% (بدون رسوم)' : '0% Commission (Totally Free)'}</span>
                </div>

                <div className="flex justify-between text-sm text-rose-500 font-black bg-rose-50/30 dark:bg-rose-950/10 p-2 rounded-xl">
                  <span>{isAr ? 'إجمالي الخصم / الدفع الكلي للعملية:' : 'Total Deducted / Processed Value:'}</span>
                  <span className="font-mono">
                    {transferMode === 'send' 
                      ? localDeduction.toLocaleString() 
                      : convertTransferCurrencyToLocal(receiveAmount, transferCurrency, selectedCountry.id).toLocaleString()} {selectedCountry.currencySymbol}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50/30 dark:bg-emerald-950/10 p-2 rounded-xl">
                  <span>{isAr ? 'المبلغ الصافي للاستلام:' : 'Recipient Will Receive:'}</span>
                  <span className="font-mono">
                    {transferMode === 'send' 
                      ? recipientReceivedAmount.toLocaleString() 
                      : convertTransferCurrencyToLocal(receiveAmount, transferCurrency, selectedCountry.id).toLocaleString()} {transferMode === 'send' ? recipientReceivedCurrency : selectedCountry.currencyCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Assurances */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{isAr ? 'نظام تحويل مشفر بالكامل' : 'End-to-End Cryptographic Escrow'}</h4>
              <p className="text-[10px] text-slate-400 leading-normal">{t.securityBadge}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
