import { generatePatient, generateQueixas, generateStory, HEALTH_BY_COLOR, examEmoji } from '../utils/generators.js';

const MAX_ACTIVE = 3; // só entram novos doentes se houver menos de 3 por tratar
const DOSE_WINDOW_S = 240; // as tomas distribuem-se por 240s (3 tomas=80s, 2 tomas=120s)
const VALID_COLORS = ['verde', 'amarela', 'laranja', 'vermelha'];

// Intervalo entre doses de um medicamento com `total` tomas (em ms)
function cooldownMsFor(total) {
  return Math.round(DOSE_WINDOW_S / Math.max(1, total)) * 1000;
}

function serialize(p) {
  return {
    ...p,
    symptoms: p.symptoms ? safeJson(p.symptoms, []) : [],
    medicine: p.medicine ? safeJson(p.medicine, []) : [],
    exams: p.exams ? safeJson(p.exams, []) : []
  };
}

function safeJson(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

async function countActive(prisma, sessionId) {
  return prisma.patient.count({
    where: { sessionId, status: { not: 'discharged' } }
  });
}

export default async function patientsRoutes(fastify) {
  const { prisma } = fastify;

  // POST /api/patients - Secretária regista doente (só nome + idade)
  // As queixas são geradas no servidor (surpresa para a triagem).
  fastify.post('/patients', async (request, reply) => {
    const { sessionId, name, age } = request.body || {};
    if (!sessionId || !name || age == null) {
      return reply.code(400).send({ error: 'Missing required fields (sessionId, name, age)' });
    }
    try {
      if ((await countActive(prisma, sessionId)) >= MAX_ACTIVE) {
        return reply.code(409).send({ error: 'Too many active patients' });
      }
      const symptoms = generateQueixas();
      const patient = await prisma.patient.create({
        data: {
          sessionId,
          name,
          age: Number(age),
          symptoms: JSON.stringify(symptoms),
          story: generateStory(symptoms[0]),
          status: 'triage'
        }
      });
      return reply.code(201).send(serialize(patient));
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create patient' });
    }
  });

  // POST /api/patients/random - Gerar doente aleatório (Secretária), respeita o limite
  fastify.post('/patients/random', async (request, reply) => {
    const { sessionId } = request.body || {};
    if (!sessionId) return reply.code(400).send({ error: 'sessionId required' });
    try {
      if ((await countActive(prisma, sessionId)) >= MAX_ACTIVE) {
        return reply.code(409).send({ error: 'Too many active patients' });
      }
      const g = generatePatient();
      const patient = await prisma.patient.create({
        data: {
          sessionId,
          name: g.name,
          age: g.age,
          symptoms: JSON.stringify(g.symptoms),
          story: g.story,
          status: 'triage'
        }
      });
      return reply.code(201).send(serialize(patient));
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to create random patient' });
    }
  });

  // GET /api/patients?sessionId=xxx
  fastify.get('/patients', async (request, reply) => {
    const { sessionId } = request.query;
    if (!sessionId) return reply.code(400).send({ error: 'sessionId required' });
    try {
      const patients = await prisma.patient.findMany({
        where: { sessionId },
        orderBy: [{ createdAt: 'asc' }]
      });
      return patients.map(serialize);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch patients' });
    }
  });

  // PATCH /api/patients/:id/triage - Enfermeira: sinais vitais, queixas, pulseira
  fastify.patch('/patients/:id/triage', async (request, reply) => {
    const { id } = request.params;
    const { playerId, temp, hr, symptoms, triageColor } = request.body || {};
    if (!VALID_COLORS.includes(triageColor)) {
      return reply.code(400).send({ error: 'Invalid triageColor' });
    }
    try {
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'diagnosis',
          assignedTo: playerId ?? null,
          temp: temp != null ? Number(temp) : null,
          hr: hr != null ? Number(hr) : null,
          triageColor,
          health: HEALTH_BY_COLOR[triageColor] ?? 60,
          ...(Array.isArray(symptoms) ? { symptoms: JSON.stringify(symptoms) } : {})
        }
      });
      return serialize(patient);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to triage patient' });
    }
  });

  // PATCH /api/patients/:id/prescribe - Médica: diagnóstico + prescrição
  // items: [{ name, emoji, type, total }]
  fastify.patch('/patients/:id/prescribe', async (request, reply) => {
    const { id } = request.params;
    const { diagnosis, items } = request.body || {};
    try {
      const list = (Array.isArray(items) ? items : []).map((it) => ({
        name: it.name,
        emoji: it.emoji || '💊',
        type: it.type || 'med',
        total: Math.max(1, Number(it.total) || 1),
        given: 0,
        lastGivenAt: 0
      }));
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'treatment',
          diagnosis: diagnosis ?? null,
          medicine: JSON.stringify(list)
        }
      });
      return serialize(patient);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to prescribe' });
    }
  });

  // PATCH /api/patients/:id/request-exams - Médica pede exames (vai ao TAD)
  // exams: [{ name, emoji }] ou [names]
  fastify.patch('/patients/:id/request-exams', async (request, reply) => {
    const { id } = request.params;
    const { exams, diagnosis } = request.body || {};
    try {
      const list = (Array.isArray(exams) ? exams : []).map((e) => {
        const name = typeof e === 'string' ? e : e.name;
        const emoji = (typeof e === 'object' && e.emoji) || examEmoji(name);
        return { name, emoji, result: null };
      });
      if (list.length === 0) return reply.code(400).send({ error: 'Sem exames' });
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'exams',
          diagnosis: diagnosis ?? undefined,
          exams: JSON.stringify(list)
        }
      });
      return serialize(patient);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to request exams' });
    }
  });

  // PATCH /api/patients/:id/exam-result - TAD define o resultado de um exame
  fastify.patch('/patients/:id/exam-result', async (request, reply) => {
    const { id } = request.params;
    const { examName, result } = request.body || {};
    try {
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) return reply.code(404).send({ error: 'Patient not found' });
      const list = safeJson(patient.exams, []);
      const ex = list.find((e) => e.name === examName);
      if (!ex) return reply.code(400).send({ error: 'Exame não pedido' });
      ex.result = result;
      const updated = await prisma.patient.update({
        where: { id },
        data: { exams: JSON.stringify(list) }
      });
      return serialize(updated);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to set exam result' });
    }
  });

  // PATCH /api/patients/:id/exams-done - TAD devolve ao médico (todos com resultado)
  fastify.patch('/patients/:id/exams-done', async (request, reply) => {
    const { id } = request.params;
    const { playerId } = request.body || {};
    try {
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) return reply.code(404).send({ error: 'Patient not found' });
      const list = safeJson(patient.exams, []);
      if (list.some((e) => !e.result)) {
        return reply.code(409).send({ error: 'Ainda faltam exames por fazer' });
      }
      const updated = await prisma.patient.update({
        where: { id },
        data: { status: 'diagnosis', assignedTo: playerId ?? null }
      });
      return serialize(updated);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to finish exams' });
    }
  });

  // PATCH /api/patients/:id/dose - Enfermeira aplica UMA dose/curativo
  fastify.patch('/patients/:id/dose', async (request, reply) => {
    const { id } = request.params;
    const { itemName } = request.body || {};
    try {
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) return reply.code(404).send({ error: 'Patient not found' });

      const items = safeJson(patient.medicine, []);
      const item = items.find((it) => it.name === itemName);
      if (!item) return reply.code(400).send({ error: 'Item not prescribed' });

      if (item.given >= item.total) {
        return reply.code(409).send({ error: 'Já foi dada toda a dose prescrita' });
      }
      const now = Date.now();
      const cooldownMs = cooldownMsFor(item.total);
      // A primeira toma é imediata; as seguintes respeitam o intervalo
      if (item.given > 0 && now - (item.lastGivenAt || 0) < cooldownMs) {
        const wait = Math.ceil((cooldownMs - (now - item.lastGivenAt)) / 1000);
        return reply.code(429).send({ error: `Espera ${wait}s antes da próxima dose`, wait });
      }

      // Aplicar dose
      item.given += 1;
      item.lastGivenAt = now;

      // Subir a saúde de forma a chegar a 100 na última unidade
      const remainingUnits = items.reduce((s, it) => s + (it.total - it.given), 0) + 1; // inclui a atual
      const current = patient.health ?? 50;
      const increment = Math.ceil((100 - current) / remainingUnits);
      const health = Math.min(100, current + increment);

      const updated = await prisma.patient.update({
        where: { id },
        data: { medicine: JSON.stringify(items), health }
      });
      return serialize(updated);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to apply dose' });
    }
  });

  // PATCH /api/patients/:id/to-discharge - Enfermeira envia para alta (doente bom)
  fastify.patch('/patients/:id/to-discharge', async (request, reply) => {
    const { id } = request.params;
    const { playerId } = request.body || {};
    try {
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) return reply.code(404).send({ error: 'Patient not found' });
      if ((patient.health ?? 0) < 100) {
        return reply.code(409).send({ error: 'O doente ainda não está totalmente bom' });
      }
      const updated = await prisma.patient.update({
        where: { id },
        data: { status: 'discharge', assignedTo: playerId ?? null }
      });
      return serialize(updated);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to send to discharge' });
    }
  });

  // PATCH /api/patients/:id/discharge - Médica dá alta
  fastify.patch('/patients/:id/discharge', async (request, reply) => {
    const { id } = request.params;
    const { playerId, rating, notes } = request.body || {};
    try {
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'discharged',
          assignedTo: playerId ?? null,
          notes: notes ?? null,
          rating: rating != null ? Math.min(5, Math.max(1, Number(rating))) : 5
        }
      });
      return serialize(patient);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to discharge patient' });
    }
  });

  // DELETE /api/patients/:id (dev)
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
