---
title: Bandas de Bollinger
sigla: BB
description: Uma média móvel com duas bandas de desvio padrão. Mostra a volatilidade e quando o preço está esticado.
tipo: Volatilidade
ordem: 4
noGrafico: true
---

As **Bandas de Bollinger**, criadas por John Bollinger nos anos 1980, envolvem o preço com uma faixa que se alarga quando o mercado fica mais volátil e se estreita quando ele se acalma.

## Como são calculadas

Com os parâmetros padrão (20, 2):

- **Banda do meio:** média móvel simples de 20 períodos.
- **Banda superior:** média + 2 desvios padrão dos últimos 20 fechamentos.
- **Banda inferior:** média − 2 desvios padrão.

Estatisticamente, a maior parte dos fechamentos fica dentro das bandas.

## Como interpretar

- **Largura das bandas:** bandas largas = volatilidade alta; bandas estreitas = volatilidade baixa.
- **Estreitamento (squeeze):** períodos de bandas muito estreitas costumam anteceder movimentos fortes — mas não dizem para qual lado.
- **Preço na banda superior ou inferior:** o movimento está esticado em relação à média recente. Em tendências fortes, o preço pode "caminhar" pela banda por muito tempo.
- **Retorno à média:** em mercados laterais, o preço tende a oscilar entre as bandas, voltando para a banda do meio.

## Cuidados

- Tocar a banda **não é** sinal de reversão por si só.
- O indicador mede volatilidade, não direção. Combine com tendência (médias) e momento (RSI, MACD).

No gráfico dos ativos cripto, ligue **Bollinger** para ver as três linhas sobre o preço (a do meio é tracejada).
