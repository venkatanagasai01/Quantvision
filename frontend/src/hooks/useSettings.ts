import { fetchWithAuth } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = 'http://localhost:8000/api/settings';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/profile`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    staleTime: 300000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; profile_image?: string }) => {
      const response = await fetchWithAuth(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/preferences`);
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
    staleTime: 300000,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { theme: string; risk_profile: string; benchmark: string; notifications: any }) => {
      const response = await fetchWithAuth(`${API_BASE}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/export`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to export data');
      return response.json();
    },
  });
}
