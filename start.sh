#!/bin/bash

# ============================================
# PromptHub 启动脚本
# 功能：启动开发服务器（后台运行）
# 端口：3005
# ============================================

set -e

# 项目目录（脚本所在目录的上级）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
PID_FILE="$PROJECT_DIR/.prompthub.pid"
LOG_FILE="$PROJECT_DIR/prompthub.log"
PORT=3005

cd "$PROJECT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PromptHub 启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查是否已运行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo -e "${YELLOW}⚠ PromptHub 已在运行（PID: $OLD_PID）${NC}"
        echo -e "  访问：http://localhost:$PORT"
        echo -e "  停止：./stop.sh"
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

# 检查端口是否被占用
if command -v lsof &> /dev/null; then
    if lsof -i :$PORT &> /dev/null; then
        echo -e "${RED}✗ 端口 $PORT 已被占用${NC}"
        echo -e "  请先释放端口或修改 package.json 中的端口"
        exit 1
    fi
fi

# 检查 bun 是否安装
if command -v bun &> /dev/null; then
    RUN_CMD="bun"
elif command -v npm &> /dev/null; then
    RUN_CMD="npm"
else
    echo -e "${RED}✗ 未找到 bun 或 npm，请先安装${NC}"
    echo -e "  安装 Bun: curl -fsSL https://bun.sh/install | bash"
    echo -e "  安装 Node.js: https://nodejs.org"
    exit 1
fi

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}→ 安装依赖中...${NC}"
    $RUN_CMD install
fi

# 检查数据库是否初始化
if [ ! -f "db/custom.db" ]; then
    echo -e "${YELLOW}→ 初始化数据库中...${NC}"
    mkdir -p db
    $RUN_CMD run db:push 2>/dev/null || npx prisma db push
    $RUN_CMD run db:generate 2>/dev/null || npx prisma generate
fi

# 检查是否有种子数据（可选）
if [ -f "db/custom.db" ]; then
    PROMPT_COUNT=$(sqlite3 db/custom.db "SELECT COUNT(*) FROM Prompt;" 2>/dev/null || echo "0")
    if [ "$PROMPT_COUNT" = "0" ] || [ -z "$PROMPT_COUNT" ]; then
        echo -e "${YELLOW}→ 导入种子数据中...${NC}"
        $RUN_CMD run db:push 2>/dev/null || true
        bunx tsx scripts/seed.ts 2>/dev/null || npx tsx scripts/seed.ts 2>/dev/null || echo "  种子数据导入失败，请手动运行：bunx tsx scripts/seed.ts"
    fi
fi

# 启动服务器（后台运行）
echo -e "${GREEN}→ 启动 PromptHub...${NC}"
echo -e "  运行命令：$RUN_CMD run dev"
echo -e "  端口：$PORT"
echo -e "  日志：$LOG_FILE"

# 使用 nohup 后台运行，记录 PID
nohup $RUN_CMD run dev > "$LOG_FILE" 2>&1 &
DEV_PID=$!
echo $DEV_PID > "$PID_FILE"

# 等待服务启动
echo -e "${BLUE}→ 等待服务启动...${NC}"
for i in {1..30}; do
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PromptHub 启动成功！${NC}"
        echo -e ""
        echo -e "  ${GREEN}访问地址：http://localhost:$PORT${NC}"
        echo -e "  PID：$DEV_PID"
        echo -e "  日志：tail -f $LOG_FILE"
        echo -e "  停止：./stop.sh"
        echo -e ""
        exit 0
    fi
    sleep 1
    echo -n "."
done

echo ""
echo -e "${RED}✗ 启动超时，请检查日志：${NC}"
echo -e "  tail -50 $LOG_FILE"
exit 1
