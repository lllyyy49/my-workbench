'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ListTodo, Calendar, FileText, TrendingUp } from 'lucide-react';

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

export function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    const storedEvents = localStorage.getItem('calendar-events');
    const storedNotes = localStorage.getItem('notes');

    if (storedTodos) setTodos(JSON.parse(storedTodos));
    if (storedEvents) setEvents(JSON.parse(storedEvents));
    if (storedNotes) setNotes(JSON.parse(storedNotes));
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">工作台</h2>
          <p className="text-muted-foreground text-sm">欢迎回来，李月</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
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

  // 今日完成的任务
  const todayCompletedTodos = todos.filter(t => {
    if (!t.completed) return false;
    const todoDate = new Date(t.createdAt);
    return (
      `${todoDate.getFullYear()}-${String(todoDate.getMonth() + 1).padStart(2, '0')}-${String(todoDate.getDate()).padStart(2, '0')}` === todayStr ||
      t.completed // 简化：只要标记完成就算
    );
  });

  // 本周完成的任务（简化：最近7天内标记完成的）
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // 今日日程
  const todayEvents = events.filter(e => e.date === todayStr);

  // 本周日程
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const weekEvents = events.filter(e => {
    const eventDate = new Date(e.date + 'T00:00:00');
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  // 笔记数量
  const totalNotes = notes.length;
  const recentNotes = notes.filter(n => {
    const noteDate = new Date(n.updatedAt);
    return now.getTime() - noteDate.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

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

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">今日完成</span>
          </div>
          <p className="text-3xl font-bold">{todayCompletedTodos.length}</p>
          <p className="text-xs text-muted-foreground mt-1">个任务</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">完成率</span>
          </div>
          <p className="text-3xl font-bold">{completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{completedTodos}/{totalTodos} 项</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">本周日程</span>
          </div>
          <p className="text-3xl font-bold">{weekEvents.length}</p>
          <p className="text-xs text-muted-foreground mt-1">场安排</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-muted-foreground">笔记</span>
          </div>
          <p className="text-3xl font-bold">{totalNotes}</p>
          <p className="text-xs text-muted-foreground mt-1">本周 {recentNotes} 篇更新</p>
        </div>
      </div>

      {/* 进度与待办 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 任务进度 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            任务概览
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">完成进度</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
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
        </div>

        {/* 今日待办 */}
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

      {/* 今日日程 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          今日日程
        </h3>
        {todayEvents.length > 0 ? (
          <div className="space-y-2">
            {todayEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.time && (
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            今天没有日程安排
          </p>
        )}
      </div>
    </div>
  );
}
