import React, { useState } from 'react';
import { 
  CheckSquare, 
  BookOpen, 
  Sparkles, 
  Calculator, 
  Scale, 
  Flame, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Zap, 
  TrendingUp,
  GraduationCap,
  FileCheck,
  FileDown,
  Printer
} from 'lucide-react';
import { ExamType, Question, QuestionTopic, UserStats } from '../types';
import { EXAM_TYPES_CONFIG, QUESTIONS_BANK } from '../data/questionsData';
import { TopicSuccessChart } from './TopicSuccessChart';
import { ExamProgressChart } from './ExamProgressChart';
import { AchievementBadgesSection } from './AchievementBadgesSection';
import { AIStudyRecommendationCard } from './AIStudyRecommendationCard';
import { PDFReportModal } from './PDFReportModal';
import { ExamCountdownCard } from './ExamCountdownCard';
import { DailyActivityPanel } from './DailyActivityPanel';

interface DashboardViewProps {
  selectedExamType: ExamType;
  setSelectedExamType: (type: ExamType) => void;
  setActiveTab: (tab: string) => void;
  userStats: UserStats;
  onAnswerDailyQuestion: (isCorrect: boolean, question: Question) => void;
  onOpenAiExplain: (question: Question, userAnswerIndex: number | null) => void;
  onSelectTopicForPractice?: (topicKey: QuestionTopic) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedExamType,
  setSelectedExamType,
  setActiveTab,
  userStats,
  onAnswerDailyQuestion,
  onOpenAiExplain,
  onSelectTopicForPractice,
}) => {
  // Pick a featured daily question from the bank
  const dailyQuestion = QUESTIONS_BANK[0];
  const [dailySelected, setDailySelected] = useState<number | null>(null);
  const [dailySubmitted, setDailySubmitted] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const currentExamInfo = EXAM_TYPES_CONFIG.find(e => e.id === selectedExamType) || EXAM_TYPES_CONFIG[0];

  const handleDailyOptionClick = (index: number) => {
    if (dailySubmitted) return;
    setDailySelected(index);
    setDailySubmitted(true);
    const isCorrect = index === dailyQuestion.correctIndex;
    onAnswerDailyQuestion(isCorrect, dailyQuestion);
  };

  const accuracy = userStats.totalAnswered > 0
    ? Math.round((userStats.totalCorrect / userStats.totalAnswered) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome & Exam Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ÖSYM İSG Sınavlarına Hazırlık & Saha Asistanı</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentExamInfo.name} Portalı
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              6331 Sayılı Kanun, güncel yönetmelikler, ÖSYM soru kalıpları, hap bilgi kartları ve yapay zeka destekli soru çözümü ile sınavı ilk girişte geçin.
            </p>

            {/* Exam selector quick pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {EXAM_TYPES_CONFIG.map((et) => (
                  <button
                    key={et.id}
                    onClick={() => setSelectedExamType(et.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedExamType === et.id
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-900/30'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {et.shortName}
                  </button>
                ))}
              </div>

              {/* Rapor İndir (PDF) Action Button */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all shadow-xs cursor-pointer ml-auto sm:ml-0"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Rapor İndir (PDF)</span>
              </button>
            </div>
          </div>

          {/* Target Score & Status Badge */}
          <div className="bg-slate-900/80 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-slate-700 text-center shrink-0 min-w-[220px] shadow-lg space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>ÖSYM HEDEF DURUMU</span>
            </div>
            <div className="text-2xl font-black tracking-tight text-white font-mono">
              70+ <span className="text-sm font-normal text-emerald-400">PUAN</span>
            </div>
            <p className="text-[11px] text-slate-400">50 Soruda en az 35 Net Hedefi</p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>Sınav Süresi:</span>
              <span className="font-mono text-slate-200">75 Dakika</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sınav Geri Sayım & Günlük Çalışma Hedefi İlerleme Kartı (ProgressBar) */}
      <ExamCountdownCard
        selectedExamType={selectedExamType}
        userStats={userStats}
        onStartPractice={() => setActiveTab('questions')}
        onStartExamSimulator={() => setActiveTab('exam-simulator')}
      />

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Çözülen Soru</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{userStats.totalAnswered}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">{userStats.totalCorrect} Doğru</span> •{' '}
            <span className="text-rose-400 font-medium">{userStats.totalWrong} Yanlış</span>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Başarı Oranı</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">%{accuracy}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {accuracy >= 70 ? (
              <span className="text-emerald-400 font-semibold">ÖSYM Barajı Üzerinde</span>
            ) : (
              <span className="text-amber-400 font-medium">Hedef: %70+ Net</span>
            )}
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shadow-xs cursor-pointer hover:border-slate-600 transition-colors" onClick={() => setActiveTab('questions')}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hata Defteri</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{userStats.wrongQuestionIds.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Tekrar çözülecek soru</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shadow-xs cursor-pointer hover:border-slate-600 transition-colors" onClick={() => setActiveTab('flashcards')}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Favori Hap Bilgiler</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{userStats.favoriteCardIds.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Kayıtlı ezber kartı</div>
        </div>
      </div>

      {/* AI Sınav Koçu: Zayıf Nokta Analizi & Bir Sonraki Çalışma Konusu */}
      <AIStudyRecommendationCard
        userStats={userStats}
        selectedExamType={selectedExamType}
        onNavigateToTopicQuestions={(topicKey) => {
          if (onSelectTopicForPractice) {
            onSelectTopicForPractice(topicKey as any);
          } else {
            setActiveTab('questions');
          }
        }}
        onNavigateToFlashcards={() => setActiveTab('flashcards')}
        onNavigateToAIAssistant={(initialQuestion) => {
          setActiveTab('ai-assistant');
        }}
      />

      {/* Son 7 Günlük Soru Çözme Aktivitesi & Alışkanlık Trendi Paneli (Recharts Bar & Area) */}
      <DailyActivityPanel
        userStats={userStats}
        onStartPractice={() => setActiveTab('questions')}
      />

      {/* Sınav Puan Gelişimi & Soru Çözme Hızı Çizgi Grafiği (Recharts LineChart) */}
      <ExamProgressChart
        userStats={userStats}
        onStartNewExam={() => setActiveTab('exam-simulator')}
      />

      {/* Konu Bazlı Başarı Oranı Grafiği (Recharts Visualization: Radar & Bar Chart) */}
      <TopicSuccessChart
        userStats={userStats}
        onSelectTopicForPractice={(topicKey) => {
          if (onSelectTopicForPractice) {
            onSelectTopicForPractice(topicKey);
          } else {
            setActiveTab('questions');
          }
        }}
      />

      {/* Başarı Rozetleri & Alışkanlık Analizi */}
      <AchievementBadgesSection
        userStats={userStats}
        onExploreTopic={() => setActiveTab('questions')}
        onStartExam={() => setActiveTab('exam-simulator')}
      />

      {/* Main Grid: Günün Sorusu & Hızlı Eylemler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Günün Sorusu (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="font-bold text-white text-base">Günün ÖSYM Sorusu</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                {dailyQuestion.difficulty}
              </span>
            </div>

            <p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">
              {dailyQuestion.year || 'ÖSYM İSG Sınav Kalıbı'}
            </p>
            <p className="text-sm font-medium text-slate-100 mb-5 leading-relaxed">
              {dailyQuestion.text}
            </p>

            {/* Options */}
            <div className="space-y-2.5">
              {dailyQuestion.options.map((option, idx) => {
                const isSelected = dailySelected === idx;
                const isCorrect = idx === dailyQuestion.correctIndex;
                let optionStyle = 'bg-slate-900/80 hover:bg-slate-700/80 border-slate-700 text-slate-200';

                if (dailySubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-medium';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleDailyOptionClick(idx)}
                    disabled={dailySubmitted}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start space-x-3 transition-all duration-150 ${optionStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                      dailySubmitted && isCorrect 
                        ? 'bg-emerald-600 text-white'
                        : dailySubmitted && isSelected && !isCorrect
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 mt-0.5">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {dailySubmitted && (
              <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Açıklama & Yasal Dayanak
                  </span>
                  <button
                    onClick={() => onOpenAiExplain(dailyQuestion, dailySelected)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 border border-teal-500/40 text-[11px] font-medium transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI ile Ayrıntılı İncele</span>
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed">{dailyQuestion.explanation}</p>
                <p className="text-[11px] text-slate-400 font-mono">Dayanak: {dailyQuestion.legalBasis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Feature Navigation & Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Hızlı Erişim Modülleri</h3>

          <div
            onClick={() => setActiveTab('exams')}
            className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/60 to-slate-800 border border-emerald-600/40 hover:border-emerald-500 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">ÖSYM Deneme Simülatörü</h4>
                  <p className="text-xs text-slate-300">50 Soru, Süreli, Gerçek Sınav Ortamı</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('flashcards')}
            className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">Hap Bilgiler & Ezber Kartları</h4>
                  <p className="text-xs text-slate-300">Süreler, Cezalar, Sayılar ve Şifreler</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('calculators')}
            className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">İSG Mühendislik Hesaplayıcıları</h4>
                  <p className="text-xs text-slate-300">Uzman/Hekim Süresi, KSO-KAO, 5x5 Matris</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('ai-assistant')}
            className="p-4 rounded-xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-800 border border-teal-600/40 hover:border-teal-400 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-teal-500 text-slate-950 font-black shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-teal-300 text-sm group-hover:text-white transition-colors">AI İSG Asistanı & Mevzuat Danışmanı</h4>
                  <p className="text-xs text-slate-300">6331 Kanunu ve Saha Analizleri</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Performans & Sınav Karnesi Raporu Modalı */}
      <PDFReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userStats={userStats}
        selectedExamType={selectedExamType}
      />
    </div>
  );
};
