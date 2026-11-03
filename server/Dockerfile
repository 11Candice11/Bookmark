# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy workspace manifests only (for better layer caching)
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install all workspace deps (production + dev – needed for prisma generate & tsx)
RUN npm ci --workspace=shared --workspace=server --include-workspace-root

# ── Stage 2: generate Prisma client ──────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root node_modules from deps stage (npm workspaces hoists everything here)
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY shared/ ./shared/
COPY server/ ./server/
COPY package.json ./

# Generate Prisma client inside the image.
# We pass a dummy DATABASE_URL since `prisma generate` doesn't connect to the DB;
# prisma.config.ts calls env("DATABASE_URL") so it must be set.
RUN cd server && DATABASE_URL=postgresql://dummy:dummy@localhost/dummy npx prisma generate

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server
COPY package.json ./

EXPOSE 4000

# Run migrations then start server using tsx (ESM-native TS runner)
CMD ["sh", "-c", "cd server && npx prisma migrate deploy && cd /app && node --import tsx/esm server/src/server.ts"]
