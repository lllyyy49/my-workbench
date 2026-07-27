'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Copy, Check, AlertCircle, Image as ImageIcon, X, Upload, FileText, Clipboard, CheckSquare, Square, RotateCcw, RotateCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { useSyncedData } from '@/hooks/use-synced-data';

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
  const { data: templates, loading, sync } = useSyncedData<ReviewTemplate>('review_templates', 'review-templates');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newImages, setNewImages] = useState<ReviewImage[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 云同步自动处理

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

  // 通用图片处理函数（支持拖拽、粘贴、选择）
  const processImageFiles = async (files: File[]) => {
    const warnings: string[] = [];
    const images: ReviewImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        warnings.push(`"${file.name}" 不是图片文件`);
        continue;
      }
      const hash = await calculateFileHash(file);
      
      const duplicateTemplate = checkImageDuplicate(hash);
      if (duplicateTemplate) {
        warnings.push(`图片 "${file.name}" 已在评价 "${duplicateTemplate.text.slice(0, 20)}..." 中使用过`);
        continue;
      }

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

  // 拖拽上传处理
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processImageFiles(files);
  };

  // 粘贴上传处理
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) processImageFiles(files);
  };

  const removeImage = (imageId: string) => {
    setNewImages(newImages.filter(img => img.id !== imageId));
  };

  // 文件导入处理（Excel/Word/WPS）- 支持多文件批量导入
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allTexts: string[] = [];

    try {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        const fileName = file.name.toLowerCase();
        let content = '';

        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          // 解析 Excel 文件
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
          
          // 提取所有非空单元格内容
          jsonData.forEach(row => {
            row.forEach(cell => {
              if (cell && String(cell).trim()) {
                allTexts.push(String(cell).trim());
              }
            });
          });
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
          // 解析 Word 文件
          const data = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: data });
          content = result.value;
          const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
          allTexts.push(...paragraphs);
        } else if (fileName.endsWith('.txt')) {
          // 解析文本文件
          content = await file.text();
          const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
          allTexts.push(...paragraphs);
        } else {
          alert(`不支持的文件格式：${file.name}，请上传 Excel(.xlsx/.xls)、Word(.docx/.doc) 或文本(.txt) 文件`);
          continue;
        }
      }

      if (allTexts.length > 0) {
        // 批量添加评价
        const newTemplates: ReviewTemplate[] = [];
        for (const text of allTexts) {
          // 检查是否重复
          const duplicate = checkTextDuplicate(text);
          if (!duplicate) {
            newTemplates.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              text: text,
              images: [],
              category: newCategory.trim() || '未分类',
              usedCount: 0,
              lastUsed: null,
              createdAt: Date.now(),
            });
          }
        }
        
        if (newTemplates.length > 0) {
          await sync([...newTemplates, ...templates]);
          alert(`成功导入 ${newTemplates.length} 条评价`);
        } else {
          alert('所有评价内容均已存在，无需重复添加');
        }
        setDuplicateWarning('');
      } else {
        alert('文件中没有找到有效的文本内容');
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
        setNewText(text.trim());
        setDuplicateWarning('');
      }
    } catch (error) {
      console.error('粘贴失败:', error);
      alert('无法读取剪贴板内容，请手动粘贴');
    }
  };

  const addTemplate = async () => {
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

    await sync([...templates, template]);
    setNewText('');
    setNewCategory('');
    setNewImages([]);
    setDuplicateWarning('');
    setShowAddModal(false);
  };

  const deleteTemplate = async (id: string) => {
    await sync(templates.filter(t => t.id !== id));
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

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === templates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(templates.map(t => t.id)));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 条评价吗？`)) {
      await sync(templates.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
      setIsBatchMode(false);
    }
  };

  // 退出批量模式
  const exitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedIds(new Set());
  };

  const copyTemplate = async (template: ReviewTemplate) => {
    // 复制文字
    await navigator.clipboard.writeText(template.text);
    
    // 更新使用次数
    await sync(templates.map(t => t.id === template.id ? {
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
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-semibold mb-2">商品评价库</h2>
            <p className="text-muted-foreground text-sm">管理评价模板，自动识别重复内容</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isBatchMode ? (
            <>
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
              >
                {selectedIds.size === templates.length ? (
                  <>
                    <Square className="h-4 w-4" />
                    取消全选
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    全选
                  </>
                )}
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedIds.size === 0}
                className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                删除 ({selectedIds.size})
              </button>
              <button
                onClick={exitBatchMode}
                className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all text-sm font-medium"
              >
                取消
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsBatchMode(true)}
                className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
              >
                <CheckSquare className="h-4 w-4" />
                批量管理
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                添加评价
              </button>
            </>
          )}
        </div>
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
                    <div key={template.id} className={`bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-all ${isBatchMode && selectedIds.has(template.id) ? 'ring-2 ring-primary' : ''}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        {isBatchMode && (
                          <button
                            onClick={() => toggleSelect(template.id)}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {selectedIds.has(template.id) ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        )}
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
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">添加评价模板</h3>

            {/* 重复警告 */}
            {duplicateWarning && (
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-teal-800 whitespace-pre-line">{duplicateWarning}</div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">评价内容 *</label>
              
              {/* 文件导入和粘贴按钮 */}
              <div className="flex gap-2 mb-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer text-sm">
                  <Upload className="h-4 w-4" />
                  <span>批量导入</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.docx,.doc,.txt"
                    multiple
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleTextPaste}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
                >
                  <Clipboard className="h-4 w-4" />
                  <span>一键粘贴</span>
                </button>
                <span className="flex items-center text-xs text-muted-foreground">
                  支持多文件批量导入
                </span>
              </div>
              
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
                placeholder="输入评价内容，或从文件导入/粘贴..."
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
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  if (files.length === 0) {
                    alert('请拖入图片文件');
                    return;
                  }
                  files.forEach(file => {
                    if (file.size > 5 * 1024 * 1024) {
                      alert(`文件 ${file.name} 超过 5MB，已跳过`);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      const hash = btoa(dataUrl).slice(0, 32);
                      setNewImages(prev => [...prev, { id: Date.now().toString() + Math.random(), name: file.name, dataUrl, hash }]);
                    };
                    reader.readAsDataURL(file);
                  });
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors bg-muted/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    拖拽图片到此处，或 <label htmlFor="image-upload" className="text-primary cursor-pointer hover:underline">点击选择</label>
                  </p>
                  <p className="text-xs text-muted-foreground">支持粘贴图片（Ctrl+V）</p>
                </div>
              </div>
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
