"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await api.get("/paper-trading/portfolio");
      return res.data;
    }
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await api.get("/paper-trading/positions");
      return res.data;
    }
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get("/paper-trading/orders");
      return res.data;
    }
  });
}

export function useTrades() {
  return useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const res = await api.get("/paper-trading/trades");
      return res.data;
    }
  });
}

export function usePerformance() {
  return useQuery({
    queryKey: ["performance"],
    queryFn: async () => {
      const res = await api.get("/paper-trading/performance");
      return res.data;
    }
  });
}

export function useExecuteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, shares, action }: { symbol: string; shares: number; action: "BUY" | "SELL" }) => {
      const endpoint = action === "BUY" ? "/paper-trading/buy" : "/paper-trading/sell";
      const response = await api.post(endpoint, { symbol, shares });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
  });
}
