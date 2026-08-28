// Ler texto em voz alta (para quem ainda não sabe ler).
function pickVoice(preferSecond) {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('pt'));
  if (voices.length === 0) return null;
  // Voz das dicas tenta ser diferente da dos doentes
  if (preferSecond && voices.length > 1) return voices[1];
  return voices[0];
}

function say(text, { pitch = 1, rate = 0.95, second = false } = {}) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-PT';
    u.rate = rate;
    u.pitch = pitch;
    const v = pickVoice(second);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* sem voz disponível */
  }
}

// Voz do doente
export function speak(text) {
  say(text, { pitch: 1, rate: 0.95, second: false });
}

// Voz das dicas — diferente (mais aguda e um pouco mais lenta) para não confundir
export function speakTip(text) {
  say(text, { pitch: 1.4, rate: 0.9, second: true });
}

// --- Voz das personagens: tom conforme a idade e sons de animais ---
const ANIMAL_VOICE = {
  '🐶': { sound: 'Ão ão', pitch: 1.2 },
  '🐕': { sound: 'Ão ão', pitch: 1.2 },
  '🐱': { sound: 'Miau', pitch: 1.5 },
  '🐈': { sound: 'Miau', pitch: 1.5 },
  '🐰': { sound: 'Fon fon', pitch: 1.7 },
  '🐹': { sound: 'Cri cri', pitch: 1.9 },
  '🐦': { sound: 'Piu piu', pitch: 1.9 },
  '🐢': { sound: 'Hmmm', pitch: 0.85 },
  '🐟': { sound: 'Blup blup', pitch: 1.6 }
};

function ageVoice(age) {
  const a = Number(age) || 20;
  if (a <= 7) return { pitch: 1.7, rate: 1.05 }; // criança pequena
  if (a <= 14) return { pitch: 1.4, rate: 1.0 };
  if (a >= 60) return { pitch: 0.75, rate: 0.9 }; // avô/avó
  return { pitch: 1.0, rate: 0.97 };
}

// Faz a personagem falar a sua queixa, com a voz certa.
export function speakAs(patient, mode) {
  if (!patient) return;
  const name = patient.name || 'o doente';
  const queixas = Array.isArray(patient.symptoms) ? patient.symptoms : [];
  const parte = queixas.length ? queixas.join(', ') : 'nada de especial';
  const story = patient.story || '';

  if (mode === 'vet') {
    const emoji = name.trim().split(' ')[0];
    const a = ANIMAL_VOICE[emoji] || { sound: 'Olá', pitch: 1.5 };
    const petName = name.replace(emoji, '').trim() || 'o bichinho';
    say(`${a.sound}! Sou ${petName}. Tenho ${parte}. ${story}`, { pitch: a.pitch, rate: 1.0 });
    return;
  }

  const v = ageVoice(patient.age);
  say(`Olá, sou ${name}. Tenho ${parte}. ${story}`, { pitch: v.pitch, rate: v.rate });
}
