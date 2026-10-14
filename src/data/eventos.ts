// Eventos econômicos que mais movem o mercado, explicados para iniciantes.
// Em português, horários também em Brasília (variam com o horário de verão dos
// EUA/Europa; o Brasil não tem). Versão em inglês em EVENTS_EN, no fim do arquivo.

export interface EventoEconomico {
  id: string;
  nome: string;
  pais: string;
  frequencia: string;
  horario: string;
  oQueE: string;
  porQueImporta: string;
  afeta: string[];
}

export const EVENTOS: EventoEconomico[] = [
  {
    id: 'payroll',
    nome: 'Payroll (Non-Farm Payrolls)',
    pais: 'EUA',
    frequencia: 'Mensal, normalmente na 1ª sexta-feira do mês',
    horario: '8h30 em Nova York (9h30 ou 10h30 em Brasília)',
    oQueE: 'Relatório de emprego que mostra quantas vagas foram criadas fora do setor agrícola, além da taxa de desemprego e da variação dos salários.',
    porQueImporta: 'Mercado de trabalho forte pode manter a inflação alta e levar o Fed a segurar os juros. É um dos dados que mais causa volatilidade no mês.',
    afeta: ['Dólar', 'S&P 500 e Nasdaq', 'Ouro', 'Juros dos títulos americanos', 'Cripto'],
  },
  {
    id: 'cpi',
    nome: 'CPI (inflação ao consumidor)',
    pais: 'EUA',
    frequencia: 'Mensal, por volta do dia 10 a 15',
    horario: '8h30 em Nova York (9h30 ou 10h30 em Brasília)',
    oQueE: 'Índice de preços ao consumidor. O mercado olha tanto o índice cheio quanto o "núcleo", que exclui alimentos e energia.',
    porQueImporta: 'É a principal medida de inflação acompanhada pelo mercado. Inflação acima do esperado reforça juros altos por mais tempo.',
    afeta: ['Dólar', 'Índices de ações', 'Ouro', 'Cripto'],
  },
  {
    id: 'fomc',
    nome: 'Decisão de juros do Fed (FOMC)',
    pais: 'EUA',
    frequencia: '8 reuniões por ano',
    horario: '14h em Nova York (15h ou 16h em Brasília), com entrevista do presidente do Fed 30 min depois',
    oQueE: 'O comitê do banco central americano define a faixa da taxa básica de juros e sinaliza os próximos passos.',
    porQueImporta: 'Os juros americanos influenciam o preço de praticamente todos os ativos do mundo. O tom do comunicado e da entrevista importa tanto quanto a decisão.',
    afeta: ['Todos os mercados'],
  },
  {
    id: 'pce',
    nome: 'PCE (inflação preferida do Fed)',
    pais: 'EUA',
    frequencia: 'Mensal, no fim do mês',
    horario: '8h30 em Nova York (9h30 ou 10h30 em Brasília)',
    oQueE: 'Índice de preços dos gastos com consumo pessoal. O núcleo do PCE é a medida de inflação usada pelo Fed como meta (2%).',
    porQueImporta: 'Costuma mexer menos que o CPI, porque parte dele já é estimada antes, mas confirma ou contradiz a leitura de inflação do mês.',
    afeta: ['Dólar', 'Índices de ações', 'Ouro'],
  },
  {
    id: 'pib-eua',
    nome: 'PIB',
    pais: 'EUA',
    frequencia: 'Trimestral, com revisões mensais',
    horario: '8h30 em Nova York (9h30 ou 10h30 em Brasília)',
    oQueE: 'Mede o crescimento da economia. A primeira leitura ("advance") é a que mais mexe com o mercado.',
    porQueImporta: 'Mostra se a economia está acelerando ou entrando em recessão, o que afeta lucros das empresas e a política de juros.',
    afeta: ['Índices de ações', 'Dólar'],
  },
  {
    id: 'pmi',
    nome: 'PMI / ISM (atividade da indústria e serviços)',
    pais: 'EUA, Europa, China',
    frequencia: 'Mensal, nos primeiros dias úteis',
    horario: 'Varia por país; ISM dos EUA às 10h em Nova York (11h ou 12h em Brasília)',
    oQueE: 'Pesquisas com gerentes de compras. Acima de 50 indica expansão; abaixo de 50, contração.',
    porQueImporta: 'É um termômetro antecipado da economia, divulgado antes de dados mais "duros" como o PIB.',
    afeta: ['Índices de ações', 'Moedas', 'Commodities'],
  },
  {
    id: 'jobless',
    nome: 'Pedidos de seguro-desemprego',
    pais: 'EUA',
    frequencia: 'Semanal, às quintas-feiras',
    horario: '8h30 em Nova York (9h30 ou 10h30 em Brasília)',
    oQueE: 'Número de novos pedidos de auxílio-desemprego na semana.',
    porQueImporta: 'Dado de alta frequência sobre o mercado de trabalho. Mexe mais quando o mercado está preocupado com desaceleração.',
    afeta: ['Dólar', 'Índices de ações'],
  },
  {
    id: 'bce',
    nome: 'Decisão de juros do BCE',
    pais: 'Zona do euro',
    frequencia: '8 reuniões por ano',
    horario: '14h15 em Frankfurt (9h15 ou 10h15 em Brasília), entrevista 30 min depois',
    oQueE: 'O Banco Central Europeu define as taxas de juros da zona do euro.',
    porQueImporta: 'Principal motor do euro. A diferença entre os juros da Europa e dos EUA influencia o par EUR/USD.',
    afeta: ['EUR/USD', 'Bolsas europeias'],
  },
  {
    id: 'copom',
    nome: 'Copom (Selic)',
    pais: 'Brasil',
    frequencia: '8 reuniões por ano, decisão às quartas-feiras',
    horario: 'Por volta das 18h30 em Brasília, após o fechamento do mercado',
    oQueE: 'O Comitê de Política Monetária do Banco Central do Brasil define a taxa Selic.',
    porQueImporta: 'Afeta o real, a bolsa brasileira e o rendimento da renda fixa. A ata, divulgada na terça seguinte, detalha o raciocínio.',
    afeta: ['USD/BRL', 'Ibovespa', 'Juros futuros (DI)'],
  },
];

