import { fertilizerById } from '../data/fertilizers';
import { cropQualityDistribution, expectedPrice } from './quality';
import { DAYS_PER_SEASON, SEASONS, type Crop, type FertilizerId, type Professions, type Season } from './types';

export interface FarmSettings {
  farmingLevel: number;
  fertilizer: FertilizerId;
  /** Custo do fertilizante por tile (sobrescreve o padrão). */
  fertilizerCost: number;
  professions: Professions;
  /** Já tem sementes de festival guardadas (pode plantar Morango antes do dia 13). */
  stockedSeeds?: boolean;
}

/** Dia mais cedo em que dá para plantar a cultura, considerando quando a semente fica à venda. */
export const earliestPlantingDay = (crop: Crop, s: FarmSettings, day: number): number =>
  crop.availableFromDay && !s.stockedSeeds ? Math.max(day, crop.availableFromDay) : day;

/**
 * Dias até a primeira colheita. A redução é ceil(dias × velocidade), como no jogo
 * (que distribui a redução pelas fases; a aproximação bate com a wiki para as culturas da lista).
 * Fertilizante de velocidade não afeta o tempo de rebrota.
 */
export function effectiveGrowDays(crop: Crop, fertilizer: FertilizerId, agriculturist: boolean): number {
  const speed = fertilizerById(fertilizer).speed + (agriculturist ? 0.1 : 0);
  if (speed <= 0) return crop.growDays;
  const reduction = Math.ceil(crop.growDays * speed - 1e-9);
  return Math.max(1, crop.growDays - reduction);
}

/** Itens extras esperados por colheita (rolagem repetida: p/(1−p)). */
export const expectedExtraItems = (crop: Crop): number =>
  crop.extraHarvestChance > 0 ? crop.extraHarvestChance / (1 - crop.extraHarvestChance) : 0;

/** Multiplicador do Cultivador: vale para frutas, vegetais e flores. */
export const tillerMultiplier = (crop: Crop, p: Professions): number =>
  p.tiller && crop.category !== 'other' ? 1.1 : 1;

/**
 * Ouro esperado por colheita. Só o primeiro item rola qualidade;
 * os itens extras (ex.: 2º e 3º mirtilo) saem com qualidade normal.
 */
export function revenuePerHarvest(crop: Crop, s: FarmSettings): number {
  const fert = fertilizerById(s.fertilizer);
  const dist = cropQualityDistribution(s.farmingLevel, fert.qualityLevel);
  const extras = crop.harvestYield - 1 + expectedExtraItems(crop);
  const raw = expectedPrice(crop.sellPrice, dist) + extras * crop.sellPrice;
  return raw * tillerMultiplier(crop, s.professions);
}

/** Dias disponíveis a partir do dia `day` (plantando hoje), opcionalmente seguindo para as próximas estações da cultura. */
export function availableDays(crop: Crop, season: Season, day: number, continueNextSeasons: boolean): number {
  if (!crop.seasons.includes(season)) return 0;
  let days = DAYS_PER_SEASON - day;
  if (!continueNextSeasons) return days;
  for (let i = SEASONS.indexOf(season) + 1; i < SEASONS.length; i++) {
    if (!crop.seasons.includes(SEASONS[i])) break;
    days += DAYS_PER_SEASON;
  }
  return days;
}

export interface CropResult {
  crop: Crop;
  growDays: number;
  harvests: number;
  seedsBought: number;
  revenue: number;
  costs: number;
  profit: number;
  /** Dias ocupando o tile (do plantio à última colheita). */
  daysUsed: number;
  /** Lucro por dia (GPD) por tile. */
  gpd: number;
  /** Último dia da estação atual em que ainda dá tempo de plantar (null se já passou). */
  lastPlantingDay: number | null;
}

/** Simula um tile plantado no dia `day`: replantio (colheita única) ou rebrota (múltiplas colheitas). */
export function simulateCrop(
  crop: Crop,
  s: FarmSettings,
  season: Season,
  day: number,
  continueNextSeasons = false,
): CropResult {
  day = earliestPlantingDay(crop, s, day);
  const growDays = effectiveGrowDays(crop, s.fertilizer, s.professions.agriculturist);
  const avail = availableDays(crop, season, day, continueNextSeasons);
  let harvests = 0;
  let seedsBought = 0;
  let daysUsed = 0;
  if (avail >= growDays) {
    if (crop.regrowDays) {
      harvests = 1 + Math.floor((avail - growDays) / crop.regrowDays);
      seedsBought = 1;
      daysUsed = growDays + (harvests - 1) * crop.regrowDays;
    } else {
      harvests = Math.floor(avail / growDays);
      seedsBought = harvests;
      daysUsed = harvests * growDays;
    }
  }
  const revenue = harvests * revenuePerHarvest(crop, s);
  const costs = seedsBought * crop.seedPrice + (harvests > 0 ? s.fertilizerCost : 0);
  const profit = revenue - costs;
  const extra = continueNextSeasons ? avail - (DAYS_PER_SEASON - day) : 0;
  const lastDay = DAYS_PER_SEASON + extra - growDays;
  return {
    crop,
    growDays,
    harvests,
    seedsBought,
    revenue,
    costs,
    profit,
    daysUsed,
    gpd: daysUsed > 0 ? profit / daysUsed : 0,
    lastPlantingDay: crop.seasons.includes(season) && lastDay >= day ? Math.min(lastDay, DAYS_PER_SEASON) : null,
  };
}
