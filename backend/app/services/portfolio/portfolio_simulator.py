import pandas as pd
from typing import List, Dict, Any

class PortfolioSimulator:
    """
    Simulates a long-only portfolio starting with $10,000 cash.
    Processes signals chronologically to build an equity curve and trade history.
    """

    INITIAL_CAPITAL = 10000.0

    @staticmethod
    def run_simulation(signals: List[Dict[str, Any]], full_hist_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Runs the portfolio simulation.
        
        Args:
            signals: List of dictionaries containing 'date', 'recommendation', 'entry_price'.
            full_hist_df: Complete historical price dataframe to track daily mark-to-market equity.
            
        Returns:
            Dict containing initial_capital, final_portfolio_value, total_return_percent,
            equity_curve, and trade_history.
        """
        
        if not signals or full_hist_df.empty:
            return {
                "initial_capital": PortfolioSimulator.INITIAL_CAPITAL,
                "final_portfolio_value": PortfolioSimulator.INITIAL_CAPITAL,
                "total_return_percent": 0.0,
                "equity_curve": [],
                "trade_history": []
            }

        # Ensure index is naive for safe string matching
        if full_hist_df.index.tz is not None:
            full_hist_df.index = full_hist_df.index.tz_localize(None)

        # Map signals by date string for O(1) daily lookup
        signals_by_date = {sig['date']: sig for sig in signals}

        # Determine the simulation window
        # We start on the first signal date and end on the last available date in the dataframe (or last signal)
        start_date_str = signals[0]['date']
        end_date_str = signals[-1]['date']
        
        try:
            start_idx = full_hist_df.index.get_loc(pd.to_datetime(start_date_str))
            # We simulate up to the end of the dataframe to see how the final position performs
            simulation_dates = full_hist_df.index[start_idx:]
        except KeyError:
            # Fallback if first signal date isn't cleanly in the index
            simulation_dates = full_hist_df.loc[start_date_str:].index

        cash = PortfolioSimulator.INITIAL_CAPITAL
        shares = 0.0
        
        equity_curve = []
        trade_history = []

        for current_date in simulation_dates:
            date_str = current_date.strftime("%Y-%m-%d")
            
            # 1. Get Current Price
            try:
                stock_price = float(full_hist_df.loc[current_date]['Close'])
                if pd.isna(stock_price) or stock_price <= 0:
                    # Edge Case 5: Invalid prices
                    stock_price = 0.0
            except KeyError:
                # Edge Case 3: Missing prices
                continue
                
            if stock_price == 0.0:
                continue

            # 2. Check for Signal
            signal = signals_by_date.get(date_str)
            
            if signal:
                rec = signal.get('recommendation')
                # Use the signal's entry price if provided, otherwise fallback to current close
                exec_price = signal.get('entry_price', stock_price)
                
                # BUY LOGIC
                if rec == "BUY" and shares == 0:
                    # Invest available cash (fractional shares allowed for pure simulation)
                    shares_bought = cash / exec_price
                    cash = 0.0
                    shares = shares_bought
                    
                    trade_history.append({
                        "date": date_str,
                        "action": "BUY",
                        "shares": round(shares_bought, 4),
                        "price": round(exec_price, 4),
                        "cash_after_trade": round(cash, 2)
                    })
                    
                # SELL LOGIC
                elif rec == "SELL" and shares > 0:
                    # Sell entire position
                    cash_gained = shares * exec_price
                    cash += cash_gained
                    shares_sold = shares
                    shares = 0.0
                    
                    trade_history.append({
                        "date": date_str,
                        "action": "SELL",
                        "shares": round(shares_sold, 4),
                        "price": round(exec_price, 4),
                        "cash_after_trade": round(cash, 2)
                    })
                
                # HOLD LOGIC / Edge Case 1 & 2: Duplicate BUYs or SELLs
                # Handled implicitly: if BUY and shares > 0 -> do nothing.
                # If SELL and shares == 0 -> do nothing.

            # 3. Calculate Daily Portfolio Value (Mark-to-Market)
            position_value = shares * stock_price
            portfolio_value = cash + position_value
            
            equity_curve.append({
                "date": date_str,
                "cash": round(cash, 2),
                "shares": round(shares, 4),
                "stock_price": round(stock_price, 4),
                "position_value": round(position_value, 2),
                "portfolio_value": round(portfolio_value, 2)
            })

        # 4. Final Accounting
        # Edge Case 6: End of simulation with open position
        # We don't force a sell, the portfolio value simply reflects the open position's mark-to-market.
        final_portfolio_value = equity_curve[-1]['portfolio_value'] if equity_curve else PortfolioSimulator.INITIAL_CAPITAL
        total_return_percent = ((final_portfolio_value - PortfolioSimulator.INITIAL_CAPITAL) / PortfolioSimulator.INITIAL_CAPITAL) * 100

        return {
            "initial_capital": PortfolioSimulator.INITIAL_CAPITAL,
            "final_portfolio_value": round(final_portfolio_value, 2),
            "total_return_percent": round(total_return_percent, 2),
            "equity_curve": equity_curve,
            "trade_history": trade_history
        }
