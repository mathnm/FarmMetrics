import type { Fertilizer, FertilizerId } from '../lib/types';

// Fonte: Stardew Valley Wiki (1.6) — páginas "Fertilizer" e "Crops".
// Custos padrão = preço no Pierre; fertilizantes sem loja ficam em 0 (editável no app).
export const FERTILIZERS: Fertilizer[] = [
  { id: 'none', namePt: 'Nenhum', qualityLevel: 0, speed: 0, defaultCost: 0 },
  { id: 'basic', namePt: 'Fertilizante Básico', qualityLevel: 1, speed: 0, defaultCost: 100 },
  { id: 'quality', namePt: 'Fertilizante de Qualidade', qualityLevel: 2, speed: 0, defaultCost: 150 },
  {
    id: 'deluxe',
    namePt: 'Fertilizante Deluxe',
    qualityLevel: 3,
    speed: 0,
    defaultCost: 0,
    note: 'Criado (Barra de Irídio + Seiva). Garante no mínimo qualidade Prata e permite Irídio.',
  },
  { id: 'speed', namePt: 'Acelerador (Speed-Gro)', qualityLevel: 0, speed: 0.1, defaultCost: 100 },
  { id: 'deluxe_speed', namePt: 'Acelerador Deluxe', qualityLevel: 0, speed: 0.25, defaultCost: 150 },
  {
    id: 'hyper_speed',
    namePt: 'Hiper Acelerador',
    qualityLevel: 0,
    speed: 0.33,
    defaultCost: 0,
    note: 'Comprado com Gemas Qi (sem custo em ouro).',
  },
];

export const fertilizerById = (id: FertilizerId): Fertilizer =>
  FERTILIZERS.find((f) => f.id === id) ?? FERTILIZERS[0];
