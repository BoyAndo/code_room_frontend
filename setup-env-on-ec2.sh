#!/bin/bash

# ========================================
# Script para crear .env en la instancia EC2
# ========================================
# Ejecuta este script EN LA INSTANCIA EC2:
# ssh -i tu-clave.pem ubuntu@tu-ip-ec2
# cd /home/ubuntu/code_room_frontend
# nano setup-env-on-ec2.sh
# chmod +x setup-env-on-ec2.sh
# ./setup-env-on-ec2.sh

echo "🔧 Creando archivo .env para Code Room Frontend..."

# Crear archivo .env
cat > .env <<'EOF'
# ----------------- NEXT.JS/AUTH VARIABLES -----------------
JWT_SECRET=kJ8#mN9$pQ2@wE5!rT7&yU1*iO3^aS6%dF4+gH0-lK9=xC2@vB5!nM8%zQ7*wE3&
JWT_EXPIRES_IN=120h

# URLs de las APIs (CAMBIAR A TUS IPs/DOMINIOS DE PRODUCCIÓN)
NEXT_PUBLIC_API_URL=http://TU_IP_EC2:3001
NEXT_PUBLIC_AUTH_API_URL=http://TU_IP_EC2:3001
NEXT_PUBLIC_API_PROPERTIES_URL=http://TU_IP_EC2:3002/api

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBQNL9rePdFP6H5sW-iPkLsjjGj_GPYNGg

PORT=3000

# ----------------- CHAT/REAL-TIME VARIABLES -----------------

# Supabase Server
SUPABASE_URL=https://ndpaoevxeuoxiobeszth.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGFvZXZ4ZXVveGlvYmVzenRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU2MDA1NiwiZXhwIjoyMDc4MTM2MDU2fQ.H9SO6_zVPJ5bVc5lx_J3dXzDJdX8gyvDXBKfyhXFdnw

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL=https://ndpaoevxeuoxiobeszth.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGFvZXZ4ZXVveGlvYmVzenRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjAwNTYsImV4cCI6MjA3ODEzNjA1Nn0.g2GgIKYz0YJFwWhDb0nN3ZRUyosKlCDv4Ob4HyJC8EU

# Pusher Server
PUSHER_APP_ID=2074834
PUSHER_SECRET=fa7b699720e34f55212d
PUSHER_KEY=77b62dbd0fef77f784c9
PUSHER_CLUSTER=mt1

# Pusher Client
NEXT_PUBLIC_PUSHER_KEY=77b62dbd0fef77f784c9
NEXT_PUBLIC_PUSHER_CLUSTER=mt1

# ----------------- DATABASE VARIABLES -----------------
DATABASE_URL=mysql://root:howlin404@uroom.cbmkwgi8u37x.us-east-1.rds.amazonaws.com:3306/code_room
EOF

echo "✅ Archivo .env creado en $(pwd)/.env"
echo ""
echo "⚠️  IMPORTANTE: Edita el archivo y cambia los valores según tu entorno:"
echo "   nano .env"
echo ""
echo "📝 Cambia especialmente:"
echo "   - NEXT_PUBLIC_API_URL (debe apuntar a tu IP de EC2)"
echo "   - NEXT_PUBLIC_AUTH_API_URL (debe apuntar a tu IP de EC2)"
echo "   - NEXT_PUBLIC_API_PROPERTIES_URL (debe apuntar a tu IP de EC2)"
echo ""
echo "🔒 Protege el archivo .env:"
echo "   chmod 600 .env"
echo "   chown ubuntu:ubuntu .env"
