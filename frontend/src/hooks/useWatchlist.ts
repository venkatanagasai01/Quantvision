import { fetchWithAuth } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = 'http://localhost:8000/api';

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/watchlist`);
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      return response.json();
    },
    // Poll every 15 seconds for real-time updates as requested
    refetchInterval: 15000, 
  });
}

export function useWatchlistMutations() {
  const queryClient = useQueryClient();

  const addSymbol = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetchWithAuth(`${API_BASE}/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add symbol');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const removeSymbol = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetchWithAuth(`${API_BASE}/watchlist/${symbol}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove symbol');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  return { addSymbol, removeSymbol };
}
