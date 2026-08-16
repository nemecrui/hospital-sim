# 🏥 Hospital Simulador — Documento de Design

Jogo/simulador de hospital para crianças (filhas do Rui, 11 e 6 anos). As crianças
escolhem um papel — **Secretária**, **Médica** ou **Enfermeira** — e seguem um fluxo
de trabalho estruturado, com dados a preencher, decisões a tomar e feedback imediato,
desde a entrada do doente até à alta.

Este documento reúne todo o brainstorm e as decisões tomadas na conversa inicial,
para servir de fio condutor ao desenvolvimento.

---

## 1. Decisões já tomadas

| Dimensão | Decisão |
|----------|---------|
| **Scope temporal** | MVP de **1 semana** |
| **Multiplayer** | **Sim** — duas crianças, em **dispositivos diferentes**, a jogar em simultâneo |
| **Persistência** | **Guardar histórico** de doentes tratados |
| **Complexidade médica** | **Simplificada / lúdica** (educativa, não realista) |
| **Tema gráfico** | **Cartoon** |
| **Sincronização** | **Polling** (a cada ~2 s) em vez de WebSocket, por ser mais rápido de implementar |
| **Deploy / stack** | **Railway** (full-stack) — para permitir multiplayer real entre dispositivos |

> A escolha de Railway (em vez de Vercel + localStorage) foi motivada pelo cenário
> preferido: **as duas filhas a jogar em dispositivos diferentes**, com estado
> sincronizado e histórico permanente no servidor.

---

## 2. Conceito-chave

Um simulador de hospital interativo onde cada criança escolhe um papel e segue o
respetivo fluxo de trabalho. O doente percorre um pipeline de estados:

```
waiting → consulting → treating → discharged
(à espera)  (em consulta) (em tratamento) (alta)
```

---

## 3. Papéis e fluxos

### 👩‍💼 Secretária (Receção)
- Acolhe os doentes que chegam.
- Preenche a ficha de entrada: nome, idade, morada, contacto, razão da consulta.
- Marca a prioridade (urgente / normal) com base nos sintomas.
- Vê a fila de espera a atualizar-se.
- Feedback: *"Doente registado com sucesso!"*

### 👨‍⚕️ Médica / Médico
- Vê a lista de doentes à espera.
- Clica no doente para abrir a consulta.
- Faz perguntas estruturadas (duração dos sintomas, medicações, alergias).
- Examina: temperatura, garganta, auscultação (com ícones/animações).
- Decide o diagnóstico (gripe, constipação, ferimento, etc.).
- Prescreve medicação ou encaminha para exames.
- Dá alta ou marca follow-up.

### 👩‍⚕️ Enfermeira
- Faz triagem: sinais vitais (temperatura, pressão, frequência cardíaca).
- Administra medicação conforme a prescrição do médico.
- Faz curativos / pensos.
- Regista observações pós-consulta.
- Verifica se o doente está pronto para alta.

---

## 4. Mecânicas

### Progressão
- ⏰ **Tempo real**: relógio de hospital (passa mais rápido).
- 📊 **KPIs visíveis**: nº de doentes atendidos, tempo médio de espera, taxa de satisfação.
- ⭐ **Avaliações dos doentes**: feedback positivo/negativo ("Gostei do atendimento").

### Surpresas e desafios
- Às vezes um doente é mais grave (febre alta, dor intensa) → precisa de prioridade.
- Um doente fica impaciente se esperar muito.
- Medicação pode ter efeitos secundários (educativo).
- Sistema de inventário: medicamentos, pensos, seringas (recursos gastam-se).

### Modos de jogo
- **Modo Livre**: geração aleatória de doentes.
- **Cenários temáticos**: "Dia de Gripes", "Acidente Desportivo", "Dia Caótico".

---

## 5. Extras educativos

- 🌡️ **Sinais vitais**: temperatura, pressão, respiração (com ranges normais).
- 💊 **Medicações reais simplificadas**: paracetamol, antibióticos, anti-inflamatórios.
- 🏥 **Diagnósticos comuns**: gripe, constipação, apendicite, fratura.
- 📚 **Dicas no jogo**: *"Sabias que a temperatura normal é 37 °C?"*

---

## 6. Stack técnico (final)

