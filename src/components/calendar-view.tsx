'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  color: string;
}

const EVENT_COLORS = [
  '#14B8A6', // teal
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '', color: EVENT_COLORS[0] });

  useEffect(() => {
    const stored = localStorage.getItem('calendar-events');
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const today = formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      date: selectedDate,
      time: newEvent.time || undefined,
      color: newEvent.color,
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', time: '', color: EVENT_COLORS[0] });
    setShowAddModal(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const days = [];
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateStr = formatDate(year, month - 1, day);
    days.push({ day, dateStr, isCurrentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = formatDate(year, month, i);
    days.push({ day: i, dateStr, isCurrentMonth: true });
  }
  // Next month days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const dateStr = formatDate(year, month + 1, i);
    days.push({ day: i, dateStr, isCurrentMonth: false });
  }

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">日程日历</h2>
        <p className="text-muted-foreground text-sm">规划你的时间安排</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 日历主体 */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 md:p-6">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {year}年 {monthNames[month]}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((item, idx) => {
              const dayEvents = getEventsForDate(item.dateStr);
              const isToday = item.dateStr === today;
              const isSelected = item.dateStr === selectedDate;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                    !item.isCurrentMonth ? 'text-muted-foreground/40' : ''
                  } ${
                    isToday ? 'bg-primary/10 text-primary font-semibold' : ''
                  } ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  } hover:bg-secondary/50`}
                >
                  <span>{item.day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((e, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 日程详情面板 */}
        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {new Date(selectedDate + 'T00:00:00').getMonth() + 1}月{new Date(selectedDate + 'T00:00:00').getDate()}日 日程
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border group hover:shadow-sm transition-all"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.time && (
                          <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-destructive transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  暂无日程安排
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">选择一个日期查看日程</p>
            </div>
          )}
        </div>
      </div>

      {/* 添加日程弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">添加日程</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">标题</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="输入日程标题..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">时间（可选）</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">颜色</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newEvent.color === color ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={addEvent}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
