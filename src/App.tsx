import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Platform, Transaction, RegisteredUser, CountryConfig, SystemNotification, OnboardingData } from './types';
import { 
  INITIAL_PLATFORMS, 
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  COUNTRIES,
  WALLET_OPTIONS
} from './mockData';
import { formatCurrencyValue, fetchLiveExchangeRates, calculateCountryRates, getDecimalPrecision } from './utils/currency';
import { db, usersRef, transactionsRef } from './firebase';
import { doc, setDoc, getDocs } from 'firebase/firestore';

import Dashboard from './components/Dashboard';
import LinkedPlatforms from './components/LinkedPlatforms';
import ConversionHub from './components/ConversionHub';
import WithdrawalForm from './components/WithdrawalForm';
import DeveloperPortal from './components/DeveloperPortal';
import TransactionHistory from './components/TransactionHistory';
import OwnerPortal from './components/OwnerPortal';
import GamesPortal from './components/GamesPortal';
import NotificationCenter from './components/NotificationCenter';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import { SERVICE_CATEGORIES } from './components/Onboarding';
import TasksPanel, { Task } from './components/TasksPanel';
import InstallAppModal from './components/InstallAppModal';
import SiteSettings from './components/SiteSettings';
import BankCardsLink from './components/BankCardsLink';
import RealMoneySetup from './components/RealMoneySetup';
import Onboarding from './components/Onboarding';
import Marketplace from './components/Marketplace';


import { 
  LayoutDashboard, 
  Link2, 
  ArrowRightLeft, 
  Wallet, 
  Code, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Bell, 
  TrendingUp, 
  Moon, 
  Sun, 
  Crown, 
  Gamepad2, 
  LogOut,
  User,
  Trophy,
  Smartphone,
  LayoutGrid,
  Settings,
  AlertTriangle,
  Send,
  X,
  CreditCard,
  Landmark,
  ShoppingBag
} from 'lucide-react';

const TASKS: Task[] = [
  {
    id: 'link_platform',
    titleAr: 'ربط أول منصة مكافآت 🔗',
    titleEn: 'Link First Reward Platform 🔗',
    descAr: 'قم بربط أي حساب منصة خارجية (مثل تيك توك أو جوجل) لبدء احتساب ومزامنة نقاطك.',
    descEn: 'Connect any external rewards app (like TikTok or Google) to start tracking points.',
    points: 1500,
    actionTab: 'platforms',
    actionTextAr: 'ذهاب لربط الحسابات 🔗',
    actionTextEn: 'Go to Linked Accounts 🔗'
  },
  {
    id: 'play_game',
    titleAr: 'لعب لعبة في صالة الألعاب 🎮',
    titleEn: 'Play a Game in Arcade 🎮',
    descAr: 'العب أي لعبة مسلية في صالة الألعاب (مثل لودو، الحية، أو صياد الذهب) واجمع المكافآت.',
    descEn: 'Play any game in the games portal (like Ludo, Snake, or Gold Miner) to earn points.',
    points: 1000,
    actionTab: 'games',
    actionTextAr: 'ذهاب لصالة الألعاب 🎮',
    actionTextEn: 'Go to Games Arcade 🎮'
  },
  {
    id: 'sync_platforms',
    titleAr: 'مزامنة نقاط المنصات 🔄',
    titleEn: 'Sync Platform Points 🔄',
    descAr: 'اضغط على زر "مزامنة جميع الحسابات" في لوحة التحكم لتحديث نقاطك تلقائياً.',
    descEn: 'Tap "Sync All Accounts" on the main dashboard to fetch your external points.',
    points: 800,
    actionTab: 'dashboard',
    actionTextAr: 'ذهاب للرئيسية ومزامنة 🔄',
    actionTextEn: 'Go to Dashboard & Sync 🔄'
  },
  {
    id: 'convert_points',
    titleAr: 'أول عملية تحويل نقاط لكاش 💸',
    titleEn: 'First Points Conversion 💸',
    descAr: 'قم بتحويل نقاطك المجمعة من أي منصة إلى كاش حقيقي في رصيد محفظتك.',
    descEn: 'Convert your points from any platform to actual cash in your wallet balance.',
    points: 2000,
    actionTab: 'conversion',
    actionTextAr: 'ذهاب لمحول النقاط 💸',
    actionTextEn: 'Go to Points Converter 💸'
  },
  {
    id: 'withdraw_cash',
    titleAr: 'أول طلب سحب كاش للمحفظة 🏦',
    titleEn: 'First Wallet Withdrawal 🏦',
    descAr: 'قدم أول طلب سحب لكاش من رصيدك المتوفر إلى زين كاش أو كي كارد أو المحافظ المدعومة.',
    descEn: 'Submit your first payout request to Zain Cash, Qi Card or other e-wallets.',
    points: 2500,
    actionTab: 'withdrawal',
    actionTextAr: 'ذهاب لسحب الكاش 🏦',
    actionTextEn: 'Go to Cash Payout 🏦'
  }
];


