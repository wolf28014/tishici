@echo off
chcp 65001 >nul
title PromptHub 重启

REM ============================================
REM PromptHub Windows 重启脚本
REM ============================================

echo 重启 PromptHub...
echo ========================================

REM 先停止
call "%~dp0\stop.bat"

REM 等待 2 秒
timeout /t 2 >nul

REM 再启动
call "%~dp0\start.bat"
