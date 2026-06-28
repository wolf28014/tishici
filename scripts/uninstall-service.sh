#!/bin/bash

# ============================================
# PromptHub 卸载开机自启脚本
# ============================================

set -e

SERVICE_NAME="prompthub"

echo "卸载 PromptHub 开机自启..."
echo "================================"

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo "✗ 请使用 sudo 运行此脚本"
    echo "  sudo bash $0"
    exit 1
fi

# 停止服务
echo "→ 停止服务..."
systemctl stop $SERVICE_NAME 2>/dev/null || true

# 禁用开机自启
echo "→ 禁用开机自启..."
systemctl disable $SERVICE_NAME 2>/dev/null || true

# 删除服务文件
echo "→ 删除服务文件..."
rm -f /etc/systemd/system/$SERVICE_NAME.service

# 重新加载 systemd
echo "→ 重新加载 systemd..."
systemctl daemon-reload

echo ""
echo "✓ 已卸载开机自启"
echo ""
echo "如需重新安装："
echo "  sudo bash scripts/install-service.sh"
