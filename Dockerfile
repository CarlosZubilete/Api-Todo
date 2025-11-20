# ============================================
# STAGE 1: Dependencies & Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy package files and install all dependencies (including devDependencies for build)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client (required for TypeScript compilation)
RUN pnpm prisma generate

# Copy source files and build configuration
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN pnpm build

# ============================================
# STAGE 2: Production Runtime
# ============================================
FROM node:22-alpine AS runtime

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy package files and install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy Prisma schema from builder
COPY prisma ./prisma

# Copy node_modules and compiled application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application with proper signal handling
CMD ["node", "dist/app.js"]
