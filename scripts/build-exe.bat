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
echo

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] 未找到 Node.js，请先安装
    echo     https://nodejs.org
    pause
    exit /b 1
)

REM 检查项目依赖
if not exist "node_modules" (
    echo [...] 安装项目依赖...
    call npm install
)

REM 检查 Electron 依赖
if not exist "electron\node_modules" (
    echo [...] 安装 Electron 依赖...
    cd electron
    call npm install
    cd ..
)

REM 打包
echo.
echo [√] 开始打包...
echo.
cd electron
call npm run build-win

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   [√] 打包成功！
    echo ========================================
    echo.
    echo   输出目录：electron\dist\
    echo.
    echo   文件说明：
    echo     - PromptHub Setup *.exe  = 安装版
    echo     - PromptHub-Portable*.exe = 便携版
    echo.
    echo   是否打开输出目录？
    set /p choice=
    if /i "%choice%"=="Y" explorer dist
) else (
    echo.
    echo [X] 打包失败，请检查错误信息
)

echo.
pause
