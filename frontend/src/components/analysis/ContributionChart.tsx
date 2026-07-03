import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function ContributionChart({ data }: { data: any }) {
  // Approximate the contribution based on standard weights: 
  // Tech 35%, Fund 35%, Sent 15%, Risk 15%
  const chartData = [
    { name: "Technical", value: Number(((data.technical_score || 0) * 0.35).toFixed(1)), color: "#3b82f6" },
    { name: "Fundamental", value: Number(((data.fundamental_score || 0) * 0.35).toFixed(1)), color: "#8b5cf6" },
    { name: "Sentiment", value: Number(((data.sentiment_score || 0) * 0.15).toFixed(1)), color: "#ec4899" },
    // Risk score is usually penalized if it's too risky, but for visualization let's treat it as a positive contribution if it's high
    { name: "Risk", value: Number(((data.risk_score || 0) * 0.15).toFixed(1)), color: "#f59e0b" }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6 h-[300px]">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Algorithm Contribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 30, left: 20, bottom: 20 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} width={90} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
