// Sons simples gerados com Web Audio API (sem ficheiros externos).
let ctx = null;
let enabled = true;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

function tone(freq, duration = 0.15, type = 'sine', delay = 0) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, c.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.25, c.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration);
}

export function setSoundEnabled(value) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}

export function playSound(kind) {
  if (!enabled) return;
  switch (kind) {
    case 'success':
      tone(660, 0.12, 'sine');
      tone(880, 0.16, 'sine', 0.1);
      break;
    case 'notification':
      tone(720, 0.1, 'triangle');
      break;
    case 'complete':
      tone(523, 0.12, 'sine');
      tone(659, 0.12, 'sine', 0.12);
      tone(784, 0.2, 'sine', 0.24);
      break;
    case 'error':
      tone(200, 0.25, 'sawtooth');
      break;
    default:
      tone(440, 0.1);
  }
}