**Frontend**
- React (Vite)
- Tailwind CSS
- Animações simples (ex.: Framer Motion) para feedback visual
- Zustand ou Context para estado
- Polling via `fetch` (hook `usePoll`)

**Backend**
- Fastify
- Prisma + PostgreSQL (persistência)
- Deploy no Railway

**Sincronização**: Polling (~2 s). WebSocket (Socket.io) fica como evolução futura.

---

## 7. Estrutura de ficheiros

```
hospital-sim/
├── src/                        # Backend (Fastify)
│   ├── server.js               # Entry point
│   ├── db/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── routes/
│   │   ├── sessions.js
│   │   ├── patients.js
│   │   └── stats.js
│   ├── middleware/
│   │   └── cors.js
│   └── utils/
│       └── generators.js       # Doentes aleatórios
├── web/                        # Frontend (React/Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/
│   │   │   └── HospitalContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Secretaria.jsx
│   │   │   ├── Medica.jsx
│   │   │   ├── Enfermeira.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   ├── PatientCard.jsx
│   │   │   ├── PatientForm.jsx
│   │   │   ├── VitalsForm.jsx
│   │   │   └── Loader.jsx
│   │   ├── hooks/
│   │   │   └── usePoll.js
│   │   └── styles/
│   │       └── index.css
│   └── index.html
├── .env.example
├── package.json
├── Railway.toml
└── README.md
```

---

## 8. Modelo de dados (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Session {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  patients  Patient[]
  stats     Stats?

  @@index([createdAt])
}

model Patient {
  id        String    @id @default(cuid())
  sessionId String
  session   Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  // Info básica
  name      String
  age       Int
  symptoms  String    // JSON stringified array
  urgency   String    @default("normal") // "normal" | "urgent"

  // Workflow status
  status    String    @default("waiting") // waiting | consulting | treating | discharged

  // Quem está a atender (multiplayer)
  assignedTo String?  // playerId (criança 1 ou 2)

  // Dados clínicos
  temp      Float?
  hr        Int?
  bp        String?
  diagnosis String?
  medicine  String?   // JSON stringified array
  notes     String?
  rating    Int?      // 1-5

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([sessionId])
  @@index([status])
  @@index([urgency])
}

model Stats {
  id            String  @id @default(cuid())
  sessionId     String  @unique
  session       Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  totalTreated  Int     @default(0)
  avgWaitTime   Float   @default(0)
  satisfaction  Float   @default(0)

  @@index([sessionId])
}
```

---

## 9. API — Endpoints (Fastify)

| Método | Rota | Papel / Ação |
|--------|------|--------------|
| `POST` | `/api/sessions` | Criar nova sessão (inicia jogo) |
| `GET` | `/api/sessions/:id` | Obter sessão (doentes ordenados por urgência) |
| `POST` | `/api/sessions/:id/reset` | Resetar sessão (novo dia; guarda stats antigas) |
| `POST` | `/api/patients` | **Secretária** — registar doente |
| `GET` | `/api/patients?sessionId=xxx` | Listar doentes (ambas veem) |
| `PATCH` | `/api/patients/:id/consult` | **Médica** — começar consulta (regista vitais) |
| `PATCH` | `/api/patients/:id/prescribe` | **Médica** — diagnóstico + prescrição |
| `PATCH` | `/api/patients/:id/treat` | **Enfermeira** — tratar + alta + rating |
| `DELETE` | `/api/patients/:id` | Apagar doente (só dev) |
| `GET` | `/api/stats/:sessionId` | Dashboard (totais, tempo médio, satisfação) |
| `GET` | `/health` | Health check |

---

## 10. Fluxo multiplayer (cenário real)

```
15:30 — Filha 1 (iPad, Secretária)   → abre app, aguarda doentes
15:31 — Filha 2 (Laptop, Médica)     → abre app, aguarda doentes
15:32 — Filha 1 regista "João"       → POST /api/patients (status: waiting)
15:32 — Filha 2 vê João na fila      → clica "Atender"
        Servidor: João.status = consulting, assignedTo = child2
