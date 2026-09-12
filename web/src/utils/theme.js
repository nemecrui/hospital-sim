// Temas sazonais do hospital — automáticos pela data real, com opção de forçar.
export const THEMES = {
  normal: { id: 'normal', emoji: '', label: 'Normal', from: 'from-hospital-pink', to: 'to-hospital-cyan', deco: [] },
  natal: { id: 'natal', emoji: '🎄', label: 'Natal', from: 'from-red-500', to: 'to-green-600', deco: ['❄️', '🎅', '⛄'] },
  praia: { id: 'praia', emoji: '🏖️', label: 'Praia', from: 'from-sky-400', to: 'to-yellow-400', deco: ['☀️', '🐚', '🏖️'] },
  halloween: { id: 'halloween', emoji: '🎃', label: 'Halloween', from: 'from-orange-500', to: 'to-purple-700', deco: ['🦇', '👻', '🕸️'] }
};

const KEY = 'hospitalTheme';

function seasonByDate(d = new Date()) {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 12) return 'natal';
  if (m >= 6 && m <= 8) return 'praia';
  if (m === 10 && day >= 24) return 'halloween';
  return 'normal';
}

export function getThemeOverride() {
  try {
    return localStorage.getItem(KEY) || 'auto';
  } catch {
    return 'auto';
  }
}

export function setThemeOverride(id) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}

export function currentTheme() {
  const ov = getThemeOverride();
  const id = ov && ov !== 'auto' ? ov : seasonByDate();
  return THEMES[id] || THEMES.normal;
}
