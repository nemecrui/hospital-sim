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

// --- Categoria de uma doença/queixa (para feedback educativo) ---
export function categoryOf(text) {
  const t = (text || '').toLowerCase();
  if (/garganta|amigdal|anginas/.test(t)) return 'garganta';
  if (/ouvido|otite|orelha/.test(t)) return 'ouvido';
  if (/osso|partid|torcid|entorse|fratura|pata/.test(t)) return 'osso';
  if (/barriga|gastro|enjoo|vomit|guloseim|doces|roncar|estragada/.test(t)) return 'barriga';
  if (/alergia|picada|pulga|carraç|comichão|coceira|borbulh|legumes/.test(t)) return 'alergia';
  if (/constipa|ranho|espirr|nariz|tosse|gripe/.test(t)) return 'constipacao';
  if (/cabeça|enxaqueca/.test(t)) return 'cabeca';
  if (/febre/.test(t)) return 'febre';
  if (/dente/.test(t)) return 'dente';
  if (/ferida|ferimento|esfolado|magoou|magoada/.test(t)) return 'ferida';
  if (/cansa|preguic|sono|tristonho/.test(t)) return 'cansaco';
  return 'geral';
}

// O diagnóstico combina com a queixa do doente?
export function diagnosisMatches(patient) {
  const dCat = categoryOf(patient.diagnosis || '');
  if (dCat === 'geral' || !patient.diagnosis) return false;
  const sCat = categoryOf(Array.isArray(patient.symptoms) ? patient.symptoms.join(' ') : '');
  return dCat === sCat;
}

// Explicação simples da doença (para as crianças aprenderem).
const DIAG_INFO = {
  garganta: 'A garganta fica vermelha e inflamada — por isso dói ao engolir.',
  ouvido: 'A otite é uma inflamação no ouvido — dói e às vezes ouve-se pior.',
  osso: 'Quando um osso parte, o gesso segura tudo quietinho para colar bem.',
  barriga: 'A barriga fica atrapalhada quando comemos demais ou apanhamos um micróbio.',
  alergia: 'Nas alergias, o corpo assusta-se com algo e faz comichão e borbulhas.',
  constipacao: 'A constipação entope o nariz e faz espirrar — água e descanso ajudam!',
  cabeca: 'As dores de cabeça passam com descanso, água e pouca luz.',
  febre: 'A febre é o corpo a aquecer para combater os micróbios.',
  dente: 'Os dentes precisam de escovagem para não ficarem estragados.',
  ferida: 'As feridas saram melhor limpas e com um penso.',
  cansaco: 'Às vezes o corpo só precisa de descanso e de muitos mimos.',
  geral: 'Com cuidado e carinho, fica tudo melhor!'
};
export function diagnosisInfo(diagnosis) {
  return DIAG_INFO[categoryOf(diagnosis)] || DIAG_INFO.geral;
}

// --- Aparência estável por doente (pele, cabelo, roupa) para dar variedade ---
const SKINS = ['#FDD9B5', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
const HAIR_YOUNG = ['#6B4A2B', '#3B2E24', '#141414', '#D9A441', '#A0522D'];
const HAIR_OLD = ['#C9CDD6', '#DFE2E6', '#AEB4BD'];
const SHIRTS = ['#FF6B9D', '#00C2D9', '#8B7BE8', '#FFB13D', '#54C777', '#FF8A5B'];
const HAIRSTYLES = ['short', 'side', 'ponytail', 'curly', 'buzz'];

export function appearanceFor(patient) {
  const id = (patient && patient.id) || (patient && patient.name) || 'x';
  const old = (Number(patient && patient.age) || 20) >= 65;
  return {
    skin: SKINS[hash(id + 's') % SKINS.length],
    hair: old ? HAIR_OLD[hash(id + 'h') % HAIR_OLD.length] : HAIR_YOUNG[hash(id + 'h') % HAIR_YOUNG.length],
    style: old ? (hash(id) % 2 ? 'buzz' : 'short') : HAIRSTYLES[hash(id + 'y') % HAIRSTYLES.length],
    shirt: SHIRTS[hash(id + 'c') % SHIRTS.length],
    glasses: old && hash(id + 'g') % 2 === 0
  };
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
