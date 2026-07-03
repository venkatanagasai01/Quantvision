import { CheckCircle2, ArrowUpRight } from "lucide-react";

export function StrengthsCard({ strengths }: { strengths: string[] }) {
  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center gap-2 mb-5 border-b border-emerald-200/50 pb-3">
        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
        <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Why This Recommendation?</h3>
      </div>
      <ul className="space-y-4">
        {strengths.length === 0 && <span className="text-sm text-emerald-900/70">No notable strengths identified.</span>}
        {strengths.map((str, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-emerald-900/90 font-medium leading-relaxed">{str}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
