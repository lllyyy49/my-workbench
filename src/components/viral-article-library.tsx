'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Tag, Eye, Edit2, Trash2, X, ExternalLink, Calendar, TrendingUp, BookOpen, Image, Hash, Lightbulb, Sparkles, Save, Upload, Clipboard } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

interface ViralArticle {
  id: string;
  title: string;
  source: string; // 来源平台
  category: string; // 分类
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
  const [summary, setSummary] = useState(() => {
    try {
      return localStorage.getItem('viral-summary') || '';
    } catch {
      return '';
    }
  });
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryUpdatedAt, setSummaryUpdatedAt] = useState(() => {
    try {
      return localStorage.getItem('viral-summary-updated') || '';
    } catch {
      return '';
    }
  });

  const handleSaveSummary = () => {
    setSummaryUpdatedAt(new Date().toISOString());
    setShowSummaryForm(false);
  };

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

  useEffect(() => {
    localStorage.setItem('viral-summary', summary);
  }, [summary]);

  // 获取所有话题
  const allTopics = Array.from(new Set(articles.flatMap(a => a.topics)));

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === '' || article.category === selectedCategory;
    const matchesTopic = selectedTag === '' || article.topics.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTopic;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      source: '',
      category: 'product',
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

    const topicsArray = formData.topics.split(/[,，]/).map(t => t.trim()).filter(t => t);

    if (editingArticle) {
      setArticles(articles.map(a => a.id === editingArticle.id ? {
        ...a,
        title: formData.title,
        source: formData.source,
        category: formData.category,
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

  // 文件导入处理（Excel/Word/TXT）
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    let content = '';

    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // 解析 Excel 文件
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
        
        // 提取所有非空单元格内容
        const texts: string[] = [];
        jsonData.forEach(row => {
          row.forEach(cell => {
            if (cell && String(cell).trim()) {
              texts.push(String(cell).trim());
            }
          });
        });
        content = texts.join('\n');
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        // 解析 Word 文件
        const data = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: data });
        content = result.value;
      } else if (fileName.endsWith('.txt')) {
        // 解析文本文件
        content = await file.text();
      } else {
        alert('不支持的文件格式，请上传 Excel(.xlsx/.xls)、Word(.docx/.doc) 或文本(.txt) 文件');
        return;
      }

      if (content.trim()) {
        // 尝试从内容中提取标题（第一行）
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          setFormData({ ...formData, title: lines[0].trim(), content: content.trim() });
        } else {
          setFormData({ ...formData, content: content.trim() });
        }
      } else {
        alert('文件中没有找到文本内容');
      }
    } catch (error) {
      console.error('文件解析错误:', error);
      alert('文件解析失败，请检查文件格式');
    }

    // 清空 input 值，允许重复选择同一文件
    e.target.value = '';
  };

  // 粘贴文本处理
  const handleTextPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        // 尝试从内容中提取标题（第一行）
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          setFormData({ ...formData, title: lines[0].trim(), content: text.trim() });
        } else {
          setFormData({ ...formData, content: text.trim() });
        }
      }
    } catch (error) {
      console.error('粘贴失败:', error);
      alert('无法读取剪贴板内容，请手动粘贴');
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

      {/* 统一总结区域 */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 shadow-sm border border-teal-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-teal-500 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">爆文规律总结</h3>
          <button
            onClick={() => setShowSummaryForm(true)}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>编辑总结</span>
          </button>
        </div>
        {showSummaryForm ? (
          <div className="space-y-3">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              placeholder="输入爆文规律总结..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveSummary}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => setShowSummaryForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <div className="bg-white/80 rounded-lg p-4">
              <div className="text-sm font-medium text-teal-700 mb-2">核心规律</div>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <span>最后更新：{new Date(summaryUpdatedAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">还没有总结，点击"编辑总结"开始提炼爆文规律</p>
          </div>
        )}
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

          {/* 话题筛选 */}
          {allTopics.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">全部话题</option>
              {allTopics.map(topic => (
                <option key={topic} value={topic}>#{topic}</option>
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
                
                {/* 文件导入和粘贴按钮 */}
                <div className="flex gap-2 mb-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer text-sm">
                    <Upload className="h-4 w-4" />
                    <span>导入文件</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.docx,.doc,.txt"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleTextPaste}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Clipboard className="h-4 w-4" />
                    <span>一键粘贴</span>
                  </button>
                  <span className="flex items-center text-xs text-gray-500">
                    支持 Excel、Word、TXT 文件
                  </span>
                </div>
                
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="爆文标题（导入文件后自动填充）"
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

              {/* 话题 */}
              {viewingArticle.topics && viewingArticle.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewingArticle.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="text-sm px-3 py-1 bg-teal-50 text-teal-700 rounded-full"
                    >
                      #{topic}
                    </span>
                  ))}
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

      {/* 统一总结区域 */}
      {articles.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-teal-50 to-amber-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">爆文总结</h3>
            <span className="text-sm text-gray-500 ml-2">共 {articles.length} 篇爆文</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 热门分类 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">热门分类</div>
              <div className="text-lg font-bold text-teal-600">
                {(() => {
                  const catCount: Record<string, number> = {};
                  articles.forEach(a => { catCount[a.category] = (catCount[a.category] || 0) + 1; });
                  const top = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
                  return top ? `${top[0]} (${top[1]}篇)` : '暂无';
                })()}
              </div>
            </div>

            {/* 热门来源 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">热门来源</div>
              <div className="text-lg font-bold text-teal-600">
                {(() => {
                  const srcCount: Record<string, number> = {};
                  articles.forEach(a => { srcCount[a.source] = (srcCount[a.source] || 0) + 1; });
                  const top = Object.entries(srcCount).sort((a, b) => b[1] - a[1])[0];
                  return top ? `${top[0]} (${top[1]}篇)` : '暂无';
                })()}
              </div>
            </div>

            {/* 平均互动 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">平均互动量</div>
              <div className="text-lg font-bold text-teal-600">
                {Math.round(articles.reduce((sum, a) => sum + (a.metrics?.likes || 0), 0) / articles.length)}
              </div>
            </div>
          </div>

          {/* 高频话题 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="text-sm text-gray-500 mb-2">高频话题 TOP5</div>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const topicCount: Record<string, number> = {};
                articles.forEach(a => {
                  a.topics.forEach(t => { topicCount[t] = (topicCount[t] || 0) + 1; });
                });
                return Object.entries(topicCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([topic, count]) => (
                    <span key={topic} className="text-sm px-3 py-1 bg-teal-50 text-teal-700 rounded-full">
                      #{topic} ({count})
                    </span>
                  ));
              })()}
            </div>
          </div>

          {/* 爆文规律总结 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-2">可借鉴要点</div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>优先参考「{(() => {
                  const catCount: Record<string, number> = {};
                  articles.forEach(a => { catCount[a.category] = (catCount[a.category] || 0) + 1; });
                  const top = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
                  return top ? top[0] : '暂无';
                })()}」类爆文，占比最高</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>重点关注「{(() => {
                  const srcCount: Record<string, number> = {};
                  articles.forEach(a => { srcCount[a.source] = (srcCount[a.source] || 0) + 1; });
                  const top = Object.entries(srcCount).sort((a, b) => b[1] - a[1])[0];
                  return top ? top[0] : '暂无';
                })()}」平台的内容风格</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>常用话题：{(() => {
                  const topicCount: Record<string, number> = {};
                  articles.forEach(a => {
                    a.topics.forEach(t => { topicCount[t] = (topicCount[t] || 0) + 1; });
                  });
                  return Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t).join('、') || '暂无';
                })()}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
