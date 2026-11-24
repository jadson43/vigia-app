const C = 'vigia-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const put = r => { if (r && r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; };

  // Biblioteca e modelos de reconhecimento facial: cache primeiro (funcionam offline depois da 1ª vez)
  if (u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.match(e.request).then(h => h || fetch(e.request).then(put)));
    return;
  }
  // Arquivos do app: rede primeiro, cache se estiver offline
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request)));
  }
});
