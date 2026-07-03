"use client";

import { Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, Clock, Target, TrendingUp, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { useBacktests } from "@/hooks/useBacktests";
import { 
  useMarketOverview, 
  usePortfolioSummary, 
  useAlerts, 
  useEquityCurve,
  useLatestExplainability
} from "@/hooks/useDashboard";
import {
  useWatchlist,
  useWatchlistMutations
} from "@/hooks/useWatchlist";

export default function DashboardPage() {
  const { data: recentRuns, isLoading: isRunsLoading } = useBacktests(1, 5);
  const { data: marketData, isLoading: isMarketLoading, isError: isMarketError } = useMarketOverview();
  const { data: portfolioSummary, isLoading: isSummaryLoading } = usePortfolioSummary();
  const { data: watchlistData, isLoading: isWatchlistLoading } = useWatchlist();
  const { data: alertsData, isLoading: isAlertsLoading } = useAlerts();
  const { data: equityData, isLoading: isEquityLoading } = useEquityCurve();
  const { data: explainabilityData, isLoading: isExplainabilityLoading } = useLatestExplainability();
  const { addSymbol, removeSymbol } = useWatchlistMutations();

  const [newSymbol, setNewSymbol] = useState("");

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      addSymbol.mutate(newSymbol.trim().toUpperCase());
      setNewSymbol("");
    }
  };

  const isAnyLoading = isRunsLoading || isMarketLoading || isSummaryLoading || isWatchlistLoading || isAlertsLoading || isEquityLoading;

  const marketCards = marketData && !isMarketError ? [
    { name: "NIFTY 50", ...marketData.nifty },
    { name: "SENSEX", ...marketData.sensex },
    { name: "S&P 500", ...marketData.sp500 },
    { name: "NASDAQ", ...marketData.nasdaq },
  ] : [];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto font-sans">
      
      {/* Page Header */}
      <div className="flex justify-between items-end pb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Intelligence Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time market insights and AI-driven portfolio analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          {portfolioSummary?.best_strategy && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md shadow-sm">
              <span className="text-xs font-bold text-indigo-700">Top Strategy: {portfolioSummary.best_strategy.symbol} ({portfolioSummary.best_strategy.return.toFixed(2)}%)</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/60 rounded-md shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isAnyLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="text-xs font-medium text-slate-600">{isAnyLoading ? 'Syncing...' : 'System Live'}</span>
          </div>
        </div>
      </div>

      {/* Top row: Market Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isMarketError ? (
          <div className="col-span-2 md:col-span-4 bg-red-50 p-5 border border-red-200/60 rounded-xl shadow-sm text-center">
            <ShieldAlert className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-red-700">Market Data Unavailable</h3>
            <p className="text-xs text-red-600 mt-1">Live data feed is currently rate limited or unreachable.</p>
          </div>
        ) : isMarketLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-5 border border-slate-200/60 rounded-xl shadow-sm h-[104px] animate-pulse">
              <div className="h-3 w-20 bg-slate-200 rounded mb-4"></div>
              <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
            </div>
          ))
        ) : (
          marketCards.map((item) => (
            <div key={item.name} className="bg-white p-5 border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{item.name}</div>
              <div className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">{item.price}</div>
              <div className={`flex items-center text-sm font-medium ${item.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {item.change}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Chart & Analysis */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Main Chart */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Cumulative Strategy Performance</h2>
              </div>
              <div className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">ALL TIME</div>
            </div>
            
            <div className="h-[250px] w-full">
              {isEquityLoading ? (
                 <div className="w-full h-full bg-slate-100 animate-pulse rounded-md"></div>
              ) : equityData?.length === 0 ? (
                 <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">No performance data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* KPI Cards below chart */}
            <div className="grid grid-cols-5 gap-4 mt-6 border-t border-slate-100 pt-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Avg Return</div>
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded"></div> : (
                  <div className={`text-lg font-bold ${portfolioSummary?.avg_return >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {portfolioSummary?.avg_return > 0 ? '+' : ''}{portfolioSummary?.avg_return.toFixed(2)}%
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Win Rate</div>
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded"></div> : (
                  <div className="text-lg font-bold text-slate-900">{portfolioSummary?.avg_win_rate.toFixed(1)}%</div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Avg Sharpe</div>
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded"></div> : (
                  <div className="text-lg font-bold text-slate-900">{portfolioSummary?.avg_sharpe.toFixed(2)}</div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">CAGR</div>
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded"></div> : (
                  <div className={`text-lg font-bold ${portfolioSummary?.cagr >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {portfolioSummary?.cagr > 0 ? '+' : ''}{portfolioSummary?.cagr.toFixed(2)}%
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Alpha</div>
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded"></div> : (
                  <div className={`text-lg font-bold ${portfolioSummary?.alpha >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {portfolioSummary?.alpha > 0 ? '+' : ''}{portfolioSummary?.alpha.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Backtests */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Recent Strategy Runs</h2>
              </div>
              <a href="/dashboard/backtests" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All</a>
            </div>
            <div className="divide-y divide-slate-100">
              {isRunsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                     <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                     <div className="flex-1">
                       <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
                       <div className="h-3 w-32 bg-slate-200 rounded"></div>
                     </div>
                  </div>
                ))
              ) : recentRuns?.items.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No backtests run yet.</div>
              ) : (
                recentRuns?.items.map((bt: any) => (
                  <div key={bt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                        {bt.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{bt.symbol}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" /> {new Date(bt.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Total Return</div>
                        <div className={`font-semibold ${bt.total_return > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {bt.total_return.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Sharpe Ratio</div>
                        <div className="font-semibold text-slate-900">{bt.sharpe_ratio?.toFixed(2) || "N/A"}</div>
                      </div>
                      <div className="w-20 text-right">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-widest rounded-md ${
                          bt.total_return > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                          'bg-red-50 text-red-700 border border-red-200/50'
                        }`}>
                          {bt.total_return > 0 ? 'PROFIT' : 'LOSS'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Alerts & Watchlist */}
        <div className="flex flex-col gap-6">
          
          {/* AI Alerts */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">System Alerts</h2>
              </div>
            </div>
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {isAlertsLoading ? (
                 Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="flex gap-2 mb-2">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      <div className="h-4 w-12 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded mt-2"></div>
                    <div className="h-3 w-2/3 bg-slate-200 rounded mt-1"></div>
                  </div>
                ))
              ) : alertsData?.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No active system alerts.</div>
              ) : (
                alertsData?.map((alert: any) => (
                  <div key={alert.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest ${
                          alert.severity === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                          alert.severity === 'danger' ? 'bg-red-100 text-red-700' : 
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {alert.type}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{alert.symbol}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Explainability Widget */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Latest Alpha Signals</h2>
              </div>
              <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">SHAP AI</span>
            </div>
            <div className="p-6">
              {isExplainabilityLoading ? (
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ) : !explainabilityData ? (
                <div className="text-center text-sm text-slate-500 py-4">No ML predictions available. Run a strategy first.</div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg text-slate-900">{explainabilityData.symbol}</span>
                    <span className="text-xs text-slate-500">{new Date(explainabilityData.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Bullish Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {explainabilityData.explanation.top_positive_features.map((f: any) => (
                          <span key={f.feature} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs">
                            {f.feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-600 uppercase mb-2">Bearish Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {explainabilityData.explanation.top_negative_features.map((f: any) => (
                          <span key={f.feature} className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-xs">
                            {f.feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Watchlist */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Watchlist</h2>
              <span className="text-xs font-medium text-slate-500">{watchlistData?.length || 0} Symbols</span>
            </div>
            
            <form onSubmit={handleAddSymbol} className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex gap-2">
              <input 
                type="text" 
                placeholder="Add symbol (e.g. AAPL)" 
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                maxLength={10}
              />
              <button 
                type="submit"
                disabled={addSymbol.isPending || !newSymbol.trim()}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </form>

            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
              {isWatchlistLoading ? (
                 Array(4).fill(0).map((_, i) => (
                  <div key={i} className="px-6 py-3 flex justify-between animate-pulse">
                    <div className="h-4 w-16 bg-slate-200 rounded"></div>
                    <div className="h-4 w-8 bg-slate-200 rounded"></div>
                  </div>
                ))
              ) : watchlistData?.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Watchlist is empty.</div>
              ) : (
                watchlistData?.map((item: any) => (
                  <div key={item.symbol} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="font-bold text-slate-900 text-sm">{item.symbol}</div>
                    <button 
                      onClick={() => removeSymbol.mutate(item.symbol)}
                      disabled={removeSymbol.isPending}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                      title="Remove from watchlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
