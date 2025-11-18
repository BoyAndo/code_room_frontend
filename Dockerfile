# ========================================
# STAGE 1: Dependencies
# ========================================
FROM node:20-alpine AS deps

# Instalar libc6-compat para compatibilidad
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias con pnpm
RUN pnpm install --frozen-lockfile

# ========================================
# STAGE 2: Builder
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo el código fuente
COPY . .

# Configurar variables de entorno de build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Placeholder para JWT_SECRET (solo para build, no se usa)
ENV JWT_SECRET=build-time-placeholder

# Build de Next.js con pnpm
RUN pnpm run build

# ========================================
# STAGE 3: Runner (Producción)
# ========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicio
CMD ["node", "server.js"]
