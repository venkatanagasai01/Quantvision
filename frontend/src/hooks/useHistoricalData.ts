import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

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

export function useHistoricalData(symbol: string) {
  return useQuery<HistoricalDataResponse>({
    queryKey: ["history", symbol],
    queryFn: async () => {
      const res = await api.get(`/api/stocks/history/${symbol}`);
      return res.data;
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}
