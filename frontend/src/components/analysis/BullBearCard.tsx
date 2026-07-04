import { TrendingUp, TrendingDown, CheckCircle2, XCircle, HelpCircle, AlertTriangle } from "lucide-react";

interface BullBearProps {
  bullCase: string[];
  bearCase: string[];
}

interface CaseItemProps {
  item: string;
  index: number;
  type: "bull" | "bear";
}

function CaseItem({ item, index, type }: CaseItemProps) {
  const isBull = type === "bull";
  const isFirst = index === 0;

  return (
    <li className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
      isFirst
        ? isBull
          ? "bg-emerald-50 border border-emerald-100"
          : "bg-red-50 border border-red-100"
        : "hover:bg-slate-50"
    }`}>
      {/* Number badge */}
      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${
        isBull
          ? isFirst ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
          : isFirst ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
      }`}>
        {index + 1}
      </div>

      {/* Check / X icon */}
      {isBull
        ? <CheckCircle2 className={`shrink-0 w-4 h-4 mt-0.5 ${isFirst ? "text-emerald-600" : "text-emerald-400"}`} />
        : <XCircle className={`shrink-0 w-4 h-4 mt-0.5 ${isFirst ? "text-red-600" : "text-red-400"}`} />
      }

      {/* Text */}
      <div className="flex-1">
        <span className={`text-sm leading-relaxed ${
          isFirst ? "font-bold text-slate-900" : "text-slate-600 font-medium"
        }`}>
          {item}
        </span>
        {isFirst && (
          <span className={`ml-2 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
            isBull ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}>
            Key Factor
          </span>
        )}
      </div>
    </li>
  );
}

export function BullBearCard({ bullCase, bearCase }: BullBearProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* ── Bull Case ───────────────────────────── */}
      <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">The Bull Case</h3>
                <p className="text-[10px] text-emerald-600 font-semibold">Reasons to BUY / be optimistic</p>
              </div>
            </div>
            <div className="tooltip-container">
              <HelpCircle className="w-4 h-4 text-emerald-300 cursor-help" />
              <div className="tooltip-box w-52">These are the strongest positive signals the AI found. The #1 factor is the most influential.</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {bullCase.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400 font-medium">No bullish factors identified.</p>
              <p className="text-xs text-slate-300 mt-1">The AI found no significant positive signals for this stock.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {bullCase.map((item, i) => (
                <CaseItem key={i} item={item} index={i} type="bull" />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Bear Case ───────────────────────────── */}
      <div className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center shadow-sm">
                <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">The Bear Case</h3>
                <p className="text-[10px] text-red-500 font-semibold">Reasons to SELL / risks to watch</p>
              </div>
            </div>
            <div className="tooltip-container">
              <HelpCircle className="w-4 h-4 text-red-200 cursor-help" />
              <div className="tooltip-box w-52">These are the key risk factors and negative signals. Always review these before placing any trade.</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {bearCase.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400 font-medium">No bearish factors identified.</p>
              <p className="text-xs text-slate-300 mt-1">The AI found no significant risk signals for this stock.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {bearCase.map((item, i) => (
                <CaseItem key={i} item={item} index={i} type="bear" />
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
