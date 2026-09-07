import React, { useState, useMemo } from 'react';
import {
  Award,
  Zap,
  Scale,
  Flame,
  Clock,
  Target,
  ShieldCheck,
  BrainCircuit,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Trophy,
  Medal,
  Star,
  Crown,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { UserStats, QuestionTopic } from '../types';

export type BadgeCategory = 'all' | 'questions' | 'streak' | 'exam' | 'mastery';

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'questions' | 'streak' | 'exam' | 'mastery';
  categoryLabel: string;
  description: string;
  criteria: string;
  icon: React.ElementType;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
    glow: string;
    accent: string;
  };
  isUnlocked: boolean;
  progress: number; // 0 - 100
  currentValue: number;
  targetValue: number;
  currentValueText: string;
  targetValueText: string;
  rewardTier: 'Bronz' | 'Gümüş' | 'Altın' | 'Elmas';
  xpPoints: number;
}

interface AchievementBadgesSectionProps {
  userStats: UserStats;
  onExploreTopic?: (topicKey?: QuestionTopic) => void;
  onStartExam?: () => void;
}

export const AchievementBadgesSection: React.FC<AchievementBadgesSectionProps> = ({
  userStats,
  onExploreTopic,
  onStartExam,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<BadgeCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeModalBadge, setActiveModalBadge] = useState<AchievementBadge | null>(null);

  // Compute all badges dynamically based on userStats
  const badges: AchievementBadge[] = useMemo(() => {
    const totalAns = userStats.totalAnswered || 0;
    const totalCor = userStats.totalCorrect || 0;
    const streak = userStats.streakDays || 1;
    const exams = userStats.examHistory || [];
    const passedExamsCount = exams.filter((e) => e.score >= 70 || e.passed).length;
    const accuracy = totalAns > 0 ? Math.round((totalCor / totalAns) * 100) : 0;

    // Topic masteries
    const lawMastery = userStats.topicMastery?.kanun_6331 || { correct: 0, total: 0 };
    const laborLawMastery = userStats.topicMastery?.is_hukuku || { correct: 0, total: 0 };
    const totalLawCorrect = lawMastery.correct + laborLawMastery.correct;

    const riskMastery = userStats.topicMastery?.risk_degerlendirmesi || { correct: 0, total: 0 };
    const favoriteCardsCount = userStats.favoriteCardIds?.length || 0;

    return [
      // ================= TOPLAM ÇÖZÜLEN SORU SAYISI ROZETLERİ =================
      {
        id: 'q-starter',
        title: 'İlk Adım',
        category: 'questions',
        categoryLabel: 'Soru Sayısı Hacmi',
        description: 'İSG sınav yolculuğunda soru bankasına adım atarak ilk 10 soruyu tamamlayan aday rozeti.',
        criteria: 'Toplamda en az 10 soru çöz.',
        icon: Target,
        colorScheme: {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-300',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          glow: 'from-emerald-500/20 to-teal-600/10',
          accent: 'bg-emerald-500',
        },
        isUnlocked: totalAns >= 10,
        progress: Math.min(100, Math.round((totalAns / 10) * 100)),
        currentValue: totalAns,
        targetValue: 10,
        currentValueText: `${totalAns} Soru Çözüldü`,
        targetValueText: '10 Soru',
        rewardTier: 'Bronz',
        xpPoints: 50,
      },
      {
        id: 'q-hunter',
        title: 'Soru Avcısı',
        category: 'questions',
        categoryLabel: 'Soru Sayısı Hacmi',
        description: 'Soru çözme alışkanlığını oturtarak 25 soru eşiğini başarıyla geride bırakan aday.',
        criteria: 'Toplamda en az 25 soru çöz.',
        icon: BookOpen,
        colorScheme: {
          bg: 'bg-teal-500/10',
          border: 'border-teal-500/30',
          text: 'text-teal-300',
          iconBg: 'bg-teal-500/20 text-teal-400',
          glow: 'from-teal-500/20 to-cyan-600/10',
          accent: 'bg-teal-500',
        },
        isUnlocked: totalAns >= 25,
        progress: Math.min(100, Math.round((totalAns / 25) * 100)),
        currentValue: totalAns,
        targetValue: 25,
        currentValueText: `${totalAns} Soru Çözüldü`,
        targetValueText: '25 Soru',
        rewardTier: 'Gümüş',
        xpPoints: 100,
      },
      {
        id: 'q-beast',
        title: 'Soru Canavarı',
        category: 'questions',
        categoryLabel: 'Soru Sayısı Hacmi',
        description: '50 soru barajını aşarak tam bir resmi ÖSYM sınavı hacminde soru deneyimine ulaşan aday.',
        criteria: 'Toplamda en az 50 soru çöz.',
        icon: Zap,
        colorScheme: {
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30',
          text: 'text-indigo-300',
          iconBg: 'bg-indigo-500/20 text-indigo-400',
          glow: 'from-indigo-500/20 to-violet-600/10',
          accent: 'bg-indigo-500',
        },
        isUnlocked: totalAns >= 50,
        progress: Math.min(100, Math.round((totalAns / 50) * 100)),
        currentValue: totalAns,
        targetValue: 50,
        currentValueText: `${totalAns} Soru Çözüldü`,
        targetValueText: '50 Soru',
        rewardTier: 'Altın',
        xpPoints: 200,
      },
      {
        id: 'q-master',
        title: 'Soru Üstadı',
        category: 'questions',
        categoryLabel: 'Soru Sayısı Hacmi',
        description: '100+ soru çözerek soru havuzundaki hemen hemen her varyasyonla karşılaşmış elit aday.',
        criteria: 'Toplamda en az 100 soru çöz.',
        icon: Crown,
        colorScheme: {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-300',
          iconBg: 'bg-purple-500/20 text-purple-400',
          glow: 'from-purple-500/20 to-fuchsia-600/10',
          accent: 'bg-purple-500',
        },
        isUnlocked: totalAns >= 100,
        progress: Math.min(100, Math.round((totalAns / 100) * 100)),
        currentValue: totalAns,
        targetValue: 100,
        currentValueText: `${totalAns} Soru Çözüldü`,
        targetValueText: '100 Soru',
        rewardTier: 'Elmas',
        xpPoints: 400,
      },

      // ================= GÜNLÜK ÇALIŞMA SERİSİ (STREAK) ROZETLERİ =================
      {
        id: 'streak-spark',
        title: 'İlk Kıvılcım',
        category: 'streak',
        categoryLabel: 'Çalışma Serisi (Streak)',
        description: 'Üst üste 3 gün aksatmadan sisteme giriş yapıp soru çözen kararlı adayın ilk ateş rozeti.',
        criteria: 'En az 3 günlük çalışma serisi yakala.',
        icon: Flame,
        colorScheme: {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-300',
          iconBg: 'bg-amber-500/20 text-amber-400',
          glow: 'from-amber-500/20 to-orange-600/10',
          accent: 'bg-amber-500',
        },
        isUnlocked: streak >= 3,
        progress: Math.min(100, Math.round((streak / 3) * 100)),
        currentValue: streak,
        targetValue: 3,
        currentValueText: `${streak} Günlük Seri`,
        targetValueText: '3 Gün',
        rewardTier: 'Bronz',
        xpPoints: 50,
      },
      {
        id: 'streak-flame',
        title: 'İstikrarlı Aday',
        category: 'streak',
        categoryLabel: 'Çalışma Serisi (Streak)',
        description: 'Tam 1 hafta (7 gün) boyunca her gün düzenli soru çözerek çalışma alışkanlığını kalıcı kılan aday.',
        criteria: 'En az 7 günlük kesintisiz çalışma serisine ulaş.',
        icon: Flame,
        colorScheme: {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-300',
          iconBg: 'bg-orange-500/20 text-orange-400',
          glow: 'from-orange-500/20 to-red-600/10',
          accent: 'bg-orange-500',
        },
        isUnlocked: streak >= 7,
        progress: Math.min(100, Math.round((streak / 7) * 100)),
        currentValue: streak,
        targetValue: 7,
        currentValueText: `${streak} Günlük Seri`,
        targetValueText: '7 Gün',
        rewardTier: 'Gümüş',
        xpPoints: 120,
      },
      {
        id: 'streak-iron',
        title: 'Demir Disiplin',
        category: 'streak',
        categoryLabel: 'Çalışma Serisi (Streak)',
        description: '14 gün aralıksız çalışan, ÖSYM hazırlık sürecini tam bir profesyonel disiplinle yöneten aday.',
        criteria: 'En az 14 günlük kesintisiz çalışma serisine ulaş.',
        icon: Trophy,
        colorScheme: {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-300',
          iconBg: 'bg-red-500/20 text-red-400',
          glow: 'from-red-500/20 to-amber-600/10',
          accent: 'bg-red-500',
        },
        isUnlocked: streak >= 14,
        progress: Math.min(100, Math.round((streak / 14) * 100)),
        currentValue: streak,
        targetValue: 14,
        currentValueText: `${streak} Günlük Seri`,
        targetValueText: '14 Gün',
        rewardTier: 'Altın',
        xpPoints: 250,
      },
      {
        id: 'streak-legend',
        title: 'Yenilmez Seri',
        category: 'streak',
        categoryLabel: 'Çalışma Serisi (Streak)',
        description: '30 günlük kesintisiz çalışma serisi ile sınavı kazanmayı garantileyen efsanevi motivasyon.',
        criteria: 'En az 30 günlük çalışma serisi tamamla.',
        icon: Crown,
        colorScheme: {
          bg: 'bg-amber-400/10',
          border: 'border-amber-400/40',
          text: 'text-amber-200',
          iconBg: 'bg-amber-400/20 text-amber-300',
          glow: 'from-amber-400/30 to-yellow-500/20',
          accent: 'bg-amber-400',
        },
        isUnlocked: streak >= 30,
        progress: Math.min(100, Math.round((streak / 30) * 100)),
        currentValue: streak,
        targetValue: 30,
        currentValueText: `${streak} Günlük Seri`,
        targetValueText: '30 Gün',
        rewardTier: 'Elmas',
        xpPoints: 500,
      },

      // ================= ÖSYM SINAV & DOĞRULUK ROZETLERİ =================
      {
        id: 'exam-conqueror',
        title: 'Baraj Fatihi',
        category: 'exam',
        categoryLabel: 'ÖSYM Deneme Başarısı',
        description: '50 soruluk resmi ÖSYM deneme sınavında 70 veya üzeri puan alarak geçme barajını aşan aday.',
        criteria: 'Resmi deneme sınavlarının en az birinde 70+ puan al.',
        icon: ShieldCheck,
        colorScheme: {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-300',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          glow: 'from-emerald-500/20 to-teal-600/10',
          accent: 'bg-emerald-500',
        },
        isUnlocked: passedExamsCount >= 1,
        progress: Math.min(100, Math.round((passedExamsCount / 1) * 100)),
        currentValue: passedExamsCount,
        targetValue: 1,
        currentValueText: `${passedExamsCount} Başarılı Deneme`,
        targetValueText: '1 Başarılı Deneme (70+)',
        rewardTier: 'Altın',
        xpPoints: 200,
      },
      {
        id: 'accuracy-sniper',
        title: 'Keskin Nişancı',
        category: 'exam',
        categoryLabel: 'Yüksek Doğruluk',
        description: 'En az 20 soru çözüp genel net oranını %80 ve üzerinde tutmayı başaran isabetli aday.',
        criteria: 'En az 20 soru çöz ve %80+ genel doğruluk oranına ulaş.',
        icon: Target,
        colorScheme: {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          text: 'text-cyan-300',
          iconBg: 'bg-cyan-500/20 text-cyan-400',
          glow: 'from-cyan-500/20 to-blue-600/10',
          accent: 'bg-cyan-500',
        },
        isUnlocked: totalAns >= 20 && accuracy >= 80,
        progress: totalAns < 20 ? Math.round((totalAns / 20) * 50) : Math.min(100, Math.round((accuracy / 80) * 100)),
        currentValue: accuracy,
        targetValue: 80,
        currentValueText: `%${accuracy} Doğruluk (${totalAns} Soru)`,
        targetValueText: '%80 Doğruluk',
        rewardTier: 'Gümüş',
        xpPoints: 150,
      },
      {
        id: 'speed-solver',
        title: 'Hızlı Çözücü',
        category: 'exam',
        categoryLabel: 'Hız & Zaman Yönetimi',
        description: 'ÖSYM standart 90 sn/soru süresinin çok altında yüksek hız ve doğrulukla çözen aday.',
        criteria: '25+ soruyu soru başına 75 saniyenin altında tempoyla çöz.',
        icon: Clock,
        colorScheme: {
          bg: 'bg-teal-500/10',
          border: 'border-teal-500/30',
          text: 'text-teal-300',
          iconBg: 'bg-teal-500/20 text-teal-400',
          glow: 'from-teal-500/20 to-emerald-600/10',
          accent: 'bg-teal-500',
        },
        isUnlocked: totalAns >= 25,
        progress: Math.min(100, Math.round((totalAns / 25) * 100)),
        currentValue: totalAns,
        targetValue: 25,
        currentValueText: `${totalAns} Hızlı Soru`,
        targetValueText: '25 Soru',
        rewardTier: 'Gümüş',
        xpPoints: 100,
      },

      // ================= MEVZUAT & SAHA UZMANLIK ROZETLERİ =================
      {
        id: 'law-expert',
        title: 'Mevzuat Uzmanı',
        category: 'mastery',
        categoryLabel: '6331 & İş Hukuku',
        description: '6331 sayılı İSG Kanunu ve 4857 sayılı İş Kanunu sorularında en az 5 doğruya ulaşan mevzuat piri.',
        criteria: 'Mevzuat ve İş Hukuku konularında en az 5 doğru yanıta ulaş.',
        icon: Scale,
        colorScheme: {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          iconBg: 'bg-blue-500/20 text-blue-400',
          glow: 'from-blue-500/20 to-indigo-600/10',
          accent: 'bg-blue-500',
        },
        isUnlocked: totalLawCorrect >= 5,
        progress: Math.min(100, Math.round((totalLawCorrect / 5) * 100)),
        currentValue: totalLawCorrect,
        targetValue: 5,
        currentValueText: `${totalLawCorrect} Mevzuat Doğrusu`,
        targetValueText: '5 Doğru',
        rewardTier: 'Altın',
        xpPoints: 180,
      },
      {
        id: 'risk-detective',
        title: 'Risk Dedektifi',
        category: 'mastery',
        categoryLabel: 'Risk Değerlendirmesi',
        description: 'Tehlike analizi, risk matrisleri ve önleme hiyerarşisi sorularında ustalaşan saha adayı.',
        criteria: 'Risk Değerlendirmesi konusunda en az 3 soruyu doğru yanıtla.',
        icon: BrainCircuit,
        colorScheme: {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-300',
          iconBg: 'bg-rose-500/20 text-rose-400',
          glow: 'from-rose-500/20 to-pink-600/10',
          accent: 'bg-rose-500',
        },
        isUnlocked: riskMastery.correct >= 3,
        progress: Math.min(100, Math.round((riskMastery.correct / 3) * 100)),
        currentValue: riskMastery.correct,
        targetValue: 3,
        currentValueText: `${riskMastery.correct} Risk Doğrusu`,
        targetValueText: '3 Doğru',
        rewardTier: 'Gümüş',
        xpPoints: 120,
      },
      {
        id: 'mnemonic-collector',
        title: 'Hap Bilgi Ustası',
        category: 'mastery',
        categoryLabel: 'Ezber & Kodlama',
        description: 'ÖSYM sayısal süreleri ve formüller içeren en az 3 hap bilgi kartını kütüphanesine kaydeden aday.',
        criteria: 'En az 3 adet Hap Bilgi kartını favorilerine ekle.',
        icon: Sparkles,
        colorScheme: {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-300',
          iconBg: 'bg-amber-500/20 text-amber-400',
          glow: 'from-amber-500/20 to-yellow-600/10',
          accent: 'bg-amber-500',
        },
        isUnlocked: favoriteCardsCount >= 3,
        progress: Math.min(100, Math.round((favoriteCardsCount / 3) * 100)),
        currentValue: favoriteCardsCount,
        targetValue: 3,
        currentValueText: `${favoriteCardsCount} Favori Kart`,
        targetValueText: '3 Kart',
        rewardTier: 'Bronz',
        xpPoints: 60,
      },
    ];
  }, [userStats]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      // Category filter
      if (selectedFilter !== 'all' && badge.category !== selectedFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'unlocked' && !badge.isUnlocked) {
        return false;
      }
      if (statusFilter === 'locked' && badge.isUnlocked) {
        return false;
      }
      return true;
    });
  }, [badges, selectedFilter, statusFilter]);

  // Overall Statistics
  const unlockedBadges = useMemo(() => badges.filter((b) => b.isUnlocked), [badges]);
  const lockedBadges = useMemo(() => badges.filter((b) => !b.isUnlocked), [badges]);
  const unlockedCount = unlockedBadges.length;
  const totalCount = badges.length;
  const overallBadgeRate = Math.round((unlockedCount / totalCount) * 100);

  // Total XP calculation
  const totalXP = useMemo(() => {
    return unlockedBadges.reduce((acc, b) => acc + b.xpPoints, 0);
  }, [unlockedBadges]);

  // Level computation
  const userLevelInfo = useMemo(() => {
    if (totalXP >= 800) {
      return { level: 5, title: 'Baş Denetçi / Otorite', badgeName: 'Elmas Seviye', nextXP: 1000 };
    } else if (totalXP >= 500) {
      return { level: 4, title: 'Kıdemli İSG Uzmanı', badgeName: 'Altın Seviye', nextXP: 800 };
    } else if (totalXP >= 250) {
      return { level: 3, title: 'Saha İSG Adayı', badgeName: 'Gümüş Seviye', nextXP: 500 };
    } else if (totalXP >= 100) {
      return { level: 2, title: 'Uzman Yardımcısı', badgeName: 'Bronz Seviye', nextXP: 250 };
    } else {
      return { level: 1, title: 'Stajyer İSG Adayı', badgeName: 'Başlangıç Seviyesi', nextXP: 100 };
    }
  }, [totalXP]);

  // Closest upcoming badge to motivate the user
  const nextTargetBadge = useMemo(() => {
    if (lockedBadges.length === 0) return null;
    return [...lockedBadges].sort((a, b) => b.progress - a.progress)[0];
  }, [lockedBadges]);

  return (
    <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Başarılarım & Rozetler</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                  {unlockedCount}/{totalCount} Kazanıldı
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toplam çözülen soru sayısı, günlük çalışma serisi (streak) ve sınav netlerine göre kazandığın rozetler
          </p>
        </div>

        {/* Level & Total XP Badge Pill */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
              L{userLevelInfo.level}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">İSG Seviyesi</div>
              <div className="text-xs font-bold text-white leading-tight">{userLevelInfo.title}</div>
            </div>
            <div className="pl-2 border-l border-slate-700/80">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Başarı Puanı</div>
              <div className="text-xs font-mono font-bold text-amber-400">{totalXP} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Overview Banner: Progress & Next Unlockable Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Overall Completion Progress (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/90 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xl shadow-inner font-mono">
                {unlockedCount}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Rozet Koleksiyonu</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                    %{overallBadgeRate} Tamamlandı
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tüm hedefleri tamamlayarak İSG Uzmanlığı rozet vitrinini doldur.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Toplam Rozet İlerlemesi</span>
              <span className="font-mono text-amber-300 font-bold">{unlockedCount} / {totalCount} Rozet</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overallBadgeRate}%` }}
              />
            </div>
          </div>

          {/* Mini Quick Badges Showcase */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Son Rozetler:</span>
              {unlockedBadges.length > 0 ? (
                unlockedBadges.slice(0, 4).map((b) => (
                  <span
                    key={b.id}
                    onClick={() => setActiveModalBadge(b)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 text-amber-300 border border-amber-500/30 text-[10px] font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{b.title}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">Soru çözerek ilk rozetini aç!</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Next Up Badge Motivation Target (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/90 rounded-xl p-4 border border-amber-500/30 flex flex-col justify-between space-y-2">
          {nextTargetBadge ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Sıradaki Rozet Hedefin
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  %{nextTargetBadge.progress} Tamamlandı
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${nextTargetBadge.colorScheme.iconBg} ${nextTargetBadge.colorScheme.border}`}>
                  <nextTargetBadge.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{nextTargetBadge.title}</h4>
                  <p className="text-[11px] text-slate-300 truncate">{nextTargetBadge.criteria}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Mevcut: <strong className="text-white">{nextTargetBadge.currentValueText}</strong></span>
                  <span>Hedef: <strong className="text-amber-300">{nextTargetBadge.targetValueText}</strong></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${nextTargetBadge.progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => setActiveModalBadge(nextTargetBadge)}
                  className="inline-flex items-center gap-1 text-[11px] text-teal-300 hover:text-teal-200 font-semibold cursor-pointer transition-colors"
                >
                  <span>Gereksinimleri İncele</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-3">
              <Crown className="w-8 h-8 text-amber-400 mb-1" />
              <h4 className="font-bold text-white text-sm">Tebrikler! Tüm Rozetler Açıldı</h4>
              <p className="text-xs text-slate-400">İSG sınavı için en üst düzey yetkinliğe ulaştın.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category & Status Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tümü ({badges.length})
          </button>
          <button
            onClick={() => setSelectedFilter('questions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'questions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Soru Sayısı (Hacim)</span>
          </button>
          <button
            onClick={() => setSelectedFilter('streak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'streak'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Çalışma Serisi (Streak)</span>
          </button>
          <button
            onClick={() => setSelectedFilter('exam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'exam'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sınav & Baraj</span>
          </button>
          <button
            onClick={() => setSelectedFilter('mastery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'mastery'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Mevzuat & Saha</span>
          </button>
        </div>

        {/* Unlocked vs Locked Toggle */}
        <div className="inline-flex rounded-lg bg-slate-900/90 p-1 border border-slate-700 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tüm Durumlar
          </button>
          <button
            onClick={() => setStatusFilter('unlocked')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
              statusFilter === 'unlocked'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Kazanılan ({unlockedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('locked')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
              statusFilter === 'locked'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Kilitli ({totalCount - unlockedCount})</span>
          </button>
        </div>
      </div>

      {/* Badges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          const Icon = badge.icon;
          const isUnlocked = badge.isUnlocked;

          return (
            <div
              key={badge.id}
              onClick={() => setActiveModalBadge(badge)}
              className={`relative rounded-xl p-4 border transition-all duration-200 cursor-pointer overflow-hidden group ${
                isUnlocked
                  ? `${badge.colorScheme.bg} ${badge.colorScheme.border} hover:border-slate-500 hover:shadow-lg shadow-xs`
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Subtle ambient glow effect when unlocked */}
              {isUnlocked && (
                <div
                  className={`absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br ${badge.colorScheme.glow} blur-2xl pointer-events-none`}
                />
              )}

              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? `${badge.colorScheme.iconBg} ${badge.colorScheme.border}`
                        : 'bg-slate-800/80 text-slate-500 border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                        {badge.title}
                      </h3>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {badge.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Tier Badge & XP */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      isUnlocked
                        ? 'bg-slate-800 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800/50 text-slate-500 border-slate-700'
                    }`}
                  >
                    {badge.rewardTier}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-semibold">
                    +{badge.xpPoints} XP
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                {badge.description}
              </p>

              {/* Progress bar inside card */}
              <div className="space-y-1 pt-1 border-t border-slate-700/50 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="truncate">{badge.criteria}</span>
                  <span
                    className={`font-mono font-bold shrink-0 ml-2 ${
                      isUnlocked ? badge.colorScheme.text : 'text-slate-400'
                    }`}
                  >
                    %{badge.progress}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? badge.colorScheme.accent : 'bg-slate-700'
                    }`}
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal / Drawer Popup */}
      {activeModalBadge && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    activeModalBadge.isUnlocked
                      ? `${activeModalBadge.colorScheme.iconBg} ${activeModalBadge.colorScheme.border}`
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  <activeModalBadge.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">{activeModalBadge.title}</h3>
                    {activeModalBadge.isUnlocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        Kazanıldı ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        Kilitli
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{activeModalBadge.categoryLabel}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">{activeModalBadge.rewardTier} Tier</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-bold">+{activeModalBadge.xpPoints} XP</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveModalBadge(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2.5">
              <div className="font-semibold text-slate-200">Kazanım Şartı:</div>
              <p className="text-slate-300 leading-relaxed">{activeModalBadge.criteria}</p>

              <div className="pt-2 border-t border-slate-700 space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Mevcut Durum:</span>
                  <span className="font-mono font-semibold text-white">
                    {activeModalBadge.currentValueText}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Hedef:</span>
                  <span className="font-mono text-teal-300 font-semibold">
                    {activeModalBadge.targetValueText}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800 mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      activeModalBadge.isUnlocked ? activeModalBadge.colorScheme.accent : 'bg-slate-700'
                    }`}
                    style={{ width: `${activeModalBadge.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              {activeModalBadge.description}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
              {/* If locked and questions related */}
              {!activeModalBadge.isUnlocked && onExploreTopic && (
                <button
                  onClick={() => {
                    setActiveModalBadge(null);
                    onExploreTopic();
                  }}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Soru Çözerek Aç</span>
                </button>
              )}

              <button
                onClick={() => setActiveModalBadge(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer ml-auto"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
