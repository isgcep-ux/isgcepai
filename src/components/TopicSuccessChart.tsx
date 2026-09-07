import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  Radar as RadarIcon, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Filter,
  ArrowUpRight,
  Zap,
  Layers,
  ChevronRight,
  BookOpen,
  SlidersHorizontal,
  Scale
} from 'lucide-react';
import { QuestionTopic, UserStats } from '../types';
import { TOPIC_LABELS } from '../data/questionsData';

interface TopicSuccessChartProps {
  userStats: UserStats;
  onSelectTopicForPractice?: (topic: QuestionTopic) => void;
}

// Estimated ÖSYM question distribution & weight
const TOPIC_OSYM_WEIGHTS: Record<QuestionTopic, { weight: string; priority: 'Kritik' | 'Yüksek' | 'Orta' }> = {
  kanun_6331: { weight: '6-8 Soru (Maksimum Ağırlık)', priority: 'Kritik' },
  is_hukuku: { weight: '4-6 Soru (Temel Hukuk)', priority: 'Kritik' },
  risk_degerlendirmesi: { weight: '4-6 Soru (Önleme Metotları)', priority: 'Kritik' },
  fiziksel_riskler: { weight: '3-5 Soru (Sayısal Sınırlar)', priority: 'Yüksek' },
  kimyasal_riskler: { weight: '3-4 Soru (SDS & Limitler)', priority: 'Yüksek' },
  is_ekipmanlari: { weight: '3-4 Soru (Periyodik Kontrol)', priority: 'Yüksek' },
  yangin_acil: { weight: '2-4 Soru (Acil Durum & Tatbikat)', priority: 'Yüksek' },
  biyolojik_riskler: { weight: '2-3 Soru (Grup 1-4 Sınıflama)', priority: 'Orta' },
  ergonomi: { weight: '2-3 Soru (Elle Taşıma & Limitler)', priority: 'Orta' },
  yuksekte_calisma: { weight: '2-4 Soru (İskele & Ankraj)', priority: 'Yüksek' },
  kapali_alanlar: { weight: '2-3 Soru (Gaz Ölçüm & Havalandırma)', priority: 'Orta' },
  insaat_isg: { weight: '2-4 Soru (Yapı & Kazı Güvenliği)', priority: 'Orta' },
  maden_isg: { weight: '2-3 Soru (Havalandırma & Metan)', priority: 'Orta' },
  elektrik_isg: { weight: '2-3 Soru (Topraklama & Kaçak Akım)', priority: 'Orta' },
  saglik_ilkyardim: { weight: '2-3 Soru (Temel Yaşam Desteği)', priority: 'Orta' },
  uluslararasi_isg: { weight: '1-2 Soru (ILO & AB Direktifleri)', priority: 'Orta' },
};

