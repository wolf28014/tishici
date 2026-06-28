#!/bin/bash

# ============================================
# PromptHub 重启脚本
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "重启 PromptHub..."
echo "================================"

# 先停止
"$SCRIPT_DIR/stop.sh"

sleep 2

# 再启动
"$SCRIPT_DIR/start.sh"
