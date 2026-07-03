"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, LineSeries } from "lightweight-charts";
import { format, parseISO } from "date-fns";

export function SentimentTimeline({ sentimentData }: { sentimentData: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !sentimentData?.articles || sentimentData.articles.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#64748b" },
      grid: { vertLines: { color: "#f1f5f9" }, horzLines: { color: "#f1f5f9" } },
      width: containerRef.current.clientWidth,
      height: 250,
      timeScale: {
        timeVisible: true,
      }
    });

    const series = chart.addSeries(LineSeries, {
      color: "#ec4899",
      lineWidth: 2,
      title: "FinBERT Score",
    });

    // Map articles to timeline data
    // Assuming pos_score is 0-1, we map to 0-100
    const data = sentimentData.articles
      .map((a: any) => ({
        time: new Date(a.published_at).getTime() / 1000,
        value: Number((a.pos_score * 100).toFixed(1))
      }))
      .sort((a: any, b: any) => a.time - b.time); // Must be strictly ascending

    // Remove strict duplicates
    const uniqueData = data.filter((v: any, i: number, a: any) => i === 0 || v.time !== a[i-1].time);

    series.setData(uniqueData);
    chart.timeScale().fitContent();

    const handleResize = () => chart.applyOptions({ width: containerRef.current?.clientWidth });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [sentimentData]);

  if (!sentimentData?.articles || sentimentData.articles.length === 0) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-[300px]">
        <p className="text-sm font-medium text-slate-500">No recent news articles found to construct sentiment timeline.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6 h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sentiment NLP History</h3>
        <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded">Avg Score: {sentimentData.sentiment_score?.toFixed(1) || 'N/A'}</span>
      </div>
      <div ref={containerRef} className="w-full flex-1" />
    </div>
  );
}
