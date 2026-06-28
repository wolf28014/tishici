@echo off
chcp 65001 >nul
title PromptHub 开机自启设置

REM ============================================
REM PromptHub Windows 开机自启安装脚本
REM 功能：创建任务计划，开机自动启动 PromptHub
REM ============================================

echo ========================================
echo   PromptHub 开机自启安装
echo ========================================
echo.

REM 获取项目根目录
cd /d "%~dp0\.."
set PROJECT_DIR=%CD%
set START_BAT=%PROJECT_DIR%\scripts\start.bat

echo 项目目录：%PROJECT_DIR%
echo 启动脚本：%START_BAT%
echo.

REM 检查是否以管理员身份运行
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] 建议以管理员身份运行（右键 → 以管理员身份运行）
    echo     非管理员也可以安装，但开机后需要登录才会启动
    echo.
)

REM 创建任务计划
echo [...] 创建开机自启任务计划...
schtasks /create /tn "PromptHub" /tr "%START_BAT%" /sc onlogon /rl highest /f >nul 2>&1

if %errorlevel% equ 0 (
    echo [√] 开机自启设置成功！
    echo.
    echo   每次开机登录后会自动启动 PromptHub
    echo.
    echo   管理命令：
    echo     查看：schtasks /query /tn "PromptHub"
    echo     立即运行：schtasks /run /tn "PromptHub"
    echo     停止：schtasks /end /tn "PromptHub"
    echo     卸载：schtasks /delete /tn "PromptHub" /f
    echo.
    echo   是否立即启动？(Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        echo [...] 启动 PromptHub...
        start "" "%START_BAT%"
    )
) else (
    echo [X] 创建任务计划失败
    echo     请尝试以管理员身份运行此脚本
)

echo.
pause