/**
 * Versão em inglês (mesmos ids e ordem). Horários no fuso local de cada
 * mercado, já que o leitor pode estar em qualquer lugar.
 */
export const EVENTS_EN: EventoEconomico[] = [
  {
    id: 'payroll',
    nome: 'Non-Farm Payrolls (NFP)',
    pais: 'US',
    frequencia: 'Monthly, usually on the first Friday of the month',
    horario: '8:30 am New York time',
    oQueE: 'Employment report showing how many jobs were added outside the farm sector, plus the unemployment rate and wage growth.',
    porQueImporta: 'A strong labor market can keep inflation high and lead the Fed to hold rates. It is one of the most volatile releases of the month.',
    afeta: ['US dollar', 'S&P 500 and Nasdaq', 'Gold', 'US Treasury yields', 'Crypto'],
  },
  {
    id: 'cpi',
    nome: 'CPI (consumer inflation)',
    pais: 'US',
    frequencia: 'Monthly, around the 10th to 15th',
    horario: '8:30 am New York time',
    oQueE: 'Consumer price index. The market watches both the headline index and the "core" reading, which excludes food and energy.',
    porQueImporta: 'It is the main inflation gauge the market follows. Hotter-than-expected inflation reinforces higher-for-longer interest rates.',
    afeta: ['US dollar', 'Stock indices', 'Gold', 'Crypto'],
  },
  {
    id: 'fomc',
    nome: 'Fed rate decision (FOMC)',
    pais: 'US',
    frequencia: '8 meetings a year',
    horario: '2:00 pm New York time, with the Fed Chair press conference 30 min later',
    oQueE: "The US central bank's committee sets the target range for the policy rate and signals its next steps.",
    porQueImporta: "US interest rates influence the price of virtually every asset in the world. The tone of the statement and the press conference matters as much as the decision itself.",
    afeta: ['All markets'],
  },
  {
    id: 'pce',
    nome: "PCE (the Fed's preferred inflation gauge)",
    pais: 'US',
    frequencia: 'Monthly, at the end of the month',
    horario: '8:30 am New York time',
    oQueE: "Personal consumption expenditures price index. Core PCE is the inflation measure the Fed targets (2%).",
    porQueImporta: "It usually moves markets less than CPI, because part of it can be estimated in advance, but it confirms or contradicts the month's inflation picture.",
    afeta: ['US dollar', 'Stock indices', 'Gold'],
  },
  {
    id: 'pib-eua',
    nome: 'GDP',
    pais: 'US',
    frequencia: 'Quarterly, with monthly revisions',
    horario: '8:30 am New York time',
    oQueE: 'Measures economic growth. The first ("advance") estimate is the one that moves markets the most.',
    porQueImporta: 'It shows whether the economy is accelerating or heading into recession, which affects corporate earnings and interest-rate policy.',
    afeta: ['Stock indices', 'US dollar'],
  },
  {
    id: 'pmi',
    nome: 'PMI / ISM (manufacturing and services activity)',
    pais: 'US, Europe, China',
    frequencia: 'Monthly, in the first business days',
    horario: 'Varies by country; US ISM at 10:00 am New York time',
    oQueE: 'Surveys of purchasing managers. Above 50 signals expansion; below 50, contraction.',
    porQueImporta: 'It is an early read on the economy, released before "harder" data such as GDP.',
    afeta: ['Stock indices', 'Currencies', 'Commodities'],
  },
  {
    id: 'jobless',
    nome: 'Initial jobless claims',
    pais: 'US',
    frequencia: 'Weekly, on Thursdays',
    horario: '8:30 am New York time',
    oQueE: 'Number of new unemployment benefit claims filed during the week.',
    porQueImporta: 'High-frequency data on the labor market. It matters more when the market is worried about a slowdown.',
    afeta: ['US dollar', 'Stock indices'],
  },
  {
    id: 'bce',
    nome: 'ECB rate decision',
    pais: 'Euro area',
    frequencia: '8 meetings a year',
    horario: '2:15 pm Frankfurt time, press conference 30 min later',
    oQueE: 'The European Central Bank sets interest rates for the euro area.',
    porQueImporta: 'The main driver of the euro. The gap between European and US rates influences EUR/USD.',
    afeta: ['EUR/USD', 'European stocks'],
  },
  {
    id: 'copom',
    nome: 'Copom (Brazil Selic rate)',
    pais: 'Brazil',
    frequencia: '8 meetings a year, decision on Wednesdays',
    horario: 'Around 6:30 pm Brasília time (UTC−3), after the market closes',
    oQueE: "The Monetary Policy Committee of Brazil's central bank sets the Selic rate.",
    porQueImporta: "It affects the Brazilian real, Brazil's stock market and fixed-income yields. The minutes, released the following Tuesday, explain the reasoning.",
    afeta: ['USD/BRL', 'Ibovespa', 'Brazilian rate futures (DI)'],
  },
];
