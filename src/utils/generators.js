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

// ---- Histórias divertidas do doente -------------------------------------
const one = (a) => a[Math.floor(Math.random() * a.length)];

const WHEN = [
  'Esta manhã', 'Ontem à noite', 'Há dois dias', 'No fim de semana',
  'Logo depois do lanche', 'Antes de dormir', 'Durante a sesta',
  'Hoje de manhãzinha', 'Há bocadinho', 'Na hora do recreio', 'Depois do jantar'
];
const ONDE = [
  'no parque', 'na escola', 'em casa da avó', 'no recreio', 'na aula de ginástica',
  'na festa de anos do primo', 'a ver desenhos animados', 'enquanto brincava',
  'no supermercado', 'na piscina', 'a andar de bicicleta', 'no jardim', 'no sofá'
];
const EXTRAS = [
  'Agora não para quieto!', 'Está um bocadinho manhoso.',
  'Diz que já se sente melhor, mas veio na mesma.',
  'Trouxe o peluche favorito para dar coragem.', 'Chorou só um bocadinho.',
  'Está cheio de fome, isso é bom sinal!', 'Quer um autocolante de recompensa.',
  'Portou-se muito bem na sala de espera.', 'Veio de mão dada com a mãe.'
];
const GENERIC_EVENTS = [
  'começou a sentir-se um bocadinho estranho', 'acordou assim e veio ver o médico',
  'não está nos seus dias', 'ficou com um arzinho amuado'
];
const STORY_EVENTS = {
  Febre: ['ficou quentinho como uma torradeira', 'ganhou bochechas cor de tomate', 'começou a sentir muito calor de repente'],
  Tosse: ['começou a tossir como uma foca', 'engasgou-se com as próprias gargalhadas', 'apanhou uma tossezinha teimosa'],
  'Dor de cabeça': ['a cabeça começou a doer depois de tanta correria', 'fez contas de cabeça a mais e ela protestou'],
  'Dor de barriga': ['a barriga começou a fazer barulhos estranhos', 'comeu depressa demais e a barriga zangou-se'],
  'Dor de garganta': ['a garganta ficou a arranhar como lixa', 'cantou alto demais no karaoke'],
  Ferimento: ['arranhou-se a trepar a uma árvore', 'fez um "ai" ao cair de joelhos'],
  Ferida: ['arranhou-se a trepar a uma árvore', 'fez um "ai" ao cair de joelhos'],
  Constipação: ['apanhou frio sem casaco', 'espirrou tanto que assustou o gato'],
  'Dor no ouvido': ['o ouvido começou a apitar', 'meteu água no ouvido na piscina'],
  Alergia: ['ficou cheio de borbulhas a fazer festas a um gato', 'espirrou ao pé das flores'],
  'Tornozelo torcido': ['torceu o pé a saltar do baloiço', 'deu um mau jeito a correr atrás da bola'],
  'Picada de inseto': ['um mosquito atrevido deu-lhe uma dentada', 'uma abelha curiosa fez-lhe uma visita'],
  Enjoo: ['andou às voltas no carrossel', 'rodopiou até ficar tonto'],
  'Caiu e magoou-se': ['escorregou numa poça como num escorrega', 'tropeçou nos próprios atacadores'],
  'Soluços sem parar': ['bebeu o sumo rápido demais', 'riu-se com a boca cheia e ficou com soluços'],
  'Cócegas a mais': ['o irmão fez-lhe cócegas sem parar', 'não consegue deixar de rir'],
  'Comichão no rabo': ['sentou-se sem querer num formigueiro', 'a etiqueta das cuecas faz cócegas'],
  'Espirros aos molhos': ['cheirou pimenta por engano', 'fez amizade com um monte de pó'],
  'Dente a abanar': ['mordeu uma maçã e o dente disse "adeus"', 'o dente começou a bailar sozinho'],
  'Barriga a roncar': ['saltou o pequeno-almoço', 'a barriga ruge como um leão faminto'],
  'Joelho esfolado': ['deslizou no cimento a fazer de super-herói', 'caiu do trotinete'],
  'Ranho verde': ['o nariz virou uma torneira', 'gastou uma caixa inteira de lenços'],
  'Comeu muitos doces': ['exagerou nas gomas na festa', 'encontrou o frasco das bolachas escondido'],
  'Engoliu uma mosca': ['abriu a boca a rir e… zás, uma mosca', 'a mosca entrou sem pedir licença'],
  'Língua presa num gelado': ['quis lamber um gelado gelado demais', 'o gelado agarrou-lhe a língua'],
  'Cabelo em pé': ['esfregou um balão na cabeça', 'levou um susto e o cabelo espetou'],
  'Peido preso': ['comeu feijão ao almoço', 'a barriga está a fazer bolhinhas'],
  'Nariz a assobiar': ['o nariz aprendeu a assobiar sozinho', 'cada espirro sai com música'],
  'Pé a cheirar mal': ['correu o dia todo de botas', 'tirou os sapatos e toda a gente fugiu'],
  'Riso sem parar': ['ouviu uma piada e não parou mais', 'tem cócegas na barriga de tanto rir'],
  'Meleca no dedo': ['andou a explorar o nariz', 'encontrou um tesouro no nariz'],
  'Ronco de dinossauro': ['adormeceu no sofá a roncar alto', 'ronca tão alto que abana os vidros'],
  'Olho a piscar sozinho': ['o olho começou a piscar como um pisca-pisca', 'um cílio atrevido faz cócegas'],
  'Bebeu sumo pelo nariz': ['riu-se a meio de um gole', 'o sumo escolheu o caminho errado']
};

