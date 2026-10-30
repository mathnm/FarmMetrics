import { earliestPlantingDay, effectiveGrowDays, revenuePerHarvest, simulateCrop, type FarmSettings } from './crops';
import { DAYS_PER_SEASON, type Crop, type Season } from './types';

export interface PlantingStep {
  crop: Crop;
  plantDay: number;
  /** Dias de colheita dentro da estação. */
  harvestDays: number[];
  profit: number;
}

export interface RotationPlan {
  steps: PlantingStep[];
  profitPerTile: number;
  fertilizerCost: number;
}

/**
 * Programação dinâmica sobre os dias restantes da estação para UM tile:
 * em cada dia, ou deixa vazio, ou planta uma cultura de colheita única (e replaneja no dia da colheita),
 * ou planta uma cultura de rebrota que ocupa o tile até o fim da estação.
 * O fertilizante é aplicado uma vez no tile e permanece no solo.
 */
export function bestRotation(crops: Crop[], s: FarmSettings, season: Season, today: number): RotationPlan {
  const available = crops.filter((c) => c.seasons.includes(season));
  const best: number[] = new Array(DAYS_PER_SEASON + 2).fill(0);
  const choice: (PlantingStep | null)[] = new Array(DAYS_PER_SEASON + 2).fill(null);

  for (let d = DAYS_PER_SEASON; d >= today; d--) {
    best[d] = best[d + 1];
    choice[d] = null;
    for (const crop of available) {
      const g = effectiveGrowDays(crop, s.fertilizer, s.professions.agriculturist);
      if (d + g > DAYS_PER_SEASON || earliestPlantingDay(crop, s, d) > d) continue;
      const perHarvest = revenuePerHarvest(crop, s);
      if (crop.regrowDays) {
        const harvestDays: number[] = [];
        for (let h = d + g; h <= DAYS_PER_SEASON; h += crop.regrowDays) harvestDays.push(h);
        const profit = harvestDays.length * perHarvest - crop.seedPrice;
        if (profit > best[d]) {
          best[d] = profit;
          choice[d] = { crop, plantDay: d, harvestDays, profit };
        }
      } else {
        const profit = perHarvest - crop.seedPrice;
        const total = profit + best[d + g];
        if (total > best[d]) {
          best[d] = total;
          choice[d] = { crop, plantDay: d, harvestDays: [d + g], profit };
        }
      }
    }
  }

  const steps: PlantingStep[] = [];
  let d = today;
  while (d <= DAYS_PER_SEASON) {
    const step = choice[d];
    if (!step) {
      d++;
      continue;
    }
    steps.push(step);
    if (step.crop.regrowDays) break;
    d = step.harvestDays[0];
  }
  const fertilizerCost = steps.length > 0 ? s.fertilizerCost : 0;
  return { steps, profitPerTile: best[today] - fertilizerCost, fertilizerCost };
}

export interface ViableCrop {
  crop: Crop;
  growDays: number;
  firstPlantingDay: number;
  lastPlantingDay: number;
  harvests: number;
  profitPerTile: number;
  gpd: number;
  seedCostTotal: number;
}

/** Culturas que ainda dão tempo de colher, ordenadas pelo lucro restante. */
export function viableCrops(
  crops: Crop[],
  s: FarmSettings,
  season: Season,
  today: number,
  tiles: number,
  continueNextSeasons: boolean,
): ViableCrop[] {
  return crops
    .map((crop) => simulateCrop(crop, s, season, today, continueNextSeasons))
    .filter((r) => r.harvests > 0 && r.lastPlantingDay !== null)
    .map((r) => ({
      crop: r.crop,
      growDays: r.growDays,
      firstPlantingDay: earliestPlantingDay(r.crop, s, today),
      lastPlantingDay: r.lastPlantingDay as number,
      harvests: r.harvests,
      profitPerTile: r.profit,
      gpd: r.gpd,
      seedCostTotal: r.crop.seedPrice * tiles,
    }))
    .sort((a, b) => b.profitPerTile - a.profitPerTile);
}
