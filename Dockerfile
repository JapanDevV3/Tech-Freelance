# syntax=docker/dockerfile:1

# Node version follows .nvmrc
ARG NODE_VERSION=22

# ---- deps: install all dependencies (cached until the lockfile changes) ----
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- dev: hot-reload server; source is bind-mounted by docker-compose (profile "dev") ----
FROM node:${NODE_VERSION}-alpine AS dev
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# uid 1000 ("node") matches the usual host user, so bind-mounted files stay owned by you
RUN chown node:node /app && mkdir .next && chown node:node .next
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]

# ---- builder: produce the standalone Next.js build ----
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# next.config.ts reads this at build time for image remotePatterns
ARG R2_PUBLIC_URL
ENV R2_PUBLIC_URL=${R2_PUBLIC_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- migrator: one-shot job that applies Drizzle migrations (needs drizzle-kit, a devDependency) ----
FROM node:${NODE_VERSION}-alpine AS migrator
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json drizzle.config.ts ./
COPY src/db ./src/db
CMD ["npx", "drizzle-kit", "migrate"]

# ---- runner: minimal production image (default target) ----
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    LOCAL_UPLOAD_DIR=/app/storage/uploads

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Writable upload dir (STORAGE_DRIVER=local); mount a volume here to persist it
RUN mkdir -p "$LOCAL_UPLOAD_DIR" && chown -R nextjs:nodejs /app/storage

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/auth/providers').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
