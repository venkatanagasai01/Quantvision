import { fetchWithAuth } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Use relative path so Next.js proxy handles routing to the backend
const API_BASE = '/api/backend';

export function useMarketOverview() {
  return useQuery({
    queryKey: ['market-overview'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/dashboard/market-overview`);
      if (!response.ok) throw new Error('Failed to fetch market overview');
      return response.json();
    },
    staleTime: 60000,
    retry: 1,
  });
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/dashboard/portfolio-summary`);
      if (!response.ok) throw new Error('Failed to fetch portfolio summary');
      return response.json();
    },
    staleTime: 60000,
    retry: 1,
  });
}



export function useAlerts() {
  return useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/dashboard/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
    staleTime: 30000,
    retry: 1,
  });
}

export function useEquityCurve() {
  return useQuery({
    queryKey: ['equity-curve'],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/dashboard/equity-curve`);
      if (!response.ok) throw new Error('Failed to fetch equity curve');
      return response.json();
    },
    staleTime: 60000,
    retry: 1,
  });
}

export function useLatestExplainability() {
  return useQuery({
    queryKey: ['latest-explainability'],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE}/dashboard/explainability/latest`);
      if (!response.ok) throw new Error('Failed to fetch explainability');
      return response.json();
    },
    staleTime: 60000,
    retry: 1,
  });
}
