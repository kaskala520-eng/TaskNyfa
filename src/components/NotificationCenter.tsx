import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Check, 
  CheckCheck,
  Trash2, 
  Gift, 
  X, 
  Send, 
  UserCheck, 
  Sparkles,
  Info,
  ShieldCheck,
  Smartphone,
  Wallet,
  ArrowRightLeft
} from 'lucide-react';
import { CountryConfig, SystemNotification } from '../types';
import { formatCurrencyValue } from '../utils/currency';

interface NotificationCenterProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  setCashBalance: React.Dispatch<React.SetStateAction<number>>;
  notifications: SystemNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
}

interface SupportMessage {
  id: string;
  sender: 'admin' | 'user';
  senderNameAr: string;
  senderNameEn: string;
  textAr: string;
  textEn: string;
  timestamp: string;
  read: boolean;
}

interface UserContact {
  id: string;
  nameAr: string;
  nameEn: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  statusAr: string;
  statusEn: string;
  badgeAr: string;
  badgeEn: string;
}

interface UserChatMessage {
  id: string;
  contactId: string;
  sender: 'me' | 'them';
  textAr: string;
  textEn: string;
  timestamp: string;
  read: boolean;
}

const CHAT_CONTACTS: UserContact[] = [
  {
    id: 'contact_ahmed',
    nameAr: 'أحمد الركابي 🇮🇶',
    nameEn: 'Ahmed Al-Rikabi 🇮🇶',
    avatar: 'A',
    status: 'online',
    statusAr: 'متصل الآن',
    statusEn: 'Online',
    badgeAr: 'مستلم حوالات نشط',
    badgeEn: 'Active Receiver'
  },
  {
    id: 'contact_zeinab',
    nameAr: 'زينب الموسوي 🇮🇶',
    nameEn: 'Zeinab Al-Mousawi 🇮🇶',
    avatar: 'Z',
    status: 'online',
    statusAr: 'متصل الآن',
    statusEn: 'Online',
    badgeAr: 'تاجر معتمد',
    badgeEn: 'Verified Merchant'
  },
  {
    id: 'contact_sahar',
    nameAr: 'سحر الماجد 🇸🇦',
    nameEn: 'Sahar Al-Majed 🇸🇦',
    avatar: 'S',
    status: 'away',
    statusAr: 'بالخارج',
    statusEn: 'Away',
    badgeAr: 'مستثمر فضي',
    badgeEn: 'Silver Investor'
  },
  {
    id: 'contact_karim',
    nameAr: 'كريم عبد الله 🇪🇬',
    nameEn: 'Karim Abdullah 🇪🇬',
    avatar: 'K',
    status: 'offline',
    statusAr: 'غير متصل',
    statusEn: 'Offline',
    badgeAr: 'عضو مجتمعي',
    badgeEn: 'Community Member'
  }
];

