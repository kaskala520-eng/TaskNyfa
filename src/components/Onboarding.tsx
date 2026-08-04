import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Search, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  MapPin, 
  Clock, 
  DollarSign, 
  Phone, 
  Link as LinkIcon, 
  Award, 
  FileText, 
  Info,
  Sparkles,
  ShoppingBag,
  Plus
} from 'lucide-react';
import { OnboardingData, RegisteredUser, CountryConfig } from '../types';
import { COUNTRIES } from '../mockData';

interface OnboardingProps {
  lang: 'ar' | 'en';
  currentUser: RegisteredUser | null;
  onComplete: (data: OnboardingData) => void;
  onCancel?: () => void;
  isEditing?: boolean; // if accessed from profile
}

// Category structure with Arabic and English translation
export const SERVICE_CATEGORIES = [
  {
    id: 'general_services_group',
    nameAr: 'الخدمات العامة والشاملة 🌐',
    nameEn: 'General & Comprehensive Services 🌐',
    items: [
      { id: 'general_services', nameAr: 'خدمات عامة (تلقي جميع الإشعارات والتخصصات)', nameEn: 'General Services (All Specialties & Notifications)' }
    ]
  },
  {
    id: 'academic_education',
    nameAr: 'الأقسام والتخصصات الدراسية 🎓',
    nameEn: 'Academic & Educational Departments 🎓',
    items: [
      { id: 'edu_school', nameAr: 'معلم مدرسة (ابتدائي/ثانوي)', nameEn: 'School Teacher (Primary/Secondary)' },
      { id: 'edu_tutor', nameAr: 'مدرس خصوصي ومقويات', nameEn: 'Private Tutor' },
      { id: 'edu_medicine', nameAr: 'قسم العلوم الطبية والصيدلة والتمريض', nameEn: 'Medical, Pharmacy & Nursing Dept' },
      { id: 'edu_engineering', nameAr: 'قسم الهندسة والعمارة والبرمجيات', nameEn: 'Engineering, Architecture & Software Dept' },
      { id: 'edu_sciences_pure', nameAr: 'قسم العلوم الصرفة (رياضيات/فيزياء/كيمياء)', nameEn: 'Pure Sciences Dept (Math/Physics/Chemistry)' },
      { id: 'edu_computer_science', nameAr: 'قسم علوم الحاسوب وتكنولوجيا المعلومات', nameEn: 'Computer Science & IT Dept' },
      { id: 'edu_law_politics', nameAr: 'قسم القانون والعلوم السياسية والشريعة', nameEn: 'Law, Political Science & Sharia Dept' },
      { id: 'edu_business_economy', nameAr: 'قسم الإدارة والاقتصاد والمحاسبة', nameEn: 'Administration, Economics & Accounting Dept' },
      { id: 'edu_humanities', nameAr: 'قسم العلوم الإنسانية (تاريخ/جغرافيا/علم اجتماع)', nameEn: 'Humanities Dept (History/Geography/Sociology)' },
      { id: 'edu_languages', nameAr: 'قسم اللغات والترجمة (عربي/إنجليزي/فرنسي)', nameEn: 'Languages & Translation Dept (Ar/En/Fr)' },
      { id: 'edu_islamic_studies', nameAr: 'قسم الدراسات الإسلامية والقرآن الكريم', nameEn: 'Islamic Studies & Holy Quran Dept' },
      { id: 'edu_special_education', nameAr: 'قسم التربية الخاصة وصعوبات التعلم', nameEn: 'Special Education Dept' },
      { id: 'edu_sports_physical', nameAr: 'قسم التربية الرياضية والتدريب البدني', nameEn: 'Physical Education & Sports Dept' },
      { id: 'edu_fine_arts', nameAr: 'قسم الفنون الجميلة والمسرح والموسيقى', nameEn: 'Fine Arts, Music & Theater Dept' },
    ]
  },
  {
    id: 'cleaning_and_domestic',
    nameAr: 'أقسام التنظيف والخدمات المنزلية 🧹',
    nameEn: 'Cleaning & Domestic Departments 🧹',
    items: [
      { id: 'clean_house', nameAr: 'تنظيف شقق ومنازل يومي/دوري', nameEn: 'House & Apartment Cleaning' },
      { id: 'clean_female', nameAr: 'عاملة تنظيف (أنثى) - خدمة منزلية', nameEn: 'Female House Cleaner' },
      { id: 'clean_male', nameAr: 'عامل تنظيف (ذكر) - للأعمال الشاقة', nameEn: 'Male House Cleaner' },
      { id: 'clean_offices', nameAr: 'تنظيف مكاتب ومؤسسات شركات', nameEn: 'Office & Business Cleaning' },
      { id: 'clean_sofa', nameAr: 'غسيل سجاد وكنب وتلميع أرضيات', nameEn: 'Carpet, Sofa & Floor Polishing' },
      { id: 'clean_deep', nameAr: 'تنظيف عميق شامل (بعد البناء والترميم)', nameEn: 'Post-Construction Deep Cleaning' },
      { id: 'clean_nanny', nameAr: 'مربية أطفال وحاضنة منزلية', nameEn: 'Nanny & Babysitter' },
      { id: 'clean_elderly', nameAr: 'رعاية ومرافقة كبار السن والمرضى منزلياً', nameEn: 'Elderly Home Care' },
      { id: 'clean_chef', nameAr: 'طباخ منزلي / شيف لإعداد الوجبات والحفلات', nameEn: 'Home Cook & Catering Chef' },
      { id: 'clean_disinfect', nameAr: 'تعقيم وتطهير ومكافحة حشرات', nameEn: 'Sanitization & Pest Control' },
    ]
  },
  {
    id: 'tech',
    nameAr: 'التقنية والبرمجة 💻',
    nameEn: 'Tech & Programming 💻',
    items: [
      { id: 'tech_web', nameAr: 'مطور مواقع وتطبيقات ويب', nameEn: 'Web Developer' },
      { id: 'tech_app', nameAr: 'مطور تطبيقات هواتف ذكية', nameEn: 'App Developer' },
      { id: 'tech_games', nameAr: 'مطور ألعاب تفاعلية', nameEn: 'Game Developer' },
      { id: 'tech_ai', nameAr: 'مطور ذكاء اصطناعي ونظم ذكية', nameEn: 'AI Developer' },
      { id: 'tech_se', nameAr: 'مهندس برمجيات ونظم', nameEn: 'Software Engineer' },
      { id: 'tech_networks', nameAr: 'مسؤول شبكات سلكية ولاسلكية', nameEn: 'Network Administrator' },
      { id: 'tech_cyber', nameAr: 'مسؤول أمن سيبراني وحماية سيرفرات', nameEn: 'Cybersecurity Analyst' },
      { id: 'tech_support', nameAr: 'دعم فني وصيانة حاسوب وهواتف', nameEn: 'Technical Support' },
      { id: 'tech_data', nameAr: 'محلل بيانات وإحصاء', nameEn: 'Data Analyst' },
    ]
  },
  {
    id: 'design',
    nameAr: 'التصميم والإبداع 🎨',
    nameEn: 'Design & Creative 🎨',
    items: [
      { id: 'des_graphic', nameAr: 'مصمم جرافيك وبنرات', nameEn: 'Graphic Designer' },
      { id: 'des_logos', nameAr: 'مصمم شعارات وهوية بصرية', nameEn: 'Logo & Branding Designer' },
      { id: 'des_uiux', nameAr: 'مصمم واجهات مستخدم UI/UX', nameEn: 'UI/UX Designer' },
      { id: 'des_interior', nameAr: 'مصمم ديكور داخلي ومعماري', nameEn: 'Interior Designer' },
      { id: 'des_fashion', nameAr: 'مصمم أزياء وملابس', nameEn: 'Fashion Designer' },
      { id: 'des_artist', nameAr: 'رسام ومصمم لوحات وموشن', nameEn: 'Illustrator / Artist' },
      { id: 'des_video', nameAr: 'محرر فيديو ومونتير ومؤثرات', nameEn: 'Video Editor' },
      { id: 'des_photo', nameAr: 'مصور فوتوغرافي محترف', nameEn: 'Photographer' },
      { id: 'des_videography', nameAr: 'مصور فيديو وتغطية مناسبات', nameEn: 'Videographer' },
      { id: 'des_content_creator', nameAr: 'صانع محتوى رقمي وسوشيال ميديا', nameEn: 'Content Creator' },
      { id: 'des_writer', nameAr: 'كاتب محتوى وسيناريو ومقالات', nameEn: 'Content Writer' },
      { id: 'des_translator', nameAr: 'مترجم لغات معتمد', nameEn: 'Translator' },
    ]
  },
  {
    id: 'business',
    nameAr: 'الأعمال والإدارة والمالية 👔',
    nameEn: 'Business, Management & Finance 👔',
    items: [
      { id: 'biz_assistant', nameAr: 'مساعد شخصي وإداري', nameEn: 'Personal Assistant' },
      { id: 'biz_secretary', nameAr: 'سكرتارية وإدخال بيانات', nameEn: 'Secretary & Data Entry' },
      { id: 'biz_pm', nameAr: 'مدير مشاريع ومخطط استراتيجي', nameEn: 'Project Manager' },
      { id: 'biz_consultant', nameAr: 'مستشار أعمال وتطوير شركات', nameEn: 'Business Consultant' },
      { id: 'biz_accountant', nameAr: 'محاسب مالي وإعداد ميزانيات', nameEn: 'Accountant' },
      { id: 'biz_auditor', nameAr: 'مدقق حسابات ومراجع مالي', nameEn: 'Auditor' },
      { id: 'biz_sales', nameAr: 'موظف مبيعات ومعارض', nameEn: 'Sales Representative' },
      { id: 'biz_agent', nameAr: 'مندوب مبيعات خارجي وتوزيع', nameEn: 'Sales Agent' },
      { id: 'biz_cs', nameAr: 'خدمة عملاء وتلقي شكاوى واتصالات', nameEn: 'Customer Service' },
      { id: 'biz_marketing', nameAr: 'أخصائي تسويق وحملات إعلانية', nameEn: 'Marketing Manager' },
      { id: 'biz_digital', nameAr: 'مسوق إلكتروني وإدارة ممول', nameEn: 'Digital Marketer' },
    ]
  },
  {
    id: 'law',
    nameAr: 'القانون والاستشارات ⚖️',
    nameEn: 'Law & Consulting ⚖️',
    items: [
      { id: 'law_lawyer', nameAr: 'محامي استشارات ومرافعات محاكم', nameEn: 'Lawyer' },
      { id: 'law_consultant', nameAr: 'مستشار قانوني للشركات والأفراد', nameEn: 'Legal Consultant' },
      { id: 'law_contracts', nameAr: 'صياغة عقود واتفاقيات قانونية', nameEn: 'Contract Writer' },
      { id: 'law_notary', nameAr: 'موثق ومعقب معاملات رسمية', nameEn: 'Notary Public' },
    ]
  },
  {
    id: 'health',
    nameAr: 'الصحة والعافية والطب 🩺',
    nameEn: 'Health, Wellness & Medicine 🩺',
    items: [
      { id: 'health_doctor', nameAr: 'طبيب عام وأخصائي استشارات طبية', nameEn: 'Doctor' },
      { id: 'health_radiology', nameAr: 'قسم الأشعة والسونار والتصوير الطبي', nameEn: 'Radiology, Ultrasound & Medical Imaging Dept' },
      { id: 'health_dentist', nameAr: 'طبيب أسنان (علاجي وتجميلي)', nameEn: 'Dentist' },
      { id: 'health_nurse', nameAr: 'ممرض رعاية صحية ومتابعة مرضى', nameEn: 'Nurse' },
      { id: 'health_pharmacist', nameAr: 'صيدلي استشارات وعلاجات', nameEn: 'Pharmacist' },
      { id: 'health_physio', nameAr: 'أخصائي علاج طبيعي وإعادة تأهيل', nameEn: 'Physiotherapist' },
      { id: 'health_nutritionist', nameAr: 'أخصائي تغذية وإنقاص وزن', nameEn: 'Nutritionist' },
      { id: 'health_fitness', nameAr: 'مدرب لياقة بدنية وبناء أجسام', nameEn: 'Fitness Trainer' },
    ]
  },
  {
    id: 'home_maintenance',
    nameAr: 'أقسام الصيانة والمهن الفنية 🛠️',
    nameEn: 'Maintenance & Technical Trades 🛠️',
    items: [
      { id: 'maint_electrician', nameAr: 'كهربائي منازل وتأسيسات كهربائية', nameEn: 'Electrician' },
      { id: 'maint_plumber', nameAr: 'سباك (تأسيسات صحية ومائية)', nameEn: 'Plumber' },
      { id: 'maint_carpenter', nameAr: 'نجار (تركيب وصيانة غرف وأبواب)', nameEn: 'Carpenter' },
      { id: 'maint_blacksmith', nameAr: 'حداد (أبواب، شبابيك، وهياكل حديد)', nameEn: 'Blacksmith' },
      { id: 'maint_ac', nameAr: 'فني صيانة وتنظيف وتأسيس تكييف سبليت', nameEn: 'AC Technician' },
      { id: 'maint_appliances', nameAr: 'فني صيانة غسالات وثلاجات وأجهزة منزلية', nameEn: 'Appliance Technician' },
      { id: 'maint_gardener', nameAr: 'بستاني وتنسيق حدائق وقص أشجار', nameEn: 'Gardener' },
      { id: 'maint_painter', nameAr: 'دهان وصباغ منازل وديكورات جدران', nameEn: 'House Painter' },
      { id: 'maint_cctv', nameAr: 'تركيب وصيانة كاميرات مراقبة وأجهزة إنذار', nameEn: 'CCTV Technician' },
      { id: 'maint_builder', nameAr: 'بناء ومعماري وعمال إنشائية', nameEn: 'Builder & Mason' },
    ]
  },
  {
    id: 'transport',
    nameAr: 'النقل والتوصيل والخدمات اللوجستية 🚗',
    nameEn: 'Transport, Delivery & Logistics 🚗',
    items: [
      { id: 'trans_driver', nameAr: 'سائق خاص وعائلي', nameEn: 'Private Driver' },
      { id: 'trans_delivery', nameAr: 'سائق توصيل طلبات وطرود (دليفري)', nameEn: 'Delivery Driver' },
      { id: 'trans_truck', nameAr: 'سائق شاحنات نقل بضائع ومعدات ثقيلة', nameEn: 'Truck Driver' },
      { id: 'trans_moving', nameAr: 'خدمات نقل وتغليف الأثاث المنزلي', nameEn: 'Furniture Mover' },
      { id: 'trans_shipping', nameAr: 'تسهيل خدمات شحن وتخليص جمركي', nameEn: 'Shipping & Logistics' },
    ]
  },
  {
    id: 'real_estate_agent',
    nameAr: 'العقارات والوساطة 🏢',
    nameEn: 'Real Estate & Brokerage 🏢',
    items: [
      { id: 're_broker', nameAr: 'وسيط عقاري (شراء، بيع، إيجار)', nameEn: 'Real Estate Broker' },
      { id: 're_manager', nameAr: 'مدير أملاك وإدارة المجمعات والشركات العقارية', nameEn: 'Property Manager' },
      { id: 're_appraiser', nameAr: 'مخمن عقاري معتمد', nameEn: 'Property Appraiser' },
    ]
  },
  {
    id: 'retail',
    nameAr: 'التجارة والمبيعات والتموين 🛍️',
    nameEn: 'Retail, Sales & Supply 🛍️',
    items: [
      { id: 'ret_clothes', nameAr: 'بائع ملابس وأزياء', nameEn: 'Clothing Retailer' },
      { id: 'ret_electronics', nameAr: 'بائع وموزع أجهزة إلكترونية', nameEn: 'Electronics Retailer' },
      { id: 'ret_phones', nameAr: 'بائع وصيانة هواتف واكسسوارات', nameEn: 'Phone Retailer' },
      { id: 'ret_cars', nameAr: 'معرض بيع وشراء وسيارات', nameEn: 'Car Dealer' },
      { id: 'ret_furniture', nameAr: 'بائع ومعرض أثاث منزلي ومكتبي', nameEn: 'Furniture Retailer' },
      { id: 'ret_food', nameAr: 'محل تجاري ومواد غذائية (سوبرماركت)', nameEn: 'Grocer & Food Retailer' },
      { id: 'ret_ecom', nameAr: 'إدارة وتأسيس متاجر إلكترونية', nameEn: 'E-commerce Shop Manager' },
      { id: 'ret_wholesaler', nameAr: 'تاجر جملة وموزع رئيسي', nameEn: 'Wholesaler' },
      { id: 'ret_retailer', nameAr: 'تاجر تجزئة', nameEn: 'Retailer' },
      { id: 'ret_supplier', nameAr: 'مورد سلع ومواد أولية للصناعات', nameEn: 'Supplier' },
    ]
  },
  {
    id: 'crafts',
    nameAr: 'الحرف والصناعات اليدوية 🧵',
    nameEn: 'Crafts & Industries 🧵',
    items: [
      { id: 'cr_tailor', nameAr: 'خياط وتفصيل ملابس رجالية/نسائية', nameEn: 'Tailor' },
      { id: 'cr_goldsmith', nameAr: 'صائغ مجوهرات وذهب ومعادن ثمينة', nameEn: 'Goldsmith' },
      { id: 'cr_furniture_maker', nameAr: 'صانع ومصمم أثاث خشبي وديكور', nameEn: 'Furniture Maker' },
      { id: 'cr_handicraft', nameAr: 'صناعة المشغولات والتحف اليدوية والتقليدية', nameEn: 'Handicraft Maker' },
    ]
  },
  {
    id: 'events',
    nameAr: 'المناسبات والاحتفالات والضيافة 🎈',
    nameEn: 'Events, Catering & Hospitality 🎈',
    items: [
      { id: 'ev_planner', nameAr: 'منظم ومنسق حفلات ومناسبات وتخرج', nameEn: 'Party Planner' },
      { id: 'ev_coordinator', nameAr: 'منسق قاعات ومؤتمرات وفعاليات', nameEn: 'Event Coordinator' },
      { id: 'ev_dj', nameAr: 'منسق دي جي ومؤثرات صوتية وإضاءة', nameEn: 'DJ & Sound Tech' },
      { id: 'ev_hospitality', nameAr: 'تقديم خدمات الضيافة والقهوة والمناسبات', nameEn: 'Hospitality & Catering Server' },
      { id: 'ev_hotel_receptionist', nameAr: 'موظف أو موظفة استقبال في الفنادق', nameEn: 'Hotel Receptionist' },
      { id: 'ev_restaurant_staff', nameAr: 'موظف أو موظفة في مطعم', nameEn: 'Restaurant Staff / Server' },
    ]
  },
  {
    id: 'beauty',
    nameAr: 'الجمال والعناية الشخصية 💅',
    nameEn: 'Beauty & Personal Care 💅',
    items: [
      { id: 'bt_barber', nameAr: 'حلاق رجالي وأطفال وصالون', nameEn: 'Barber' },
      { id: 'bt_hairdresser', nameAr: 'كوافيرة نسائية ومصففة شعر', nameEn: 'Hairdresser & Stylist' },
      { id: 'bt_makeup', nameAr: 'خبير وخبيرة تجميل وميك آب', nameEn: 'Makeup Artist' },
      { id: 'bt_nails', nameAr: 'فني وأخصائي عناية بالأظافر واليدين', nameEn: 'Nail Technician' },
      { id: 'bt_spa', nameAr: 'معالج سبا ومساج وتدليك استرخائي', nameEn: 'Spa & Massage Therapist' },
    ]
  },
  {
    id: 'agriculture',
    nameAr: 'الزراعة والبيطرة والحيوانات 🌾',
    nameEn: 'Agriculture & Veterinary 🌾',
    items: [
      { id: 'agr_farmer', nameAr: 'مزارع ومربي نباتات ومحاصيل', nameEn: 'Farmer' },
      { id: 'agr_engineer', nameAr: 'مهندس زراعي واستشارات تربة وسماد', nameEn: 'Agricultural Engineer' },
      { id: 'agr_livestock', nameAr: 'مربي مواشي وطيور ومنتج دواجن وألبان', nameEn: 'Livestock Breeder' },
      { id: 'agr_vet', nameAr: 'طبيب بيطري وصحة حيوانية', nameEn: 'Veterinary Doctor' },
    ]
  },
  {
    id: 'other_services',
    nameAr: 'خدمات عامة أخرى 📁',
    nameEn: 'Other Services 📁',
    items: [
      { id: 'oth_writer', nameAr: 'كاتب ومراجع لغوي', nameEn: 'Writer & Proofreader' },
      { id: 'oth_researcher', nameAr: 'باحث أكاديمي وإعداد تقارير ودراسات', nameEn: 'Academic Researcher' },
      { id: 'oth_advisor', nameAr: 'مستشار توجيه وتطوير ذاتي ومهني', nameEn: 'Advisor & Career Coach' },
      { id: 'oth_data_entry', nameAr: 'موظف إدخال بيانات وتنسيق ملفات', nameEn: 'Data Entry Clerk' },
      { id: 'oth_freelancer', nameAr: 'عمل حر / مستقل (Freelancer)', nameEn: 'Freelancer' },
      { id: 'oth_custom', nameAr: 'خدمة مخصصة أخرى (يمكنك كتابتها يدوياً)', nameEn: 'Other (Write your custom service)' },
    ]
  }
];

