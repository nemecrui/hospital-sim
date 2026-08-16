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

export function generatePatientName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

export function generateSymptom() {
  return symptomsPool[Math.floor(Math.random() * symptomsPool.length)];
}

export function generatePatient() {
  const count = Math.floor(Math.random() * 3) + 1;
  const chosen = new Set();
  while (chosen.size < count) {
    chosen.add(generateSymptom());
  }

  return {
    name: generatePatientName(),
    age: Math.floor(Math.random() * 60) + 5,
    symptoms: [...chosen],
    urgency: Math.random() > 0.8 ? 'urgent' : 'normal'
  };
}
