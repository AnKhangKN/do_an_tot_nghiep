# ---------- Stage 1: install dependencies ----------
FROM node:22.22.3-slim AS deps
WORKDIR /app

# Build tools cho native module (bcrypt) nếu không có prebuilt binary
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Stage 2: runtime ----------
FROM node:22.22.3-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

EXPOSE 8080

# Mặc định chạy API server (npm start)
# Muốn chạy worker: docker run --env-file .env.production <image> node src/workers/sos.worker.js
CMD ["node", "src/server.js"]
