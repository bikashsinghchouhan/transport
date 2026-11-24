# syntax=docker/dockerfile:1.7
# BuildKit is needed for the cache mounts below (Docker Compose v2 uses it by default).

# ==========================================
# Stage 1: Dependencies
# Re-runs only when package.json / package-lock.json change.
# ==========================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
# The npm download cache persists between builds, so a lockfile change only fetches new packages.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# ==========================================
# Stage 2: Next.js Builder
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Persist Next.js' incremental build cache (.next/cache) between builds.
# Unchanged pages and modules are reused, which is the biggest speed-up for repeat deploys.
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ==========================================
# Stage 3: Production Runner (only the standalone output, no node_modules)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_OPTIONS="--max-old-space-size=384"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Fonts read at runtime by src/app/opengraph-image.tsx
COPY --from=builder /app/assets ./assets

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
