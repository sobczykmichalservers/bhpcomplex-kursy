/* ═══════════════════════════════════════════════════════════════
   Service Worker — Testy UDT (v57)
   - Cache-first (0 ms, 0 transferu) dla HTML, CSS, JS, ikon SVG i zdjęć WebP/PNG
   - Stale-While-Revalidate dla plików JSON z pytaniami (natychmiastowy odczyt z cache + cicha aktualizacja w tle)
   Zmień CACHE_VER przy każdym deployu kodu, aby wymusić odświeżenie.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_VER = 'udt-v69';

// Pliki powłoki aplikacji (HTML/CSS/JS) z Firebase; wszystkie treści (JSON, zdjęcia, ikony, PDF) idą bezpośrednio z GitHub
const PRECACHE = [
  './',
  './index.html',
  './style.css?v=69',
  './app.js?v=69'
];

// ─── INSTALL: Precache kluczowych plików ────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VER).then(cache => cache.addAll(PRECACHE))
  );
});

// ─── ACTIVATE: Usuń stare wersje cache i odśwież otwarte karty ─
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const oldKeys = keys.filter(k => k !== CACHE_VER);
    await Promise.all(oldKeys.map(k => caches.delete(k)));
    await self.clients.claim();
    if (oldKeys.length > 0) {
      const windowClients = await self.clients.matchAll({ type: 'window' });
      windowClients.forEach(client => {
        if ('navigate' in client) {
          client.navigate(client.url).catch(() => {});
        }
      });
    }
  })());
});

// ─── FETCH: Strategia cachowania ────────────────────────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // NIE cachuj: panelu CMS (/admin), panelu instruktora (/panel), zapytań Range (audio/video), Firebase, Firestore, Telegram, metod innych niż GET
  if (
    e.request.method !== 'GET' ||
    e.request.headers.has('range') ||
    url.pathname.includes('/admin') ||
    url.pathname.includes('/panel') ||
    url.hostname.includes('firebaseio') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('telegram') ||
    url.hostname.includes('api.telegram') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  ) {
    return;
  }

  // Nawigacja HTML (index.html) — Network-First z ominięciem cache przeglądarki i fallbackiem do cache offline
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      caches.open(CACHE_VER).then(cache =>
        fetch(e.request, { cache: 'no-store' })
          .then(res => {
            if (res && res.ok) cache.put('./index.html', res.clone());
            return res;
          })
          .catch(() => cache.match('./index.html') || cache.match('./'))
      )
    );
    return;
  }

  // Pliki JSON z danymi z GitHub (pytania, obsługa techniczna, materiały szkoleniowe)
  // Network-First z zapisem pod czystym kluczem URL (bez ?t=...) dla pełnego wsparcia offline
  if (url.pathname.endsWith('.json')) {
    const cleanKey = url.origin + url.pathname;
    e.respondWith(
      caches.open(CACHE_VER).then(cache =>
        fetch(e.request)
          .then(res => {
            if (res && res.ok) {
              cache.put(cleanKey, res.clone());
            }
            return res;
          })
          .catch(() => cache.match(cleanKey))
      )
    );
    return;
  }

  // Wszystkie pozostałe zasoby statyczne (CSS, JS, ikony SVG, zdjęcia WebP/PNG) — Cache-First (0 ms)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok && (url.origin === self.location.origin || url.hostname.includes('raw.githubusercontent.com'))) {
          const clone = res.clone();
          caches.open(CACHE_VER).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
