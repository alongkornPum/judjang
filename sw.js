// Offline support. Bump CACHE when shipping a breaking change to cached files.
const CACHE = 'judjang-v2'
const PRECACHE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon.svg']

self.addEventListener('install', (event) => {
  // fetch + put per file instead of addAll(): addAll rejects the whole install
  // on one failure, and Chrome can throw "Entry already exists" from add().
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(PRECACHE.map((url) => fetch(url).then((res) => res.ok && c.put(url, res)))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Pages: network first so updates show up, cache when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copy))
          return res
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  // Everything else (icons, Google Fonts): cache first, fill on miss.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
          }
          return res
        }),
    ),
  )
})
