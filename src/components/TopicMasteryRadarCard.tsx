import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Radar as RadarIcon,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  Zap,
  HelpCircle,
  TrendingDown,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { QuestionTopic, UserStats } from '../types';
import { TOPIC_LABELS } from '../data/questionsData';

interface TopicMasteryRadarCardProps {
  userStats: UserStats;
  onSelectTopicForPractice?: (topic: QuestionTopic) => void;
  onNavigateToAIAssistant?: (initialQuestion?: string) => void;
  onNavigateToFlashcards?: () => void;
}

// ÖSYM Sınav Ağırlığı ve Soru Dağılımı Referansı
export const TOPIC_EXAM_WEIGHTS: Record<
  QuestionTopic,
  {
    shortName: string;
    questionCount: string;
    priority: 'Kritik' | 'Yüksek' | 'Orta';
    weightFactor: number; // 3: Kritik, 2: Yüksek, 1: Orta
    recommendedStudyHours: string;
    briefTip: string;
  }
> = {
  kanun_6331: {
    shortName: '6331 Kanun',
    questionCount: '6-8 Soru',
    priority: 'Kritik',
    weightFactor: 3.5,
    recommendedStudyHours: 'En yüksek soru ağırlığı',
    briefTip: 'İşverenin yükümlülükleri, çalışan temsilcisi, tahliye ve kurul şartları mutlaka bilinmeli.',
  },
  risk_degerlendirmesi: {
    shortName: 'Risk Değerlendirmesi',
    questionCount: '4-6 Soru',
    priority: 'Kritik',
    weightFactor: 3.2,
    recommendedStudyHours: '2-4-6 yenileme kuralı & metotlar',
    briefTip: 'Fine-Kinney, Matris, FMEA yöntemleri ve tehlike sınıfı yenileme periyotları sınav klasiğidir.',
  },
  is_hukuku: {
    shortName: 'İş Hukuku (4857)',
    questionCount: '4-6 Soru',
    priority: 'Kritik',
    weightFactor: 3.0,
    recommendedStudyHours: 'Çalışma süreleri & sözleşmeler',
    briefTip: 'Haftalık 45 saat, ara dinlenmeleri ve fesih bildirim önelleri kesinlikle ezberlenmeli.',
  },
  fiziksel_riskler: {
    shortName: 'Fiziksel Riskler',
    questionCount: '3-5 Soru',
    priority: 'Yüksek',
    weightFactor: 2.6,
    recommendedStudyHours: 'Sayısal eşik değerler',
    briefTip: 'Gürültü (80-85-87 dB) ve Titreşim (El-kol: 2.5/5.0, Tüm vücut: 0.5/1.15) değerlerine çalışın.',
  },
  kimyasal_riskler: {
    shortName: 'Kimyasal Riskler',
    questionCount: '3-4 Soru',
    priority: 'Yüksek',
    weightFactor: 2.4,
    recommendedStudyHours: 'SDS & TWA sınırları',
    briefTip: 'Asbest (0.1 lif/cm³), CLP etiket piktogramları ve kimyasal depolama kuralları sorulur.',
  },
  is_ekipmanlari: {
    shortName: 'İş Ekipmanları',
    questionCount: '3-4 Soru',
    priority: 'Yüksek',
    weightFactor: 2.3,
    recommendedStudyHours: 'Periyodik kontrol periyotları',
    briefTip: 'Kaldırma araçları ve basınçlı kaplar periyodik kontrol süresi (yılda 1) ve EKİPNET şartı.',
  },
  yangin_acil: {
    shortName: 'Yangın & Acil',
    questionCount: '2-4 Soru',
    priority: 'Yüksek',
    weightFactor: 2.2,
    recommendedStudyHours: 'YSC hesabı & tatbikat',
    briefTip: 'Taşınabilir söndürücüler (250 m² / 1 adet 6 kg) ve tatbikat periyodu (yılda en az 1 kez).',
  },
  yuksekte_calisma: {
    shortName: 'Yüksekte Çalışma',
    questionCount: '2-4 Soru',
    priority: 'Yüksek',
    weightFactor: 2.2,
    recommendedStudyHours: 'Korkuluk & iskele standartları',
    briefTip: 'Ana korkuluk (100 cm), topuk levhası (15 cm) ve iskele kontrol periyodu (6 ayda 1).',
  },
  kapali_alanlar: {
    shortName: 'Kapalı Alanlar',
    questionCount: '2-3 Soru',
    priority: 'Orta',
    weightFactor: 1.8,
    recommendedStudyHours: 'Gaz ölçümü & oksijen sınırı',
    briefTip: 'Oksijen güvenlik aralığı (%19.5 - %23.5), LEL seviyesi (<%10) ve dikey ölçüm adımları.',
  },
  biyolojik_riskler: {
    shortName: 'Biyolojik Riskler',
    questionCount: '2-3 Soru',
    priority: 'Orta',
    weightFactor: 1.7,
    recommendedStudyHours: 'Grup 1-4 risk sınıfları',
    briefTip: 'Aşılanabilir riskler, Grup 3 ve 4 bildirim süreleri ve laboratuvar biyogüvenlik düzeyleri.',
  },
  ergonomi: {
    shortName: 'Ergonomi',
    questionCount: '2-3 Soru',
    priority: 'Orta',
    weightFactor: 1.6,
    recommendedStudyHours: 'Elle taşıma & antropometri',
    briefTip: 'Erkekler için tavsiye edilen azami kaldırma ağırlıkları ve ekranlı araç çalışma kuralları.',
  },
  saglik_ilkyardim: {
    shortName: 'Sağlık & İlkyardım',
    questionCount: '2-3 Soru',
    priority: 'Orta',
    weightFactor: 1.6,
    recommendedStudyHours: 'Muayene süreleri & TYD',
    briefTip: 'Sağlık muayene periyotları (1-3-5 kuralı) ve temel yaşam desteği (30 kalp masajı / 2 suni solunum).',
  },
  insaat_isg: {
    shortName: 'Yapı İşleri (İnşaat)',
    questionCount: '2-4 Soru',
    priority: 'Orta',
    weightFactor: 1.8,
    recommendedStudyHours: 'Kazı & şantiye güvenliği',
    briefTip: 'Sağlık güvenlik planı hazırlama şartı ve derin kazılarda iksa önlemleri.',
  },
  elektrik_isg: {
    shortName: 'Elektrik İSG',
    questionCount: '2-3 Soru',
    priority: 'Orta',
    weightFactor: 1.7,
    recommendedStudyHours: 'Topraklama & kaçak akım',
    briefTip: 'Hayat koruma (30 mA) ve yangın koruma (300 mA) kaçak akım rölesi eşikleri.',
  },
  maden_isg: {
    shortName: 'Maden İSG',
    questionCount: '2-3 Soru',
    priority: 'Orta',
    weightFactor: 1.5,
    recommendedStudyHours: 'Metan & sığınma odaları',
    briefTip: 'Grizu patlama sınırları (%5 - %14 metan) ve sığınma odası donanım gereksinimleri.',
  },
  uluslararasi_isg: {
    shortName: 'Uluslararası İSG',
    questionCount: '1-2 Soru',
    priority: 'Orta',
    weightFactor: 1.2,
    recommendedStudyHours: 'ILO 155 & 161 sözleşmeleri',
    briefTip: 'Türkiye\'nin onayladığı 155 ve 161 sayılı ILO sözleşmeleri ve AB direktif ilkeleri.',
  },
};

