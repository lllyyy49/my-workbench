'use client';

import { useState, useMemo } from 'react';
import { Clock, CheckCircle, BookOpen, Film, DollarSign, TrendingUp, FileText, Heart } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'todo' | 'note' | 'work' | 'xiaohongshu' | 'expense' | 'reading' | 'movie' | 'learning';
  title: string;
  description?: string;
  timestamp: number;
  completed?: boolean;
  module: string;
}

function getEventIcon(type: TimelineEvent['type']) {
  const icons = {
    todo: <CheckCircle className="w-4 h-4" />,
    note: <FileText className="w-4 h-4" />,
    work: <TrendingUp className="w-4 h-4" />,
    xiaohongshu: <Heart className="w-4 h-4" />,
    expense: <DollarSign className="w-4 h-4" />,
    reading: <BookOpen className="w-4 h-4" />,
    movie: <Film className="w-4 h-4" />,
    learning: <BookOpen className="w-4 h-4" />,
  };
  return icons[type] || <Clock className="w-4 h-4" />;
}

function getEventColor(type: TimelineEvent['type']) {
  const colors = {
    todo: 'bg-emerald-100 text-emerald-600',
    note: 'bg-blue-100 text-blue-600',
    work: 'bg-purple-100 text-purple-600',
    xiaohongshu: 'bg-red-100 text-red-600',
    expense: 'bg-amber-100 text-amber-600',
    reading: 'bg-indigo-100 text-indigo-600',
    movie: 'bg-pink-100 text-pink-600',
    learning: 'bg-cyan-100 text-cyan-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

interface TimelineViewProps {
  events: TimelineEvent[];
}

export default function TimelineView({ events }: TimelineViewProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    let filtered = events;

    // Filter by date range
    if (dateRange === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(e => e.timestamp >= todayStart);
    } else if (dateRange === 'week') {
      const weekAgo = now - 7 * 86400000;
      filtered = filtered.filter(e => e.timestamp >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = now - 30 * 86400000;
      filtered = filtered.filter(e => e.timestamp >= monthAgo);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [events, filterType, dateRange]);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayEvents = events.filter(e => e.timestamp >= today);
    return {
      total: events.length,
      today: todayEvents.length,
      completed: events.filter(e => e.completed).length,
    };
  }, [events]);

  const moduleTypes = [
    { value: 'all', label: '全部', icon: <Clock className="w-4 h-4" /> },
    { value: 'todo', label: '待办', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'note', label: '记事', icon: <FileText className="w-4 h-4" /> },
    { value: 'work', label: '工作', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'xiaohongshu', label: '小红书', icon: <Heart className="w-4 h-4" /> },
    { value: 'expense', label: '记账', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'reading', label: '读书', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'movie', label: '电影', icon: <Film className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">总记录</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-emerald-600">{stats.today}</div>
          <div className="text-sm text-gray-500">今日</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">已完成</div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {moduleTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filterType === type.value
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                dateRange === range
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'today' ? '今天' : range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无记录</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="relative flex gap-4 group">
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getEventColor(event.type)} shadow-sm`}>
                  {getEventIcon(event.type)}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                          {event.module}
                        </span>
                        {event.completed && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            已完成
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
