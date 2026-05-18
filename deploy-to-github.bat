@echo off
echo =================================
echo    My Blog GitHub Pages 部署脚本
echo =================================
echo.

echo [1/5] 检查 Git 是否安装...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：Git 未安装！请先安装 Git for Windows
    pause
    exit /b 1
)

echo [2/5] 检查 npm 是否安装...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：npm 未安装！请先安装 Node.js
    pause
    exit /b 1
)

echo [3/5] 进入博客目录...
cd /d "%~dp0"

echo [4/5] 初始化 Git 仓库（如果需要）...
if not exist .git (
    echo 正在初始化 Git 仓库...
    git init
)

echo [5/5] 请输入以下信息：
echo.

echo GitHub 用户名（如：your-username）:
set /p github_username=

echo GitHub 仓库名称（如：my-personal-blog）:
set /p github_repo=

echo.

echo =================================
echo     正在部署到 GitHub...
echo =================================

echo 1. 添加远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/%github_username%/%github_repo%.git

echo 2. 添加所有文件...
git add .

echo 3. 提交代码...
git commit -m "Initial commit: Personal blog with Markdown editor"
if %errorlevel% neq 0 (
    echo 提交失败，可能没有更改
    pause
    exit /b 1
)

echo 4. 创建并切换到 main 分支...
git branch -M main

echo 5. 推送到 GitHub...
git push -u origin main

echo.
echo =================================
echo    部署完成！
echo =================================
echo.
echo 接下来的步骤：
echo 1. 访问 https://github.com/%github_username%/%github_repo%
echo 2. 点击 Settings → Pages
echo 3. Source 选择 "Deploy from a branch"
echo 4. Branch 选择 "main"，目录选择 "/"
echo 5. 点击 Save
echo.
echo 几分钟后，你的博客将在：
echo https://%github_username%.github.io/%github_repo%
echo.
pause