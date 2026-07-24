'use client';

import { useState } from 'react';
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
import { TodoList } from '@/components/todo-list';
import { CalendarView } from '@/components/calendar-view';
import { QuickNotes } from '@/components/quick-notes';
import { DailyQuote } from '@/components/daily-quote';

type TabType = 'dashboard' | 'worklog' | 'xiaohongshu' | 'reviews' | 'viral' | 'learning' | 'analysis' | 'expense' | 'contentReview' | 'todos' | 'calendar' | 'notes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

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
    <div className="min-h-screen bg-background">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-6">
        {renderContent()}
      </main>
    </div>
  );
}
