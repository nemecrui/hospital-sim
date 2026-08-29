import { API_URL } from './api.js';

// Regista um evento anónimo (visita, instalação) para estatísticas.
export function track(type, mode) {
  try {
    fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, mode })
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

// Conta uma visita, no máximo uma por dia por dispositivo.
export function trackVisitOncePerDay() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('lastVisitDay') === today) return;
    localStorage.setItem('lastVisitDay', today);
  } catch {
    /* sem localStorage — conta na mesma */
  }
  track('visit');
}
