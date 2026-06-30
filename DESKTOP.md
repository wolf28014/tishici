# 🖥️ PromptHub 桌面版（EXE）

## 📦 三种启动方式

### 方式 1：双击 VBS 启动（推荐，无黑窗口）

双击项目根目录的 **`PromptHub.vbs`**

- ✅ 无命令行黑窗口
- ✅ 自动检查依赖/数据库
- ✅ 自动打开浏览器
- ✅ 后台运行

### 方式 2：双击 BAT 启动

双击项目根目录的 **`PromptHub.bat`**

- 显示命令行窗口
- 可看到启动日志

### 方式 3：Electron 桌面应用（原生窗口）

打包成独立 EXE，无需浏览器。

---

## 🔨 打包成 EXE

### 前置要求

- Node.js 18+
- 安装依赖：`cd electron && npm install`

### 打包步骤

```bash
# 1. 进入 electron 目录
cd electron

# 2. 安装 Electron 依赖
npm install

# 3. 打包 Windows EXE
npm run build-win
```

打包完成后，`electron/dist/` 目录会生成：
- `PromptHub Setup 1.0.0.exe` — 安装版（推荐分发）
- `PromptHub-Portable-1.0.0.exe` — 便携版（免安装）

### 使用打包后的 EXE

1. **安装版**：双击 Setup.exe 安装后，从开始菜单启动
2. **便携版**：双击 exe 直接运行

---

## ⚙️ Electron 配置说明

### electron/main.js
Electron 主进程文件，负责：
- 启动 Next.js 服务器
- 创建桌面窗口
- 加载页面
- 处理菜单和外部链接

### electron/package.json
Electron 打包配置，使用 electron-builder：
- `portable` — 生成免安装 exe
- `nsis` — 生成安装版 exe（带桌面快捷方式）

### 自定义图标

替换 `electron/icon.ico` 为你的图标（需要 .ico 格式，建议 256x256）。

---

## 🚀 快速打包命令

```bash
# 一键打包（Windows）
cd electron && npm install && npm run build-win
```

---

## 📁 文件结构

```
项目根目录/
├── PromptHub.vbs          # VBS 启动器（无窗口，推荐）
├── PromptHub.bat          # BAT 启动器（有窗口）
├── electron/
│   ├── main.js            # Electron 主进程
│   ├── package.json       # Electron 打包配置
│   ├── icon.ico           # 应用图标
│   └── dist/              # 打包输出目录
└── scripts/
    ├── start.bat          # 命令行启动
    └── stop.bat           # 命令行停止
```

---

## 💡 使用建议

| 场景 | 推荐方式 |
|------|----------|
| 日常使用 | 双击 `PromptHub.vbs` |
| 调试开发 | `bash scripts/start.sh` 或双击 `scripts\start.bat` |
| 分发给他人 | 打包 Electron EXE |
| 服务器部署 | systemd 服务 + 开机自启 |

---

## ❓ 常见问题

### Q: VBS 启动后没反应？
A: 检查是否安装了 bun 或 npm，首次运行需要安装依赖。

### Q: Electron 打包失败？
A: 确保安装了所有依赖：`cd electron && npm install`。网络问题可设置镜像：
```bash
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
```

### Q: 如何修改端口？
A: 修改以下文件的端口号（默认 3005）：
- `package.json` 第 6 行
- `electron/main.js` 的 `PORT` 变量
- `PromptHub.vbs` 和 `PromptHub.bat` 中的 3005
