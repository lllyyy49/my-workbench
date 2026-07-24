'use client';

import { BarChart3, ClipboardList, Calendar, FileText, BookOpen, MessageSquare, GraduationCap, TrendingUp, Wallet } from 'lucide-react';

type TabType = 'dashboard' | 'worklog' | 'xiaohongshu' | 'reviews' | 'learning' | 'analysis' | 'expense' | 'todos' | 'calendar' | 'notes';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'dashboard' as const, label: '工作台', icon: BarChart3 },
    { id: 'worklog' as const, label: '工作日志', icon: ClipboardList },
    { id: 'xiaohongshu' as const, label: '小红书', icon: BookOpen },
    { id: 'reviews' as const, label: '评价库', icon: MessageSquare },
    { id: 'learning' as const, label: '学习', icon: GraduationCap },
    { id: 'analysis' as const, label: '数据分析', icon: TrendingUp },
    { id: 'expense' as const, label: '记账', icon: Wallet },
    { id: 'todos' as const, label: '待办', icon: FileText },
    { id: 'calendar' as const, label: '日历', icon: Calendar },
    { id: 'notes' as const, label: '记事', icon: FileText },
  ];

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">李</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight">李月的工作台</h1>
          </div>
          
          {/* 桌面端导航标签 */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 移动端底部导航 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 safe-area-bottom">
        <div className="flex items-center justify-around h-16 overflow-x-auto">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[56px] rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
