# Quantan AI Backend Audit Report

As a Senior Quantitative Systems Architect, I have conducted a rigorous code, financial, and architectural review of the initial backend recommendation engine. Below are the findings across the 10 requested dimensions, followed by a ranked list of required improvements.

---

## 1. Technical Correctness
> [!WARNING]
> **Severity:** High
* **Explanation:** The `MarketDataService._cache` uses an unbounded in-memory Python dictionary. Over time, as different symbols and periods are queried, this will cause a severe memory leak. Furthermore, FastAPI routes are synchronous but rely on blocking I/O (`yfinance` network calls), which will bottleneck the thread pool under load.
* **Proposed Fix:** Implement `cachetools.TTLCache` to enforce a memory limit and time-to-live eviction. Refactor blocking network calls to use `asyncio.to_thread` or an asynchronous HTTP client where possible.

## 2. Financial Correctness
> [!CAUTION]
> **Severity:** Critical
* **Explanation:** The Fundamental Analysis service hardcodes a Market Cap threshold (`> 100_000_000_000`) assuming USD. `yfinance` returns market cap in the *local currency* of the exchange (e.g., INR for `TCS.NS`). 100 Billion INR is only ~$1.2B USD, meaning Small/Mid-cap Indian stocks will incorrectly be scored as Large-cap US stocks. 
* **Proposed Fix:** Normalize market cap using live FX rates to a base currency (USD) before applying hardcoded thresholds, or dynamically adjust thresholds based on the exchange suffix.

## 3. Score Calculation Logic
> [!IMPORTANT]
> **Severity:** Medium
* **Explanation:** The baseline scores for Technical and Fundamental are arbitrarily set to 50, and adjustments (e.g., `score += 15`) are made sequentially. If an asset triggers multiple bullish indicators but one severely bearish indicator, the additive model fails to capture "veto" scenarios (e.g., imminent bankruptcy overriding a bullish MACD).
* **Proposed Fix:** Implement a non-linear scoring model or apply multiplier-based penalizations for catastrophic risk factors rather than flat addition/subtraction.

## 4. Risk Scoring Methodology
> [!WARNING]
> **Severity:** High
* **Explanation:** `RiskAnalysisService` relies on `yfinance`'s `beta` field, which is frequently `None` for newly listed stocks, ETFs, or certain international exchanges. Attempting to compare `beta > 1.5` when `beta` is `None` will throw a `TypeError`, crashing the endpoint.
* **Proposed Fix:** Calculate rolling Beta manually against a benchmark index (e.g., SPY or NIFTY) using the historical dataframe, rather than relying on the unreliable static field from the API.

## 5. Technical Indicator Implementation
> [!CAUTION]
> **Severity:** Critical
* **Explanation:** The `MarketDataService` fetches `"1y"` of historical data (approx. 252 trading days). The `TechnicalAnalysisService` calculates `SMA_200`. If the stock was listed 150 days ago, `SMA_200` will be `NaN`. Python comparisons (`>`) with `NaN` evaluate to `False`, silently defaulting the trend to "Neutral" without raising an error.
* **Proposed Fix:** Dynamically fetch `"2y"` or `"max"` data to ensure enough periods exist for a 200-SMA warmup. Implement strict `pd.isna()` checks before using technical indicators in scoring logic.

## 6. Recommendation Engine Robustness
> [!NOTE]
> **Severity:** Low
* **Explanation:** The `RecommendationEngine` uses a hardcoded 40/40/20 weighting system. While mathematically sound, this makes it impossible to adjust risk tolerance (e.g., for conservative vs. aggressive portfolios) without altering source code.
* **Proposed Fix:** Parameterize the weights so they can be passed in via the API payload (`/api/stocks/analyze/{symbol}?profile=aggressive`), allowing dynamic weight shifts.

## 7. Edge Cases
> [!WARNING]
> **Severity:** Medium
* **Explanation:** Growth tech companies often intentionally operate with negative EPS to capture market share (e.g., Uber/Tesla historically). The current Fundamental engine strictly penalizes negative EPS (`score -= 20`), which would incorrectly flag highly successful growth stocks as bad investments.
* **Proposed Fix:** Introduce sector-based evaluation criteria. Evaluate EPS growth trajectory (Delta EPS) rather than just static positive/negative values.

## 8. Error Handling
> [!IMPORTANT]
> **Severity:** Medium
* **Explanation:** The `MarketDataService` wraps `yfinance` calls in a broad `except Exception as e: return None`. If Yahoo Finance rate-limits the server, the API silently returns a 404 "Data not found" instead of a 429 "Too Many Requests", hiding the true system state.
* **Proposed Fix:** Catch specific exceptions (`HTTPError`, `JSONDecodeError`) and propagate them up to the FastAPI router to return appropriate HTTP status codes.

## 9. Performance Bottlenecks
> [!WARNING]
> **Severity:** High
* **Explanation:** Calculating `pandas-ta` indicators (MACD, Bollinger Bands, ATR) on the fly for every API request is computationally expensive.
* **Proposed Fix:** Offload calculation to a background Celery/Redis worker queue and serve pre-calculated scores via a fast read-replica DB, OR heavily optimize the Pandas DataFrame operations using `numpy` vectorization directly instead of the full `pandas-ta` suite if latency becomes an issue.

## 10. Security Concerns
> [!IMPORTANT]
> **Severity:** Medium
* **Explanation:** The `{symbol}` path parameter is passed directly into `yf.Ticker(symbol)`. While `yfinance` is relatively safe, accepting unsanitized strings from the web can lead to denial-of-service if users pass extremely long or malformed strings, triggering expensive regex or network parsing internally.
* **Proposed Fix:** Implement a strict regex validator on the FastAPI route (e.g., `^[A-Z0-9=\.\-\^]{1,15}$`) to guarantee only valid ticker formats reach the data layer.

---

## Prioritized Improvement Roadmap

Here are the issues ranked by highest systemic impact to lowest:

1. **[CRITICAL] Technical Indicator `NaN` Crash:** Fix the history fetch length and `NaN` comparisons to prevent silent logic failures.
2. **[CRITICAL] Currency Normalization:** Fix the Market Cap logic so non-USD stocks aren't structurally penalized.
3. **[HIGH] Memory Leak in Cache:** Replace the native `dict` with `TTLCache`.
4. **[HIGH] Unreliable Beta Metric:** Calculate Beta manually instead of relying on missing static API fields.
5. **[MEDIUM] Rate-Limit Obfuscation:** Refactor error handling to distinguish between "Stock doesn't exist" and "Yahoo Finance blocked our IP".
6. **[MEDIUM] Sector-Agnostic Fundamentals:** Add dynamic EPS evaluation so growth stocks aren't blindly punished.
7. **[MEDIUM] Input Sanitization:** Add regex validation to the FastAPI router.
8. **[MEDIUM] Static Scoring Logic:** Move away from hardcoded additive models to a multiplier-based system.
9. **[LOW] Dynamic Weights:** Allow users to pass risk tolerance profiles to the recommendation engine.
10. **[LOW] Asynchronous I/O:** Refactor yfinance calls into an async thread pool wrapper for better concurrency.
