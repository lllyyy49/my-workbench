'use client';

import { CheckSquare, Calendar, FileText, BarChart3 } from 'lucide-react';

type TabType = 'dashboard' | 'todos' | 'calendar' | 'notes';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'dashboard' as const, label: '工作台', icon: BarChart3 },
    { id: 'todos' as const, label: '待办事项', icon: CheckSquare },
    { id: 'calendar' as const, label: '日程日历', icon: Calendar },
    { id: 'notes' as const, label: '快速记事', icon: FileText },
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
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] rounded-lg transition-all duration-200 ${
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
