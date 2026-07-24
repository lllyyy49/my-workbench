'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, CheckCircle2, BookOpen, MessageSquare, GraduationCap, Calendar } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface WorkLog {
  id: string;
  date: string;
  items: { id: string; content: string; completed: boolean }[];
  summary: string;
  createdAt: number;
}

interface XiaohongshuNote {
  id: string;
  title: string;
  type: 'normal' | 'product';
  publishDate: string;
  stats: { views: number; likes: number; comments: number; shares: number };
  createdAt: number;
}

interface ReviewTemplate {
  id: string;
  text: string;
  category: string;
  usedCount: number;
  createdAt: number;
}

interface LearningResource {
  id: string;
  categoryId: string;
  title: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  notes: { id: string; content: string; timestamp: number }[];
  createdAt: number;
}

interface LearningCategory {
  id: string;
  name: string;
  icon: string;
}

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];

export function DataAnalysis() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [xhsNotes, setXhsNotes] = useState<XiaohongshuNote[]>([]);
  const [reviews, setReviews] = useState<ReviewTemplate[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [learningCategories, setLearningCategories] = useState<LearningCategory[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    const storedWorkLogs = localStorage.getItem('work-logs');
    const storedXhsNotes = localStorage.getItem('xiaohongshu-notes');
    const storedReviews = localStorage.getItem('review-templates');
    const storedLearningResources = localStorage.getItem('learning-resources');
    const storedLearningCategories = localStorage.getItem('learning-categories');

    if (storedTodos) setTodos(JSON.parse(storedTodos));
    if (storedWorkLogs) setWorkLogs(JSON.parse(storedWorkLogs));
    if (storedXhsNotes) setXhsNotes(JSON.parse(storedXhsNotes));
    if (storedReviews) setReviews(JSON.parse(storedReviews));
    if (storedLearningResources) setLearningResources(JSON.parse(storedLearningResources));
    if (storedLearningCategories) setLearningCategories(JSON.parse(storedLearningCategories));
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">数据分析</h2>
          <p className="text-muted-foreground text-sm">全面分析你的工作数据</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 h-64 animate-pulse">
              <div className="h-4 bg-secondary rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-secondary rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 待办事项分析
  const todoStats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0,
  };

  // 工作日志分析 - 最近7天工作量
  const getWorkLogTrend = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const log = workLogs.find(l => l.date === dateStr);
      days.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        完成: log?.items.filter(i => i.completed).length || 0,
        总数: log?.items.length || 0,
      });
    }
    return days;
  };

  // 小红书数据分析
  const xhsStats = {
    totalNotes: xhsNotes.length,
    normalNotes: xhsNotes.filter(n => n.type === 'normal').length,
    productNotes: xhsNotes.filter(n => n.type === 'product').length,
    totalViews: xhsNotes.reduce((sum, n) => sum + n.stats.views, 0),
    totalLikes: xhsNotes.reduce((sum, n) => sum + n.stats.likes, 0),
    totalComments: xhsNotes.reduce((sum, n) => sum + n.stats.comments, 0),
    totalShares: xhsNotes.reduce((sum, n) => sum + n.stats.shares, 0),
  };

  // 小红书笔记趋势 - 最近7天
  const getXhsTrend = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayNotes = xhsNotes.filter(n => n.publishDate === dateStr);
      days.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        笔记数: dayNotes.length,
        浏览量: dayNotes.reduce((sum, n) => sum + n.stats.views, 0),
        点赞数: dayNotes.reduce((sum, n) => sum + n.stats.likes, 0),
      });
    }
    return days;
  };

  // 评价库分析
  const reviewStats = {
    total: reviews.length,
    totalUsage: reviews.reduce((sum, r) => sum + r.usedCount, 0),
    byCategory: reviews.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const reviewCategoryData = Object.entries(reviewStats.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // 学习数据分析
  const learningStats = {
    totalResources: learningResources.length,
    completed: learningResources.filter(r => r.status === 'completed').length,
    inProgress: learningResources.filter(r => r.status === 'in-progress').length,
    notStarted: learningResources.filter(r => r.status === 'not-started').length,
    totalNotes: learningResources.reduce((sum, r) => sum + r.notes.length, 0),
    avgProgress: learningResources.length > 0
      ? Math.round(learningResources.reduce((sum, r) => sum + r.progress, 0) / learningResources.length)
      : 0,
  };

  // 学习分类统计
  const learningCategoryData = learningCategories.map(cat => {
    const resources = learningResources.filter(r => r.categoryId === cat.id);
    return {
      name: cat.name,
      资源数: resources.length,
      已完成: resources.filter(r => r.status === 'completed').length,
    };
  });

  const workLogTrend = getWorkLogTrend();
  const xhsTrend = getXhsTrend();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">数据分析</h2>
        <p className="text-muted-foreground text-sm">全面分析你的工作数据</p>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">待办完成率</span>
          </div>
          <p className="text-2xl font-bold">{todoStats.completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{todoStats.completed}/{todoStats.total} 项</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">小红书总浏览</span>
          </div>
          <p className="text-2xl font-bold">{xhsStats.totalViews.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{xhsStats.totalNotes} 篇笔记</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">评价使用次数</span>
          </div>
          <p className="text-2xl font-bold">{reviewStats.totalUsage}</p>
          <p className="text-xs text-muted-foreground mt-1">{reviewStats.total} 个模板</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">学习进度</span>
          </div>
          <p className="text-2xl font-bold">{learningStats.avgProgress}%</p>
          <p className="text-xs text-muted-foreground mt-1">{learningStats.completed} 个已完成</p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 工作日志趋势 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            近7天工作趋势
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={workLogTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="完成" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              <Area type="monotone" dataKey="总数" stackId="2" stroke="#E5E7EB" fill="#E5E7EB" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 小红书数据趋势 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            近7天小红书数据
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={xhsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="浏览量" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="点赞数" stroke="#EC4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 小红书笔记类型分布 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">小红书笔记类型分布</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: '普通笔记', value: xhsStats.normalNotes },
                    { name: '商品笔记', value: xhsStats.productNotes },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#F59E0B" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{xhsStats.normalNotes}</p>
              <p className="text-xs text-muted-foreground">普通笔记</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{xhsStats.productNotes}</p>
              <p className="text-xs text-muted-foreground">商品笔记</p>
            </div>
          </div>
        </div>

        {/* 评价库分类分布 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">评价库分类分布</h3>
          {reviewCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={reviewCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
              暂无评价数据
            </div>
          )}
        </div>

        {/* 学习分类统计 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            学习分类统计
          </h3>
          {learningCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={learningCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="资源数" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="已完成" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
              暂无学习数据
            </div>
          )}
        </div>

        {/* 学习状态分布 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">学习资源状态</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">已完成</span>
                <span className="font-medium text-green-600">{learningStats.completed}</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${learningStats.totalResources > 0 ? (learningStats.completed / learningStats.totalResources) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">学习中</span>
                <span className="font-medium text-primary">{learningStats.inProgress}</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${learningStats.totalResources > 0 ? (learningStats.inProgress / learningStats.totalResources) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">未开始</span>
                <span className="font-medium text-muted-foreground">{learningStats.notStarted}</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all"
                  style={{ width: `${learningStats.totalResources > 0 ? (learningStats.notStarted / learningStats.totalResources) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{learningStats.totalResources}</p>
                  <p className="text-xs text-muted-foreground">总资源</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{learningStats.totalNotes}</p>
                  <p className="text-xs text-muted-foreground">笔记数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{learningStats.avgProgress}%</p>
                  <p className="text-xs text-muted-foreground">平均进度</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 小红书详细数据 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          小红书数据汇总
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-lg bg-secondary/50">
            <p className="text-3xl font-bold">{xhsStats.totalNotes}</p>
            <p className="text-sm text-muted-foreground mt-1">笔记总数</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/50">
            <p className="text-3xl font-bold text-blue-600">{xhsStats.totalViews.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">总浏览</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/50">
            <p className="text-3xl font-bold text-pink-600">{xhsStats.totalLikes.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">总点赞</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/50">
            <p className="text-3xl font-bold text-green-600">{xhsStats.totalComments.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">总评论</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/50">
            <p className="text-3xl font-bold text-purple-600">{xhsStats.totalShares.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">总分享</p>
          </div>
        </div>
      </div>
    </div>
  );
}
