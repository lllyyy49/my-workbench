'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart3, FileText, Calendar, ClipboardList, MessageSquare, BookOpen, GraduationCap, TrendingUp, Wallet, Flame, X, MoreHorizontal, Camera, User, Target, GripVertical } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: 'dashboard' | 'todos' | 'calendar' | 'notes' | 'worklog' | 'xiaohongshu' | 'reviews' | 'learning' | 'analysis' | 'expense' | 'viral' | 'contentReview') => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showEditHint, setShowEditHint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // 默认标签顺序
  const defaultTabList = [
    { id: 'dashboard' as const, label: '工作台', icon: BarChart3 },
    { id: 'analysis' as const, label: '数据分析', icon: TrendingUp },
    { id: 'xiaohongshu' as const, label: '小红书', icon: BookOpen },
    { id: 'contentReview' as const, label: '内容复盘', icon: Target },
    { id: 'learning' as const, label: '学习', icon: GraduationCap },
    { id: 'expense' as const, label: '记账', icon: Wallet },
    { id: 'worklog' as const, label: '工作日志', icon: ClipboardList },
    { id: 'reviews' as const, label: '评价库', icon: MessageSquare },
    { id: 'viral' as const, label: '爆文库', icon: Flame },
    { id: 'todos' as const, label: '待办', icon: FileText },
    { id: 'calendar' as const, label: '日历', icon: Calendar },
    { id: 'notes' as const, label: '记事', icon: FileText },
  ];

  // 从 localStorage 加载标签顺序
  const [tabs, setTabs] = useState(() => {
    if (typeof window === 'undefined') return defaultTabList;
    const saved = localStorage.getItem('tab-order');
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved) as string[];
        return savedOrder.map(id => defaultTabList.find(t => t.id === id)).filter((t): t is typeof defaultTabList[0] => t !== undefined);
      } catch {
        return defaultTabList;
      }
    }
    return defaultTabList;
  });

  // 从 localStorage 加载头像
  useEffect(() => {
    const savedAvatar = localStorage.getItem('user-avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  // 保存标签顺序到 localStorage
  const saveTabOrder = (newTabs: typeof tabs) => {
    const order = newTabs.map(t => t.id);
    localStorage.setItem('tab-order', JSON.stringify(order));
    setTabs(newTabs);
  };

  // 重置为默认顺序
  const resetTabOrder = () => {
    saveTabOrder(defaultTabList);
    setShowEditHint(false);
  };

  // 拖动开始
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  // 拖动进入
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  // 拖动结束
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const newTabs = [...tabs];
    const draggedItem = newTabs[dragItem.current];
    newTabs.splice(dragItem.current, 1);
    newTabs.splice(dragOverItem.current, 0, draggedItem);

    saveTabOrder(newTabs);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatar(result);
        localStorage.setItem('user-avatar', result);
        setShowAvatarMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 删除头像
  const handleRemoveAvatar = () => {
    setAvatar(null);
    localStorage.removeItem('user-avatar');
    setShowAvatarMenu(false);
  };

  // 头像组件
  const AvatarComponent = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowAvatarMenu(!showAvatarMenu)}
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50`}
        >
          {avatar ? (
            <img src={avatar} alt="头像" className="h-full w-full object-cover" />
          ) : (
            <User className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'} text-teal-500`} />
          )}
        </button>
        
        {/* 头像菜单 */}
        {showAvatarMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowAvatarMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 flex items-center gap-2 transition-colors"
              >
                <Camera className="h-4 w-4" />
                {avatar ? '更换头像' : '上传头像'}
              </button>
              {avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                  删除头像
                </button>
              )}
            </div>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>
    );
  };

  // 移动端底部导航显示前5个 + 更多按钮
  const mobileMainTabs = tabs.slice(0, 5);
  const mobileMoreTabs = tabs.slice(5);

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 左侧标题 */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-teal shadow-md shadow-teal-500/20">
                <BarChart3 className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold text-gray-900 leading-tight">李月的工作台</h1>
                <p className="text-[10px] text-gray-400 leading-tight">效率 · 专注 · 成长</p>
              </div>
            </div>
            {/* 中间导航 - 支持拖动排序 */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      isActive
                        ? 'gradient-teal text-white shadow-md shadow-teal-500/20'
                        : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50/50'
                    }`}
                    title="拖动可调整顺序"
                  >
                    <GripVertical className="h-3 w-3 opacity-40 hover:opacity-100 transition-opacity" />
                    <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              {/* 重置按钮 */}
              <button
                onClick={() => setShowEditHint(!showEditHint)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all"
                title="重置顺序"
              >
                <X className="h-3 w-3" />
              </button>
            </nav>
            {/* 右侧头像 */}
            <div className="hidden lg:block">
              <AvatarComponent size="md" />
            </div>
          </div>
        </div>
        {/* 重置确认提示 */}
        {showEditHint && (
          <div className="absolute top-16 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[200px]">
            <p className="text-sm text-gray-700 mb-2">拖动标签可调整顺序</p>
            <button
              onClick={resetTabOrder}
              className="w-full px-3 py-1.5 text-xs text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              重置为默认顺序
            </button>
          </div>
        )}
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
          {/* 移动端头像 */}
          <AvatarComponent size="sm" />
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
