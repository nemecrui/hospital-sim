// Motor CPU: faz avançar automaticamente os doentes dos papéis sem jogadora humana.
import {
  generatePatient,
  suggestTriageColor,
  HEALTH_BY_COLOR,
  randomExamResult,
  EXAMS
} from './utils/generators.js';

const ALL_ROLES = ['secretaria', 'medica', 'enfermeira', 'tad'];

const DIAGNOSES = [
  'Gripe', 'Constipação', 'Amigdalite', 'Otite', 'Gastroenterite',
  'Alergia', 'Ferida', 'Entorse', 'Enxaqueca', 'Febre', 'Osso partido',
  'Excesso de guloseimas', 'Preguicite aguda', 'Barriga de trovão',
  'Nariz de palhaço', 'Cócegas crónicas', 'Cabeça no ar'
];
const MEDS = [
  { name: 'Paracetamol', emoji: '💊', type: 'med', total: 3 },
  { name: 'Ibuprofeno', emoji: '💊', type: 'med', total: 2 },
  { name: 'Xarope', emoji: '🥄', type: 'med', total: 3 },
  { name: 'Anti-alérgico', emoji: '💊', type: 'med', total: 2 },
  { name: 'Penso', emoji: '🩹', type: 'curativo', total: 1 },
  { name: 'Gesso', emoji: '🦴', type: 'curativo', total: 1 },
  { name: 'Repouso', emoji: '😴', type: 'med', total: 1 },
  { name: 'Chá quentinho', emoji: '🍵', type: 'med', total: 2 },
  { name: 'Sopa da avó', emoji: '🥣', type: 'med', total: 1 },
  { name: 'Mimo extra', emoji: '🧸', type: 'med', total: 2 },
  { name: 'Gargalhada', emoji: '😂', type: 'med', total: 3 }
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const THINK_MS = 6000;
const SPAWN_MS = 9000;
const MAX_ACTIVE = 3;

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json ?? 'null');
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

async function tickSession(prisma, session) {
  const human = safeParse(session.humanRoles, []);
  const cpuRoles = ALL_ROLES.filter((r) => !human.includes(r));
  if (cpuRoles.length === 0) return;

  const now = Date.now();
  const patients = await prisma.patient.findMany({ where: { sessionId: session.id } });
  const active = patients.filter((p) => p.status !== 'discharged');

  // 👩‍💼 Secretária CPU — cria doentes (nome+idade) se houver menos de 3 ativos
  if (cpuRoles.includes('secretaria')) {
    const lastCreated = patients.reduce(
      (max, p) => Math.max(max, new Date(p.createdAt).getTime()),
      0
    );
    if (active.length < MAX_ACTIVE && now - lastCreated > SPAWN_MS) {
      const g = generatePatient();
      await prisma.patient.create({
        data: {
          sessionId: session.id,
          name: g.name,
          age: g.age,
          symptoms: JSON.stringify(g.symptoms),
          story: g.story,
          status: 'triage'
        }
      });
    }
  }

  // 👩‍⚕️ Enfermeira CPU — triagem e tratamento
  if (cpuRoles.includes('enfermeira')) {
    // Triagem: triage -> diagnosis
    for (const p of patients.filter((p) => p.status === 'triage')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const queixas = safeParse(p.symptoms, []);
        const color = suggestTriageColor(queixas);
        await prisma.patient.update({
          where: { id: p.id },
          data: {
            status: 'diagnosis',
            assignedTo: 'CPU',
            temp: Number((36 + Math.random() * 3).toFixed(1)),
            hr: 60 + Math.floor(Math.random() * 40),
            triageColor: color,
            health: HEALTH_BY_COLOR[color] ?? 60
          }
        });
      }
    }
    // Tratamento: treatment -> discharge (aplica tudo e cura)
    for (const p of patients.filter((p) => p.status === 'treatment')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const items = safeParse(p.medicine, []).map((it) => ({ ...it, given: it.total }));
        await prisma.patient.update({
          where: { id: p.id },
          data: {
            status: 'discharge',
            assignedTo: 'CPU',
            medicine: JSON.stringify(items),
            health: 100
          }
        });
      }
    }
  }

  // 🔬 TAD CPU — faz os exames pedidos e devolve ao médico
  if (cpuRoles.includes('tad')) {
    for (const p of patients.filter((p) => p.status === 'exams')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const list = safeParse(p.exams, []).map((e) => ({
          ...e,
          result: e.result || randomExamResult(e.name)
        }));
        await prisma.patient.update({
          where: { id: p.id },
          data: { status: 'diagnosis', assignedTo: 'CPU', exams: JSON.stringify(list) }
        });
      }
    }
  }

  // 👨‍⚕️ Médica CPU — diagnóstico e alta
  if (cpuRoles.includes('medica')) {
    // Diagnóstico: pede exames (~40%, se ainda não tiver) OU vai direto ao tratamento
    for (const p of patients.filter((p) => p.status === 'diagnosis')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const jaFezExames = safeParse(p.exams, []).length > 0;
        if (!jaFezExames && Math.random() < 0.4) {
          // Pedir 1 (às vezes 2) exames ao TAS
          const shuffled = [...EXAMS].sort(() => Math.random() - 0.5);
          const n = Math.random() < 0.3 ? 2 : 1;
          const list = shuffled.slice(0, n).map((e) => ({ name: e.name, emoji: e.emoji, result: null }));
          await prisma.patient.update({
            where: { id: p.id },
            data: { status: 'exams', diagnosis: pick(DIAGNOSES), exams: JSON.stringify(list) }
          });
        } else {
          const chosen = pick(MEDS);
          const items = [{ ...chosen, given: 0, lastGivenAt: 0 }];
          await prisma.patient.update({
            where: { id: p.id },
            data: { status: 'treatment', diagnosis: pick(DIAGNOSES), medicine: JSON.stringify(items) }
          });
        }
      }
    }
    // Alta: discharge -> discharged
    for (const p of patients.filter((p) => p.status === 'discharge')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        await prisma.patient.update({
          where: { id: p.id },
          data: { status: 'discharged', assignedTo: 'CPU', rating: 4 + Math.floor(Math.random() * 2) }
        });
      }
    }
  }
}

export function startCpu(prisma, log, intervalMs = 3000) {
  const timer = setInterval(async () => {
    try {
      const sessions = await prisma.session.findMany();
      for (const s of sessions) {
        if (safeParse(s.humanRoles, []).length === 0) continue;
        await tickSession(prisma, s);
      }
    } catch (err) {
      log?.error?.(err);
    }
  }, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
