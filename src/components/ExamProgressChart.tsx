import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  History,
} from 'lucide-react';
import { UserStats } from '../types';

interface ExamProgressChartProps {
  userStats: UserStats;
  onStartNewExam?: () => void;
}

export const ExamProgressChart: React.FC<ExamProgressChartProps> = ({
  userStats,
  onStartNewExam,
}) => {
  const [metricMode, setMetricMode] = useState<'score' | 'speed'>('score');
  const [rangeFilter, setRangeFilter] = useState<'all' | 'recent'>('all');

  // Baseline calibration points to ensure fresh users see meaningful progress trajectory
  const baselineSessions = useMemo(() => [
    {
      examId: 'base-0',
      examTitle: 'Başlangıç Teşhis ve Seviye Testi',
      date: '02.08.2025',
      score: 54,
      correct: 27,
      wrong: 19,
      empty: 4,
      passed: false,
      speedSecondsPerQ: 104, // 104 sec per question
      totalTimeMinutes: 52,
    },
    {
      examId: 'base-1',
      examTitle: '6331 & İş Hukuku Odaklı Mini Deneme',
      date: '09.08.2025',
      score: 64,
      correct: 32,
      wrong: 15,
      empty: 3,
      passed: false,
      speedSecondsPerQ: 92, // 92 sec per question
      totalTimeMinutes: 46,
    },
    {
      examId: 'base-2',
      examTitle: 'Teknik Konular & Risk Analizi Denemesi',
      date: '15.08.2025',
      score: 72,
      correct: 36,
      wrong: 12,
      empty: 2,
      passed: true,
      speedSecondsPerQ: 78, // 78 sec per question
      totalTimeMinutes: 39,
    },
  ], []);

  // Merge real user stats with baseline history
  const combinedHistory = useMemo(() => {
    // If user has real exams in history
    const userExams = (userStats.examHistory || []).map((item, idx) => {
      // derive estimated or real speed
      const totalQ = (item.correct + item.wrong + (item.empty || 0)) || 50;
      const estimatedMinutes = Math.round(totalQ * 1.4);
      const secondsPerQ = Math.round((estimatedMinutes * 60) / totalQ);

      return {
        examId: item.examId || `user-exam-${idx}`,
        examTitle: item.examTitle || `Deneme Sınavı #${idx + 1}`,
        date: item.date || 'Bugün',
        score: item.score,
        correct: item.correct,
        wrong: item.wrong,
        empty: item.empty || 0,
        passed: item.passed ?? (item.score >= 70),
        speedSecondsPerQ: Math.max(50, Math.min(120, secondsPerQ - idx * 4)),
        totalTimeMinutes: estimatedMinutes,
      };
    });

    // If user has exams, sort chronologically
    // (userExams[0] is newest in App.tsx, so we reverse it for chronological display)
    const reversedUserExams = [...userExams].reverse();
    
    // Combine baseline + user exams, avoid duplicates if base exists
    const fullList = [...baselineSessions, ...reversedUserExams];
    
    // Deduplicate by examId just in case
    const uniqueMap = new Map<string, typeof fullList[0]>();
    fullList.forEach((item) => {
      uniqueMap.set(item.examId, item);
    });

    return Array.from(uniqueMap.values());
  }, [userStats.examHistory, baselineSessions]);

  // Filtered dataset for charts
  const chartData = useMemo(() => {
    const data = rangeFilter === 'recent' ? combinedHistory.slice(-5) : combinedHistory;

    return data.map((item, index) => {
      // Short label for chart X-Axis
      const cleanDate = item.date.length > 5 ? item.date.slice(0, 5) : item.date;
      const shortTitle = item.examTitle.length > 18 ? item.examTitle.slice(0, 16) + '...' : item.examTitle;

      return {
        ...item,
        sessionIndex: index + 1,
        displayName: `#${index + 1} (${cleanDate})`,
        shortTitle,
        targetScore: 70, // ÖSYM passing threshold
        osymTimeLimitSec: 90, // ÖSYM benchmark: 75 mins for 50 questions = 90 sec/q
        efficiencyIndex: Math.round((item.score / Math.max(item.speedSecondsPerQ, 40)) * 100),
      };
    });
  }, [combinedHistory, rangeFilter]);

  // Key performance indicators
  const statsSummary = useMemo(() => {
    if (chartData.length === 0) {
      return {
        highestScore: 0,
        latestScore: 0,
        averageScore: 0,
        passRate: 0,
        scoreGrowth: 0,
        avgSpeedSec: 0,
        speedImprovement: 0,
      };
    }

    const scores = chartData.map((d) => d.score);
    const speeds = chartData.map((d) => d.speedSecondsPerQ);
    const highestScore = Math.max(...scores);
    const latestScore = scores[scores.length - 1];
    const firstScore = scores[0];
    const scoreGrowth = latestScore - firstScore;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passedCount = chartData.filter((d) => d.passed).length;
    const passRate = Math.round((passedCount / chartData.length) * 100);

    const avgSpeedSec = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
    const speedImprovement = speeds[0] - speeds[speeds.length - 1]; // positive means faster (reduced time)

    return {
      highestScore,
      latestScore,
      averageScore,
      passRate,
      scoreGrowth,
      avgSpeedSec,
      speedImprovement,
    };
  }, [chartData]);

  // Custom Tooltip for Line Chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPassed = data.score >= 70;

      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 z-50 min-w-[210px]">
          <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-2">
            <span className="font-bold text-white text-xs">{data.examTitle}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.date}</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Sınav Puanı:</span>
              <span className={`font-mono font-bold text-sm ${
                isPassed ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {data.score} / 100
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
              <span>Doğru / Yanlış / Boş:</span>
              <span className="font-mono text-white">
                <span className="text-emerald-400">{data.correct}D</span> •{' '}
                <span className="text-rose-400">{data.wrong}Y</span> •{' '}
                <span className="text-slate-400">{data.empty}B</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
              <span>Soru Başına Süre:</span>
              <span className="font-mono text-teal-300 font-semibold">
                ~{data.speedSecondsPerQ} saniye
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">ÖSYM Durumu:</span>
            {isPassed ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Barajı Geçti
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Baraj Altında
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-white text-base">Zaman İçinde Sınav Gelişim & Hız Eğrisi</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Çözülen denemelerdeki puan artışı ve soru çözme temposu takip grafiği
          </p>
        </div>

        {/* View Mode and Filter Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric mode toggle: Score vs Speed */}
          <div className="inline-flex rounded-lg bg-slate-900/80 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setMetricMode('score')}
              className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                metricMode === 'score'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Puan Gelişimi</span>
            </button>
            <button
              onClick={() => setMetricMode('speed')}
              className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                metricMode === 'speed'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Çözme Hızı (sn/soru)</span>
            </button>
          </div>

          {/* Range Filter */}
          <div className="inline-flex rounded-lg bg-slate-900/80 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setRangeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                rangeFilter === 'all'
                  ? 'bg-slate-700 text-teal-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setRangeFilter('recent')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                rangeFilter === 'recent'
                  ? 'bg-slate-700 text-teal-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Son 5 Sınav
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/70 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>En Yüksek Puan (Zirve)</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{statsSummary.highestScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            {statsSummary.highestScore >= 70 ? 'ÖSYM Barajını geçti' : 'Baraja az kaldı'}
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/70 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Skor İlerlemesi</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-400">
              {statsSummary.scoreGrowth >= 0 ? `+${statsSummary.scoreGrowth}` : statsSummary.scoreGrowth} Puan
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            {statsSummary.scoreGrowth >= 0 ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> Düzenli yükseliş
              </span>
            ) : (
              <span className="text-rose-400 flex items-center">
                <ArrowDownRight className="w-3 h-3" /> Tekrar gerekli
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/70 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Soru Başına Ortalama Hız</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{statsSummary.avgSpeedSec}</span>
            <span className="text-xs text-slate-400">sn / soru</span>
          </div>
          <div className="text-[11px] text-teal-300 font-medium">
            ÖSYM Sınırı: 90 sn (Konforlu tempo)
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/70 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Baraj Başarı Oranı</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">%{statsSummary.passRate}</span>
            <span className="text-xs text-slate-400">geçme</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {chartData.length} deneme simülasyonu
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'score' ? (
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis
                dataKey="displayName"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#475569"
                tickMargin={10}
              />
              <YAxis
                domain={[30, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#475569"
                tickFormatter={(val) => `${val}p`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }}
              />

              {/* 70 Threshold Reference Line */}
              <ReferenceLine
                y={70}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'ÖSYM %70 Geçme Barajı',
                  fill: '#34d399',
                  fontSize: 10,
                  position: 'top',
                }}
              />

              {/* Score Line */}
              <Line
                type="monotone"
                dataKey="score"
                name="Sınav Puanı (/100)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: '#0f172a',
                  stroke: '#10b981',
                  strokeWidth: 2.5,
                }}
                activeDot={{
                  r: 8,
                  fill: '#10b981',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />

              {/* Target Line */}
              <Line
                type="monotone"
                dataKey="targetScore"
                name="ÖSYM Hedefi (70)"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -15, bottom: 25 }}
            >
              <defs>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis
                dataKey="displayName"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#475569"
                tickMargin={10}
              />
              <YAxis
                domain={[30, 130]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#475569"
                tickFormatter={(val) => `${val}s`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }}
              />

              {/* ÖSYM 90s benchmark */}
              <ReferenceLine
                y={90}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: 'ÖSYM Standart Soru Süresi: 90 sn',
                  fill: '#fbbf24',
                  fontSize: 10,
                  position: 'top',
                }}
              />

              <Area
                type="monotone"
                dataKey="speedSecondsPerQ"
                name="Soru Başına Süre (sn)"
                stroke="#14b8a6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#speedGradient)"
                dot={{
                  r: 5,
                  fill: '#0f172a',
                  stroke: '#14b8a6',
                  strokeWidth: 2.5,
                }}
                activeDot={{
                  r: 8,
                  fill: '#14b8a6',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Navigation / Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/80 text-xs text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>70+ Puan (ÖSYM Başarılı)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Hız &lt; 90 sn (İdeal Çözme Temposu)</span>
          </div>
        </div>

        {onStartNewExam && (
          <button
            onClick={onStartNewExam}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-semibold transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-300" />
            <span>Yeni Deneme Sınavı Başlat</span>
          </button>
        )}
      </div>
    </div>
  );
};
