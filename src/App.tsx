import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { QuestionBankView } from './components/QuestionBankView';
import { FlashcardsView } from './components/FlashcardsView';
import { CalculatorsView } from './components/CalculatorsView';
import { RegulationsView } from './components/RegulationsView';
import { ChecklistsView } from './components/ChecklistsView';
import { AiAssistantView } from './components/AiAssistantView';
import { AiExplainModal } from './components/AiExplainModal';
import { ExamType, Question, UserStats, DailyActivityItem } from './types';

const getInitialDailyActivity = (): DailyActivityItem[] => {
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const today = new Date();
  const pattern = [
    { offset: 6, solved: 0, correct: 0, wrong: 0 },
    { offset: 5, solved: 0, correct: 0, wrong: 0 },
    { offset: 4, solved: 0, correct: 0, wrong: 0 },
    { offset: 3, solved: 3, correct: 2, wrong: 1 },
    { offset: 2, solved: 4, correct: 3, wrong: 1 },
    { offset: 1, solved: 4, correct: 3, wrong: 1 },
    { offset: 0, solved: 3, correct: 3, wrong: 0 },
  ];
  return pattern.map((p) => {
    const d = new Date(today);
    d.setDate(today.getDate() - p.offset);
    return {
      date: d.toISOString().split('T')[0],
      dayName: p.offset === 0 ? 'Bugün' : dayNames[d.getDay()],
      solved: p.solved,
      correct: p.correct,
      wrong: p.wrong,
      target: 15,
    };
  });
};

