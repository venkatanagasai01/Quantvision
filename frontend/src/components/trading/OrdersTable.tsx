"use client";

import { useOrders } from "@/hooks/usePaperTrading";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export function OrdersTable() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (error || !orders) {
    return <div className="p-4 text-red-400 font-bold">Failed to load orders.</div>;
  }

  if (orders.length === 0) {
    return <div className="p-10 text-center text-slate-400 font-medium bg-[#0B1120] rounded-xl border border-dashed border-white/10">No orders placed.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5">
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Shares</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map((order: any) => {
            const date = new Date(order.created_at).toLocaleString();
            const isBuy = order.action === "BUY";
            
            return (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 font-mono text-sm text-slate-400">{date}</td>
                <td className="py-4 px-4 font-bold text-white">{order.symbol}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {order.action} {order.order_type}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-slate-300 text-right">{order.shares}</td>
                <td className="py-4 px-4 text-right flex justify-end">
                  {order.status === 'FILLED' && <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold"><CheckCircle2 className="w-4 h-4"/> Filled</span>}
                  {order.status === 'PENDING' && <span className="flex items-center gap-1 text-amber-400 text-sm font-bold"><Clock className="w-4 h-4"/> Pending</span>}
                  {order.status === 'REJECTED' && <span className="flex items-center gap-1 text-red-400 text-sm font-bold"><XCircle className="w-4 h-4"/> Rejected</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
