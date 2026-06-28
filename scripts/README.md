# 📜 PromptHub 启动脚本

## 📋 脚本说明

| 脚本 | 功能 | 命令 |
|------|------|------|
| `start.sh` | 启动 PromptHub（后台运行） | `bash scripts/start.sh` |
| `stop.sh` | 停止 PromptHub | `bash scripts/stop.sh` |
| `restart.sh` | 重启 PromptHub | `bash scripts/restart.sh` |
| `status.sh` | 查看运行状态 | `bash scripts/status.sh` |
| `install-service.sh` | 安装开机自启（需 sudo） | `sudo bash scripts/install-service.sh` |
| `uninstall-service.sh` | 卸载开机自启（需 sudo） | `sudo bash scripts/uninstall-service.sh` |
| `prompthub.service` | systemd 服务文件（供参考） | - |

---

## 🚀 快速开始

### 1. 首次启动

```bash
# 在项目根目录执行
bash scripts/start.sh
```

脚本会自动完成：
- ✅ 检查并安装依赖（node_modules）
- ✅ 初始化数据库（SQLite）
- ✅ 生成 Prisma Client
- ✅ 导入种子数据（52+ 条提示词）
- ✅ 后台启动服务器
- ✅ 等待服务就绪

启动成功后访问：**http://localhost:3005**

### 2. 常用操作

```bash
# 启动
bash scripts/start.sh

# 停止
bash scripts/stop.sh

# 重启
bash scripts/restart.sh

# 查看状态
bash scripts/status.sh

# 查看实时日志
tail -f prompthub.log
```

---

## ⚙️ 开机自启设置（Linux）

### 一键安装

```bash
sudo bash scripts/install-service.sh
```

脚本会自动：
- 检测系统环境（Bun/NPM 路径、用户名、项目路径）
- 生成并安装 systemd 服务文件
- 启用开机自启
- 立即启动服务

### 验证是否成功

```bash
sudo systemctl status prompthub
```

看到 `active (running)` 表示成功！重启服务器后会自动启动。

### 常用 systemd 命令

```bash
sudo systemctl start prompthub       # 启动
sudo systemctl stop prompthub        # 停止
sudo systemctl restart prompthub     # 重启
sudo systemctl status prompthub      # 状态
sudo journalctl -u prompthub -f      # 实时日志
sudo systemctl disable prompthub     # 禁用开机自启
```

### 卸载开机自启

```bash
sudo bash scripts/uninstall-service.sh
```

---

## 🍎 macOS 开机自启

macOS 不支持 systemd，使用 launchd：

### 1. 创建 plist 文件

```bash
cat > ~/Library/LaunchAgents/com.prompthub.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.prompthub</string>
    <key>WorkingDirectory</key>
    <string>/你的/项目/路径/tishici</string>
    <key>ProgramArguments</key>
    <array>
        <string>/你的/bun/路径</string>
        <string>run</string>
        <string>dev</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/你的/项目/路径/tishici/prompthub.log</string>
    <key>StandardErrorPath</key>
    <string>/你的/项目/路径/tishici/prompthub.log</string>
</dict>
</plist>
EOF
```

### 2. 加载服务

```bash
launchctl load ~/Library/LaunchAgents/com.prompthub.plist
```

### 3. 卸载

```bash
launchctl unload ~/Library/LaunchAgents/com.prompthub.plist
```

---

## 🪟 Windows 开机自启

### 方法 1：启动文件夹

1. 按 `Win + R`，输入 `shell:startup`
2. 在打开的文件夹中创建 `prompthub.bat`：

```bat
@echo off
cd /d C:\你的\项目\路径\tishici
bun run dev
```

### 方法 2：任务计划程序

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：当用户登录时
4. 操作：启动程序
   - 程序：`bun`
   - 参数：`run dev`
   - 起始于：`C:\你的\项目\路径\tishici`

---

## 🔧 配置说明

### 修改端口

编辑项目根目录的 `package.json`：

```json
"dev": "next dev -p 3005 2>&1 | tee dev.log"
```

把 `3005` 改成你想要的端口，然后重启：

```bash
bash scripts/restart.sh
```

如果使用 systemd 开机自启，还需修改 `/etc/systemd/system/prompthub.service`：

```ini
Environment=PORT=你的新端口
```

然后：
```bash
sudo systemctl daemon-reload
sudo systemctl restart prompthub
```

### 修改运行时（Bun → NPM）

如果使用 systemd，编辑 `/etc/systemd/system/prompthub.service`：

```ini
# 使用 Bun（默认）
ExecStart=/home/用户名/.bun/bin/bun run dev

# 改为 NPM
ExecStart=/usr/bin/npm run dev
```

然后：
```bash
sudo systemctl daemon-reload
sudo systemctl restart prompthub
```

---

## 🔍 故障排查

### 问题：启动失败

```bash
# 查看详细日志
tail -50 prompthub.log

# 检查端口是否被占用
lsof -i :3005

# 查看进程
ps aux | grep next
```

### 问题：systemd 服务启动失败

```bash
# 查看详细错误
sudo journalctl -u prompthub -n 50

# 检查配置文件语法
sudo systemd-analyze verify /etc/systemd/system/prompthub.service

# 检查 Bun 路径是否正确
ls -la /home/用户名/.bun/bin/bun
```

### 问题：权限不足

```bash
# 确保脚本有执行权限
chmod +x scripts/*.sh

# 确保项目目录权限
sudo chown -R 用户名:用户名 /你的/项目/路径
```

### 问题：数据库错误

```bash
# 重新初始化数据库
cd /你的/项目/路径
rm -f db/custom.db
bun run db:push
bun run db:generate
bunx tsx scripts/seed.ts
```

---

## 📁 文件说明

```
scripts/
├── start.sh              # 启动脚本
├── stop.sh               # 停止脚本
├── restart.sh            # 重启脚本
├── status.sh             # 状态检查脚本
├── install-service.sh    # 开机自启安装脚本（Linux）
├── uninstall-service.sh  # 开机自启卸载脚本（Linux）
├── prompthub.service     # systemd 服务文件（参考）
├── seed.ts               # 种子数据脚本
└── README.md             # 本文件
```

---

## 💡 使用建议

1. **开发环境**：用 `bash scripts/start.sh` 手动启动
2. **生产/服务器环境**：用 `sudo bash scripts/install-service.sh` 设置开机自启
3. **日志监控**：定期检查 `prompthub.log` 或 `journalctl`
4. **端口冲突**：如需修改端口，编辑 `package.json` 第 6 行
