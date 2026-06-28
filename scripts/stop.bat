@echo off
chcp 65001 >nul
title PromptHub 停止脚本

REM ============================================
REM PromptHub Windows 停止脚本
REM ============================================

echo ========================================
echo   PromptHub 停止脚本
echo ========================================

set STOPPED=0

REM 查找占用 3005 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3005 " ^| findstr "LISTENING"') do (
    echo [...] 停止进程 PID: %%a
    taskkill /PID %%a /F >nul 2>&1
    set STOPPED=1
)

REM 查找 node.exe 进程（Next.js）
for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe"') do (
    echo [...] 停止 Node 进程 PID: %%a
    taskkill /PID %%a /F >nul 2>&1
    set STOPPED=1
)

if %STOPPED% equ 1 (
    echo [√] PromptHub 已停止
) else (
    echo [i] PromptHub 未在运行
)

pause
