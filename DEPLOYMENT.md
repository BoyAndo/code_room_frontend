# 🚀 Deploy de Code Room Frontend en AWS EC2

## 📋 Requisitos Previos

1. **Instancia EC2** configurada con:
   - Ubuntu 20.04 o superior
   - Mínimo 2 GB RAM (recomendado 4 GB para builds)
   - 20 GB de disco
   - Puerto 3000 abierto en el Security Group
   - Docker y Docker Compose instalados

2. **GitHub Secrets** configurados en el repositorio:
   - `IP_SERVER`: IP pública de tu instancia EC2
   - `USERNAME`: Usuario SSH (generalmente `ubuntu`)
   - `KEY`: Clave privada SSH en formato PEM
   - `PORT`: Puerto SSH (generalmente `22`)

## 🔧 Configuración en el Servidor

### 1. Conectarse a la instancia EC2

```bash
ssh -i tu-clave.pem ubuntu@tu-ip-ec2
```

### 2. Crear el archivo .env en el servidor

```bash
cd /home/ubuntu/code_room_frontend
nano .env
```

Copiar el contenido de `.env.example` y ajustar los valores:

```env
# APIs (cambiar a IPs/dominios de producción)
NEXT_PUBLIC_API_URL=http://tu-ip-ec2:3001
NEXT_PUBLIC_AUTH_API_URL=http://tu-ip-ec2:3001
NEXT_PUBLIC_API_PROPERTIES_URL=http://tu-ip-ec2:3002/api

# JWT
JWT_SECRET=tu_jwt_secret_seguro
JWT_EXPIRES_IN=120h

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Pusher
PUSHER_APP_ID=tu_app_id
PUSHER_SECRET=tu_secret
PUSHER_KEY=tu_key
PUSHER_CLUSTER=tu_cluster
NEXT_PUBLIC_PUSHER_KEY=tu_key
NEXT_PUBLIC_PUSHER_CLUSTER=tu_cluster

# Database
DATABASE_URL=mysql://user:pass@host:3306/db
```

## 🚢 Despliegue Automático

### Opción 1: Via GitHub Actions (Recomendado)

1. Crear rama `production`:
```bash
git checkout -b production
git push origin production
```

2. El pipeline se ejecutará automáticamente al hacer push a `production`

### Opción 2: Manual en el Servidor

```bash
cd /home/ubuntu/code_room_frontend
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 🔍 Verificación del Despliegue

### 1. Ver logs del contenedor
```bash
docker compose logs -f
```

### 2. Verificar estado
```bash
docker compose ps
```

### 3. Probar health check
```bash
curl http://localhost:3000/api/health
```

### 4. Acceder desde el navegador
```
http://tu-ip-ec2:3000
```

## 🛠️ Comandos Útiles

### Ver logs en tiempo real
```bash
docker compose logs -f frontend
```

### Reiniciar el contenedor
```bash
docker compose restart
```

### Detener el servicio
```bash
docker compose down
```

### Limpiar espacio en disco
```bash
docker system prune -af --volumes
```

### Ver uso de recursos
```bash
docker stats
```

## 🔥 Troubleshooting

### El build falla por falta de memoria
**Solución**: Aumentar la RAM de la instancia EC2 (mínimo t3.medium con 4 GB)

### El contenedor no inicia
```bash
# Ver logs detallados
docker compose logs --tail=100

# Verificar variables de entorno
docker compose config
```

### Error de conexión con las APIs
- Verificar que las URLs en `.env` apunten a las IPs correctas
- Verificar que los Security Groups permitan tráfico entre servicios
- Verificar que los microservices estén corriendo

### Problemas de permisos
```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/code_room_frontend
```

## 📊 Monitoreo

### Ver uso de CPU y memoria
```bash
docker stats code-room-frontend
```

### Ver procesos dentro del contenedor
```bash
docker compose exec frontend ps aux
```

## 🔄 Actualización de Código

El pipeline automático se encarga de:
1. ✅ Sincronizar código nuevo
2. ✅ Detener contenedor antiguo
3. ✅ Limpiar imágenes antiguas
4. ✅ Construir nueva imagen
5. ✅ Levantar contenedor nuevo
6. ✅ Verificar health check

## 🌐 Configuración de Dominio (Opcional)

Si quieres usar un dominio en lugar de IP:

1. Configurar registro A en tu DNS apuntando a la IP de EC2
2. Instalar nginx como reverse proxy:

```bash
sudo apt install nginx
```

3. Crear configuración de nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Instalar SSL con Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## 📝 Notas Importantes

- El puerto **3000** debe estar abierto en el Security Group de AWS
- Las variables de entorno con prefijo `NEXT_PUBLIC_` se embeben en el build
- Si cambias variables `NEXT_PUBLIC_*`, debes hacer rebuild completo
- El healthcheck verifica que el servicio esté respondiendo cada 30 segundos
- El contenedor se reinicia automáticamente si falla (restart policy)

## 🔐 Seguridad

- ✅ Nunca commitear el archivo `.env` al repositorio
- ✅ Usar HTTPS en producción (nginx + certbot)
- ✅ Rotar secretos regularmente (JWT_SECRET, API keys)
- ✅ Configurar firewall (ufw) en la instancia EC2
- ✅ Mantener Docker actualizado

## 📞 Soporte

Si tienes problemas, revisa:
1. Logs del contenedor: `docker compose logs`
2. Estado del contenedor: `docker compose ps`
3. Uso de recursos: `docker stats`
4. Variables de entorno: `docker compose config`
