import React, { useState } from 'react';
import { Sparkles, X, BookOpen, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Question } from '../types';

interface AiExplainModalProps {
  question: Question | null;
  userAnswerIndex?: number | null;
  onClose: () => void;
}

export const AiExplainModal: React.FC<AiExplainModalProps> = ({
  question,
  userAnswerIndex,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!question) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setExplanation(null);

    const fetchExplanation = async () => {
      try {
        const res = await fetch('/api/ai/explain-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText: question.text,
            options: question.options,
            correctAnswer: `${String.fromCharCode(65 + question.correctIndex)}) ${question.options[question.correctIndex]}`,
            userAnswer: userAnswerIndex !== undefined && userAnswerIndex !== null
              ? `${String.fromCharCode(65 + userAnswerIndex)}) ${question.options[userAnswerIndex]}`
              : 'Seçim yapılmadı',
            topic: question.legalBasis || question.topic,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Açıklama alınamadı.');
        }

        if (isMounted) {
          setExplanation(data.explanation);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Yapay zeka asistanına bağlanırken bir sorun oluştu.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [question, userAnswerIndex]);

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 to-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Yapay Zeka Soru Analizi & Mevzuat</h3>
              <p className="text-xs text-slate-400">{question.legalBasis || 'İSG Sınav Müfredatı'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Snapshot */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300">
          <p className="font-medium text-slate-200 mb-1 line-clamp-2">"{question.text}"</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Doğru: {String.fromCharCode(65 + question.correctIndex)}
            </span>
            {userAnswerIndex !== undefined && userAnswerIndex !== null && (
              <span className={userAnswerIndex === question.correctIndex ? 'text-emerald-400' : 'text-rose-400'}>
                Seçiminiz: {String.fromCharCode(65 + userAnswerIndex)} {userAnswerIndex === question.correctIndex ? '✓' : '✗'}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm leading-relaxed text-slate-200">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-slate-400">İSG Mevzuatı taranıyor ve analiz hazırlanıyor...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200 mb-1">Analiz Yüklenemedi</p>
                <p>{error}</p>
                <p className="mt-2 text-slate-400">Not: Standart soru açıklaması: {question.explanation}</p>
              </div>
            </div>
          )}

          {explanation && (
            <div className="prose prose-invert prose-emerald max-w-none text-xs sm:text-sm whitespace-pre-line">
              {explanation}
            </div>
          )}

          {/* Quick Static Tip if available */}
          {!loading && !explanation && (
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
              <h4 className="font-semibold text-emerald-400 text-xs mb-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Standart Çözüm & Gerekçe:
              </h4>
              <p className="text-slate-300 text-xs">{question.explanation}</p>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">Yasal Dayanak: {question.legalBasis}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center text-xs text-slate-400">
          <span>İSG Cep Akademi AI Motoru</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
