import { useState } from 'react';

// Faixas normais para as dicas educativas
const NORMAL = {
  temp: { min: 36, max: 37.5, unit: '°C', label: 'Temperatura', tip: 'A temperatura normal é ~37 °C.' },
  hr: { min: 60, max: 100, unit: 'bpm', label: 'Pulsação', tip: 'A pulsação normal em repouso é 60–100 bpm.' }
};

export default function VitalsForm({ initial = {}, onChange }) {
  const [vitals, setVitals] = useState({
    temp: initial.temp ?? '',
    hr: initial.hr ?? '',
    bp: initial.bp ?? ''
  });

  const update = (field, value) => {
    const next = { ...vitals, [field]: value };
    setVitals(next);
    onChange?.(next);
  };

  const flag = (field) => {
    const v = parseFloat(vitals[field]);
    if (Number.isNaN(v)) return null;
    const range = NORMAL[field];
    if (!range) return null;
    if (v < range.min) return '⬇️ Baixo';
    if (v > range.max) return '⚠️ Alto';
    return '✅ Normal';
  };

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-lg font-bold">🌡️ Sinais Vitais</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-semibold">Temperatura (°C)</label>
          <input
            className="input"
            type="number"
            step="0.1"
            placeholder="37.0"
            value={vitals.temp}
            onChange={(e) => update('temp', e.target.value)}
          />
          <span className="text-xs text-gray-500">{flag('temp')}</span>
        </div>

        <div>
          <label className="block text-sm font-semibold">Pulsação (bpm)</label>
          <input
            className="input"
            type="number"
            placeholder="80"
            value={vitals.hr}
            onChange={(e) => update('hr', e.target.value)}
          />
          <span className="text-xs text-gray-500">{flag('hr')}</span>
        </div>

        <div>
          <label className="block text-sm font-semibold">Tensão</label>
          <input
            className="input"
            placeholder="12/8"
            value={vitals.bp}
            onChange={(e) => update('bp', e.target.value)}
          />
        </div>
      </div>

      <p className="mt-3 rounded-xl bg-blue-50 p-2 text-xs text-blue-700">
        💡 {NORMAL.temp.tip} {NORMAL.hr.tip}
      </p>
    </div>
  );
}