const INITIAL_STATS: UserStats = {
  totalAnswered: 14,
  totalCorrect: 11,
  totalWrong: 3,
  streakDays: 4,
  savedQuestionIds: ['q-1', 'q-3'],
  wrongQuestionIds: ['q-7'],
  favoriteCardIds: ['fc-1', 'fc-4', 'fc-5'],
  dailyActivity: getInitialDailyActivity(),
  examHistory: [
    {
      examId: 'mock-1',
      examTitle: '2025 ÖSYM İSG/1 C Sınıfı İGU Genel Deneme Sınavı',
      date: '19.08.2025',
      score: 75,
      correct: 15,
      wrong: 5,
      empty: 0,
      passed: true,
    },
  ],
  topicMastery: {
    kanun_6331: { correct: 4, total: 4 },
    is_hukuku: { correct: 1, total: 1 },
    risk_degerlendirmesi: { correct: 2, total: 2 },
    fiziksel_riskler: { correct: 1, total: 2 },
    kimyasal_riskler: { correct: 1, total: 1 },
    biyolojik_riskler: { correct: 1, total: 1 },
    ergonomi: { correct: 1, total: 1 },
    yangin_acil: { correct: 2, total: 2 },
    is_ekipmanlari: { correct: 1, total: 1 },
    yuksekte_calisma: { correct: 1, total: 1 },
    kapali_alanlar: { correct: 1, total: 1 },
    insaat_isg: { correct: 0, total: 0 },
    maden_isg: { correct: 0, total: 0 },
    elektrik_isg: { correct: 1, total: 1 },
    saglik_ilkyardim: { correct: 1, total: 1 },
    uluslararasi_isg: { correct: 0, total: 1 },
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('c_igu');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');

  const handleSelectTopicForPractice = (topicKey: string) => {
    setSelectedTopicFilter(topicKey);
    setActiveTab('questions');
  };

  // Stats in localStorage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('isg_cep_stats');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('isg_cep_stats', JSON.stringify(userStats));
    } catch (e) {
      console.error(e);
    }
  }, [userStats]);

  // AI Explain Modal State
  const [aiModalQuestion, setAiModalQuestion] = useState<Question | null>(null);
  const [aiModalUserAnswer, setAiModalUserAnswer] = useState<number | null>(null);

  const handleOpenAiExplain = (question: Question, userAnswerIndex: number | null) => {
    setAiModalQuestion(question);
    setAiModalUserAnswer(userAnswerIndex);
  };

  const handleCloseAiModal = () => {
    setAiModalQuestion(null);
    setAiModalUserAnswer(null);
  };

  // Answer handler
  const handleAnswerQuestion = (isCorrect: boolean, question: Question) => {
    setUserStats((prev) => {
      const isAlreadyWrong = prev.wrongQuestionIds.includes(question.id);
      let newWrongList = [...prev.wrongQuestionIds];

      if (!isCorrect && !isAlreadyWrong) {
        newWrongList.push(question.id);
      } else if (isCorrect && isAlreadyWrong) {
        newWrongList = newWrongList.filter((id) => id !== question.id);
      }

      const prevTopic = prev.topicMastery[question.topic] || { correct: 0, total: 0 };
      const updatedTopic = {
        correct: prevTopic.correct + (isCorrect ? 1 : 0),
        total: prevTopic.total + 1,
      };

      // Update today's daily activity
      const todayStr = new Date().toISOString().split('T')[0];
      const existingActivity = prev.dailyActivity && prev.dailyActivity.length > 0
        ? [...prev.dailyActivity]
        : getInitialDailyActivity();
      const todayIndex = existingActivity.findIndex((d) => d.date === todayStr);

      let updatedDailyActivity: DailyActivityItem[];
      if (todayIndex >= 0) {
        updatedDailyActivity = existingActivity.map((item, idx) =>
          idx === todayIndex
            ? {
                ...item,
                solved: item.solved + 1,
                correct: item.correct + (isCorrect ? 1 : 0),
                wrong: item.wrong + (isCorrect ? 0 : 1),
              }
            : item
        );
      } else {
        updatedDailyActivity = [
          ...existingActivity.slice(-6),
          {
            date: todayStr,
            dayName: 'Bugün',
            solved: 1,
            correct: isCorrect ? 1 : 0,
            wrong: isCorrect ? 0 : 1,
            target: 15,
          },
        ];
      }

      return {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        totalWrong: prev.totalWrong + (isCorrect ? 0 : 1),
        wrongQuestionIds: newWrongList,
        topicMastery: {
          ...prev.topicMastery,
          [question.topic]: updatedTopic,
        },
        dailyActivity: updatedDailyActivity,
      };
    });
  };

  const handleToggleSaveQuestion = (questionId: string) => {
    setUserStats((prev) => {
      const isSaved = prev.savedQuestionIds.includes(questionId);
      return {
        ...prev,
        savedQuestionIds: isSaved
          ? prev.savedQuestionIds.filter((id) => id !== questionId)
          : [...prev.savedQuestionIds, questionId],
      };
    });
  };

  const handleToggleFavoriteCard = (cardId: string) => {
    setUserStats((prev) => {
      const isFav = prev.favoriteCardIds.includes(cardId);
      return {
        ...prev,
        favoriteCardIds: isFav
          ? prev.favoriteCardIds.filter((id) => id !== cardId)
          : [...prev.favoriteCardIds, cardId],
      };
    });
  };

  const handleSaveExamResult = (result: {
    examId: string;
    examTitle: string;
    score: number;
    correct: number;
    wrong: number;
    empty: number;
    passed: boolean;
  }) => {
    setUserStats((prev) => ({
      ...prev,
      totalAnswered: prev.totalAnswered + result.correct + result.wrong,
      totalCorrect: prev.totalCorrect + result.correct,
      totalWrong: prev.totalWrong + result.wrong,
      examHistory: [
        {
          ...result,
          date: new Date().toLocaleDateString('tr-TR'),
        },
        ...prev.examHistory,
      ],
    }));
  };

  const handleAskAiAboutRegulation = (lawTitle: string) => {
    setActiveTab('ai-assistant');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedExamType={selectedExamType}
        setSelectedExamType={setSelectedExamType}
        totalSaved={userStats.savedQuestionIds.length}
        totalWrong={userStats.wrongQuestionIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            selectedExamType={selectedExamType}
            setSelectedExamType={setSelectedExamType}
            setActiveTab={setActiveTab}
            userStats={userStats}
            onAnswerDailyQuestion={handleAnswerQuestion}
            onOpenAiExplain={handleOpenAiExplain}
            onSelectTopicForPractice={handleSelectTopicForPractice}
          />
        )}

        {activeTab === 'exams' && (
          <ExamSimulatorView
            selectedExamType={selectedExamType}
            onSaveExamResult={handleSaveExamResult}
            onOpenAiExplain={handleOpenAiExplain}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionBankView
            selectedExamType={selectedExamType}
            userStats={userStats}
            onToggleSaveQuestion={handleToggleSaveQuestion}
            onAnswerQuestion={handleAnswerQuestion}
            onOpenAiExplain={handleOpenAiExplain}
            initialTopic={selectedTopicFilter}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            userStats={userStats}
            onToggleFavoriteCard={handleToggleFavoriteCard}
          />
        )}

        {activeTab === 'calculators' && <CalculatorsView />}

        {activeTab === 'regulations' && (
          <RegulationsView onAskAiAboutRegulation={handleAskAiAboutRegulation} />
        )}

        {activeTab === 'checklists' && <ChecklistsView />}

        {activeTab === 'ai-assistant' && <AiAssistantView />}
      </main>

      {/* Global AI Question Breakdown Modal */}
      {aiModalQuestion && (
        <AiExplainModal
          question={aiModalQuestion}
          userAnswerIndex={aiModalUserAnswer}
          onClose={handleCloseAiModal}
        />
      )}

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">İSG Cep Akademi</span>
            <span>•</span>
            <span>ÖSYM İSG Sınavlarına Hazırlık & Saha Mühendislik Platformu</span>
          </div>
          <div className="text-[11px] text-slate-400">
            6331 Sayılı İSG Kanunu & Yönetmelikler Uyumlu
          </div>
        </div>
      </footer>
    </div>
  );
}
