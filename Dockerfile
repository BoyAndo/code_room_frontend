# ========================================
# STAGE 1: Dependencies (Usando npm)
# ========================================
# Usamos node:20-alpine (ya incluye npm)
FROM node:20-alpine AS deps

# Instalar libc6-compat para compatibilidad (necesario en Alpine)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias de npm
COPY package.json package-lock.json ./

# Instalar dependencias con npm clean install (npm ci)
# Usa --legacy-peer-deps para resolver conflictos de peer dependencies
RUN npm ci --legacy-peer-deps

# ========================================
# STAGE 2: Builder
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias instaladas desde la etapa 'deps'
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo el código fuente
COPY . .

# Configurar variables de entorno de build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Placeholders para build (valores reales se pasan en runtime)
# Las variables NEXT_PUBLIC_* se embeben en el build, las demás son para runtime
ENV JWT_SECRET=build-time-placeholder
ENV JWT_EXPIRES_IN=120h

# APIs públicas (se embeben en el build)
ENV NEXT_PUBLIC_API_URL=http://placeholder:3001
ENV NEXT_PUBLIC_AUTH_API_URL=http://placeholder:3001
ENV NEXT_PUBLIC_API_PROPERTIES_URL=http://placeholder:3002/api

# Google Maps (se embebe en el build)
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=placeholder-google-maps-key

# Supabase
ENV SUPABASE_URL=https://placeholder.supabase.co
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key

# Pusher
ENV PUSHER_APP_ID=placeholder-app-id
ENV PUSHER_SECRET=placeholder-secret
ENV PUSHER_KEY=placeholder-key
ENV PUSHER_CLUSTER=placeholder-cluster
ENV NEXT_PUBLIC_PUSHER_KEY=placeholder-key
ENV NEXT_PUBLIC_PUSHER_CLUSTER=placeholder-cluster

# Database
ENV DATABASE_URL=mysql://placeholder:placeholder@placeholder:3306/placeholder

# Build de Next.js con npm
RUN npm run build

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

# Copiar archivos de build y estáticos
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