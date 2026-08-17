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
  { name: 'Comeu muitos doces', weight: 1 }
];

export function generateQueixas() {
  const count = Math.random() > 0.5 ? 2 : 1;
  const chosen = new Set();
  while (chosen.size < count) {
    chosen.add(CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)].name);
  }
  return [...chosen];
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
