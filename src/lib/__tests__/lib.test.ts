import { describe, expect, it } from 'vitest';
import { CROPS } from '../../data/crops';
import { ANIMALS } from '../../data/animals';
import { effectiveGrowDays, simulateCrop, type FarmSettings } from '../crops';
import { compareProcessing } from '../processing';
import { bestRotation, viableCrops } from '../planner';
import { cropQualityDistribution } from '../quality';
import { simulateAnimal, type LivestockSettings } from '../livestock';
import { NO_PROFESSIONS } from '../types';

const crop = (id: string) => CROPS.find((c) => c.id === id)!;
const base: FarmSettings = { farmingLevel: 0, fertilizer: 'none', fertilizerCost: 0, professions: NO_PROFESSIONS };

describe('qualidade das colheitas', () => {
  it('nível 0 sem fertilizante: 1% de ouro', () => {
    const d = cropQualityDistribution(0, 0);
    expect(d.gold).toBeCloseTo(0.01);
    expect(d.iridium).toBe(0);
    expect(d.normal + d.silver + d.gold + d.iridium).toBeCloseTo(1);
  });
  it('fertilizante deluxe no nível 10: sem qualidade normal e com irídio', () => {
    const d = cropQualityDistribution(10, 3);
    expect(d.normal).toBeCloseTo(0);
    expect(d.iridium).toBeCloseTo(0.405);
  });
});

describe('crescimento', () => {
  it('aplica Speed-Gro e Agricultor como no jogo', () => {
    expect(effectiveGrowDays(crop('starfruit'), 'speed', false)).toBe(11);
    expect(effectiveGrowDays(crop('starfruit'), 'deluxe_speed', false)).toBe(9);
    expect(effectiveGrowDays(crop('yam'), 'speed', false)).toBe(9);
    expect(effectiveGrowDays(crop('parsnip'), 'hyper_speed', true)).toBe(2);
  });
});

describe('lucro por estação', () => {
  it('Chirívia replantada a partir de Primavera 1 rende 6 colheitas', () => {
    expect(simulateCrop(crop('parsnip'), base, 'spring', 1).harvests).toBe(6);
  });
  it('Mirtilo plantado em Verão 1 rende 4 colheitas com 1 semente', () => {
    const r = simulateCrop(crop('blueberry'), base, 'summer', 1);
    expect(r.harvests).toBe(4);
    expect(r.seedsBought).toBe(1);
  });
  it('Morango do Festival do Ovo (Primavera 13) rende 2 colheitas', () => {
    expect(simulateCrop(crop('strawberry'), base, 'spring', 13).harvests).toBe(2);
  });
  it('Milho continua no Outono quando permitido', () => {
    const only = simulateCrop(crop('corn'), base, 'summer', 1, false).harvests;
    const both = simulateCrop(crop('corn'), base, 'summer', 1, true).harvests;
    expect(both).toBeGreaterThan(only);
  });
  it('Cultivador aumenta a receita em 10%', () => {
    const r1 = simulateCrop(crop('melon'), base, 'summer', 1);
    const r2 = simulateCrop(crop('melon'), { ...base, professions: { ...NO_PROFESSIONS, tiller: true } }, 'summer', 1);
    expect(r2.revenue / r1.revenue).toBeCloseTo(1.1);
  });
});

describe('Barril vs. Jarra', () => {
  it('Carambola: Barril rende mais por fruta; Jarra rende mais por dia de máquina', () => {
    const c = compareProcessing(crop('starfruit'), { ...NO_PROFESSIONS, artisan: true });
    expect(c.keg!.price).toBe(3150);
    expect(c.jar!.price).toBe(2170);
    expect(c.bestPerItem).toBe('keg');
    expect(c.bestForMachines).toBe('jar');
  });
  it('flores não entram em máquinas', () => {
    const c = compareProcessing(crop('poppy'), NO_PROFESSIONS);
    expect(c.keg).toBeNull();
    expect(c.bestPerItem).toBe('raw');
  });
});

describe('planejador', () => {
  it('em Primavera 27 nenhuma cultura dá tempo', () => {
    expect(viableCrops(CROPS, base, 'spring', 27, 10, false)).toHaveLength(0);
  });
  it('em Primavera 12 a rotação lucra e respeita o dia 28', () => {
    const plan = bestRotation(CROPS, base, 'spring', 12);
    expect(plan.profitPerTile).toBeGreaterThan(0);
    for (const s of plan.steps) for (const h of s.harvestDays) expect(h).toBeLessThanOrEqual(28);
    expect(viableCrops(CROPS, base, 'spring', 17, 10, false).some((v) => v.crop.id === 'cauliflower')).toBe(false);
  });
});

describe('pecuária', () => {
  const s: LivestockSettings = {
    count: 4,
    friendship: 1000,
    care: 'excellent',
    petting: 'manual',
    hayFraction: 0.25,
    pigOutdoorFraction: 0.6,
    autoGrabber: false,
    professions: { ...NO_PROFESSIONS, artisan: true },
  };
  it('Queijo vale mais que leite cru com Artesão', () => {
    const r = simulateAnimal(ANIMALS.find((a) => a.id === 'cow')!, s);
    expect(r.bestIsArtisan).toBe(true);
    expect(r.paybackDays).toBeLessThan(30);
  });
  it('porco produz menos com menos dias ao ar livre', () => {
    const pig = ANIMALS.find((a) => a.id === 'pig')!;
    expect(simulateAnimal(pig, { ...s, pigOutdoorFraction: 0.3 }).netPerDay).toBeLessThan(
      simulateAnimal(pig, s).netPerDay,
    );
  });
});

describe('sementes de festival', () => {
  it('Morango só pode ser plantado a partir de Primavera 13 sem sementes guardadas', () => {
    const plan = bestRotation(CROPS, base, 'spring', 1);
    for (const s of plan.steps) if (s.crop.id === 'strawberry') expect(s.plantDay).toBeGreaterThanOrEqual(13);
    expect(simulateCrop(crop('strawberry'), base, 'spring', 1).harvests).toBe(2);
    expect(simulateCrop(crop('strawberry'), { ...base, stockedSeeds: true }, 'spring', 1).harvests).toBe(5);
  });
});
