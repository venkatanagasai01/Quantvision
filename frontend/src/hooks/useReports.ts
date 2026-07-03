import { fetchWithAuth } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = 'http://localhost:8000/api';

export function useReports(page: number = 1, limit: number = 20, recommendation?: string, search?: string) {
  return useQuery({
    queryKey: ['reports', { page, limit, recommendation, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (recommendation && recommendation !== 'ALL') {
        params.append('recommendation', recommendation);
      }
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetchWithAuth(`${API_BASE}/reports?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
    staleTime: 60000,
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid ID");
      const response = await fetchWithAuth(`${API_BASE}/reports/${id}`);
      if (!response.ok) throw new Error('Failed to fetch report detail');
      return response.json();
    },
    enabled: !!id,
    staleTime: 300000, // Cache for 5 mins
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetchWithAuth(`${API_BASE}/reports/generate/${symbol}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to generate report');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate reports list to show the newly generated one
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
