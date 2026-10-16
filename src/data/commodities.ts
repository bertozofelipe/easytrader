// Commodities acompanhadas na seção de notícias. Usado pelo coletor de RSS
// (scripts/providers/rss.mjs, via type stripping) para classificar e filtrar as
// matérias, e pelo site para rótulos e filtros: só sintaxe TypeScript "apagável".
//
// Os termos são comparados com o texto em minúsculas e sem acentos.

export type CommodityGroup = 'metais' | 'energia' | 'graos' | 'pecuaria' | 'agricolas';

export const COMMODITY_GROUPS: { id: CommodityGroup; pt: string; en: string; tone: string }[] = [
  { id: 'metais', pt: 'Metais', en: 'Metals', tone: 'text-amber-300 border-amber-300/40' },
  { id: 'energia', pt: 'Energia', en: 'Energy', tone: 'text-orange-400 border-orange-400/40' },
  { id: 'graos', pt: 'Grãos', en: 'Grains', tone: 'text-lime-400 border-lime-400/40' },
  { id: 'pecuaria', pt: 'Pecuária', en: 'Livestock', tone: 'text-rose-400 border-rose-400/40' },
  { id: 'agricolas', pt: 'Café, açúcar e outros', en: 'Softs', tone: 'text-yellow-500 border-yellow-500/40' },
];

export interface Commodity {
  id: string;
  group: CommodityGroup;
  pt: string;
  en: string;
  terms: RegExp;
}

export const COMMODITIES: Commodity[] = [
  { id: 'ouro', group: 'metais', pt: 'Ouro', en: 'Gold', terms: /\b(ouro|gold|xau(\/?usd)?)\b/ },
  { id: 'prata', group: 'metais', pt: 'Prata', en: 'Silver', terms: /\b(prata|silver|xag(\/?usd)?)\b/ },
  { id: 'cobre', group: 'metais', pt: 'Cobre', en: 'Copper', terms: /\b(cobre|copper)\b/ },
  { id: 'minerio', group: 'metais', pt: 'Minério e aço', en: 'Iron ore & steel', terms: /\b(minerio de ferro|minerio|iron ore|aco|steel|siderurg\w*)\b/ },
  {
    id: 'metais',
    group: 'metais',
    pt: 'Outros metais',
    en: 'Other metals',
    terms: /\b(aluminio|alumin(um|ium)|niquel|nickel|zinco|zinc|platina|platinum|paladio|palladium|litio|lithium|terras raras|rare earths?|cobalto|cobalt|estanho|tin prices?|uranio|uranium)\b/,
  },
  { id: 'petroleo', group: 'energia', pt: 'Petróleo', en: 'Oil', terms: /\b(petroleo|(?<!(palm|soybean|olive|vegetable|cooking|edible) )oil|crude|brent|wti|opep\+?|opec\+?)\b/ },
  { id: 'gas', group: 'energia', pt: 'Gás natural', en: 'Natural gas', terms: /\b(gas natural|natural gas|gas europeu|european gas|gnl|lng|henry hub|ttf)\b/ },
  {
    id: 'combustiveis',
    group: 'energia',
    pt: 'Combustíveis',
    en: 'Fuels',
    terms: /\b(diesel|gasolina|gasoline|querosene|jet fuel|fuel oil|combustive(l|is)|etanol|ethanol|biodiesel|carvao|coal|refinarias?|refinery|refineries)\b/,
  },
  { id: 'soja', group: 'graos', pt: 'Soja', en: 'Soybeans', terms: /\b(soja|soy|soybeans?|soymeal|soyoil|farelo)\b/ },
  { id: 'milho', group: 'graos', pt: 'Milho', en: 'Corn', terms: /\b(milho|corn|maize)\b/ },
  { id: 'trigo', group: 'graos', pt: 'Trigo', en: 'Wheat', terms: /\b(trigo|wheat)\b/ },
  { id: 'arroz', group: 'graos', pt: 'Arroz', en: 'Rice', terms: /\b(arroz|rice)\b/ },
  { id: 'boi', group: 'pecuaria', pt: 'Boi gordo', en: 'Cattle', terms: /\b(boi|bois|arroba|bovin\w*|gado|carne bovina|cattle|beef|feeder|steers?)\b/ },
  { id: 'suinos', group: 'pecuaria', pt: 'Suínos', en: 'Hogs', terms: /\b(suinos?|suinocultura|porco|carne suina|hogs?|pork)\b/ },
  { id: 'frango', group: 'pecuaria', pt: 'Frango', en: 'Poultry', terms: /\b(frango|avicultura|ovos|poultry|chicken|broilers?|eggs)\b/ },
  { id: 'leite', group: 'pecuaria', pt: 'Leite', en: 'Dairy', terms: /\b(leite|lacteos|laticinios|milk|dairy|cheese)\b/ },
  { id: 'cafe', group: 'agricolas', pt: 'Café', en: 'Coffee', terms: /\b(cafe|coffee|arabica|robusta|conilon)\b/ },
  { id: 'acucar', group: 'agricolas', pt: 'Açúcar', en: 'Sugar', terms: /\b(acucar|sugar|cana|sugarcane|sucroenerget\w*)\b/ },
  { id: 'cacau', group: 'agricolas', pt: 'Cacau', en: 'Cocoa', terms: /\b(cacau|cocoa)\b/ },
  { id: 'algodao', group: 'agricolas', pt: 'Algodão', en: 'Cotton', terms: /\b(algodao|cotton)\b/ },
  { id: 'laranja', group: 'agricolas', pt: 'Suco de laranja', en: 'Orange juice', terms: /\b(laranja|suco de laranja|orange juice|fcoj)\b/ },
];

