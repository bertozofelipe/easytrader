---
title: ATR (Average True Range)
sigla: ATR
description: The average size of the candles. Measures how much price typically moves per period — useful for placing a stop.
tipo: Volatility
ordem: 6
pt: atr
---

The **ATR**, another indicator by J. Welles Wilder, measures the average size of price moves per period. It says nothing about direction: only **how much** the asset usually moves.

## How it is calculated

1. For each candle, the **true range** is the largest of:
   - high − low;
   - |high − previous close|;
   - |low − previous close|.
2. The **ATR** is the (smoothed, usually 14-period) average of the true range.

Using the previous close accounts for *gaps* — price jumps from one candle to the next.

## How to read it

- **Rising ATR:** volatility increasing, bigger candles.
- **Falling ATR:** a calmer market.
- **Risk management:** many traders place their stop 1.5 to 3 ATRs away from the entry, so the asset's normal "noise" does not knock them out of the trade.
- **Comparing assets:** dividing the ATR by the price gives volatility as a percentage.

## Caveats

- The ATR is measured in price units: an ATR of 2,000 on Bitcoin and of 2 on a stock can represent the same relative volatility.
- ATR spikes tend to happen during sharp sell-offs, when volatility jumps.

The ATR is available under the **Indicators** button of the TradingView charts on stock, index and FX pages.
