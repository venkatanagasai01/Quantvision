"use client";

import { useState, useEffect, useRef } from "react";
import { VolumeChart } from "./VolumeChart";
import { createChart, ColorType, LineSeries, HistogramSeries } from "lightweight-charts";
import { HelpCircle, TrendingUp, BarChart3, Activity } from "lucide-react";

// ─── Shared chart creator ─────────────────────────────────────
function useChartContainer(data: any, builder: (chart: any) => void, deps: any[]) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      width: containerRef.current.clientWidth,
      height: 200,
      crosshair: {
        mode: 1,
        vertLine: { color: "#94a3b8", style: 3, labelBackgroundColor: "#1e293b" },
        horzLine: { color: "#94a3b8", style: 3, labelBackgroundColor: "#1e293b" },
      },
      timeScale: { borderColor: "rgba(255, 255, 255, 0.1)", timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: "rgba(255, 255, 255, 0.1)" },
    });

    builder(chart);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

// ─── RSI Chart ────────────────────────────────────────────────
function RSIChart({ data }: { data: any[] }) {
  const containerRef = useChartContainer(data, (chart) => {
    if (!data?.length) return;

    const rsiSeries = chart.addSeries(LineSeries, {
      color: "#8b5cf6",
      lineWidth: 2,
      title: "RSI",
      priceLineVisible: false,
    });

    const sorted = [...data].sort((a, b) => {
      const ta = typeof a.time === "string" ? new Date(a.time).getTime() : a.time;
      const tb = typeof b.time === "string" ? new Date(b.time).getTime() : b.time;
      return ta - tb;
    });
    rsiSeries.setData(sorted);

    // Overbought line at 70
    chart.addSeries(LineSeries, {
      color: "#ef4444",
      lineWidth: 1,
      lineStyle: 2, // dashed
      title: "Overbought (70)",
      priceLineVisible: false,
      lastValueVisible: false,
    }).setData(sorted.map(d => ({ time: d.time, value: 70 })));

    // Oversold line at 30
    chart.addSeries(LineSeries, {
      color: "#10b981",
      lineWidth: 1,
      lineStyle: 2, // dashed
      title: "Oversold (30)",
      priceLineVisible: false,
      lastValueVisible: false,
    }).setData(sorted.map(d => ({ time: d.time, value: 30 })));

    // Neutral 50 line
    chart.addSeries(LineSeries, {
      color: "#475569",
      lineWidth: 1,
      lineStyle: 2,
      title: "Neutral (50)",
      priceLineVisible: false,
      lastValueVisible: false,
    }).setData(sorted.map(d => ({ time: d.time, value: 50 })));
  }, [data]);

  return (
    <div>
      {/* Zone legend */}
      <div className="flex items-center gap-4 mb-3 flex-wrap text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-red-500">
          <span className="w-4 h-0.5 bg-red-400 inline-block border-dashed" /> Above 70 = Overbought (potential SELL signal)
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-4 h-0.5 bg-emerald-400 inline-block" /> Below 30 = Oversold (potential BUY signal)
        </span>
        <span className="flex items-center gap-1.5 text-violet-400">
          <span className="w-4 h-0.5 bg-violet-400 inline-block" /> RSI line
        </span>
      </div>
      <div ref={containerRef} className="w-full h-[200px]" />
      {/* RSI zones explanation */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { range: "0 – 30", label: "Oversold Zone", desc: "Stock may be undervalued. Look for BUY opportunities.", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
          { range: "30 – 70", label: "Neutral Zone", desc: "Normal momentum. No extreme reading.", color: "bg-white/5 border-white/10 text-slate-300" },
          { range: "70 – 100", label: "Overbought Zone", desc: "Stock may be overvalued. Look for SELL signals.", color: "bg-red-500/10 border-red-500/20 text-red-400" },
        ].map((z, i) => (
          <div key={i} className={`text-xs rounded-lg border px-2 py-1.5 ${z.color}`}>
            <div className="font-black text-[11px]">{z.range}</div>
            <div className="font-bold">{z.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MACD Chart ───────────────────────────────────────────────
function MACDChart({ data }: { data: any }) {
  const containerRef = useChartContainer(data, (chart) => {
    if (!data) return;

    const sortFn = (a: any, b: any) => {
      const ta = typeof a.time === "string" ? new Date(a.time).getTime() : a.time;
      const tb = typeof b.time === "string" ? new Date(b.time).getTime() : b.time;
      return ta - tb;
    };

    // Histogram
    if (data.histogram?.length) {
      const hist = chart.addSeries(HistogramSeries, {
        color: "#10b981",
        priceLineVisible: false,
        lastValueVisible: false,
        title: "Histogram",
      });
      hist.setData([...data.histogram].sort(sortFn).map((d: any) => ({
        ...d,
        color: (d.value ?? 0) >= 0 ? "#10b981" : "#ef4444",
      })));
    }

    // MACD line (blue)
    if (data.macd?.length) {
      const macdLine = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        title: "MACD",
        priceLineVisible: false,
      });
      macdLine.setData([...data.macd].sort(sortFn));
    }

    // Signal line (orange)
    if (data.signal?.length) {
      const signalLine = chart.addSeries(LineSeries, {
        color: "#f97316",
        lineWidth: 2,
        title: "Signal",
        priceLineVisible: false,
      });
      signalLine.setData([...data.signal].sort(sortFn));
    }

    // Zero line (grey dashed)
    const base = data.macd || data.signal || data.histogram || [];
    if (base.length) {
      chart.addSeries(LineSeries, {
        color: "#475569",
        lineWidth: 1,
        lineStyle: 2,
        title: "Zero",
        priceLineVisible: false,
        lastValueVisible: false,
      }).setData([...base].sort(sortFn).map((d: any) => ({ time: d.time, value: 0 })));
    }
  }, [data]);

  return (
    <div>
      {/* MACD legend */}
      <div className="flex items-center gap-4 mb-3 flex-wrap text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-blue-400">
          <span className="w-4 h-0.5 bg-blue-500 inline-block" /> MACD Line
        </span>
        <span className="flex items-center gap-1.5 text-orange-400">
          <span className="w-4 h-0.5 bg-orange-400 inline-block" /> Signal Line
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-4 h-2 bg-emerald-400/60 inline-block rounded" /> Histogram (Green=Bullish, Red=Bearish)
        </span>
      </div>
      <div ref={containerRef} className="w-full h-[200px]" />
      {/* MACD reading guide */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-blue-400">
          <div className="font-black mb-0.5">MACD crosses above Signal →</div>
          <div>Bullish momentum. Possible BUY setup.</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400">
          <div className="font-black mb-0.5">MACD crosses below Signal →</div>
          <div>Bearish momentum. Possible SELL setup.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────
const TABS = [
  {
    id: "Volume",
    icon: BarChart3,
    desc: "Daily trading volume. Surging volume confirms a price move; falling volume suggests it may reverse.",
    color: "text-sky-400",
  },
  {
    id: "RSI",
    icon: Activity,
    desc: "Relative Strength Index (14-day). Measures momentum. Above 70 = overbought. Below 30 = oversold.",
    color: "text-violet-400",
  },
  {
    id: "MACD",
    icon: TrendingUp,
    desc: "Moving Average Convergence Divergence. Shows trend direction and momentum. Blue line crossing orange = signal change.",
    color: "text-blue-400",
  },
];

export function IndicatorTabs({ volume, rsi, macd }: any) {
  const [activeTab, setActiveTab] = useState("Volume");
  const active = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="bg-[#0B1120] border border-white/5 rounded-xl shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-white/5 bg-white/5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? `text-indigo-400 border-indigo-500 bg-[#0B1120]`
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-400" : "text-slate-500"}`} />
            {tab.id}
          </button>
        ))}
        {/* Info tooltip for active tab */}
        <div className="ml-auto px-4 flex items-center gap-2">
          <div className="tooltip-container">
            <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
            <div className="tooltip-box w-64">{active.desc}</div>
          </div>
        </div>
      </div>

      {/* Active tab description */}
      <div className="px-5 py-3 bg-white/5 border-b border-white/5">
        <p className={`text-xs font-semibold ${active.color} flex items-center gap-1.5`}>
          <active.icon className="w-3.5 h-3.5" />
          {active.desc}
        </p>
      </div>

      {/* Chart area */}
      <div className="p-5">
        {activeTab === "Volume" && <VolumeChart volume={volume} />}
        {activeTab === "RSI"    && <RSIChart data={rsi} />}
        {activeTab === "MACD"   && <MACDChart data={macd} />}
      </div>
    </div>
  );
}
