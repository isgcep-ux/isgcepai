export type ExamType =
  | 'all'
  | 'c_igu'
  | 'b_igu'
  | 'a_igu'
  | 'isyeri_hekimligi'
  | 'dsp';

export interface ExamTypeInfo {
  id: ExamType;
  name: string;
  shortName: string;
  badgeColor: string;
  description: string;
}

export type QuestionTopic =
  | 'kanun_6331'
  | 'is_hukuku'
  | 'risk_degerlendirmesi'
  | 'fiziksel_riskler'
  | 'kimyasal_riskler'
  | 'biyolojik_riskler'
  | 'ergonomi'
  | 'yangin_acil'
  | 'is_ekipmanlari'
  | 'yuksekte_calisma'
  | 'kapali_alanlar'
  | 'insaat_isg'
  | 'maden_isg'
  | 'elektrik_isg'
  | 'saglik_ilkyardim'
  | 'uluslararasi_isg';

export interface Question {
  id: string;
  topic: QuestionTopic;
  examTypes: ExamType[];
  text: string;
  options: string[]; // 5 options (A, B, C, D, E)
  correctIndex: number; // 0 to 4
  explanation: string;
  legalBasis: string; // e.g. "6331 Sayılı Kanun Madde 11"
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  year?: string; // e.g. "2023 İSG/2 Çıkmış Soru Benzeri"
}

export interface MockExam {
  id: string;
  title: string;
  targetExam: ExamType;
  questionCount: number;
  durationMinutes: number;
  questions?: Question[];
  description: string;
  difficulty: 'Temel' | 'Standart ÖSYM' | 'İleri Düzey';
}

export interface FlashCard {
  id: string;
  title: string;
  category: QuestionTopic;
  summary: string;
  details: string[];
  codeTrick?: string; // Ezberleme kodlama tekniği / Mnemonic
  legalRef: string;
  importance: 'Çok Yüksek' | 'Yüksek' | 'Orta';
}

export interface RegulationItem {
  id: string;
  title: string;
  shortCode: string;
  category: string;
  officialDate: string;
  summary: string;
  keyArticles: {
    articleNo: string;
    title: string;
    content: string;
  }[];
  penaltyInfo?: string;
}

export interface FieldChecklist {
  id: string;
  title: string;
  category: string;
  description: string;
  items: {
    id: string;
    text: string;
    standardRef: string;
    status: 'pass' | 'fail' | 'na' | 'unselected';
    note?: string;
  }[];
}

export interface DailyActivityItem {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Pzt", "Sal", "Çar"
  fullDateLabel?: string; // e.g. "7 Eylül 2026"
  solved: number;
  correct: number;
  wrong: number;
  target?: number;
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  streakDays: number;
  savedQuestionIds: string[];
  wrongQuestionIds: string[];
  favoriteCardIds: string[];
  examHistory: {
    examId: string;
    examTitle: string;
    date: string;
    score: number;
    correct: number;
    wrong: number;
    empty: number;
    passed: boolean;
  }[];
  topicMastery: Record<QuestionTopic, { correct: number; total: number }>;
  dailyActivity?: DailyActivityItem[];
}
