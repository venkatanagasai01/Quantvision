import { BarChart3, Fingerprint, ShieldAlert, Activity } from "lucide-react";

interface ScoreBreakdownProps {
  technical: number;
  fundamental: number;
  risk: number;
  sentiment?: number;
}

export function ScoreBreakdown({ technical, fundamental, risk, sentiment }: ScoreBreakdownProps) {
  
  const getColor = (score: number, inverse: boolean = false) => {
    if (score === undefined || score === null) return "text-slate-400 stroke-slate-200";
    if (inverse) {
      if (score < 40) return "text-emerald-500 stroke-emerald-500";
      if (score < 70) return "text-amber-500 stroke-amber-500";
      return "text-red-500 stroke-red-500";
    } else {
      if (score > 70) return "text-emerald-500 stroke-emerald-500";
      if (score > 40) return "text-amber-500 stroke-amber-500";
      return "text-red-500 stroke-red-500";
    }
  };

  const CircleProgress = ({ score, icon: Icon, title, desc, inverse = false }: any) => {
    const val = score || 0;
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (val / 100) * circumference;
    const colorClass = getColor(val, inverse);
    const textClass = colorClass.split(' ')[0];

    return (
      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex items-center gap-5">
        <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r={radius} className="stroke-slate-100" strokeWidth="6" fill="none" />
            <circle 
              cx="32" cy="32" r={radius} 
              className={`${colorClass.split(' ')[1]} transition-all duration-1000 ease-out`} 
              strokeWidth="6" fill="none" 
              strokeDasharray={circumference} 
              strokeDashoffset={score === null ? circumference : offset} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${textClass}`}>{score !== null && score !== undefined ? score : 'N/A'}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm uppercase tracking-wider mb-1">
            <Icon className="w-4 h-4 text-slate-400" />
            {title}
          </div>
          <span className="text-xs text-slate-500 leading-snug">{desc}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <CircleProgress score={technical} icon={BarChart3} title="Technical" desc="Momentum, trends, and volume flow." />
      <CircleProgress score={fundamental} icon={Fingerprint} title="Fundamental" desc="Valuation and financial health." />
      <CircleProgress score={sentiment} icon={Activity} title="Sentiment" desc="FinBERT NLP analysis of breaking news." />
      <CircleProgress score={risk} icon={ShieldAlert} title="Risk Score" desc="Beta, volatility, and downside risk." inverse={true} />
    </div>
  );
}
