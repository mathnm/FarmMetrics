import { useMemo, useState } from 'react';
import { CROPS } from '../data/crops';
import { gold, num1 } from '../lib/format';
import { compareProcessing, type MachineId, type ProcessingOption } from '../lib/processing';
import type { Professions } from '../lib/types';
import { CropName } from './CropName';

type Mode = 'machines' | 'items';
const LABEL: Record<MachineId | 'raw', string> = { keg: 'Barril', jar: 'Jarra', raw: 'Vender cru' };

export function ProcessingOptimizer({ professions }: { professions: Professions }) {
  const [mode, setMode] = useState<Mode>('machines');
  const rows = useMemo(() => {
    const all = CROPS.map((c) => compareProcessing(c, professions)).filter((r) => r.keg || r.jar);
    const score = (o: ProcessingOption | null) => (o ? (mode === 'machines' ? o.goldPerMachineDay : o.valueAdded) : 0);
    return all.sort((a, b) => Math.max(score(b.keg), score(b.jar)) - Math.max(score(a.keg), score(a.jar)));
  }, [professions, mode]);

  return (
    <section>
      <h2>Otimizador de processamento: Barril vs. Jarra de Conserva</h2>
      <p className="lead">
        Compara o ouro extra (produto − item cru) e a taxa de <strong>ouro por dia de máquina</strong>. A resposta muda
        conforme o seu gargalo:
      </p>
      <div className="segmented" role="radiogroup">
        <button className={mode === 'machines' ? 'active' : ''} onClick={() => setMode('machines')}>
          Tenho poucas máquinas (ouro/dia de máquina)
        </button>
        <button className={mode === 'items' ? 'active' : ''} onClick={() => setMode('items')}>
          Tenho poucas frutas (ouro por item)
        </button>
      </div>
      <p className="hint">
        Frutas caras como a Carambola rendem muito mais <em>por fruta</em> no Barril (Vinho = 3×). Itens baratos ou
        médios ganham proporcionalmente mais na Jarra (+50g fixos) e liberam a máquina em ~3 dias em vez de ~7. Artesão
        (+40%) {professions.artisan ? 'ativo' : 'desativado'}; a máquina ignora a qualidade do item de entrada.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th className="num">Cru</th>
              <th>Barril</th>
              <th className="num">Ouro/dia (Barril)</th>
              <th>Jarra</th>
              <th className="num">Ouro/dia (Jarra)</th>
              <th>Recomendação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const best = mode === 'machines' ? r.bestForMachines : r.bestPerItem;
              return (
                <tr key={r.crop.id}>
                  <td>
                    <CropName crop={r.crop} />
                  </td>
                  <td className="num">{gold(r.rawPrice)}</td>
                  <td>{describe(r.keg)}</td>
                  <td className={`num ${best === 'keg' ? 'strong' : ''}`}>{r.keg ? num1(r.keg.goldPerMachineDay) : '—'}</td>
                  <td>{describe(r.jar)}</td>
                  <td className={`num ${best === 'jar' ? 'strong' : ''}`}>{r.jar ? num1(r.jar.goldPerMachineDay) : '—'}</td>
                  <td>
                    <span className={`badge ${best}`}>{LABEL[best]}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function describe(o: ProcessingOption | null) {
  if (!o) return '—';
  return (
    <span>
      {o.product.namePt} <small>{gold(o.price)} · ≈{num1(o.days)}d · +{gold(o.valueAdded)}</small>
    </span>
  );
}
