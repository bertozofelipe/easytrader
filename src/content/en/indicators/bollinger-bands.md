---
title: Bollinger Bands
sigla: BB
description: A moving average with two standard-deviation bands. Shows volatility and when price is stretched.
tipo: Volatility
ordem: 4
noGrafico: true
pt: bandas-de-bollinger
---

**Bollinger Bands**, created by John Bollinger in the 1980s, wrap the price in a channel that widens when the market gets more volatile and narrows when it calms down.

## How they are calculated

With the standard settings (20, 2):

- **Middle band:** 20-period simple moving average.
- **Upper band:** average + 2 standard deviations of the last 20 closes.
- **Lower band:** average − 2 standard deviations.

Statistically, most closes fall inside the bands.

## How to read them

- **Band width:** wide bands = high volatility; narrow bands = low volatility.
- **Squeeze:** periods of very narrow bands often come before strong moves — but they do not tell you in which direction.
- **Price at the upper or lower band:** the move is stretched relative to the recent average. In strong trends, price can "walk" along a band for a long time.
- **Mean reversion:** in sideways markets, price tends to swing between the bands, returning to the middle band.

## Caveats

- Touching a band **is not** a reversal signal on its own.
- The indicator measures volatility, not direction. Combine it with trend (moving averages) and momentum (RSI, MACD).

On crypto charts, turn on **Bollinger** to see the three lines over the price (the middle one is dashed).
