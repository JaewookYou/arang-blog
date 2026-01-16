#!/bin/bash
# deploy.sh - 수동 배포 스크립트
# 사용법: ./scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# 프로젝트 디렉토리로 이동
cd /home/arang/web/blog

# Git pull
echo "📥 Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# Dependencies 설치
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Build
echo "🔨 Building application..."
npm run build

# PM2 reload
echo "♻️ Reloading PM2..."
pm2 reload arang-blog --update-env

echo "✅ Deployment completed at $(date)"
