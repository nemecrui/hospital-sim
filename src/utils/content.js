// Pacotes de conteúdo por modo: "hospital" (pessoas) e "vet" (animais).
// O motor do jogo é igual; só muda este conteúdo.

const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* ----------------------------- HOSPITAL ----------------------------- */
const HOSPITAL = {
  title: 'Hospital dos Amiguinhos',
  noun: 'doente',
  roles: { secretaria: 'Secretária', medica: 'Médica', enfermeira: 'Enfermeira', tad: 'Técnico (TAS)' },

  conditions: [
    { name: 'Febre', weight: 2 }, { name: 'Tosse', weight: 1 }, { name: 'Dor de cabeça', weight: 1 },
    { name: 'Dor de barriga', weight: 2 }, { name: 'Dor de garganta', weight: 1 }, { name: 'Ferimento', weight: 2 },
    { name: 'Constipação', weight: 1 }, { name: 'Dor no ouvido', weight: 1 }, { name: 'Alergia', weight: 2 },
    { name: 'Tornozelo torcido', weight: 2 }, { name: 'Picada de inseto', weight: 1 }, { name: 'Enjoo', weight: 1 },
    { name: 'Caiu e magoou-se', weight: 3 },
    { name: 'Soluços sem parar', weight: 1 }, { name: 'Cócegas a mais', weight: 1 }, { name: 'Comichão no rabo', weight: 1 },
    { name: 'Espirros aos molhos', weight: 1 }, { name: 'Dente a abanar', weight: 1 }, { name: 'Barriga a roncar', weight: 1 },
    { name: 'Joelho esfolado', weight: 1 }, { name: 'Ranho verde', weight: 1 }, { name: 'Comeu muitos doces', weight: 1 },
    { name: 'Engoliu uma mosca', weight: 1 }, { name: 'Cabelo em pé', weight: 1 }, { name: 'Peido preso', weight: 1 }
  ],

  scenarios: {
    normal: { name: 'Dia normal', emoji: '🏥', prefer: null },
    gripes: { name: 'Dia de Gripes', emoji: '🤧', prefer: ['Febre', 'Tosse', 'Constipação', 'Dor de garganta', 'Ranho verde', 'Espirros aos molhos'] },
    parque: { name: 'Dia do Parque', emoji: '🛝', prefer: ['Joelho esfolado', 'Caiu e magoou-se', 'Tornozelo torcido', 'Ferimento', 'Picada de inseto'] },
    festa: { name: 'Festa de anos', emoji: '🎂', prefer: ['Dor de barriga', 'Comeu muitos doces', 'Enjoo', 'Barriga a roncar'] }
  },
  scenarioIds: ['gripes', 'parque', 'festa'],

  diseaseGoals: ['Gripe', 'Constipação', 'Febre', 'Alergia', 'Ferida', 'Osso partido', 'Amigdalite', 'Gastroenterite', 'Otite'],
  cpuDiagnoses: ['Gripe', 'Constipação', 'Amigdalite', 'Otite', 'Gastroenterite', 'Alergia', 'Ferida', 'Entorse', 'Enxaqueca', 'Febre', 'Osso partido'],
  cpuMeds: [
    { name: 'Paracetamol', emoji: '💊', type: 'med', total: 3 },
    { name: 'Xarope', emoji: '🥄', type: 'med', total: 3 },
    { name: 'Anti-alérgico', emoji: '💊', type: 'med', total: 2 },
    { name: 'Penso', emoji: '🩹', type: 'curativo', total: 1 },
    { name: 'Gesso', emoji: '🦴', type: 'curativo', total: 1 },
    { name: 'Repouso', emoji: '😴', type: 'med', total: 1 },
    { name: 'Chá quentinho', emoji: '🍵', type: 'med', total: 2 }
  ],

  makeName() {
    const first = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Sofia', 'Miguel', 'Inês', 'Rui', 'Joana', 'Tiago', 'Marta', 'Diogo', 'Beatriz', 'André', 'Leonor', 'Francisco', 'Matilde'];
    const last = ['Silva', 'Santos', 'Oliveira', 'Ferreira', 'Gomes', 'Costa', 'Martins', 'Neves', 'Ribeiro', 'Rocha', 'Carvalho', 'Sousa'];
    return `${pick(first)} ${pick(last)}`;
  },
  makeAge: () => Math.floor(Math.random() * 97) + 3,

  // Amigos do costume — voltam de vez em quando (com queixas novas)
  friends: [
    { name: 'Zé Piloto', age: 8 },
    { name: 'Mimi Bailarina', age: 6 },
    { name: 'Tó Comilão', age: 9 },
    { name: 'Vó Rosa', age: 71 },
    { name: 'Nuno Trapalhão', age: 7 },
    { name: 'Lena Saltitona', age: 5 }
  ],

  emergencySymptoms: ['Caiu e magoou-se', 'Tornozelo torcido', 'Ferimento'],
  emergencyStories: [
    'Chegou de ambulância 🚑 depois de uma queda feia no parque!',
    'Veio a toda a pressa de ambulância 🚑 — caiu da bicicleta!',
    'A ambulância 🚑 trouxe-o depois de um grande trambolhão!'
  ],

  story: {
    when: ['Esta manhã', 'Ontem à noite', 'Há dois dias', 'No fim de semana', 'Antes de dormir', 'Na hora do recreio', 'Depois do jantar'],
    ondeByAge: {
      crianca: ['no parque', 'no recreio', 'na aula de ginástica', 'a ver desenhos animados', 'na piscina', 'a andar de bicicleta'],
      jovem: ['na escola', 'no treino de futebol', 'com os amigos', 'no skate', 'na aula de dança'],
      adulto: ['no trabalho', 'no ginásio', 'a cozinhar', 'no jardim', 'às compras'],
      idoso: ['no jardim', 'a passear', 'em casa dos netos', 'no café', 'a tratar da horta']
    },
    extrasByAge: {
      crianca: ['Agora não para quieto!', 'Trouxe o peluche favorito.', 'Chorou só um bocadinho.', 'Quer um autocolante.'],
      jovem: ['Diz que está tudo bem, mas veio.', 'Não largou o telemóvel na espera.', 'Ficou envergonhado.'],
      adulto: ['Veio no intervalo do almoço.', 'Tem pressa de voltar ao trabalho.', 'A família insistiu para vir.'],
      idoso: ['Veio de bengala e bom humor.', 'Contou três histórias na sala de espera.', 'Diz que já viu pior.']
    },
    events: {
      Febre: ['ficou quentinho como uma torradeira', 'ganhou bochechas cor de tomate'],
      Tosse: ['começou a tossir como uma foca', 'apanhou uma tossezinha teimosa'],
      'Caiu e magoou-se': ['escorregou numa poça', 'tropeçou nos próprios atacadores'],
      'Comeu muitos doces': ['exagerou nas gomas', 'encontrou o frasco das bolachas'],
      'Comichão no rabo': ['sentou-se num formigueiro', 'a etiqueta das cuecas faz cócegas']
    },
    generic: ['começou a sentir-se um bocadinho estranho', 'acordou assim e veio ver o médico', 'não está nos seus dias']
  }
};

