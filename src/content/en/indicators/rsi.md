---
title: RSI (Relative Strength Index)
sigla: RSI
description: A 0–100 oscillator that measures the strength of recent moves and highlights overbought and oversold zones.
tipo: Momentum
ordem: 2
noGrafico: true
pt: rsi
---

The **RSI** (*Relative Strength Index*), created by J. Welles Wilder in 1978, compares the size of recent gains with the size of recent losses. The result is a number between **0 and 100**.

## How it is calculated

With the standard 14-candle period:

1. Split the changes in closing price into **gains** (up days) and **losses** (down days).
2. Compute the average gain and the average loss over the last 14 periods, using Wilder's smoothing: `new average = (previous average × 13 + current value) ÷ 14`.
3. `RS = average gain ÷ average loss` and `RSI = 100 − 100 ÷ (1 + RS)`.

## How to read it

- **Above 70:** **overbought** zone — recent gains have been strong and the move is stretched.
- **Below 30:** **oversold** zone — recent losses have been strong.
- **Above 50:** buying strength dominates; below 50, selling strength.
- **Divergence:** price makes a new high but the RSI makes a lower high. It suggests the move is losing steam (the same applies to lows).

## Caveats

- Overbought **does not mean** the price will fall. In strong trends, the RSI can stay above 70 for weeks.
- It works better in sideways markets than in strong trends.
- Use it together with the trend (moving averages) and price levels, never on its own.

On crypto charts, the RSI appears in a panel below the price, with dashed lines at 70 and 30.
