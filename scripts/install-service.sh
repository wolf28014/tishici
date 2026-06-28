#!/bin/bash

# ============================================
# PromptHub 开机自启一键安装脚本
# 功能：自动配置 systemd 服务实现开机自启
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE_NAME="prompthub"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PromptHub 开机自启安装${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}✗ 请使用 sudo 运行此脚本${NC}"
    echo -e "  sudo bash $0"
    exit 1
fi

# 检查是否为 Linux systemd
if ! command -v systemctl &> /dev/null; then
    echo -e "${RED}✗ 当前系统不支持 systemd${NC}"
    echo -e "  此脚本仅适用于 Linux systemd 系统"
    echo -e "  macOS 请参考 scripts/README.md 中的 launchd 配置"
    echo -e "  Windows 请参考 scripts/README.md 中的任务计划配置"
    exit 1
fi

# 获取实际运行用户（非 root）
if [ -n "$SUDO_USER" ]; then
    ACTUAL_USER="$SUDO_USER"
else
    ACTUAL_USER=$(whoami)
fi

# 获取用户的 home 目录
ACTUAL_HOME=$(eval echo "~$ACTUAL_USER")

echo -e "${BLUE}配置信息：${NC}"
echo -e "  用户：$ACTUAL_USER"
echo -e "  Home：$ACTUAL_HOME"
echo -e "  项目目录：$PROJECT_DIR"
echo ""

# 查找 bun 路径
BUN_PATH=""
if command -v bun &> /dev/null; then
    BUN_PATH=$(which bun)
elif [ -f "$ACTUAL_HOME/.bun/bin/bun" ]; then
    BUN_PATH="$ACTUAL_HOME/.bun/bin/bun"
fi

# 查找 npm 路径
NPM_PATH=$(which npm 2>/dev/null || echo "")

echo -e "${BLUE}运行时检测：${NC}"
if [ -n "$BUN_PATH" ]; then
    echo -e "  Bun 路径：$BUN_PATH ${GREEN}✓${NC}"
    EXEC_START="$BUN_PATH run dev"
elif [ -n "$NPM_PATH" ]; then
    echo -e "  Bun：${YELLOW}未安装${NC}"
    echo -e "  NPM 路径：$NPM_PATH ${GREEN}✓${NC}"
    EXEC_START="$NPM_PATH run dev"
else
    echo -e "${RED}✗ 未找到 bun 或 npm，请先安装${NC}"
    exit 1
fi
echo ""

# 生成服务文件
echo -e "${YELLOW}→ 生成服务文件...${NC}"
cat > /tmp/$SERVICE_NAME.service << EOF
[Unit]
Description=PromptHub - AI 提示词库管理应用
Documentation=https://github.com/wolf28014/tishici
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
Group=$ACTUAL_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=$EXEC_START
Restart=always
RestartSec=5
Environment=NODE_ENV=development
Environment=PORT=3005
Environment=DATABASE_URL=file:./db/custom.db
StandardOutput=journal
StandardError=journal
SysIdentifier=prompthub
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# 复制到 systemd 目录
echo -e "${YELLOW}→ 安装服务文件到 /etc/systemd/system/...${NC}"
cp /tmp/$SERVICE_NAME.service /etc/systemd/system/$SERVICE_NAME.service
rm -f /tmp/$SERVICE_NAME.service

# 重新加载 systemd
echo -e "${YELLOW}→ 重新加载 systemd...${NC}"
systemctl daemon-reload

# 停止之前的脚本启动的进程
echo -e "${YELLOW}→ 停止之前的进程...${NC}"
if [ -f "$PROJECT_DIR/.prompthub.pid" ]; then
    OLD_PID=$(cat "$PROJECT_DIR/.prompthub.pid")
    kill "$OLD_PID" 2>/dev/null || true
    rm -f "$PROJECT_DIR/.prompthub.pid"
fi
# 停止端口占用
lsof -ti :3005 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1

# 启用开机自启
echo -e "${YELLOW}→ 启用开机自启...${NC}"
systemctl enable $SERVICE_NAME

# 启动服务
echo -e "${YELLOW}→ 启动服务...${NC}"
systemctl start $SERVICE_NAME

# 等待启动
sleep 3

# 检查状态
echo ""
if systemctl is-active --quiet $SERVICE_NAME; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 安装成功！PromptHub 已启动并设置开机自启${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  ${GREEN}访问地址：http://localhost:3005${NC}"
    echo ""
    echo -e "  服务状态：sudo systemctl status $SERVICE_NAME"
    echo -e "  查看日志：sudo journalctl -u $SERVICE_NAME -f"
    echo -e "  停止服务：sudo systemctl stop $SERVICE_NAME"
    echo -e "  重启服务：sudo systemctl restart $SERVICE_NAME"
    echo -e "  禁用自启：sudo systemctl disable $SERVICE_NAME"
    echo ""
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ 服务启动失败，请检查日志${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "  查看日志：sudo journalctl -u $SERVICE_NAME -n 50"
    echo ""
    echo -e "${YELLOW}常见问题：${NC}"
    echo -e "  1. Bun 路径不对 → 编辑 /etc/systemd/system/$SERVICE_NAME.service"
    echo -e "  2. 项目路径不对 → 编辑 WorkingDirectory"
    echo -e "  3. 端口被占用 → sudo lsof -i :3005"
fi
