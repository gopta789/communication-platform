#!/bin/bash
# Render Deployment Setup Script

echo "🚀 Video Communication Platform - Render Deployment Setup"
echo "========================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "❌ Git not initialized. Running: git init"
  git init
else
  echo "✓ Git already initialized"
fi

# Check if github remote exists
if git remote | grep -q origin; then
  echo "✓ GitHub remote already configured"
else
  echo "❌ GitHub remote not found"
  echo "Run this command first:"
  echo "git remote add origin https://github.com/YOUR_USERNAME/video-platform.git"
  exit 1
fi

# Check if package.json files exist
if [ ! -f "server/package.json" ]; then
  echo "❌ server/package.json not found"
  exit 1
fi

if [ ! -f "client/package.json" ]; then
  echo "❌ client/package.json not found"
  exit 1
fi

echo "✓ Package files found"

# Add all files to git
echo ""
echo "📦 Preparing files for deployment..."
git add .
git status

echo ""
echo "Ready to deploy! Follow these steps:"
echo ""
echo "1. Create a GitHub repo: https://github.com/new"
echo "2. Push to GitHub:"
echo "   git commit -m 'Ready for Render deployment'"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Go to https://render.com"
echo "4. Sign in with GitHub"
echo "5. Create Web Service for backend (root: server)"
echo "6. Create Static Site for frontend (root: client)"
echo ""
echo "7. Update REACT_APP_SERVER_URL after backend deploys"
echo ""
echo "See RENDER_DEPLOYMENT.md for detailed instructions"
