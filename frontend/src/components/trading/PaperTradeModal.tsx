"use client";

import { useState } from "react";
import { useExecuteTrade } from "@/hooks/usePaperTrading";
import { X, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

interface PaperTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  recommendation?: string;
  currentPrice?: number;
}

export function PaperTradeModal({ isOpen, onClose, symbol, recommendation = "BUY", currentPrice = 0 }: PaperTradeModalProps) {
  const [shares, setShares] = useState(10);
  const [action, setAction] = useState<"BUY" | "SELL">(recommendation === "SELL" ? "SELL" : "BUY");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const executeTrade = useExecuteTrade();

  if (!isOpen) return null;

  const totalValue = shares * currentPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (shares <= 0) {
      setError("Shares must be greater than zero.");
      return;
    }

    try {
      await executeTrade.mutateAsync({ symbol, shares, action });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to execute trade. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-[#0B1120] border border-white/10 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Execute Paper Trade</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/20 text-center">
              Trade executed successfully!
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Asset</label>
              <div className="text-2xl font-black text-white">{symbol}</div>
            </div>
            <div className="text-right">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Price</label>
              <div className="text-2xl font-mono font-bold text-white">${currentPrice.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Action</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction("BUY")}
                className={`py-3 font-bold rounded-xl border-2 transition-all ${action === "BUY" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-white/10 text-slate-400 hover:border-emerald-500/50"}`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setAction("SELL")}
                className={`py-3 font-bold rounded-xl border-2 transition-all ${action === "SELL" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-white/10 text-slate-400 hover:border-red-500/50"}`}
              >
                SELL
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Shares</label>
            <input
              type="number"
              min="1"
              value={shares}
              onChange={(e) => setShares(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#030712] border border-white/10 rounded-xl font-mono text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between items-center py-3 border-t border-white/5">
            <span className="text-sm font-bold text-slate-400">Estimated Total</span>
            <span className="text-xl font-mono font-black text-white">${totalValue.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={executeTrade.isPending || success}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 ${executeTrade.isPending ? "bg-slate-600" : action === "BUY" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {executeTrade.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {executeTrade.isPending ? "Processing..." : `Confirm ${action}`}
          </button>
        </form>
      </div>
    </div>
  );
}
