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

# Mặc định chạy API server + BullMQ worker chung 1 tiến trình
# (deploy free trên Render chỉ cần 1 web service).
# Muốn tách worker riêng: docker run <image> node src/workers/sos.worker.js
CMD ["node", "src/server.all.js"]
