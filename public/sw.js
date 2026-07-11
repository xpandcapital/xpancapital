const CACHE_NAME = 'blis-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const titulo = data.titulo || 'Xpand Capital';
  const mensaje = data.mensaje || data.body || '';
  const url = data.url || '/superadmin/chat';
  const tipo = data.tipo || 'chat';
  const sonido = data.sonido !== false;

  const iconMap = {
    chat: '/pwa-icon.png',
    lead: '/pwa-icon.png',
    venta: '/pwa-icon.png',
    sistema: '/pwa-icon.png',
  };

  const options = {
    body: mensaje,
    icon: iconMap[tipo] || '/pwa-icon.png',
    badge: '/pwa-icon.png',
    data: { url },
    vibrate: [200, 100, 200, 100, 200],
    tag: tipo === 'chat' ? 'blis-chat' : 'blis-notification',
    requireInteraction: tipo === 'chat',
    renotify: true,
    silent: false,
  };

  event.waitUntil(
    self.registration.getNotifications({ tag: options.tag }).then((existing) => {
      if (existing.length > 0) {
        const count = existing.length + 1;
        options.body = `${count} mensajes nuevos`;
        options.title = titulo;
        return self.registration.showNotification(titulo, options);
      }
      return self.registration.showNotification(titulo, options);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/superadmin/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  // Notification dismissed
});
