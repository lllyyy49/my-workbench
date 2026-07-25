'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Database,
  Search,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Bell,
  Moon,
  Sun,
} from 'lucide-react';
import { exportAllData, importAllData, getStorageSize } from '@/lib/data-backup';
import { requestNotificationPermission } from '@/lib/notifications';
import { useDarkMode } from '@/hooks/use-dark-mode';

interface GlobalSearchResult {
  module: string;
  title: string;
  content: string;
  icon: string;
}

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'backup' | 'search' | 'appearance'>('backup');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('denied');
  const { isDark, toggle: toggleDark } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageSize = getStorageSize();

  // 获取通知权限状态（客户端）
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // 全局搜索
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: GlobalSearchResult[] = [];
    const q = query.toLowerCase();

    // 搜索待办
    try {
      const todos = JSON.parse(localStorage.getItem('todos') || '[]');
      todos.forEach((t: { text?: string; category?: string }) => {
        if (t.text?.toLowerCase().includes(q)) {
          results.push({
            module: '待办事项',
            title: t.text || '',
            content: t.category || '',
            icon: '✓',
          });
        }
      });
    } catch {}

    // 搜索笔记
    try {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      notes.forEach((n: { title?: string; content?: string }) => {
        if (
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
        ) {
          results.push({
            module: '快速记事',
            title: n.title || '无标题',
            content: (n.content || '').substring(0, 100),
            icon: '📝',
          });
        }
      });
    } catch {}

    // 搜索小红书笔记
    try {
      const xhs = JSON.parse(localStorage.getItem('xiaohongshu-notes') || '[]');
      xhs.forEach((n: { title?: string; content?: string; account?: string }) => {
        if (
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
        ) {
          results.push({
            module: '小红书',
            title: n.title || '无标题',
            content: `${n.account || ''} - ${(n.content || '').substring(0, 80)}`,
            icon: '',
          });
        }
      });
    } catch {}

    // 搜索评价
    try {
      const reviews = JSON.parse(
        localStorage.getItem('review-templates') || '[]'
      );
      reviews.forEach((r: { text?: string; category?: string }) => {
        if (r.text?.toLowerCase().includes(q)) {
          results.push({
            module: '评价库',
            title: r.category || '评价',
            content: (r.text || '').substring(0, 100),
            icon: '⭐',
          });
        }
      });
    } catch {}

    // 搜索爆文
    try {
      const articles = JSON.parse(
        localStorage.getItem('viral-articles') || '[]'
      );
      articles.forEach((a: { title?: string; content?: string; source?: string }) => {
        if (
          a.title?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q)
        ) {
          results.push({
            module: '爆文库',
            title: a.title || '无标题',
            content: `${a.source || ''} - ${(a.content || '').substring(0, 80)}`,
            icon: '🔥',
          });
        }
      });
    } catch {}

    // 搜索读书
    try {
      const books = JSON.parse(localStorage.getItem('reading-books') || '[]');
      books.forEach((b: { title?: string; author?: string; notes?: string }) => {
        if (
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.notes?.toLowerCase().includes(q)
        ) {
          results.push({
            module: '读书学习',
            title: b.title || '无标题',
            content: `${b.author || ''} - ${(b.notes || '').substring(0, 80)}`,
            icon: '📚',
          });
        }
      });
    } catch {}

    // 搜索电影
    try {
      const movies = JSON.parse(localStorage.getItem('movies') || '[]');
      movies.forEach((m: { title?: string; review?: string; quote?: string }) => {
        if (
          m.title?.toLowerCase().includes(q) ||
          m.review?.toLowerCase().includes(q) ||
          m.quote?.toLowerCase().includes(q)
        ) {
          results.push({
            module: '电影影评',
            title: m.title || '无标题',
            content: (m.review || m.quote || '').substring(0, 100),
            icon: '',
          });
        }
      });
    } catch {}

    // 搜索工作日志
    try {
      const logs = JSON.parse(localStorage.getItem('work-logs') || '[]');
      logs.forEach((l: { date?: string; tasks?: Array<{ text?: string }> }) => {
        l.tasks?.forEach((task) => {
          if (task.text?.toLowerCase().includes(q)) {
            results.push({
              module: '工作日志',
              title: l.date || '未知日期',
              content: task.text,
              icon: '📋',
            });
          }
        });
      });
    } catch {}

    setSearchResults(results);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importAllData(file);
    setImportStatus({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
    if (result.success) {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">设置中心</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'backup'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="w-4 h-4 inline mr-1.5" />
            数据管理
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'appearance'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sun className="w-4 h-4 inline mr-1.5" />
            外观设置
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4 inline mr-1.5" />
            全局搜索
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* Storage Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Database className="w-4 h-4" />
                  <span>本地存储已用：</span>
                  <span className="font-semibold text-gray-800">{storageSize}</span>
                </div>
              </div>

              {/* Notification Permission */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  消息通知
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  开启后，备忘录到时间时会在桌面弹出提醒
                </p>
                {notifPermission === 'granted' ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    通知已开启
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const permission = await requestNotificationPermission();
                      setNotifPermission(permission);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Bell className="w-4 h-4" />
                    开启通知
                  </button>
                )}
              </div>

              {/* Export */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">导出备份</h3>
                <p className="text-sm text-gray-500 mb-3">
                  将所有数据导出为 JSON 文件，可用于备份或迁移
                </p>
                <button
                  onClick={exportAllData}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  导出数据
                </button>
              </div>

              {/* Import */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-2">导入恢复</h3>
                <p className="text-sm text-gray-500 mb-3">
                  从备份文件恢复数据（将覆盖当前数据）
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  选择备份文件
                </button>
                {importStatus && (
                  <div
                    className={`mt-3 flex items-center gap-2 text-sm ${
                      importStatus.type === 'success'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {importStatus.type === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {importStatus.message}
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  使用提示
                </h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 建议定期导出备份，防止数据丢失</li>
                  <li>• 导入会覆盖当前所有数据，请谨慎操作</li>
                  <li>• 清除浏览器缓存会导致数据丢失</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">深色模式</h4>
                    <p className="text-sm text-gray-500 mt-1">切换浅色/深色主题</p>
                  </div>
                  <button
                    onClick={toggleDark}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Theme Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2">主题说明</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 浅色模式：温暖米白底色，适合白天使用</li>
                  <li>• 深色模式：深色背景，适合夜间使用，减少眼睛疲劳</li>
                  <li>• 设置会自动保存，下次打开时保持上次的选择</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索所有内容..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>

              {searchResults.length > 0 && (
                <p className="text-sm text-gray-500">
                  找到 {searchResults.length} 条结果
                </p>
              )}

              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{result.icon}</span>
                      <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">
                        {result.module}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 text-sm">
                      {result.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {result.content}
                    </p>
                  </div>
                ))}
              </div>

              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">没有找到相关内容</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
