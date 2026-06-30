# 提示词库 · PromptHub

管理、分类、复用你的 AI 提示词，让创意触手可及。

一个功能完整的 AI 提示词管理应用，基于 Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui + Prisma + Zustand 构建。

## 🚀 快速启动

### Windows 用户
- **双击 `PromptHub.vbs`** — 无黑窗口，自动打开浏览器（推荐）
- **双击 `PromptHub.bat`** — 显示启动日志
- **打包成 EXE**：运行 `scripts/build-exe.bat`，详见 [DESKTOP.md](DESKTOP.md)

### Linux / macOS 用户
```bash
bash scripts/start.sh
```

### 访问地址
http://localhost:3005

## ✨ 核心功能

### 📚 提示词管理
- **CRUD 操作**：新建、编辑、删除提示词
- **{{变量}} 智能识别**：自动提取 `{{变量}}` 占位符，支持填充后复制
- **一键复制**：复制后自动累计使用次数
- **收藏 / 置顶**：快速标记重要提示词

### 🗂️ 分类与标签
- **子分类支持**：无限层级父子分类，侧边栏可展开/折叠
- **标签云**：侧边栏显示高频标签，点击即筛选
- **8 大预设分类**：写作创作、编程开发、电商运营、AI 模特商拍、AI 短剧制作等
- **52+ 条预置提示词**：覆盖电商、AI 模特、AI 短剧等场景

### 🎨 视觉与背景
- **页面背景设置**：6 纯色 + 6 渐变 + 自定义上传图片（≤5MB）
- **提示词背景**：每条提示词可关联独立背景（颜色或图片）
- **AI 智能推荐背景**：根据提示词内容自动推荐合适背景
- **浅色 / 深色主题**切换
- **毛玻璃效果**：自定义背景下保持内容可读

### 🤖 AI 功能（基于 z-ai-web-dev-sdk）
- **AI 自动生成提示词**：输入简短描述，AI 生成完整提示词（详细/简洁/创意三种风格）
- **AI 相似推荐**：查找全库 Top 5 相似提示词（含相似度分数和原因）
- **AI 背景推荐**：根据提示词内容推荐合适背景

### 📊 高级功能
- **版本历史**：每次修改自动保存版本快照，可一键恢复
- **评分系统**：1-5 星评分，支持按评分排序
- **收藏夹分组**：自定义收藏夹，归类管理提示词
- **批量编辑**：多选模式下批量加/移标签、设置收藏夹、删除
- **拖拽排序**：自定义排序模式下拖拽调整顺序
- **JSON 导入/导出**：备份恢复提示词库
- **跨设备云同步**：生成同步码，在其他设备粘贴即可同步
- **分享链接**：生成 URL 分享提示词，对方打开后一键保存

### 📱 响应式设计
- 桌面端：固定左侧栏 + 主内容区
- 移动端：抽屉式筛选 + 自适应网格

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | 全栈框架（App Router） |
| TypeScript | 5 | 类型安全 |
| Tailwind CSS | 4 | 样式 |
| shadcn/ui | - | UI 组件库 |
| Prisma | 6 | ORM（SQLite） |
| Zustand | 5 | 状态管理 |
| @dnd-kit | - | 拖拽排序 |
| z-ai-web-dev-sdk | - | AI 功能 |
| next-themes | - | 主题切换 |
| date-fns | - | 日期格式化 |

## 📦 安装与运行

### 前置要求
- Node.js 18+ 或 Bun
- Git

### 1. 克隆仓库

```bash
git clone https://github.com/wolf28014/tishici.git
cd tishici
```

### 2. 安装依赖

**使用 Bun（推荐）：**
```bash
# 安装 Bun
curl -fsSL https://bun.sh/install | bash

# 安装依赖
bun install
```

**使用 npm：**
```bash
npm install
```

**使用 pnpm：**
```bash
pnpm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
# 数据库（默认使用 SQLite，无需额外配置）
DATABASE_URL="file:./db/custom.db"

# 如果要使用 AI 功能，需要配置 z-ai-web-dev-sdk
# 通常 SDK 会自动读取环境变量，无需额外配置
```