/**
 * Sinais de que a matéria fala de mercado (preço, oferta e demanda, bolsa,
 * resultado), e não de técnica de produção, receitas, eventos ou clima isolado.
 */
const MARKET =
  /\b(precos?|cotac\w*|alta|altas|queda|quedas|sobe|sobem|subir|cai|caem|cair|recua\w*|avanc\w*|dispar\w*|despenc\w*|recorde|maxima|minima|bolsa|b3|chicago|cbot|cme|lme|nova york|londres|futuros?|contratos?|mercados?|export\w*|import\w*|safra\w*|estoques?|oferta|demanda|usda|conab|cepea|opep|barril|barris|sacas?|arroba|oncas?|toneladas?|dolar|juros|investidor\w*|fundos?|etf|produc\w*|plantio|colheita|embarques?|tarifa\w*|valoriz\w*|desvaloriz\w*|ganhos?|perdas?|margens?|lucro|balanco|fed|prices?|priced|pricing|futures|markets?|rall(y|ies|ied)|slump\w*|gains?|loss(es)?|falls?|fell|rises?|rising|rose|climb\w*|drops?|dropped|surg\w*|tumbl\w*|jump\w*|slid\w*|sank|plung\w*|soar\w*|record|highs?|lows?|output|production|supply|supplies|demand|inventor(y|ies)|stockpiles?|exports?|imports?|tariffs?|traders?|investors?|hedge\w*|bullish|bearish|barrels?|bushels?|ounces?|tonnes?|wasde|dollar|shortage|surplus|deficit|harvest|planting|planted|crops?|outlook|forecasts?|earnings|profit|weekly)\b/;

// Matérias de serviço ou entretenimento que citam a commodity por acaso.
const NOISE = /\b(receitas? (de|com|para)|recipes?|cursos?|webinars?|podcast|sorteio|concurso|vagas? de emprego|feira de|festa d\w)\b/;
// Expressões que contêm o nome da commodity mas não falam dela.
const IDIOMS = /\b(regra de ouro|bola de ouro|medalhas? de ouro|oportunidade de ouro|padrao ouro|ouro olimpico|gold standard|gold medal\w*|silver lining|silver medal\w*|corn ?flakes|cafe da manha)\b/g;

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(IDIOMS, ' ');

/** Commodity citada primeiro no texto (menor posição), ou null. */
function firstCommodity(text: string): Commodity | null {
  let best: Commodity | null = null;
  let bestAt = Infinity;
  for (const c of COMMODITIES) {
    const at = text.search(c.terms);
    if (at > -1 && at < bestAt) {
      best = c;
      bestAt = at;
    }
  }
  return best;
}

/**
 * Classifica uma notícia. `strict`: a commodity e um termo de mercado precisam
 * estar no título (feeds gerais ou do agro, que misturam outros assuntos).
 * Sem `strict` (feeds dedicados a commodities): basta a commodity aparecer no
 * título ou no resumo. Devolve o id da commodity ou null se a notícia não serve.
 */
export function classifyCommodity(title: string, summary: string, { strict }: { strict: boolean }): string | null {
  const t = normalize(title);
  const s = normalize(summary);
  if (NOISE.test(t)) return null;
  if (strict) return MARKET.test(t) ? (firstCommodity(t)?.id ?? null) : null;
  return (firstCommodity(t) ?? firstCommodity(s))?.id ?? null;
}

/**
 * Cotações exibidas na home: contrato futuro mais próximo no Yahoo Finance
 * (cerca de 15 min de atraso). Grãos, boi, café e açúcar vêm em centavos de
 * dólar (USX) e são convertidos para dólar. `spot`: símbolo na gold-api.com,
 * usado se o Yahoo falhar (preço à vista, sem variação).
 */
export interface CommodityQuoteDef {
  id: string;
  /** Rótulo quando difere do nome da commodity (ex.: Brent). */
  pt?: string;
  en?: string;
  yahoo: string;
  spot?: string;
  unit: string;
  unitEn?: string;
  /** Casas decimais do preço em dólar. */
  decimals: number;
}

export const COMMODITY_QUOTES: CommodityQuoteDef[] = [
  { id: 'ouro', yahoo: 'GC=F', spot: 'XAU', unit: 'oz', decimals: 2 },
  { id: 'prata', yahoo: 'SI=F', spot: 'XAG', unit: 'oz', decimals: 2 },
  { id: 'cobre', yahoo: 'HG=F', spot: 'HG', unit: 'lb', decimals: 3 },
  { id: 'petroleo', pt: 'WTI', en: 'WTI', yahoo: 'CL=F', unit: 'barril', unitEn: 'bbl', decimals: 2 },
  { id: 'petroleo', pt: 'Brent', en: 'Brent', yahoo: 'BZ=F', unit: 'barril', unitEn: 'bbl', decimals: 2 },
  { id: 'gas', yahoo: 'NG=F', unit: 'MMBtu', decimals: 3 },
  { id: 'soja', yahoo: 'ZS=F', unit: 'bushel', decimals: 2 },
  { id: 'milho', yahoo: 'ZC=F', unit: 'bushel', decimals: 2 },
  { id: 'trigo', yahoo: 'ZW=F', unit: 'bushel', decimals: 2 },
  { id: 'boi', pt: 'Boi (EUA)', en: 'Live cattle', yahoo: 'LE=F', unit: 'lb', decimals: 3 },
  { id: 'cafe', yahoo: 'KC=F', unit: 'lb', decimals: 3 },
  { id: 'acucar', yahoo: 'SB=F', unit: 'lb', decimals: 4 },
];

export const commodityById =(id: string | null | undefined) => COMMODITIES.find((c) => c.id === id);
export const commodityGroup = (id: CommodityGroup) => COMMODITY_GROUPS.find((g) => g.id === id)!;
