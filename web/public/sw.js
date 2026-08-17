// Service worker mínimo — só para a app ser instalável.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Não intercetar a API
  if (url.pathname.startsWith('/api')) return;
  // Rede primeiro; se falhar, tenta a cache
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
