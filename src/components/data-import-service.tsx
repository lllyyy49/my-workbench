'use client';

import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Globe, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// 预设的病症数据模板
const DISEASE_TEMPLATES = [
  {
    department: '骨科',
    diseaseName: '颈椎病',
    targetGroup: '上班族、中老年人',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '颈部疼痛、僵硬、头晕、手臂麻木',
    treatmentTypes: ['膏药', '贴剂', '凝胶'],
    xiaohongshuHeat: 8500,
    productSuggestions: '颈椎牵引器、护颈枕、远红外膏药',
  },
  {
    department: '骨科',
    diseaseName: '腰椎间盘突出',
    targetGroup: '中老年人、体力劳动者',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '腰部疼痛、下肢放射痛、活动受限',
    treatmentTypes: ['膏药', '敷贴', '口服液'],
    xiaohongshuHeat: 7200,
    productSuggestions: '腰托、热敷包、活血膏药',
  },
  {
    department: '皮肤科',
    diseaseName: '湿疹',
    targetGroup: '儿童、过敏体质人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6],
    symptoms: '皮肤红斑、丘疹、瘙痒、渗出',
    treatmentTypes: ['软膏', '凝胶', '口服液'],
    xiaohongshuHeat: 9200,
    productSuggestions: '保湿霜、抗过敏药、中药膏',
  },
  {
    department: '皮肤科',
    diseaseName: '荨麻疹',
    targetGroup: '过敏体质人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '风团、瘙痒、皮肤红肿',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 6800,
    productSuggestions: '抗组胺药、维生素C、中药调理',
  },
  {
    department: '呼吸内科',
    diseaseName: '感冒',
    targetGroup: '全人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '流涕、咳嗽、发热、头痛',
    treatmentTypes: ['口服液', '胶囊', '片剂', '喷剂'],
    xiaohongshuHeat: 15000,
    productSuggestions: '感冒灵、维C银翘片、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '过敏性鼻炎',
    targetGroup: '过敏体质人群、儿童',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '鼻塞、流涕、打喷嚏、鼻痒',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 8900,
    productSuggestions: '鼻喷剂、空气净化器、口罩',
  },
  {
    department: '消化内科',
    diseaseName: '胃炎',
    targetGroup: '上班族、饮食不规律人群',
    season: ['冬季', '夏季'],
    months: [1, 2, 7, 8, 12],
    symptoms: '胃痛、胃胀、反酸、恶心',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 7500,
    productSuggestions: '养胃茶、益生菌、胃药',
  },
  {
    department: '妇科',
    diseaseName: '痛经',
    targetGroup: '年轻女性',
    season: ['冬季', '秋季'],
    months: [1, 2, 9, 10, 11, 12],
    symptoms: '下腹疼痛、腰酸、恶心',
    treatmentTypes: ['口服液', '胶囊', '贴剂'],
    xiaohongshuHeat: 11000,
    productSuggestions: '暖宫贴、红糖姜茶、止痛药',
  },
];

interface DataImportServiceProps {
  onImport: (data: any[]) => void;
}