export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // App States
  const [countriesList, setCountriesList] = useState<CountryConfig[]>(COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(() => {
    try {
      const saved = localStorage.getItem('cashai_selected_country');
      if (saved) {
        const found = COUNTRIES.find(c => c.id === saved);
        if (found) return found;
      }
    } catch {}
    return COUNTRIES[0];
  });
  const [platforms, setPlatforms] = useState<Platform[]>(INITIAL_PLATFORMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cashBalance, setCashBalance] = useState<number>(2500000); // initial balance in local currency
  const [users, setUsers] = useState<RegisteredUser[]>((() => {
    try {
      const saved = localStorage.getItem('cashai_registered_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  })());
  const [ownerWithdrawn, setOwnerWithdrawn] = useState<number>(500000); // 500k in local currency initially

  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => {
    try {
      const saved = localStorage.getItem('cashai_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [ownerBookingCommission, setOwnerBookingCommission] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cashai_owner_booking_commission');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [isSiteClosed, setIsSiteClosed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cashai_is_site_closed') === 'true';
    } catch {
      return false;
    }
  });

  const [siteCloseMessage, setSiteCloseMessage] = useState<string>(() => {
    try {
      return localStorage.getItem('cashai_site_close_message') || (lang === 'ar' 
        ? 'عذراً، تم إغلاق الموقع مؤقتاً لأعمال التحديث والصيانة من قبل الإدارة العامة. سنعود قريباً!' 
        : 'Sorry, the platform is temporarily closed for updates and maintenance by the general administration. We will be back soon!');
    } catch {
      return 'عذراً، تم إغلاق الموقع مؤقتاً لأعمال التحديث والصيانة من قبل الإدارة العامة. سنعود قريباً!';
    }
  });

  const [customAppName, setCustomAppName] = useState<string>(() => {
    try {
      return localStorage.getItem('cashai_custom_app_name') || 'تاسكنيفا | tasknyfa';
    } catch {
      return 'تاسكنيفا | tasknyfa';
    }
  });

  const [customAppDesc, setCustomAppDesc] = useState<string>(() => {
    try {
      return localStorage.getItem('cashai_custom_app_desc') || (lang === 'ar' 
        ? 'منظومة سحب كاش ذكية وآمنة لجميع التطبيقات والمواقع المربوطة' 
        : 'Intelligent, secure cash-out engine for all linked platforms');
    } catch {
      return 'منظومة سحب كاش ذكية وآمنة لجميع التطبيقات والمواقع المربوطة';
    }
  });

  // Handle Country change and convert currency
  const handleCountryChange = (countryId: string, isSilent = false) => {
    const newCountry = countriesList.find(c => c.id === countryId);
    if (!newCountry) return;

    const oldCountry = selectedCountry;
    setSelectedCountry(newCountry);

    try {
      localStorage.setItem('cashai_selected_country', newCountry.id);
    } catch {}

    // Convert cash balance dynamically
    setCashBalance(prev => {
      const points = prev / oldCountry.rate;
      return Math.round(points * newCountry.rate);
    });

    // Convert owner withdrawn amount dynamically
    setOwnerWithdrawn(prev => {
      const points = prev / oldCountry.rate;
      return Math.round(points * newCountry.rate);
    });

    // Convert users earnedForOwner dynamically
    setUsers(prev => prev.map(u => ({
      ...u,
      earnedForOwner: Math.round((u.earnedForOwner / oldCountry.rate) * newCountry.rate)
    })));

    // Convert transaction amounts for a fully seamless experience
    setTransactions(prev => prev.map(tx => {
      if (tx.type === 'convert' || tx.type === 'withdraw') {
        const pointsEquivalent = tx.amount / oldCountry.rate;
        return {
          ...tx,
          amount: Math.round(pointsEquivalent * newCountry.rate),
          currency: newCountry.currencyCode as any
        };
      }
      return tx;
    }));

    // Update platforms rate
    setPlatforms(prev => prev.map(p => ({
      ...p,
      rate: newCountry.rate
    })));

    if (!isSilent) {
      triggerToast(
        lang === 'ar'
          ? `🌍 تم تغيير الدولة والعملة إلى ${newCountry.nameAr} (${newCountry.currencySymbol})`
          : `🌍 Country and currency changed to ${newCountry.nameEn} (${newCountry.currencySymbol})`,
        'info'
      );
    }
  };

  // Syncing States
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Active Push Notification State (Custom mobile-style slide-down alert banner)
  interface ActivePushNotification {
    id: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    type?: 'cash' | 'success' | 'pending' | 'system';
    timestamp: string;
  }
  const [activePush, setActivePush] = useState<ActivePushNotification | null>(null);

  // Load initial data from Firebase Firestore and sync it
  useEffect(() => {
    const loadFromFirestore = async () => {
      try {
        console.log("Connecting to Firestore to fetch users and transactions...");
        
        // 1. Fetch Users
        const usersSnap = await getDocs(usersRef);
        let fbUsers: RegisteredUser[] = [];
        if (usersSnap.empty) {
          console.log("No users found in Firestore. Seeding INITIAL_USERS...");
          for (const u of INITIAL_USERS) {
            await setDoc(doc(db, 'users', u.id), u);
          }
          fbUsers = INITIAL_USERS;
        } else {
          usersSnap.forEach(snap => {
            fbUsers.push(snap.data() as RegisteredUser);
          });
        }
        // Sort descending by registration date
        fbUsers.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
        setUsers(fbUsers);

        // Keep current logged in user synced with the latest Firestore state if they exist
        const savedCurrentUser = localStorage.getItem('cashai_current_user');
        if (savedCurrentUser) {
          const parsed = JSON.parse(savedCurrentUser) as RegisteredUser;
          const freshUser = fbUsers.find(u => u.id === parsed.id);
          if (freshUser) {
            setCurrentUser(freshUser);
            setCashBalance(freshUser.balance !== undefined ? freshUser.balance : 2500000);
            localStorage.setItem('cashai_current_user', JSON.stringify(freshUser));
          }
        }

        // 2. Fetch Transactions
        const txSnap = await getDocs(transactionsRef);
        let fbTx: Transaction[] = [];
        if (txSnap.empty) {
          console.log("No transactions found in Firestore. Seeding INITIAL_TRANSACTIONS...");
          for (const tx of INITIAL_TRANSACTIONS) {
            await setDoc(doc(db, 'transactions', tx.id), tx);
          }
          fbTx = INITIAL_TRANSACTIONS;
        } else {
          txSnap.forEach(snap => {
            fbTx.push(snap.data() as Transaction);
          });
        }
        // Sort descending by date
        fbTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(fbTx);

      } catch (err) {
        console.error("Firestore initialization failed:", err);
      }
    };

    loadFromFirestore();
  }, []);

  // Check for referral parameters in the URL on startup
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refId = params.get('ref');
      if (refId) {
        console.log("Detected referral code on startup:", refId);
        localStorage.setItem('cashai_referred_by', refId);
      }
    } catch (e) {
      console.error("Failed to parse referral code:", e);
    }
  }, []);

  // Fetch Live Exchange Rates from API and update country configurations
  useEffect(() => {
    const updateExchangeRates = async () => {
      try {
        console.log("Fetching live exchange rates from Open Exchange API...");
        const liveRates = await fetchLiveExchangeRates();
        const calculatedRates = calculateCountryRates(liveRates, 1000); // 1 Point = 1000 IQD base
        
        setCountriesList(prev => {
          const updated = prev.map(country => {
            const calculatedRate = calculatedRates[country.currencyCode];
            if (calculatedRate !== undefined) {
              const decimals = getDecimalPrecision(country.currencyCode);
              return {
                ...country,
                rate: parseFloat(calculatedRate.toFixed(decimals === 0 ? 0 : 4))
              };
            }
            return country;
          });

          // Keep selectedCountry in sync with fresh rate
          setSelectedCountry(current => {
            const fresh = updated.find(c => c.id === current.id);
            return fresh ? fresh : current;
          });

          // Also keep platforms in sync with fresh rate
          setPlatforms(pPrev => pPrev.map(p => {
            const fresh = updated.find(c => c.id === selectedCountry.id);
            return {
              ...p,
              rate: fresh ? fresh.rate : p.rate
            };
          }));

          return updated;
        });

        console.log("Live exchange rates successfully applied to all supported countries!");
      } catch (e) {
        console.error("Failed to apply live exchange rates:", e);
      }
    };

    updateExchangeRates();
  }, [selectedCountry.id]);

  // Synchronize users state changes directly to Firebase Firestore with 1s debounce
  useEffect(() => {
    if (users.length === 0) return;
    // Check if it's just the initial state before loading
    if (users.length === 1 && users[0].id === 'usr_owner' && users[0].earnedForOwner === 15000000) return;

    try {
      localStorage.setItem('cashai_registered_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }

    const syncUsersToFirestore = async () => {
      try {
        console.log("Debounced sync: writing updated users list to Firestore...");
        for (const u of users) {
          await setDoc(doc(db, 'users', u.id), u);
        }
      } catch (err) {
        console.error("Failed to sync users to Firestore:", err);
      }
    };

    const timer = setTimeout(syncUsersToFirestore, 1000);
    return () => clearTimeout(timer);
  }, [users]);

  // Synchronize transactions state changes directly to Firebase Firestore with 1s debounce
  useEffect(() => {
    if (transactions.length === 0) return;

    try {
      localStorage.setItem('cashai_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }

    const syncTransactionsToFirestore = async () => {
      try {
        console.log("Debounced sync: writing updated transactions to Firestore...");
        // Sync the latest 20 transactions to minimize writes
        const recentTx = transactions.slice(0, 20);
        for (const tx of recentTx) {
          await setDoc(doc(db, 'transactions', tx.id), tx);
        }
      } catch (err) {
        console.error("Failed to sync transactions to Firestore:", err);
      }
    };

    const timer = setTimeout(syncTransactionsToFirestore, 1000);
    return () => clearTimeout(timer);
  }, [transactions]);

  // Auto-dismiss the active push notification after 6 seconds
  useEffect(() => {
    if (!activePush) return;
    const timer = setTimeout(() => {
      setActivePush(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activePush]);

  // Push notification trigger with rich audio chime sound
  const triggerPushNotification = (
    titleAr: string, 
    titleEn: string, 
    descAr: string, 
    descEn: string,
    type?: 'cash' | 'success' | 'pending' | 'system'
  ) => {
    setActivePush({
      id: 'push_' + Date.now(),
      titleAr,
      titleEn,
      descAr,
      descEn,
      type: type || 'cash',
      timestamp: lang === 'ar' ? 'الآن' : 'Just Now'
    });

    // Play a premium rich notification chime sound (multiple elegant harmonic notes)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6

        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
      }
    } catch (e) {
      console.warn("Audio Context chime failed:", e);
    }
  };

  // System Notifications list for NotificationCenter
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif_1',
      titleAr: '🎁 هدية ترحيبية خاصة بانتظارك!',
      titleEn: '🎁 Special Welcome Gift is Waiting!',
      descAr: 'اضغط على زر المطالبة لإضافة +1,500 نقطة ترحيبية فوراً إلى حسابك الموحد.',
      descEn: 'Click claim to instantly add +1,500 welcome points to your unified account.',
      type: 'gift',
      timestamp: 'منذ دقيقة',
      read: false,
      claimed: false,
      giftPoints: 1500
    },
    {
      id: 'notif_2',
      titleAr: '🔒 تفعيل تشفير المحفظة بنجاح',
      titleEn: '🔒 Wallet Encryption Enabled',
      descAr: 'تم تعزيز أمان معاملاتك عبر تشفير SSL 256-bit لحماية عمليات سحب الأرباح.',
      descEn: 'Your transactions have been hardened with 256-bit SSL wrapping for premium security.',
      type: 'security',
      timestamp: 'منذ ١٠ دقائق',
      read: false
    },
    {
      id: 'notif_3',
      titleAr: '🔮 قذائف Marble Crush المضافة حديثاً!',
      titleEn: '🔮 NEW: Marble Crush Game Added!',
      descAr: 'العب اللعبة الجديدة الآن! كل قذيفة ترميها تمنحك ٥٠ نقطة حقيقية قابلة للسحب كاش.',
      descEn: 'Play the newly added game! Every ball you throw rewards +50 real points withdrawable instantly.',
      type: 'system',
      timestamp: 'منذ ساعة',
      read: true
    },
    {
      id: 'notif_4',
      titleAr: '⚡ أسعار سحب ممتازة اليوم',
      titleEn: '⚡ Peak Cashout Rates Today',
      descAr: 'أسعار تحويل النقاط إلى عملات محلية في أعلى مستوياتها اليوم! اغتنم الفرصة.',
      descEn: 'Currency conversion rates for e-wallets are currently at peak levels today. Claim now!',
      type: 'cash',
      timestamp: 'منذ ٤ ساعات',
      read: true
    }
  ]);

  // Synchronize systemNotifications changes back to currentUser object and Firestore
  useEffect(() => {
    if (currentUser) {
      const currentNotifsJSON = JSON.stringify(currentUser.notifications || []);
      const systemNotifsJSON = JSON.stringify(systemNotifications);
      if (currentNotifsJSON !== systemNotifsJSON) {
        const updatedUser: RegisteredUser = {
          ...currentUser,
          notifications: systemNotifications
        };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        // Save to Firebase Firestore cloud database
        setDoc(doc(db, 'users', updatedUser.id), updatedUser)
          .catch(err => console.error("Firestore user notifications update failed:", err));

        try {
          localStorage.setItem('cashai_current_user', JSON.stringify(updatedUser));
          const savedUsers = localStorage.getItem('cashai_registered_users');
          if (savedUsers) {
            const parsed = JSON.parse(savedUsers) as RegisteredUser[];
            const updatedList = parsed.map(u => u.id === currentUser.id ? updatedUser : u);
            localStorage.setItem('cashai_registered_users', JSON.stringify(updatedList));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [systemNotifications, currentUser?.id]);

  // Load user specific notifications when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.notifications && currentUser.notifications.length > 0) {
        setSystemNotifications(currentUser.notifications);
      } else {
        const initial: SystemNotification[] = [
          {
            id: 'notif_1',
            titleAr: '🎁 هدية ترحيبية خاصة بانتظارك!',
            titleEn: '🎁 Special Welcome Gift is Waiting!',
            descAr: 'اضغط على زر المطالبة لإضافة +1,500 نقطة ترحيبية فوراً إلى حسابك الموحد.',
            descEn: 'Click claim to instantly add +1,500 welcome points to your unified account.',
            type: 'gift',
            timestamp: 'منذ دقيقة',
            read: false,
            claimed: false,
            giftPoints: 1500
          },
          {
            id: 'notif_2',
            titleAr: '🔒 تفعيل تشفير المحفظة بنجاح',
            titleEn: '🔒 Wallet Encryption Enabled',
            descAr: 'تم تعزيز أمان معاملاتك عبر تشفير SSL 256-bit لحماية عمليات سحب الأرباح.',
            descEn: 'Your transactions have been hardened with 256-bit SSL wrapping for premium security.',
            type: 'security',
            timestamp: 'منذ ١٠ دقائق',
            read: false
          },
          {
            id: 'notif_3',
            titleAr: '🔮 قذائف Marble Crush المضافة حديثاً!',
            titleEn: '🔮 NEW: Marble Crush Game Added!',
            descAr: 'العب اللعبة الجديدة الآن! كل قذيفة ترميها تمنحك ٥٠ نقطة حقيقية قابلة للسحب كاش.',
            descEn: 'Play the newly added game! Every ball you throw rewards +50 real points withdrawable instantly.',
            type: 'system',
            timestamp: 'منذ ساعة',
            read: true
          },
          {
            id: 'notif_4',
            titleAr: '⚡ أسعار سحب ممتازة اليوم',
            titleEn: '⚡ Peak Cashout Rates Today',
            descAr: 'أسعار تحويل النقاط إلى عملات محلية في أعلى مستوياتها اليوم! اغتنم الفرصة.',
            descEn: 'Currency conversion rates for e-wallets are currently at peak levels today. Claim now!',
            type: 'cash',
            timestamp: 'منذ ٤ ساعات',
            read: true
          }
        ];
        setSystemNotifications(initial);
        const updatedUser = { ...currentUser, notifications: initial };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        setDoc(doc(db, 'users', updatedUser.id), updatedUser)
          .catch(e => console.error(e));
      }
    }
  }, [currentUser?.id]);

  // Notifications State
  const [notifications, setNotifications] = useState<{ id: string; msg: string; type: 'success' | 'info' }[]>([]);

  // Main Tasks & Quests States
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [claimedTasks, setClaimedTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cashai_claimed_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [hasPlayedGame, setHasPlayedGame] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cashai_has_played_game') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cashai_claimed_tasks', JSON.stringify(claimedTasks));
    } catch (e) {
      console.error(e);
    }
  }, [claimedTasks]);

  useEffect(() => {
    try {
      localStorage.setItem('cashai_has_played_game', hasPlayedGame ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [hasPlayedGame]);

  // Determine completed tasks dynamically based on live states
  const completedTaskIds = React.useMemo(() => {
    const ids: string[] = [];

    // 1. Link platform (at least one platform is connected)
    const isPlatformConnected = platforms.some(p => p.connected);
    if (isPlatformConnected) ids.push('link_platform');

    // 2. Play game
    if (hasPlayedGame) ids.push('play_game');

    // 3. Sync platforms (at least one sync transaction exists)
    const hasSynced = transactions.some(t => t.type === 'sync');
    if (hasSynced) ids.push('sync_platforms');

    // 4. Convert points (at least one convert transaction exists)
    const hasConverted = transactions.some(t => t.type === 'convert');
    if (hasConverted) ids.push('convert_points');

    // 5. Book flight or visa
    const hasBooked = ownerBookingCommission > 0;
    if (hasBooked) ids.push('book_flight_visa');

    // 6. Withdraw cash (at least one withdraw transaction exists)
    const hasWithdrawn = transactions.some(t => t.type === 'withdraw');
    if (hasWithdrawn) ids.push('withdraw_cash');

    return ids;
  }, [platforms, hasPlayedGame, transactions, ownerBookingCommission]);

  // Handle claiming a task reward
  const handleClaimReward = (taskId: string, points: number) => {
    if (claimedTasks.includes(taskId)) return;

    // 1. Award points to the main games account
    setPlatforms(prev => prev.map(p => {
      if (p.id === 'cash_games') {
        return {
          ...p,
          points: p.points + points,
          lastSynced: lang === 'ar' ? 'الآن' : 'Just Now'
        };
      }
      return p;
    }));

    // 2. Record transaction
    const targetTask = TASKS.find(t => t.id === taskId);
    const titleAr = targetTask ? targetTask.titleAr : 'مكافأة مهمة';
    const titleEn = targetTask ? targetTask.titleEn : 'Quest Reward';

    const newTx: Transaction = {
      id: 'tx_task_' + Math.floor(Math.random() * 900000 + 100000),
      type: 'sync',
      platformId: 'cash_games',
      platformName: `Quest: ${titleEn}`,
      platformNameAr: `مهمة: ${titleAr}`,
      points: points,
      amount: 0,
      currency: selectedCountry.currencyCode as any,
      status: 'success',
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    // 3. Add to claimed list
    setClaimedTasks(prev => [...prev, taskId]);

    // 4. Show custom toast with local currency value conversion
    const cashValue = Math.round(points * selectedCountry.rate);
    triggerToast(
      lang === 'ar'
        ? `🎉 مبارك! تم استلام مكافأة المهمة: +${points.toLocaleString()} نقطة (تعادل +${cashValue.toLocaleString()} ${selectedCountry.currencySymbol})!`
        : `🎉 Congratulations! Claimed quest reward: +${points.toLocaleString()} points (equiv. +${cashValue.toLocaleString()} ${selectedCountry.currencyCode})!`,
      'success'
    );
  };


  // Automatic Geolocation Detection on first load
  useEffect(() => {
    const detectGeoCountry = async () => {
      try {
        const isAlreadyDetected = localStorage.getItem('cashai_geo_detected') === 'true';
        const hasStoredPreference = localStorage.getItem('cashai_selected_country');
        
        if (isAlreadyDetected || hasStoredPreference) {
          return; // Skip if already determined or has user custom selection
        }

        let detectedCode: string | null = null;

        // Try API 1: ipapi.co (fast, HTTPS, free)
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.country_code) {
              detectedCode = data.country_code;
            }
          }
        } catch (e) {
          console.warn("ipapi.co failed, trying fallback...", e);
        }

        // Try API 2: freeipapi.com (free, HTTPS fallback)
        if (!detectedCode) {
          try {
            const res = await fetch('https://freeipapi.com/api/json');
            if (res.ok) {
              const data = await res.json();
              if (data && data.countryCode) {
                detectedCode = data.countryCode;
              }
            }
          } catch (e) {
            console.warn("freeipapi failed", e);
          }
        }

        // Try API 3: HTML5 Geolocation API as absolute fallback
        if (!detectedCode && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.address && data.address.country_code) {
                    const code = data.address.country_code.toUpperCase();
                    const matchedCountry = countriesList.find(c => c.id.toUpperCase() === code);
                    if (matchedCountry && matchedCountry.id !== selectedCountry.id) {
                      handleCountryChange(matchedCountry.id, true);
                      localStorage.setItem('cashai_geo_detected', 'true');
                      triggerToast(
                        lang === 'ar'
                          ? `📍 تم تحديد موقعك تلقائياً: ${matchedCountry.nameAr} ${matchedCountry.flag}. تم ضبط العملة (${matchedCountry.currencySymbol}) وسعر الصرف افتراضياً.`
                          : `📍 Automatically detected your location: ${matchedCountry.nameEn} ${matchedCountry.flag}. Configured local currency (${matchedCountry.currencySymbol}) and rate.`,
                        'success'
                      );
                    }
                  }
                }
              } catch (e) {
                console.warn("Reverse geocode failed", e);
              }
            },
            (error) => {
              console.warn("HTML5 Geolocation denied/failed", error);
            },
            { timeout: 5000 }
          );
        }

        if (detectedCode) {
          const matchedCountry = countriesList.find(
            c => c.id.toUpperCase() === detectedCode?.toUpperCase()
          );

          if (matchedCountry && matchedCountry.id !== selectedCountry.id) {
            handleCountryChange(matchedCountry.id, true);
            localStorage.setItem('cashai_geo_detected', 'true');
            triggerToast(
              lang === 'ar'
                ? `📍 تم تحديد موقعك تلقائياً: ${matchedCountry.nameAr} ${matchedCountry.flag}. تم ضبط العملة (${matchedCountry.currencySymbol}) وسعر الصرف افتراضياً.`
                : `📍 Automatically detected your location: ${matchedCountry.nameEn} ${matchedCountry.flag}. Configured local currency (${matchedCountry.currencySymbol}) and rate.`,
              'success'
            );
          } else if (matchedCountry) {
            localStorage.setItem('cashai_geo_detected', 'true');
          }
        }
      } catch (err) {
        console.error("Failed auto-detecting geo country:", err);
      }
    };

    const timer = setTimeout(() => {
      detectGeoCountry();
    }, 1800);

    return () => clearTimeout(timer);
  }, [lang, selectedCountry]);

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync users list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cashai_registered_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  // Convert USD rewards to local currency based on standard rates of countries
  const convertUsdToLocal = (usdAmount: number, countryId: string): number => {
    switch (countryId.toUpperCase()) {
      case 'IQ': return usdAmount * 1450; // 1 USD = 1450 IQD
      case 'EG': return usdAmount * 48;   // 1 USD = 48 EGP
      case 'SA': return usdAmount * 3.75; // 1 USD = 3.75 SAR
      case 'AE': return usdAmount * 3.67; // 1 USD = 3.67 AED
      case 'JO': return usdAmount * 0.71; // 1 USD = 0.71 JOD
      case 'TR': return usdAmount * 32;   // 1 USD = 32 TRY
      case 'US': return usdAmount;        // 1 USD = 1 USD
      case 'EU': return usdAmount * 0.92; // 1 USD = 0.92 EUR
      case 'GB': return usdAmount * 0.79; // 1 USD = 0.79 GBP
      case 'LY': return usdAmount * 4.8;  // 1 USD = 4.8 LYD
      case 'MA': return usdAmount * 10;   // 1 USD = 10 MAD
      case 'DZ': return usdAmount * 135;  // 1 USD = 135 DZD
      case 'TN': return usdAmount * 3.1;  // 1 USD = 3.1 TND
      case 'KW': return usdAmount * 0.31; // 1 USD = 0.31 KWD
      case 'QA': return usdAmount * 3.64; // 1 USD = 3.64 QAR
      case 'OM': return usdAmount * 0.38; // 1 USD = 0.38 OMR
      case 'BH': return usdAmount * 0.38; // 1 USD = 0.38 BHD
      case 'YE': return usdAmount * 250;  // 1 USD = 250 YER
      case 'CN': return usdAmount * 7.2;  // 1 USD = 7.2 CNY
      case 'JP': return usdAmount * 155;  // 1 USD = 155 JPY
      case 'KR': return usdAmount * 1350; // 1 USD = 1350 KRW
      case 'IN': return usdAmount * 83;   // 1 USD = 83 INR
      case 'ID': return usdAmount * 16000;// 1 USD = 16000 IDR
      case 'MY': return usdAmount * 4.7;  // 1 USD = 4.7 MYR
      case 'SG': return usdAmount * 1.35; // 1 USD = 1.35 SGD
      case 'TH': return usdAmount * 36;   // 1 USD = 36 THB
      case 'PH': return usdAmount * 58;   // 1 USD = 58 PHP
      case 'PK': return usdAmount * 278;  // 1 USD = 278 PKR
      case 'VN': return usdAmount * 25000;// 1 USD = 25000 VND
      default: return usdAmount * 1450;   // Fallback to IQD standard rate
    }
  };

  // Trigger login rewards for Owner, Manager, and Assistant Manager
  const triggerRewardsForLogin = (loggedInUser: RegisteredUser) => {
    const mainAdminBonus = convertUsdToLocal(1000, selectedCountry.id);
    const secondManagerBonus = convertUsdToLocal(100, selectedCountry.id);
    const assistantBonus = convertUsdToLocal(50, selectedCountry.id);

    setUsers(prevUsers => {
      let mainAdminUpdated = false;
      let managerUpdated = false;
      let assistantUpdated = false;

      const updatedUsers = prevUsers.map(u => {
        const emailLower = (u.email || '').toLowerCase().trim();
        const isMainAdmin = emailLower === 'kaskala520@gmail.com' || u.role === 'owner';
        const isSecondManager = u.role === 'manager';
        const isAssistant = u.role === 'assistant';

        if (isMainAdmin) {
          mainAdminUpdated = true;
          const currentBal = u.balance !== undefined ? u.balance : 2500000;
          return {
            ...u,
            balance: currentBal + mainAdminBonus,
            earnedForOwner: (u.earnedForOwner || 0) + mainAdminBonus
          };
        }
        if (isSecondManager) {
          managerUpdated = true;
          const currentBal = u.balance !== undefined ? u.balance : 2500000;
          return {
            ...u,
            balance: currentBal + secondManagerBonus
          };
        }
        if (isAssistant) {
          assistantUpdated = true;
          const currentBal = u.balance !== undefined ? u.balance : 2500000;
          return {
            ...u,
            balance: currentBal + assistantBonus
          };
        }
        return u;
      });

      // Record transaction logs for these payouts
      const newTransactions: Transaction[] = [];
      const timestamp = new Date().toISOString();

      if (mainAdminUpdated) {
        newTransactions.push({
          id: 'tx_rwd_owner_' + Math.floor(Math.random() * 900000 + 100000),
          type: 'convert',
          amount: mainAdminBonus,
          currency: selectedCountry.currencyCode as any,
          status: 'success',
          platformName: `Main Admin Login Bonus ($1000) for ${loggedInUser.name}`,
          platformNameAr: `مكافأة المدير الرئيسي ($1000) لتسجيل دخول ${loggedInUser.name}`,
          date: timestamp
        });
      }
      if (managerUpdated) {
        newTransactions.push({
          id: 'tx_rwd_mgr_' + Math.floor(Math.random() * 900000 + 100000),
          type: 'convert',
          amount: secondManagerBonus,
          currency: selectedCountry.currencyCode as any,
          status: 'success',
          platformName: `Second Manager Login Bonus ($100) for ${loggedInUser.name}`,
          platformNameAr: `مكافأة المدير الثاني ($100) لتسجيل دخول ${loggedInUser.name}`,
          date: timestamp
        });
      }
      if (assistantUpdated) {
        newTransactions.push({
          id: 'tx_rwd_asst_' + Math.floor(Math.random() * 900000 + 100000),
          type: 'convert',
          amount: assistantBonus,
          currency: selectedCountry.currencyCode as any,
          status: 'success',
          platformName: `Assistant Manager Login Bonus ($50) for ${loggedInUser.name}`,
          platformNameAr: `مكافأة مساعد المدير ($50) لتسجيل دخول ${loggedInUser.name}`,
          date: timestamp
        });
      }

      if (newTransactions.length > 0) {
        setTransactions(prevTx => [...newTransactions, ...prevTx]);
      }

      return updatedUsers;
    });
  };

  // Trigger VIP/Distinguished rewards on registration (+$10 USD per VIP user, max 50 VIPs)
  const triggerRewardsForRegistration = (newlyRegisteredUser: RegisteredUser) => {
    const vipBonus = convertUsdToLocal(10, selectedCountry.id);

    setUsers(prevUsers => {
      let vipCount = 0;
      const updatedUsers = prevUsers.map(u => {
        if (u.isDistinguished) {
          vipCount++;
          const currentBal = u.balance !== undefined ? u.balance : 2500000;
          const currentVipUsd = u.distinguishedRewardsUSD !== undefined ? u.distinguishedRewardsUSD : 0;
          return {
            ...u,
            balance: currentBal + vipBonus,
            distinguishedRewardsUSD: currentVipUsd + 10
          };
        }
        return u;
      });

      // Record transaction logs for each VIP member who received the bonus
      const timestamp = new Date().toISOString();
      const vipTransactions: Transaction[] = [];

      prevUsers.forEach(u => {
        if (u.isDistinguished) {
          vipTransactions.push({
            id: 'tx_vip_rwd_' + Math.floor(Math.random() * 900000 + 100000),
            type: 'convert',
            amount: vipBonus,
            currency: selectedCountry.currencyCode as any,
            status: 'success',
            platformName: `VIP Member Bonus ($10) to ${u.name} for registration of ${newlyRegisteredUser.name}`,
            platformNameAr: `مكافأة العضو المتميز (${u.name}) بقيمة $10 لتسجيل ${newlyRegisteredUser.name}`,
            date: timestamp
          });
        }
      });

      if (vipTransactions.length > 0) {
        setTransactions(prevTx => [...vipTransactions, ...prevTx]);
      }

      if (vipCount > 0) {
        triggerToast(
          lang === 'ar'
            ? `👑 تم توزيع مكافأة العضو المتميز (+$10 لكل عضو) لعدد ${vipCount} أعضاء متميزين!`
            : `👑 VIP bonuses distributed (+$10 each) to ${vipCount} distinguished members!`,
          'success'
        );
      }

      return updatedUsers;
    });
  };

  // Trigger administrative and VIP rewards of $1000, $100, $50, and $10 upon withdrawal or transfer
  const triggerRewardsForTransaction = (type: 'withdraw' | 'transfer', userAfterAction: RegisteredUser | null) => {
    const ownerBonusLocal = convertUsdToLocal(1000, selectedCountry.id);
    const managerBonusLocal = convertUsdToLocal(100, selectedCountry.id);
    const assistantBonusLocal = convertUsdToLocal(50, selectedCountry.id);
    const distinguishedBonusLocal = convertUsdToLocal(10, selectedCountry.id);

    const timestamp = new Date().toISOString();
    const rewardTxList: Transaction[] = [];

    // Update users list
    setUsers(prevUsers => {
      return prevUsers.map(u => {
        // Find if this is the user who just did the action, use their updated balance as the base
        const baseUser = (userAfterAction && u.id === userAfterAction.id) ? userAfterAction : u;
        
        const emailLower = (baseUser.email || '').toLowerCase().trim();
        const isMainAdmin = emailLower === 'kaskala520@gmail.com' || baseUser.role === 'owner';
        const isSecondManager = baseUser.role === 'manager';
        const isAssistant = baseUser.role === 'assistant';
        const isDistinguished = baseUser.isDistinguished;

        let addedAmount = 0;
        let roleNameAr = '';
        let roleNameEn = '';
        let usdVal = 0;

        if (isMainAdmin) {
          addedAmount += ownerBonusLocal;
          roleNameAr = 'المدير الرئيسي (المصمم)';
          roleNameEn = 'Chief Designer / Main Manager';
          usdVal += 1000;
        }
        if (isSecondManager) {
          addedAmount += managerBonusLocal;
          roleNameAr = 'المدير الثانوي';
          roleNameEn = 'Secondary Manager';
          usdVal += 100;
        }
        if (isAssistant) {
          addedAmount += assistantBonusLocal;
          roleNameAr = 'مساعد المدير';
          roleNameEn = 'Assistant Manager';
          usdVal += 50;
        }
        if (isDistinguished) {
          addedAmount += distinguishedBonusLocal;
          roleNameAr = 'العضو المميز';
          roleNameEn = 'Distinguished Member';
          usdVal += 10;
        }

        if (addedAmount > 0) {
          const currentBal = baseUser.balance !== undefined ? baseUser.balance : 2500000;
          const currentEarnedForOwner = baseUser.earnedForOwner || 0;

          rewardTxList.push({
            id: 'tx_txrwd_' + Math.floor(Math.random() * 900000 + 100000),
            type: 'convert',
            amount: addedAmount,
            currency: selectedCountry.currencyCode as any,
            status: 'success',
            platformName: `${roleNameEn} $${usdVal} Bonus (from ${type === 'withdraw' ? 'withdrawal' : 'transfer'} by ${userAfterAction?.name || 'User'})`,
            platformNameAr: `مكافأة ${roleNameAr} بقيمة $${usdVal} (من عملية ${type === 'withdraw' ? 'سحب' : 'تحويل'} لـ ${userAfterAction?.name || 'مستخدم'})`,
            date: timestamp
          });

          return {
            ...baseUser,
            balance: currentBal + addedAmount,
            earnedForOwner: isMainAdmin ? currentEarnedForOwner + addedAmount : currentEarnedForOwner
          };
        }
        return baseUser;
      });
    });

    if (rewardTxList.length > 0) {
      setTransactions(prev => [...rewardTxList, ...prev]);
    }

    // Now update current user
    setCurrentUser(prevCurrent => {
      if (!prevCurrent) return null;
      // Use userAfterAction as base if it's the current user
      const baseUser = (userAfterAction && prevCurrent.id === userAfterAction.id) ? userAfterAction : prevCurrent;

      const emailLower = (baseUser.email || '').toLowerCase().trim();
      const isMainAdmin = emailLower === 'kaskala520@gmail.com' || baseUser.role === 'owner';
      const isSecondManager = baseUser.role === 'manager';
      const isAssistant = baseUser.role === 'assistant';
      const isDistinguished = baseUser.isDistinguished;

      let addedAmount = 0;
      if (isMainAdmin) addedAmount += ownerBonusLocal;
      if (isSecondManager) addedAmount += managerBonusLocal;
      if (isAssistant) addedAmount += assistantBonusLocal;
      if (isDistinguished) addedAmount += distinguishedBonusLocal;

      if (addedAmount > 0) {
        const currentBal = baseUser.balance !== undefined ? baseUser.balance : 2500000;
        const currentEarnedForOwner = baseUser.earnedForOwner || 0;
        const updated = {
          ...baseUser,
          balance: currentBal + addedAmount,
          earnedForOwner: isMainAdmin ? currentEarnedForOwner + addedAmount : currentEarnedForOwner
        };

        // Keep cashBalance in sync with the current user's balance
        setCashBalance(updated.balance);

        try {
          localStorage.setItem('cashai_current_user', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      } else {
        // If no added reward for this user, but we had deducted their balance, keep cashBalance in sync with the deduction
        setCashBalance(baseUser.balance !== undefined ? baseUser.balance : 2500000);
        return baseUser;
      }
    });

    const typeLabelAr = type === 'withdraw' ? 'سحب أموال' : 'تحويل أموال';
    const typeLabelEn = type === 'withdraw' ? 'withdrawal' : 'transfer';
    triggerToast(
      lang === 'ar'
        ? `🎁 تم توزيع مكافآت الإدارة والأعضاء المميزين ($1000 / $100 / $50 / $10) تلقائياً بمناسبة عملية ال${typeLabelAr}!`
        : `🎁 Administrative and VIP rewards ($1000 / $100 / $50 / $10) successfully distributed due to ${typeLabelEn}!`,
      'success'
    );
  };

  // Handle successful free registration
  const handleRegisterSuccess = (regDetails: { 
    name: string; 
    email: string; 
    phone: string; 
    phoneVisibility: 'everyone' | 'only_accepted' | 'only_admin'; 
    appUrl: string; 
    password?: string; 
  }) => {
    const allowedOwnerEmails = [
      'kaskala520@gmail.com',
      'nyfarwbn@gmail.com',
      'nyfarwbn5@gmail.com',
      'dalaneyup.world82@gmail.com'
    ];
    const isOwnerEmail = allowedOwnerEmails.includes(regDetails.email.trim().toLowerCase());
    
    // Check if referred by another user
    const referrerId = localStorage.getItem('cashai_referred_by');

    const newUser: RegisteredUser = {
      id: isOwnerEmail ? 'usr_owner' : 'usr_' + Math.floor(Math.random() * 900 + 100),
      name: regDetails.name,
      phone: regDetails.phone,
      email: regDetails.email,
      phoneVisibility: regDetails.phoneVisibility || 'only_accepted',
      profileChangesHistory: [],
      appUrl: regDetails.appUrl || '',
      password: regDetails.password,
      registeredAt: new Date().toISOString(),
      earnedForOwner: isOwnerEmail ? 15000000 : 0,
      walletType: isOwnerEmail ? 'System Controller' : 'App Integration',
      status: 'active',
      role: isOwnerEmail ? 'owner' : 'user',
      referredBy: referrerId || undefined,
      referralPoints: referrerId ? 5000 : 0,
      referralsCredited: referrerId ? 1 : 0
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    
    // Save to Firebase Firestore cloud database
    setDoc(doc(db, 'users', newUser.id), newUser).catch(err => console.error("Firestore user save failed:", err));

    try {
      localStorage.setItem('cashai_current_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }

    // Award welcome referral bonus of 5,000 points to the new user
    if (referrerId) {
      // Award the points to the new user
      awardPoints(5000, 'مكافأة التسجيل بالإحالة 🎁', 'Referral Sign-up Bonus 🎁');
      
      // Update referrer user's referredUsers and referralPoints in the state list
      setUsers(prev => prev.map(u => {
        if (u.id === referrerId) {
          const updatedReferrer: RegisteredUser = {
            ...u,
            referredUsers: [...(u.referredUsers || []), newUser.id],
            referralPoints: (u.referralPoints || 0) + 5000
          };
          setDoc(doc(db, 'users', updatedReferrer.id), updatedReferrer).catch(err => console.error("Firestore referrer update failed:", err));
          return updatedReferrer;
        }
        return u;
      }));

      localStorage.removeItem('cashai_referred_by');
    }

    triggerToast(
      lang === 'ar' 
        ? (isOwnerEmail 
            ? `👑 أهلاً بك يا مصمم الموقع! تم تسجيل دخولك تلقائياً بصفتك المدير الرئيسي للمنصة.` 
            : (referrerId 
                ? `🎉 أهلاً بك يا ${regDetails.name}! تم تسجيل حسابك بنجاح وتمت إضافة +5,000 نقطة مكافأة الإحالة!`
                : `🎉 أهلاً بك يا ${regDetails.name}! تم تسجيل حسابك بنجاح وحساب النقاط نشط.`))
        : (isOwnerEmail 
            ? `👑 Welcome, Site Designer! You have logged in automatically as the Chief Site Manager.` 
            : (referrerId
                ? `🎉 Welcome ${regDetails.name}! Registered successfully, +5,000 points referral bonus added!`
                : `🎉 Welcome ${regDetails.name}! Your account was registered successfully and points tracking is active.`)),
      'success'
    );

    // Call registration rewards for VIP members!
    triggerRewardsForRegistration(newUser);
  };

  // Handle successful login
  const handleLoginSuccess = (user: RegisteredUser) => {
    // First apply rewards so that the users list is updated
    triggerRewardsForLogin(user);

    // Calculate immediate updated balance for the currently logged in user to show instantly in state
    const mainAdminBonus = convertUsdToLocal(1000, selectedCountry.id);
    const secondManagerBonus = convertUsdToLocal(100, selectedCountry.id);
    const assistantBonus = convertUsdToLocal(50, selectedCountry.id);

    const emailLower = (user.email || '').toLowerCase().trim();
    const isMainAdmin = emailLower === 'kaskala520@gmail.com' || user.role === 'owner';
    const isSecondManager = user.role === 'manager';
    const isAssistant = user.role === 'assistant';

    let updatedUser = { ...user };
    const currentBal = user.balance !== undefined ? user.balance : 2500000;

    if (isMainAdmin) {
      updatedUser.balance = currentBal + mainAdminBonus;
      updatedUser.earnedForOwner = (user.earnedForOwner || 0) + mainAdminBonus;
    } else if (isSecondManager) {
      updatedUser.balance = currentBal + secondManagerBonus;
    } else if (isAssistant) {
      updatedUser.balance = currentBal + assistantBonus;
    }

    // Process referral bonuses for the logging in user
    const referredCount = updatedUser.referredUsers?.length || 0;
    const creditedCount = updatedUser.referralsCredited || 0;
    
    if (referredCount > creditedCount) {
      const pendingReferrals = referredCount - creditedCount;
      const bonusPoints = pendingReferrals * 5000;
      
      // Credit points to active platforms state
      awardPoints(bonusPoints, 'مكافأة دعوة الأصدقاء 👥', 'Friend Referral Bonus 👥');
      
      // Update the user's referralsCredited field
      updatedUser.referralsCredited = referredCount;
      updatedUser.referralPoints = (updatedUser.referralPoints || 0) + bonusPoints;
      
      // Trigger a special welcome referral toast
      setTimeout(() => {
        triggerToast(
          lang === 'ar'
            ? `🎉 مبروك! حصلت على +${bonusPoints.toLocaleString()} نقطة مكافأة لدعوة ${pendingReferrals} من أصدقائك!`
            : `🎉 Congratulations! You received a bonus of +${bonusPoints.toLocaleString()} points for referring ${pendingReferrals} of your friends!`,
          'success'
        );
      }, 1500);
    }

    setCurrentUser(updatedUser);
    setCashBalance(updatedUser.balance !== undefined ? updatedUser.balance : 2500000);
    
    // Save to Firebase Firestore cloud database
    setDoc(doc(db, 'users', updatedUser.id), updatedUser).catch(err => console.error("Firestore user update failed:", err));

    try {
      localStorage.setItem('cashai_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }

    triggerToast(
      lang === 'ar'
        ? `🔓 أهلاً بك مجدداً يا ${updatedUser.name}! تم تسجيل دخولك بنجاح.`
        : `🔓 Welcome back, ${updatedUser.name}! Successfully logged in.`,
      'success'
    );
  };

  const dispatchMatchingNotifications = (updatedUser: RegisteredUser) => {
    if (!updatedUser.onboarding) return;

    const newUserCategories = updatedUser.onboarding.selectedCategories || [];
    const newUserPurpose = updatedUser.onboarding.purpose || 'both';

    if (newUserCategories.length === 0) return;

    const updatedUsersList = users.map(otherUser => {
      // Don't notify oneself
      if (otherUser.id === updatedUser.id) return otherUser;

      const otherCategories = otherUser.onboarding?.selectedCategories || [];
      const otherPurpose = otherUser.onboarding?.purpose || 'both';

      // Determine if they match
      let isMatch = false;

      // Case 1: updatedUser is provider (or both) -> matches with otherUser who is seeker (or both)
      if (
        (newUserPurpose === 'provide' || newUserPurpose === 'both') &&
        (otherPurpose === 'search' || otherPurpose === 'both')
      ) {
        const hasGeneral = otherCategories.includes('general_services') || newUserCategories.includes('general_services');
        const hasIntersection = newUserCategories.some(cat => otherCategories.includes(cat));
        if (hasGeneral || hasIntersection) {
          isMatch = true;
        }
      }

      // Case 2: updatedUser is seeker (or both) -> matches with otherUser who is provider (or both)
      if (
        !isMatch &&
        (newUserPurpose === 'search' || newUserPurpose === 'both') &&
        (otherPurpose === 'provide' || otherPurpose === 'both')
      ) {
        const hasGeneral = otherCategories.includes('general_services') || newUserCategories.includes('general_services');
        const hasIntersection = newUserCategories.some(cat => otherCategories.includes(cat));
        if (hasGeneral || hasIntersection) {
          isMatch = true;
        }
      }

      if (isMatch) {
        // Create matching notification
        const matchedCategories = newUserCategories.includes('general_services') || otherCategories.includes('general_services')
          ? ['general_services']
          : newUserCategories.filter(cat => otherCategories.includes(cat));

        const matchedCategoryNamesAr: string[] = [];
        const matchedCategoryNamesEn: string[] = [];

        matchedCategories.forEach(catId => {
          if (catId === 'general_services') {
            matchedCategoryNamesAr.push('خدمات عامة');
            matchedCategoryNamesEn.push('General Services');
          } else if (catId.startsWith('custom_')) {
            const cleanName = catId.replace('custom_', '');
            matchedCategoryNamesAr.push(cleanName);
            matchedCategoryNamesEn.push(cleanName);
          } else {
            // Find in SERVICE_CATEGORIES
            for (const catGroup of SERVICE_CATEGORIES) {
              const item = catGroup.items.find(i => i.id === catId);
              if (item) {
                matchedCategoryNamesAr.push(item.nameAr);
                matchedCategoryNamesEn.push(item.nameEn);
                break;
              }
            }
          }
        });

        const categoryStringAr = matchedCategoryNamesAr.length > 0 ? matchedCategoryNamesAr.join('، ') : (lang === 'ar' ? 'خدمات مخصصة' : 'Custom Services');
        const categoryStringEn = matchedCategoryNamesEn.length > 0 ? matchedCategoryNamesEn.join(', ') : (lang === 'ar' ? 'خدمات مخصصة' : 'Custom Services');

        const titleAr = `🔔 شريك جديد مطابق لخدمتك! (${categoryStringAr})`;
        const titleEn = `🔔 New Partner Matching Your Service! (${categoryStringEn})`;

        const purposeTextAr = newUserPurpose === 'provide' ? 'يقدم خدمة' : newUserPurpose === 'search' ? 'يبحث عن خدمة' : 'يقدم ويبحث عن خدمات';
        const purposeTextEn = newUserPurpose === 'provide' ? 'offers a service' : newUserPurpose === 'search' ? 'seeks a service' : 'offers & seeks services';

        const descAr = `المستخدم ${updatedUser.name} قام بالتسجيل/التحديث وهو الآن (${purposeTextAr}) في مجال: ${categoryStringAr}. يمكنك التواصل معه الآن عبر وسائل الاتصال المفضلة لديه.`;
        const descEn = `User ${updatedUser.name} registered/updated as (${purposeTextEn}) in: ${categoryStringEn}. Connect with them via preferred channels.`;

        const newNotification: SystemNotification = {
          id: `notif_match_${updatedUser.id}_${Date.now()}`,
          titleAr,
          titleEn,
          descAr,
          descEn,
          type: 'system',
          timestamp: 'الآن',
          read: false
        };

        const existingNotifs = otherUser.notifications || [];
        const updatedNotifs = [newNotification, ...existingNotifs];

        // Update other user object with new notification
        const updatedOtherUser: RegisteredUser = {
          ...otherUser,
          notifications: updatedNotifs
        };

        if (currentUser && otherUser.id === currentUser.id) {
          // If the matched user is currently active (e.g. testing in the same window), update immediately
          setSystemNotifications(updatedNotifs);
        }

        return updatedOtherUser;
      }

      return otherUser;
    });

    setUsers(updatedUsersList);
  };

  // Handle onboarding wizard completion
  const handleOnboardingComplete = (onboardingData: OnboardingData) => {
    if (!currentUser) return;
    const updatedUser: RegisteredUser = {
      ...currentUser,
      onboarding: onboardingData
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    // Save to Firebase Firestore cloud database
    setDoc(doc(db, 'users', updatedUser.id), updatedUser)
      .catch(err => console.error("Firestore onboarding update failed:", err));

    try {
      localStorage.setItem('cashai_current_user', JSON.stringify(updatedUser));
      const savedUsers = localStorage.getItem('cashai_registered_users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers) as RegisteredUser[];
        const updatedList = parsedUsers.map(u => u.id === currentUser.id ? updatedUser : u);
        localStorage.setItem('cashai_registered_users', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error(e);
    }

    // Trigger matching notification dispatch to other users
    dispatchMatchingNotifications(updatedUser);

    triggerToast(
      lang === 'ar'
        ? '✨ مبروك! تم إعداد ملفك الشخصي والخدمات بنجاح.'
        : '✨ Congratulations! Your professional profile has been fully set up.',
      'success'
    );
  };

  // Handle user logout / account switching
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('cashai_current_user');
    } catch (e) {
      console.error(e);
    }
    triggerToast(
      lang === 'ar' ? '👋 تم تسجيل الخروج من الحساب.' : '👋 Logged out successfully.',
      'info'
    );
  };

  // Handle owner commission on Flight or Visa booking (1,000,000 IQD per booking)
  const handleBookingCompleted = () => {
    setOwnerBookingCommission(prev => {
      const updated = prev + 1000000;
      try {
        localStorage.setItem('cashai_owner_booking_commission', updated.toString());
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    const commissionInSelectedCurrency = 1000000 * (selectedCountry.rate / 1000);

    // Record owner transaction
    const newTx: Transaction = {
      id: 'tx_comm_' + Math.floor(Math.random() * 900000 + 100000),
      type: 'convert', // using convert so it represents points conversion profit
      amount: commissionInSelectedCurrency,
      currency: selectedCountry.currencyCode as any,
      status: 'success',
      platformName: 'Owner Booking Commission (1M IQD)',
      platformNameAr: 'عمولة المالك من الحجز (1 مليون د.ع)',
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    // If there is a current logged in user, increment their "earnedForOwner" counter!
    if (currentUser) {
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id || u.phone === currentUser.phone) {
          const updatedUser = {
            ...u,
            earnedForOwner: u.earnedForOwner + commissionInSelectedCurrency
          };
          setCurrentUser(updatedUser);
          try {
            localStorage.setItem('cashai_current_user', JSON.stringify(updatedUser));
          } catch (e) {
            console.error(e);
          }
          return updatedUser;
        }
        return u;
      }));
    }
  };

  // Helper to trigger custom on-screen visual toast notification
  const triggerToast = (msg: string, type: 'success' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Helper to award points to the user's account from any source
  const awardPoints = (points: number, sourceNameAr: string, sourceNameEn: string) => {
    setPlatforms(prev => prev.map(p => {
      if (p.id === 'cash_games') {
        return {
          ...p,
          points: p.points + points,
          lastSynced: lang === 'ar' ? 'الآن' : 'Just Now'
        };
      }
      return p;
    }));

    const newTx: Transaction = {
      id: 'tx_gift_' + Math.floor(Math.random() * 90000 + 10000),
      type: 'sync',
      platformId: 'cash_games',
      platformName: sourceNameEn,
      platformNameAr: sourceNameAr,
      points: points,
      amount: 0,
      currency: selectedCountry.currencyCode as any,
      status: 'success',
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Sync all accounts
  const handleSyncAll = () => {
    setIsSyncingAll(true);
    triggerToast(lang === 'ar' ? 'جاري مزامنة جميع الحسابات المتصلة...' : 'Syncing all active platforms...', 'info');

    setTimeout(() => {
      let totalAddedPoints = 0;
      setPlatforms(prev => prev.map(p => {
        if (!p.connected) return p;
        const reward = Math.floor(Math.random() * 800 + 300);
        totalAddedPoints += reward;
        return {
          ...p,
          points: p.points + reward,
          lastSynced: lang === 'ar' ? 'الآن' : 'Just Now',
          status: 'connected'
        };
      }));

      // Create a single consolidated sync log
      const newTx: Transaction = {
        id: 'tx_sync_' + Math.floor(Math.random() * 90000 + 10000),
        type: 'sync',
        platformName: 'All Linked Platforms',
        platformNameAr: 'جميع المنصات المربوطة',
        points: totalAddedPoints,
        amount: 0,
        currency: selectedCountry.currencyCode as any,
        status: 'success',
        date: new Date().toISOString()
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsSyncingAll(false);
      triggerToast(
        lang === 'ar' 
          ? `🎉 تم تحديث الرصيد! تمت إضافة +${totalAddedPoints.toLocaleString()} نقطة.` 
          : `🎉 Sync complete! Received +${totalAddedPoints.toLocaleString()} points.`, 
        'success'
      );
    }, 2000);
  };

  // Sync a single account
  const handleSyncPlatform = async (id: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const reward = Math.floor(Math.random() * 600 + 200);
        let platformName = '';
        let platformNameAr = '';

        setPlatforms(prev => prev.map(p => {
          if (p.id !== id) return p;
          platformName = p.name;
          platformNameAr = p.nameAr;
          return {
            ...p,
            points: p.points + reward,
            lastSynced: lang === 'ar' ? 'الآن' : 'Just Now',
            status: 'connected'
          };
        }));

        const newTx: Transaction = {
          id: 'tx_sync_' + Math.floor(Math.random() * 90000 + 1000),
          type: 'sync',
          platformId: id,
          platformName,
          platformNameAr,
          points: reward,
          amount: 0,
          currency: selectedCountry.currencyCode as any,
          status: 'success',
          date: new Date().toISOString()
        };

        setTransactions(prev => [newTx, ...prev]);
        triggerToast(
          lang === 'ar' 
            ? `🔄 تم تحديث نقاط ${platformNameAr}: +${reward} نقطة!` 
            : `🔄 Updated ${platformName}: +${reward} points!`, 
          'success'
        );
        resolve();
      }, 1500);
    });
  };

  // Connect platform
  const handleConnectPlatform = (id: string, email: string, appUrl: string, password?: string) => {
    setPlatforms(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        connected: true,
        points: Math.floor(Math.random() * 2000 + 500), // grant starter points on connect
        apiUrl: appUrl,
        apiKey: password,
        status: 'connected',
        lastSynced: lang === 'ar' ? 'الآن' : 'Just Now'
      };
    }));

    const platform = platforms.find(p => p.id === id);
    triggerToast(
      lang === 'ar' 
        ? `🟢 تم ربط حساب المنصة بنجاح مع البريد ${email}!` 
        : `🟢 Connected platform successfully with email ${email}!`, 
      'success'
    );
  };

  // Disconnect platform
  const handleDisconnectPlatform = (id: string) => {
    setPlatforms(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        connected: false,
        points: 0,
        status: 'error',
        lastSynced: lang === 'ar' ? 'تم قطع الاتصال' : 'Disconnected'
      };
    }));

    const platform = platforms.find(p => p.id === id);
    triggerToast(
      lang === 'ar' 
        ? `🔴 تم إلغاء ربط ${platform?.nameAr || id}` 
        : `🔴 Disconnected ${platform?.name || id}`, 
      'info'
    );
  };

  // Delete platform permanently
  const handleDeletePlatform = (id: string) => {
    setPlatforms(prev => prev.filter(p => p.id !== id));
    triggerToast(
      lang === 'ar' 
        ? `🗑️ تم إزالة وحذف المنصة/الموقع بنجاح من حسابك.` 
        : `🗑️ Removed and deleted the website/platform from your account.`, 
      'info'
    );
  };

  // Add custom platform
  const handleAddCustomPlatform = (name: string, nameAr: string, rate: number, url: string, email: string, password?: string) => {
    const newId = 'custom_' + Date.now();
    const newPlatform: Platform = {
      id: newId,
      name,
      nameAr,
      icon: 'Globe',
      connected: true,
      points: 1500, // grant initial points
      rate: selectedCountry.rate, // Use current country's rate
      apiUrl: url,
      apiKey: password,
      status: 'connected',
      lastSynced: lang === 'ar' ? 'تم ربطها للتو' : 'Linked Just Now'
    };

    setPlatforms(prev => [...prev, newPlatform]);
    triggerToast(
      lang === 'ar' 
        ? `✨ تم ربط وإضافة الموقع الإلكتروني الجديد: ${nameAr}` 
        : `✨ Linked and added new website/app: ${name}`, 
      'success'
    );
  };

  // Convert Points to cash
  const handleConvertPoints = (platformId: string, points: number, cashAmount: number) => {
    let platformName = '';
    let platformNameAr = '';

    setPlatforms(prev => prev.map(p => {
      if (p.id !== platformId) return p;
      platformName = p.name;
      platformNameAr = p.nameAr;
      return {
        ...p,
        points: Math.max(0, p.points - points)
      };
    }));

    setCashBalance(prev => prev + cashAmount);

    const newTx: Transaction = {
      id: 'tx_conv_' + Math.floor(Math.random() * 900000 + 100000),
      type: 'convert',
      platformId,
      platformName,
      platformNameAr,
      points,
      amount: cashAmount,
      currency: selectedCountry.currencyCode as any,
      status: 'success',
      date: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);
    triggerToast(
      lang === 'ar' 
        ? `💸 تم تحويل ${points.toLocaleString()} نقطة إلى +${cashAmount.toLocaleString()} ${selectedCountry.currencySymbol}!` 
        : `💸 Converted ${points.toLocaleString()} points to +${cashAmount.toLocaleString()} ${selectedCountry.currencyCode}!`, 
      'success'
    );
  };

  // Submit withdrawal request
  const handleSubmitWithdrawal = (amount: number, walletId: string, details: string) => {
    setCashBalance(prev => Math.max(0, prev - amount));

    let updatedUser: RegisteredUser | null = null;
    // Update current user's available balance and withdrawn total
    if (currentUser) {
      const currentWithdrawn = currentUser.withdrawn || 0;
      updatedUser = {
        ...currentUser,
        withdrawn: currentWithdrawn + amount,
        balance: Math.max(0, (currentUser.balance !== undefined ? currentUser.balance : 2500000) - amount)
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser! : u));
      try {
        localStorage.setItem('cashai_current_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const newTx: Transaction = {
      id: 'tx_wd_' + Math.floor(Math.random() * 900000 + 100000),
      type: 'withdraw',
      amount,
      currency: selectedCountry.currencyCode as any,
      status: 'pending',
      walletType: walletId,
      walletDetails: details,
      date: new Date().toISOString()
    };

    // Manager Reward: 1,000,000 IQD on each user withdrawal!
    const managerRewardIQD = 1000000;
    const scaledReward = managerRewardIQD * (selectedCountry.rate / 1000);

    setOwnerBookingCommission(prev => {
      const updated = prev + managerRewardIQD;
      try {
        localStorage.setItem('cashai_owner_booking_commission', updated.toString());
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    const rewardTx: Transaction = {
      id: 'tx_owner_reward_' + Math.floor(Math.random() * 900000 + 100000),
      type: 'convert',
      amount: scaledReward,
      currency: selectedCountry.currencyCode as any,
      status: 'success',
      platformName: `Chief Reward (1M IQD Payout Bonus) - From ${currentUser?.name || 'User'}`,
      platformNameAr: `مكافأة المدير العام (1,000,000 د.ع من سحب) - من ${currentUser?.name || 'مستخدم'}`,
      date: new Date().toISOString()
    };

    setTransactions(prev => [newTx, rewardTx, ...prev]);

    // Trigger administrative and VIP rewards
    triggerRewardsForTransaction('withdraw', updatedUser || currentUser);

    // Find custom e-wallet details
    const selectedWallet = WALLET_OPTIONS.find(w => w.id === walletId);
    let walletNameAr = selectedWallet ? selectedWallet.nameAr : walletId;
    let walletNameEn = selectedWallet ? selectedWallet.nameEn : walletId;
    if (walletId === 'bank_card') {
      walletNameAr = lang === 'ar' ? 'البطاقة البنكية' : 'Bank Card';
      walletNameEn = lang === 'ar' ? 'البطاقة البنكية' : 'Bank Card';
    }

    // Trigger starting push notification immediately
    triggerPushNotification(
      '⏳ جاري معالجة عملية سحب الأموال',
      '⏳ Processing Cash Withdrawal',
      `تم استلام طلب السحب بقيمة ${amount.toLocaleString()} ${selectedCountry.currencySymbol} إلى حسابك (${walletNameAr})، وجاري إرسالها آلياً بنظام الدفع الفوري...`,
      `Your withdrawal of ${amount.toLocaleString()} ${selectedCountry.currencyCode} to (${walletNameEn}) is now being processed automatically...`,
      'pending'
    );

    // Add pending notification to System Notifications Center
    const pendingNotif: SystemNotification = {
      id: 'notif_wd_pending_' + Date.now(),
      titleAr: '⏳ طلب سحب قيد المعالجة',
      titleEn: '⏳ Withdrawal Pending Processing',
      descAr: `تم استلام طلب السحب بقيمة ${amount.toLocaleString()} ${selectedCountry.currencySymbol} إلى حسابك (${walletNameAr})، وهو قيد المعالجة التلقائية حالياً.`,
      descEn: `A withdrawal request of ${amount.toLocaleString()} ${selectedCountry.currencyCode} to (${walletNameEn}) has been received and is being processed automatically.`,
      type: 'cash',
      timestamp: lang === 'ar' ? 'الآن' : 'Just Now',
      read: false
    };
    setSystemNotifications(prev => [pendingNotif, ...prev]);

    triggerToast(
      lang === 'ar' 
        ? `⏳ تم تقديم طلب السحب بقيمة ${amount.toLocaleString()} ${selectedCountry.currencySymbol} وجاري المراجعة. وحصل المدير على مكافأة قدرها 1,000,000 دينار عراقي!` 
        : `⏳ Submitted withdrawal of ${amount.toLocaleString()} ${selectedCountry.currencyCode}. Chief Manager received 1,000,000 IQD bonus!`, 
      'success'
    );

    // Simulate instant payout landing in 18 seconds!
    setTimeout(() => {
      setTransactions(curr => curr.map(tx => {
        if (tx.id === newTx.id) {
          return { ...tx, status: 'success' };
        }
        return tx;
      }));

      // Add to System Notifications Center
      const successNotif: SystemNotification = {
        id: 'notif_wd_success_' + Date.now(),
        titleAr: '✅ اكتمل سحب الأموال للمحفظة!',
        titleEn: '✅ Payout Completed Successfully!',
        descAr: `تم إيداع مبلغ ${amount.toLocaleString()} ${selectedCountry.currencySymbol} بالكامل في محفظتك الإلكترونية (${walletNameAr}) بنجاح وهو جاهز للاستخدام الفوري.`,
        descEn: `A payout of ${amount.toLocaleString()} ${selectedCountry.currencyCode} has been successfully deposited into your e-wallet (${walletNameEn}) and is ready for use.`,
        type: 'cash',
        timestamp: 'الآن',
        read: false
      };
      setSystemNotifications(prev => [successNotif, ...prev]);

      // Trigger SUCCESS push notification
      triggerPushNotification(
        '🎉 تم إيداع الأموال بنجاح!',
        '🎉 Funds Deposited Successfully!',
        `تم تحويل مبلغ ${amount.toLocaleString()} ${selectedCountry.currencySymbol} بالكامل لمحفظتك (${walletNameAr}) بنجاح وعملية التحويل مكتملة (100%)!`,
        `Payout of ${amount.toLocaleString()} ${selectedCountry.currencyCode} completed and sent to your e-wallet (${walletNameEn}) successfully!`,
        'success'
      );

      triggerToast(
        lang === 'ar' 
          ? `✅ تمت الموافقة على تحويل ${amount.toLocaleString()} ${selectedCountry.currencySymbol} لمحفظتك وحالة الطلب: مكتمل!` 
          : `✅ Payout of ${amount.toLocaleString()} ${selectedCountry.currencyCode} approved and dispatched to your e-wallet!`, 
        'success'
      );
    }, 18000);
  };

  // Global Money Transfer handler
  const handleTransfer = (
    usdAmount: number, 
    localAmountDeducted: number, 
    recipientName: string, 
    recipientCountryId: string, 
    recipientAmount: number, 
    recipientCurrency: string, 
    feeUsd: number, 
    walletType: string, 
    walletDetails: string,
    transferCurrency: 'USD' | 'EUR' = 'USD',
    receiveMethod: 'local' | 'same' = 'local',
    isCardFunded: boolean = false,
    cardDetails: string = ''
  ) => {
    let updatedUserAfterTransfer: RegisteredUser | null = null;
    if (!isCardFunded) {
      // Deduct from cashBalance
      setCashBalance(prev => Math.max(0, prev - localAmountDeducted));

      // Deduct from current user's balance and update in users list
      if (currentUser) {
        const currentBal = currentUser.balance !== undefined ? currentUser.balance : 2500000;
        updatedUserAfterTransfer = {
          ...currentUser,
          balance: Math.max(0, currentBal - localAmountDeducted)
        };
        setCurrentUser(updatedUserAfterTransfer);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUserAfterTransfer! : u));
        try {
          localStorage.setItem('cashai_current_user', JSON.stringify(updatedUserAfterTransfer));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      updatedUserAfterTransfer = currentUser;
    }

    const destCountryName = countriesList.find(c => c.id === recipientCountryId)?.nameAr || recipientCountryId;

    const newTx: Transaction = {
      id: 'tx_tr_' + Math.floor(Math.random() * 900000 + 100000),
      type: 'transfer',
      amount: localAmountDeducted,
      currency: selectedCountry.currencyCode,
      status: 'success',
      date: new Date().toISOString(),
      walletType: isCardFunded ? `Bank Card (${cardDetails})` : walletType,
      walletDetails,
      recipientName,
      recipientCountry: destCountryName,
      recipientAmount,
      recipientCurrency,
      feeUsd
    };

    setTransactions(prev => [newTx, ...prev]);

    const curSymbol = transferCurrency === 'EUR' ? '€' : '$';
    const fundingMsgAr = isCardFunded ? `عبر بطاقة بنكية [${cardDetails}]` : 'من محفظة الموقع';
    const fundingMsgEn = isCardFunded ? `via Bank Card [${cardDetails}]` : 'from Site Wallet';
    
    const isIncoming = localAmountDeducted < 0;
    const absLocalAmount = Math.abs(localAmountDeducted);

    if (isIncoming) {
      // Incoming Transfer notification
      const incomingNotif: SystemNotification = {
        id: 'notif_recv_' + Date.now(),
        titleAr: '📥 تم استلام حوالة واردة بنجاح!',
        titleEn: '📥 Incoming Transfer Received!',
        descAr: `تم استلام وإيداع مبلغ ${curSymbol}${usdAmount} من ${recipientName} بنجاح. تم إضافة +${absLocalAmount.toLocaleString()} ${selectedCountry.currencySymbol} إلى رصيدك. الوجهة: ${isCardFunded ? `البطاقة البنكية [${cardDetails}]` : 'محفظة الموقع'}.`,
        descEn: `A transfer of ${curSymbol}${usdAmount} from ${recipientName} has been received and credited to your wallet (+${absLocalAmount.toLocaleString()} ${selectedCountry.currencyCode}). Destination: ${isCardFunded ? `Bank Card [${cardDetails}]` : 'Site Wallet'}.`,
        type: 'cash',
        timestamp: lang === 'ar' ? 'الآن' : 'Just Now',
        read: false
      };
      setSystemNotifications(prev => [incomingNotif, ...prev]);

      triggerPushNotification(
        '📥 تم استلام حوالة واردة!',
        '📥 Incoming Transfer Received!',
        `تم إيداع مبلغ ${curSymbol}${usdAmount} من ${recipientName} بنجاح في حسابك! القيمة المضافة: +${absLocalAmount.toLocaleString()} ${selectedCountry.currencySymbol}`,
        `Successfully received ${curSymbol}${usdAmount} from ${recipientName}! Credited +${absLocalAmount.toLocaleString()} ${selectedCountry.currencyCode} to your account.`,
        'success'
      );

      triggerToast(
        lang === 'ar' 
          ? `📥 تم استلام الحوالة بقيمة ${curSymbol}${usdAmount} من ${recipientName} بنجاح! القيمة المضافة: +${absLocalAmount.toLocaleString()} ${selectedCountry.currencySymbol}`
          : `📥 Successfully received ${curSymbol}${usdAmount} transfer from ${recipientName}! Credited +${absLocalAmount.toLocaleString()} ${selectedCountry.currencyCode}`,
        'success'
      );
    } else {
      // Outgoing Transfer notification
      const outgoingNotif: SystemNotification = {
        id: 'notif_send_' + Date.now(),
        titleAr: '📤 تم إرسال الحوالة بنجاح',
        titleEn: '📤 Transfer Sent Successfully',
        descAr: `تم إرسال مبلغ ${curSymbol}${usdAmount} إلى ${recipientName} بنجاح. القيمة المخصومة: ${absLocalAmount.toLocaleString()} ${selectedCountry.currencySymbol}. المصدر: ${fundingMsgAr}. الحساب المستهدف: ${walletType} (${walletDetails}).`,
        descEn: `Successfully sent ${curSymbol}${usdAmount} to ${recipientName}. Amount deducted: ${absLocalAmount.toLocaleString()} ${selectedCountry.currencyCode}. Source: ${fundingMsgEn}. Recipient wallet: ${walletType} (${walletDetails}).`,
        type: 'cash',
        timestamp: lang === 'ar' ? 'الآن' : 'Just Now',
        read: false
      };
      setSystemNotifications(prev => [outgoingNotif, ...prev]);

      triggerPushNotification(
        '📤 تم إرسال الحوالة بنجاح!',
        '📤 Transfer Sent Successfully!',
        `تم تحويل مبلغ ${curSymbol}${usdAmount} إلى ${recipientName} بنجاح! القيمة المخصومة: ${absLocalAmount.toLocaleString()} ${selectedCountry.currencySymbol}`,
        `Successfully transferred ${curSymbol}${usdAmount} to ${recipientName}! Deducted: ${absLocalAmount.toLocaleString()} ${selectedCountry.currencyCode}.`,
        'success'
      );

      triggerToast(
        lang === 'ar' 
          ? `💸 تم إرسال الحوالة بقيمة ${curSymbol}${usdAmount} إلى ${recipientName} بنجاح! ${fundingMsgAr}. القيمة: ${absLocalAmount.toLocaleString()} ${selectedCountry.currencySymbol}`
          : `💸 Successfully sent ${curSymbol}${usdAmount} transfer to ${recipientName}! Funded ${fundingMsgEn}. Total Value: ${absLocalAmount.toLocaleString()} ${selectedCountry.currencyCode}`,
        'success'
      );
    }

    // Trigger administrative and VIP rewards
    triggerRewardsForTransaction('transfer', updatedUserAfterTransfer || currentUser);
  };

  // Trigger from Webhook Sandbox Portal
  const handleTriggerWebhook = (appName: string, points: number) => {
    // See if platform with the same name exists
    const sanitizedId = appName.toLowerCase().replace(/\s+/g, '_');
    const exists = platforms.find(p => p.id === sanitizedId || p.name.toLowerCase() === appName.toLowerCase());

    if (exists) {
      setPlatforms(prev => prev.map(p => {
        if (p.id !== exists.id) return p;
        return {
          ...p,
          connected: true,
          points: p.points + points,
          lastSynced: lang === 'ar' ? 'منذ ثوانٍ عبر Webhook' : 'Seconds ago via Webhook',
          status: 'connected'
        };
      }));
    } else {
      // Register custom new platform dynamically
      const newP: Platform = {
        id: sanitizedId,
        name: appName,
        nameAr: appName,
        icon: 'Smartphone',
        connected: true,
        points: points,
        rate: selectedCountry.rate, // Use current country rate
        status: 'connected',
        lastSynced: lang === 'ar' ? 'مستقبل برمجياً' : 'Streamed via Webhook'
      };
      setPlatforms(prev => [...prev, newP]);
    }

    const newTx: Transaction = {
      id: 'tx_api_' + Math.floor(Math.random() * 90000 + 10000),
      type: 'sync',
      platformId: exists?.id || sanitizedId,
      platformName: appName,
      platformNameAr: appName,
      points,
      amount: 0,
      currency: selectedCountry.currencyCode as any,
      status: 'success',
      date: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);
    triggerToast(
      lang === 'ar' 
        ? `📡 استقبال إشارة Webhook من [${appName}]: +${points} نقطة!` 
        : `📡 Webhook payload received from [${appName}]: +${points} points!`, 
      'success'
    );
  };

  // Add new simulated user
  const handleAddUser = (name: string, phone: string, walletType: string) => {
    const newUser: RegisteredUser = {
      id: 'usr_' + Math.floor(Math.random() * 900 + 100),
      name,
      phone,
      registeredAt: new Date().toISOString(),
      earnedForOwner: 500 * selectedCountry.rate, // 500 points equivalent in local currency
      walletType,
      status: 'active'
    };
    setUsers(prev => [newUser, ...prev]);
    // Call registration rewards for VIP members!
    triggerRewardsForRegistration(newUser);
  };

  // Withdraw owner profits (0% commission)
  const handleWithdrawOwnerProfits = (amount: number, walletId: string, details: string) => {
    setOwnerWithdrawn(prev => prev + amount);

    const newTx: Transaction = {
      id: 'tx_owner_' + Math.floor(Math.random() * 90000 + 10000),
      type: 'withdraw',
      amount,
      currency: selectedCountry.currencyCode as any,
      status: 'success',
      walletType: walletId,
      walletDetails: lang === 'ar' ? `${details} (أرباح المالك)` : `${details} (Owner Payout)`,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Toggle user status (suspend/activate)
  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
    triggerToast(
      lang === 'ar' ? 'تم تحديث حالة المستخدم بنجاح.' : 'User status updated successfully.', 
      'success'
    );
  };

  // Delete user permanently
  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    triggerToast(
      lang === 'ar' ? '🗑️ تم حذف حساب المستخدم نهائياً من قاعدة البيانات.' : '🗑️ User permanently deleted from database.',
      'success'
    );
  };

  // Update user role (promotion/demotion)
  const handleUpdateUserRole = (id: string, role: 'owner' | 'manager' | 'assistant' | 'user') => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    triggerToast(
      lang === 'ar' ? '👑 تم ترقية/تعديل رتبة المستخدم بنجاح.' : '👑 User role successfully updated.',
      'success'
    );
  };

  // Update user's available withdrawable cash balance
  const handleUpdateUserBalance = (id: string, balance: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, balance };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
          setCashBalance(balance);
          try {
            localStorage.setItem('cashai_current_user', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      }
      return u;
    }));
  };

  // Update user's total withdrawn cash amount
  const handleUpdateUserWithdrawn = (id: string, withdrawn: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, withdrawn };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
          try {
            localStorage.setItem('cashai_current_user', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      }
      return u;
    }));
  };

  // Send message to user's profile
  const handleSendMessageToUser = (id: string, messageText: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const existingMessages = u.messages || [];
        const newMsg = {
          id: 'msg_' + Math.floor(Math.random() * 900000 + 100000),
          sender: 'owner',
          content: messageText,
          date: new Date().toISOString()
        };
        const updatedMessages = [newMsg, ...existingMessages];
        const updated = { ...u, messages: updatedMessages };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
          try {
            localStorage.setItem('cashai_current_user', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      }
      return u;
    }));
  };

  // Toggle a user's Distinguished (VIP) status (up to 50 members)
  const handleToggleDistinguished = (id: string) => {
    setUsers(prev => {
      const user = prev.find(u => u.id === id);
      if (!user) return prev;

      const vipsCount = prev.filter(u => u.isDistinguished).length;
      if (!user.isDistinguished && vipsCount >= 50) {
        triggerToast(
          lang === 'ar'
            ? '⚠️ عذراً! تم الوصول للحد الأقصى للأعضاء المتميزين (50 عضو).'
            : '⚠️ Restricted! The maximum limit of 50 VIP members has been reached.',
          'info'
        );
        return prev;
      }

      const updated = prev.map(u => {
        if (u.id === id) {
          const newStatus = !u.isDistinguished;
          return {
            ...u,
            isDistinguished: newStatus,
            distinguishedRewardsUSD: newStatus ? (u.distinguishedRewardsUSD || 0) : u.distinguishedRewardsUSD
          };
        }
        return u;
      });

      triggerToast(
        lang === 'ar'
          ? (user.isDistinguished ? '❌ تم إلغاء صفة التميز عن العضو بنجاح.' : '⭐ تم تعيين العضو كعضو متميز بنجاح!')
          : (user.isDistinguished ? '❌ VIP status revoked successfully.' : '⭐ User promoted to Distinguished VIP successfully!'),
        'success'
      );

      return updated;
    });
  };

  const handleSwitchToOwner = () => {
    const ownerUser: RegisteredUser = {
      id: 'usr_owner',
      name: lang === 'ar' ? 'مصمم الموقع (المدير الرئيسي)' : 'Site Designer (Chief Owner)',
      phone: 'kaskala520@gmail.com',
      email: 'kaskala520@gmail.com',
      appUrl: 'https://cashai-owner.com',
      registeredAt: new Date().toISOString(),
      earnedForOwner: 15000000,
      walletType: 'System Controller',
      status: 'active',
      role: 'owner'
    };
    setCurrentUser(ownerUser);
    try {
      localStorage.setItem('cashai_current_user', JSON.stringify(ownerUser));
    } catch (e) {
      console.error(e);
    }
    setActiveTab('owner');
    triggerToast(
      lang === 'ar' ? '👑 تم الدخول بصلاحيات المدير الرئيسي للموقع!' : '👑 Logged in with Chief Site Manager privileges!',
      'success'
    );
  };

  // Translations
  const t = {
    appName: customAppName,
    appDesc: customAppDesc,
    navDashboard: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    navPlatforms: lang === 'ar' ? 'ربط الحسابات' : 'Linked Accounts',
    navConvert: lang === 'ar' ? 'محول النقاط' : 'Points Converter',
    navGames: lang === 'ar' ? 'الألعاب والمكافآت 🎮' : 'Arcade Games 🎮',
    navWithdraw: lang === 'ar' ? 'سحب الكاش' : 'Wallet Withdraw',
    navBankCards: lang === 'ar' ? 'الربط بالبطاقات البنكية 💳' : 'Link Bank Cards 💳',
    navFlights: lang === 'ar' ? 'طيران وتأشيرات سفر ✈️🌍' : 'Flights & Visas ✈️🌍',
    navDeveloper: lang === 'ar' ? 'بوابة المطورين' : 'Developer (Webhooks)',
    navHistory: lang === 'ar' ? 'سجل المعاملات' : 'Transaction History',
    navOwner: lang === 'ar' ? 'صاحب الموقع 👑' : 'Owner Portal 👑',
    navProfile: lang === 'ar' ? 'الصفحة الشخصية 👤' : 'Personal Profile 👤',
    securityFooter: lang === 'ar' ? '🔒 جميع معاملاتك مشفرة ومؤمنة بالكامل بنظام SSL 256-bit بالتعاون مع مقدمي المحافظ المعتمدين.' : '🔒 All point synchronizations and payout dispatches are encrypted with grade 256-bit secure SSL wrappers.',
    rightsReserved: lang === 'ar' ? 'جميع الحقوق محفوظة © ٢٠٢٦ tasknyfa.' : 'All rights reserved © 2026 tasknyfa.',
    quickStats: lang === 'ar' ? 'رصيد المحفظة:' : 'Wallet Cash:'
  };

  const isAr = lang === 'ar';

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* Real-time Push Notification Banner (Slide down iOS/Android Alert) */}
      <AnimatePresence>
        {activePush && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-[410px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border ${
              activePush.type === 'pending'
                ? 'border-amber-200 dark:border-amber-900/30 shadow-amber-500/5'
                : 'border-emerald-200 dark:border-emerald-900/30 shadow-emerald-500/5'
            } shadow-2xl z-[9999] p-4 cursor-pointer overflow-hidden`}
            onClick={() => {
              setActivePush(null);
              // Focus / open notification center
              const notifBtn = document.querySelector('button[title="الإشعارات والرسائل"], button[title="Notifications & Messages"]') as HTMLButtonElement;
              if (notifBtn) {
                notifBtn.click();
              }
            }}
          >
            {/* Top Bar inside Notification */}
            <div className="flex items-center justify-between border-b border-slate-100/60 dark:border-slate-800/60 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>tasknyfa App • {activePush.timestamp}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePush(null);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification Body */}
            <div className="flex gap-3 text-right">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                activePush.type === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
              }`}>
                {activePush.type === 'pending' ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5 animate-bounce" />
                )}
              </div>

              {/* Text content */}
              <div className={`flex-1 space-y-1 ${isAr ? 'text-right' : 'text-left'}`}>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isAr ? activePush.titleAr : activePush.titleEn}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    activePush.type === 'pending'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {activePush.type === 'pending'
                      ? (isAr ? 'قيد التحقق' : 'Verifying')
                      : (isAr ? 'مكتمل فوري' : 'Instant Success')
                    }
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {isAr ? activePush.descAr : activePush.descEn}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100 dark:shadow-none font-mono">
                C
              </div>
              <div>
                <span className="font-black text-lg text-slate-950 dark:text-white tracking-tight block">
                  {t.appName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {t.appDesc}
                </span>
              </div>
            </div>

            {currentUser && (
              <button
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl cursor-pointer transition-all flex items-center gap-2 border ${
                  isSidebarVisible
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                id="header_tools_toggle_btn"
                title={isAr ? 'عرض/إخفاء الأدوات الرئيسية' : 'Show/Hide Main Tools'}
              >
                <LayoutGrid className={`w-4 h-4 transition-transform duration-300 ${isSidebarVisible ? 'rotate-90 text-white' : 'text-indigo-500'}`} />
                <span className="text-xs font-black hidden sm:inline">
                  {isAr ? 'الأدوات الرئيسية' : 'Main Tools'}
                </span>
              </button>
            )}
          </div>

          {/* Quick Info & Switches */}
          <div className="flex items-center gap-4">
            {/* Logged in User Profile */}
            {currentUser && (
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-colors"
                title={isAr ? 'الصفحة الشخصية' : 'Personal Profile'}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-black text-[10px] uppercase font-mono">
                  {(currentUser as any).avatar ? (
                    <img 
                      src={(currentUser as any).avatar} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    currentUser.name.trim().charAt(0)
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <span className="font-extrabold block text-slate-800 dark:text-slate-200 max-w-[100px] truncate">{currentUser.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                  title={isAr ? 'تسجيل الخروج' : 'Log Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Cash quick preview */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-xs font-bold font-mono">
                <span>{t.quickStats}</span>
                <span>{formatCurrencyValue(cashBalance, selectedCountry.currencyCode)} {isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode}</span>
              </div>
            )}

            {/* Messages & Notifications Bell Dropdown */}
            {currentUser && (
              <NotificationCenter
                lang={lang}
                selectedCountry={selectedCountry}
                triggerToast={triggerToast}
                awardPoints={awardPoints}
                setCashBalance={setCashBalance}
                notifications={systemNotifications}
                setNotifications={setSystemNotifications}
              />
            )}

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer"
              title={darkMode ? 'الوضع المضيء' : 'الوضع المظلم'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Country Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <span className="text-sm">{selectedCountry.flag}</span>
              <select
                value={selectedCountry.id}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none cursor-pointer border-none p-0 pr-1 max-w-[110px] sm:max-w-[140px]"
              >
                {countriesList.map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs">
                    {c.flag} {lang === 'ar' ? c.nameAr : c.nameEn} ({c.currencyCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          {currentUser && isSidebarVisible && (!isSiteClosed || currentUser?.role === 'owner') && (
            <nav className="lg:col-span-3 space-y-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs h-fit">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>{t.navDashboard}</span>
              </button>

              <button
                onClick={() => setActiveTab('platforms')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'platforms'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Link2 className="w-5 h-5" />
                <span>{t.navPlatforms}</span>
              </button>

              <button
                onClick={() => setActiveTab('conversion')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'conversion'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowRightLeft className="w-5 h-5" />
                <span>{t.navConvert}</span>
              </button>

              <button
                onClick={() => setActiveTab('games')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'games'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Gamepad2 className="w-5 h-5" />
                <span>{t.navGames}</span>
              </button>

              <button
                onClick={() => setActiveTab('marketplace')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'marketplace'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span>{lang === 'ar' ? 'سوق الخدمات والمنتجات 🛒' : 'Services & Products Market 🛒'}</span>
              </button>

              <button
                onClick={() => setActiveTab('withdrawal')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'withdrawal'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span>{t.navWithdraw}</span>
              </button>

              <button
                onClick={() => setActiveTab('bankcards')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'bankcards'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span>{t.navBankCards}</span>
              </button>

              <button
                onClick={() => setActiveTab('developer')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'developer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Code className="w-5 h-5" />
                <span>{t.navDeveloper}</span>
              </button>

              <button
                onClick={() => setActiveTab('real_money')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'real_money'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-indigo-100/30 dark:border-indigo-900/10'
                }`}
              >
                <Landmark className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span>{lang === 'ar' ? 'الدفع الحقيقي والـ IBAN 🏦' : 'Real Payouts & IBAN 🏦'}</span>
              </button>


              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>{t.navHistory}</span>
              </button>

              <button
                onClick={() => setIsTasksOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
                id="sidebar_tasks_btn"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                  <span>{lang === 'ar' ? 'المهام والمكافآت 🎯' : 'Tasks & Quests 🎯'}</span>
                </div>
                {completedTaskIds.filter(id => !claimedTasks.includes(id)).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-black animate-pulse">
                    {completedTaskIds.filter(id => !claimedTasks.includes(id)).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsInstallOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                id="sidebar_install_btn"
              >
                <Smartphone className="w-5 h-5 text-indigo-500" />
                <span>{lang === 'ar' ? 'تثبيت التطبيق 📱' : 'Install App 📱'}</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span>{t.navProfile}</span>
              </button>

              {currentUser?.role === 'owner' && (
                <>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                        : 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 border border-violet-100/50 dark:border-violet-900/30'
                    }`}
                  >
                    <Settings className="w-5 h-5 text-violet-500" />
                    <span>{lang === 'ar' ? 'إعدادات المنصة ⚙️' : 'Platform Settings ⚙️'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('owner')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'owner'
                        ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                        : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30'
                    }`}
                  >
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span>{t.navOwner}</span>
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>{lang === 'ar' ? 'تسجيل الخروج 🚪' : 'Logout 🚪'}</span>
              </button>
            </nav>
          )}

          {/* Active View Container */}
          <main className={(currentUser && isSidebarVisible && (!isSiteClosed || currentUser?.role === 'owner')) ? "lg:col-span-9 min-h-[500px]" : "lg:col-span-12 min-h-[500px]"}>
            {isSiteClosed && currentUser?.role !== 'owner' ? (
              <div className="bg-white dark:bg-slate-900 border border-rose-500/10 dark:border-rose-900/20 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center space-y-6 shadow-xl shadow-rose-500/5">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                    {customAppName}
                  </h1>
                  <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">
                    {lang === 'ar' ? '⚠️ الموقع مغلق حالياً للصيانة والتحديث' : '⚠️ Site Closed for Maintenance'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-semibold">
                  {siteCloseMessage}
                </div>
                
                {/* Admin Bypass Sign-In */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                  <p className="text-[10px] text-slate-400 font-bold">
                    {lang === 'ar' ? 'بوابة المدراء والمنظمين العامين 🛡️' : 'Manager & System Controller Bypass Portal 🛡️'}
                  </p>
                  
                  <div className="max-w-xs mx-auto">
                    <button
                      onClick={handleSwitchToOwner}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 text-white font-black text-xs rounded-xl hover:scale-[1.02] active:scale-98 shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'الدخول بصلاحية المدير العام 👑' : 'Login as Chief Manager 👑'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : !currentUser && activeTab !== 'owner' ? (
              <Auth 
                lang={lang} 
                users={users} 
                onRegisterSuccess={handleRegisterSuccess} 
                onLoginSuccess={handleLoginSuccess} 
                onSwitchToOwner={handleSwitchToOwner} 
              />
            ) : (currentUser && !currentUser.onboarding) ? (
              <Onboarding
                lang={lang}
                currentUser={currentUser}
                onComplete={handleOnboardingComplete}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard
                    lang={lang}
                    platforms={platforms}
                    transactions={transactions}
                    cashBalance={cashBalance}
                    onSyncAll={handleSyncAll}
                    isSyncingAll={isSyncingAll}
                    setActiveTab={setActiveTab}
                    selectedCountry={selectedCountry}
                    onShowTasks={() => setIsTasksOpen(true)}
                    unclaimedTasksCount={completedTaskIds.filter(id => !claimedTasks.includes(id)).length}
                    onShowInstall={() => setIsInstallOpen(true)}
                    isSidebarVisible={isSidebarVisible}
                    onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
                    users={users}
                    currentUser={currentUser}
                    onAwardPoints={awardPoints}
                    triggerToast={triggerToast}
                  />
                )}

                {activeTab === 'platforms' && (
                  <LinkedPlatforms
                    lang={lang}
                    platforms={platforms}
                    onConnect={handleConnectPlatform}
                    onDisconnect={handleDisconnectPlatform}
                    onDeletePlatform={handleDeletePlatform}
                    onSyncPlatform={handleSyncPlatform}
                    onAddCustomPlatform={handleAddCustomPlatform}
                  />
                )}

                {activeTab === 'conversion' && (
                  <ConversionHub
                    lang={lang}
                    platforms={platforms}
                    onConvertPoints={handleConvertPoints}
                    selectedCountry={selectedCountry}
                  />
                )}

                {activeTab === 'games' && (
                  <GamesPortal
                    lang={lang}
                    selectedCountry={selectedCountry}
                    platforms={platforms}
                    setPlatforms={setPlatforms}
                    transactions={transactions}
                    setTransactions={setTransactions}
                    triggerToast={triggerToast}
                    setActiveTab={setActiveTab}
                    onGamePlayed={() => setHasPlayedGame(true)}
                  />
                )}

                {activeTab === 'withdrawal' && (
                  <WithdrawalForm
                    lang={lang}
                    cashBalance={cashBalance}
                    onSubmitWithdrawal={handleSubmitWithdrawal}
                    selectedCountry={selectedCountry}
                    transactions={transactions}
                  />
                )}

                {activeTab === 'bankcards' && (
                  <BankCardsLink
                    lang={lang}
                    selectedCountry={selectedCountry}
                    cashBalance={cashBalance}
                    setCashBalance={setCashBalance}
                    onAddTransaction={(tx) => setTransactions(prev => [tx, ...prev])}
                    triggerToast={triggerToast}
                  />
                )}

                {activeTab === 'developer' && (
                  <DeveloperPortal
                    lang={lang}
                    onTriggerWebhook={handleTriggerWebhook}
                  />
                )}

                {activeTab === 'real_money' && (
                  <RealMoneySetup
                    lang={lang}
                    selectedCountry={selectedCountry}
                    triggerToast={triggerToast}
                  />
                )}


                {activeTab === 'history' && (
                  <TransactionHistory
                    lang={lang}
                    transactions={transactions}
                    selectedCountry={selectedCountry}
                  />
                )}

                {activeTab === 'profile' && (
                  <UserProfile
                    lang={lang}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    selectedCountry={selectedCountry}
                    cashBalance={cashBalance}
                    triggerToast={triggerToast}
                    users={users}
                    onUpdateOnboarding={handleOnboardingComplete}
                  />
                )}

                {activeTab === 'marketplace' && (
                  <Marketplace
                    lang={lang}
                    users={users}
                    currentUser={currentUser}
                    triggerToast={triggerToast}
                    selectedCountry={selectedCountry}
                  />
                )}

                {activeTab === 'owner' && (
                  <OwnerPortal
                    lang={lang}
                    users={users}
                    onAddUser={handleAddUser}
                    ownerWithdrawn={ownerWithdrawn}
                    onWithdrawOwnerProfits={handleWithdrawOwnerProfits}
                    onToggleUserStatus={handleToggleUserStatus}
                    triggerToast={triggerToast}
                    selectedCountry={selectedCountry}
                    ownerBookingCommission={ownerBookingCommission}
                    onGoBackToAuth={() => setActiveTab('dashboard')}
                    currentUser={currentUser}
                    onDeleteUser={handleDeleteUser}
                    onUpdateUserRole={handleUpdateUserRole}
                    onUpdateUserBalance={handleUpdateUserBalance}
                    onUpdateUserWithdrawn={handleUpdateUserWithdrawn}
                    onSendMessageToUser={handleSendMessageToUser}
                    onToggleDistinguished={handleToggleDistinguished}
                    convertUsdToLocal={convertUsdToLocal}
                  />
                )}

                {activeTab === 'settings' && currentUser?.role === 'owner' && (
                  <SiteSettings
                    lang={lang}
                    isSiteClosed={isSiteClosed}
                    setIsSiteClosed={setIsSiteClosed}
                    siteCloseMessage={siteCloseMessage}
                    setSiteCloseMessage={setSiteCloseMessage}
                    customAppName={customAppName}
                    setCustomAppName={setCustomAppName}
                    customAppDesc={customAppDesc}
                    setCustomAppDesc={setCustomAppDesc}
                    ownerBookingCommission={ownerBookingCommission}
                    setOwnerBookingCommission={setOwnerBookingCommission}
                    selectedCountry={selectedCountry}
                    triggerToast={triggerToast}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer Branding & Assurances */}
      <footer className="border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            {t.securityFooter}
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>PCI-DSS Compliant</span>
            </span>
            <span>•</span>
            <span>SSL Secured</span>
            <span>•</span>
            <span>InstaPay Certified</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {t.rightsReserved}
          </p>
        </div>
      </footer>

      {/* Visual Toast Notification Overlay container */}
      <div className={`fixed bottom-4 ${isAr ? 'left-4' : 'right-4'} z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none`}>
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border shadow-lg text-xs font-bold pointer-events-auto animate-fade-in flex items-center justify-between gap-3 ${
              n.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-100 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400'
            }`}
          >
            <span>{n.msg}</span>
          </div>
        ))}
      </div>

      {/* Slide-over Tasks & Rewards Panel */}
      <TasksPanel
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        lang={lang}
        selectedCountry={selectedCountry}
        tasks={TASKS}
        completedTaskIds={completedTaskIds}
        claimedTaskIds={claimedTasks}
        onClaimReward={handleClaimReward}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* PWA App Installation Guidance Modal */}
      <InstallAppModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        lang={lang}
      />
    </div>
  );
}
