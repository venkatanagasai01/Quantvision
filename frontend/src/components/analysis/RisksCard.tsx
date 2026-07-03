import { AlertTriangle, ShieldAlert } from "lucide-react";

export function RisksCard({ risks }: { risks: string[] }) {
  return (
    <div className="bg-red-50/30 border border-red-100 rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center gap-2 mb-5 border-b border-red-200/50 pb-3">
        <ShieldAlert className="w-5 h-5 text-red-600" />
        <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">Potential Risks</h3>
      </div>
      <ul className="space-y-4">
        {risks.length === 0 && <span className="text-sm text-red-900/70">No notable risks identified.</span>}
        {risks.map((risk, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-900/90 font-medium leading-relaxed">{risk}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
