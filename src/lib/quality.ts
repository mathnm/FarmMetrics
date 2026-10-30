/** Qualidades do jogo: 0 normal, 1 prata, 2 ouro, 4 irídio. */
export type Quality = 0 | 1 | 2 | 4;
export const QUALITY_MULTIPLIER: Record<Quality, number> = { 0: 1, 1: 1.25, 2: 1.5, 4: 2 };
export const QUALITY_PT: Record<Quality, string> = { 0: 'Normal', 1: 'Prata', 2: 'Ouro', 4: 'Irídio' };

export interface QualityDistribution {
  normal: number;
  silver: number;
  gold: number;
  iridium: number;
}

export const priceWithQuality = (base: number, q: Quality): number =>
  Math.floor(base * QUALITY_MULTIPLIER[q]);

/** Preço médio esperado de um item dada a distribuição de qualidade. */
export function expectedPrice(base: number, d: QualityDistribution): number {
  return (
    d.normal * priceWithQuality(base, 0) +
    d.silver * priceWithQuality(base, 1) +
    d.gold * priceWithQuality(base, 2) +
    d.iridium * priceWithQuality(base, 4)
  );
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Distribuição de qualidade de colheita (Crop.harvest no 1.6):
 *   ouro   = 0.2·(nível/10) + 0.2·fert·((nível+2)/12) + 0.01
 *   prata  = min(0.75, 2·ouro)
 *   irídio = ouro/2 (só com Fertilizante Deluxe)
 * Com Fertilizante Deluxe, a qualidade mínima é Prata.
 */
export function cropQualityDistribution(farmingLevel: number, fertilizerLevel: number): QualityDistribution {
  const gold = clamp01(0.2 * (farmingLevel / 10) + 0.2 * fertilizerLevel * ((farmingLevel + 2) / 12) + 0.01);
  const silverChance = Math.min(0.75, gold * 2);
  const iridium = fertilizerLevel >= 3 ? gold / 2 : 0;
  const goldP = (1 - iridium) * gold;
  const rest = 1 - iridium - goldP;
  const silver = rest * (fertilizerLevel >= 3 ? 1 : silverChance);
  return { iridium, gold: goldP, silver, normal: rest - silver };
}

/**
 * Distribuição de qualidade de produtos animais (FarmAnimal.dayUpdate):
 *   chance = amizade/1000 − (1 − felicidade/225) [+0.33 com Criador de aves/Pastor]
 *   irídio se chance ≥ 0.95 e rolagem < chance/2; ouro se rolagem < chance/2; prata se rolagem < chance.
 */
export function animalQualityDistribution(
  friendship: number,
  happiness: number,
  professionBonus: boolean,
): QualityDistribution {
  let chance = friendship / 1000 - (1 - happiness / 225);
  if (professionBonus) chance += 0.33;
  chance = Math.max(0, chance);
  const half = clamp01(chance / 2);
  const iridium = chance >= 0.95 ? half : 0;
  const goldP = (1 - iridium) * half;
  const rest = 1 - iridium - goldP;
  const silver = rest * clamp01(chance);
  return { iridium, gold: goldP, silver, normal: rest - silver };
}
