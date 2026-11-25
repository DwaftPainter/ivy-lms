# ---------- 1. Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt pnpm và OpenSSL (cho Prisma)
RUN apk add --no-cache openssl && npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

COPY . .

# Prisma generate (important)
RUN pnpm prisma generate

# Build Next
RUN pnpm run build


# ---------- 2. Run stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl && npm install -g pnpm

# copy minimal files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["pnpm", "start"]
