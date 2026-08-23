// Código de admin: definido na variável de ambiente ADMIN_CODE (no Railway).
// Se não estiver definida, usa '1986' como recurso — DEFINE ADMIN_CODE para o proteger.
const ADMIN_CODE = process.env.ADMIN_CODE || '1986';

export default async function playsRoutes(fastify) {
  const { prisma } = fastify;

  // POST /api/plays - regista atividade (que papel, em que sala, quando).
  // Privacidade: NÃO guardamos o nome da criança no registo.
  fastify.post('/plays', async (request, reply) => {
    const { sessionId, role } = request.body || {};
    if (!role) return reply.code(400).send({ error: 'role required' });
    try {
      let code = null;
      if (sessionId) {
        const s = await prisma.session.findUnique({ where: { id: sessionId } });
        code = s?.code || null;
      }
      await prisma.playEvent.create({ data: { code, name: '', role } });
      return { ok: true };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to log play' });
    }
  });

  // GET /api/admin/plays?code=XXXX - lista a atividade (acesso protegido)
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