15:32 — Filha 1 vê "João em consulta com a Médica" (não pode agir)
15:35 — Filha 2 prescreve → trata → alta
15:35 — Ambas veem o histórico atualizado
```

A sincronização faz-se por **polling** a cada ~2 s (`GET /api/patients`).

---

## 11. UI — Mockups por ecrã

### Seleção de papel
```
🏥 HOSPITAL SIMULADOR
Qual é o teu nome? [__________]
[👩‍💼 Secretária]  [👨‍⚕️ Médica]  [👩‍⚕️ Enfermeira]  [📊 Dashboard]
```

### Secretária
```
👩‍💼 SECRETÁRIA — RECEÇÃO
📝 NOVO DOENTE
  Nome:     [_____________]
  Idade:    [___]
  Sintoma:  [Constipação ▼]
  Urgência: ⭕ Normal  ⭕ Urgente
  [✓ REGISTAR]

📋 FILA DE ESPERA (3)
  ├─ João Silva (Constipação)
  ├─ Maria Santos (Dor de cabeça)
  └─ Pedro (URGENTE — Febre) 🔴
```

### Médica
```
👨‍⚕️ CONSULTA — João Silva
🏥 VITAIS (pela Enfermeira)
  🌡️ Temp: 38.5 °C (FEBRE!)   ❤️ Pulsação: 92 bpm
🔍 EXAME
  ☐ Garganta vermelha   ☑ Tosse   ☐ Dificuldade respiratória
💊 DIAGNÓSTICO  [Gripe ▼]
💉 PRESCRIÇÃO   ☑ Paracetamol 500 mg × 3/dia   ☑ Repouso
  [✓ PRESCREVER]  [↩ Voltar]
```

### Enfermeira
```
👩‍⚕️ TRATAMENTO — João Silva
💊 MEDICAÇÃO PRESCRITA
  ├─ Paracetamol 500 mg   Doses: [👆 0 / 3 👇]  [Dar Medicação]
  └─ Repouso [✓ Concluído]
📝 OBSERVAÇÕES  [Doente melhorou significativamente___]
🎯 RESULTADO   ⭐⭐⭐⭐⭐ Doente satisfeito!
  [✓ ALTA]  [⚠ Internamento]
```

### Dashboard
```
📈 RESUMO DO DIA
  Doentes Atendidos: 12
  Tempo Médio Espera: 8 min
  Taxa Satisfação: ⭐⭐⭐⭐⭐ 4.8
📋 HISTÓRICO
  ✓ João Silva — Gripe (Child1 → Child2)
  ✓ Maria Santos — Constipação
  ✗ Pedro — Encaminhado Urgência
  [📥 Importar Jogo Anterior]  [🔄 Novo Dia]
```

---

## 12. Estilo cartoon

Paleta e componentes (Tailwind + emoji + CSS):

```css
:root {
  --primary: #FF6B9D;   /* Rosa Hospital */
  --success: #00D9FF;   /* Azul Ciano */
  --warning: #FFD93D;   /* Amarelo Alerta */
  --danger:  #FF6B6B;   /* Vermelho Urgência */
  --bg:      #FFF9E6;   /* Bege Quente */
}

