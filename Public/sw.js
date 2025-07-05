console.log('🌱 ECOLOJIA Service Worker chargé');

// Service Worker minimal
self.addEventListener('install', (event) => {
  console.log('✅ SW: Installation réussie');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activation réussie');
  event.waitUntil(self.clients.claim());
});