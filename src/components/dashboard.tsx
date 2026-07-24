'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ListTodo, Calendar, FileText, TrendingUp, BookOpen, MessageSquare, ClipboardList } from 'lucide-react';

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
        <div>
          <h2 className="text-2xl font-semibold mb-2">工作台</h2>
          <p className="text-muted-foreground text-sm">欢迎回来，李月</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-secondary rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-secondary rounded w-1/3"></div>
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
      {/* 欢迎区域 */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">{greeting()}，李月</h2>
        <p className="text-muted-foreground text-sm">{dateStr}</p>
      </div>

      {/* 今日工作概览 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          今日工作概览
        </h3>
        {todayWorkLog ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">工作进度</span>
              <span className="font-medium">{todayCompletedWork}/{todayWorkItems.length} 项完成</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${todayWorkItems.length > 0 ? (todayCompletedWork / todayWorkItems.length) * 100 : 0}%` }}
              />
            </div>
            {todayWorkLog.summary && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">今日复盘</p>
                <p className="text-sm">{todayWorkLog.summary}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">今日暂无工作日志，去记录一下吧</p>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">待办完成率</span>
          </div>
          <p className="text-3xl font-bold">{completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{completedTodos}/{totalTodos} 项</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">小红书笔记</span>
          </div>
          <p className="text-3xl font-bold">{totalXhsNotes}</p>
          <p className="text-xs text-muted-foreground mt-1">浏览 {totalViews.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">评价模板</span>
          </div>
          <p className="text-3xl font-bold">{totalReviews}</p>
          <p className="text-xs text-muted-foreground mt-1">使用 {totalReviewUsage} 次</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-muted-foreground">今日日程</span>
          </div>
          <p className="text-3xl font-bold">{todayEvents.length}</p>
          <p className="text-xs text-muted-foreground mt-1">场安排</p>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 待办事项 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            待办事项
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalTodos}</p>
              <p className="text-xs text-muted-foreground">总任务</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedTodos}</p>
              <p className="text-xs text-muted-foreground">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{pendingTodos}</p>
              <p className="text-xs text-muted-foreground">待完成</p>
            </div>
          </div>
        </div>

        {/* 小红书数据 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            小红书数据
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">总浏览</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">总点赞</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalXhsNotes}</p>
              <p className="text-xs text-muted-foreground">笔记数</p>
            </div>
          </div>
        </div>
      </div>

      {/* 待完成事项 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          待完成事项
        </h3>
        {todos.filter(t => !t.completed).length > 0 ? (
          <div className="space-y-2">
            {todos.filter(t => !t.completed).slice(0, 5).map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm truncate">{todo.text}</span>
              </div>
            ))}
            {todos.filter(t => !t.completed).length > 5 && (
              <p className="text-xs text-muted-foreground pt-1">
                还有 {todos.filter(t => !t.completed).length - 5} 项...
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            所有任务已完成！
          </p>
        )}
      </div>
    </div>
  );
}
