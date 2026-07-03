import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function EquityCurveChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-sm text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">No equity curve data available. Enable detailed charting in backend.</div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} minTickGap={30} />
          <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `$${val}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 600 }}
            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
          />
          <Line type="monotone" dataKey="portfolio_value" name="Strategy" stroke="#4F46E5" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