type ViewFilter = 'priority_8' | 'all_16' | 'needs_study' | 'studied';

export const TopicMasteryRadarCard: React.FC<TopicMasteryRadarCardProps> = ({
  userStats,
  onSelectTopicForPractice,
  onNavigateToAIAssistant,
  onNavigateToFlashcards,
}) => {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('priority_8');
  const [selectedTopicKey, setSelectedTopicKey] = useState<QuestionTopic | null>(null);

  // Compute metrics for all 16 topics
  const allTopicsAnalysis = useMemo(() => {
    const topics = Object.keys(TOPIC_LABELS) as QuestionTopic[];

    return topics.map((topicKey) => {
      const labelInfo = TOPIC_LABELS[topicKey];
      const stats = userStats.topicMastery?.[topicKey] || { correct: 0, total: 0 };
      const total = stats.total;
      const correct = stats.correct;
      const wrong = Math.max(0, total - correct);
      const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;
      const weightInfo = TOPIC_EXAM_WEIGHTS[topicKey] || {
        shortName: labelInfo.label,
        questionCount: '2-3 Soru',
        priority: 'Orta',
        weightFactor: 1.5,
        recommendedStudyHours: '',
        briefTip: '',
      };

      // Study urgency calculation:
      // High urgency if:
      // 1. Success rate is below 70% (deficit = 70 - successRate)
      // 2. High exam weight factor (6331, Risk, İş Hukuku gets multiplied)
      // 3. Low question volume (total < 3)
      let urgencyScore = 0;
      if (total === 0) {
        urgencyScore = 70 * weightInfo.weightFactor; // Never practiced, high weight means high urgency
      } else if (successRate < 70) {
        urgencyScore = (70 - successRate + (wrong * 5)) * weightInfo.weightFactor;
      } else {
        // Passed threshold, but if only 1 question solved, still minor urgency
        urgencyScore = Math.max(0, (5 - total) * 4);
      }

      // Status assessment
      let status: 'critical' | 'needs_work' | 'reinforce' | 'mastered';
      let statusLabel: string;

      if (total === 0) {
        status = 'critical';
        statusLabel = 'Hiç Soru Çözülmedi';
      } else if (successRate < 50) {
        status = 'critical';
        statusLabel = 'Kritik Seviye (%50 altı)';
      } else if (successRate < 70) {
        status = 'needs_work';
        statusLabel = 'Baraj Altında (%50-%69)';
      } else if (total < 3) {
        status = 'reinforce';
        statusLabel = 'Pekiştirilmeli (Az Soru)';
      } else {
        status = 'mastered';
        statusLabel = 'Güçlü Hakimiyet';
      }

      return {
        topic: topicKey,
        fullName: labelInfo.label,
        name: weightInfo.shortName,
        successRate,
        targetScore: 70, // ÖSYM %70 Passing Benchmark
        correct,
        wrong,
        total,
        isStudied: total > 0,
        isPassed: successRate >= 70 && total > 0,
        osymQuestions: weightInfo.questionCount,
        priority: weightInfo.priority,
        weightFactor: weightInfo.weightFactor,
        briefTip: weightInfo.briefTip,
        urgencyScore,
        status,
        statusLabel,
      };
    });
  }, [userStats.topicMastery]);

  // Priority study topics: sorted by urgency score descending
  const priorityStudyTopics = useMemo(() => {
    return [...allTopicsAnalysis]
      .filter((t) => t.status !== 'mastered')
      .sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [allTopicsAnalysis]);

  // Data formatted for Recharts Radar Chart based on active viewFilter
  const radarChartData = useMemo(() => {
    let list = [...allTopicsAnalysis];

    if (viewFilter === 'priority_8') {
      // 8 highest weighted exam topics for crisp, readable radar
      list = list.sort((a, b) => b.weightFactor - a.weightFactor).slice(0, 8);
    } else if (viewFilter === 'needs_study') {
      // Topics where mastery is below 70 or not studied
      const needy = list.filter((t) => t.successRate < 70 || t.total === 0);
      list = needy.length >= 4 ? needy : list.slice(0, 8);
    } else if (viewFilter === 'studied') {
      const studied = list.filter((t) => t.total > 0);
      list = studied.length >= 4 ? studied : list.slice(0, 8);
    }
    // all_16 uses full list

    return list.map((item) => ({
      ...item,
      // For radar display, if total is 0, give 0% or small baseline
      radarValue: item.total > 0 ? item.successRate : 0,
    }));
  }, [allTopicsAnalysis, viewFilter]);

  // Overall curriculum KPI summaries
  const summaryKPIs = useMemo(() => {
    const studiedCount = allTopicsAnalysis.filter((t) => t.total > 0).length;
    const passedCount = allTopicsAnalysis.filter((t) => t.isPassed).length;
    const criticalCount = allTopicsAnalysis.filter((t) => t.status === 'critical').length;
    const studiedItems = allTopicsAnalysis.filter((t) => t.total > 0);
    const avgMastery =
      studiedItems.length > 0
        ? Math.round(studiedItems.reduce((sum, item) => sum + item.successRate, 0) / studiedItems.length)
        : 0;

    const mostUrgent = priorityStudyTopics[0] || null;

    return {
      studiedCount,
      passedCount,
      criticalCount,
      avgMastery,
      mostUrgent,
    };
  }, [allTopicsAnalysis, priorityStudyTopics]);

  // Active topic for bottom/side inspection
  const inspectedTopic = useMemo(() => {
    if (selectedTopicKey) {
      const found = allTopicsAnalysis.find((t) => t.topic === selectedTopicKey);
      if (found) return found;
    }
    return summaryKPIs.mostUrgent || allTopicsAnalysis[0];
  }, [selectedTopicKey, allTopicsAnalysis, summaryKPIs.mostUrgent]);

  // Custom Radar Tooltip
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-teal-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-2 z-50 min-w-[210px]">
          <div className="border-b border-slate-800 pb-1.5">
            <p className="font-bold text-white text-sm leading-snug">{data.fullName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 font-semibold">
                ÖSYM: {data.osymQuestions}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold ${
                  data.status === 'critical'
                    ? 'bg-rose-500/20 text-rose-300'
                    : data.status === 'needs_work'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {data.statusLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-0.5">
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Başarı Oranı</span>
              <span
                className={`font-mono font-bold text-sm ${
                  data.successRate >= 70
                    ? 'text-emerald-400'
                    : data.successRate >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                %{data.successRate}
              </span>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Soru Çözümü</span>
              <span className="font-mono font-bold text-white text-xs">
                {data.correct}D / {data.total} Soru
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center justify-between pt-0.5">
            <span>ÖSYM %70 Barajı:</span>
            <span
              className={`font-bold font-mono ${
                data.successRate >= 70 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {data.successRate >= 70 ? '✓ Geçildi' : `Kalan: -%${70 - data.successRate}`}
            </span>
          </div>

          <p className="text-[10px] text-teal-300/90 italic pt-1 border-t border-slate-800 flex items-center gap-1">
            <span>Tıklayarak inceleyin ve soru çözün</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md space-y-6 relative overflow-hidden">
      {/* Decorative subtle ambient backdrop glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mt-24" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none -mb-24" />

      {/* Top Header & View Filter Mode Toolbar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-xs flex items-center justify-center">
              <RadarIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                  <span>Müfredat Hakimiyeti Radar Grafiği</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold font-mono">
                    topicMastery Analizi
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Konu bazlı bilgi seviyenizi ÖSYM %70 barajı ile kıyaslayarak en çok çalışmanız gereken alanları tespit eder
              </p>
            </div>
          </div>
        </div>

        {/* View Filter Pill Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setViewFilter('priority_8')}
            className={`px-2.5 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1 cursor-pointer ${
              viewFilter === 'priority_8'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Sınavda en çok soru çıkan 8 kritik konu"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>8 Kritik Konu</span>
          </button>

          <button
            onClick={() => setViewFilter('needs_study')}
            className={`px-2.5 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1 cursor-pointer ${
              viewFilter === 'needs_study'
                ? 'bg-rose-600/90 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Başarı oranı %70 altında olan veya çözülmemiş konular"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            <span>Zayıf Noktalar</span>
          </button>

          <button
            onClick={() => setViewFilter('studied')}
            className={`px-2.5 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1 cursor-pointer ${
              viewFilter === 'studied'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Şimdiye kadar en az 1 soru çözülen konular"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Çalışılanlar</span>
          </button>

          <button
            onClick={() => setViewFilter('all_16')}
            className={`px-2.5 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1 cursor-pointer ${
              viewFilter === 'all_16'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tüm 16 İSG müfredat konusu"
          >
            <span>Tüm Müfredat (16)</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Strip (4 Metric Blocks) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ortalama Hakimiyet</span>
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            %{summaryKPIs.avgMastery}
          </div>
          <div className="text-[11px] text-slate-400">
            {summaryKPIs.avgMastery >= 70 ? (
              <span className="text-emerald-400 font-medium">ÖSYM Barajı Üzerinde</span>
            ) : (
              <span className="text-amber-400 font-medium">Hedef: %70 Barajı</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Barajı Geçen Konular</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {summaryKPIs.passedCount}{' '}
            <span className="text-xs text-slate-400 font-normal font-sans">/ 16</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {summaryKPIs.passedCount >= 10 ? 'Çok iyi kapsam' : 'Eksik konular var'}
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Acil Odaklanılacak</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {summaryKPIs.criticalCount}{' '}
            <span className="text-xs text-slate-400 font-normal font-sans">Konu</span>
          </div>
          <div className="text-[11px] text-rose-400/90 font-medium">
            Öncelikli soru çözülmeli
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Müfredat Kapsamı</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {summaryKPIs.studiedCount}{' '}
            <span className="text-xs text-slate-400 font-normal font-sans">/ 16</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {16 - summaryKPIs.studiedCount === 0 ? 'Tüm konular çalışıldı' : `${16 - summaryKPIs.studiedCount} konuya henüz bakılmadı`}
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Radar Visualization (Left) + Priority Study Checklist (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recharts Radar Chart Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>Konu Yetkinlik Radarı</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ({radarChartData.length} Konu Gösteriliyor)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Poligonda merkeze yakın noktalar zayıf alanlarınızı, dış çembere yakın noktalar ise güçlü konularınızı gösterir.
              </p>
            </div>

            {/* Visual Legend Key */}
            <div className="flex items-center gap-3 text-xs shrink-0 pt-1 sm:pt-0">
              <span className="flex items-center gap-1.5 text-teal-300">
                <span className="w-3 h-3 rounded-xs bg-teal-500 inline-block opacity-80" />
                <span>Hakimiyetiniz (%)</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block" />
                <span>ÖSYM %70 Barajı</span>
              </span>
            </div>
          </div>

          {/* Radar Chart Display */}
          <div className="w-full h-80 sm:h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                outerRadius="72%"
                data={radarChartData}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const topicKey = e.activePayload[0].payload.topic;
                    if (topicKey) setSelectedTopicKey(topicKey);
                  }
                }}
              >
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{
                    fill: '#cbd5e1',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <PolarRadiusAxis
                  angle={45}
                  domain={[0, 100]}
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(v) => `%${v}`}
                />

                {/* Benchmark Polygon (%70 Passing Line) */}
                <Radar
                  name="ÖSYM %70 Barajı"
                  dataKey="targetScore"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />

                {/* Candidate Mastery Polygon */}
                <Radar
                  name="Hakimiyet Oranınız"
                  dataKey="radarValue"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  fill="#14b8a6"
                  fillOpacity={0.4}
                  dot={{ r: 4, fill: '#14b8a6', stroke: '#0f172a', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#ffffff', strokeWidth: 2 }}
                />

                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>💡 İpucu: Radardaki noktalara tıklayarak ilgili konunun detayını inceleyebilirsiniz.</span>
            <span className="text-teal-400 font-semibold font-mono">Yeşil Kesikli Çizgi = %70 Hedef</span>
          </div>
        </div>

        {/* Right Column: "Hangi Konularda Daha Çok Çalışılmalı?" Action Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-700/80 space-y-4 flex flex-col h-full">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Öncelikli Çalışma Sıralaması</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Acil Odaklanılacaklar
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Soru ağırlığı yüksek ve başarı oranı %70 altında kalan öncelikli çalışma listeniz
            </p>
          </div>

          {/* List of Priority Weak Topics */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {priorityStudyTopics.length > 0 ? (
              priorityStudyTopics.slice(0, 5).map((item, index) => {
                const isSelected = inspectedTopic?.topic === item.topic;
                return (
                  <div
                    key={item.topic}
                    onClick={() => setSelectedTopicKey(item.topic)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/95 border-teal-400 ring-2 ring-teal-500/30 shadow-md'
                        : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                          {item.fullName}
                        </h4>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 font-mono">
                        ÖSYM: {item.osymQuestions}
                      </span>
                    </div>

                    {/* Progress Bar & Success Stat */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Mevcut Başarı:{' '}
                          <strong
                            className={`font-mono ${
                              item.successRate >= 70
                                ? 'text-emerald-400'
                                : item.successRate >= 50
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            %{item.successRate}
                          </strong>{' '}
                          <span className="text-slate-500 font-normal">
                            ({item.correct}D / {item.total} Soru)
                          </span>
                        </span>
                        <span className="text-[10px] text-rose-300 font-medium">
                          {item.total === 0 ? 'Hiç Soru Çözülmedi' : `Baraja -%${Math.max(0, 70 - item.successRate)}`}
                        </span>
                      </div>

                      {/* Mini Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.successRate >= 70
                              ? 'bg-emerald-500'
                              : item.successRate >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, item.successRate)}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Action: Quick practice */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-xs">
                      <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                        {item.briefTip || 'Sınavda mutlaka çıkacak temel kurallar'}
                      </span>

                      {onSelectTopicForPractice && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTopicForPractice(item.topic);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600/90 hover:bg-teal-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                        >
                          <span>Soru Çöz</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Tebrikler!</h4>
                <p className="text-xs text-slate-400">
                  Çalıştığınız tüm konularda ÖSYM %70 barajını geçmiş durumdasınız. Yeni konular çözmeye başlayabilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected/Inspected Topic Deep Dive Card */}
      {inspectedTopic && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 rounded-xl p-4 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Seçili Konu Analizi
              </span>
              <span className="text-xs text-amber-300 font-semibold font-mono">
                ÖSYM Ağırlığı: {inspectedTopic.osymQuestions} ({inspectedTopic.priority} Öncelik)
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                  inspectedTopic.status === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : inspectedTopic.status === 'needs_work'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {inspectedTopic.statusLabel}
              </span>
            </div>

            <h4 className="text-base font-extrabold text-white truncate">
              {inspectedTopic.fullName}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {inspectedTopic.briefTip ? (
                <span>
                  <strong className="text-amber-300 mr-1">Sınav Tavsiyesi:</strong>
                  {inspectedTopic.briefTip}
                </span>
              ) : (
                'Bu konuda daha fazla deneme sorusu çözerek ÖSYM barajının üzerine çıkabilirsiniz.'
              )}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 flex-wrap">
              <span>
                Çözülen Soru: <strong className="text-white font-mono">{inspectedTopic.total}</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-400">
                Doğru: <strong className="font-mono">{inspectedTopic.correct}</strong>
              </span>
              <span>•</span>
              <span className="text-rose-400">
                Yanlış: <strong className="font-mono">{inspectedTopic.wrong}</strong>
              </span>
              <span>•</span>
              <span>
                Başarı:{' '}
                <strong
                  className={`font-mono ${
                    inspectedTopic.successRate >= 70 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  %{inspectedTopic.successRate}
                </strong>
              </span>
            </div>
          </div>

          {/* Action Buttons for the Inspected Topic */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSelectTopicForPractice && (
              <button
                onClick={() => onSelectTopicForPractice(inspectedTopic.topic)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
              >
                <span>Bu Konudan Soru Çöz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onNavigateToAIAssistant && (
              <button
                onClick={() =>
                  onNavigateToAIAssistant(
                    `İSG sınavında "${inspectedTopic.fullName}" konusunda hangi soru tuzakları çıkar? Benim bu konuda başarı oranım %${inspectedTopic.successRate}. Konuyu özetleyip 2 örnek soru gösterir misin?`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="AI Sınav Koçundan bu konuyu anlatmasını iste"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Koçtan Dinle</span>
              </button>
            )}

            {onNavigateToFlashcards && (
              <button
                onClick={onNavigateToFlashcards}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Ezber kartlarına git"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ezber Kartları</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
