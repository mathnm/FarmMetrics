export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type CropCategory = 'fruit' | 'vegetable' | 'flower' | 'other';

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
export const SEASON_PT: Record<Season, string> = {
  spring: 'Primavera',
  summer: 'Verão',
  fall: 'Outono',
  winter: 'Inverno',
};
export const DAYS_PER_SEASON = 28;

export interface Crop {
  id: string;
  seedId: string;
  harvestItemId: string;
  name: string;
  namePt: string;
  seasons: Season[];
  growDays: number;
  regrowDays: number | null;
  sellPrice: number;
  seedPrice: number;
  seedSource: string;
  category: CropCategory;
  /** Itens garantidos por colheita (ex.: Mirtilo = 3). */
  harvestYield: number;
  /** Chance de cada item extra (rolada repetidamente, como no jogo). */
  extraHarvestChance: number;
  /** Primeiro dia em que a semente pode ser comprada na estação (ex.: Morango no Festival do Ovo). */
  availableFromDay?: number;
}

export type FertilizerId =
  | 'none'
  | 'basic'
  | 'quality'
  | 'deluxe'
  | 'speed'
  | 'deluxe_speed'
  | 'hyper_speed';

export interface Fertilizer {
  id: FertilizerId;
  namePt: string;
  /** Nível de qualidade (0–3) usado na fórmula de qualidade da colheita. */
  qualityLevel: number;
  /** Redução do tempo de crescimento (0.1 = 10%). */
  speed: number;
  defaultCost: number;
  note?: string;
}

export interface Professions {
  tiller: boolean; // Cultivador: +10% no preço de plantações
  agriculturist: boolean; // Agricultor: +10% velocidade de crescimento
  artisan: boolean; // Artesão: +40% em produtos artesanais
  rancher: boolean; // Pecuarista: +20% em produtos animais
  coopmaster: boolean; // Criador de aves: qualidade melhor no galinheiro
  shepherd: boolean; // Pastor: qualidade melhor no celeiro, ovelhas mais rápidas
  gatherer: boolean; // Coletor: 20% de chance de coleta dupla (trufas)
  botanist: boolean; // Botânico: forrageáveis (trufas) sempre irídio
  fisher: boolean; // Pescador: +25% em peixes
  angler: boolean; // Pescador Profissional: +50% em peixes
}

export const NO_PROFESSIONS: Professions = {
  tiller: false,
  agriculturist: false,
  artisan: false,
  rancher: false,
  coopmaster: false,
  shepherd: false,
  gatherer: false,
  botanist: false,
  fisher: false,
  angler: false,
};
