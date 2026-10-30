import { ANIMALS, HAY_PRICE, type Animal } from '../data/animals';
import { animalQualityDistribution, expectedPrice } from './quality';
import type { Professions } from './types';

export type CareLevel = 'excellent' | 'good' | 'poor';
export type PettingMode = 'manual' | 'auto_petter' | 'none';

/** Felicidade aproximada por nível de cuidado (0–255). */
export const CARE_HAPPINESS: Record<CareLevel, number> = { excellent: 255, good: 200, poor: 120 };

export interface LivestockSettings {
  count: number;
  /** Amizade 0–1000 (5 corações = 1000). */
  friendship: number;
  care: CareLevel;
  petting: PettingMode;
  /** Fração dos dias em que os animais comem feno (inverno, chuva, sem pasto). */
  hayFraction: number;
  /** Fração dos dias em que o porco consegue sair (sem chuva, fora do inverno). */
  pigOutdoorFraction: number;
  autoGrabber: boolean;
  professions: Professions;
}

/** Amizade efetiva: sem carinho a amizade cai todo dia; o Auto-Acariciador mantém o carinho diário. */
export function effectiveFriendship(s: LivestockSettings): number {
  if (s.petting === 'none') return Math.min(s.friendship, 300);
  return s.friendship;
}

/** Chance aproximada de produto grande/raro: amizade ≥ 200, chance = amizade/DeluxeProduceCareDivisor (1.6). */
export function deluxeChance(friendship: number, divisor = 1200): number {
  if (friendship < 200) return 0;
  return Math.min(1, friendship / divisor);
}

export interface LivestockResult {
  animal: Animal;
  /** Produtos por animal por dia (média). */
  itemsPerDay: number;
  rawPerDay: number;
  artisanPerDay: number;
  feedPerDay: number;
  /** Lucro líquido por animal por dia, vendendo o melhor entre cru e artesanal. */
  netPerDay: number;
  bestIsArtisan: boolean;
  /** Dias para o animal se pagar. */
  paybackDays: number;
  /** Máquinas necessárias para processar a produção de todos os animais (carregando 1×/dia). */
  machinesNeeded: number;
  notes: string[];
}

export function simulateAnimal(animal: Animal, s: LivestockSettings): LivestockResult {
  const p = s.professions;
  const friendship = effectiveFriendship(s);
  const happiness = CARE_HAPPINESS[s.care];
  const notes: string[] = [];

  let produceDays = animal.produceDays;
  if (animal.produceDaysShepherd && p.shepherd) produceDays = animal.produceDaysShepherd;
  let itemsPerDay = 1 / produceDays;
  if (animal.forager) {
    itemsPerDay *= s.pigOutdoorFraction * (p.gatherer ? 1.2 : 1);
    notes.push('Trufas só aparecem com o porco do lado de fora; o Auto-Pegador não coleta trufas.');
  }

  const dChance = animal.deluxe ? deluxeChance(friendship, animal.deluxeDivisor) : 0;
  const quality = animalQualityDistribution(friendship, happiness, p[animal.qualityProfession]);
  const rancher = !animal.forager && p.rancher ? 1.2 : 1;

  // Venda crua: produto normal ou grande, com qualidade aleatória.
  let rawItem = expectedPrice(animal.product.price, quality);
  if (animal.forager && p.botanist) rawItem = animal.product.price * 2;
  if (animal.deluxe) rawItem = (1 - dChance) * rawItem + dChance * expectedPrice(animal.deluxe.price, quality);
  const rawPerDay = itemsPerDay * rawItem * rancher;

  // Artesanal: a máquina ignora a qualidade; produto grande vira artesanato de qualidade ouro.
  const art = (price: number) => (p.artisan ? Math.floor(price * 1.4) : price);
  let artisanItem = art(animal.artisan.price);
  if (animal.deluxe) {
    const deluxeValue = animal.deluxeIsProcessable
      ? art(animal.artisan.deluxePrice ?? animal.artisan.price)
      : animal.deluxe.price * rancher; // pena/pé de coelho: vende cru
    artisanItem = (1 - dChance) * artisanItem + dChance * deluxeValue;
  }
  const artisanPerDay = itemsPerDay * artisanItem;

  const feedPerDay = s.hayFraction * HAY_PRICE;
  const bestIsArtisan = artisanPerDay > rawPerDay;
  const netPerDay = Math.max(rawPerDay, artisanPerDay) - feedPerDay;

  const machineItemsPerDay = itemsPerDay * (animal.deluxeIsProcessable || !animal.deluxe ? 1 : 1 - dChance);
  const machinesNeeded = Math.ceil(s.count * machineItemsPerDay - 1e-9);

  if (s.autoGrabber && animal.building === 'barn' && !animal.forager)
    notes.push('Com Auto-Pegador você não ordenha/tosquia, perdendo o bônus de amizade dessa ação.');
  if (s.petting === 'none') notes.push('Sem carinho a amizade cai: limitamos a amizade a ~300 (1,5 coração).');
  if (s.petting === 'auto_petter') notes.push('Auto-Acariciador mantém o carinho diário (amizade e felicidade).');

  return {
    animal,
    itemsPerDay,
    rawPerDay,
    artisanPerDay,
    feedPerDay,
    netPerDay,
    bestIsArtisan,
    paybackDays: netPerDay > 0 ? animal.cost / netPerDay : Infinity,
    machinesNeeded,
    notes,
  };
}

export const simulateAllAnimals = (s: LivestockSettings): LivestockResult[] =>
  ANIMALS.map((a) => simulateAnimal(a, s)).sort((a, b) => b.netPerDay - a.netPerDay);
