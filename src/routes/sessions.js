import { FRUITS, randomFruit } from '../utils/generators.js';

// Gera um código-fruta único (ex.: "morango"; "morango-2" se já existir)
// É sempre uma fruta — nunca cai num código estranho.
async function makeUniqueCode(prisma) {
  // 1) tenta cada fruta simples, por ordem aleatória
  const shuffled = [...FRUITS].sort(() => Math.random() - 0.5);
  for (const base of shuffled) {
    const exists = await prisma.session.findUnique({ where: { code: base } });
    if (!exists) return base;
  }
  // 2) todas ocupadas -> fruta + número
  for (let n = 2; n < 2000; n++) {
    const code = `${randomFruit()}-${n}`;
    const exists = await prisma.session.findUnique({ where: { code } });
    if (!exists) return code;
  }
  return `fruta-${Math.floor(Math.random() * 100000)}`;
}

export default async function sessionsRoutes(fastify) {
  const { prisma } = fastify;

  // POST /api/sessions - Criar nova sessão (config opcional)
  fastify.post('/sessions', async (request, reply) => {
    const { players, humanRoles, goalTarget, scenario } = request.body || {};
    try {
      const code = await makeUniqueCode(prisma);
      const session = await prisma.session.create({
        data: {
          code,
          players: players ? Number(players) : 1,
          humanRoles: JSON.stringify(Array.isArray(humanRoles) ? humanRoles : []),
          goalTarget: goalTarget ? Number(goalTarget) : 8,
          scenario: scenario || 'normal',
          stats: { create: {} }
        },
        include: { stats: true }
      });
      return reply.code(201).send(session);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create session' });
    }
  });

  // DELETE /api/sessions - Apagar TODAS as sessões (manutenção)
  fastify.delete('/sessions', async (request, reply) => {
    try {
      const { count } = await prisma.session.deleteMany({});
      return { deleted: count };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete sessions' });
    }
  });

  // GET /api/sessions/by-code/:code - Resolver código-fruta para sessão
  fastify.get('/sessions/by-code/:code', async (request, reply) => {
    const code = String(request.params.code || '').trim().toLowerCase();
    try {
      const session = await prisma.session.findUnique({ where: { code } });
      if (!session) return reply.code(404).send({ error: 'Session not found' });
      return session;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch session' });
    }
  });

  // PATCH /api/sessions/:id/config - Definir nº de jogadoras e papéis humanos
  fastify.patch('/sessions/:id/config', async (request, reply) => {
    const { id } = request.params;
    const { players, humanRoles, goalTarget, scenario } = request.body || {};
    try {
      const session = await prisma.session.update({
        where: { id },
        data: {
          players: players ? Number(players) : 1,
          humanRoles: JSON.stringify(Array.isArray(humanRoles) ? humanRoles : []),
          ...(goalTarget ? { goalTarget: Number(goalTarget) } : {}),
          ...(scenario ? { scenario } : {})
        }
      });
      return session;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to update config' });
    }
  });

  // GET /api/sessions/last - Última sessão criada (retomar jogo)
  fastify.get('/sessions/last', async (request, reply) => {
    try {
      const session = await prisma.session.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { stats: true }
      });
      if (!session) return reply.code(404).send({ error: 'No sessions yet' });
      return session;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch last session' });
    }
  });

  // GET /api/sessions/:id - Obter sessão (com doentes ordenados)
  fastify.get('/sessions/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          patients: { orderBy: [{ urgency: 'desc' }, { createdAt: 'asc' }] },
          stats: true
        }
      });
      if (!session) return reply.code(404).send({ error: 'Session not found' });
      // Cura sessões antigas que ficaram sem código-fruta
      if (!session.code) {
        const code = await makeUniqueCode(prisma);
        await prisma.session.update({ where: { id }, data: { code } });
        session.code = code;
      }
      return session;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch session' });
    }
  });

  // POST /api/sessions/:id/reset - Novo dia (limpa doentes, reset stats)
  fastify.post('/sessions/:id/reset', async (request, reply) => {
    const { id } = request.params;
    try {
      const oldSession = await prisma.session.findUnique({
        where: { id },
        include: { stats: true, patients: true }
      });
      if (!oldSession) return reply.code(404).send({ error: 'Session not found' });

      await prisma.patient.deleteMany({ where: { sessionId: id } });
      await prisma.stats.update({
        where: { sessionId: id },
        data: { totalTreated: 0, avgWaitTime: 0, satisfaction: 0 }
      });

      return { message: 'Session reset', history: oldSession };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to reset session' });
    }
  });
}
