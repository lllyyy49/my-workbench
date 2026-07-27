'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, BookOpen, FileText, Lightbulb, Target, Check, X, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { useSyncedData } from '@/hooks/use-synced-data';

// 激励句子库
const getMotivation = (level: number): string => {
  const motivations: Record<number, string[]> = {
    3: [ // 10个及以上 - 超级学霸
      '🏆 学霸模式全开！今天的你闪闪发光！',
      '🌟 太厉害了！知识正在被你疯狂吸收！',
      '💎 今天的努力，是明天成功的基石！',
      '🚀 学习速度惊人，你正在飞速成长！',
      '👑 知识王者！今天的你无人能敌！',
      '🎯 目标明确，执行力满分！为你点赞！',
    ],
    2: [ // 7-9个 - 优秀学员
      '🎉 超棒的表现！学习达人就是你！',
      '✨ 今天的收获满满，明天继续闪耀！',
      '🔥 学习热情高涨，保持这个节奏！',
      '💪 坚持的力量，你正在创造奇迹！',
      '🌈 每一分努力都不会被辜负，继续加油！',
      '⭐ 优秀是一种习惯，你已经做到了！',
    ],
    1: [ // 5-6个 - 表现良好
      '🎊 今天学习很充实！继续保持！',
      '👏 不错的进度，你正在稳步前进！',
      '📚 知识在积累，能力在提升！',
      '💫 每一步都算数，继续前行！',
      '🌻 每天进步一点点，终会到达远方！',
      '🎈 轻松愉快的一天，学习效率满分！',
    ],
    0: [ // 3-4个 - 小有进步
      '👍 不错的进度，继续加油！',
      '💪 小步快跑，也是前进！',
      '🌟 今天的你比昨天更优秀！',
      '📖 知识的力量在于积累，继续！',
      '🎯 目标清晰，步履不停！',
      '🌻 每天进步一点点，终会到达远方！',
    ],
    '-1': [ // 1-2个 - 好的开始
      '💪 好的开始，继续努力！',
      '🌱 万事开头难，你已经迈出了第一步！',
      '🌈 每一小步都是进步，加油！',
      '✨ 积少成多，聚沙成塔！',
      '🎈 今天的学习之旅已经开始！',
      '🌟 不积跬步，无以至千里！',
    ],
    '-2': [ // 0个 - 鼓励开始
      '🌅 新的一天，新的开始，加油！',
      '🌟 今天也要元气满满哦！',
      '💫 学习什么时候开始都不晚！',
      '🎯 设定一个小目标，开始行动吧！',
      '🌻 种一棵树最好的时间是十年前，其次是现在！',
      '🚀 行动是治愈恐惧的良药，开始学习吧！',
      '📚 翻开书本，开启今天的学习之旅！',
    ],
  };
  
  const list = motivations[level] || motivations['-2'];
  // 基于日期随机选择，保证同一天显示同一句
  const today = new Date();
  const dayIndex = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return list[dayIndex % list.length];
};

// 学习分类
interface LearningCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// 学习任务
interface LearningTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number; // 任务完成时间
}

// 学习阶段
interface LearningStage {
  id: string;
  name: string;
  description: string;
  tasks: LearningTask[];
  order: number;
}

// 学习资源
interface LearningResource {
  id: string;
  categoryId: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'other';
  source: string;
  link: string;
  stages: LearningStage[];
  notes: string;
  insights: string;
  createdAt: number;
}

const DEFAULT_CATEGORIES: LearningCategory[] = [
  { id: '1', name: '英语', icon: '📚', color: '#3B82F6' },
  { id: '2', name: '视频剪辑', icon: '🎬', color: '#8B5CF6' },
  { id: '3', name: 'AI学习', icon: '🤖', color: '#10B981' },
  { id: '4', name: '数据分析', icon: '📊', color: '#14B8A6' },
];

