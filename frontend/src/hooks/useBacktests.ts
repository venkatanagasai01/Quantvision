import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BacktestRequest {
  symbol: string;
  benchmark: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
}

export function useBacktests(page: number = 1, pageSize: number = 20, symbol?: string) {
  return useQuery({
    queryKey: ['backtests', page, pageSize, symbol],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (symbol) params.append('symbol', symbol);
      
      const response = await api.get(`/api/backtests?${params.toString()}`);
      return response.data;
    },
  });
}

export function useBacktestReport(id: number) {
  return useQuery({
    queryKey: ['backtestReport', id],
    queryFn: async () => {
      const response = await api.get(`/api/backtests/${id}/report`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRunBacktest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BacktestRequest) => {
      const response = await api.post('/api/backtests/run', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the list so the table refreshes
      queryClient.invalidateQueries({ queryKey: ['backtests'] });
    },
  });
}

export function useDeleteBacktest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/backtests/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtests'] });
    },
  });
}
