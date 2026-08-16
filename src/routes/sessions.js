export default async function sessionsRoutes(fastify) {
  const { prisma } = fastify;

  // POST /api/sessions - Criar nova sessão (config opcional)
  fastify.post('/sessions', async (request, reply) => {
    const { players, humanRoles } = request.body || {};
    try {
      const session = await prisma.session.create({
        data: {
          players: players ? Number(players) : 1,
          humanRoles: JSON.stringify(Array.isArray(humanRoles) ? humanRoles : []),
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

  // PATCH /api/sessions/:id/config - Definir nº de jogadoras e papéis humanos
  fastify.patch('/sessions/:id/config', async (request, reply) => {
    const { id } = request.params;
    const { players, humanRoles } = request.body || {};
    try {
      const session = await prisma.session.update({
        where: { id },
        data: {
          players: players ? Number(players) : 1,
          humanRoles: JSON.stringify(Array.isArray(humanRoles) ? humanRoles : [])
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
