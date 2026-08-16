// Motor CPU: faz avançar automaticamente os doentes dos papéis que NÃO são
// controlados por uma jogadora humana. Corre no servidor (fonte única da verdade).
import { generatePatient } from './utils/generators.js';

const ALL_ROLES = ['secretaria', 'medica', 'enfermeira'];

const DIAGNOSES = [
  'Constipação', 'Gripe', 'Amigdalite', 'Otite (dor de ouvido)',
  'Dor de barriga', 'Alergia', 'Ferimento ligeiro', 'Entorse (torção)',
  'Febre', 'Enxaqueca'
];
const MEDICINES = [
  'Paracetamol', 'Ibuprofeno', 'Xarope para a tosse', 'Repouso', 'Beber muita água'
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Quanto tempo (ms) o CPU "pensa" antes de agir, para parecer natural
const THINK_MS = 6000;
const SPAWN_MS = 9000; // intervalo entre chegadas geradas pela secretária-CPU
const MAX_WAITING = 3;

async function tickSession(prisma, session, log) {
  const human = safeParse(session.humanRoles);
  const cpuRoles = ALL_ROLES.filter((r) => !human.includes(r));
  if (cpuRoles.length === 0) return;

  const now = Date.now();
  const patients = await prisma.patient.findMany({ where: { sessionId: session.id } });

  // 👩‍💼 Secretária CPU — mantém a fila com doentes novos
  if (cpuRoles.includes('secretaria')) {
    const waiting = patients.filter((p) => p.status === 'waiting');
    const lastCreated = patients.reduce(
      (max, p) => Math.max(max, new Date(p.createdAt).getTime()),
      0
    );
    if (waiting.length < MAX_WAITING && now - lastCreated > SPAWN_MS) {
      const g = generatePatient();
      await prisma.patient.create({
        data: {
          sessionId: session.id,
          name: g.name,
          age: g.age,
          symptoms: JSON.stringify(g.symptoms),
          urgency: g.urgency,
          status: 'waiting'
        }
      });
    }
  }

  // 👨‍⚕️ Médica CPU — consulta + prescreve (waiting -> treating)
  if (cpuRoles.includes('medica')) {
    for (const p of patients.filter((p) => p.status === 'waiting')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        await prisma.patient.update({
          where: { id: p.id },
          data: {
            status: 'treating',
            assignedTo: 'CPU',
            temp: Number((36 + Math.random() * 3).toFixed(1)),
            hr: 60 + Math.floor(Math.random() * 40),
            diagnosis: pick(DIAGNOSES),
            medicine: JSON.stringify([pick(MEDICINES)])
          }
        });
      }
    }
  }

  // 👩‍⚕️ Enfermeira CPU — trata + dá alta (treating -> discharged)
  if (cpuRoles.includes('enfermeira')) {
    for (const p of patients.filter((p) => p.status === 'treating')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        await prisma.patient.update({
          where: { id: p.id },
          data: {
            status: 'discharged',
            assignedTo: 'CPU',
            notes: 'Tratado pela equipa automática.',
            rating: 4 + Math.floor(Math.random() * 2)
          }
        });
      }
    }
  }
}

function safeParse(json) {
  try {
    const v = JSON.parse(json || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Arranca o loop do CPU. Devolve uma função para parar.
export function startCpu(prisma, log, intervalMs = 3000) {
  const timer = setInterval(async () => {
    try {
      const sessions = await prisma.session.findMany();
      for (const s of sessions) {
        if (safeParse(s.humanRoles).length === 0) continue; // ainda não configurada
        await tickSession(prisma, s, log);
      }
    } catch (err) {
      log?.error?.(err);
    }
  }, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
