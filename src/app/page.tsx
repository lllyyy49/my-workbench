'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { Dashboard } from '@/components/dashboard';
import { DailyWorkLog } from '@/components/daily-work-log';
import { XiaohongshuNotes } from '@/components/xiaohongshu-notes';
import { ReviewTemplates } from '@/components/review-templates';
import { ViralArticleLibrary } from '@/components/viral-article-library';
import { LearningArea } from '@/components/learning-area';
import { DataAnalysis } from '@/components/data-analysis';
import { ExpenseTracker } from '@/components/expense-tracker';
import { ContentReview } from '@/components/content-review';
import { DiseaseTrends } from '@/components/disease-trends';
import { TodoList } from '@/components/todo-list';
import { CalendarView } from '@/components/calendar-view';
import { QuickNotes } from '@/components/quick-notes';
import { DailyQuote } from '@/components/daily-quote';
import { PasswordProtection } from '@/components/password-protection';
import CharacterWidget from '@/components/character-widget';
import ReadingTracker from '@/components/reading-tracker';
import MovieLibrary from '@/components/movie-library';
import SettingsPanel from '@/components/settings-panel';
import { startReminderChecker } from '@/lib/notifications';

type TabType = 'dashboard' | 'worklog' | 'xiaohongshu' | 'reviews' | 'viral' | 'learning' | 'analysis' | 'expense' | 'contentReview' | 'disease' | 'reading' | 'movie' | 'todos' | 'calendar' | 'notes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  // 键盘快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+, 打开设置
    if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      setShowSettings(true);
    }
    // Ctrl+K 全局搜索
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      setShowSettings(true);
      // 需要在 SettingsPanel 中处理切换到搜索 tab
    }
    // Escape 关闭设置
    if (e.key === 'Escape' && showSettings) {
      setShowSettings(false);
    }
  }, [showSettings]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    // 启动提醒检查器
    const cleanup = startReminderChecker();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cleanup();
    };
  }, [handleKeyDown]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DailyQuote />
            <Dashboard />
          </div>
        );
      case 'worklog':
        return <DailyWorkLog />;
      case 'xiaohongshu':
        return <XiaohongshuNotes />;
      case 'reviews':
        return <ReviewTemplates />;
      case 'viral':
        return <ViralArticleLibrary />;
      case 'learning':
        return <LearningArea />;
      case 'analysis':
        return <DataAnalysis />;
      case 'expense':
        return <ExpenseTracker />;
      case 'contentReview':
        return <ContentReview />;
      case 'disease':
        return <DiseaseTrends />;
      case 'reading':
        return <ReadingTracker />;
      case 'movie':
        return <MovieLibrary />;
      case 'todos':
        return <TodoList />;
      case 'calendar':
        return <CalendarView />;
      case 'notes':
        return <QuickNotes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <PasswordProtection>
      <div className="min-h-screen bg-background">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setShowSettings(true)}
        />
        <main className="container max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-6">
          {renderContent()}
        </main>
        <CharacterWidget />
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </div>
    </PasswordProtection>
  );
}
