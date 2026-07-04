"use client";

import { Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, Clock, Target, TrendingUp, X, HelpCircle, Plus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import Link from "next/link";
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

// ─── Tooltip Helper ─────────────────────────────────────────
function KpiTooltip({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="tooltip-container">
          <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
          <div className="tooltip-box w-52">{description}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Empty State Helper ──────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, cta, href }: {
  icon: any; title: string; subtitle: string; cta?: string; href?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-slate-300" />
      </div>
      <div className="text-sm font-semibold text-slate-700 mb-1">{title}</div>
      <div className="text-xs text-slate-400 max-w-xs leading-relaxed">{subtitle}</div>
      {cta && href && (
        <Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
          <Plus className="w-3 h-3" /> {cta}
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: recentRuns, isLoading: isRunsLoading, isError: isRunsError } = useBacktests(1, 5);
  const { data: marketData, isLoading: isMarketLoading, isError: isMarketError } = useMarketOverview();
  const { data: portfolioSummary, isLoading: isSummaryLoading, isError: isSummaryError } = usePortfolioSummary();
  const { data: watchlistData, isLoading: isWatchlistLoading, isError: isWatchlistError } = useWatchlist();
  const { data: alertsData, isLoading: isAlertsLoading, isError: isAlertsError } = useAlerts();
  const { data: equityData, isLoading: isEquityLoading, isError: isEquityError } = useEquityCurve();
  const { data: explainabilityData, isLoading: isExplainabilityLoading, isError: isExplainabilityError } = useLatestExplainability();
  const { addSymbol, removeSymbol } = useWatchlistMutations();

  const [newSymbol, setNewSymbol] = useState("");

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      addSymbol.mutate(newSymbol.trim().toUpperCase());
      setNewSymbol("");
    }
  };

  const isAnyLoading = (isRunsLoading && !isRunsError) || (isMarketLoading && !isMarketError) || (isSummaryLoading && !isSummaryError) || (isWatchlistLoading && !isWatchlistError) || (isAlertsLoading && !isAlertsError) || (isEquityLoading && !isEquityError);

  const marketCards = marketData && !isMarketError ? [
    { name: "NIFTY 50", ...marketData.nifty },
    { name: "SENSEX", ...marketData.sensex },
    { name: "S&P 500", ...marketData.sp500 },
    { name: "NASDAQ", ...marketData.nasdaq },
  ] : [];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto font-sans">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex justify-between items-end pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time market data, AI-driven portfolio analytics, and strategy performance at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {portfolioSummary?.best_strategy && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700">
                Top Strategy: {portfolioSummary.best_strategy.symbol} ({portfolioSummary.best_strategy.return.toFixed(2)}%)
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/60 rounded-lg shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isAnyLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-semibold text-slate-600">{isAnyLoading ? 'Syncing data...' : 'System Live'}</span>
          </div>
        </div>
      </div>

      {/* ── Market Overview Cards ────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Markets</h2>
          <div className="tooltip-container">
            <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
            <div className="tooltip-box w-56">Live index prices pulled from market data. Green = up today, Red = down today.</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isMarketError ? (
            <div className="col-span-2 md:col-span-4 bg-red-50 p-5 border border-red-200/60 rounded-xl shadow-sm text-center">
              <ShieldAlert className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-red-700">Market Data Unavailable</h3>
              <p className="text-xs text-red-500 mt-1">Live data feed is currently rate limited or unreachable. Try again shortly.</p>
            </div>
          ) : isMarketLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-5 border border-slate-200/60 rounded-xl shadow-sm h-[104px] animate-pulse">
                <div className="h-3 w-20 bg-slate-200 rounded mb-4" />
                <div className="h-6 w-24 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
            ))
          ) : (
            marketCards.map((item) => (
              <div key={item.name} className="bg-white p-5 border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all group">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{item.name}</div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{item.price}</div>
                <div className={`flex items-center text-sm font-semibold ${item.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                  {item.change} today
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left Column ──────────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Strategy Performance Chart */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cumulative Strategy Performance</h2>
                <div className="tooltip-container">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                  <div className="tooltip-box w-60">Combined equity curve of all your backtested strategies over time. Rising = strategies are profitable on average.</div>
                </div>
              </div>
              <div className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">ALL TIME</div>
            </div>
            <p className="text-xs text-slate-400 mb-6">Aggregated portfolio value across all strategy runs.</p>

            <div className="h-[250px] w-full">
              {isEquityLoading ? (
                <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg" />
              ) : equityData?.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No performance data yet"
                  subtitle="Run your first backtest and the equity curve will appear here."
                  cta="Run a Backtest"
                  href="/dashboard/backtests"
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4 mt-6 border-t border-slate-100 pt-6">
              <KpiTooltip label="Avg Return" description="Mean total return % across all your backtested strategies. Green = profitable on average.">
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" /> : (
                  <div className={`text-lg font-black ${(portfolioSummary?.avg_return ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(portfolioSummary?.avg_return ?? 0) > 0 ? '+' : ''}{(portfolioSummary?.avg_return ?? 0).toFixed(2)}%
                  </div>
                )}
              </KpiTooltip>
              <KpiTooltip label="Win Rate" description="Percentage of trades that closed profitable. Above 50% means more winners than losers.">
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" /> : (
                  <div className="text-lg font-black text-slate-900">{(portfolioSummary?.avg_win_rate ?? 0).toFixed(1)}%</div>
                )}
              </KpiTooltip>
              <KpiTooltip label="Avg Sharpe" description="Sharpe Ratio = risk-adjusted return. Above 1.0 is good, above 2.0 is excellent. Higher = better return per unit of risk.">
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" /> : (
                  <div className="text-lg font-black text-slate-900">{(portfolioSummary?.avg_sharpe ?? 0).toFixed(2)}</div>
                )}
              </KpiTooltip>
              <KpiTooltip label="CAGR" description="Compound Annual Growth Rate — annualized return of your strategies. Like interest rate but for trading performance.">
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" /> : (
                  <div className={`text-lg font-black ${(portfolioSummary?.cagr ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(portfolioSummary?.cagr ?? 0) > 0 ? '+' : ''}{(portfolioSummary?.cagr ?? 0).toFixed(2)}%
                  </div>
                )}
              </KpiTooltip>
              <KpiTooltip label="Alpha" description="Alpha = return above market benchmark. Positive alpha means your strategies beat the market. The holy grail of trading.">
                {isSummaryLoading ? <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" /> : (
                  <div className={`text-lg font-black ${(portfolioSummary?.alpha ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(portfolioSummary?.alpha ?? 0) > 0 ? '+' : ''}{(portfolioSummary?.alpha ?? 0).toFixed(2)}%
                  </div>
                )}
              </KpiTooltip>
            </div>
          </div>

          {/* Recent Backtests */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Strategy Runs</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Latest 5 backtests you've executed.</p>
              </div>
              <Link href="/dashboard/backtests" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {isRunsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-slate-200" />
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-slate-200 rounded mb-2" />
                      <div className="h-3 w-32 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))
              ) : !recentRuns?.items.length ? (
                <EmptyState
                  icon={Target}
                  title="No backtests run yet"
                  subtitle="A backtest simulates a trading strategy on historical market data to see how it would have performed."
                  cta="Run First Backtest"
                  href="/dashboard/backtests"
                />
              ) : (
                recentRuns?.items.map((bt: any) => (
                  <div key={bt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-700 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all text-sm">
                        {bt.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{bt.symbol}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" /> {new Date(bt.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <div className="tooltip-container justify-end">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Total Return</div>
                          <HelpCircle className="w-2.5 h-2.5 text-slate-300 ml-1 cursor-help" />
                          <div className="tooltip-box w-48 text-left">Profit or loss as % of initial capital over the entire backtest period.</div>
                        </div>
                        <div className={`font-bold ${bt.total_return > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {bt.total_return.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="tooltip-container justify-end">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Sharpe</div>
                          <HelpCircle className="w-2.5 h-2.5 text-slate-300 ml-1 cursor-help" />
                          <div className="tooltip-box w-44 text-left">Risk-adjusted return. &gt;1 = good, &gt;2 = excellent.</div>
                        </div>
                        <div className="font-bold text-slate-900">{bt.sharpe_ratio?.toFixed(2) || "N/A"}</div>
                      </div>
                      <div className="w-20 text-right">
                        <span className={`inline-block px-2.5 py-1 text-xs font-black uppercase tracking-widest rounded-lg ${
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

        {/* ── Right Column ─────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* System Alerts */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[260px]">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-0.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Alerts</h2>
              </div>
              <p className="text-xs text-slate-400">Risk warnings and trading signals from the AI engine.</p>
            </div>
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {isAlertsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="flex gap-2 mb-2">
                      <div className="h-4 w-16 bg-slate-200 rounded" />
                      <div className="h-4 w-12 bg-slate-200 rounded" />
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded mt-2" />
                  </div>
                ))
              ) : !alertsData?.length ? (
                <EmptyState
                  icon={ShieldAlert}
                  title="No active alerts"
                  subtitle="AI alerts appear here when risk thresholds are breached or strong signals are detected on your watchlist."
                />
              ) : (
                alertsData?.map((alert: any) => (
                  <div key={alert.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                          alert.severity === 'success' ? 'bg-emerald-100 text-emerald-700' :
                          alert.severity === 'danger' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>{alert.type}</span>
                        <span className="text-xs font-bold text-slate-900">{alert.symbol}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI SHAP Explainability */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Latest Alpha Signals</h2>
                  <div className="tooltip-container">
                    <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
                    <div className="tooltip-box w-56">SHAP (SHapley Additive exPlanations) shows which features drove the AI's latest stock prediction — making the "black box" transparent.</div>
                  </div>
                </div>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">SHAP AI</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">What factors drove the latest AI prediction.</p>
            </div>
            <div className="p-6">
              {(isExplainabilityLoading && !isExplainabilityError) ? (
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ) : !explainabilityData ? (
                <EmptyState
                  icon={Activity}
                  title="No ML predictions available"
                  subtitle="Run a stock analysis first. SHAP feature importance will appear here after the first prediction."
                  cta="Analyze a Stock"
                  href="/dashboard/analyze"
                />
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-lg text-slate-900">{explainabilityData.symbol}</span>
                    <span className="text-xs text-slate-400">{new Date(explainabilityData.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        🟢 Bullish Factors
                        <div className="tooltip-container">
                          <HelpCircle className="w-3 h-3 text-emerald-300 cursor-help" />
                          <div className="tooltip-box w-48">These indicators pushed the AI toward a BUY recommendation.</div>
                        </div>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {explainabilityData.explanation.top_positive_features.map((f: any) => (
                          <span key={f.feature} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold">
                            {f.feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        🔴 Bearish Factors
                        <div className="tooltip-container">
                          <HelpCircle className="w-3 h-3 text-red-300 cursor-help" />
                          <div className="tooltip-box w-48">These indicators pushed the AI toward a SELL recommendation.</div>
                        </div>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {explainabilityData.explanation.top_negative_features.map((f: any) => (
                          <span key={f.feature} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold">
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
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Watchlist</h2>
                <p className="text-xs text-slate-400 mt-0.5">Stocks you're tracking. Click to analyze.</p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">{watchlistData?.length || 0} symbols</span>
            </div>

            <form onSubmit={handleAddSymbol} className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Add symbol (e.g. INFY.NS)"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white transition-all"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                maxLength={10}
              />
              <button
                type="submit"
                disabled={addSymbol.isPending || !newSymbol.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </form>

            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[300px]">
              {isWatchlistLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="px-6 py-3 flex justify-between animate-pulse">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                    <div className="h-4 w-8 bg-slate-200 rounded" />
                  </div>
                ))
              ) : !watchlistData?.length ? (
                <div className="p-6 text-center">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-sm font-semibold text-slate-600 mb-1">Watchlist is empty</div>
                  <p className="text-xs text-slate-400">Add a symbol above (e.g. INFY.NS, AAPL, TSLA) to start tracking it.</p>
                </div>
              ) : (
                watchlistData?.map((item: any) => (
                  <Link
                    key={item.symbol}
                    href={`/dashboard/analyze?symbol=${item.symbol}`}
                    className="px-6 py-3 flex items-center justify-between hover:bg-indigo-50/50 transition-colors group"
                  >
                    <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">{item.symbol}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Analyze →</span>
                      <button
                        onClick={(e) => { e.preventDefault(); removeSymbol.mutate(item.symbol); }}
                        disabled={removeSymbol.isPending}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1 rounded"
                        title="Remove from watchlist"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
