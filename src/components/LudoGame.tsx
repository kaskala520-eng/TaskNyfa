import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CountryConfig } from '../types';
import { 
  Play, 
  RotateCw, 
  Sparkles, 
  Award, 
  Volume2, 
  VolumeX, 
  Info, 
  Trophy, 
  User, 
  Cpu, 
  ShieldAlert,
  Dices,
  RotateCcw
} from 'lucide-react';

interface LudoGameProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  awardPoints: (points: number, sourceNameAr: string, sourceNameEn: string) => void;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
}

interface LudoToken {
  id: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  index: number; // 0 to 3 (4 tokens per player)
  step: number;  // 0 (base), 1-51 (outer track), 52-56 (home column), 57 (HOME!)
}

interface LogMessage {
  id: string;
  textEn: string;
  textAr: string;
  color: string;
}

// 52 Coordinate positions on the circular outer track (clockwise starting from Red Start)
const TRACK_COORDS = [
  { r: 6, c: 1 },  // 0: Red Start (Safe Spot)
  { r: 6, c: 2 },  // 1
  { r: 6, c: 3 },  // 2
  { r: 6, c: 4 },  // 3
  { r: 6, c: 5 },  // 4
  { r: 5, c: 6 },  // 5
  { r: 4, c: 6 },  // 6
  { r: 3, c: 6 },  // 7
  { r: 2, c: 6 },  // 8: Safe Spot
  { r: 1, c: 6 },  // 9
  { r: 0, c: 6 },  // 10
  { r: 0, c: 7 },  // 11
  { r: 0, c: 8 },  // 12
  { r: 1, c: 8 },  // 13: Green Start (Safe Spot)
  { r: 2, c: 8 },  // 14
  { r: 3, c: 8 },  // 15
  { r: 4, c: 8 },  // 16
  { r: 5, c: 8 },  // 17
  { r: 6, c: 9 },  // 18
  { r: 6, c: 10 }, // 19
  { r: 6, c: 11 }, // 20
  { r: 6, c: 12 }, // 21: Safe Spot
  { r: 6, c: 13 }, // 22
  { r: 6, c: 14 }, // 23
  { r: 7, c: 14 }, // 24
  { r: 8, c: 14 }, // 25
  { r: 8, c: 13 }, // 26: Yellow Start (Safe Spot)
  { r: 8, c: 12 }, // 27
  { r: 8, c: 11 }, // 28
  { r: 8, c: 10 }, // 29
  { r: 8, c: 9 },  // 30
  { r: 9, c: 8 },  // 31
  { r: 10, c: 8 }, // 32
  { r: 11, c: 8 }, // 33
  { r: 12, c: 8 }, // 34: Safe Spot
  { r: 13, c: 8 }, // 35
  { r: 14, c: 8 }, // 36
  { r: 14, c: 7 }, // 37
  { r: 14, c: 6 }, // 38
  { r: 13, c: 6 }, // 39: Blue Start (Safe Spot)
  { r: 12, c: 6 }, // 40
  { r: 11, c: 6 }, // 41
  { r: 10, c: 6 }, // 42
  { r: 9, c: 6 },  // 43
  { r: 8, c: 5 },  // 44
  { r: 8, c: 4 },  // 45
  { r: 8, c: 3 },  // 46
  { r: 8, c: 2 },  // 47: Safe Spot
  { r: 8, c: 1 },  // 48
  { r: 8, c: 0 },  // 49
  { r: 7, c: 0 },  // 50
  { r: 6, c: 0 },  // 51
];

