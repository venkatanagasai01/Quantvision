import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { HelpCircle } from "lucide-react";

const WEIGHTS = {
  Technical:   { weight: 0.35, color: "#3b82f6", desc: "35% weight — price action, momentum, volume" },
  Fundamental: { weight: 0.35, color: "#8b5cf6", desc: "35% weight — valuation, earnings, balance sheet" },
  Sentiment:   { weight: 0.15, color: "#ec4899", desc: "15% weight — real-time news NLP sentiment" },
  Risk:        { weight: 0.15, color: "#f59e0b", desc: "15% weight — volatility, beta, downside risk" },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm min-w-[200px]">
      <div className="font-black text-slate-900 mb-1">{d.name}</div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
        <span className="text-slate-600">Contribution: <strong className="text-slate-900">{d.contribution} pts</strong></span>
      </div>
      <div className="text-xs text-slate-400 mt-1.5 border-t border-slate-100 pt-1.5">{d.desc}</div>
    </div>
  );
}

export function ContributionChart({ data }: { data: any }) {
  const chartData = Object.entries(WEIGHTS).map(([name, meta]) => {
    const rawScore = name === "Technical"   ? (data.technical_score   || 0)
                   : name === "Fundamental" ? (data.fundamental_score || 0)
                   : name === "Sentiment"   ? (data.sentiment_score   || 0)
                   : (data.risk_score || 0);

    const contribution = Number((rawScore * meta.weight).toFixed(1));
    const pct = Math.round(meta.weight * 100);

    return {
      name,
      contribution,
      rawScore,
      color: meta.color,
      desc: meta.desc,
      pct,
      label: `${contribution} pts (${pct}%)`,
    };
  }).sort((a, b) => b.contribution - a.contribution);

  const total = chartData.reduce((s, d) => s + d.contribution, 0);

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Factor Contribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Points each factor adds to the final AI score</p>
          </div>
          <div className="tooltip-container">
            <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
            <div className="tooltip-box w-60">
              The final score is a weighted sum: Technical (35%) + Fundamental (35%) + Sentiment (15%) + Risk (15%).
              Each bar shows how many points that factor contributed.
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Total score badge */}
        <div className="flex items-center justify-between mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Composite Score</span>
          <span className="text-xl font-black text-indigo-700">{total.toFixed(1)}<span className="text-sm font-semibold text-indigo-400"> / 100</span></span>
        </div>

        {/* Bar chart */}
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 55, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 40]} hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="contribution" radius={[0, 6, 6, 0]} barSize={26} animationDuration={1200}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="label"
                  position="right"
                  style={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Factor legend with weight pills */}
        <div className="mt-4 flex flex-col gap-2">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="text-xs font-bold text-slate-600">{d.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">— {d.desc.split("—")[1]?.trim()}</span>
              <span className="ml-auto text-xs font-black" style={{ color: d.color }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
