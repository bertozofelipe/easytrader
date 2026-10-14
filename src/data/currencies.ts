// Moedas do conversor e da calculadora de pip. Usado pelo site e pelo coletor
// de câmbio (scripts/), então use só sintaxe TypeScript "apagável".

export interface Currency {
  code: string;
  name: string;
}

/** Moedas com cotação de referência do BCE (Frankfurter), base USD. */
export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'Dólar americano' },
  { code: 'BRL', name: 'Real' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'JPY', name: 'Iene' },
  { code: 'CHF', name: 'Franco suíço' },
  { code: 'CAD', name: 'Dólar canadense' },
  { code: 'AUD', name: 'Dólar australiano' },
  { code: 'NZD', name: 'Dólar neozelandês' },
  { code: 'CNY', name: 'Iuan chinês' },
  { code: 'MXN', name: 'Peso mexicano' },
];

export const currencyByCode = (code: string) => CURRENCIES.find((c) => c.code === code);
