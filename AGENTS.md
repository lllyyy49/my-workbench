# AGENTS.md - 李月的工作台

## 项目概览

个人效率工具平台，包含待办事项管理、日程日历、快速记事、数据统计面板、每日工作日志、小红书笔记管理、商品评价库、学习区域。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **数据存储**: localStorage（客户端持久化）

## 目录结构

```
src/
├── app/
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 主页（Tab 切换）
│   ├── globals.css         # 全局样式 & CSS 变量
│   └── robots.ts           # SEO 配置
├── components/
│   ├── ui/                 # shadcn/ui 组件库
│   ├── navbar.tsx          # 导航栏（桌面顶部 + 移动端底部）
│   ├── dashboard.tsx       # 数据统计面板
│   ├── daily-work-log.tsx  # 每日工作日志
│   ├── xiaohongshu-notes.tsx # 小红书笔记管理
│   ├── review-templates.tsx  # 商品评价库（文字/图片去重）
│   ├── learning-area.tsx   # 学习区域（分类、资源、笔记、思考）
│   ├── todo-list.tsx       # 待办事项管理
│   ├── calendar-view.tsx   # 日程日历视图
│   └── quick-notes.tsx     # 快速记事本
├── hooks/                  # 自定义 Hooks
├── lib/                    # 工具库
└── server.ts               # 自定义服务端入口
```

## 功能模块

1. **工作台 (Dashboard)** - 数据统计面板，展示今日工作进度、待办完成率、小红书数据、评价库使用统计
2. **工作日志 (WorkLog)** - 每日工作内容记录、完成情况追踪、日复盘总结
3. **小红书笔记 (Xiaohongshu)** - 笔记内容管理（普通笔记/商品笔记）、图片上传、商品链接、推广数据统计
4. **评价库 (Reviews)** - 商品评价模板管理，自动识别文字/图片重复，一键复制评价和图片
5. **学习区域 (Learning)** - 学习分类管理、资源管理（支持百度网盘等链接）、学习笔记、思考与转化
6. **待办事项 (Todos)** - 增删改查、标记完成、编辑
7. **日程日历 (Calendar)** - 月视图日历、添加/删除日程、颜色标记
8. **快速记事 (Notes)** - 创建/编辑/删除笔记、搜索、自动保存

## 数据持久化

所有数据存储在浏览器 localStorage 中：
- `todos` - 待办事项列表
- `calendar-events` - 日程事件
- `notes` - 笔记列表
- `work-logs` - 每日工作日志
- `xiaohongshu-notes` - 小红书笔记（含图片base64）
- `review-templates` - 商品评价模板（含图片base64）
- `learning-categories` - 学习分类
- `learning-resources` - 学习资源（含笔记和思考）

## 特色功能

### 评价库去重机制
- **文字去重**：添加评价时自动检测文字内容是否已存在
- **图片去重**：通过计算文件哈希值判断图片是否重复使用
- **一键复制**：支持复制评价文字和图片到剪贴板

### 小红书笔记分类
- **普通笔记**：日常内容分享
- **商品笔记**：关联商品名称和链接
- **图片支持**：可上传多张图片

### 学习区域
- **分类管理**：自定义学习分类（英语、视频剪辑、AI学习、数据分析等）
- **资源管理**：支持百度网盘、B站等链接，可直接跳转
- **学习笔记**：为每个学习资源记录笔记
- **思考与转化**：记录思考、实践计划、学习总结

## 设计规范

详见 `DESIGN.md`。核心风格：温暖米白底色 + 琥珀色强调色 + 卡片式布局 + 响应式设计。

## 开发命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm ts-check` - TypeScript 类型检查
- `pnpm lint` - ESLint 检查
