from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

class RecommendationValidationService:
    """
    Validates recommendations against future market data to measure signal accuracy.
    Future prices are ONLY accessed after the signal has been generated, strictly
    preserving look-ahead bias protection.
    """

    @staticmethod
    def _is_correct(recommendation: str, ret: float) -> bool:
        """
        Applies correctness rules:
        - BUY: return > 0
        - HOLD: return between -0.05 and +0.05
        - SELL: return < 0
        """
        if pd.isna(ret):
            return False
            
        if recommendation == "BUY":
            return ret > 0
        elif recommendation == "SELL":
            return ret < 0
        elif recommendation == "HOLD":
            return -0.05 <= ret <= 0.05
        return False

    @staticmethod
    def validate_signals(signals: List[Dict[str, Any]], full_hist_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validates a list of signals against the full historical dataframe.
        
        Args:
            signals: Output from HistoricalSimulationEngine
            full_hist_df: The complete price dataframe for the asset
            
        Returns:
            Dict containing 'validated_signals' and 'statistics_summary'
        """
        
        if full_hist_df.empty or not signals:
            return {
                "validated_signals": [],
                "statistics_summary": {
                    "total_signals": 0, "buy_signals": 0, "hold_signals": 0, "sell_signals": 0,
                    "accuracy_7d": 0, "accuracy_30d": 0, "accuracy_90d": 0
                }
            }

        # Normalize index to timezone-naive dates for stable matching
        if full_hist_df.index.tz is not None:
            full_hist_df.index = full_hist_df.index.tz_localize(None)
            
        validated_signals = []
        
        # Stats tracking
        stats = {
            "7d_correct": 0, "7d_total": 0,
            "30d_correct": 0, "30d_total": 0,
            "90d_correct": 0, "90d_total": 0,
            "buy": 0, "hold": 0, "sell": 0
        }

        for signal in signals:
            sig_date_str = signal['date']
            rec = signal['recommendation']
            conf = signal['confidence_score']
            
            # Track counts
            stats[rec.lower()] += 1

            try:
                # Find the index of the signal date in the dataframe
                sig_date = pd.to_datetime(sig_date_str)
                
                # Handle missing dates (e.g. holidays). Use bfill/ffill or nearest index conceptually.
                # In a strict simulation, the signal date should exist in the dataframe.
                if sig_date not in full_hist_df.index:
                    raise KeyError(f"Date {sig_date} not in index")
                
                iloc_idx = full_hist_df.index.get_loc(sig_date)
                
                # Entry price is the close price of the signal day
                entry_price = float(full_hist_df.iloc[iloc_idx]['Close'])
                
                # Helper to get future return and correctness
                def get_future_metrics(offset: int):
                    future_idx = iloc_idx + offset
                    if future_idx < len(full_hist_df):
                        future_price = float(full_hist_df.iloc[future_idx]['Close'])
                        if pd.isna(future_price) or entry_price == 0:
                            return None, None
                        ret = (future_price - entry_price) / entry_price
                        correct = RecommendationValidationService._is_correct(rec, ret)
                        return ret, correct
                    return None, None

                # Calculate returns (using trading days offset, not calendar days)
                ret_7d, correct_7d = get_future_metrics(7)
                ret_30d, correct_30d = get_future_metrics(30)
                ret_90d, correct_90d = get_future_metrics(90)
                
                # Update stats
                if correct_7d is not None:
                    stats["7d_total"] += 1
                    if correct_7d: stats["7d_correct"] += 1
                if correct_30d is not None:
                    stats["30d_total"] += 1
                    if correct_30d: stats["30d_correct"] += 1
                if correct_90d is not None:
                    stats["90d_total"] += 1
                    if correct_90d: stats["90d_correct"] += 1

                validated_signals.append({
                    "date": sig_date_str,
                    "recommendation": rec,
                    "confidence_score": conf,
                    "entry_price": round(entry_price, 4),
                    "return_7d": round(ret_7d, 4) if ret_7d is not None else None,
                    "return_30d": round(ret_30d, 4) if ret_30d is not None else None,
                    "return_90d": round(ret_90d, 4) if ret_90d is not None else None,
                    "recommendation_correct": {
                        "7d": correct_7d,
                        "30d": correct_30d,
                        "90d": correct_90d
                    }
                })

            except (KeyError, IndexError) as e:
                # Handle Edge Case: Missing dates or malformed indices
                # We skip signals where the historical entry price cannot be resolved safely
                pass

        # Calculate Accuracies
        calc_acc = lambda correct, total: round((correct / total) * 100, 2) if total > 0 else 0.0

        summary = {
            "total_signals": len(signals),
            "buy_signals": stats["buy"],
            "hold_signals": stats["hold"],
            "sell_signals": stats["sell"],
            "accuracy_7d": calc_acc(stats["7d_correct"], stats["7d_total"]),
            "accuracy_30d": calc_acc(stats["30d_correct"], stats["30d_total"]),
            "accuracy_90d": calc_acc(stats["90d_correct"], stats["90d_total"])
        }

        return {
            "validated_signals": validated_signals,
            "statistics_summary": summary
        }
