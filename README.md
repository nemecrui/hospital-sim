# 🏥 Hospital Simulador

Jogo/simulador de hospital para crianças. Duas crianças escolhem um papel
(**Secretária**, **Médica** ou **Enfermeira**) e, em dispositivos diferentes, seguem
o percurso de um doente desde a entrada até à alta — com sincronização em tempo real
(por polling) e histórico persistente.

Ver [`DESIGN.md`](./DESIGN.md) para o documento de design completo.

## Estrutura

```
HospitalSim/
├── src/          # Backend  — Fastify + Prisma (PostgreSQL)
│   ├── server.js
│   ├── db/         (schema.prisma, seed.js)
│   ├── routes/     (sessions.js, patients.js, stats.js)
│   └── utils/      (generators.js)
├── web/          # Frontend — React (Vite) + Tailwind
│   └── src/        (App, context, hooks, pages, components, data)
├── package.json  # Scripts do backend
└── Railway.toml
```

## Como correr localmente

### 1. Base de dados

Precisas de um PostgreSQL. A forma mais rápida com Docker:

```bash
docker run --name hospitalsim-db \
  -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=hospitalsim -p 5432:5432 -d postgres:16
```

> Estas credenciais (`user` / `password` / `hospitalsim`) batem certo com o
> `DATABASE_URL` do `.env.example`.

### 2. Backend

```bash
cp .env.example .env         # ajusta DATABASE_URL se necessário
npm install
npm run prisma:push          # cria as tabelas
npm run seed                 # (opcional) cria uma sessão de exemplo com doentes
npm run dev                  # arranca em http://localhost:3000
```

### 3. Frontend

```bash
cd web
cp .env.example .env         # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev                  # arranca em http://localhost:5173
```

Abre `http://localhost:5173`, cria uma sessão, e partilha o **código da sessão**
com o segundo dispositivo para jogarem juntas.

## Deploy (Railway, via GitHub)

Em produção corre tudo num **único serviço**: o backend Fastify serve também o
frontend já construído (`web/dist`), no mesmo domínio. Não é preciso configurar
CORS nem `VITE_API_URL` — o site usa `/api` no próprio domínio.

Passos:

1. Põe o código num repositório no GitHub.
2. Em railway.app: **New Project → Deploy from GitHub repo** e escolhe o repositório.
3. No projeto, **+ New → Database → PostgreSQL**.
4. No serviço da app, em **Variables**, liga a base de dados:
   `DATABASE_URL = ${{Postgres.DATABASE_URL}}`
5. Confirma em **Settings → Deploy**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run prisma:push && npm run start`
   (já vêm no `Railway.toml`, mas as definições do painel mandam.)
6. Em **Settings → Networking → Generate Domain** para obteres o link público.

As duas crianças abrem o mesmo link em dispositivos diferentes e jogam juntas.

## Jogadoras e CPU

No início de cada sessão escolhe-se **quantas jogadoras** (1 ou 2) e **que papéis**
elas fazem. Os papéis que sobram são geridos automaticamente pelo computador — por
isso pode jogar só uma criança e o resto do hospital funciona sozinho.

A **Secretária** é interativa: os doentes chegam e "dizem" o nome, idade e motivo, e a
criança transcreve-os para a ficha (com feedback e estrelas por cada dado correto).

> Depois de atualizar o código, corre novamente `npm run prisma:push` para aplicar os
> novos campos da base de dados (`players`, `humanRoles`).

## Papéis e fluxo

```
Secretária  →  Médica        →  Enfermeira      →  Alta
(regista)      (vitais +         (dá medicação +
               diagnóstico +      observações +
               prescrição)        rating)

Estado do doente: waiting → consulting → treating → discharged
```
