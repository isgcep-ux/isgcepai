import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';
import { ExamType, Question, QuestionTopic, UserStats } from '../types';
import { QUESTIONS_BANK, TOPIC_LABELS } from '../data/questionsData';

interface QuestionBankViewProps {
  selectedExamType: ExamType;
  userStats: UserStats;
  onToggleSaveQuestion: (questionId: string) => void;
  onAnswerQuestion: (isCorrect: boolean, question: Question) => void;
  onOpenAiExplain: (question: Question, userAnswerIndex: number | null) => void;
  initialTopic?: string;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  selectedExamType,
  userStats,
  onToggleSaveQuestion,
  onAnswerQuestion,
  onOpenAiExplain,
  initialTopic = 'all',
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);

  React.useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
    }
  }, [initialTopic]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'wrong' | 'saved'>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Filter questions
  const filteredQuestions = QUESTIONS_BANK.filter((q) => {
    // Topic filter
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    
    // View mode filter
    if (viewMode === 'wrong' && !userStats.wrongQuestionIds.includes(q.id)) return false;
    if (viewMode === 'saved' && !userStats.savedQuestionIds.includes(q.id)) return false;

    // Search query
    if (searchQuery.trim()) {
      const matchText = q.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLegal = q.legalBasis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchExpl = q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchText && !matchLegal && !matchExpl) return false;
    }

    return true;
  });

  const handleSelectOption = (question: Question, optionIdx: number) => {
    if (revealed[question.id]) return;

    setUserAnswers((prev) => ({ ...prev, [question.id]: optionIdx }));
    setRevealed((prev) => ({ ...prev, [question.id]: true }));

    const isCorrect = optionIdx === question.correctIndex;
    onAnswerQuestion(isCorrect, question);
  };

  const handleResetQuestion = (questionId: string) => {
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
    setRevealed((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">İSG Soru Bankası & Hata Defteri</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Konu bazlı sorular, çıkmış soru formatları ve anında yapay zeka mevzuat açıklaması.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Tüm Sorular ({QUESTIONS_BANK.length})
          </button>
          <button
            onClick={() => setViewMode('wrong')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'wrong' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-300 hover:text-rose-200'
            }`}
          >
            <span>Hatalarım</span>
            <span className="px-1.5 py-0.2 bg-rose-950 text-[10px] rounded-full font-bold">
              {userStats.wrongQuestionIds.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'saved' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <span>Kaydedilenler</span>
            <span className="px-1.5 py-0.2 bg-amber-950 text-[10px] rounded-full font-bold">
              {userStats.savedQuestionIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Topic Filters */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Soru metni, kanun maddesi veya anahtar kelime ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>

        {/* Horizontal scrollable topic badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedTopic === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Tüm Konular
          </button>
          {Object.entries(TOPIC_LABELS).map(([topicKey, topicData]) => (
            <button
              key={topicKey}
              onClick={() => setSelectedTopic(topicKey)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedTopic === topicKey
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {topicData.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-slate-800/60 rounded-2xl p-12 text-center border border-slate-700/80 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Bu filtrede soru bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Farklı bir konu seçebilir veya arama filtrenizi temizleyebilirsiniz.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isAnswered = revealed[q.id];
            const userAns = userAnswers[q.id];
            const isCorrect = userAns === q.correctIndex;
            const isSaved = userStats.savedQuestionIds.includes(q.id);
            const topicLabel = TOPIC_LABELS[q.topic]?.label || q.topic;

            return (
              <div
                key={q.id}
                className={`bg-slate-800/90 rounded-2xl p-5 sm:p-6 border transition-all ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-500/50 shadow-md shadow-emerald-950/20'
                      : 'border-rose-500/50 shadow-md shadow-rose-950/20'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 text-xs font-bold border border-slate-700">
                      Soru #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      {topicLabel}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{q.year}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onToggleSaveQuestion(q.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isSaved
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Soruya Yıldız Ekle"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => onOpenAiExplain(q, userAns ?? null)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 border border-teal-500/40 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">AI Açıkla</span>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm sm:text-base font-semibold text-slate-100 mb-5 leading-relaxed">
                  {q.text}
                </p>

                {/* Options List */}
                <div className="space-y-2.5">
                  {q.options.map((option, optIdx) => {
                    const isOptionSelected = userAns === optIdx;
                    const isOptionCorrect = optIdx === q.correctIndex;

                    let optClass = 'bg-slate-900/80 hover:bg-slate-700/70 border-slate-700 text-slate-200';
                    if (isAnswered) {
                      if (isOptionCorrect) {
                        optClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 font-bold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optClass = 'bg-rose-950/80 border-rose-500 text-rose-100 font-medium';
                      } else {
                        optClass = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q, optIdx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm flex items-start space-x-3 transition-all ${optClass}`}
                      >
                        <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                          isAnswered && isOptionCorrect
                            ? 'bg-emerald-600 text-white'
                            : isAnswered && isOptionSelected && !isOptionCorrect
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="mt-0.5">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card when answered */}
                {isAnswered && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold flex items-center gap-1.5 ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {isCorrect ? 'Doğru Cevap!' : 'Yanlış Seçim!'}
                      </span>
                      <button
                        onClick={() => handleResetQuestion(q.id)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Sıfırla</span>
                      </button>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Mevzuat: {q.legalBasis}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
