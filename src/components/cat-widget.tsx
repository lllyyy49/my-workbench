'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Plus, Clock, Trash2 } from 'lucide-react';

interface Memo {
  id: string;
  content: string;
  remindTime: string; // ISO string
  completed: boolean;
  createdAt: string;
}

type CatMood = 'sleepy' | 'working' | 'eating' | 'happy' | 'alerting' | 'idle';

// SVG 猫咪组件 - 不同状态
function CatSVG({ mood, onClick }: { mood: CatMood; onClick: () => void }) {
  const catBody = '#F5A623'; // 橘猫色
  const catBelly = '#FFF3E0';
  const catNose = '#FF8A80';
  const catEye = '#333';

  return (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full cursor-pointer transition-transform duration-300 hover:scale-110"
      onClick={onClick}
    >
      {/* 耳朵 */}
      <polygon points="30,45 40,15 55,40" fill={catBody} />
      <polygon points="90,45 80,15 65,40" fill={catBody} />
      <polygon points="35,42 42,22 52,40" fill="#FFB74D" />
      <polygon points="85,42 78,22 68,40" fill="#FFB74D" />

      {/* 头 */}
      <ellipse cx="60" cy="55" rx="35" ry="30" fill={catBody} />

      {/* 肚子/脸下部 */}
      <ellipse cx="60" cy="62" rx="22" ry="18" fill={catBelly} />

      {/* 眼睛 */}
      {mood === 'sleepy' ? (
        <>
          <path d="M42,52 Q48,48 54,52" stroke={catEye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M66,52 Q72,48 78,52" stroke={catEye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Zzz */}
          <text x="85" y="30" fontSize="10" fill="#9E9E9E" fontFamily="sans-serif">Z</text>
          <text x="93" y="22" fontSize="8" fill="#BDBDBD" fontFamily="sans-serif">z</text>
          <text x="99" y="16" fontSize="6" fill="#E0E0E0" fontFamily="sans-serif">z</text>
        </>
      ) : mood === 'working' ? (
        <>
          <ellipse cx="48" cy="52" rx="5" ry="6" fill={catEye} />
          <ellipse cx="72" cy="52" rx="5" ry="6" fill={catEye} />
          <circle cx="46" cy="50" r="2" fill="white" />
          <circle cx="70" cy="50" r="2" fill="white" />
          {/* 眼镜 */}
          <circle cx="48" cy="52" r="8" stroke="#5D4037" strokeWidth="1.5" fill="none" />
          <circle cx="72" cy="52" r="8" stroke="#5D4037" strokeWidth="1.5" fill="none" />
          <line x1="56" y1="52" x2="64" y2="52" stroke="#5D4037" strokeWidth="1.5" />
        </>
      ) : mood === 'eating' ? (
        <>
          <ellipse cx="48" cy="50" rx="4" ry="5" fill={catEye} />
          <ellipse cx="72" cy="50" rx="4" ry="5" fill={catEye} />
          <circle cx="47" cy="48" r="1.5" fill="white" />
          <circle cx="71" cy="48" r="1.5" fill="white" />
          {/* 嘴巴 - 吃东西 */}
          <ellipse cx="60" cy="65" rx="6" ry="4" fill={catNose} />
          {/* 鱼骨头 */}
          <text x="75" y="75" fontSize="12" fill="#FFB74D">🐟</text>
        </>
      ) : mood === 'happy' ? (
        <>
          <path d="M42,52 Q48,46 54,52" stroke={catEye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M66,52 Q72,46 78,52" stroke={catEye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* 开心嘴巴 */}
          <path d="M54,64 Q60,70 66,64" stroke={catEye} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 腮红 */}
          <ellipse cx="40" cy="62" rx="5" ry="3" fill="#FFAB91" opacity="0.6" />
          <ellipse cx="80" cy="62" rx="5" ry="3" fill="#FFAB91" opacity="0.6" />
        </>
      ) : mood === 'alerting' ? (
        <>
          <ellipse cx="48" cy="50" rx="6" ry="7" fill={catEye} />
          <ellipse cx="72" cy="50" rx="6" ry="7" fill={catEye} />
          <circle cx="46" cy="48" r="2.5" fill="white" />
          <circle cx="70" cy="48" r="2.5" fill="white" />
          {/* 惊讶嘴巴 */}
          <ellipse cx="60" cy="66" rx="4" ry="5" fill={catNose} />
          {/* 感叹号 */}
          <text x="88" y="35" fontSize="16" fill="#FF5722" fontWeight="bold">!</text>
        </>
      ) : (
        <>
          <ellipse cx="48" cy="52" rx="4" ry="5" fill={catEye} />
          <ellipse cx="72" cy="52" rx="4" ry="5" fill={catEye} />
          <circle cx="47" cy="50" r="1.5" fill="white" />
          <circle cx="71" cy="50" r="1.5" fill="white" />
          {/* 普通嘴巴 */}
          <path d="M56,64 Q60,67 64,64" stroke={catEye} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* 鼻子 */}
      <ellipse cx="60" cy="60" rx="3" ry="2" fill={catNose} />

      {/* 胡须 */}
      <line x1="20" y1="58" x2="42" y2="60" stroke="#9E9E9E" strokeWidth="1" />
      <line x1="18" y1="64" x2="42" y2="63" stroke="#9E9E9E" strokeWidth="1" />
      <line x1="78" y1="60" x2="100" y2="58" stroke="#9E9E9E" strokeWidth="1" />
      <line x1="78" y1="63" x2="102" y2="64" stroke="#9E9E9E" strokeWidth="1" />

      {/* 身体 */}
      <ellipse cx="60" cy="95" rx="28" ry="22" fill={catBody} />
      <ellipse cx="60" cy="98" rx="18" ry="14" fill={catBelly} />

      {/* 爪子 */}
      <ellipse cx="42" cy="112" rx="8" ry="6" fill={catBody} />
      <ellipse cx="78" cy="112" rx="8" ry="6" fill={catBody} />

      {/* 尾巴 */}
      {mood === 'happy' ? (
        <path d="M88,95 Q105,80 100,65" stroke={catBody} strokeWidth="6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M88,95 Q100,90 95,80" stroke={catBody} strokeWidth="6" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

// 状态提示气泡
function MoodBubble({ mood }: { mood: CatMood }) {
  const messages: Record<CatMood, string> = {
    sleepy: '好困呀... 该休息了~',
    working: '加油！还有很多事要做呢！',
    eating: '干饭时间到！🐟',
    happy: '今天表现很棒！喵~',
    alerting: '有事情提醒你哦！',
    idle: '有什么需要帮忙的吗？喵~',
  };

  return (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-full shadow-md text-xs text-gray-700 whitespace-nowrap border border-gray-100">
      {messages[mood]}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-gray-100 rotate-45" />
    </div>
  );
}

export default function CatWidget() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newRemindTime, setNewRemindTime] = useState('');
  const [catMood, setCatMood] = useState<CatMood>('idle');
  const [showBubble, setShowBubble] = useState(false);
  const [widgetPos, setWidgetPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  // 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('cat-memos');
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch {}
    }
    const savedPos = localStorage.getItem('cat-widget-pos');
    if (savedPos) {
      try {
        setWidgetPos(JSON.parse(savedPos));
      } catch {}
    }
    const savedNotified = localStorage.getItem('cat-notified');
    if (savedNotified) {
      try {
        setNotifiedIds(new Set(JSON.parse(savedNotified)));
      } catch {}
    }
  }, []);

  // 保存数据
  useEffect(() => {
    localStorage.setItem('cat-memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem('cat-widget-pos', JSON.stringify(widgetPos));
  }, [widgetPos]);

  useEffect(() => {
    localStorage.setItem('cat-notified', JSON.stringify([...notifiedIds]));
  }, [notifiedIds]);

  // 根据时间和待办事项判断猫咪状态
  useEffect(() => {
    const updateMood = () => {
      const now = new Date();
      const hour = now.getHours();
      const pendingMemos = memos.filter(
        m => !m.completed && new Date(m.remindTime).getTime() <= now.getTime()
      );

      if (pendingMemos.length > 0) {
        setCatMood('alerting');
      } else if (hour >= 23 || hour < 6) {
        setCatMood('sleepy');
      } else if (hour >= 11 && hour <= 13) {
        setCatMood('eating');
      } else if (hour >= 17 && hour <= 19) {
        setCatMood('eating');
      } else {
        // 检查是否有未完成的待办
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          try {
            const todos = JSON.parse(savedTodos);
            const pending = todos.filter((t: any) => !t.completed);
            if (pending.length > 3) {
              setCatMood('working');
            } else if (pending.length === 0) {
              setCatMood('happy');
            } else {
              setCatMood('idle');
            }
          } catch {
            setCatMood('idle');
          }
        } else {
          setCatMood('idle');
        }
      }
    };

    updateMood();
    const interval = setInterval(updateMood, 60000); // 每分钟更新
    return () => clearInterval(interval);
  }, [memos]);

  // 检查提醒
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      memos.forEach(memo => {
        if (!memo.completed && new Date(memo.remindTime).getTime() <= now.getTime()) {
          if (!notifiedIds.has(memo.id)) {
            // 浏览器通知
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('李月的工作台 - 备忘录提醒', {
                body: memo.content,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐱</text></svg>',
              });
            }
            setNotifiedIds(prev => new Set([...prev, memo.id]));
          }
        }
      });
    };

    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [memos, notifiedIds]);

  const addMemo = () => {
    if (!newContent.trim() || !newRemindTime) return;
    const memo: Memo = {
      id: Date.now().toString(),
      content: newContent.trim(),
      remindTime: new Date(newRemindTime).toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setMemos(prev => [...prev, memo]);
    setNewContent('');
    setNewRemindTime('');
    setShowAddForm(false);
  };

  const toggleComplete = (id: string) => {
    setMemos(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
    setNotifiedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const pendingCount = memos.filter(m => !m.completed).length;

  // 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.cat-no-drag')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - widgetPos.x,
      y: e.clientY - widgetPos.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      // 限制在窗口范围内
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 120;
      setWidgetPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (isToday) return `今天 ${timeStr}`;
    return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`;
  };

  const isOverdue = (iso: string) => {
    return new Date(iso).getTime() < Date.now();
  };

  return (
    <>
      {/* 猫咪小部件 */}
      <div
        className="fixed z-50 select-none"
        style={{
          left: widgetPos.x || window.innerWidth - 100,
          top: widgetPos.y || window.innerHeight - 160,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="relative group">
          {/* 状态气泡 */}
          {showBubble && <MoodBubble mood={catMood} />}

          {/* 提醒数量标记 */}
          {pendingCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold z-10 animate-bounce">
              {pendingCount}
            </div>
          )}

          {/* 猫咪 */}
          <div
            className="w-[72px] h-[72px] transition-transform duration-300"
            onClick={() => {
              setShowBubble(!showBubble);
              setTimeout(() => setShowBubble(false), 3000);
            }}
          >
            <CatSVG mood={catMood} onClick={() => setShowPanel(!showPanel)} />
          </div>

          {/* 悬浮提示 */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {pendingCount > 0 ? `${pendingCount} 个待提醒` : '点击打开备忘录'}
          </div>
        </div>
      </div>

      {/* 备忘录面板 */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => { setShowPanel(false); setShowAddForm(false); }}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden cat-no-drag"
            onClick={e => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    <CatSVG mood={catMood} onClick={() => {}} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">猫咪备忘录</h3>
                    <p className="text-xs text-gray-500">
                      {pendingCount > 0 ? `${pendingCount} 个待提醒` : '暂无提醒'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* 内容区 */}
            <div className="overflow-y-auto max-h-[50vh] p-4">
              {!showAddForm ? (
                <>
                  {memos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-3">
                        <CatSVG mood="idle" onClick={() => {}} />
                      </div>
                      <p className="text-sm text-gray-400">还没有备忘录</p>
                      <p className="text-xs text-gray-300 mt-1">点击下方按钮添加提醒</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {memos
                        .sort((a, b) => new Date(a.remindTime).getTime() - new Date(b.remindTime).getTime())
                        .map(memo => (
                          <div
                            key={memo.id}
                            className={`p-3 rounded-xl border transition-all ${
                              memo.completed
                                ? 'bg-gray-50 border-gray-100 opacity-60'
                                : isOverdue(memo.remindTime)
                                ? 'bg-red-50 border-red-100'
                                : 'bg-white border-gray-100 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleComplete(memo.id)}
                                className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                  memo.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 hover:border-teal-500'
                                }`}
                              >
                                {memo.completed && (
                                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${memo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {memo.content}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock size={10} className={isOverdue(memo.remindTime) && !memo.completed ? 'text-red-500' : 'text-gray-400'} />
                                  <span className={`text-xs ${isOverdue(memo.remindTime) && !memo.completed ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                    {formatTime(memo.remindTime)}
                                    {isOverdue(memo.remindTime) && !memo.completed ? ' (已过期)' : ''}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteMemo(memo.id)}
                                className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                              >
                                <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">提醒内容</label>
                    <textarea
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="输入提醒内容..."
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">提醒时间</label>
                    <input
                      type="datetime-local"
                      value={newRemindTime}
                      onChange={e => setNewRemindTime(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addMemo}
                      disabled={!newContent.trim() || !newRemindTime}
                      className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      添加提醒
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 底部 */}
            {!showAddForm && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl text-sm font-medium hover:from-amber-500 hover:to-orange-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  添加提醒
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
