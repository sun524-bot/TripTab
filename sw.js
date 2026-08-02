const CACHE_NAME = 'triptab-v1';
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => caches.match('./dashboard.html'));
    })
  );
});
