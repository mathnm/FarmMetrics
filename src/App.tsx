import { useState } from 'react';
import { CROP_DATA_SOURCE } from './data/crops';
import { fertilizerById } from './data/fertilizers';
import type { FarmSettings } from './lib/crops';
import { NO_PROFESSIONS } from './lib/types';
import { usePersistentState } from './usePersistentState';
import { SettingsPanel } from './components/SettingsPanel';
import { GpdCalculator } from './components/GpdCalculator';
import { ProcessingOptimizer } from './components/ProcessingOptimizer';
import { SeasonPlanner } from './components/SeasonPlanner';
import { LivestockSimulator } from './components/LivestockSimulator';

const TABS = [
  { id: 'gpd', label: 'Lucro diário (GPD)' },
  { id: 'processing', label: 'Barril vs. Jarra' },
  { id: 'planner', label: 'Planejador de estação' },
  { id: 'livestock', label: 'Pecuária' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const DEFAULT_SETTINGS: FarmSettings = {
  farmingLevel: 0,
  fertilizer: 'none',
  fertilizerCost: fertilizerById('none').defaultCost,
  professions: NO_PROFESSIONS,
};

export default function App() {
  const [tab, setTab] = useState<TabId>('gpd');
  const [settings, setSettings] = usePersistentState<FarmSettings>('farmmetrics.settings', DEFAULT_SETTINGS);

  return (
    <div className="app">
      <header className="header">
        <h1>FarmMetrics</h1>
        <p>Calculadora de lucro e gerenciamento de recursos para Stardew Valley 1.6</p>
      </header>

      <SettingsPanel settings={settings} onChange={setSettings} />

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="panel">
        {tab === 'gpd' && <GpdCalculator settings={settings} />}
        {tab === 'processing' && <ProcessingOptimizer professions={settings.professions} />}
        {tab === 'planner' && <SeasonPlanner settings={settings} />}
        {tab === 'livestock' && <LivestockSimulator professions={settings.professions} />}
      </main>

      <footer className="footer">{CROP_DATA_SOURCE}</footer>
    </div>
  );
}
