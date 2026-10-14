---
title: Stochastic
sigla: STOCH
description: A 0–100 oscillator that shows where the close sits within the recent price range.
tipo: Momentum
ordem: 5
pt: estocastico
---

The **stochastic oscillator**, popularized by George Lane, starts from a simple idea: in uptrends, closes tend to sit near the period's highs; in downtrends, near the lows.

## How it is calculated

With the most common settings (14, 3, 3):

- `%K = (close − 14-period low) ÷ (14-period high − 14-period low) × 100`
- **Slow %K:** 3-period average of %K.
- **%D:** 3-period average of the slow %K (the "signal line").

## How to read it

- **Above 80:** overbought — the close is near the top of the recent range.
- **Below 20:** oversold — near the bottom of the range.
- **%K and %D crossovers** point to shifts in momentum, and matter more when they happen in the extreme zones.
- **Divergences** from price suggest the move is losing strength.

## Caveats

- It is more sensitive than the RSI: more signals, and more false signals.
- In strong trends, it can stay "stuck" at the extremes.

The stochastic is available under the **Indicators** button of the TradingView charts on stock, index and FX pages.
