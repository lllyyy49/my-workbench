'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Copy, Check, AlertCircle, Image as ImageIcon, X } from 'lucide-react';

interface ReviewTemplate {
  id: string;
  text: string;
  images: ReviewImage[];
  category: string;
  usedCount: number;
  lastUsed: number | null;
  createdAt: number;
}

interface ReviewImage {
  id: string;
  dataUrl: string;
  hash: string;
  name: string;
}

export function ReviewTemplates() {
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newImages, setNewImages] = useState<ReviewImage[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('review-templates');
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('review-templates', JSON.stringify(templates));
  }, [templates]);

  // 计算文件hash（使用简单的文件内容hash）
  const calculateFileHash = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // 简单的hash：使用文件内容的部分字符
        const hash = btoa(result.slice(0, 1000) + file.size + file.lastModified);
        resolve(hash);
      };
      reader.readAsDataURL(file);
    });
  };

  // 检查文字是否重复
  const checkTextDuplicate = (text: string): ReviewTemplate | null => {
    const normalizedText = text.trim().toLowerCase();
    return templates.find(t => t.text.trim().toLowerCase() === normalizedText) || null;
  };

  // 检查图片是否重复
  const checkImageDuplicate = (hash: string): ReviewTemplate | null => {
    return templates.find(t => t.images.some(img => img.hash === hash)) || null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const warnings: string[] = [];
    const images: ReviewImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const hash = await calculateFileHash(file);
      
      // 检查是否重复
      const duplicateTemplate = checkImageDuplicate(hash);
      if (duplicateTemplate) {
        warnings.push(`图片 "${file.name}" 已在评价 "${duplicateTemplate.text.slice(0, 20)}..." 中使用过`);
        continue;
      }

      // 检查当前待添加的图片中是否重复
      if (images.some(img => img.hash === hash)) {
        warnings.push(`图片 "${file.name}" 与已选择的图片重复`);
        continue;
      }

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      images.push({
        id: Date.now().toString() + i,
        dataUrl,
        hash,
        name: file.name,
      });
    }

    if (warnings.length > 0) {
      setDuplicateWarning(warnings.join('\n'));
    } else {
      setDuplicateWarning('');
    }

    setNewImages([...newImages, ...images]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId: string) => {
    setNewImages(newImages.filter(img => img.id !== imageId));
  };

  const addTemplate = () => {
    if (!newText.trim()) return;

    // 检查文字重复
    const duplicateText = checkTextDuplicate(newText);
    if (duplicateText) {
      setDuplicateWarning(`文字内容与已有评价 "${duplicateText.text.slice(0, 20)}..." 重复`);
      return;
    }

    const template: ReviewTemplate = {
      id: Date.now().toString(),
      text: newText.trim(),
      images: newImages,
      category: newCategory.trim() || '未分类',
      usedCount: 0,
      lastUsed: null,
      createdAt: Date.now(),
    };

    setTemplates([template, ...templates]);
    setNewText('');
    setNewCategory('');
    setNewImages([]);
    setDuplicateWarning('');
    setShowAddModal(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const copyTemplate = async (template: ReviewTemplate) => {
    // 复制文字
    await navigator.clipboard.writeText(template.text);
    
    // 更新使用次数
    setTemplates(templates.map(t => t.id === template.id ? {
      ...t,
      usedCount: t.usedCount + 1,
      lastUsed: Date.now(),
    } : t));

    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">商品评价库</h2>
          <p className="text-muted-foreground text-sm">管理评价模板，自动识别重复内容</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          添加评价
        </button>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">评价总数</p>
          <p className="text-2xl font-bold mt-1">{templates.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">分类数量</p>
          <p className="text-2xl font-bold mt-1">{categories.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">总使用次数</p>
          <p className="text-2xl font-bold mt-1">{templates.reduce((sum, t) => sum + t.usedCount, 0)}</p>
        </div>
      </div>

      {/* 评价列表 */}
      {templates.length > 0 ? (
        <div className="space-y-4">
          {categories.map(category => {
            const categoryTemplates = templates.filter(t => t.category === category);
            if (categoryTemplates.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
                <div className="space-y-3">
                  {categoryTemplates.map(template => (
                    <div key={template.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{template.text}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => copyTemplate(template)}
                            className={`p-1.5 rounded transition-all ${
                              copiedId === template.id
                                ? 'bg-green-100 text-green-600'
                                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                            title="复制评价文字"
                          >
                            {copiedId === template.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 图片 */}
                      {template.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {template.images.map(img => (
                            <div key={img.id} className="relative group">
                              <img
                                src={img.dataUrl}
                                alt={img.name}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <button
                                  onClick={async () => {
                                    const response = await fetch(img.dataUrl);
                                    const blob = await response.blob();
                                    await navigator.clipboard.write([
                                      new ClipboardItem({ 'image/png': blob })
                                    ]);
                                  }}
                                  className="p-1 rounded bg-white/20 text-white hover:bg-white/30"
                                  title="复制图片"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>已使用 {template.usedCount} 次</span>
                        {template.lastUsed && (
                          <span>上次使用: {new Date(template.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">暂无评价模板，点击"添加评价"开始创建</p>
        </div>
      )}

      {/* 添加评价弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg space-y-4 my-8">
            <h3 className="text-lg font-semibold">添加评价模板</h3>

            {/* 重复警告 */}
            {duplicateWarning && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 whitespace-pre-line">{duplicateWarning}</div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">评价内容 *</label>
              <textarea
                value={newText}
                onChange={(e) => {
                  setNewText(e.target.value);
                  setDuplicateWarning('');
                }}
                onBlur={() => {
                  if (newText.trim()) {
                    const dup = checkTextDuplicate(newText);
                    if (dup) {
                      setDuplicateWarning(`文字内容与已有评价 "${dup.text.slice(0, 20)}..." 重复`);
                    }
                  }
                }}
                placeholder="输入评价内容..."
                className="w-full h-32 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">分类</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="如：医疗器械、保健品等"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                配图（自动检测重复）
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
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
                      <p className="text-xs text-muted-foreground mt-1 truncate w-20">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewText('');
                  setNewCategory('');
                  setNewImages([]);
                  setDuplicateWarning('');
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-all font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={addTemplate}
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
