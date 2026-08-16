import { generatePatient } from '../utils/generators.js';

function serialize(p) {
  return {
    ...p,
    symptoms: p.symptoms ? JSON.parse(p.symptoms) : [],
    medicine: p.medicine ? JSON.parse(p.medicine) : []
  };
}

export default async function patientsRoutes(fastify) {
  const { prisma } = fastify;

  // POST /api/patients - Registar doente (Secretária)
  fastify.post('/patients', async (request, reply) => {
    const { sessionId, name, age, symptoms, urgency } = request.body || {};

    if (!sessionId || !name || age == null) {
      return reply.code(400).send({ error: 'Missing required fields (sessionId, name, age)' });
    }

    try {
      const symptomsArr = Array.isArray(symptoms)
        ? symptoms
        : (symptoms ? [symptoms] : []);

      const patient = await prisma.patient.create({
        data: {
          sessionId,
          name,
          age: Number(age),
          symptoms: JSON.stringify(symptomsArr),
          urgency: urgency === 'urgent' ? 'urgent' : 'normal',
          status: 'waiting'
        }
      });
      return reply.code(201).send(serialize(patient));
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create patient' });
    }
  });

  // POST /api/patients/random - Gerar doente aleatório (Secretária)
  fastify.post('/patients/random', async (request, reply) => {
    const { sessionId } = request.body || {};
    if (!sessionId) return reply.code(400).send({ error: 'sessionId required' });
    try {
      const g = generatePatient();
      const patient = await prisma.patient.create({
        data: {
          sessionId,
          name: g.name,
          age: g.age,
          symptoms: JSON.stringify(g.symptoms),
          urgency: g.urgency,
          status: 'waiting'
        }
      });
      return reply.code(201).send(serialize(patient));
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create random patient' });
    }
  });

  // GET /api/patients?sessionId=xxx - Listar doentes
  fastify.get('/patients', async (request, reply) => {
    const { sessionId } = request.query;
    if (!sessionId) return reply.code(400).send({ error: 'sessionId required' });
    try {
      const patients = await prisma.patient.findMany({
        where: { sessionId },
        orderBy: [{ urgency: 'desc' }, { status: 'asc' }, { createdAt: 'asc' }]
      });
      return patients.map(serialize);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch patients' });
    }
  });

  // PATCH /api/patients/:id/consult - Médica começa consulta (regista vitais)
  fastify.patch('/patients/:id/consult', async (request, reply) => {
    const { id } = request.params;
    const { playerId, temp, hr, bp } = request.body || {};
    try {
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'consulting',
          assignedTo: playerId ?? null,
          temp: temp != null ? Number(temp) : null,
          hr: hr != null ? Number(hr) : null,
          bp: bp ?? null
        }
      });
      return serialize(patient);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to update patient' });
    }
  });

  // PATCH /api/patients/:id/prescribe - Médica prescreve
  fastify.patch('/patients/:id/prescribe', async (request, reply) => {
    const { id } = request.params;
    const { diagnosis, medicine } = request.body || {};
    try {
      const medArr = Array.isArray(medicine) ? medicine : (medicine ? [medicine] : []);
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'treating',
          diagnosis: diagnosis ?? null,
          medicine: JSON.stringify(medArr)
        }
      });
      return serialize(patient);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to prescribe' });
    }
  });

  // PATCH /api/patients/:id/treat - Enfermeira trata + alta
  fastify.patch('/patients/:id/treat', async (request, reply) => {
    const { id } = request.params;
    const { playerId, notes, rating } = request.body || {};
    try {
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'discharged',
          assignedTo: playerId ?? null,
          notes: notes ?? null,
          rating: rating != null ? Math.min(5, Math.max(1, Number(rating))) : null
        }
      });
      return serialize(patient);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to discharge patient' });
    }
  });

  // DELETE /api/patients/:id - Apagar doente (dev only)
  fastify.delete('/patients/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.patient.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to delete patient' });
    }
  });
}
