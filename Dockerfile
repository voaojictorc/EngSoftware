# ── Stage 1: instalar dependências e fazer build ─────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia manifests e instala deps (cache-friendly)
COPY package.json package-lock.json* ./
RUN npm ci

# Copia o restante do código
COPY . .

# Gera o Prisma Client e faz build do Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ── Stage 2: imagem de produção ───────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copia artefatos do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3000

# Aplica o schema no banco (cria tabelas se não existirem) e inicia o servidor
# DATABASE_URL é injetado pelo docker-compose em runtime
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && npm start"]

