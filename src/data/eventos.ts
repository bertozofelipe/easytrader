// Eventos econômicos que mais movem o mercado, explicados para iniciantes.
// Horários em Brasília variam com o horário de verão dos EUA/Europa (o Brasil não tem).

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
