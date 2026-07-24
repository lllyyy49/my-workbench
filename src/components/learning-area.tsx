'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ExternalLink, BookOpen, FileText, Lightbulb, Target, Check, X, Link as LinkIcon, Folder } from 'lucide-react';

// 学习分类
interface LearningCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// 学习资源
interface LearningResource {
  id: string;
  categoryId: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'other';
  source: string; // 来源：百度网盘、B站、YouTube等
  link: string;
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed';
  notes: LearningNote[];
  insights: LearningInsight[];
  createdAt: number;
}

// 学习笔记
interface LearningNote {
  id: string;
  content: string;
  timestamp: number;
}

// 思考与转化
interface LearningInsight {
  id: string;
  type: 'thought' | 'practice' | 'summary'; // 思考、实践、总结
  content: string;
  createdAt: number;
}

const DEFAULT_CATEGORIES: LearningCategory[] = [
  { id: '1', name: '英语', icon: '📚', color: '#3B82F6' },
  { id: '2', name: '视频剪辑', icon: '🎬', color: '#8B5CF6' },
  { id: '3', name: 'AI学习', icon: '🤖', color: '#10B981' },
  { id: '4', name: '数据分析', icon: '📊', color: '#14B8A6' },
];

export function LearningArea() {
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);
  const [showInsightModal, setShowInsightModal] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📖');
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'video' as 'video' | 'document' | 'link' | 'other',
    source: '',
    link: '',
  });
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newInsight, setNewInsight] = useState({
    type: 'thought' as 'thought' | 'practice' | 'summary',
    content: '',
  });

  useEffect(() => {
    const storedCategories = localStorage.getItem('learning-categories');
    const storedResources = localStorage.getItem('learning-resources');

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('learning-categories', JSON.stringify(DEFAULT_CATEGORIES));
    }

    if (storedResources) {
      setResources(JSON.parse(storedResources));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('learning-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('learning-resources', JSON.stringify(resources));
  }, [resources]);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const category: LearningCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    };
    setCategories([...categories, category]);
    setNewCategoryName('');
    setNewCategoryIcon('📖');
    setShowAddCategoryModal(false);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    setResources(resources.filter(r => r.categoryId !== id));
  };

  const addResource = () => {
    if (!newResource.title.trim() || !selectedCategory || selectedCategory === 'all') return;
    const resource: LearningResource = {
      id: Date.now().toString(),
      categoryId: selectedCategory,
      title: newResource.title.trim(),
      type: newResource.type,
      source: newResource.source.trim(),
      link: newResource.link.trim(),
      progress: 0,
      status: 'not-started',
      notes: [],
      insights: [],
      createdAt: Date.now(),
    };
    setResources([resource, ...resources]);
    setNewResource({ title: '', type: 'video', source: '', link: '' });
    setShowAddResourceModal(false);
  };

  const deleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const updateResourceProgress = (id: string, progress: number) => {
    setResources(resources.map(r => r.id === id ? {
      ...r,
      progress,
      status: progress === 0 ? 'not-started' : progress === 100 ? 'completed' : 'in-progress',
    } : r));
  };

  const addNote = (resourceId: string) => {
    if (!newNoteContent.trim()) return;
    const note: LearningNote = {
      id: Date.now().toString(),
      content: newNoteContent.trim(),
      timestamp: Date.now(),
    };
    setResources(resources.map(r => r.id === resourceId ? {
      ...r,
      notes: [...r.notes, note],
    } : r));
    setNewNoteContent('');
    setShowNoteModal(null);
  };

  const deleteNote = (resourceId: string, noteId: string) => {
    setResources(resources.map(r => r.id === resourceId ? {
      ...r,
      notes: r.notes.filter(n => n.id !== noteId),
    } : r));
  };

  const addInsight = (resourceId: string) => {
    if (!newInsight.content.trim()) return;
    const insight: LearningInsight = {
      id: Date.now().toString(),
      type: newInsight.type,
      content: newInsight.content.trim(),
      createdAt: Date.now(),
    };
    setResources(resources.map(r => r.id === resourceId ? {
      ...r,
      insights: [...r.insights, insight],
    } : r));
    setNewInsight({ type: 'thought', content: '' });
    setShowInsightModal(null);
  };

  const deleteInsight = (resourceId: string, insightId: string) => {
    setResources(resources.map(r => r.id === resourceId ? {
      ...r,
      insights: r.insights.filter(i => i.id !== insightId),
    } : r));
  };

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(r => r.categoryId === selectedCategory);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not-started': return '未开始';
      case 'in-progress': return '学习中';
      case 'completed': return '已完成';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-secondary text-muted-foreground';
      case 'in-progress': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return '';
    }
  };

  const totalResources = resources.length;
  const completedResources = resources.filter(r => r.status === 'completed').length;
  const totalNotes = resources.reduce((sum, r) => sum + r.notes.length, 0);
  const totalInsights = resources.reduce((sum, r) => sum + r.insights.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">学习区域</h2>
          <p className="text-muted-foreground text-sm">管理学习资源，记录笔记与思考</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-4 py-2.5 rounded-lg border border-border hover:bg-secondary transition-all text-sm font-medium flex items-center gap-1.5"
          >
            <Folder className="h-4 w-4" />
            添加分类
          </button>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setShowAddResourceModal(true)}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              添加资源
            </button>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">学习资源</p>
          <p className="text-2xl font-bold mt-1">{totalResources}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">已完成</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{completedResources}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">学习笔记</p>
          <p className="text-2xl font-bold mt-1">{totalNotes}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">思考转化</p>
          <p className="text-2xl font-bold mt-1">{totalInsights}</p>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          全部
        </button>
        {categories.map(category => (
          <div key={category.id} className="relative group">
            <button
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
            <button
              onClick={() => deleteCategory(category.id)}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* 资源列表 */}
      {selectedCategory !== 'all' && filteredResources.length > 0 ? (
        <div className="space-y-4">
          {filteredResources.map(resource => {
            const category = getCategoryById(resource.categoryId);
            return (
              <div key={resource.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{category?.icon}</span>
                      <h3 className="font-semibold">{resource.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {resource.source && <span>来源: {resource.source}</span>}
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(resource.status)}`}>
                        {getStatusLabel(resource.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {resource.link && (
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                        title="打开链接"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setShowNoteModal(resource.id)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                      title="添加笔记"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowInsightModal(resource.id)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                      title="添加思考"
                    >
                      <Lightbulb className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">学习进度</span>
                    <span className="font-medium">{resource.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${resource.progress}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={resource.progress}
                    onChange={(e) => updateResourceProgress(resource.id, parseInt(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                </div>

                {/* 笔记列表 */}
                {resource.notes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      学习笔记 ({resource.notes.length})
                    </h4>
                    <div className="space-y-2">
                      {resource.notes.slice(-3).map(note => (
                        <div key={note.id} className="p-3 rounded-lg bg-secondary/50 text-sm group">
                          <p className="whitespace-pre-wrap">{note.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.timestamp).toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteNote(resource.id, note.id)}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background text-muted-foreground hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {resource.notes.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          还有 {resource.notes.length - 3} 条笔记...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 思考与转化 */}
                {resource.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                      思考与转化 ({resource.insights.length})
                    </h4>
                    <div className="space-y-2">
                      {resource.insights.slice(-3).map(insight => (
                        <div key={insight.id} className="p-3 rounded-lg bg-primary/5 text-sm group">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              insight.type === 'thought' ? 'bg-blue-100 text-blue-700' :
                              insight.type === 'practice' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {insight.type === 'thought' ? '思考' : insight.type === 'practice' ? '实践' : '总结'}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{insight.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(insight.createdAt).toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteInsight(resource.id, insight.id)}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background text-muted-foreground hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : selectedCategory === 'all' ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">选择一个分类查看学习资源</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground mb-2">暂无学习资源</p>
          <button
            onClick={() => setShowAddResourceModal(true)}
            className="text-primary hover:underline text-sm"
          >
            添加第一个学习资源
          </button>
        </div>
      )}

      {/* 添加分类弹窗 */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">添加学习分类</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">分类名称</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="如：摄影、编程等"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">图标（表情符号）</label>
              <input
                type="text"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={addCategory}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium text-sm"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加资源弹窗 */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4 my-8">
            <h3 className="text-lg font-semibold">添加学习资源</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">资源标题 *</label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="如：英语听力课程、Python教程等"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">资源类型</label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="video">视频</option>
                <option value="document">文档</option>
                <option value="link">链接</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">来源</label>
              <input
                type="text"
                value={newResource.source}
                onChange={(e) => setNewResource({ ...newResource, source: e.target.value })}
                placeholder="如：百度网盘、B站、YouTube等"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">链接</label>
              <input
                type="url"
                value={newResource.link}
                onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                支持百度网盘、B站等链接，点击可直接跳转
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={addResource}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium text-sm"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加笔记弹窗 */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">添加学习笔记</h3>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="记录你的学习笔记..."
              className="w-full h-40 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoteModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={() => addNote(showNoteModal)}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加思考弹窗 */}
      {showInsightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">思考与转化</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">类型</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewInsight({ ...newInsight, type: 'thought' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    newInsight.type === 'thought'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  💭 思考
                </button>
                <button
                  type="button"
                  onClick={() => setNewInsight({ ...newInsight, type: 'practice' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    newInsight.type === 'practice'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  🎯 实践
                </button>
                <button
                  type="button"
                  onClick={() => setNewInsight({ ...newInsight, type: 'summary' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    newInsight.type === 'summary'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  📝 总结
                </button>
              </div>
            </div>
            <textarea
              value={newInsight.content}
              onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
              placeholder={
                newInsight.type === 'thought' ? '记录你的思考和想法...' :
                newInsight.type === 'practice' ? '记录你的实践计划...' :
                '记录你的学习总结...'
              }
              className="w-full h-32 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowInsightModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={() => addInsight(showInsightModal)}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
