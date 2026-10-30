import { useMemo, useState } from 'react';
import { CROPS } from '../data/crops';
import { simulateCrop, type FarmSettings } from '../lib/crops';
import { gold, num1, pct } from '../lib/format';
import { fertilizerById } from '../data/fertilizers';
import { cropQualityDistribution } from '../lib/quality';
import type { Season } from '../lib/types';
import { CropName } from './CropName';
import { SeasonDayPicker } from './SeasonDayPicker';

export function GpdCalculator({ settings }: { settings: FarmSettings }) {
  const [season, setSeason] = useState<Season>('spring');
  const [day, setDay] = useState(1);
  const [continueNext, setContinueNext] = useState(true);

  const results = useMemo(
    () =>
      CROPS.filter((c) => c.seasons.includes(season))
        .map((c) => simulateCrop(c, settings, season, day, continueNext))
        .sort((a, b) => b.gpd - a.gpd),
    [settings, season, day, continueNext],
  );
  const q = cropQualityDistribution(settings.farmingLevel, fertilizerById(settings.fertilizer).qualityLevel);

  return (
    <section>
      <h2>Calculadora de lucro diário</h2>
      <p className="lead">
        Lucro real por tile considerando replantio (colheita única) ou rebrota, custo das sementes, fertilizante,
        qualidade esperada e profissões. GPD = lucro ÷ dias em que o tile fica ocupado.
      </p>
      <div className="settings-row">
        <SeasonDayPicker season={season} day={day} onChange={(s, d) => (setSeason(s), setDay(d))} />
        <label className="check inline">
          <input type="checkbox" checked={continueNext} onChange={(e) => setContinueNext(e.target.checked)} />
          <span>Culturas de várias estações seguem para a próxima (ex.: Milho, Trigo, Girassol)</span>
        </label>
      </div>
      <p className="hint">
        Qualidade esperada: Normal {pct(q.normal)} · Prata {pct(q.silver)} · Ouro {pct(q.gold)} · Irídio{' '}
        {pct(q.iridium)}
      </p>
      {season === 'winter' ? (
        <p className="empty">Nada cresce ao ar livre no inverno (exceto sementes de forragem de inverno).</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cultura</th>
                <th>Tipo</th>
                <th className="num">Crescimento</th>
                <th className="num">Colheitas</th>
                <th className="num">Sementes</th>
                <th className="num">Receita</th>
                <th className="num">Custos</th>
                <th className="num">Lucro/tile</th>
                <th className="num">GPD</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.crop.id} className={r.harvests === 0 ? 'muted' : undefined}>
                  <td>
                    <CropName crop={r.crop} />
                  </td>
                  <td>{r.crop.regrowDays ? `Rebrota a cada ${r.crop.regrowDays}d` : 'Colheita única'}</td>
                  <td className="num">{r.growDays}d</td>
                  <td className="num">{r.harvests}</td>
                  <td className="num">{r.seedsBought}</td>
                  <td className="num">{gold(r.revenue)}</td>
                  <td className="num">{gold(r.costs)}</td>
                  <td className={`num ${r.profit < 0 ? 'neg' : ''}`}>{gold(r.profit)}</td>
                  <td className="num strong">{r.harvests ? num1(r.gpd) : 'não dá tempo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
