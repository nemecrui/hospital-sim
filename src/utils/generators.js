import { pack } from './content.js';

const one = (a) => a[Math.floor(Math.random() * a.length)];

// ----- Código-fruta das sessões (partilha) -------------------------------
export const FRUITS = [
  'morango', 'banana', 'laranja', 'uva', 'melancia', 'cereja', 'manga',
  'kiwi', 'pera', 'meloa', 'framboesa', 'ameixa', 'figo', 'coco', 'lima',
  'mirtilo', 'abacate', 'tangerina', 'papaia', 'goiaba', 'ananas', 'maca'
];
export function randomFruit() {
  return FRUITS[Math.floor(Math.random() * FRUITS.length)];
}

// ----- Triagem -----------------------------------------------------------
export const HEALTH_BY_COLOR = { verde: 75, amarela: 60, laranja: 45, vermelha: 30 };

// Uma queixa por paciente, enviesada pelo cenário do modo.
export function generateQueixas(mode, scenario) {
  const p = pack(mode);
  const sc = p.scenarios[scenario];
  if (sc && sc.prefer && Math.random() < 0.7) {
    const pool = sc.prefer.filter((n) => p.conditions.some((c) => c.name === n));
    if (pool.length) return [one(pool)];
  }
  return [one(p.conditions).name];
}

export function suggestTriageColor(mode, queixas) {
  const p = pack(mode);
  const weights = queixas.map((q) => p.conditions.find((c) => c.name === q)?.weight || 1);
  const max = Math.max(1, ...weights);
  if (max >= 3) return 'vermelha';
  if (max === 2) return Math.random() > 0.5 ? 'laranja' : 'amarela';
  return 'verde';
}

// ----- Histórias ---------------------------------------------------------
function ageBand(age) {
  if (age == null) return 'crianca';
  if (age <= 12) return 'crianca';
  if (age <= 17) return 'jovem';
  if (age <= 64) return 'adulto';
  return 'idoso';
}

export function generateStory(mode, symptom, age) {
  const s = pack(mode).story;
  const when = one(s.when);
  const onde = s.ondeByAge ? one(s.ondeByAge[ageBand(age)]) : one(s.onde);
  const extra = s.extrasByAge ? one(s.extrasByAge[ageBand(age)]) : one(s.extras);
  const event = one(s.events[symptom] || s.generic);
  return `${when}, ${onde}, ${event}. ${extra}`;
}

// ----- Pacientes ---------------------------------------------------------
export function generatePatient(mode, scenario) {
  const p = pack(mode);
  const symptoms = generateQueixas(mode, scenario);
  // ~28% das vezes chega um "amigo do costume" (mesma cara, queixa nova)
  const friends = p.friends || [];
  const friend = friends.length && Math.random() < 0.28 ? one(friends) : null;
  const age = friend ? friend.age : p.makeAge();
  const name = friend ? friend.name : p.makeName();
  return { name, age, symptoms, story: generateStory(mode, symptoms[0], age) };
}

export function generateEmergency(mode) {
  const p = pack(mode);
  const symptom = one(p.emergencySymptoms);
  return { name: p.makeName(), age: p.makeAge(), symptoms: [symptom], story: one(p.emergencyStories) };
}

// ----- Exames (partilhados entre modos) ----------------------------------
export const EXAMS = [
  { name: 'ECG', emoji: '📈', results: ['Coração normal ❤️', 'Batimento acelerado', 'Batimento devagar', 'Coração aos saltos 🐰', 'Batimento de festa 🎉'] },
  { name: 'Ecografia', emoji: '🫧', results: ['Barriga normal', 'Comeu demais 🍔', 'Muitos gases 💨', 'Borboletas na barriga 🦋', 'Engoliu ar 🎈'] },
  { name: 'Raio-X', emoji: '🩻', results: ['Ossos normais', 'Osso partido 🦴', 'Engoliu uma moeda 🪙', 'Pipocas na barriga 🍿', 'Osso rijo como pedra 🪨'] },
  { name: 'TAC', emoji: '🧠', results: ['Cabeça normal', 'Muitas ideias 💡', 'Sonhos a mais 💭', 'Cheia de imaginação 🌈'] },
  { name: 'Ressonância (RM)', emoji: '🧲', results: ['Tudo bem', 'Precisa de descanso 😴', 'Precisa de férias 🏖️', 'Bateria fraca 🔋'] },
  { name: 'Análise de sangue', emoji: '🩸', results: ['Tudo normal', 'Falta de ferro', 'Uma infeção 🦠', 'Açúcar a mais 🍭', 'Super-herói saudável 🦸'] },
  { name: 'Análise de urina', emoji: '🧪', results: ['Normal', 'Infeção urinária', 'Bebeu pouca água 🚱', 'Xixi campeão 🏆'] },
  { name: 'Audiograma', emoji: '👂', results: ['Ouve bem 👍', 'Ouve pouco', 'Ouve até os segredos 🤫', 'Orelhas com cera 🕯️'] }
];
export function examEmoji(name) {
  return EXAMS.find((e) => e.name === name)?.emoji || '🔬';
}
export function randomExamResult(name) {
  const ex = EXAMS.find((e) => e.name === name);
  return ex ? one(ex.results) : 'Normal';
}

// ----- Cromos (partilhados) ---------------------------------------------
export const STICKERS = [
  { id: 'unicornio', emoji: '🦄', name: 'Unicórnio' }, { id: 'cao', emoji: '🐶', name: 'Cão' },
  { id: 'gato', emoji: '🐱', name: 'Gato' }, { id: 'leao', emoji: '🦁', name: 'Leão' },
  { id: 'panda', emoji: '🐼', name: 'Panda' }, { id: 'raposa', emoji: '🦊', name: 'Raposa' },
  { id: 'sapo', emoji: '🐸', name: 'Sapo' }, { id: 'tartaruga', emoji: '🐢', name: 'Tartaruga' },
  { id: 'borboleta', emoji: '🦋', name: 'Borboleta' }, { id: 'abelha', emoji: '🐝', name: 'Abelha' },
  { id: 'arcoiris', emoji: '🌈', name: 'Arco-íris' }, { id: 'estrela', emoji: '⭐', name: 'Estrela' },
  { id: 'foguetao', emoji: '🚀', name: 'Foguetão' }, { id: 'gelado', emoji: '🍦', name: 'Gelado' },
  { id: 'balao', emoji: '🎈', name: 'Balão' }, { id: 'dino', emoji: '🦖', name: 'Dino' },
  { id: 'polvo', emoji: '🐙', name: 'Polvo' }, { id: 'pinguim', emoji: '🐧', name: 'Pinguim' },
  { id: 'coruja', emoji: '🦉', name: 'Coruja' }, { id: 'golfinho', emoji: '🐬', name: 'Golfinho' }
];
export function randomSticker() {
  return STICKERS[Math.floor(Math.random() * STICKERS.length)];
}
