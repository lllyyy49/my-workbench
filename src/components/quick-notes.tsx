'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('notes');
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotes(parsed);
      if (parsed.length > 0) {
        setSelectedNoteId(parsed[0].id);
        setTitle(parsed[0].title);
        setContent(parsed[0].content);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const createNote = () => {
    const note: Note = {
      id: Date.now().toString(),
      title: '无标题笔记',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const updateNote = () => {
    if (!selectedNoteId) return;
    setNotes(notes.map(n =>
      n.id === selectedNoteId
        ? { ...n, title: title || '无标题笔记', content, updatedAt: Date.now() }
        : n
    ));
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (selectedNoteId === id) {
      if (updated.length > 0) {
        setSelectedNoteId(updated[0].id);
        setTitle(updated[0].title);
        setContent(updated[0].content);
      } else {
        setSelectedNoteId(null);
        setTitle('');
        setContent('');
      }
    }
  };

  const selectNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setSelectedNoteId(id);
      setTitle(note.title);
      setContent(note.content);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">快速记事</h2>
        <p className="text-muted-foreground text-sm">随时记录你的想法</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* 笔记列表 */}
        <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索笔记..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={createNote}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              新建笔记
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => selectNote(note.id)}
                    className={`w-full text-left p-4 hover:bg-secondary/50 transition-colors group ${
                      selectedNoteId === note.id ? 'bg-secondary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">{note.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {note.content || '暂无内容'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">
                  {searchQuery ? '没有找到匹配的笔记' : '暂无笔记'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 笔记编辑区 */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              <div className="p-4 border-b border-border">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTimeout(updateNote, 0);
                  }}
                  className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground"
                  placeholder="笔记标题..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  最后更新于 {formatDate(selectedNote.updatedAt)}
                </p>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setTimeout(updateNote, 0);
                  }}
                  className="w-full h-full bg-transparent border-none focus:outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground"
                  placeholder="开始记录你的想法..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">选择一篇笔记或创建新笔记</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
