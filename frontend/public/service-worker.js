// frontend/public/service-worker.js

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    const options = {
      body: event.data.text(),
      icon: '/background/availo-assist.logo.jpg',
      badge: '/badge.png',
      vibrate: [200, 100, 200]
    };
  
    event.waitUntil(
      self.registration.showNotification('AVAILOASSIST', options)
    );
  });