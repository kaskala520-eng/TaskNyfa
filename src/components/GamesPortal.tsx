import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Platform, Transaction, CountryConfig } from '../types';
import MarbleCrushGame from './MarbleCrushGame';
import BrickBreakerGame from './BrickBreakerGame';
import FlappyCoinGame from './FlappyCoinGame';
import GoldMinerGame from './GoldMinerGame';
import Wealth2048Game from './Wealth2048Game';
import TowerStackGame from './TowerStackGame';
import LudoGame from './LudoGame';
import TicTacToeGame from './TicTacToeGame';
import SnakeGame from './SnakeGame';
import RPSGame from './RPSGame';
import WhackMoleGame from './WhackMoleGame';
import WordGuessGame from './WordGuessGame';
import { SERVICE_CATEGORIES } from './Onboarding';
import ThreeDGameArcade from './ThreeDGameArcade';
import { Dices, Hash } from 'lucide-react';
import { 
  Gamepad2, 
  Trophy, 
  Sparkles, 
  RotateCw, 
  HelpCircle, 
  CheckCircle2, 
  Calendar, 
  Coins, 
  Brain, 
  Flame, 
  Play, 
  Check, 
  AlertCircle,
  Gem,
  Gift,
  Crown,
  Timer,
  GraduationCap,
  BookOpen,
  UserCheck,
  HeartPulse,
  Wrench,
  Calculator,
  Laptop,
  Scale,
  TrendingUp,
  Globe,
  Languages,
  Bookmark,
  Palette
} from 'lucide-react';

interface GamesPortalProps {
  lang: 'ar' | 'en';
  selectedCountry: CountryConfig;
  platforms: Platform[];
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  setActiveTab?: (tab: string) => void;
  onGamePlayed?: () => void;
}

// Memory Game Card Type
interface MemoryCard {
  id: number;
  iconName: 'coins' | 'gem' | 'gift' | 'trophy' | 'sparkles' | 'crown';
  isFlipped: boolean;
  isMatched: boolean;
}

// Audio feedback synthesizer using the browser's native Web Audio API
const playCoinSound = (isBigWin = false) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (isBigWin) {
      // Multi-tone triumphant golden fanfare chord
      const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
    } else {
      // Elegant bright coin ping sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.06); // B5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn("AudioContext was blocked or not supported in this frame", e);
  }
};

export const getAcademicGameIcon = (id: string) => {
  switch (id) {
    case 'edu_school': return <BookOpen className="w-6 h-6 text-indigo-500 shrink-0" />;
    case 'edu_tutor': return <UserCheck className="w-6 h-6 text-blue-500 shrink-0" />;
    case 'edu_medicine': return <HeartPulse className="w-6 h-6 text-rose-500 shrink-0" />;
    case 'edu_engineering': return <Wrench className="w-6 h-6 text-amber-500 shrink-0" />;
    case 'edu_sciences_pure': return <Calculator className="w-6 h-6 text-cyan-500 shrink-0" />;
    case 'edu_computer_science': return <Laptop className="w-6 h-6 text-teal-500 shrink-0" />;
    case 'edu_law_politics': return <Scale className="w-6 h-6 text-violet-500 shrink-0" />;
    case 'edu_business_economy': return <TrendingUp className="w-6 h-6 text-emerald-500 shrink-0" />;
    case 'edu_humanities': return <Globe className="w-6 h-6 text-orange-500 shrink-0" />;
    case 'edu_languages': return <Languages className="w-6 h-6 text-purple-500 shrink-0" />;
    case 'edu_islamic_studies': return <Bookmark className="w-6 h-6 text-sky-500 shrink-0" />;
    case 'edu_special_education': return <Sparkles className="w-6 h-6 text-fuchsia-500 shrink-0" />;
    case 'edu_sports_physical': return <Trophy className="w-6 h-6 text-green-500 shrink-0" />;
    case 'edu_fine_arts': return <Palette className="w-6 h-6 text-pink-500 shrink-0" />;
    default: return <GraduationCap className="w-6 h-6 text-slate-500 shrink-0" />;
  }
};

export const getAcademicGameColor = (id: string) => {
  switch (id) {
    case 'edu_school': return 'hover:border-indigo-300 dark:hover:border-indigo-900 bg-indigo-500/5';
    case 'edu_tutor': return 'hover:border-blue-300 dark:hover:border-blue-900 bg-blue-500/5';
    case 'edu_medicine': return 'hover:border-rose-300 dark:hover:border-rose-900 bg-rose-500/5';
    case 'edu_engineering': return 'hover:border-amber-300 dark:hover:border-amber-900 bg-amber-500/5';
    case 'edu_sciences_pure': return 'hover:border-cyan-300 dark:hover:border-cyan-900 bg-cyan-500/5';
    case 'edu_computer_science': return 'hover:border-teal-300 dark:hover:border-teal-900 bg-teal-500/5';
    case 'edu_law_politics': return 'hover:border-violet-300 dark:hover:border-violet-900 bg-violet-500/5';
    case 'edu_business_economy': return 'hover:border-emerald-300 dark:hover:border-emerald-900 bg-emerald-500/5';
    case 'edu_humanities': return 'hover:border-orange-300 dark:hover:border-orange-900 bg-orange-500/5';
    case 'edu_languages': return 'hover:border-purple-300 dark:hover:border-purple-900 bg-purple-500/5';
    case 'edu_islamic_studies': return 'hover:border-sky-300 dark:hover:border-sky-900 bg-sky-500/5';
    case 'edu_special_education': return 'hover:border-fuchsia-300 dark:hover:border-fuchsia-900 bg-fuchsia-500/5';
    case 'edu_sports_physical': return 'hover:border-green-300 dark:hover:border-green-900 bg-green-500/5';
    case 'edu_fine_arts': return 'hover:border-pink-300 dark:hover:border-pink-900 bg-pink-500/5';
    default: return 'hover:border-slate-300 dark:hover:border-slate-800 bg-slate-500/5';
  }
};

