#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Starting Deployment for B2Transport"
echo "⏰ Time: $(date)"
echo "=========================================="

cd /var/www/transport

echo "📥 Fetching latest code from origin/prod..."
git fetch origin prod
git reset --hard origin/prod

echo "🐳 Building Docker image..."
docker compose build

echo "🔄 Restarting container..."
docker compose up -d --remove-orphans

echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "=========================================="
echo "✅ Deployment completed successfully!"
echo "=========================================="
