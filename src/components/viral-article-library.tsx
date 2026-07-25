'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Tag, Eye, Edit2, Trash2, X, ExternalLink, Calendar, TrendingUp, BookOpen, Image, Hash } from 'lucide-react';

interface ViralArticle {
  id: string;
  title: string;
  source: string; // 来源平台
  category: string; // 分类
  tags: string[]; // 标签
  topics: string[]; // 话题
  content: string; // 爆文内容
  summary: string; // 摘要/亮点
  link?: string; // 原文链接
  images: string[]; // 图片
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  notes: string; // 学习笔记/分析
  createdAt: number;
  updatedAt: number;
}

const CATEGORIES = [
  { value: 'product', label: '商品推广', icon: '🛍️' },
  { value: 'lifestyle', label: '生活方式', icon: '✨' },
  { value: 'tutorial', label: '教程干货', icon: '📚' },
  { value: 'review', label: '测评分享', icon: '⭐' },
  { value: 'story', label: '故事经历', icon: '📖' },
  { value: 'other', label: '其他', icon: '📝' },
];

export function ViralArticleLibrary() {
  const [articles, setArticles] = useState<ViralArticle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ViralArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<ViralArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [now, setNow] = useState(0);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    category: 'product',
    tags: '',
    topics: '',
    content: '',
    summary: '',
    link: '',
    views: '',
    likes: '',
    comments: '',
    shares: '',
    notes: '',
    images: [] as string[],
  });
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('viral-articles');
    if (stored) {
      setArticles(JSON.parse(stored));
    }
    setNow(Date.now());
  }, []);

  useEffect(() => {
    localStorage.setItem('viral-articles', JSON.stringify(articles));
  }, [articles]);

  // 获取所有标签
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags)));

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === '' || article.category === selectedCategory;
    const matchesTag = selectedTag === '' || article.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      source: '',
      category: 'product',
      tags: '',
      topics: '',
      content: '',
      summary: '',
      link: '',
      views: '',
      likes: '',
      comments: '',
      shares: '',
      notes: '',
      images: [],
    });
    setEditingArticle(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    const tagsArray = formData.tags.split(/[,，]/).map(t => t.trim()).filter(t => t);
    const topicsArray = formData.topics.split(/[,，]/).map(t => t.trim()).filter(t => t);

    if (editingArticle) {
      setArticles(articles.map(a => a.id === editingArticle.id ? {
        ...a,
        title: formData.title,
        source: formData.source,
        category: formData.category,
        tags: tagsArray,
        topics: topicsArray,
        content: formData.content,
        summary: formData.summary,
        link: formData.link || undefined,
        images: formData.images,
        metrics: {
          views: formData.views ? parseInt(formData.views) : undefined,
          likes: formData.likes ? parseInt(formData.likes) : undefined,
          comments: formData.comments ? parseInt(formData.comments) : undefined,
          shares: formData.shares ? parseInt(formData.shares) : undefined,
        },
        notes: formData.notes,
        updatedAt: Date.now(),
      } : a));
    } else {
      const newArticle: ViralArticle = {
        id: Date.now().toString(),
        title: formData.title,
        source: formData.source,
        category: formData.category,
        tags: tagsArray,
        topics: topicsArray,
        content: formData.content,
        summary: formData.summary,
        link: formData.link || undefined,
        images: formData.images,
        metrics: {
          views: formData.views ? parseInt(formData.views) : undefined,
          likes: formData.likes ? parseInt(formData.likes) : undefined,
          comments: formData.comments ? parseInt(formData.comments) : undefined,
          shares: formData.shares ? parseInt(formData.shares) : undefined,
        },
        notes: formData.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setArticles([newArticle, ...articles]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleEdit = (article: ViralArticle) => {
    setFormData({
      title: article.title,
      source: article.source,
      category: article.category,
      tags: article.tags.join(', '),
      content: article.content,
      summary: article.summary,
      link: article.link || '',
      views: article.metrics?.views?.toString() || '',
      likes: article.metrics?.likes?.toString() || '',
      comments: article.metrics?.comments?.toString() || '',
      shares: article.metrics?.shares?.toString() || '',
      notes: article.notes,
      images: article.images || [],
      topics: article.topics?.join(', ') || '',
    });
    setEditingArticle(article);
    setShowForm(true);
    setViewingArticle(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇爆文吗？')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[5];
  };

  // 统计数据
  const stats = {
    total: articles.length,
    thisWeek: articles.filter(a => {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      return a.createdAt >= weekAgo;
    }).length,
    totalViews: articles.reduce((sum, a) => sum + (a.metrics?.views || 0), 0),
    totalLikes: articles.reduce((sum, a) => sum + (a.metrics?.likes || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">爆文总数</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">本周新增</p>
              <p className="text-xl font-bold text-gray-900">{stats.thisWeek}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">总浏览量</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <span className="text-lg">❤️</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">总点赞数</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索标题、内容、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="">全部分类</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
            ))}
          </select>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">全部标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}

          {/* 添加按钮 */}
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>录入爆文</span>
          </button>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredArticles.map(article => {
          const categoryInfo = getCategoryInfo(article.category);
          return (
            <div
              key={article.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              {/* 头部 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {categoryInfo.label}
                    </span>
                    {article.source && (
                      <span className="text-xs text-gray-400">· {article.source}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{article.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingArticle(article)}
                    className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 摘要 */}
              {article.summary && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.summary}</p>
              )}

              {/* 标签 */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 数据指标 */}
              {article.metrics && (article.metrics.views || article.metrics.likes) && (
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                  {article.metrics.views && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {article.metrics.views.toLocaleString()}
                    </span>
                  )}
                  {article.metrics.likes && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      ❤️ {article.metrics.likes.toLocaleString()}
                    </span>
                  )}
                  {article.metrics.comments && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      💬 {article.metrics.comments.toLocaleString()}
                    </span>
                  )}
                  {article.metrics.shares && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      🔄 {article.metrics.shares.toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* 日期 */}
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {new Date(article.createdAt).toLocaleDateString('zh-CN')}
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || selectedCategory || selectedTag ? '没有找到匹配的爆文' : '还没有录入爆文，点击上方按钮开始录入'}
          </p>
        </div>
      )}

      {/* 录入/编辑表单 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingArticle ? '编辑爆文' : '录入爆文'}
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="爆文标题"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* 来源和分类 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">来源平台</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="如：小红书、抖音"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="如：医疗器械, 爆款, 推广"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* 话题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">话题标签</label>
                <input
                  type="text"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  placeholder="如：#医疗器械 #爆款笔记 #推广技巧"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">多个话题用空格分隔</p>
              </div>

              {/* 原文链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">原文链接</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* 摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">摘要/亮点</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="这篇文章的亮点或核心卖点"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">爆文内容 *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="复制爆文的完整内容"
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">爆文图片</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const files = Array.from(e.dataTransfer.files);
                    files.forEach(file => {
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images, ev.target!.result as string]
                            }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    });
                  }}
                >
                  <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">拖拽图片到此处，或点击选择</p>
                  <p className="text-xs text-gray-400">支持 JPG、PNG、GIF 格式</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        Array.from(files).forEach(file => {
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setFormData(prev => ({
                                  ...prev,
                                  images: [...prev.images, ev.target!.result as string]
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        });
                      }
                    }}
                    className="hidden"
                    id="article-images-upload"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('article-images-upload')?.click()}
                    className="mt-3 px-4 py-1.5 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    选择图片
                  </button>
                </div>

                {/* 图片预览 */}
                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`图片${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx)
                          }))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 数据指标 */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">数据指标（可选）</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">浏览量</label>
                    <input
                      type="number"
                      value={formData.views}
                      onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">点赞数</label>
                    <input
                      type="number"
                      value={formData.likes}
                      onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">评论数</label>
                    <input
                      type="number"
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">分享数</label>
                    <input
                      type="number"
                      value={formData.shares}
                      onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* 学习笔记 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学习笔记/分析</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="分析这篇爆文为什么能火，可以借鉴的地方..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-md transition-all"
              >
                {editingArticle ? '保存修改' : '录入爆文'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看详情 */}
      {viewingArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">爆文详情</h2>
              <button
                onClick={() => setViewingArticle(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 标题和分类 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryInfo(viewingArticle.category).icon}</span>
                  <span className="text-sm px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {getCategoryInfo(viewingArticle.category).label}
                  </span>
                  {viewingArticle.source && (
                    <span className="text-sm text-gray-400">· {viewingArticle.source}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{viewingArticle.title}</h3>
              </div>

              {/* 标签 */}
              {viewingArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewingArticle.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-teal-50 text-teal-700 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 话题 */}
              {viewingArticle.topics && (
                <div className="flex items-center gap-2 text-sm text-teal-600">
                  <Hash className="w-4 h-4" />
                  <span>{viewingArticle.topics}</span>
                </div>
              )}

              {/* 数据指标 */}
              {viewingArticle.metrics && (viewingArticle.metrics.views || viewingArticle.metrics.likes) && (
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                  {viewingArticle.metrics.views && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{viewingArticle.metrics.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">浏览</p>
                    </div>
                  )}
                  {viewingArticle.metrics.likes && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{viewingArticle.metrics.likes.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">点赞</p>
                    </div>
                  )}
                  {viewingArticle.metrics.comments && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{viewingArticle.metrics.comments.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">评论</p>
                    </div>
                  )}
                  {viewingArticle.metrics.shares && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{viewingArticle.metrics.shares.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">分享</p>
                    </div>
                  )}
                </div>
              )}

              {/* 摘要 */}
              {viewingArticle.summary && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">摘要/亮点</h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{viewingArticle.summary}</p>
                </div>
              )}

              {/* 内容 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">爆文内容</h4>
                <div className="text-gray-700 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
                  {viewingArticle.content}
                </div>
              </div>

              {/* 图片 */}
              {viewingArticle.images && viewingArticle.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">爆文图片</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingArticle.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`图片${idx + 1}`} className="w-full h-48 object-cover rounded-xl" />
                    ))}
                  </div>
                </div>
              )}

              {/* 学习笔记 */}
              {viewingArticle.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">学习笔记/分析</h4>
                  <p className="text-gray-600 bg-teal-50 p-4 rounded-xl whitespace-pre-wrap">
                    {viewingArticle.notes}
                  </p>
                </div>
              )}

              {/* 原文链接 */}
              {viewingArticle.link && (
                <a
                  href={viewingArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>查看原文</span>
                </a>
              )}

              {/* 日期 */}
              <div className="flex items-center gap-1 text-sm text-gray-400 pt-4 border-t border-gray-100">
                <Calendar className="w-4 h-4" />
                <span>录入时间：{new Date(viewingArticle.createdAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => handleEdit(viewingArticle)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
              <button
                onClick={() => setViewingArticle(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
