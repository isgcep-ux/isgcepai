import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "İSG Cep Akademi Backend" });
});

// AI General İSG Assistant / Legislation Q&A
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Soru metni gereklidir." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API anahtarı yapılandırılmamış. Lütfen Settings > Secrets panelinden API anahtarını kontrol edin.",
      });
    }

    const systemInstruction = `Sen 'İSG Cep Akademi' platformunun yapay zeka destekli kıdemli İş Sağlığı ve Güvenliği (İSG) Danışmanı ve ÖSYM Sınav Eğitmenisin.
Türkiye'deki İSG Mevzuatına (özellikle 6331 Sayılı İş Sağlığı ve Güvenliği Kanunu, 4857 Sayılı İş Kanunu, 5510 Sayılı SGK Kanunu, İlgili Tüm Yönetmelikler, Tebliğler ve ILO Sözleşmeleri) tam hakimsin.
A, B, C Sınıfı İş Güvenliği Uzmanlığı, İşyeri Hekimliği ve Diğer Sağlık Personeli (DSP) sınavlarına hazırlanan adaylara ve sahada çalışan uzmanlara rehberlik ediyorsun.

Kurallar:
1. Türkçe, net, profesyonel ve didaktik bir dille yanıt ver.
2. Mümkün olduğunda ilgili kanun ve yönetmelik maddelerine doğrudan atıf yap (Örn: '6331 Sayılı Kanun Madde 11', 'İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği EK-III').
3. Soru çözümü ise; doğru cevabın gerekçesini ve çeldiricilerin neden yanlış olduğunu açıkla.
4. Pratik ezberleme kodları, hap bilgi notları veya formüller (KSO, KAO, L Tipi Matris, Fine-Kinney vb.) içeriyorsa vurgula.
5. Markdown formatında başlıklar, maddeler ve kalın metinler kullanarak okunabilirliği artır.`;

    const prompt = context
      ? `Bağlam / Seçilen Konu: ${context}\n\nKullanıcı Sorusu: ${question}`
      : question;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({ answer: response.text || "Yanıt oluşturulamadı." });
  } catch (error: any) {
    console.error("AI Ask Error:", error);
    return res.status(500).json({
      error: error.message || "İSG Asistanı yanıt verirken bir hata oluştu.",
    });
  }
});

// AI Soru Çözümü & Detaylı Mevzuat Açıklayıcı
app.post("/api/ai/explain-question", async (req, res) => {
  try {
    const { questionText, options, correctAnswer, userAnswer, topic } = req.body;
    
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API anahtarı yapılandırılmamış.",
      });
    }

    const systemInstruction = `Sen İSG Sınav Soru Çözüm Uzmanısın. Verilen ÖSYM İSG sınav sorusunu analiz ederek adayın konuyu tam kavramasını sağla.
Aşağıdaki yapıda açık ve tatmin edici bir açıklama sun:
1. **Doğru Cevabın Gerekçesi**: Hangi mevzuat / kural gereği bu şık doğrudur?
2. **Mevzuat Dayanağı**: İlgili Kanun, Yönetmelik veya Standart (örn. TS EN ISO, ILO, 6331 sayılı kanun).
3. **Çeldirici Analizi**: Diğer şıkların neden yanlış olduğu.
4. **Sınav İpucu / Hap Bilgi**: Bu konuyla ilgili ÖSYM'nin sıkça sorduğu tuzaklar ve akılda kalıcı not.`;

    const prompt = `Konu: ${topic || "Genel İSG"}
Soru: ${questionText}
Şıklar:
${options ? options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n") : ""}
Doğru Cevap: ${correctAnswer}
Kullanıcının Seçtiği: ${userAnswer || "Seçilmedi"}

Lütfen bu soruyu ayrıntılı analiz et.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return res.json({ explanation: response.text || "Açıklama oluşturulamadı." });
  } catch (error: any) {
    console.error("AI Explain Question Error:", error);
    return res.status(500).json({
      error: error.message || "Soru açıklanırken hata meydana geldi.",
    });
  }
});

// AI Saha Risk Değerlendirmesi & Önlem Raporu
app.post("/api/ai/risk-assessment", async (req, res) => {
  try {
    const { workplaceType, hazardDescription, existingMeasures } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API anahtarı yapılandırılmamış.",
      });
    }

    const systemInstruction = `Sen Saha İSG Risk Değerlendirme Baş Denetçisisin. Verilen işyeri türü ve tehlike unsuru için 6331 Sayılı Kanun ve İş Sağlığı ve Güvenliği Risk Değerlendirmesi Yönetmeliği uyarınca profesyonel bir risk analiz matrisi ve aksiyon planı üret.`;

    const prompt = `İşyeri / Sektör Türü: ${workplaceType}
