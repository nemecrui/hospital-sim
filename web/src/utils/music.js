// Musiquinha de fundo suave, gerada com Web Audio API (sem ficheiros).
let ctx = null;
let on = false;
let timer = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

// Melodia simples e alegre (Dó maior). 0 = pausa.
const MELODY = [
  523.25, 587.33, 659.25, 523.25,
  659.25, 698.46, 783.99, 0,
  587.33, 659.25, 587.33, 523.25,
  587.33, 0, 523.25, 0
];
const BEAT = 0.34;

function scheduleBar(startTime) {
  const c = ac();
  if (!c) return;
  MELODY.forEach((f, i) => {
    if (!f) return;
    const t = startTime + i * BEAT;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 0.9);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t);
    osc.stop(t + BEAT);
  });
}

export function startMusic() {
  const c = ac();
  if (!c || on) return;
  on = true;
  if (c.state === 'suspended') c.resume();
  const barLen = MELODY.length * BEAT;
  let next = c.currentTime + 0.1;
  const tick = () => {
    if (!on) return;
    scheduleBar(next);
    next += barLen;
    timer = setTimeout(tick, barLen * 1000 - 60);
  };
  tick();
}

export function stopMusic() {
  on = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

export function isMusicOn() {
  return on;
}

export function toggleMusic() {
  if (on) stopMusic();
  else startMusic();
  return on;
}
