"use client";

import { Activity, Target, TrendingUp, TrendingDown, Layers } from "lucide-react";

interface WatchlistAnalyticsProps {
  data: any[];
  isLoading: boolean;
}

export default function WatchlistAnalytics({ data, isLoading }: WatchlistAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-white p-5 border border-slate-200/60 rounded-xl shadow-sm animate-pulse h-[104px]">
            <div className="h-3 w-20 bg-slate-200 rounded mb-4"></div>
            <div className="h-6 w-24 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalStocks = data?.length || 0;

  // Calculate averages ignoring items without reports (0.0 scores)
  const itemsWithConf = data?.filter((d) => d.confidence_score > 0) || [];
  const itemsWithSent = data?.filter((d) => d.sentiment_score !== 0) || [];

  const avgConfidence = itemsWithConf.length 
    ? (itemsWithConf.reduce((acc, curr) => acc + curr.confidence_score, 0) / itemsWithConf.length).toFixed(1)
    : "N/A";

  const avgSentiment = itemsWithSent.length
    ? (itemsWithSent.reduce((acc, curr) => acc + curr.sentiment_score, 0) / itemsWithSent.length).toFixed(2)
    : "N/A";

  // Find extremes
  const mostBullish = [...itemsWithConf].sort((a, b) => b.confidence_score - a.confidence_score)[0]?.symbol || "N/A";
  const mostBearish = [...itemsWithConf].sort((a, b) => a.confidence_score - b.confidence_score)[0]?.symbol || "N/A";

  const metrics = [
    { name: "TOTAL STOCKS", value: totalStocks, icon: Layers, color: "text-indigo-600" },
    { name: "AVG SENTIMENT", value: avgSentiment, icon: Activity, color: "text-amber-600" },
    { name: "AVG CONFIDENCE", value: `${avgConfidence}%`, icon: Target, color: "text-emerald-600" },
    { name: "MOST BULLISH", value: mostBullish, icon: TrendingUp, color: "text-emerald-600" },
    { name: "MOST BEARISH", value: mostBearish, icon: TrendingDown, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metrics.map((item) => (
        <div key={item.name} className="bg-white p-5 border border-slate-200/60 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</div>
            <item.icon className={`w-4 h-4 ${item.color} opacity-70`} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
