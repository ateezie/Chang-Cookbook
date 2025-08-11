# Chang Cookbook - Production Dockerfile
FROM node:20-alpine AS base

# Build arguments for optimization
ARG BUILDPLATFORM
ARG TARGETPLATFORM
ARG NODE_VERSION=20

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Use npm ci with better caching and combine operations
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production && \
    npm cache clean --force

# Install dev dependencies for build stage  
FROM base AS dev-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# Use cache mount for dev dependencies too
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules

# Copy everything and then verify public directory
COPY . .

# Verify public directory exists and has content
RUN echo "=== Verifying public files in builder stage ===" && \
    ls -la . | grep public && \
    ls -la ./public/ && \
    ls -la ./public/images/ && \
    ls -la ./public/images/logo/ && \
    ls -la ./public/images/og/ && \
    ls -la ./public/images/recipes/ | head -5

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/data/production.db"
ENV JWT_SECRET="build-time-secret"
ENV NEXTAUTH_URL="http://localhost:3000"

# Generate Prisma Client
RUN npx prisma generate

# Optimize build for different architectures
RUN if [ "$TARGETPLATFORM" = "linux/arm64" ]; then \
      NODE_OPTIONS="--max-old-space-size=2048" npm run build; \
    else \
      NODE_OPTIONS="--max-old-space-size=4096" npm run build; \
    fi && \
    # Verify build completed successfully \
    [ -d ".next" ] && echo "✅ Build completed successfully" || exit 1

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# For Next.js standalone builds, public files must be in the root directory alongside server.js
# This is critical - standalone mode expects public files at the same level as server.js
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Verify the public directory structure for standalone mode
RUN echo "=== Verifying Next.js standalone public directory structure ===" && \
    ls -la . | grep -E "(server.js|public)" && \
    echo "=== Public directory contents ===" && \
    ls -la ./public/ && \
    ls -la ./public/images/ && \
    echo "=== Logo files ===" && \
    ls -la ./public/images/logo/ && \
    echo "=== OG files ===" && \
    ls -la ./public/images/og/ && \
    echo "=== Recipe images (sample) ===" && \
    ls -la ./public/images/recipes/ | head -3 && \
    echo "✅ Next.js standalone assets setup completed"

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy dependencies needed for scripts
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=deps /app/node_modules ./node_modules

# Copy scripts and init files
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/init-db.js ./init-db.js

# Create uploads directory
RUN mkdir -p ./public/uploads
RUN chown -R nextjs:nodejs ./public/uploads

# Create database directory with proper permissions
RUN mkdir -p ./data
RUN chown -R nextjs:nodejs ./data

# Install su-exec for user switching
RUN apk add --no-cache su-exec

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Initialize database as root (for permissions), then switch to nextjs user and start server
CMD ["sh", "-c", "node init-db.js && chown -R nextjs:nodejs /app/data && su-exec nextjs node server.js"]