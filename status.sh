#!/bin/bash

# ============================================
# PromptHub 状态检查脚本
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
PID_FILE="$PROJECT_DIR/.prompthub.pid"
PORT=3005

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "PromptHub 状态"
echo "================================"

# 检查 PID 文件
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "运行状态：${GREEN}运行中${NC}"
        echo "PID：$PID"
    else
        echo -e "运行状态：${RED}已停止（PID 文件过期）${NC}"
    fi
else
    echo -e "运行状态：${YELLOW}未启动${NC}"
fi

# 检查端口
if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
    echo -e "端口 $PORT：${GREEN}已监听${NC}"
    echo "访问地址：http://localhost:$PORT"
else
    echo -e "端口 $PORT：${RED}未监听${NC}"
fi

# 显示进程
echo ""
echo "相关进程："
ps aux | grep -E "(next-server|next dev.*$PORT|bun run dev)" | grep -v grep | head -5

echo ""
echo "日志：tail -f $PROJECT_DIR/prompthub.log"
