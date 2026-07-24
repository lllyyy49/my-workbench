'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, ExternalLink, Eye, Heart, MessageCircle, Share2, Check, X, Copy, Image as ImageIcon, Package, FileText, DollarSign, TrendingUp, Users, Store, Settings } from 'lucide-react';

interface NoteImage {
  id: string;
  dataUrl: string;
  name: string;
}

interface XiaohongshuAccount {
  id: string;
  name: string;
  platform: string;
  avatar?: string;
}

interface XiaohongshuShop {
  id: string;
  name: string;
  platform: string;
}

interface XiaohongshuNote {
  id: string;
  title: string;
  content: string;
  type: 'normal' | 'product'; // 普通笔记 / 商品笔记
  accountId: string; // 关联账号ID
  shopId: string; // 关联店铺ID（仅商品笔记）
  productLink: string;
  productName: string;
  images: NoteImage[];
  publishDate: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  // 商品销售数据（仅商品笔记）
  salesData?: {
    salesAmount: number; // 销售金额
    salesVolume: number; // 销量
    promotionCost: number; // 推广花费
  };
  // 刷单数据
  fakeData?: {
    fakeViews: number; // 刷的浏览量
    fakeLikes: number; // 刷的点赞数
    fakeComments: number; // 刷的评论数
    fakeShares: number; // 刷的分享数
    fakeSalesAmount: number; // 刷单金额
    fakeSalesVolume: number; // 刷单销量
  };
  tags: string[];
  createdAt: number;
}