// List of all 8 safe zone track indices
const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export default function LudoGame({
  lang,
  selectedCountry,
  awardPoints,
  triggerToast,
  setActiveTab
}: LudoGameProps) {
  const isAr = lang === 'ar';

  // Game UI Configuration
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [winner, setWinner] = useState<'red' | 'green' | 'yellow' | 'blue' | null>(null);
  
  // Game Play Engine States
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'green' | 'yellow' | 'blue'>('red');
  const [diceValue, setDiceValue] = useState<number>(6);
  const [diceRolled, setDiceRolled] = useState<boolean>(false);
  const [isDiceRolling, setIsDiceRolling] = useState<boolean>(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'rolling' | 'selecting' | 'moving' | 'ended'>('idle');

  // Interactive helper to highlight movable tokens for player
  const [movableTokens, setMovableTokens] = useState<string[]>([]);

  // Logs of actions
  const [logs, setLogs] = useState<LogMessage[]>([]);

  // Session stats for Points Awarded
  const [pointsEarned, setPointsEarned] = useState<number>(0);

  // Load current logged-in user dynamically
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('cashai_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Dynamic player identities
  const redAvatar = currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80";
  const redName = currentUser?.name || (isAr ? "أنت" : "You");

  const greenAvatar = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80";
  const greenName = isAr ? "سامر الذكي" : "Samer AI";

  const yellowAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80";
  const yellowName = isAr ? "ياسمين" : "Yasmin AI";

  const blueAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80";
  const blueName = isAr ? "مازن الصياد" : "Mazen AI";

  interface ChatMessage {
    id: string;
    sender: 'red' | 'green' | 'yellow' | 'blue';
    senderName: string;
    senderAvatar: string;
    text: string;
    timestamp: string;
  }

  // Interactive Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_init_1',
        sender: 'green',
        senderName: greenName,
        senderAvatar: greenAvatar,
        text: isAr ? 'مرحباً يا شباب! حظاً سعيداً للجميع 👋' : 'Hello everyone! Best of luck to all! 👋',
        timestamp: new Date(Date.now() - 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'msg_init_2',
        sender: 'yellow',
        senderName: yellowName,
        senderAvatar: yellowAvatar,
        text: isAr ? 'أنا جاهزة للفوز اليوم! النرد حليفي 🎲🔥' : 'I am ready to win today! The dice is on my side 🎲🔥',
        timestamp: new Date(Date.now() - 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [typedMessage, setTypedMessage] = useState('');

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'red',
      senderName: redName,
      senderAvatar: redAvatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setTypedMessage('');
    playSound(600, 'sine', 0.08);

    // AI dynamic reply after 1.5 seconds!
    setTimeout(() => {
      triggerAiReply(text);
    }, 1500);
  };

  const triggerAiReply = (userText: string) => {
    const aiColors: ('green' | 'yellow' | 'blue')[] = ['green', 'yellow', 'blue'];
    const chosenColor = aiColors[Math.floor(Math.random() * aiColors.length)];

    let name = '';
    let avatar = '';
    if (chosenColor === 'green') {
      name = greenName;
      avatar = greenAvatar;
    } else if (chosenColor === 'yellow') {
      name = yellowName;
      avatar = yellowAvatar;
    } else {
      name = blueName;
      avatar = blueAvatar;
    }

    const repliesAr = [
      'هههه لا تستعجل الفوز يا صديقي! 😜',
      'لعبة رائعة جداً، أتمنى لك التوفيق! 👍',
      'من يضحك أخيراً يضحك كثيراً! سآسر قطعة لك قريباً 😂🏃‍♂️',
      'النرد لا يرحم أحد اليوم! 🎲🔥',
      'دعنا نلعب بروح رياضية يا بطل! 🏆',
      'أحسنت الرمية السابقة، حظ موفق!'
    ];

    const repliesEn = [
      'Haha, do not rush your victory, my friend! 😜',
      'Great game, best of luck to you! 👍',
      'He who laughs last laughs loudest! I will capture you soon 😂🏃‍♂️',
      'The dice is ruthless today! 🎲🔥',
      'Let us play with good sportsmanship, champ! 🏆',
      'Nice roll earlier, good luck!'
    ];

    const chosenReply = isAr 
      ? repliesAr[Math.floor(Math.random() * repliesAr.length)]
      : repliesEn[Math.floor(Math.random() * repliesEn.length)];

    const aiMsg: ChatMessage = {
      id: 'msg_ai_' + Date.now(),
      sender: chosenColor,
      senderName: name,
      senderAvatar: avatar,
      text: chosenReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, aiMsg]);
    playSound(500, 'sine', 0.08);
  };

  const triggerEventChatMessage = (
    eventType: 'capture' | 'roll_six' | 'home' | 'win', 
    actorColor: 'red' | 'green' | 'yellow' | 'blue', 
    targetColor?: 'red' | 'green' | 'yellow' | 'blue'
  ) => {
    if (actorColor === 'red' && eventType !== 'capture') return; 

    let senderColor: 'green' | 'yellow' | 'blue' | 'red' = actorColor;
    let text = '';

    const getName = (col: 'red' | 'green' | 'yellow' | 'blue') => {
      if (col === 'red') return redName;
      if (col === 'green') return greenName;
      if (col === 'yellow') return yellowName;
      return blueName;
    };

    const getAvatar = (col: 'red' | 'green' | 'yellow' | 'blue') => {
      if (col === 'red') return redAvatar;
      if (col === 'green') return greenAvatar;
      if (col === 'yellow') return yellowAvatar;
      return blueAvatar;
    };

    if (eventType === 'capture') {
      if (actorColor === 'red' && targetColor) {
        senderColor = targetColor;
        const complaintsAr = [
          'آه! سأنتقم منك في الرمية القادمة! 😤',
          'يا إلهي، كنت قريباً جداً من الأمان! 😢',
          'لا بأس، سأخرج بيدقاً جديداً حالاً! 🎲',
          'رمية جيدة لكنك لن تفوز بالبطولة! 😉'
        ];
        const complaintsEn = [
          'Ouch! I will get my revenge on the next roll! 😤',
          'Oh my, I was so close to safety! 😢',
          'No problem, I will release another token soon! 🎲',
          'Good hit, but you won\'t win the match! 😉'
        ];
        text = isAr ? complaintsAr[Math.floor(Math.random() * complaintsAr.length)] : complaintsEn[Math.floor(Math.random() * complaintsEn.length)];
      } else if (actorColor !== 'red') {
        senderColor = actorColor;
        const targetName = getName(targetColor || 'red');
        const gloatsAr = [
          `عفواً يا ${targetName}! لقد أسرت قطعتك! 😂🏃‍♂️`,
          `سحقتك! عد للمصنع وابدأ من الصفر 💥`,
          `هذه هي حلاوة اللودو التنافسية! 😉`,
          `نأسف للإزعاج، ولكن هذا قانون الحلبة! 😎`
        ];
        const gloatsEn = [
          `Sorry ${targetName}! Captured your token! 😂🏃‍♂️`,
          `Smacked! Go back to base and start over 💥`,
          `This is the beauty of competitive Ludo! 😉`,
          `Sorry for the inconvenience, but that\'s the rule! 😎`
        ];
        text = isAr ? gloatsAr[Math.floor(Math.random() * gloatsAr.length)] : gloatsEn[Math.floor(Math.random() * gloatsEn.length)];
      }
    } else if (eventType === 'roll_six') {
      const sixesAr = [
        'نعم! الرمية المثالية! ٦ لتفجير الساحة 🎲🔥',
        'الرقم السحري ٦! بيدق جديد ينطلق 🚀',
        'حظي ممتاز اليوم مع النرد! 😎',
        'من يريد رمية بقيمة ٦؟ النرد يحبني! ✨'
      ];
      const sixesEn = [
        'Yes! The perfect roll! 6 to release onto track 🎲🔥',
        'The magic number 6! Another token launches 🚀',
        'My luck is amazing today with the dice! 😎',
        'Who needs a 6? The dice is on my side! ✨'
      ];
      text = isAr ? sixesAr[Math.floor(Math.random() * sixesAr.length)] : sixesEn[Math.floor(Math.random() * sixesEn.length)];
    } else if (eventType === 'home') {
      const homeAr = [
        'رائع! قطعة وصلت للبيت بسلام! 👑',
        'الأمان النهائي بالمركز! البيدق وصل! 🏆',
        'اقتربت من النصر النهائي! 🚀✨',
        'واحدة في البيت، وثلاثة على الطريق! 😉'
      ];
      const homeEn = [
        'Excellent! A token reached Home safely! 👑',
        'Final safety in the center! Token secured! 🏆',
        'Getting closer to the final victory! 🚀✨',
        'One home, three more to go! 😉'
      ];
      text = isAr ? homeAr[Math.floor(Math.random() * homeAr.length)] : homeEn[Math.floor(Math.random() * homeEn.length)];
    } else if (eventType === 'win') {
      const winAr = [
        'لقد فعلتها! أنا بطل حلبة اللودو الكبرى اليوم! 🏆👑',
        'لعبة مذهلة شباب، شكراً لكم على المنافسة الرائعة! 👋',
        'النصر حليفي دائماً! هاردلك لكم 🥇',
        'مباراة أسطورية ونهاية عظيمة! 😎🚀'
      ];
      const winEn = [
        'I did it! I am the Ludo Arena Champion today! 🏆👑',
        'Amazing match guys, thanks for the great game! 👋',
        'Victory is mine! Better luck next time 🥇',
        'An epic match and a spectacular finish! 😎🚀'
      ];
      text = isAr ? winAr[Math.floor(Math.random() * winAr.length)] : winEn[Math.floor(Math.random() * winEn.length)];
    }

    if (text) {
      const newMsg: ChatMessage = {
        id: 'msg_event_' + Date.now() + Math.random().toString(36).substring(2, 5),
        sender: senderColor,
        senderName: getName(senderColor),
        senderAvatar: getAvatar(senderColor),
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, newMsg]);
    }
  };

  // 16 tokens array (4 tokens per color)
  const [tokens, setTokens] = useState<LudoToken[]>([
    // Red (Player)
    { id: 'red_0', color: 'red', index: 0, step: 0 },
    { id: 'red_1', color: 'red', index: 1, step: 0 },
    { id: 'red_2', color: 'red', index: 2, step: 0 },
    { id: 'red_3', color: 'red', index: 3, step: 0 },
    // Green (AI)
    { id: 'green_0', color: 'green', index: 0, step: 0 },
    { id: 'green_1', color: 'green', index: 1, step: 0 },
    { id: 'green_2', color: 'green', index: 2, step: 0 },
    { id: 'green_3', color: 'green', index: 3, step: 0 },
    // Yellow (AI)
    { id: 'yellow_0', color: 'yellow', index: 0, step: 0 },
    { id: 'yellow_1', color: 'yellow', index: 1, step: 0 },
    { id: 'yellow_2', color: 'yellow', index: 2, step: 0 },
    { id: 'yellow_3', color: 'yellow', index: 3, step: 0 },
    // Blue (AI)
    { id: 'blue_0', color: 'blue', index: 0, step: 0 },
    { id: 'blue_1', color: 'blue', index: 1, step: 0 },
    { id: 'blue_2', color: 'blue', index: 2, step: 0 },
    { id: 'blue_3', color: 'blue', index: 3, step: 0 },
  ]);

  const logListRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the log console
  useEffect(() => {
    if (logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
    }
  }, [logs]);

  // Sound Synth Generator
  const playSound = (freq: number, type: 'sine' | 'triangle' | 'square' | 'sawtooth', duration: number, sweepTo?: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (sweepTo) {
        osc.frequency.exponentialRampToValueAtTime(sweepTo, ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const playDiceSound = () => {
    playSound(150, 'sawtooth', 0.3, 300);
    setTimeout(() => playSound(220, 'triangle', 0.2, 440), 100);
  };

  const playStepSound = () => {
    playSound(600, 'sine', 0.08, 900);
  };

  const playCaptureSound = () => {
    playSound(180, 'sawtooth', 0.5, 60);
    playSound(100, 'square', 0.4, 50);
  };

  const playVictorySound = () => {
    playSound(261.63, 'sine', 0.15); // C4
    setTimeout(() => playSound(329.63, 'sine', 0.15), 150); // E4
    setTimeout(() => playSound(392.00, 'sine', 0.15), 300); // G4
    setTimeout(() => playSound(523.25, 'sine', 0.4, 1046.50), 450); // C5 -> C6 sweep
  };

  const playReleaseSound = () => {
    playSound(400, 'triangle', 0.25, 800);
  };

  // Helper to add message logs
  const addLog = (textEn: string, textAr: string, color: string = 'text-slate-600 dark:text-slate-300') => {
    const newLog: LogMessage = {
      id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 5),
      textEn,
      textAr,
      color
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Initialize/Restart Ludo Game
  const handleStartGame = () => {
    setIsPlaying(true);
    setWinner(null);
    setCurrentPlayer('red');
    setDiceRolled(false);
    setIsDiceRolling(false);
    setConsecutiveSixes(0);
    setGameState('idle');
    setMovableTokens([]);
    setPointsEarned(0);
    setTokens([
      { id: 'red_0', color: 'red', index: 0, step: 0 },
      { id: 'red_1', color: 'red', index: 1, step: 0 },
      { id: 'red_2', color: 'red', index: 2, step: 0 },
      { id: 'red_3', color: 'red', index: 3, step: 0 },
      { id: 'green_0', color: 'green', index: 0, step: 0 },
      { id: 'green_1', color: 'green', index: 1, step: 0 },
      { id: 'green_2', color: 'green', index: 2, step: 0 },
      { id: 'green_3', color: 'green', index: 3, step: 0 },
      { id: 'yellow_0', color: 'yellow', index: 0, step: 0 },
      { id: 'yellow_1', color: 'yellow', index: 1, step: 0 },
      { id: 'yellow_2', color: 'yellow', index: 2, step: 0 },
      { id: 'yellow_3', color: 'yellow', index: 3, step: 0 },
      { id: 'blue_0', color: 'blue', index: 0, step: 0 },
      { id: 'blue_1', color: 'blue', index: 1, step: 0 },
      { id: 'blue_2', color: 'blue', index: 2, step: 0 },
      { id: 'blue_3', color: 'blue', index: 3, step: 0 },
    ]);
    setLogs([]);
    addLog(
      '🎲 Welcome to Authentic Ludo Arena! Red (You) goes first. Roll a 6 to release tokens!',
      '🎲 أهلاً بك في حلبة لودو الأصلية! الأحمر (أنت) يبدأ أولاً. ارمي ٦ لإخراج طاباتك!',
      'text-indigo-600 dark:text-indigo-400 font-extrabold'
    );
    playSound(440, 'sine', 0.4, 880);
  };

  // Retrieve board coordinate for any token index at a specific step
  const getCoordinates = (color: 'red' | 'green' | 'yellow' | 'blue', tokenIndex: number, step: number): { r: number, c: number } => {
    if (step === 0) {
      // Yard / Base coordinates
      if (color === 'red') {
        const slots = [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 }];
        return slots[tokenIndex];
      } else if (color === 'green') {
        const slots = [{ r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 }];
        return slots[tokenIndex];
      } else if (color === 'yellow') {
        const slots = [{ r: 11, c: 11 }, { r: 11, c: 12 }, { r: 12, c: 11 }, { r: 12, c: 12 }];
        return slots[tokenIndex];
      } else { // blue
        const slots = [{ r: 11, c: 2 }, { r: 11, c: 3 }, { r: 12, c: 2 }, { r: 12, c: 3 }];
        return slots[tokenIndex];
      }
    }

    // Outer track steps (1 to 51)
    if (step <= 51) {
      let trackIndex = 0;
      if (color === 'red') {
        trackIndex = (0 + step - 1) % 52;
      } else if (color === 'green') {
        trackIndex = (13 + step - 1) % 52;
      } else if (color === 'yellow') {
        trackIndex = (26 + step - 1) % 52;
      } else if (color === 'blue') {
        trackIndex = (39 + step - 1) % 52;
      }
      return TRACK_COORDS[trackIndex];
    }

    // Home path (steps 52 to 57)
    const homeIndex = step - 52; // 0 to 5
    if (color === 'red') {
      const coords = [
        { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }
      ];
      return coords[homeIndex];
    } else if (color === 'green') {
      const coords = [
        { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }
      ];
      return coords[homeIndex];
    } else if (color === 'yellow') {
      const coords = [
        { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 8 }
      ];
      return coords[homeIndex];
    } else { // blue
      const coords = [
        { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 8, c: 7 }
      ];
      return coords[homeIndex];
    }
  };

  // Convert color to language specific label
  const getColorLabel = (col: 'red' | 'green' | 'yellow' | 'blue') => {
    if (isAr) {
      switch (col) {
        case 'red': return 'الأحمر 🔴';
        case 'green': return 'الأخضر 🟢';
        case 'yellow': return 'الأصفر 🟡';
        case 'blue': return 'الأزرق 🔵';
      }
    } else {
      switch (col) {
        case 'red': return 'Red Player 🔴';
        case 'green': return 'Green AI 🟢';
        case 'yellow': return 'Yellow AI 🟡';
        case 'blue': return 'Blue AI 🔵';
      }
    }
  };

  const getColorThemeClass = (col: 'red' | 'green' | 'yellow' | 'blue') => {
    switch (col) {
      case 'red': return 'text-red-500 font-extrabold';
      case 'green': return 'text-emerald-500 font-extrabold';
      case 'yellow': return 'text-amber-500 font-extrabold';
      case 'blue': return 'text-blue-500 font-extrabold';
    }
  };

  // Calculate track index for outer steps 1..51
  const getTrackIndex = (color: 'red' | 'green' | 'yellow' | 'blue', step: number): number => {
    if (step <= 0 || step > 51) return -1;
    let offset = 0;
    if (color === 'red') offset = 0;
    else if (color === 'green') offset = 13;
    else if (color === 'yellow') offset = 26;
    else if (color === 'blue') offset = 39;
    return (offset + step - 1) % 52;
  };

  // Check if a move is valid for a given token and rolled dice value
  const isValidMove = (token: LudoToken, roll: number): boolean => {
    if (token.step === 57) return false; // Already home

    if (token.step === 0) {
      return roll === 6; // Can only leave base on 6
    }

    // Must land exactly on HOME (step 57)
    return token.step + roll <= 57;
  };

  // Get all movable tokens for a color given a dice value
  const getMovableTokensForColor = (color: 'red' | 'green' | 'yellow' | 'blue', roll: number): LudoToken[] => {
    return tokens.filter(t => t.color === color && isValidMove(t, roll));
  };

  // Turn logic transitions
  const advanceTurn = (samePlayerBonus: boolean = false) => {
    if (winner) return;

    if (samePlayerBonus) {
      setDiceRolled(false);
      setGameState('idle');
      addLog(
        `⚡ Extra Roll Bonus for ${getColorLabel(currentPlayer)}!`,
        `⚡ رمية إضافية مكافأة لـ ${getColorLabel(currentPlayer)}!`,
        'text-indigo-600 dark:text-indigo-400 font-black'
      );
      return;
    }

    setConsecutiveSixes(0);
    setDiceRolled(false);
    
    // Cycle players: red -> green -> yellow -> blue
    const order: ('red' | 'green' | 'yellow' | 'blue')[] = ['red', 'green', 'yellow', 'blue'];
    const nextIdx = (order.indexOf(currentPlayer) + 1) % 4;
    const nextPlayer = order[nextIdx];
    
    setCurrentPlayer(nextPlayer);
    setGameState('idle');
  };

  // Animated progressive token move function (walks cell by cell)
  const animateMoveToken = async (tokenId: string, targetStep: number): Promise<void> => {
    return new Promise((resolve) => {
      const token = tokens.find(t => t.id === tokenId);
      if (!token) return resolve();

      const startStep = token.step;
      let currentStep = startStep;

      // Handle leaving base (from 0 to 1)
      if (startStep === 0 && targetStep === 1) {
        setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, step: 1 } : t));
        playReleaseSound();
        resolve();
        return;
      }

      const stepInterval = setInterval(() => {
        currentStep++;
        setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, step: currentStep } : t));
        playStepSound();

        if (currentStep >= targetStep) {
          clearInterval(stepInterval);
          resolve();
        }
      }, 180); // speed of walking animation
    });
  };

  // Perform movement mechanics, checks for captures, home points, wins
  const executeTokenMove = async (tokenId: string, roll: number) => {
    if (gameState === 'moving') return;
    setGameState('moving');
    setMovableTokens([]);

    const token = tokens.find(t => t.id === tokenId)!;
    const initialStep = token.step;
    const finalStep = initialStep === 0 ? 1 : initialStep + roll;

    // Trigger step-by-step walking animation
    await animateMoveToken(tokenId, finalStep);

    // Get track index of landing spot
    const landingTrackIdx = getTrackIndex(token.color, finalStep);
    let capturedAny = false;

    // Check Capture: if landed on outer track and not a safe zone
    if (landingTrackIdx !== -1 && !SAFE_INDICES.includes(landingTrackIdx)) {
      // Find opponent tokens sharing same track cell
      const opponentsAtSpot = tokens.filter(t => {
        if (t.color === token.color) return false; // same color
        const oppTrackIdx = getTrackIndex(t.color, t.step);
        return oppTrackIdx === landingTrackIdx;
      });

      if (opponentsAtSpot.length > 0) {
        capturedAny = true;
        playCaptureSound();
        
        // Reset opponents back to base (step = 0)
        const opponentIds = opponentsAtSpot.map(o => o.id);
        setTokens(prev => prev.map(t => opponentIds.includes(t.id) ? { ...t, step: 0 } : t));

        // Trigger dynamic chat for capture
        triggerEventChatMessage('capture', token.color, opponentsAtSpot[0].color);

        const namesEn = opponentsAtSpot.map(o => getColorLabel(o.color)).join(', ');
        const namesAr = opponentsAtSpot.map(o => getColorLabel(o.color)).join(', ');

        addLog(
          `⚔️ Capture! ${getColorLabel(token.color)} captured ${namesEn} and returned them to yard!`,
          `⚔️ سحق وأسر! قام ${getColorLabel(token.color)} بأسر ${namesAr} وأعادهم للمصنع!`,
          'text-red-600 dark:text-red-400 font-extrabold animate-bounce'
        );

        // Award points if Player captured AI
        if (token.color === 'red') {
          const reward = 150;
          setPointsEarned(prev => prev + reward);
          awardPoints(reward, 'لودو: سحق الخصم والأسر', 'Ludo: Capture Opponent');
          triggerToast(
            isAr ? `⚔️ رائع! أسرت طابة الخصم وكسبت +${reward} نقطة!` : `⚔️ Capture! Earned +${reward} Points!`,
            'success'
          );
        }
      }
    }

    // Check Home Entry point reward
    if (finalStep === 57) {
      playVictorySound();
      triggerEventChatMessage('home', token.color);
      addLog(
        `👑 SUCCESS! A token of ${getColorLabel(token.color)} has reached HOME!`,
        `👑 رائع! أحد طابات ${getColorLabel(token.color)} وصلت للأمان النهائي بالمركز!`,
        'text-emerald-600 dark:text-emerald-400 font-extrabold'
      );

      // Award points if Player token reached home
      if (token.color === 'red') {
        const reward = 400;
        setPointsEarned(prev => prev + reward);
        awardPoints(reward, 'لودو: تأمين طابة بالمركز', 'Ludo: Token Reached Home');
        triggerToast(
          isAr ? `👑 مبروك! وصلت بالبيدق للبيت بسلام وكسبت +${reward} نقطة!` : `👑 Token Home! Earned +${reward} Points!`,
          'success'
        );
      }
    }

    // Check win conditions: all 4 tokens of currentPlayer at step 57
    const allTokensHome = tokens
      .filter(t => t.color === token.color)
      .every(t => t.step === 57);

    if (allTokensHome) {
      setWinner(token.color);
      setGameState('ended');
      playVictorySound();
      triggerEventChatMessage('win', token.color);
      
      addLog(
        `🏆 CHAMPION! ${getColorLabel(token.color)} has won the Ludo Arena Match!`,
        `🏆 البطل المظفر! فاز ${getColorLabel(token.color)} بمباراة حلبة لودو الأسطورية!`,
        'text-amber-500 font-black text-md tracking-wider'
      );

      // Major points award if Red wins
      if (token.color === 'red') {
        const winPrize = 1200;
        setPointsEarned(prev => prev + winPrize);
        awardPoints(winPrize, 'لودو: بطل حلبة لودو الكبرى', 'Ludo: Arena Champion');
        triggerToast(
          isAr ? `🏆 مبروك الفوز الكاسح بالبطولة! كسبت +${winPrize} نقطة كاش!` : `🏆 Ludo Victory! Awarded +${winPrize} cash points!`,
          'success'
        );
      }
      return;
    }

    // Determine Turn Advancements
    // Player gets bonus roll on rolling a 6 OR capturing any opponent's token
    const isSix = roll === 6;
    const bonusExtraRoll = isSix || capturedAny;

    advanceTurn(bonusExtraRoll);
  };

  // Perform roll mechanics
  const handleRollDice = () => {
    if (isDiceRolling || diceRolled || gameState === 'moving') return;

    setIsDiceRolling(true);
    setGameState('rolling');
    playDiceSound();

    // Roll rotation animation frames
    let counter = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter > 6) {
        clearInterval(interval);
        
        // Finalize Dice roll
        const rolledVal = Math.floor(Math.random() * 6) + 1;
        setDiceValue(rolledVal);
        setIsDiceRolling(false);
        setDiceRolled(true);

        processDiceResult(rolledVal);
      }
    }, 100);
  };

  // Evaluate roll and move options
  const processDiceResult = (roll: number) => {
    addLog(
      `🎲 ${getColorLabel(currentPlayer)} rolled a ${roll}`,
      `🎲 رمى ${getColorLabel(currentPlayer)} النرد وحصل على الرقم ${roll}`,
      getColorThemeClass(currentPlayer)
    );

    // Reward points for Player rolling 6
    if (currentPlayer === 'red' && roll === 6) {
      awardPoints(25, 'لودو: رمية النرد الذهبية ٦', 'Ludo: Rolled a Six');
      setPointsEarned(prev => prev + 25);
    }

    // Check 3 consecutive sixes rule -> turns pass
    let currentSixesCount = consecutiveSixes;
    if (roll === 6) {
      if (currentPlayer !== 'red') {
        triggerEventChatMessage('roll_six', currentPlayer);
      }
      currentSixesCount++;
      setConsecutiveSixes(currentSixesCount);
      if (currentSixesCount === 3) {
        addLog(
          `⚠️ 3 Consecutive Sixes! ${getColorLabel(currentPlayer)} loses turn!`,
          `⚠️ ٣ ستات متتالية! خسر ${getColorLabel(currentPlayer)} دوره كعقوبة!`,
          'text-rose-500 font-bold'
        );
        setTimeout(() => advanceTurn(false), 1200);
        return;
      }
    } else {
      setConsecutiveSixes(0);
    }

    // Check available moves
    const movable = getMovableTokensForColor(currentPlayer, roll);

    if (movable.length === 0) {
      addLog(
        `😴 No valid moves for ${getColorLabel(currentPlayer)} with rolled ${roll}`,
        `😴 لا توجد خطوات متاحة لـ ${getColorLabel(currentPlayer)} مع الرقم ${roll}`,
        'text-slate-400 font-semibold'
      );
      // Auto pass after small delay
      setTimeout(() => advanceTurn(false), 1500);
      return;
    }

    // If active player is RED (User), prompt choice
    if (currentPlayer === 'red') {
      setGameState('selecting');
      setMovableTokens(movable.map(t => t.id));
      
      // Auto-move if only 1 token is movable to streamline fast-paced play
      if (movable.length === 1) {
        setTimeout(() => {
          executeTokenMove(movable[0].id, roll);
        }, 800);
      }
    } else {
      // AI Player automates decision
      setGameState('selecting');
      setTimeout(() => {
        executeAiDecision(movable, roll);
      }, 1000);
    }
  };

  // AI Decision Logic
  const executeAiDecision = (movable: LudoToken[], roll: number) => {
    // Determine high priority AI heuristics
    let selectedToken = movable[0];

    // Priority 1: Capture any opponent token
    const captureMoves = movable.filter(t => {
      const finalStep = t.step === 0 ? 1 : t.step + roll;
      const landingIdx = getTrackIndex(t.color, finalStep);
      if (landingIdx !== -1 && !SAFE_INDICES.includes(landingIdx)) {
        return tokens.some(opp => opp.color !== t.color && getTrackIndex(opp.color, opp.step) === landingIdx);
      }
      return false;
    });

    if (captureMoves.length > 0) {
      selectedToken = captureMoves[Math.floor(Math.random() * captureMoves.length)];
    } else {
      // Priority 2: Get token exactly HOME
      const winningMoves = movable.filter(t => t.step + roll === 57);
      if (winningMoves.length > 0) {
        selectedToken = winningMoves[0];
      } else {
        // Priority 3: Release token from Base
        const releaseMoves = movable.filter(t => t.step === 0);
        if (releaseMoves.length > 0 && Math.random() > 0.3) {
          selectedToken = releaseMoves[0];
        } else {
          // Priority 4: Move token closest to home (highest step value)
          const sortedByStep = [...movable].sort((a, b) => b.step - a.step);
          selectedToken = sortedByStep[0];
        }
      }
    }

    executeTokenMove(selectedToken.id, roll);
  };

  // AI Turn triggering automation
  useEffect(() => {
    if (!isPlaying || winner) return;

    if (currentPlayer !== 'red' && gameState === 'idle' && !isDiceRolling && !diceRolled) {
      // Trigger AI Dice Roll after simple delay
      const aiDelay = setTimeout(() => {
        handleRollDice();
      }, 1200);
      return () => clearTimeout(aiDelay);
    }
  }, [currentPlayer, isPlaying, gameState, diceRolled, winner]);


  // Helper to resolve stacking coordinates offsets to avoid complete overlapping
  const getStackedCoordinates = (tokenId: string): { x: number; y: number } => {
    const token = tokens.find(t => t.id === tokenId)!;
    const baseCoords = getCoordinates(token.color, token.index, token.step);

    // If step is 0 (inside base), slots already have unique offset positions
    if (token.step === 0) {
      return { x: baseCoords.c * 40 + 20, y: baseCoords.r * 40 + 20 };
    }

    // Find all other tokens currently on the exact same coordinate row and col
    const peers = tokens.filter(t => {
      if (t.step === 0) return false;
      const tc = getCoordinates(t.color, t.index, t.step);
      return tc.r === baseCoords.r && tc.c === baseCoords.c;
    });

    const peerIndex = peers.findIndex(t => t.id === tokenId);
    const count = peers.length;

    const cellCenterX = baseCoords.c * 40 + 20;
    const cellCenterY = baseCoords.r * 40 + 20;

    if (count <= 1 || peerIndex === -1) {
      return { x: cellCenterX, y: cellCenterY };
    }

    // If stacked, apply dynamic offsets relative to count and peerIndex
    // For 2 tokens: side-by-side. For 3+: little grid.
    const angle = (peerIndex / count) * 2 * Math.PI;
    const radius = 8; // Offset radius inside the 40px cell
    return {
      x: cellCenterX + radius * Math.cos(angle),
      y: cellCenterY + radius * Math.sin(angle)
    };
  };

  return (
    <div className="space-y-6">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 text-red-600 rounded-xl">
            <Dices className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isAr ? 'لعبة اللودو الطراز الأصلي 🎲' : 'Original Authentic Ludo 🎲'}</span>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black">
                {isAr ? 'كلاسيك' : 'Classic Board'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'العب بقطعك الحمراء ضد الذكاء الاصطناعي واكسب مكافآت ضخمة!' : 'Roll the dice, capture AI pieces, and claim real cashout points!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
            title={soundEnabled ? (isAr ? 'كتم الصوت' : 'Mute Sounds') : (isAr ? 'تشغيل الصوت' : 'Unmute Sounds')}
          >
            {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5 text-rose-500" />}
          </button>

          {isPlaying && (
            <button
              onClick={handleStartGame}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة تشغيل الجولة' : 'Restart Round'}</span>
            </button>
          )}
        </div>
      </div>

      {!isPlaying ? (
        /* LOBBY / INTRO PAGE */
        <div className="text-center py-10 space-y-6 max-w-lg mx-auto">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-red-500/5 rounded-full border border-red-500/10 shadow-inner">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="absolute inset-2 border-2 border-dashed border-red-500/20 rounded-full"
            ></motion.div>
            <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-amber-500 text-white rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Dices className="w-12 h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? 'لعبة اللودو الأصلية: بساط ومكافآت حقيقية 🏆' : 'Authentic Ludo: Play & Collect Real Cashout 🏆'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              {isAr 
                ? 'استمتع بالتجربة التنافسية للعبة اللودو الكلاسيكية! ارم النرد، فجّر وحاصر طابات الخصوم للعودة للبيت بنقاط مكافأة حقيقية تُرسل فورياً لحسابك.'
                : 'Experience the original cardboard Ludo layout with advanced automatic AI opponents, realistic dice spins, capture points, and massive victory prizes.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-right">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <Award className="w-5 h-5 text-amber-500 mx-auto" />
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'مكافأة الفوز' : 'Match Victory'}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">+١,٢٠٠ نقطة</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <Sparkles className="w-5 h-5 text-indigo-500 mx-auto animate-pulse" />
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'تأمين بيدق بالمركز' : 'Token to Home'}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">+٤٠٠ نقطة</span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            <span>{isAr ? 'ابدأ اللعب الآن وحصد المكافآت ⚡' : 'Start Play & Earn Now ⚡'}</span>
          </button>
        </div>
      ) : (
        /* GAME BOARD & CONSOLE SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: THE INTERACTIVE LUDO BOARD (SVG RENDERED) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-3 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-xs flex flex-col items-center">
            
            {/* SVG Board container */}
            <div className="w-full max-w-[500px] aspect-square relative select-none">
              <svg 
                viewBox="0 0 600 600" 
                className="w-full h-full rounded-2xl border-4 border-slate-950 shadow-xl bg-slate-100"
              >
                {/* ========================================== */}
                {/* 1. OUTLINE / BACKGROUND GRIDS */}
                {/* ========================================== */}
                
                {/* Red Base (Top-Left 6x6) */}
                <rect x="0" y="0" width="240" height="240" fill="#ef4444" stroke="#000" strokeWidth="2" />
                <rect x="40" y="40" width="160" height="160" fill="#ffffff" rx="12" />
                {/* Green Base (Top-Right 6x6) */}
                <rect x="360" y="0" width="240" height="240" fill="#10b981" stroke="#000" strokeWidth="2" />
                <rect x="400" y="40" width="160" height="160" fill="#ffffff" rx="12" />
                {/* Blue Base (Bottom-Left 6x6) */}
                <rect x="0" y="360" width="240" height="240" fill="#3b82f6" stroke="#000" strokeWidth="2" />
                <rect x="40" y="400" width="160" height="160" fill="#ffffff" rx="12" />
                {/* Yellow Base (Bottom-Right 6x6) */}
                <rect x="360" y="360" width="240" height="240" fill="#f59e0b" stroke="#000" strokeWidth="2" />
                <rect x="400" y="400" width="160" height="160" fill="#ffffff" rx="12" />

                {/* Draw 15x15 grids (excluding bases & center home region) */}
                {Array.from({ length: 15 }).map((_, r) => {
                  return Array.from({ length: 15 }).map((_, c) => {
                    // Check if cell is in base region
                    const inRedBase = r < 6 && c < 6;
                    const inGreenBase = r < 6 && c >= 9;
                    const inBlueBase = r >= 9 && c < 6;
                    const inYellowBase = r >= 9 && c >= 9;
                    const inCenterHome = r >= 6 && r <= 8 && c >= 6 && c <= 8;

                    if (inRedBase || inGreenBase || inBlueBase || inYellowBase || inCenterHome) {
                      return null;
                    }

                    // Render Standard Path Square
                    const x = c * 40;
                    const y = r * 40;

                    // Color codes for specific positions
                    let cellFill = '#ffffff';

                    // 1. Home Column Paths
                    const isRedHomeRun = r === 7 && c >= 1 && c <= 5;
                    const isGreenHomeRun = r >= 1 && r <= 5 && c === 7;
                    const isYellowHomeRun = r === 7 && c >= 9 && c <= 13;
                    const isBlueHomeRun = r >= 9 && r <= 13 && c === 7;

                    if (isRedHomeRun) cellFill = '#fecaca'; // soft red
                    else if (isGreenHomeRun) cellFill = '#a7f3d0'; // soft green
                    else if (isYellowHomeRun) cellFill = '#fef3c7'; // soft yellow
                    else if (isBlueHomeRun) cellFill = '#bfdbfe'; // soft blue

                    // 2. Start squares (safe colored spots)
                    const isRedStart = r === 6 && c === 1;
                    const isGreenStart = r === 1 && c === 8;
                    const isYellowStart = r === 8 && c === 13;
                    const isBlueStart = r === 13 && c === 6;

                    if (isRedStart) cellFill = '#ef4444';
                    else if (isGreenStart) cellFill = '#10b981';
                    else if (isYellowStart) cellFill = '#f59e0b';
                    else if (isBlueStart) cellFill = '#3b82f6';

                    // 3. Regular Star/Safe Spots
                    const isStarSpot = (r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8) || (r === 8 && c === 2);
                    if (isStarSpot) cellFill = '#e2e8f0'; // soft gray

                    return (
                      <g key={`cell_${r}_${c}`}>
                        <rect 
                          x={x} 
                          y={y} 
                          width="40" 
                          height="40" 
                          fill={cellFill} 
                          stroke="#475569" 
                          strokeWidth="1.5" 
                        />
                        {/* Star drawing for safe spot highlights */}
                        {(isStarSpot || isRedStart || isGreenStart || isYellowStart || isBlueStart) && (
                          <text 
                            x={x + 20} 
                            y={y + 26} 
                            fontSize="18" 
                            textAnchor="middle" 
                            fill={isStarSpot ? '#64748b' : '#ffffff'}
                            className="font-black select-none pointer-events-none"
                          >
                            ★
                          </text>
                        )}
                      </g>
                    );
                  });
                })}

                {/* ========================================== */}
                {/* 2. CENTER HOME AREA (TRIANGLES MEETING) */}
                {/* ========================================== */}
                {/* Red Triangle */}
                <polygon points="240,240 300,300 240,360" fill="#ef4444" stroke="#000" strokeWidth="2" />
                {/* Green Triangle */}
                <polygon points="240,240 300,300 360,240" fill="#10b981" stroke="#000" strokeWidth="2" />
                {/* Yellow Triangle */}
                <polygon points="360,240 300,300 360,360" fill="#f59e0b" stroke="#000" strokeWidth="2" />
                {/* Blue Triangle */}
                <polygon points="240,360 300,300 360,360" fill="#3b82f6" stroke="#000" strokeWidth="2" />

                {/* Elegant White circle in dead center */}
                <circle cx="300" cy="300" r="15" fill="#ffffff" stroke="#000" strokeWidth="2" />
                <text x="300" y="304" fontSize="11" textAnchor="middle" fontWeight="black" fill="#000">LUDO</text>

                {/* Defs section for Avatar clipping paths */}
                <defs>
                  <clipPath id="clip-red">
                    <circle cx="120" cy="120" r="22" />
                  </clipPath>
                  <clipPath id="clip-green">
                    <circle cx="480" cy="120" r="22" />
                  </clipPath>
                  <clipPath id="clip-yellow">
                    <circle cx="480" cy="480" r="22" />
                  </clipPath>
                  <clipPath id="clip-blue">
                    <circle cx="120" cy="480" r="22" />
                  </clipPath>
                </defs>

                {/* ========================================== */}
                {/* 3. STATIC TOKEN SLOT INDICATORS & PLAYER AVATARS IN BASES */}
                {/* ========================================== */}
                {/* Red slots */}
                <circle cx="100" cy="100" r="16" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="140" cy="100" r="16" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="100" cy="140" r="16" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="140" cy="140" r="16" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                {/* Red Player Profile Display inside Base Center */}
                <circle cx="120" cy="120" r="24" fill="#ef4444" stroke="#ffffff" strokeWidth="2" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }} />
                <circle cx="120" cy="120" r="24" fill="transparent" stroke="#fbbf24" strokeWidth="3" className="animate-pulse" opacity={currentPlayer === 'red' ? 1 : 0} />
                <image href={redAvatar} x="98" y="98" width="44" height="44" clipPath="url(#clip-red)" referrerPolicy="no-referrer" />
                <text x="120" y="222" fontSize="12" fontWeight="900" fill="#ffffff" textAnchor="middle" style={{ filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.5))' }}>
                  {redName}
                </text>

                {/* Green slots */}
                <circle cx="460" cy="100" r="16" fill="#d1fae5" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="500" cy="100" r="16" fill="#d1fae5" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="460" cy="140" r="16" fill="#d1fae5" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="500" cy="140" r="16" fill="#d1fae5" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                {/* Green Player Profile Display inside Base Center */}
                <circle cx="480" cy="120" r="24" fill="#10b981" stroke="#ffffff" strokeWidth="2" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }} />
                <circle cx="480" cy="120" r="24" fill="transparent" stroke="#fbbf24" strokeWidth="3" className="animate-pulse" opacity={currentPlayer === 'green' ? 1 : 0} />
                <image href={greenAvatar} x="458" y="98" width="44" height="44" clipPath="url(#clip-green)" referrerPolicy="no-referrer" />
                <text x="480" y="222" fontSize="12" fontWeight="900" fill="#ffffff" textAnchor="middle" style={{ filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.5))' }}>
                  {greenName}
                </text>

                {/* Yellow slots */}
                <circle cx="460" cy="460" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="500" cy="460" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="460" cy="500" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="500" cy="500" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                {/* Yellow Player Profile Display inside Base Center */}
                <circle cx="480" cy="480" r="24" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }} />
                <circle cx="480" cy="480" r="24" fill="transparent" stroke="#fbbf24" strokeWidth="3" className="animate-pulse" opacity={currentPlayer === 'yellow' ? 1 : 0} />
                <image href={yellowAvatar} x="458" y="458" width="44" height="44" clipPath="url(#clip-yellow)" referrerPolicy="no-referrer" />
                <text x="480" y="385" fontSize="12" fontWeight="900" fill="#ffffff" textAnchor="middle" style={{ filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.5))' }}>
                  {yellowName}
                </text>

                {/* Blue slots */}
                <circle cx="100" cy="460" r="16" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="140" cy="460" r="16" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="100" cy="500" r="16" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx="140" cy="500" r="16" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
                {/* Blue Player Profile Display inside Base Center */}
                <circle cx="120" cy="480" r="24" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }} />
                <circle cx="120" cy="480" r="24" fill="transparent" stroke="#fbbf24" strokeWidth="3" className="animate-pulse" opacity={currentPlayer === 'blue' ? 1 : 0} />
                <image href={blueAvatar} x="98" y="458" width="44" height="44" clipPath="url(#clip-blue)" referrerPolicy="no-referrer" />
                <text x="120" y="385" fontSize="12" fontWeight="900" fill="#ffffff" textAnchor="middle" style={{ filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.5))' }}>
                  {blueName}
                </text>

                {/* ========================================== */}
                {/* 4. ACTIVE PLAYERS' TOKENS ON BOARD */}
                {/* ========================================== */}
                {tokens.map((tok) => {
                  const stacked = getStackedCoordinates(tok.id);
                  const isPlayerMovable = movableTokens.includes(tok.id);

                  // Color specifics
                  let fill = '#ffffff';
                  let stroke = '#000000';
                  let crownColor = '#f59e0b';
                  if (tok.color === 'red') {
                    fill = '#ef4444';
                    stroke = '#b91c1c';
                  } else if (tok.color === 'green') {
                    fill = '#10b981';
                    stroke = '#047857';
                  } else if (tok.color === 'yellow') {
                    fill = '#f59e0b';
                    stroke = '#b45309';
                  } else if (tok.color === 'blue') {
                    fill = '#3b82f6';
                    stroke = '#1d4ed8';
                  }

                  const isHome = tok.step === 57;

                  // Render each token
                  return (
                    <g 
                      key={tok.id}
                      onClick={() => {
                        if (isPlayerMovable && currentPlayer === 'red' && gameState === 'selecting') {
                          executeTokenMove(tok.id, diceValue);
                        }
                      }}
                      className={`${isPlayerMovable ? 'cursor-pointer hover:scale-115' : 'pointer-events-none'}`}
                    >
                      {/* Bouncing Glow effect for playable pieces */}
                      {isPlayerMovable && (
                        <circle 
                          cx={stacked.x} 
                          cy={stacked.y} 
                          r="22" 
                          fill="transparent" 
                          stroke="#f59e0b" 
                          strokeWidth="3" 
                          className="animate-ping"
                          opacity="0.75"
                        />
                      )}

                      {/* Main token circle */}
                      <circle 
                        cx={stacked.x} 
                        cy={stacked.y} 
                        r={isHome ? "11" : "15"} 
                        fill={fill} 
                        stroke={isPlayerMovable ? '#ffffff' : stroke} 
                        strokeWidth={isPlayerMovable ? '2.5' : '1.5'} 
                        className={`transition-all duration-150 ${isHome ? 'opacity-40' : ''} ${isPlayerMovable ? 'animate-bounce' : ''}`}
                        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.25))' }}
                      />

                      {/* Inner gold core circle */}
                      <circle 
                        cx={stacked.x} 
                        cy={stacked.y} 
                        r={isHome ? "5" : "7"} 
                        fill="#ffffff" 
                        opacity="0.8" 
                      />

                      {/* Crown icon on top if reached Home safely */}
                      {isHome && (
                        <circle
                          cx={stacked.x}
                          cy={stacked.y}
                          r="6"
                          fill={crownColor}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      )}

                      {/* Simple marker index */}
                      {!isHome && (
                        <text
                          x={stacked.x}
                          y={stacked.y + 3.5}
                          fontSize="9"
                          fontWeight="black"
                          fill={fill}
                          textAnchor="middle"
                          className="font-mono select-none"
                        >
                          {tok.index + 1}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Overlay indicators explaining yard positions */}
            <div className="flex justify-between items-center w-full max-w-[500px] mt-4 text-[10px] text-slate-400 font-bold px-1">
              <span>{isAr ? '🔴 قطعك بالأسفل' : '🔴 Red pieces bottom-left'}</span>
              <span>{isAr ? '💡 انقر القطعة اللامعة لتتحرك' : '💡 Tap glowing pieces to move'}</span>
            </div>

            {/* COMPACT DICE ROLLER CONSOLE - repositioned close to the board */}
            <div className="w-full max-w-[500px] mt-5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Active Turn HUD */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-600 bg-slate-200 flex-shrink-0">
                    <img 
                      src={
                        currentPlayer === 'red' ? redAvatar :
                        currentPlayer === 'green' ? greenAvatar :
                        currentPlayer === 'yellow' ? yellowAvatar : blueAvatar
                      } 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white ${
                    currentPlayer === 'red' ? 'bg-red-500' :
                    currentPlayer === 'green' ? 'bg-emerald-500' :
                    currentPlayer === 'yellow' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {isAr ? 'اللاعب الحالي' : 'Active Turn'}
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 block truncate max-w-[120px]">
                    {currentPlayer === 'red' ? redName :
                     currentPlayer === 'green' ? greenName :
                     currentPlayer === 'yellow' ? yellowName : blueName}
                  </span>
                </div>
              </div>

              {/* Rolling Dice Box */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleRollDice}
                  disabled={currentPlayer !== 'red' || isDiceRolling || diceRolled || gameState === 'moving'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-14 h-14 rounded-xl border bg-white dark:bg-slate-950 shadow-md flex items-center justify-center relative cursor-pointer outline-none transition-all ${
                    currentPlayer === 'red' && !diceRolled && !isDiceRolling && gameState !== 'moving'
                      ? 'border-indigo-600 ring ring-indigo-500/15 animate-bounce'
                      : 'border-slate-300 dark:border-slate-700'
                  } ${isDiceRolling ? 'animate-spin' : ''}`}
                >
                  <div className="grid grid-cols-3 grid-rows-3 gap-1 w-8 h-8">
                    {(diceValue >= 4 || diceValue === 2 || diceValue === 3) && diceValue !== 2 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mx-auto self-center"></div>
                    )}
                    {!(diceValue >= 4 || diceValue === 2 || diceValue === 3) && <div />}
                    <div />
                    {(diceValue >= 2) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mx-auto self-center"></div>
                    )}
                    {diceValue === 6 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mx-auto self-center"></div>
                    )}
                    {diceValue !== 6 && <div />}
                    {(diceValue % 2 === 1) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mx-auto self-center"></div>
                    )}
                    {diceValue % 2 !== 1 && <div />}
                    {diceValue === 6 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mx-auto self-center"></div>
                    )}
                    {(diceValue >= 2) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mx-auto self-center"></div>
                    )}
                    {!(diceValue >= 4 || diceValue === 2 || diceValue === 3) && <div />}
                    <div />
                    {(diceValue >= 4 || diceValue === 2 || diceValue === 3) && diceValue !== 2 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mx-auto self-center"></div>
                    )}
                  </div>
                </motion.button>

                {/* Rolled value label */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    {isDiceRolling ? (isAr ? 'جاري الرمي...' : 'Rolling...') : (isAr ? 'قيمة الرمية' : 'Rolled Value')}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {isDiceRolling ? '🎲' : diceValue}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRollDice}
                disabled={currentPlayer !== 'red' || isDiceRolling || diceRolled || gameState === 'moving'}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  currentPlayer !== 'red' || isDiceRolling || diceRolled || gameState === 'moving'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 dark:shadow-none'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isDiceRolling ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'ارمي النرد' : 'ROLL'}</span>
              </button>

            </div>

          </div>

          {/* RIGHT: CONTROLS, ACTIONS LOG, SCORE, DICE */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Score HUD */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'الأرباح المحققة بهذه الجولة:' : 'Earnings this match:'}
              </span>
              <div className="flex items-center gap-1.5 font-bold">
                <Award className="w-4.5 h-4.5 text-amber-500" />
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm tracking-tight">
                  +{pointsEarned.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">{isAr ? 'نقطة' : 'pts'}</span>
              </div>
            </div>

            {/* LUDO INTERACTIVE CHAT SYSTEM */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[360px] h-[360px]">
              
              {/* Chat Header */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{isAr ? 'دردشة الغرفة المباشرة 💬' : 'Live Room Chat 💬'}</span>
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                  {isAr ? '٤ لاعبين متصلين' : '4 Players Active'}
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto text-right flex flex-col justify-end">
                <div className="space-y-3 overflow-y-auto pr-1">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2 items-start ${msg.sender === 'red' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 border border-slate-200/50 flex-shrink-0 shadow-xs">
                        <img 
                          src={msg.senderAvatar} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      {/* Text wrapper */}
                      <div className="max-w-[70%]">
                        {/* Name */}
                        <div className="flex items-center gap-1.5 px-1 mb-0.5 justify-end">
                          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400">
                            {msg.senderName}
                          </span>
                          <span className="text-[8px] text-slate-300 dark:text-slate-500">
                            {msg.timestamp}
                          </span>
                        </div>
                        {/* Body bubble */}
                        <div className={`p-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs text-right ${
                          msg.sender === 'red' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : msg.sender === 'green'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100/30 rounded-tl-none'
                            : msg.sender === 'yellow'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-100/30 rounded-tl-none'
                            : 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border border-blue-100/30 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Preset Fast Chat Responses */}
              <div className="bg-slate-50/50 dark:bg-slate-900/50 p-2 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                {[
                  isAr ? 'حظ سعيد! 👋' : 'Good luck! 👋',
                  isAr ? 'لعبة رائعة! 👍' : 'Great game! 👍',
                  isAr ? 'يا إلهي! 😲' : 'Oh my! 😲',
                  isAr ? 'سحقاً! 😢' : 'Oops! 😢',
                  isAr ? 'النرد حليفي! 🔥' : 'My lucky dice! 🔥',
                  isAr ? 'احذروا غضبي! 😜' : 'Beware! 😜'
                ].map((preset, idx) => (
                  <button
                    key={`preset_${idx}`}
                    onClick={() => sendChatMessage(preset)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <input 
                  type="text" 
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendChatMessage(typedMessage);
                    }
                  }}
                  placeholder={isAr ? 'اكتب رسالتك وتحدَّ خصومك...' : 'Type message to trigger banter...'}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 px-3 py-2 rounded-xl text-xs text-right outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={() => sendChatMessage(typedMessage)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                >
                  {isAr ? 'إرسال' : 'Send'}
                </button>
              </div>

            </div>

            {/* LIVE ACTION TRANSACTION LOG CONSOLE */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-h-[160px]">
              <div className="border-b border-slate-50 dark:border-slate-800 pb-3 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>{isAr ? 'سجل أحداث المباراة المباشر' : 'Live Arena Match Logs'}</span>
                </span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg font-bold uppercase">
                  {isAr ? 'تحديث فوري' : 'Real-time'}
                </span>
              </div>

              {/* Message scroll container */}
              <div 
                ref={logListRef}
                className="flex-1 overflow-y-auto space-y-2.5 text-xs font-mono max-h-[120px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 pr-1 text-right"
              >
                {logs.length === 0 ? (
                  <div className="text-center text-slate-400 py-6">
                    {isAr ? 'لا توجد أحداث بعد. ابدأ اللعبة لتدوين السجل!' : 'No logs recorded yet. Begin rolls to log!'}
                  </div>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-2 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg border border-slate-100/30 text-[10px] leading-relaxed ${log.color}`}
                    >
                      {isAr ? log.textAr : log.textEn}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* QUICK RULES GUIDE MODAL OR EXPANSION */}
            <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-amber-900 dark:text-amber-400">
                  {isAr ? 'قوانين لودو كاش.ai المعتمدة:' : 'Cash.ai Ludo Arena Standard Rules:'}
                </h4>
                <ul className="text-[10px] text-amber-700 dark:text-amber-400/80 space-y-1 list-none">
                  <li>• {isAr ? '1. ارم النرد بقيمة ٦ لإطلاق قطعة من المصنع إلى الساحة.' : '1. Roll a 6 to release any token from yard onto track.'}</li>
                  <li>• {isAr ? '2. الرميات بقيمة ٦ تمنحك دوراً إضافياً مكافأة.' : '2. Any 6 rolled rewards an extra bonus roll immediately.'}</li>
                  <li>• {isAr ? '3. الهبوط على قطعة الخصم يأسرها ويعيدها للمصنع ويمنحك نقاطاً مضافة.' : '3. Landing on an opponent token captures it, returning it to base.'}</li>
                  <li>• {isAr ? '4. الخلايا الموشومة بنجمة ★ هي خلايا أمن لا يمكن الأسر بها.' : '4. Cells marked with stars ★ are safe zones where capture is impossible.'}</li>
                  <li>• {isAr ? '5. للربح النهائي، أوصل طاباتك الأربعة إلى مركز البيت بنجاح.' : '5. Reach all 4 tokens to the central Home triangle to claim final victory.'}</li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
