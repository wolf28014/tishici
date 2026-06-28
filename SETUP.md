# 🚀 启动脚本 & 开机自启设置

PromptHub 提供了一键启动/停止脚本和开机自启配置。

## 📋 脚本说明

| 脚本 | 功能 |
|------|------|
| `start.sh` | 启动 PromptHub（后台运行） |
| `stop.sh` | 停止 PromptHub |
| `restart.sh` | 重启 PromptHub |
| `status.sh` | 查看运行状态 |
| `prompthub.service` | systemd 服务文件（开机自启） |

---

## 🔧 快速使用

### 启动
```bash
./start.sh
```
输出：
```
✓ PromptHub 启动成功！
  访问地址：http://localhost:3005
  PID：12345
```

### 停止
```bash
./stop.sh
```

### 重启
```bash
./restart.sh
```

### 查看状态
```bash
./status.sh
```

### 查看日志
```bash
tail -f prompthub.log
```

---

## ⚙️ 开机自启设置（Linux + systemd）

### 步骤 1：复制服务文件

```bash
# 复制到 systemd 目录（需要 sudo）
sudo cp prompthub.service /etc/systemd/system/
```

### 步骤 2：修改路径

```bash
# 编辑服务文件，修改为你的实际路径
sudo nano /etc/systemd/system/prompthub.service
```

需要修改的地方：
```ini
# 改成你的用户名
User=你的用户名
Group=你的用户名

# 改成你的项目实际路径
WorkingDirectory=/你的/实际/路径/tishici

# 改成你的 bun 实际路径（用 which bun 查看）
ExecStart=/你的/bun/路径 run dev
```

**查看你的 bun 路径：**
```bash
which bun
# 通常是：/home/用户名/.bun/bin/bun
```

### 步骤 3：重新加载 systemd

```bash
sudo systemctl daemon-reload
```

### 步骤 4：启用开机自启

```bash
sudo systemctl enable prompthub
```

### 步骤 5：立即启动服务

```bash
sudo systemctl start prompthub
```

### 步骤 6：验证状态

```bash
sudo systemctl status prompthub
```

看到 `active (running)` 表示成功！

---

## 📱 常用 systemd 命令

| 命令 | 说明 |
|------|------|
| `sudo systemctl start prompthub` | 启动服务 |
| `sudo systemctl stop prompthub` | 停止服务 |
| `sudo systemctl restart prompthub` | 重启服务 |
| `sudo systemctl status prompthub` | 查看状态 |
| `sudo systemctl enable prompthub` | 启用开机自启 |
| `sudo systemctl disable prompthub` | 禁用开机自启 |
| `sudo journalctl -u prompthub -f` | 查看实时日志 |
| `sudo journalctl -u prompthub --since today` | 查看今天的日志 |

---

## 🍎 macOS 开机自启（launchd）

如果你使用 macOS，创建 plist 文件：

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

加载服务：
```bash
launchctl load ~/Library/LaunchAgents/com.prompthub.plist
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

## 🔍 故障排查

### 问题：启动失败
```bash
# 查看详细日志
tail -50 prompthub.log

# 检查端口是否被占用
lsof -i :3005    # Linux/macOS
netstat -ano | findstr :3005    # Windows
```

### 问题：systemd 服务启动失败
```bash
# 查看详细错误
sudo journalctl -u prompthub -n 50

# 检查配置文件语法
sudo systemd-analyze verify prompthub.service
```

### 问题：权限不足
```bash
# 确保脚本有执行权限
chmod +x start.sh stop.sh restart.sh status.sh

# 确保项目目录权限
sudo chown -R 你的用户名:你的用户名 /你的/项目/路径
```

---

## 💡 使用建议

1. **开发环境**：用 `./start.sh` 手动启动，方便调试
2. **生产环境**：用 systemd 服务，自动重启 + 开机自启
3. **日志监控**：定期检查 `prompthub.log` 或 `journalctl`
4. **端口冲突**：如需修改端口，编辑 `package.json` 第 6 行
