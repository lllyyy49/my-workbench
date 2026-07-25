'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Plus, Clock, Trash2, Heart, MessageCircle } from 'lucide-react';

interface Memo {
  id: string;
  content: string;
  remindTime: string;
  completed: boolean;
  createdAt: string;
}

type CatMood = 'sleepy' | 'working' | 'eating' | 'happy' | 'alerting' | 'idle' | 'loved' | 'playing';
type CatAction = 'none' | 'pet' | 'feed' | 'play';

// 更精致的 SVG 猫咪组件
function CatSVG({ mood, action, onClick }: { mood: CatMood; action: CatAction; onClick: () => void }) {
  const catBody = '#FF9F43';
  const catBelly = '#FFF5E6';
  const catNose = '#FF6B6B';
  const catEye = '#2D3436';
  const catInner = '#FFB88C';

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full cursor-pointer select-none"
      onClick={onClick}
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
    >
      <defs>
        <radialGradient id="bodyGradient" cx="50%" cy="40%">
          <stop offset="0%" stopColor={catBody} />
          <stop offset="100%" stopColor="#E67E22" />
        </radialGradient>
        <radialGradient id="bellyGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor={catBelly} />
          <stop offset="100%" stopColor="#FFE0B2" />
        </radialGradient>
      </defs>

      {/* 尾巴 */}
      <path
        d="M140,140 Q170,120 165,90 Q163,80 158,85 Q160,110 140,130"
        fill="url(#bodyGradient)"
        className={mood === 'happy' || mood === 'playing' ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}
      />

      {/* 身体 */}
      <ellipse cx="100" cy="140" rx="55" ry="45" fill="url(#bodyGradient)" />
      <ellipse cx="100" cy="145" rx="35" ry="30" fill="url(#bellyGradient)" />

      {/* 前爪 */}
      <ellipse cx="75" cy="170" rx="12" ry="8" fill={catBody} />
      <ellipse cx="125" cy="170" rx="12" ry="8" fill={catBody} />
      <ellipse cx="75" cy="172" rx="8" ry="5" fill={catBelly} />
      <ellipse cx="125" cy="172" rx="8" ry="5" fill={catBelly} />

      {/* 头 */}
      <ellipse cx="100" cy="85" rx="50" ry="45" fill="url(#bodyGradient)" />

      {/* 耳朵 */}
      <polygon points="55,60 65,20 85,55" fill="url(#bodyGradient)" />
      <polygon points="145,60 135,20 115,55" fill="url(#bodyGradient)" />
      <polygon points="62,55 68,28 80,52" fill={catInner} />
      <polygon points="138,55 132,28 120,52" fill={catInner} />

      {/* 脸部白色区域 */}
      <ellipse cx="100" cy="95" rx="30" ry="25" fill="url(#bellyGradient)" />

      {/* 眼睛 */}
      {mood === 'sleepy' ? (
        <>
          <path d="M75,82 Q82,76 89,82" stroke={catEye} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M111,82 Q118,76 125,82" stroke={catEye} strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x="140" y="50" fontSize="14" fill="#9E9E9E" fontFamily="sans-serif" className="animate-pulse">Z</text>
          <text x="152" y="40" fontSize="11" fill="#BDBDBD" fontFamily="sans-serif" className="animate-pulse">z</text>
          <text x="160" y="33" fontSize="9" fill="#E0E0E0" fontFamily="sans-serif" className="animate-pulse">z</text>
        </>
      ) : mood === 'working' ? (
        <>
          <ellipse cx="82" cy="82" rx="7" ry="8" fill={catEye} />
          <ellipse cx="118" cy="82" rx="7" ry="8" fill={catEye} />
          <circle cx="80" cy="79" r="3" fill="white" />
          <circle cx="116" cy="79" r="3" fill="white" />
          {/* 眼镜 */}
          <circle cx="82" cy="82" r="12" stroke="#5D4037" strokeWidth="2" fill="none" />
          <circle cx="118" cy="82" r="12" stroke="#5D4037" strokeWidth="2" fill="none" />
          <line x1="94" y1="82" x2="106" y2="82" stroke="#5D4037" strokeWidth="2" />
          <line x1="70" y1="82" x2="58" y2="78" stroke="#5D4037" strokeWidth="2" />
          <line x1="130" y1="82" x2="142" y2="78" stroke="#5D4037" strokeWidth="2" />
        </>
      ) : mood === 'eating' ? (
        <>
          <ellipse cx="82" cy="78" rx="6" ry="7" fill={catEye} />
          <ellipse cx="118" cy="78" rx="6" ry="7" fill={catEye} />
          <circle cx="80" cy="76" r="2.5" fill="white" />
          <circle cx="116" cy="76" r="2.5" fill="white" />
          {/* 嘴巴 - 吃东西 */}
          <ellipse cx="100" cy="100" rx="8" ry="6" fill={catNose} />
          <text x="130" y="110" fontSize="20">🐟</text>
        </>
      ) : mood === 'happy' || mood === 'loved' ? (
        <>
          <path d="M75,82 Q82,74 89,82" stroke={catEye} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M111,82 Q118,74 125,82" stroke={catEye} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M92,100 Q100,108 108,100" stroke={catEye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="65" cy="95" rx="8" ry="5" fill="#FFAB91" opacity="0.7" />
          <ellipse cx="135" cy="95" rx="8" ry="5" fill="#FFAB91" opacity="0.7" />
          {mood === 'loved' && (
            <>
              <text x="140" y="50" fontSize="18" className="animate-bounce">❤️</text>
              <text x="40" y="40" fontSize="14" className="animate-bounce" style={{ animationDelay: '0.3s' }}>💕</text>
            </>
          )}
        </>
      ) : mood === 'alerting' ? (
        <>
          <ellipse cx="82" cy="78" rx="9" ry="10" fill={catEye} />
          <ellipse cx="118" cy="78" rx="9" ry="10" fill={catEye} />
          <circle cx="79" cy="75" r="4" fill="white" />
          <circle cx="115" cy="75" r="4" fill="white" />
          <ellipse cx="100" cy="102" rx="6" ry="7" fill={catNose} />
          <text x="145" y="50" fontSize="20" fill="#FF5722" fontWeight="bold" className="animate-pulse">❗</text>
        </>
      ) : mood === 'playing' ? (
        <>
          <ellipse cx="82" cy="78" rx="8" ry="9" fill={catEye} />
          <ellipse cx="118" cy="78" rx="8" ry="9" fill={catEye} />
          <circle cx="79" cy="75" r="3.5" fill="white" />
          <circle cx="115" cy="75" r="3.5" fill="white" />
          <path d="M92,100 Q100,110 108,100" stroke={catEye} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <text x="140" y="50" fontSize="18" className="animate-bounce">🎾</text>
        </>
      ) : (
        <>
          <ellipse cx="82" cy="82" rx="6" ry="7" fill={catEye} />
          <ellipse cx="118" cy="82" rx="6" ry="7" fill={catEye} />
          <circle cx="80" cy="80" r="2.5" fill="white" />
          <circle cx="116" cy="80" r="2.5" fill="white" />
          <path d="M94,100 Q100,104 106,100" stroke={catEye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* 鼻子 */}
      <polygon points="96,92 104,92 100,97" fill={catNose} />

      {/* 嘴巴 */}
      {mood !== 'eating' && mood !== 'happy' && mood !== 'loved' && mood !== 'playing' && (
        <>
          <path d="M100,97 L100,102" stroke={catEye} strokeWidth="1.5" />
          <path d="M94,102 Q100,106 106,102" stroke={catEye} strokeWidth="1.5" fill="none" />
        </>
      )}

      {/* 胡须 */}
      <line x1="70" y1="92" x2="45" y2="88" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="97" x2="45" y2="97" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="102" x2="45" y2="106" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="130" y1="92" x2="155" y2="88" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="130" y1="97" x2="155" y2="97" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="130" y1="102" x2="155" y2="106" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />

      {/* 抚摸效果 */}
      {action === 'pet' && (
        <>
          <text x="140" y="30" fontSize="20" className="animate-bounce">✨</text>
          <text x="30" y="50" fontSize="16" className="animate-bounce" style={{ animationDelay: '0.2s' }}>💫</text>
        </>
      )}

      {/* 喂食效果 */}
      {action === 'feed' && (
        <text x="140" y="120" fontSize="22" className="animate-bounce"></text>
      )}

      {/* 玩耍效果 */}
      {action === 'play' && (
        <>
          <text x="150" y="40" fontSize="20" className="animate-bounce">🎉</text>
          <text x="20" y="60" fontSize="18" className="animate-bounce" style={{ animationDelay: '0.3s' }}>⭐</text>
        </>
      )}
    </svg>
  );
}

export default function CatWidget() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newMemo, setNewMemo] = useState({ content: '', remindTime: '' });
  const [mood, setMood] = useState<CatMood>('idle');
  const [action, setAction] = useState<CatAction>('none');
  const [bubbleText, setBubbleText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [petCount, setPetCount] = useState(0);
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('cat-memos');
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch {}
    }
    const savedPos = localStorage.getItem('cat-position');
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch {}
    } else {
      setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 200 });
    }
    const savedPetCount = localStorage.getItem('cat-pet-count');
    if (savedPetCount) {
      setPetCount(parseInt(savedPetCount) || 0);
    }
  }, []);

  // 保存数据
  useEffect(() => {
    localStorage.setItem('cat-memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem('cat-position', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('cat-pet-count', petCount.toString());
  }, [petCount]);

  // 根据时间自动切换状态
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      setMood('sleepy');
      setBubbleText('好困呀...zzz');
    } else if (hour >= 6 && hour < 9) {
      setMood('eating');
      setBubbleText('早餐时间！');
    } else if (hour >= 9 && hour < 12) {
      setMood('working');
      setBubbleText('认真工作中~');
    } else if (hour >= 12 && hour < 14) {
      setMood('eating');
      setBubbleText('午餐时间到！');
    } else if (hour >= 14 && hour < 18) {
      setMood('working');
      setBubbleText('下午也要加油！');
    } else if (hour >= 18 && hour < 20) {
      setMood('happy');
      setBubbleText('下班啦~开心！');
    } else if (hour >= 20 && hour < 22) {
      setMood('playing');
      setBubbleText('玩耍时间！');
    } else {
      setMood('sleepy');
      setBubbleText('该睡觉了~');
    }

    // 检查提醒
    const now = new Date();
    memos.forEach(memo => {
      if (!memo.completed && memo.remindTime) {
        const remindTime = new Date(memo.remindTime);
        const diff = remindTime.getTime() - now.getTime();
        if (diff > 0 && diff < 60000) {
          setMood('alerting');
          setBubbleText(`提醒：${memo.content}`);
        }
      }
    });
  }, [memos]);

  // 清除气泡文字
  useEffect(() => {
    if (bubbleText) {
      const timer = setTimeout(() => setBubbleText(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [bubbleText]);

  // 清除动作效果
  useEffect(() => {
    if (action !== 'none') {
      const timer = setTimeout(() => setAction('none'), 2000);
      return () => clearTimeout(timer);
    }
  }, [action]);

  // 拖拽功能
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!widgetRef.current) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 100, newX)),
        y: Math.max(0, Math.min(window.innerHeight - 100, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 点击猫咪互动
  const handleCatClick = () => {
    if (isDragging) return;
    setPetCount(prev => prev + 1);
    setMood('loved');
    setAction('pet');

    const messages = [
      '喵~好舒服！',
      '再摸摸我~',
      '最喜欢你了！',
      '喵呜~开心！',
      '继续摸嘛~',
      '好幸福呀！',
    ];
    setBubbleText(messages[Math.floor(Math.random() * messages.length)]);

    setTimeout(() => {
      setMood('happy');
    }, 3000);
  };

  // 右键菜单互动
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const feedMessages = ['好吃！喵~', '还要还要！', '太美味了！'];
    setMood('eating');
    setAction('feed');
    setBubbleText(feedMessages[Math.floor(Math.random() * feedMessages.length)]);
    setTimeout(() => setMood('happy'), 3000);
  };

  // 双击玩耍
  const handleDoubleClick = () => {
    const playMessages = ['好开心！', '再来再来！', '太好玩了！', '喵哈哈~'];
    setMood('playing');
    setAction('play');
    setBubbleText(playMessages[Math.floor(Math.random() * playMessages.length)]);
    setTimeout(() => setMood('happy'), 3000);
  };

  const addMemo = () => {
    if (!newMemo.content.trim()) return;
    const memo: Memo = {
      id: Date.now().toString(),
      content: newMemo.content.trim(),
      remindTime: newMemo.remindTime ? new Date(newMemo.remindTime).toISOString() : '',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setMemos(prev => [memo, ...prev]);
    setNewMemo({ content: '', remindTime: '' });
    setShowForm(false);
    setMood('happy');
    setBubbleText('记住啦！喵~');
  };

  const toggleComplete = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
  };

  const pendingMemos = memos.filter(m => !m.completed);
  const completedMemos = memos.filter(m => m.completed);

  return (
    <>
      {/* 可拖拽猫咪小部件 */}
      <div
        ref={widgetRef}
        className="fixed z-50 select-none"
        style={{
          left: position.x,
          top: position.y,
          width: 100,
          height: 100,
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        {/* 气泡对话 */}
        {bubbleText && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap text-sm font-medium text-gray-700 animate-[fadeIn_0.3s_ease-out]">
            {bubbleText}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45"></div>
          </div>
        )}

        {/* 提醒标记 */}
        {mood === 'alerting' && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <Bell className="w-3.5 h-3.5 text-white" />
          </div>
        )}

        {/* 猫咪 */}
        <div className={`transition-transform duration-200 ${isDragging ? 'scale-110' : 'hover:scale-105'}`}>
          <CatSVG mood={mood} action={action} onClick={handleCatClick} />
        </div>

        {/* 互动提示 */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
          点击抚摸 · 双击玩耍 · 右键喂食
        </div>
      </div>

      {/* 备忘录面板 */}
      {showPanel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowPanel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-lg"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">猫咪备忘录</h3>
                  <p className="text-xs text-gray-500">
                    已抚摸 {petCount} 次 · {pendingMemos.length} 条待办
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPanel(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* 添加按钮 */}
            <div className="p-4 border-b border-gray-50">
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加备忘录
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={newMemo.content}
                    onChange={e => setNewMemo(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="写点什么..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none text-sm"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input
                      type="datetime-local"
                      value={newMemo.remindTime}
                      onChange={e => setNewMemo(prev => ({ ...prev, remindTime: e.target.value }))}
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addMemo}
                      className="flex-1 py-2 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition-colors text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pendingMemos.length === 0 && completedMemos.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-4xl block mb-2">🐾</span>
                  <p className="text-sm">还没有备忘录，猫咪在等你哦~</p>
                </div>
              )}

              {pendingMemos.map(memo => (
                <div key={memo.id} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => toggleComplete(memo.id)}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-orange-300 hover:bg-orange-200 transition-colors flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{memo.content}</p>
                      {memo.remindTime && (
                        <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(memo.remindTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    <button onClick={() => deleteMemo(memo.id)} className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              {completedMemos.length > 0 && (
                <>
                  <div className="text-xs text-gray-400 font-medium pt-2">已完成</div>
                  {completedMemos.map(memo => (
                    <div key={memo.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 opacity-60">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleComplete(memo.id)}
                          className="mt-0.5 w-5 h-5 rounded-full bg-green-400 border-2 border-green-400 flex items-center justify-center flex-shrink-0"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <p className="text-sm text-gray-500 line-through flex-1">{memo.content}</p>
                        <button onClick={() => deleteMemo(memo.id)} className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 打开面板按钮 */}
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-6 right-6 z-30 w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        title="猫咪备忘录"
      >
        {pendingMemos.length > 0 ? (
          <>
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {pendingMemos.length}
            </span>
          </>
        ) : (
          <MessageCircle className="w-5 h-5 text-white" />
        )}
      </button>
    </>
  );
}
