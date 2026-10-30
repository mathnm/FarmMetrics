import { DAYS_PER_SEASON, SEASONS, SEASON_PT, type Season } from '../lib/types';
import { clampInt } from './SettingsPanel';

interface Props {
  season: Season;
  day: number;
  onChange: (season: Season, day: number) => void;
}

export function SeasonDayPicker({ season, day, onChange }: Props) {
  return (
    <>
      <label className="field">
        <span>Estação</span>
        <select value={season} onChange={(e) => onChange(e.target.value as Season, day)}>
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {SEASON_PT[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Dia</span>
        <input
          type="number"
          min={1}
          max={DAYS_PER_SEASON}
          value={day}
          onChange={(e) => onChange(season, clampInt(e.target.value, 1, DAYS_PER_SEASON))}
        />
      </label>
    </>
  );
}
