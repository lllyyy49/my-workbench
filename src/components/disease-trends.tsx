'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, TrendingUp, Calendar, Users, Thermometer, Pill, Package, Upload, X, Filter, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DataImportService } from '@/components/data-import-service';

interface DiseaseTrend {
  id: string;
  department: string; // 科室
  diseaseName: string; // 病症名称
  targetGroup: string; // 好发人群
  season: string[]; // 好发季节
  months: number[]; // 好发月份
  symptoms: string; // 症状描述
  treatmentTypes: string[]; // 对症药物类型（膏药、凝胶、敷贴等）
  xiaohongshuHeat: number; // 小红书热度
  productSuggestions: string; // 商品建议
  customProducts: CustomProduct[]; // 自定义产品列表
  notes: string; // 备注
  createdAt: number;
  updatedAt: number;
}

interface CustomProduct {
  id: string;
  name: string; // 产品名称
  brand: string; // 品牌
  price: string; // 价格
  link: string; // 产品链接
  notes: string; // 备注
}

const DEPARTMENTS = [
  '骨科', '皮肤科', '消化内科', '呼吸内科', '心血管内科',
  '神经内科', '妇科', '儿科', '眼科', '耳鼻喉科',
  '口腔科', '中医科', '康复科', '其他'
];

const SEASONS = ['春季', '夏季', '秋季', '冬季'];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const TREATMENT_TYPES = ['膏药', '凝胶', '敷贴', '贴剂', '喷剂', '口服液', '胶囊', '片剂', '软膏', '其他'];

