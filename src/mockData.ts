import { Platform, Transaction, WalletOption, RegisteredUser, CountryConfig } from './types';

export const INITIAL_PLATFORMS: Platform[] = [
  {
    id: 'tiktok_rewards',
    name: 'TikTok Rewards',
    nameAr: 'مكافآت تيك توك',
    icon: 'Smartphone',
    connected: true,
    points: 4500,
    rate: 1000, // 1 point = 1000 IQD
    status: 'connected',
    lastSynced: 'منذ ساعتين'
  },
  {
    id: 'google_rewards',
    name: 'Google Opinion Rewards',
    nameAr: 'مكافآت جوجل للآراء',
    icon: 'Globe',
    connected: true,
    points: 1250,
    rate: 1000, // 1 point = 1000 IQD
    status: 'connected',
    lastSynced: 'منذ يوم'
  },
  {
    id: 'swagbucks',
    name: 'Swagbucks Pro',
    nameAr: 'سواجبكس برو',
    icon: 'ShoppingBag',
    connected: false,
    points: 0,
    rate: 1000, // 1 point = 1000 IQD
    status: 'connected',
    lastSynced: 'لم يتم المزامنة بعد'
  },
  {
    id: 'rewardy',
    name: 'Rewardy Stream',
    nameAr: 'منصة ريواردي للمشاهدة',
    icon: 'Tv',
    connected: true,
    points: 8200,
    rate: 1000, // 1 point = 1000 IQD
    status: 'connected',
    lastSynced: 'منذ ٣ ساعات'
  },
  {
    id: 'cash_games',
    name: 'Cash.ai Play & Earn',
    nameAr: 'ألعاب كاش.ai المباشرة 🎮',
    icon: 'Gamepad2',
    connected: true,
    points: 150,
    rate: 1000,
    status: 'connected',
    lastSynced: 'الآن'
  }
];

