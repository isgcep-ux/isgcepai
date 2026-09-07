import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Bookmark, 
  Rotate3d, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb, 
  Scale, 
  Check, 
  X,
  Maximize2
} from 'lucide-react';
import { FlashCard, QuestionTopic, UserStats } from '../types';
import { FLASHCARDS_DATA } from '../data/flashcardsData';
import { TOPIC_LABELS } from '../data/questionsData';

interface FlashcardsViewProps {
  userStats: UserStats;
  onToggleFavoriteCard: (cardId: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  userStats,
  onToggleFavoriteCard,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [memorizedCards, setMemorizedCards] = useState<Record<string, boolean>>({});
  const [carouselMode, setCarouselMode] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const filteredCards = FLASHCARDS_DATA.filter((card) => {
    if (selectedTopic !== 'all' && card.category !== selectedTopic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchSum = card.summary.toLowerCase().includes(q);
      const matchCode = card.codeTrick?.toLowerCase().includes(q);
      if (!matchTitle && !matchSum && !matchCode) return false;
    }
    return true;
  });

  const toggleFlip = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const toggleMemorized = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemorizedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">İSG Hap Bilgiler & Ezber Kartları</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sınavda en çok çıkan süreler, sayılar, cezalar ve pratik ezberleme kodları.
          </p>
        </div>

        <button
          onClick={() => setCarouselMode(!carouselMode)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Maximize2 className="w-4 h-4" />
          <span>{carouselMode ? 'Kart Listesine Dön' : 'Ezberleme Modunu Aç'}</span>
        </button>
      </div>

      {/* Search & Topic Filters */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Hap bilgi veya ezber kodu ara (Örn: 2-4-6, gürültü, bildirim süresi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedTopic === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Tüm Konular ({FLASHCARDS_DATA.length})
          </button>
          {Object.entries(TOPIC_LABELS).map(([key, data]) => {
            const count = FLASHCARDS_DATA.filter((c) => c.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedTopic(key)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedTopic === key
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {data.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Carousel / Focus Study Mode */}
      {carouselMode && filteredCards.length > 0 && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700 max-w-xl mx-auto space-y-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kart {carouselIndex + 1} / {filteredCards.length}</span>
            <span className="text-amber-400 font-semibold">{filteredCards[carouselIndex].importance} Önem Derecesi</span>
          </div>

          {/* Active Card Body */}
          {(() => {
            const card = filteredCards[carouselIndex];
            const isFlipped = flippedCards[card.id];
            const isFav = userStats.favoriteCardIds.includes(card.id);

            return (
              <div
                onClick={() => toggleFlip(card.id)}
                className={`min-h-[260px] rounded-2xl p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-gradient-to-br from-slate-800 to-emerald-950/80 border-emerald-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                      {TOPIC_LABELS[card.category]?.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoriteCard(card.id);
                        }}
                        className="text-slate-400 hover:text-amber-400"
                      >
                        <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <Rotate3d className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg sm:text-xl text-white mb-3">
                    {card.title}
                  </h3>

                  {!isFlipped ? (
                    <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700 text-sm font-semibold text-emerald-300">
                      {card.summary}
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs sm:text-sm text-slate-200 animate-in fade-in">
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {card.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      {card.codeTrick && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-start gap-1.5">
                          <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                          <span>{card.codeTrick}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{isFlipped ? 'Kartı çevirmek için tıkla' : 'Detayları görmek için tıkla'}</span>
                  <span className="font-mono">{card.legalRef}</span>
                </div>
              </div>
            );
          })()}

          {/* Carousel Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={carouselIndex === 0}
              onClick={() => setCarouselIndex((p) => Math.max(0, p - 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex space-x-2">
              <button
                onClick={(e) => toggleMemorized(filteredCards[carouselIndex].id, e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  memorizedCards[filteredCards[carouselIndex].id]
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{memorizedCards[filteredCards[carouselIndex].id] ? 'Ezberlendi' : 'Ezberledim'}</span>
              </button>
            </div>

            <button
              disabled={carouselIndex === filteredCards.length - 1}
              onClick={() => setCarouselIndex((p) => Math.min(filteredCards.length - 1, p + 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Standard Grid View */}
      {!carouselMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCards.map((card) => {
            const isFlipped = flippedCards[card.id];
            const isFav = userStats.favoriteCardIds.includes(card.id);
            const isMem = memorizedCards[card.id];

            return (
              <div
                key={card.id}
                onClick={() => toggleFlip(card.id)}
                className={`rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isMem
                    ? 'bg-emerald-950/20 border-emerald-500/40 opacity-80'
                    : isFlipped
                    ? 'bg-gradient-to-br from-slate-800 to-emerald-950/60 border-emerald-500 shadow-md'
                    : 'bg-slate-800/90 border-slate-700 hover:border-slate-600 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                      {TOPIC_LABELS[card.category]?.label}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoriteCard(card.id);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-400"
                        title="Favorilere Ekle"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <Rotate3d className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white mb-2.5">
                    {card.title}
                  </h3>

                  {!isFlipped ? (
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs font-semibold text-emerald-300">
                      {card.summary}
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs text-slate-200 animate-in fade-in">
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {card.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      {card.codeTrick && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-start gap-1">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                          <span>{card.codeTrick}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono truncate max-w-[160px]">{card.legalRef}</span>
                  <button
                    onClick={(e) => toggleMemorized(card.id, e)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      isMem ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {isMem ? 'Ezberlendi' : 'Ezberle'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
