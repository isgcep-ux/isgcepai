import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Printer, 
  RotateCcw,
  Share2,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { FIELD_CHECKLISTS_DATA } from '../data/checklistsData';
import { FieldChecklist } from '../types';

export const ChecklistsView: React.FC = () => {
  const [checklists, setChecklists] = useState<FieldChecklist[]>(FIELD_CHECKLISTS_DATA);
  const [activeChecklistId, setActiveChecklistId] = useState<string>(checklists[0]?.id || '');
  const [inspectorName, setInspectorName] = useState('İSG Uzmanı');
  const [siteLocation, setSiteLocation] = useState('Merkez Şantiye / Tesis');

  const currentChecklist = checklists.find((c) => c.id === activeChecklistId) || checklists[0];

  const handleItemStatusChange = (itemId: string, status: 'pass' | 'fail' | 'na') => {
    setChecklists((prev) =>
      prev.map((chk) => {
        if (chk.id !== activeChecklistId) return chk;
        return {
          ...chk,
          items: chk.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
        };
      })
    );
  };

  const handleItemNoteChange = (itemId: string, note: string) => {
    setChecklists((prev) =>
      prev.map((chk) => {
        if (chk.id !== activeChecklistId) return chk;
        return {
          ...chk,
          items: chk.items.map((item) => (item.id === itemId ? { ...item, note } : item)),
        };
      })
    );
  };

  const resetCurrentChecklist = () => {
    setChecklists((prev) =>
      prev.map((chk) => {
        if (chk.id !== activeChecklistId) return chk;
        return {
          ...chk,
          items: chk.items.map((item) => ({ ...item, status: 'unselected', note: '' })),
        };
      })
    );
  };

  // Score stats
  const totalItems = currentChecklist?.items.length || 0;
  const passCount = currentChecklist?.items.filter((i) => i.status === 'pass').length || 0;
  const failCount = currentChecklist?.items.filter((i) => i.status === 'fail').length || 0;
  const naCount = currentChecklist?.items.filter((i) => i.status === 'na').length || 0;
  const scoredTotal = totalItems - naCount;
  const complianceScore = scoredTotal > 0 ? Math.round((passCount / scoredTotal) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Saha İSG Denetim & Kontrol Listeleri</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            TS EN ve İSG mevzuatına uygun interaktif saha denetim formları ve uygunluk puanlaması.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Raporu Yazdır</span>
          </button>
          <button
            onClick={resetCurrentChecklist}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Select checklist tab pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {checklists.map((chk) => (
          <button
            key={chk.id}
            onClick={() => setActiveChecklistId(chk.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold transition-all ${
              activeChecklistId === chk.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {chk.title}
          </button>
        ))}
      </div>

      {/* Active Form */}
      {currentChecklist && (
        <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-7 border border-slate-700 space-y-6 shadow-xl">
          {/* Form Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700">
            <div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {currentChecklist.category}
              </span>
              <h3 className="font-bold text-lg sm:text-xl text-white mt-1">
                {currentChecklist.title}
              </h3>
              <p className="text-xs text-slate-300">{currentChecklist.description}</p>
            </div>

            {/* Compliance Badge */}
            <div className="flex items-center space-x-4 bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-700 shrink-0">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Saha Uygunluk Skoru</div>
                <div className="text-2xl font-black font-mono text-emerald-400">%{complianceScore}</div>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="text-xs space-y-0.5">
                <div className="text-emerald-400 font-bold">{passCount} Uygun</div>
                <div className="text-rose-400 font-bold">{failCount} Uygunsuz</div>
              </div>
            </div>
          </div>

          {/* Inspector and site location inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Denetçi / İGU Adı:</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Denetim Mahalli / Şantiye:</label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Kontrol Maddeleri & Değerlendirme
            </h4>

            {currentChecklist.items.map((item, idx) => {
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.status === 'pass'
                      ? 'bg-emerald-950/20 border-emerald-600/40'
                      : item.status === 'fail'
                      ? 'bg-rose-950/30 border-rose-600/50'
                      : 'bg-slate-900/60 border-slate-700/80'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.2 rounded bg-slate-900 border border-slate-700">
                          {item.standardRef}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-100">{item.text}</p>
                    </div>

                    {/* Action buttons (Pass, Fail, N/A) */}
                    <div className="flex items-center space-x-1.5 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleItemStatusChange(item.id, 'pass')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          item.status === 'pass'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Uygun</span>
                      </button>

                      <button
                        onClick={() => handleItemStatusChange(item.id, 'fail')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          item.status === 'fail'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Uygun Değil</span>
                      </button>

                      <button
                        onClick={() => handleItemStatusChange(item.id, 'na')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          item.status === 'na'
                            ? 'bg-slate-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>K/D</span>
                      </button>
                    </div>
                  </div>

                  {/* Optional Note input */}
                  {item.status === 'fail' && (
                    <div className="mt-3 pt-2 border-t border-rose-900/40">
                      <input
                        type="text"
                        placeholder="Uygunsuzluk gerekçesi ve gereken düzeltici/önleyici faaliyet (DÖF)..."
                        value={item.note || ''}
                        onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                        className="w-full bg-slate-900/90 text-xs text-rose-200 placeholder-rose-400/60 p-2 rounded-lg border border-rose-800 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
