import { traitFor } from './characters.js';

// Remove emojis/símbolos para o sintetizador não os "ler" (ex.: 🚑 → "ambulância").
function stripEmoji(text) {
  return String(text || '')
    .replace(/[\p{Extended_Pictographic}‍️⃣]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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
    const clean = stripEmoji(text);
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
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

// Nome sem o emoji da espécie (modo veterinário) e voz a usar.
function nameAndVoice(patient, mode) {
  const raw = patient.name || 'o doente';
  if (mode === 'vet') {
    const emoji = raw.trim().split(' ')[0];
    const a = ANIMAL_VOICE[emoji] || { sound: '', pitch: 1.5 };
    const petName = raw.replace(emoji, '').trim() || 'o bichinho';
    return { name: petName, sound: a.sound, voice: { pitch: a.pitch, rate: 1.0 } };
  }
  return { name: raw, sound: '', voice: ageVoice(patient.age) };
}

// Faz a personagem falar a sua queixa — sempre na 1ª pessoa, sem ler emojis.
export function speakAs(patient, mode) {
  if (!patient) return;
  const { name, sound, voice } = nameAndVoice(patient, mode);
  const queixas = Array.isArray(patient.symptoms) ? patient.symptoms : [];
  const parte = queixas.length ? queixas.join(', ') : 'nada de especial';
  const abre = sound ? `${sound}! ` : '';
  say(`${abre}Olá, sou ${name}. Tenho ${parte}.`, voice);
}

// --- Reações por personalidade durante as ações (exame, diagnóstico, tratamento) ---
function reactionLine(trait, kind) {
  const banks = {
    injection: {
      medricas: 'Ai ai! Não gosto nada de picas!',
      corajoso: 'Nem senti nada!',
      chorao: 'Booo! Doeu um bocadinho!',
      cocegas: 'Ih ih, faz-me cócegas!',
      _: 'Aiii! Pronto, já está.'
    },
    syrup: {
      esfomeado: 'Mmm, sabe bem! Quero mais!',
      chorao: 'Que sabor mais estranho…',
      _: 'Glup! Já bebi o xarope.'
    },
    rub: {
      cocegas: 'Hihi, para, que tenho cócegas!',
      medricas: 'Devagarinho, por favor…',
      _: 'Aaah, que alívio.'
    },
    nails: {
      medricas: 'Cuidado com as minhas patinhas!',
      _: 'Cri, cri! Já ficaram curtinhas.'
    },
    medicine: {
      esfomeado: 'Mmm, mais um!',
      chorao: 'Não sabe muito bem…',
      _: 'Já tomei o meu remédio.'
    },
    exam: {
      medricas: 'Tenho um bocadinho de medo desta máquina…',
      corajoso: 'Uma máquina? Que fixe!',
      cocegas: 'Isso faz-me cócegas!',
      _: 'O que é que esta máquina faz?'
    },
    diagnosis: {
      corajoso: 'Eu já sabia que era isso!',
      chorao: 'É muito grave, doutora?',
      medricas: 'Vou ficar bom, não vou?',
      _: 'Ah, então é isso que eu tenho!'
    },
    thanks: {
      falador: 'Muito, muito obrigado! Já me sinto ótimo, posso ir brincar?',
      _: 'Muito obrigado! Já me sinto ótimo!'
    }
  };
  const bank = banks[kind] || banks.medicine;
  return bank[trait] || bank._;
}

// A personagem reage a uma ação, com um som/frase curto e a voz certa.
export function reactAs(patient, mode, kind) {
  if (!patient) return;
  const trait = traitFor(patient).id;
  const { sound, voice } = nameAndVoice(patient, mode);
  const line = reactionLine(trait, kind);
  // Nos animais, um somzinho antes da fala (só para picas/exames, mais expressivos)
  const abre = sound && (kind === 'injection' || kind === 'exam') ? `${sound}! ` : '';
  say(`${abre}${line}`, voice);
}
