import React, { useState } from 'react';
import { 
  Calculator, 
  Users, 
  Activity, 
  ShieldAlert, 
  Volume2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react';

export const CalculatorsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'service_hours' | 'kso_kao' | 'matrix_5x5' | 'noise'>('service_hours');

  // 1. İSG Hizmet Süresi States
  const [employeeCount, setEmployeeCount] = useState<number>(120);
  const [hazardClass, setHazardClass] = useState<'az_tehlikeli' | 'tehlikeli' | 'cok_tehlikeli'>('cok_tehlikeli');

  // Calculations for Service Hours
  const iguRates = { az_tehlikeli: 10, tehlikeli: 20, cok_tehlikeli: 40 }; // dk/kişi
  const hekimRates = { az_tehlikeli: 5, tehlikeli: 10, cok_tehlikeli: 15 }; // dk/kişi
  const dspRates = { az_tehlikeli: 0, tehlikeli: 0, cok_tehlikeli: 10 }; // dk/kişi (sadece çok tehlikeli 10+ için)

  const iguFullTimeThresholds = { az_tehlikeli: 1000, tehlikeli: 500, cok_tehlikeli: 250 };
  const hekimFullTimeThresholds = { az_tehlikeli: 2000, tehlikeli: 1000, cok_tehlikeli: 750 };

  const iguMonthlyMinutes = employeeCount * iguRates[hazardClass];
  const iguMonthlyHours = (iguMonthlyMinutes / 60).toFixed(1);
  const iguFullTimeCount = Math.floor(employeeCount / iguFullTimeThresholds[hazardClass]);

  const hekimMonthlyMinutes = employeeCount * hekimRates[hazardClass];
  const hekimMonthlyHours = (hekimMonthlyMinutes / 60).toFixed(1);
  const hekimFullTimeCount = Math.floor(employeeCount / hekimFullTimeThresholds[hazardClass]);

  const isDspRequired = hazardClass === 'cok_tehlikeli' && employeeCount >= 10;
  const isCouncilRequired = employeeCount >= 50;

  const firstAiderRatio = hazardClass === 'az_tehlikeli' ? 20 : hazardClass === 'tehlikeli' ? 15 : 10;
  const firstAiderCount = Math.ceil(employeeCount / firstAiderRatio);

  // 2. KSO & KAO States
  const [accidentCount, setAccidentCount] = useState<number>(4);
  const [lostDays, setLostDays] = useState<number>(36);
  const [totalWorkHours, setTotalWorkHours] = useState<number>(250000);

  const kso = totalWorkHours > 0 ? ((accidentCount * 1000000) / totalWorkHours).toFixed(2) : '0';
  const kao = totalWorkHours > 0 ? ((lostDays * 1000000) / totalWorkHours).toFixed(2) : '0';

  // 3. 5x5 Matrix States
  const [probability, setProbability] = useState<number>(3); // 1-5
  const [severity, setSeverity] = useState<number>(4); // 1-5
  const matrixScore = probability * severity;

  const getMatrixRiskLevel = (score: number) => {
    if (score >= 15) return { label: 'Kabul Edilemez Risk (KIRMIZI)', color: 'text-rose-400 bg-rose-950/60 border-rose-600', action: 'İş derhal durdurulmalı, acil önlem alınmalıdır.' };
    if (score >= 8) return { label: 'Önemli Risk (SARI)', color: 'text-amber-400 bg-amber-950/60 border-amber-600', action: 'Belirlenen süre içinde önleyici tedbirler alınmalı ve izlenmelidir.' };
    return { label: 'Katlanılabilir / Kabul Edilebilir Risk (YEŞİL)', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-600', action: 'Mevcut kontroller sürdürülmeli ve periyodik takip edilmelidir.' };
  };

  // 4. Gürültü States
  const [ambientNoise, setAmbientNoise] = useState<number>(92);
  const [earmuffSNR, setEarmuffSNR] = useState<number>(28);
  const effectiveNoise = Math.max(0, ambientNoise - (earmuffSNR - 5)); // real world derating

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">İSG Mühendislik & Mevzuat Hesaplayıcıları</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Çalışma süreleri, kaza istatistikleri (KSO-KAO), 5x5 L Tipi risk matrisi ve gürültü maruziyet analizleri.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('service_hours')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'service_hours'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>İGU & Hekim Süre Hesabı</span>
        </button>

        <button
          onClick={() => setActiveTab('kso_kao')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'kso_kao'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>KSO & KAO Kaza Oranları</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix_5x5')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'matrix_5x5'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>5x5 L Tipi Risk Matrisi</span>
        </button>

        <button
          onClick={() => setActiveTab('noise')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'noise'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Gürültü & SNR Kulaklık Hesabı</span>
        </button>
      </div>

      {/* Tab 1: Hizmet Süreleri */}
      {activeTab === 'service_hours' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-5 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              İşyeri Parametreleri
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tehlike Sınıfı:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setHazardClass('az_tehlikeli')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    hazardClass === 'az_tehlikeli'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Az Tehlikeli
                </button>
                <button
                  onClick={() => setHazardClass('tehlikeli')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    hazardClass === 'tehlikeli'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Tehlikeli
                </button>
                <button
                  onClick={() => setHazardClass('cok_tehlikeli')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    hazardClass === 'cok_tehlikeli'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Çok Tehlikeli
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                <span>Çalışan Sayısı:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">{employeeCount} Kişi</span>
              </div>
              <input
                type="range"
                min="1"
                max="1500"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 1)}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1</span>
                <span>250</span>
                <span>500</span>
                <span>1000</span>
                <span>1500+</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Manuel Sayı Girişi:</label>
              <input
                type="number"
                min="1"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Yasal Asgari Hizmet Süreleri Raporu
            </h3>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="text-xs text-slate-400">İş Güvenliği Uzmanı (İGU)</div>
                <div className="text-2xl font-black text-emerald-400 my-1 font-mono">
                  {iguMonthlyHours} <span className="text-xs font-normal text-slate-400">Saat/Ay</span>
                </div>
                <div className="text-xs text-slate-300">
                  Kişi başı: <span className="font-bold">{iguRates[hazardClass]} dk/ay</span>
                </div>
                {iguFullTimeCount > 0 && (
                  <div className="mt-2 text-[11px] font-bold text-amber-400">
                    + {iguFullTimeCount} Tam Zamanlı Uzman Zorunlu
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="text-xs text-slate-400">İşyeri Hekimi</div>
                <div className="text-2xl font-black text-teal-400 my-1 font-mono">
                  {hekimMonthlyHours} <span className="text-xs font-normal text-slate-400">Saat/Ay</span>
                </div>
                <div className="text-xs text-slate-300">
                  Kişi başı: <span className="font-bold">{hekimRates[hazardClass]} dk/ay</span>
                </div>
                {hekimFullTimeCount > 0 && (
                  <div className="mt-2 text-[11px] font-bold text-amber-400">
                    + {hekimFullTimeCount} Tam Zamanlı Hekim Zorunlu
                  </div>
                )}
              </div>
            </div>

            {/* Mandatory Compliance Items */}
            <div className="space-y-2 pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                <span className="text-slate-300">İSG Kurulu Zorunluluğu:</span>
                <span className={`font-bold ${isCouncilRequired ? 'text-amber-400' : 'text-slate-400'}`}>
                  {isCouncilRequired ? 'ZORUNLU (50+ Çalışan)' : 'Zorunlu Değil'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                <span className="text-slate-300">Gerekli Asgari İlkyardımcı Sayısı:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  En az {firstAiderCount} Kişi ({firstAiderRatio} çalışana 1)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                <span className="text-slate-300">Diğer Sağlık Personeli (DSP):</span>
                <span className={`font-bold ${isDspRequired ? 'text-purple-400' : 'text-slate-400'}`}>
                  {isDspRequired ? 'ZORUNLU (Çok Tehlikeli 10+ çalışan)' : 'Muaf'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: KSO & KAO */}
      {activeTab === 'kso_kao' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base">Kaza İstatistikleri Girişi</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Toplam İş Kazası Sayısı:</label>
              <input
                type="number"
                min="0"
                value={accidentCount}
                onChange={(e) => setAccidentCount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Toplam Kayıp İş Günü Sayısı:</label>
              <input
                type="number"
                min="0"
                value={lostDays}
                onChange={(e) => setLostDays(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Toplam Fiili Çalışma Saati (İşçilerin çalıştığı saat toplamı):
              </label>
              <input
                type="number"
                min="1000"
                value={totalWorkHours}
                onChange={(e) => setTotalWorkHours(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 text-white text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-5">
            <h3 className="font-bold text-white text-base">ILO / SGK Standart Sonuçları</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="text-xs text-slate-400">Kaza Sıklık Oranı (KSO)</div>
                <div className="text-3xl font-black text-amber-400 my-1 font-mono">{kso}</div>
                <div className="text-[11px] text-slate-400">
                  Formül: (Kaza Sayısı x 1.000.000) / Çalışılan Saat
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="text-xs text-slate-400">Kaza Ağırlık Oranı (KAO)</div>
                <div className="text-3xl font-black text-rose-400 my-1 font-mono">{kao}</div>
                <div className="text-[11px] text-slate-400">
                  Formül: (Kayıp Gün x 1.000.000) / Çalışılan Saat
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-emerald-400 flex items-center gap-1">
                <Info className="w-4 h-4" /> İSG Mühendislik Notu:
              </p>
              <p>
                KSO, 1 milyon insan-saatlik çalışma başına düşen kaza sıklığını; KAO ise bu kazaların işyeri üretimine ve işgücüne verdiği hasar/kayıp ağırlığını gösterir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 5x5 L Tipi Matrix */}
      {activeTab === 'matrix_5x5' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base">5x5 Matris Parametreleri</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Olasılık (İhtimal): <span className="text-emerald-400 font-bold">{probability}</span> / 5
              </label>
              <select
                value={probability}
                onChange={(e) => setProbability(parseInt(e.target.value))}
                className="w-full bg-slate-900 text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700"
              >
                <option value={1}>1 - Çok Küçük (Yılda bir veya daha az)</option>
                <option value={2}>2 - Küçük (Yılda birkaç kez)</option>
                <option value={3}>3 - Orta (Ayda bir kez)</option>
                <option value={4}>4 - Yüksek (Haftada bir kez)</option>
                <option value={5}>5 - Çok Yüksek (Her gün / sürekli)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Şiddet (Zararın Derecesi): <span className="text-amber-400 font-bold">{severity}</span> / 5
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full bg-slate-900 text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700"
              >
                <option value={1}>1 - Çok Hafif (İş kaybı yok, ilkyardım gerektirir)</option>
                <option value={2}>2 - Hafif (Kısa süreli tedavi, hafif yaralanma)</option>
                <option value={3}>3 - Orta (Hastanede tedavi, geçici iş göremezlik)</option>
                <option value={4}>4 - Ciddi (Ağır yaralanma, uzuv kaybı, kalıcı sakatlık)</option>
                <option value={5}>5 - Çok Ciddi (Ölüm veya birden fazla ölüm)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base">Risk Değerlendirmesi Sonucu</h3>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-3">
              <div className="text-xs text-slate-400">Hesaplanan Risk Skoru (Olasılık x Şiddet)</div>
              <div className="text-5xl font-black font-mono text-white">
                {matrixScore} <span className="text-sm font-normal text-slate-400">/ 25</span>
              </div>

              {(() => {
                const level = getMatrixRiskLevel(matrixScore);
                return (
                  <div className={`p-3 rounded-xl border text-xs font-bold ${level.color}`}>
                    {level.label}
                  </div>
                );
              })()}

              <p className="text-xs text-slate-300 text-left pt-2 leading-relaxed">
                <span className="font-semibold text-white">Aksiyon:</span> {getMatrixRiskLevel(matrixScore).action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Gürültü */}
      {activeTab === 'noise' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base">Gürültü Seviyesi Parametreleri</h3>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Ortam Gürültüsü:</span>
                <span className="text-rose-400 font-bold font-mono">{ambientNoise} dB(A)</span>
              </div>
              <input
                type="range"
                min="70"
                max="120"
                value={ambientNoise}
                onChange={(e) => setAmbientNoise(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Kulak Koruyucu (KKD) SNR Değeri:</span>
                <span className="text-emerald-400 font-bold font-mono">{earmuffSNR} dB</span>
              </div>
              <input
                type="range"
                min="10"
                max="36"
                value={earmuffSNR}
                onChange={(e) => setEarmuffSNR(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base">Mevzuat Uyumluluk Değerlendirmesi</h3>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3">
              <div className="text-xs text-slate-400">Kulağa Ulaşan Efektif Gürültü Düzeyi</div>
              <div className="text-4xl font-black font-mono text-emerald-400">
                {effectiveNoise} <span className="text-sm font-normal text-slate-400">dB(A)</span>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
                  <span>80 dB(A) En Düşük Eylem Değeri:</span>
                  <span className={ambientNoise >= 80 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {ambientNoise >= 80 ? 'Kulaklık Hazır Edilmeli' : 'Gerek Yok'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
                  <span>85 dB(A) En Yüksek Eylem Değeri:</span>
                  <span className={ambientNoise >= 85 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {ambientNoise >= 85 ? 'Kulaklık Takılması ZORUNLU' : 'İsteğe Bağlı'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
                  <span>87 dB(A) Maruziyet Sınır Değeri:</span>
                  <span className={effectiveNoise <= 87 ? 'text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                    {effectiveNoise <= 87 ? 'UYGUN (Aşılmadı)' : 'UYGUNSUZ (Sınır Aşıldı!)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
