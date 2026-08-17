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

const avatars = ['🧒', '👦', '👧', '🧑', '👶', '👵', '👴', '👩', '👨'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Doente que chega à receção: a secretária só transcreve nome + idade.
export function generateArrival() {
  return {
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    age: Math.floor(Math.random() * 12) + 3, // 3–14 anos
    avatar: pick(avatars)
  };
}
