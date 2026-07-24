'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Dashboard } from '@/components/dashboard';
import { DailyWorkLog } from '@/components/daily-work-log';
import { XiaohongshuNotes } from '@/components/xiaohongshu-notes';
import { ReviewTemplates } from '@/components/review-templates';
import { LearningArea } from '@/components/learning-area';
import { TodoList } from '@/components/todo-list';
import { CalendarView } from '@/components/calendar-view';
import { QuickNotes } from '@/components/quick-notes';

type TabType = 'dashboard' | 'worklog' | 'xiaohongshu' | 'reviews' | 'learning' | 'todos' | 'calendar' | 'notes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'worklog':
        return <DailyWorkLog />;
      case 'xiaohongshu':
        return <XiaohongshuNotes />;
      case 'reviews':
        return <ReviewTemplates />;
      case 'learning':
        return <LearningArea />;
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
