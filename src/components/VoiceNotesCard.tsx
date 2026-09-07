import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Pin,
  Copy,
  Check,
  Plus,
  Search,
  Sparkles,
  BookOpen,
  AlertCircle,
  RotateCcw,
  Tag,
  Clock,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuestionTopic, VoiceStudyNote } from '../types';
import { TOPIC_LABELS } from '../data/questionsData';

interface VoiceNotesCardProps {
  onNavigateToAIAssistant?: (initialQuestion?: string) => void;
  onSelectTopicForPractice?: (topic: QuestionTopic) => void;
}

const LOCAL_STORAGE_KEY = 'isg_voice_study_notes';

// Initial pre-seeded high-yield exam study notes
const INITIAL_SEED_NOTES: VoiceStudyNote[] = [
  {
    id: 'seed-1',
    title: '6331 SGK Kaza Bildirim Süresi',
    content:
      '6331 sayılı İSG Kanunu Madde 14 uyarınca; iş kazaları kazadan sonraki 3 İŞ GÜNÜ içinde, meslek hastalıkları ise öğrenildiği günden itibaren 3 İŞ GÜNÜ içinde Sosyal Güvenlik Kurumuna (SGK) bildirilmek zorundadır.',
    topic: 'kanun_6331',
    createdAt: '07 Eylül 2026, 09:15',
    isPinned: true,
    tags: ['SGK', '3 İş Günü', 'Bildirim'],
  },
  {
    id: 'seed-2',
    title: 'Risk Değerlendirmesi Yenileme (2-4-6 Kuralı)',
    content:
      'Risk değerlendirmesi geçerlilik süreleri: Çok Tehlikeli sınıfta en geç 2 YILDA BİR, Tehlikeli sınıfta en geç 4 YILDA BİR, Az Tehlikeli sınıfta en geç 6 YILDA BİR yenilenir. Büyük kaza, teknoloji veya mevzuat değişiminde süre beklenmeksizin derhal yenilenir.',
    topic: 'risk_degerlendirmesi',
    createdAt: '06 Eylül 2026, 17:30',
    isPinned: true,
    tags: ['2-4-6', 'Risk Analizi', 'Yenileme'],
  },
  {
    id: 'seed-3',
    title: 'Gürültü Eşik ve Sınır Değerleri',
    content:
      'Gürültü Yönetmeliği: En düşük maruziyet eylem değeri: 80 dB(A) (KKD hazır bulundurulur). En yüksek maruziyet eylem değeri: 85 dB(A) (KKD kullanımı zorunludur). Maruziyet sınır değeri: 87 dB(A) (KKD etkisi dikkate alınır, kesinlikle aşılamaz).',
    topic: 'fiziksel_riskler',
    createdAt: '05 Eylül 2026, 11:20',
    isPinned: false,
    tags: ['Gürültü', '80-85-87 dB', 'KKD'],
  },
];

