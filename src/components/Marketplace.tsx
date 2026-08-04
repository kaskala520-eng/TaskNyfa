import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  User as UserIcon, 
  Sparkles, 
  Phone, 
  Mail, 
  Link as LinkIcon, 
  Award, 
  Clock, 
  DollarSign, 
  Check,
  ShoppingBag,
  ExternalLink,
  Info,
  Inbox,
  Send,
  Lock,
  X
} from 'lucide-react';
import { RegisteredUser, OnboardingData, CountryConfig } from '../types';
import { SERVICE_CATEGORIES, PRODUCT_CATEGORIES } from './Onboarding';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';

export interface MarketplaceOrder {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  itemName: string;
  type: 'service' | 'product';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  note?: string;
}

interface MarketplaceProps {
  lang: 'ar' | 'en';
  users: RegisteredUser[];
  currentUser: RegisteredUser | null;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  selectedCountry?: CountryConfig;
}

export default function Marketplace({
  lang,
  users,
  currentUser,
  triggerToast,
  selectedCountry
}: MarketplaceProps) {
  const isAr = lang === 'ar';

  // State managers
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterWorkMode, setFilterWorkMode] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [filterByCountryOnly, setFilterByCountryOnly] = useState<boolean>(true);

  // Details Modal State
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);

  // Firestore Marketplace Orders State
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'received' | 'sent'>('browse');

  // Request Form State
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<string>('general');
  const [requestNote, setRequestNote] = useState<string>('');
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);

  // Real-time Firestore orders listener
  useEffect(() => {
    if (!currentUser) {
      setLoadingOrders(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'marketplace_orders'), (snapshot) => {
      const list: MarketplaceOrder[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.clientId === currentUser.id || data.providerId === currentUser.id) {
          list.push({
            id: docSnap.id,
            ...data
          } as MarketplaceOrder);
        }
      });
      // Sort desc by creation date
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(list);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching marketplace orders:", error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handler to send a contact request
  const handleSendRequest = async (provider: RegisteredUser) => {
    if (!currentUser) {
      triggerToast(isAr ? 'يجب تسجيل الدخول أولاً لإرسال طلب تواصل' : 'Please log in first to send a request', 'info');
      return;
    }

    if (!currentUser.onboarding?.contactPhone) {
      triggerToast(
        isAr 
          ? 'يرجى إكمال ملفك الشخصي وإضافة رقم الهاتف أولاً في صفحة الحساب لتتمكن من إرسال طلب!' 
          : 'Please complete your profile and add your phone number first in your profile page!', 
        'info'
      );
      return;
    }

    setSubmittingRequest(true);
    try {
      let itemName = isAr ? 'طلب تواصل عام' : 'General Contact Inquiry';
      let requestType: 'service' | 'product' = 'service';

      if (selectedItemForRequest !== 'general') {
        const productMatch = PRODUCT_CATEGORIES.find(p => p.id === selectedItemForRequest);
        if (productMatch) {
          itemName = isAr ? productMatch.nameAr : productMatch.nameEn;
          requestType = 'product';
        } else {
          itemName = getCategoryName(selectedItemForRequest);
          requestType = 'service';
        }
      }

      const orderData = {
        clientId: currentUser.id,
        clientName: currentUser.name,
        clientPhone: currentUser.onboarding?.contactPhone || currentUser.phone || '',
        providerId: provider.id,
        providerName: provider.name,
        providerPhone: provider.onboarding?.contactPhone || provider.phone || '',
        itemName,
        type: requestType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        note: requestNote.trim()
      };

      await addDoc(collection(db, 'marketplace_orders'), orderData);
      triggerToast(
        isAr 
          ? 'تم إرسال طلب التواصل بنجاح! بانتظار موافقة الطرف الآخر.' 
          : 'Request sent successfully! Waiting for provider approval.', 
        'success'
      );
      setRequestNote('');
      setSelectedItemForRequest('general');
    } catch (err) {
      console.error("Error creating marketplace order:", err);
      triggerToast(isAr ? 'فشل إرسال الطلب، حاول مجدداً' : 'Failed to send request, please try again', 'info');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Handler to accept a request
  const handleAcceptRequest = async (order: MarketplaceOrder) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', order.id);
      await updateDoc(orderRef, { status: 'accepted' });
      triggerToast(
        isAr 
          ? 'تم قبول طلب التواصل بنجاح! يمكن للعميل الآن رؤية رقم هاتفك والتواصل معك.' 
          : 'Request accepted! The client can now see your phone number.', 
        'success'
      );
    } catch (err) {
      console.error("Error accepting request:", err);
      triggerToast(isAr ? 'فشل قبول الطلب، حاول مجدداً' : 'Failed to accept request, please try again', 'info');
    }
  };

  // Handler to reject a request
  const handleRejectRequest = async (order: MarketplaceOrder) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', order.id);
      await updateDoc(orderRef, { status: 'rejected' });
      triggerToast(
        isAr 
          ? 'تم رفض طلب التواصل.' 
          : 'Request rejected.', 
        'info'
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
      triggerToast(isAr ? 'فشل رفض الطلب، حاول مجدداً' : 'Failed to reject request', 'info');
    }
  };

  // Flatten service categories for easy name lookup
  const getCategoryName = (id: string) => {
    if (id.startsWith('custom_')) {
      return id.replace('custom_', '');
    }
    for (const cat of SERVICE_CATEGORIES) {
      const match = cat.items.find(item => item.id === id);
      if (match) return isAr ? match.nameAr : match.nameEn;
    }
    return id;
  };

  // Flatten product categories for easy name lookup
  const getProductName = (id: string) => {
    const match = PRODUCT_CATEGORIES.find(p => p.id === id);
    return match ? (isAr ? match.nameAr : match.nameEn) : id;
  };

  // Filter logic
  const filteredUsers = users.filter(user => {
    // Only show users who have completed their onboarding
    if (!user.onboarding) return false;

    const ob = user.onboarding;

    // Country check
    if (filterByCountryOnly && selectedCountry) {
      const activeUserCountryId = currentUser?.onboarding?.countryId || selectedCountry.id;
      const itemCountryId = ob.countryId || 'IQ';
      if (itemCountryId !== activeUserCountryId) return false;
    }

    // Search term check (name, bio, location, categories)
    const matchSearch = 
      searchTerm.trim() === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ob.bio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ob.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ob.selectedCategories.some(cat => getCategoryName(cat).toLowerCase().includes(searchTerm.toLowerCase()));

    // Purpose check
    const matchPurpose = 
      filterPurpose === 'all' ||
      ob.purpose === filterPurpose ||
      ob.purpose === 'both';

    // Service category check
    const matchCategory = 
      filterCategory === 'all' ||
      ob.selectedCategories.includes(filterCategory);

    // Product category check
    const matchProduct = 
      filterProduct === 'all' ||
      (ob.selectedProducts && ob.selectedProducts.includes(filterProduct));

    // Location check
    const matchLocation = 
      filterLocation.trim() === '' ||
      (ob.location || '').toLowerCase().includes(filterLocation.toLowerCase());

    // Work Mode check
    const matchWorkMode = 
      filterWorkMode === 'all' ||
      ob.workMode === filterWorkMode ||
      ob.workMode === 'both';

    // Pricing check (simple numeric search or text inclusion)
    let matchPrice = true;
    if (maxPrice.trim() !== '') {
      const numericMax = parseFloat(maxPrice);
      if (!isNaN(numericMax) && ob.price) {
        const extractedPrice = parseFloat(ob.price.replace(/[^0-9.]/g, ''));
        if (!isNaN(extractedPrice)) {
          matchPrice = extractedPrice <= numericMax;
        }
      }
    }

    return matchSearch && matchPurpose && matchCategory && matchProduct && matchLocation && matchWorkMode && matchPrice;
  });

  const getPurposeLabel = (purpose: string) => {
    switch(purpose) {
      case 'provide': return isAr ? 'مقدم خدمات/منتجات 💼' : 'Offers services/products 💼';
      case 'search': return isAr ? 'باحث عن خدمات/منتجات 🔍' : 'Looks for services/products 🔍';
      case 'both': return isAr ? 'مقدم وباحث (كلاهما) 🔄' : 'Offers & Seeks (Both) 🔄';
      default: return '';
    }
  };

  return (
    <div className="space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Title block */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-750 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-indigo-800">
        <div className="absolute top-[-20%] right-[-10%] w-60 h-60 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 rounded-full bg-indigo-400/15 blur-xl" />
        <div className="relative z-10 space-y-2">
          <span className="bg-indigo-500/30 border border-indigo-400/20 text-indigo-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'سوق المهارات والخدمات والمنتجات' : 'Skills, Services & Products Marketplace'}</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">{isAr ? 'شبكة تواصل وتبادل الخدمات 🌍' : 'Connect & Exchange Value 🌍'}</h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
            {isAr 
              ? 'تصفح مقدمي الخدمات والباحثين عنها في مجتمعنا، يمكنك تصفية النتائج حسب التخصص، الموقع، الميزانية والمزيد للتواصل المباشر معهم.' 
              : 'Discover service providers, products, and seekers in your region. Filter by expertise, location, and price, and initiate direct communication.'}
          </p>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl w-full max-w-lg mx-auto sm:mx-0 shadow-xs">
        <button
          onClick={() => setActiveSubTab('browse')}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'browse'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/50 dark:border-slate-800'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isAr ? 'سوق الخدمات والمنتجات' : 'Browse Marketplace'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('received')}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 relative cursor-pointer ${
            activeSubTab === 'received'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/50 dark:border-slate-800'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>{isAr ? 'طلبات تواصل واردة' : 'Received Requests'}</span>
          {orders.filter(o => o.providerId === currentUser?.id && o.status === 'pending').length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-950 animate-bounce">
              {orders.filter(o => o.providerId === currentUser?.id && o.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('sent')}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'sent'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/50 dark:border-slate-800'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isAr ? 'طلبات تواصل مرسلة' : 'Sent Requests'}</span>
        </button>
      </div>

      {activeSubTab === 'browse' && (
        <>
          {/* Advanced Filters Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/80 pb-3">
          <Filter className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-black text-slate-800 dark:text-white">{isAr ? 'فلاتر البحث المتقدمة' : 'Advanced Search Filters'}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Text Search */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{isAr ? 'ابحث بالاسم أو التخصص:' : 'Search name or skill:'}</label>
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={isAr ? 'اسم المستخدم، كاتب، مطور...' : 'User name, writer, coder...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Purpose Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{isAr ? 'الغرض من الاستخدام:' : 'Account Purpose:'}</label>
            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'الكل' : 'All Purposes'}</option>
              <option value="provide">{isAr ? 'يقدم خدمات/منتجات' : 'Offers services/products'}</option>
              <option value="search">{isAr ? 'يبحث عن خدمات/منتجات' : 'Looks for services/products'}</option>
              <option value="both">{isAr ? 'كلاهما (أقدم وأبحث)' : 'Both (Offer & Seek)'}</option>
            </select>
          </div>

          {/* Service Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{isAr ? 'فئة الخدمة:' : 'Service Category:'}</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'جميع الخدمات' : 'All Services'}</option>
              {SERVICE_CATEGORIES.map(cat => (
                <optgroup key={cat.id} label={isAr ? cat.nameAr : cat.nameEn} className="text-xs font-bold bg-white dark:bg-slate-950">
                  {cat.items.map(item => (
                    <option key={item.id} value={item.id} className="text-slate-700 dark:text-slate-300">
                      {isAr ? item.nameAr : item.nameEn}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Product Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{isAr ? 'تصنيف المنتجات:' : 'Product Classification:'}</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'جميع المنتجات' : 'All Products'}</option>
              {PRODUCT_CATEGORIES.map(prod => (
                <option key={prod.id} value={prod.id}>
                  {isAr ? prod.nameAr : prod.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{isAr ? 'الموقع الجغرافي:' : 'Geographic Location:'}</label>
            <input 
              type="text" 
              placeholder={isAr ? 'بغداد، أربيل، البصرة...' : 'Baghdad, Erbil, Basra...'}
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Work Mode Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{isAr ? 'طريقة تقديم الخدمة:' : 'Work Mode:'}</label>
            <select
              value={filterWorkMode}
              onChange={(e) => setFilterWorkMode(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'الكل' : 'All Modes'}</option>
              <option value="remote">{isAr ? 'عن بعد فقط' : 'Remote Only'}</option>
              <option value="in_person">{isAr ? 'حضوري فقط' : 'On-site Only'}</option>
              <option value="both">{isAr ? 'كلاهما (عن بعد وحضوري)' : 'Both (Remote & On-site)'}</option>
            </select>
          </div>

          {/* Max Price budget */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{isAr ? 'الحد الأقصى للسعر (أرقام فقط):' : 'Max Price Limit (Numbers only):'}</label>
            <input 
              type="number" 
              placeholder="e.g. 50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPurpose('all');
                setFilterCategory('all');
                setFilterProduct('all');
                setFilterLocation('');
                setFilterWorkMode('all');
                setMaxPrice('');
              }}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {isAr ? 'إعادة تعيين الفلاتر 🔄' : 'Clear Filters 🔄'}
            </button>
          </div>
        </div>

        {/* Filter by Country toggle switch banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/45 dark:bg-indigo-950/25 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📍</span>
            <div className="space-y-0.5 text-right sm:text-right" dir={isAr ? 'rtl' : 'ltr'}>
              <h4 className="text-xs font-black text-slate-800 dark:text-white">
                {isAr ? 'عرض منشورات وأعضاء بلدك فقط مفعّل حالياً' : 'Show listings and members from your country only'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                {isAr ? 'تتم الفلترة تلقائياً بناءً على الدولة المحددة:' : 'Filtering automatically based on the selected country:'}{' '}
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {selectedCountry ? `${selectedCountry.flag} ${isAr ? selectedCountry.nameAr : selectedCountry.nameEn}` : '...'}
                </span>
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={filterByCountryOnly}
              onChange={(e) => setFilterByCountryOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            <span className="ms-2 text-xs font-black text-slate-700 dark:text-slate-300">
              {isAr ? 'فلترة حسب بلدي' : 'Filter by Country'}
            </span>
          </label>
        </div>
      </div>

      {/* Grid view of cards */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
              {isAr ? 'لا يوجد نتائج تطابق بحثك حالياً' : 'No matches found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {isAr 
                ? 'جرب تقليل فلاتر البحث أو كتابة عبارات عامة ومشاركة التطبيق لزيادة عدد مقدمي الخدمات!' 
                : 'Try clearing some filters or searching for general keywords.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const ob = user.onboarding!;
            const isMe = currentUser?.id === user.id;

            return (
              <div 
                key={user.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition relative group"
              >
                {isMe && (
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    {isAr ? 'أنت' : 'You'}
                  </span>
                )}

                <div className="space-y-3.5">
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {user.name}
                        </span>
                        {user.isDistinguished && (
                          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                            {isAr ? 'مميز ⭐' : 'VIP ⭐'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                        {getPurposeLabel(ob.purpose)}
                      </span>
                    </div>
                  </div>

                  {/* Bio summary */}
                  {ob.bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {ob.bio}
                    </p>
                  )}

                  {/* Badges/Highlights (Experience, Location, Mode) */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-50 dark:border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{ob.experienceYears || 0} {isAr ? 'سنوات خبرة' : 'years exp.'}</span>
                    </span>
                    <span className="flex items-center gap-1 truncate" title={ob.location}>
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="truncate">{ob.location || (isAr ? 'غير محدد' : 'Unspecified')}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {ob.workMode === 'remote' && (isAr ? 'عن بعد' : 'Remote')}
                        {ob.workMode === 'in_person' && (isAr ? 'حضوري' : 'On-site')}
                        {ob.workMode === 'both' && (isAr ? 'هجين/الكل' : 'Both')}
                      </span>
                    </span>
                    {ob.price && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black truncate" title={ob.price}>
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate">{ob.price}</span>
                      </span>
                    )}
                  </div>

                  {/* Tagged categories */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'الخدمات المختارة:' : 'Services:'}</span>
                    <div className="flex flex-wrap gap-1">
                      {ob.selectedCategories.slice(0, 3).map((catId, idx) => (
                        <span key={idx} className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-400">
                          {getCategoryName(catId)}
                        </span>
                      ))}
                      {ob.selectedCategories.length > 3 && (
                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-black">
                          +{ob.selectedCategories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tagged Products */}
                  {ob.selectedProducts && ob.selectedProducts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'المنتجات والسلع:' : 'Products:'}</span>
                      <div className="flex flex-wrap gap-1">
                        {ob.selectedProducts.slice(0, 3).map((prodId, idx) => (
                          <span key={idx} className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/30 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {getProductName(prodId)}
                          </span>
                        ))}
                        {ob.selectedProducts.length > 3 && (
                          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black">
                            +{ob.selectedProducts.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/80">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:translate-y-[-1px] active:translate-y-[1px]"
                  >
                    <span>{isAr ? 'عرض التفاصيل والتواصل 📞' : 'View Details & Contact 📞'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {activeSubTab === 'received' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white">
                {isAr ? 'طلبات التواصل الواردة من الأعضاء 📥' : 'Received Contact Requests 📥'}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {isAr 
                  ? 'هنا تجد الطلبات المرسلة إليك من أعضاء مهتمين بخدماتك أو منتجاتك. اقبل الطلب لمشاركة رقم هاتفك للتواصل.' 
                  : 'Here you find requests sent to you by members interested in your listings. Accept to reveal phone.'}
              </p>
            </div>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : orders.filter(o => o.providerId === currentUser?.id).length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
                  {isAr ? 'لا توجد طلبات تواصل واردة بعد' : 'No received requests yet'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {isAr 
                    ? 'بمجرد أن يبدي أحد الأعضاء اهتماماً بخدماتك أو سلعك ويرسل طلباً، سيظهر هنا فوراً.' 
                    : 'Once a member expresses interest and sends a request, it will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.filter(o => o.providerId === currentUser?.id).map((order) => (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:shadow-sm transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                          {order.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-800 dark:text-white block">
                            {order.clientName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">
                            {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      {order.status === 'pending' && (
                        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                          {isAr ? 'قيد الانتظار ⏳' : 'Pending ⏳'}
                        </span>
                      )}
                      {order.status === 'accepted' && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                          {isAr ? 'مقبول ✅' : 'Accepted ✅'}
                        </span>
                      )}
                      {order.status === 'rejected' && (
                        <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                          {isAr ? 'مرفوض ❌' : 'Rejected ❌'}
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-3 rounded-xl space-y-2">
                      <div className="text-[11px] font-bold">
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{isAr ? 'الاهتمام بـ : ' : 'Interested in: '}</span>
                        <span className="text-slate-700 dark:text-slate-300">{order.itemName}</span>
                      </div>
                      {order.note && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg font-semibold">
                          &ldquo;{order.note}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {order.status === 'pending' ? (
                    <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/80">
                      <button
                        onClick={() => handleAcceptRequest(order)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer text-center"
                      >
                        {isAr ? 'قبول وتظهر رقمي ✅' : 'Accept & Share Phone ✅'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(order)}
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl transition cursor-pointer text-center"
                      >
                        {isAr ? 'رفض ❌' : 'Reject ❌'}
                      </button>
                    </div>
                  ) : order.status === 'accepted' ? (
                    <div className="pt-3 border-t border-slate-50 dark:border-slate-800/80 space-y-2">
                      <div className="text-[10px] text-slate-400 font-bold">{isAr ? 'رقم هاتف العميل المتاح للتواصل:' : 'Client Phone available for contact:'}</div>
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${order.clientPhone}`}
                          className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-xl transition text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.clientPhone}</span>
                        </a>
                        <a 
                          href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>واتساب 💬</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-[11px] text-slate-400 font-bold pt-2 border-t border-slate-50 dark:border-slate-800/80">
                      {isAr ? 'تم إغلاق هذا الطلب' : 'This request is closed'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'sent' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white">
                {isAr ? 'طلبات التواصل المرسلة إلى الآخرين 📤' : 'Sent Contact Requests 📤'}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {isAr 
                  ? 'هنا تجد الطلبات التي أرسلتها لمقدمي الخدمات أو السلع. فور قبولها، سيظهر رقم هاتفهم هنا مباشرة!' 
                  : 'Here you find the requests you sent to other members. Once accepted, their phone details appear.'}
              </p>
            </div>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : orders.filter(o => o.clientId === currentUser?.id).length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Send className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
                  {isAr ? 'لم ترسل أي طلبات تواصل بعد' : 'No sent requests yet'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {isAr 
                    ? 'تصفح قائمة السوق وافتح تفاصيل أي عضو، ثم اختر الخدمة أو المنتج واضغط على زر إرسال طلب تواصل!' 
                    : 'Browse the market and open any profile, select a service or product and send a request!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.filter(o => o.clientId === currentUser?.id).map((order) => (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:shadow-sm transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                          {order.providerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-800 dark:text-white block">
                            {order.providerName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">
                            {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      {order.status === 'pending' && (
                        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                          {isAr ? 'قيد الانتظار ⏳' : 'Pending ⏳'}
                        </span>
                      )}
                      {order.status === 'accepted' && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                          {isAr ? 'مقبول ✅' : 'Accepted ✅'}
                        </span>
                      )}
                      {order.status === 'rejected' && (
                        <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                          {isAr ? 'مرفوض ❌' : 'Rejected ❌'}
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-3 rounded-xl space-y-2">
                      <div className="text-[11px] font-bold">
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{isAr ? 'الطلب بخصوص: ' : 'Request for: '}</span>
                        <span className="text-slate-700 dark:text-slate-300">{order.itemName}</span>
                      </div>
                      {order.note && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg font-semibold">
                          &ldquo;{order.note}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {order.status === 'accepted' ? (
                    <div className="pt-3 border-t border-slate-50 dark:border-slate-800/80 space-y-2">
                      <div className="text-[10px] text-slate-400 font-bold">{isAr ? 'معلومات الاتصال بمقدم الخدمة المتاحة الآن:' : 'Provider contact details now available:'}</div>
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${order.providerPhone}`}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition text-center flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.providerPhone}</span>
                        </a>
                        <a 
                          href={`https://wa.me/${order.providerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>واتساب 💬</span>
                        </a>
                      </div>
                    </div>
                  ) : order.status === 'pending' ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isAr ? 'معلومات الاتصال مغلقة وبانتظار قبول الطرف الآخر.' : 'Contact info locked waiting for approval.'}</span>
                    </div>
                  ) : (
                    <div className="text-center text-[11px] text-slate-400 font-bold pt-2 border-t border-slate-50 dark:border-slate-800/80">
                      {isAr ? 'تم رفض طلب التواصل هذا' : 'This contact request was declined'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details & Contact Modal Overlay */}
      {selectedUser && (() => {
        const isMe = currentUser?.id === selectedUser.id;
        const acceptedOrder = orders.find(o => o.status === 'accepted' && (
          (o.clientId === currentUser?.id && o.providerId === selectedUser.id) ||
          (o.clientId === selectedUser.id && o.providerId === currentUser?.id)
        ));
        const pendingOrder = orders.find(o => o.clientId === currentUser?.id && o.providerId === selectedUser.id && o.status === 'pending');
        const rejectedOrder = orders.find(o => o.clientId === currentUser?.id && o.providerId === selectedUser.id && o.status === 'rejected');

        const isAdmin = currentUser?.role === 'owner';
        const isPhoneVisibleEveryone = selectedUser.phoneVisibility === 'everyone';
        const canSeePhone = acceptedOrder || isAdmin || isPhoneVisibleEveryone;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col justify-between">
              
              {/* Modal Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span>{selectedUser.name}</span>
                      {selectedUser.isDistinguished && (
                        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                          {isAr ? 'عضو مميز ⭐' : 'VIP Member ⭐'}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {getPurposeLabel(selectedUser.onboarding!.purpose)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedItemForRequest('general');
                    setRequestNote('');
                  }}
                  className="w-8 h-8 rounded-full border border-slate-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center text-lg font-black transition cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Modal Scroll Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[55vh]">
                {/* Bio */}
                {selectedUser.onboarding!.bio && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{isAr ? 'حول مقدم الخدمة / نبذة:' : 'About:'}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {selectedUser.onboarding!.bio}
                    </p>
                  </div>
                )}

                {/* Highlights List */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" />
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'سنوات الخبرة:' : 'Experience:'}</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{selectedUser.onboarding!.experienceYears || 0} {isAr ? 'سنوات' : 'Years'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'الموقع الجغرافي:' : 'Location:'}</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 truncate max-w-[120px] block" title={selectedUser.onboarding!.location}>
                        {selectedUser.onboarding!.location || (isAr ? 'غير محدد' : 'Unspecified')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'طريقة تقديم الخدمة:' : 'Work Mode:'}</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {selectedUser.onboarding!.workMode === 'remote' && (isAr ? 'عن بعد فقط' : 'Remote Only')}
                        {selectedUser.onboarding!.workMode === 'in_person' && (isAr ? 'حضوري فقط' : 'On-site Only')}
                        {selectedUser.onboarding!.workMode === 'both' && (isAr ? 'حضوري وأونلاين' : 'Hybrid / Both')}
                      </span>
                    </div>
                  </div>

                  {selectedUser.onboarding!.price && (
                    <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'معدل الأجر / السعر:' : 'Pricing / Rate:'}</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate max-w-[120px] block" title={selectedUser.onboarding!.price}>
                          {selectedUser.onboarding!.price}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Working Hours */}
                {selectedUser.onboarding!.workingHours && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{isAr ? 'ساعات العمل والمواعيد المتاحة:' : 'Available Hours:'}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{selectedUser.onboarding!.workingHours}</span>
                    </p>
                  </div>
                )}

                {/* Certificates */}
                {selectedUser.onboarding!.certificates && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{isAr ? 'الشهادات والتراخيص:' : 'Certifications & Licensing:'}</span>
                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-amber-50/20 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-start gap-2">
                      <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{selectedUser.onboarding!.certificates}</span>
                    </div>
                  </div>
                )}

                {/* Portfolio Links */}
                {selectedUser.onboarding!.portfolioLinks && selectedUser.onboarding!.portfolioLinks.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{isAr ? 'معرض الأعمال والروابط:' : 'Portfolio Links & Assets:'}</span>
                    <div className="flex flex-col gap-1.5">
                      {selectedUser.onboarding!.portfolioLinks.map((link, idx) => (
                        <a 
                          key={idx}
                          href={link.startsWith('http') ? link : `https://${link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between gap-2"
                        >
                          <span className="truncate max-w-[350px]">{link}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Services Listed */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{isAr ? 'الخدمات الكاملة المقدمة/المطلوبة:' : 'All Service Tags:'}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.onboarding!.selectedCategories.map((catId, idx) => (
                      <span key={idx} className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/30 text-indigo-600 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-full font-bold">
                        {getCategoryName(catId)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* All Products Listed */}
                {selectedUser.onboarding!.selectedProducts && selectedUser.onboarding!.selectedProducts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{isAr ? 'تصنيفات المنتجات المعنية:' : 'Related Product Categories:'}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUser.onboarding!.selectedProducts.map((prodId, idx) => (
                        <span key={idx} className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100/30 text-emerald-600 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold">
                          {getProductName(prodId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferences contact channel */}
                {selectedUser.onboarding!.contactMethods && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'وسائل الاتصال المفضلة:' : 'Preferred Contact Methods:'}</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.onboarding!.contactMethods.map((method, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-1 rounded-md font-bold">
                          {method === 'phone' && (isAr ? '📞 اتصال هاتفي' : '📞 Call Phone')}
                          {method === 'email' && (isAr ? '📧 بريد إلكتروني' : '📧 Send Email')}
                          {method === 'chat' && (isAr ? '💬 دردشة المنصة' : '💬 Platform Chat')}
                          {method === 'telegram' && (isAr ? '✈️ تليجرام' : '✈️ Telegram')}
                          {method === 'instagram' && (isAr ? '📸 انستغرام' : '📸 Instagram')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Action Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                {isMe ? (
                  // This is my own profile, show notice
                  <div className="text-center py-2 bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {isAr ? 'هذا هو ملفك الشخصي المعروض للآخرين 👤' : 'This is your own profile as displayed to others 👤'}
                    </p>
                  </div>
                ) : canSeePhone ? (
                  // Permission granted (accepted request, admin bypass, or everyone visibility)
                  <div className="space-y-3">
                    {isAdmin && (
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-150 dark:border-indigo-900 rounded-xl text-center">
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {isAr ? '👑 معروض للإدارة: معلومات التواصل الشخصية للعضو' : '👑 Displayed for Admin: User Personal Contact Details'}
                        </p>
                      </div>
                    )}
                    {isPhoneVisibleEveryone && !acceptedOrder && !isAdmin && (
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/45 border border-indigo-150 dark:border-indigo-900 rounded-xl text-center">
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {isAr ? '🔓 يشارك هذا العضو رقم هاتفه بشكل علني مع الجميع' : '🔓 This member shares their phone number publicly with everyone'}
                        </p>
                      </div>
                    )}
                    {acceptedOrder && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center space-y-1">
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>{isAr ? 'تم قبول طلب التواصل بنجاح!' : 'Contact request accepted successfully!'}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          {isAr 
                            ? `لقد قبل الطرف الآخر طلبك بشأن: ${acceptedOrder.itemName}` 
                            : `The provider accepted your request regarding: ${acceptedOrder.itemName}`}
                        </p>
                      </div>
                    )}
                    
                    {(selectedUser.onboarding!.contactPhone || selectedUser.phone) && (
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${selectedUser.onboarding!.contactPhone || selectedUser.phone}`}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          onClick={() => triggerToast(isAr ? 'يتم الآن فتح الاتصال الهاتفي...' : 'Initiating phone call dialer...', 'success')}
                        >
                          <Phone className="w-4 h-4" />
                          <span>{isAr ? `اتصال: ${selectedUser.onboarding!.contactPhone || selectedUser.phone}` : `Call: ${selectedUser.onboarding!.contactPhone || selectedUser.phone}`}</span>
                        </a>
                        
                        <a 
                          href={`https://wa.me/${(selectedUser.onboarding!.contactPhone || selectedUser.phone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          onClick={() => triggerToast(isAr ? 'يتم التوجيه إلى واتساب...' : 'Redirecting to WhatsApp...', 'success')}
                        >
                          <span>{isAr ? 'واتساب 💬' : 'WhatsApp 💬'}</span>
                        </a>
                      </div>
                    )}

                    {selectedUser.email && (
                      <a 
                        href={`mailto:${selectedUser.email}`}
                        className="w-full py-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 font-bold text-xs rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                        onClick={() => triggerToast(isAr ? 'يتم فتح تطبيق البريد...' : 'Opening email client...', 'success')}
                      >
                        <Mail className="w-4 h-4" />
                        <span>{isAr ? `إرسال بريد إلكتروني (${selectedUser.email})` : `Send Email (${selectedUser.email})`}</span>
                      </a>
                    )}
                  </div>
                ) : pendingOrder ? (
                  // Request is pending approval
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4 flex-shrink-0 animate-spin" />
                      <span className="text-xs font-black">{isAr ? 'طلب التواصل قيد الانتظار...' : 'Contact request pending...'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {isAr 
                        ? 'تم إرسال طلب التواصل بنجاح وهو بانتظار موافقة الطرف الآخر. بمجرد القبول، سيتم عرض رقم الهاتف والبريد والواتساب هنا فوراً!' 
                        : 'Your contact request has been sent and is waiting for provider approval. Once accepted, contact buttons will be revealed here instantly!'}
                    </p>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{isAr ? 'السلعة المطلوبة: ' : 'Requested Item: '}</span>
                      {pendingOrder.itemName}
                    </div>
                  </div>
                ) : rejectedOrder ? (
                  // Request was rejected
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/20 rounded-xl space-y-1.5 text-center">
                    <p className="text-xs font-black text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                      <X className="w-4 h-4" />
                      <span>{isAr ? 'تم رفض طلب التواصل' : 'Contact request rejected'}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      {isAr 
                        ? 'عذراً، تم رفض طلب التواصل لهذا التخصص أو المنتج من قبل الطرف الآخر.' 
                        : 'Sorry, this contact request was declined by the provider.'}
                    </p>
                  </div>
                ) : (
                  // No request yet - show request form
                  <div className="space-y-4">
                    <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/20 dark:border-indigo-900/20 rounded-xl flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-indigo-950 dark:text-indigo-300">
                          {isAr ? 'أرقام الهواتف والتواصل محمية ومخفية 🔒' : 'Phone Numbers & Contacts Protected 🔒'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                          {isAr 
                            ? 'لحماية الخصوصية، لا تظهر أرقام الهواتف والواتساب إلا بعد إرسال طلب وقبوله من الطرف الآخر.' 
                            : 'To protect privacy, phone numbers and WhatsApp links are hidden until a request is sent and accepted.'}
                        </p>
                      </div>
                    </div>

                    {/* Dropdown for item */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">
                        {isAr ? 'اختر التخصص أو المنتج الذي يهمك لطلبه:' : 'Choose the specific skill or product of interest:'}
                      </label>
                      <select
                        value={selectedItemForRequest}
                        onChange={(e) => setSelectedItemForRequest(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                      >
                        <option value="general">{isAr ? 'تواصل عام (استفسار / شراء عام)' : 'General Inquiry / General Contact'}</option>
                        
                        {/* Services group */}
                        {selectedUser.onboarding!.selectedCategories.length > 0 && (
                          <optgroup label={isAr ? 'الخدمات والتخصصات المتاحة:' : 'Available Services:'} className="font-bold">
                            {selectedUser.onboarding!.selectedCategories.map(catId => (
                              <option key={catId} value={catId}>
                                {getCategoryName(catId)}
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {/* Products group */}
                        {selectedUser.onboarding!.selectedProducts && selectedUser.onboarding!.selectedProducts.length > 0 && (
                          <optgroup label={isAr ? 'السلع والمنتجات المعروضة:' : 'Offered Products:'} className="font-bold">
                            {selectedUser.onboarding!.selectedProducts.map(prodId => (
                              <option key={prodId} value={prodId}>
                                {getProductName(prodId)}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    {/* Message input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">
                        {isAr ? 'رسالة قصيرة أو ملاحظة للطرف الآخر (اختياري):' : 'Add a short note or message (optional):'}
                      </label>
                      <textarea
                        placeholder={isAr ? 'أهلاً بك، أود الاستفسار بخصوص هذا التخصص أو الاتفاق على الشراء...' : 'Hello, I want to inquire about this skill or discuss purchase...'}
                        value={requestNote}
                        onChange={(e) => setRequestNote(e.target.value)}
                        rows={2}
                        maxLength={150}
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold resize-none"
                      />
                    </div>

                    {/* Request Button */}
                    <button
                      onClick={() => handleSendRequest(selectedUser)}
                      disabled={submittingRequest}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {submittingRequest 
                          ? (isAr ? 'جاري الإرسال...' : 'Sending...') 
                          : (isAr ? 'إرسال طلب تواصل لشراء الخدمة / المنتج 📩' : 'Send Contact & Purchase Request 📩')}
                      </span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
