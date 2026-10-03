export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export function authToken(): string | null {
  return sessionStorage.getItem('flow_api_token');
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  const token = authToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(path.startsWith('http') ? path : `${API_BASE_URL}${path}`, { ...init, headers });
}
