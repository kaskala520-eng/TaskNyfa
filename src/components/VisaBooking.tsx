import React, { useState, useRef } from 'react';
import { CountryConfig, Transaction } from '../types';
import { formatCurrencyValue } from '../utils/currency';
import { 
  Globe, 
  MapPin, 
  FileText, 
  User, 
  Calendar, 
  CreditCard, 
  Search, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Printer, 
  Download, 
  ChevronRight, 
  ShieldCheck, 
  Briefcase, 
  FileCheck,
  Plane,
  Coins,
  Trash2,
  Ticket,
  Eye
} from 'lucide-react';

interface VisaBookingProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  cashBalance: number;
  setCashBalance: React.Dispatch<React.SetStateAction<number>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  triggerToast: (msg: string, type?: 'success' | 'info') => void;
  onBookingCompleted?: () => void;
}

interface VisaCountry {
  id: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  region: 'gulf' | 'europe' | 'asia' | 'americas' | 'africa';
  visaTypeAr: string;
  visaTypeEn: string;
  feeUSD: number;
  processingTimeAr: string;
  processingTimeEn: string;
  validityAr: string;
  validityEn: string;
  stayAr: string;
  stayEn: string;
  requirementsAr: string[];
  requirementsEn: string[];
}

const VISA_COUNTRIES: VisaCountry[] = [
  {
    id: 'TR',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    region: 'europe',
    visaTypeAr: 'تأشيرة إلكترونية (eVisa)',
    visaTypeEn: 'e-Visa (Tourist/Business)',
    feeUSD: 50,
    processingTimeAr: '٢٤ ساعة كحد أقصى',
    processingTimeEn: 'Within 24 Hours',
    validityAr: '١٨٠ يوماً (دخول متعدد)',
    validityEn: '180 Days (Multiple Entry)',
    stayAr: '٣٠ يوماً لكل زيارة',
    stayEn: '30 Days per visit',
    requirementsAr: [
      'جواز سفر صالح لمدة لا تقل عن 6 أشهر.',
      'تذكرة عودة مؤكدة وحجز فندقي.',
      'رصيد كافٍ لتغطية نفقات السفر (أو رصيد الحساب المربوط).'
    ],
    requirementsEn: [
      'Passport valid for at least 6 months.',
      'Confirmed return ticket & hotel booking.',
      'Sufficient funds for stay (or linked account balance).'
    ]
  },
  {
    id: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'gulf',
    visaTypeAr: 'تأشيرة سياحة وعمرة إلكترونية',
    visaTypeEn: 'Tourist & Umrah eVisa',
    feeUSD: 120,
    processingTimeAr: '١ - ٢ يوم عمل',
    processingTimeEn: '1-2 Business Days',
    validityAr: 'سنة كاملة (دخول متعدد)',
    validityEn: '1 Year (Multiple Entry)',
    stayAr: '٩٠ يوماً إجمالياً',
    stayEn: '90 Days total stay',
    requirementsAr: [
      'جواز سفر ساري المفعول.',
      'صورة شخصية حديثة بخلفية بيضاء.',
      'تأمين طبي معتمد (مشمول تلقائياً في السعر).'
    ],
    requirementsEn: [
      'Valid passport with over 6 months validity.',
      'Recent passport-size photo with white background.',
      'Compulsory medical insurance (included in the fee).'
    ]
  },
  {
    id: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'gulf',
    visaTypeAr: 'تأشيرة دخول سياحية إلكترونية',
    visaTypeEn: 'Tourist Entry eVisa',
    feeUSD: 85,
    processingTimeAr: '٢ يوم عمل',
    processingTimeEn: '2 Business Days',
    validityAr: '٦٠ يوماً من تاريخ الإصدار',
    validityEn: '60 Days from issuance',
    stayAr: '٣٠ يوماً (قابلة للتمديد)',
    stayEn: '30 Days (Extendable)',
    requirementsAr: [
      'صورة ملونة واضحة لصفحة جواز السفر الأولى.',
      'صورة شخصية ملونة عالية الجودة بخلفية بيضاء.',
      'تذكرة طيران ذهاب وإياب.'
    ],
    requirementsEn: [
      'Clear color copy of passport bio page.',
      'High-quality passport photo with white background.',
      'Round-trip airline flight reservation.'
    ]
  },
  {
    id: 'OM',
    nameAr: 'سلطنة عمان',
    nameEn: 'Oman',
    flag: '🇴🇲',
    region: 'gulf',
    visaTypeAr: 'تأشيرة دخول سياحية إلكترونية',
    visaTypeEn: 'Tourist Entry eVisa',
    feeUSD: 52,
    processingTimeAr: '٢٤ - ٤٨ ساعة',
    processingTimeEn: '24-48 Hours',
    validityAr: '٣٠ يوماً (دخول مفرد)',
    validityEn: '30 Days (Single Entry)',
    stayAr: '٣٠ يوماً لكل زيارة',
    stayEn: '30 Days per visit',
    requirementsAr: [
      'جواز سفر صالح لمدة لا تقل عن 6 أشهر.',
      'تأكيد حجز فندقي وتذكرة طيران.',
      'صورة شخصية حديثة ملونة.'
    ],
    requirementsEn: [
      'Passport valid for at least 6 months.',
      'Hotel booking & flight confirmation.',
      'Recent color passport-size photograph.'
    ]
  },
  {
    id: 'QA',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    region: 'gulf',
    visaTypeAr: 'تصريح دخول هيا / تأشيرة سياحية إلكترونية',
    visaTypeEn: 'Hayya Entry / Tourist eVisa',
    feeUSD: 28,
    processingTimeAr: '١ - ٢ يوم عمل',
    processingTimeEn: '1-2 Business Days',
    validityAr: '٣٠ يوماً من الإصدار',
    validityEn: '30 Days from issuance',
    stayAr: '٣٠ يوماً لكل دخول',
    stayEn: '30 Days per visit',
    requirementsAr: [
      'جواز سفر صالح وصورة واضحة لصفحة البيانات.',
      'صورة شخصية حديثة بخلفية بيضاء.',
      'تأكيد حجز السكن عبر منصة هيا أو فندق معتمد.',
      'تذكرة طيران ذهاب وإياب.'
    ],
    requirementsEn: [
      'Valid passport booklet copy.',
      'Recent photo with plain white background.',
      'Confirmed accommodation booking via Hayya or certified hotel.',
      'Return airline ticket reservation.'
    ]
  },
  {
    id: 'BH',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    flag: '🇧🇭',
    region: 'gulf',
    visaTypeAr: 'تأشيرة زيارة إلكترونية سياحية',
    visaTypeEn: 'Tourist eVisa',
    feeUSD: 25,
    processingTimeAr: '٢ يوم عمل',
    processingTimeEn: '2 Business Days',
    validityAr: '٣٠ يوماً (دخول متعدد)',
    validityEn: '30 Days (Multiple Entry)',
    stayAr: '١٤ يوماً لكل زيارة',
    stayEn: '14 Days per entry',
    requirementsAr: [
      'صورة ملونة لصفحة جواز السفر الأساسية.',
      'تذكرة عودة مؤكدة خارج مملكة البحرين.',
      'حجز فندقي ساري أو عنوان سكن معتمد.',
      'كشف حساب بنكي لآخر ٣ أشهر.'
    ],
    requirementsEn: [
      'Color copy of passport bio page.',
      'Confirmed return flight booking out of Bahrain.',
      'Active hotel reservation or certified address.',
      'Past 3 months bank statement copy.'
    ]
  },
  {
    id: 'KW',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    region: 'gulf',
    visaTypeAr: 'تأشيرة دخول سياحية إلكترونية',
    visaTypeEn: 'Tourist eVisa',
    feeUSD: 10,
    processingTimeAr: '١ - ٣ أيام عمل',
    processingTimeEn: '1-3 Business Days',
    validityAr: '٣٠ يوماً من تاريخ الإصدار',
    validityEn: '30 Days from issuance',
    stayAr: '٩٠ يوماً كحد أقصى للزيارة',
    stayEn: '90 Days maximum stay',
    requirementsAr: [
      'صورة من جواز السفر ساري المفعول.',
      'إقامة خليجية سارية المفعول لأصحاب المهن المعتمدة (إن وجد).',
      'صورة شخصية ملونة واضحة.',
      'إثبات عنوان الإقامة المتوقع في دولة الكويت.'
    ],
    requirementsEn: [
      'Copy of valid passport.',
      'GCC residency card with eligible occupation (if applicable).',
      'Clear color passport-size photograph.',
      'Proof of accommodation address in Kuwait.'
    ]
  },
  {
    id: 'JO',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    region: 'gulf',
    visaTypeAr: 'تأشيرة دخول سياحية إلكترونية (أو التذكرة الموحدة)',
    visaTypeEn: 'Tourist eVisa / Jordan Pass',
    feeUSD: 56,
    processingTimeAr: '٢٤ - ٤٨ ساعة',
    processingTimeEn: '24-48 Hours',
    validityAr: '٩٠ يوماً من الإصدار',
    validityEn: '90 Days from issuance',
    stayAr: '٣٠ يوماً (قابلة للتمديد)',
    stayEn: '30 Days (Extendable)',
    requirementsAr: [
      'جواز سفر صالح لمدة تزيد عن 6 أشهر.',
      'تأكيد حجز الفندق أو السكن بالأردن.',
      'تذكرة طيران عودة مؤكدة.'
    ],
    requirementsEn: [
      'Passport valid for more than 6 months.',
      'Confirmed hotel reservation or residence details.',
      'Confirmed return flight reservation.'
    ]
  },
  {
    id: 'CN',
    nameAr: 'الصين',
    nameEn: 'China',
    flag: '🇨🇳',
    region: 'asia',
    visaTypeAr: 'تأشيرة زيارة وسياحة (L)',
    visaTypeEn: 'Tourist Visa (L-Type)',
    feeUSD: 110,
    processingTimeAr: '٤ - ٧ أيام عمل',
    processingTimeEn: '4-7 Business Days',
    validityAr: '٩٠ يوماً (دخول فردي)',
    validityEn: '90 Days (Single Entry)',
    stayAr: '٣٠ يوماً كحد أقصى',
    stayEn: '30 Days max stay',
    requirementsAr: [
      'جواز سفر أصلي مع نسختين ضوئيتين منه.',
      'تأكيد حجز فندقي وتذكرة طيران ذهاب وإياب.',
      'صورة ملونة ملصقة على نموذج الطلب الرسمي.',
      'إثبات ملاءة مالية أو كشف حساب بنكي.'
    ],
    requirementsEn: [
      'Original passport with two copies.',
      'Confirmed hotel reservation & round-trip flight booking.',
      'Color photo pasted on the official application form.',
      'Proof of financial solvency or bank statement.'
    ]
  },
  {
    id: 'KR',
    nameAr: 'كوريا الجنوبية',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    region: 'asia',
    visaTypeAr: 'تصريح السفر الإلكتروني الكوري (K-ETA)',
    visaTypeEn: 'Korea Electronic Travel Authorization (K-ETA / Visa)',
    feeUSD: 45,
    processingTimeAr: '٢٤ ساعة',
    processingTimeEn: 'Within 24 Hours',
    validityAr: 'سنتين (دخول متعدد)',
    validityEn: '2 Years (Multiple Entry)',
    stayAr: '٩٠ يوماً لكل دخول',
    stayEn: '90 Days per entry',
    requirementsAr: [
      'جواز سفر إلكتروني ساري المفعول.',
      'صورة شخصية رقمية بخلفية بيضاء.',
      'عنوان الإقامة المخطط له في كوريا الجنوبية.',
      'رسوم التقديم الإلكترونية.'
    ],
    requirementsEn: [
      'Valid e-passport booklet.',
      'Digital passport-size photo with white background.',
      'Intended residential or hotel address in South Korea.',
      'Electronic application submission fee.'
    ]
  },
  {
    id: 'SG',
    nameAr: 'سنغافورة',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    region: 'asia',
    visaTypeAr: 'تأشيرة دخول إلكترونية سياحية',
    visaTypeEn: 'Tourist Entry eVisa',
    feeUSD: 60,
    processingTimeAr: '٣ أيام عمل',
    processingTimeEn: '3 Business Days',
    validityAr: '٩٠ يوماً من الإصدار (دخول متعدد)',
    validityEn: '90 Days from issuance (Multiple Entry)',
    stayAr: '٣٠ يوماً لكل دخول',
    stayEn: '30 Days max per entry',
    requirementsAr: [
      'جواز سفر صالح وبصيغة مقروءة آلياً.',
      'صورة شخصية ملونة بخلفية بيضاء غير لامعة.',
      'حجز طيران مؤكد وحجز فندق.',
      'كتاب دعوة رسمي (إن وجد) أو نموذج V39A.'
    ],
    requirementsEn: [
      'Machine-readable passport valid for 6 months.',
      'Color passport photo with matte white background.',
      'Confirmed flight itinerary and hotel booking.',
      'Official Letter of Introduction (Form V39A) if applicable.'
    ]
  },
  {
    id: 'PH',
    nameAr: 'الفلبين',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    region: 'asia',
    visaTypeAr: 'تأشيرة دخول سياحية إلكترونية (eVisa)',
    visaTypeEn: 'Tourist Entry eVisa / Entry Permit',
    feeUSD: 55,
    processingTimeAr: '٣ - ٥ أيام عمل',
    processingTimeEn: '3-5 Business Days',
    validityAr: '٩٠ يوماً (دخول مفرد)',
    validityEn: '90 Days (Single Entry)',
    stayAr: '٣٠ يوماً من تاريخ الدخول',
    stayEn: '30 Days from arrival date',
    requirementsAr: [
      'جواز سفر صالح لمدة لا تقل عن 6 أشهر.',
      'تذكرة عودة مؤكدة وتأكيد السكن بالفندق.',
      'شهادة التطعيم الإلكترونية الرسمية.',
      'كشف حساب بنكي يثبت القدرة على الإنفاق.'
    ],
    requirementsEn: [
      'Passport valid for at least 6 months.',
      'Confirmed return ticket and hotel accommodation.',
      'Official digital travel declaration and health pass.',
      'Bank statement proving sufficient funding.'
    ]
  },
  {
    id: 'ID',
    nameAr: 'إندونيسيا',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    region: 'asia',
    visaTypeAr: 'تأشيرة إلكترونية عند الوصول (e-VOA)',
    visaTypeEn: 'e-Visa on Arrival (e-VOA)',
    feeUSD: 40,
    processingTimeAr: '٢٤ ساعة كحد أقصى',
    processingTimeEn: 'Within 24 Hours',
    validityAr: '٩٠ يوماً من الإصدار',
    validityEn: '90 Days from issuance',
    stayAr: '٣٠ يوماً (قابلة للتمديد لمرة واحدة)',
    stayEn: '30 Days (Extendable once for 30 days)',
    requirementsAr: [
      'جواز سفر صالح لمدة تزيد عن 6 أشهر.',
      'صورة شخصية ملونة عالية الجودة.',
      'تذكرة طيران مغادرة مؤكدة من إندونيسيا.'
    ],
    requirementsEn: [
      'Passport valid for more than 6 months.',
      'High-quality digital passport photo.',
      'Confirmed outbound flight reservation ticket.'
    ]
  },
  {
    id: 'BG',
    nameAr: 'بلغاريا (تأشيرة وطنية)',
    nameEn: 'Bulgaria (National Visa)',
    flag: '🇧🇬',
    region: 'europe',
    visaTypeAr: 'تأشيرة سياحة قصيرة الأجل (فئة C)',
    visaTypeEn: 'Bulgaria Short-stay Tourist Visa (C-Type)',
    feeUSD: 88,
    processingTimeAr: '٧ - ١٠ أيام عمل',
    processingTimeEn: '7-10 Business Days',
    validityAr: '٩٠ يوماً (دخول مفرد أو متعدد)',
    validityEn: '90 Days (Single/Multiple Entry)',
    stayAr: '٩٠ يوماً كحد أقصى في كل ١٨٠ يوماً',
    stayEn: 'Max 90 days in any 180-day period',
    requirementsAr: [
      'جواز سفر صالح يحوي صفحتين فارغتين على الأقل.',
      'كشف حساب بنكي لآخر ٣ أشهر يثبت القدرة المالية.',
      'تأمين طبي يغطي ٣٠,٠٠٠ يورو.',
      'حجز طيران مؤكد وحجز فندقي.'
    ],
    requirementsEn: [
      'Passport containing at least 2 empty pages.',
      'Past 3 months bank statement copy.',
      'Travel medical insurance covering min €30,000.',
      'Confirmed flight and hotel reservations.'
    ]
  },
  {
    id: 'BE',
    nameAr: 'بلجيكا (تأشيرة شنغن)',
    nameEn: 'Belgium (Schengen Visa)',
    flag: '🇧🇪',
    region: 'europe',
    visaTypeAr: 'تأشيرة ملصق شنغن سياحية',
    visaTypeEn: 'Schengen Sticker Visa',
    feeUSD: 95,
    processingTimeAr: '٨ - ١٢ يوم عمل',
    processingTimeEn: '8-12 Business Days',
    validityAr: 'حسب خطة السفر (مرنة)',
    validityEn: 'Flexible according to travel plan',
    stayAr: '٩٠ يوماً كحد أقصى',
    stayEn: '90 Days maximum stay',
    requirementsAr: [
      'جواز سفر صالح وموقّع ومسح ضوئي منه.',
      'صورتان شخصيتان متوافقتان مع معايير ICAO.',
      'كشف حساب بنكي يوضح القدرة المالية للسفر لبلجيكا.',
      'تأمين صحي للسفر يغطي جميع دول شنغن.'
    ],
    requirementsEn: [
      'Valid and signed passport copy.',
      'Two passport photos compliant with ICAO standard.',
      'Bank statement proving sufficient funding for Belgium.',
      'Schengen-wide travel health insurance.'
    ]
  },
  {
    id: 'ES',
    nameAr: 'إسبانيا (تأشيرة شنغن)',
    nameEn: 'Spain (Schengen Visa)',
    flag: '🇪🇸',
    region: 'europe',
    visaTypeAr: 'تأشيرة شنغن إسبانية سياحية',
    visaTypeEn: 'Spain Schengen Tourist Visa',
    feeUSD: 95,
    processingTimeAr: '٧ - ١٠ أيام عمل',
    processingTimeEn: '7-10 Business Days',
    validityAr: 'مرنة بدخول متعدد أو فردي',
    validityEn: 'Flexible with Single/Multiple Entry',
    stayAr: '٩٠ يوماً كحد أقصى',
    stayEn: '90 Days maximum stay',
    requirementsAr: [
      'جواز سفر صالح.',
      'صورتان شخصيتان حديثتان ملونتان.',
      'كشف حساب بنكي لـ ٣ أشهر الأخيرة.',
      'تأمين صحي دولي وحجز فندقي وتذكرة ذهاب وإياب.'
    ],
    requirementsEn: [
      'Valid passport copy.',
      'Two recent color passport photos.',
      'Past 3 months bank statement.',
      'Schengen travel insurance, hotel booking & roundtrip flight.'
    ]
  },
  {
    id: 'IT',
    nameAr: 'إيطاليا (تأشيرة شنغن)',
    nameEn: 'Italy (Schengen Visa)',
    flag: '🇮🇹',
    region: 'europe',
    visaTypeAr: 'تأشيرة شنغن إيطالية سياحية',
    visaTypeEn: 'Italy Schengen Tourist Visa',
    feeUSD: 95,
    processingTimeAr: '٧ - ١١ يوم عمل',
    processingTimeEn: '7-11 Business Days',
    validityAr: 'تصل لغاية سنة (دخول متعدد)',
    validityEn: 'Up to 1 year (Multiple Entry)',
    stayAr: '٩٠ يوماً لكل دخول',
    stayEn: '90 Days per visit',
    requirementsAr: [
      'جواز سفر صالح وموقع.',
      'صورتان شخصيتان مقاس جواز السفر.',
      'كشف حساب بنكي كافٍ لتغطية المعيشة في إيطاليا.',
      'تأمين طبي وحجز طيران وفندق مؤكد.'
    ],
    requirementsEn: [
      'Valid signed passport.',
      'Two passport-sized photographs.',
      'Bank statement proving sufficient funds for Italy stay.',
      'Medical insurance, flight & hotel reservations.'
    ]
  },
  {
    id: 'CH',
    nameAr: 'سويسرا (تأشيرة شنغن)',
    nameEn: 'Switzerland (Schengen Visa)',
    flag: '🇨🇭',
    region: 'europe',
    visaTypeAr: 'تأشيرة سياحة قصيرة الأجل',
    visaTypeEn: 'Schengen Short-stay Tourist Visa',
    feeUSD: 100,
    processingTimeAr: '٦ - ١٠ أيام عمل',
    processingTimeEn: '6-10 Business Days',
    validityAr: 'مرنة حسب فترة الحجز',
    validityEn: 'Flexible based on reservation duration',
    stayAr: '٩٠ يوماً كحد أقصى',
    stayEn: '90 Days maximum stay',
    requirementsAr: [
      'جواز سفر ساري المفعول.',
      'إثبات ملاءة مالية قوية (كشف حساب بنكي).',
      'برنامج رحلة سياحية تفصيلي في سويسرا.',
      'تأمين صحي معتمد وحجز طيران وفندق.'
    ],
    requirementsEn: [
      'Valid passport booklet.',
      'Strong financial proof of solvency (bank statement).',
      'Detailed day-by-day Switzerland itinerary.',
      'Schengen medical insurance & flight/hotel bookings.'
    ]
  },
  {
    id: 'NL',
    nameAr: 'هولندا (تأشيرة شنغن)',
    nameEn: 'Netherlands (Schengen Visa)',
    flag: '🇳🇱',
    region: 'europe',
    visaTypeAr: 'تأشيرة شنغن هولندية سياحية',
    visaTypeEn: 'Netherlands Schengen Tourist Visa',
    feeUSD: 95,
    processingTimeAr: '٧ - ١٠ أيام عمل',
    processingTimeEn: '7-10 Business Days',
    validityAr: 'تصل لغاية ٥ سنوات (مرنة)',
    validityEn: 'Up to 5 years (Flexible)',
    stayAr: '٩٠ يوماً كحد أقصى في شنغن',
    stayEn: 'Max 90 days stay in Schengen area',
    requirementsAr: [
      'جواز سفر صالح وبصيغة مقروءة.',
      'كشف حساب بنكي لأخر ٣ أشهر.',
      'صورتان شخصيتان بخلفية بيضاء.',
      'حجز طيران وفندق وتأمين صحي للسفر.'
    ],
    requirementsEn: [
      'Valid passport booklet.',
      'Past 3 months bank statement.',
      'Two passport photos with white background.',
      'Flight, hotel & Schengen travel insurance bookings.'
    ]
  },
  {
    id: 'DE',
    nameAr: 'ألمانيا (تأشيرة شنغن)',
    nameEn: 'Germany (Schengen Visa)',
    flag: '🇩🇪',
    region: 'europe',
    visaTypeAr: 'تأشيرة ملصق شنغن قصيرة الأجل',
    visaTypeEn: 'Schengen Sticker Visa (C-Type)',
    feeUSD: 95,
    processingTimeAr: '٨ - ١٢ يوم عمل',
    processingTimeEn: '8-12 Business Days',
    validityAr: 'حسب خطة السفر (تصل لـ ٥ سنوات)',
    validityEn: 'According to travel plan (up to 5 years)',
    stayAr: '٩٠ يوماً كحد أقصى في كل ١٨٠ يوماً',
    stayEn: 'Max 90 days in any 180-day period',
    requirementsAr: [
      'نموذج طلب شنغن مكتمل وموقع.',
      'جواز سفر يحوي صفحتين فارغتين على الأقل.',
      'كشف حساب بنكي لآخر ٣ أشهر يثبت القدرة المالية.',
      'تأمين صحي دولي يغطي ٣٠,٠٠٠ يورو.'
    ],
    requirementsEn: [
      'Completed and signed Schengen application form.',
      'Passport containing at least 2 empty pages.',
      'Past 3 months bank statement proving solvency.',
      'Travel health insurance covering min €30,000.'
    ]
  },
  {
    id: 'FR',
    nameAr: 'فرنسا (تأشيرة شنغن)',
    nameEn: 'France (Schengen Visa)',
    flag: '🇫🇷',
    region: 'europe',
    visaTypeAr: 'تأشيرة ملصق شنغن سياحية',
    visaTypeEn: 'Schengen Tourist Sticker Visa',
    feeUSD: 95,
    processingTimeAr: '٧ - ١٠ أيام عمل',
    processingTimeEn: '7-10 Business Days',
    validityAr: 'مرنة (دخول فردي أو متعدد)',
    validityEn: 'Flexible (Single/Multiple Entry)',
    stayAr: '٩٠ يوماً كحد أقصى',
    stayEn: '90 Days maximum stay',
    requirementsAr: [
      'جواز سفر صالح وموقّع.',
      'صورتان شخصيتان متوافقتان مع معايير ICAO.',
      'إثبات حجز فندق وتذكرة طيران ذهاب وإياب.',
      'خطاب تعريف بالراتب أو السجل التجاري.'
    ],
    requirementsEn: [
      'Valid and signed passport copy.',
      'Two passport photos compliant with ICAO standard.',
      'Proof of accommodation and round-trip ticket.',
      'Employment certification letter or commercial registry.'
    ]
  },
  {
    id: 'GB',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    region: 'europe',
    visaTypeAr: 'تأشيرة زيارة قياسية (لاصقة)',
    visaTypeEn: 'Standard Visitor Visa (Sticker)',
    feeUSD: 145,
    processingTimeAr: '١٠ - ١٥ يوم عمل',
    processingTimeEn: '10-15 Business Days',
    validityAr: '٦ أشهر (دخول متعدد)',
    validityEn: '6 Months (Multiple Entry)',
    stayAr: '١٨٠ يوماً كحد أقصى',
    stayEn: '180 Days maximum stay',
    requirementsAr: [
      'جواز سفر ساري المفعول بأي لغة.',
      'كشف حساب بنكي مفصل كافٍ لإثبات تمويل الزيارة.',
      'خطاب جهة العمل يوضح الراتب وتاريخ التعيين والموافقة على الإجازة.',
      'تفاصيل إقامتك المخطط لها في بريطانيا.'
    ],
    requirementsEn: [
      'Current valid passport copy.',
      'Detailed bank statement proving complete funding.',
      'Employment verification letter stating salary and approval.',
      'Accommodation details in the United Kingdom.'
    ]
  },
  {
    id: 'US',
    nameAr: 'الولايات المتحدة الأمريكية',
    nameEn: 'United States',
    flag: '🇺🇸',
    region: 'americas',
    visaTypeAr: 'تأشيرة زيارة سياحية (B1/B2)',
    visaTypeEn: 'Visitor Visa (B1/B2 Tourist)',
    feeUSD: 185,
    processingTimeAr: '١٢ - ١٨ يوم عمل',
    processingTimeEn: '12-18 Business Days',
    validityAr: '٥ سنوات أو ٥ سنوات للعراقيين والمصريين',
    validityEn: '5 Years (Multiple Entry)',
    stayAr: '٦ أشهر لكل دخول',
    stayEn: '6 Months per entry',
    requirementsAr: [
      'تعبئة نموذج DS-160 الإلكتروني بالكامل.',
      'صورة جواز سفر ملونة.',
      'صورة شخصية حديثة مقاس 5x5 سم مربعة.',
      'كشف حساب بنكي قوي ووثيقة لإثبات الارتباط بالوطن (عقد عمل، عقارات).'
    ],
    requirementsEn: [
      'Fully completed DS-160 online application confirmation.',
      'Scanned copy of passport.',
      'Recent square 5x5 cm passport photo.',
      'Strong financial statement and ties to home country (job, properties).'
    ]
  },
  {
    id: 'CA',
    nameAr: 'كندا',
    nameEn: 'Canada',
    flag: '🇨🇦',
    region: 'americas',
    visaTypeAr: 'تأشيرة إقامة مؤقتة (TRV)',
    visaTypeEn: 'Temporary Resident Visa (TRV)',
    feeUSD: 150,
    processingTimeAr: '١٥ - ٢٠ يوم عمل',
    processingTimeEn: '15-20 Business Days',
    validityAr: 'تصل إلى ١٠ سنوات (أو انتهاء الجواز)',
    validityEn: 'Up to 10 years (or passport expiry)',
    stayAr: '٦ أشهر لكل زيارة',
    stayEn: '6 Months per visit',
    requirementsAr: [
      'نماذج طلب تأشيرة كندا المعتمدة.',
      'جواز سفر صالح ومسح ضوئي لجميع الصفحات المختومة.',
      'كشف حساب بنكي لـ ٤ أشهر الأخيرة ومصدر الأموال.',
      'حجز طيران مبدئي وخطة مسار رحلة تفصيلية.'
    ],
    requirementsEn: [
      'Official Canada visa application forms.',
      'Passport scan including all stamped pages.',
      'Past 4 months bank statement with source of funds.',
      'Provisional airline itinerary and day-by-day travel plan.'
    ]
  },
  {
    id: 'JP',
    nameAr: 'اليابان',
    nameEn: 'Japan',
    flag: '🇯🇵',
    region: 'asia',
    visaTypeAr: 'تأشيرة سياحة إلكترونية (eVisa)',
    visaTypeEn: 'e-Visa (Short-term Tourist)',
    feeUSD: 30,
    processingTimeAr: '٥ أيام عمل',
    processingTimeEn: '5 Business Days',
    validityAr: '٩٠ يوماً (دخول فردي)',
    validityEn: '90 Days (Single Entry)',
    stayAr: '٩٠ يوماً كحد أقصى',
    stayEn: 'Up to 90 Days',
    requirementsAr: [
      'جواز سفر ساري المفعول.',
      'صورتك الشخصية (صورة سيلفي واضحة أو فوتوغرافية).',
      'حجز الطيران المؤكد ذهاب وإياب.',
      'شهادة الرصيد البنكي أو كشف حساب مبسط.'
    ],
    requirementsEn: [
      'Valid passport booklet.',
      'Passport photograph or high-quality selfie.',
      'Confirmed round-trip flight booking tickets.',
      'Simplified bank certificate of balance.'
    ]
  },
  {
    id: 'EG',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    region: 'africa',
    visaTypeAr: 'تأشيرة دخول إلكترونية فورية',
    visaTypeEn: 'Egypt Entry eVisa',
    feeUSD: 25,
    processingTimeAr: '٢٤ - ٤٨ ساعة',
    processingTimeEn: '24-48 Hours',
    validityAr: '٩٠ يوماً من الإصدار',
    validityEn: '90 Days from issuance',
    stayAr: '٣٠ يوماً دخول مفرد',
    stayEn: '30 Days single entry',
    requirementsAr: [
      'جواز سفر ساري المفعول لمدة تزيد عن 8 أشهر.',
      'بطاقة الهوية الوطنية أو إقامة سارية.',
      'العنوان المتوقع للإقامة في جمهورية مصر العربية.'
    ],
    requirementsEn: [
      'Passport valid for more than 8 months.',
      'National identity card or active residency.',
      'Intended residential or hotel address in Egypt.'
    ]
  }
];

