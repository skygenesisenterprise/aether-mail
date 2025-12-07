@echo off
REM Aether Mail - Desktop Build Script for Windows
REM This script builds the desktop application for Windows

echo 🚀 Building Aether Mail Desktop Application...

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install pnpm first.
    exit /b 1
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist dist-electron rmdir /s /q dist-electron
if exist electron\dist rmdir /s /q electron\dist

REM Build frontend
echo 🏗️  Building frontend...
call pnpm build:frontend

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    exit /b 1
)

REM Build Electron main process
echo ⚡ Building Electron main process...
call pnpm build:electron:main

if %errorlevel% neq 0 (
    echo ❌ Electron main process build failed!
    exit /b 1
)

REM Build desktop application
echo 📦 Building desktop application...
call pnpm build:electron:win

if %errorlevel% neq 0 (
    echo ❌ Desktop build failed!
    exit /b 1
)

echo ✅ Desktop application built successfully!
echo 📁 Output directory: dist-electron\

REM List built files
echo 📋 Built files:
dir dist-electron\

pause