Tehlike / Durum Tanımı: ${hazardDescription}
Mevcut Önlemler: ${existingMeasures || "Belirtilmemiş"}

Lütfen şu başlıklarla kapsamlı bir değerlendirme sun:
1. **Tehlike ve Risk Tanımı (Olası Sonuçlar/Zararlar)**
2. **Risk Skoru Tahmini (Olasılık x Şiddet - 5x5 Matris)**
3. **Hiyerarşik Kontrol Önlemleri (Yok etme -> İkame -> Mühendislik -> İdari -> KKD)**
4. **Gerekli İSG Kontrol Listesi & Yasal Dayanak**
5. **Sorumlu Kişiler ve Periyodik Kontrol / Eğitim Tavsiyeleri**`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({ analysis: response.text || "Analiz oluşturulamadı." });
  } catch (error: any) {
    console.error("AI Risk Assessment Error:", error);
    return res.status(500).json({
      error: error.message || "Risk analizi yapılırken hata oluştu.",
    });
  }
});

// AI Sınav Geçmişi & Zayıf Nokta Analizi ile Kişiselleştirilmiş Çalışma Önerisi
app.post("/api/ai/study-recommendation", async (req, res) => {
  try {
    const { userStats, selectedExamType } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API anahtarı yapılandırılmamış.",
      });
    }

    const systemInstruction = `Sen İSG Sınavlarına (A/B/C Sınıfı İGU, İşyeri Hekimliği, DSP) hazırlanan adaylar için Kıdemli Sınav Koçu ve Veri Analistisin.
Adayın sınav geçmişi, çözdüğü sorular, yanlış yaptığı konular ve başarı oranlarına dayanarak; ÖSYM sınavında maksimum net artışı sağlayacak 'Bir Sonraki Çalışma Konusu' ve stratejik çalışma tavsiyesi üret.

Yanıtını Türkçe ve JSON formatında şu anahtarlarla ver:
{
  "recommendedTopicTitle": "Konu Başlığı (Örn: 6331 Sayılı İSG Kanunu veya Fiziksel Risk Etmenleri)",
  "topicKey": "konu_kodu_varsa (örn: kanun_6331, fiziksel_riskler, risk_degerlendirmesi)",
  "priorityLevel": "Kritik | Yüksek | Orta",
  "reason": "Bu konunun neden şu an öncelikli olduğuna dair 1-2 cümlelik analiz",
  "expectedScoreImpact": "Örn: +6 ile +8 Puan Artışı",
  "keyFocusPoints": ["Madde 1: ÖSYM'nin en çok sorduğu nokta", "Madde 2: Dikkat edilmesi gereken süre/tuzak", "Madde 3: Formül veya yasal tanım"],
  "mnemonicOrTip": "Akılda kalıcı pratik sınav tüyosu / hafıza kodu",
  "studyPlanMinutes": 25
}`;

    const prompt = `Adayın Sınav Grubu: ${selectedExamType || "Genel İSG"}
Toplam Çözülen Soru: ${userStats?.totalAnswered || 0}
Toplam Doğru: ${userStats?.totalCorrect || 0}
Toplam Yanlış: ${userStats?.totalWrong || 0}
Hata Defterindeki Soru Sayısı: ${userStats?.wrongQuestionIds?.length || 0}
Konu Hakimiyet Dağılımı: ${JSON.stringify(userStats?.topicMastery || {})}
Son Deneme Skorları: ${JSON.stringify(userStats?.examHistory?.slice(0, 3) || [])}

Lütfen bu adayın zayıf noktalarını ve en çok puan getirecek ÖSYM konularını analiz ederek JSON formatında kişiselleştirilmiş 'Bir Sonraki Çalışma Konusu' tavsiyesi üret. Sadece saf JSON döndür.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    let resultJson = null;
    try {
      resultJson = JSON.parse(response.text || "{}");
    } catch {
      resultJson = { rawText: response.text };
    }

    return res.json(resultJson);
  } catch (error: any) {
    console.error("AI Study Recommendation Error:", error);
    return res.status(500).json({
      error: error.message || "Öneri üretilirken hata oluştu.",
    });
  }
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`İSG Cep Akademi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
