const firstNames = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Sofia',
  'Miguel', 'Inês', 'Rui', 'Joana', 'Tiago', 'Marta',
  'Diogo', 'Beatriz', 'André', 'Leonor', 'Francisco', 'Matilde'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Ferreira', 'Gomes',
  'Costa', 'Martins', 'Neves', 'Ribeiro', 'Rocha',
  'Carvalho', 'Sousa', 'Fernandes', 'Marques'
];

const symptomsPool = [
  'Constipação', 'Gripe', 'Dor de cabeça', 'Febre',
  'Tosse', 'Dor de garganta', 'Ferimento', 'Dor no ouvido',
  'Nariz entupido', 'Espinha inflamada', 'Aftas', 'Alergia',
  'Dor de barriga', 'Tornozelo torcido'
];

// Frutas sem acentos, fáceis de escrever por uma criança
export const FRUITS = [
  'morango', 'banana', 'laranja', 'uva', 'melancia', 'cereja', 'manga',
  'kiwi', 'pera', 'meloa', 'framboesa', 'ameixa', 'figo', 'coco', 'lima',
  'mirtilo', 'abacate', 'tangerina', 'papaia', 'goiaba', 'ananas', 'maca'
];

export function randomFruit() {
  return FRUITS[Math.floor(Math.random() * FRUITS.length)];
}

// Queixas possíveis (com peso de gravidade 1=leve .. 3=grave) para a triagem
export const CONDITIONS = [
  { name: 'Febre', weight: 2 },
  { name: 'Tosse', weight: 1 },
  { name: 'Dor de cabeça', weight: 1 },
  { name: 'Dor de barriga', weight: 2 },
  { name: 'Dor de garganta', weight: 1 },
  { name: 'Ferimento', weight: 2 },
  { name: 'Constipação', weight: 1 },
  { name: 'Dor no ouvido', weight: 1 },
  { name: 'Alergia', weight: 2 },
  { name: 'Tornozelo torcido', weight: 2 },
  { name: 'Picada de inseto', weight: 1 },
  { name: 'Enjoo', weight: 1 },
  { name: 'Caiu e magoou-se', weight: 3 },
  // Queixas caricatas e divertidas 🙂
  { name: 'Soluços sem parar', weight: 1 },
  { name: 'Cócegas a mais', weight: 1 },
  { name: 'Comichão no rabo', weight: 1 },
  { name: 'Espirros aos molhos', weight: 1 },
  { name: 'Dente a abanar', weight: 1 },
  { name: 'Barriga a roncar', weight: 1 },
  { name: 'Joelho esfolado', weight: 1 },
  { name: 'Ranho verde', weight: 1 },
  { name: 'Comeu muitos doces', weight: 1 },
  { name: 'Engoliu uma mosca', weight: 1 },
  { name: 'Língua presa num gelado', weight: 1 },
  { name: 'Cabelo em pé', weight: 1 },
  { name: 'Peido preso', weight: 1 },
  { name: 'Nariz a assobiar', weight: 1 },
  { name: 'Pé a cheirar mal', weight: 1 },
  { name: 'Riso sem parar', weight: 1 },
  { name: 'Meleca no dedo', weight: 1 },
  { name: 'Ronco de dinossauro', weight: 1 },
  { name: 'Olho a piscar sozinho', weight: 1 },
  { name: 'Bebeu sumo pelo nariz', weight: 1 }
];

// Cada doente tem apenas UMA queixa (para simplificar).
export function generateQueixas() {
  return [CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)].name];
}

// Exames complementares (pedidos pelo médico, feitos pelo TAD)
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
  if (!ex) return 'Normal';
  return ex.results[Math.floor(Math.random() * ex.results.length)];
}

// Sugere a cor da pulseira a partir das queixas (usado pelo CPU)
export function suggestTriageColor(queixas) {
  const weights = queixas.map(
    (q) => CONDITIONS.find((c) => c.name === q)?.weight || 1
  );
  const max = Math.max(1, ...weights);
  if (max >= 3) return 'vermelha';
  if (max === 2) return Math.random() > 0.5 ? 'laranja' : 'amarela';
  return 'verde';
}

// Saúde inicial consoante a pulseira (mais grave = mais baixa)
export const HEALTH_BY_COLOR = {
  verde: 75,
  amarela: 60,
  laranja: 45,
  vermelha: 30
};

export function generatePatientName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

export function generateSymptom() {
  return symptomsPool[Math.floor(Math.random() * symptomsPool.length)];
}

export function generatePatient() {
  return {
    name: generatePatientName(),
    age: Math.floor(Math.random() * 97) + 3, // 3–99 anos
    symptoms: generateQueixas()
  };
}
