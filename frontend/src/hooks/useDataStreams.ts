import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useBacktestSignals(symbol: string) {
  return useQuery({
    queryKey: ["backtest-signals", symbol],
    queryFn: async () => {
      // Get latest backtest for symbol
      const listRes = await api.get(`/api/backtests?symbol=${symbol}&page_size=1`);
      if (listRes.data.items.length === 0) return [];
      
      const latestId = listRes.data.items[0].id;
      // Get report for trades
      const reportRes = await api.get(`/api/backtests/${latestId}/report`);
      return reportRes.data.trade_history || [];
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSentimentData(symbol: string) {
  return useQuery({
    queryKey: ["sentiment-history", symbol],
    queryFn: async () => {
      const res = await api.get(`/api/sentiment/${symbol}`);
      return res.data;
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5,
  });
}
