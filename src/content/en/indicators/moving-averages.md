---
title: Moving averages (SMA and EMA)
sigla: MA
description: The average of recent prices, recalculated on every candle. It smooths out noise and shows the direction of the trend.
tipo: Trend
ordem: 1
noGrafico: true
pt: medias-moveis
---

A **moving average** is the average of the closing prices over the last *N* periods, recalculated with each new candle. It "smooths" day-to-day swings and makes it easier to see where the price is heading.

## How it is calculated

- **Simple moving average (SMA):** the sum of the last *N* closes divided by *N*. Every day carries the same weight.
- **Exponential moving average (EMA):** gives more weight to recent prices, so it reacts faster to changes. On each candle: `EMA = price × k + previous EMA × (1 − k)`, with `k = 2 ÷ (N + 1)`.

Most common periods:

- **20:** short term (about one month of trading sessions).
- **50:** medium term.
- **200:** long term. Closely watched by the market as the dividing line between uptrends and downtrends.

## How to read it

- **Price above the average:** buyers have been in control over the period. Below it, sellers.
- **Slope:** a rising average points to an uptrend; a falling one, to a downtrend; a flat one, to a market without direction.
- **Crossovers:** when the short average crosses above the long one (for example, the 50 over the 200), it is called a *golden cross*; when it crosses below, a *death cross*. These trend-change signals usually appear **after** the move has already started.
- **Dynamic support and resistance:** in strong trends, price often "respects" the average, pulling back to it before continuing.

## Caveats

- Averages **lag** by nature: they confirm what has already happened rather than anticipate it.
- In a sideways market, price crosses the average many times and produces false signals.
- The shorter the period, the more signals — and the more noise.

On Easytrader's crypto charts, turn on **MA 20**, **MA 50** and **MA 200** to see all three at once.
