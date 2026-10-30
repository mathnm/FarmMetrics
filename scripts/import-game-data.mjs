#!/usr/bin/env node
// Atualiza src/data/crops.json a partir dos arquivos do seu jogo (Stardew Valley 1.6).
// Os arquivos em Content/Data vêm empacotados (.xnb): desempacote antes com o StardewXnbHack
// (https://github.com/Pathoschild/StardewXnbHack) e passe a pasta "Content (unpacked)/Data".
//
// Uso: npm run import-data -- "/caminho/Content (unpacked)/Data"
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = process.argv[2];
if (!dataDir) {
  console.error('Informe a pasta Data desempacotada. Ex.: npm run import-data -- "./Content (unpacked)/Data"');
  process.exit(1);
}

const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'crops.json');
const read = (file) => JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
const gameCrops = read('Crops.json'); // chave = ID da semente
const objects = read('Objects.json'); // chave = ID do item
const current = JSON.parse(readFileSync(target, 'utf8'));

let updated = 0;
for (const crop of current.crops) {
  const data = gameCrops[crop.seedId];
  if (!data) {
    console.warn(`! ${crop.name}: semente ${crop.seedId} não encontrada em Crops.json`);
    continue;
  }
  const harvest = objects[data.HarvestItemId];
  crop.harvestItemId = data.HarvestItemId;
  crop.seasons = data.Seasons.map((s) => s.toLowerCase());
  crop.growDays = data.DaysInPhase.reduce((a, b) => a + b, 0);
  crop.regrowDays = data.RegrowDays > 0 ? data.RegrowDays : null;
  crop.harvestYield = Math.max(1, data.HarvestMinStack ?? 1);
  crop.extraHarvestChance = data.ExtraHarvestChance ?? 0;
  if (harvest) crop.sellPrice = harvest.Price;
  // O preço de compra da semente depende da loja (Data/Shops.json); mantemos o valor curado.
  updated++;
}

const known = new Set(current.crops.map((c) => c.seedId));
const missing = Object.keys(gameCrops).filter((id) => !known.has(id));
current._source = `Importado de ${dataDir} (Crops.json + Objects.json) em ${new Date().toISOString().slice(0, 10)}.`;
writeFileSync(target, JSON.stringify(current, null, 2) + '\n');
console.log(`${updated} culturas atualizadas em src/data/crops.json.`);
if (missing.length)
  console.log(`Culturas no jogo que não estão no app (sem preço de semente conhecido): ${missing.join(', ')}`);
