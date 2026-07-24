'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, ExternalLink, Eye, Heart, MessageCircle, Share2, Check, X, Copy, Image as ImageIcon, Package, FileText } from 'lucide-react';

interface NoteImage {
  id: string;
  dataUrl: string;
  name: string;
}

interface XiaohongshuNote {
  id: string;
  title: string;
  content: string;
  type: 'normal' | 'product'; // 普通笔记 / 商品笔记
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
  tags: string[];
  createdAt: number;
}

export function XiaohongshuNotes() {
  const [notes, setNotes] = useState<XiaohongshuNote[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<XiaohongshuNote | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'product'>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'normal' as 'normal' | 'product',
    productLink: '',
    productName: '',
    publishDate: '',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    tags: '',
  });
  const [newImages, setNewImages] = useState<NoteImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('xiaohongshu-notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('xiaohongshu-notes', JSON.stringify(notes));
  }, [notes]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'normal',
      productLink: '',
      productName: '',
      publishDate: '',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
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
      productLink: note.productLink,
      productName: note.productName,
      publishDate: note.publishDate,
      views: note.stats.views,
      likes: note.stats.likes,
      comments: note.stats.comments,
      shares: note.stats.shares,
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
    
    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? {
        ...n,
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
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
        tags,
      } : n));
    } else {
      const newNote: XiaohongshuNote = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
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
    let text = `标题：${note.title}\n内容：${note.content}`;
    if (note.type === 'product') {
      text += `\n商品：${note.productName}\n链接：${note.productLink}`;
    }
    text += `\n标签：${note.tags.map(t => '#' + t).join(' ')}`;
    navigator.clipboard.writeText(text);
  };

  const filteredNotes = filterType === 'all' ? notes : notes.filter(n => n.type === filterType);
  const normalCount = notes.filter(n => n.type === 'normal').length;
  const productCount = notes.filter(n => n.type === 'product').length;
  const totalViews = notes.reduce((sum, n) => sum + n.stats.views, 0);
  const totalLikes = notes.reduce((sum, n) => sum + n.stats.likes, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">小红书笔记管理</h2>
          <p className="text-muted-foreground text-sm">记录笔记内容和推广数据</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          添加笔记
        </button>
      </div>

      {/* 数据统计 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">笔记总数</p>
          <p className="text-2xl font-bold mt-1">{notes.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">普通笔记</p>
          <p className="text-2xl font-bold mt-1">{normalCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">商品笔记</p>
          <p className="text-2xl font-bold mt-1">{productCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">总浏览量</p>
          <p className="text-2xl font-bold mt-1">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">总点赞数</p>
          <p className="text-2xl font-bold mt-1">{totalLikes.toLocaleString()}</p>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2">
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

      {/* 笔记列表 */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      note.type === 'product'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {note.type === 'product' ? '商品笔记' : '普通笔记'}
                    </span>
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

              {/* 数据统计 */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {note.stats.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {note.stats.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {note.stats.comments.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  {note.stats.shares.toLocaleString()}
                </span>
              </div>

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
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">
            {filterType === 'all' ? '暂无笔记，点击"添加笔记"开始记录' : `暂无${filterType === 'normal' ? '普通' : '商品'}笔记`}
          </p>
        </div>
      )}

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg space-y-4 my-8">
            <h3 className="text-lg font-semibold">{editingNote ? '编辑笔记' : '添加笔记'}</h3>
            
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
