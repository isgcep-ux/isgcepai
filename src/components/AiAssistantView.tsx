import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  ShieldAlert, 
  FileText, 
  AlertCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'risk_generator'>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Merhaba! Ben **İSG Cep Akademi AI Asistanı**.\n\nTürkiye İSG Mevzuatı (6331 Sayılı Kanun, 4857 İş Kanunu, Yönetmelikler), ÖSYM Sınavı soru çözümleri, risk analizleri veya saha güvenlik talimatları ile ilgili aklınıza takılan her şeyi sorabilirsiniz.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Risk Generator State
  const [workplaceType, setWorkplaceType] = useState('İnşaat Şantiyesi (Yüksekte Çalışma)');
  const [hazardDescription, setHazardDescription] = useState('Cephe iskelesinde korkuluk eksikliği ve emniyet kemeri kullanılmaması');
  const [existingMeasures, setExistingMeasures] = useState('Baret dağıtımı yapılmış ancak paraşüt tipi emniyet kemeri takılmıyor.');
  const [riskAnalysisResult, setRiskAnalysisResult] = useState<string | null>(null);
  const [isGeneratingRisk, setIsGeneratingRisk] = useState(false);

  const presetQuestions = [
    '6331 Sayılı Kanun Madde 11 uyarınca acil durum planı yükümlülükleri nelerdir?',
    'ÖSYM İSG Sınavında en çok çıkan kritik süreler ve hap bilgiler nelerdir?',
    'İş ekipmanlarında periyodik kontrol süreleri ve EKİPNET zorunluluğu',
    'Kimyasal maddelerle çalışmalarda Güvenlik Bilgi Formu (SDS) 16 ana başlığı',
    'Gürültü ve Titreşim yönetmeliklerindeki maruziyet eylem ve sınır değerleri',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);
    setChatError(null);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Yapay zeka yanıt veremedi.');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setChatError(err.message || 'Yapay zeka asistanına bağlanılamadı.');
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateRiskAssessment = async () => {
    if (!hazardDescription.trim() || isGeneratingRisk) return;

    setIsGeneratingRisk(true);
    setRiskAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workplaceType,
          hazardDescription,
          existingMeasures,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Risk analizi oluşturulamadı.');
      }

      setRiskAnalysisResult(data.analysis);
    } catch (err: any) {
      alert(err.message || 'Risk analizi yapılırken hata oluştu.');
    } finally {
      setIsGeneratingRisk(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">AI İSG Asistanı & Danışman</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gemini 3.7 destekli Türk İSG Mevzuatı, ÖSYM soru çözüm rehberi ve saha risk analisti.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'chat' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Mevzuat & Soru Sohbeti
          </button>
          <button
            onClick={() => setActiveSubTab('risk_generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'risk_generator' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            AI Risk Analizi Üretici
          </button>
        </div>
      </div>

      {/* Subtab 1: Interactive Chat */}
      {activeSubTab === 'chat' && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-[650px] overflow-hidden">
          {/* Preset Prompts Bar */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-700/80 flex items-center space-x-2 overflow-x-auto text-xs">
            <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Hızlı Sor:
            </span>
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-700 whitespace-nowrap border border-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                    isAi
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-sm'
                      : 'bg-slate-700'
                  }`}>
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-slate-900/90 border border-slate-700 text-slate-100'
                      : 'bg-emerald-600 text-white font-medium'
                  }`}>
                    <div className="whitespace-pre-line prose prose-invert prose-emerald max-w-none">
                      {msg.text}
                    </div>
                    <div className={`text-[10px] mt-2 text-right ${isAi ? 'text-slate-500' : 'text-emerald-200'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center space-x-3 animate-in fade-in">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-400">
                  İSG Mevzuatı taranıyor ve kapsamlı yanıt hazırlanıyor...
                </div>
              </div>
            )}

            {chatError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{chatError}</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-900/90 border-t border-slate-700 flex items-center space-x-2">
            <input
              type="text"
              placeholder="İSG kanunu, yönetmelik, sınav sorusu veya saha konusu sorun..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-slate-800 text-slate-100 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isSending}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <span>Gönder</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Subtab 2: AI Risk Assessment Generator */}
      {activeSubTab === 'risk_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Saha Tehlike & Ortam Girişi
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                İşyeri / Sektör Türü:
              </label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700"
              >
                <option value="İnşaat Şantiyesi (Yüksekte Çalışma & İskele)">İnşaat Şantiyesi (Yüksekte Çalışma & İskele)</option>
                <option value="Kimya & Boya Fabrikası (Yanıcı & Toksik Maddeler)">Kimya & Boya Fabrikası (Yanıcı & Toksik Maddeler)</option>
                <option value="Metal & Talaşlı İmalat Atölyesi (Kaynak & Pres)">Metal & Talaşlı İmalat Atölyesi (Kaynak & Pres)</option>
                <option value="Lojistik Depo & Antrepo (Forklift & Raf Güvenliği)">Lojistik Depo & Antrepo (Forklift & Raf Güvenliği)</option>
                <option value="Maden & Taş Ocağı (Toz, Gaz & Göçük)">Maden & Taş Ocağı (Toz, Gaz & Göçük)</option>
                <option value="Hastane & Sağlık Kuruluşu (Biyolojik Risk & Kesici Delici)">Hastane & Sağlık Kuruluşu (Biyolojik Risk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tehlike / Durum Tanımı:
              </label>
              <textarea
                rows={3}
                value={hazardDescription}
                onChange={(e) => setHazardDescription(e.target.value)}
                placeholder="Örn: 4. katta açık kenarda çalışma yapılıyor, yaşam hattı ve korkuluk yok..."
                className="w-full bg-slate-900 text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mevcut Önlemler (Varsa):
              </label>
              <input
                type="text"
                value={existingMeasures}
                onChange={(e) => setExistingMeasures(e.target.value)}
                placeholder="Örn: Baret dağıtılmış, ancak eğitim verilmemiş..."
                className="w-full bg-slate-900 text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700"
              />
            </div>

            <button
              onClick={handleGenerateRiskAssessment}
              disabled={isGeneratingRisk || !hazardDescription.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              {isGeneratingRisk ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>5x5 Matris & Aksiyon Planı Hesaplanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Risk Analizi & Önlem Raporu Üret</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Yasal Uyumlu Risk Değerlendirme Raporu
            </h3>

            {riskAnalysisResult ? (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line prose prose-invert prose-emerald max-w-none max-h-[500px] overflow-y-auto">
                {riskAnalysisResult}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-slate-700 rounded-xl text-slate-400 text-xs space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-semibold text-slate-300">Henüz bir analiz üretilmedi</p>
                <p>Sol taraftaki parametreleri doldurup "AI Risk Analizi Üret" butonuna basın.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
