---
title: Estocástico
sigla: STOCH
description: Oscilador de 0 a 100 que mostra onde o fechamento está em relação à faixa de preço recente.
tipo: Momento
ordem: 5
---

O **oscilador estocástico**, popularizado por George Lane, parte de uma ideia simples: em tendências de alta, os fechamentos tendem a ficar perto das máximas do período; em tendências de baixa, perto das mínimas.

## Como é calculado

Com os parâmetros mais comuns (14, 3, 3):

- `%K = (fechamento − mínima de 14 períodos) ÷ (máxima de 14 − mínima de 14) × 100`
- **%K lento:** média de 3 períodos do %K.
- **%D:** média de 3 períodos do %K lento (a "linha de sinal").

## Como interpretar

- **Acima de 80:** sobrecompra — o fechamento está perto do topo da faixa recente.
- **Abaixo de 20:** sobrevenda — perto do fundo da faixa.
- **Cruzamentos de %K e %D** indicam mudanças de momento, mais relevantes quando acontecem nas regiões extremas.
- **Divergências** com o preço sugerem perda de força do movimento.

## Cuidados

- É mais sensível que o RSI: gera mais sinais e mais sinais falsos.
- Em tendências fortes, pode ficar "grudado" nos extremos.

O estocástico está disponível no botão **Indicadores** dos gráficos do TradingView nas páginas de ações, índices e câmbio.
