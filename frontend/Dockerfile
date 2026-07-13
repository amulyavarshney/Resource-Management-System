# dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are inlined at build time (browser-facing URLs)
ARG NEXT_PUBLIC_BACKEND_API=http://localhost:8000/api/v1
ARG NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
ARG NEXT_PUBLIC_MAX_HOURS=8
ARG NEXT_PUBLIC_FETCH_LOCK_INTERVAL=60000
ARG NEXT_PUBLIC_LAST_DATE=25

ENV NEXT_PUBLIC_BACKEND_API=$NEXT_PUBLIC_BACKEND_API \
    NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL \
    NEXT_PUBLIC_MAX_HOURS=$NEXT_PUBLIC_MAX_HOURS \
    NEXT_PUBLIC_FETCH_LOCK_INTERVAL=$NEXT_PUBLIC_FETCH_LOCK_INTERVAL \
    NEXT_PUBLIC_LAST_DATE=$NEXT_PUBLIC_LAST_DATE \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/auth >/dev/null || exit 1

CMD ["node", "server.js"]
