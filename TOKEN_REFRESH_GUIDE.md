# 🔄 Sistema de Auto-Refresh de Tokens

## Problema Resuelto

**Problema anterior:**
- El usuario se quedaba inactivo en la página
- El `authToken` (access token) expiraba después de 15 minutos
- Solo quedaba el `refreshToken` en las cookies
- Al intentar hacer peticiones, recibía error 401 "No se proporcionó token de autenticación"
- El usuario tenía que hacer login manualmente de nuevo

**Solución implementada:**
- Sistema automático de refresh de tokens
- Cuando una petición devuelve 401, se intenta refrescar el token automáticamente
- Si el refresh es exitoso, se reintenta la petición original
- Todo es transparente para el usuario

## 🏗️ Arquitectura de la Solución

### 1. **API Client** (`lib/api-client.ts`)

Cliente HTTP que intercepta todas las peticiones y maneja automáticamente el refresh:

```typescript
apiFetch(url, options)
  ↓
Petición inicial con authToken
  ↓
¿Respuesta 401?
  ├─ NO → Devolver respuesta
  └─ SÍ → Intentar refresh
       ↓
    Llamar a /auth/refresh con refreshToken
       ↓
    ¿Refresh exitoso?
      ├─ SÍ → Reintentar petición original → Devolver respuesta
      └─ NO → Redirigir a /login
```

### 2. **Flujo de Tokens**

```
LOGIN
  ↓
authToken (15 min) + refreshToken (7 días)
  ↓
Usuario navega por la app
  ↓
authToken expira después de 15 min
  ↓
Siguiente petición devuelve 401
  ↓
apiFetch detecta 401 y llama a /refresh
  ↓
Backend valida refreshToken
  ↓
Genera nuevo authToken (15 min)
  ↓
Frontend reintenta petición original
  ↓
✅ Petición exitosa (transparente para el usuario)
```

## 📋 Componentes Modificados

### Frontend

1. **`lib/api-client.ts`** (NUEVO)
   - `apiFetch()`: Cliente HTTP principal con auto-refresh
   - `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`: Helpers
   - Manejo de solicitudes concurrentes de refresh
   - Prevención de bucles infinitos

2. **`contexts/AuthContext.tsx`** (MODIFICADO)
   - Usa `apiFetch()` en lugar de `fetch()` directo
   - `checkAuth()`: Verifica autenticación con auto-refresh
   - `logout()`: Cierra sesión con auto-refresh

3. **`hooks/useProperties.ts`** (MODIFICADO)
   - `fetchProperties()`: Usa `apiFetch()`
   - `fetchAmenities()`: Usa `apiFetch()`
   - `confirmDeleteProperty()`: Usa `apiFetch()`

4. **`app/search/page.tsx`** (MODIFICADO)
   - `fetchProperties()`: Usa `apiFetch()`

### Backend (Ya existente)

1. **`/auth/refresh`** (Endpoint existente)
   - Valida el `refreshToken` de las cookies
   - Genera un nuevo `authToken`
   - Devuelve el nuevo token en cookies httpOnly

2. **`auth.middleware.ts`** (Ya existía)
   - Devuelve `shouldRefresh: true` cuando el token expira
   - Flag usado por el frontend (aunque no es estrictamente necesario)

## 🔑 Características Clave

### 1. **Manejo de Concurrencia**

Si múltiples peticiones fallan simultáneamente con 401:
- Solo se hace UN refresh
- Las demás peticiones esperan a que termine
- Todas se reintentan con el nuevo token

```typescript
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

if (isRefreshing && refreshPromise) {
  // Esperar al refresh en progreso
  await refreshPromise;
} else {
  // Iniciar nuevo refresh
  isRefreshing = true;
  refreshPromise = refreshAccessToken();
  await refreshPromise;
  isRefreshing = false;
}
```

### 2. **Prevención de Bucles Infinitos**

El endpoint `/auth/refresh` usa `skipRefresh: true`:

```typescript
const response = await fetch('http://localhost:3001/auth/refresh', {
  // No se intercepta esta petición
  skipRefresh: true, // Flag especial
});
```

### 3. **Redirección Automática a Login**

