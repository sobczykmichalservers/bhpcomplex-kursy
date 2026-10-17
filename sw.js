/* ═══════════════════════════════════════════════════════════════
   Service Worker — Testy UDT (v57)
   - Cache-first (0 ms, 0 transferu) dla HTML, CSS, JS, ikon SVG i zdjęć WebP/PNG
   - Stale-While-Revalidate dla plików JSON z pytaniami (natychmiastowy odczyt z cache + cicha aktualizacja w tle)
   Zmień CACHE_VER przy każdym deployu kodu, aby wymusić odświeżenie.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_VER = 'udt-v60';

// Pliki do precache przy instalacji (ładowane od razu, 0 opóźnień)
const PRECACHE = [
  './',
  './index.html',
  './style.css?v=60',
  './app.js?v=60',
  './img/bhp-icon.png',
  './icons/wozki-podnosnikowe.svg',
  './icons/wozki-specjalizowane.svg',
  './icons/podesty.svg',
  './icons/zurawie-przenosne.svg',
  './icons/zurawie-samojezdne.svg',
  './icons/suwnice.svg'
];

// ─── INSTALL: Precache kluczowych plików ────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VER).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ─── ACTIVATE: Usuń stare wersje cache ──────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── FETCH: Strategia cachowania ────────────────────────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // NIE cachuj: panelu CMS (/admin), panelu instruktora (/panel), Firebase, Firestore, Telegram, metod innych niż GET
  if (
    e.request.method !== 'GET' ||
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

  // Pliki JSON z danymi (pytania, obsługa techniczna, baza wiedzy, materiały)
  // Stale-While-Revalidate: jeśli są w cache -> zwróć NATYCHMIAST (0 ms!), a w tle odśwież cache
  if (url.pathname.endsWith('.json')) {
    e.respondWith(
      caches.open(CACHE_VER).then(cache =>
        cache.match(e.request).then(cached => {
          const networkFetch = fetch(e.request)
            .then(res => {
              if (res && res.ok) {
                cache.put(e.request, res.clone());
              }
              return res;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Wszystkie pozostałe zasoby statyczne (HTML, CSS, JS, ikony SVG, zdjęcia WebP/PNG) — Cache-First
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
