import axios from 'axios';
import { getSession } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  const session = await getSession();
  const token = (session as any)?.accessToken;
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

export default api;