export function generateStory(symptom) {
  const events = STORY_EVENTS[symptom] || GENERIC_EVENTS;
  return `${one(WHEN)}, ${one(ONDE)}, ${one(events)}. ${one(EXTRAS)}`;
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

// Autocolantes para a caderneta (prémio por cada doente curado)
export const STICKERS = [
  { id: 'unicornio', emoji: '🦄', name: 'Unicórnio' },
  { id: 'cao', emoji: '🐶', name: 'Cão' },
  { id: 'gato', emoji: '🐱', name: 'Gato' },
  { id: 'leao', emoji: '🦁', name: 'Leão' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'raposa', emoji: '🦊', name: 'Raposa' },
  { id: 'sapo', emoji: '🐸', name: 'Sapo' },
  { id: 'tartaruga', emoji: '🐢', name: 'Tartaruga' },
  { id: 'borboleta', emoji: '🦋', name: 'Borboleta' },
  { id: 'abelha', emoji: '🐝', name: 'Abelha' },
  { id: 'arcoiris', emoji: '🌈', name: 'Arco-íris' },
  { id: 'estrela', emoji: '⭐', name: 'Estrela' },
  { id: 'foguetao', emoji: '🚀', name: 'Foguetão' },
  { id: 'gelado', emoji: '🍦', name: 'Gelado' },
  { id: 'balao', emoji: '🎈', name: 'Balão' },
  { id: 'dino', emoji: '🦖', name: 'Dino' },
  { id: 'polvo', emoji: '🐙', name: 'Polvo' },
  { id: 'pinguim', emoji: '🐧', name: 'Pinguim' },
  { id: 'coruja', emoji: '🦉', name: 'Coruja' },
  { id: 'golfinho', emoji: '🐬', name: 'Golfinho' }
];

export function randomSticker() {
  return STICKERS[Math.floor(Math.random() * STICKERS.length)];
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
  const symptoms = generateQueixas();
  return {
    name: generatePatientName(),
    age: Math.floor(Math.random() * 97) + 3, // 3–99 anos
    symptoms,
    story: generateStory(symptoms[0])
  };
}
