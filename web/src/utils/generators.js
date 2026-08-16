import diagnoses from '../data/diagnoses.json';

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

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Gera um doente que "chega" à receção — a secretária vai transcrevê-lo.
export function generateArrival() {
  return {
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    age: Math.floor(Math.random() * 13) + 3, // 3–15 anos
    symptom: pick(diagnoses),
    urgency: Math.random() > 0.85 ? 'urgent' : 'normal'
  };
}
