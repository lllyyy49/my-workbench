'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: '1', name: '食品', icon: '🍜', color: '#14B8A6' },
  { id: '2', name: '交通', icon: '🚗', color: '#3B82F6' },
  { id: '3', name: '购物', icon: '🛍️', color: '#EC4899' },
  { id: '4', name: '娱乐', icon: '🎮', color: '#8B5CF6' },
  { id: '5', name: '医疗', icon: '💊', color: '#10B981' },
  { id: '6', name: '教育', icon: '📚', color: '#06B6D4' },
  { id: '7', name: '住房', icon: '🏠', color: '#F97316' },
  { id: '8', name: '其他', icon: '📦', color: '#6B7280' },
];

const COLORS = ['#14B8A6', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#06B6D4', '#F97316', '#6B7280'];

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [mounted, setMounted] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 表单状态
  const [formData, setFormData] = useState({
    amount: '',
    category: '1',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const storedExpenses = localStorage.getItem('expenses');
    const storedCategories = localStorage.getItem('expense-categories');
    if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    if (storedCategories) setCategories(JSON.parse(storedCategories));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('expense-categories', JSON.stringify(categories));
    }
  }, [categories, mounted]);

  const handleAddExpense = () => {
    if (!formData.amount || !formData.category || !formData.date) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      createdAt: Date.now(),
    };

    setExpenses([...expenses, newExpense]);
    setFormData({ amount: '', category: '1', description: '', date: new Date().toISOString().split('T')[0] });
    setIsAddDialogOpen(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: expense.date,
    });
  };

  const handleSaveEdit = () => {
    if (!editingExpense || !formData.amount) return;

    setExpenses(expenses.map(e =>
      e.id === editingExpense.id
        ? { ...e, amount: parseFloat(formData.amount), category: formData.category, description: formData.description, date: formData.date }
        : e
    ));
    setEditingExpense(null);
    setFormData({ amount: '', category: '1', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: '未知', icon: '📦', color: '#6B7280' };
  };

  // 筛选当前月份的支出
  const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  // 统计
  const totalAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgDaily = monthExpenses.length > 0
    ? totalAmount / new Set(monthExpenses.map(e => e.date)).size
    : 0;

  // 按分类统计
  const categoryStats = categories.map(cat => {
    const catExpenses = monthExpenses.filter(e => e.category === cat.id);
    return {
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      amount: catExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: catExpenses.length,
    };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  // 每日花费趋势
  const getDailyTrend = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayExpenses = monthExpenses.filter(e => e.date === dateStr);
      days.push({
        date: `${i}日`,
        金额: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }
    return days;
  };

  // 最近7天趋势
  const getRecentTrend = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      days.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        金额: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }
    return days;
  };

  // 按日期分组
  const groupedByDate = monthExpenses.reduce((acc, expense) => {
    if (!acc[expense.date]) acc[expense.date] = [];
    acc[expense.date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const dailyTrend = getDailyTrend();
  const recentTrend = getRecentTrend();

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">记账本</h2>
            <p className="text-muted-foreground text-sm">记录每日花费，分析消费习惯</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 h-32 animate-pulse">
              <div className="h-4 bg-secondary rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-secondary rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和月份选择 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">记账本</h2>
          <p className="text-muted-foreground text-sm">记录每日花费，分析消费习惯</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-teal-700">本月支出</span>
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-teal-900">¥{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-teal-600 mt-1">{monthExpenses.length} 笔记录</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">日均消费</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900">¥{avgDaily.toFixed(2)}</div>
            <p className="text-xs text-blue-600 mt-1">每日平均</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">最大分类</span>
              <PieChart className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {categoryStats[0] ? `${categoryStats[0].icon} ${categoryStats[0].name}` : '暂无'}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {categoryStats[0] ? `¥${categoryStats[0].amount.toFixed(2)}` : '无记录'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 每日花费趋势 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              每日花费趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(dailyTrend.length / 7)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, '金额']}
                />
                <Line type="monotone" dataKey="金额" stroke="#14B8A6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 分类占比 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              分类占比
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="amount"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, '金额']} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                暂无数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 分类统计列表 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">分类统计</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryStats.length > 0 ? (
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-sm font-semibold">¥{cat.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(cat.amount / totalAmount) * 100}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat.count} 笔 · {((cat.amount / totalAmount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              本月暂无记录
            </div>
          )}
        </CardContent>
      </Card>

      {/* 记录列表 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">消费记录</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-1" />
                  记一笔
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加消费记录</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>金额</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>分类</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              {cat.icon} {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>描述</Label>
                    <Input
                      placeholder="买了什么..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>日期</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddExpense} className="w-full bg-teal-500 hover:bg-teal-600">
                    添加记录
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedDates.length > 0 ? (
            <div className="space-y-4">
              {sortedDates.map((date) => {
                const dateExpenses = groupedByDate[date];
                const dateTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
                const dateObj = new Date(date + 'T00:00:00');
                const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()];

                return (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {date} {weekday}
                      </span>
                      <span className="text-sm font-semibold">¥{dateTotal.toFixed(2)}</span>
                    </div>
                    <div className="space-y-2">
                      {dateExpenses.map((expense) => {
                        const catInfo = getCategoryInfo(expense.category);
                        return (
                          <div
                            key={expense.id}
                            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <span className="text-2xl">{catInfo.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" style={{ borderColor: catInfo.color, color: catInfo.color }}>
                                  {catInfo.name}
                                </Badge>
                                {expense.description && (
                                  <span className="text-sm truncate">{expense.description}</span>
                                )}
                              </div>
                            </div>
                            <span className="font-semibold">¥{expense.amount.toFixed(2)}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditExpense(expense)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              本月暂无记录，点击"记一笔"开始记账
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑消费记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>金额</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>分类</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.icon} {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                placeholder="买了什么..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>日期</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingExpense(null)}>
                取消
              </Button>
              <Button className="flex-1 bg-teal-500 hover:bg-teal-600" onClick={handleSaveEdit}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
