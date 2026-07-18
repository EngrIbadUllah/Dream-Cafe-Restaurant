/* Demo Restaurant push service worker
 * Handles background push notifications for admins.
 */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "Demo Restaurant", body: "New notification", url: "/admin/orders", tag: "demo-restaurant" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch (e) {
    try {
      payload.body = event.data ? event.data.text() : payload.body;
    } catch (_) { /* ignore */ }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: payload.tag || "demo-restaurant",
      renotify: true,
      requireInteraction: false,
      vibrate: [180, 60, 180],
      data: { url: payload.url || "/admin/orders" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin/orders";
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname.startsWith("/admin")) {
            await client.focus();
            if ("navigate" in client) await client.navigate(url);
            return;
          }
        } catch (_) { /* ignore */ }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
