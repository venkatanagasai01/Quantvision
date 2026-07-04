import { useQuery } from "@tanstack/react-query";

const API_BASE = '/api/backend';

export function useBacktestSignals(symbol: string, token?: string) {
  return useQuery({
    queryKey: ["backtest-signals", symbol],
    queryFn: async () => {
      if (!token) throw new Error("No auth token available");
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      
      const listRes = await fetch(`${API_BASE}/backtests?symbol=${symbol}&page_size=1`, { headers });
      if (listRes.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      if (!listRes.ok) return [];
      const listData = await listRes.json();
      
      if (listData.items.length === 0) return [];
      
      const latestId = listData.items[0].id;
      const reportRes = await fetch(`${API_BASE}/backtests/${latestId}/report`, { headers });
      if (reportRes.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      if (!reportRes.ok) return [];
      const reportData = await reportRes.json();
      
      return reportData.trade_history || [];
    },
    enabled: !!symbol && !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSentimentData(symbol: string, token?: string) {
  return useQuery({
    queryKey: ["sentiment-history", symbol],
    queryFn: async () => {
      if (!token) throw new Error("No auth token available");
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      
      const res = await fetch(`${API_BASE}/sentiment/${symbol}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch sentiment");
      return res.json();
    },
    enabled: !!symbol && !!token,
    staleTime: 1000 * 60 * 5,
  });
}
