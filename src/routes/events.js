const ADMIN_CODE = process.env.ADMIN_CODE || '1986';
const TYPES = ['visit', 'install', 'session', 'cure'];

function dayKey(d) {
  return new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
}

export default async function eventsRoutes(fastify) {
  const { prisma } = fastify;

  // POST /api/events - regista um evento anónimo (visita, instalação…)
  fastify.post('/events', async (request, reply) => {
    const { type, mode } = request.body || {};
    if (!TYPES.includes(type)) return reply.code(400).send({ error: 'invalid type' });
    try {
      await prisma.event.create({
        data: { type, mode: mode === 'vet' || mode === 'hospital' ? mode : null }
      });
      return { ok: true };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to log event' });
    }
  });

  // GET /api/admin/stats?code=XXXX - estatísticas agregadas (acesso protegido)
  fastify.get('/admin/stats', async (request, reply) => {
    if ((request.query.code || '') !== ADMIN_CODE) {
      return reply.code(403).send({ error: 'Código errado' });
    }
    try {
      const since = new Date(Date.now() - 30 * 86400000);

      const [visits, installs, sessions, cures] = await Promise.all([
        prisma.event.count({ where: { type: 'visit' } }),
        prisma.event.count({ where: { type: 'install' } }),
        prisma.event.count({ where: { type: 'session' } }),
        prisma.event.count({ where: { type: 'cure' } })
      ]);

      const byRoleRaw = await prisma.playEvent.groupBy({ by: ['role'], _count: { _all: true } });
      const byRole = {};
      byRoleRaw.forEach((r) => {
        byRole[r.role] = r._count._all;
      });

      const byModeRaw = await prisma.event.groupBy({
        by: ['mode'],
        where: { type: 'session', mode: { not: null } },
        _count: { _all: true }
      });
      const byMode = {};
      byModeRaw.forEach((r) => {
        byMode[r.mode] = r._count._all;
      });

      // Séries diárias (últimos 30 dias) — agregadas em JS
      const evts = await prisma.event.findMany({
        where: { createdAt: { gte: since } },
        select: { type: true, createdAt: true }
      });
      const buckets = {};
      for (let i = 0; i < 30; i++) {
        const d = dayKey(Date.now() - i * 86400000);
        buckets[d] = { day: d, visit: 0, session: 0, cure: 0, install: 0 };
      }
      evts.forEach((e) => {
        const k = dayKey(e.createdAt);
        if (buckets[k] && buckets[k][e.type] != null) buckets[k][e.type] += 1;
      });
      const daily = Object.values(buckets).sort((a, b) => a.day.localeCompare(b.day));

      return {
        totals: { visits, installs, sessions, cures },
        byRole,
        byMode,
        daily
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch stats' });
    }
  });
}
