// CaraVita Auftragsbuch – Service Worker für Push-Mitteilungen
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Auftragsbuch", {
    body: d.body || "",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    icon: "icon-192.png",
    badge: "icon-192.png",
    lang: "de",
    data: { url: d.url || "admin.html" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const ziel = new URL((e.notification.data && e.notification.data.url) || "admin.html", self.registration.scope).href;
  e.waitUntil((async () => {
    const fenster = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of fenster) {
      if (w.url.startsWith(self.registration.scope) && "focus" in w) {
        try { await w.navigate(ziel); } catch (_) {}
        return w.focus();
      }
    }
    return self.clients.openWindow(ziel);
  })());
});
