// Conteúdo por modo (frontend). O motor e as interações são iguais.
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const HUMAN_AVATARS = ['🧒', '👦', '👧', '🧑', '👶', '👵', '👴', '👩', '👨'];
const FIRST = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Sofia', 'Miguel', 'Inês', 'Rui', 'Joana', 'Tiago', 'Marta', 'Diogo', 'Beatriz', 'André', 'Leonor', 'Francisco', 'Matilde'];
const LAST = ['Silva', 'Santos', 'Oliveira', 'Ferreira', 'Gomes', 'Costa', 'Martins', 'Neves', 'Ribeiro', 'Rocha', 'Carvalho', 'Sousa'];

const SPECIES = [
  { s: 'cão', e: '🐶' }, { s: 'gato', e: '🐱' }, { s: 'coelho', e: '🐰' }, { s: 'hamster', e: '🐹' },
  { s: 'pássaro', e: '🐦' }, { s: 'tartaruga', e: '🐢' }, { s: 'cão', e: '🐕' }, { s: 'gato', e: '🐈' }, { s: 'peixinho', e: '🐟' }
];
const PETS = ['Bobi', 'Mia', 'Pipoca', 'Rex', 'Nina', 'Simba', 'Luna', 'Max', 'Bolinha', 'Fofa', 'Tobias', 'Kiko', 'Mel', 'Zeca', 'Farrusco', 'Pantufa', 'Bidu', 'Fred', 'Laika', 'Pulga'];

const HOSPITAL = {
  mode: 'hospital',
  title: '🏥 Hospital dos Amiguinhos',
  patientWord: 'doente',
  patientPlural: 'doentes',
  roles: { secretaria: '👩‍💼 Secretária', medica: '👨‍⚕️ Médica', enfermeira: '👩‍⚕️ Enfermeira', tad: '🔬 Técnico (TAS)' },
  diagnoses: ['Gripe', 'Constipação', 'Amigdalite', 'Otite', 'Gastroenterite', 'Alergia', 'Ferida', 'Entorse', 'Osso partido', 'Enxaqueca', 'Febre', 'Excesso de guloseimas', 'Preguicite aguda', 'Barriga de trovão', 'Nariz de palhaço', 'Cócegas crónicas', 'Dor de crescimento', 'Alergia a legumes', 'Cabeça no ar'],
  meds: [
    { name: 'Paracetamol', emoji: '💊', type: 'med', doses: 3 },
    { name: 'Ibuprofeno', emoji: '💊', type: 'med', doses: 2 },
    { name: 'Antibiótico', emoji: '💉', type: 'med', doses: 3 },
    { name: 'Anti-alérgico', emoji: '💊', type: 'med', doses: 2 },
    { name: 'Xarope', emoji: '🥄', type: 'med', doses: 3 },
    { name: 'Soro', emoji: '💧', type: 'med', doses: 1 },
    { name: 'Creme para comichão', emoji: '🧴', type: 'curativo', doses: 2 },
    { name: 'Gelo', emoji: '🧊', type: 'curativo', doses: 2 },
    { name: 'Penso', emoji: '🩹', type: 'curativo', doses: 1 },
    { name: 'Gesso', emoji: '🦴', type: 'curativo', doses: 1 },
    { name: 'Repouso', emoji: '😴', type: 'med', doses: 1 },
    { name: 'Chá quentinho', emoji: '🍵', type: 'med', doses: 2 },
    { name: 'Banho quente', emoji: '🛁', type: 'curativo', doses: 1 },
    { name: 'Mimo extra', emoji: '🧸', type: 'med', doses: 2 },
    { name: 'Gargalhada', emoji: '😂', type: 'med', doses: 3 }
  ],
  scenarios: {
    normal: { name: 'Dia normal', emoji: '🏥' },
    gripes: { name: 'Dia de Gripes', emoji: '🤧' },
    parque: { name: 'Dia do Parque', emoji: '🛝' },
    festa: { name: 'Festa de anos', emoji: '🎂' }
  },
  makeArrival() {
    return { name: `${pick(FIRST)} ${pick(LAST)}`, age: Math.floor(Math.random() * 97) + 3, avatar: pick(HUMAN_AVATARS) };
  }
};

const VET = {
  mode: 'vet',
  title: '🐾 Clínica dos Bichinhos',
  patientWord: 'animal',
  patientPlural: 'animais',
  roles: { secretaria: '👩‍💼 Rececionista', medica: '👩‍⚕️ Veterinária', enfermeira: '🧑‍⚕️ Enfermeira', tad: '🔬 Técnico (TAS)' },
  diagnoses: ['Pulgas', 'Bola de pelo', 'Pata partida', 'Otite', 'Barriga estragada', 'Alergia', 'Ferida', 'Dente estragado', 'Cansaço', 'Carraças', 'Constipação de bicho'],
  meds: [
    { name: 'Banho', emoji: '🛁', type: 'curativo', doses: 1 },
    { name: 'Tosquia', emoji: '✂️', type: 'curativo', doses: 1 },
    { name: 'Cortar unhas', emoji: '💅', type: 'nails', doses: 1 },
    { name: 'Vacina', emoji: '💉', type: 'med', doses: 1 },
    { name: 'Desparasitante', emoji: '💊', type: 'med', doses: 2 },
    { name: 'Limpar orelhas', emoji: '👂', type: 'curativo', doses: 1 },
    { name: 'Champô anti-pulgas', emoji: '🧴', type: 'curativo', doses: 2 },
    { name: 'Penso', emoji: '🩹', type: 'curativo', doses: 1 },
    { name: 'Gesso', emoji: '🦴', type: 'curativo', doses: 1 },
    { name: 'Comida especial', emoji: '🥫', type: 'med', doses: 2 },
    { name: 'Repouso', emoji: '😴', type: 'med', doses: 1 },
    { name: 'Festinhas', emoji: '🤗', type: 'med', doses: 2 }
  ],
  scenarios: {
    normal: { name: 'Dia normal', emoji: '🏥' },
    banhos: { name: 'Dia de Banhos', emoji: '🛁' },
    vacinas: { name: 'Dia de Vacinas', emoji: '💉' },
    parque: { name: 'Dia no Parque', emoji: '🌳' }
  },
  makeArrival() {
    const sp = pick(SPECIES);
    return { name: `${sp.e} ${pick(PETS)}`, age: Math.floor(Math.random() * 15) + 1, avatar: sp.e };
  }
};

const PACKS = { hospital: HOSPITAL, vet: VET };
export function getContent(mode) {
  return PACKS[mode] || HOSPITAL;
}
