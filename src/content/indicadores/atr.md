---
title: ATR (Average True Range)
sigla: ATR
description: Média da amplitude dos candles. Mede quanto o preço costuma se mover por período — útil para posicionar o stop.
tipo: Volatilidade
ordem: 6
---

O **ATR**, outro indicador de J. Welles Wilder, mede o tamanho médio do movimento do preço por período. Ele não diz nada sobre direção: só **quanto** o ativo costuma andar.

## Como é calculado

1. Para cada candle, o **true range** é o maior entre:
   - máxima − mínima;
   - |máxima − fechamento anterior|;
   - |mínima − fechamento anterior|.
2. O **ATR** é a média (suavizada, normalmente de 14 períodos) do true range.

Considerar o fechamento anterior inclui os *gaps* — saltos de preço entre um candle e outro.

## Como interpretar

- **ATR subindo:** volatilidade aumentando, candles maiores.
- **ATR caindo:** mercado mais calmo.
- **Uso em gestão de risco:** muitos traders definem o stop a uma distância de 1,5 a 3 ATRs do preço de entrada, para não serem tirados da operação pelo "ruído" normal do ativo.
- **Comparar ativos:** dividir o ATR pelo preço dá a volatilidade em percentual.

## Cuidados

- O ATR é medido em unidades de preço: ATR de 2.000 no Bitcoin e de 2 numa ação podem representar a mesma volatilidade relativa.
- Picos de ATR costumam acontecer em quedas bruscas, quando a volatilidade dispara.

O ATR está disponível no botão **Indicadores** dos gráficos do TradingView nas páginas de ações, índices e câmbio.
