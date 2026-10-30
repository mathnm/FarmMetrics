import { FERTILIZERS, fertilizerById } from '../data/fertilizers';
import type { FarmSettings } from '../lib/crops';
import type { FertilizerId, Professions } from '../lib/types';

const PROFESSIONS: { key: keyof Professions; label: string; hint: string }[] = [
  { key: 'tiller', label: 'Cultivador', hint: '+10% no preço de plantações' },
  { key: 'agriculturist', label: 'Agricultor', hint: '+10% velocidade de crescimento' },
  { key: 'artisan', label: 'Artesão', hint: '+40% em produtos artesanais' },
  { key: 'rancher', label: 'Pecuarista', hint: '+20% em produtos animais' },
  { key: 'coopmaster', label: 'Criador de aves', hint: 'Melhor qualidade no galinheiro' },
  { key: 'shepherd', label: 'Pastor', hint: 'Melhor qualidade no celeiro; lã a cada 2 dias' },
  { key: 'gatherer', label: 'Coletor', hint: '20% de chance de trufa dupla' },
  { key: 'botanist', label: 'Botânico', hint: 'Trufas sempre de irídio' },
  { key: 'fisher', label: 'Pescador', hint: '+25% em peixes (não afeta plantações/animais)' },
  { key: 'angler', label: 'Pescador profissional', hint: '+50% em peixes (não afeta plantações/animais)' },
];

interface Props {
  settings: FarmSettings;
  onChange: (s: FarmSettings) => void;
}

export function SettingsPanel({ settings, onChange }: Props) {
  const fert = fertilizerById(settings.fertilizer);
  const setProfession = (key: keyof Professions, value: boolean) =>
    onChange({ ...settings, professions: { ...settings.professions, [key]: value } });

  return (
    <section className="settings">
      <div className="settings-row">
        <label className="field">
          <span>Nível de cultivo</span>
          <input
            type="number"
            min={0}
            max={14}
            value={settings.farmingLevel}
            onChange={(e) => onChange({ ...settings, farmingLevel: clampInt(e.target.value, 0, 14) })}
          />
        </label>
        <label className="field">
          <span>Fertilizante</span>
          <select
            value={settings.fertilizer}
            onChange={(e) => {
              const id = e.target.value as FertilizerId;
              onChange({ ...settings, fertilizer: id, fertilizerCost: fertilizerById(id).defaultCost });
            }}
          >
            {FERTILIZERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.namePt}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Custo do fertilizante (por tile)</span>
          <input
            type="number"
            min={0}
            value={settings.fertilizerCost}
            disabled={settings.fertilizer === 'none'}
            onChange={(e) => onChange({ ...settings, fertilizerCost: clampInt(e.target.value, 0, 100000) })}
          />
        </label>
      </div>
      {fert.note && <p className="hint">{fert.note}</p>}
      <label className="check">
        <input
          type="checkbox"
          checked={!!settings.stockedSeeds}
          onChange={(e) => onChange({ ...settings, stockedSeeds: e.target.checked })}
        />
        <span>Já tenho sementes de Morango guardadas (plantar antes do Festival do Ovo, dia 13)</span>
      </label>
      <fieldset className="professions">
        <legend>Profissões</legend>
        {PROFESSIONS.map((p) => (
          <label key={p.key} className="check" title={p.hint}>
            <input
              type="checkbox"
              checked={settings.professions[p.key]}
              onChange={(e) => setProfession(p.key, e.target.checked)}
            />
            <span>
              {p.label} <small>{p.hint}</small>
            </span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}

export function clampInt(v: string, min: number, max: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
