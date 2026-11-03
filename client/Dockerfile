# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

# Install deps
RUN npm ci --workspace=shared --workspace=client --include-workspace-root

# Copy source
COPY shared/ ./shared/
COPY client/ ./client/

# Vite reads VITE_* vars at build time. API_URL is injected via
# docker-compose build args so the browser knows where to reach the API.
ARG VITE_API_BASE_URL=http://localhost:4000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build -w client

# ── Stage 2: serve with nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/client/dist /usr/share/nginx/html

# nginx config: serve SPA, proxy /api to the backend
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
