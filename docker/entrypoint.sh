#!/bin/sh
set -e

# Ensure pnpm available (corepack) - safe no-op if already prepared
corepack enable
corepack prepare pnpm@10.20.0 --activate

# Generate Prisma client (idempotent)
if [ -f ./node_modules/.bin/prisma ]; then
  pnpm prisma generate || true
fi

# Apply migrations if any, otherwise push schema (works for SQLite)
# We try migrate deploy (for real migrations), fallback to db push.
pnpm prisma migrate deploy || pnpm prisma db push

# Run seed if env vars present (idempotent because you used upsert)
# Prisma executes package.json -> "prisma.seed"
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASS" ]; then
  echo "Running seed (ADMIN_EMAIL detected) ..."
  pnpm prisma db seed || echo "Seed finished (non-fatal error allowed)"
else
  echo "ADMIN_EMAIL or ADMIN_PASS not set → skipping seed"
fi

# Finally exec the CMD (this allows docker run ... <override cmd>)
exec "$@"