export const PRODUCT_CATEGORIES = [
  { id: 'prod_electronics', nameAr: 'الإلكترونيات', nameEn: 'Electronics' },
  { id: 'prod_phones', nameAr: 'الهواتف', nameEn: 'Phones' },
  { id: 'prod_computers', nameAr: 'أجهزة الكمبيوتر', nameEn: 'Computers' },
  { id: 'prod_clothing', nameAr: 'الملابس', nameEn: 'Clothing' },
  { id: 'prod_shoes', nameAr: 'الأحذية', nameEn: 'Shoes' },
  { id: 'prod_furniture', nameAr: 'الأثاث', nameEn: 'Furniture' },
  { id: 'prod_cars', nameAr: 'السيارات', nameEn: 'Cars' },
  { id: 'prod_bikes', nameAr: 'الدراجات', nameEn: 'Bikes' },
  { id: 'prod_real_estate', nameAr: 'العقارات', nameEn: 'Real Estate' },
  { id: 'prod_household', nameAr: 'الأدوات المنزلية', nameEn: 'Household Items' },
  { id: 'prod_electrical', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances' },
  { id: 'prod_food', nameAr: 'المواد الغذائية', nameEn: 'Foodstuffs' },
  { id: 'prod_books', nameAr: 'الكتب', nameEn: 'Books' },
  { id: 'prod_toys', nameAr: 'الألعاب', nameEn: 'Toys & Games' },
  { id: 'prod_industrial', nameAr: 'المعدات الصناعية', nameEn: 'Industrial Equipment' },
  { id: 'prod_agricultural', nameAr: 'المعدات الزراعية', nameEn: 'Agricultural Equipment' },
  { id: 'prod_pets', nameAr: 'الحيوانات الأليفة', nameEn: 'Pets' },
  { id: 'prod_cosmetics', nameAr: 'مستحضرات التجميل', nameEn: 'Cosmetics' },
  { id: 'prod_jewelry', nameAr: 'المجوهرات', nameEn: 'Jewelry' },
  { id: 'prod_medicines', nameAr: 'الأدوية', nameEn: 'Medicines & Pharmaceuticals' },
  { id: 'prod_medical_tools', nameAr: 'الأدوات والمستلزمات الطبية', nameEn: 'Medical Tools & Supplies' },
  { id: 'prod_other', nameAr: 'أخرى', nameEn: 'Other Products' }
];

export default function Onboarding({
  lang,
  currentUser,
  onComplete,
  onCancel,
  isEditing = false,
  selectedCountry
}: OnboardingProps & { selectedCountry?: CountryConfig }) {
  const isAr = lang === 'ar';

  // Initialize state with previous data if editing
  const [step, setStep] = useState<number>(1);
  const [purpose, setPurpose] = useState<'provide' | 'search' | 'both'>(
    currentUser?.onboarding?.purpose || 'both'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser?.onboarding?.selectedCategories || []
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    currentUser?.onboarding?.selectedProducts || []
  );
  
  // Custom manual service input
  const [customService, setCustomService] = useState<string>('');
  const [customServicesList, setCustomServicesList] = useState<string[]>(
    currentUser?.onboarding?.selectedCategories?.filter(c => !SERVICE_CATEGORIES.some(cat => cat.items.some(item => item.id === c))) || []
  );

  // Parse initial location if present
  const initialLocation = currentUser?.onboarding?.location || '';
  let initialCountry = selectedCountry || COUNTRIES.find(c => c.id === 'IQ') || COUNTRIES[0];
  let initialProvince = '';
  let initialArea = '';

  if (initialLocation) {
    const parts = initialLocation.split(/[،,]\s*/).map(p => p.trim());
    if (parts.length >= 2) {
      const countryPart = parts[parts.length - 1];
      const foundCountry = COUNTRIES.find(c => c.nameAr === countryPart || c.nameEn === countryPart || c.id === countryPart);
      if (foundCountry) {
        initialCountry = foundCountry;
      }
      initialProvince = parts[parts.length - 2];
      if (parts.length > 2) {
        initialArea = parts.slice(0, parts.length - 2).join('، ');
      }
    } else {
      initialArea = initialLocation;
    }
  }

  // Additional Information States
  const [experienceYears, setExperienceYears] = useState<number>(
    currentUser?.onboarding?.experienceYears || 0
  );
  const [bio, setBio] = useState<string>(
    currentUser?.onboarding?.bio || ''
  );
  
  const [locCountry, setLocCountry] = useState<CountryConfig>(initialCountry);
  const [locProvince, setLocProvince] = useState<string>(initialProvince);
  const [locArea, setLocArea] = useState<string>(initialArea);
  
  const [location, setLocation] = useState<string>(initialLocation);

  React.useEffect(() => {
    const countryName = isAr ? locCountry.nameAr : locCountry.nameEn;
    let combined = '';
    if (locArea && locProvince) {
      combined = `${locArea}، ${locProvince}، ${countryName}`;
    } else if (locProvince) {
      combined = `${locProvince}، ${countryName}`;
    } else if (locArea) {
      combined = `${locArea}، ${countryName}`;
    } else {
      combined = countryName;
    }
    setLocation(combined);
  }, [locCountry.id, locProvince, locArea, isAr, locCountry.nameAr, locCountry.nameEn]);

  const [workMode, setWorkMode] = useState<'remote' | 'in_person' | 'both'>(
    currentUser?.onboarding?.workMode || 'both'
  );
  const [workingHours, setWorkingHours] = useState<string>(
    currentUser?.onboarding?.workingHours || ''
  );
  const [price, setPrice] = useState<string>(
    currentUser?.onboarding?.price || ''
  );
  const [contactPhone, setContactPhone] = useState<string>(
    currentUser?.onboarding?.contactPhone || currentUser?.phone || ''
  );
  const [phoneVisibility, setPhoneVisibility] = useState<'everyone' | 'only_accepted' | 'only_admin'>(
    currentUser?.phoneVisibility || currentUser?.onboarding?.phoneVisibility || 'only_accepted'
  );
  const [contactMethods, setContactMethods] = useState<string[]>(
    currentUser?.onboarding?.contactMethods || ['phone']
  );
  const [portfolioLink, setPortfolioLink] = useState<string>('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(
    currentUser?.onboarding?.portfolioLinks || []
  );
  const [certificates, setCertificates] = useState<string>(
    currentUser?.onboarding?.certificates || ''
  );

  const [expandedSection, setExpandedSection] = useState<string | null>('education');

  // Handle manual category addition
  const handleAddCustomService = () => {
    if (customService.trim()) {
      const formatted = `custom_${customService.trim()}`;
      if (!customServicesList.includes(formatted)) {
        setCustomServicesList(prev => [...prev, formatted]);
        setSelectedCategories(prev => [...prev, formatted]);
      }
      setCustomService('');
    }
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  const handleToggleProduct = (prodId: string) => {
    setSelectedProducts(prev => 
      prev.includes(prodId) 
        ? prev.filter(p => p !== prodId)
        : [...prev, prodId]
    );
  };

  const handleAddPortfolio = () => {
    if (portfolioLink.trim() && !portfolioLinks.includes(portfolioLink.trim())) {
      setPortfolioLinks(prev => [...prev, portfolioLink.trim()]);
      setPortfolioLink('');
    }
  };

  const handleRemovePortfolio = (link: string) => {
    setPortfolioLinks(prev => prev.filter(l => l !== link));
  };

  const handleSubmit = () => {
    // Combine standard selected categories + custom ones
    const finalCategories = [
      ...selectedCategories.filter(c => !c.startsWith('custom_')),
      ...customServicesList
    ];

    const finalData: OnboardingData = {
      purpose,
      selectedCategories: finalCategories,
      selectedProducts,
      experienceYears,
      bio,
      location,
      countryId: locCountry.id,
      workMode,
      workingHours,
      price,
      contactPhone,
      phoneVisibility,
      contactMethods,
      portfolioLinks,
      certificates
    };

    onComplete(finalData);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-right sm:text-right" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl w-full mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
        
        {/* Header Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{isAr ? 'إعداد الحساب الذكي 🚀' : 'Smart Account Setup 🚀'}</span>
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {isEditing 
                  ? (isAr ? 'تحديث الملف المهني والخدمات' : 'Update Services & Professional Profile')
                  : (isAr ? 'خطوة الإعداد الأولية والمصالح' : 'Let\'s set up your custom profile')}
              </h1>
            </div>
            {isEditing && onCancel && (
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer transition"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
              <div 
                style={{ width: `${(step / 4) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-300"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-1.5">
              <span>{isAr ? '١. نوع الحساب' : '1. Account Purpose'}</span>
              <span>{isAr ? '٢. تحديد الفئات والخدمات' : '2. Categories'}</span>
              <span>{isAr ? '٣. المنتجات' : '3. Products'}</span>
              <span>{isAr ? '٤. التفاصيل الإضافية' : '4. Detail Profile'}</span>
            </div>
          </div>
        </div>

        {/* Form Body with Animations */}
        <div className="min-h-[350px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: isAr ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -30 : 30 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    <span>{isAr ? 'ما الغرض من استخدامك للموقع؟' : 'What is the purpose of using the site?'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr 
                      ? 'حدد هدفك لمساعدتنا على توجيهك وتخصيص تجربتك بشكل كامل.' 
                      : 'Choose your focus to help us customize your experience and target queries.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Option 1: Provide */}
                  <div 
                    onClick={() => setPurpose('provide')}
                    className={`border-2 p-6 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center space-y-4 ${
                      purpose === 'provide' 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-4 rounded-full ${purpose === 'provide' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'أقدم خدمات أو منتجات' : 'I offer services / products'}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {isAr ? 'مقدم خدمات، تاجر، صانع محتوى أو باحث عن عملاء.' : 'Freelancer, trader, business owner, or client seeker.'}
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Search */}
                  <div 
                    onClick={() => setPurpose('search')}
                    className={`border-2 p-6 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center space-y-4 ${
                      purpose === 'search' 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-4 rounded-full ${purpose === 'search' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <Search className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'أبحث عن خدمات أو منتجات' : 'I look for services / products'}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {isAr ? 'زبون، مستهلك، أو باحث عن مقدمي خدمات ومستشارين.' : 'Customer, client, or looking for service providers.'}
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Both */}
                  <div 
                    onClick={() => setPurpose('both')}
                    className={`border-2 p-6 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center space-y-4 ${
                      purpose === 'both' 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-4 rounded-full ${purpose === 'both' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <Layers className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'كلاهما (أقدم وأبحث)' : 'Both (Offer & Seek)'}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {isAr ? 'القيام بعرض الخدمات وفي نفس الوقت طلب واقتناء الاحتياجات.' : 'Offer your own professional skills and buy from others.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">{isAr ? 'دعم كامل للفئتين' : 'Comprehensive Dual Support'}</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400/80 leading-relaxed">
                      {isAr 
                        ? 'إذا اخترت "كلاهما"، فستتمكن من إنشاء عروض خدماتك وطلب الخدمات التي تحتاجها في الوقت نفسه بكل سلاسة وبدون عوائق.' 
                        : 'Choosing "Both" grants you simultaneous access to advertise your talent and commission other users.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: isAr ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -30 : 30 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span>{isAr ? 'تحديد اهتماماتك والخدمات 👥' : 'Select Interests & Services 👥'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {isAr 
                      ? 'سواء كنت باحثاً عن خدمات لتلبي احتياجاتك، أو مقدم مهارات لعرضها، أو كلاهما؛ يرجى تحديد التخصصات والخدمات المطلوبة أو المتاحة لديك.' 
                      : 'Whether you are seeking services, offering skills, or both; please select the categories and services matching your targets.'}
                  </p>
                </div>

                {/* Custom service manual entry */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة خدمة أو مهارة مخصصة يدويًا:' : 'Add a custom service/skill manually:'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold leading-relaxed">
                      {isAr 
                        ? 'متاح لكل من يبحث أو يقدم مهارات؛ إذا لم تجد تخصصك في القوائم أدناه، اكتبه هنا ليتم تسجيله في حسابك فوراً.' 
                        : 'Available for seekers and providers alike. If your skill is not listed below, type it manually to add it to your profile.'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={isAr ? 'مثال: موظف استقبال فندق مخصص، مدرب خط عربي، إلخ...' : 'E.g., Custom hotel receptionist, Arabic calligraphy coach, etc...'}
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomService(); } }}
                      className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomService}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة' : 'Add'}</span>
                    </button>
                  </div>

                  {customServicesList.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {customServicesList.map((c, idx) => {
                        const cleanName = c.replace('custom_', '');
                        return (
                          <span 
                            key={idx} 
                            onClick={() => {
                              setCustomServicesList(prev => prev.filter(item => item !== c));
                              setSelectedCategories(prev => prev.filter(item => item !== c));
                            }}
                            className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-indigo-100 dark:border-indigo-900 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 hover:border-red-100"
                          >
                            <span>{cleanName}</span>
                            <span>&times;</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Main Accordion Lists */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const isExpanded = expandedSection === cat.id;
                    const selectedCount = cat.items.filter(item => selectedCategories.includes(item.id)).length;

                    return (
                      <div 
                        key={cat.id} 
                        className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
                      >
                        {/* Accordion Trigger Header */}
                        <div 
                          onClick={() => setExpandedSection(isExpanded ? null : cat.id)}
                          className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                              {isAr ? cat.nameAr : cat.nameEn}
                            </span>
                            {selectedCount > 0 && (
                              <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                                {selectedCount}
                              </span>
                            )}
                          </div>
                          <div>
                            {isExpanded ? (
                              <ChevronLeft className="w-4 h-4 text-slate-400 rotate-90 sm:rotate-270" />
                            ) : (
                              <ChevronLeft className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Accordion Items Drawer */}
                        {isExpanded && (
                          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {cat.items.map((item) => {
                                const isSelected = selectedCategories.includes(item.id);
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleToggleCategory(item.id)}
                                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-right sm:text-right border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                      isSelected 
                                        ? 'bg-indigo-50/70 border-indigo-400 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-300'
                                        : 'bg-white dark:bg-slate-950 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    <span>{isAr ? item.nameAr : item.nameEn}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Inline manual addition section directly under other services when 'oth_custom' is selected */}
                            {cat.id === 'other_services' && selectedCategories.includes('oth_custom') && (
                              <div className="bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-2xl p-4 space-y-3 mt-3">
                                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                                  <span className="text-xs font-black">
                                    {isAr ? 'اكتب خدمتك المخصصة لتسجيلها يدوياً:' : 'Type your custom service to add manually:'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                  {isAr 
                                    ? 'هذه الخانة مخصصة لكل من يبحث عن خدمات أو يقدمها لإضافة أي مهنة أو تخصص غير متوفر بالقائمة.' 
                                    : 'This box is for all seekers and providers to register any specific skill or specialty not listed.'}
                                </p>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder={isAr ? 'مثال: مدقق لغوي فرنسي، معلق صوتي كرتون...' : 'E.g., French translator, voice actor...'}
                                    value={customService}
                                    onChange={(e) => setCustomService(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomService(); } }}
                                    className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddCustomService}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>{isAr ? 'إضافة الخدمة' : 'Add Service'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: isAr ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -30 : 30 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-500" />
                    <span>{isAr ? 'تصنيفات المنتجات 🛍️' : 'Product Classifications 🛍️'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr 
                      ? 'إذا كنت تقدم أو تبحث عن منتجات، فيرجى تحديد تصنيفات المنتجات التي تتعامل معها.' 
                      : 'If you produce, sell, or purchase goods, identify your active domains (can select multiple).'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {PRODUCT_CATEGORIES.map((prod) => {
                    const isSelected = selectedProducts.includes(prod.id);
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold text-right sm:text-right border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-950 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{isAr ? prod.nameAr : prod.nameEn}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {isAr 
                      ? 'ملاحظة: يمكنك تخطي هذه الخطوة أو الضغط على التالي مباشرة إذا لم تكن مهتمًا بالمنتجات.' 
                      : 'Note: If products are not part of your professional scope, you can leave them empty and click Next.'}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: isAr ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? -30 : 30 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-h-[500px] overflow-y-auto pr-1"
              >
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-500" />
                    <span>{isAr ? 'التفاصيل الإضافية والخبرات' : 'Additional Profile Details'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold text-indigo-600 dark:text-indigo-400">
                    {isAr 
                      ? '⚠️ جميع الحقول في هذه الخطوة اختيارية بالكامل. يمكنك تركها فارغة وحفظ الإعداد فوراً!' 
                      : '⚠️ All fields in this step are completely optional. You can leave them empty and complete setup directly!'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Years of Experience */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? 'سنوات الخبرة:' : 'Years of Experience:'}</span>
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={experienceYears || ''}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g., 5"
                    />
                  </div>

                  {/* Enhanced Location Selection */}
                  <div className="space-y-3 col-span-1 md:col-span-2 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span>{isAr ? 'الموقع الجغرافي التفصيلي' : 'Detailed Geographic Location'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Country Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {isAr ? 'الدولة:' : 'Country:'}
                        </label>
                        <select
                          value={locCountry.id}
                          onChange={(e) => {
                            const found = COUNTRIES.find(c => c.id === e.target.value);
                            if (found) {
                              setLocCountry(found);
                              // Reset province when country changes
                              setLocProvince(found.provinces && found.provinces.length > 0 ? (isAr ? found.provinces[0].nameAr : found.provinces[0].nameEn) : '');
                            }
                          }}
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.flag} {isAr ? c.nameAr : c.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Province/Governorate Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {isAr ? 'المحافظة / الولاية:' : 'Province / Governorate:'}
                        </label>
                        {locCountry.provinces && locCountry.provinces.length > 0 ? (
                          <select
                            value={locProvince}
                            onChange={(e) => setLocProvince(e.target.value)}
                            className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">{isAr ? 'اختر محافظة...' : 'Select province...'}</option>
                            {locCountry.provinces.map(prov => (
                              <option key={prov.id} value={isAr ? prov.nameAr : prov.nameEn}>
                                {isAr ? prov.nameAr : prov.nameEn}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={locProvince}
                            onChange={(e) => setLocProvince(e.target.value)}
                            className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder={isAr ? 'أدخل اسم الولاية/المحافظة' : 'Enter state/province'}
                          />
                        )}
                      </div>

                      {/* Area Detail Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {isAr ? 'المنطقة / الحي (اختياري):' : 'Area / Neighborhood (Opt):'}
                        </label>
                        <input
                          type="text"
                          value={locArea}
                          onChange={(e) => setLocArea(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder={isAr ? 'مثال: الكرادة، المنصور' : 'E.g. Al-Mansour'}
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-950/60 p-2 rounded-lg flex items-center gap-1">
                      <span className="text-indigo-500">📍 {isAr ? 'العنوان المجمع:' : 'Formatted Location:'}</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300">{location || '...'}</span>
                    </div>
                  </div>

                  {/* Work Mode */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? 'مكان وطريقة تقديم الخدمة:' : 'Service Mode / Location:'}</span>
                    </label>
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value as any)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="both">{isAr ? 'كلاهما (عن بعد وحضوري)' : 'Both (Remote & On-site)'}</option>
                      <option value="remote">{isAr ? 'عن بعد فقط (أونلاين)' : 'Remote Only'}</option>
                      <option value="in_person">{isAr ? 'حضوري فقط (ميداني)' : 'On-site Only'}</option>
                    </select>
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? 'ساعات العمل أو المواعيد المتاحة:' : 'Available Working Hours:'}</span>
                    </label>
                    <input 
                      type="text" 
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={isAr ? 'مثال: من ٩ صباحاً وحتى ٥ مساءً' : 'E.g., 9:00 AM to 5:00 PM'}
                    />
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? 'السعر المتوقع أو معدل الأجر (اختياري):' : 'Expected Pricing / Rate (Optional):'}</span>
                    </label>
                    <input 
                      type="text" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={isAr ? 'مثال: ٢٥ ألف دينار / ساعة أو حسب الاتفاق' : 'E.g., 25,000 IQD / hr or negotiable'}
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? 'رقم الهاتف للتواصل (اختياري):' : 'Contact Phone Number (Optional):'}</span>
                    </label>
                    <input 
                      type="tel" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="E.g., 07700000000"
                    />
                  </div>

                  {/* Phone Visibility Preferences */}
                  <div className="space-y-1 md:col-span-2 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/60 mt-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {isAr ? 'تحديد من يمكنه رؤية رقم هاتفك في الموقع 🔒:' : 'Specify who can see your phone number on the platform 🔒:'}
                    </label>
                    <select
                      value={phoneVisibility}
                      onChange={(e) => setPhoneVisibility(e.target.value as any)}
                      className="w-full text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      {isAr 
                        ? '💡 ملاحظة: مدير الموقع لديه دائماً الصلاحية لرؤية معلومات التواصل الشخصية الحقيقية لضمان مصداقية التعاملات ومنع الغش.'
                        : '💡 Note: The site administrator always retains access to genuine contact details to verify transaction authenticity and prevent fraud.'}
                    </p>
                  </div>
                </div>

                {/* Bio / Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? 'نبذة تعريفية سريعة:' : 'Quick Bio / Professional Summary:'}</span>
                  </label>
                  <textarea 
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder={isAr ? 'اكتب نبذة مختصرة عن مهاراتك وسوابق أعمالك...' : 'Describe your skills, previous work, and what you offer...'}
                  />
                </div>

                {/* Certifications */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? 'الشهادات أو التراخيص الرسمية (إن وجدت):' : 'Certificates or Official Licenses (If any):'}</span>
                  </label>
                  <input 
                    type="text" 
                    value={certificates}
                    onChange={(e) => setCertificates(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder={isAr ? 'مثال: شهادة ممارسة مهنة، ترخيص نقابة المهندسين...' : 'E.g., Licensed engineer, certified tutor, etc.'}
                  />
                </div>

                {/* Work Portfolio / Images */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? 'إضافة روابط معرض الأعمال أو صور:' : 'Add Portfolio Links or Photo references:'}</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      placeholder="https://behance.net/username or drive link..."
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPortfolio(); } }}
                      className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddPortfolio}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة' : 'Add'}</span>
                    </button>
                  </div>

                  {portfolioLinks.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      {portfolioLinks.map((link, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-medium"
                        >
                          <span className="truncate max-w-[250px]">{link}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemovePortfolio(link)}
                            className="text-red-500 hover:text-red-600 text-xs font-bold px-2 cursor-pointer"
                          >
                            {isAr ? 'حذف' : 'Remove'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferences contact methods */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isAr ? 'طرق التواصل المفضلة:' : 'Preferred Contact Channels:'}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['phone', 'email', 'chat', 'telegram', 'instagram'].map((channel) => {
                      const active = contactMethods.includes(channel);
                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => {
                            setContactMethods(prev => 
                              prev.includes(channel)
                                ? (prev.length > 1 ? prev.filter(c => c !== channel) : prev)
                                : [...prev, channel]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            active 
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900' 
                              : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-850 text-slate-500'
                          }`}
                        >
                          {channel === 'phone' && (isAr ? '📞 اتصال هاتفي' : '📞 Phone Call')}
                          {channel === 'email' && (isAr ? '📧 بريد إلكتروني' : '📧 Email')}
                          {channel === 'chat' && (isAr ? '💬 دردشة المنصة' : '💬 In-App Chat')}
                          {channel === 'telegram' && (isAr ? '✈️ تليجرام' : '✈️ Telegram')}
                          {channel === 'instagram' && (isAr ? '📸 انستغرام' : '📸 Instagram')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(prev => prev - 1)}
            className={`flex items-center gap-1 px-5 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 transition ${
              step === 1 
                ? 'opacity-40 cursor-not-allowed text-slate-300' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer'
            }`}
          >
            <ChevronRight className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`} />
            <span>{isAr ? 'السابق' : 'Previous'}</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-150 dark:shadow-none transition hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
            >
              <span>{isAr ? 'التالي' : 'Next'}</span>
              <ChevronLeft className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-indigo-150 dark:shadow-none transition hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isAr ? 'حفظ وإكمال الإعداد ✨' : 'Complete Setup ✨'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