export function XiaohongshuNotes() {
  const [notes, setNotes] = useState<XiaohongshuNote[]>([]);
  const [accounts, setAccounts] = useState<XiaohongshuAccount[]>([]);
  const [shops, setShops] = useState<XiaohongshuShop[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [editingNote, setEditingNote] = useState<XiaohongshuNote | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'product'>('all');
  const [filterAccountId, setFilterAccountId] = useState<string>('');
  const [filterShopId, setFilterShopId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'normal' as 'normal' | 'product',
    accountId: '',
    shopId: '',
    productLink: '',
    productName: '',
    publishDate: '',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    salesAmount: 0,
    salesVolume: 0,
    promotionCost: 0,
    fakeViews: 0,
    fakeLikes: 0,
    fakeComments: 0,
    fakeShares: 0,
    fakeSalesAmount: 0,
    fakeSalesVolume: 0,
    tags: '',
  });
  const [accountForm, setAccountForm] = useState({ name: '', platform: '小红书' });
  const [shopForm, setShopForm] = useState({ name: '', platform: '小红书' });
  const [newImages, setNewImages] = useState<NoteImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('xiaohongshu-notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
    const storedAccounts = localStorage.getItem('xiaohongshu-accounts');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }
    const storedShops = localStorage.getItem('xiaohongshu-shops');
    if (storedShops) {
      setShops(JSON.parse(storedShops));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('xiaohongshu-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('xiaohongshu-accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('xiaohongshu-shops', JSON.stringify(shops));
  }, [shops]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'normal',
      accountId: accounts.length > 0 ? accounts[0].id : '',
      shopId: '',
      productLink: '',
      productName: '',
      publishDate: '',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      salesAmount: 0,
      salesVolume: 0,
      promotionCost: 0,
      fakeViews: 0,
      fakeLikes: 0,
      fakeComments: 0,
      fakeShares: 0,
      fakeSalesAmount: 0,
      fakeSalesVolume: 0,
      tags: '',
    });
    setNewImages([]);
    setEditingNote(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (note: XiaohongshuNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      type: note.type,
      accountId: note.accountId,
      shopId: note.shopId || '',
      productLink: note.productLink,
      productName: note.productName,
      publishDate: note.publishDate,
      views: note.stats.views,
      likes: note.stats.likes,
      comments: note.stats.comments,
      shares: note.stats.shares,
      salesAmount: note.salesData?.salesAmount || 0,
      salesVolume: note.salesData?.salesVolume || 0,
      promotionCost: note.salesData?.promotionCost || 0,
      fakeViews: note.fakeData?.fakeViews || 0,
      fakeLikes: note.fakeData?.fakeLikes || 0,
      fakeComments: note.fakeData?.fakeComments || 0,
      fakeShares: note.fakeData?.fakeShares || 0,
      fakeSalesAmount: note.fakeData?.fakeSalesAmount || 0,
      fakeSalesVolume: note.fakeData?.fakeSalesVolume || 0,
      tags: note.tags.join(', '),
    });
    setNewImages(note.images || []);
    setShowAddModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const images: NoteImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      images.push({
        id: Date.now().toString() + i,
        dataUrl,
        name: file.name,
      });
    }

    setNewImages([...newImages, ...images]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId: string) => {
    setNewImages(newImages.filter(img => img.id !== imageId));
  };

  const saveNote = () => {
    if (!formData.title.trim()) return;
    if (!formData.accountId) return;
    
    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    const salesData = formData.type === 'product' ? {
      salesAmount: formData.salesAmount,
      salesVolume: formData.salesVolume,
      promotionCost: formData.promotionCost,
    } : undefined;
    
    // 刷单数据
    const fakeData = {
      fakeViews: formData.fakeViews,
      fakeLikes: formData.fakeLikes,
      fakeComments: formData.fakeComments,
      fakeShares: formData.fakeShares,
      fakeSalesAmount: formData.fakeSalesAmount,
      fakeSalesVolume: formData.fakeSalesVolume,
    };
    
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? {
        ...n,
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        accountId: formData.accountId,
        shopId: formData.type === 'product' ? formData.shopId : '',
        productLink: formData.type === 'product' ? formData.productLink.trim() : '',
        productName: formData.type === 'product' ? formData.productName.trim() : '',
        images: newImages,
        publishDate: formData.publishDate,
        stats: {
          views: formData.views,
          likes: formData.likes,
          comments: formData.comments,
          shares: formData.shares,
        },
        salesData,
        fakeData,
        tags,
      } : n));
    } else {
      const newNote: XiaohongshuNote = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        accountId: formData.accountId,
        shopId: formData.type === 'product' ? formData.shopId : '',
        productLink: formData.type === 'product' ? formData.productLink.trim() : '',
        productName: formData.type === 'product' ? formData.productName.trim() : '',
        images: newImages,
        publishDate: formData.publishDate || new Date().toISOString().split('T')[0],
        stats: {
          views: formData.views,
          likes: formData.likes,
          comments: formData.comments,
          shares: formData.shares,
        },
        salesData,
        fakeData,
        tags,
        createdAt: Date.now(),
      };
      setNotes([newNote, ...notes]);
    }
    
    setShowAddModal(false);
    resetForm();
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const copyNoteInfo = (note: XiaohongshuNote) => {
    const account = accounts.find(a => a.id === note.accountId);
    let text = `账号：${account?.name || '未知'}\n标题：${note.title}\n内容：${note.content}`;
    if (note.type === 'product') {
      text += `\n商品：${note.productName}\n链接：${note.productLink}`;
      if (note.salesData) {
        text += `\n销售金额：¥${note.salesData.salesAmount}\n销量：${note.salesData.salesVolume}\n推广花费：¥${note.salesData.promotionCost}`;
        if (note.salesData.promotionCost > 0) {
          const roi = (note.salesData.salesAmount / note.salesData.promotionCost).toFixed(2);
          text += `\nROI：${roi}`;
        }
      }
    }
    text += `\n标签：${note.tags.map(t => '#' + t).join(' ')}`;
    navigator.clipboard.writeText(text);
  };

  // 添加账号
  const addAccount = () => {
    if (!accountForm.name.trim()) return;
    const newAccount: XiaohongshuAccount = {
      id: Date.now().toString(),
      name: accountForm.name.trim(),
      platform: accountForm.platform,
    };
    setAccounts([...accounts, newAccount]);
    setAccountForm({ name: '', platform: '小红书' });
  };

  // 删除账号
  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  // 添加店铺
  const addShop = () => {
    if (!shopForm.name.trim()) return;
    const newShop: XiaohongshuShop = {
      id: Date.now().toString(),
      name: shopForm.name.trim(),
      platform: shopForm.platform,
    };
    setShops([...shops, newShop]);
    setShopForm({ name: '', platform: '小红书' });
  };

  // 删除店铺
  const deleteShop = (id: string) => {
    setShops(shops.filter(s => s.id !== id));
  };

  // 筛选笔记
  const filteredNotes = notes.filter(note => {
    if (filterType !== 'all' && note.type !== filterType) return false;
    if (filterAccountId && note.accountId !== filterAccountId) return false;
    if (filterShopId && note.shopId !== filterShopId) return false;
    return true;
  });

  const normalCount = notes.filter(n => n.type === 'normal').length;
  const productCount = notes.filter(n => n.type === 'product').length;
  
  // 真实数据（剔除刷单影响）
  const totalViews = notes.reduce((sum, n) => {
    const fakeViews = n.fakeData?.fakeViews || 0;
    return sum + Math.max(0, n.stats.views - fakeViews);
  }, 0);
  const totalLikes = notes.reduce((sum, n) => {
    const fakeLikes = n.fakeData?.fakeLikes || 0;
    return sum + Math.max(0, n.stats.likes - fakeLikes);
  }, 0);
  
  // 刷单数据统计
  const totalFakeViews = notes.reduce((sum, n) => sum + (n.fakeData?.fakeViews || 0), 0);
  const totalFakeLikes = notes.reduce((sum, n) => sum + (n.fakeData?.fakeLikes || 0), 0);
  const totalFakeComments = notes.reduce((sum, n) => sum + (n.fakeData?.fakeComments || 0), 0);
  const totalFakeShares = notes.reduce((sum, n) => sum + (n.fakeData?.fakeShares || 0), 0);
  
  // 商品数据统计（剔除刷单影响）
  const productNotes = notes.filter(n => n.type === 'product' && n.salesData);
  const totalSalesAmount = productNotes.reduce((sum, n) => {
    const fakeSales = n.fakeData?.fakeSalesAmount || 0;
    return sum + Math.max(0, (n.salesData?.salesAmount || 0) - fakeSales);
  }, 0);
  const totalSalesVolume = productNotes.reduce((sum, n) => {
    const fakeSalesVol = n.fakeData?.fakeSalesVolume || 0;
    return sum + Math.max(0, (n.salesData?.salesVolume || 0) - fakeSalesVol);
  }, 0);
  const totalPromotionCost = productNotes.reduce((sum, n) => sum + (n.salesData?.promotionCost || 0), 0);
  const overallROI = totalPromotionCost > 0 ? (totalSalesAmount / totalPromotionCost).toFixed(2) : '0.00';
  
  // 刷单销售统计
  const totalFakeSalesAmount = notes.reduce((sum, n) => sum + (n.fakeData?.fakeSalesAmount || 0), 0);
  const totalFakeSalesVolume = notes.reduce((sum, n) => sum + (n.fakeData?.fakeSalesVolume || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">小红书笔记管理</h2>
          <p className="text-muted-foreground text-sm">多账号多店铺管理，记录笔记内容、推广数据和商品销售</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAccountModal(true)}
            className="px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-all text-sm font-medium flex items-center gap-1.5"
          >
            <Users className="h-4 w-4" />
            账号管理
          </button>
          <button
            onClick={() => setShowShopModal(true)}
            className="px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-all text-sm font-medium flex items-center gap-1.5"
          >
            <Store className="h-4 w-4" />
            店铺管理
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            添加笔记
          </button>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">笔记总数</p>
          <p className="text-xl font-bold mt-1">{notes.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">账号数</p>
          <p className="text-xl font-bold mt-1">{accounts.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">店铺数</p>
          <p className="text-xl font-bold mt-1">{shops.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">真实浏览量</p>
          <p className="text-xl font-bold mt-1 text-green-600">{totalViews.toLocaleString()}</p>
          {totalFakeViews > 0 && <p className="text-xs text-orange-500">刷单: {totalFakeViews.toLocaleString()}</p>}
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">真实点赞数</p>
          <p className="text-xl font-bold mt-1 text-green-600">{totalLikes.toLocaleString()}</p>
          {totalFakeLikes > 0 && <p className="text-xs text-orange-500">刷单: {totalFakeLikes.toLocaleString()}</p>}
        </div>
        <div className="bg-card rounded-xl border border-border p-3 bg-primary/5">
          <p className="text-xs text-muted-foreground">真实销售额</p>
          <p className="text-xl font-bold mt-1 text-primary">¥{totalSalesAmount.toLocaleString()}</p>
          {totalFakeSalesAmount > 0 && <p className="text-xs text-orange-500">刷单: ¥{totalFakeSalesAmount.toLocaleString()}</p>}
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">真实销量</p>
          <p className="text-xl font-bold mt-1 text-green-600">{totalSalesVolume}</p>
          {totalFakeSalesVolume > 0 && <p className="text-xs text-orange-500">刷单: {totalFakeSalesVolume}</p>}
        </div>
        <div className="bg-card rounded-xl border border-border p-3 bg-primary/5">
          <p className="text-xs text-muted-foreground">整体ROI</p>
          <p className="text-xl font-bold mt-1 text-primary">{overallROI}</p>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            全部 ({notes.length})
          </button>
          <button
            onClick={() => setFilterType('normal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              filterType === 'normal'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            普通笔记 ({normalCount})
          </button>
          <button
            onClick={() => setFilterType('product')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              filterType === 'product'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package className="h-4 w-4" />
            商品笔记 ({productCount})
          </button>
        </div>

        {/* 账号和店铺筛选 */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterAccountId}
            onChange={(e) => setFilterAccountId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">全部账号</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
          <select
            value={filterShopId}
            onChange={(e) => setFilterShopId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">全部店铺</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 笔记列表 */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => {
            // 使用真实销售数据计算ROI
            const realSalesAmount = Math.max(0, (note.salesData?.salesAmount || 0) - (note.fakeData?.fakeSalesAmount || 0));
            const roi = note.salesData && note.salesData.promotionCost > 0
              ? (realSalesAmount / note.salesData.promotionCost).toFixed(2)
              : null;
            const account = accounts.find(a => a.id === note.accountId);
            const shop = shops.find(s => s.id === note.shopId);
            
            return (
              <div key={note.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        note.type === 'product'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {note.type === 'product' ? '商品笔记' : '普通笔记'}
                      </span>
                      {account && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {account.name}
                        </span>
                      )}
                      {shop && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          {shop.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold line-clamp-1">{note.title}</h3>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => copyNoteInfo(note)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                      title="复制笔记信息"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 图片展示 */}
                {note.images && note.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {note.images.slice(0, 4).map(img => (
                      <img
                        key={img.id}
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                    ))}
                    {note.images.length > 4 && (
                      <div className="w-16 h-16 rounded-lg border border-border bg-secondary flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{note.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}

                {note.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.content}</p>
                )}

                {note.type === 'product' && note.productName && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {note.productName}
                    </span>
                    {note.productLink && (
                      <a
                        href={note.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* 互动数据 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1" title={`真实: ${Math.max(0, note.stats.views - (note.fakeData?.fakeViews || 0))}`}>
                    <Eye className="h-4 w-4" />
                    {note.stats.views.toLocaleString()}
                    {(note.fakeData?.fakeViews || 0) > 0 && <span className="text-xs text-orange-500">(-{note.fakeData?.fakeViews})</span>}
                  </span>
                  <span className="flex items-center gap-1" title={`真实: ${Math.max(0, note.stats.likes - (note.fakeData?.fakeLikes || 0))}`}>
                    <Heart className="h-4 w-4" />
                    {note.stats.likes.toLocaleString()}
                    {(note.fakeData?.fakeLikes || 0) > 0 && <span className="text-xs text-orange-500">(-{note.fakeData?.fakeLikes})</span>}
                  </span>
                  <span className="flex items-center gap-1" title={`真实: ${Math.max(0, note.stats.comments - (note.fakeData?.fakeComments || 0))}`}>
                    <MessageCircle className="h-4 w-4" />
                    {note.stats.comments.toLocaleString()}
                    {(note.fakeData?.fakeComments || 0) > 0 && <span className="text-xs text-orange-500">(-{note.fakeData?.fakeComments})</span>}
                  </span>
                  <span className="flex items-center gap-1" title={`真实: ${Math.max(0, note.stats.shares - (note.fakeData?.fakeShares || 0))}`}>
                    <Share2 className="h-4 w-4" />
                    {note.stats.shares.toLocaleString()}
                    {(note.fakeData?.fakeShares || 0) > 0 && <span className="text-xs text-orange-500">(-{note.fakeData?.fakeShares})</span>}
                  </span>
                </div>

                {/* 商品销售数据 */}
                {note.type === 'product' && note.salesData && (
                  <div className="bg-secondary/50 rounded-lg p-3 mb-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      销售数据（真实）
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">真实销售额</span>
                        <span className="font-medium text-primary">
                          ¥{Math.max(0, note.salesData.salesAmount - (note.fakeData?.fakeSalesAmount || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">真实销量</span>
                        <span className="font-medium text-green-600">
                          {Math.max(0, note.salesData.salesVolume - (note.fakeData?.fakeSalesVolume || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">推广花费</span>
                        <span className="font-medium">¥{note.salesData.promotionCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI</span>
                        <span className={`font-medium ${roi && parseFloat(roi) >= 1 ? 'text-green-600' : 'text-orange-600'}`}>
                          {roi || '-'}
                        </span>
                      </div>
                    </div>
                    {/* 刷单数据 */}
                    {((note.fakeData?.fakeSalesAmount || 0) + (note.fakeData?.fakeSalesVolume || 0) + (note.fakeData?.fakeViews || 0) + (note.fakeData?.fakeLikes || 0)) > 0 && (
                      <div className="border-t border-border pt-2 mt-2">
                        <p className="text-xs text-orange-600 font-medium mb-1">刷单数据</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {(note.fakeData?.fakeViews || 0) > 0 && <span>浏览: {note.fakeData?.fakeViews}</span>}
                          {(note.fakeData?.fakeLikes || 0) > 0 && <span>点赞: {note.fakeData?.fakeLikes}</span>}
                          {(note.fakeData?.fakeComments || 0) > 0 && <span>评论: {note.fakeData?.fakeComments}</span>}
                          {(note.fakeData?.fakeShares || 0) > 0 && <span>分享: {note.fakeData?.fakeShares}</span>}
                          {(note.fakeData?.fakeSalesAmount || 0) > 0 && <span>刷单金额: ¥{note.fakeData?.fakeSalesAmount}</span>}
                          {(note.fakeData?.fakeSalesVolume || 0) > 0 && <span>刷单销量: {note.fakeData?.fakeSalesVolume}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 标签 */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  发布于 {note.publishDate}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">
            {filterType === 'all' ? '暂无笔记，点击"添加笔记"开始记录' : `暂无${filterType === 'normal' ? '普通' : '商品'}笔记`}
          </p>
        </div>
      )}

      {/* 账号管理弹窗 */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                账号管理
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 添加账号 */}
            <div className="space-y-2">
              <input
                type="text"
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                placeholder="账号名称"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                value={accountForm.platform}
                onChange={(e) => setAccountForm({ ...accountForm, platform: e.target.value })}
                placeholder="平台（默认小红书）"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={addAccount}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                添加账号
              </button>
            </div>

            {/* 账号列表 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {accounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.platform}</p>
                  </div>
                  <button
                    onClick={() => deleteAccount(account.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">暂无账号，请先添加</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 店铺管理弹窗 */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Store className="h-5 w-5" />
                店铺管理
              </h3>
              <button
                onClick={() => setShowShopModal(false)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 添加店铺 */}
            <div className="space-y-2">
              <input
                type="text"
                value={shopForm.name}
                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                placeholder="店铺名称"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                value={shopForm.platform}
                onChange={(e) => setShopForm({ ...shopForm, platform: e.target.value })}
                placeholder="平台（默认小红书）"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={addShop}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                添加店铺
              </button>
            </div>

            {/* 店铺列表 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {shops.map(shop => (
                <div key={shop.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">{shop.platform}</p>
                  </div>
                  <button
                    onClick={() => deleteShop(shop.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {shops.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">暂无店铺，请先添加</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 添加/编辑笔记弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg space-y-4 my-8">
            <h3 className="text-lg font-semibold">{editingNote ? '编辑笔记' : '添加笔记'}</h3>
            
            {/* 选择账号 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">选择账号 *</label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">请选择账号</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name} ({account.platform})</option>
                ))}
              </select>
              {accounts.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">请先添加账号</p>
              )}
            </div>

            {/* 笔记类型选择 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">笔记类型 *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'normal' })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    formData.type === 'normal'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  普通笔记
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'product' })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    formData.type === 'product'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  商品笔记
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="笔记标题"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">内容</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="笔记内容..."
                className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 图片上传 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">笔记图片</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="note-image-upload"
              />
              <label
                htmlFor="note-image-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:bg-secondary cursor-pointer transition-colors"
              >
                <ImageIcon className="h-4 w-4" />
                选择图片
              </label>
              {newImages.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {newImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-20 h-20 object-cover rounded-lg border border-border"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 商品信息（仅商品笔记显示） */}
            {formData.type === 'product' && (
              <>
                {/* 选择店铺 */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">关联店铺</label>
                  <select
                    value={formData.shopId}
                    onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">请选择店铺（可选）</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name} ({shop.platform})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">商品名称</label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="关联商品"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">发布日期</label>
                    <input
                      type="date"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">商品链接</label>
                  <input
                    type="url"
                    value={formData.productLink}
                    onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* 销售数据 */}
                <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-primary" />
                    商品销售数据
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">销售金额 (¥)</label>
                      <input
                        type="number"
                        value={formData.salesAmount}
                        onChange={(e) => setFormData({ ...formData, salesAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">销量</label>
                      <input
                        type="number"
                        value={formData.salesVolume}
                        onChange={(e) => setFormData({ ...formData, salesVolume: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">推广花费 (¥)</label>
                      <input
                        type="number"
                        value={formData.promotionCost}
                        onChange={(e) => setFormData({ ...formData, promotionCost: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  {formData.promotionCost > 0 && (
                    <div className="text-xs text-muted-foreground">
                      预计 ROI: <span className={`font-medium ${formData.salesAmount / formData.promotionCost >= 1 ? 'text-green-600' : 'text-orange-600'}`}>
                        {(formData.salesAmount / formData.promotionCost).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 刷单数据 */}
                <div className="bg-orange-50 rounded-lg p-4 space-y-3 border border-orange-200">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-orange-700">
                    <span>⚠️</span>
                    刷单数据（选填）
                  </div>
                  <p className="text-xs text-orange-600">填写刷单数据后，系统会自动从总数据中剔除，显示真实数据</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block text-orange-700">刷浏览量</label>
                      <input
                        type="number"
                        value={formData.fakeViews}
                        onChange={(e) => setFormData({ ...formData, fakeViews: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-orange-300 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-orange-700">刷点赞数</label>
                      <input
                        type="number"
                        value={formData.fakeLikes}
                        onChange={(e) => setFormData({ ...formData, fakeLikes: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-orange-300 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-orange-700">刷评论数</label>
                      <input
                        type="number"
                        value={formData.fakeComments}
                        onChange={(e) => setFormData({ ...formData, fakeComments: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-orange-300 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-orange-700">刷分享数</label>
                      <input
                        type="number"
                        value={formData.fakeShares}
                        onChange={(e) => setFormData({ ...formData, fakeShares: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-orange-300 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-orange-700">刷单金额 (¥)</label>
                      <input
                        type="number"
                        value={formData.fakeSalesAmount}
                        onChange={(e) => setFormData({ ...formData, fakeSalesAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-orange-300 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-orange-700">刷单销量</label>
                      <input
                        type="number"
                        value={formData.fakeSalesVolume}
                        onChange={(e) => setFormData({ ...formData, fakeSalesVolume: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-orange-300 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {formData.type === 'normal' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">发布日期</label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">浏览</label>
                <input
                  type="number"
                  value={formData.views}
                  onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">点赞</label>
                <input
                  type="number"
                  value={formData.likes}
                  onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">评论</label>
                <input
                  type="number"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">分享</label>
                <input
                  type="number"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">标签（逗号分隔）</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="标签1, 标签2, 标签3"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={saveNote}
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
