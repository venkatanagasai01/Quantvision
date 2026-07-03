import { TrendingUp, TrendingDown } from "lucide-react";

interface BullBearProps {
  bullCase: string[];
  bearCase: string[];
}

export function BullBearCard({ bullCase, bearCase }: BullBearProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-emerald-100 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-900">The Bull Case</h3>
        </div>
        <ul className="space-y-3 pl-2">
          {bullCase.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 border-l-2 border-emerald-400 pl-3 py-0.5">
              {item}
            </li>
          ))}
          {bullCase.length === 0 && <span className="text-sm text-slate-400">No bull case arguments available.</span>}
        </ul>
      </div>

      <div className="bg-white border border-red-100 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-slate-900">The Bear Case</h3>
        </div>
        <ul className="space-y-3 pl-2">
          {bearCase.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 border-l-2 border-red-400 pl-3 py-0.5">
              {item}
            </li>
          ))}
          {bearCase.length === 0 && <span className="text-sm text-slate-400">No bear case arguments available.</span>}
        </ul>
      </div>
    </div>
  );
}
