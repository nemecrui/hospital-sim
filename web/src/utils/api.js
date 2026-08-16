// URL base da API.
// - Em desenvolvimento (localhost) aponta para o backend em :3000.
// - Em produção (Railway), o backend serve o próprio frontend, por isso
//   usamos o mesmo domínio ("/api"). Podes forçar com VITE_API_URL.
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_URL =
  import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3000/api' : '/api');
