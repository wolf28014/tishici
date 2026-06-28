@echo off
chcp 65001 >nul
title PromptHub 启动脚本

REM ============================================
REM PromptHub Windows 启动脚本
REM 功能：启动开发服务器（后台运行）
REM 端口：3005
REM ============================================

cd /d "%~dp0\.."

echo ========================================
echo   PromptHub 启动脚本
echo   项目目录：%CD%
echo   端口：3005
echo ========================================

REM 检查端口是否被占用
netstat -ano | findstr ":3005 " >nul 2>&1
if %errorlevel% equ 0 (
    echo [!] 端口 3005 已被占用
    echo     请先释放端口或修改 package.json 中的端口
    echo     查看占用进程：netstat -ano | findstr :3005
    pause
    exit /b 1
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

echo [X] 未找到 bun 或 npm，请先安装
echo     安装 Bun: powershell -c "irm bun.sh/install.ps1 | iex"
echo     安装 Node.js: https://nodejs.org
pause
exit /b 1

:FOUND
echo [√] 使用运行时：%RUN_CMD%

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [...] 安装依赖中...
    %RUN_CMD% install
)

REM 检查数据库是否初始化
if not exist "db\custom.db" (
    echo [...] 初始化数据库中...
    if not exist "db" mkdir "db"
    %RUN_CMD% run db:push
    %RUN_CMD% run db:generate
)

REM 检查 Prisma Client
if not exist "node_modules\.prisma\client\index.js" (
    echo [...] 生成 Prisma Client...
    %RUN_CMD% run db:generate
)

REM 启动服务器（后台运行）
echo [√] 启动 PromptHub...
echo     运行命令：%RUN_CMD% run dev
echo     端口：3005
echo     日志：prompthub.log

REM 使用 start 命令后台运行，日志输出到文件
start /b "" %RUN_CMD% run dev > prompthub.log 2>&1

REM 等待服务启动
echo [...] 等待服务启动
set /a count=0
:WAIT
timeout /t 1 >nul
set /a count+=1

REM 检查端口是否开始监听
netstat -ano | findstr ":3005 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    goto :SUCCESS
)

if %count% lss 30 (
    echo .
    goto :WAIT
)

echo [X] 启动超时，请检查日志：
echo     type prompthub.log
pause
exit /b 1

:SUCCESS
echo ========================================
echo [√] PromptHub 启动成功！
echo ========================================
echo.
echo   访问地址：http://localhost:3005
echo   日志：type prompthub.log
echo   停止：close-prompthub.bat
echo.
echo   按任意键打开浏览器...
pause >nul
start http://localhost:3005