const INITIAL_USER_MESSAGES: UserChatMessage[] = [
  {
    id: 'um_1',
    contactId: 'contact_ahmed',
    sender: 'them',
    textAr: 'أهلاً بك أخي العزيز! هل قمت بتأكيد إرسال الحوالة الأخيرة؟',
    textEn: 'Hello my dear brother! Did you confirm sending the last transfer?',
    timestamp: 'منذ ١٠ د',
    read: false
  },
  {
    id: 'um_2',
    contactId: 'contact_ahmed',
    sender: 'me',
    textAr: 'أهلاً أحمد، نعم تم التحويل وسيصلك إشعار فوري قريباً جداً في حسابك.',
    textEn: 'Hello Ahmed, yes, it has been transferred and you will get an instant notification very soon.',
    timestamp: 'منذ ٨ د',
    read: true
  },
  {
    id: 'um_3',
    contactId: 'contact_ahmed',
    sender: 'them',
    textAr: 'رائع جداً! بانتظار وصول الإشعار لتأكيد استلام الدفعة كاملة.',
    textEn: 'Excellent! Waiting for the notification to confirm the full payout.',
    timestamp: 'منذ ٥ د',
    read: false
  },
  {
    id: 'um_4',
    contactId: 'contact_zeinab',
    sender: 'them',
    textAr: 'مرحباً، كم يستغرق سحب الأرباح عبر زين كاش أو آسيا حوالة في العراق؟',
    textEn: 'Hello, how long does cashing out via Zain Cash or AsiaHawala take in Iraq?',
    timestamp: 'منذ ساعتين',
    read: true
  },
  {
    id: 'um_5',
    contactId: 'contact_zeinab',
    sender: 'me',
    textAr: 'مرحباً زينب، السحب فوري وتلقائي ولا يستغرق سوى دقيقة واحدة وبدون أي رسوم عمولة!',
    textEn: 'Hello Zeinab, withdrawals are instant and automatic, taking less than a minute with 0% fees!',
    timestamp: 'منذ ساعة',
    read: true
  },
  {
    id: 'um_6',
    contactId: 'contact_zeinab',
    sender: 'them',
    textAr: 'تسلم يا رب! فعلاً جربت وسحبت أرباح تيك توك المزامنة وحصلت الكاش فوراً! منصة خيالية.',
    textEn: 'Thank you so much! Indeed I tried cashing out synchronized TikTok rewards and got them instantly! Unreal platform.',
    timestamp: 'منذ ٤٠ د',
    read: false
  },
  {
    id: 'um_7',
    contactId: 'contact_sahar',
    sender: 'them',
    textAr: 'السلام عليكم، هل جربت لعبة مطابقة الكرات ماربل كراش؟ ربحت منها أكثر من ٤٠٠٠ نقطة اليوم وسحبتها كاش! 🔮',
    textEn: 'Peace be upon you, have you played the Marble Crush matching game? I won over 4000 points today and cashed out! 🔮',
    timestamp: 'منذ ٣ ساعات',
    read: false
  },
  {
    id: 'um_8',
    contactId: 'contact_karim',
    sender: 'them',
    textAr: 'مرحباً، كود المزامنة للبطاقة البنكية وصلني على الهاتف مباشرة، الخدمات هنا آمنة وممتازة جداً.',
    textEn: 'Hello, the bank card sync code reached my phone immediately, the services here are safe and excellent.',
    timestamp: 'منذ يومين',
    read: true
  }
];

