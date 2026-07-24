# AGENTS.md - 李月的工作台

## 项目概览

个人效率工具平台，包含待办事项管理、日程日历、快速记事和数据统计面板。

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
│   ├── todo-list.tsx       # 待办事项管理
│   ├── calendar-view.tsx   # 日程日历视图
│   └── quick-notes.tsx     # 快速记事本
├── hooks/                  # 自定义 Hooks
├── lib/                    # 工具库
└── server.ts               # 自定义服务端入口
```

## 功能模块

1. **工作台 (Dashboard)** - 数据统计面板，展示今日完成数、完成率、本周日程、笔记统计
2. **待办事项 (Todos)** - 增删改查、标记完成、编辑
3. **日程日历 (Calendar)** - 月视图日历、添加/删除日程、颜色标记
4. **快速记事 (Notes)** - 创建/编辑/删除笔记、搜索、自动保存

## 数据持久化

所有数据存储在浏览器 localStorage 中：
- `todos` - 待办事项列表
- `calendar-events` - 日程事件
- `notes` - 笔记列表

## 设计规范

详见 `DESIGN.md`。核心风格：温暖米白底色 + 琥珀色强调色 + 卡片式布局 + 响应式设计。

## 开发命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm ts-check` - TypeScript 类型检查
- `pnpm lint` - ESLint 检查