Si el refresh falla (refreshToken inválido o expirado):
- Se redirige automáticamente a `/login`
- El usuario debe autenticarse de nuevo

### 4. **Transparente para el Usuario**

El usuario NO nota que el token expiró:
- No ve errores
- No pierde el estado de la aplicación
- No tiene que hacer login manualmente

## 🚀 Uso

### Antes (sin auto-refresh)

```typescript
const response = await fetch('http://localhost:3002/api/properties', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Problema:** Si el token expira → Error 401 → Usuario debe hacer login

### Ahora (con auto-refresh)

```typescript
import { apiFetch } from '@/lib/api-client';

const response = await apiFetch('http://localhost:3002/api/properties');
```

**Beneficio:** Si el token expira → Refresh automático → Petición se reintenta → ✅ Éxito

## 📊 Ejemplos de Uso

### GET Request
```typescript
import { apiGet } from '@/lib/api-client';

const response = await apiGet('http://localhost:3002/api/properties');
const data = await response.json();
```

### POST Request
```typescript
import { apiPost } from '@/lib/api-client';

const response = await apiPost(
  'http://localhost:3002/api/properties',
  { title: 'Nueva propiedad', ... }
);
```

### PUT Request
```typescript
import { apiPut } from '@/lib/api-client';

const response = await apiPut(
  `http://localhost:3002/api/properties/${id}`,
  { title: 'Título actualizado', ... }
);
```

### DELETE Request
```typescript
import { apiDelete } from '@/lib/api-client';

const response = await apiDelete(
  `http://localhost:3002/api/properties/${id}`
);
```

## 🔍 Logs de Consola

El sistema imprime logs útiles para debugging:

```
🔑 Token expirado, intentando refrescar...
🔄 Intentando refrescar token...
✅ Token refrescado exitosamente
🔄 Reintentando solicitud original...
```

Si el refresh falla:
```
❌ Error al refrescar token: 401
❌ No se pudo refrescar el token, redirigiendo al login...
```

## ⚠️ Consideraciones

### 1. **Cookies httpOnly**
- Los tokens deben estar en cookies httpOnly (por seguridad)
- No se almacenan en localStorage ni sessionStorage
- El navegador los envía automáticamente con `credentials: 'include'`

### 2. **CORS**
- El backend debe permitir credentials en CORS:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

### 3. **Expiración del Refresh Token**
- Si el refreshToken expira (después de 7 días de inactividad)
- El usuario DEBE hacer login manualmente
- No hay forma de evitarlo por seguridad

### 4. **Endpoints que NO necesitan auth**
- Endpoints públicos no requieren `apiFetch`
- Pueden usar `fetch` normal
- Ejemplo: `/auth/login`, `/auth/register`

## 🧪 Testing

### Simular token expirado:
1. Hacer login normalmente
2. Esperar 15 minutos (o cambiar expiración en backend a 1 minuto)
3. Intentar cargar propiedades
4. Verificar en consola que se hace el refresh automáticamente
5. Las propiedades deben cargar sin error

### Simular refreshToken expirado:
1. Hacer login normalmente
2. En las DevTools, borrar la cookie `refreshToken`
3. Intentar hacer una petición
4. Verificar que redirige a `/login` automáticamente

## ✅ Checklist de Implementación

- [x] Crear `lib/api-client.ts` con lógica de auto-refresh
- [x] Actualizar `AuthContext.tsx` para usar `apiFetch`
- [x] Actualizar `useProperties.ts` para usar `apiFetch`
- [x] Actualizar `app/search/page.tsx` para usar `apiFetch`
- [x] Verificar que backend tiene endpoint `/auth/refresh`
- [x] Verificar que tokens están en cookies httpOnly
- [x] Verificar que CORS permite credentials
- [x] Probar manualmente el flujo de refresh
- [x] Documentar el sistema

## 🎉 Resultado Final

**Antes:**
- Usuario inactivo 15+ minutos → Error 401 → Login manual requerido

**Ahora:**
- Usuario inactivo 15+ minutos → Error 401 → Refresh automático → ✅ Funciona sin interrupciones

El usuario puede estar inactivo hasta **7 días** sin tener que hacer login de nuevo (mientras el refreshToken no expire). ¡Mucho mejor experiencia de usuario! 🚀
