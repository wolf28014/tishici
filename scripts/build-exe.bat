@echo off
chcp 65001 >nul
title PromptHub EXE 打包工具

REM ============================================
REM PromptHub 一键打包成 EXE
REM ============================================

cd /d "%~dp0\.."

echo ========================================
echo   PromptHub EXE 打包工具
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] 未找到 Node.js，请先安装
    echo     https://nodejs.org
    pause
    exit /b 1
)

echo [√] Node.js 已安装
node --version
echo.

REM 步骤1：安装项目依赖
echo [1/4] 检查项目依赖...
if not exist "node_modules" (
    echo [...] 安装项目依赖（可能需要几分钟）...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] 项目依赖安装失败
        pause
        exit /b 1
    )
)
echo [√] 项目依赖已就绪
echo.

REM 步骤2：安装 Electron 依赖
echo [2/4] 安装 Electron 依赖...
cd electron
echo [...] 安装 electron 和 electron-builder（可能需要几分钟）...
call npm install --save-dev electron@^33.0.0 electron-builder@^25.0.0
if %errorlevel% neq 0 (
    echo [X] Electron 依赖安装失败
    echo.
    echo 尝试使用淘宝镜像安装...
    set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
    call npm install --save-dev electron@^33.0.0 electron-builder@^25.0.0 --registry=https://registry.npmmirror.com
    if %errorlevel% neq 0 (
        echo [X] 镜像安装也失败，请手动安装：
        echo     cd electron
        echo     npm install --save-dev electron electron-builder
        pause
        exit /b 1
    )
)
echo [√] Electron 依赖已就绪
echo.

REM 步骤3：检查 electron-builder 是否可用
echo [3/4] 检查 electron-builder...
call npx electron-builder --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [...] electron-builder 未就绪，重新安装...
    call npm install --save-dev electron-builder@^25.0.0
)
echo [√] electron-builder 已就绪
echo.

REM 步骤4：打包
echo [4/4] 开始打包 EXE...
echo.
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
call npx electron-builder --win --x64

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   [√] 打包成功！
    echo ========================================
    echo.
    echo   输出目录：electron\dist\
    echo.
    echo   文件说明：
    echo     - PromptHub Setup *.exe  = 安装版（推荐分发）
    echo     - PromptHub-Portable*.exe = 便携版（免安装）
    echo.
    echo   是否打开输出目录？(Y/N)
    set /p choice=
    if /i "%choice%"=="Y" explorer dist
) else (
    echo.
    echo [X] 打包失败
    echo.
    echo 常见原因：
    echo   1. 网络问题 - 设置镜像后重试：
    echo      set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
    echo      cd electron && npx electron-builder --win --x64
    echo.
    echo   2. 权限问题 - 以管理员身份运行此脚本
    echo.
    echo   3. 手动安装后重试：
    echo      cd electron
    echo      npm install
    echo      npx electron-builder --win --x64
)

echo.
pause
