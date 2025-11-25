# ============================================
# STAGE 1: Dependencies & Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy package files and install all dependencies (including devDependencies)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy Prisma schema, migrations and seed.js ONLY (no seed.ts)
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma/migrations ./prisma/migrations
COPY prisma/seed.js ./prisma/seed.js

# Generate Prisma Client
RUN pnpm prisma generate

# Copy source files and build configuration (tsconfig needed only for build)
COPY tsconfig.json ./
COPY src ./src

# Build the application (ts -> js in /dist)
RUN pnpm build


# ============================================
# STAGE 2: Production Runtime
# ============================================
FROM node:22-alpine AS runtime

WORKDIR /app

# Enable pnpm for runtime scripts if needed
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy package.json and production node_modules from builder (no install in runtime)
COPY package.json pnpm-lock.yaml ./

# Copy node_modules built in the builder to runtime (includes all deps)
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled app, prisma schema, and seed (seed.js should be JS)
COPY --from=builder /app/dist ./dist

# COPY --from=builder /app/prisma/migrations ./prisma/migrations
# COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
# COPY --from=builder /app/prisma/seed.js ./prisma/seed.js

# Copy Prisma Client artifacts (migrations + schema + seed.js)
COPY --from=builder /app/prisma ./prisma

# IMPORTANT: ensure dev.db exists (will be overwritten by volume)
RUN touch ./prisma/dev.db

# Verify seed.js exists
RUN echo "Verifying prisma folder..." \
  && ls -la ./prisma \
  && [ -f ./prisma/seed.js ] \
  && [ ! -f ./prisma/seed.ts ]

# Copy an entrypoint script (will run migrations & seed at container start)
COPY ./docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => { if (r.statusCode !== 200) throw new Error(r.statusCode) })"

ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD ["node", "dist/app.js"]