export const VoiceNotesCard: React.FC<VoiceNotesCardProps> = ({
  onNavigateToAIAssistant,
  onSelectTopicForPractice,
}) => {
  // Saved notes from localStorage
  const [notes, setNotes] = useState<VoiceStudyNote[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    return INITIAL_SEED_NOTES;
  });

  // State for recording and new note form
  const [isListening, setIsListening] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<QuestionTopic | 'genel'>('kanun_6331');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState<string>('');
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Web Speech API recognition reference
  const recognitionRef = useRef<any>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  }, [notes]);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk + ' ';
          } else {
            currentInterim += transcriptChunk;
          }
        }

        setInterimText(currentInterim);

        if (finalTranscript) {
          setNoteContent((prev) => {
            const updated = prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim();
            // If title is empty, auto-generate from the first 5 words
            if (!noteTitle) {
              const words = updated.split(' ').slice(0, 5).join(' ');
              setNoteTitle(words.length > 30 ? words.slice(0, 27) + '...' : words);
            }
            return updated;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(
            'Mikrofon izni reddedildi. Lütfen tarayıcınızın mikrofon erişimine izin verin.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError('Ses algılanamadı. Lütfen daha net konuşun veya tekrar deneyin.');
        } else {
          setSpeechError(`Ses tanıma uyarısı: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('SpeechRecognition init failed', err);
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [noteTitle]);

  // Toggle speech recording
  const handleToggleListening = () => {
    if (!isSpeechSupported) {
      setSpeechError(
        'Tarayıcınızda Web Speech API desteklenmiyor. Chrome veya Edge kullanabilir veya notunuzu klavyeyle yazabilirsiniz.'
      );
      setIsFormOpen(true);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimText('');
    } else {
      setIsFormOpen(true);
      setSpeechError(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Failed to start speech recognition', err);
          // Restart instance if failed
          try {
            recognitionRef.current.stop();
            setTimeout(() => recognitionRef.current?.start(), 150);
          } catch {
            // ignore
          }
        }
      }
    }
  };

  // Add new note
  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      setSpeechError('Lütfen not içeriği söyleyin veya yazın.');
      return;
    }

    // Stop listening if running
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const now = new Date();
    const formattedDate = `${now.getDate()} ${
      [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
      ][now.getMonth()]
    } ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newNote: VoiceStudyNote = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim() || noteContent.trim().slice(0, 30) + '...',
      content: noteContent.trim(),
      topic: selectedTopic,
      createdAt: formattedDate,
      isPinned: false,
      tags: selectedTopic !== 'genel' ? [TOPIC_LABELS[selectedTopic]?.label.split(' ')[0] || 'İSG'] : ['Genel Not'],
    };

    setNotes((prev) => [newNote, ...prev]);
    setNoteTitle('');
    setNoteContent('');
    setInterimText('');
    setSpeechError(null);
    setIsFormOpen(false);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Pin / Unpin note
  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Copy note to clipboard
  const handleCopyNote = (note: VoiceStudyNote) => {
    const textToCopy = `📝 [İSG Çalışma Notu] ${note.title}\n\n${note.content}\n\n📅 ${note.createdAt}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Text-To-Speech (Sesli Okutma)
  const handlePlayTTS = (note: VoiceStudyNote) => {
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız metin seslendirmeyi desteklemiyor.');
      return;
    }

    if (playingNoteId === note.id) {
      window.speechSynthesis.cancel();
      setPlayingNoteId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${note.title}. ${note.content}`);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setPlayingNoteId(null);
    };

    utterance.onerror = () => {
      setPlayingNoteId(null);
    };

    setPlayingNoteId(note.id);
    window.speechSynthesis.speak(utterance);
  };

  // Stop TTS if unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Filtered and sorted notes (pinned first)
  const filteredNotes = useMemo(() => {
    let list = [...notes];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Topic filter
    if (filterTopic !== 'all') {
      list = list.filter((n) => n.topic === filterTopic);
    }

    // Sort: Pinned first, then chronological
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [notes, searchQuery, filterTopic]);

  return (
    <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md space-y-5 relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mt-20" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mb-20" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <span
            className={`p-2 rounded-xl transition-all shadow-xs flex items-center justify-center ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            }`}
          >
            <Mic className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Sesli Çalışma Not Defteri</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                  Web Speech API
                </span>
              </h2>
              {isListening && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
                  Mikrofon Aktif (Dinleniyor...)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Önemli kanun maddelerini, ezber şifrelerini ve sınav notlarınızı konuşarak anında kaydedin
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleToggleListening}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400/50'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white'
            }`}
            title={isListening ? 'Ses kaydını durdur' : 'Sesli not almaya başla'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Dikteyi Durdur</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Sesle Not Al</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
            title={isFormOpen ? 'Formu Kapat' : 'Yazarak Not Ekle'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFormOpen ? 'Kapat' : 'Yeni Not'}</span>
          </button>
        </div>
      </div>

      {/* Voice Recording Active Audio Visualizer Banner */}
      {isListening && (
        <div className="relative z-10 bg-slate-900/95 border-2 border-rose-500/50 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <Mic className="w-4 h-4 animate-bounce" />
              </span>
              <span className="font-bold text-white text-sm">
                Konuşmanız Dinleniyor & Metne Dönüştürülüyor...
              </span>
            </div>

            {/* Audio Wave Simulating Bars */}
            <div className="flex items-center gap-1 h-5">
              <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
              <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-5" />
              <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-4" />
              <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2" />
              <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-5" />
            </div>
          </div>

          {/* Real-time transcribed text display */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 min-h-[48px] text-xs">
            <span className="text-slate-300 font-medium">
              {noteContent ? `${noteContent} ` : ''}
            </span>
            <span className="text-teal-300 italic font-medium">{interimText || 'Konuşmaya başlayın...'}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>💡 İpucu: Madde numaralarını ve süreleri net telaffuz edin. Dilediğinizde durdurup metni düzenleyebilirsiniz.</span>
            <button
              onClick={handleToggleListening}
              className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
            >
              Tamamla ve Durdur
            </button>
          </div>
        </div>
      )}

      {/* Error / Warning Alert (if any) */}
      {speechError && (
        <div className="relative z-10 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-rose-400 hover:text-white font-bold text-xs cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* New Note Creator Form (Expanded on click or recording) */}
      {isFormOpen && (
        <div className="relative z-10 bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-teal-500/30 shadow-lg space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Yeni Çalışma Notu Oluştur</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {isListening ? '🎙️ Sesle yazdırılıyor' : 'Klavyeyle yazın veya mikrofonu açın'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Not Başlığı</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Örn: 6331 Madde 13 Kaçınma Hakkı"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Topic Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">İlgili Konu</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-teal-500"
              >
                <option value="genel">Genel İSG Notu</option>
                {Object.entries(TOPIC_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Content Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300">
                Not İçeriği & Detaylar
              </label>
              <span className="text-[10px] text-slate-500">{noteContent.length} karakter</span>
            </div>
            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Mikrofonu açarak konuşun ya da klavyenizle sınavda unutmamak istediğiniz kanun maddesi, formül veya şifreyi buraya yazın..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-teal-500 leading-relaxed resize-y"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border-teal-500/30'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListening ? 'Mikrofonu Kapat' : 'Sesle Doldur'}</span>
              </button>

              {noteContent && (
                <button
                  type="button"
                  onClick={() => {
                    setNoteContent('');
                    setNoteTitle('');
                    setInterimText('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                  title="Formu Temizle"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  <span>Temizle</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                  }
                  setIsFormOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Notu Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Saved Notes */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kayıtlı sesli notlarınızda arayın..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Topic Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 text-xs focus:outline-hidden focus:border-teal-500 cursor-pointer"
          >
            <option value="all">Tüm Konular ({notes.length})</option>
            {Object.entries(TOPIC_LABELS).map(([key, info]) => {
              const count = notes.filter((n) => n.topic === key).length;
              if (count === 0) return null;
              return (
                <option key={key} value={key}>
                  {info.label.split(' ')[0]} ({count})
                </option>
              );
            })}
          </select>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {filteredNotes.length} Not Gösteriliyor
          </span>
        </div>
      </div>

      {/* Notes Grid Display */}
      <div className="relative z-10 space-y-3">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredNotes.map((note) => {
              const isPlaying = playingNoteId === note.id;
              const isCopied = copiedNoteId === note.id;
              const topicMeta =
                note.topic && note.topic !== 'genel'
                  ? TOPIC_LABELS[note.topic]
                  : { label: 'Genel Not', color: 'text-slate-400' };

              return (
                <div
                  key={note.id}
                  className={`rounded-xl p-4 border transition-all flex flex-col justify-between gap-3 relative group overflow-hidden ${
                    note.isPinned
                      ? 'bg-slate-900/95 border-amber-500/40 shadow-sm ring-1 ring-amber-500/20'
                      : 'bg-slate-900/70 border-slate-700/80 hover:bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {note.isPinned && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5 fill-amber-300" />
                            Sabitli
                          </span>
                        )}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 truncate">
                          {topicMeta.label}
                        </span>
                      </div>

                      {/* Card Action Icons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* TTS Read Aloud button */}
                        <button
                          onClick={() => handlePlayTTS(note)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isPlaying
                              ? 'bg-teal-500/30 text-teal-300'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                          title={isPlaying ? 'Seslendirmeyi durdur' : 'Notu sesli oku'}
                        >
                          {isPlaying ? (
                            <VolumeX className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyNote(note)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Notu panoya kopyala"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Pin button */}
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            note.isPinned
                              ? 'text-amber-400'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                          }`}
                          title={note.isPinned ? 'Sabitlemeyi kaldır' : 'En başa sabitle'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-400' : ''}`} />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Notu sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Title */}
                    <h4 className="font-bold text-white text-sm leading-snug">
                      {note.title}
                    </h4>

                    {/* Note Content */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                      {note.content}
                    </p>
                  </div>

                  {/* Note Footer: Date & AI / Practice Shortcut */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{note.createdAt}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onNavigateToAIAssistant && (
                        <button
                          onClick={() =>
                            onNavigateToAIAssistant(
                              `Aldığım çalışma notu: "${note.title} - ${note.content}". Bu konu hakkında ÖSYM'de çıkabilecek tuzak soruları ve püf noktaları anlatır mısın?`
                            )
                          }
                          className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                          title="AI Sınav Koçuna sor"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Koça Sor</span>
                        </button>
                      )}

                      {note.topic && note.topic !== 'genel' && onSelectTopicForPractice && (
                        <button
                          onClick={() => onSelectTopicForPractice(note.topic as QuestionTopic)}
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5 cursor-pointer ml-1"
                          title="Bu konudan soru çöz"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Soru Çöz</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/60 rounded-xl p-8 border border-slate-800 text-center space-y-2">
            <Mic className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="font-bold text-white text-sm">Henüz aramanıza uygun not bulunamadı</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Yukarıdaki <strong>"Sesle Not Al"</strong> butonuna basarak ilk sesli çalışma notunuzu konuşarak kaydedebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Türkçe ses tanıma (tr-TR) etkindir</span>
          </span>
          <span>•</span>
          <span>Notlarınız tarayıcınızın yerel hafızasında (localStorage) güvenle saklanır</span>
        </div>

        <div className="text-slate-400">
          Toplam <strong>{notes.length}</strong> kayıtlı çalışma notu
        </div>
      </div>
    </div>
  );
};
