/**
 * API Client con auto-refresh de tokens
 * 
 * Este cliente intercepta las respuestas 401 y automáticamente
 * intenta refrescar el token usando el refreshToken
 */

interface FetchOptions extends RequestInit {
  skipRefresh?: boolean; // Para evitar bucles infinitos
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresca el access token usando el refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    console.log('🔄 Intentando refrescar token...');
    
    const response = await fetch('http://localhost:3001/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Envía las cookies (refreshToken)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token refrescado exitosamente');
      return true;
    }

    console.error('❌ Error al refrescar token:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error de red al refrescar token:', error);
    return false;
  }
}

/**
 * Wrapper de fetch que maneja automáticamente el refresh de tokens
 * 
 * @param url - URL del endpoint
 * @param options - Opciones de fetch
 * @returns Response
 */
export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  // Asegurar que siempre se envíen las cookies
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const fetchOptions: RequestInit = {
    ...options,
    // No enviar credenciales/cookies
  };

  // Solo agregar headers de Content-Type y Accept si no es FormData
  if (!(options.body instanceof FormData)) {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } else {
    // Para FormData, solo agregar headers personalizados si existen
    fetchOptions.headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Primera solicitud
  let response = await fetch(url, fetchOptions);

  // Si es 401 y no es una solicitud de refresh, intentar refrescar
  if (response.status === 401 && !options.skipRefresh) {
    console.log('🔑 Token expirado, intentando refrescar...');

    // Si ya hay un refresh en progreso, esperar a que termine
    if (isRefreshing && refreshPromise) {
      console.log('⏳ Esperando refresh en progreso...');
      const success = await refreshPromise;
      
      if (success) {
        // Reintentar la solicitud original
        console.log('🔄 Reintentando solicitud original...');
        response = await fetch(url, fetchOptions);
      }
    } else {
      // Iniciar un nuevo refresh
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
      
      const success = await refreshPromise;
      
      isRefreshing = false;
      refreshPromise = null;
      
      if (success) {
        // Reintentar la solicitud original con el nuevo token
        console.log('🔄 Reintentando solicitud original...');
        response = await fetch(url, fetchOptions);
      } else {
        // Si el refresh falló, redirigir al login SOLO si no estamos ya allí
        console.error('❌ No se pudo refrescar el token');
        
        // Solo redirigir si estamos en el navegador Y no estamos en login/register
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
            console.log('🔀 Redirigiendo a login desde:', currentPath);
            window.location.href = '/login';
          } else {
            console.log('ℹ️ Ya estamos en página pública, no se redirige');
          }
        }
      }
    }
  }

  return response;
}

/**
 * Helper para hacer GET requests con auto-refresh
 */
export async function apiGet(url: string, options?: FetchOptions) {
  return apiFetch(url, { ...options, method: 'GET' });
}

/**
 * Helper para hacer POST requests con auto-refresh
 */
export async function apiPost(
  url: string,
  body?: any,
  options?: FetchOptions
) {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper para hacer PUT requests con auto-refresh
 */
export async function apiPut(
  url: string,
  body?: any,
  options?: FetchOptions
) {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper para hacer DELETE requests con auto-refresh
 */
export async function apiDelete(url: string, options?: FetchOptions) {
  return apiFetch(url, { ...options, method: 'DELETE' });
}
