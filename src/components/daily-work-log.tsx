'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Check, X } from 'lucide-react';
import { useSyncedData } from '@/hooks/use-synced-data';

interface WorkItem {
  id: string;
  content: string;
  completed: boolean;
}

interface WorkLog {
  id: string;
  date: string;
  content: string;
  completed: boolean;
  summary: string;
  createdAt: number;
}

export function DailyWorkLog() {
  const { data: logs, loading, addData, updateData, deleteData } = useSyncedData<WorkLog>('work_logs');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newItem, setNewItem] = useState('');
  const [summary, setSummary] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(todayStr);
  }, []);

  // 将扁平的 work_logs 转换为按日期分组
  const logsByDate = logs?.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, WorkLog[]>) || {};

  const currentLogItems = selectedDate ? (logsByDate[selectedDate] || []) : [];

  const createLogForDate = () => {
    if (!selectedDate) return;
    const newLog: WorkLog = {
      id: Date.now().toString(),
      date: selectedDate,
      items: [],
      summary: '',
      createdAt: Date.now(),
    };
    setLogs([newLog, ...logs]);
    return newLog;
  };

  const addItem = async () => {
    if (!newItem.trim() || !selectedDate) return;
    await addData({
      date: selectedDate,
      content: newItem.trim(),
      completed: false,
      summary: '',
      createdAt: Date.now(),
    });
    setNewItem('');
  };

  const toggleItem = async (item: WorkLog) => {
    await updateData(item.id, { completed: !item.completed });
  };

  const deleteItem = async (itemId: string) => {
    await deleteData(itemId);
  };

  const startEditItem = (item: WorkLog) => {
    setEditingItemId(item.id);
    setEditText(item.content);
  };

  const saveEditItem = async () => {
    if (!editText.trim() || !editingItemId) return;
    await updateData(editingItemId, { content: editText.trim() });
    setEditingItemId(null);
    setEditText('');
  };

  const updateSummary = async (value: string) => {
    setSummary(value);
    // 更新该日期的所有记录的 summary
    const items = logsByDate[selectedDate] || [];
    for (const item of items) {
      await updateData(item.id, { summary: value });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 星期${weekDays[date.getDay()]}`;
  };

  const getRecentDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dates.push(dateStr);
    }
    return dates;
  };

  const completedCount = currentLog?.items.filter(i => i.completed).length || 0;
  const totalCount = currentLog?.items.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">每日工作日志</h2>
        <p className="text-muted-foreground text-sm">记录和复盘每天的工作内容</p>
      </div>

      {/* 日期选择 */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">选择日期</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {getRecentDates().map(date => {
            const items = logsByDate[date] || [];
            const hasLog = items.length > 0;
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : hasLog
                    ? 'bg-secondary text-foreground'
                    : 'bg-background border border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                {formatDate(date)}
                {hasLog && !isSelected && (
                  <span className="ml-1.5 text-xs">•</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 工作内容 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{formatDate(selectedDate)} 工作内容</h3>
          {totalCount > 0 && (
            <span className="text-sm text-muted-foreground">
              已完成 {completedCount}/{totalCount}
            </span>
          )}
        </div>

        {/* 添加新工作项 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="添加工作项..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={addItem}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>

        {/* 工作项列表 */}
        {currentItems.length > 0 ? (
          <div className="space-y-2">
            {currentItems.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${
                  item.completed ? 'border-green-200 bg-green-50/50' : 'border-border'
                }`}
              >
                <button
                  onClick={() => toggleItem(item)}
                  className="flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                {editingItemId === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditItem()}
                      className="flex-1 px-3 py-1 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                    <button onClick={saveEditItem} className="p-1.5 rounded hover:bg-secondary text-green-600">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingItemId(null)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.content}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditItem(item)}
                        className="p-1.5 rounded hover:bg-secondary text-muted-foreground"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            暂无工作项，添加你今天的工作内容
          </p>
        )}
      </div>

      {/* 日复盘总结 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">日复盘总结</h3>
        <textarea
          value={summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="今天的收获、遇到的问题、明天的计划..."
          className="w-full h-32 px-4 py-3 rounded-lg border border-border bg-background text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </div>
  );
}
