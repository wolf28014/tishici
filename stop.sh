#!/bin/bash

# ============================================
# PromptHub 停止脚本
# 功能：停止后台运行的开发服务器
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
PID_FILE="$PROJECT_DIR/.prompthub.pid"
PORT=3005

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  PromptHub 停止脚本${NC}"
echo -e "${GREEN}========================================${NC}"

STOPPED=false

# 方式1：通过 PID 文件停止
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}→ 停止进程 PID: $PID${NC}"
        kill "$PID" 2>/dev/null
        sleep 2
        # 如果还在运行，强制杀死
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${YELLOW}→ 强制停止...${NC}"
            kill -9 "$PID" 2>/dev/null
        fi
        STOPPED=true
    fi
    rm -f "$PID_FILE"
fi

# 方式2：查找占用 3005 端口的进程
if command -v lsof &> /dev/null; then
    PORT_PIDS=$(lsof -ti :$PORT 2>/dev/null)
    if [ -n "$PORT_PIDS" ]; then
        echo -e "${YELLOW}→ 停止占用端口 $PORT 的进程${NC}"
        echo "$PORT_PIDS" | xargs kill 2>/dev/null
        sleep 2
        echo "$PORT_PIDS" | xargs kill -9 2>/dev/null
        STOPPED=true
    fi
fi

# 方式3：查找 next-server 进程
NEXT_PIDS=$(pgrep -f "next-server.*$PORT" 2>/dev/null || pgrep -f "next dev.*$PORT" 2>/dev/null)
if [ -n "$NEXT_PIDS" ]; then
    echo -e "${YELLOW}→ 停止 Next.js 进程${NC}"
    echo "$NEXT_PIDS" | xargs kill 2>/dev/null
    sleep 2
    echo "$NEXT_PIDS" | xargs kill -9 2>/dev/null
    STOPPED=true
fi

if [ "$STOPPED" = true ]; then
    echo -e "${GREEN}✓ PromptHub 已停止${NC}"
else
    echo -e "${YELLOW}ℹ PromptHub 未在运行${NC}"
fi
