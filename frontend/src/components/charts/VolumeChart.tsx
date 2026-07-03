"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, HistogramSeries } from "lightweight-charts";

interface VolumeChartProps {
  volume: any[];
}

export function VolumeChart({ volume }: VolumeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
      height: 200,
      timeScale: {
        borderColor: "#e2e8f0",
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
        scaleMargins: {
          top: 0.1,
          bottom: 0,
        },
      },
    });

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // set as an overlay by setting a blank priceScaleId
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0,
      },
    });

    volumeSeries.setData(volume);
    chart.timeScale().fitContent();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [volume]);

  return <div ref={chartContainerRef} className="w-full h-[200px]" />;
}