export function DataImportService({ onImport }: DataImportServiceProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // 从 Excel/CSV 文件导入
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const results: ImportResult = { success: 0, failed: 0, errors: [] };
      const importedData: any[] = [];

      jsonData.forEach((row: any, index) => {
        try {
          // 映射字段
          const item = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            department: row['科室'] || row['department'] || '',
            diseaseName: row['病症名称'] || row['diseaseName'] || row['病症'] || '',
            targetGroup: row['好发人群'] || row['targetGroup'] || '',
            season: parseArrayField(row['好发季节'] || row['season']),
            months: parseNumberArrayField(row['好发月份'] || row['months']),
            symptoms: row['症状'] || row['symptoms'] || '',
            treatmentTypes: parseArrayField(row['药物类型'] || row['treatmentTypes'] || row['对症药物']),
            xiaohongshuHeat: parseInt(row['小红书热度'] || row['xiaohongshuHeat'] || row['热度'] || '0'),
            productSuggestions: row['商品建议'] || row['productSuggestions'] || '',
            notes: row['备注'] || row['notes'] || '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          if (item.diseaseName && item.department) {
            importedData.push(item);
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`第${index + 1}行：缺少病症名称或科室`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`第${index + 1}行：解析错误`);
        }
      });

      onImport(importedData);
      setImportResult(results);
    } catch (error) {
      console.error('文件导入错误:', error);
      setImportResult({ success: 0, failed: 0, errors: ['文件解析失败，请检查文件格式'] });
    }

    e.target.value = '';
  };

  // 从剪贴板粘贴导入
  const handlePasteImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        alert('剪贴板为空');
        return;
      }

      // 尝试解析为 JSON
      try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
          onImport(jsonData);
          setImportResult({ success: jsonData.length, failed: 0, errors: [] });
          return;
        }
      } catch {
        // 不是 JSON，尝试解析为 TSV（制表符分隔）
      }

      // 解析 TSV 格式
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        alert('数据格式不正确，至少需要标题行和一行数据');
        return;
      }

      const headers = lines[0].split('\t').map(h => h.trim());
      const results: ImportResult = { success: 0, failed: 0, errors: [] };
      const importedData: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        try {
          const item = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            department: row['科室'] || '',
            diseaseName: row['病症名称'] || row['病症'] || '',
            targetGroup: row['好发人群'] || '',
            season: parseArrayField(row['好发季节']),
            months: parseNumberArrayField(row['好发月份']),
            symptoms: row['症状'] || '',
            treatmentTypes: parseArrayField(row['药物类型'] || row['对症药物']),
            xiaohongshuHeat: parseInt(row['小红书热度'] || row['热度'] || '0'),
            productSuggestions: row['商品建议'] || '',
            notes: row['备注'] || '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          if (item.diseaseName && item.department) {
            importedData.push(item);
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`第${i}行：缺少病症名称或科室`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`第${i}行：解析错误`);
        }
      }

      onImport(importedData);
      setImportResult(results);
    } catch (error) {
      console.error('粘贴导入错误:', error);
      alert('无法读取剪贴板内容');
    }
  };

  // 使用预设模板快速添加
  const handleTemplateImport = () => {
    const templates = DISEASE_TEMPLATES.map(t => ({
      ...t,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    onImport(templates);
    setImportResult({ success: templates.length, failed: 0, errors: [] });
  };

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '科室': '骨科',
        '病症名称': '颈椎病',
        '好发人群': '上班族、中老年人',
        '好发季节': '春季,秋季',
        '好发月份': '3,4,9,10',
        '症状': '颈部疼痛、僵硬、头晕',
        '药物类型': '膏药,贴剂,凝胶',
        '小红书热度': '8500',
        '商品建议': '颈椎牵引器、护颈枕',
        '备注': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '病症趋势模板');
    XLSX.writeFile(wb, '病症趋势导入模板.xlsx');
  };

  return (
    <>
      <button
        onClick={() => { setShowImportModal(true); setImportResult(null); }}
        className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
      >
        <Upload className="h-4 w-4" />
        数据导入
      </button>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg space-y-4 my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">数据导入</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {importResult && (
                <div className={`p-3 rounded-lg flex items-start gap-2 ${importResult.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  {importResult.failed === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">
                      导入完成：成功 {importResult.success} 条，失败 {importResult.failed} 条
                    </p>
                    {importResult.errors.length > 0 && (
                      <ul className="mt-1 text-xs list-disc list-inside">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">方式一：从文件导入</label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer">
                      <FileSpreadsheet className="h-5 w-5" />
                      <span className="text-sm">选择 Excel/CSV 文件</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors text-sm flex items-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      下载模板
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">方式二：从剪贴板粘贴</label>
                  <button
                    onClick={handlePasteImport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-sm">粘贴数据（支持 JSON/TSV 格式）</span>
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">方式三：使用预设模板</label>
                  <button
                    onClick={handleTemplateImport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm">快速添加 8 个常见病症模板</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  提示：支持从 Excel、CSV、JSON、TSV 等多种格式导入数据。
                  也可以从其他平台复制数据后粘贴导入。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 辅助函数：解析数组字段
function parseArrayField(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(/[,，、]/).map(s => s.trim()).filter(s => s);
}

// 辅助函数：解析数字数组字段
function parseNumberArrayField(value: any): number[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(/[,，、]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}
