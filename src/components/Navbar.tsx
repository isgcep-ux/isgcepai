import React from 'react';
import { 
  Shield, 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  Calculator, 
  Scale, 
  Sparkles, 
  ClipboardCheck, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { ExamType, ExamTypeInfo } from '../types';
import { EXAM_TYPES_CONFIG } from '../data/questionsData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedExamType: ExamType;
  setSelectedExamType: (type: ExamType) => void;
  totalSaved: number;
  totalWrong: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedExamType,
  setSelectedExamType,
  totalSaved,
  totalWrong,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: GraduationCap },
    { id: 'exams', label: 'ÖSYM Denemeleri', icon: CheckSquare },
    { id: 'questions', label: 'Soru Bankası', icon: BookOpen, badge: totalWrong > 0 ? `${totalWrong} Hata` : undefined },
    { id: 'flashcards', label: 'Hap Bilgiler', icon: Sparkles },
    { id: 'calculators', label: 'İSG Hesaplayıcılar', icon: Calculator },
    { id: 'regulations', label: 'Mevzuat & Kanunlar', icon: Scale },
    { id: 'checklists', label: 'Saha Denetim', icon: ClipboardCheck },
    { id: 'ai-assistant', label: 'AI Asistan', icon: Sparkles, isAi: true },
  ];

  const currentExamInfo = EXAM_TYPES_CONFIG.find(e => e.id === selectedExamType) || EXAM_TYPES_CONFIG[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/40 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">İSG CEP</span>
                <span className="font-black text-xs uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AKADEMİ</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">ÖSYM Sınav & Saha İSG Rehberi</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                    isActive
                      ? item.isAi
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm'
                        : 'bg-emerald-700/50 text-emerald-200 border border-emerald-500/40'
                      : item.isAi
                      ? 'text-teal-300 hover:bg-teal-950/40 hover:text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.isAi ? 'text-teal-300' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-rose-500/80 text-white rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Target Exam Switcher */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 pl-2 pr-1 font-medium">Hedef:</span>
              <select
                id="exam-type-select"
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value as ExamType)}
                aria-label="Hedef Sınav Seçimi"
                className="bg-slate-900 text-white text-xs font-medium py-1 px-2 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {EXAM_TYPES_CONFIG.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <div className="mb-3 p-2 bg-slate-800 rounded-lg">
            <label className="block text-xs font-medium text-slate-300 mb-1">Hedef Sınavınız:</label>
            <select
              value={selectedExamType}
              onChange={(e) => {
                setSelectedExamType(e.target.value as ExamType);
              }}
              className="w-full bg-slate-900 text-white text-xs p-2 rounded border border-slate-600"
            >
              {EXAM_TYPES_CONFIG.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg text-xs font-medium text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
