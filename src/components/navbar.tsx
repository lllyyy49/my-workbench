'use client';

import { useState } from 'react';
import { BarChart3, FileText, Calendar, ClipboardList, MessageSquare, BookOpen, GraduationCap, TrendingUp, Wallet, Flame, X, MoreHorizontal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: 'dashboard' | 'todos' | 'calendar' | 'notes' | 'worklog' | 'xiaohongshu' | 'reviews' | 'learning' | 'analysis' | 'expense' | 'viral') => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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

  // 移动端底部导航显示前5个 + 更多按钮
  const mobileMainTabs = tabs.slice(0, 5);
  const mobileMoreTabs = tabs.slice(5);

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-teal shadow-lg shadow-teal-500/25">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">李月的工作台</h1>
                <p className="text-xs text-gray-500">效率 · 专注 · 成长</p>
              </div>
            </div>
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
        </div>
      </header>

      {/* 移动端底部导航 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileMainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[56px] rounded-xl transition-all duration-300 ${
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
          {/* 更多按钮 */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[56px] rounded-xl transition-all duration-300 text-gray-400 hover:text-teal-600"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs font-medium">更多</span>
          </button>
        </div>
      </nav>

      {/* 更多菜单弹窗 */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-[60] flex items-end justify-center">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMoreMenu(false)}
          />
          {/* 菜单内容 */}
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">更多功能</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {/* 功能列表 */}
            <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                {mobileMoreTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setShowMoreMenu(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'gradient-teal text-white shadow-lg shadow-teal-500/25'
                          : 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
                      }`}
                    >
                      <Icon className={`h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* 底部安全区域 */}
            <div className="h-safe-area-inset-bottom" />
          </div>
        </div>
      )}
    </>
  );
}
