@echo off
chcp 65001 >nul
title PromptHub - AI 提示词库

REM ============================================
REM PromptHub Windows 启动器
REM 双击运行，自动启动服务并打开浏览器
REM ============================================

cd /d "%~dp0\.."

echo ========================================
echo   PromptHub - AI 提示词库
echo ========================================
echo.

REM 检查端口是否已被占用
netstat -ano | findstr ":3005 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [i] PromptHub 已在运行，直接打开浏览器...
    start http://localhost:3005
    exit /b 0
)

REM 检查 bun 是否安装
where bun >nul 2>&1
if %errorlevel% equ 0 (
    set RUN_CMD=bun
    goto :FOUND
)

REM 检查 npm 是否安装
where npm >nul 2>&1
if %errorlevel% equ 0 (
    set RUN_CMD=npm
    goto :FOUND
)

echo [X] 未找到 bun 或 npm
echo.
echo 请先安装运行环境：
echo   方式1 - 安装 Bun（推荐）:
echo     powershell -c "irm bun.sh/install.ps1 ^| iex"
echo   方式2 - 安装 Node.js:
echo     https://nodejs.org
echo.
pause
exit /b 1

:FOUND
echo [√] 运行时：%RUN_CMD%

REM 检查依赖是否安装
if not exist "node_modules" (
    echo [...] 首次运行，安装依赖中（可能需要几分钟）...
    %RUN_CMD% install
)

REM 检查数据库
if not exist "db\custom.db" (
    echo [...] 初始化数据库...
    if not exist "db" mkdir "db"
    %RUN_CMD% run db:push
    %RUN_CMD% run db:generate
)

REM 启动服务器（后台运行）
echo [√] 启动 PromptHub...
echo.

REM 创建一个临时 VBScript 来后台运行并隐藏窗口
echo Set WshShell = CreateObject("WScript.Shell") > "%TEMP%\prompthub-start.vbs"
echo WshShell.Run "cmd /c %RUN_CMD% run dev", 0, false >> "%TEMP%\prompthub-start.vbs"
echo WScript.Sleep 100 >> "%TEMP%\prompthub-start.vbs"
echo Set WshShell = Nothing >> "%TEMP%\prompthub-start.vbs"
cscript //nologo "%TEMP%\prompthub-start.vbs"
del "%TEMP%\prompthub-start.vbs"

REM 等待服务启动
echo [...] 等待服务启动...
set /a count=0
:WAIT
timeout /t 1 >nul
set /a count+=1

netstat -ano | findstr ":3005 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    goto :SUCCESS
)

if %count% lss 30 (
    echo .
    goto :WAIT
)

echo.
echo [X] 启动超时
echo 请手动运行：%RUN_CMD% run dev
echo 然后访问：http://localhost:3005
pause
exit /b 1

:SUCCESS
echo.
echo ========================================
echo   [√] PromptHub 启动成功！
echo ========================================
echo.
echo   访问地址：http://localhost:3005
echo   浏览器将自动打开...
echo.
echo   关闭方式：
echo   1. 运行 scripts\stop.bat
echo   2. 或在任务管理器结束 node.exe 进程
echo.

REM 等待 1 秒后打开浏览器
timeout /t 1 >nul
start http://localhost:3005

REM 3 秒后自动关闭此命令行窗口
timeout /t 3 >nul
