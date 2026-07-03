import { Sparkles, Clock, Target, Briefcase } from "lucide-react";
import { useState } from "react";
import { PaperTradeModal } from "@/components/trading/PaperTradeModal";

interface RecommendationCardProps {
  recommendation: string;
  confidence: number;
  symbol: string;
  currentPrice?: number;
}

export function RecommendationCard({ recommendation, confidence, symbol, currentPrice = 150.0 }: RecommendationCardProps) {
  const isBuy = recommendation === "BUY";
  const isSell = recommendation === "SELL";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colorClass = isBuy ? "bg-emerald-600" : isSell ? "bg-red-600" : "bg-slate-600";
  const lightColorClass = isBuy ? "bg-emerald-50 text-emerald-700 border-emerald-200" : isSell ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <>
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Consensus for {symbol}</span>
        </div>
        <div className="flex items-center gap-4">
          <h1 className={`text-4xl lg:text-5xl font-black tracking-tight ${isBuy ? 'text-emerald-600' : isSell ? 'text-red-600' : 'text-slate-700'}`}>
            {recommendation}
          </h1>
          <div className={`px-4 py-1.5 rounded-full border font-bold text-sm ${lightColorClass}`}>
            Confidence: {confidence}%
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Analyzed just now
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Trade this Signal
          </button>
        </div>
      </div>

      <div className="w-full md:w-64 flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Signal Strength</span>
          <span className="text-sm font-bold text-slate-900">{confidence}/100</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>0 (Weak)</span>
          <span>100 (Strong)</span>
        </div>
      </div>
    </div>
    
    <PaperTradeModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      symbol={symbol} 
      recommendation={recommendation} 
      currentPrice={currentPrice} 
    />
    </>
  );
}
