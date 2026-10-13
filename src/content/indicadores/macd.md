---
title: MACD
sigla: MACD
description: Diferença entre duas médias exponenciais. Mostra direção e força da tendência e mudanças de momento.
tipo: Momento
ordem: 3
noGrafico: true
---

O **MACD** (*Moving Average Convergence Divergence*), criado por Gerald Appel, mede a distância entre uma média exponencial rápida e uma lenta. Quando essa distância aumenta, o movimento está ganhando força; quando diminui, perdendo.

## Como é calculado

Com os parâmetros padrão (12, 26, 9):

- **Linha MACD:** `EMA de 12 − EMA de 26` dos fechamentos.
- **Linha de sinal:** EMA de 9 períodos da própria linha MACD.
- **Histograma:** `linha MACD − linha de sinal`.

## Como interpretar

- **MACD acima da linha de sinal** (histograma positivo): momento de alta. Abaixo (histograma negativo): momento de baixa.
- **Cruzamento da linha zero:** MACD acima de zero significa que a média rápida está acima da lenta, ou seja, tendência de alta no período.
- **Histograma encolhendo:** o movimento atual está perdendo força, mesmo que o preço ainda avance.
- **Divergências:** preço em nova máxima com MACD em máxima menor sugere enfraquecimento.

## Cuidados

- Por ser feito de médias, o MACD também é **atrasado**.
- Em mercado lateral, gera muitos cruzamentos falsos.
- O valor do MACD depende do preço do ativo: não dá para comparar o MACD do Bitcoin com o de outra moeda.

No gráfico dos ativos cripto, o MACD aparece num painel próprio: linha azul (MACD), linha laranja (sinal) e histograma verde/vermelho.