export default function VisaBooking({
  lang,
  selectedCountry,
  cashBalance,
  setCashBalance,
  setTransactions,
  triggerToast,
  onBookingCompleted
}: VisaBookingProps) {
  const isAr = lang === 'ar';

  // Filters & Selected State
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'gulf' | 'europe' | 'asia' | 'americas' | 'africa'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisa, setSelectedVisa] = useState<VisaCountry | null>(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [occupation, setOccupation] = useState('');
  const [travelPurpose, setTravelPurpose] = useState('Tourism');
  const [intendedDate, setIntendedDate] = useState('');

  // Upload States & Progress
  const [passportFile, setPassportFile] = useState<string | null>(null);
  const [passportProgress, setPassportProgress] = useState(0);
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [bankFile, setBankFile] = useState<string | null>(null);
  const [bankProgress, setBankProgress] = useState(0);

  // Submission States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [issuedVisa, setIssuedVisa] = useState<{
    visaNo: string;
    refNo: string;
    fullName: string;
    passportNo: string;
    nationality: string;
    country: VisaCountry;
    issueDate: string;
    expiryDate: string;
    price: number;
  } | null>(null);

  // Saved Booked Visas list
  const [bookedVisas, setBookedVisas] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cashai_booked_visas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Convert USD cost to local currency based on selected country
  const getVisaPriceLocal = (usdAmount: number) => {
    switch (selectedCountry.id) {
      case 'IQ': return usdAmount * 1450;
      case 'EG': return usdAmount * 48;
      case 'SA': return usdAmount * 3.75;
      case 'AE': return usdAmount * 3.67;
      case 'JO': return usdAmount * 0.71;
      case 'TR': return usdAmount * 33;
      case 'US': return usdAmount * 1.0;
      case 'EU': return usdAmount * 0.92;
      case 'GB': return usdAmount * 0.78;
      case 'LY': return usdAmount * 4.8;
      case 'MA': return usdAmount * 10.0;
      case 'DZ': return usdAmount * 134;
      default: return usdAmount * selectedCountry.rate;
    }
  };

  // Filter countries list
  const filteredVisas = VISA_COUNTRIES.filter(visa => {
    const matchesRegion = selectedRegion === 'all' || visa.region === selectedRegion;
    const matchesSearch = 
      visa.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
      visa.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const handleSelectCountry = (visa: VisaCountry) => {
    setSelectedVisa(visa);
    // Reset Form
    setFullName('');
    setPassportNo('');
    setNationality(isAr ? 'عراقي' : 'Iraqi');
    setBirthDate('1998-08-12');
    setOccupation(isAr ? 'موظف قطاع خاص' : 'Private Sector Employee');
    setIntendedDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    // Reset Files
    setPassportFile(null);
    setPassportProgress(0);
    setPhotoFile(null);
    setPhotoProgress(0);
    setBankFile(null);
    setBankProgress(0);
  };

  // Simulating uploads with nice progress
  const triggerFileUpload = (fileType: 'passport' | 'photo' | 'bank', name: string) => {
    let progress = 0;
    const setProgress = fileType === 'passport' ? setPassportProgress 
                        : fileType === 'photo' ? setPhotoProgress 
                        : setBankProgress;
    const setFile = fileType === 'passport' ? setPassportFile 
                    : fileType === 'photo' ? setPhotoFile 
                    : setBankFile;

    const interval = setInterval(() => {
      progress += 25;
      setProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setFile(name);
        triggerToast(
          isAr 
            ? `✅ تم رفع مستند [${name}] بنجاح وفحصه آلياً!` 
            : `✅ Document [${name}] uploaded and automated scan cleared!`, 
          'success'
        );
      }
    }, 200);
  };

  const handleApplyVisa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisa) return;

    if (!fullName.trim() || !passportNo.trim() || !nationality.trim()) {
      triggerToast(
        isAr ? '⚠️ يرجى إدخال البيانات الشخصية وبيانات الجواز كاملة!' : '⚠️ Please complete all personal and passport fields!',
        'info'
      );
      return;
    }

    if (!passportFile || !photoFile) {
      triggerToast(
        isAr 
          ? '⚠️ يرجى إرفاق المستندات المطلوبة (صورة الجواز والصورة الشخصية على الأقل)!' 
          : '⚠️ Please upload required files (Passport & Photo at minimum)!',
        'info'
      );
      return;
    }

    const originalPrice = Math.round(getVisaPriceLocal(selectedVisa.feeUSD));
    const price = 0; // 100% free for users as requested

    // Deduct balance and simulate real booking pipeline
    setIsProcessing(true);
    setProcessingStage(isAr ? '📝 فحص جودة المستندات ومطابقة الصورة الذكية للوجه...' : '📝 Auditing doc quality and matching biometric facial recognition...');

    setTimeout(() => {
      setProcessingStage(isAr ? '🌐 الاتصال ببوابة الهجرة والتأشيرات لبلد الوصول...' : '🌐 Transmitting secure visa packet directly to destination immigration hub...');
      setTimeout(() => {
        setProcessingStage(isAr ? '💳 تأكيد طلب التأشيرة المجانية بالكامل للمستخدم...' : '💳 Confirming 100% free visa booking for user...');
        setTimeout(() => {
          // Success!
          setCashBalance(prev => Math.max(0, prev - price));

          const visaNo = `V-${Math.floor(10000000 + Math.random() * 90000000)}`;
          const refNo = Math.random().toString(36).substring(2, 9).toUpperCase();
          const today = new Date().toISOString().split('T')[0];
          const expiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          // Add official withdrawal transaction
          const newTx: Transaction = {
            id: 'tx_visa_' + Math.floor(Math.random() * 900000 + 100000),
            type: 'withdraw',
            amount: 0,
            currency: selectedCountry.currencyCode as any,
            status: 'success',
            walletType: 'visa_booking',
            walletDetails: isAr 
              ? `حجز وتأكيد فيزا مجانية لـ ${selectedVisa.nameAr} (طلب: ${refNo})`
              : `Free Certified Visa Booking for ${selectedVisa.nameEn} (Ref: ${refNo})`,
            date: new Date().toISOString()
          };

          setTransactions(prev => [newTx, ...prev]);

          const newIssued = {
            visaNo,
            refNo,
            fullName,
            passportNo,
            nationality,
            country: selectedVisa,
            issueDate: today,
            expiryDate: expiry,
            price: originalPrice
          };

          setIssuedVisa(newIssued);
          setBookedVisas(prev => {
            const updated = [newIssued, ...prev];
            try {
              localStorage.setItem('cashai_booked_visas', JSON.stringify(updated));
            } catch (e) {
              console.error(e);
            }
            return updated;
          });

          // Trigger owner commission (1,000,000 IQD)
          if (onBookingCompleted) {
            onBookingCompleted();
          }

          setIsProcessing(false);
          triggerToast(
            isAr 
              ? `🎉 تم إصدار تأشيرة السفر المجانية لـ ${selectedVisa.nameAr} بنجاح تام!` 
              : `🎉 Free Travel Visa for ${selectedVisa.nameEn} successfully issued!`,
            'success'
          );
        }, 1000);
      }, 1000);
    }, 1200);
  };

  const resetVisaFlow = () => {
    setSelectedVisa(null);
    setIssuedVisa(null);
    setFullName('');
    setPassportNo('');
    setPassportFile(null);
    setPhotoFile(null);
    setBankFile(null);
  };

  const handleDeleteVisa = (refNo: string) => {
    const updated = bookedVisas.filter(v => v.refNo !== refNo);
    setBookedVisas(updated);
    try {
      localStorage.setItem('cashai_booked_visas', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    triggerToast(
      isAr ? '❌ تم حذف التأشيرة من السجل بنجاح!' : '❌ Visa removed from history successfully!',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search and List screen */}
      {!selectedVisa && !issuedVisa && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Visa Catalog (Filters and Cards Grid) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top filter dashboard */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
              {/* Horizontal Region Switchers */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', labelAr: 'الكل 🌍', labelEn: 'All 🌍' },
                  { id: 'gulf', labelAr: 'الخليج والشرق الأوسط 🇸🇦', labelEn: 'Middle East 🇸🇦' },
                  { id: 'europe', labelAr: 'شنغن وأوروبا 🇪🇺', labelEn: 'Schengen & Europe 🇪🇺' },
                  { id: 'asia', labelAr: 'آسيا 🇯🇵', labelEn: 'Asia 🇯🇵' },
                  { id: 'americas', labelAr: 'الأمريكتين 🇺🇸', labelEn: 'Americas 🇺🇸' },
                  { id: 'africa', labelAr: 'أفريقيا 🇪🇬', labelEn: 'Africa 🇪🇬' }
                ].map(region => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                      selectedRegion === region.id 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isAr ? region.labelAr : region.labelEn}
                  </button>
                ))}
              </div>

              {/* Quick Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث عن بلد معين...' : 'Search countries...'}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Visa Card List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVisas.map((visa) => {
                const localPrice = getVisaPriceLocal(visa.feeUSD);
                return (
                  <div 
                    key={visa.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-950 transition-all hover:shadow-md"
                  >
                    <div className="space-y-4">
                      {/* Header: Flag & Country name */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{visa.flag}</span>
                          <div>
                            <h4 className="font-extrabold text-slate-950 dark:text-white text-base">
                              {isAr ? visa.nameAr : visa.nameEn}
                            </h4>
                            <span className="inline-flex px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-full text-[10px] font-bold mt-1">
                              {isAr ? visa.visaTypeAr : visa.visaTypeEn}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visa specifications metadata */}
                      <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-xs space-y-2.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{isAr ? 'مدة المعالجة:' : 'Process Time:'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {isAr ? visa.processingTimeAr : visa.processingTimeEn}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{isAr ? 'صلاحية الفيزا:' : 'Validity:'}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {isAr ? visa.validityAr : visa.validityEn}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{isAr ? 'مدة الإقامة مسموح:' : 'Stay Allowed:'}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {isAr ? visa.stayAr : visa.stayEn}
                          </span>
                        </div>
                      </div>

                      {/* Quick check document list items */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                          {isAr ? 'المستندات المطلوبة مسبقاً:' : 'Pre-requisite Documents:'}
                        </span>
                        <ul className="text-[10.5px] text-slate-500 dark:text-slate-400 space-y-1">
                          {(isAr ? visa.requirementsAr : visa.requirementsEn).slice(0, 2).map((req, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                              <span className="truncate">{req}</span>
                            </li>
                          ))}
                          {(isAr ? visa.requirementsAr : visa.requirementsEn).length > 2 && (
                            <li className="text-[9.5px] text-indigo-500 dark:text-indigo-400 font-bold font-mono">
                              {isAr ? `+ ${visa.requirementsAr.length - 2} مستندات إضافية مطلوبة` : `+ ${visa.requirementsEn.length - 2} additional files required`}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Pricing and Button */}
                    <div className="border-t border-slate-100 dark:border-slate-850/60 pt-4 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{isAr ? 'الرسوم الكلية:' : 'Total Cost:'}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-base">
                          {formatCurrencyValue(localPrice, selectedCountry.currencyCode)} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectCountry(visa)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs hover:shadow-md transition-all"
                      >
                        <span>{isAr ? 'تقديم طلب الفيزا 📝' : 'Apply Now 📝'}</span>
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Booked / Saved Visas Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {isAr ? 'تأشيراتي المحجوزة' : 'My Saved Visas'}
                </h3>
              </div>
              <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {bookedVisas.length}
              </span>
            </div>

            {bookedVisas.length === 0 ? (
              <div className="py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                <Globe className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-350">
                    {isAr ? 'لا توجد تأشيرات صادرة بعد' : 'No issued visas yet'}
                  </p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 max-w-[200px] leading-relaxed mx-auto">
                    {isAr 
                      ? 'عند حجز أي تأشيرة بنجاح، سيتم حفظها وتفعيلها هنا للمراجعة والطباعة السريعة.' 
                      : 'Once you successfully apply for a visa, it will be saved here for quick view & printing.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-y-auto scrollbar-thin pr-1">
                {bookedVisas.map((visa) => (
                  <div 
                    key={visa.refNo}
                    className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60 space-y-3 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-950 transition-all"
                  >
                    {/* Country flag and status */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{visa.country.flag}</span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {isAr ? visa.country.nameAr : visa.country.nameEn}
                          </h4>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {visa.refNo}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 rounded-md text-[9px] font-black uppercase">
                        {isAr ? 'مقبول 🟢' : 'APPROVED 🟢'}
                      </span>
                    </div>

                    {/* Visa Metadata details */}
                    <div className="space-y-1.5 text-[10px] border-t border-b border-slate-100 dark:border-slate-850/40 py-2 my-2 text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>{isAr ? 'المسافر:' : 'Traveler:'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px] uppercase font-mono">{visa.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isAr ? 'رقم التأشيرة:' : 'Visa No:'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{visa.visaNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isAr ? 'تاريخ الانتهاء:' : 'Expiry Date:'}</span>
                        <span className="font-bold text-rose-500 font-mono">{visa.expiryDate}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => setIssuedVisa(visa)}
                        className="flex-1 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer border border-indigo-100/50 dark:border-indigo-900/40"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isAr ? 'عرض الشهادة 👁️' : 'View Certificate'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVisa(visa.refNo)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title={isAr ? 'حذف من السجل' : 'Delete from history'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Visa Application Wizard Form */}
      {selectedVisa && !issuedVisa && !isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Summary and checklist column */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl h-fit space-y-6">
            <button
              onClick={() => setSelectedVisa(null)}
              className="text-xs font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{isAr ? '← تراجع عن الاختيار الحالي' : '← Back to Visa Catalog'}</span>
            </button>

            {/* Selected Country Bio Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-5xl">{selectedVisa.flag}</span>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {isAr ? selectedVisa.nameAr : selectedVisa.nameEn}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAr ? selectedVisa.visaTypeAr : selectedVisa.visaTypeEn}
                </p>
              </div>
            </div>

            {/* Spec grid list */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'رسوم السفارة:' : 'Consular Fee:'}</span>
                <span className="font-black text-emerald-600 font-mono">
                  {formatCurrencyValue(Math.round(getVisaPriceLocal(selectedVisa.feeUSD)), selectedCountry.currencyCode)} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'زمن المعالجة المضمون:' : 'Processing Guarantee:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? selectedVisa.processingTimeAr : selectedVisa.processingTimeEn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'صلاحية الدخول:' : 'Entry Validity:'}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? selectedVisa.validityAr : selectedVisa.validityEn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'أقصى مدة إقامة:' : 'Max Stay:'}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? selectedVisa.stayAr : selectedVisa.stayEn}
                </span>
              </div>
            </div>

            {/* Strict Document Checklist instructions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
              <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'أمان التقديم والمستندات' : 'Document Checklist Info'}</span>
              </h5>
              <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
                {isAr 
                  ? 'جميع مستنداتك المرفوعة يتم تشفيرها محلياً وفحص دقتها لمنع الرفض. سداد رسوم الفيزا مضمون ومسترد بالكامل في حالة الرفض النادرة للغاية.'
                  : 'All files are locally encrypted and verified to prevent rejection. Consular fee payments are guaranteed and 100% refundable in the rare event of visa denial.'}
              </p>
              <div className="space-y-1.5 pt-1">
                {(isAr ? selectedVisa.requirementsAr : selectedVisa.requirementsEn).map((req, idx) => (
                  <div key={idx} className="flex gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                    <span className="font-extrabold text-indigo-500">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right actual application forms */}
          <form onSubmit={handleApplyVisa} className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs space-y-6">
            <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800/50 pb-3 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-500" />
              <span>{isAr ? 'طلب التقديم الفوري على تأشيرة معتمدة' : 'Official Electronic Visa Application Form'}</span>
            </h3>

            {/* Grid 1: Personal Profile info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'الاسم الكامل بالإنجليزية (كما في الجواز):' : 'Full Name in English (as in Passport):'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., AHMAD JASSIM AL-IRAQI"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'رقم جواز السفر (Passport No):' : 'Passport Number:'}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value)}
                    placeholder="e.g., N1234567"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'الجنسية الحالية:' : 'Current Nationality:'}
                </label>
                <input
                  type="text"
                  required
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'تاريخ الميلاد:' : 'Date of Birth:'}
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'المهنة / الوظيفة الحالية:' : 'Current Occupation:'}
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? 'تاريخ السفر التقريبي:' : 'Intended Travel Date:'}
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={intendedDate}
                  onChange={(e) => setIntendedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Travel Purpose selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'الغرض الرئيسي من الرحلة والسفر:' : 'Main Purpose of Stay:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Tourism', ar: 'سياحة وزيارة 🏖️', en: 'Tourism 🏖️' },
                  { id: 'Business', ar: 'أعمال وتجارة 💼', en: 'Business 💼' },
                  { id: 'Study', ar: 'دراسة وتعليم 🎓', en: 'Education 🎓' },
                  { id: 'Medical', ar: 'علاج واستشفاء 🏥', en: 'Medical 🏥' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTravelPurpose(p.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      travelPurpose === p.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-850'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-850 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isAr ? p.ar : p.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Document upload panels */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'إرفاق المستندات الممسوحة ضوئياً (مطلوب للقبول الفوري):' : 'Attach Passport & Document Scans (Required for Auto-Issuance):'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Passport file upload box */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'صورة الصفحة الأولى للجواز' : 'Passport Bio Page'}
                  </span>
                  
                  {passportProgress === 0 ? (
                    <button
                      type="button"
                      onClick={() => triggerFileUpload('passport', 'passport_scan.pdf')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      {isAr ? 'اختيار الملف' : 'Select File'}
                    </button>
                  ) : passportProgress < 100 ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${passportProgress}%` }}></div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? 'مرفوع جاهز ✓' : 'UPLOADED ✓'}
                    </span>
                  )}
                </div>

                {/* 2. Photo file upload box */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'صورة شخصية (بيضاء)' : 'Passport Photo'}
                  </span>

                  {photoProgress === 0 ? (
                    <button
                      type="button"
                      onClick={() => triggerFileUpload('photo', 'personal_photo.jpg')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      {isAr ? 'اختيار الملف' : 'Select File'}
                    </button>
                  ) : photoProgress < 100 ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${photoProgress}%` }}></div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? 'مرفوع جاهز ✓' : 'UPLOADED ✓'}
                    </span>
                  )}
                </div>

                {/* 3. Bank Statement upload box */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'كشف الحساب البنكي (اختياري)' : 'Bank Statement'}
                  </span>

                  {bankProgress === 0 ? (
                    <button
                      type="button"
                      onClick={() => triggerFileUpload('bank', 'bank_statement_3m.pdf')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      {isAr ? 'اختيار الملف' : 'Select File'}
                    </button>
                  ) : bankProgress < 100 ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${bankProgress}%` }}></div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? 'مرفوع جاهز ✓' : 'UPLOADED ✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom calculation and actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  {isAr 
                    ? 'هذا الحجز مجاني بالكامل بدون أي رسوم، وسيتم إصداره وتأكيده لك فورياً.' 
                    : 'This visa booking is 100% free with no charges, and will be issued instantly.'}
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'الإجمالي للخصم:' : 'Deduction Amount:'}</span>
                  <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                    0 {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode} ({isAr ? 'مجاني' : 'FREE'})
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-all shrink-0"
                >
                  {isAr ? 'تأكيد طلب الفيزا مجاناً 💳' : 'Submit Free Visa Application 💳'}
                </button>
              </div>
            </div>

          </form>

        </div>
      )}

      {/* State Loader Screen during processing */}
      {isProcessing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <Globe className="w-6 h-6 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              {isAr ? 'جاري معالجة وإصدار تأشيرة السفر المعتمدة...' : 'Processing & Securing Destination e-Visa...'}
            </h4>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold animate-pulse">
              {processingStage}
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[10px] text-slate-400 max-w-sm leading-relaxed">
            {isAr 
              ? 'يرجى عدم إغلاق هذه الصفحة أو تحديث المتصفح، يتم تأمين طلبك في أنظمة التأشيرات الدولية الموحدة.' 
              : 'Please do not refresh or navigate away. Your secure payload is registering in global consolidated systems.'}
          </div>
        </div>
      )}

      {/* Issued Official e-Visa Panel */}
      {issuedVisa && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Top alert badge success */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <h5 className="font-black text-sm">{isAr ? 'تهانينا! تم إصدار التأشيرة بنجاح تام' : 'Congratulations! Visa Issued Successfully'}</h5>
              <p className="text-[11px] opacity-90">
                {isAr 
                  ? 'تم تسجيل التأشيرة الإلكترونية بشكل رسمي وتفعيلها جاهزة للسفر والطباعة فورياً.' 
                  : 'Your tourist eVisa is officially active in GDS databases and fully authorized for travel.'}
              </p>
            </div>
          </div>

          {/* Golden Passport Sticker Frame / Approved Visa */}
          <div className="bg-slate-50 dark:bg-slate-950 border-4 border-double border-indigo-200 dark:border-indigo-900 rounded-3xl p-6 relative overflow-hidden shadow-lg select-none">
            
            {/* Soft decorative background stamp hologram */}
            <div className="absolute right-10 bottom-10 opacity-5 dark:opacity-[0.03] pointer-events-none rotate-12">
              <Globe className="w-96 h-96" />
            </div>

            {/* Official Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-indigo-100 dark:border-indigo-950 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{issuedVisa.country.flag}</span>
                <div className="text-center sm:text-left">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    {issuedVisa.country.nameEn} ELECTRONIC TRAVEL VISA
                  </h3>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {isAr ? 'جمهورية التقديم وسلطة الهجرة والمنافذ الموحدة' : 'Ministry of Interior & International Border Security'}
                  </p>
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-black flex items-center gap-1.5 uppercase font-mono animate-pulse">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'مقبول / جاهز للسفر' : 'APPROVED'}</span>
              </div>
            </div>

            {/* Visa core data details */}
            <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-xs">
              
              {/* Profile card photo box */}
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl gap-3">
                <div className="w-24 h-28 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden">
                  <User className="w-10 h-10 text-slate-300" />
                  <span className="text-[8px] uppercase tracking-widest font-black text-slate-400 block absolute bottom-2">
                    {isAr ? 'الصورة المعتمدة' : 'BIOMETRIC'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 uppercase block">{isAr ? 'مرجع الطلب الموحد:' : 'Visa Reference:'}</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
                    {issuedVisa.refNo}
                  </span>
                </div>
              </div>

              {/* Passenger Info Grid */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'اسم المسافر بالكامل:' : 'Traveler Full Name:'}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white block uppercase">{issuedVisa.fullName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'رقم وثيقة السفر:' : 'Passport Booklet No:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block font-mono uppercase">{issuedVisa.passportNo}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'الجنسية المسجلة:' : 'Registered Nationality:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{issuedVisa.nationality}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'نوع التأشيرة الصادرة:' : 'Visa Type / Class:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{isAr ? issuedVisa.country.visaTypeAr : issuedVisa.country.visaTypeEn}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'تاريخ الإصدار الفعلي:' : 'Date of Issuance:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block font-mono">{issuedVisa.issueDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'تاريخ انتهاء الصلاحية:' : 'Date of Expiration:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block font-mono text-rose-500">{issuedVisa.expiryDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'عدد مرات الدخول:' : 'Entries Allowed:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{isAr ? 'متعدد الدخول (سياحي)' : 'Multiple Entries'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">{isAr ? 'رقم التأشيرة الموحد:' : 'Visa Certificate No:'}</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 block font-mono">{issuedVisa.visaNo}</span>
                </div>
              </div>

            </div>

            {/* Bottom barcode and footer details */}
            <div className="border-t border-indigo-100 dark:border-indigo-950 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-[9px] text-slate-400 leading-relaxed max-w-md text-center sm:text-left">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? '🚨 تنبيهات أمن السفر والمطارات المعتمدة:' : '🚨 Essential Airport & Security Directives:'}
                </p>
                <p>
                  {isAr 
                    ? '١. هذه التأشيرة تصدر إلكترونياً ولا تتطلب ملصق جواز مادي للبلدان المدعومة.' 
                    : '1. This eVisa is registered electronically and requires no physical sticker for supported ports.'}
                </p>
                <p>
                  {isAr 
                    ? '٢. أحضر نسخة مطبوعة من هذه الشهادة لتقديمها لضباط الجوازات والمنافذ الدولية.' 
                    : '2. Present a clear printout of this certificate at flight check-in and destination border gates.'}
                </p>
              </div>

              {/* Barcode block */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center shrink-0">
                <div className="flex gap-0.5">
                  <div className="w-1 h-7 bg-black"></div>
                  <div className="w-0.5 h-7 bg-black"></div>
                  <div className="w-1.5 h-7 bg-black"></div>
                  <div className="w-2 h-7 bg-black"></div>
                  <div className="w-0.5 h-7 bg-black"></div>
                  <div className="w-1 h-7 bg-black"></div>
                  <div className="w-1.5 h-7 bg-black"></div>
                  <div className="w-0.5 h-7 bg-black"></div>
                  <div className="w-1 h-7 bg-black"></div>
                  <div className="w-2 h-7 bg-black"></div>
                  <div className="w-0.5 h-7 bg-black"></div>
                </div>
                <span className="text-[8px] font-mono tracking-widest font-bold mt-1 text-slate-900">
                  *{issuedVisa.refNo}*
                </span>
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة شهادة الفيزا الورقية' : 'Print Visa Certificate'}</span>
            </button>
            <button
              onClick={resetVisaFlow}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Globe className="w-4 h-4" />
              <span>{isAr ? 'التقديم لبلد آخر' : 'Apply for Another Country'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
