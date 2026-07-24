'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText, TrendingUp, TrendingDown, Minus, Plus, Trash2, Edit2, Check, X, Target, Lightbulb, Award, AlertCircle, BarChart3, Calendar, Star } from 'lucide-react';

// 复盘数据类型
interface Review {
  id: string;
  noteId: string; // 关联的笔记ID
  noteTitle: string; // 笔记标题（冗余存储，方便显示）
  date: string; // 复盘日期
  // 效果评估
  rating: number; // 1-5星评分
  performance: 'excellent' | 'good' | 'average' | 'poor'; // 效果评级
  // 数据分析
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    sales?: number; // 销售额（商品笔记）
  };
  // 复盘内容
  highlights: string; // 做得好的地方
  improvements: string; // 需要改进的地方
  lessons: string; // 经验教训
  actionPlan: string; // 下一步行动计划
  // 标签
  tags: string[];
  createdAt: number;
}

export function ContentReview() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    noteId: '',
    noteTitle: '',
    date: new Date().toISOString().split('T')[0],
    rating: 3,
    performance: 'average' as 'excellent' | 'good' | 'average' | 'poor',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    sales: 0,
    highlights: '',
    improvements: '',
    lessons: '',
    actionPlan: '',
    tags: '',
  });

  // 从 localStorage 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('content-reviews');
    if (saved) {
      setReviews(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  // 保存数据
  const saveReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem('content-reviews', JSON.stringify(newReviews));
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      noteId: '',
      noteTitle: '',
      date: new Date().toISOString().split('T')[0],
      rating: 3,
      performance: 'average',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      sales: 0,
      highlights: '',
      improvements: '',
      lessons: '',
      actionPlan: '',
      tags: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  // 提交表单
  const handleSubmit = () => {
    if (!formData.noteTitle.trim()) {
      alert('请输入笔记标题');
      return;
    }

    const review: Review = {
      id: editingId || Date.now().toString(),
      noteId: formData.noteId || Date.now().toString(),
      noteTitle: formData.noteTitle,
      date: formData.date,
      rating: formData.rating,
      performance: formData.performance,
      metrics: {
        views: formData.views,
        likes: formData.likes,
        comments: formData.comments,
        shares: formData.shares,
        sales: formData.sales || undefined,
      },
      highlights: formData.highlights,
      improvements: formData.improvements,
      lessons: formData.lessons,
      actionPlan: formData.actionPlan,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: editingId ? reviews.find(r => r.id === editingId)?.createdAt || Date.now() : Date.now(),
    };

    let newReviews: Review[];
    if (editingId) {
      newReviews = reviews.map(r => r.id === editingId ? review : r);
    } else {
      newReviews = [review, ...reviews];
    }

    saveReviews(newReviews);
    resetForm();
  };

  // 编辑复盘
  const handleEdit = (review: Review) => {
    setFormData({
      noteId: review.noteId,
      noteTitle: review.noteTitle,
      date: review.date,
      rating: review.rating,
      performance: review.performance,
      views: review.metrics.views,
      likes: review.metrics.likes,
      comments: review.metrics.comments,
      shares: review.metrics.shares,
      sales: review.metrics.sales || 0,
      highlights: review.highlights,
      improvements: review.improvements,
      lessons: review.lessons,
      actionPlan: review.actionPlan,
      tags: review.tags.join(', '),
    });
    setEditingId(review.id);
    setShowForm(true);
  };

  // 删除复盘
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条复盘吗？')) {
      saveReviews(reviews.filter(r => r.id !== id));
    }
  };

  // 获取效果评级样式
  const getPerformanceStyle = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'average': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'average': return '一般';
      case 'poor': return '较差';
      default: return performance;
    }
  };

  // 计算统计数据
  const stats = useMemo(() => {
    if (!mounted) return { total: 0, avgRating: 0, excellent: 0, poor: 0 };
    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const excellent = reviews.filter(r => r.performance === 'excellent' || r.performance === 'good').length;
    const poor = reviews.filter(r => r.performance === 'poor').length;
    return { total, avgRating, excellent, poor };
  }, [reviews, mounted]);

  // 筛选复盘
  const filteredReviews = useMemo(() => {
    if (selectedPerformance === 'all') return reviews;
    return reviews.filter(r => r.performance === selectedPerformance);
  }, [reviews, selectedPerformance]);

  if (!mounted) {
    return <div className="animate-pulse p-8 text-center text-gray-400">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-enhanced p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <FileText className="h-4 w-4" />
            复盘总数
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="card-enhanced p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Star className="h-4 w-4" />
            平均评分
          </div>
          <div className="text-2xl font-bold text-teal-600">{stats.avgRating.toFixed(1)}</div>
        </div>
        <div className="card-enhanced p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Award className="h-4 w-4 text-green-500" />
            优秀/良好
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
        </div>
        <div className="card-enhanced p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            需改进
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.poor}</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedPerformance('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPerformance === 'all'
                ? 'gradient-teal text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setSelectedPerformance('excellent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPerformance === 'excellent'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            优秀
          </button>
          <button
            onClick={() => setSelectedPerformance('good')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPerformance === 'good'
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
            }`}
          >
            良好
          </button>
          <button
            onClick={() => setSelectedPerformance('average')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPerformance === 'average'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
            }`}
          >
            一般
          </button>
          <button
            onClick={() => setSelectedPerformance('poor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPerformance === 'poor'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            较差
          </button>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新建复盘
        </button>
      </div>

      {/* 表单 */}
      {showForm && (
        <div className="card-enhanced p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? '编辑复盘' : '新建内容复盘'}
          </h3>
          
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">笔记标题 *</label>
              <input
                type="text"
                value={formData.noteTitle}
                onChange={(e) => setFormData({ ...formData, noteTitle: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                placeholder="输入关联的笔记标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">复盘日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* 效果评估 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">效果评级</label>
            <div className="flex gap-2 flex-wrap">
              {(['excellent', 'good', 'average', 'poor'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFormData({ ...formData, performance: p })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    formData.performance === p
                      ? getPerformanceStyle(p)
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {getPerformanceLabel(p)}
                </button>
              ))}
            </div>
          </div>

          {/* 评分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              综合评分：{formData.rating} 星
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 数据指标 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">数据指标</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">浏览量</label>
                <input
                  type="number"
                  value={formData.views}
                  onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">点赞数</label>
                <input
                  type="number"
                  value={formData.likes}
                  onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">评论数</label>
                <input
                  type="number"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">分享数</label>
                <input
                  type="number"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">销售额</label>
                <input
                  type="number"
                  value={formData.sales}
                  onChange={(e) => setFormData({ ...formData, sales: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 outline-none"
                  placeholder="¥"
                />
              </div>
            </div>
          </div>

          {/* 复盘内容 */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lightbulb className="h-4 w-4 inline text-yellow-500 mr-1" />
                做得好的地方
              </label>
              <textarea
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                rows={2}
                placeholder="标题吸引人、封面好看、选题好..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <AlertCircle className="h-4 w-4 inline text-red-500 mr-1" />
                需要改进的地方
              </label>
              <textarea
                value={formData.improvements}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                rows={2}
                placeholder="发布时间不对、文案不够吸引人、标签选择不好..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Target className="h-4 w-4 inline text-teal-500 mr-1" />
                经验教训
              </label>
              <textarea
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                rows={2}
                placeholder="这次学到了什么..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TrendingUp className="h-4 w-4 inline text-green-500 mr-1" />
                下一步行动计划
              </label>
              <textarea
                value={formData.actionPlan}
                onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                rows={2}
                placeholder="下次要做什么改进..."
              />
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              placeholder="如：选题技巧, 封面设计, 发布时间"
            />
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
              <Check className="h-4 w-4" />
              {editingId ? '保存修改' : '创建复盘'}
            </button>
            <button onClick={resetForm} className="btn-secondary flex items-center gap-2">
              <X className="h-4 w-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 复盘列表 */}
      {filteredReviews.length === 0 ? (
        <div className="card-enhanced p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {selectedPerformance === 'all' ? '暂无复盘记录' : `暂无${getPerformanceLabel(selectedPerformance)}的复盘`}
          </h3>
          <p className="text-gray-400">
            {selectedPerformance === 'all' ? '点击"新建复盘"开始记录你的内容复盘吧' : '尝试切换其他筛选条件'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="card-enhanced p-6">
              {/* 头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{review.noteTitle}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPerformanceStyle(review.performance)}`}>
                      {getPerformanceLabel(review.performance)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {review.date}
                    </span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 数据指标 */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{review.metrics.views.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">浏览</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-600">{review.metrics.likes.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">点赞</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{review.metrics.comments.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">评论</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{review.metrics.shares.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">分享</div>
                </div>
                {review.metrics.sales !== undefined && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-teal-600">¥{review.metrics.sales.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">销售额</div>
                  </div>
                )}
              </div>

              {/* 复盘内容 */}
              <div className="space-y-3">
                {review.highlights && (
                  <div className="flex gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">亮点：</span>
                      <span className="text-sm text-gray-600">{review.highlights}</span>
                    </div>
                  </div>
                )}
                {review.improvements && (
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">改进：</span>
                      <span className="text-sm text-gray-600">{review.improvements}</span>
                    </div>
                  </div>
                )}
                {review.lessons && (
                  <div className="flex gap-2">
                    <Target className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">教训：</span>
                      <span className="text-sm text-gray-600">{review.lessons}</span>
                    </div>
                  </div>
                )}
                {review.actionPlan && (
                  <div className="flex gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">计划：</span>
                      <span className="text-sm text-gray-600">{review.actionPlan}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 标签 */}
              {review.tags.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {review.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-teal-50 text-teal-600 rounded-md text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
