import { useMemo, useState } from 'react';
import { CROPS } from '../data/crops';
import type { FarmSettings } from '../lib/crops';
import { gold, num1 } from '../lib/format';
import { bestRotation, viableCrops } from '../lib/planner';
import { SEASON_PT, type Season } from '../lib/types';
import { CropName } from './CropName';
import { SeasonDayPicker } from './SeasonDayPicker';
import { clampInt } from './SettingsPanel';

export function SeasonPlanner({ settings }: { settings: FarmSettings }) {
  const [season, setSeason] = useState<Season>('spring');
  const [day, setDay] = useState(12);
  const [tiles, setTiles] = useState(50);
  const [continueNext, setContinueNext] = useState(false);

  const viable = useMemo(
    () => viableCrops(CROPS, settings, season, day, tiles, continueNext),
    [settings, season, day, tiles, continueNext],
  );
  const plan = useMemo(() => bestRotation(CROPS, settings, season, day), [settings, season, day]);
  const upfront = plan.steps.length ? (plan.steps[0].crop.seedPrice + plan.fertilizerCost) * tiles : 0;

  return (
    <section>
      <h2>Planejador de estação</h2>
      <p className="lead">
        Informe o dia atual e o tamanho da horta. Mostramos o que ainda dá tempo de colher antes do dia 28 (quando as
        plantações fora de estação morrem) e a rotação que maximiza o ouro restante.
      </p>
      <div className="settings-row">
        <SeasonDayPicker season={season} day={day} onChange={(s, d) => (setSeason(s), setDay(d))} />
        <label className="field">
          <span>Tamanho da horta (tiles)</span>
          <input type="number" min={1} value={tiles} onChange={(e) => setTiles(clampInt(e.target.value, 1, 100000))} />
        </label>
        <label className="check inline">
          <input type="checkbox" checked={continueNext} onChange={(e) => setContinueNext(e.target.checked)} />
          <span>Contar a próxima estação para culturas de várias estações</span>
        </label>
      </div>

      {season === 'winter' ? (
        <p className="empty">No inverno nada cresce ao ar livre. Use a estufa ou planeje a primavera.</p>
      ) : (
        <>
          <div className="card">
            <h3>
              Rotação ideal a partir de {SEASON_PT[season]} {day}
            </h3>
            {plan.steps.length === 0 ? (
              <p className="empty">Não há mais nada lucrativo para plantar nesta estação.</p>
            ) : (
              <>
                <ol className="timeline">
                  {plan.steps.map((s, i) => (
                    <li key={i}>
                      <strong>Dia {s.plantDay}:</strong> plantar <CropName crop={s.crop} /> →{' '}
                      {s.harvestDays.length === 1
                        ? `colher no dia ${s.harvestDays[0]}`
                        : `colher nos dias ${s.harvestDays.join(', ')}`}{' '}
                      <small>({gold(s.profit)} por tile)</small>
                    </li>
                  ))}
                </ol>
                <div className="stats">
                  <Stat label="Lucro por tile" value={gold(plan.profitPerTile)} />
                  <Stat label={`Lucro total (${tiles} tiles)`} value={gold(plan.profitPerTile * tiles)} />
                  <Stat label="Investimento inicial" value={gold(upfront)} />
                </div>
              </>
            )}
          </div>

          <h3>Sementes que ainda dão tempo</h3>
          {viable.length === 0 ? (
            <p className="empty">Nenhuma semente consegue amadurecer até o fim da estação.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th className="num">Crescimento</th>
                    <th className="num">Plantar entre os dias</th>
                    <th className="num">Colheitas</th>
                    <th className="num">Lucro/tile</th>
                    <th className="num">Lucro total</th>
                    <th className="num">GPD</th>
                    <th className="num">Sementes ({tiles})</th>
                    <th>Onde comprar</th>
                  </tr>
                </thead>
                <tbody>
                  {viable.map((v) => (
                    <tr key={v.crop.id} className={v.profitPerTile < 0 ? 'muted' : undefined}>
                      <td>
                        <CropName crop={v.crop} />
                      </td>
                      <td className="num">{v.growDays}d</td>
                      <td className="num">
                        {v.firstPlantingDay === v.lastPlantingDay ? v.firstPlantingDay : `${v.firstPlantingDay}–${v.lastPlantingDay}`}
                      </td>
                      <td className="num">{v.harvests}</td>
                      <td className={`num ${v.profitPerTile < 0 ? 'neg' : ''}`}>{gold(v.profitPerTile)}</td>
                      <td className="num strong">{gold(v.profitPerTile * tiles)}</td>
                      <td className="num">{num1(v.gpd)}</td>
                      <td className="num">{gold(v.seedCostTotal)}</td>
                      <td>{v.crop.seedSource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="stat">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);