export function LearningArea() {
  const { data: categories, sync: syncCategories, loading: categoriesLoading } = useSyncedData<any[]>('learning_categories', []);
  const { data: resources, sync: syncResources, loading: resourcesLoading } = useSyncedData<any[]>('learning_resources', []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📖');
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'video' as 'video' | 'document' | 'link' | 'other',
    source: '',
    link: '',
  });
  const [newStage, setNewStage] = useState({ name: '', description: '' });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    if (categories.length === 0) {
      const defaultCategories = [
        { id: '1', name: '英语', icon: '📚', color: '#3B82F6' },
        { id: '2', name: '视频剪辑', icon: '🎬', color: '#8B5CF6' },
        { id: '3', name: 'AI学习', icon: '🤖', color: '#10B981' },
        { id: '4', name: '数据分析', icon: '📊', color: '#14B8A6' },
      ];
      syncCategories(defaultCategories);
    }
  }, []);

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    const category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    };
    const newCategories = [...categories, category];
    await syncCategories(newCategories);
    setNewCategoryName('');
    setNewCategoryIcon('📖');
    setShowAddCategoryModal(false);
  };

  const deleteCategory = async (id: string) => {
    const newCategories = categories.filter(c => c.id !== id);
    const newResources = resources.filter(r => r.category_id !== id);
    await syncCategories(newCategories);
    await syncResources(newResources);
  };

  const addResource = async () => {
    if (!newResource.title.trim() || !selectedCategory || selectedCategory === 'all') return;
    const resource = {
      id: Date.now().toString(),
      category_id: selectedCategory,
      title: newResource.title.trim(),
      type: newResource.type,
      source: newResource.source.trim(),
      link: newResource.link.trim(),
      stages: [],
      notes: '',
      insights: '',
      created_at: new Date().toISOString(),
    };
    const newResources = [resource, ...resources];
    await syncResources(newResources);
    setNewResource({ title: '', type: 'video', source: '', link: '' });
    setShowAddResourceModal(false);
    setExpandedResource(resource.id);
  };

  const deleteResource = async (id: string) => {
    const newResources = resources.filter(r => r.id !== id);
    await syncResources(newResources);
  };

  const addStage = async (resourceId: string) => {
    if (!newStage.name.trim()) return;
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;
    const stage = {
      id: Date.now().toString(),
      name: newStage.name.trim(),
      description: newStage.description.trim(),
      tasks: [],
      order: resource.stages.length,
    };
    const newResources = resources.map(r => r.id === resourceId ? {
      ...r,
      stages: [...r.stages, stage],
    } : r);
    await syncResources(newResources);
    setNewStage({ name: '', description: '' });
    setShowAddStageModal(null);
    setExpandedStage(stage.id);
  };

  const deleteStage = async (resourceId: string, stageId: string) => {
    const newResources = resources.map(r => r.id === resourceId ? {
      ...r,
      stages: r.stages.filter(s => s.id !== stageId),
    } : r);
    await syncResources(newResources);
  };

  const addTask = async (resourceId: string, stageId: string) => {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
    };
    const newResources = resources.map(r => r.id === resourceId ? {
      ...r,
      stages: r.stages.map(s => s.id === stageId ? {
        ...s,
        tasks: [...s.tasks, task],
      } : s),
    } : r);
    await syncResources(newResources);
    setNewTaskTitle('');
  };

  const toggleTask = async (resourceId: string, stageId: string, taskId: string) => {
    const newResources = resources.map(r => r.id === resourceId ? {
      ...r,
      stages: r.stages.map(s => s.id === stageId ? {
        ...s,
        tasks: s.tasks.map(t => t.id === taskId ? {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? Date.now() : undefined,
        } : t),
      } : s),
    } : r);
    await syncResources(newResources);
  };

  const deleteTask = async (resourceId: string, stageId: string, taskId: string) => {
    const newResources = resources.map(r => r.id === resourceId ? {
      ...r,
      stages: r.stages.map(s => s.id === stageId ? {
        ...s,
        tasks: s.tasks.filter(t => t.id !== taskId),
      } : s),
    } : r);
    await syncResources(newResources);
  };

  const updateNotes = (resourceId: string, notes: string) => {
    setResources(resources.map(r => r.id === resourceId ? { ...r, notes } : r));
  };

  const updateInsights = (resourceId: string, insights: string) => {
    setResources(resources.map(r => r.id === resourceId ? { ...r, insights } : r));
  };

  // 计算阶段进度
  const getStageProgress = (stage: LearningStage): number => {
    if (stage.tasks.length === 0) return 0;
    const completed = stage.tasks.filter(t => t.completed).length;
    return Math.round((completed / stage.tasks.length) * 100);
  };

  // 计算资源整体进度
  const getResourceProgress = (resource: LearningResource): number => {
    if (resource.stages.length === 0) return 0;
    const totalProgress = resource.stages.reduce((sum, s) => sum + getStageProgress(s), 0);
    return Math.round(totalProgress / resource.stages.length);
  };

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(r => r.categoryId === selectedCategory);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const totalResources = resources.length;
  const totalStages = resources.reduce((sum, r) => sum + r.stages.length, 0);
  const totalTasks = resources.reduce((sum, r) => sum + r.stages.reduce((s, st) => s + st.tasks.length, 0), 0);
  const completedTasks = resources.reduce((sum, r) => sum + r.stages.reduce((s, st) => s + st.tasks.filter(t => t.completed).length, 0), 0);

  // 计算今日学习数据
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTimestamp = todayStart.getTime();

  const todayCompletedTasks = resources.reduce((sum, r) =>
    sum + r.stages.reduce((s, st) =>
      s + st.tasks.filter(t => t.completed && t.completedAt && t.completedAt >= todayStartTimestamp).length
    , 0)
  , 0);

  const todayNewStages = resources.reduce((sum, r) =>
    sum + r.stages.filter(s => {
      // 使用阶段中最早的任务创建时间作为阶段创建时间
      if (s.tasks.length === 0) return false;
      const earliestTask = s.tasks.reduce((earliest, t) => {
        const taskId = parseInt(t.id);
        return taskId < earliest ? taskId : earliest;
      }, Infinity);
      return earliestTask >= todayStartTimestamp;
    }).length
  , 0);

  const todayNewResources = resources.filter(r => r.createdAt >= todayStartTimestamp).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">学习区域</h2>
          <p className="text-muted-foreground text-sm">多阶段学习管理，追踪每个阶段的任务和进度</p>
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
          <p className="text-sm text-muted-foreground">学习阶段</p>
          <p className="text-2xl font-bold mt-1">{totalStages}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">已完成任务</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{completedTasks}/{totalTasks}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">总体进度</p>
          <p className="text-2xl font-bold mt-1">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</p>
        </div>
      </div>

      {/* 今日学习统计 */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-xl border border-teal-200 dark:border-teal-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <h3 className="font-semibold text-lg">今日学习</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{todayCompletedTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">完成任务</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{todayNewStages}</p>
            <p className="text-sm text-muted-foreground mt-1">新增阶段</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{todayNewResources}</p>
            <p className="text-sm text-muted-foreground mt-1">新增资源</p>
          </div>
        </div>
        {todayCompletedTasks > 0 && (
          <div className="mt-4 pt-4 border-t border-teal-200 dark:border-teal-800">
            <p className="text-sm text-muted-foreground text-center">
              {todayCompletedTasks >= 10 ? getMotivation(3) :
               todayCompletedTasks >= 7 ? getMotivation(2) :
               todayCompletedTasks >= 5 ? getMotivation(1) :
               todayCompletedTasks >= 3 ? getMotivation(0) :
               getMotivation(-1)}
            </p>
          </div>
        )}
        {todayCompletedTasks === 0 && (
          <div className="mt-4 pt-4 border-t border-teal-200 dark:border-teal-800">
            <p className="text-sm text-muted-foreground text-center">
              {getMotivation(-2)}
            </p>
          </div>
        )}
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
      {filteredResources.length > 0 ? (
        <div className="space-y-4">
          {filteredResources.map(resource => {
            const category = getCategoryById(resource.categoryId);
            const progress = getResourceProgress(resource);
            const isExpanded = expandedResource === resource.id;

            return (
              <div key={resource.id} className="bg-card rounded-xl border border-border overflow-hidden">
                {/* 资源头部 */}
                <div
                  className="p-5 cursor-pointer hover:bg-secondary/30 transition-all"
                  onClick={() => setExpandedResource(isExpanded ? null : resource.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <span>{category?.icon}</span>
                        <h3 className="font-semibold">{resource.title}</h3>
                        <span className="text-sm font-medium text-primary">{progress}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-6">
                        {resource.source && <span>来源: {resource.source}</span>}
                        <span>{resource.stages.length} 个阶段</span>
                        <span>{resource.stages.reduce((s, st) => s + st.tasks.length, 0)} 个任务</span>
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
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResource(resource.id); }}
                        className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* 进度条 */}
                  <div className="mt-3 ml-6">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 展开内容 */}
                {isExpanded && (
                  <div className="border-t border-border p-5 space-y-4">
                    {/* 阶段列表 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-primary" />
                          学习阶段
                        </h4>
                        <button
                          onClick={() => setShowAddStageModal(resource.id)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          添加阶段
                        </button>
                      </div>

                      {resource.stages.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          暂无学习阶段，点击上方按钮添加
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {resource.stages.map((stage, index) => {
                            const stageProgress = getStageProgress(stage);
                            const isStageExpanded = expandedStage === stage.id;
                            const completedTasks = stage.tasks.filter(t => t.completed).length;

                            return (
                              <div key={stage.id} className="rounded-lg border border-border overflow-hidden">
                                {/* 阶段头部 */}
                                <div
                                  className="p-3 cursor-pointer hover:bg-secondary/30 transition-all flex items-center gap-3"
                                  onClick={() => setExpandedStage(isStageExpanded ? null : stage.id)}
                                >
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      {isStageExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                      <span className="font-medium text-sm">{stage.name}</span>
                                      <span className="text-xs text-muted-foreground">{stageProgress}%</span>
                                    </div>
                                    {stage.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5 ml-5">{stage.description}</p>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex-shrink-0">
                                    {completedTasks}/{stage.tasks.length}
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteStage(resource.id, stage.id); }}
                                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive flex-shrink-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                {/* 阶段进度条 */}
                                <div className="px-3 pb-2 ml-11">
                                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${stageProgress}%` }}
                                    />
                                  </div>
                                </div>

                                {/* 展开的任务列表 */}
                                {isStageExpanded && (
                                  <div className="border-t border-border p-3 space-y-2">
                                    {/* 添加任务 */}
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') addTask(resource.id, stage.id); }}
                                        placeholder="添加任务，按回车确认"
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                      />
                                      <button
                                        onClick={() => addTask(resource.id, stage.id)}
                                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm"
                                      >
                                        添加
                                      </button>
                                    </div>
                                    {/* 任务列表 */}
                                    {stage.tasks.map(task => (
                                      <div key={task.id} className="flex items-center gap-2 group">
                                        <button
                                          onClick={() => toggleTask(resource.id, stage.id, task.id)}
                                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                            task.completed
                                              ? 'bg-primary border-primary'
                                              : 'border-border hover:border-primary'
                                          }`}
                                        >
                                          {task.completed && <Check className="h-3 w-3 text-white" />}
                                        </button>
                                        <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                          {task.title}
                                        </span>
                                        <button
                                          onClick={() => deleteTask(resource.id, stage.id, task.id)}
                                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-destructive transition-all"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                    {stage.tasks.length === 0 && (
                                      <p className="text-xs text-muted-foreground text-center py-2">暂无任务，添加你的第一个任务吧</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 学习笔记 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        学习笔记
                      </h4>
                      <textarea
                        value={resource.notes}
                        onChange={(e) => updateNotes(resource.id, e.target.value)}
                        placeholder="记录你的学习笔记..."
                        className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    {/* 思考与转化 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                        思考与转化
                      </h4>
                      <textarea
                        value={resource.insights}
                        onChange={(e) => updateInsights(resource.id, e.target.value)}
                        placeholder="记录你的思考、实践计划和总结..."
                        className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
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
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
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

      {/* 添加阶段弹窗 */}
      {showAddStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">添加学习阶段</h3>
            <div>
              <label className="text-sm font-medium mb-1.5 block">阶段名称 *</label>
              <input
                type="text"
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                placeholder="如：基础入门、进阶提升、实战练习等"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">阶段描述</label>
              <input
                type="text"
                value={newStage.description}
                onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                placeholder="描述这个阶段的目标和内容"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddStageModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={() => addStage(showAddStageModal)}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium text-sm"
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
