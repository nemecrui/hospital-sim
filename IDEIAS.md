# 💡 Hospital Simulador — Caderno de Ideias

Lista viva de melhorias, para avançar aos poucos.
Estado: ✅ feito · 🚧 em curso · ⬜ por fazer

---

## ✅ Já feito
- ✅ **Caderneta de autocolantes** — cada doente curado dá um autocolante para colecionar.
- ✅ **Sumo visual/sonoro** — confetti na alta e ao atingir a meta, animações pop/wiggle.
- ✅ **Objetivo comum do dia** — meta partilhada com barra no topo de todos os ecrãs.
- ✅ **Ambulância / urgências** — casos 🚑 que saltam a fila, com som e destaque.
- ✅ **Sala de espera com humor** — carinhas que mudam com o tempo de espera.
- ✅ **Cenários temáticos** — temas que rodam sozinhos, alternando com dias normais.
- ✅ **Objetivos automáticos** — meta aleatória (contar doentes ou curar uma doença), encadeada.
- ✅ **Histórias por idade** — historinhas adaptadas à idade do doente.
- ✅ **Feedback educativo suave** — dicas (pulseira vs febre, queixa → diagnóstico), "Sabias que…?" e "🌟 diagnóstico certeiro" na alta.
- ✅ **Tema de hospital** — banner com relógio e fundo de cruzinhas.
- ✅ **Sons e musiquinha** — música de fundo ligável/desligável.
- ✅ **Vida das personagens** — feitios + balões de fala, caras que reagem ao estado, entradas em cena e festa ao curar, voz por idade e sons de animais, personagens recorrentes ("amigos do costume") e um mascote 🧸 que dá as boas-vindas e festeja as curas.
- ✅ **Modo Hospital / Veterinário** — dois jogos na mesma base, escolhidos no ecrã inicial.
- ✅ **Corpo completo dos doentes** — boneco por problema (gesso, febre, borbulhas, nariz vermelho, dor de cabeça…), com variedade de pele/cabelo/roupa e o gesso/penso em partes diferentes do corpo.
- ✅ **Exames ligados ao problema** — raio-X, ECG, ecografia, TAC/RM, audiograma e análises de sangue/urina combinam com a queixa; reações por personalidade e som de xixi/choro.
- ✅ **Ver garganta e ouvido com imagem** — mini-exame visual (vermelho/inflamado conforme o problema).
- ✅ **Instalar como app (PWA)** — aviso inteligente no arranque (botão nativo no Android, instruções no iOS) + link "📲 Instalar app" no rodapé.
- ✅ **Painel de estatísticas** — visitas, jogos, curas e instalações (anónimo), com gráfico por dia, no painel de admin.
- ✅ **Limpeza automática** — sessões inativas apagadas sozinhas ao fim de 48h.
- ✅ **Caras a condizer** — o boneco/avatar combina com a idade (bebé, criança, adulto, idoso) e o género (pelo nome).
- ✅ **Doenças malucas novas** — picada de abelha 🐝 / mosquito 🦟, mau hálito 😮‍💨, gases tóxicos 💨, unha encravada 💅, verruga de bruxa 🧙, língua comprida 👅 (com operação para cortar!), cabeça de melão 🍈, caiu o cabelo 🧑‍🦲 e corno de unicórnio 🦄 — cada uma com o seu desenho no corpo e tratamentos próprios.

## 🚧 Em curso agora
- 🚧 **Vozes por clip (pré-geradas)** — sistema pronto no jogo (toca clip por personagem, com recurso à voz do browser); falta **gerar os áudios** uma vez no PC (`node scripts/gen-voices.mjs`, Google TTS grátis) e fazer push.

---

## 🆕 Brainstorm novo (set/2026)

### Doentes malucos e mascote
- ✅ **Doentes especiais** — 🦖 dinossauro, 🤖 robô, 👽 extraterrestre, 🦄 unicórnio, dragão, fantasma, sereia, boneco de neve, palhaço… com queixas absurdas (robô sem pilhas, dragão com soluços de fogo, unicórnio sem brilho). Aparecem ~18% das vezes, como carinha grande. **Com interruptor ligar/desligar** no ecrã de "Quem vai jogar?" (ligados por defeito).
- ✅ **Dar nome ao mascote** — as miúdas tocam no ✏️ e dão um nome ao 🧸; ele passa a apresentar-se por esse nome (guardado no tablet).

