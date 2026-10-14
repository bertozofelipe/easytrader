---
title: MACD
sigla: MACD
description: The difference between two exponential moving averages. Shows trend direction and strength, and shifts in momentum.
tipo: Momentum
ordem: 3
noGrafico: true
pt: macd
---

The **MACD** (*Moving Average Convergence Divergence*), created by Gerald Appel, measures the distance between a fast and a slow exponential moving average. When that distance widens, the move is gaining strength; when it narrows, it is losing strength.

## How it is calculated

With the standard settings (12, 26, 9):

- **MACD line:** `12-period EMA − 26-period EMA` of the closes.
- **Signal line:** 9-period EMA of the MACD line itself.
- **Histogram:** `MACD line − signal line`.

## How to read it

- **MACD above the signal line** (positive histogram): bullish momentum. Below it (negative histogram): bearish momentum.
- **Zero-line cross:** MACD above zero means the fast average is above the slow one — an uptrend over the period.
- **Shrinking histogram:** the current move is losing strength, even if price is still advancing.
- **Divergences:** price at a new high with the MACD at a lower high suggests weakening.

## Caveats

- Because it is built from averages, the MACD also **lags**.
- In a sideways market, it produces many false crossovers.
- The MACD value depends on the asset's price: you cannot compare Bitcoin's MACD with another coin's.

On crypto charts, the MACD appears in its own panel: blue line (MACD), orange line (signal) and a green/red histogram.
