import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  Shuffle,
  RotateCcw,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Scale,
  Zap,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { DailyTipItem, QuestionTopic } from '../types';
import { DAILY_TIPS_DATA, getTodayTip, getRandomTip } from '../data/dailyTipsData';
import { TOPIC_LABELS } from '../data/questionsData';

interface DailyTipCardProps {
  onSelectTopicForPractice?: (topic: QuestionTopic) => void;
  onNavigateToFlashcards?: () => void;
  onNavigateToAIAssistant?: (initialQuestion?: string) => void;
}

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const DailyTipCard: React.FC<DailyTipCardProps> = ({
  onSelectTopicForPractice,
  onNavigateToFlashcards,
  onNavigateToAIAssistant,
}) => {
  const [currentTip, setCurrentTip] = useState<DailyTipItem>(getTodayTip());
  const [isTodayTip, setIsTodayTip] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('isg_saved_daily_tips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Calculate today's formatted date string
  const todayLabel = React.useMemo(() => {
    const d = new Date();
    return `${d.getDate()} ${TURKISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const todayTipId = React.useMemo(() => getTodayTip().id, []);

  // Sync isTodayTip when tip changes
  useEffect(() => {
    setIsTodayTip(currentTip.id === todayTipId);
  }, [currentTip, todayTipId]);

  const handleNextRandomTip = () => {
    const nextTip = getRandomTip(currentTip.id);
    setCurrentTip(nextTip);
  };

  const handleResetToToday = () => {
    setCurrentTip(getTodayTip());
  };

  const handleCopy = () => {
    const textToCopy = `📌 [İSG Günlük İpucu] ${currentTip.title}\n⚖️ ${currentTip.keyRule}\n\n📖 Açıklama: ${currentTip.explanation}\n${currentTip.mnemonic ? `💡 Şifre: ${currentTip.mnemonic}\n` : ''}📜 Mevzuat: ${currentTip.legalBasis}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = () => {
    const isSaved = savedFavorites.includes(currentTip.id);
    const updated = isSaved
      ? savedFavorites.filter((id) => id !== currentTip.id)
      : [...savedFavorites, currentTip.id];
    setSavedFavorites(updated);
    try {
      localStorage.setItem('isg_saved_daily_tips', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const isCurrentFavorite = savedFavorites.includes(currentTip.id);
  const topicMeta = TOPIC_LABELS[currentTip.topic] || { label: currentTip.topic, color: 'text-teal-400' };

  // Type styling
  const getTypeBadge = () => {
    switch (currentTip.type) {
      case 'mevzuat':
        return {
          icon: <Scale className="w-3.5 h-3.5 text-sky-400" />,
          bg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
          label: currentTip.typeLabel,
        };
      case 'pratik_bilgi':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          label: currentTip.typeLabel,
        };
      case 'osym_tuzak':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          label: currentTip.typeLabel,
        };
    }
  };

  const typeBadge = getTypeBadge();

  // Find index in tip collection
  const currentTipIndex = DAILY_TIPS_DATA.findIndex((t) => t.id === currentTip.id) + 1;

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-md relative overflow-hidden space-y-4">
      {/* Decorative subtle ambient backdrop glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-1.5">
                <span>Günün İpucu</span>
                <span className="text-slate-400 font-normal text-sm sm:text-base">• Mevzuat & Hap Bilgi</span>
              </h2>
              {isTodayTip ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Bugünün Seçimi ({todayLabel})
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                  Rastgele İnceleme ({currentTipIndex} / {DAILY_TIPS_DATA.length})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sınavda en çok karşılaşılan kritik kanun maddeleri, süreler ve akılda kalıcı pratik şifreler
            </p>
          </div>
        </div>

        {/* Right Top Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          {!isTodayTip && (
            <button
              onClick={handleResetToToday}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
              title="Bugünün belirlenen ipucuna geri dön"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bugüne Dön</span>
            </button>
          )}

          <button
            onClick={handleNextRandomTip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Rastgele başka bir mevzuat maddesi veya ipucu getir"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Yeni İpucu Getir</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors cursor-pointer"
            title="İpucunu panoya kopyala"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isCurrentFavorite
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-600'
            }`}
            title={isCurrentFavorite ? 'Favorilerden Çıkar' : 'Favorilere Kaydet'}
          >
            {isCurrentFavorite ? (
              <BookmarkCheck className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Badges Bar */}
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${typeBadge.bg}`}>
          {typeBadge.icon}
          <span>{typeBadge.label}</span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-700 text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-teal-400" />
          <span>{topicMeta.label}</span>
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900/60 border border-slate-700/70 text-slate-400">
          <span>{currentTip.legalBasis}</span>
        </span>
      </div>

      {/* Tip Content Body */}
      <div className="relative z-10 space-y-3">
        {/* Main Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {currentTip.title}
        </h3>

        {/* Highlighted Golden Rule Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-400 rounded-r-xl p-3.5 sm:p-4 text-amber-100 font-semibold text-sm sm:text-base leading-relaxed shadow-xs">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
            <span>{currentTip.keyRule}</span>
          </div>
        </div>

        {/* Detailed Explanation */}
        <p className="text-sm text-slate-300 leading-relaxed pt-0.5">
          {currentTip.explanation}
        </p>

        {/* Mnemonic / Kodlama Box (If available) */}
        {currentTip.mnemonic && (
          <div className="bg-slate-900/90 border border-teal-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-teal-200">
            <div className="p-1 rounded-md bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-teal-300 mr-1.5">Akılda Tutma Şifresi / Kodlama:</span>
              <span className="font-mono text-teal-100 font-medium">{currentTip.mnemonic}</span>
            </div>
          </div>
        )}

        {/* Exam Trap Warning (If available) */}
        {currentTip.examTip && (
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-200">
            <div className="p-1 rounded-md bg-rose-500/20 text-rose-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-rose-300 mr-1.5">ÖSYM Soru Tuzağı:</span>
              <span className="text-rose-100/90">{currentTip.examTip}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation & Practice Shortcuts */}
      <div className="relative z-10 pt-2 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Konu:</span>
          <span className="text-slate-200 font-semibold">{topicMeta.label}</span>
          {currentTip.tags && (
            <span className="hidden sm:flex items-center gap-1 ml-2">
              {currentTip.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px]">
                  #{tag}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-2">
          {onSelectTopicForPractice && (
            <button
              onClick={() => onSelectTopicForPractice(currentTip.topic)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-teal-300 hover:text-teal-200 font-semibold transition-colors cursor-pointer border border-slate-600"
            >
              <span>Bu Konudan Soru Çöz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateToFlashcards && (
            <button
              onClick={onNavigateToFlashcards}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold transition-colors cursor-pointer border border-amber-500/30"
            >
              <span>Tüm Ezber Kartları</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateToAIAssistant && (
            <button
              onClick={() => onNavigateToAIAssistant(`Bana "${currentTip.title}" konusu ve "${currentTip.legalBasis}" hakkında detaylı bilgi ve ÖSYM'de gelebilecek soru kalıplarını açıklar mısın?`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-semibold transition-colors cursor-pointer border border-teal-500/30"
              title="AI Sınav Koçuna bu konuyu sor"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hocaya Sor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
