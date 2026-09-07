import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  Award, 
  CheckSquare, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamType, MockExam, Question, UserStats } from '../types';
import { SAMPLE_MOCK_EXAMS, QUESTIONS_BANK } from '../data/questionsData';

interface ExamSimulatorViewProps {
  selectedExamType: ExamType;
  onSaveExamResult: (result: {
    examId: string;
    examTitle: string;
    score: number;
    correct: number;
    wrong: number;
    empty: number;
    passed: boolean;
  }) => void;
  onOpenAiExplain: (question: Question, userAnswerIndex: number | null) => void;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({
  selectedExamType,
  onSaveExamResult,
  onOpenAiExplain,
}) => {
  const [activeExam, setActiveExam] = useState<(MockExam & { questions: Question[] }) | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qIdx -> optionIdx
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Filter exams by selected exam type
  const availableExams = SAMPLE_MOCK_EXAMS.filter(
    (e) => selectedExamType === 'all' || e.targetExam === selectedExamType || e.targetExam === 'c_igu'
  );

  const startExam = (exam: MockExam) => {
    // Generate questions for exam: take questions matching exam type or standard bank
    const examQuestions = [...QUESTIONS_BANK].slice(0, exam.questionCount);
    const fullExam: MockExam & { questions: Question[] } = {
      ...exam,
      questions: examQuestions,
    };

    setActiveExam(fullExam);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setFlagged({});
    setSecondsRemaining(exam.durationMinutes * 60);
    setIsSubmitted(false);
    setShowConfirmSubmit(false);
  };

  // Timer countdown effect
  useEffect(() => {
    if (!activeExam || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, isSubmitted]);

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optIdx,
    }));
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQuestionIdx]: !prev[currentQuestionIdx],
    }));
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    setIsSubmitted(true);
    setShowConfirmSubmit(false);

    // Calculate score
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    activeExam.questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (userAns === undefined) {
        empty++;
      } else if (userAns === q.correctIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    // Score out of 100 (ÖSYM 70 pass threshold)
    const score = Math.round((correct / activeExam.questions.length) * 100);
    const passed = score >= 70;

    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    onSaveExamResult({
      examId: activeExam.id,
      examTitle: activeExam.title,
      score,
      correct,
      wrong,
      empty,
      passed,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // View: Exam Selection Menu
  if (!activeExam) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">ÖSYM İSG Deneme Sınavları</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Gerçek sınav formatında, süreli ve anında detaylı sonuç analizli denemeler.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
            <span>ÖSYM Geçme Barajı:</span>
            <span className="text-emerald-400 font-bold">70 Puan (%70 Doğru)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {availableExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/60 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {exam.difficulty}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {exam.durationMinutes} Dakika
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> {exam.questionCount} Soru
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {exam.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Tam ÖSYM Arayüzü</span>
                <button
                  onClick={() => startExam(exam)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all group-hover:scale-102"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Sınavı Başlat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = activeExam.questions[currentQuestionIdx];
  const totalQ = activeExam.questions.length;
  const answeredCount = Object.keys(answers).length;

  // View: Completed Exam Score Card
  if (isSubmitted) {
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    activeExam.questions.forEach((q, idx) => {
      const uAns = answers[idx];
      if (uAns === undefined) empty++;
      else if (uAns === q.correctIndex) correct++;
      else wrong++;
    });

    const score = Math.round((correct / totalQ) * 100);
    const passed = score >= 70;

    return (
      <div className="space-y-6 pb-12">
        <div className="bg-slate-800/95 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl">
          {/* Header Result */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h2 className="text-2xl font-black text-white">
              {passed ? 'TEBRİKLER! ÖSYM BARAJINI GEÇTİNİZ' : 'SINAV TAMAMLANDI'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {passed
                ? '70 ve üzeri puan alarak ÖSYM İSG sınav kriterini başarıyla sağladınız.'
                : 'ÖSYM İSG sınavında başarılı sayılmak için en az 70 puan (50 soruda 35 doğru) almanız gerekmektedir.'}
            </p>

            <div className="text-4xl sm:text-5xl font-black font-mono my-4 text-white">
              {score} <span className="text-lg font-normal text-slate-400">/ 100 Puan</span>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-700">
              <div>
                <div className="text-xs text-slate-400">Doğru</div>
                <div className="text-xl font-bold text-emerald-400">{correct}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Yanlış</div>
                <div className="text-xl font-bold text-rose-400">{wrong}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Boş</div>
                <div className="text-xl font-bold text-slate-400">{empty}</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => startExam(activeExam)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Çöz</span>
              </button>
              <button
                onClick={() => setActiveExam(null)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Deneme Listesine Dön</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Soru ve Cevap İncelemesi</h3>
          {activeExam.questions.map((q, idx) => {
            const userAns = answers[idx];
            const isCorrect = userAns === q.correctIndex;
            const isEmpty = userAns === undefined;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isEmpty
                    ? 'bg-slate-800/60 border-slate-700'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-400">Soru {idx + 1}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isEmpty
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {isCorrect ? 'Doğru' : isEmpty ? 'Boş' : 'Yanlış'}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenAiExplain(q, userAns ?? null)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 border border-teal-500/40 text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI ile Açıkla</span>
                  </button>
                </div>

                <p className="text-sm font-medium text-slate-100 mb-4">{q.text}</p>

                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIdx) => {
                    const isQCorrect = optIdx === q.correctIndex;
                    const isSelected = userAns === optIdx;

                    let optClass = 'bg-slate-900/60 border-slate-800 text-slate-300';
                    if (isQCorrect) {
                      optClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected && !isQCorrect) {
                      optClass = 'bg-rose-950/80 border-rose-500 text-rose-200 font-medium';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 ${optClass}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isQCorrect
                            ? 'bg-emerald-600 text-white'
                            : isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700/80 text-xs text-slate-300">
                  <p className="font-semibold text-emerald-400 mb-1">Mevzuat Gerekçesi:</p>
                  <p>{q.explanation}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">{q.legalBasis}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // View: Live Sınav Ekranı (Exam taking mode)
  return (
    <div className="space-y-4 pb-12">
      {/* Top Fixed Control Bar */}
      <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-3.5 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (window.confirm('Sınavdan çıkmak istediğinize emin misiniz? İlerlemeniz kaydedilmeyecektir.')) {
                setActiveExam(null);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-xs">
              {activeExam.title}
            </h3>
            <div className="text-[11px] text-slate-400">
              Cevaplanan: <span className="text-emerald-400 font-bold">{answeredCount}</span> / {totalQ}
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
            secondsRemaining < 300 
              ? 'bg-rose-950/60 text-rose-300 border-rose-600 animate-pulse'
              : 'bg-slate-800 text-emerald-400 border-slate-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
          >
            Sınavı Bitir
          </button>
        </div>
      </div>

      {/* Question Canvas & Navigator Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question Body (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-7 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-700 text-slate-300">
                Soru {currentQuestionIdx + 1} / {totalQ}
              </span>
              <button
                onClick={handleToggleFlag}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  flagged[currentQuestionIdx]
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${flagged[currentQuestionIdx] ? 'fill-amber-400' : ''}`} />
                <span>{flagged[currentQuestionIdx] ? 'İşaretlendi' : 'Daha Sonra Bak'}</span>
              </button>
            </div>

            <p className="text-xs font-medium text-emerald-400 mb-2">{currentQ.year || 'ÖSYM İSG Soru Kalıbı'}</p>
            <p className="text-sm sm:text-base font-semibold text-slate-100 mb-6 leading-relaxed">
              {currentQ.text}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm flex items-start space-x-3 transition-all ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white font-semibold ring-1 ring-emerald-500'
                        : 'bg-slate-900/70 hover:bg-slate-700/60 border-slate-700 text-slate-200'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="mt-0.5 leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 pt-5 border-t border-slate-700/80 flex items-center justify-between">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Önceki Soru</span>
              </button>

              <button
                disabled={currentQuestionIdx === totalQ - 1}
                onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQ - 1, p + 1))}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                <span>Sonraki Soru</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">
              Soru Gezgini ({totalQ} Soru)
            </h4>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mb-4 pb-3 border-b border-slate-700">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span> Cevaplandı
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> İşaretli
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 inline-block"></span> Boş
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {activeExam.questions.map((_, idx) => {
                const isAns = answers[idx] !== undefined;
                const isFlag = flagged[idx];
                const isCurrent = currentQuestionIdx === idx;

                let gridStyle = 'bg-slate-900 text-slate-400 border-slate-700';
                if (isAns) {
                  gridStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                }
                if (isFlag) {
                  gridStyle = 'bg-amber-500 text-slate-950 border-amber-400 font-bold';
                }
                if (isCurrent) {
                  gridStyle += ' ring-2 ring-white';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${gridStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* End Exam Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 animate-in fade-in">
            <h3 className="text-lg font-bold text-white mb-2">Sınavı Tamamlamak İstiyor musunuz?</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Toplam {totalQ} sorudan <span className="text-emerald-400 font-bold">{answeredCount}</span> tanesini cevapladınız. {totalQ - answeredCount} soru boş bırakıldı.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Sınava Devam Et
              </button>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Evet, Bitir ve Puanla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
