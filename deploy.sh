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
# BuildKit enables the npm and .next/cache cache mounts in the Dockerfile,
# so repeat deploys reuse downloads and unchanged build output.
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose build

echo "🔄 Restarting container..."
docker compose up -d --remove-orphans

echo "🧹 Cleaning up unused Docker images..."
docker image prune -f
# Keep the last week of build cache (fast rebuilds) but stop it growing forever.
docker builder prune -f --filter "until=168h" >/dev/null || true

echo "=========================================="
echo "✅ Deployment completed successfully!"
echo "=========================================="
