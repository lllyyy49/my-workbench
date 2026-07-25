'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Star, Quote, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface BookEntry {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  totalPages: number;
  currentPage: number;
  status: 'reading' | 'completed' | 'planned';
  startDate: string;
  endDate?: string;
  learnings: LearningEntry[];
  quotes: string[];
  rating: number;
  notes: string;
  createdAt: string;
}

interface LearningEntry {
  id: string;
  content: string;
  chapter: string;
  createdAt: string;
}

const CATEGORIES = ['文学小说', '商业管理', '心理学', '历史哲学', '科技互联网', '自我提升', '艺术设计', '其他'];

const STORAGE_KEY = 'reading-entries';

export default function ReadingTracker() {
  const [entries, setEntries] = useState<BookEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLearningForm, setShowLearningForm] = useState<string | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    category: '文学小说',
    totalPages: 0,
    currentPage: 0,
    status: 'reading' as 'reading' | 'completed' | 'planned',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    rating: 0,
    notes: '',
  });
  const [learningData, setLearningData] = useState({ content: '', chapter: '' });
  const [quoteData, setQuoteData] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const resetForm = () => {
    setFormData({
      title: '', author: '', cover: '', category: '文学小说',
      totalPages: 0, currentPage: 0, status: 'reading',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '', rating: 0, notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? {
        ...e, ...formData,
        endDate: formData.status === 'completed' ? formData.endDate || new Date().toISOString().split('T')[0] : e.endDate,
      } : e));
    } else {
      const newEntry: BookEntry = {
        id: Date.now().toString(),
        ...formData,
        learnings: [],
        quotes: [],
        createdAt: new Date().toISOString(),
      };
      setEntries(prev => [newEntry, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (entry: BookEntry) => {
    setFormData({
      title: entry.title, author: entry.author, cover: entry.cover,
      category: entry.category, totalPages: entry.totalPages,
      currentPage: entry.currentPage, status: entry.status,
      startDate: entry.startDate, endDate: entry.endDate || '',
      rating: entry.rating, notes: entry.notes,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除这本书吗？')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const addLearning = (bookId: string) => {
    if (!learningData.content.trim()) return;
    setEntries(prev => prev.map(e => e.id === bookId ? {
      ...e,
      learnings: [...e.learnings, {
        id: Date.now().toString(),
        content: learningData.content,
        chapter: learningData.chapter,
        createdAt: new Date().toISOString(),
      }],
    } : e));
    setLearningData({ content: '', chapter: '' });
    setShowLearningForm(null);
  };

  const removeLearning = (bookId: string, learningId: string) => {
    setEntries(prev => prev.map(e => e.id === bookId ? {
      ...e, learnings: e.learnings.filter(l => l.id !== learningId),
    } : e));
  };

  const addQuote = (bookId: string) => {
    if (!quoteData.trim()) return;
    setEntries(prev => prev.map(e => e.id === bookId ? {
      ...e, quotes: [...e.quotes, quoteData],
    } : e));
    setQuoteData('');
    setShowQuoteForm(null);
  };

  const removeQuote = (bookId: string, index: number) => {
    setEntries(prev => prev.map(e => e.id === bookId ? {
      ...e, quotes: e.quotes.filter((_, i) => i !== index),
    } : e));
  };

  const updateProgress = (bookId: string, page: number) => {
    setEntries(prev => prev.map(e => e.id === bookId ? {
      ...e, currentPage: Math.min(page, e.totalPages),
      status: page >= e.totalPages ? 'completed' : e.status,
    } : e));
  };

  const filteredEntries = entries.filter(e => {
    const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || e.status === filterStatus;
    const matchCategory = !filterCategory || e.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const stats = {
    total: entries.length,
    reading: entries.filter(e => e.status === 'reading').length,
    completed: entries.filter(e => e.status === 'completed').length,
    planned: entries.filter(e => e.status === 'planned').length,
    totalLearnings: entries.reduce((sum, e) => sum + e.learnings.length, 0),
    totalQuotes: entries.reduce((sum, e) => sum + e.quotes.length, 0),
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, cover: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-teal-600" />
            读书学习
          </h2>
          <p className="text-sm text-gray-500 mt-1">记录阅读进度、学习笔记和精彩语录</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-sm hover:shadow-md active:scale-95">
          <Plus className="w-4 h-4" /> 添加书籍
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: '总书籍', value: stats.total, color: 'bg-teal-50 text-teal-700' },
          { label: '在读', value: stats.reading, color: 'bg-blue-50 text-blue-700' },
          { label: '已读完', value: stats.completed, color: 'bg-green-50 text-green-700' },
          { label: '待读', value: stats.planned, color: 'bg-amber-50 text-amber-700' },
          { label: '学习笔记', value: stats.totalLearnings, color: 'bg-purple-50 text-purple-700' },
          { label: '收藏语录', value: stats.totalQuotes, color: 'bg-rose-50 text-rose-700' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索书名、作者..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
          <option value="">全部状态</option>
          <option value="reading">在读</option>
          <option value="completed">已读完</option>
          <option value="planned">待读</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
          <option value="">全部分类</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-lg">{editingId ? '编辑书籍' : '添加新书'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">书名 *</label>
              <input type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="输入书名" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
              <input type="text" value={formData.author} onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="输入作者" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
                <option value="reading">在读</option>
                <option value="completed">已读完</option>
                <option value="planned">待读</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">总页数</label>
              <input type="number" value={formData.totalPages || ''} onChange={e => setFormData(prev => ({ ...prev, totalPages: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前页数</label>
              <input type="number" value={formData.currentPage || ''} onChange={e => setFormData(prev => ({ ...prev, currentPage: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
            </div>
            {formData.status === 'completed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">完成日期</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl transition-transform hover:scale-110 ${star <= formData.rating ? 'text-amber-400' : 'text-gray-300'}`}>
                    <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
              <div className="flex items-center gap-3">
                {formData.cover && <img src={formData.cover} alt="封面" className="w-12 h-16 object-cover rounded-lg" />}
                <label className="px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 text-sm">
                  上传图片
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">读书笔记</label>
            <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 resize-none" rows={3} placeholder="记录你的读书心得..." />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all">
              {editingId ? '保存修改' : '添加书籍'}
            </button>
            <button onClick={resetForm} className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">取消</button>
          </div>
        </div>
      )}

      {/* Book List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>还没有添加书籍，点击上方按钮开始记录吧</p>
          </div>
        )}
        {filteredEntries.map(entry => {
          const progress = entry.totalPages > 0 ? Math.round((entry.currentPage / entry.totalPages) * 100) : 0;
          const isExpanded = expandedId === entry.id;
          const statusColors = { reading: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', planned: 'bg-amber-100 text-amber-700' };
          const statusLabels = { reading: '在读', completed: '已读完', planned: '待读' };

          return (
            <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex gap-4">
                  {entry.cover ? (
                    <img src={entry.cover} alt={entry.title} className="w-20 h-28 object-cover rounded-xl shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-28 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-teal-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{entry.title}</h3>
                        <p className="text-sm text-gray-500">{entry.author} · {entry.category}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${statusColors[entry.status]}`}>
                        {statusLabels[entry.status]}
                      </span>
                    </div>
                    {entry.totalPages > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>阅读进度</span>
                          <span>{entry.currentPage}/{entry.totalPages} 页 ({progress}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <input type="range" min="0" max={entry.totalPages} value={entry.currentPage}
                          onChange={e => updateProgress(entry.id, parseInt(e.target.value))}
                          className="w-full mt-2 accent-teal-600" />
                      </div>
                    )}
                    {entry.rating > 0 && (
                      <div className="flex gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= entry.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      {entry.learnings.length > 0 && <span>{entry.learnings.length} 条笔记</span>}
                      {entry.quotes.length > 0 && <span>{entry.quotes.length} 条语录</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                  <button onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-gray-50 transition-all">
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? '收起' : '展开详情'}
                  </button>
                  <button onClick={() => setShowLearningForm(entry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-purple-50 text-purple-600 transition-all">
                    <Plus className="w-3 h-3" /> 学习笔记
                  </button>
                  <button onClick={() => setShowQuoteForm(entry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-rose-600 transition-all">
                    <Quote className="w-3 h-3" /> 添加语录
                  </button>
                  <button onClick={() => handleEdit(entry)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-gray-50 transition-all">
                    <Edit2 className="w-3 h-3" /> 编辑
                  </button>
                  <button onClick={() => handleDelete(entry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-red-50 text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" /> 删除
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
                  {entry.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">读书笔记</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{entry.notes}</p>
                    </div>
                  )}
                  {entry.learnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">学习笔记 ({entry.learnings.length})</h4>
                      <div className="space-y-2">
                        {entry.learnings.map(l => (
                          <div key={l.id} className="flex items-start gap-2 bg-purple-50 rounded-xl p-3">
                            <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              {l.chapter && <span className="text-xs text-purple-600 font-medium">{l.chapter}</span>}
                              <p className="text-sm text-gray-700">{l.content}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(l.createdAt).toLocaleDateString('zh-CN')}</p>
                            </div>
                            <button onClick={() => removeLearning(entry.id, l.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.quotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">精彩语录 ({entry.quotes.length})</h4>
                      <div className="space-y-2">
                        {entry.quotes.map((q, i) => (
                          <div key={i} className="flex items-start gap-2 bg-rose-50 rounded-xl p-3">
                            <Quote className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 italic flex-1">"{q}"</p>
                            <button onClick={() => removeQuote(entry.id, i)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add Learning Form */}
              {showLearningForm === entry.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">
                  <h4 className="text-sm font-medium text-gray-700">添加学习笔记</h4>
                  <input type="text" value={learningData.chapter} onChange={e => setLearningData(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="章节/页码（可选）" />
                  <textarea value={learningData.content} onChange={e => setLearningData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none" rows={3} placeholder="学到了什么？" />
                  <div className="flex gap-2">
                    <button onClick={() => addLearning(entry.id)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">保存</button>
                    <button onClick={() => setShowLearningForm(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">取消</button>
                  </div>
                </div>
              )}

              {/* Add Quote Form */}
              {showQuoteForm === entry.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">
                  <h4 className="text-sm font-medium text-gray-700">添加精彩语录</h4>
                  <textarea value={quoteData} onChange={e => setQuoteData(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none" rows={3} placeholder="书中让你印象深刻的话..." />
                  <div className="flex gap-2">
                    <button onClick={() => addQuote(entry.id)} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700">保存</button>
                    <button onClick={() => setShowQuoteForm(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">取消</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