.btn {
  border-radius: 20px;
  font-weight: bold;
  transition: transform 0.1s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.btn:active { transform: scale(0.95); }

.card {
  border-radius: 15px;
  border: 3px solid rgba(0,0,0,0.1);
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
}

@keyframes bounce-in {
  0%   { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes pulse-success {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.1); }
}
```

**Sons** (Web Audio API ou MP3 simples): `success` (ding), `error`, `complete` (fanfarra).

---

## 13. Dados iniciais (JSON)

**patients.json**
```json
[
  { "id": 1, "name": "João Silva", "age": 8, "symptoms": ["tosse", "nariz entupido"], "defaultDiagnosis": "constipação" },
  { "id": 2, "name": "Maria Santos", "age": 7, "symptoms": ["dor de cabeça", "febre"], "defaultDiagnosis": "gripe" }
]
```

**medicines.json**
```json
[
  { "name": "Paracetamol", "dose": "500mg", "frequency": "3x/dia" },
  { "name": "Antibiótico", "dose": "1x/dia", "frequency": "7 dias" },
  { "name": "Repouso", "duration": "2 dias" }
]
```

Gerador procedural (`generators.js`): nomes e apelidos portugueses, lista de sintomas,
idade aleatória (5–65), 20 % de probabilidade de urgência.

---

## 14. Plano de 1 semana (com backend)

**Dia 1–2 — Backend Setup**
- [ ] Fastify + Prisma + PostgreSQL (Railway)
- [ ] Endpoints base (`POST /patients`, `GET /patients`)
- [ ] Modelo Prisma (Session, Patient, Stats)

**Dia 3 — Real-time**
- [ ] Polling implementado (hook `usePoll`, ~2 s)

**Dia 4–5 — Frontend multiplayer**
- [ ] React Context + fetch
- [ ] Ecrãs Secretária + Médica sincronizados
- [ ] Indicadores "Em atendimento por X"

**Dia 6 — Terceiro papel + Stats**
- [ ] Enfermeira
- [ ] Dashboard / histórico
- [ ] Estatísticas persistentes

**Dia 7 — Polish + Deploy**
- [ ] Testes com as filhas (dispositivos reais)
- [ ] Deploy Railway
- [ ] Animações / sons / tema cartoon

---

## 15. Comandos para começar

```bash
# Frontend
npm create vite@latest hospital-sim -- --template react
cd hospital-sim
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev

# Deploy (Railway)
npm install -g @railway/cli
railway login
railway up
railway logs
```

---

## 16. Questões em aberto

- **Quantos doentes na fila por sessão?** (sugestão inicial: 3–5)
- **Trocar de papel a meio do jogo** ou papel fixo por sessão?
- **Som ligado por defeito?** (pode ser barulhento)
- **Importar jogo anterior** — retomar sessão via `GET /api/sessions/last`?

---

## 17. Snippets de referência

> Guardados como ponto de partida para o desenvolvimento. Ver a conversa original para
> o corpo completo de `server.js`, das rotas e dos componentes React.

### `usePoll.js`
```javascript
import { useEffect, useRef } from 'react';

export function usePoll(callback, interval = 2000) {
  const intervalRef = useRef(null);
  useEffect(() => {
    callback();                         // poll imediato
    intervalRef.current = setInterval(callback, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [callback, interval]);
}
```

### Estado global (forma simplificada)
```javascript
{
  currentPlayer: "child1" | "child2",
  role: "secretary" | "doctor" | "nurse",
  patients: [{
    id, name, age, reason,
    status: "waiting" | "in-consultation" | "in-treatment" | "discharged",
    symptoms: { cough, fever, ... },
    vitals: { temp, hr, bp },
    diagnosis, prescription,
    treatedBy: { doctor, nurse },
    rating, timestamp
  }],
  stats: { totalTreated, avgWaitTime, satisfaction, history: [] }
}
```

---

## 18. Jogadoras e CPU (implementado)

No arranque de cada sessão escolhe-se **quantas jogadoras** (1 ou 2) e **que papéis**
elas fazem. Os papéis que sobram são geridos automaticamente pelo **CPU**, que corre
no servidor (fonte única da verdade) e faz avançar os doentes:

- **Secretária‑CPU**: gera doentes novos e mantém a fila com até 3 à espera.
- **Médica‑CPU**: após alguns segundos, passa cada doente de `waiting` → `treating`,
  atribuindo vitais, diagnóstico e medicação.
- **Enfermeira‑CPU**: passa cada doente de `treating` → `discharged`, com nota e rating.

Guardado na `Session`: `players` (Int) e `humanRoles` (JSON array). O CPU trata de
`ALL_ROLES − humanRoles`. Endpoint: `PATCH /api/sessions/:id/config`.
Loop no servidor: `src/cpu.js`, a cada 3 s.

## 19. Secretária interativa (implementado)

Em vez de inventar doentes, agora **os doentes chegam e "falam"**: aparece um balão
com *«Olá! Chamo‑me João Silva, tenho 8 anos e vim por causa de Gripe.»* e a criança
tem de **transcrever** o nome, a idade e o motivo para a ficha de entrada. Ao registar,
recebe feedback educativo (⭐ por cada campo certo; mostra a resposta certa se falhar) e
chega o doente seguinte. As chegadas são geradas no cliente (`web/src/utils/generators.js`).

---

*Documento gerado a partir do brainstorm inicial "Jogo de simulação hospitalar para crianças".*