### 4. 初始化数据库

```bash
# 推送 Prisma schema 到数据库
bun run db:push
# 或
npx prisma db push

# 生成 Prisma Client
bun run db:generate
# 或
npx prisma generate
```

### 5. 运行种子数据（可选）

种子数据包含 52+ 条高质量中文提示词，覆盖电商运营、AI 模特商拍、AI 短剧制作等分类：

```bash
bunx tsx scripts/seed.ts
```

### 6. 启动开发服务器

```bash
bun run dev
# 或
npm run dev
```

访问 http://localhost:3005 即可使用。

### 7. 构建生产版本（可选）

```bash
bun run build
bun run start
```

## 📁 项目结构

```
├── prisma/
│   └── schema.prisma          # 数据模型（Category, Collection, Prompt, Version）
├── scripts/
│   └── seed.ts                # 种子数据脚本
├── src/
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── prompts/       # 提示词 CRUD + 版本 + 排序 + 批量
│   │   │   ├── categories/    # 分类 CRUD
│   │   │   ├── collections/   # 收藏夹 CRUD
│   │   │   ├── ai-generate/   # AI 生成提示词
│   │   │   ├── ai-similar/    # AI 相似推荐
│   │   │   ├── ai-background/ # AI 背景推荐
│   │   │   ├── sync/          # 云同步
│   │   │   ├── export/        # 导出
│   │   │   └── import/        # 导入
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 主页
│   ├── components/            # React 组件
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── prompt-card.tsx
│   │   ├── prompt-detail-sheet.tsx
│   │   ├── prompt-form-dialog.tsx
│   │   ├── background-selector.tsx
│   │   ├── page-background-settings.tsx
│   │   ├── ai-generate-dialog.tsx
│   │   ├── version-history-dialog.tsx
│   │   ├── cloud-sync-dialog.tsx
│   │   ├── batch-edit-dialog.tsx
│   │   └── ...
│   └── lib/
│       ├── db.ts              # Prisma 客户端
│       ├── prompt-store.ts    # Zustand store
│       └── prompt-types.ts    # 类型定义
├── .env                       # 环境变量（不提交）
├── .gitignore
└── package.json
```

## 🗃️ 数据模型

### Category（分类）
- 支持父子层级（parentId 自引用）
- 字段：name, description, icon, color, sortOrder, parentId

### Collection（收藏夹）
- 自定义分组
- 字段：name, description, icon, color, sortOrder

### Prompt（提示词）
- 字段：title, content, description, categoryId, tags, background, isFavorite, isPinned, usageCount, rating, author, sortOrder, collectionId

### Version（版本历史）
- 自动记录每次标题/内容修改
- 字段：promptId, title, content, description, tags, versionNum, changeNote

## 🎯 使用指南

### 快速开始
1. 启动后默认显示 52+ 条预置提示词
2. 点击顶部三个大卡片快速进入电商运营/AI 模特/AI 短剧分类
3. 点击任意提示词卡片查看详情
4. 在详情页可复制、收藏、评分、查看版本历史、查找相似

### AI 生成提示词
1. 点击头部"AI 生成"按钮
2. 输入简短描述（如"帮我写一个小红书种草文案的提示词"）
3. 选择风格（详细/简洁/创意）
4. AI 生成后一键应用到表单

### 批量编辑
1. 点击头部的批量选择按钮
2. 选择多条提示词
3. 点击"批量编辑"进行加标签/移除标签/设置收藏夹/删除

### 跨设备同步
1. 点击头部的云同步按钮
2. 生成同步码
3. 在其他设备粘贴同步码即可同步

## 📝 常用命令

```bash
# 开发
bun run dev              # 启动开发服务器
bun run lint             # 运行 ESLint

# 数据库
bun run db:push          # 推送 schema 到数据库
bun run db:generate      # 生成 Prisma Client
bun run db:reset         # 重置数据库

# 种子数据
bunx tsx scripts/seed.ts # 运行种子脚本

# 构建
bun run build            # 构建生产版本
bun run start            # 启动生产服务器
```

## 📄 License

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/)