const generateQuestionForSpecialization = (specId: string, index: number) => {
  const handcrafted: Record<string, Array<{
    queryAr: string;
    queryEn: string;
    optionsAr: string[];
    optionsEn: string[];
    answerAr: string;
    answerEn: string;
  }>> = {
    edu_school: [
      {
        queryAr: 'ما هي الوسيلة الأفضل لتقييم مهارات التفكير النقدي لدى الطلاب؟',
        queryEn: 'What is the best method to evaluate students\' critical thinking skills?',
        optionsAr: ['الأسئلة المقالية والتحليلية', 'الاختبارات الموضوعية (صح/خطأ)', 'الحفظ والتسميع الشفوي', 'الكتابة الإملائية المباشرة'],
        optionsEn: ['Essay and analytical questions', 'Objective tests (True/False)', 'Rote memorization & oral recitation', 'Direct spelling dictation'],
        answerAr: 'الأسئلة المقالية والتحليلية',
        answerEn: 'Essay and analytical questions'
      },
      {
        queryAr: 'أي من نظريات التعلم تركز على تعديل السلوك من خلال التعزيز والعقاب؟',
        queryEn: 'Which learning theory focuses on modifying behavior through reinforcement and punishment?',
        optionsAr: ['النظرية السلوكية', 'النظرية البنائية', 'النظرية المعرفية', 'النظرية الاجتماعية'],
        optionsEn: ['Behaviorism', 'Constructivism', 'Cognitivism', 'Social learning theory'],
        answerAr: 'النظرية السلوكية',
        answerEn: 'Behaviorism'
      }
    ],
    edu_tutor: [
      {
        queryAr: 'ما هي الفائدة الأساسية للتعليم المتمايز في الدروس الخصوصية؟',
        queryEn: 'What is the primary benefit of differentiated instruction in tutoring?',
        optionsAr: ['تلبية الاحتياجات الفردية لكل طالب', 'تبسيط المناهج لتقليص وقت الشرح', 'توحيد أسئلة الاختبارات لجميع المستويات', 'الاعتماد على التلقين المباشر'],
        optionsEn: ['Meeting the individual needs of each student', 'Simplifying the curriculum to reduce explanation time', 'Unifying exam questions for all levels', 'Relying on direct rote learning'],
        answerAr: 'تلبية الاحتياجات الفردية لكل طالب',
        answerEn: 'Meeting the individual needs of each student'
      }
    ],
    edu_medicine: [
      {
        queryAr: 'أي غدة في جسم الإنسان تسمى "سيدة الغدد"؟',
        queryEn: 'Which gland in the human body is known as the "master gland"?',
        optionsAr: ['الغدة النخامية', 'الغدة الدرقية', 'الغدة الكظرية', 'البنكرياس'],
        optionsEn: ['Pituitary gland', 'Thyroid gland', 'Adrenal gland', 'Pancreas'],
        answerAr: 'الغدة النخامية',
        answerEn: 'Pituitary gland'
      },
      {
        queryAr: 'ما هو الجزء المسؤول عن تصفية الدم وإفراز البول في الجهاز البولي؟',
        queryEn: 'What is the part responsible for filtering blood and secreting urine in the urinary system?',
        optionsAr: ['الكلى والنيفرونات', 'المثانة البولية', 'الحالبين', 'الكبد'],
        optionsEn: ['Kidneys and nephrons', 'Urinary bladder', 'Ureters', 'Liver'],
        answerAr: 'الكلى والنيفرونات',
        answerEn: 'Kidneys and nephrons'
      }
    ],
    edu_engineering: [
      {
        queryAr: 'ما هي الوحدة المستخدمة لقياس المقاومة الكهربائية؟',
        queryEn: 'What is the unit used to measure electrical resistance?',
        optionsAr: ['الأوم (Ω)', 'الأمبير (A)', 'الفولت (V)', 'الوات (W)'],
        optionsEn: ['Ohm (Ω)', 'Ampere (A)', 'Volt (V)', 'Watt (W)'],
        answerAr: 'الأوم (Ω)',
        answerEn: 'Ohm (Ω)'
      },
      {
        queryAr: 'في الهندسة المدنية، ما هو الهدف من دراسة ميكانيكا التربة؟',
        queryEn: 'In civil engineering, what is the goal of studying soil mechanics?',
        optionsAr: ['تحديد قدرة تحمل التربة للقواعد', 'قياس نسبة التلوث في المياه الجوفية', 'تصميم واجهات المباني المعمارية', 'تحليل سرعة الرياح حول المنشأة'],
        optionsEn: ['Determining soil bearing capacity for foundations', 'Measuring pollution in groundwater', 'Designing architectural building facades', 'Analyzing wind speed around the structure'],
        answerAr: 'تحديد قدرة تحمل التربة للقواعد',
        answerEn: 'Determining soil bearing capacity for foundations'
      }
    ],
    edu_sciences_pure: [
      {
        queryAr: 'ما هو العنصر الكيميائي الأكثر وفرة في الكون؟',
        queryEn: 'What is the most abundant chemical element in the universe?',
        optionsAr: ['الهيدروجين', 'الهيليوم', 'الأكسجين', 'النيتروجين'],
        optionsEn: ['Hydrogen', 'Helium', 'Oxygen', 'Nitrogen'],
        answerAr: 'الهيدروجين',
        answerEn: 'Hydrogen'
      },
      {
        queryAr: 'ما هو القانون الفيزيائي الذي ينص على أن "لكل فعل رد فعل مساوٍ له في المقدار ومضاد له في الاتجاه"؟',
        queryEn: 'Which physical law states that "for every action, there is an equal and opposite reaction"?',
        optionsAr: ['قانون نيوتن الثالث للحركة', 'قانون نيوتن الثاني للحركة', 'قانون نيوتن الأول للحركة', 'قانون الجذب العام لنيوتن'],
        optionsEn: ['Newton\'s third law of motion', 'Newton\'s second law of motion', 'Newton\'s first law of motion', 'Newton\'s law of universal gravitation'],
        answerAr: 'قانون نيوتن الثالث للحركة',
        answerEn: 'Newton\'s third law of motion'
      }
    ],
    edu_computer_science: [
      {
        queryAr: 'أي من بروتوكولات الشبكة يستخدم لنقل الملفات بشكل آمن؟',
        queryEn: 'Which network protocol is used for securing file transfers?',
        optionsAr: ['SFTP', 'HTTP', 'FTP', 'SMTP'],
        optionsEn: ['SFTP', 'HTTP', 'FTP', 'SMTP'],
        answerAr: 'SFTP',
        answerEn: 'SFTP'
      },
      {
        queryAr: 'في لغات البرمجة، ما هي وظيفة مجمع النفايات (Garbage Collector)؟',
        queryEn: 'In programming languages, what is the function of the Garbage Collector?',
        optionsAr: ['تحرير الذاكرة غير المستخدمة تلقائياً', 'ترجمة الكود إلى لغة الآلة', 'تشفير الاتصالات وحمايتها', 'إصلاح الأخطاء الإملائية في الكود'],
        optionsEn: ['Automatically freeing unused memory', 'Compiling code into machine language', 'Encrypting communications and securing them', 'Fixing code syntax errors automatically'],
        answerAr: 'تحرير الذاكرة غير المستخدمة تلقائياً',
        answerEn: 'Automatically freeing unused memory'
      }
    ],
    edu_law_politics: [
      {
        queryAr: 'ما هو المبدأ القانوني الذي ينص على أن المتهم بريء حتى تثبت إدانته؟',
        queryEn: 'What is the legal principle stating that a defendant is innocent until proven guilty?',
        optionsAr: ['قرينة البراءة', 'مبدأ الشرعية العقابية', 'مبدأ عدم رجعية القوانين', 'مبدأ سيادة القانون الكلي'],
        optionsEn: ['Presumption of innocence', 'Principle of legality', 'Non-retroactivity of laws', 'Principle of total rule of law'],
        answerAr: 'قرينة البراءة',
        answerEn: 'Presumption of innocence'
      }
    ],
    edu_business_economy: [
      {
        queryAr: 'ما هو المفهوم الذي يعبر عن التكلفة الناتجة عن اختيار بديل دون آخر؟',
        queryEn: 'What concept refers to the cost incurred by choosing one alternative over another?',
        optionsAr: ['تكلفة الفرصة البديلة', 'التكلفة الثابتة', 'التكلفة المتغيرة', 'التكلفة الغارقة الكلية'],
        optionsEn: ['Opportunity cost', 'Fixed cost', 'Variable cost', 'Sunk cost'],
        answerAr: 'تكلفة الفرصة البديلة',
        answerEn: 'Opportunity cost'
      }
    ],
    edu_humanities: [
      {
        queryAr: 'أي حضارة قديمة قامت ببناء مدينة البتراء في الأردن؟',
        queryEn: 'Which ancient civilization built the city of Petra in Jordan?',
        optionsAr: ['الأنباط', 'الفراعنة', 'الرومان', 'البابليون'],
        optionsEn: ['Nabataeans', 'Pharaohs', 'Romans', 'Babylonians'],
        answerAr: 'الأنباط',
        answerEn: 'Nabataeans'
      }
    ],
    edu_languages: [
      {
        queryAr: 'ما هو الجمع الصحيح لكلمة "إمبراطور" في اللغة العربية؟',
        queryEn: 'What is the correct plural form of the word "Emperor" in Arabic?',
        optionsAr: ['أباطرة', 'إمبراطورات', 'إمبراطورين', 'أباطير'],
        optionsEn: ['Abatira (أباطرة)', 'Emperors (إمبراطورات)', 'Emperoreen (إمبراطورين)', 'Abateer (أباطير)'],
        answerAr: 'أباطرة',
        answerEn: 'Abatira (أباطرة)'
      }
    ],
    edu_islamic_studies: [
      {
        queryAr: 'من هو الصحابي الجليل الذي لُقّب بـ "أمين هذه الأمة"؟',
        queryEn: 'Which companion of the Prophet was nicknamed "Trustee of this Nation"?',
        optionsAr: ['أبو عبيدة بن الجراح', 'أبو بكر الصديق', 'عمر بن الخطاب', 'خالد بن الوليد'],
        optionsEn: ['Abu Ubaidah ibn al-Jarrah', 'Abu Bakr al-Siddiq', 'Umar ibn al-Khattab', 'Khalid ibn al-Walid'],
        answerAr: 'أبو عبيدة بن الجراح',
        answerEn: 'Abu Ubaidah ibn al-Jarrah'
      }
    ],
    edu_special_education: [
      {
        queryAr: 'ما هي أهم خصائص صعوبات التعلم المحددة (عسر القراءة)؟',
        queryEn: 'What is the primary characteristic of Dyslexia?',
        optionsAr: ['صعوبة في معالجة القراءة وفك الرموز', 'فرط الحركة وضعف الانتباه الكلي', 'انخفاض عام في القدرات العقلية', 'ضعف التنسيق البصري الحركي'],
        optionsEn: ['Difficulty in reading and decoding symbols', 'Hyperactivity and total attention deficit', 'General decrease in mental abilities', 'Weak visual-motor coordination'],
        answerAr: 'صعوبة في معالجة القراءة وفك الرموز',
        answerEn: 'Difficulty in reading and decoding symbols'
      }
    ],
    edu_sports_physical: [
      {
        queryAr: 'ما هو الهرمون الرئيسي المسؤول عن نمو الكتلة العضلية وتحفيز الأداء الرياضي؟',
        queryEn: 'What is the primary hormone responsible for muscle mass growth and sports performance stimulation?',
        optionsAr: ['التستوستيرون', 'الأنسولين', 'الأدرينالين', 'الكورتيزول'],
        optionsEn: ['Testosterone', 'Insulin', 'Adrenaline', 'Cortisol'],
        answerAr: 'التستوستيرون',
        answerEn: 'Testosterone'
      }
    ],
    edu_fine_arts: [
      {
        queryAr: 'ما هي الألوان الأساسية الثلاثة في الفنون التشكيلية؟',
        queryEn: 'What are the three primary colors in visual arts?',
        optionsAr: ['الأحمر والأزرق والأصفر', 'الأحمر والأخضر والأزرق', 'الأصفر والأرجواني والبرتقالي', 'الأسود والأبيض والرمادي'],
        optionsEn: ['Red, Blue, Yellow', 'Red, Green, Blue', 'Yellow, Violet, Orange', 'Black, White, Gray'],
        answerAr: 'الأحمر والأزرق والأصفر',
        answerEn: 'Red, Blue, Yellow'
      }
    ]
  };

  const specHandcrafted = handcrafted[specId] || [];
  if (index < specHandcrafted.length) {
    return specHandcrafted[index];
  }

  const seed = index + specId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pick = <T,>(arr: T[]): T => arr[seed % arr.length];

  switch (specId) {
    case 'edu_computer_science': {
      const bitSize = pick([8, 16, 32, 64]);
      const correctVal = bitSize === 8 ? '256' : bitSize === 16 ? '65,536' : bitSize === 32 ? '4,294,967,296' : '18.4 Quintillion';
      const qAr = `كم عدد القيم الفريدة التي يمكن تمثيلها باستخدام ${bitSize} بت (Bits) في علوم الحاسوب؟ (سؤال رقم ${index + 1})`;
      const qEn = `How many unique values can be represented using ${bitSize} bits in computer science? (Question #${index + 1})`;
      return {
        queryAr: qAr,
        queryEn: qEn,
        optionsAr: [correctVal, '128', '1,024', '16,384'],
        optionsEn: [correctVal, '128', '1,024', '16,384'],
        answerAr: correctVal,
        answerEn: correctVal
      };
    }
    case 'edu_sciences_pure': {
      const val1 = (seed % 20) + 5;
      const val2 = (seed % 15) + 2;
      const operation = pick(['+', '-', '*']);
      let ansVal = 0;
      if (operation === '+') ansVal = val1 + val2;
      else if (operation === '-') ansVal = val1 - val2;
      else ansVal = val1 * val2;

      const qAr = `ما هو حل المعادلة الرياضية التالية: ${val1} ${operation} ${val2} = ؟ (سؤال العلوم رقم ${index + 1})`;
      const qEn = `What is the solution for the following mathematical equation: ${val1} ${operation} ${val2} = ? (Science Q#${index + 1})`;
      const correctStr = String(ansVal);
      const wrong1 = String(ansVal + 5);
      const wrong2 = String(ansVal - 3);
      const wrong3 = String(ansVal * 2);
      return {
        queryAr: qAr,
        queryEn: qEn,
        optionsAr: [correctStr, wrong1, wrong2, wrong3],
        optionsEn: [correctStr, wrong1, wrong2, wrong3],
        answerAr: correctStr,
        answerEn: correctStr
      };
    }
    case 'edu_business_economy': {
      const capital = ((seed % 10) + 1) * 1000;
      const rate = (seed % 5) + 2;
      const years = (seed % 4) + 1;
      const interest = (capital * rate * years) / 100;
      const qAr = `احسب الفائدة البسيطة لرأس مال قدره $${capital.toLocaleString()} بمعدل فائدة سنوي ${rate}% لمدة ${years} سنوات؟ (سؤال الاقتصاد رقم ${index + 1})`;
      const qEn = `Calculate the simple interest for a capital of $${capital.toLocaleString()} at an annual interest rate of ${rate}% for ${years} years? (Economy Q#${index + 1})`;
      return {
        queryAr: qAr,
        queryEn: qEn,
        optionsAr: [`$${interest.toLocaleString()}`, `$${(interest + 500).toLocaleString()}`, `$${(interest - 100).toLocaleString()}`, `$${(interest * 1.5).toLocaleString()}`],
        optionsEn: [`$${interest.toLocaleString()}`, `$${(interest + 500).toLocaleString()}`, `$${(interest - 100).toLocaleString()}`, `$${(interest * 1.5).toLocaleString()}`],
        answerAr: `$${interest.toLocaleString()}`,
        answerEn: `$${interest.toLocaleString()}`
      };
    }
    case 'edu_languages': {
      const words = [
        { en: 'Translate', ar: 'يترجم', wAr: ['يكتب', 'يقرأ', 'يتعلم'], wEn: ['Write', 'Read', 'Learn'] },
        { en: 'Challenge', ar: 'تحدي', wAr: ['سهولة', 'مباراة', 'خسارة'], wEn: ['Ease', 'Match', 'Loss'] },
        { en: 'Experience', ar: 'خبرة', wAr: ['موهبة', 'ذكاء', 'جهل'], wEn: ['Talent', 'Intelligence', 'Ignorance'] },
        { en: 'Accuracy', ar: 'دقة', wAr: ['سرعة', 'جمال', 'قوة'], wEn: ['Speed', 'Beauty', 'Strength'] },
        { en: 'Innovation', ar: 'ابتكار', wAr: ['تقليد', 'تكرار', 'فشل'], wEn: ['Imitation', 'Repetition', 'Failure'] },
        { en: 'Structure', ar: 'بنية', wAr: ['هدم', 'تشتت', 'لون'], wEn: ['Demolition', 'Scattering', 'Color'] }
      ];
      const word = pick(words);
      const qAr = `ما هو المعنى الصحيح والمناسب للكلمة الإنجليزية "${word.en}" في اللغة العربية؟ (سؤال اللغات رقم ${index + 1})`;
      const qEn = `What is the correct translation of the English word "${word.en}" in Arabic? (Languages Q#${index + 1})`;
      return {
        queryAr: qAr,
        queryEn: qEn,
        optionsAr: [word.ar, ...word.wAr],
        optionsEn: [word.ar, ...word.wAr],
        answerAr: word.ar,
        answerEn: word.ar
      };
    }
    default: {
      const topics = [
        { en: 'Isaac Newton', ar: 'إسحاق نيوتن', dAr: 'مؤسس قوانين الحركة والجاذبية', dEn: 'Founder of the laws of motion and gravitation' },
        { en: 'Al-Khwarizmi', ar: 'الخوارزمي', dAr: 'مؤسس علم الجبر والخوارزميات', dEn: 'Founder of algebra and algorithms' },
        { en: 'Avicenna (Ibn Sina)', ar: 'ابن سينا', dAr: 'صاحب كتاب القانون في الطب الشهير', dEn: 'Author of the famous Canon of Medicine book' },
        { en: 'Al-Farabi', ar: 'الفارابي', dAr: 'المعلم الثاني ومؤسس الفلسفة الإسلامية', dEn: 'The Second Teacher and founder of Islamic philosophy' },
        { en: 'Ibn al-Haytham', ar: 'الحسن بن الهيثم', dAr: 'مؤسس علم البصريات الحديث والمنهج العلمي', dEn: 'Founder of modern optics and scientific methodology' }
      ];
      const topic = pick(topics);
      const qAr = `من هو العالم الأكاديمي الملقب بـ "${topic.ar}" والمعروف بأنه ${topic.dAr}؟ (سؤال التخصص رقم ${index + 1})`;
      const qEn = `Who is the academic scholar known as "${topic.en}" and recognized as ${topic.dEn}? (Specialization Q#${index + 1})`;
      const otherNamesAr = topics.filter(t => t.ar !== topic.ar).map(t => t.ar);
      const otherNamesEn = topics.filter(t => t.en !== topic.en).map(t => t.en);
      return {
        queryAr: qAr,
        queryEn: qEn,
        optionsAr: [topic.ar, ...otherNamesAr].slice(0, 4),
        optionsEn: [topic.en, ...otherNamesEn].slice(0, 4),
        answerAr: topic.ar,
        answerEn: topic.en
      };
    }
  }
};

