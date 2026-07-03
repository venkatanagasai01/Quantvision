import Link from "next/link";
import { ArrowLeft, Target, TrendingUp, AlertTriangle, Activity, BarChart3, Newspaper, ShieldAlert, CheckCircle2 } from "lucide-react";

export default async function StockAnalysisPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();

  // Mock Data
  const companyData = {
    name: symbol === "TCS" ? "Tata Consultancy Services" : 
          symbol === "INFY" ? "Infosys Limited" : 
          symbol === "RELIANCE" ? "Reliance Industries" : "Mock Company Ltd.",
    price: "₹3,845.20",
    change: "+1.24%",
    isPositive: true,
  };

  const aiAnalysis = {
    recommendation: "BUY",
    confidence: 88,
    targetPrice: "₹4,200.00",
    timeframe: "3-6 Months",
    
    technicalScores: {
      trend: "Bullish",
      rsi: "58.4 (Neutral)",
      macd: "Positive Divergence",
      volatility: "Low",
    },
    
    sentimentScore: {
      overall: 76,
      label: "Very Positive",
      newsImpact: "High",
      socialMentions: "Increasing",
    },

    investmentThesis: [
      "Strong order book execution and margin expansion over the last two quarters.",
      "Cloud transformation deals are driving double-digit growth in the US sector.",
      "Valuation remains attractive compared to historical 5-year averages.",
      "Management guidance indicates a resilient pipeline despite macro headwinds."
    ],

    riskAnalysis: [
      "Exposure to US regional banking sector could cause short-term revenue blips.",
      "Currency headwinds (INR appreciation) might compress operating margins.",
      "Higher attrition rates in niche digital skills."
    ]
  };

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 font-sans pb-10">
      
      {/* Navigation */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-700 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to Overview
        </Link>
      </div>

      {/* 1. Company Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl tracking-tighter">
            {symbol.substring(0, 2)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{symbol}</h1>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">{companyData.name}</p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">{companyData.price}</div>
          <div className={`text-sm font-bold mt-1 ${companyData.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {companyData.change} Today
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Left Column: Core AI Metrics */}
        <div className="flex flex-col gap-6">
          
          {/* 2. Recommendation Card */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">AI Signal</div>
            <div className="flex items-center gap-4">
              <span className="inline-block px-4 py-1.5 text-lg font-bold uppercase tracking-widest rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                {aiAnalysis.recommendation}
              </span>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Target Price</div>
                <div className="font-bold text-slate-900 text-lg">{aiAnalysis.targetPrice}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Target className="w-4 h-4 text-slate-400" /> Timeframe: {aiAnalysis.timeframe}
            </div>
          </div>

          {/* 3. Confidence Score */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">AI Confidence</div>
              <div className="font-mono text-xl font-bold text-slate-900">{aiAnalysis.confidence}%</div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full" 
                style={{ width: `${aiAnalysis.confidence}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Based on an aggregate of 45 technical indicators, news sentiment analysis, and historical pattern matching.
            </p>
          </div>

        </div>

        {/* Right Column: Deep Analysis (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Top Row: Tech & Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 4. Technical Scores */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Technical Profile</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trend</span>
                  <span className="text-sm font-bold text-emerald-600">{aiAnalysis.technicalScores.trend}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RSI (14)</span>
                  <span className="text-sm font-bold text-slate-900">{aiAnalysis.technicalScores.rsi}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MACD</span>
                  <span className="text-sm font-bold text-slate-900">{aiAnalysis.technicalScores.macd}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volatility</span>
                  <span className="text-sm font-bold text-slate-900">{aiAnalysis.technicalScores.volatility}</span>
                </div>
              </div>
            </div>

            {/* 5. Sentiment Score */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Newspaper className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Market Sentiment</h2>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <div className="text-4xl font-bold font-mono text-slate-900 tracking-tighter">{aiAnalysis.sentimentScore.overall}</div>
                <div className="text-sm font-bold text-emerald-600 mb-1">{aiAnalysis.sentimentScore.label}</div>
              </div>
              <div className="space-y-3 pt-3 border-t border-slate-100">
                 <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">News Impact</span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">{aiAnalysis.sentimentScore.newsImpact}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Social Mentions</span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">{aiAnalysis.sentimentScore.socialMentions}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 6. Investment Thesis */}
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Investment Thesis</h2>
            </div>
            <ul className="space-y-3">
              {aiAnalysis.investmentThesis.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 7. Risk Analysis */}
          <div className="bg-red-50/30 border border-red-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold text-red-900 uppercase tracking-wider">Key Risk Factors</h2>
            </div>
            <ul className="space-y-3">
              {aiAnalysis.riskAnalysis.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-900 leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
