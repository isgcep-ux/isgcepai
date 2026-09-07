import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  BrainCircuit,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Target,
  BookOpen,
  Zap,
  TrendingUp,
  Award,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Scale,
  Flame,
  Wrench,
  Activity,
  Compass,
} from 'lucide-react';
import { UserStats, QuestionTopic, ExamType } from '../types';
import { TOPIC_LABELS } from '../data/questionsData';

interface AIStudyRecommendationCardProps {
  userStats: UserStats;
  selectedExamType: ExamType;
  onNavigateToTopicQuestions?: (topicKey: QuestionTopic) => void;
  onNavigateToFlashcards?: () => void;
  onNavigateToAIAssistant?: (initialQuestion?: string, context?: string) => void;
}

interface AIRecommendationData {
  recommendedTopicTitle: string;
  topicKey: QuestionTopic;
  priorityLevel: 'Kritik' | 'Yüksek' | 'Orta';
  reason: string;
  expectedScoreImpact: string;
  keyFocusPoints: string[];
  mnemonicOrTip: string;
  studyPlanMinutes: number;
}

export const AIStudyRecommendationCard: React.FC<AIStudyRecommendationCardProps> = ({
  userStats,
  selectedExamType,
  onNavigateToTopicQuestions,
  onNavigateToFlashcards,
  onNavigateToAIAssistant,
}) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiCustomRecommendation, setAiCustomRecommendation] = useState<AIRecommendationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Calculate rule-based optimal recommendation from user stats
  const defaultRecommendation: AIRecommendationData = useMemo(() => {
    const topicKeys = Object.keys(TOPIC_LABELS) as QuestionTopic[];
    const topicMastery = userStats.topicMastery || {};
    const wrongCount = userStats.wrongQuestionIds?.length || 0;

    // Weight topics by ÖSYM frequency and user mastery
    const topicWeights: Record<QuestionTopic, number> = {
      kanun_6331: 10,
      is_hukuku: 9,
      risk_degerlendirmesi: 9,
      fiziksel_riskler: 8,
      is_ekipmanlari: 8,
      kimyasal_riskler: 7,
      yangin_acil: 7,
      biyolojik_riskler: 6,
      ergonomi: 6,
      yuksekte_calisma: 7,
      kapali_alanlar: 5,
      insaat_isg: 6,
      maden_isg: 5,
      elektrik_isg: 6,
      saglik_ilkyardim: 6,
      uluslararasi_isg: 5,
    };

    // Calculate gap score for each topic
    let highestPriorityTopic: QuestionTopic = 'kanun_6331';
    let highestGapScore = -999;

    topicKeys.forEach((key) => {
      const stats = topicMastery[key] || { correct: 0, total: 0 };
      const weight = topicWeights[key] || 5;
      
      let gap = 0;
      if (stats.total === 0) {
        // High importance but not studied yet
        gap = weight * 8;
      } else {
        const rate = (stats.correct / stats.total) * 100;
        if (rate < 60) {
          gap = (100 - rate) * (weight / 5) * 1.5; // High gap for low success
        } else if (rate < 75) {
          gap = (75 - rate) * (weight / 5);
        } else {
          gap = 10; // Already mastered
        }
      }

      if (gap > highestGapScore) {
        highestGapScore = gap;
        highestPriorityTopic = key;
      }
    });

    // Content mapping for recommended topics
    const topicDetails: Partial<Record<QuestionTopic, Partial<AIRecommendationData>>> = {
      kanun_6331: {
        recommendedTopicTitle: '6331 Sayılı İSG Kanunu & İşveren Yükümlülükleri',
        reason: 'ÖSYM sınavlarında 6-8 soru ile en yüksek ağırlığa sahip temel mevzuat alanıdır. Çalışan temsilcisi sayıları ve iş sağlığı kurulları net puan getirir.',
        expectedScoreImpact: '+6 ile +8 Puan Artışı',
        keyFocusPoints: [
          'Çalışan Temsilcisi Sayıları (2-50: 1, 51-100: 2, 101-500: 3, 501-1000: 4, 1001+: 6)',
          'İSG Kurulu Kurulma Şartları (50+ çalışan & 6 aydan fazla süren sürekli işler)',
          'Çalışmaktan Kaçınma Hakkı süreci ve İşverenin bildirim süreleri (Kaza bildirimi 3 iş günü)',
        ],
        mnemonicOrTip: 'Hafıza Kodu: "KAZA 3 İŞ GÜNÜ, KURUL 50 ÇALIŞAN & 6 AY"',
        studyPlanMinutes: 25,
      },
      is_hukuku: {
        recommendedTopicTitle: 'İş Hukuku & 4857 Sayılı İş Kanunu Esasları',
        reason: 'Fazla çalışma limitleri, yıllık ücretli izin süreleri ve bildirim önelleri ÖSYM\'nin her dönem soru sorduğu kesin konulardır.',
        expectedScoreImpact: '+4 ile +6 Puan Artışı',
        keyFocusPoints: [
          'Haftalık Çalışma Süresi (45 saat) ve Günlük Maksimum Süre (11 saat)',
          'Yıllık Fazla Çalışma Üst Sınırı: Yılda en fazla 270 saat',
          'Kıdeme Göre Yıllık Ücretli İzin Süreleri (1-5 yıl: 14 gün, 5-15 yıl: 20 gün, 15+ yıl: 26 gün)',
        ],
        mnemonicOrTip: 'Hafıza Kodu: "14 - 20 - 26 (1-5-15 Yıl Kuralı)"',
        studyPlanMinutes: 20,
      },
      risk_degerlendirmesi: {
        recommendedTopicTitle: 'Risk Değerlendirmesi & Metodolojiler (L Tipi, Fine-Kinney)',
        reason: 'Önleme hiyerarşisi adımları ve tehlike sınıfına göre risk değerlendirmesi yenileme süreleri her sınavda yer alır.',
        expectedScoreImpact: '+4 ile +6 Puan Artışı',
        keyFocusPoints: [
          'Yenileme Periyotları: Çok Tehlikeli (2 yıl), Tehlikeli (4 yıl), Az Tehlikeli (6 yıl)',
          'Önleme Hiyerarşisi: Kaynağında Yok Etme → İkame → Mühendislik → İdari → KKD',
          'Risk Matrisi: Risk = Olasılık x Şiddet (1-25 Skalası)',
        ],
        mnemonicOrTip: 'Hafıza Kodu: "2 - 4 - 6 Yıl (Çok Tehlikeli - Tehlikeli - Az Tehlikeli)"',
        studyPlanMinutes: 20,
      },
      fiziksel_riskler: {
        recommendedTopicTitle: 'Fiziksel Risk Etmenleri (Gürültü, Titreşim, Termal Konfor)',
        reason: 'Sayısal desibel (dB) sınır değerleri ve titreşim maruziyet limit değerleri doğrudan ezber puanı kazandırır.',
        expectedScoreImpact: '+4 ile +6 Puan Artışı',
        keyFocusPoints: [
          'Gürültü Sınırları: En Düşük Eylem (80 dBA), En Yüksek Eylem (85 dBA), Sınır Değer (87 dBA)',
          'El-Kol Titreşimi: Eylem Değeri (2.5 m/s²), Sınır Değer (5 m/s²)',
          'Tüm Vücut Titreşimi: Eylem Değeri (0.5 m/s²), Sınır Değer (1.15 m/s²)',
        ],
        mnemonicOrTip: 'Hafıza Kodu: "80 (Kulaklık Ver) → 85 (Zorunlu Tak) → 87 (Asla Aşılamaz)"',
        studyPlanMinutes: 20,
      },
      is_ekipmanlari: {
        recommendedTopicTitle: 'İş Ekipmanları & Periyodik Kontrol Süreleri',
        reason: 'Kaldırma araçları, basınçlı kaplar ve iskele periyodik kontrol standartları sınavda yüksek ayırt ediciliğe sahiptir.',
        expectedScoreImpact: '+4 Puan Artışı',
        keyFocusPoints: [
          'Standart kontrol periyodu: Yılda en az 1 kez (Özel durumlar hariç)',
          'İskeleler: En geç 6 ayda bir kontrol edilir',
          'Kaldırma araçları statik deney (1.25 katı) ve dinamik deney (1.1 katı)',
        ],
        mnemonicOrTip: 'Hafıza Kodu: "İSKELE 6 AY, VİNÇ/KAZAN 1 YIL"',
        studyPlanMinutes: 15,
      },
    };

    const details = topicDetails[highestPriorityTopic] || {
      recommendedTopicTitle: TOPIC_LABELS[highestPriorityTopic]?.label || 'İSG Temel Mevzuat',
      reason: 'Sınav başarınızı %70 barajının üzerine taşımak için bu konudaki soru çözüm adedini artırmanız önerilir.',
      expectedScoreImpact: '+4 ile +6 Puan Artışı',
      keyFocusPoints: [
        'Konuya ait temel yasal yönetmelik tanımları',
        'ÖSYM\'nin sıklıkla sorduğu sayısal süreler ve istisnalar',
        'Soru çözümünde çeldirici olarak kullanılan benzer maddeler',
      ],
      mnemonicOrTip: 'Hafıza Kodu: Temel kavramları flashcard modunda pekiştirin.',
      studyPlanMinutes: 20,
    };

    const isVeryLow = (topicMastery[highestPriorityTopic]?.total || 0) > 0 &&
      ((topicMastery[highestPriorityTopic]?.correct || 0) / (topicMastery[highestPriorityTopic]?.total || 1)) < 0.5;

    return {
      recommendedTopicTitle: details.recommendedTopicTitle || 'İSG Temel Konular',
      topicKey: highestPriorityTopic,
      priorityLevel: isVeryLow || wrongCount >= 3 ? 'Kritik' : 'Yüksek',
      reason: details.reason || '',
      expectedScoreImpact: details.expectedScoreImpact || '+4 ile +8 Puan Artışı',
      keyFocusPoints: details.keyFocusPoints || [],
      mnemonicOrTip: details.mnemonicOrTip || '',
      studyPlanMinutes: details.studyPlanMinutes || 20,
    };
  }, [userStats]);

  // Active displayed recommendation
  const activeRec = aiCustomRecommendation || defaultRecommendation;

  // Handle Live AI Generation via Gemini API
  const handleFetchAIRoadmap = async () => {
    setIsLoadingAI(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/study-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userStats,
          selectedExamType,
        }),
      });

      if (!response.ok) {
        throw new Error('AI sunucusundan yanıt alınamadı.');
      }

      const data = await response.json();
      if (data && data.recommendedTopicTitle) {
        setAiCustomRecommendation({
          recommendedTopicTitle: data.recommendedTopicTitle,
          topicKey: (data.topicKey as QuestionTopic) || defaultRecommendation.topicKey,
          priorityLevel: data.priorityLevel || 'Yüksek',
          reason: data.reason || defaultRecommendation.reason,
          expectedScoreImpact: data.expectedScoreImpact || '+6 Puan Artışı',
          keyFocusPoints: Array.isArray(data.keyFocusPoints) && data.keyFocusPoints.length > 0
            ? data.keyFocusPoints
            : defaultRecommendation.keyFocusPoints,
          mnemonicOrTip: data.mnemonicOrTip || defaultRecommendation.mnemonicOrTip,
          studyPlanMinutes: data.studyPlanMinutes || 25,
        });
      }
    } catch (err: any) {
      console.error('AI Study Recommendation fetch error:', err);
      setErrorMsg('Canlı AI analizi yenilenemedi, optimize yerel analiz gösteriliyor.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/40 border border-indigo-500/30 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Background Decorative Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base tracking-tight">
                AI Sınav Koçu • Bir Sonraki Çalışma Konusu
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <Sparkles className="w-3 h-3 text-indigo-300" /> Akıllı Analiz
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hata defterin ve deneme skorların taranarak en hızlı net artışı sağlayacak odak belirlendi
            </p>
          </div>
        </div>

        {/* AI Refresh Button */}
        <button
          onClick={handleFetchAIRoadmap}
          disabled={isLoadingAI}
          title="Gemini AI ile verilerini yeniden analiz et"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoadingAI ? 'animate-spin' : ''}`} />
          <span>{isLoadingAI ? 'Analiz Ediliyor...' : 'Yapay Zeka ile Güncelle'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Main Focus Card Banner */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-900/80 border border-indigo-500/20 rounded-xl p-4 sm:p-5 backdrop-blur-xs">
        {/* Left Column: Topic, Priority & Reasoning (7 Cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                activeRec.priorityLevel === 'Kritik'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {activeRec.priorityLevel} Öncelikli Odak
            </span>

            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" />
              {activeRec.expectedScoreImpact}
            </span>

            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              ⏱️ ~{activeRec.studyPlanMinutes} dk Çalışma Planı
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {activeRec.recommendedTopicTitle}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              <strong className="text-indigo-300">Neden Bu Konu? </strong>
              {activeRec.reason}
            </p>
          </div>

          {/* Mnemonic / Tip highlight */}
          {activeRec.mnemonicOrTip && (
            <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg p-2.5 flex items-start gap-2 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-200 font-medium">
                <span className="text-amber-300 font-bold">ÖSYM Sınav Tüyosu: </span>
                {activeRec.mnemonicOrTip}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Exam Traps & Focus Points (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 uppercase tracking-wide border-b border-slate-800 pb-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>ÖSYM Sınavı Odak Maddeleri</span>
            </div>

            <ul className="space-y-2 mt-2">
              {activeRec.keyFocusPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Hedef: Bu konudan +3 Net</span>
            <span className="text-teal-300 font-semibold font-mono">ÖSYM 70 Barajı</span>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Şimdi ne yapmak istersin?</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Practice Questions button */}
          {onNavigateToTopicQuestions && (
            <button
              onClick={() => onNavigateToTopicQuestions(activeRec.topicKey)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Bu Konudan Soru Çöz</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}

          {/* Flashcards button */}
          {onNavigateToFlashcards && (
            <button
              onClick={onNavigateToFlashcards}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hap Bilgileri Gör</span>
            </button>
          )}

          {/* AI Ask button */}
          {onNavigateToAIAssistant && (
            <button
              onClick={() =>
                onNavigateToAIAssistant(
                  `${activeRec.recommendedTopicTitle} konusunda ÖSYM'de en çok çıkan sınav tuzaklarını ve hafıza kodlarını özetler misin?`,
                  activeRec.recommendedTopicTitle
                )
              }
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Asistana Sor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
