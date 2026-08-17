export default async function statsRoutes(fastify) {
  const { prisma } = fastify;

  // GET /api/stats/:sessionId - Dashboard stats
  fastify.get('/stats/:sessionId', async (request, reply) => {
    const { sessionId } = request.params;
    try {
      const patients = await prisma.patient.findMany({ where: { sessionId } });

      const discharged = patients.filter((p) => p.status === 'discharged');

      const ratings = discharged.filter((p) => p.rating).map((p) => p.rating);
      const satisfaction = ratings.length
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 0;

      const waitTimes = discharged.map(
        (p) => (new Date(p.updatedAt) - new Date(p.createdAt)) / 60000
      );
      const avgWaitTime = waitTimes.length
        ? Number((waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length).toFixed(1))
        : 0;

      const stats = {
        totalTreated: discharged.length,
        totalPatients: patients.length,
        avgWaitTime,
        satisfaction,
        byStatus: {
          triage: patients.filter((p) => p.status === 'triage').length,
          diagnosis: patients.filter((p) => p.status === 'diagnosis').length,
          treatment: patients.filter((p) => p.status === 'treatment').length,
          discharge: patients.filter((p) => p.status === 'discharge').length,
          discharged: discharged.length
        }
      };

      // Persiste um resumo em Stats (best-effort)
      await prisma.stats
        .update({
          where: { sessionId },
          data: {
            totalTreated: stats.totalTreated,
            avgWaitTime: stats.avgWaitTime,
            satisfaction: stats.satisfaction
          }
        })
        .catch(() => {});

      return stats;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch stats' });
    }
  });
}
