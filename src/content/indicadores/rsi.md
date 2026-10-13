---
title: RSI (Índice de Força Relativa)
sigla: RSI
description: Oscilador de 0 a 100 que mede a força dos movimentos recentes e aponta regiões de sobrecompra e sobrevenda.
tipo: Momento
ordem: 2
noGrafico: true
---

O **RSI** (*Relative Strength Index*), criado por J. Welles Wilder em 1978, compara o tamanho das altas com o tamanho das quedas recentes. O resultado é um número entre **0 e 100**.

## Como é calculado

Com o período padrão de 14 candles:

1. Separe as variações de fechamento em **ganhos** (dias de alta) e **perdas** (dias de queda).
2. Calcule a média dos ganhos e a média das perdas dos últimos 14 períodos, com a suavização de Wilder: `média nova = (média anterior × 13 + valor atual) ÷ 14`.
3. `RS = média dos ganhos ÷ média das perdas` e `RSI = 100 − 100 ÷ (1 + RS)`.

## Como interpretar

- **Acima de 70:** região de **sobrecompra** — as altas recentes foram fortes e o movimento está esticado.
- **Abaixo de 30:** região de **sobrevenda** — as quedas recentes foram fortes.
- **Acima de 50:** força compradora predominando; abaixo de 50, vendedora.
- **Divergência:** o preço faz uma nova máxima, mas o RSI faz uma máxima menor. Indica que o movimento está perdendo força (o mesmo vale para mínimas).

## Cuidados

- Sobrecompra **não significa** que o preço vai cair. Em tendências fortes, o RSI pode ficar acima de 70 por semanas.
- Funciona melhor em mercados laterais do que em tendências fortes.
- Use junto com a tendência (médias móveis) e com níveis de preço, nunca isolado.

No gráfico dos ativos cripto, o RSI aparece num painel abaixo do preço, com linhas tracejadas em 70 e 30.
