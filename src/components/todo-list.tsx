'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, CheckSquare, Square } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('todos');
    if (stored) {
      setTodos(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTodos([todo, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // 批量选择切换
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(todos.map(t => t.id)));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 条待办吗？`)) {
      setTodos(todos.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
      setIsBatchMode(false);
    }
  };

  // 退出批量模式
  const exitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedIds(new Set());
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    setTodos(todos.map(t => t.id === editingId ? { ...t, text: editText.trim() } : t));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) {
        saveEdit();
      } else {
        addTodo();
      }
    }
  };

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">待办事项</h2>
          <p className="text-muted-foreground text-sm">管理你的日常任务</p>
        </div>
        {isBatchMode ? (
          <div className="flex gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
            >
              {selectedIds.size === todos.length ? (
                <>
                  <Square className="h-4 w-4" />
                  取消全选
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  全选
                </>
              )}
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0}
              className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              删除 ({selectedIds.size})
            </button>
            <button
              onClick={exitBatchMode}
              className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all text-sm font-medium"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsBatchMode(true)}
            className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
          >
            <CheckSquare className="h-4 w-4" />
            批量管理
          </button>
        )}
      </div>

      {/* 添加新任务 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="添加新任务..."
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <button
          onClick={addTodo}
          className="px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          添加
        </button>
      </div>

      {/* 待完成任务 */}
      {pendingTodos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            待完成 ({pendingTodos.length})
          </h3>
          {pendingTodos.map(todo => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-sm transition-all group ${isBatchMode && selectedIds.has(todo.id) ? 'ring-2 ring-primary' : ''}`}
            >
              {isBatchMode ? (
                <button
                  onClick={() => toggleSelect(todo.id)}
                  className="flex-shrink-0"
                >
                  {selectedIds.has(todo.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 h-5 w-5 rounded border-2 border-border hover:border-primary transition-colors"
                />
              )}
              {editingId === todo.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-1 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-1.5 rounded hover:bg-secondary text-green-600">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={cancelEdit} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-foreground">{todo.text}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(todo)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
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
      )}

      {/* 已完成任务 */}
      {completedTodos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            已完成 ({completedTodos.length})
          </h3>
          {completedTodos.map(todo => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-4 rounded-lg bg-card border border-border opacity-60 hover:opacity-80 transition-all group ${isBatchMode && selectedIds.has(todo.id) ? 'ring-2 ring-primary opacity-100' : ''}`}
            >
              {isBatchMode ? (
                <button
                  onClick={() => toggleSelect(todo.id)}
                  className="flex-shrink-0"
                >
                  {selectedIds.has(todo.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 h-5 w-5 rounded border-2 border-primary bg-primary flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </button>
              )}
              <span className="flex-1 text-muted-foreground line-through">{todo.text}</span>
              {!isBatchMode && (
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">暂无待办事项</p>
          <p className="text-xs mt-1">添加你的第一个任务开始吧</p>
        </div>
      )}
    </div>
  );
}