export const TopicSuccessChart: React.FC<TopicSuccessChartProps> = ({
  userStats,
  onSelectTopicForPractice
}) => {
  // Chart visual type: Bar vs Radar
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');
  
  // Bar chart metric mode: Percentage vs Question Counts (Doğru / Yanlış / Toplam)
  const [barMetric, setBarMetric] = useState<'percentage' | 'counts'>('percentage');

  // Filter mode: Studied topics vs All Curriculum vs Weak topics
  const [filterMode, setFilterMode] = useState<'studied' | 'all' | 'weak'>('studied');

  // Sort mode
  const [sortMode, setSortMode] = useState<'default' | 'asc' | 'desc' | 'total'>('default');

  // Currently selected/inspected topic for interactive breakdown
  const [selectedTopicKey, setSelectedTopicKey] = useState<QuestionTopic | null>(null);

  // Prepare comprehensive chart dataset
  const rawTopicsData = useMemo(() => {
    const topics = Object.keys(TOPIC_LABELS) as QuestionTopic[];

    return topics.map((topicKey) => {
      const labelInfo = TOPIC_LABELS[topicKey];
      const stats = userStats.topicMastery?.[topicKey] || { correct: 0, total: 0 };
      const total = stats.total;
      const correct = stats.correct;
      const wrong = Math.max(0, total - correct);
      const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;
      const weightInfo = TOPIC_OSYM_WEIGHTS[topicKey] || { weight: '2-3 Soru', priority: 'Orta' };

      // Compact label for charts
      let shortName = labelInfo.label;
      if (shortName.includes('&')) {
        shortName = shortName.split('&')[0].trim();
      } else if (shortName.includes('(')) {
        shortName = shortName.split('(')[0].trim();
      }

      return {
        topic: topicKey,
        fullName: labelInfo.label,
        name: shortName,
        successRate,
        targetScore: 70, // ÖSYM 70 baraj puanı
        correct,
        wrong,
        total,
        isStudied: total > 0,
        isPassed: successRate >= 70 && total > 0,
        osymWeight: weightInfo.weight,
        priority: weightInfo.priority
      };
    });
  }, [userStats.topicMastery]);

  // Filter and sort data
  const chartData = useMemo(() => {
    let list = [...rawTopicsData];

    // Filter
    if (filterMode === 'studied') {
      const studied = list.filter(d => d.total > 0);
      list = studied.length > 0 ? studied : list.slice(0, 8);
    } else if (filterMode === 'weak') {
      const weak = list.filter(d => d.total > 0 && d.successRate < 70);
      list = weak.length > 0 ? weak : list.filter(d => d.total > 0);
    }

    // Sort
    if (sortMode === 'asc') {
      list.sort((a, b) => a.successRate - b.successRate);
    } else if (sortMode === 'desc') {
      list.sort((a, b) => b.successRate - a.successRate);
    } else if (sortMode === 'total') {
      list.sort((a, b) => b.total - a.total);
    }

    return list;
  }, [rawTopicsData, filterMode, sortMode]);

  // Overall calculations across studied curriculum
  const { totalMasteryAverage, totalStudiedCount, strongestTopic, weakestTopic } = useMemo(() => {
    const studiedTopics = rawTopicsData.filter(d => d.total > 0);
    if (studiedTopics.length === 0) {
      return {
        totalMasteryAverage: 0,
        totalStudiedCount: 0,
        strongestTopic: null,
        weakestTopic: null
      };
    }

    const totalRateSum = studiedTopics.reduce((acc, curr) => acc + curr.successRate, 0);
    const avg = Math.round(totalRateSum / studiedTopics.length);

    const sorted = [...studiedTopics].sort((a, b) => b.successRate - a.successRate);
    return {
      totalMasteryAverage: avg,
      totalStudiedCount: studiedTopics.length,
      strongestTopic: sorted[0],
      weakestTopic: sorted[sorted.length - 1]
    };
  }, [rawTopicsData]);

  // Active topic to inspect (selected or fallback to weakest/first)
  const activeInspectTopic = useMemo(() => {
    if (selectedTopicKey) {
      const found = rawTopicsData.find(d => d.topic === selectedTopicKey);
      if (found) return found;
    }
    if (weakestTopic) return weakestTopic;
    return rawTopicsData[0];
  }, [selectedTopicKey, rawTopicsData, weakestTopic]);

  // Custom rich tooltip for Bar and Radar charts
  const CustomInteractiveTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/98 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 z-50 min-w-[220px]">
          <div className="border-b border-slate-800 pb-1.5">
            <p className="font-bold text-white text-sm leading-snug">
              {data.fullName}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ÖSYM Ağırlığı: <span className="text-amber-300 font-medium">{data.osymWeight}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-0.5">
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Başarı Oranı</span>
              <span className={`font-mono font-bold text-sm ${
                data.successRate >= 70 ? 'text-emerald-400' : data.successRate >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                %{data.successRate}
              </span>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Doğru / Toplam</span>
              <span className="font-mono font-bold text-white text-xs">
                {data.correct}D / {data.total} Soru
              </span>
            </div>
          </div>

          <div className="text-[11px] flex items-center justify-between text-slate-300 pt-0.5">
            <span>Yanlış Soru:</span>
            <span className="text-rose-400 font-mono font-bold">{data.wrong} Yanlış</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
            {data.total === 0 ? (
              <span className="text-slate-400">Henüz soru çözülmedi</span>
            ) : data.successRate >= 70 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ÖSYM %70 Barajı Üzerinde
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Tekrar ve Pekiştirme Önerilir
              </span>
            )}
          </div>

          <div className="text-[10px] text-teal-300/90 font-medium italic pt-1 border-t border-slate-800/60 flex items-center gap-1">
            <span>Detay ve soru çözmek için çubuğa tıklayın</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md space-y-5">
      {/* Top Header & Interactive Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-white text-base">
              Konu Bazlı Başarı & Doğru / Toplam Analizi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Her bir İSG konusundaki doğru/toplam soru performansı ve ÖSYM %70 baraj kıyaslaması
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Studied vs All vs Weak Filter */}
          <div className="inline-flex rounded-lg bg-slate-900/90 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setFilterMode('studied')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                filterMode === 'studied'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Çözülenler</span>
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tüm Müfredat (16)
            </button>
            <button
              onClick={() => setFilterMode('weak')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                filterMode === 'weak'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Zayıf Konular</span>
            </button>
          </div>

          {/* Bar Sub-metric: Percentage vs Question Counts */}
          {chartType === 'bar' && (
            <div className="inline-flex rounded-lg bg-slate-900/90 p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setBarMetric('percentage')}
                className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  barMetric === 'percentage'
                    ? 'bg-slate-700 text-teal-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Başarı %
              </button>
              <button
                onClick={() => setBarMetric('counts')}
                className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  barMetric === 'counts'
                    ? 'bg-slate-700 text-teal-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Doğru / Yanlış Adedi
              </button>
            </div>
          )}

          {/* Chart Type Toggle: Bar vs Radar */}
          <div className="inline-flex rounded-lg bg-slate-900/90 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setChartType('bar')}
              title="Sütun Grafiği (Bar Chart)"
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bar Chart</span>
            </button>
            <button
              onClick={() => setChartType('radar')}
              title="Örümcek Ağı Grafiği (Radar Chart)"
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                chartType === 'radar'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radar Chart</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Performance Summary Pill Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] text-slate-400 block truncate">Ortalama Başarı</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white font-mono">%{totalMasteryAverage}</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                {totalMasteryAverage >= 70 ? 'Baraj Geçildi' : 'Hedef: %70'}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] text-slate-400 block truncate">Çalışılan Konular</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white font-mono">{totalStudiedCount}</span>
              <span className="text-[10px] text-slate-400">/ 16 Müfredat</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] text-slate-400 block truncate">En Güçlü Konu</span>
            <div className="text-xs font-bold text-emerald-400 truncate">
              {strongestTopic ? `${strongestTopic.name}` : 'Henüz soru çözülmedi'}
            </div>
            {strongestTopic && (
              <div className="text-[10px] text-slate-400 font-mono">
                {strongestTopic.correct}/{strongestTopic.total} Doğru (%{strongestTopic.successRate})
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] text-slate-400 block truncate">Öncelikli Zayıf Nokta</span>
            <div className="text-xs font-bold text-rose-400 truncate">
              {weakestTopic ? `${weakestTopic.name}` : 'Henüz soru çözülmedi'}
            </div>
            {weakestTopic && (
              <div className="text-[10px] text-slate-400 font-mono">
                {weakestTopic.correct}/{weakestTopic.total} Doğru (%{weakestTopic.successRate})
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Display Area */}
      <div className="bg-slate-900/50 rounded-xl p-3.5 border border-slate-700/60">
        <div className="flex items-center justify-between mb-2 text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>
              {chartType === 'bar'
                ? barMetric === 'percentage'
                  ? 'Sütun Grafiği: Konu Başarı Oranları (%)'
                  : 'Sütun Grafiği: Konu Bazlı Doğru ve Yanlış Soru Dağılımı'
                : 'Radar Grafiği: Aday Başarısı vs ÖSYM %70 Barajı'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Bir konuyu seçmek için grafikteki çubuğa veya etikete tıklayın
          </span>
        </div>

        <div className="w-full h-72 sm:h-80 pt-1">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              {barMetric === 'percentage' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 45 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    stroke="#475569"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    stroke="#475569"
                    tickFormatter={(val) => `%${val}`}
                  />
                  <Tooltip content={<CustomInteractiveTooltip />} />
                  <ReferenceLine
                    y={70}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: 'ÖSYM %70 Barajı',
                      fill: '#34d399',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Bar
                    dataKey="successRate"
                    name="Başarı Oranı (%)"
                    radius={[6, 6, 0, 0]}
                    onClick={(data: any) => {
                      if (data && data.topic) setSelectedTopicKey(data.topic);
                    }}
                    cursor="pointer"
                  >
                    {chartData.map((entry, index) => {
                      const isSelected = selectedTopicKey === entry.topic;
                      let fillColor = '#10b981'; // >= 70% Emerald
                      if (entry.total === 0) fillColor = '#475569'; // Not studied
                      else if (entry.successRate < 50) fillColor = '#f43f5e'; // < 50% Rose
                      else if (entry.successRate < 70) fillColor = '#f59e0b'; // 50-69% Amber

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={fillColor}
                          stroke={isSelected ? '#ffffff' : 'transparent'}
                          strokeWidth={isSelected ? 2 : 0}
                          className="transition-all hover:opacity-85"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              ) : (
                /* Grouped Bar Chart for Doğru vs Yanlış */
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 45 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    stroke="#475569"
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    stroke="#475569"
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomInteractiveTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: '#cbd5e1', paddingTop: '4px' }}
                  />
                  <Bar
                    dataKey="correct"
                    name="Doğru Soru (D)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    onClick={(data: any) => {
                      if (data && data.topic) setSelectedTopicKey(data.topic);
                    }}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="wrong"
                    name="Yanlış Soru (Y)"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    onClick={(data: any) => {
                      if (data && data.topic) setSelectedTopicKey(data.topic);
                    }}
                    cursor="pointer"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            /* Radar Chart View */
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  tickFormatter={(v) => `%${v}`}
                />
                <Radar
                  name="Aday Başarı Oranı (%)"
                  dataKey="successRate"
                  stroke="#14b8a6"
                  fill="#14b8a6"
                  fillOpacity={0.45}
                  dot={{ r: 3, fill: '#14b8a6' }}
                />
                <Radar
                  name="ÖSYM %70 Barajı"
                  dataKey="targetScore"
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <Tooltip content={<CustomInteractiveTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Interactive Detail Inspector Card for the Active Topic */}
      {activeInspectTopic && (
        <div className="bg-slate-900/90 rounded-xl p-4 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Seçili Konu Detayı
              </span>
              <span className="text-xs text-amber-300 font-medium">
                ÖSYM Sınav Ağırlığı: {activeInspectTopic.osymWeight}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base truncate">
              {activeInspectTopic.fullName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap pt-0.5">
              <span>
                Toplam: <strong className="text-white font-mono">{activeInspectTopic.total} Soru</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                Doğru: <strong className="font-mono">{activeInspectTopic.correct}</strong>
              </span>
              <span>•</span>
              <span className="text-rose-400 font-medium">
                Yanlış: <strong className="font-mono">{activeInspectTopic.wrong}</strong>
              </span>
              <span>•</span>
              <span className="font-bold">
                Başarı: <strong className={`font-mono ${
                  activeInspectTopic.successRate >= 70 ? 'text-emerald-400' : 'text-amber-400'
                }`}>%{activeInspectTopic.successRate}</strong>
              </span>
            </div>
          </div>

          {/* Action button: Practice questions from this topic */}
          <div className="flex items-center gap-2 shrink-0">
            {onSelectTopicForPractice && (
              <button
                onClick={() => onSelectTopicForPractice(activeInspectTopic.topic)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-950/40 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Bu Konudan Soru Çöz</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend & Topic Quick Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/80 text-xs text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>%70+ (ÖSYM Barajı Geçildi)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>%50-%69 (Geliştirilmeli)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>&lt; %50 (Kritik Zayıf)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span>Çözülmedi</span>
          </div>
        </div>

        {weakestTopic && onSelectTopicForPractice && (
          <button
            onClick={() => onSelectTopicForPractice(weakestTopic.topic)}
            className="inline-flex items-center space-x-1 text-teal-300 hover:text-teal-200 font-medium transition-colors cursor-pointer"
          >
            <span>Öncelikli Zayıf Konuyu Pekiştir</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
