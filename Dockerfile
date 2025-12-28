# syntax=docker/dockerfile:1.4

# -----------------------------
# Install dependencies (cached)
# -----------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# install build tools if native modules are needed (kept minimal)
RUN apk add --no-cache python3 make g++ bash

# copy only package manifests to leverage Docker layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# cache npm registry and node_modules between builds (requires BuildKit)
# Use npm ci when lockfile is valid for reproducible installs; fall back to npm install
# so builds don't fail when lockfile is out of sync (you should still update lockfile locally and commit it)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline || npm install --no-audit --no-fund --prefer-offline

# -----------------------------
# Builder stage
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules from deps stage to avoid reinstalling
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app (produces .next/standalone)
RUN npm run build

# -----------------------------
# Production image
# -----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only the needed artifacts from the builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ensure permissions are correct
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
