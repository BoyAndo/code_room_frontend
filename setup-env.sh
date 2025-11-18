#!/bin/bash

# ========================================
# Script para configurar variables de entorno del sistema en EC2
# ========================================
# Uso: sudo bash setup-env.sh
# Este script debe ejecutarse en la instancia EC2 con permisos de root

echo "🔧 Configurando variables de entorno del sistema para Code Room Frontend..."

# Crear directorio si no existe
mkdir -p /etc/environment.d

# Crear archivo de configuración
cat > /etc/environment.d/code_room_frontend.conf <<'EOF'
# ========================================
# Code Room Frontend Environment Variables
# ========================================

# JWT Configuration
export JWT_SECRET="REEMPLAZAR_CON_TU_JWT_SECRET"
export JWT_EXPIRES_IN="120h"

# API URLs (Cambiar a tus URLs de producción)
export NEXT_PUBLIC_API_URL="http://TU_IP_EC2:3001"
export NEXT_PUBLIC_AUTH_API_URL="http://TU_IP_EC2:3001"
export NEXT_PUBLIC_API_PROPERTIES_URL="http://TU_IP_EC2:3002/api"

# Google Maps API Key
export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="TU_API_KEY_DE_GOOGLE_MAPS"

# Supabase Server (Service Role)
export SUPABASE_URL="https://tu-proyecto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"

# Supabase Client (Anon Key)
export NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="TU_ANON_KEY"

# Pusher Server
export PUSHER_APP_ID="TU_APP_ID"
export PUSHER_SECRET="TU_SECRET"
export PUSHER_KEY="TU_KEY"
export PUSHER_CLUSTER="TU_CLUSTER"

# Pusher Client
export NEXT_PUBLIC_PUSHER_KEY="TU_KEY"
export NEXT_PUBLIC_PUSHER_CLUSTER="TU_CLUSTER"

# Database
export DATABASE_URL="mysql://user:password@host:3306/database"
EOF

echo "✅ Archivo de configuración creado en /etc/environment.d/code_room_frontend.conf"
echo ""
echo "⚠️  IMPORTANTE: Debes editar el archivo y reemplazar los valores de ejemplo:"
echo "   sudo nano /etc/environment.d/code_room_frontend.conf"
echo ""
echo "📝 Después de editar, carga las variables con:"
echo "   source /etc/environment.d/code_room_frontend.conf"
echo ""
echo "🔒 Asegúrate de proteger este archivo:"
echo "   sudo chmod 600 /etc/environment.d/code_room_frontend.conf"
echo "   sudo chown root:root /etc/environment.d/code_room_frontend.conf"
