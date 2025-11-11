# Configuración de Google Maps API

## Pasos para obtener tu API Key de Google Maps:

### 1. Ve a Google Cloud Console
   - Abre https://console.cloud.google.com/

### 2. Crea o selecciona un proyecto
   - Click en el selector de proyectos (arriba a la izquierda)
   - Click en "Nuevo proyecto" o selecciona uno existente

### 3. Habilita la API de Maps JavaScript
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Maps JavaScript API"
   - Click en "Habilitar"

### 4. Crea una API Key
   - Ve a "APIs y servicios" > "Credenciales"
   - Click en "+ CREAR CREDENCIALES"
   - Selecciona "Clave de API"
   - Copia tu API Key

### 5. (Opcional) Restringe tu API Key
   - Click en tu API Key recién creada
   - En "Restricciones de la aplicación", selecciona "Referentes HTTP"
   - Agrega: `http://localhost:3000/*` para desarrollo
   - En "Restricciones de API", selecciona "Maps JavaScript API"

### 6. Configura tu proyecto
   - Crea un archivo `.env.local` en la raíz del proyecto frontend
   - Copia el contenido de `.env.local.example`
   - Reemplaza `TU_API_KEY_AQUI` con tu API Key real

```bash
# En la raíz del proyecto frontend
cp .env.local.example .env.local
# Edita .env.local y agrega tu API Key
```

### 7. Reinicia el servidor de desarrollo
```bash
npm run dev
```

## Características implementadas:

✅ **Carga única de la API**: La API de Google Maps se carga una sola vez a nivel global usando `GoogleMapsProvider`

✅ **Marcador personalizado**: Ubicación de la propiedad marcada con pin rojo

✅ **Controles optimizados**: Zoom y pantalla completa habilitados, streetView deshabilitado

✅ **Estado de carga**: Spinner mientras el mapa carga

✅ **Manejo de errores**: Mensajes claros si hay problemas al cargar el mapa

✅ **Link a Google Maps**: Enlace directo para ver la ubicación en Google Maps

✅ **Coordenadas centrales**: Si la propiedad no tiene coordenadas, centra en Santiago

## Estructura de archivos:

```
code_room_frontend/
├── contexts/
│   └── GoogleMapsContext.tsx       # Proveedor global de Google Maps
├── app/
│   ├── layout.tsx                  # Incluye GoogleMapsProvider
│   └── property/[id]/page.tsx      # Usa el hook useGoogleMaps
└── .env.local                      # Tu API Key (NO subir a git)
```

## Solución del error "google api is already presented":

**Antes**: Cada componente cargaba `LoadScript` individualmente, causando múltiples cargas de la API.

**Ahora**: 
- Un solo `GoogleMapsProvider` en el layout principal
- Todos los componentes usan el hook `useGoogleMaps()`
- La API se carga una sola vez globalmente
- No más errores de duplicación

## Troubleshooting:

### El mapa no se muestra
1. Verifica que tu API Key esté correctamente configurada en `.env.local`
2. Asegúrate de que "Maps JavaScript API" esté habilitada en Google Cloud Console
3. Revisa la consola del navegador para errores específicos
4. Reinicia el servidor de desarrollo después de cambiar `.env.local`

### Error "RefererNotAllowedMapError"
- Tu API Key está restringida pero `http://localhost:3000` no está en la lista de referentes permitidos
- Agrega `http://localhost:3000/*` en las restricciones de la API Key

### Error "ApiNotActivatedMapError"
- "Maps JavaScript API" no está habilitada para tu proyecto
- Ve a Google Cloud Console y habilita la API