export default function GamesPortal({
  lang,
  selectedCountry,
  platforms,
  setPlatforms,
  setTransactions,
  triggerToast,
  setActiveTab,
  onGamePlayed
}: GamesPortalProps) {
  const isAr = lang === 'ar';

  // Academic Specializations Games state variables
  const [lobbyViewMode, setLobbyViewMode] = useState<'3d' | 'grid'>('3d');
  const [selectedAcademicItem, setSelectedAcademicItem] = useState<any>(null);
  const [academicQuizActive, setAcademicQuizActive] = useState<boolean>(false);
  const [academicQuestion, setAcademicQuestion] = useState<any>(null);
  const [academicTimer, setAcademicTimer] = useState<number>(15);
  const [academicTimerActive, setAcademicTimerActive] = useState<boolean>(false);
  const [academicScore, setAcademicScore] = useState<number>(0);
  const [academicQuestionsAnswered, setAcademicQuestionsAnswered] = useState<number>(0);
  const [academicAnswered, setAcademicAnswered] = useState<boolean>(false);
  const [academicSelectedOption, setAcademicSelectedOption] = useState<string | null>(null);

  const academicGroup = SERVICE_CATEGORIES.find(cat => cat.id === 'academic_education');
  const academicItems = academicGroup ? academicGroup.items : [];

  const startAcademicQuiz = (item: any) => {
    setSelectedAcademicItem(item);
    setActiveGame('academic_quiz' as any);
    setAcademicQuizActive(true);
    setAcademicQuestionsAnswered(0);
    setAcademicScore(0);
    loadNextAcademicQuestion(item.id, 0);
  };

  const loadNextAcademicQuestion = (specId: string, index: number) => {
    const q = generateQuestionForSpecialization(specId, index);
    setAcademicQuestion(q);
    setAcademicTimer(15);
    setAcademicTimerActive(true);
    setAcademicAnswered(false);
    setAcademicSelectedOption(null);
  };

  const handleAcademicOptionSelect = (option: string) => {
    if (academicAnswered) return;
    setAcademicSelectedOption(option);
    setAcademicAnswered(true);
    setAcademicTimerActive(false);

    const isCorrect = option === (isAr ? academicQuestion.answerAr : academicQuestion.answerEn);
    if (isCorrect) {
      setAcademicScore(prev => prev + 1);
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch {}
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch {}
    }

    setAcademicQuestionsAnswered(prev => prev + 1);
  };

  const finishAcademicQuiz = () => {
    const pointsAwarded = 1000;
    const sourceAr = `تحدي تخصص ${selectedAcademicItem.nameAr}`;
    const sourceEn = `${selectedAcademicItem.nameEn} Specialization Challenge`;
    
    awardPoints(pointsAwarded, sourceAr, sourceEn);
    triggerToast(
      isAr 
        ? `🎉 مبارك! أكملت تحدي التخصص وحصلت على +${pointsAwarded} نقطة!` 
        : `🎉 Congratulations! Completed the specialization challenge and earned +${pointsAwarded} pts!`,
      'success'
    );
    
    setActiveGame('lobby');
    setAcademicQuizActive(false);
    setSelectedAcademicItem(null);
  };

  // Countdown Timer for Academic Quiz
  useEffect(() => {
    let interval: any = null;
    if (academicQuizActive && academicTimerActive && academicTimer > 0) {
      interval = setInterval(() => {
        setAcademicTimer(prev => prev - 1);
      }, 1000);
    } else if (academicTimer === 0 && !academicAnswered && academicQuizActive) {
      setAcademicAnswered(true);
      setAcademicQuestionsAnswered(prev => prev + 1);
      triggerToast(isAr ? '⏱️ انتهى وقت السؤال!' : '⏱️ Question timer expired!', 'info');
    }
    return () => clearInterval(interval);
  }, [academicQuizActive, academicTimerActive, academicTimer, academicAnswered]);

  // Find the games platform points
  const gamesPlatform = platforms.find(p => p.id === 'cash_games');
  const totalGamesPoints = gamesPlatform ? gamesPlatform.points : 0;

  // Active Game Mode Tab
  const [activeGame, setActiveGame] = useState<'lobby' | 'daily' | 'wheel' | 'quiz' | 'memory' | 'marble' | 'brick' | 'flappy' | 'miner' | 'merge' | 'builder' | 'ludo' | 'tictactoe' | 'snake' | 'rps' | 'whack' | 'wordguess' | 'academic_quiz'>('lobby');

  // Sparkly win animation overlays
  const [lastAwarded, setLastAwarded] = useState<{
    id: number;
    points: number;
    sourceAr: string;
    sourceEn: string;
  } | null>(null);

  const [particles, setParticles] = useState<{
    id: number;
    x: number;
    y: number;
    delay: number;
  }[]>([]);

  // Automatic cleanup of the win celebration banner
  useEffect(() => {
    if (lastAwarded) {
      const timer = setTimeout(() => {
        setLastAwarded(null);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [lastAwarded]);

  // Trigger game play task completion
  useEffect(() => {
    if (activeGame !== 'lobby') {
      onGamePlayed?.();
    }
  }, [activeGame, onGamePlayed]);


  // Helper to add points to the user's Cash.ai Play & Earn account with rewarding animations and audio
  const awardPoints = (points: number, sourceNameAr: string, sourceNameEn: string) => {
    // 1. Play satisfactory coin synth sound
    playCoinSound(points >= 500);

    // 2. Explode visual high-fidelity confetti
    try {
      if (points >= 500) {
        // Massive double side explosion for major victories
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.65 }
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.65 }
        });
      } else {
        // Cheerful concentrated center pop for normal rewards
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    } catch (confettiErr) {
      console.warn("Confetti ignored:", confettiErr);
    }

    // 3. Set visual animation banner modal
    setLastAwarded({
      id: Math.random(),
      points,
      sourceAr: sourceNameAr,
      sourceEn: sourceNameEn
    });

    // 4. Generate dispersion of golden coin particles
    const particleCount = Math.min(12, Math.max(6, Math.floor(points / 30)));
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: Math.random(),
      x: 35 + Math.random() * 30, // dispersal 35% to 65% width
      y: 45 + Math.random() * 15, // dispersal 45% to 60% height
      delay: i * 0.06
    }));
    setParticles(newParticles);

    // Clean up particles
    setTimeout(() => {
      setParticles([]);
    }, 2000);

    setTimeout(() => {
      setPlatforms(prev => prev.map(p => {
        if (p.id === 'cash_games') {
          return {
            ...p,
            points: p.points + points,
            lastSynced: isAr ? 'الآن' : 'Just Now'
          };
        }
        return p;
      }));

      // Add a points conversion transaction
      const newTx: Transaction = {
        id: 'tx_game_' + Math.floor(Math.random() * 90000 + 10000),
        type: 'sync',
        platformId: 'cash_games',
        platformName: `Arcade: ${sourceNameEn}`,
        platformNameAr: `الألعاب: ${sourceNameAr}`,
        points: points,
        amount: 0,
        currency: selectedCountry.currencyCode as any,
        status: 'success',
        date: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
    }, 0);
  };

  // ==========================================
  // GAME 1: DAILY REWARD CHECK-IN
  // ==========================================
  const [claimedDays, setClaimedDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('cash_ai_claimed_days');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(() => {
    return localStorage.getItem('cash_ai_last_claim_date');
  });

  const dailyRewards = [150, 300, 450, 600, 800, 1000, 1500];

  const todayStr = new Date().toDateString();
  const canClaimToday = lastClaimDate !== todayStr;
  const currentStreak = claimedDays.length % 7;

  const handleClaimDaily = () => {
    if (!canClaimToday) {
      triggerToast(
        isAr 
          ? 'لقد استلمت جائزتك اليومية بالفعل! عد غداً لمكافأة أكبر 🎁' 
          : 'You already claimed your reward today! Come back tomorrow 🎁', 
        'info'
      );
      return;
    }

    const claimIndex = currentStreak; // 0 to 6
    const prize = dailyRewards[claimIndex];

    const updatedClaimed = [...claimedDays, claimIndex + 1];
    setClaimedDays(updatedClaimed);
    setLastClaimDate(todayStr);
    localStorage.setItem('cash_ai_claimed_days', JSON.stringify(updatedClaimed));
    localStorage.setItem('cash_ai_last_claim_date', todayStr);

    awardPoints(prize, 'المكافأة اليومية المتتالية', 'Daily Streak Reward');
    triggerToast(
      isAr 
        ? `🎉 تم استلام مكافأة اليوم! تمت إضافة +${prize.toLocaleString()} نقطة.` 
        : `🎉 Reward claimed! Added +${prize.toLocaleString()} points.`, 
      'success'
    );
  };

  // ==========================================
  // GAME 2: SPIN THE LUCKY WHEEL
  // ==========================================
  const wheelSectors = [
    { points: 100, labelAr: '١٠٠ نقطة', labelEn: '100 Pts', color: '#6366f1' },
    { points: 500, labelAr: '٥٠٠ نقطة', labelEn: '500 Pts', color: '#f59e0b' },
    { points: 250, labelAr: '٢٥٠ نقطة', labelEn: '250 Pts', color: '#10b981' },
    { points: 0, labelAr: 'حظ أوفر', labelEn: 'Try Again', color: '#ef4444' },
    { points: 1000, labelAr: '١٠٠٠ نقطة', labelEn: '1000 Pts', color: '#a855f7' },
    { points: 50, labelAr: '٥٠ نقطة', labelEn: '50 Pts', color: '#ec4899' },
  ];

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [wheelCooldown, setWheelCooldown] = useState<number>(0);
  const [spinResult, setSpinResult] = useState<{ points: number; label: string } | null>(null);

  // Cooldown effect
  useEffect(() => {
    if (wheelCooldown > 0) {
      const timer = setTimeout(() => setWheelCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [wheelCooldown]);

  const handleSpinWheel = () => {
    if (isSpinning) return;
    if (wheelCooldown > 0) {
      triggerToast(
        isAr 
          ? `يرجى الانتظار ${wheelCooldown} ثانية لشحن العجلة مجدداً ⚡` 
          : `Please wait ${wheelCooldown}s to recharge the wheel ⚡`, 
        'info'
      );
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);

    // Pick a random sector
    const sectorIndex = Math.floor(Math.random() * wheelSectors.length);
    const selectedSector = wheelSectors[sectorIndex];

    // Determine final rotation angle
    // Each sector is 60 degrees. Let's calculate exact alignment.
    // 360 / 6 = 60 degrees per sector.
    // Index 0 starts at 0 to 60, Index 1 at 60 to 120, etc.
    // To land exactly in center of sector: index * 60 + 30 degrees.
    // Pointer is at the top (90 degrees or 270 degrees depending on offset). Let's do random full rotations + sector target.
    const fullSpins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
    const sectorAngle = 360 - (sectorIndex * 60) - 30; // Inverse rotation for top pointer landing
    const targetRotation = (fullSpins * 360) + sectorAngle;

    setSpinRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWheelCooldown(15); // 15 seconds cooldown for fun fast engagement

      const prizePoints = selectedSector.points;
      if (prizePoints > 0) {
        awardPoints(prizePoints, 'عجلة الحظ اليومية', 'Daily Lucky Spin');
        setSpinResult({
          points: prizePoints,
          label: isAr ? `رائع! لقد ربحت +${prizePoints} نقطة` : `Awesome! You won +${prizePoints} points!`
        });
        triggerToast(
          isAr 
            ? `🎁 ربحت ${prizePoints} نقطة من عجلة الحظ!` 
            : `🎁 You won ${prizePoints} points from the lucky spin!`, 
          'success'
        );
      } else {
        setSpinResult({
          points: 0,
          label: isAr ? 'حظ أوفر المرة القادمة! حاول مجدداً بعد ١٥ ثانية' : 'Better luck next time! Try again in 15 seconds'
        });
        triggerToast(
          isAr ? 'حظ أوفر المرة القادمة! 🍀' : 'Better luck next time! 🍀', 
          'info'
        );
      }
    }, 4000); // 4-second spin animation duration
  };


  // ==========================================
  // GAME 3: RAPID IQ MATH / TRIVIA CHALLENGE
  // ==========================================
  const [quizActive, setQuizActive] = useState(false);
  const [question, setQuestion] = useState({ query: '', options: [0, 0, 0, 0], answer: 0 });
  const [quizTimer, setQuizTimer] = useState(15);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Quiz timer
  useEffect(() => {
    let interval: any;
    if (quizActive && quizTimer > 0 && !isAnswered) {
      interval = setInterval(() => {
        setQuizTimer(prev => prev - 1);
      }, 1000);
    } else if (quizTimer === 0 && quizActive && !isAnswered) {
      // Time up
      handleOptionSelect(null);
    }
    return () => clearInterval(interval);
  }, [quizActive, quizTimer, isAnswered]);

  const generateQuestion = () => {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1 = 0;
    let num2 = 0;
    let ans = 0;

    if (op === '+') {
      num1 = Math.floor(Math.random() * 80 + 10);
      num2 = Math.floor(Math.random() * 80 + 10);
      ans = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 80 + 20);
      num2 = Math.floor(Math.random() * (num1 - 10) + 5);
      ans = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 11 + 2);
      num2 = Math.floor(Math.random() * 12 + 2);
      ans = num1 * num2;
    }

    // Generate 3 random fake options near the correct answer
    const optionsSet = new Set<number>();
    optionsSet.add(ans);
    while (optionsSet.size < 4) {
      const offset = Math.floor(Math.random() * 15) - 7;
      const fake = ans + (offset === 0 ? 3 : offset);
      if (fake > 0) {
        optionsSet.add(fake);
      }
    }

    const optionsArray = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    setQuestion({
      query: `${num1} ${op === '*' ? '×' : op} ${num2} = ?`,
      options: optionsArray,
      answer: ans
    });
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizTimer(15);
  };

  const startQuizGame = () => {
    setQuizActive(true);
    setScore(0);
    generateQuestion();
  };

  const handleOptionSelect = (opt: number | null) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === question.answer) {
      setScore(prev => prev + 1);
      awardPoints(100, 'سؤال التحدي السريع', 'IQ Math Challenge');
      triggerToast(
        isAr ? '✅ إجابة صحيحة مذهلة! حصلت على +١٠٠ نقطة' : '✅ Correct answer! Awarded +100 Points', 
        'success'
      );
    } else {
      triggerToast(
        isAr ? '❌ إجابة خاطئة! حظاً أوفر في السؤال التالي' : '❌ Wrong answer! Try better next time', 
        'info'
      );
    }
  };

  const stopQuizGame = () => {
    setQuizActive(false);
  };


  // ==========================================
  // GAME 4: MEMORY MATCH CARD GAME
  // ==========================================
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryVictory, setMemoryVictory] = useState(false);

  const cardIcons = ['coins', 'gem', 'gift', 'trophy', 'sparkles', 'crown'] as const;

  const initMemoryGame = () => {
    // Create pairs and shuffle
    const paired = [...cardIcons, ...cardIcons].map((icon, index) => ({
      id: index,
      iconName: icon,
      isFlipped: false,
      isMatched: false
    }));

    // Shuffle
    const shuffled = paired.sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setSelectedCards([]);
    setMemoryMoves(0);
    setMemoryVictory(false);
  };

  useEffect(() => {
    if (activeGame === 'memory' && memoryCards.length === 0) {
      initMemoryGame();
    }
  }, [activeGame]);

  const handleCardClick = (id: number) => {
    if (memoryVictory || selectedCards.length >= 2) return;
    
    const cardIndex = memoryCards.findIndex(c => c.id === id);
    if (memoryCards[cardIndex].isFlipped || memoryCards[cardIndex].isMatched) return;

    // Flip card
    const updated = [...memoryCards];
    updated[cardIndex].isFlipped = true;
    setMemoryCards(updated);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [firstId, secondId] = newSelected;
      const card1 = memoryCards.find(c => c.id === firstId)!;
      const card2 = memoryCards.find(c => c.id === secondId)!;

      if (card1.iconName === card2.iconName) {
        // Matched
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => {
            if (c.id === firstId || c.id === secondId) {
              return { ...c, isMatched: true };
            }
            return c;
          }));
          setSelectedCards([]);

          // Check for victory
          setMemoryCards(current => {
            const allMatched = current.every(c => c.isMatched || c.id === firstId || c.id === secondId);
            if (allMatched) {
              setMemoryVictory(true);
              awardPoints(600, 'لعبة بطاقات الذاكرة', 'Memory Match Master');
              triggerToast(
                isAr 
                  ? '🏆 مبروك! فزت بلعبة الذاكرة وحصلت على +٦٠٠ نقطة!' 
                  : '🏆 Victory! Solved memory card match and earned +600 points!', 
                'success'
              );
            }
            return current;
          });
        }, 600);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => {
            if (c.id === firstId || c.id === secondId) {
              return { ...c, isFlipped: false };
            }
            return c;
          }));
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // Helper to render lucide icon based on name
  const renderCardIcon = (name: string, className: string = "w-8 h-8") => {
    switch (name) {
      case 'coins': return <Coins className={`${className} text-amber-500`} />;
      case 'gem': return <Gem className={`${className} text-cyan-500`} />;
      case 'gift': return <Gift className={`${className} text-rose-500`} />;
      case 'trophy': return <Trophy className={`${className} text-yellow-500`} />;
      case 'sparkles': return <Sparkles className={`${className} text-indigo-500`} />;
      case 'crown': return <Crown className={`${className} text-purple-500`} />;
      default: return <HelpCircle className={`${className} text-slate-400`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Arcade Stats Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-950 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600/30 p-2 rounded-lg border border-indigo-500/20">
                <Gamepad2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">
                {isAr ? 'صالة الألعاب والمكافآت المباشرة 🎮' : 'Arcade Arena & Play rewards 🎮'}
              </h1>
            </div>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {isAr 
                ? 'العب الألعاب المصغرة التفاعلية، واجمع النقاط، ثم حولها في ثوانٍ إلى رصيد كاش حقيقي جاهز للسحب الفوري!'
                : 'Play interactive mini games, farm reward points, and instantly cash them out into real money!'}
            </p>
          </div>

          <div className="bg-indigo-950/80 border border-indigo-800/40 p-4 rounded-xl flex items-center gap-4 self-start md:self-auto shadow-inner">
            <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {isAr ? 'نقاط الألعاب والآركيد المتوفرة:' : 'Play & Earn Arcade Points:'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                  {totalGamesPoints.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {isAr ? 'نقطة' : 'pts'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation for Game Types (Slim back bar and quick switch) */}
      {activeGame !== 'lobby' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/85 shadow-xs">
          <button
            onClick={() => { 
              setActiveGame('lobby'); 
              setAcademicQuizActive(false); 
              setSelectedAcademicItem(null); 
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all self-start"
          >
            <span>{isAr ? '← العودة لقاعة الألعاب' : '← Back to Arcade Lobby'}</span>
          </button>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              {isAr ? 'التبديل السريع للألعاب:' : 'Quick Switch:'}
            </span>
            {academicItems.map((item) => {
              const isActive = selectedAcademicItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    startAcademicQuiz(item);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-850'
                  }`}
                >
                  {isAr ? item.nameAr : item.nameEn}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Game Interface Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* GAME LOBBY SELECTION SCREEN */}
          {activeGame === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'الألعاب الأكاديمية والتخصصية الكبرى 🎓' : 'Academic & Specialization Grand Arcade 🎓'}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {isAr ? 'أجب على الأسئلة واكسب ١٠٠٠ نقطة مباشرة! 🧠' : 'Answer Questions & Earn 1000 Points Instantly! 🧠'}
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  {isAr 
                    ? 'اختر اختصاصك الدراسي المفضل واجتز تحدي الـ 1000 سؤال تخصصي للحصول على نقاط كاش المتكاملة فوراً!'
                    : 'Select your preferred academic specialty and clear the 1000 specialized questions challenge to claim points!'}
                </p>
              </div>

              {/* Layout Switcher Tabs */}
              <div className="flex justify-center pb-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 shadow-xs">
                  <button
                    onClick={() => setLobbyViewMode('3d')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      lobbyViewMode === '3d'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <span>🎮</span>
                    <span>{isAr ? 'صالة الألعاب الـ ٣D' : '3D Game Arcade'}</span>
                  </button>
                  <button
                    onClick={() => setLobbyViewMode('grid')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      lobbyViewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <span>📋</span>
                    <span>{isAr ? 'الشبكة الكلاسيكية' : 'Classic Flat Grid'}</span>
                  </button>
                </div>
              </div>

              {lobbyViewMode === '3d' ? (
                <div className="pt-2">
                  <ThreeDGameArcade
                    items={academicItems}
                    onSelect={startAcademicQuiz}
                    isAr={isAr}
                    getAcademicGameIcon={getAcademicGameIcon}
                    getAcademicGameColor={getAcademicGameColor}
                  />
                </div>
              ) : (
                /* Bento Grid layout for Academic Games */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {academicItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => startAcademicQuiz(item)}
                      className={`group text-right flex flex-col justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] ${getAcademicGameColor(item.id)}`}
                    >
                      <div className="space-y-3 w-full">
                        <div className="flex justify-between items-center w-full">
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800">
                            {getAcademicGameIcon(item.id)}
                          </div>
                          <span className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            {isAr ? '+١٠٠٠ نقطة 🏆' : '+1000 Pts 🏆'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                            {isAr ? `لعبة ${item.nameAr} (١٠٠٠ سؤال)` : `${item.nameEn} Game (1000 Questions)`}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-justify">
                            {isAr 
                              ? `تحدي تفاعلي ذكي يحتوي على ١٠٠٠ سؤال ضمن اختصاص ${item.nameAr} لترقية قدراتك وزيادة رصيدك بـ ١٠٠٠ نقطة كاملة عند النجاح!`
                              : `An interactive intelligence challenge containing 1000 questions in ${item.nameEn} to sharpen your skills and earn 1000 points!`}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center w-full pt-3 mt-2 border-t border-slate-100/50 dark:border-slate-800/40">
                        <span className="text-[10px] font-bold text-slate-400">
                          {isAr ? 'القسم الحصري:' : 'Category:'}{' '}
                          <span className="text-slate-700 dark:text-slate-300 font-extrabold">
                            {isAr ? 'أكاديمي' : 'Academic'}
                          </span>
                        </span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <span>{isAr ? 'ابدأ اللعبة 🎮' : 'Start Playing 🎮'}</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ACADEMIC QUIZ GAME PLAYING SCREEN */}
          {activeGame === 'academic_quiz' && selectedAcademicItem && academicQuestion && (
            <motion.div
              key="academic_quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 text-right"
            >
              {/* Quiz Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
                    {getAcademicGameIcon(selectedAcademicItem.id)}
                  </div>
                  <div className="text-right">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {isAr ? `لعبة ${selectedAcademicItem.nameAr}` : `${selectedAcademicItem.nameEn} Quiz`}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'تحدي تخصصي كلاسيكي' : 'Classic Field Challenge'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Timer */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-lg text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                    <Timer className="w-3.5 h-3.5 animate-pulse" />
                    <span>{academicTimer}s</span>
                  </div>

                  {/* Question Counter */}
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-100/60 dark:border-indigo-900/30">
                    {isAr 
                      ? `السؤال ${academicQuestionsAnswered + 1} من ١٠٠٠` 
                      : `Question ${academicQuestionsAnswered + 1} of 1000`}
                  </div>

                  {/* Score */}
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-100/60 dark:border-emerald-900/30">
                    {isAr ? `النقاط: ${academicScore}/10` : `Correct: ${academicScore}/10`}
                  </div>
                </div>
              </div>

              {/* Quiz Body */}
              {academicQuestionsAnswered < 10 ? (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 transition-all duration-300"
                      style={{ width: `${((academicQuestionsAnswered) / 10) * 100}%` }}
                    />
                  </div>

                  {/* Question Title */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850/80 text-center space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-extrabold">
                      {isAr ? 'سؤال التخصص' : 'Specialization Trivia'}
                    </p>
                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-relaxed text-center">
                      {isAr ? academicQuestion.queryAr : academicQuestion.queryEn}
                    </h4>
                  </div>

                  {/* Answer Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(isAr ? academicQuestion.optionsAr : academicQuestion.optionsEn).map((opt: string) => {
                      const isSelected = academicSelectedOption === opt;
                      const correctAns = isAr ? academicQuestion.answerAr : academicQuestion.answerEn;
                      const isOptionCorrect = opt === correctAns;
                      
                      let optionStyle = "border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200";
                      
                      if (academicAnswered) {
                        if (isOptionCorrect) {
                          optionStyle = "bg-emerald-500/10 border-emerald-500 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400";
                        } else if (isSelected) {
                          optionStyle = "bg-rose-500/10 border-rose-500 dark:border-rose-600 text-rose-700 dark:text-rose-400";
                        } else {
                          optionStyle = "border-slate-100 dark:border-slate-850 bg-white/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={academicAnswered}
                          onClick={() => handleAcademicOptionSelect(opt)}
                          className={`w-full p-4 rounded-xl border text-right font-extrabold text-sm transition-all flex items-center justify-between ${
                            !academicAnswered ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''
                          } ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {academicAnswered && isOptionCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                          {academicAnswered && isSelected && !isOptionCorrect && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Question action */}
                  {academicAnswered && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => loadNextAcademicQuestion(selectedAcademicItem.id, academicQuestionsAnswered)}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-2"
                      >
                        <span>{isAr ? 'السؤال التالي ←' : 'Next Question ←'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Round Completion Screen */
                <div className="text-center space-y-6 py-6">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/30 shadow-sm animate-bounce">
                    <Trophy className="w-10 h-10" />
                  </div>

                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {isAr ? 'أحسنت! لقد أكملت الجولة الأكاديمية بنجاح 🎉' : 'Awesome! You completed the academic round! 🎉'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isAr 
                        ? `لقد أجبت بشكل صحيح على ${academicScore} من أصل 10 أسئلة تخصصية!` 
                        : `You answered ${academicScore} out of 10 specialized questions correctly!`}
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'المكافأة المكتسبة' : 'Earned Reward'}</span>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+1,000</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{isAr ? 'نقاط كاش حقيقية فورية' : 'Instant Real Cash Points'}</p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={finishAcademicQuiz}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl cursor-pointer shadow-md transition-all"
                    >
                      {isAr ? 'استلام المكافأة والعودة 🏆' : 'Claim Reward & Return 🏆'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* GAME 1: DAILY CHECK-IN SCREEN */}
          {activeGame === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/40">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'سجل حضورك اليومي واكسب نقاطاً مضاعفة!' : 'Daily Check-In Streak'}
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {isAr 
                    ? 'عد كل يوم على التوالي لشحن نقاطك! انقطاع الحضور يعيد الحساب لليوم الأول.' 
                    : 'Log in daily to claim bigger multipliers! Skipping a day resets your streak.'}
                </p>
              </div>

              {/* 7-Days Calendar List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {dailyRewards.map((reward, idx) => {
                  const dayNum = idx + 1;
                  const isClaimed = claimedDays.includes(dayNum);
                  const isCurrent = currentStreak === idx && canClaimToday;

                  return (
                    <div 
                      key={dayNum} 
                      className={`relative rounded-2xl p-4 border text-center transition-all flex flex-col justify-between items-center ${
                        isClaimed 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : isCurrent
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-white ring-2 ring-indigo-500/20 animate-pulse'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-2">
                        {isAr ? `اليوم ${dayNum}` : `Day ${dayNum}`}
                      </span>

                      <div className="mb-3">
                        {isClaimed ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <Coins className={`w-8 h-8 mx-auto ${isCurrent ? 'text-indigo-500 animate-spin-slow' : 'text-slate-300 dark:text-slate-700'}`} />
                        )}
                      </div>

                      <span className="text-sm font-black font-mono tracking-tight">
                        +{reward}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 text-center">
                <button
                  onClick={handleClaimDaily}
                  disabled={!canClaimToday}
                  className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer ${
                    canClaimToday
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-200 dark:shadow-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Gift className="w-5 h-5" />
                  <span>
                    {canClaimToday 
                      ? (isAr ? 'استلم هدية اليوم النقاطية 🎁' : 'Claim Today\'s Reward 🎁')
                      : (isAr ? 'مكافأة اليوم مستلمة بنجاح ✅' : 'Today\'s Reward Claimed ✅')}
                  </span>
                </button>
                {!canClaimToday && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
                    {isAr ? '💡 يتم إعادة تنشيط المكافأة بعد منتصف الليل تلقائيًا' : '💡 Your next check-in is recharged automatically after midnight'}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* GAME 2: SPIN THE LUCKY WHEEL SCREEN */}
          {activeGame === 'wheel' && (
            <motion.div
              key="wheel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'أدر عجلة الحظ الكبرى 🎡' : 'Spin the Lucky Wheel 🎡'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'جرب حظك كل ١٥ ثانية لتربح ما يصل إلى ١,٠٠٠ نقطة مجانية!' 
                    : 'Spin once every 15 seconds to win up to 1,000 points instantly!'}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-6 md:space-y-0 md:flex-row md:gap-12 py-4">
                {/* Visual Spinning Wheel */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none">
                  {/* Outer glowing border ring */}
                  <div className="absolute inset-0 rounded-full border-8 border-indigo-900/10 dark:border-indigo-500/10 shadow-lg pointer-events-none animate-pulse"></div>

                  {/* Top Pointer */}
                  <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                    <div className="w-6 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-b-xl shadow-md border-2 border-white dark:border-slate-900 relative">
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                  </div>

                  {/* Wheel container rotates */}
                  <div 
                    style={{ 
                      transform: `rotate(${spinRotation}deg)`,
                      transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.35, 1)' : 'none'
                    }}
                    className="w-full h-full rounded-full border-4 border-slate-900 dark:border-slate-800 overflow-hidden relative shadow-2xl bg-slate-900"
                  >
                    {/* SVG Drawn Pie Segments */}
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {wheelSectors.map((sector, idx) => {
                        const startAngle = idx * 60;
                        const endAngle = (idx + 1) * 60;
                        
                        // Path calculations for standard 60deg slices
                        const rad = Math.PI / 180;
                        const x1 = 50 + 50 * Math.cos(startAngle * rad);
                        const y1 = 50 + 50 * Math.sin(startAngle * rad);
                        const x2 = 50 + 50 * Math.cos(endAngle * rad);
                        const y2 = 50 + 50 * Math.sin(endAngle * rad);

                        return (
                          <g key={idx}>
                            <path 
                              d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                              fill={sector.color}
                              stroke="#ffffff"
                              strokeWidth="0.5"
                              className="opacity-90 hover:opacity-100 transition-opacity"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Overlay Texts on Sector Wedges */}
                    {wheelSectors.map((sector, idx) => {
                      // Text rotation calculation to center them in slices
                      const rotateText = idx * 60 + 30;
                      return (
                        <div 
                          key={idx}
                          style={{
                            transform: `translate(-50%, -50%) rotate(${rotateText}deg) translateY(-85px)`,
                            transformOrigin: '0% 0%',
                            left: '50%',
                            top: '50%'
                          }}
                          className="absolute text-[10px] sm:text-xs font-black text-white font-mono select-none pointer-events-none whitespace-nowrap text-center drop-shadow-md"
                        >
                          {isAr ? sector.labelAr : sector.labelEn}
                        </div>
                      );
                    })}

                    {/* Core Gold Center Badge */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-amber-400 text-slate-900 rounded-full border-4 border-slate-900 dark:border-slate-800 shadow-md flex items-center justify-center font-bold font-mono text-sm">
                      ARCADE
                    </div>
                  </div>
                </div>

                {/* Controls and Stats */}
                <div className="flex-1 space-y-4 text-center md:text-right max-w-sm">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {isAr ? '💡 قواعد اللعبة بسيطة' : '💡 Simple Rules'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {isAr
                        ? 'انقر على "أدر العجلة" لبدء اللعب. سيتم إضافة رصيد النقاط تلقائيًا لحسابك وسجل المعاملات فوريًا.'
                        : 'Tap SPIN to test your luck. Your earnings will be automatically credited to your balance and receipts.'}
                    </p>
                  </div>

                  {/* Displaying Last Spin Result */}
                  {spinResult && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-3 rounded-xl border font-bold text-sm ${
                        spinResult.points > 0 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {spinResult.label}
                    </motion.div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={handleSpinWheel}
                      disabled={isSpinning || wheelCooldown > 0}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        isSpinning
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                          : wheelCooldown > 0
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
                      }`}
                    >
                      <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                      <span>
                        {isSpinning 
                          ? (isAr ? 'جاري دوران العجلة...' : 'Wheel spinning...')
                          : wheelCooldown > 0
                            ? (isAr ? `إعادة الشحن خلال (${wheelCooldown}ث)` : `Recharging (${wheelCooldown}s)`)
                            : (isAr ? 'أدر العجلة الآن ⚡' : 'SPIN THE WHEEL ⚡')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* GAME 3: RAPID IQ MATH QUIZ CHALLENGE */}
          {activeGame === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {!quizActive ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/40">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تحدي الحساب الذهني السريع 🧠' : 'Rapid Mental Math IQ Arena 🧠'}
                    </h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {isAr 
                        ? 'أجب على الأسئلة الرياضية واللوغاريتمات الحسابية البسيطة لكسب +١٠٠ نقطة لكل إجابة صحيحة!' 
                        : 'Solve fast arithmetic puzzles to credit +100 Points for every single correct choice!'}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 max-w-sm mx-auto space-y-2 text-right">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 justify-center">
                      <Flame className="w-4 h-4 animate-pulse" />
                      <span>{isAr ? 'مضاعفات اللعب ومواصفات الآركيد' : 'Arcade specs'}</span>
                    </div>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-none text-center">
                      <li>• {isAr ? '⏱️ مؤقت السؤال: ١٥ ثانية فقط!' : '⏱️ Timer: 15s per query'}</li>
                      <li>• {isAr ? '💰 المكافأة: +١٠٠ نقطة فورية' : '💰 Prize: +100 Points instantly'}</li>
                      <li>• {isAr ? '⚙️ طريقة اللعب: اختيار من متعدد' : '⚙️ Gameplay: Multiple choice buttons'}</li>
                    </ul>
                  </div>

                  <button
                    onClick={startQuizGame}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-100 dark:shadow-none flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isAr ? 'ابدأ اللعب والربح الآن ⚡' : 'Start Play & Claim 100 Pts ⚡'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6 max-w-lg mx-auto">
                  {/* Active quiz HUD header */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 font-bold">
                    <div className="flex items-center gap-2">
                      <Timer className={`w-5 h-5 ${quizTimer < 5 ? 'text-red-500 animate-ping' : 'text-indigo-500'}`} />
                      <span className={`text-sm font-mono ${quizTimer < 5 ? 'text-red-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {isAr ? `الوقت المتبقي: ${quizTimer}ث` : `Time left: ${quizTimer}s`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {isAr ? `النقاط بالجولة: +${(score * 100).toLocaleString()}` : `Session Won: +${(score * 100).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Math Equation display */}
                  <div className="bg-gradient-to-b from-indigo-50/50 to-indigo-50/10 dark:from-indigo-950/10 dark:to-indigo-950/0 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-950 text-center space-y-2">
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest font-mono">
                      {isAr ? 'سؤال التحدي الحسابي' : 'EQUATION CHALLENGE'}
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight animate-pulse">
                      {question.query}
                    </h3>
                  </div>

                  {/* Options Selector Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {question.options.map((opt, idx) => {
                      const isCorrect = opt === question.answer;
                      const isSelected = selectedOption === opt;
                      
                      let btnStyle = "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800";
                      
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500 text-white border-rose-600 shadow-sm";
                        } else {
                          btnStyle = "bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-transparent cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleOptionSelect(opt)}
                          className={`py-4 rounded-xl border text-center font-mono font-bold text-lg transition-all cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Move Next Question or Quit Controls */}
                  {isAnswered && (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={generateQuestion}
                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-xs cursor-pointer flex-1"
                      >
                        {isAr ? 'السؤال التالي ➡️' : 'Next Question ➡️'}
                      </button>
                      <button
                        onClick={stopQuizGame}
                        className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm cursor-pointer"
                      >
                        {isAr ? 'إنهاء وحفظ الرصيد' : 'Quit and Save'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* GAME 4: MEMORY CARDS MATCH */}
          {activeGame === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'لعبة مطابقة بطاقات الذاكرة 🧠' : 'Memory Cards Match Game 🧠'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr 
                    ? 'طابق كل زوجين من الأشكال والبطاقات للفوز بالجائزة الكبرى بقيمة +٦٠٠ نقطة!' 
                    : 'Match all icon pairs to claim a grand prize of +600 Arcade Points!'}
                </p>
              </div>

              {/* Memory Game Board and Score HUD */}
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
                  <span>{isAr ? `الحركات: ${memoryMoves}` : `Moves: ${memoryMoves}`}</span>
                  <button 
                    onClick={initMemoryGame}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {isAr ? '🔄 إعادة اللعب' : '🔄 Restart Game'}
                  </button>
                </div>

                {memoryVictory ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-8 rounded-2xl text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 animate-bounce">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
                        {isAr ? '🎉 نصر مذهل ومطابقة خارقة!' : '🎉 Victory! Memory Match Completed'}
                      </h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">
                        {isAr 
                          ? `طابقت جميع البطاقات بنجاح خلال ${memoryMoves} حركة وحصلت على +٦٠٠ نقطة.` 
                          : `Successfully completed all card pairs in ${memoryMoves} moves to credit +600 Pts.`}
                      </p>
                    </div>
                    <button
                      onClick={initMemoryGame}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      {isAr ? 'العب جولة أخرى 🎮' : 'Play Another Round 🎮'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {memoryCards.map((card) => {
                      const isFlipped = card.isFlipped || card.isMatched;

                      return (
                        <div
                          key={card.id}
                          onClick={() => handleCardClick(card.id)}
                          className={`aspect-square w-full rounded-xl border text-center flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
                            isFlipped
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 transform rotate-y-180 scale-102 ring-1 ring-indigo-500/20 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {isFlipped ? (
                            <div className="animate-fade-in">
                              {renderCardIcon(card.iconName, "w-7 h-7 sm:w-8 sm:h-8")}
                            </div>
                          ) : (
                            <div className="text-indigo-400 font-black font-mono text-lg animate-pulse select-none">
                              ?
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* GAME 5: MARBLE CRUSH - MATCH MASTER SCREEN */}
          {activeGame === 'marble' && (
            <motion.div
              key="marble"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <MarbleCrushGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {/* GAME 6: BRICK BREAKER: COIN BUSTER */}
          {activeGame === 'brick' && (
            <motion.div
              key="brick"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <BrickBreakerGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 7: FLAPPY COIN: SKY ADVENTURE */}
          {activeGame === 'flappy' && (
            <motion.div
              key="flappy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <FlappyCoinGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 8: GOLD MINER: GOLD RUSH */}
          {activeGame === 'miner' && (
            <motion.div
              key="miner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <GoldMinerGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 9: MERGE CASH: 2048 WEALTH GRID */}
          {activeGame === 'merge' && (
            <motion.div
              key="merge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Wealth2048Game
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 10: TOWER STACK: RICH BUILDER */}
          {activeGame === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <TowerStackGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 11: ORIGINAL AUTHENTIC LUDO */}
          {activeGame === 'ludo' && (
            <motion.div
              key="ludo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <LudoGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 12: TIC-TAC-TOE */}
          {activeGame === 'tictactoe' && (
            <motion.div
              key="tictactoe"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <TicTacToeGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 13: SNAKE */}
          {activeGame === 'snake' && (
            <motion.div
              key="snake"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <SnakeGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 14: ROCK PAPER SCISSORS */}
          {activeGame === 'rps' && (
            <motion.div
              key="rps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <RPSGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 15: WHACK-A-MOLE */}
          {activeGame === 'whack' && (
            <motion.div
              key="whack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <WhackMoleGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {/* GAME 16: WORD GUESS */}
          {activeGame === 'wordguess' && (
            <motion.div
              key="wordguess"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <WordGuessGame
                lang={lang}
                selectedCountry={selectedCountry}
                awardPoints={awardPoints}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Conversion redirect notification */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h4 className="font-bold text-xs text-amber-900 dark:text-amber-400">
            {isAr ? 'كيف أقوم بسحب الأرباح وتحويلها؟' : 'How do I cash out my arcade points?'}
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">
            {isAr 
              ? `جميع نقاط الألعاب تُضاف فورياً لتبويب "العاب كاش.ai المباشرة". توجه إلى قسم "محول النقاط" بالتبويب الجانبي لتحويل نقاطك إلى ${selectedCountry.currencySymbol} ومن ثم سحب الكاش فوراً لمحفظتك!`
              : `All arcade points are loaded straight to your "Cash.ai Play & Earn" platform. Navigate to the "Points Converter" sidebar tab to convert them to ${selectedCountry.currencyCode} and withdraw straight into your mobile e-wallet!`}
          </p>
        </div>
      </div>

      {/* Floating Gold Coin Particles Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: `${p.x}vw`, y: `${p.y}vh`, scale: 0.2 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [`${p.y}vh`, `${p.y - 45}vh`],
                x: [`${p.x}vw`, `${p.x + (Math.random() * 24 - 12)}vw`],
                scale: [0.3, 1.4, 1.2, 0.4],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.8,
                delay: p.delay,
                ease: "easeOut"
              }}
              className="absolute text-2xl flex items-center justify-center filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.45)]"
            >
              🪙
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Point Celebration Banner Overlay */}
      <AnimatePresence>
        {lastAwarded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.6, y: 50, rotate: -5 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                rotate: 0,
                transition: { type: 'spring', damping: 12, stiffness: 150 }
              }}
              exit={{ 
                scale: 0.8, 
                y: -60, 
                opacity: 0,
                transition: { duration: 0.2 }
              }}
              className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-400/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden pointer-events-auto"
            >
              {/* Glow rays background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-indigo-500/10 pointer-events-none" />
              
              <div className="relative space-y-4">
                {/* Bouncing Gold Cup with Sparkles */}
                <div className="relative inline-flex">
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                    className="w-20 h-20 bg-gradient-to-b from-amber-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg border border-amber-200"
                  >
                    <Trophy className="w-10 h-10 text-white" />
                  </motion.div>
                  {/* Floating sparkly lights */}
                  <div className="absolute -top-2 -right-2 text-xl animate-ping">✨</div>
                  <div className="absolute -bottom-2 -left-2 text-xl animate-bounce">🪙</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 px-3 py-1 rounded-full uppercase">
                    {isAr ? lastAwarded.sourceAr : lastAwarded.sourceEn}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mt-2">
                    {isAr ? 'فوز رائع ومكافأة مباشرة! 🎉' : 'Awesome Victory! 🎉'}
                  </h3>
                </div>

                {/* Flying Huge Points Counter */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.8, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-300/30 rounded-2xl p-4 flex items-center justify-center gap-2"
                >
                  <Coins className="w-6 h-6 text-amber-500 animate-spin-slow" />
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300">
                    +{lastAwarded.points}
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {isAr ? 'نقطة' : 'PTS'}
                  </span>
                </motion.div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr 
                    ? 'تمت إضافة المكافأة الذهبية بنجاح إلى رصيد آركيد كاش الخاص بك! 🚀'
                    : 'The golden points have been successfully loaded to your Arcade Balance! 🚀'}
                </p>
                
                {/* Dismiss Button */}
                <button
                  onClick={() => setLastAwarded(null)}
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {isAr ? 'حسناً، رائع! ⚡' : 'Awesome, Got it! ⚡'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
