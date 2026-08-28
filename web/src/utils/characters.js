// Vida das personagens: feitio (personalidade), avatar, humor e falas.
// Tudo derivado do id do doente — estável, sem precisar de guardar nada na BD.

function hash(str) {
  let h = 0;
  const s = String(str || 'x');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function pickBy(seed, arr) {
  return arr[hash(seed) % arr.length];
}

// --- Feitios ---
export const TRAITS = [
  { id: 'medricas', label: 'medricas', emoji: '😨' },
  { id: 'corajoso', label: 'corajoso', emoji: '💪' },
  { id: 'cocegas', label: 'cocegas', emoji: '🤭' },
  { id: 'esfomeado', label: 'esfomeado', emoji: '🍽️' },
  { id: 'sonolento', label: 'sonolento', emoji: '😴' },
  { id: 'falador', label: 'falador', emoji: '💬' },
  { id: 'brincalhao', label: 'brincalhão', emoji: '😜' },
  { id: 'chorao', label: 'chorão', emoji: '🥺' }
];

export function traitFor(patient) {
  return TRAITS[hash((patient && patient.id) || patient) % TRAITS.length];
}

// --- Avatar (a "cara" da personagem) ---
const HUMAN = ['🧒', '👦', '👧', '🧑', '👶', '👵', '👴', '👩', '👨'];

export function avatarFor(patient, mode) {
  const name = (patient && patient.name) || '';
  if (mode === 'vet') {
    // no modo veterinário o nome começa com o emoji da espécie: "🐶 Bobi"
    const first = name.trim().split(' ')[0];
    if (first && !/^[\p{L}\p{N}]/u.test(first)) return first;
  }
  return HUMAN[hash((patient && patient.id) || name) % HUMAN.length];
}

// --- Humor: expressão + animação conforme o estado ---
// anim: 'tremble' | 'bob' | 'float' | 'breathe'
export function moodFor(patient) {
  const st = patient.status;
  const h = patient.health ?? 0;
  if (patient.emergency && st !== 'discharged') return { badge: '😰', anim: 'tremble', label: 'assustado' };
  if (st === 'discharge' || st === 'discharged') return { badge: '😄', anim: 'bob', label: 'curado' };
  if (st === 'triage') return { badge: '😟', anim: 'tremble', label: 'nervoso' };
  if (st === 'diagnosis') return { badge: '😕', anim: 'float', label: 'à espera da médica' };
  if (st === 'treatment') {
    if (h >= 100) return { badge: '😄', anim: 'bob', label: 'bem melhor' };
    if (h >= 50) return { badge: '😌', anim: 'float', label: 'a melhorar' };
    return { badge: '🤒', anim: 'tremble', label: 'ainda dodói' };
  }
  return { badge: '🙂', anim: 'breathe', label: 'tranquilo' };
}

// --- Corpo: que "problema" mostrar no boneco, a partir do diagnóstico/queixa ---
export function bodyStateFor(patient) {
  const h = patient.health ?? 0;
  if (patient.status === 'discharge' || patient.status === 'discharged' || h >= 100) return 'healthy';
  const d = (patient.diagnosis || '').toLowerCase();
  const s = (Array.isArray(patient.symptoms) ? patient.symptoms.join(' ') : '').toLowerCase();
  const t = `${d} ${s}`;
  const has = (...keys) => keys.some((k) => t.includes(k));

  if (has('osso partido', 'partid', 'torcid', 'entorse', 'caiu', 'tornozelo', 'pata')) return 'broken';
  if (has('ouvido', 'otite', 'orelha')) return 'ear';
  if (has('dente')) return 'tooth';
  if (has('cabeça', 'enxaqueca')) return 'headache';
  if (has('febre', 'gripe', 'amigdalite', 'garganta')) return 'fever';
  if (has('barriga', 'gastro', 'enjoo', 'vomit', 'guloseima', 'doces', 'roncar')) return 'belly';
  if (has('alergia', 'picada', 'pulga', 'carraç', 'borbulh', 'comichão', 'coceira', 'legumes')) return 'allergy';
  if (has('constipação', 'ranho', 'espirr', 'nariz', 'tosse')) return 'cold';
  if (has('ferida', 'ferimento', 'esfolado', 'magoou', 'magoada', 'penso')) return 'wound';
  return 'generic';
}

// --- Falas: o que a personagem diz, conforme feitio × estado × modo ---
export function speechFor(patient, mode) {
  const t = traitFor(patient).id;
  const st = patient.status;
  const animal = mode === 'vet';
  const cured = (patient.health ?? 0) >= 100 || st === 'discharge' || st === 'discharged';

  if (cured) {
    return pickBy(patient.id, [
      'Já me sinto ótimo! Obrigado 💗',
      'Estou curado! Posso ir brincar?',
      animal ? 'Já estou bom! 🐾' : 'Muito melhor, obrigado!'
    ]);
  }

  if (st === 'triage') {
    const byTrait = {
      medricas: 'Tenho um bocadinho de medo… 😨',
      corajoso: 'Eu aguento tudo! 💪',
      cocegas: 'Cuidado com as cócegas! 🤭',
      esfomeado: 'Isto demora? Tenho fominha 🍽️',
      sonolento: 'Estou com soninho… 😴',
      falador: 'Olá! Dói-me aqui, e ali, e também acolá…',
      brincalhao: 'Já agora, tens autocolantes? 😜',
      chorao: 'Quero um miminho… 🥺'
    };
    return byTrait[t] || (animal ? 'Não me sinto muito bem…' : 'Ai, não me sinto muito bem…');
  }

  if (st === 'diagnosis') {
    return animal ? 'O que é que eu tenho, doutora?' : pickBy(patient.id, [
      'O que é que eu tenho, doutora?',
      'Vou ficar bom?'
    ]);
  }

  if (st === 'treatment') {
    return (patient.health ?? 0) >= 50 ? 'Já me sinto um bocadinho melhor 😌' : 'Ainda me dói um bocadinho… 🤒';
  }

  return null;
}
