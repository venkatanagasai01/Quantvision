import { CheckCircle2, ArrowUpRight } from "lucide-react";

export function StrengthsCard({ strengths }: { strengths: string[] }) {
  return (
    <div className="bg-[#0B1120] border border-white/5 rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Why This Recommendation?</h3>
      </div>
      <ul className="space-y-4">
        {strengths.length === 0 && <span className="text-sm text-slate-400">No notable strengths identified.</span>}
        {strengths.map((str, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-300 font-medium leading-relaxed">{str}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
