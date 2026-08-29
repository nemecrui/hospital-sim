import { traitFor } from './characters.js';
import { playClip, stopClip } from './clips.js';

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
  const clean = stripEmoji(text);
  if (!clean) return;
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  // 1) Se houver clip de voz para esta fala, toca o clip (voz "de verdade").
  if (playClip(clean, pitch)) return;
  // 2) Caso contrário, usa a voz do browser.
  stopClip();
  try {
    if (!('speechSynthesis' in window)) return;
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

// Faz a personagem apresentar-se, dizer a queixa E contar a história — sem ler emojis.
export function speakAs(patient, mode) {
  if (!patient) return;
  const { name, sound, voice } = nameAndVoice(patient, mode);
  const queixas = Array.isArray(patient.symptoms) ? patient.symptoms : [];
  const parte = queixas.length ? queixas.join(', ') : 'nada de especial';
  const story = patient.story || '';
  const abre = sound ? `${sound}! ` : '';
  say(`${abre}Olá, sou ${name}. Tenho ${parte}. ${story}`, voice);
}

// Lê um texto qualquer com a voz da personagem (ex.: o que está no balão de fala).
export function sayAs(patient, mode, text) {
  if (!patient || !text) return;
  const { voice } = nameAndVoice(patient, mode);
  say(text, voice);
}

// --- Reações por personalidade durante as ações (exame, diagnóstico, tratamento) ---
const pickRand = (a) => a[Math.floor(Math.random() * a.length)];

function reactionLine(trait, kind) {
  const banks = {
    injection: {
      medricas: ['Ai ai! Não gosto nada de picas!', 'Espeta devagarinho, sim?'],
      corajoso: ['Nem senti nada!', 'Isso não dói nada!'],
      chorao: ['Booo! Doeu um bocadinho!', 'Buááá!'],
      cocegas: ['Ih ih, faz-me cócegas!'],
      _: ['Aiii! Pronto, já está.', 'Uma picadinha e já passou.']
    },
    syrup: {
      esfomeado: ['Mmm, sabe bem! Quero mais!'],
      chorao: ['Que sabor mais estranho…'],
      _: ['Glup! Já bebi o xarope.', 'Sabe a morango!']
    },
    rub: {
      cocegas: ['Hihi, para, que tenho cócegas!'],
      medricas: ['Devagarinho, por favor…'],
      _: ['Aaah, que alívio.', 'Que fresquinho!']
    },
    nails: {
      medricas: ['Cuidado com as minhas patinhas!'],
      _: ['Cri, cri! Já ficaram curtinhas.']
    },
    medicine: {
      esfomeado: ['Mmm, mais um!'],
      chorao: ['Não sabe muito bem…'],
      _: ['Já tomei o meu remédio.', 'Pronto, engoli!']
    },
    exam: {
      medricas: ['Tenho um bocadinho de medo desta máquina…', 'Isto não me magoa, pois não?'],
      corajoso: ['Uma máquina? Que fixe!', 'Adoro estas máquinas!'],
      cocegas: ['Isso faz-me cócegas!'],
      _: [
        'Uau, que máquina gira!',
        'Isto é como uma fotografia por dentro?',
        'Vai fazer barulho?',
        'Fico quietinho, prometo!',
        'Consigo ver-me por dentro?',
        'O que é que esta máquina faz?'
      ]
    },
    diagnosis: {
      corajoso: ['Eu já sabia que era isso!'],
      chorao: ['É muito grave, doutora?'],
      medricas: ['Vou ficar bom, não vou?'],
      _: ['Ah, então é isso que eu tenho!', 'Já percebi o que se passa!']
    },
    thanks: {
      falador: ['Muito, muito obrigado! Já me sinto ótimo, posso ir brincar?'],
      _: ['Muito obrigado! Já me sinto ótimo!', 'Obrigado, doutora! Estou curado!']
    }
  };
  const bank = banks[kind] || banks.medicine;
  return pickRand(bank[trait] || bank._);
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
