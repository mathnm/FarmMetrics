// Fonte: Stardew Valley 1.6 — Data/FarmAnimals.json, Data/Objects.json e Data/Machines.json
// (valores conferidos na Stardew Valley Wiki: páginas "Animals", "Mayonnaise", "Cheese", "Cloth", "Truffle Oil").

export type Building = 'coop' | 'barn';

export interface AnimalProduct {
  namePt: string;
  price: number;
}

export interface ArtisanRecipe {
  namePt: string;
  machinePt: string;
  price: number;
  /** Preço quando feito a partir do produto grande (no 1.6 sai com qualidade Ouro). */
  deluxePrice?: number;
  minutes: number;
}

export interface Animal {
  id: string;
  namePt: string;
  building: Building;
  cost: number;
  /** Dias entre produções. */
  produceDays: number;
  /** Dias entre produções com Pastor (só ovelha). */
  produceDaysShepherd?: number;
  product: AnimalProduct;
  /** Produto "grande"/raro que aparece com amizade alta. */
  deluxe?: AnimalProduct;
  /** DeluxeProduceCareDivisor (1.6): quanto maior, mais raro o produto grande. */
  deluxeDivisor?: number;
  /** O produto grande vira artesanato de qualidade ouro? (ovo grande / leite grande) */
  deluxeIsProcessable: boolean;
  artisan: ArtisanRecipe;
  /** Porco: só produz ao sair (sem chuva, fora do inverno). Trufa é forrageável. */
  forager?: boolean;
  /** Profissão que melhora a qualidade (Criador de aves / Pastor). */
  qualityProfession: 'coopmaster' | 'shepherd';
}

export const ANIMALS: Animal[] = [
  {
    id: 'chicken',
    namePt: 'Galinha',
    building: 'coop',
    cost: 800,
    produceDays: 1,
    product: { namePt: 'Ovo', price: 50 },
    deluxe: { namePt: 'Ovo Grande', price: 95 },
    deluxeDivisor: 1200,
    deluxeIsProcessable: true,
    artisan: { namePt: 'Maionese', machinePt: 'Máquina de Maionese', price: 190, deluxePrice: 285, minutes: 180 },
    qualityProfession: 'coopmaster',
  },
  {
    id: 'duck',
    namePt: 'Pato',
    building: 'coop',
    cost: 1200,
    produceDays: 2,
    product: { namePt: 'Ovo de Pato', price: 95 },
    deluxe: { namePt: 'Pena de Pato', price: 250 },
    deluxeDivisor: 4750,
    deluxeIsProcessable: false,
    artisan: { namePt: 'Maionese de Pato', machinePt: 'Máquina de Maionese', price: 375, minutes: 180 },
    qualityProfession: 'coopmaster',
  },
  {
    id: 'rabbit',
    namePt: 'Coelho',
    building: 'coop',
    cost: 8000,
    produceDays: 4,
    product: { namePt: 'Lã', price: 340 },
    deluxe: { namePt: 'Pé de Coelho', price: 565 },
    deluxeDivisor: 5000,
    deluxeIsProcessable: false,
    artisan: { namePt: 'Tecido', machinePt: 'Tear', price: 470, minutes: 240 },
    qualityProfession: 'coopmaster',
  },
  {
    id: 'cow',
    namePt: 'Vaca',
    building: 'barn',
    cost: 1500,
    produceDays: 1,
    product: { namePt: 'Leite', price: 125 },
    deluxe: { namePt: 'Leite Grande', price: 190 },
    deluxeDivisor: 1200,
    deluxeIsProcessable: true,
    artisan: { namePt: 'Queijo', machinePt: 'Prensa de Queijo', price: 230, deluxePrice: 345, minutes: 200 },
    qualityProfession: 'shepherd',
  },
  {
    id: 'goat',
    namePt: 'Cabra',
    building: 'barn',
    cost: 4000,
    produceDays: 2,
    product: { namePt: 'Leite de Cabra', price: 225 },
    deluxe: { namePt: 'Leite de Cabra Grande', price: 345 },
    deluxeDivisor: 1200,
    deluxeIsProcessable: true,
    artisan: { namePt: 'Queijo de Cabra', machinePt: 'Prensa de Queijo', price: 400, deluxePrice: 600, minutes: 200 },
    qualityProfession: 'shepherd',
  },
  {
    id: 'sheep',
    namePt: 'Ovelha',
    building: 'barn',
    cost: 8000,
    produceDays: 3,
    produceDaysShepherd: 2,
    product: { namePt: 'Lã', price: 340 },
    deluxeIsProcessable: false,
    artisan: { namePt: 'Tecido', machinePt: 'Tear', price: 470, minutes: 240 },
    qualityProfession: 'shepherd',
  },
  {
    id: 'pig',
    namePt: 'Porco',
    building: 'barn',
    cost: 16000,
    produceDays: 1,
    product: { namePt: 'Trufa', price: 625 },
    deluxeIsProcessable: false,
    artisan: { namePt: 'Óleo de Trufa', machinePt: 'Extrator de Óleo', price: 1065, minutes: 360 },
    forager: true,
    qualityProfession: 'shepherd',
  },
];

/** Feno no Marnie (1.6). */
export const HAY_PRICE = 50;
