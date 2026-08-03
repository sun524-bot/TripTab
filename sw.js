const CACHE_NAME = 'triptab-v17';
const ASSETS = [
  './',
  './dashboard.html',
  './trip.html',
  './add-expense.html',
  './profile.html',
  './login.html',
  './register.html',
  './forgot.html',
  './css/base.css',
  './css/components.css',
  './css/pages.css',
  './js/theme.js',
  './js/i18n.js',
  './js/utils.js',
  './js/auth.js',
  './js/trips.js',
  './js/expenses.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // HTML Page Navigation: Network-First, fallback to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request, { ignoreSearch: true }).then(cached => {
            return cached || caches.match('./dashboard.html', { ignoreSearch: true });
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Images, Fonts): Cache-First
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse));
          }
        }).catch(() => {/* Silent catch offline */});

        return cachedResponse;
      }

      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
