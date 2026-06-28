@echo off
chcp 65001 >nul
title PromptHub 状态检查

REM ============================================
REM PromptHub Windows 状态检查脚本
REM ============================================

echo PromptHub 状态
echo ========================================

REM 检查端口
netstat -ano | findstr ":3005 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo 运行状态：[√] 运行中
    echo 端口 3005：已监听
    echo 访问地址：http://localhost:3005
    echo.
    echo 相关进程：
    netstat -ano | findstr ":3005 " | findstr "LISTENING"
) else (
    echo 运行状态：[X] 未运行
    echo 端口 3005：未监听
)

echo.
echo 日志文件：prompthub.log
echo 查看日志：type prompthub.log
pause