/* ------------------------------- VET -------------------------------- */
const SPECIES = [
  { s: 'cão', e: '🐶' }, { s: 'gato', e: '🐱' }, { s: 'coelho', e: '🐰' }, { s: 'hamster', e: '🐹' },
  { s: 'pássaro', e: '🐦' }, { s: 'tartaruga', e: '🐢' }, { s: 'cão', e: '🐕' }, { s: 'gato', e: '🐈' }, { s: 'peixinho', e: '🐟' }
];
const PET_NAMES = ['Bobi', 'Mia', 'Pipoca', 'Rex', 'Nina', 'Simba', 'Luna', 'Max', 'Bolinha', 'Fofa', 'Tobias', 'Kiko', 'Mel', 'Zeca', 'Farrusco', 'Pantufa', 'Bidu', 'Fred', 'Laika', 'Pulga'];

const VET = {
  title: 'Clínica dos Bichinhos',
  noun: 'animal',
  roles: { secretaria: 'Rececionista', medica: 'Veterinária', enfermeira: 'Enfermeira', tad: 'Técnico (TAS)' },

  conditions: [
    { name: 'Pulgas', weight: 1 }, { name: 'Bola de pelo', weight: 1 }, { name: 'Pata magoada', weight: 2 },
    { name: 'Orelha suja', weight: 1 }, { name: 'Comeu algo estranho', weight: 2 }, { name: 'Não quer comer', weight: 2 },
    { name: 'Unhas grandes', weight: 1 }, { name: 'Pelo emaranhado', weight: 1 }, { name: 'Espirros', weight: 1 },
    { name: 'Barriga inchada', weight: 2 }, { name: 'Coceira', weight: 1 }, { name: 'Dente partido', weight: 1 },
    { name: 'Carraça', weight: 1 }, { name: 'Ferida na pata', weight: 2 }, { name: 'Muito ranhoso', weight: 1 },
    { name: 'Perdeu o miado', weight: 1 }, { name: 'Late demais', weight: 1 }, { name: 'Comeu um brinquedo', weight: 2 },
    { name: 'Cansado e tristonho', weight: 1 }, { name: 'Cheira mal', weight: 1 }
  ],

  scenarios: {
    normal: { name: 'Dia normal', emoji: '🏥', prefer: null },
    banhos: { name: 'Dia de Banhos', emoji: '🛁', prefer: ['Pelo emaranhado', 'Cheira mal', 'Bola de pelo', 'Coceira'] },
    vacinas: { name: 'Dia de Vacinas', emoji: '💉', prefer: ['Espirros', 'Cansado e tristonho', 'Não quer comer'] },
    parque: { name: 'Dia no Parque', emoji: '🌳', prefer: ['Pata magoada', 'Carraça', 'Ferida na pata', 'Pulgas'] }
  },
  scenarioIds: ['banhos', 'vacinas', 'parque'],

  diseaseGoals: ['Pulgas', 'Pata partida', 'Otite', 'Ferida', 'Carraças', 'Alergia'],
  cpuDiagnoses: ['Pulgas', 'Bola de pelo', 'Pata partida', 'Otite', 'Barriga estragada', 'Alergia', 'Ferida', 'Dente estragado', 'Cansaço', 'Carraças'],
  cpuMeds: [
    { name: 'Banho', emoji: '🛁', type: 'curativo', total: 1 },
    { name: 'Vacina', emoji: '💉', type: 'med', total: 1 },
    { name: 'Desparasitante', emoji: '💊', type: 'med', total: 2 },
    { name: 'Cortar unhas', emoji: '💅', type: 'nails', total: 1 },
    { name: 'Penso', emoji: '🩹', type: 'curativo', total: 1 },
    { name: 'Comida especial', emoji: '🥫', type: 'med', total: 2 },
    { name: 'Festinhas', emoji: '🤗', type: 'med', total: 2 }
  ],

  makeName() {
    const sp = pick(SPECIES);
    return `${sp.e} ${pick(PET_NAMES)}`;
  },
  makeAge: () => Math.floor(Math.random() * 15) + 1,

  // Bichinhos do costume — voltam de vez em quando (com queixas novas)
  friends: [
    { name: '🐶 Bobi', age: 4 },
    { name: '🐱 Mia', age: 3 },
    { name: '🐰 Pipoca', age: 2 },
    { name: '🐹 Kiko', age: 1 },
    { name: '🐦 Piu', age: 1 },
    { name: '🐢 Zeca', age: 8 }
  ],

  emergencySymptoms: ['Pata magoada', 'Comeu algo estranho', 'Ferida na pata'],
  emergencyStories: [
    'Chegou a correr na carrinha 🚑 — magoou a pata a saltar!',
    'O dono trouxe-o a toda a pressa 🚑 — comeu uma coisa estranha!',
    'Veio de urgência 🚑 depois de uma queda no parque!'
  ],

  story: {
    when: ['Esta manhã', 'Ontem', 'Há dois dias', 'No fim de semana', 'Depois do passeio', 'À hora da comida'],
    onde: ['no jardim', 'no parque', 'em casa', 'no quintal', 'no passeio', 'na areia', 'no sofá', 'no tapete'],
    extras: ['O dono está preocupado.', 'Abanou o rabo mesmo assim!', 'Ronronou na sala de espera.', 'Trouxe o brinquedo favorito.', 'Portou-se muito bem.', 'Deu uma lambidela ao veterinário.'],
    events: {
      Pulgas: ['começou a coçar-se sem parar', 'trouxe uns amiguinhos saltitões'],
      'Pata magoada': ['pisou uma pedra pontiaguda', 'saltou de um sítio alto'],
      'Comeu algo estranho': ['roubou comida do lixo', 'engoliu qualquer coisa à socapa'],
      Carraça: ['apanhou uma carraça na relva', 'andou pelo mato'],
      'Bola de pelo': ['lambeu-se demais', 'engoliu muito pelo']
    },
    generic: ['não está nos seus dias', 'anda tristonho e veio ver o veterinário', 'o dono achou-o esquisito']
  }
};

const PACKS = { hospital: HOSPITAL, vet: VET };
export function pack(mode) {
  return PACKS[mode] || HOSPITAL;
}