export const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'zain_cash',
    nameAr: 'زين كاش (Zain Cash) - العراق',
    nameEn: 'Zain Cash (Iraq)',
    icon: 'Phone',
    color: 'from-red-500 to-red-600',
    fields: [
      {
        key: 'phone',
        labelAr: 'رقم محفظة زين كاش (11 رقم)',
        labelEn: 'Zain Cash Wallet Number (11 digits)',
        placeholder: '07XXXXXXXXX',
        type: 'tel'
      },
      {
        key: 'name',
        labelAr: 'الاسم الكامل المسجل للمحفظة',
        labelEn: 'Full Registered Name on Wallet',
        placeholder: 'علي محمد حسن...',
        type: 'text'
      }
    ]
  },
  {
    id: 'qi_card',
    nameAr: 'كي كارد (Qi Card) - العراق',
    nameEn: 'Qi Card (Iraq)',
    icon: 'Zap',
    color: 'from-indigo-600 to-indigo-700',
    fields: [
      {
        key: 'card_number',
        labelAr: 'رقم بطاقة كي كارد (16 رقم)',
        labelEn: 'Qi Card Number (16 digits)',
        placeholder: '4215XXXXXXXXXXXXXXXX',
        type: 'text'
      },
      {
        key: 'name',
        labelAr: 'اسم صاحب البطاقة الكامل',
        labelEn: 'Cardholder Full Name',
        placeholder: 'حسين عباس كريم...',
        type: 'text'
      }
    ]
  },
  {
    id: 'vodafone_cash',
    nameAr: 'فودافون كاش (Vodafone Cash) - مصر',
    nameEn: 'Vodafone Cash (Egypt)',
    icon: 'Phone',
    color: 'from-red-600 to-red-700',
    fields: [
      {
        key: 'phone',
        labelAr: 'رقم محفظة فودافون كاش (11 رقم)',
        labelEn: 'Vodafone Cash Wallet Number (11 digits)',
        placeholder: '010XXXXXXXX',
        type: 'tel'
      },
      {
        key: 'name',
        labelAr: 'اسم صاحب الحساب بالكامل',
        labelEn: 'Account Holder Full Name',
        placeholder: 'أحمد محمود علي...',
        type: 'text'
      }
    ]
  },
  {
    id: 'stc_pay',
    nameAr: 'إس تي سي باي (STC Pay) - السعودية',
    nameEn: 'STC Pay (Saudi Arabia)',
    icon: 'Smartphone',
    color: 'from-purple-600 to-purple-700',
    fields: [
      {
        key: 'phone',
        labelAr: 'رقم الجوال المسجل في STC Pay',
        labelEn: 'Registered Mobile Number',
        placeholder: '05XXXXXXXX',
        type: 'tel'
      }
    ]
  },
  {
    id: 'usdt_trc20',
    nameAr: 'تتر رقمي USDT (TRC-20) - عالمي',
    nameEn: 'Tether USDT (TRC-20) - Global',
    icon: 'Zap',
    color: 'from-emerald-500 to-teal-600',
    fields: [
      {
        key: 'address',
        labelAr: 'عنوان محفظة USDT (شبكة TRC20)',
        labelEn: 'USDT TRC20 Wallet Address',
        placeholder: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        type: 'text'
      }
    ]
  },
  {
    id: 'asiapay',
    nameAr: 'آسيا باي (AsiaPay) - العراق',
    nameEn: 'AsiaPay (Iraq)',
    icon: 'PhoneCall',
    color: 'from-blue-600 to-sky-500',
    fields: [
      {
        key: 'phone',
        labelAr: 'رقم محفظة آسيا باي',
        labelEn: 'AsiaPay Wallet Number',
        placeholder: '077XXXXXXXX',
        type: 'tel'
      },
      {
        key: 'name',
        labelAr: 'الاسم الكامل المسجل',
        labelEn: 'Registered Full Name',
        placeholder: 'زينب أحمد علوان...',
        type: 'text'
      }
    ]
  },
  {
    id: 'fastpay',
    nameAr: 'فاست باي (FastPay) - العراق',
    nameEn: 'FastPay (Iraq)',
    icon: 'Smartphone',
    color: 'from-yellow-500 to-amber-600',
    fields: [
      {
        key: 'phone',
        labelAr: 'رقم حساب فاست باي',
        labelEn: 'FastPay Account Number',
        placeholder: '07XXXXXXXXX',
        type: 'tel'
      }
    ]
  },
  {
    id: 'paypal',
    nameAr: 'بايبال (PayPal) - عالمي',
    nameEn: 'PayPal Wallet - Global',
    icon: 'DollarSign',
    color: 'from-blue-700 to-indigo-800',
    fields: [
      {
        key: 'email',
        labelAr: 'البريد الإلكتروني لحساب بايبال',
        labelEn: 'PayPal Email Address',
        placeholder: 'example@domain.com',
        type: 'email'
      }
    ]
  },
  {
    id: 'payeer',
    nameAr: 'باير (Payeer) - عالمي',
    nameEn: 'Payeer Wallet - Global',
    icon: 'Wallet',
    color: 'from-slate-600 to-slate-800',
    fields: [
      {
        key: 'account',
        labelAr: 'رقم حساب باير الخاص بك (PXXXXXXXX)',
        labelEn: 'Payeer Account Number',
        placeholder: 'P10000000',
        type: 'text'
      }
    ]
  },
  {
    id: 'bank_transfer',
    nameAr: 'حوالة بنكية دولية ومحلية',
    nameEn: 'International / Local Bank Wire',
    icon: 'Landmark',
    color: 'from-slate-700 to-slate-900',
    fields: [
      {
        key: 'bank_name',
        labelAr: 'اسم البنك الكامل والمدينة',
        labelEn: 'Full Bank Name & City',
        placeholder: 'مثال: مصرف الرافدين، البنك الأهلي المصري، الراجحي...',
        type: 'text'
      },
      {
        key: 'iban',
        labelAr: 'رقم الآيبان الدولي (IBAN) أو الحساب',
        labelEn: 'International Account / IBAN',
        placeholder: 'IBAN / Account Number',
        type: 'text'
      },
      {
        key: 'recipient',
        labelAr: 'اسم المستلم الرباعي بالكامل',
        labelEn: 'Beneficiary Full Name',
        placeholder: 'الاسم الكامل كما في الهوية الشخصية',
        type: 'text'
      }
    ]
  },
  {
    id: 'bank_card',
    nameAr: 'بطاقة بنكية (فيزا / ماستركارد / مدى / ميزة / كي)',
    nameEn: 'Bank Card (Visa / Mastercard / Local)',
    icon: 'CreditCard',
    color: 'from-indigo-600 to-blue-600',
    fields: [
      {
        key: 'card_number',
        labelAr: 'رقم البطاقة البنكية (16 رقم)',
        labelEn: 'Bank Card Number (16 digits)',
        placeholder: '4000 1234 5678 9010',
        type: 'text'
      },
      {
        key: 'card_holder',
        labelAr: 'اسم صاحب البطاقة الكامل (كما في البطاقة)',
        labelEn: 'Cardholder Full Name',
        placeholder: 'John Doe / الاسم الكامل',
        type: 'text'
      },
      {
        key: 'expiry',
        labelAr: 'تاريخ انتهاء الصلاحية (MM/YY)',
        labelEn: 'Expiry Date (MM/YY)',
        placeholder: '12/29',
        type: 'text'
      },
      {
        key: 'cvv',
        labelAr: 'الرمز السري الخلفي (CVV)',
        labelEn: 'Security Code (CVV)',
        placeholder: '123',
        type: 'text'
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001',
    type: 'sync',
    platformId: 'tiktok_rewards',
    platformName: 'TikTok Rewards',
    platformNameAr: 'مكافآت تيك توك',
    points: 1200,
    amount: 0,
    currency: 'IQD',
    status: 'success',
    date: '2026-07-19T09:30:00Z'
  },
  {
    id: 'tx_002',
    type: 'convert',
    platformId: 'google_rewards',
    platformName: 'Google Opinion Rewards',
    platformNameAr: 'مكافآت جوجل للآراء',
    points: 1000,
    amount: 1000000, // 1000 points * 1000 IQD = 1,000,000 IQD
    currency: 'IQD',
    status: 'success',
    date: '2026-07-18T14:15:00Z'
  },
  {
    id: 'tx_003',
    type: 'withdraw',
    amount: 250000, // 250,000 IQD
    currency: 'IQD',
    status: 'success',
    walletType: 'zain_cash',
    walletDetails: '07712345678',
    date: '2026-07-17T18:45:00Z'
  },
  {
    id: 'tx_004',
    type: 'withdraw',
    amount: 500000, // 500,000 IQD
    currency: 'IQD',
    status: 'pending',
    walletType: 'qi_card',
    walletDetails: '4215XXXXXXXX1234',
    date: '2026-07-19T10:00:00Z'
  }
];

export const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'usr_101',
    name: 'أحمد جاسم العراقي',
    phone: 'ahmed.jassim@example.com',
    email: 'ahmed.jassim@example.com',
    appUrl: 'https://ahmed-rewards.com',
    registeredAt: '2026-07-15T09:00:00Z',
    earnedForOwner: 500000,
    walletType: 'App Integration',
    status: 'active'
  },
  {
    id: 'usr_102',
    name: 'مصطفى كرار البغدادي',
    phone: 'mustafa.karrar@example.com',
    email: 'mustafa.karrar@example.com',
    appUrl: 'https://karrar-points.iq',
    registeredAt: '2026-07-16T11:30:00Z',
    earnedForOwner: 500000,
    walletType: 'App Integration',
    status: 'active'
  },
  {
    id: 'usr_103',
    name: 'سارة ميثم الياسري',
    phone: 'sara.yasiri@example.com',
    email: 'sara.yasiri@example.com',
    appUrl: 'https://yasiri-clicks.net',
    registeredAt: '2026-07-17T15:20:00Z',
    earnedForOwner: 500000,
    walletType: 'App Integration',
    status: 'active'
  },
  {
    id: 'usr_104',
    name: 'علي حسين الجبوري',
    phone: 'ali.jabouri@example.com',
    email: 'ali.jabouri@example.com',
    appUrl: 'https://jabouri-bonus.org',
    registeredAt: '2026-07-18T10:05:00Z',
    earnedForOwner: 500000,
    walletType: 'App Integration',
    status: 'active'
  },
  {
    id: 'usr_105',
    name: 'فاطمة حيدر الخفاجي',
    phone: 'fatima.khofaji@example.com',
    email: 'fatima.khofaji@example.com',
    appUrl: 'https://khofaji-app.com',
    registeredAt: '2026-07-19T08:15:00Z',
    earnedForOwner: 500000,
    walletType: 'App Integration',
    status: 'active'
  }
];

