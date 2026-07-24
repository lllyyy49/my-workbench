'use client';

import { BarChart3, ClipboardList, Calendar, FileText, BookOpen, MessageSquare, GraduationCap, TrendingUp, Wallet, Sparkles, Flame } from 'lucide-react';

type TabType = 'dashboard' | 'worklog' | 'xiaohongshu' | 'reviews' | 'learning' | 'analysis' | 'expense' | 'viral' | 'todos' | 'calendar' | 'notes';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'dashboard' as const, label: '工作台', icon: BarChart3 },
    { id: 'analysis' as const, label: '数据分析', icon: TrendingUp },
    { id: 'xiaohongshu' as const, label: '小红书', icon: BookOpen },
    { id: 'learning' as const, label: '学习', icon: GraduationCap },
    { id: 'expense' as const, label: '记账', icon: Wallet },
    { id: 'worklog' as const, label: '工作日志', icon: ClipboardList },
    { id: 'reviews' as const, label: '评价库', icon: MessageSquare },
    { id: 'viral' as const, label: '爆文库', icon: Flame },
    { id: 'todos' as const, label: '待办', icon: FileText },
    { id: 'calendar' as const, label: '日历', icon: Calendar },
    { id: 'notes' as const, label: '记事', icon: FileText },
  ];

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-teal text-white shadow-lg shadow-teal-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">李月的工作台</h1>
              <p className="text-xs text-gray-400">效率 · 专注 · 成长</p>
            </div>
          </div>
          
          {/* 桌面端导航标签 */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'gradient-teal text-white shadow-lg shadow-teal-500/25'
                      : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 移动端底部导航 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 safe-area-bottom">
        <div className="flex items-center justify-around h-16 overflow-x-auto px-2">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'gradient-teal text-white shadow-lg shadow-teal-500/25'
                    : 'text-gray-400 hover:text-teal-600'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
