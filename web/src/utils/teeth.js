// 🦷 Gera a "boca" de cada paciente de forma estável (a partir do id), para que
// as duas jogadoras vejam exatamente os mesmos dentes/problemas, sem servidor.

function hash(s) {
  let h = 0;
  s = String(s || 'x');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const PROBLEMS = ['plaque', 'yellow', 'cavity', 'crooked', 'extract'];

// 12 dentes: 6 em cima, 6 em baixo. 3 a 4 têm problema.
export function makeMouth(id) {
  const teeth = [];
  for (const row of ['up', 'low']) for (let i = 0; i < 6; i++) teeth.push({ key: `${row}${i}`, row, idx: i, problem: null });
  const n = 3 + (hash(id) % 2); // 3 ou 4
  const order = [...teeth].sort((a, b) => (hash(id + a.key) % 1000) - (hash(id + b.key) % 1000));
  for (let k = 0; k < n; k++) order[k].problem = PROBLEMS[hash(id + order[k].key + 'p') % PROBLEMS.length];
  return teeth;
}

export const TOOLS = [
  { id: 'limpar', emoji: '🪥', label: 'Limpar' },
  { id: 'branquear', emoji: '✨', label: 'Branquear' },
  { id: 'carie', emoji: '🦷', label: 'Cárie' },
  { id: 'aparelho', emoji: '🦾', label: 'Aparelho' },
  { id: 'anestesia', emoji: '💉', label: 'Anestesia' },
  { id: 'arrancar', emoji: '🗜️', label: 'Arrancar' }
];

export const PROBLEM_LABEL = {
  plaque: 'tártaro',
  yellow: 'dente amarelo',
  cavity: 'cárie',
  crooked: 'dente torto',
  extract: 'dente a abanar'
};

// Feitio + historinha da boca (estável por paciente) — "porque é que está assim".
const CAUSES = [
  'comeu muitos chocolates no Halloween 🍫',
  'adora rebuçados e chupa-chupas 🍬',
  'esquece-se de escovar os dentes à noite 🌙',
  'bebeu refrigerantes a mais 🥤',
  'abria pacotes com os dentes 😬',
  'passou muito tempo sem vir ao dentista 📆',
  'adormeceu sem lavar os dentes 😴',
  'comeu bolos na festa de anos 🎂'
];
const FEITIOS = [
  { label: 'medricas', emoji: '😨' },
  { label: 'valente', emoji: '💪' },
  { label: 'falador', emoji: '💬' },
  { label: 'risonho', emoji: '😁' },
  { label: 'tímido', emoji: '🙈' },
  { label: 'brincalhão', emoji: '😜' }
];
export function mouthStory(patient) {
  const id = (patient && patient.id) || (patient && patient.name) || 'x';
  return { feitio: FEITIOS[hash(id + 'f') % FEITIOS.length], cause: CAUSES[hash(id) % CAUSES.length] };
}
