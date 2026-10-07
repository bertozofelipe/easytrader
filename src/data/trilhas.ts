export const TRILHAS = [
  { id: 'fundamentos', titulo: 'Fundamentos', desc: 'O que é o mercado, tipos de ativos, como os preços se formam.' },
  { id: 'analise-tecnica', titulo: 'Análise técnica', desc: 'Gráficos, candles, tendências, suportes, resistências e indicadores.' },
  { id: 'gestao-de-risco', titulo: 'Gestão de risco', desc: 'Stop, tamanho de posição, risco-retorno e como sobreviver no mercado.' },
  { id: 'psicologia', titulo: 'Psicologia', desc: 'Disciplina, controle emocional e os vieses que mais custam caro.' },
  { id: 'operacional', titulo: 'Operacional', desc: 'Corretoras, exchanges, tipos de ordem, custos e plataformas.' },
] as const;

export type TrilhaId = (typeof TRILHAS)[number]['id'];
