"use client";

import { useState } from "react";
import { VolumeChart } from "./VolumeChart";

// Simplified generic line charts for RSI and MACD
import { useEffect, useRef } from "react";
import { createChart, ColorType, LineSeries, HistogramSeries } from "lightweight-charts";

function LineChartPanel({ data, color, title, height = 200 }: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#64748b" },
      grid: { vertLines: { color: "#f1f5f9" }, horzLines: { color: "#f1f5f9" } },
      width: containerRef.current.clientWidth,
      height,
    });
    
    if (title === "MACD") {
        // Multi-series for MACD
        const macdLine = chart.addSeries(LineSeries, { color: "#2962FF", lineWidth: 2, title: "MACD" });
        const signalLine = chart.addSeries(LineSeries, { color: "#FF6D00", lineWidth: 2, title: "Signal" });
        const histSeries = chart.addSeries(HistogramSeries, { color: "#26a69a", priceFormat: { type: "volume" } });
        
        macdLine.setData(data.macd || []);
        signalLine.setData(data.signal || []);
        histSeries.setData(data.histogram || []);
    } else {
        const lineSeries = chart.addSeries(LineSeries, { color, lineWidth: 2, title });
        lineSeries.setData(data);
    }
    
    chart.timeScale().fitContent();
    const handleResize = () => chart.applyOptions({ width: containerRef.current?.clientWidth });
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.remove(); };
  }, [data, color, title, height]);

  return <div ref={containerRef} className={`w-full h-[${height}px]`} />;
}

export function IndicatorTabs({ volume, rsi, macd }: any) {
  const [activeTab, setActiveTab] = useState("Volume");
  const tabs = ["Volume", "RSI", "MACD"];

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-4 mt-6">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-2 mb-4">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {activeTab === "Volume" && <VolumeChart volume={volume} />}
      {activeTab === "RSI" && <LineChartPanel data={rsi} color="#8b5cf6" title="RSI" />}
      {activeTab === "MACD" && <LineChartPanel data={macd} color="#2962FF" title="MACD" />}
    </div>
  );
}
