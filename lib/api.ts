const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  async post(endpoint: string, data: any, isFormData: boolean = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🔵 Making POST request to:', url);

    const options: RequestInit = {
      method: 'POST',
      headers: {},
      credentials: 'include',
    };

    if (isFormData) {
      options.body = data;
    } else {
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      console.log('🟢 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('🔴 Server error:', response.status, response.statusText);
      }
      
      return response;
    } catch (error) {
      console.error('🔴 Fetch error:', error);
      throw new Error(`No se pudo conectar con el servidor. Verifica que esté corriendo en ${url}`);
    }
  },

  async get(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🔵 Making GET request to:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🟢 Response status:', response.status, response.statusText);
      return response;
    } catch (error) {
      console.error('🔴 Fetch error:', error);
      throw error;
    }
  }
};