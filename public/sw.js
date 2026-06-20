// Stride Service Worker
// Increment CACHE_VERSION with every deploy to bust old caches automatically
const CACHE_VERSION = 'stride-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`

// On install — activate immediately without waiting
self.addEventListener('install', event => {
  self.skipWaiting()
})

// On activate — delete ALL old caches so users always get the latest version
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// Fetch strategy:
// - Navigation requests (HTML pages) → Network first, fallback to cache
//   This ensures layout.tsx, nav, viewport changes always propagate
// - Everything else → Network first, cache as fallback
self.addEventListener('fetch', event => {
  const { request } = event

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return
  if (!request.url.startsWith(self.location.origin)) return

  // Navigation requests — always try network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Static assets — network first, cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})