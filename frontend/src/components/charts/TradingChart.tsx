"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries, LineSeries } from "lightweight-charts";

interface TradingChartProps {
  candles: any[];
  sma50?: any[];
  sma200?: any[];
  signals?: any[]; // optional array of { time: '...', position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'SELL' }
}

export function TradingChart({ candles, sma50, sma200, signals }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: 0, // Normal mode
      },
      timeScale: {
        borderColor: "#e2e8f0",
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
      },
    });

    chartRef.current = chart;

    // Price Series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candlestickSeries.setData(candles);

    // SMA50 Overlay
    if (sma50 && sma50.length > 0) {
      const sma50Series = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        title: "SMA 50",
      });
      sma50Series.setData(sma50);
    }

    // SMA200 Overlay
    if (sma200 && sma200.length > 0) {
      const sma200Series = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 2,
        title: "SMA 200",
      });
      sma200Series.setData(sma200);
    }

    chart.timeScale().fitContent();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles, sma50, sma200, signals]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
}
