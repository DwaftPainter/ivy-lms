# ---------- 1. Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# tránh lỗi OpenSSL (Prisma)
RUN apk add --no-cache openssl

COPY package*.json ./

COPY prisma ./prisma

# tránh conflict deps React 19
RUN npm install --legacy-peer-deps

COPY . .

# Prisma generate (important)
RUN npx prisma generate

# Build Next
RUN npm run build


# ---------- 2. Run stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# copy minimal files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]