### Mini-jogos novos
- ✅ **Sala de operações** (estilo "Operation") — a **médica** arrasta o objeto engolido (moeda, pipoca, chave, anel…) até ao tabuleiro sem tocar nas paredes (dá estrelas conforme os toques); depois passa à **enfermeira**, que **cose os pontos** e **põe o penso**. O botão "🔪 Operar" aparece na consulta para casos de barriga / engoliu um objeto.
- ✅ **Farmácia** — a **enfermeira** prepara o medicamento antes de o dar: **contar os comprimidos** de cada tipo (cores e tamanhos diferentes) 💊, **medir o xarope** 🥄 até à linha, e **misturar cores** 🎨 para fazer o xarope da cor certa (azul+amarelo=verde, etc.).
- ⬜ **Mini-jogo da ambulância** — conduzir a ambulância até ao hospital a desviar de obstáculos.

### Mundo mais vivo
- ✅ **Sala de espera visível** — os bonecos sentados no banco, a baloiçar as pernas e a ficarem impacientes com o tempo (carinha muda: 🙂 → 😐 → 😟 → 😠/😴).
- ⬜ **Ambulância a chegar em cena** — com sirene, "larga" o doente na receção (urgências mais teatrais).
- ⬜ **Dia e noite** — o relógio do hospital muda a luz do fundo (manhã → tarde → noite).

### Recompensas e personalização
- ⬜ **Lojinha com moedas** — ganhar moedas ao curar e gastar a decorar o hospital (paredes, peluches, batas) ou a vestir a personagem.
- ⬜ **Medalhas por função** — "Mestre da Triagem", "Doutora Simpatia", "Rei do Raio-X".
- ⬜ **Diploma do dia** — com o nome delas e as estatísticas, para guardar/imprimir.

### Festivo e sazonal
- ✅ **Temas do hospital** — Natal 🎄, praia 🏖️, Halloween 🎃: muda as cores do banner e a decoração. **Automáticos pela data real** (Natal em dezembro, praia no verão, Halloween no fim de outubro), com opção de **forçar** um tema no painel de admin (🎨 Tema do hospital). Falta ainda trazer doentes a condizer com o tema.

### Cooperação (jogarem juntas)
- ⬜ **Mensagens rápidas entre papéis** — botões de emoji/frases ("Doente a caminho! 🏃", "Já está pronto! ✅") que aparecem no ecrã da outra.
- ⬜ **Urgência a sério** — caso grande que precisa dos vários papéis a despachar depressa, em equipa.
- ⬜ **Passar o doente com estilo** — animação de cartão a deslizar entre papéis.

### Secretária com mais que fazer (está desocupada)
- ⬜ **Pesar e medir à chegada** — balança + fita métrica (mini-interação), acrescenta dados ao cartão.
- ✅ **Chamar o próximo** em voz alta — botão 📣 que anuncia, por voz, quem espera há mais tempo (e dá-lhe destaque na sala).
- ✅ **Acalmar quem espera** — botão 🧸 que dá um miminho e reinicia a impaciência de quem está na fila.
- ⬜ **Atender o telefone** — marcações e "ambulância a caminho" (anuncia a próxima urgência).
- ⬜ **Despedida na alta** — entregar o autocolante/diploma e dizer adeus.

---

## 📝 Decisões tomadas
- **Sala de operações:** jogo de **ecrã único**. Jogável **a solo** ou **as duas no mesmo tablet** (à vez, ou cada uma com uma "mão"). Em **dispositivos separados ao mesmo tempo não dá** com o modelo atual (sincronização por polling, com atraso); a sensação de equipa faz-se por **passagem** — a médica "pede cirurgia" e aparece à enfermeira, que opera.
- **Doentes especiais:** com **interruptor ligar/desligar** (nas definições do jogo; talvez também no painel de admin).
- **Temas do hospital:** **automáticos pela data real** (Natal em dezembro, praia no verão, Halloween no fim de outubro…), com opção de **forçar** um tema manualmente.
- **Secretária:** alargar funções (pesar/medir, chamar o próximo, acalmar a fila, telefone, despedida) — ver secção acima.

## 🧒 Dificuldade por idade
- ⬜ **Modo "mais novo" vs "mais crescido"** — imagens+voz para a Sara; escrever/ler/decidir para a Inês.
- ⬜ **Mini-metas de leitura/escrita** — soletrar o nome, contar as doses.

## 🎮 Estações interativas (feito)
- ✅ Raio-X, termómetro, ECG, estetoscópio, ecografia, curativo, gesso, ver garganta/ouvido, TAC/RM, análises sangue/urina, audiograma, injeção/xarope, cortar unhas.

## 🏅 Extras
- ⬜ **Guardar o "melhor dia"** — recordes entre sessões.
- ✅ **Vozes das personagens** — por idade/espécie (e, em curso, clips pré-gerados).

---

*Feito com carinho para a Inês e a Sara.*
