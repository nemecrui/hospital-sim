import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import sessionsRoutes from './routes/sessions.js';
import patientsRoutes from './routes/patients.js';
import statsRoutes from './routes/stats.js';
import playsRoutes from './routes/plays.js';
import { startCpu } from './cpu.js';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// CORS
await fastify.register(cors, {
  origin:
    process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || true)
      : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
});

// Disponibiliza o prisma nas rotas
fastify.decorate('prisma', prisma);

// Rotas (todas sob /api)
await fastify.register(sessionsRoutes, { prefix: '/api' });
await fastify.register(patientsRoutes, { prefix: '/api' });
await fastify.register(statsRoutes, { prefix: '/api' });
await fastify.register(playsRoutes, { prefix: '/api' });

// Health check
fastify.get('/health', async () => ({ ok: true }));

// Em produção, serve o frontend já construído (web/dist) no mesmo domínio.
// Assim é 1 só serviço e não há problemas de CORS.
const distDir = fileURLToPath(new URL('../web/dist', import.meta.url));
if (existsSync(distDir)) {
  await fastify.register(fastifyStatic, { root: distDir });
  // Fallback SPA: qualquer rota que não seja /api devolve o index.html
  fastify.setNotFoundHandler((request, reply) => {
    if (request.raw.url && request.raw.url.startsWith('/api')) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return reply.sendFile('index.html');
  });
  fastify.log.info(`📦 A servir frontend de ${distDir}`);
}

// Arranque
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`🏥 Hospital Server a correr na porta ${port}`);
    // Arranca o motor CPU (gere os papéis não-humanos)
    startCpu(prisma, fastify.log);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
