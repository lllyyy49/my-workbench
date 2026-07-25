'use client';

import { useState, useEffect } from 'react';
import { Film, Plus, Trash2, Edit2, Star, MessageCircle, Image, Search, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface MovieEntry {
  id: string;
  title: string;
  director: string;
  year: string;
  genre: string;
  poster: string;
  screenshots: string[];
  rating: number;
  status: 'watched' | 'watching' | 'planned';
  watchDate: string;
  quotes: MovieQuote[];
  review: string;
  tags: string[];
  createdAt: string;
}

interface MovieQuote {
  id: string;
  content: string;
  character?: string;
}

const GENRES = ['剧情', '喜剧', '动作', '爱情', '科幻', '悬疑', '恐怖', '动画', '纪录片', '文艺', '其他'];

const STORAGE_KEY = 'movie-entries';

export default function MovieLibrary() {
  const [entries, setEntries] = useState<MovieEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', director: '', year: '', genre: '剧情',
    poster: '', rating: 0, status: 'watched' as 'watched' | 'watching' | 'planned',
    watchDate: new Date().toISOString().split('T')[0],
    review: '', tags: '',
  });
  const [quoteData, setQuoteData] = useState({ content: '', character: '' });
  const [screenshots, setScreenshots] = useState<string[]>([]);

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
      title: '', director: '', year: '', genre: '剧情',
      poster: '', rating: 0, status: 'watched',
      watchDate: new Date().toISOString().split('T')[0],
      review: '', tags: '',
    });
    setScreenshots([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? {
        ...e, ...formData,
        screenshots: screenshots.length > 0 ? screenshots : e.screenshots,
        tags: formData.tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean),
      } : e));
    } else {
      const newEntry: MovieEntry = {
        id: Date.now().toString(),
        ...formData,
        screenshots,
        quotes: [],
        tags: formData.tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      };
      setEntries(prev => [newEntry, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (entry: MovieEntry) => {
    setFormData({
      title: entry.title, director: entry.director, year: entry.year,
      genre: entry.genre, poster: entry.poster, rating: entry.rating,
      status: entry.status, watchDate: entry.watchDate,
      review: entry.review, tags: entry.tags.join(', '),
    });
    setScreenshots(entry.screenshots);
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除这部电影吗？')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const addQuote = (movieId: string) => {
    if (!quoteData.content.trim()) return;
    setEntries(prev => prev.map(e => e.id === movieId ? {
      ...e, quotes: [...e.quotes, {
        id: Date.now().toString(),
        content: quoteData.content,
        character: quoteData.character,
      }],
    } : e));
    setQuoteData({ content: '', character: '' });
    setShowQuoteForm(null);
  };

  const removeQuote = (movieId: string, quoteId: string) => {
    setEntries(prev => prev.map(e => e.id === movieId ? {
      ...e, quotes: e.quotes.filter(q => q.id !== quoteId),
    } : e));
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFormData(prev => ({ ...prev, poster: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshots(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const filteredEntries = entries.filter(e => {
    const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.director.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || e.status === filterStatus;
    const matchGenre = !filterGenre || e.genre === filterGenre;
    return matchSearch && matchStatus && matchGenre;
  });

  const stats = {
    total: entries.length,
    watched: entries.filter(e => e.status === 'watched').length,
    watching: entries.filter(e => e.status === 'watching').length,
    planned: entries.filter(e => e.status === 'planned').length,
    totalQuotes: entries.reduce((sum, e) => sum + e.quotes.length, 0),
    avgRating: entries.filter(e => e.rating > 0).length > 0
      ? (entries.filter(e => e.rating > 0).reduce((sum, e) => sum + e.rating, 0) / entries.filter(e => e.rating > 0).length).toFixed(1)
      : '0',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Film className="w-7 h-7 text-teal-600" />
            电影影评
          </h2>
          <p className="text-sm text-gray-500 mt-1">记录观影体验、收藏经典台词、撰写影评</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-sm hover:shadow-md active:scale-95">
          <Plus className="w-4 h-4" /> 添加电影
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: '总电影', value: stats.total, color: 'bg-teal-50 text-teal-700' },
          { label: '已观看', value: stats.watched, color: 'bg-green-50 text-green-700' },
          { label: '在看', value: stats.watching, color: 'bg-blue-50 text-blue-700' },
          { label: '待看', value: stats.planned, color: 'bg-amber-50 text-amber-700' },
          { label: '收藏台词', value: stats.totalQuotes, color: 'bg-rose-50 text-rose-700' },
          { label: '平均评分', value: stats.avgRating, color: 'bg-purple-50 text-purple-700' },
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
            placeholder="搜索电影名、导演..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
          <option value="">全部状态</option>
          <option value="watched">已观看</option>
          <option value="watching">在看</option>
          <option value="planned">待看</option>
        </select>
        <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
          <option value="">全部类型</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-lg">{editingId ? '编辑电影' : '添加新电影'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电影名 *</label>
              <input type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="输入电影名" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">导演</label>
              <input type="text" value={formData.director} onChange={e => setFormData(prev => ({ ...prev, director: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="输入导演" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
              <input type="text" value={formData.year} onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="2024" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <select value={formData.genre} onChange={e => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500">
                <option value="watched">已观看</option>
                <option value="watching">在看</option>
                <option value="planned">待看</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">观影日期</label>
              <input type="date" value={formData.watchDate} onChange={e => setFormData(prev => ({ ...prev, watchDate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl transition-transform hover:scale-110`}>
                    <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
              <input type="text" value={formData.tags} onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" placeholder="用逗号分隔，如：治愈、成长" />
            </div>
          </div>

          {/* Poster Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">海报图片</label>
            <div className="flex items-center gap-3">
              {formData.poster && <img src={formData.poster} alt="海报" className="w-16 h-24 object-cover rounded-lg shadow-sm" />}
              <label className="px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4" /> 上传海报
                <input type="file" accept="image/*" onChange={handlePosterUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Screenshots Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电影截图</label>
            <div className="flex flex-wrap gap-2">
              {screenshots.map((s, i) => (
                <div key={i} className="relative group">
                  <img src={s} alt={`截图${i + 1}`} className="w-24 h-16 object-cover rounded-lg" />
                  <button onClick={() => removeScreenshot(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
              <label className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-all">
                <Plus className="w-5 h-5 text-gray-400" />
                <input type="file" accept="image/*" multiple onChange={handleScreenshotUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">影评</label>
            <textarea value={formData.review} onChange={e => setFormData(prev => ({ ...prev, review: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 resize-none" rows={4}
              placeholder="写下你的观影感受..." />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all">
              {editingId ? '保存修改' : '添加电影'}
            </button>
            <button onClick={resetForm} className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">取消</button>
          </div>
        </div>
      )}

      {/* Movie List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Film className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>还没有添加电影，点击上方按钮开始记录吧</p>
          </div>
        )}
        {filteredEntries.map(entry => {
          const isExpanded = expandedId === entry.id;
          const statusColors = { watched: 'bg-green-100 text-green-700', watching: 'bg-blue-100 text-blue-700', planned: 'bg-amber-100 text-amber-700' };
          const statusLabels = { watched: '已观看', watching: '在看', planned: '待看' };

          return (
            <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex gap-4">
                  {entry.poster ? (
                    <img src={entry.poster} alt={entry.title} className="w-20 h-28 object-cover rounded-xl shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-28 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Film className="w-8 h-8 text-teal-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{entry.title}</h3>
                        <p className="text-sm text-gray-500">{entry.director} · {entry.year} · {entry.genre}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${statusColors[entry.status]}`}>
                        {statusLabels[entry.status]}
                      </span>
                    </div>
                    {entry.rating > 0 && (
                      <div className="flex gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= entry.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {entry.quotes.length > 0 && <span>{entry.quotes.length} 条台词</span>}
                      {entry.review && <span>有影评</span>}
                      {entry.screenshots.length > 0 && <span>{entry.screenshots.length} 张截图</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                  <button onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-gray-50 transition-all">
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? '收起' : '展开详情'}
                  </button>
                  <button onClick={() => setShowQuoteForm(entry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-rose-600 transition-all">
                    <MessageCircle className="w-3 h-3" /> 添加台词
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
                  {/* Screenshots */}
                  {entry.screenshots.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Image className="w-4 h-4" /> 电影截图
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.screenshots.map((s, i) => (
                          <img key={i} src={s} alt={`截图${i + 1}`} className="w-32 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review */}
                  {entry.review && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">影评</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">{entry.review}</p>
                    </div>
                  )}

                  {/* Quotes */}
                  {entry.quotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">经典台词 ({entry.quotes.length})</h4>
                      <div className="space-y-2">
                        {entry.quotes.map(q => (
                          <div key={q.id} className="flex items-start gap-2 bg-rose-50 rounded-xl p-3">
                            <MessageCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 italic">"{q.content}"</p>
                              {q.character && <p className="text-xs text-gray-500 mt-1">—— {q.character}</p>}
                            </div>
                            <button onClick={() => removeQuote(entry.id, q.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add Quote Form */}
              {showQuoteForm === entry.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">
                  <h4 className="text-sm font-medium text-gray-700">添加经典台词</h4>
                  <textarea value={quoteData.content} onChange={e => setQuoteData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none" rows={3} placeholder="电影中的经典台词..." />
                  <input type="text" value={quoteData.character} onChange={e => setQuoteData(prev => ({ ...prev, character: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="角色名（可选）" />
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
