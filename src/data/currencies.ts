// Moedas do conversor e da calculadora de pip. Usado pelo site e pelo coletor
// de câmbio (scripts/), então use só sintaxe TypeScript "apagável".

export interface Currency {
  code: string;
  name: string;
  nameEn: string;
}

/** Moedas com cotação de referência do BCE (Frankfurter), base USD. */
export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'Dólar americano', nameEn: 'US Dollar' },
  { code: 'BRL', name: 'Real', nameEn: 'Brazilian Real' },
  { code: 'EUR', name: 'Euro', nameEn: 'Euro' },
  { code: 'GBP', name: 'Libra esterlina', nameEn: 'British Pound' },
  { code: 'JPY', name: 'Iene', nameEn: 'Japanese Yen' },
  { code: 'CHF', name: 'Franco suíço', nameEn: 'Swiss Franc' },
  { code: 'CAD', name: 'Dólar canadense', nameEn: 'Canadian Dollar' },
  { code: 'AUD', name: 'Dólar australiano', nameEn: 'Australian Dollar' },
  { code: 'NZD', name: 'Dólar neozelandês', nameEn: 'New Zealand Dollar' },
  { code: 'CNY', name: 'Iuan chinês', nameEn: 'Chinese Yuan' },
  { code: 'MXN', name: 'Peso mexicano', nameEn: 'Mexican Peso' },
];

export const currencyByCode = (code: string) => CURRENCIES.find((c) => c.code === code);

export const currencyName = (c: Currency, lang: 'pt' | 'en') => (lang === 'en' ? c.nameEn : c.name);
