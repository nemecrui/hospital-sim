// Motor CPU: faz avançar automaticamente os papéis sem jogadora humana.
import {
  generatePatient,
  generateEmergency,
  suggestTriageColor,
  HEALTH_BY_COLOR,
  randomExamResult,
  EXAMS
} from './utils/generators.js';
import { pack } from './utils/content.js';

const ALL_ROLES = ['secretaria', 'medica', 'enfermeira', 'tad'];
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

function nextScenario(mode, current) {
  const ids = pack(mode).scenarioIds;
  if (!current || current === 'normal') {
    return { scenario: pick(ids), durMs: (120 + Math.floor(Math.random() * 120)) * 1000 };
  }
  return { scenario: 'normal', durMs: (60 + Math.floor(Math.random() * 90)) * 1000 };
}

function rollObjective(mode, patients) {
  const discharged = patients.filter((p) => p.status === 'discharged');
  const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  if (Math.random() < 0.5) {
    return { id, type: 'count', target: 5 + Math.floor(Math.random() * 8), startCount: discharged.length };
  }
  const disease = pick(pack(mode).diseaseGoals);
  const startCount = discharged.filter((p) => p.diagnosis === disease).length;
  return { id, type: 'disease', disease, target: 2 + Math.floor(Math.random() * 3), startCount };
}

function objectiveProgress(obj, patients) {
  const discharged = patients.filter((p) => p.status === 'discharged');
  const qualifying = obj.type === 'disease'
    ? discharged.filter((p) => p.diagnosis === obj.disease).length
    : discharged.length;
  return qualifying - (obj.startCount || 0);
}

async function tickSession(prisma, session) {
  const mode = session.mode || 'hospital';
  const now = Date.now();
  const patients = await prisma.patient.findMany({ where: { sessionId: session.id } });
  const active = patients.filter((p) => p.status !== 'discharged');

  // 🎠 Rotação de cenário
  if (!session.scenarioUntil || now > new Date(session.scenarioUntil).getTime()) {
    const nx = nextScenario(mode, session.scenario);
    await prisma.session.update({
      where: { id: session.id },
      data: { scenario: nx.scenario, scenarioUntil: new Date(now + nx.durMs) }
    });
    session.scenario = nx.scenario;
  }

  // 🎯 Objetivo
  const obj = safeParse(session.objective, null);
  if (!obj || objectiveProgress(obj, patients) >= obj.target) {
    await prisma.session.update({
      where: { id: session.id },
      data: { objective: JSON.stringify(rollObjective(mode, patients)) }
    });
  }

  // 🚑 Urgência rara
  const lastEmerg = patients.filter((p) => p.emergency).reduce((m, p) => Math.max(m, new Date(p.createdAt).getTime()), 0);
  if (active.length < 5 && now - lastEmerg > 240000 && Math.random() < 0.04) {
    const g = generateEmergency(mode);
    await prisma.patient.create({
      data: {
        sessionId: session.id, name: g.name, age: g.age,
        symptoms: JSON.stringify(g.symptoms), story: g.story, emergency: true, status: 'triage'
      }
    });
  }

  const human = safeParse(session.humanRoles, []);
  const cpuRoles = ALL_ROLES.filter((r) => !human.includes(r));
  if (cpuRoles.length === 0) return;

  // 👩‍💼 Secretária CPU
  if (cpuRoles.includes('secretaria')) {
    const lastCreated = patients.reduce((max, p) => Math.max(max, new Date(p.createdAt).getTime()), 0);
    if (active.length < MAX_ACTIVE && now - lastCreated > SPAWN_MS) {
      const g = generatePatient(mode, session.scenario);
      await prisma.patient.create({
        data: {
          sessionId: session.id, name: g.name, age: g.age,
          symptoms: JSON.stringify(g.symptoms), story: g.story, status: 'triage'
        }
      });
    }
  }

  // 👩‍⚕️ Enfermeira CPU
  if (cpuRoles.includes('enfermeira')) {
    for (const p of patients.filter((p) => p.status === 'triage')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const color = suggestTriageColor(mode, safeParse(p.symptoms, []));
        await prisma.patient.update({
          where: { id: p.id },
          data: {
            status: 'diagnosis', assignedTo: 'CPU',
            temp: Number((36 + Math.random() * 3).toFixed(1)), hr: 60 + Math.floor(Math.random() * 40),
            triageColor: color, health: HEALTH_BY_COLOR[color] ?? 60
          }
        });
      }
    }
    for (const p of patients.filter((p) => p.status === 'treatment')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const items = safeParse(p.medicine, []).map((it) => ({ ...it, given: it.total }));
        await prisma.patient.update({
          where: { id: p.id },
          data: { status: 'discharge', assignedTo: 'CPU', medicine: JSON.stringify(items), health: 100 }
        });
      }
    }
  }

  // 🔬 TAD CPU
  if (cpuRoles.includes('tad')) {
    for (const p of patients.filter((p) => p.status === 'exams')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const list = safeParse(p.exams, []).map((e) => ({ ...e, result: e.result || randomExamResult(e.name) }));
        await prisma.patient.update({
          where: { id: p.id },
          data: { status: 'diagnosis', assignedTo: 'CPU', exams: JSON.stringify(list) }
        });
      }
    }
  }

  // 👨‍⚕️ Médica CPU
  if (cpuRoles.includes('medica')) {
    const P = pack(mode);
    for (const p of patients.filter((p) => p.status === 'diagnosis')) {
      if (now - new Date(p.updatedAt).getTime() > THINK_MS) {
        const jaFezExames = safeParse(p.exams, []).length > 0;
        if (!jaFezExames && Math.random() < 0.4) {
          const shuffled = [...EXAMS].sort(() => Math.random() - 0.5);
          const n = Math.random() < 0.3 ? 2 : 1;
          const list = shuffled.slice(0, n).map((e) => ({ name: e.name, emoji: e.emoji, result: null }));
          await prisma.patient.update({
            where: { id: p.id },
            data: { status: 'exams', diagnosis: pick(P.cpuDiagnoses), exams: JSON.stringify(list) }
          });
        } else {
          const chosen = pick(P.cpuMeds);
          const items = [{ ...chosen, given: 0, lastGivenAt: 0 }];
          await prisma.patient.update({
            where: { id: p.id },
            data: { status: 'treatment', diagnosis: pick(P.cpuDiagnoses), medicine: JSON.stringify(items) }
          });
        }
      }
    }
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
        if (safeParse(s.humanRoles, []).length === 0) continue; // ainda não configurada
        await tickSession(prisma, s);
      }
    } catch (err) {
      log?.error?.(err);
    }
  }, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