const COLORS = ['#14B8A6', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'];

export function DiseaseTrends() {
  const [trends, setTrends] = useState<DiseaseTrend[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrend, setEditingTrend] = useState<DiseaseTrend | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    department: '',
    diseaseName: '',
    targetGroup: '',
    season: [] as string[],
    months: [] as number[],
    symptoms: '',
    treatmentTypes: [] as string[],
    xiaohongshuHeat: '',
    productSuggestions: '',
    customProducts: [] as CustomProduct[],
    notes: '',
  });

  // 产品表单状态
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    link: '',
    notes: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('disease-trends');
    if (stored) {
      setTrends(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('disease-trends', JSON.stringify(trends));
  }, [trends]);

  const resetForm = () => {
    setFormData({
      department: '',
      diseaseName: '',
      targetGroup: '',
      season: [],
      months: [],
      symptoms: '',
      treatmentTypes: [],
      xiaohongshuHeat: '',
      productSuggestions: '',
      customProducts: [],
      notes: '',
    });
    setEditingTrend(null);
  };

  const handleEdit = (trend: DiseaseTrend) => {
    setFormData({
      department: trend.department,
      diseaseName: trend.diseaseName,
      targetGroup: trend.targetGroup,
      season: trend.season,
      months: trend.months,
      symptoms: trend.symptoms,
      treatmentTypes: trend.treatmentTypes,
      xiaohongshuHeat: trend.xiaohongshuHeat.toString(),
      productSuggestions: trend.productSuggestions,
      customProducts: trend.customProducts || [],
      notes: trend.notes,
    });
    setEditingTrend(trend);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条病症趋势吗？')) {
      setTrends(trends.filter(t => t.id !== id));
    }
  };

  // 产品管理函数
  const openProductForm = (product?: CustomProduct) => {
    if (product) {
      setProductForm({
        name: product.name,
        brand: product.brand,
        price: product.price,
        link: product.link,
        notes: product.notes,
      });
      setEditingProduct(product);
    } else {
      setProductForm({ name: '', brand: '', price: '', link: '', notes: '' });
      setEditingProduct(null);
    }
    setShowProductForm(true);
  };

  const saveProduct = () => {
    if (!productForm.name.trim()) {
      alert('请填写产品名称');
      return;
    }

    const newProduct: CustomProduct = {
      id: editingProduct?.id || Date.now().toString(),
      ...productForm,
    };

    if (editingProduct) {
      setFormData({
        ...formData,
        customProducts: formData.customProducts.map(p => p.id === editingProduct.id ? newProduct : p),
      });
    } else {
      setFormData({
        ...formData,
        customProducts: [...formData.customProducts, newProduct],
      });
    }

    setShowProductForm(false);
    setEditingProduct(null);
  };

  const deleteProduct = (productId: string) => {
    if (confirm('确定要删除这个产品吗？')) {
      setFormData({
        ...formData,
        customProducts: formData.customProducts.filter(p => p.id !== productId),
      });
    }
  };

  // 批量选择切换
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTrends.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTrends.map(t => t.id)));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 条病症趋势吗？`)) {
      setTrends(trends.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
      setIsBatchMode(false);
    }
  };

  // 退出批量模式
  const exitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedIds(new Set());
  };

  // 批量导入处理
  const handleBatchImport = (importedData: any[]) => {
    if (importedData.length > 0) {
      setTrends([...importedData, ...trends]);
    }
  };

  const handleSubmit = () => {
    if (!formData.diseaseName.trim() || !formData.department) {
      alert('请填写病症名称和科室');
      return;
    }

    const trendData: DiseaseTrend = {
      id: editingTrend?.id || Date.now().toString(),
      department: formData.department,
      diseaseName: formData.diseaseName.trim(),
      targetGroup: formData.targetGroup.trim(),
      season: formData.season,
      months: formData.months,
      symptoms: formData.symptoms.trim(),
      treatmentTypes: formData.treatmentTypes,
      xiaohongshuHeat: parseInt(formData.xiaohongshuHeat) || 0,
      productSuggestions: formData.productSuggestions.trim(),
      customProducts: formData.customProducts,
      notes: formData.notes.trim(),
      createdAt: editingTrend?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (editingTrend) {
      setTrends(trends.map(t => t.id === editingTrend.id ? trendData : t));
    } else {
      setTrends([trendData, ...trends]);
    }

    setShowForm(false);
    resetForm();
  };

  // 过滤数据
  const filteredTrends = trends.filter(trend => {
    const matchesSearch = searchQuery === '' ||
      trend.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === '' || trend.department === selectedDepartment;
    const matchesSeason = selectedSeason === '' || trend.season.includes(selectedSeason);
    return matchesSearch && matchesDepartment && matchesSeason;
  });

  // 统计数据
  const stats = {
    total: trends.length,
    departments: Array.from(new Set(trends.map(t => t.department))).length,
    avgHeat: trends.length > 0 ? Math.round(trends.reduce((sum, t) => sum + t.xiaohongshuHeat, 0) / trends.length) : 0,
    topTreatment: (() => {
      const count: Record<string, number> = {};
      trends.forEach(t => t.treatmentTypes.forEach(type => { count[type] = (count[type] || 0) + 1; }));
      return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || '暂无';
    })(),
  };

  // 季节分布数据
  const seasonData = SEASONS.map(season => ({
    name: season,
    count: trends.filter(t => t.season.includes(season)).length,
  }));

  // 科室分布数据
  const departmentData = DEPARTMENTS.map(dept => ({
    name: dept,
    count: trends.filter(t => t.department === dept).length,
  })).filter(d => d.count > 0);

  // 月度趋势数据
  const monthlyData = MONTHS.map(month => ({
    month: `${month}月`,
    count: trends.filter(t => t.months.includes(month)).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">病症趋势分析</h2>
          <p className="text-muted-foreground text-sm">各科室热门病症、好发季节、对症药物类型分析</p>
        </div>
        <div className="flex gap-2">
          <DataImportService onImport={handleBatchImport} />
          {isBatchMode ? (
            <>
              <button
                onClick={handleBatchDelete}
                disabled={selectedIds.size === 0}
                className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                删除 ({selectedIds.size})
              </button>
              <button
                onClick={exitBatchMode}
                className="px-4 py-2.5 rounded-lg border border-border hover:bg-secondary transition-all text-sm font-medium"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsBatchMode(true)}
              className="px-4 py-2.5 rounded-lg border border-border hover:bg-secondary transition-all text-sm font-medium flex items-center gap-1.5"
            >
              批量管理
            </button>
          )}
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            添加病症
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">病症总数</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">覆盖科室</p>
          <p className="text-2xl font-bold mt-1">{stats.departments}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">平均热度</p>
          <p className="text-2xl font-bold mt-1">{stats.avgHeat}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">热门药物类型</p>
          <p className="text-lg font-bold mt-1">{stats.topTreatment}</p>
        </div>
      </div>

      {/* 图表视图 */}
      {viewMode === 'chart' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium mb-4">季节分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={seasonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium mb-4">科室分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={departmentData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {departmentData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 col-span-2">
            <h3 className="text-sm font-medium mb-4">月度趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#14B8A6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索病症名称、症状..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">全部科室</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">全部季节</option>
            {SEASONS.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary'}`}
            >
              表格
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'chart' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary'}`}
            >
              图表
            </button>
          </div>
        </div>
      </div>

      {/* 表格视图 */}
      {viewMode === 'table' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {isBatchMode && (
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredTrends.length && filteredTrends.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">科室</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">病症名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">好发人群</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">季节</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">药物类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">热度</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">商品建议</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">我的产品</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTrends.map(trend => (
                  <tr key={trend.id} className={`hover:bg-muted/30 transition-colors ${isBatchMode && selectedIds.has(trend.id) ? 'bg-primary/5' : ''}`}>
                    {isBatchMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(trend.id)}
                          onChange={() => toggleSelect(trend.id)}
                          className="w-4 h-4 rounded border-border cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm">{trend.department}</td>
                    <td className="px-4 py-3 text-sm font-medium">{trend.diseaseName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{trend.targetGroup || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {trend.season.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {trend.treatmentTypes.map(type => (
                          <span key={type} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        {trend.xiaohongshuHeat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                      {trend.productSuggestions || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {trend.customProducts && trend.customProducts.length > 0 ? (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {trend.customProducts.length} 个产品
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {!isBatchMode && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(trend)}
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(trend.id)}
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrends.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery || selectedDepartment || selectedSeason ? '没有找到匹配的病症趋势' : '还没有添加病症趋势，点击上方按钮开始添加'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 添加/编辑表单 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTrend ? '编辑病症趋势' : '添加病症趋势'}
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 科室和病症名称 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">科室 *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">请选择科室</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">病症名称 *</label>
                  <input
                    type="text"
                    value={formData.diseaseName}
                    onChange={(e) => setFormData({ ...formData, diseaseName: e.target.value })}
                    placeholder="如：颈椎病、湿疹"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* 好发人群 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">好发人群</label>
                <input
                  type="text"
                  value={formData.targetGroup}
                  onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                  placeholder="如：中老年人、上班族、儿童"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* 好发季节 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">好发季节</label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map(season => (
                    <button
                      key={season}
                      onClick={() => {
                        const newSeason = formData.season.includes(season)
                          ? formData.season.filter(s => s !== season)
                          : [...formData.season, season];
                        setFormData({ ...formData, season: newSeason });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.season.includes(season)
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-secondary'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* 好发月份 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">好发月份</label>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.map(month => (
                    <button
                      key={month}
                      onClick={() => {
                        const newMonths = formData.months.includes(month)
                          ? formData.months.filter(m => m !== month)
                          : [...formData.months, month];
                        setFormData({ ...formData, months: newMonths });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.months.includes(month)
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-secondary'
                      }`}
                    >
                      {month}月
                    </button>
                  ))}
                </div>
              </div>

              {/* 症状描述 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">症状描述</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="描述主要症状..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* 对症药物类型 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">对症药物类型</label>
                <div className="flex flex-wrap gap-2">
                  {TREATMENT_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = formData.treatmentTypes.includes(type)
                          ? formData.treatmentTypes.filter(t => t !== type)
                          : [...formData.treatmentTypes, type];
                        setFormData({ ...formData, treatmentTypes: newTypes });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.treatmentTypes.includes(type)
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-secondary'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 小红书热度和商品建议 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">小红书热度</label>
                  <input
                    type="number"
                    value={formData.xiaohongshuHeat}
                    onChange={(e) => setFormData({ ...formData, xiaohongshuHeat: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">商品建议</label>
                  <input
                    type="text"
                    value={formData.productSuggestions}
                    onChange={(e) => setFormData({ ...formData, productSuggestions: e.target.value })}
                    placeholder="推荐商品类型..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* 自定义产品管理 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">我的产品</label>
                  <button
                    onClick={() => openProductForm()}
                    className="px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    添加产品
                  </button>
                </div>

                {formData.customProducts.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.customProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.brand && `${product.brand} · `}{product.price && `¥${product.price}`}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => openProductForm(product)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.customProducts.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">暂无产品，点击上方按钮添加</p>
                )}
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="其他说明..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium text-sm"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 产品编辑弹窗 */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingProduct ? '编辑产品' : '添加产品'}
              </h3>
              <button
                onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">产品名称 *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="如：XX 牌膏药"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">品牌</label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  placeholder="如：XX 品牌"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">价格</label>
                <input
                  type="text"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="如：99"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">产品链接</label>
                <input
                  type="text"
                  value={productForm.link}
                  onChange={(e) => setProductForm({ ...productForm, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">备注</label>
                <textarea
                  value={productForm.notes}
                  onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                  placeholder="产品说明..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
                >
                  取消
                </button>
                <button
                  onClick={saveProduct}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium text-sm"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
