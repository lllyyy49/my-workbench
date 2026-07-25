// 数据备份与恢复工具

const STORAGE_KEYS = [
  'todos',
  'calendar-events',
  'notes',
  'work-logs',
  'xiaohongshu-notes',
  'review-templates',
  'learning-categories',
  'learning-resources',
  'expenses',
  'viral-articles',
  'content-reviews',
  'disease-trends',
  'reading-books',
  'movies',
  'memo-reminders',
  'character-image',
  'user-avatar',
  'app-password',
  'nav-tabs-order',
];

export interface BackupData {
  version: string;
  exportDate: string;
  data: Record<string, unknown>;
}

// 导出所有数据
export function exportAllData(): void {
  const backup: BackupData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: {},
  };

  STORAGE_KEYS.forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        backup.data[key] = JSON.parse(value);
      }
    } catch {
      // 忽略解析错误
    }
  });

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `工作台备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// 导入数据
export function importAllData(
  file: File
): Promise<{ success: boolean; message: string; count: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string) as BackupData;

        if (!backup.data || typeof backup.data !== 'object') {
          resolve({ success: false, message: '无效的备份文件', count: 0 });
          return;
        }

        let count = 0;
        Object.entries(backup.data).forEach(([key, value]) => {
          if (STORAGE_KEYS.includes(key)) {
            localStorage.setItem(key, JSON.stringify(value));
            count++;
          }
        });

        resolve({
          success: true,
          message: `成功恢复 ${count} 项数据`,
          count,
        });
      } catch {
        resolve({ success: false, message: '文件解析失败', count: 0 });
      }
    };
    reader.readAsText(file);
  });
}

// 清除所有数据
export function clearAllData(): void {
  STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}

// 获取存储大小
export function getStorageSize(): string {
  let total = 0;
  STORAGE_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      total += value.length;
    }
  });
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}
