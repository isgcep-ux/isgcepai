import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  BookOpen, 
  FileText, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { REGULATIONS_DATA } from '../data/regulationsData';

interface RegulationsViewProps {
  onAskAiAboutRegulation: (lawTitle: string) => void;
}

export const RegulationsView: React.FC<RegulationsViewProps> = ({
  onAskAiAboutRegulation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLaws, setExpandedLaws] = useState<Record<string, boolean>>({
    'reg-6331': true,
  });

  const filteredRegulations = REGULATIONS_DATA.filter((reg) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = reg.title.toLowerCase().includes(q);
      const matchSum = reg.summary.toLowerCase().includes(q);
      const matchArticles = reg.keyArticles.some(
        (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchSum && !matchArticles) return false;
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedLaws((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">İSG Mevzuat Kütüphanesi & Kanunlar</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            6331 Sayılı Kanun, İş Hukuku, Yönetmelikler ve İdari Para Cezaları Rehberi.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Kanun adı, madde no veya konu ara (Örn: Madde 14, Gece Çalışması, İSG Kurulu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Regulations List */}
      <div className="space-y-4">
        {filteredRegulations.map((reg) => {
          const isExpanded = expandedLaws[reg.id];

          return (
            <div
              key={reg.id}
              className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-md transition-all"
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(reg.id)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 hover:bg-slate-750/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {reg.category}
                    </span>
                    <span className="text-xs text-slate-400">{reg.officialDate}</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white">{reg.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">{reg.summary}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAiAboutRegulation(reg.title);
                    }}
                    className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-600/30 text-teal-300 hover:bg-teal-600/50 border border-teal-500/40 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI ile İncele</span>
                  </button>

                  <div className="p-1.5 rounded-lg bg-slate-900 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 space-y-4 border-t border-slate-700/80 pt-4 bg-slate-900/40 animate-in fade-in">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    Kritik Sınav & Saha Maddeleri
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reg.keyArticles.map((art, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{art.articleNo} - {art.title}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{art.content}</p>
                      </div>
                    ))}
                  </div>

                  {reg.penaltyInfo && (
                    <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 flex items-start space-x-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-rose-200">İdari Yaptırım & Cezalar:</span>
                        <p className="mt-0.5 text-slate-300">{reg.penaltyInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
