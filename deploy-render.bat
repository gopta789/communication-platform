@echo off
REM Render Deployment Setup Script for Windows

echo.
echo 🚀 Video Communication Platform - Render Deployment Setup
echo =========================================================
echo.

REM Check if git is initialized
if not exist ".git\" (
  echo ❌ Git not initialized. Running: git init
  git init
) else (
  echo ✓ Git already initialized
)

REM Check if github remote exists
git remote | findstr /C:"origin" >nul
if errorlevel 1 (
  echo ❌ GitHub remote not found
  echo.
  echo Run this command first:
  echo git remote add origin https://github.com/YOUR_USERNAME/video-platform.git
  exit /b 1
) else (
  echo ✓ GitHub remote already configured
)

REM Check if package.json files exist
if not exist "server\package.json" (
  echo ❌ server\package.json not found
  exit /b 1
)

if not exist "client\package.json" (
  echo ❌ client\package.json not found
  exit /b 1
)

echo ✓ Package files found
echo.
echo 📦 Preparing files for deployment...
git add .
git status

echo.
echo ========================================================
echo Ready to deploy! Follow these steps:
echo ========================================================
echo.
echo 1. Create a GitHub repo: https://github.com/new
echo.
echo 2. Push to GitHub:
echo    git commit -m "Ready for Render deployment"
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Go to https://render.com
echo 4. Sign in with GitHub
echo 5. Create Web Service for backend (root: server)
echo 6. Create Static Site for frontend (root: client)
echo.
echo 7. Update REACT_APP_SERVER_URL after backend deploys
echo.
echo See RENDER_DEPLOYMENT.md for detailed instructions
echo.
pause
