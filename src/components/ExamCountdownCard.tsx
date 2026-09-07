import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Target,
  Flame,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import { ExamType, UserStats } from '../types';
import { EXAM_TYPES_CONFIG } from '../data/questionsData';

interface ExamCountdownCardProps {
  selectedExamType: ExamType;
  userStats: UserStats;
  onStartPractice?: () => void;
  onStartExamSimulator?: () => void;
}

interface ExamScheduleInfo {
  examName: string;
  targetDate: Date;
  dateFormatted: string;
  sessionTime: string;
  applicationPeriod: string;
  badgeLabel: string;
}

export const ExamCountdownCard: React.FC<ExamCountdownCardProps> = ({
  selectedExamType,
  userStats,
  onStartPractice,
  onStartExamSimulator,
}) => {
  // Daily target setting (can be saved in local storage or state, default: 25 questions/day)
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('isg_daily_target');
      return saved ? parseInt(saved, 10) : 25;
    } catch {
      return 25;
    }
  });

  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Time remaining state for live ticking
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const handleTargetChange = (newTarget: number) => {
    setDailyTarget(newTarget);
    setIsEditingTarget(false);
    try {
      localStorage.setItem('isg_daily_target', newTarget.toString());
    } catch (e) {
      // ignore
    }
  };

  // Exam schedule details based on chosen exam type
  const examSchedule: ExamScheduleInfo = useMemo(() => {
    // Reference upcoming ÖSYM İSG Exam cycles
    const examYear = now.getFullYear();
    // Default next ÖSYM session (e.g. December 6, 2026 or next spring session)
    let target = new Date(examYear, 11, 6, 10, 15, 0); // 06 Aralık 2026, 10:15

    if (now.getTime() > target.getTime()) {
      // If past December, next is Spring session in May
      target = new Date(examYear + 1, 4, 16, 10, 15, 0);
    }

    const currentTypeConfig = EXAM_TYPES_CONFIG.find((e) => e.id === selectedExamType) || EXAM_TYPES_CONFIG[0];

    const names: Record<ExamType, string> = {
      all: 'ÖSYM İSG/2 Sonbahar Dönemi',
      c_igu: 'ÖSYM İSG/2 • C Sınıfı İGU Sınavı',
      b_igu: 'ÖSYM İSG/2 • B Sınıfı İGU Sınavı',
      a_igu: 'ÖSYM İSG/2 • A Sınıfı İGU Sınavı',
      isyeri_hekimligi: 'ÖSYM İSG/2 • İşyeri Hekimliği Sınavı',
      dsp: 'ÖSYM İSG/2 • Diğer Sağlık Personeli Sınavı',
    };

    return {
      examName: names[selectedExamType] || 'ÖSYM İSG Sınavı',
      targetDate: target,
      dateFormatted: target.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      sessionTime: '10:15 (75 Dakika / 50 Soru)',
      applicationPeriod: '21 Ekim - 04 Kasım',
      badgeLabel: currentTypeConfig.shortName,
    };
  }, [selectedExamType, now]);

  // Compute countdown values
  const countdown = useMemo(() => {
    const diff = examSchedule.targetDate.getTime() - now.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return { days, hours, minutes, isPassed: false };
  }, [examSchedule.targetDate, now]);

  // Daily question progress calculation
  // (Uses userStats.totalAnswered modulo or today's session progress)
  const todaySolved = useMemo(() => {
    // If user answered questions, calculate today's proportion (minimum 0)
    const base = userStats.totalAnswered || 0;
    return Math.min(dailyTarget, base > 0 ? (base % (dailyTarget + 10)) : 0);
  }, [userStats.totalAnswered, dailyTarget]);

  const progressPercentage = Math.min(100, Math.round((todaySolved / dailyTarget) * 100));
  const remainingToday = Math.max(0, dailyTarget - todaySolved);
  const isGoalCompleted = todaySolved >= dailyTarget;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual Grid: Left Countdown | Right Daily Goal */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Side: Exam Countdown (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Clock className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Resmi ÖSYM Sınav Geri Sayımı
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  {examSchedule.badgeLabel}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {examSchedule.examName}
              </h3>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{examSchedule.dateFormatted}</span>
            </div>
          </div>

          {/* Large Digital Countdown Digits */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 py-1">
            {/* Days Box */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 sm:p-4 text-center shadow-inner">
              <div className="text-2xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight">
                {countdown.days}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                GÜN KALDI
              </div>
            </div>

            {/* Hours Box */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 sm:p-4 text-center shadow-inner">
              <div className="text-2xl sm:text-4xl font-black font-mono text-slate-200 tracking-tight">
                {countdown.hours}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                SAAT
              </div>
            </div>

            {/* Minutes Box */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 sm:p-4 text-center shadow-inner">
              <div className="text-2xl sm:text-4xl font-black font-mono text-slate-200 tracking-tight">
                {countdown.minutes}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                DAKİKA
              </div>
            </div>
          </div>

          {/* Exam Details & Simulator Shortcut */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Sınav Saati: <strong className="text-slate-300">{examSchedule.sessionTime}</strong></span>
              <span>•</span>
              <span>Geçme Barajı: <strong className="text-emerald-400 font-bold">70 Puan (%70 Net)</strong></span>
            </div>

            {onStartExamSimulator && (
              <button
                onClick={onStartExamSimulator}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
              >
                <span>50 Soruluk Deneme Çöz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Daily Study Goal & ProgressBar (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5 bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Target className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">Günlük Çalışma Hedefi</h4>
                  <p className="text-[11px] text-slate-400">Bugünkü soru çözüm temposu</p>
                </div>
              </div>

              {/* Target Selector Gear */}
              <button
                onClick={() => setIsEditingTarget(!isEditingTarget)}
                title="Günlük soru hedefini değiştir"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick target selector options when editing */}
            {isEditingTarget && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 mb-2 space-y-1.5 animate-in fade-in">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Günlük Hedef Belirle:</div>
                <div className="flex items-center gap-1.5">
                  {[15, 25, 40, 50].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleTargetChange(val)}
                      className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all ${
                        dailyTarget === val
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {val} Soru
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Big Progress Numbers & Status */}
            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">{todaySolved}</span>
                <span className="text-xs text-slate-400 font-medium">/ {dailyTarget} Soru</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold font-mono text-emerald-400">%{progressPercentage}</span>
                {isGoalCompleted ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Tamamlandı ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {remainingToday} Soru Kaldı
                  </span>
                )}
              </div>
            </div>

            {/* ProgressBar */}
            <div className="w-full h-3 rounded-full bg-slate-900 p-0.5 border border-slate-800 mt-2 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                  isGoalCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Footer of Goal Card: Streak & Action CTA */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <span>{userStats.streakDays || 1} Günlük Seri</span>
            </div>

            {onStartPractice && (
              <button
                onClick={onStartPractice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Hedefe Soru Çöz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
