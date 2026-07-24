'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ListTodo, Calendar, FileText, TrendingUp, BookOpen, MessageSquare, ClipboardList, Sparkles, Target, Zap } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface WorkLog {
  id: string;
  date: string;
  items: { id: string; content: string; completed: boolean }[];
  summary: string;
  createdAt: number;
}

interface XiaohongshuNote {
  id: string;
  title: string;
  stats: { views: number; likes: number; comments: number; shares: number };
}

interface ReviewTemplate {
  id: string;
  text: string;
  usedCount: number;
}

export function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [xhsNotes, setXhsNotes] = useState<XiaohongshuNote[]>([]);
  const [reviews, setReviews] = useState<ReviewTemplate[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    const storedEvents = localStorage.getItem('calendar-events');
    const storedNotes = localStorage.getItem('notes');
    const storedWorkLogs = localStorage.getItem('work-logs');
    const storedXhsNotes = localStorage.getItem('xiaohongshu-notes');
    const storedReviews = localStorage.getItem('review-templates');

    if (storedTodos) setTodos(JSON.parse(storedTodos));
    if (storedEvents) setEvents(JSON.parse(storedEvents));
    if (storedNotes) setNotes(JSON.parse(storedNotes));
    if (storedWorkLogs) setWorkLogs(JSON.parse(storedWorkLogs));
    if (storedXhsNotes) setXhsNotes(JSON.parse(storedXhsNotes));
    if (storedReviews) setReviews(JSON.parse(storedReviews));
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="gradient-teal rounded-2xl p-8 text-white">
          <div className="h-8 bg-white/20 rounded w-1/3 mb-3 animate-pulse"></div>
          <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 今日工作日志
  const todayWorkLog = workLogs.find(l => l.date === todayStr);
  const todayWorkItems = todayWorkLog?.items || [];
  const todayCompletedWork = todayWorkItems.filter(i => i.completed).length;

  // 待办事项统计
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // 今日日程
  const todayEvents = events.filter(e => e.date === todayStr);

  // 小红书统计
  const totalXhsNotes = xhsNotes.length;
  const totalViews = xhsNotes.reduce((sum, n) => sum + n.stats.views, 0);
  const totalLikes = xhsNotes.reduce((sum, n) => sum + n.stats.likes, 0);

  // 评价库统计
  const totalReviews = reviews.length;
  const totalReviewUsage = reviews.reduce((sum, r) => sum + r.usedCount, 0);

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${'日一二三四五六'[now.getDay()]}`;

  return (
    <div className="space-y-6">
      {/* 欢迎区域 - 渐变卡片 */}
      <div className="gradient-teal rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">今日状态</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{greeting()}，李月</h2>
          <p className="text-white/80 text-sm md:text-base">{dateStr}</p>
          {completionRate === 100 && totalTodos > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm">
              <Zap className="h-4 w-4" />
              <span>太棒了！所有任务已完成</span>
            </div>
          )}
        </div>
      </div>

      {/* 今日工作概览 */}
      <div className="card-enhanced p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <div className="p-2 rounded-lg gradient-teal-light">
            <ClipboardList className="h-5 w-5 text-teal-600" />
          </div>
          今日工作概览
        </h3>
        {todayWorkLog ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">工作进度</span>
              <span className="font-bold text-teal-600">{todayCompletedWork}/{todayWorkItems.length} 项完成</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full gradient-teal rounded-full transition-all duration-700 ease-out"
                style={{ width: `${todayWorkItems.length > 0 ? (todayCompletedWork / todayWorkItems.length) * 100 : 0}%` }}
              />
            </div>
            {todayWorkLog.summary && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  今日复盘
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{todayWorkLog.summary}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
              <ClipboardList className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">今日暂无工作日志</p>
            <p className="text-xs text-gray-300 mt-1">去记录一下今天的工作吧</p>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-enhanced p-5 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl gradient-teal-light group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">待办完成率</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{completionRate}<span className="text-lg text-gray-400">%</span></p>
          <p className="text-xs text-gray-400 mt-2">{completedTodos}/{totalTodos} 项已完成</p>
        </div>

        <div className="card-enhanced p-5 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-5 w-5 text-rose-500" />
            </div>
            <span className="text-sm text-gray-500 font-medium">小红书笔记</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalXhsNotes}</p>
          <p className="text-xs text-gray-400 mt-2">浏览 {totalViews.toLocaleString()}</p>
        </div>

        <div className="card-enhanced p-5 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-sm text-gray-500 font-medium">评价模板</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalReviews}</p>
          <p className="text-xs text-gray-400 mt-2">使用 {totalReviewUsage} 次</p>
        </div>

        <div className="card-enhanced p-5 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-5 w-5 text-violet-500" />
            </div>
            <span className="text-sm text-gray-500 font-medium">今日日程</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{todayEvents.length}</p>
          <p className="text-xs text-gray-400 mt-2">场安排</p>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 待办事项 */}
        <div className="card-enhanced p-6">
          <h3 className="font-semibold mb-5 flex items-center gap-2 text-gray-800">
            <div className="p-2 rounded-lg bg-teal-50">
              <ListTodo className="h-5 w-5 text-teal-600" />
            </div>
            待办事项
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-gray-50">
              <p className="text-2xl font-bold text-gray-700">{totalTodos}</p>
              <p className="text-xs text-gray-400 mt-1">总任务</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-50">
              <p className="text-2xl font-bold text-emerald-600">{completedTodos}</p>
              <p className="text-xs text-gray-400 mt-1">已完成</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-teal-50">
              <p className="text-2xl font-bold text-teal-600">{pendingTodos}</p>
              <p className="text-xs text-gray-400 mt-1">待完成</p>
            </div>
          </div>
        </div>

        {/* 小红书数据 */}
        <div className="card-enhanced p-6">
          <h3 className="font-semibold mb-5 flex items-center gap-2 text-gray-800">
            <div className="p-2 rounded-lg bg-rose-50">
              <TrendingUp className="h-5 w-5 text-rose-500" />
            </div>
            小红书数据
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-rose-50">
              <p className="text-2xl font-bold text-rose-600">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">总浏览</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-pink-50">
              <p className="text-2xl font-bold text-pink-500">{totalLikes.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">总点赞</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-orange-50">
              <p className="text-2xl font-bold text-orange-500">{totalXhsNotes}</p>
              <p className="text-xs text-gray-400 mt-1">笔记数</p>
            </div>
          </div>
        </div>
      </div>

      {/* 待完成事项 */}
      <div className="card-enhanced p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <div className="p-2 rounded-lg bg-amber-50">
            <CheckCircle2 className="h-5 w-5 text-amber-500" />
          </div>
          待完成事项
        </h3>
        {todos.filter(t => !t.completed).length > 0 ? (
          <div className="space-y-2">
            {todos.filter(t => !t.completed).slice(0, 5).map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors duration-200">
                <div className="w-2 h-2 rounded-full gradient-teal flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">{todo.text}</span>
              </div>
            ))}
            {todos.filter(t => !t.completed).length > 5 && (
              <p className="text-xs text-gray-400 pt-2 pl-3">
                还有 {todos.filter(t => !t.completed).length - 5} 项...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500 font-medium">所有任务已完成！</p>
            <p className="text-xs text-gray-400 mt-1">太棒了，继续保持</p>
          </div>
        )}
      </div>
    </div>
  );
}
