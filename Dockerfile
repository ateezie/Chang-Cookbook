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
RUN npm ci && npm cache clean --force

# Install dev dependencies for build stage
FROM base AS dev-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --include=dev && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./build.db"
ENV JWT_SECRET="build-time-secret"
ENV NEXTAUTH_URL="http://localhost:3000"

# Generate Prisma Client
RUN npx prisma generate

# Optimize build for different architectures
RUN if [ "$TARGETPLATFORM" = "linux/arm64" ]; then \
      echo "Building for ARM64 - using optimized settings" && \
      NODE_OPTIONS="--max-old-space-size=2048" npm run build; \
    else \
      npm run build; \
    fi

# Debug: List what's in the build output
RUN echo "=== Contents of /app ===" && ls -la /app
RUN echo "=== Contents of .next ===" && ls -la .next/ || echo "No .next directory"  
RUN echo "=== Contents of public ===" && ls -la public/ || echo "No public directory"
RUN echo "=== Public directory check ===" && [ -d "public" ] && echo "Public directory exists" || echo "Public directory missing"
RUN echo "=== Creating public if missing ===" && mkdir -p public

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# For Next.js standalone builds, public files need to be copied separately  
# Create public directory structure first with proper permissions
RUN mkdir -p ./public/images/recipes ./public/images/chefs ./public/images/logo ./public/images/og
# Copy public directory contents with verbose logging
COPY --from=builder --chown=nextjs:nodejs /app/public/. ./public/
# Verify critical files are present
RUN echo "=== Verifying public files ===" && \
    ls -la ./public/ && \
    echo "=== Logo files ===" && \
    ls -la ./public/images/logo/ 2>/dev/null || echo "Logo directory missing" && \
    echo "=== OG files ===" && \
    ls -la ./public/images/og/ 2>/dev/null || echo "OG directory missing"

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy dependencies needed for scripts
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=deps /app/node_modules ./node_modules

# Copy scripts for database setup
COPY --from=builder /app/scripts ./scripts

# Create uploads directory
RUN mkdir -p ./public/uploads
RUN chown -R nextjs:nodejs ./public/uploads

# Create database directory with proper permissions
RUN mkdir -p ./data
RUN chown -R nextjs:nodejs ./data

# Copy database initialization script
COPY --from=builder /app/init-db.js ./init-db.js

# Install su-exec for user switching
RUN apk add --no-cache su-exec

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Initialize database as root (for permissions), then switch to nextjs user and start server
CMD ["sh", "-c", "node init-db.js && chown -R nextjs:nodejs /app/data && su-exec nextjs node server.js"]