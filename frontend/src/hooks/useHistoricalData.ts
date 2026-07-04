import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";

const API_BASE = '/api/backend';

export interface HistoricalDataResponse {
  symbol: string;
  candles: any[];
  volume: any[];
  sma50: any[];
  sma200: any[];
  rsi: any[];
  macd: {
    macd: any[];
    signal: any[];
    histogram: any[];
  };
}

export function useHistoricalData(symbol: string, token?: string) {
  return useQuery<HistoricalDataResponse>({
    queryKey: ["history", symbol],
    queryFn: async () => {
      if (!token) throw new Error("No auth token available");
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      const res = await fetch(`${API_BASE}/stocks/history/${symbol}`, { headers });
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          const { signOut } = await import("next-auth/react");
          await signOut({ callbackUrl: "/login" });
        }
        throw new Error("Session expired. Logging out...");
      }
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!symbol && !!token,
    staleTime: 1000 * 60 * 5,
  });
}
