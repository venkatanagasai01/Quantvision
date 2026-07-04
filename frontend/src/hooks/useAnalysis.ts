import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';

const API_BASE = '/api/backend';

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

export function useStockAnalysis(symbol: string, token?: string) {
  return useQuery({
    queryKey: ['analyze', symbol],
    queryFn: async () => {
      if (!token) throw new Error("No auth token available");
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${token}`);
      const response = await fetch(`${API_BASE}/stocks/analyze/${symbol}`, { headers });
      if (response.status === 401) {
        // Token is invalid/expired in the backend, but NextAuth still thinks we are logged in.
        // Force a logout to clear the bad NextAuth session cookie.
        if (typeof window !== 'undefined') {
          const { signOut } = await import("next-auth/react");
          await signOut({ callbackUrl: "/login" });
        }
        throw new Error("Session expired. Logging out...");
      }
      if (!response.ok) throw new Error(`Failed to analyze ${symbol}`);
      return response.json() as Promise<AnalysisResponse>;
    },
    enabled: !!symbol && !!token,
    retry: 1,
  });
}
