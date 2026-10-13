---
title: Médias móveis (SMA e EMA)
sigla: MM
description: A média dos últimos preços, recalculada a cada candle. Suaviza o ruído e mostra a direção da tendência.
tipo: Tendência
ordem: 1
noGrafico: true
---

A **média móvel** é a média dos preços de fechamento dos últimos *N* períodos, recalculada a cada novo candle. Ela "suaviza" as oscilações do dia a dia e deixa mais visível para onde o preço está indo.

## Como é calculada

- **Média móvel simples (SMA):** soma dos últimos *N* fechamentos dividida por *N*. Todos os dias têm o mesmo peso.
- **Média móvel exponencial (EMA):** dá mais peso aos preços recentes, então reage mais rápido às mudanças. A cada candle: `EMA = preço × k + EMA anterior × (1 − k)`, com `k = 2 ÷ (N + 1)`.

Períodos mais usados:

- **20:** curto prazo (cerca de um mês de pregões).
- **50:** médio prazo.
- **200:** longo prazo. Muito observada pelo mercado como divisor entre tendência de alta e de baixa.

## Como interpretar

- **Preço acima da média:** os compradores vêm dominando no período considerado. Abaixo, os vendedores.
- **Inclinação:** média subindo indica tendência de alta; caindo, de baixa; de lado, mercado sem direção.
- **Cruzamentos:** quando a média curta cruza a longa para cima (por exemplo, 50 sobre 200), fala-se em *golden cross*; para baixo, *death cross*. São sinais de mudança de tendência que costumam aparecer **depois** que o movimento já começou.
- **Suporte e resistência dinâmicos:** em tendências fortes, o preço muitas vezes "respeita" a média, voltando a ela antes de continuar.

## Cuidados

- Médias são **atrasadas** por natureza: confirmam o que já aconteceu, não antecipam.
- Em mercado lateral, o preço cruza a média várias vezes e gera sinais falsos.
- Quanto mais curto o período, mais sinais — e mais ruído.

No gráfico dos ativos cripto do Easytrader, ligue **MM 20**, **MM 50** e **MM 200** para ver as três ao mesmo tempo.