export const COUNTRIES: CountryConfig[] = [
  {
    id: 'IQ',
    nameAr: 'العراق',
    nameEn: 'Iraq',
    currencyCode: 'IQD',
    currencySymbol: 'د.ع',
    rate: 1000,
    flag: '🇮🇶',
    provinces: [
      { id: 'IQ-BG', nameAr: 'بغداد', nameEn: 'Baghdad' },
      { id: 'IQ-NV', nameAr: 'نينوى', nameEn: 'Nineveh' },
      { id: 'IQ-BA', nameAr: 'البصرة', nameEn: 'Basra' },
      { id: 'IQ-SU', nameAr: 'السليمانية', nameEn: 'Sulaymaniyah' },
      { id: 'IQ-ER', nameAr: 'أربيل', nameEn: 'Erbil' },
      { id: 'IQ-KI', nameAr: 'كركوك', nameEn: 'Kirkuk' },
      { id: 'IQ-NJ', nameAr: 'النجف', nameEn: 'Najaf' },
      { id: 'IQ-KB', nameAr: 'كربلاء', nameEn: 'Karbala' },
      { id: 'IQ-DQ', nameAr: 'ذي قار', nameEn: 'Dhi Qar' },
      { id: 'IQ-BB', nameAr: 'بابل', nameEn: 'Babil' },
      { id: 'IQ-AN', nameAr: 'الأنبار', nameEn: 'Anbar' },
      { id: 'IQ-DI', nameAr: 'ديالى', nameEn: 'Diyala' },
      { id: 'IQ-MU', nameAr: 'المثنى', nameEn: 'Muthanna' },
      { id: 'IQ-QA', nameAr: 'القادسية', nameEn: 'Qadisiyah' },
      { id: 'IQ-MY', nameAr: 'ميسان', nameEn: 'Maysan' },
      { id: 'IQ-WA', nameAr: 'واسط', nameEn: 'Wasit' },
      { id: 'IQ-SD', nameAr: 'صلاح الدين', nameEn: 'Salah Al-Din' },
      { id: 'IQ-DU', nameAr: 'دهوك', nameEn: 'Duhok' },
      { id: 'IQ-HA', nameAr: 'حلبجة', nameEn: 'Halabja' }
    ]
  },
  {
    id: 'EG',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    currencyCode: 'EGP',
    currencySymbol: 'ج.م',
    rate: 35,
    flag: '🇪🇬',
    provinces: [
      { id: 'EG-C', nameAr: 'القاهرة', nameEn: 'Cairo' },
      { id: 'EG-G', nameAr: 'الجيزة', nameEn: 'Giza' },
      { id: 'EG-ALX', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
      { id: 'EG-QAL', nameAr: 'القليوبية', nameEn: 'Qalyubia' },
      { id: 'EG-SHR', nameAr: 'الشرقية', nameEn: 'Sharqia' },
      { id: 'EG-GHR', nameAr: 'الغربية', nameEn: 'Gharbia' },
      { id: 'EG-MNF', nameAr: 'المنوفية', nameEn: 'Monufia' },
      { id: 'EG-BHR', nameAr: 'البحيرة', nameEn: 'Beheira' },
      { id: 'EG-DAM', nameAr: 'دمياط', nameEn: 'Damietta' },
      { id: 'EG-DKH', nameAr: 'الدقهلية', nameEn: 'Dakahlia' },
      { id: 'EG-KFS', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
      { id: 'EG-PTS', nameAr: 'بورسعيد', nameEn: 'Port Said' },
      { id: 'EG-ISM', nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
      { id: 'EG-SUZ', nameAr: 'السويس', nameEn: 'Suez' },
      { id: 'EG-SIN-N', nameAr: 'شمال سيناء', nameEn: 'North Sinai' },
      { id: 'EG-SIN-S', nameAr: 'جنوب سيناء', nameEn: 'South Sinai' },
      { id: 'EG-FYM', nameAr: 'الفيوم', nameEn: 'Faiyum' },
      { id: 'EG-BNS', nameAr: 'بني سويف', nameEn: 'Beni Suef' },
      { id: 'EG-MIN', nameAr: 'المنيا', nameEn: 'Minya' },
      { id: 'EG-ASY', nameAr: 'أسيوط', nameEn: 'Asyut' },
      { id: 'EG-SHG', nameAr: 'سوهاج', nameEn: 'Sohag' },
      { id: 'EG-QNA', nameAr: 'قنا', nameEn: 'Qena' },
      { id: 'EG-LUX', nameAr: 'الأقصر', nameEn: 'Luxor' },
      { id: 'EG-ASN', nameAr: 'أسوان', nameEn: 'Aswan' },
      { id: 'EG-RED', nameAr: 'البحر الأحمر', nameEn: 'Red Sea' },
      { id: 'EG-WAD', nameAr: 'الوادي الجديد', nameEn: 'New Valley' },
      { id: 'EG-MAT', nameAr: 'مطروح', nameEn: 'Matrouh' }
    ]
  },
  {
    id: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
    rate: 2.5,
    flag: '🇸🇦',
    provinces: [
      { id: 'SA-RUY', nameAr: 'الرياض', nameEn: 'Riyadh' },
      { id: 'SA-MCK', nameAr: 'مكة المكرمة', nameEn: 'Makkah' },
      { id: 'SA-MDN', nameAr: 'المدينة المنورة', nameEn: 'Madinah' },
      { id: 'SA-EP', nameAr: 'المنطقة الشرقية', nameEn: 'Eastern Province' },
      { id: 'SA-QAS', nameAr: 'القصيم', nameEn: 'Qassim' },
      { id: 'SA-ASR', nameAr: 'عسير', nameEn: 'Asir' },
      { id: 'SA-TAB', nameAr: 'تبوك', nameEn: 'Tabuk' },
      { id: 'SA-HIL', nameAr: 'حائل', nameEn: 'Hail' },
      { id: 'SA-NB', nameAr: 'الحدود الشمالية', nameEn: 'Northern Borders' },
      { id: 'SA-JAZ', nameAr: 'جازان', nameEn: 'Jazan' },
      { id: 'SA-NAJ', nameAr: 'نجران', nameEn: 'Najran' },
      { id: 'SA-BAH', nameAr: 'الباحة', nameEn: 'Al-Bahah' },
      { id: 'SA-JUF', nameAr: 'الجوف', nameEn: 'Al-Jawf' }
    ]
  },
  {
    id: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    rate: 2.5,
    flag: '🇦🇪',
    provinces: [
      { id: 'AE-AD', nameAr: 'أبوظبي', nameEn: 'Abu Dhabi' },
      { id: 'AE-DU', nameAr: 'دبي', nameEn: 'Dubai' },
      { id: 'AE-SH', nameAr: 'الشارقة', nameEn: 'Sharjah' },
      { id: 'AE-AJ', nameAr: 'عجمان', nameEn: 'Ajman' },
      { id: 'AE-UQ', nameAr: 'أم القيوين', nameEn: 'Umm Al Quwain' },
      { id: 'AE-RK', nameAr: 'رأس الخيمة', nameEn: 'Ras Al Khaimah' },
      { id: 'AE-FU', nameAr: 'الفجيرة', nameEn: 'Fujairah' }
    ]
  },
  {
    id: 'JO',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    currencyCode: 'JOD',
    currencySymbol: 'د.أ',
    rate: 0.5,
    flag: '🇯🇴',
    provinces: [
      { id: 'JO-AM', nameAr: 'عمان', nameEn: 'Amman' },
      { id: 'JO-IR', nameAr: 'إربد', nameEn: 'Irbid' },
      { id: 'JO-ZA', nameAr: 'الزرقاء', nameEn: 'Zarqa' },
      { id: 'JO-BA', nameAr: 'البلقاء', nameEn: 'Balqa' },
      { id: 'JO-MA', nameAr: 'المفرق', nameEn: 'Mafraq' },
      { id: 'JO-KA', nameAr: 'الكرك', nameEn: 'Karak' },
      { id: 'JO-MN', nameAr: 'معان', nameEn: 'Ma\'an' },
      { id: 'JO-TA', nameAr: 'الطفيلة', nameEn: 'Tafilah' },
      { id: 'JO-MD', nameAr: 'مادبا', nameEn: 'Madaba' },
      { id: 'JO-JE', nameAr: 'جرش', nameEn: 'Jerash' },
      { id: 'JO-AJ', nameAr: 'عجلون', nameEn: 'Ajloun' },
      { id: 'JO-AQ', nameAr: 'العقبة', nameEn: 'Aqaba' }
    ]
  },
  {
    id: 'TR',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    currencyCode: 'TRY',
    currencySymbol: 'ل.ت',
    rate: 20,
    flag: '🇹🇷',
    provinces: [
      { id: 'TR-IST', nameAr: 'إسطنبول', nameEn: 'Istanbul' },
      { id: 'TR-ANK', nameAr: 'أنقرة', nameEn: 'Ankara' },
      { id: 'TR-IZM', nameAr: 'إزمير', nameEn: 'Izmir' },
      { id: 'TR-BUR', nameAr: 'بورصة', nameEn: 'Bursa' },
      { id: 'TR-ANT', nameAr: 'أنطاليا', nameEn: 'Antalya' },
      { id: 'TR-ADA', nameAr: 'أضنة', nameEn: 'Adana' },
      { id: 'TR-KON', nameAr: 'قونية', nameEn: 'Konya' },
      { id: 'TR-GAZ', nameAr: 'غازي عنتاب', nameEn: 'Gaziantep' },
      { id: 'TR-SAN', nameAr: 'شانلي أورفة', nameEn: 'Sanliurfa' },
      { id: 'TR-MER', nameAr: 'مرسين', nameEn: 'Mersin' },
      { id: 'TR-DIY', nameAr: 'ديار بكر', nameEn: 'Diyarbakir' }
    ]
  },
  {
    id: 'US',
    nameAr: 'الولايات المتحدة',
    nameEn: 'United States',
    currencyCode: 'USD',
    currencySymbol: '$',
    rate: 0.65,
    flag: '🇺🇸',
    provinces: [
      { id: 'US-CA', nameAr: 'كاليفورنيا', nameEn: 'California' },
      { id: 'US-TX', nameAr: 'تكساس', nameEn: 'Texas' },
      { id: 'US-FL', nameAr: 'فلوريدا', nameEn: 'Florida' },
      { id: 'US-NY', nameAr: 'نيويورك', nameEn: 'New York' },
      { id: 'US-PA', nameAr: 'بنسيلفانيا', nameEn: 'Pennsylvania' },
      { id: 'US-IL', nameAr: 'إلينوي', nameEn: 'Illinois' },
      { id: 'US-OH', nameAr: 'أوهايو', nameEn: 'Ohio' },
      { id: 'US-GA', nameAr: 'جورجيا', nameEn: 'Georgia' },
      { id: 'US-NC', nameAr: 'كارولاينا الشمالية', nameEn: 'North Carolina' },
      { id: 'US-MI', nameAr: 'ميشيغان', nameEn: 'Michigan' }
    ]
  },
  {
    id: 'EU',
    nameAr: 'الاتحاد الأوروبي',
    nameEn: 'European Union',
    currencyCode: 'EUR',
    currencySymbol: '€',
    rate: 0.60,
    flag: '🇪🇺',
    provinces: [
      { id: 'EU-DE', nameAr: 'ألمانيا', nameEn: 'Germany' },
      { id: 'EU-FR', nameAr: 'فرنسا', nameEn: 'France' },
      { id: 'EU-IT', nameAr: 'إيطاليا', nameEn: 'Italy' },
      { id: 'EU-ES', nameAr: 'إسبانيا', nameEn: 'Spain' },
      { id: 'EU-NL', nameAr: 'هولندا', nameEn: 'Netherlands' },
      { id: 'EU-BE', nameAr: 'بلجيكا', nameEn: 'Belgium' },
      { id: 'EU-SE', nameAr: 'السويد', nameEn: 'Sweden' },
      { id: 'EU-AT', nameAr: 'النمسا', nameEn: 'Austria' },
      { id: 'EU-IE', nameAr: 'أيرلندا', nameEn: 'Ireland' },
      { id: 'EU-PL', nameAr: 'بولندا', nameEn: 'Poland' }
    ]
  },
  {
    id: 'GB',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    currencyCode: 'GBP',
    currencySymbol: '£',
    rate: 0.50,
    flag: '🇬🇧',
    provinces: [
      { id: 'GB-ENG', nameAr: 'إنجلترا', nameEn: 'England' },
      { id: 'GB-SCT', nameAr: 'اسكتلندا', nameEn: 'Scotland' },
      { id: 'GB-WLS', nameAr: 'ويلز', nameEn: 'Wales' },
      { id: 'GB-NIR', nameAr: 'أيرلندا الشمالية', nameEn: 'Northern Ireland' }
    ]
  },
  {
    id: 'LY',
    nameAr: 'ليبيا',
    nameEn: 'Libya',
    currencyCode: 'LYD',
    currencySymbol: 'د.ل',
    rate: 3,
    flag: '🇱🇾',
    provinces: [
      { id: 'LY-TR', nameAr: 'طرابلس', nameEn: 'Tripoli' },
      { id: 'LY-BE', nameAr: 'بنغازي', nameEn: 'Benghazi' },
      { id: 'LY-MI', nameAr: 'مصراتة', nameEn: 'Misrata' },
      { id: 'LY-TA', nameAr: 'ترهونة', nameEn: 'Tarhuna' },
      { id: 'LY-KH', nameAr: 'الخمس', nameEn: 'Al Khums' },
      { id: 'LY-ZA', nameAr: 'الزاوية', nameEn: 'Zawiya' },
      { id: 'LY-ZL', nameAr: 'زليتن', nameEn: 'Zliten' },
      { id: 'LY-SE', nameAr: 'سبها', nameEn: 'Sebha' },
      { id: 'LY-SI', nameAr: 'سرت', nameEn: 'Sirte' }
    ]
  },
  {
    id: 'MA',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    currencyCode: 'MAD',
    currencySymbol: 'د.م',
    rate: 6.5,
    flag: '🇲🇦',
    provinces: [
      { id: 'MA-CAS', nameAr: 'الدار البيضاء', nameEn: 'Casablanca' },
      { id: 'MA-RAB', nameAr: 'الرباط', nameEn: 'Rabat' },
      { id: 'MA-FES', nameAr: 'فاس', nameEn: 'Fes' },
      { id: 'MA-MAR', nameAr: 'مراكش', nameEn: 'Marrakesh' },
      { id: 'MA-TAN', nameAr: 'طنجة', nameEn: 'Tangier' },
      { id: 'MA-AGA', nameAr: 'أغادير', nameEn: 'Agadir' },
      { id: 'MA-MEK', nameAr: 'مكناس', nameEn: 'Meknes' },
      { id: 'MA-OUJ', nameAr: 'وجدة', nameEn: 'Oujda' },
      { id: 'MA-KEN', nameAr: 'القنيطرة', nameEn: 'Kenitra' },
      { id: 'MA-TET', nameAr: 'تطوان', nameEn: 'Tetouan' }
    ]
  },
  {
    id: 'DZ',
    nameAr: 'الجزائر',
    nameEn: 'Algeria',
    currencyCode: 'DZD',
    currencySymbol: 'د.ج',
    rate: 90,
    flag: '🇩🇿',
    provinces: [
      { id: 'DZ-ALG', nameAr: 'الجزائر العاصمة', nameEn: 'Algiers' },
      { id: 'DZ-ORN', nameAr: 'وهران', nameEn: 'Oran' },
      { id: 'DZ-CNS', nameAr: 'قسنطينة', nameEn: 'Constantine' },
      { id: 'DZ-ANN', nameAr: 'عنابة', nameEn: 'Annaba' },
      { id: 'DZ-BLI', nameAr: 'البليدة', nameEn: 'Blida' },
      { id: 'DZ-BAT', nameAr: 'باتنة', nameEn: 'Batna' },
      { id: 'DZ-SET', nameAr: 'سطيف', nameEn: 'Sétif' },
      { id: 'DZ-CHL', nameAr: 'الشلف', nameEn: 'Chlef' },
      { id: 'DZ-DJE', nameAr: 'الجلفة', nameEn: 'Djelfa' },
      { id: 'DZ-BIS', nameAr: 'بسكرة', nameEn: 'Biskra' }
    ]
  },
  {
    id: 'TN',
    nameAr: 'تونس',
    nameEn: 'Tunisia',
    currencyCode: 'TND',
    currencySymbol: 'د.ت',
    rate: 2,
    flag: '🇹🇳',
    provinces: [
      { id: 'TN-TUN', nameAr: 'تونس العاصمة', nameEn: 'Tunis' },
      { id: 'TN-SFA', nameAr: 'صفاقس', nameEn: 'Sfax' },
      { id: 'TN-SOU', nameAr: 'سوسة', nameEn: 'Sousse' },
      { id: 'TN-KAI', nameAr: 'القيروان', nameEn: 'Kairouan' },
      { id: 'TN-BIZ', nameAr: 'بنزرت', nameEn: 'Bizerte' },
      { id: 'TN-GAB', nameAr: 'قابس', nameEn: 'Gabes' },
      { id: 'TN-ARI', nameAr: 'أريانة', nameEn: 'Ariana' },
      { id: 'TN-BEN', nameAr: 'بن عروس', nameEn: 'Ben Arous' },
      { id: 'TN-MON', nameAr: 'المنستير', nameEn: 'Monastir' },
      { id: 'TN-NAB', nameAr: 'نابل', nameEn: 'Nabeul' }
    ]
  },
  {
    id: 'KW',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    currencyCode: 'KWD',
    currencySymbol: 'د.ك',
    rate: 0.2,
    flag: '🇰🇼',
    provinces: [
      { id: 'KW-ASI', nameAr: 'العاصمة', nameEn: 'Al Asimah' },
      { id: 'KW-HAW', nameAr: 'حولي', nameEn: 'Hawalli' },
      { id: 'KW-FAR', nameAr: 'الفروانية', nameEn: 'Farwaniya' },
      { id: 'KW-AHM', nameAr: 'الأحمدي', nameEn: 'Ahmadi' },
      { id: 'KW-JAH', nameAr: 'الجهراء', nameEn: 'Jahra' },
      { id: 'KW-MUB', nameAr: 'مبارك الكبير', nameEn: 'Mubarak Al-Kabeer' }
    ]
  },
  {
    id: 'QA',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    currencyCode: 'QAR',
    currencySymbol: 'ر.ق',
    rate: 2.4,
    flag: '🇶🇦',
    provinces: [
      { id: 'QA-DOH', nameAr: 'الدوحة', nameEn: 'Doha' },
      { id: 'QA-RAY', nameAr: 'الريان', nameEn: 'Al Rayyan' },
      { id: 'QA-KHO', nameAr: 'الخور', nameEn: 'Al Khor' },
      { id: 'QA-WAK', nameAr: 'الوكرة', nameEn: 'Al Wakrah' },
      { id: 'QA-UMM', nameAr: 'أم صلال', nameEn: 'Umm Salal' },
      { id: 'QA-DAA', nameAr: 'الضعاين', nameEn: 'Al Daayen' },
      { id: 'QA-SHA', nameAr: 'الشمال', nameEn: 'Madinat ash Shamal' },
      { id: 'QA-SHE', nameAr: 'الشيحانية', nameEn: 'Al Sheehaniya' }
    ]
  },
  {
    id: 'OM',
    nameAr: 'عمان',
    nameEn: 'Oman',
    currencyCode: 'OMR',
    currencySymbol: 'ر.ع',
    rate: 0.25,
    flag: '🇴🇲',
    provinces: [
      { id: 'OM-MUS', nameAr: 'مسقط', nameEn: 'Muscat' },
      { id: 'OM-DHO', nameAr: 'ظفار', nameEn: 'Dhofar' },
      { id: 'OM-MSN', nameAr: 'مسندم', nameEn: 'Musandam' },
      { id: 'OM-BUR', nameAr: 'البريمي', nameEn: 'Al Buraimi' },
      { id: 'OM-DAK', nameAr: 'الداخلية', nameEn: 'Ad Dakhiliyah' },
      { id: 'OM-BAT', nameAr: 'الباطنة', nameEn: 'Al Batinah' },
      { id: 'OM-SHA', nameAr: 'الشرقية', nameEn: 'Ash Sharqiyah' },
      { id: 'OM-DHA', nameAr: 'الظاهرة', nameEn: 'Ad Dhahirah' },
      { id: 'OM-WUS', nameAr: 'الوسطى', nameEn: 'Al Wusta' }
    ]
  },
  {
    id: 'BH',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    currencyCode: 'BHD',
    currencySymbol: 'د.ب',
    rate: 0.25,
    flag: '🇧🇭',
    provinces: [
      { id: 'BH-CAP', nameAr: 'العاصمة', nameEn: 'Capital' },
      { id: 'BH-MUH', nameAr: 'المحرق', nameEn: 'Muharraq' },
      { id: 'BH-NOR', nameAr: 'المنطقة الشمالية', nameEn: 'Northern' },
      { id: 'BH-SOU', nameAr: 'المنطقة الجنوبية', nameEn: 'Southern' }
    ]
  },
  {
    id: 'YE',
    nameAr: 'اليمن',
    nameEn: 'Yemen',
    currencyCode: 'YER',
    currencySymbol: 'ر.ي',
    rate: 160,
    flag: '🇾🇪',
    provinces: [
      { id: 'YE-SAN', nameAr: 'صنعاء', nameEn: 'Sana\'a' },
      { id: 'YE-ADE', nameAr: 'عدن', nameEn: 'Aden' },
      { id: 'YE-TAI', nameAr: 'تعز', nameEn: 'Taiz' },
      { id: 'YE-HUD', nameAr: 'الحديدة', nameEn: 'Al Hudaydah' },
      { id: 'YE-HAD', nameAr: 'حضرموت', nameEn: 'Hadramaut' },
      { id: 'YE-IBB', nameAr: 'إب', nameEn: 'Ibb' },
      { id: 'YE-DHA', nameAr: 'ذمار', nameEn: 'Dhamar' },
      { id: 'YE-ABY', nameAr: 'أبين', nameEn: 'Abyan' },
      { id: 'YE-MAH', nameAr: 'المهرة', nameEn: 'Al Mahrah' },
      { id: 'YE-SHA', nameAr: 'شبوة', nameEn: 'Shabwah' }
    ]
  },
  {
    id: 'CN',
    nameAr: 'الصين',
    nameEn: 'China',
    currencyCode: 'CNY',
    currencySymbol: '¥',
    rate: 4.7,
    flag: '🇨🇳',
    provinces: [
      { id: 'CN-GD', nameAr: 'غوانغدونغ', nameEn: 'Guangdong' },
      { id: 'CN-BJ', nameAr: 'بكين', nameEn: 'Beijing' },
      { id: 'CN-SH', nameAr: 'شنغهاي', nameEn: 'Shanghai' },
      { id: 'CN-ZJ', nameAr: 'جيجيانغ', nameEn: 'Zhejiang' },
      { id: 'CN-JS', nameAr: 'جيانغسو', nameEn: 'Jiangsu' },
      { id: 'CN-SC', nameAr: 'سيتشوان', nameEn: 'Sichuan' },
      { id: 'CN-FJ', nameAr: 'فوجيان', nameEn: 'Fujian' },
      { id: 'CN-SD', nameAr: 'شاندونغ', nameEn: 'Shandong' },
      { id: 'CN-HB', nameAr: 'هوبي', nameEn: 'Hubei' },
      { id: 'CN-HN', nameAr: 'هينان', nameEn: 'Henan' }
    ]
  },
  {
    id: 'JP',
    nameAr: 'اليابان',
    nameEn: 'Japan',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    rate: 100,
    flag: '🇯🇵',
    provinces: [
      { id: 'JP-TKY', nameAr: 'طوكيو', nameEn: 'Tokyo' },
      { id: 'JP-OSK', nameAr: 'أوساكا', nameEn: 'Osaka' },
      { id: 'JP-KYT', nameAr: 'كيوتو', nameEn: 'Kyoto' },
      { id: 'JP-HKD', nameAr: 'هوكايدو', nameEn: 'Hokkaido' },
      { id: 'JP-FUK', nameAr: 'فوكوكا', nameEn: 'Fukuoka' },
      { id: 'JP-KNG', nameAr: 'كاناقاوا', nameEn: 'Kanagawa' },
      { id: 'JP-AIC', nameAr: 'آيتشي', nameEn: 'Aichi' },
      { id: 'JP-STM', nameAr: 'سايتاما', nameEn: 'Saitama' },
      { id: 'JP-CHB', nameAr: 'تشيبا', nameEn: 'Chiba' },
      { id: 'JP-HYG', nameAr: 'هيوغو', nameEn: 'Hyogo' }
    ]
  },
  {
    id: 'KR',
    nameAr: 'كوريا الجنوبية',
    nameEn: 'South Korea',
    currencyCode: 'KRW',
    currencySymbol: '₩',
    rate: 900,
    flag: '🇰🇷',
    provinces: [
      { id: 'KR-SEO', nameAr: 'سول', nameEn: 'Seoul' },
      { id: 'KR-BUS', nameAr: 'بوسان', nameEn: 'Busan' },
      { id: 'KR-INC', nameAr: 'إنتشون', nameEn: 'Incheon' },
      { id: 'KR-DAE', nameAr: 'دايجو', nameEn: 'Daegu' },
      { id: 'KR-DJN', nameAr: 'دايجيون', nameEn: 'Daejeon' },
      { id: 'KR-GWA', nameAr: 'غوانغجو', nameEn: 'Gwangju' },
      { id: 'KR-ULS', nameAr: 'أولسان', nameEn: 'Ulsan' },
      { id: 'KR-GYE', nameAr: 'غيونغي', nameEn: 'Gyeonggi' },
      { id: 'KR-GAN', nameAr: 'غونغوون', nameEn: 'Gangwon' },
      { id: 'KR-JEJ', nameAr: 'جيجو', nameEn: 'Jeju' }
    ]
  },
  {
    id: 'IN',
    nameAr: 'الهند',
    nameEn: 'India',
    currencyCode: 'INR',
    currencySymbol: '₹',
    rate: 54,
    flag: '🇮🇳',
    provinces: [
      { id: 'IN-MH', nameAr: 'ماهاراشترا', nameEn: 'Maharashtra' },
      { id: 'IN-DL', nameAr: 'دلهي', nameEn: 'Delhi' },
      { id: 'IN-KA', nameAr: 'كارناتاكا', nameEn: 'Karnataka' },
      { id: 'IN-TN', nameAr: 'تاميل نادو', nameEn: 'Tamil Nadu' },
      { id: 'IN-UP', nameAr: 'أوتار براديش', nameEn: 'Uttar Pradesh' },
      { id: 'IN-WB', nameAr: 'البنغال الغربية', nameEn: 'West Bengal' },
      { id: 'IN-GJ', nameAr: 'غوجارات', nameEn: 'Gujarat' },
      { id: 'IN-TG', nameAr: 'تلنغانا', nameEn: 'Telangana' },
      { id: 'IN-RJ', nameAr: 'راجستان', nameEn: 'Rajasthan' },
      { id: 'IN-KL', nameAr: 'كيرلا', nameEn: 'Kerala' }
    ]
  },
  {
    id: 'ID',
    nameAr: 'إندونيسيا',
    nameEn: 'Indonesia',
    currencyCode: 'IDR',
    currencySymbol: 'Rp',
    rate: 10500,
    flag: '🇮🇩',
    provinces: [
      { id: 'ID-JK', nameAr: 'جاكرتا', nameEn: 'Jakarta' },
      { id: 'ID-JB', nameAr: 'جاوة الغربية', nameEn: 'West Java' },
      { id: 'ID-JI', nameAr: 'جاوة الشرقية', nameEn: 'East Java' },
      { id: 'ID-JT', nameAr: 'جاوة الوسطى', nameEn: 'Central Java' },
      { id: 'ID-SU', nameAr: 'سومطرة الشمالية', nameEn: 'North Sumatra' },
      { id: 'ID-BA', nameAr: 'بالي', nameEn: 'Bali' },
      { id: 'ID-SN', nameAr: 'سولاوسي الجنوبية', nameEn: 'South Sulawesi' },
      { id: 'ID-BT', nameAr: 'بانتن', nameEn: 'Banten' }
    ]
  },
  {
    id: 'MY',
    nameAr: 'ماليزيا',
    nameEn: 'Malaysia',
    currencyCode: 'MYR',
    currencySymbol: 'RM',
    rate: 3.0,
    flag: '🇲🇾',
    provinces: [
      { id: 'MY-SL', nameAr: 'سيلانغور', nameEn: 'Selangor' },
      { id: 'MY-KL', nameAr: 'كوالالمبور', nameEn: 'Kuala Lumpur' },
      { id: 'MY-JH', nameAr: 'جوهر', nameEn: 'Johor' },
      { id: 'MY-PG', nameAr: 'بينانغ', nameEn: 'Penang' },
      { id: 'MY-PK', nameAr: 'بيراك', nameEn: 'Perak' },
      { id: 'MY-SB', nameAr: 'صباح', nameEn: 'Sabah' },
      { id: 'MY-SR', nameAr: 'سراوق', nameEn: 'Sarawak' },
      { id: 'MY-KH', nameAr: 'قدح', nameEn: 'Kedah' },
      { id: 'MY-PH', nameAr: 'باهانغ', nameEn: 'Pahang' },
      { id: 'MY-ME', nameAr: 'ملقا', nameEn: 'Melaka' }
    ]
  },
  {
    id: 'SG',
    nameAr: 'سنغافورة',
    nameEn: 'Singapore',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    rate: 0.88,
    flag: '🇸🇬',
    provinces: [
      { id: 'SG-CR', nameAr: 'المنطقة الوسطى', nameEn: 'Central Region' },
      { id: 'SG-ER', nameAr: 'المنطقة الشرقية', nameEn: 'East Region' },
      { id: 'SG-NR', nameAr: 'المنطقة الشمالية', nameEn: 'North Region' },
      { id: 'SG-NER', nameAr: 'المنطقة الشمالية الشرقية', nameEn: 'North-East Region' },
      { id: 'SG-WR', nameAr: 'المنطقة الغربية', nameEn: 'West Region' }
    ]
  },
  {
    id: 'TH',
    nameAr: 'تايلاند',
    nameEn: 'Thailand',
    currencyCode: 'THB',
    currencySymbol: '฿',
    rate: 23.4,
    flag: '🇹🇭',
    provinces: [
      { id: 'TH-BKK', nameAr: 'بانكوك', nameEn: 'Bangkok' },
      { id: 'TH-CNX', nameAr: 'شيانغ ماي', nameEn: 'Chiang Mai' },
      { id: 'TH-HKT', nameAr: 'بوكيت', nameEn: 'Phuket' },
      { id: 'TH-CHB', nameAr: 'تشونبوري', nameEn: 'Chonburi' },
      { id: 'TH-NON', nameAr: 'نونثابوري', nameEn: 'Nonthaburi' },
      { id: 'TH-SPK', nameAr: 'ساموت براكان', nameEn: 'Samut Prakan' },
      { id: 'TH-PTH', nameAr: 'باتوم ثاني', nameEn: 'Pathum Thani' },
      { id: 'TH-NMA', nameAr: 'ناخون راتشاسيما', nameEn: 'Nakhon Ratchasima' }
    ]
  },
  {
    id: 'PH',
    nameAr: 'الفلبين',
    nameEn: 'Philippines',
    currencyCode: 'PHP',
    currencySymbol: '₱',
    rate: 37.7,
    flag: '🇵🇭',
    provinces: [
      { id: 'PH-MNL', nameAr: 'مترو مانيلا', nameEn: 'Metro Manila' },
      { id: 'PH-CEB', nameAr: 'سيبو', nameEn: 'Cebu' },
      { id: 'PH-DVO', nameAr: 'دافاو', nameEn: 'Davao' },
      { id: 'PH-CAV', nameAr: 'كاويته', nameEn: 'Cavite' },
      { id: 'PH-LAG', nameAr: 'لاغونا', nameEn: 'Laguna' },
      { id: 'PH-BUL', nameAr: 'بولاكان', nameEn: 'Bulacan' },
      { id: 'PH-PAN', nameAr: 'بانغاسينان', nameEn: 'Pangasinan' },
      { id: 'PH-PAM', nameAr: 'بامبانغا', nameEn: 'Pampanga' }
    ]
  },
  {
    id: 'PK',
    nameAr: 'باكستان',
    nameEn: 'Pakistan',
    currencyCode: 'PKR',
    currencySymbol: '₨',
    rate: 180,
    flag: '🇵🇰',
    provinces: [
      { id: 'PK-PB', nameAr: 'البنجاب', nameEn: 'Punjab' },
      { id: 'PK-SD', nameAr: 'السند', nameEn: 'Sindh' },
      { id: 'PK-KP', nameAr: 'خيبر بختونخوا', nameEn: 'Khyber Pakhtunkhwa' },
      { id: 'PK-BA', nameAr: 'بلوشستان', nameEn: 'Balochistan' },
      { id: 'PK-IS', nameAr: 'إسلام آباد', nameEn: 'Islamabad' },
      { id: 'PK-JK', nameAr: 'آزاد كشمير', nameEn: 'Azad Kashmir' },
      { id: 'PK-GB', nameAr: 'غلغت بلتستان', nameEn: 'Gilgit-Baltistan' }
    ]
  },
  {
    id: 'VN',
    nameAr: 'فيتنام',
    nameEn: 'Vietnam',
    currencyCode: 'VND',
    currencySymbol: '₫',
    rate: 16500,
    flag: '🇻🇳',
    provinces: [
      { id: 'VN-SG', nameAr: 'مدينة هو تشي منه', nameEn: 'Ho Chi Minh City' },
      { id: 'VN-HN', nameAr: 'هانوي', nameEn: 'Hanoi' },
      { id: 'VN-DN', nameAr: 'دا نانغ', nameEn: 'Da Nang' },
      { id: 'VN-BD', nameAr: 'بينه دونغ', nameEn: 'Binh Duong' },
      { id: 'VN-DNai', nameAr: 'دونغ ناي', nameEn: 'Dong Nai' },
      { id: 'VN-HP', nameAr: 'هاي فونغ', nameEn: 'Hai Phong' },
      { id: 'VN-CT', nameAr: 'كان ثو', nameEn: 'Can Tho' },
      { id: 'VN-KH', nameAr: 'كان هوا', nameEn: 'Khanh Hoa' }
    ]
  }
];

