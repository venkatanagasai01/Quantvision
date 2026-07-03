import { PortfolioSummary } from "@/components/trading/PortfolioSummary";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { OrdersTable } from "@/components/trading/OrdersTable";
import { TradeHistoryTable } from "@/components/trading/TradeHistoryTable";
import { Briefcase, Activity, Clock, ListOrdered } from "lucide-react";

export const metadata = {
  title: "Paper Trading | Quantan AI",
};

export default function PaperTradingPage() {
  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            Paper Trading Terminal
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Execute simulated trades and track portfolio performance with real-time market data.</p>
        </div>
      </div>

      {/* Summary Metrics */}
      <PortfolioSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Positions & Trades */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Open Positions */}
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Open Positions
              </h2>
            </div>
            <PositionsTable />
          </section>

          {/* Trade History */}
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Trade History
              </h2>
            </div>
            <TradeHistoryTable />
          </section>

        </div>

        {/* Right Column: Orders */}
        <div className="flex flex-col gap-8">
          
          {/* Order Book / Status */}
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-slate-600" />
                Recent Orders
              </h2>
            </div>
            <OrdersTable />
          </section>
          
        </div>

      </div>
    </div>
  );
}
