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
ENV JWT_SECRET="kJ8#mN9$pQ2@wE5!rT7&yU1*iO3^aS6%dF4+gH0-lK9=xC2@vB5!nM8%zQ7*wE3&"
ENV JWT_EXPIRES_IN=120h

# APIs públicas (se embeben en el build)
ENV NEXT_PUBLIC_API_URL="http://13.216.81.127:3001"
ENV NEXT_PUBLIC_AUTH_API_URL="http://13.216.81.127:3001"
ENV NEXT_PUBLIC_API_PROPERTIES_URL="http://98.95.218.170:3002/api"

# Google Maps (se embebe en el build)
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBQNL9rePdFP6H5sW-iPkLsjjGj_GPYNGg

# Supabase
ENV SUPABASE_URL=https://ndpaoevxeuoxiobeszth.supabase.co
ENV SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGFvZXZ4ZXVveGlvYmVzenRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU2MDA1NiwiZXhwIjoyMDc4MTM2MDU2fQ.H9SO6_zV>

ENV NEXT_PUBLIC_SUPABASE_URL=https://ndpaoevxeuoxiobeszth.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGFvZXZ4ZXVveGlvYmVzenRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjAwNTYsImV4cCI6MjA3ODEzNjA1Nn0.g2GgIKYz0YJFwWhDb0nN3ZRUyosKlCDv4Ob4HyJC8EU

# Pusher
ENV PUSHER_APP_ID=2074834
ENV PUSHER_SECRET=fa7b699720e34f55212d
ENV PUSHER_KEY=77b62dbd0fef77f784c9
ENV PUSHER_CLUSTER=mt1

ENV NEXT_PUBLIC_PUSHER_KEY=77b62dbd0fef77f784c9
ENV NEXT_PUBLIC_PUSHER_CLUSTER=mt1

# Database
ENV DATABASE_URL=mysql://root:howlin404@uroom.cbmkwgi8u37x.us-east-1.rds.amazonaws.com:3306/code_room

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