"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Brain, BarChart3, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";

const FEATURES = [
  { icon: Brain,      text: "4-Factor AI Stock Scoring"        },
  { icon: BarChart3,  text: "Quantitative Backtesting Engine"  },
  { icon: ShieldCheck,text: "Risk-Free Paper Trading Terminal" },
  { icon: TrendingUp, text: "Real-Time FinBERT Sentiment"      },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#080c14]">

      {/* ── Left Panel — Brand Story ────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid opacity-50" />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Quantan</span>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">AI</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Your institutional-grade
              <br />
              <span className="gradient-text">AI trading terminal</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              Every analysis in one place. Sign in to access your dashboard, watchlist, backtests, and AI-powered stock insights.
            </p>

            <div className="flex flex-col gap-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating metric cards */}
        <div className="relative flex gap-4 flex-wrap">
          {[
            { label: "AI Score", value: "87/100", tag: "RELIANCE.NS", color: "text-emerald-400" },
            { label: "Sharpe Ratio", value: "1.84", tag: "Last Backtest", color: "text-indigo-400" },
            { label: "Signal", value: "STRONG BUY", tag: "TCS.NS", color: "text-emerald-400" },
          ].map((c, i) => (
            <div key={i} className="glass-card rounded-xl p-4 min-w-[140px]">
              <div className="text-xs text-slate-500 font-semibold mb-1">{c.label}</div>
              <div className={`text-lg font-black ${c.color}`}>{c.value}</div>
              <div className="text-[10px] text-slate-600 mt-1">{c.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel — Form ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0d1117]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Quantan AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to your trading terminal.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                placeholder="you@quantan.ai"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <> Sign In to Terminal <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#0d1117] px-4 text-slate-600 font-semibold">Or</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3 rounded-xl text-sm transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{" "}
            <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Request access →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
