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

// Beep avulso (ex.: audiograma) — não depende do "som ligado" para funcionar,
// mas respeita-o na mesma.
export function beep(freq = 880, duration = 0.25, vol = 0.2) {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

// Ruído filtrado (ex.: xixi a cair na sanita).
function noiseBurst(duration = 1.4, { freq = 1300, q = 0.8, vol = 0.12 } = {}) {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * duration), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(freq, c.currentTime);
  bp.frequency.linearRampToValueAtTime(freq * 0.65, c.currentTime + duration);
  bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.1);
  g.gain.setValueAtTime(vol, c.currentTime + duration - 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  src.connect(bp);
  bp.connect(g);
  g.connect(c.destination);
  src.start();
  src.stop(c.currentTime + duration);
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
    case 'alert': // sirene de ambulância 🚑
      tone(880, 0.18, 'square');
      tone(660, 0.18, 'square', 0.2);
      tone(880, 0.18, 'square', 0.4);
      tone(660, 0.22, 'square', 0.6);
      break;
    case 'pee': // xixi a cair na sanita (análise de urina)
      noiseBurst(1.5, { freq: 1400, q: 0.9, vol: 0.12 });
      break;
    default:
      tone(440, 0.1);
  }
}
