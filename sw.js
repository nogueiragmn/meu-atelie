// Guarda o app no iPad para funcionar sem internet.
// Mude a versão quando quiser forçar uma atualização completa.
const VERSAO = 'atelie-v2';
const ARQUIVOS = [
  './', 'index.html', 'style.css', 'icone.png', 'manifest.json',
  'js/app.js', 'js/board.js', 'js/convert.js', 'js/palette.js', 'js/sound.js', 'js/store.js',
  'paginas/paginas.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSAO);
    await cache.addAll(ARQUIVOS);
    try {
      const paginas = await (await fetch('paginas/paginas.json', { cache: 'no-cache' })).json();
      await cache.addAll(paginas.map((p) => 'paginas/' + p.arquivo));
    } catch {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSAO) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Responde do cache na hora e atualiza em segundo plano quando houver internet.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSAO);
    const cached = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) {
      e.waitUntil(fresh);
      return cached;
    }
    return (await fresh) || new Response('Sem internet', { status: 503 });
  })());
});
