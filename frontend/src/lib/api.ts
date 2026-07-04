import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

// Client-side: use relative path so Next.js proxy handles routing to backend
// The rewrite rule: /api/backend/:path* → http://backend/api/:path*
// So hooks that call api.get('/api/stocks/...') become /api/backend/stocks/... which maps to backend /api/stocks/...
const baseURL = typeof window !== 'undefined' 
  ? '/api/backend'  // client: Next.js proxy strips /api prefix and forwards
  : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'); // server: direct

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
  } catch (error) {
    console.error('Failed to get session in axios interceptor', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        signOut({ callbackUrl: '/login' });
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  const session = await getSession();
  const token = (session as any)?.accessToken;
  const headers = new Headers(init?.headers);
  console.log(`[fetchWithAuth] URL: ${input.toString()}, Has Session: ${!!session}, Has Token: ${!!token}`);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    console.warn(`[fetchWithAuth] No token available for request to ${input.toString()}`);
  }
  return fetch(input, { ...init, headers });
}

export default api;
