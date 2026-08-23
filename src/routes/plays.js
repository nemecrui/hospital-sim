const ADMIN_CODE = '1986';

export default async function playsRoutes(fastify) {
  const { prisma } = fastify;

  // POST /api/plays - regista uma jogada (quem entrou, que papel, em que sala)
  fastify.post('/plays', async (request, reply) => {
    const { sessionId, name, role } = request.body || {};
    if (!name || !role) return reply.code(400).send({ error: 'name and role required' });
    try {
      let code = null;
      if (sessionId) {
        const s = await prisma.session.findUnique({ where: { id: sessionId } });
        code = s?.code || null;
      }
      await prisma.playEvent.create({ data: { code, name: String(name).slice(0, 40), role } });
      return { ok: true };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to log play' });
    }
  });

  // GET /api/admin/plays?code=1986 - lista as jogadas (acesso secreto)
  fastify.get('/admin/plays', async (request, reply) => {
    if ((request.query.code || '') !== ADMIN_CODE) {
      return reply.code(403).send({ error: 'Código errado' });
    }
    try {
      const plays = await prisma.playEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500
      });
      return plays;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch plays' });
    }
  });
}
