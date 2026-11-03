# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install all workspace deps (production + dev – needed for prisma generate & tsx)
RUN npm ci --workspace=shared --workspace=server --include-workspace-root

# ── Stage 2: build / generate ─────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules 2>/dev/null || true
COPY --from=deps /app/server/node_modules ./server/node_modules 2>/dev/null || true

# Copy source
COPY shared/ ./shared/
COPY server/ ./server/
COPY package.json ./

# Generate Prisma client inside the image
RUN npx --prefix server prisma generate

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only copy what the runtime needs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server
COPY package.json ./

EXPOSE 4000

# Run migrations then start server
CMD ["sh", "-c", "npx --prefix server prisma migrate deploy && node --import tsx/esm server/src/server.ts"]
