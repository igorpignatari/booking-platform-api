# =========================
# Stage 1: deps
# =========================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# =========================
# Stage 2: dev (hot reload)
# =========================
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# =========================
# Stage 3: builder
# =========================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# =========================
# Stage 4: prod (slim)
# =========================
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Only prod deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Run as non-root
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", "dist/main/main.js"]
