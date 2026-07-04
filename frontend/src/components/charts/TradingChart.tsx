"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
} from "lightweight-charts";

interface SignalMarker {
  time: string;
  position: "aboveBar" | "belowBar";
  color: string;
  shape: "arrowUp" | "arrowDown";
  text: string;
}

interface TradingChartProps {
  candles: any[];
  sma50?: any[];
  sma200?: any[];
  signals?: SignalMarker[];
}

function sortByTime(arr: any[]): any[] {
  return [...arr].sort((a, b) => {
    const ta = typeof a.time === "string" ? new Date(a.time).getTime() : Number(a.time);
    const tb = typeof b.time === "string" ? new Date(b.time).getTime() : Number(b.time);
    return ta - tb;
  });
}

export function TradingChart({ candles, sma50, sma200, signals }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !candles?.length) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      width: container.clientWidth,
      height: 450,
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "#94a3b8",
          style: 3,
          labelBackgroundColor: "#1e293b",
        },
        horzLine: {
          width: 1,
          color: "#94a3b8",
          style: 3,
          labelBackgroundColor: "#1e293b",
        },
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
    });

    // ── Candlestick series ────────────────────────
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candlestickSeries.setData(sortByTime(candles));

    // ── BUY / SELL markers (v5 API) ───────────────
    if (signals && signals.length > 0) {
      const sortedMarkers = sortByTime(signals).map((s) => ({
        time: s.time,
        position: s.position as "aboveBar" | "belowBar",
        color: s.color,
        shape: s.shape as "arrowUp" | "arrowDown",
        text: s.text,
        size: 1.5,
      }));
      // lightweight-charts v5: createSeriesMarkers(series, markers)
      createSeriesMarkers(candlestickSeries, sortedMarkers);
    }

    // ── SMA 50 (Blue) ─────────────────────────────
    if (sma50?.length) {
      const sma50Series = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        title: "SMA 50",
        priceLineVisible: false,
        lastValueVisible: true,
      });
      sma50Series.setData(sortByTime(sma50));
    }

    // ── SMA 200 (Amber) ───────────────────────────
    if (sma200?.length) {
      const sma200Series = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 2,
        title: "SMA 200",
        priceLineVisible: false,
        lastValueVisible: true,
      });
      sma200Series.setData(sortByTime(sma200));
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (container) chart.applyOptions({ width: container.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles, sma50, sma200, signals]);

  return (
    <div className="relative">
      {/* Chart legend */}
      <div className="flex items-center gap-4 px-2 pb-3 text-xs font-semibold text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          Bullish candle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
          Bearish candle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 bg-blue-400 inline-block" />
          SMA-50
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 bg-amber-400 inline-block" />
          SMA-200
        </span>
        {signals && signals.length > 0 && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-black text-base leading-none">▲</span>
              AI BUY signal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-red-500 font-black text-base leading-none">▼</span>
              AI SELL signal
            </span>
          </>
        )}
      </div>

      <div ref={chartContainerRef} className="w-full h-[450px]" />
    </div>
  );
}