export default function NotificationCenter({
  lang,
  selectedCountry,
  triggerToast,
  awardPoints,
  setCashBalance,
  notifications,
  setNotifications
}: NotificationCenterProps) {
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'notifications' | 'messages' | 'users'>('notifications');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial Messages State (Support Chat Simulation)
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'msg_1',
      sender: 'admin',
      senderNameAr: 'الدعم الفني (كاش.ai)',
      senderNameEn: 'Support (Cash.ai)',
      textAr: 'أهلاً بك في منصة Cash.ai! نحن هنا لمساعدتك على سحب أرباحك وتجميع نقاطك من تيك توك، جوجل، وباقي المنصات المربوطة. هل تواجه أي مشكلة في المزامنة؟',
      textEn: 'Welcome to Cash.ai! We are here to help you sync and cash out rewards from TikTok, Google and other apps. Are you experiencing any difficulties?',
      timestamp: 'منذ ساعتين',
      read: false
    }
  ]);

  const [userMessages, setUserMessages] = useState<UserChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('cashai_user_chats');
      return saved ? JSON.parse(saved) : INITIAL_USER_MESSAGES;
    } catch (e) {
      return INITIAL_USER_MESSAGES;
    }
  });

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // Save user-to-user chat messages state
  useEffect(() => {
    try {
      localStorage.setItem('cashai_user_chats', JSON.stringify(userMessages));
    } catch (e) {}
  }, [userMessages]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeSubTab === 'users' && selectedContactId) {
      scrollToBottom();
    }
  }, [userMessages, selectedContactId, activeSubTab]);

  // Close panel on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Total unread indicators count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = messages.filter(m => !m.read && m.sender === 'admin').length;
  const unreadUserMessagesCount = userMessages.filter(m => !m.read && m.sender === 'them').length;
  const totalUnreadCount = unreadNotificationsCount + unreadMessagesCount + unreadUserMessagesCount;

  // Mark all as read
  const handleMarkAllRead = () => {
    if (activeSubTab === 'notifications') {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      triggerToast(isAr ? 'تم تحديد جميع الإشعارات كمقروءة' : 'All notifications marked as read', 'success');
    } else if (activeSubTab === 'messages') {
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
      triggerToast(isAr ? 'تم تحديد جميع الرسائل كمقروءة' : 'All messages marked as read', 'success');
    } else {
      setUserMessages(prev => prev.map(m => ({ ...m, read: true })));
      triggerToast(isAr ? 'تم تحديد رسائل الأعضاء كمقروءة' : 'All user messages marked as read', 'success');
    }
  };

  // Delete all notifications/messages
  const handleClearAll = () => {
    if (activeSubTab === 'notifications') {
      setNotifications([]);
      triggerToast(isAr ? 'تم مسح الإشعارات بالكامل' : 'Cleared all notifications', 'info');
    } else if (activeSubTab === 'messages') {
      setMessages([]);
      triggerToast(isAr ? 'تم مسح سجل المحادثة' : 'Cleared message logs', 'info');
    } else {
      setUserMessages([]);
      setSelectedContactId(null);
      triggerToast(isAr ? 'تم مسح رسائل الأعضاء بالكامل' : 'Cleared all user messages', 'info');
    }
  };

  // Click a notification (marks as read)
  const handleNotifClick = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Claim gift reward points directly from notification
  const handleClaimGift = (notifId: string, points: number) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notifId) {
        return { ...n, read: true, claimed: true };
      }
      return n;
    }));

    // Award actual points
    awardPoints(points, 'هدية ترحيبية نقدية من الإدارة 🎁', 'Welcome Reward from Admin 🎁');

    // Simulate direct cash addition too for a marvelous instant gratification
    const bonusCash = Math.round(points * selectedCountry.rate);
    setCashBalance(prev => prev + bonusCash);

    triggerToast(
      isAr 
        ? `🎉 مبارك! تمت إضافة +${points.toLocaleString()} نقطة و+${formatCurrencyValue(bonusCash, selectedCountry.currencyCode)} ${selectedCountry.currencySymbol} إلى محفظتك!` 
        : `🎉 Congratulations! Added +${points.toLocaleString()} points and +${formatCurrencyValue(bonusCash, selectedCountry.currencyCode)} ${selectedCountry.currencyCode} to your balance!`, 
      'success'
    );

    // Play a friendly synth chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch(e) {}
  };

  // Post simulated user chat message and schedule support reply
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    const userText = replyInput.trim();
    const userMsg: SupportMessage = {
      id: 'user_msg_' + Date.now(),
      sender: 'user',
      senderNameAr: 'أنت',
      senderNameEn: 'You',
      textAr: userText,
      textEn: userText,
      timestamp: 'الآن',
      read: true
    };

    setMessages(prev => [...prev, userMsg]);
    setReplyInput('');

    // Trigger toast
    triggerToast(isAr ? 'تم إرسال رسالتك لفريق الدعم' : 'Message dispatched to support team', 'info');

    // Simulate smart support auto-reply after 1.5 seconds
    setTimeout(() => {
      let replyAr = 'تلقينا رسالتك بخصوص الدعم الفني والمزامنة النقديّة. سيقوم مراجع بشري باعتماد طلبك فوراً. تم تفعيل تسريع السحب لحسابك تلقائياً! ✨';
      let replyEn = 'We received your inquiry regarding wallet syncing & conversions. A specialist has prioritized your queue. Instant high-speed cash-out pipeline is now active! ✨';

      // Smart keywords detection
      const textLower = userText.toLowerCase();
      if (textLower.includes('سحب') || textLower.includes('فلوس') || textLower.includes('withdraw') || textLower.includes('money') || textLower.includes('cash')) {
        replyAr = 'بخصوص سحب الأموال، جميع طلبات السحب عبر زين كاش، فودافون كاش، و USDT تتم معالجتها بالكامل خلال دقائق معدودة وبدون أي عمولات (0% رسوم)! جرب طلب السحب الآن. 💵';
        replyEn = 'Regarding your withdrawal, all payouts via e-wallets, STC Pay, and USDT are fully cleared in less than 2 minutes with absolutely 0% platform fees! Try requesting a cashout now. 💵';
      } else if (textLower.includes('نقاط') || textLower.includes('مزامنه') || textLower.includes('points') || textLower.includes('sync')) {
        replyAr = 'لمزامنة النقاط، تأكد من ربط حساباتك أولاً في تبويب "ربط الحسابات" ثم اضغط على زر "مزامنة جميع المنصات" في الصفحة الرئيسية لتحديث نقاطك فوراً! 🔄';
        replyEn = 'To sync your points, make sure your social profiles are connected under "Linked Accounts", then tap "Sync All Platforms" in the main dashboard! 🔄';
      } else if (textLower.includes('ماربل') || textLower.includes('marble') || textLower.includes('لعب') || textLower.includes('game')) {
        replyAr = 'لعبة ماربل كراش: سيد مطابقة الكرات الجديدة تمنحك ٥٠ نقطة حقيقية فوراً لكل رمية كرة! العبها الآن وحوّل نقاط الرمي إلى كاش حقيقي فوراً! 🔮';
        replyEn = 'The new Marble Crush Match Master game gives you 50 real reward points for every single ball thrown! Play it inside the Games portal and withdraw cash instantly! 🔮';
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'admin_reply_' + Date.now(),
          sender: 'admin',
          senderNameAr: 'فريق الدعم الذكي ⚡',
          senderNameEn: 'Smart Support Agent ⚡',
          textAr: replyAr,
          textEn: replyEn,
          timestamp: 'الآن',
          read: false
        }
      ]);

      // Sound feedback for incoming message
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch(e) {}

      triggerToast(isAr ? 'رسالة جديدة من الدعم الفني!' : 'New support response received!', 'success');
    }, 1800);
  };

  // Post simulated user-to-user chat message and schedule reply
  const handleSendUserMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedContactId) return;

    const text = replyInput.trim();
    const newMsg: UserChatMessage = {
      id: 'um_user_' + Date.now(),
      contactId: selectedContactId,
      sender: 'me',
      textAr: text,
      textEn: text,
      timestamp: isAr ? 'الآن' : 'Just Now',
      read: true
    };

    setUserMessages(prev => [...prev, newMsg]);
    setReplyInput('');

    // Play a friendly soft key beep chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch(e) {}

    // Trigger dynamic auto-reply from the selected contact
    const contact = CHAT_CONTACTS.find(c => c.id === selectedContactId);
    if (!contact) return;

    setTimeout(() => {
      let replyAr = `أهلاً بك! شكراً لرسالتك الجميلة. هذه المنصة آمنة وتدعم تحويل الأموال وتجميع أرباح تيك توك وجوجل بكل موثوقية وبسعر الصرف الرسمي. 👍`;
      let replyEn = `Hello! Thanks for your message. This platform is secure and supports point conversion & TikTok cashouts with full transparency. 👍`;

      const textLower = text.toLowerCase();
      if (textLower.includes('حواله') || textLower.includes('حوالة') || textLower.includes('تحويل') || textLower.includes('ارسل') || textLower.includes('أرسل') || textLower.includes('سنت') || textLower.includes('transfer') || textLower.includes('sent')) {
        replyAr = `وصلتني الحوالة بنجاح وبسرعة خارقة! لقد تم تحديث رصيد حسابي فوراً وظهر لي إشعار فوري. شكراً جزيلاً لك لسرعة ونظافة التعامل! 💸`;
        replyEn = `I received your transfer successfully and instantly! My balance was updated immediately with a live notification. Thank you so much for the swift and clean deal! 💸`;
      } else if (textLower.includes('سحب') || textLower.includes('فلوس') || textLower.includes('كاش') || textLower.includes('زين') || textLower.includes('withdraw') || textLower.includes('cash')) {
        replyAr = `نعم، سحب الأموال هنا فوري وتلقائي ومجاني تماماً! قمت بسحب أرباحي عبر زين كاش/المحفظة الالكترونية ووصلتني خلال أقل من دقيقة. 💵`;
        replyEn = `Yes, withdrawing cash here is instant, automatic, and fully free! I cashed out my balance to my wallet and received it in under a minute. 💵`;
      } else if (textLower.includes('موقع') || textLower.includes('رائع') || textLower.includes('حلو') || textLower.includes('ممتاز') || textLower.includes('nice') || textLower.includes('great')) {
        replyAr = `أتفق معك تماماً! المنصة سهلة للغاية وتصميمها مريح، وخصوصاً ميزة الإشعارات الفورية والمزامنة السحابية للرصيد والمهام. ⭐`;
        replyEn = `I completely agree! The platform is very intuitive, with real-time notifications, cloud balance syncs, and simple rewarding quests. ⭐`;
      } else if (textLower.includes('هلا') || textLower.includes('مرحبا') || textLower.includes('مرحباً') || textLower.includes('سلام') || textLower.includes('السلام') || textLower.includes('hi') || textLower.includes('hello')) {
        replyAr = `أهلاً وسهلاً بك يا غالي! يسعدني جداً تبادل الحديث والتعامل المالي معك في المنصة. كيف يمكنني مساعدتك اليوم؟ 🌹`;
        replyEn = `Welcome, my friend! Glad to chat and trade with you on this platform. How can I help you today? 🌹`;
      }

      setUserMessages(prev => [
        ...prev,
        {
          id: 'um_reply_' + Date.now(),
          contactId: selectedContactId,
          sender: 'them',
          textAr: replyAr,
          textEn: replyEn,
          timestamp: isAr ? 'الآن' : 'Just Now',
          read: false
        }
      ]);

      // Sound feedback for incoming user message
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch(e) {}

      triggerToast(
        isAr 
          ? `💬 رسالة واردة جديدة من ${contact.nameAr}` 
          : `💬 New message received from ${contact.nameEn}`, 
        'success'
      );
    }, 1500);
  };

  return (
    <div className="relative" ref={panelRef}>
      
      {/* Trigger Bell Button in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isOpen 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
            : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80'
        }`}
        title={isAr ? 'الإشعارات والرسائل' : 'Notifications & Messages'}
      >
        <Bell className="w-4 h-4" />
        
        {/* Glowing Badge Counter */}
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 animate-pulse">
            {totalUnreadCount}
          </span>
        )}
      </button>

      {/* Floating Panel Portal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className={`absolute right-0 sm:right-auto ${isAr ? 'left-0 sm:left-0 lg:left-0 origin-top-left' : 'right-0 sm:right-0 lg:right-0 origin-top-right'} mt-3 w-[335px] sm:w-[400px] max-h-[550px] bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden`}
          >
            {/* Header Area */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {isAr ? 'مركز التنبيهات والرسائل' : 'Notification Center'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {isAr ? `${totalUnreadCount} غير مقروء حالياً` : `${totalUnreadCount} unread currently`}
                  </p>
                </div>
              </div>

              {/* Close Icon button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs Row (Notifications vs Support Chat vs User Chat) */}
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveSubTab('notifications')}
                className={`py-2.5 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'notifications'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isAr ? 'الإشعارات' : 'Alerts'}</span>
                {unreadNotificationsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('messages')}
                className={`py-2.5 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'messages'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isAr ? 'الدعم' : 'Support'}</span>
                {unreadMessagesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('users')}
                className={`py-2.5 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'users'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? 'الأعضاء' : 'Users'}</span>
                {unreadUserMessagesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold animate-pulse">
                    {unreadUserMessagesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Actions Bar (Mark Read & Clear) */}
            <div className="px-4 py-1.5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <button 
                onClick={handleMarkAllRead}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
              </button>

              <button 
                onClick={handleClearAll}
                className="hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'مسح السجل' : 'Clear list'}</span>
              </button>
            </div>

            {/* Tab Panels Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px] min-h-[220px]">
              
              {/* TAB 1: System Notifications */}
              {activeSubTab === 'notifications' && (
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Bell className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">
                        {isAr ? 'لا توجد إشعارات حالياً' : 'All caught up! No alerts.'}
                      </p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-right flex gap-3 ${
                          notif.read 
                            ? 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-850 opacity-75' 
                            : 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/50 shadow-xs'
                        }`}
                      >
                        {/* Type Icon indicator left-aligned in RTL */}
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                          notif.type === 'gift' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                          notif.type === 'security' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' :
                          notif.type === 'cash' ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' :
                          'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {notif.type === 'gift' ? <Gift className="w-4 h-4 animate-pulse" /> :
                           notif.type === 'security' ? <ShieldCheck className="w-4 h-4" /> :
                           notif.type === 'cash' ? <Wallet className="w-4 h-4" /> :
                           <Sparkles className="w-4 h-4" />}
                        </div>

                        {/* Text */}
                        <div className="flex-1 space-y-1 text-right">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {notif.timestamp}
                            </span>
                            <span className={`text-xs font-black ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              {isAr ? notif.titleAr : notif.titleEn}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {isAr ? notif.descAr : notif.descEn}
                          </p>

                          {/* Render Claim Reward button for Welcome Gift notification */}
                          {notif.type === 'gift' && notif.giftPoints && !notif.claimed && (
                            <div className="pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimGift(notif.id, notif.giftPoints!);
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[10px] font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer w-fit"
                              >
                                <Gift className="w-3 h-3" />
                                <span>{isAr ? `الحصول على الـ +${notif.giftPoints.toLocaleString()} نقطة ترحيبية 🎁` : `Claim +${notif.giftPoints.toLocaleString()} points 🎁`}</span>
                              </button>
                            </div>
                          )}

                          {notif.claimed && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-black pt-1">
                              <Check className="w-3 h-3" />
                              <span>{isAr ? 'تم استلام مكافأتك بنجاح ✓' : 'Reward claimed successfully ✓'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: Interactive Live Chat Support messages */}
              {activeSubTab === 'messages' && (
                <div className="space-y-3.5">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Mail className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">
                        {isAr ? 'لا توجد محادثات نشطة' : 'No active support conversations.'}
                      </p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div 
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${
                          msg.sender === 'user' 
                            ? `${isAr ? 'mr-auto flex-row-reverse' : 'ml-auto'}` 
                            : `${isAr ? 'ml-auto' : 'mr-auto'}`
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black ${
                          msg.sender === 'user' 
                            ? 'bg-slate-200 text-slate-700' 
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {msg.sender === 'user' ? 'U' : 'A'}
                        </div>

                        {/* Bubble */}
                        <div className={`p-2.5 rounded-2xl text-xs space-y-1 text-right ${
                          msg.sender === 'user'
                            ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tr-none'
                            : 'bg-indigo-600 text-white rounded-tl-none'
                        }`}>
                          <div className="flex justify-between items-baseline gap-4">
                            <span className="text-[9px] opacity-75 font-mono">
                              {msg.timestamp}
                            </span>
                            <span className="font-extrabold text-[10px]">
                              {isAr ? msg.senderNameAr : msg.senderNameEn}
                            </span>
                          </div>
                          <p className="leading-relaxed text-[11px]">
                            {isAr ? msg.textAr : msg.textEn}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: User to User Chat */}
              {activeSubTab === 'users' && (
                <div className="space-y-3 h-full">
                  {!selectedContactId ? (
                    // 1. Contacts List View
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">
                        {isAr ? 'اختر عضواً لبدء محادثة آمنة معه:' : 'Select a member to chat securely:'}
                      </p>
                      
                      {CHAT_CONTACTS.map(contact => {
                        // Find last message and unread count for this contact
                        const contactMessages = userMessages.filter(m => m.contactId === contact.id);
                        const lastMsg = contactMessages[contactMessages.length - 1];
                        const unreadCount = contactMessages.filter(m => !m.read && m.sender === 'them').length;
                        
                        return (
                          <div
                            key={contact.id}
                            onClick={() => {
                              setSelectedContactId(contact.id);
                              // Mark all messages from this contact as read
                              setUserMessages(prev => prev.map(m => m.contactId === contact.id && m.sender === 'them' ? { ...m, read: true } : m));
                            }}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Avatar */}
                              <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                                  {contact.avatar}
                                </div>
                                {/* Online status indicator */}
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 ${
                                  contact.status === 'online' ? 'bg-emerald-500' :
                                  contact.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                                }`} />
                              </div>

                              {/* Details */}
                              <div className="text-right">
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {isAr ? contact.nameAr : contact.nameEn}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                                  <span className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-sm text-[9px]">
                                    {isAr ? contact.badgeAr : contact.badgeEn}
                                  </span>
                                  <span>•</span>
                                  <span className={contact.status === 'online' ? 'text-emerald-500' : contact.status === 'away' ? 'text-amber-500' : 'text-slate-400'}>
                                    {isAr ? contact.statusAr : contact.statusEn}
                                  </span>
                                </p>
                                {lastMsg && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px] mt-1">
                                    {isAr ? lastMsg.textAr : lastMsg.textEn}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Unread badge & time */}
                            <div className="flex flex-col items-end gap-1">
                              {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black animate-pulse">
                                  {unreadCount}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-300 dark:text-slate-700 font-mono">
                                {lastMsg ? lastMsg.timestamp : ''}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // 2. Chat Room View
                    <div className="flex flex-col h-full space-y-3">
                      {/* Chat Room Header */}
                      {(() => {
                        const contact = CHAT_CONTACTS.find(c => c.id === selectedContactId);
                        if (!contact) return null;
                        return (
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-2">
                            <button
                              onClick={() => setSelectedContactId(null)}
                              className="px-2 py-1 text-[10px] font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isAr ? '◀ رجوع' : '◀ Back'}</span>
                            </button>
                            <div className="text-right flex items-center gap-2">
                              <div className="text-right">
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                                  {isAr ? contact.nameAr : contact.nameEn}
                                </h4>
                                <span className="text-[9px] text-slate-400 font-semibold">
                                  {isAr ? contact.badgeAr : contact.badgeEn}
                                </span>
                              </div>
                              <div className="relative">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                                  {contact.avatar}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${
                                  contact.status === 'online' ? 'bg-emerald-500' :
                                  contact.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                                }`} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Chat Room Messages List */}
                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] min-h-[160px] pr-1">
                        {userMessages.filter(m => m.contactId === selectedContactId).length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-xs text-slate-400 font-bold">
                              {isAr ? 'لا توجد رسائل بينكما بعد. ابدأ المحادثة!' : 'No messages yet. Say hello!'}
                            </p>
                          </div>
                        ) : (
                          userMessages
                            .filter(m => m.contactId === selectedContactId)
                            .map(msg => (
                              <div
                                key={msg.id}
                                className={`flex gap-2 max-w-[85%] ${
                                  msg.sender === 'me'
                                    ? `${isAr ? 'mr-auto flex-row-reverse' : 'ml-auto'}`
                                    : `${isAr ? 'ml-auto' : 'mr-auto'}`
                                }`}
                              >
                                {/* Bubble */}
                                <div className={`p-2.5 rounded-xl text-xs space-y-0.5 text-right ${
                                  msg.sender === 'me'
                                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-850 dark:text-slate-200 rounded-tr-none'
                                    : 'bg-indigo-600 text-white rounded-tl-none'
                                }`}>
                                  <p className="leading-relaxed text-[11px] font-medium break-words">
                                    {isAr ? msg.textAr : msg.textEn}
                                  </p>
                                  <div className="flex justify-between items-center gap-4 text-[8px] opacity-60 font-mono">
                                    <span>{msg.timestamp}</span>
                                    {msg.sender === 'me' && (
                                      <span className="text-emerald-600 dark:text-emerald-400">✓✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Sticky Chat Input Footer (Support chat vs User-to-user chat) */}
            {activeSubTab === 'messages' && (
              <form 
                onSubmit={handleSendMessage}
                className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={isAr ? 'اسأل الدعم الفني عن السحب والمزامنة...' : 'Ask support about withdrawals...'}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  <Send className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </form>
            )}

            {activeSubTab === 'users' && selectedContactId !== null && (
              <form 
                onSubmit={handleSendUserMessage}
                className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالتك العضو هنا...' : 'Type your message to member...'}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  <Send className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </form>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
