import type { Crop, Professions } from './types';

/** Minutos de jogo por dia usados para converter tempo de máquina em dias. */
export const MINUTES_PER_DAY = 1440;

export type MachineId = 'keg' | 'jar';

export interface ArtisanProduct {
  machine: MachineId;
  namePt: string;
  /** Preço base (antes do Artesão). */
  basePrice: number;
  minutes: number;
}

/**
 * Regras do 1.6 (Data/Machines.json, conferidas na wiki):
 *  Barril: Vinho = 3× fruta (10.000 min) · Suco = 2,25× vegetal (6.000 min)
 *          Trigo → Cerveja 200g (1.750 min) · Lúpulo → Cerveja Clara 300g (2.250 min)
 *  Jarra:  Geleia = 2× fruta + 50 · Picles = 2× vegetal + 50 (4.000 min)
 */
export function kegProduct(crop: Crop): ArtisanProduct | null {
  if (crop.id === 'wheat') return { machine: 'keg', namePt: 'Cerveja', basePrice: 200, minutes: 1750 };
  if (crop.id === 'hops') return { machine: 'keg', namePt: 'Cerveja Clara', basePrice: 300, minutes: 2250 };
  if (crop.category === 'fruit')
    return { machine: 'keg', namePt: `Vinho de ${crop.namePt}`, basePrice: crop.sellPrice * 3, minutes: 10000 };
  if (crop.category === 'vegetable')
    return {
      machine: 'keg',
      namePt: `Suco de ${crop.namePt}`,
      basePrice: Math.floor(crop.sellPrice * 2.25),
      minutes: 6000,
    };
  return null;
}

export function jarProduct(crop: Crop): ArtisanProduct | null {
  if (crop.category === 'fruit')
    return { machine: 'jar', namePt: `Geleia de ${crop.namePt}`, basePrice: crop.sellPrice * 2 + 50, minutes: 4000 };
  if (crop.category === 'vegetable')
    return { machine: 'jar', namePt: `Picles de ${crop.namePt}`, basePrice: crop.sellPrice * 2 + 50, minutes: 4000 };
  return null;
}

export const artisanPrice = (base: number, p: Professions): number => (p.artisan ? Math.floor(base * 1.4) : base);

export interface ProcessingOption {
  product: ArtisanProduct;
  price: number;
  days: number;
  /** Ouro a mais que vender o item cru. */
  valueAdded: number;
  /** Ouro extra por dia de máquina ocupada. */
  goldPerMachineDay: number;
}

export interface ProcessingComparison {
  crop: Crop;
  rawPrice: number;
  keg: ProcessingOption | null;
  jar: ProcessingOption | null;
  /** Melhor se o gargalo forem as máquinas (maximiza ouro/dia de máquina). */
  bestForMachines: MachineId | 'raw';
  /** Melhor se o gargalo forem as frutas/vegetais (maximiza ouro por item). */
  bestPerItem: MachineId | 'raw';
}

function option(product: ArtisanProduct | null, rawPrice: number, p: Professions): ProcessingOption | null {
  if (!product) return null;
  const price = artisanPrice(product.basePrice, p);
  const days = product.minutes / MINUTES_PER_DAY;
  const valueAdded = price - rawPrice;
  return { product, price, days, valueAdded, goldPerMachineDay: valueAdded / days };
}

export function compareProcessing(crop: Crop, p: Professions): ProcessingComparison {
  // Máquinas ignoram a qualidade da entrada, então comparamos com o item cru de qualidade normal.
  const rawPrice = Math.floor(crop.sellPrice * (p.tiller ? 1.1 : 1));
  const keg = option(kegProduct(crop), rawPrice, p);
  const jar = option(jarProduct(crop), rawPrice, p);
  const pick = (score: (o: ProcessingOption) => number): MachineId | 'raw' => {
    let best: MachineId | 'raw' = 'raw';
    let bestScore = 0;
    for (const o of [keg, jar]) {
      if (o && o.valueAdded > 0 && score(o) > bestScore) {
        best = o.product.machine;
        bestScore = score(o);
      }
    }
    return best;
  };
  return {
    crop,
    rawPrice,
    keg,
    jar,
    bestForMachines: pick((o) => o.goldPerMachineDay),
    bestPerItem: pick((o) => o.valueAdded),
  };
}
