import { useMemo } from 'react';
import { gold, num1 } from '../lib/format';
import { simulateAllAnimals, type CareLevel, type LivestockSettings, type PettingMode } from '../lib/livestock';
import type { Professions } from '../lib/types';
import { usePersistentState } from '../usePersistentState';
import { clampInt } from './SettingsPanel';

type Inputs = Omit<LivestockSettings, 'professions'>;
const DEFAULTS: Inputs = {
  count: 8,
  friendship: 1000,
  care: 'excellent',
  petting: 'manual',
  hayFraction: 0.3,
  pigOutdoorFraction: 0.55,
  autoGrabber: false,
};

export function LivestockSimulator({ professions }: { professions: Professions }) {
  const [inputs, setInputs] = usePersistentState<Inputs>('farmmetrics.livestock', DEFAULTS);
  const set = (patch: Partial<Inputs>) => setInputs({ ...inputs, ...patch });
  const results = useMemo(() => simulateAllAnimals({ ...inputs, professions }), [inputs, professions]);
  const notes = Array.from(new Set(results.flatMap((r) => r.notes)));

  return (
    <section>
      <h2>Simulador de pecuária e produtos artesanais</h2>
      <p className="lead">
        Maionese (galinhas/patos) vs. Queijo (vacas/cabras) vs. Óleo de Trufa (porcos) vs. Tecido (ovelhas/coelhos). Os
        valores são médias por animal por dia, já descontando o feno.
      </p>
      <div className="settings-row">
        <label className="field">
          <span>Animais de cada tipo</span>
          <input type="number" min={1} value={inputs.count} onChange={(e) => set({ count: clampInt(e.target.value, 1, 999) })} />
        </label>
        <label className="field">
          <span>Amizade ({num1(inputs.friendship / 200)} ♥)</span>
          <input
            type="range"
            min={0}
            max={1000}
            step={50}
            value={inputs.friendship}
            onChange={(e) => set({ friendship: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Cuidado / alimentação</span>
          <select value={inputs.care} onChange={(e) => set({ care: e.target.value as CareLevel })}>
            <option value="excellent">Excelente (alimentado, pasto, aquecedor no inverno)</option>
            <option value="good">Bom (alimentado, pouco pasto)</option>
            <option value="poor">Ruim (fome ou preso com frequência)</option>
          </select>
        </label>
        <label className="field">
          <span>Carinho</span>
          <select value={inputs.petting} onChange={(e) => set({ petting: e.target.value as PettingMode })}>
            <option value="manual">Manual, todo dia</option>
            <option value="auto_petter">Auto-Acariciador</option>
            <option value="none">Nenhum</option>
          </select>
        </label>
        <label className="field">
          <span>Dias com feno ({Math.round(inputs.hayFraction * 100)}%)</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={inputs.hayFraction}
            onChange={(e) => set({ hayFraction: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Dias em que o porco sai ({Math.round(inputs.pigOutdoorFraction * 100)}%)</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={inputs.pigOutdoorFraction}
            onChange={(e) => set({ pigOutdoorFraction: Number(e.target.value) })}
          />
        </label>
        <label className="check inline">
          <input type="checkbox" checked={inputs.autoGrabber} onChange={(e) => set({ autoGrabber: e.target.checked })} />
          <span>Auto-Pegador</span>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Animal</th>
              <th className="num">Custo</th>
              <th>Produto → artesanal</th>
              <th className="num">Cru/dia</th>
              <th className="num">Artesanal/dia</th>
              <th className="num">Feno/dia</th>
              <th className="num">Líquido/dia</th>
              <th className="num">Se paga em</th>
              <th className="num">Máquinas p/ {inputs.count}</th>
              <th className="num">Total/dia ({inputs.count})</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.animal.id}>
                <td>
                  {r.animal.namePt} <small>{r.animal.building === 'coop' ? 'Galinheiro' : 'Celeiro'}</small>
                </td>
                <td className="num">{gold(r.animal.cost)}</td>
                <td>
                  {r.animal.product.namePt} → {r.animal.artisan.namePt} <small>({r.animal.artisan.machinePt})</small>
                </td>
                <td className={`num ${!r.bestIsArtisan ? 'strong' : ''}`}>{gold(r.rawPerDay)}</td>
                <td className={`num ${r.bestIsArtisan ? 'strong' : ''}`}>{gold(r.artisanPerDay)}</td>
                <td className="num">{gold(r.feedPerDay)}</td>
                <td className="num strong">{gold(r.netPerDay)}</td>
                <td className="num">{Number.isFinite(r.paybackDays) ? `${Math.ceil(r.paybackDays)} dias` : 'nunca'}</td>
                <td className="num">{r.machinesNeeded}</td>
                <td className="num">{gold(r.netPerDay * inputs.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="notes">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
        <li>
          Produtos grandes (Ovo Grande, Leite Grande) aparecem com amizade ≥ 200 e viram artesanato de qualidade Ouro.
          Qualidade dos produtos crus depende da amizade e felicidade (Criador de aves/Pastor dão +33%).
        </li>
        <li>Máquinas necessárias assumem uma carga por dia (Maionese 3h, Queijo 3h20, Tecido 4h, Óleo 6h).</li>
      </ul>
    </section>
  );
}
