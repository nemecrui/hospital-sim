import { PrismaClient } from '@prisma/client';
import { generatePatient } from '../utils/generators.js';

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.create({
    data: { stats: { create: {} } }
  });

  const count = 5;
  for (let i = 0; i < count; i++) {
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

  console.log('🌱 Seed concluído.');
  console.log(`   Sessão criada: ${session.id}`);
  console.log(`   ${count} doentes em espera.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
