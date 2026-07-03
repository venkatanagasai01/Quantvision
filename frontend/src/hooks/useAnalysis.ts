import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AnalysisResponse {
  symbol: string;
  recommendation: string;
  confidence_score: number;
  technical_score: number;
  fundamental_score: number;
  risk_score: number;
  sentiment_score?: number;
  strengths: string[];
  weaknesses: string[];
  investment_thesis: string;
  risk_factors: string[];
}

export function useStockAnalysis(symbol: string) {
  return useQuery({
    queryKey: ['analyze', symbol],
    queryFn: async () => {
      const response = await api.get<AnalysisResponse>(`/api/stocks/analyze/${symbol}`);
      return response.data;
    },
    enabled: !!symbol, // Only fetch if a symbol is provided
    retry: 1,
  });
}
