@echo off
chcp 65001 >nul
title PromptHub 卸载开机自启

REM ============================================
REM PromptHub Windows 卸载开机自启脚本
REM ============================================

echo 卸载 PromptHub 开机自启...
echo ========================================

REM 删除任务计划
schtasks /delete /tn "PromptHub" /f >nul 2>&1

if %errorlevel% equ 0 (
    echo [√] 已卸载开机自启
) else (
    echo [i] 任务计划不存在或已卸载
)

echo.
echo 如需重新安装：
echo   scripts\install-service.bat
echo.
pause
