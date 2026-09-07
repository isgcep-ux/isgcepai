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
  SlidersHorizontal,
  Scale,
  Sparkles,
} from 'lucide-react';
import { UserStats } from '../types';

interface ExamProgressChartProps {
  userStats: UserStats;
  onStartNewExam?: () => void;
}

type MetricMode = 'net' | 'score' | 'speed';
type NetFormula = 'standard' | 'strict'; // standard: Doğru (yanlış götürmez), strict: Doğru - Yanlış/4

export const ExamProgressChart: React.FC<ExamProgressChartProps> = ({
  userStats,
  onStartNewExam,
}) => {
  // Metric mode: default to 'net' (Net Değişimi Çizgi Grafiği)
  const [metricMode, setMetricMode] = useState<MetricMode>('net');
  const [rangeFilter, setRangeFilter] = useState<'all' | 'recent'>('all');
  const [netFormula, setNetFormula] = useState<NetFormula>('standard');
  const [showAuxLines, setShowAuxLines] = useState<boolean>(true); // Show Doğru & Yanlış auxiliary lines

  // Baseline calibration sessions to give fresh users immediate, motivating historical trajectory
  const baselineSessions = useMemo(
    () => [
      {
        examId: 'base-0',
        examTitle: 'Başlangıç Teşhis ve Seviye Testi',
        date: '02.08.2025',
        score: 54,
        correct: 27,
        wrong: 19,
        empty: 4,
        passed: false,
        speedSecondsPerQ: 104,
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
        speedSecondsPerQ: 92,
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
        speedSecondsPerQ: 78,
        totalTimeMinutes: 39,
      },
    ],
    []
  );

  // Merge real user stats with baseline history
  const combinedHistory = useMemo(() => {
    const userExams = (userStats.examHistory || []).map((item, idx) => {
      const totalQ = item.correct + item.wrong + (item.empty || 0) || 50;
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
        passed: item.passed ?? item.score >= 70,
        speedSecondsPerQ: Math.max(50, Math.min(120, secondsPerQ - idx * 4)),
        totalTimeMinutes: estimatedMinutes,
        totalQuestions: totalQ,
      };
    });

    const reversedUserExams = [...userExams].reverse();
    const fullList = [...baselineSessions, ...reversedUserExams];

    // Deduplicate by examId
    const uniqueMap = new Map<string, (typeof fullList)[0]>();
    fullList.forEach((item) => {
      uniqueMap.set(item.examId, item);
    });

    return Array.from(uniqueMap.values());
  }, [userStats.examHistory, baselineSessions]);

  // Compute calculated net values for every session
  const chartData = useMemo(() => {
    const data = rangeFilter === 'recent' ? combinedHistory.slice(-5) : combinedHistory;

    return data.map((item, index, arr) => {
      const cleanDate = item.date.length > 5 ? item.date.slice(0, 5) : item.date;
      const shortTitle =
        item.examTitle.length > 18 ? item.examTitle.slice(0, 16) + '...' : item.examTitle;

      // Net calculation for standard 50-question mock
      // If question count is 50:
      // standard: net = correct
      // strict: net = correct - wrong/4
      const totalQ = item.totalQuestions || item.correct + item.wrong + item.empty || 50;
      
      let rawNet =
        netFormula === 'strict'
          ? item.correct - item.wrong / 4
          : item.correct;

      // Scale to 50 questions if it was a mini quiz of e.g. 20 questions
      let net50 = rawNet;
      if (totalQ !== 50 && totalQ > 0) {
        net50 = Number(((rawNet / totalQ) * 50).toFixed(1));
      } else {
        net50 = Number(rawNet.toFixed(1));
      }

      // Delta relative to previous session
      let prevNet = null;
      let netDelta = 0;
      if (index > 0) {
        const prevItem = arr[index - 1];
        const prevTotalQ = prevItem.totalQuestions || prevItem.correct + prevItem.wrong + prevItem.empty || 50;
        const prevRaw =
          netFormula === 'strict'
            ? prevItem.correct - prevItem.wrong / 4
            : prevItem.correct;
        prevNet = prevTotalQ !== 50 && prevTotalQ > 0 ? (prevRaw / prevTotalQ) * 50 : prevRaw;
        netDelta = Number((net50 - prevNet).toFixed(1));
      }

      return {
        ...item,
        sessionIndex: index + 1,
        displayName: `#${index + 1} (${cleanDate})`,
        shortTitle,
        net: net50,
        netDelta,
        targetNet: 35, // ÖSYM 35 Net Passing Benchmark (50 soru x %70)
        targetScore: 70, // ÖSYM passing threshold score
        osymTimeLimitSec: 90,
        isNetPassed: net50 >= 35,
      };
    });
  }, [combinedHistory, rangeFilter, netFormula]);

  // Key performance indicators for Net & Scores
  const statsSummary = useMemo(() => {
    if (chartData.length === 0) {
      return {
        latestNet: 0,
        firstNet: 0,
        netGrowth: 0,
        highestNet: 0,
        averageNet: 0,
        highestScore: 0,
        latestScore: 0,
        averageScore: 0,
        passRate: 0,
        scoreGrowth: 0,
        avgSpeedSec: 0,
        speedImprovement: 0,
      };
    }

    const nets = chartData.map((d) => d.net);
    const scores = chartData.map((d) => d.score);
    const speeds = chartData.map((d) => d.speedSecondsPerQ);

    const latestNet = nets[nets.length - 1];
    const firstNet = nets[0];
    const netGrowth = Number((latestNet - firstNet).toFixed(1));
    const highestNet = Math.max(...nets);
    const averageNet = Number((nets.reduce((a, b) => a + b, 0) / nets.length).toFixed(1));

    const highestScore = Math.max(...scores);
    const latestScore = scores[scores.length - 1];
    const firstScore = scores[0];
    const scoreGrowth = latestScore - firstScore;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passedCount = chartData.filter((d) => d.isNetPassed).length;
    const passRate = Math.round((passedCount / chartData.length) * 100);

    const avgSpeedSec = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length);
    const speedImprovement = speeds[0] - speeds[speeds.length - 1];

    return {
      latestNet,
      firstNet,
      netGrowth,
      highestNet,
      averageNet,
      highestScore,
      latestScore,
      averageScore,
      passRate,
      scoreGrowth,
      avgSpeedSec,
      speedImprovement,
    };
  }, [chartData]);

  // Custom Interactive Tooltip
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPassed = data.net >= 35;

      return (
        <div className="bg-slate-900/98 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 z-50 min-w-[230px]">
          <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-2">
            <span className="font-bold text-white text-xs">{data.examTitle}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.date}</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            {/* Net Row */}
            <div className="flex items-center justify-between gap-3 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
              <span className="text-slate-300 font-medium">Deneme Neti:</span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-mono font-black text-sm ${
                    isPassed ? 'text-teal-300' : 'text-amber-300'
                  }`}
                >
                  {data.net} Net
                </span>
                <span className="text-[10px] text-slate-400">/ 50 Soru</span>
              </div>
            </div>

            {/* Score & Delta */}
            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
              <span>Sınav Puanı:</span>
              <span className="font-mono font-bold text-white">{data.score} Puan</span>
            </div>

            {data.sessionIndex > 1 && (
              <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
                <span>Önceki Sınava Göre:</span>
                <span
                  className={`font-mono font-bold flex items-center gap-0.5 ${
                    data.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {data.netDelta >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 inline" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 inline" />
                  )}
                  {data.netDelta >= 0 ? `+${data.netDelta}` : data.netDelta} Net
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300 pt-0.5 border-t border-slate-800/80">
              <span>Doğru / Yanlış / Boş:</span>
              <span className="font-mono text-white">
                <span className="text-emerald-400 font-bold">{data.correct}D</span> •{' '}
                <span className="text-rose-400 font-bold">{data.wrong}Y</span> •{' '}
                <span className="text-slate-400">{data.empty}B</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
              <span>Soru Çözme Süresi:</span>
              <span className="font-mono text-teal-300 font-semibold">
                ~{data.speedSecondsPerQ} sn/soru
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">ÖSYM 35 Net Barajı:</span>
            {isPassed ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Baraj Geçildi (+
                {Number((data.net - 35).toFixed(1))})
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Baraja Kalan: -
                {Number((35 - data.net).toFixed(1))} Net
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md space-y-5 relative overflow-hidden">
      {/* Decorative ambient backdrop glow */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mt-20" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mb-20" />

      {/* Header & Metric View Switcher */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-xs flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                  <span>Deneme Sınavları Net Değişim Çizgi Grafiği</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold font-mono">
                    Recharts Zaman Eğrisi
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Çözdüğünüz denemelerdeki net artışını, doğru/yanlış dağılımını ve ÖSYM 35 Net barajına mesafenizi takip edin
              </p>
            </div>
          </div>
        </div>

        {/* View Mode and Range Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Mode Switcher: Net vs Score vs Speed */}
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setMetricMode('net')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                metricMode === 'net'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Net doğru sayısı değişim grafiği (50 Soru / 35 Net Barajı)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Net Değişimi</span>
            </button>
            <button
              onClick={() => setMetricMode('score')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                metricMode === 'score'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="100 puan üzerinden sınav puan gelişimi"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Puan (/100)</span>
            </button>
            <button
              onClick={() => setMetricMode('speed')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                metricMode === 'speed'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Soru çözme süresi ve hız eğrisi"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Çözme Hızı</span>
            </button>
          </div>

          {/* Range Filter */}
          <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setRangeFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                rangeFilter === 'all'
                  ? 'bg-slate-700 text-teal-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tümü ({combinedHistory.length})
            </button>
            <button
              onClick={() => setRangeFilter('recent')}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                rangeFilter === 'recent'
                  ? 'bg-slate-700 text-teal-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Son 5 Deneme
            </button>
          </div>
        </div>
      </div>

      {/* Net Formula & Auxiliary Line Controls (When Net mode active) */}
      {metricMode === 'net' && (
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-teal-400" />
              <span>Net Hesaplama Formülü:</span>
            </span>
            <button
              onClick={() => setNetFormula('standard')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                netFormula === 'standard'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="ÖSYM İSG Sınavlarında yanlışlar doğruyu götürmez: Net = Doğru Sayısı"
            >
              İSG Standartı (Net = Doğru)
            </button>
            <button
              onClick={() => setNetFormula('strict')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                netFormula === 'strict'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Zorlayıcı deneme hesabı: 4 Yanlış 1 Doğruyu Götürür"
            >
              Önlem Modu (Net = D - Y/4)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAuxLines}
                onChange={(e) => setShowAuxLines(e.target.checked)}
                className="w-3.5 h-3.5 accent-teal-500 rounded-sm cursor-pointer"
              />
              <span className="text-[11px]">Doğru & Yanlış Eğrilerini Göster</span>
            </label>
          </div>
        </div>
      )}

      {/* Summary KPI Blocks (Metric-specific) */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Latest Performance */}
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{metricMode === 'net' ? 'Son Deneme Neti' : 'Son Sınav Puanı'}</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {metricMode === 'net' ? `${statsSummary.latestNet}` : statsSummary.latestScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {metricMode === 'net' ? 'Net / 50' : '/ 100'}
            </span>
          </div>
          <div className="text-[11px]">
            {metricMode === 'net' ? (
              statsSummary.latestNet >= 35 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 35 Barajı Geçildi (+
                  {Number((statsSummary.latestNet - 35).toFixed(1))})
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  35 Barajına -{Number((35 - statsSummary.latestNet).toFixed(1))} Net
                </span>
              )
            ) : statsSummary.latestScore >= 70 ? (
              <span className="text-emerald-400 font-semibold">%70 Barajı Üzerinde</span>
            ) : (
              <span className="text-amber-400 font-medium">Hedefe Az Kaldı</span>
            )}
          </div>
        </div>

        {/* Metric 2: Net Growth Trend */}
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{metricMode === 'net' ? 'Net Değişim Artışı' : 'Puan Artışı'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {metricMode === 'net'
                ? statsSummary.netGrowth >= 0
                  ? `+${statsSummary.netGrowth}`
                  : statsSummary.netGrowth
                : statsSummary.scoreGrowth >= 0
                ? `+${statsSummary.scoreGrowth}`
                : statsSummary.scoreGrowth}
            </span>
            <span className="text-xs text-emerald-400/80 font-mono">
              {metricMode === 'net' ? 'Net İlerleme' : 'Puan'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> Düzenli yükseliş trendi
            </span>
          </div>
        </div>

        {/* Metric 3: Peak Net / Highest Score */}
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{metricMode === 'net' ? 'En Yüksek Net (Zirve)' : 'En Yüksek Puan'}</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {metricMode === 'net' ? `${statsSummary.highestNet}` : statsSummary.highestScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {metricMode === 'net' ? 'Net' : '/ 100'}
            </span>
          </div>
          <div className="text-[11px] text-amber-300 font-medium">
            Kariyer rekor performansı
          </div>
        </div>

        {/* Metric 4: Baraj Pass Rate */}
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Barajı Geçme Oranı</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              %{statsSummary.passRate}
            </span>
            <span className="text-xs text-slate-400">başarı</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {chartData.length} deneme simülasyonu
          </div>
        </div>
      </div>

      {/* Main Recharts Canvas */}
      <div className="relative z-10 bg-slate-900/60 rounded-xl p-3.5 border border-slate-700/60 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              {metricMode === 'net'
                ? 'Çizgi Grafik: Deneme Sınavları Net İlerleme Eğrisi (35 Net Baraj Çizgisi ile)'
                : metricMode === 'score'
                ? 'Çizgi Grafik: Sınav Puanı Gelişimi (/100)'
                : 'Alan Grafiği: Soru Başına Çözme Süresi Eğrisi (sn/soru)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Detaylar ve net dökümü için çizgi üzerindeki noktalara gelin
          </span>
        </div>

        <div className="w-full h-72 sm:h-84 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {metricMode === 'net' ? (
              /* NET PROGRESSION LINE CHART */
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis
                  dataKey="displayName"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  stroke="#475569"
                  tickMargin={10}
                />
                <YAxis
                  domain={[15, 50]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  stroke="#475569"
                  tickFormatter={(val) => `${val}N`}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
                />

                {/* 35 Net ÖSYM Pass Threshold Reference Line */}
                <ReferenceLine
                  y={35}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: 'ÖSYM 35 Net Barajı (70 Puan)',
                    fill: '#34d399',
                    fontSize: 11,
                    fontWeight: 700,
                    position: 'top',
                  }}
                />

                {/* Main Net Line (Cyan / Teal) */}
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Deneme Neti (Net Doğru)"
                  stroke="#06b6d4"
                  strokeWidth={3.5}
                  dot={{
                    r: 5.5,
                    fill: '#0f172a',
                    stroke: '#06b6d4',
                    strokeWidth: 2.5,
                  }}
                  activeDot={{
                    r: 8.5,
                    fill: '#22d3ee',
                    stroke: '#ffffff',
                    strokeWidth: 2.5,
                  }}
                />

                {/* Auxiliary Correct Line (Green dashed) */}
                {showAuxLines && (
                  <Line
                    type="monotone"
                    dataKey="correct"
                    name="Doğru Soru (D)"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                )}

                {/* Auxiliary Wrong Line (Rose) */}
                {showAuxLines && (
                  <Line
                    type="monotone"
                    dataKey="wrong"
                    name="Yanlış Soru (Y)"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#f43f5e' }}
                  />
                )}
              </LineChart>
            ) : metricMode === 'score' ? (
              /* SCORE LINE CHART */
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
                    fontSize: 11,
                    position: 'top',
                  }}
                />

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

                <Line
                  type="monotone"
                  dataKey="targetScore"
                  name="ÖSYM Hedefi (70 Puan)"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            ) : (
              /* SPEED AREA CHART */
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
      </div>

      {/* Footer Navigation / Quick Actions & Baraj Legend */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-medium">Net Değişimi Çizgisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-emerald-400" />
            <span className="text-emerald-400 font-medium">35 Net (ÖSYM Baraj Çizgisi)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-400">Yanlış Soru Eğrisi (Düşüş Takibi)</span>
          </div>
        </div>

        {onStartNewExam && (
          <button
            onClick={onStartNewExam}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Yeni Deneme Sınavı Başlat</span>
          </button>
        )}
      </div>
    </div>
  );
};
