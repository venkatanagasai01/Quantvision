from typing import Dict, Any, List

class ExplanationService:
    """
    Explainability Layer — generates rich, data-driven rationales.
    Uses actual numeric values from technical, fundamental, and risk analysis
    to produce unique explanations per stock.
    """

    @staticmethod
    def generate_explanation(
        tech_data: Dict[str, Any], 
        fund_data: Dict[str, Any], 
        risk_data: Dict[str, Any],
        recommendation: str,
        symbol: str = "",
        sentiment_score: float = 0.0
    ) -> Dict[str, Any]:
        
        strengths = []
        weaknesses = []
        thesis_parts = []
        risks = []

        price = tech_data.get('price', 0)
        rsi = tech_data.get('rsi', 50)
        trend = tech_data.get('trend', 'Unknown')
        sma50 = tech_data.get('sma50', 0)
        sma200 = tech_data.get('sma200', 0)
        macd_signal = tech_data.get('macd_signal', 'Neutral')
        volatility_label = tech_data.get('volatility', 'Normal')
        high_52w = tech_data.get('high_52w', 0)
        low_52w = tech_data.get('low_52w', 0)
        pct_from_high = tech_data.get('pct_from_high', 0)
        pct_from_low = tech_data.get('pct_from_low', 0)
        volume_ratio = tech_data.get('volume_ratio', 1.0)
        atr = tech_data.get('atr', 0)

        pe = fund_data.get('pe_ratio', 0)
        eps = fund_data.get('eps', 0)
        market_cap = fund_data.get('market_cap', 0)
        
        vol_pct = risk_data.get('volatility', 0)
        drawdown = risk_data.get('drawdown', 0)
        beta = risk_data.get('beta', 1.0)

        # ============================================================
        # TECHNICAL STRENGTHS & WEAKNESSES (8 conditions)
        # ============================================================
        
        # Trend
        if trend in ('Bullish', 'Strong Bullish'):
            strengths.append(f"Uptrend confirmed — SMA50 ({sma50:.2f}) above SMA200 ({sma200:.2f}), price at {price:.2f}.")
        elif trend in ('Bearish', 'Strong Bearish'):
            weaknesses.append(f"Downtrend — SMA50 ({sma50:.2f}) below SMA200 ({sma200:.2f}), price at {price:.2f}.")
        else:
            weaknesses.append(f"Neutral trend — SMA50 ({sma50:.2f}) and SMA200 ({sma200:.2f}) are converging.")

        # RSI
        if rsi < 30:
            strengths.append(f"RSI at {rsi:.1f} signals oversold territory — potential bounce candidate.")
        elif rsi < 40:
            strengths.append(f"RSI at {rsi:.1f} approaching oversold zone — accumulation opportunity.")
        elif rsi > 70:
            weaknesses.append(f"RSI at {rsi:.1f} signals overbought territory — risk of pullback.")
        elif rsi > 60:
            weaknesses.append(f"RSI at {rsi:.1f} trending toward overbought — momentum may slow.")
        else:
            strengths.append(f"RSI at {rsi:.1f} is in healthy neutral range.")

        # MACD
        if 'Bullish' in macd_signal:
            if 'Crossover' in macd_signal:
                strengths.append(f"Fresh MACD bullish crossover detected — strong momentum signal.")
            else:
                strengths.append(f"MACD shows sustained bullish momentum.")
        elif 'Bearish' in macd_signal:
            if 'Crossover' in macd_signal:
                weaknesses.append(f"Fresh MACD bearish crossover detected — momentum shifting negative.")
            else:
                weaknesses.append(f"MACD shows persistent bearish momentum.")

        # 52-week proximity
        if pct_from_high > -5:
            strengths.append(f"Trading near 52-week high ({high_52w:.2f}) — strong relative performance.")
        elif pct_from_high < -30:
            weaknesses.append(f"Down {abs(pct_from_high):.1f}% from 52-week high ({high_52w:.2f}).")

        if pct_from_low < 15:
            strengths.append(f"Near 52-week low ({low_52w:.2f}) — potential value entry point.")

        # Volume
        if volume_ratio > 1.5:
            strengths.append(f"Volume surge ({volume_ratio:.1f}x average) — institutional interest likely.")
        elif volume_ratio < 0.5:
            weaknesses.append(f"Volume is thin ({volume_ratio:.1f}x average) — low conviction.")

        # Volatility
        if volatility_label == "Low":
            strengths.append("Low volatility — stable price action reduces downside risk.")
        elif volatility_label == "High":
            weaknesses.append(f"High volatility (ATR: {atr:.2f}) — wide price swings increase risk.")

        # ============================================================
        # FUNDAMENTAL STRENGTHS & WEAKNESSES (5 conditions)
        # ============================================================
        
        if pe and 0 < pe < 15:
            strengths.append(f"Attractive valuation with PE ratio of {pe:.1f} (below market average).")
        elif pe and 15 <= pe <= 25:
            strengths.append(f"Reasonable valuation — PE ratio at {pe:.1f}.")
        elif pe and pe > 35:
            weaknesses.append(f"Expensive valuation — PE ratio at {pe:.1f} suggests premium pricing.")

        if eps > 0:
            strengths.append(f"Positive earnings — EPS at {eps:.2f} confirms profitability.")
        elif eps < 0:
            weaknesses.append(f"Negative EPS ({eps:.2f}) — company is not yet profitable.")

        if market_cap > 500_000_000_000:
            strengths.append("Mega-cap stock — deep liquidity and institutional backing.")
        elif market_cap > 100_000_000_000:
            strengths.append("Large-cap stock — established market position and stability.")
        elif market_cap > 10_000_000_000:
            pass  # Mid-cap, neutral
        elif market_cap > 0:
            weaknesses.append("Small-cap stock — higher risk due to limited liquidity.")

        # ============================================================
        # SENTIMENT
        # ============================================================
        if sentiment_score > 30:
            strengths.append(f"Positive market sentiment (score: {sentiment_score:.0f}) — news flow is favorable.")
        elif sentiment_score < -30:
            weaknesses.append(f"Negative market sentiment (score: {sentiment_score:.0f}) — bearish news pressure.")

        # ============================================================
        # RISK FACTORS (always 3+)
        # ============================================================
        
        # Volatility risk
        if vol_pct > 40:
            risks.append(f"High annualized volatility at {vol_pct:.1f}% — expect sharp price swings.")
        elif vol_pct > 25:
            risks.append(f"Moderate volatility at {vol_pct:.1f}% — standard for this asset class.")
        else:
            risks.append(f"Low historical volatility at {vol_pct:.1f}% — may understate tail risks.")

        # Drawdown risk
        if drawdown < -30:
            risks.append(f"Severe max drawdown of {drawdown:.1f}% — significant capital at risk.")
        elif drawdown < -15:
            risks.append(f"Notable max drawdown of {drawdown:.1f}% — moderate downside exposure.")
        else:
            risks.append(f"Contained max drawdown at {drawdown:.1f}% — relatively resilient.")

        # Beta risk
        if beta > 1.5:
            risks.append(f"High beta ({beta:.2f}) — amplified market moves increase portfolio risk.")
        elif beta > 1.1:
            risks.append(f"Beta of {beta:.2f} — slightly more volatile than the broader market.")
        elif beta < 0.7:
            risks.append(f"Low beta ({beta:.2f}) — defensive characteristics, may underperform in rallies.")
        else:
            risks.append(f"Beta of {beta:.2f} — moves largely in line with the market.")

        # Always add macro risk
        risks.append("General market risk: macroeconomic shifts, interest rate changes, and geopolitical events.")

        # ============================================================
        # INVESTMENT THESIS (data-driven paragraph)
        # ============================================================
        
        sym = symbol.upper() or "This asset"
        
        if recommendation == "BUY":
            thesis_parts.append(
                f"{sym} presents a compelling accumulation opportunity. "
                f"The stock is trading at {price:.2f} with a {trend.lower()} technical setup."
            )
            if rsi < 40:
                thesis_parts.append(f"The RSI reading of {rsi:.1f} suggests the selling pressure may be exhausted.")
            if 'Bullish' in macd_signal:
                thesis_parts.append("MACD momentum is turning positive, confirming buying interest.")
            if pe and 0 < pe < 25:
                thesis_parts.append(f"At a PE of {pe:.1f}, the valuation offers a reasonable margin of safety.")
            thesis_parts.append(
                f"With a risk score of {risk_data.get('score', 50)}/100 and "
                f"{'strong' if fund_data.get('score', 50) > 65 else 'moderate'} fundamentals, "
                f"the risk-reward profile favors a long position."
            )
        elif recommendation == "HOLD":
            thesis_parts.append(
                f"{sym} is trading at {price:.2f} and shows mixed signals across technical and fundamental dimensions."
            )
            if trend in ('Bullish', 'Strong Bullish'):
                thesis_parts.append(f"The {trend.lower()} trend structure is supportive, but ")
            else:
                thesis_parts.append(f"The {trend.lower()} trend creates uncertainty. ")
            
            if rsi > 50:
                thesis_parts.append(f"RSI at {rsi:.1f} shows moderate momentum without overextension.")
            else:
                thesis_parts.append(f"RSI at {rsi:.1f} suggests tepid demand — awaiting a catalyst.")
            
            thesis_parts.append(
                f"Fundamental score of {fund_data.get('score', 50)}/100 "
                f"{'supports' if fund_data.get('score', 50) > 60 else 'does not strongly justify'} "
                f"new entries at current levels. "
                f"Wait for a decisive move above SMA50 ({sma50:.2f}) or a drop to the "
                f"52-week low ({low_52w:.2f}) for a better risk-reward entry."
            )
        else:  # SELL
            thesis_parts.append(
                f"{sym} is flashing caution at {price:.2f}. "
                f"The {trend.lower()} technical posture is deteriorating."
            )
            if rsi > 65:
                thesis_parts.append(f"RSI at {rsi:.1f} suggests the rally is overextended.")
            if 'Bearish' in macd_signal:
                thesis_parts.append("MACD has crossed bearish, confirming distribution.")
            if pe and pe > 30:
                thesis_parts.append(f"The elevated PE of {pe:.1f} leaves little room for error.")
            thesis_parts.append(
                f"With a max drawdown of {drawdown:.1f}% and beta of {beta:.2f}, "
                f"the downside risk outweighs the upside potential. "
                f"Consider trimming or hedging existing positions."
            )

        investment_thesis = " ".join(thesis_parts)

        return {
            "strengths": strengths if strengths else ["No major strengths detected at this time."],
            "weaknesses": weaknesses if weaknesses else ["No significant weaknesses identified."],
            "investment_thesis": investment_thesis,
            "risk_factors": risks
        }
