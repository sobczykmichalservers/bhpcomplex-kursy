/* ============================================================
   TESTY UDT — Logika SPA v8
   Light/Dark mode · Postęp w menu · Firebase Firestore Auth
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot, addDoc, collection, serverTimestamp, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOTQ5adgdw7DF9AWuNb0owaRsB9OvN1EU",
  authDomain: "bhpcomplex-kursy.firebaseapp.com",
  projectId: "bhpcomplex-kursy",
  storageBucket: "bhpcomplex-kursy.firebasestorage.app",
  messagingSenderId: "841216785179",
  appId: "1:841216785179:web:ce09cfc61b525cf231f1be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── SVG IKONY ──────────────────────────────────────────────

const IC_FILES = {
  crane_hds: 'zurawie-przenosne.svg',
  fork_std: 'wozki-podnosnikowe.svg',
  crane_mob: 'zurawie-samojezdne.svg',
  platform: 'podesty.svg',
  fork_spec: 'wozki-specjalizowane.svg',
  bridge: 'suwnice.svg'
};

const GITHUB_RAW = 'https://raw.githubusercontent.com/sobczykmichalservers/bhpcomplex-kursy/main';
const LS_SVG_CACHE = 'udt_svg_v3';

function ghUrl(p) {
  if (!p) return '';
  const s = String(p).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const clean = s.startsWith('/') ? s.substring(1) : s;
  return `${GITHUB_RAW}/${clean}`;
}

async function loadSvg(el, name) {
  if (I[name]) { if (el) el.innerHTML = I[name]; return; }
  try {
    const r = await fetch(ghUrl('icons/' + IC_FILES[name]));
    if (!r.ok) return;
    let svg = await r.text();
    svg = svg.replace(/<\?xml.*?\?>\s*/i, '')
      .replace(/fill="#[A-Fa-f0-9]{6}"/gi, 'fill="currentColor"')
      .replace(/<svg([^>]*)>/i, '<svg$1 fill="currentColor">');
    I[name] = svg;
    if (el) el.innerHTML = svg;
    // Zapisz do localStorage
    try {
      const c = JSON.parse(localStorage.getItem(LS_SVG_CACHE) || '{}');
      c[name] = svg;
      localStorage.setItem(LS_SVG_CACHE, JSON.stringify(c));
    } catch(e) {}
  } catch (e) { }
}

const I = {
  exc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="8" height="6" rx="1"/><path d="M8 17h6"/><path d="M5 14V8a1 1 0 0 1 1-1h2l3 3h4a1 1 0 0 1 1 1v3"/><path d="M15 7l-3-3"/></svg>`,
  chR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  chL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  aL: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  aR: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.3 9.3"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
  alrt: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  clk: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  book: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  brain: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>`,
  fChk: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>`,
  chkC: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  xC: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  rot: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  out: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  play: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  flag: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
  flagFill: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
  clip: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>`,
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,

  // Ikony motywu
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,

  // Pokaż/ukryj hasło
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`,

  // Ikony grup i podkategorii
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
  helmet: `<img src="${GITHUB_RAW}/img/bhp-icon.png" alt="Szkolenia BHP" class="bhp-ic-img" />`,
  file: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

// Odtwórz zapisane ikony SVG z localStorage
try {
  const _sc = JSON.parse(localStorage.getItem(LS_SVG_CACHE) || '{}');
  for (const k in _sc) if (_sc[k]) I[k] = _sc[k];
} catch(e) {}

// ─── STAŁE ──────────────────────────────────────────────────
const LT = 'ABCD';
const LS_AUTH = 'udt_auth';
const LS_PROGRESS = 'udt_progress';
const LS_THEME = 'udt_theme';
const LS_HARD = 'udt_hard';
const LS_VIEWED = 'udt_viewed';
const EXAM_N = 15;
const EXAM_T = 30 * 60;
const PASS_COUNT = 11;
const BHP_PASS_PCT = 80;

// Zmienna przechowująca pobrane ustawienia egzaminu z CMS
const EXAM_RULES = {};

const isBhpCat = c => typeof c === 'string' && c.startsWith('bhp');

// Liczba pytań i próg zaliczenia dla danego kursu
// UDT: 15 pytań, próg 11. BHP: liczba pytań i % z CMS (domyślnie 15 / 80%), próg zaokrąglony w górę.
function examConf(cat, totalQs) {
  if (isBhpCat(cat)) {
    const conf = EXAM_RULES[cat] || {};
    const want = parseInt(conf.count, 10) > 0 ? parseInt(conf.count, 10) : EXAM_N;
    const n = Math.max(1, Math.min(want, totalQs || want));
    const pctRaw = parseInt(conf.passPct, 10);
    const passPct = pctRaw > 0 && pctRaw <= 100 ? pctRaw : BHP_PASS_PCT;
    return { n, pass: Math.ceil(n * passPct / 100), passPct };
  }
  const n = Math.min(EXAM_N, totalQs || EXAM_N);
  return { n, pass: PASS_COUNT, passPct: null };
}

// ─── GENERATOR EGZAMINU ────────────────────────────
function generateExam(allQs, cat) {
  // BHP: bez losowania — pierwsze X pytań w kolejności z CMS
  if (isBhpCat(cat)) {
    return allQs.slice(0, examConf(cat, allQs.length).n);
  }

  const conf = EXAM_RULES[cat] || { rules: [] };
  const rules = conf.rules || [];

  let exam = [];
  let usedIds = new Set();

  for (const rule of rules) {
    let rulePool = allQs.filter(q => {
      if (usedIds.has(q.id)) return false;
      return rule.ranges.some(([min, max]) => q.id >= min && q.id <= max);
    });
    
    let pickedRule = shuf(rulePool).slice(0, rule.count);
    pickedRule.forEach(q => { exam.push(q); usedIds.add(q.id); });
  }

  // W razie gdyby zdefiniowane reguły nie ułożyły wystarczająco pytań (np. braki w konfiguracji CMS)
  // i egzamin miał mniej niż 15 pytań, dobieramy losowo cokolwiek ze wszystkich, żeby zapobiec błędom
  if (exam.length < 15) {
    let needed = 15 - exam.length;
    let fallback = shuf(allQs.filter(q => !usedIds.has(q.id))).slice(0, needed);
    fallback.forEach(q => exam.push(q));
  }

  return shuf(exam);
}

const CATS = {
  'wozki-podnosnikowe': { label: 'Wózki widłowe podnośnikowe', desc: 'Obsługa wózków jezdniowych podnośnikowych', ic: 'fork_std' },
  'wozki-specjalizowane': { label: 'Wózki widłowe specjalizowane', desc: 'Obsługa wózków jezdniowych specjalizowanych', ic: 'fork_spec' },
  'podesty': { label: 'Podesty ruchome przejezdne', desc: 'Obsługa podestów ruchomych przejezdnych', ic: 'platform' },
  'zurawie-przenosne': { label: 'Żurawie przenośne i przewoźne', desc: 'Obsługa żurawi HDS, przenośnych i przewoźnych', ic: 'crane_hds' },
  'zurawie-samojezdne': { label: 'Żurawie samojezdne', desc: 'Obsługa żurawi samojezdnych', ic: 'crane_mob' },
  'suwnice': { label: 'Suwnice', desc: 'Obsługa suwnic sterowanych z poziomu roboczego', ic: 'bridge' },
  'bhp-1': { label: 'BHP Moduł 1', desc: 'Szkolenie BHP — Moduł 1', ic: 'helmet' },
  'bhp-2': { label: 'BHP Moduł 2', desc: 'Szkolenie BHP — Moduł 2', ic: 'helmet' },
  'bhp-3': { label: 'BHP Moduł 3', desc: 'Szkolenie BHP — Moduł 3', ic: 'helmet' },
  'bhp-4': { label: 'BHP Moduł 4', desc: 'Szkolenie BHP — Moduł 4', ic: 'helmet' }
};

// ─── GRUPY (Poziom 1 nawigacji) ────────────────────────────
const GROUPS = {
  udt: {
    label: 'Szkolenia UDT',
    desc: 'TESTY UDT - Szkolenie operatorów urządzeń transportu bliskiego.',
    ic: 'udt_group',
    icons: ['wozki-podnosnikowe.svg', 'zurawie-przenosne.svg', 'podesty.svg', 'wozki-specjalizowane.svg', 'suwnice.svg'],
    cats: ['wozki-podnosnikowe', 'wozki-specjalizowane', 'podesty', 'zurawie-przenosne', 'zurawie-samojezdne', 'suwnice'],
  },
  bhp: {
    label: 'Szkolenia BHP',
    desc: 'Bezpieczeństwo i Higiena Pracy',
    ic: 'helmet',
    cats: ['bhp-1', 'bhp-2', 'bhp-3', 'bhp-4'],
  }
};

// ─── STAN ───────────────────────────────────────────────────
const S = {
  group: null, cat: null, qs: [], opisy: [], wiedza: [], materialy: [],
  bi: 0,
  ti: 0, tAns: false,
  eq: [], ei: 0, ea: [], et: EXAM_T, eInt: null,
  catTotals: {},
};

const $ = id => document.getElementById(id);
const appEl = $('app');

// ═══════════════════════════════════════════════════════════
// LIGHT / DARK MODE & POWIĘKSZANIE TEKSTU (Aa / Aa+ / Aa++)
// ═══════════════════════════════════════════════════════════
const themeBtn = $('theme-toggle');
const fontBtn = $('font-toggle');
const LS_FONT = 'udt_font_scale';

/** Ustawia motyw i aktualizuje ikonę przycisku */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeBtn.innerHTML = I.moon;
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeBtn.innerHTML = I.sun;
  }
}

/** Ustawia stopień powiększenia tekstu: 0 (100%), 1 (+12%), 2 (+22%) */
function applyFontScale(lvl) {
  const step = (lvl === 1 || lvl === 2) ? lvl : 0;
  if (step > 0) {
    document.documentElement.setAttribute('data-font', String(step));
  } else {
    document.documentElement.removeAttribute('data-font');
  }
  if (fontBtn) {
    fontBtn.classList.toggle('font-toggle--1', step === 1);
    fontBtn.classList.toggle('font-toggle--2', step === 2);
    fontBtn.innerHTML = step === 0
      ? `<span class="ft-a">A</span><span class="ft-sm">a</span>`
      : step === 1
      ? `<span class="ft-a">A</span><span class="ft-sm">a</span><span class="ft-plus">+</span>`
      : `<span class="ft-a">A</span><span class="ft-sm">a</span><span class="ft-plus">++</span>`;
  }
}

function initTheme() {
  const saved = localStorage.getItem(LS_THEME);
  applyTheme(saved === 'light' ? 'light' : 'dark');
  const savedFont = parseInt(localStorage.getItem(LS_FONT) || '0', 10);
  applyFontScale(savedFont);
}

themeBtn.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  localStorage.setItem(LS_THEME, next);
  applyTheme(next);
});

if (fontBtn) {
  fontBtn.addEventListener('click', () => {
    const cur = parseInt(document.documentElement.getAttribute('data-font') || '0', 10);
    const next = (cur + 1) % 3; // 0 -> 1 -> 2 -> 0
    localStorage.setItem(LS_FONT, String(next));
    applyFontScale(next);
  });
}

// ─── LIGHTBOX (Natywne gesty: Pinch, Pan, Double-Tap, Wheel) ─
const lb = $('lb'), lbi = $('lb-img'), lbx = $('lb-x');
const lbVp = $('lb-vp');
lbi.addEventListener('contextmenu', e => e.preventDefault());
lbVp.addEventListener('contextmenu', e => e.preventDefault());

// ── Stan zooma ──
const Z = { s: 1, tx: 0, ty: 0, MIN: 1, MAX: 5 };
let rafId = null;

// Renderuj transform przez RAF (płynność 60/120fps)
function zApply() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    // Kolejność: scale() translate() — przy center center daje focal point zoom
    lbi.style.transform = `scale(${Z.s}) translate(${Z.tx}px, ${Z.ty}px)`;
    rafId = null;
  });
}

// Oblicz wyświetlany rozmiar obrazka (bez transformacji)
function getDisplaySize() {
  const vw = lbVp.clientWidth * 0.96;  // max-width: 96vw
  const vh = lbVp.clientHeight * 0.92; // max-height: 92vh
  const nw = lbi.naturalWidth || 1;
  const nh = lbi.naturalHeight || 1;
  const ratio = Math.min(vw / nw, vh / nh, 1); // nigdy nie powiększaj ponad oryginał
  return { w: nw * ratio, h: nh * ratio };
}

// Ogranicz pan — obrazek nie może uciec za krawędź
function zClamp() {
  if (Z.s <= 1) { Z.tx = 0; Z.ty = 0; return; }
  const vw = lbVp.clientWidth, vh = lbVp.clientHeight;
  const d = getDisplaySize();
  // Maksymalne przesunięcie: ile obrazek wystaje poza viewport (w image-space)
  const maxTx = Math.max(0, (d.w * Z.s - vw) / (2 * Z.s));
  const maxTy = Math.max(0, (d.h * Z.s - vh) / (2 * Z.s));
  Z.tx = Math.min(maxTx, Math.max(-maxTx, Z.tx));
  Z.ty = Math.min(maxTy, Math.max(-maxTy, Z.ty));
}

function zReset() {
  Z.s = 1; Z.tx = 0; Z.ty = 0;
  zApply();
}

// Focal point zoom — skaluj celując w punkt (cx, cy) na ekranie
function zoomAt(newS, cx, cy) {
  newS = Math.min(Z.MAX, Math.max(Z.MIN, newS));
  if (newS <= 1) { zReset(); return; }
  const vr = lbVp.getBoundingClientRect();
  // Punkt w image-space (relatywnie do środka viewportu, przeliczony na skalę)
  const px = (cx - vr.left - vr.width / 2) / Z.s;
  const py = (cy - vr.top - vr.height / 2) / Z.s;
  // Przesuń translate, żeby px/py zostało w tym samym miejscu na ekranie
  const ratio = newS / Z.s;
  Z.tx += px * (1 - ratio);
  Z.ty += py * (1 - ratio);
  Z.s = newS;
  zClamp();
  zApply();
}

// ── Otwarcie / Zamknięcie ──
function olb(src) {
  lbi.src = src;
  zReset();
  lb.classList.add('on');
}
function clb() {
  lb.classList.remove('on');
  setTimeout(() => { lbi.src = ''; zReset(); }, 300);
}

lbx.onclick = clb;
lb.onclick = e => { if (e.target === lb) clb(); };

// ══════════════════════════════════════════════════════════════
// DOUBLE TAP / DOUBLE CLICK
// ══════════════════════════════════════════════════════════════
let lastTap = 0;
lbVp.addEventListener('click', e => {
  const now = Date.now();
  if (now - lastTap < 300) {
    e.preventDefault();
    lbi.classList.add('lb__img--anim');
    if (Z.s > 1.05) {
      zReset();
    } else {
      zoomAt(2.5, e.clientX, e.clientY);
    }
    lbi.addEventListener('transitionend', () => lbi.classList.remove('lb__img--anim'), { once: true });
    lastTap = 0;
  } else {
    lastTap = now;
  }
});

// ══════════════════════════════════════════════════════════════
// MOUSE DRAG / PAN (PC — mousedown/move/up/leave)
// ══════════════════════════════════════════════════════════════
let mDrag = false, msx = 0, msy = 0;

lbVp.addEventListener('mousedown', e => {
  if (Z.s <= 1) return;
  e.preventDefault();
  mDrag = true;
  msx = e.clientX / Z.s - Z.tx;
  msy = e.clientY / Z.s - Z.ty;
});
lbVp.addEventListener('mousemove', e => {
  if (!mDrag) return;
  e.preventDefault();
  Z.tx = e.clientX / Z.s - msx;
  Z.ty = e.clientY / Z.s - msy;
  zClamp();
  zApply();
});
lbVp.addEventListener('mouseup', () => { mDrag = false; });
lbVp.addEventListener('mouseleave', () => { mDrag = false; });

// ══════════════════════════════════════════════════════════════
// TOUCH DRAG / PAN (Mobile — jeden palec)
// ══════════════════════════════════════════════════════════════
let tDrag = false, tsx = 0, tsy = 0;

lbVp.addEventListener('touchstart', e => {
  if (e.touches.length === 1 && Z.s > 1) {
    tDrag = true;
    tsx = e.touches[0].clientX / Z.s - Z.tx;
    tsy = e.touches[0].clientY / Z.s - Z.ty;
  }
}, { passive: true });

lbVp.addEventListener('touchmove', e => {
  // Jeden palec — pan
  if (tDrag && e.touches.length === 1 && !pinching) {
    e.preventDefault();
    Z.tx = e.touches[0].clientX / Z.s - tsx;
    Z.ty = e.touches[0].clientY / Z.s - tsy;
    zClamp();
    zApply();
  }
}, { passive: false });

lbVp.addEventListener('touchend', e => {
  if (e.touches.length === 0) tDrag = false;
});

// ══════════════════════════════════════════════════════════════
// PINCH-TO-ZOOM (Mobile — dwa palce)
// ══════════════════════════════════════════════════════════════
let pinching = false, pinchDist = 0, pinchS = 1;

lbVp.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    pinching = true;
    tDrag = false; // wyłącz pan przy pinczu
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchDist = Math.hypot(dx, dy);
    pinchS = Z.s;
  }
}, { passive: false });

lbVp.addEventListener('touchmove', e => {
  if (!pinching || e.touches.length !== 2) return;
  e.preventDefault();
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  const dist = Math.hypot(dx, dy);
  const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
  const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
  const newS = pinchS * (dist / pinchDist);
  zoomAt(newS, cx, cy);
}, { passive: false });

lbVp.addEventListener('touchend', e => {
  if (e.touches.length < 2) pinching = false;
});

// ══════════════════════════════════════════════════════════════
// MOUSE WHEEL ZOOM (PC)
// ══════════════════════════════════════════════════════════════
lbVp.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.3 : 0.3;
  zoomAt(Z.s + delta, e.clientX, e.clientY);
}, { passive: false });

// ─── LOCAL STORAGE (auth globalne dla UDT + per moduł dla BHP) ───
const LS_AUTH_TS = 'udt_auth_ts';
const AUTH_TTL_MS = 12 * 60 * 60 * 1000; // 12 godzin bez ponownego odpytywania Firebase

function getAuthMap() {
  try {
    const raw = localStorage.getItem(LS_AUTH);
    if (!raw) return {};
    const a = JSON.parse(raw);
    return (typeof a === 'object' && a !== null) ? a : {};
  } catch {
    return {};
  }
}

function getAuth(c) {
  const a = getAuthMap();
  if (!c) return a;
  if (isBhpCat(c)) return a[c] || '';
  // Wszystkie kursy UDT współdzielą jedno hasło globalne (__udt__)
  return a['__udt__'] || a[c] || '';
}

function setAuth(c, p) {
  const a = getAuthMap();
  if (isBhpCat(c)) {
    a[c] = p;
  } else {
    a['__udt__'] = p;
    if (c) a[c] = p;
  }
  localStorage.setItem(LS_AUTH, JSON.stringify(a));
  markAuthVerified(c, p);
}

function markAuthVerified(c, p) {
  const key = isBhpCat(c) ? c : '__udt__';
  SESSION_AUTH_OK[key] = p;
  if (c) SESSION_AUTH_OK[c] = p;
  try {
    const ts = JSON.parse(localStorage.getItem(LS_AUTH_TS) || '{}');
    ts[key] = { p, t: Date.now() };
    localStorage.setItem(LS_AUTH_TS, JSON.stringify(ts));
  } catch {}
}

function isAuthRecentlyVerified(c, p) {
  if (!p) return false;
  const key = isBhpCat(c) ? c : '__udt__';
  if (SESSION_AUTH_OK[key] === p || SESSION_AUTH_OK[c] === p) return true;
  try {
    const ts = JSON.parse(localStorage.getItem(LS_AUTH_TS) || '{}');
    const entry = ts[key];
    if (entry && entry.p === p && (Date.now() - entry.t) < AUTH_TTL_MS) {
      SESSION_AUTH_OK[key] = p;
      if (c) SESSION_AUTH_OK[c] = p;
      return true;
    }
  } catch {}
  return false;
}

function delAuth(c) {
  if (c) {
    const a = getAuthMap();
    if (isBhpCat(c)) {
      delete a[c];
      delete SESSION_AUTH_OK[c];
    } else {
      delete a['__udt__'];
      for (const k of (GROUPS.udt ? GROUPS.udt.cats : [])) {
        delete a[k];
        delete SESSION_AUTH_OK[k];
      }
      delete SESSION_AUTH_OK['__udt__'];
    }
    localStorage.setItem(LS_AUTH, JSON.stringify(a));
    try {
      const ts = JSON.parse(localStorage.getItem(LS_AUTH_TS) || '{}');
      delete ts[isBhpCat(c) ? c : '__udt__'];
      localStorage.setItem(LS_AUTH_TS, JSON.stringify(ts));
    } catch {}
  } else {
    localStorage.removeItem(LS_AUTH);
    localStorage.removeItem(LS_AUTH_TS);
    for (const k in SESSION_AUTH_OK) delete SESSION_AUTH_OK[k];
  }
}

function getSaved(c) { return parseInt(localStorage.getItem('udt_last_' + c)) || 0; }
function setSaved(c, i) { localStorage.setItem('udt_last_' + c, String(i)); }
function delSaved(c) { localStorage.removeItem('udt_last_' + c); }

function getProgress() { try { return JSON.parse(localStorage.getItem(LS_PROGRESS)) || {}; } catch { return {}; } }
function markDone(cat, qId) {
  const p = getProgress();
  if (!p[cat]) p[cat] = [];
  if (!p[cat].includes(qId)) p[cat].push(qId);
  localStorage.setItem(LS_PROGRESS, JSON.stringify(p));
}
function getDoneCount(cat) { const p = getProgress(); return p[cat] ? p[cat].length : 0; }

// ─── PRZEJRZANE W BAZIE PYTAŃ (osobno od treningu) ──────────
function getViewed() { try { return JSON.parse(localStorage.getItem(LS_VIEWED)) || {}; } catch { return {}; } }
function markViewed(cat, qId) {
  const v = getViewed();
  if (!v[cat]) v[cat] = [];
  if (!v[cat].includes(qId)) { v[cat].push(qId); localStorage.setItem(LS_VIEWED, JSON.stringify(v)); }
}
function getViewedCount(cat) { const v = getViewed(); return v[cat] ? v[cat].length : 0; }

// ─── SCHOWEK TRUDNYCH PYTAŃ ─────────────────────────────────
function getHard() { try { return JSON.parse(localStorage.getItem(LS_HARD)) || {}; } catch { return {}; } }
function isHard(cat, qId) { const h = getHard(); return h[cat] ? h[cat].includes(qId) : false; }
function toggleHard(cat, qId) {
  const h = getHard();
  if (!h[cat]) h[cat] = [];
  const idx = h[cat].indexOf(qId);
  if (idx >= 0) h[cat].splice(idx, 1);
  else h[cat].push(qId);
  localStorage.setItem(LS_HARD, JSON.stringify(h));
  return idx < 0; // true = dodano, false = usunięto
}
function removeHard(cat, qId) {
  const h = getHard();
  if (!h[cat]) return;
  h[cat] = h[cat].filter(id => id !== qId);
  localStorage.setItem(LS_HARD, JSON.stringify(h));
}
function getHardCount(cat) { const h = getHard(); return h[cat] ? h[cat].length : 0; }

// ─── NARZĘDZIA ──────────────────────────────────────────────
function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function shuf(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

// ─── FIREBASE AUTH (oszczędzanie limitów — brak onSnapshot, weryfikacja z cache) ───
function clearAuthListener() {}
function startAuthListener() {}

async function verifyAuth(grp, cat, login, pass) {
  if (grp === 'bhp' || isBhpCat(cat)) {
    const dSnap = await getDoc(doc(db, "konta-bhp", login));
    if (dSnap.exists()) {
      const d = dSnap.data();
      if (d.wygasa) {
        const expMs = typeof d.wygasa.toMillis === 'function' ? d.wygasa.toMillis() : new Date(d.wygasa).getTime();
        if (expMs && expMs < Date.now()) {
          deleteDoc(doc(db, "konta-bhp", login)).catch(() => {});
          return false;
        }
      }
      if (d.haslo === pass && (d.kurs === cat || d.kurs === 'wszystkie')) {
        return true;
      }
    }
    return false;
  } else {
    const dSnap = await getDoc(doc(db, "kursy-udt", 'udt-haslo'));
    if (dSnap.exists() && dSnap.data().haslo === pass) {
      return true;
    }
    return false;
  }
}

const Q_CACHE = {};
const SESSION_AUTH_OK = {};
let SHARED_UDT_MAT_CACHE = null;

async function getQs(c) {
  if (Q_CACHE[c]) {
    S.qs = Q_CACHE[c].qs;
    S.opisy = Q_CACHE[c].opisy;
    S.wiedza = Q_CACHE[c].wiedza;
    S.materialy = Q_CACHE[c].materialy;
    EXAM_RULES[c] = Q_CACHE[c].rules;
    S.catTotals[c] = S.qs.length;
    return S.qs;
  }

  const bhp = isBhpCat(c);
  const cb = `?t=${Math.floor(Date.now() / 30000)}`;
  // Wspólna kolekcja "Materiały szkoleniowe" dla wszystkich kursów UDT (data/udt_materialy.json z GitHub)
  const udtMatPromise = bhp
    ? Promise.resolve({ items: [] })
    : (SHARED_UDT_MAT_CACHE
        ? Promise.resolve({ items: SHARED_UDT_MAT_CACHE })
        : fetch(ghUrl('data/udt_materialy.json') + cb).then(r => r.ok ? r.json() : { items: [] }));

  // Równoległe pobieranie plików naraz bezpośrednio z GitHub (0 zużycia transferu Firebase!)
  const [qRes, opRes, wiRes, matRes, setRes] = await Promise.allSettled([
    fetch(ghUrl(`data/${c}.json`) + cb).then(r => r.ok ? r.json() : []),
    bhp ? Promise.resolve({ items: [] }) : fetch(ghUrl(`data/${c}_opisy.json`) + cb).then(r => r.ok ? r.json() : { items: [] }),
    udtMatPromise,
    bhp ? fetch(ghUrl(`data/${c}_materialy.json`) + cb).then(r => r.ok ? r.json() : { items: [] }) : Promise.resolve({ items: [] }),
    fetch(ghUrl(`data/${c}_ustawienia.json`) + cb).then(r => r.ok ? r.json() : { rules: [] })
  ]);

  const data = qRes.status === 'fulfilled' ? qRes.value : [];
  const dOp = opRes.status === 'fulfilled' ? opRes.value : { items: [] };
  const dWi = wiRes.status === 'fulfilled' ? wiRes.value : { items: [] };
  const dMat = matRes.status === 'fulfilled' ? matRes.value : { items: [] };
  const dSet = setRes.status === 'fulfilled' ? setRes.value : { rules: [] };

  const rawQs = Array.isArray(data) ? data : (data.questions || []);
  const qs = rawQs.map(q => {
    const item = { ...q };
    const v = parseInt(item.correct, 10);
    if (v >= 1) item.correct = v - 1;
    if (item.image) item.image = ghUrl(item.image);
    if (item.audio) item.audio = ghUrl(item.audio);
    return item;
  });

  const normItems = (arr) => (arr || []).map(q => {
    const item = { ...q };
    if (item.image) item.image = ghUrl(item.image);
    if (item.file) item.file = ghUrl(item.file);
    if (item.audio) item.audio = ghUrl(item.audio);
    return item;
  });

  const opisy = normItems(dOp.items);
  const wiedza = normItems(dWi.items);
  if (!bhp && wiedza.length > 0) SHARED_UDT_MAT_CACHE = wiedza;
  const materialy = normItems(dMat.items);

  const rules = {
    count: dSet.count,
    passPct: dSet.pass_pct,
    rules: (dSet.rules || []).map(r => ({
      count: r.count,
      ranges: [[r.min, r.max]]
    }))
  };

  Q_CACHE[c] = { qs, opisy, wiedza, materialy, rules };
  S.qs = qs;
  S.opisy = opisy;
  S.wiedza = wiedza;
  S.materialy = materialy;
  EXAM_RULES[c] = rules;
  S.catTotals[c] = qs.length;

  return S.qs;
}

// ─── NAWIGACJA WIDOKÓW, URL ROUTING I ZARZĄDZANIE MAIN-HEADER ───
const topBk = $('top-bk');
const topLo = $('top-lo');
const topTitle = $('top-title');

const VIEW_TO_SLUG = {
  cheat: 'baza',
  train: 'trening',
  resume: 'wznow',
  exam: 'egzamin',
  opisyList: 'obsluga',
  wiedzaList: 'materialy',
  materialyList: 'materialy',
  clipboard: 'schowek',
  signature: 'wynik',
  result: 'wynik'
};

const SLUG_TO_VIEW_UDT = {
  baza: 'cheat',
  trening: 'train',
  wznow: 'resume',
  obsluga: 'opisyList',
  materialy: 'wiedzaList',
  schowek: 'clipboard'
};

const SLUG_TO_VIEW_BHP = {
  materialy: 'materialyList'
};

function buildRoutePath(v) {
  if (v === 'home' || (!S.group && !S.cat)) return '/';
  const grp = S.group || (S.cat ? (isBhpCat(S.cat) ? 'bhp' : 'udt') : null);
  if (v === 'subcats' || !S.cat) return grp ? `/${grp}` : '/';
  const base = `/${grp}/${S.cat}`;
  if (v === 'menu' || v === 'login') return base;
  const slug = VIEW_TO_SLUG[v];
  return slug ? `${base}/${slug}` : base;
}

function go(v, pushHistory = true) {
  if (S.eInt && v !== 'exam') { clearInterval(S.eInt); S.eInt = null; }
  if (v !== 'cheat') S.cheatSeqAudio = false;
  stopSharedAudio();
  appEl.querySelectorAll('audio').forEach(a => { try { a.pause(); } catch (_) {} });
  S.view = v;

  const targetPath = buildRoutePath(v);
  if (window.location.pathname !== targetPath) {
    if (pushHistory) {
      history.pushState({ view: v, group: S.group, cat: S.cat }, '', targetPath);
    } else {
      history.replaceState({ view: v, group: S.group, cat: S.cat }, '', targetPath);
    }
  }

  // Title logic
  if (S.cat && !['home', 'subcats'].includes(v)) {
    topTitle.innerHTML = CATS[S.cat].label;
  } else if (v === 'subcats' && S.group) {
    topTitle.innerHTML = GROUPS[S.group].label;
  } else {
    topTitle.innerHTML = `Testy <span class="a">UDT</span>`;
  }

  // Wróć (Back) logic
  if (['home'].includes(v)) {
    topBk.style.display = 'none';
  } else {
    topBk.style.display = '';
    topBk.onclick = () => {
      if (v === 'subcats') { S.group = null; S.cat = null; go('home'); }
      else if (v === 'login' || v === 'menu') { 
        S.cat = null; 
        go('subcats');
      }
      else {
        if (v === 'exam') {
          if (!confirm("Czy na pewno chcesz przerwać egzamin i wrócić do menu?")) return;
          clearInterval(S.eInt); S.eInt = null;
        }
        go('menu');
      }
    };
  }

  // Wyloguj (Logout) logic
  if (['menu', 'cheat', 'train', 'resume', 'exam', 'signature', 'result', 'clipboard', 'opisyList', 'wiedzaList', 'materialyList', 'bhpList'].includes(v)) {
    topLo.style.display = '';
    topLo.onclick = () => {
      clearAuthListener();
      if (S.eInt) { clearInterval(S.eInt); S.eInt = null; }
      delAuth(S.cat);
      S.cat = null;
      go('subcats');
    };
  } else {
    topLo.style.display = 'none';
  }

  const m = {
    home: vHome, subcats: vSubcats, login: vLogin, menu: vMenu, resume: vResume,
    cheat: vCheat, train: vTrain, exam: vExam, signature: vSignature, result: vResult, clipboard: vClipboard,
    opisyList: vOpisyList, wiedzaList: vWiedzaList, materialyList: vMaterialyList, bhpList: vBhpList
  };
  if (m[v]) m[v]();
  document.body.className = 'view-' + v;

  const el = appEl.firstElementChild;
  if (el) {
    el.classList.add('v-in');

    // Dynamic footer injection inside the scrolling element
    if (v === 'home') {
      const footer = document.createElement('footer');
      footer.className = 'app-footer';
      footer.innerHTML = '<button class="btn-privacy" id="btn-privacy">Polityka Prywatności</button>';
      el.appendChild(footer);
    }
  }
}

// Global click event for Privacy Policy
appEl.addEventListener('click', e => {
  if (e.target.id === 'btn-privacy') {
    const polModal = $('pol-modal');
    if (polModal) polModal.classList.add('on');
  }
});

// ═════════════════════════════════════════════════════════════
// WIDOK 1a — Ekran główny: GRUPY (Poziom 1)
// ═════════════════════════════════════════════════════════════
function vHome() {
  appEl.innerHTML = `<div>
    <header class="hdr"><p>Wybierz rodzaj szkolenia</p></header>
    <div class="grid" id="g"></div>
  </div>`;

  const g = $('g');
  for (const [k, grp] of Object.entries(GROUPS)) {
    const d = document.createElement('div');
    d.className = 'crd'; d.id = 'g-' + k;
    d.style.width = '100%';
    d.style.maxWidth = '360px';
    d.innerHTML = `<div class="crd__ic" data-ic="${grp.ic}"></div>
      <div class="crd__t">${grp.label}</div>
      <div class="crd__d">${grp.desc}</div>
      <span class="crd__arr">${I.chR}</span>`;
    d.onclick = () => { 
      S.group = k;
      go('subcats'); 
    };
    g.appendChild(d);

    // Render ikon
    if (grp.icons) {
      // Grupa z wieloma ikonkami (np. UDT) — ładowane z GitHub (0 zużycia Firebase + cache w SW)
      const icEl = d.querySelector('.crd__ic');
      icEl.classList.add('crd__ic--multi');
      icEl.innerHTML = '';
      grp.icons.forEach(file => {
        const img = document.createElement('img');
        img.src = ghUrl('icons/' + file);
        img.alt = '';
        img.className = 'crd__ic-img';
        icEl.appendChild(img);
      });
    } else if (IC_FILES[grp.ic]) {
      loadSvg(d.querySelector('.crd__ic'), grp.ic);
    } else {
      d.querySelector('.crd__ic').innerHTML = I[grp.ic] || '';
    }
  }
}

// ═════════════════════════════════════════════════════════════
// WIDOK 1b — Podkategorie: MASZYNY / SZKOLENIA (Poziom 2)
// ═════════════════════════════════════════════════════════════
function vSubcats() {
  const grp = GROUPS[S.group];
  appEl.innerHTML = `<div>
    <header class="hdr"><p>Wybierz kategorię i przygotuj się do egzaminu</p></header>
    <div class="grid" id="g"></div>
  </div>`;

  const g = $('g');
  for (const k of grp.cats) {
    const c = CATS[k];
    const d = document.createElement('div');
    d.className = 'crd crd--course' + (c.locked ? ' crd--locked' : ''); d.id = 'c-' + k;
    d.innerHTML = `<div class="crd__ic" data-ic="${c.ic}"></div>
      <div class="crd__t">${c.label}</div>
      <div class="crd__d">${c.locked ? '🔒 Moduł w przygotowaniu' : c.desc}</div>
      <span class="crd__arr">${I.chR}</span>`;
    d.onclick = () => {
      if (c.locked) { alert('Moduł w przygotowaniu — wkrótce dostępne'); return; }
      d.classList.add('crd--loading');
      pickCat(k);
    };
    d.onmouseenter = () => {
      // Prefetch danych kursu w tle przy najechaniu myszką
      getQs(k);
    };
    g.appendChild(d);
    if (IC_FILES[c.ic]) {
      loadSvg(d.querySelector('.crd__ic'), c.ic);
    } else {
      d.querySelector('.crd__ic').innerHTML = I[c.ic] || '';
    }
  }
}

function applyRestoredSubstate(k, targetView) {
  if (targetView === 'cheat') {
    const savedBi = parseInt(sessionStorage.getItem('udt_bi_' + k) || '0', 10);
    S.bi = clamp(isNaN(savedBi) ? 0 : savedBi, 0, Math.max(0, S.qs.length - 1));
  } else if (targetView === 'train') {
    S.ti = clamp(getSaved(k), 0, Math.max(0, S.qs.length - 1));
    S.tAns = false;
  }
}

async function pickCat(k, targetView = 'menu', pushHistory = true) {
  S.cat = k;
  S.group = isBhpCat(k) ? 'bhp' : 'udt';
  const sv = getAuth(k);
  if (sv) {
    try {
      if (S.group === 'bhp' || isBhpCat(k)) {
        const [lgn, pw] = sv.split('::');
        if (lgn && pw) {
          const authPromise = isAuthRecentlyVerified(k, sv)
            ? Promise.resolve(true)
            : verifyAuth('bhp', k, lgn, pw);
          const [authOk] = await Promise.all([authPromise, getQs(k)]);
          if (authOk) {
            markAuthVerified(k, sv);
            S.studentLogin = lgn;
            applyRestoredSubstate(k, targetView);
            go(targetView, pushHistory);
            return;
          }
        }
      } else {
        const authPromise = isAuthRecentlyVerified(k, sv)
          ? Promise.resolve(true)
          : verifyAuth('udt', k, null, sv);
        const [authOk] = await Promise.all([authPromise, getQs(k)]);
        if (authOk) {
          markAuthVerified(k, sv);
          applyRestoredSubstate(k, targetView);
          go(targetView, pushHistory);
          return;
        }
      }
    } catch (e) {
      // Brak połączenia — NIE kasuj hasła, wpuść na podstawie zapisanego auth
      await getQs(k);
      if (S.group === 'bhp' || isBhpCat(k)) {
        const [lgn] = sv.split('::');
        S.studentLogin = lgn;
      }
      applyRestoredSubstate(k, targetView);
      go(targetView, pushHistory);
      return;
    }
    delAuth(k);
  }
  S.pendingView = targetView !== 'menu' ? targetView : null;
  go('login', pushHistory);
}

// ═════════════════════════════════════════════════════════════
// WIDOK 2 — Logowanie
// ═════════════════════════════════════════════════════════════
function vLogin() {
  const c = CATS[S.cat];
  const isBhp = S.group === 'bhp' || isBhpCat(S.cat);
  const savedBhpLgn = isBhp ? (localStorage.getItem('udt_bhp_lgn_' + S.cat) || '') : '';
  
  let loginHtml = '';
  if (isBhp) {
    loginHtml = `
      <div class="fld"><label for="lgn">LOGIN</label>
        <input type="text" id="lgn" name="username" value="${savedBhpLgn}" placeholder="Wpisz swój login..." autocomplete="username"/>
      </div>
    `;
  } else {
    // Ukryte pole username dla menedżerów haseł w przeglądarce
    loginHtml = `<input type="text" name="username" value="kursant-udt" autocomplete="username" style="display:none" aria-hidden="true" tabindex="-1"/>`;
  }

  appEl.innerHTML = `<div>
    <form class="lbox" id="login-form" style="margin-top:0" autocomplete="on" onsubmit="return false">
      <h2>${c.label}</h2><p>${isBhp ? 'Zaloguj się na swoje konto' : 'Wpisz hasło otrzymane od instruktora'}</p>
      ${loginHtml}
      <div class="fld"><label for="pw">HASŁO</label>
        <div class="pw-wrapper">
          <input type="password" id="pw" name="password" placeholder="••••••••" autocomplete="current-password"/>
          <button type="button" class="pw-eye" id="pw-eye" aria-label="Pokaż hasło">${I.eye}</button>
        </div>
        <div class="fld-err" id="er">${I.alrt}<span></span></div>
      </div>
      <label class="chk"><input type="checkbox" id="rem" checked/> Zapamiętaj mnie</label>
      <div style="text-align: center;">
        <button type="submit" class="btn btn--a" id="sub" style="min-width: 200px;">${I.key} <span>Zaloguj się</span></button>
      </div>
    </form></div>`;

  const form = $('login-form'), pw = $('pw'), er = $('er'), rem = $('rem'), btn = $('sub'), pwEye = $('pw-eye');
  const lgn = $('lgn'); // Może być null dla UDT

  pwEye.onclick = () => {
    if (pw.type === 'password') {
      pw.type = 'text';
      pwEye.innerHTML = I.eyeOff;
    } else {
      pw.type = 'password';
      pwEye.innerHTML = I.eye;
    }
  };

  async function tryLog(e) {
    if (e && e.preventDefault) e.preventDefault();
    const v = pw.value.trim();
    const lVal = lgn ? lgn.value.trim() : null;

    pw.classList.remove('has-error');
    if (lgn) lgn.classList.remove('has-error');
    er.classList.remove('on');

    if (isBhp && !lVal) {
      lgn.classList.add('has-error');
      sErr(er, 'Wpisz login');
      return;
    }

    if (!v) {
      pw.classList.add('has-error');
      sErr(er, 'Wpisz hasło');
      return;
    }

    btn.disabled = true;
    const btnSpan = btn.querySelector('span');
    btnSpan.textContent = 'Sprawdzanie...';

    try {
      const authOk = await verifyAuth(S.group, S.cat, lVal, v);
      if (authOk) {
        const authKey = isBhp ? `${lVal}::${v}` : v;
        if (isBhp && lVal) {
          try { localStorage.setItem('udt_bhp_lgn_' + S.cat, lVal); } catch {}
        }
        if (rem.checked) {
          setAuth(S.cat, authKey);
        } else {
          markAuthVerified(S.cat, authKey);
        }
        if (isBhp) S.studentLogin = lVal;
        await getQs(S.cat);
        const dest = S.pendingView || 'menu';
        S.pendingView = null;
        applyRestoredSubstate(S.cat, dest);
        go(dest);
      } else {
        pw.classList.add('has-error');
        sErr(er, isBhp ? 'Nieprawidłowy login, hasło lub brak dostępu' : 'Nieprawidłowe hasło');
        pw.value = ''; pw.focus();
        btn.disabled = false;
        btnSpan.textContent = 'Zaloguj się';
      }
    } catch (e) {
      sErr(er, 'Błąd połączenia z bazą');
      btn.disabled = false;
      btnSpan.textContent = 'Zaloguj się';
    }
  }
  form.onsubmit = tryLog;
  btn.onclick = tryLog;
  requestAnimationFrame(() => (isBhp && lgn && !lgn.value ? lgn : pw).focus());
}
function sErr(el, m) { el.querySelector('span').textContent = m; el.classList.add('on'); }

// ═════════════════════════════════════════════════════════════
// WIDOK 3 — Menu (postęp kategorii + tryby)
// ═════════════════════════════════════════════════════════════
function vMenu() {
  const c = CATS[S.cat];
  const isBhp = S.group === 'bhp';

  if (isBhp) {
    const ec = examConf(S.cat, S.qs.length);
    const matCount = S.materialy ? S.materialy.length : 0;
    appEl.innerHTML = `<div>
      <header class="hdr" style="padding-top:4px">
        <h1 style="font-size:1.5rem">Wybierz <span class="a">tryb</span></h1>
        <p>${c.label}</p>
      </header>
      <div class="modes">
        <button class="mbtn" id="m-mat">
          <div class="mbtn__ic mbtn__ic--b">${I.book}</div>
          <div class="mbtn__body">
            <div class="mbtn__t">Materiały szkoleniowe</div>
            <div class="mbtn__d">${matCount > 0 ? matCount + ' zagadnień szkoleniowych' : 'Materiały i zagadnienia do szkolenia'}</div>
          </div>
        </button>
        <button class="mbtn" id="m-e">
          <div class="mbtn__ic mbtn__ic--r">${I.fChk}</div>
          <div class="mbtn__body">
            <div class="mbtn__t">Egzamin</div>
            <div class="mbtn__d">${ec.n} pytań • 30 min • próg: ${ec.pass}/${ec.n} (${ec.passPct}%)</div>
          </div>
        </button>
      </div>
    </div>`;

    $('m-mat').onclick = () => go('materialyList');
    $('m-e').onclick = startExam;
    return;
  }

  const total = S.qs.length;
  const n = Math.min(EXAM_N, total);
  const passInfo = `${PASS_COUNT}/${n}`;
  const done = Math.min(getDoneCount(S.cat), total);
  const donePct = total > 0 ? Math.round((done / total) * 100) : 0;
  const viewed = Math.min(getViewedCount(S.cat), total);
  const viewedPct = total > 0 ? Math.round((viewed / total) * 100) : 0;

  appEl.innerHTML = `<div class="udt-menu-wrap">
    <header class="hdr hdr--compact">
      <h1 style="font-size:1.3rem">Wybierz <span class="a">tryb</span></h1>
    </header>
    <div class="modes modes--udt">
      <button class="mbtn" id="ma">
        <div class="mbtn__ic mbtn__ic--b">${I.book}</div>
        <div class="mbtn__body">
          <div class="mbtn__top">
            <span class="mbtn__t">Baza pytań (Ściąga)</span>
            <span class="mbtn__badge mbtn__badge--b">${viewed} / ${total}</span>
          </div>
          <div class="mbtn__d">Przejrzane w bazie: ${viewed} / ${total} pytań (${viewedPct}%)</div>
          <div class="mbtn__bar"><div class="mbtn__bar-fill mbtn__bar-fill--b" style="width:${viewedPct}%"></div></div>
        </div>
      </button>
      <button class="mbtn" id="mb">
        <div class="mbtn__ic mbtn__ic--g">${I.brain}</div>
        <div class="mbtn__body">
          <div class="mbtn__top">
            <span class="mbtn__t">Trening (Krok po kroku)</span>
            <span class="mbtn__badge mbtn__badge--g">${done} / ${total}</span>
          </div>
          <div class="mbtn__d">Przerobione w treningu: ${done} / ${total} pytań (${donePct}%)</div>
          <div class="mbtn__bar"><div class="mbtn__bar-fill" style="width:${donePct}%"></div></div>
        </div>
      </button>
      <button class="mbtn" id="mc">
        <div class="mbtn__ic mbtn__ic--r">${I.fChk}</div>
        <div class="mbtn__body">
          <div class="mbtn__t">Egzamin (Losowe)</div>
          <div class="mbtn__d">${n} pytań • 30 min • próg: ${passInfo}</div>
        </div>
      </button>
      <button class="mbtn" id="mf">
        <div class="mbtn__ic mbtn__ic--b">${I.file}</div>
        <div class="mbtn__body">
          <div class="mbtn__t">Obsługa techniczna codzienna</div>
          <div class="mbtn__d">${S.opisy && S.opisy.length ? S.opisy.length + ' pytań w bazie' : 'Pytania i odpowiedzi obsługi technicznej'}</div>
        </div>
      </button>
      <button class="mbtn" id="mg">
        <div class="mbtn__ic mbtn__ic--b">${I.file}</div>
        <div class="mbtn__body">
          <div class="mbtn__t">Materiały szkoleniowe</div>
          <div class="mbtn__d">${S.wiedza && S.wiedza.length ? S.wiedza.length + ' zagadnień w bazie' : 'Materiały i zagadnienia szkoleniowe'}</div>
        </div>
      </button>
      <button class="mbtn mbtn--hard" id="md">
        <div class="mbtn__ic mbtn__ic--y">${I.clip}</div>
        <div class="mbtn__body">
          <div class="mbtn__t">Trudne pytania (Schowek)</div>
          <div class="mbtn__d"><span id="hard-count">${getHardCount(S.cat)}</span> zapisanych pytań • pokaż instruktorowi</div>
        </div>
      </button>
    </div>
  </div>`;

  $('ma').onclick = () => { S.bi = 0; go('cheat'); };
  $('mb').onclick = () => {
    const sv = getSaved(S.cat);
    if (sv > 0 && sv < S.qs.length) go('resume');
    else { S.ti = 0; S.tAns = false; go('train'); }
  };
  $('mc').onclick = startExam;
  $('mf').onclick = () => go('opisyList');
  $('mg').onclick = () => go('wiedzaList');
  $('md').onclick = () => go('clipboard');
}

// ═════════════════════════════════════════════════════════════
// WIDOK 3b — Dialog kontynuacji
// ═════════════════════════════════════════════════════════════
function vResume() {
  const sv = getSaved(S.cat);
  appEl.innerHTML = `<div>
    <div class="resume-box" style="margin-top:0">
      <h2>Masz zapisany postęp</h2>
      <p>Ostatnio skończyłeś na pytaniu <strong style="color:var(--accent)">${sv + 1}</strong> z ${S.qs.length}.</p>
      <div class="btns">
        <button class="btn btn--ok" id="cont">${I.play} Kontynuuj od pytania ${sv + 1}</button>
        <button class="btn btn--o" id="fresh">${I.rot} Zacznij od nowa</button>
      </div>
    </div></div>`;

  $('cont').onclick = () => { S.ti = sv; S.tAns = false; go('train'); };
  $('fresh').onclick = () => { delSaved(S.cat); S.ti = 0; S.tAns = false; go('train'); };
}

// ═════════════════════════════════════════════════════════════
// WIDOK A — Baza pytań
// ═════════════════════════════════════════════════════════════
function vCheat() {
  const q = S.qs[S.bi], tot = S.qs.length, pct = ((S.bi + 1) / tot) * 100;
  try { sessionStorage.setItem('udt_bi_' + S.cat, String(S.bi)); } catch (_) {}
  if (q && q.id != null) markViewed(S.cat, q.id);
  appEl.innerHTML = `<div>
    <div class="prog"><div class="prog__top">
      <span class="prog__l">Baza pytań</span>
      <span class="prog__n">${S.bi + 1} / ${tot}</span></div>
      <div class="prog__bar"><div class="prog__fill" style="width:${pct}%"></div></div></div>
    <div class="pyt-kontener">
      <div class="q-top-row"><div class="q-n">Pytanie ${S.bi + 1}</div>
        <button class="btn-hard ${isHard(S.cat, q.id) ? 'btn-hard--on' : ''}" id="btn-hard" title="Oznacz jako trudne">${isHard(S.cat, q.id) ? I.flagFill : I.flag}</button></div>
      <div class="q-t">${q.question}</div>
      ${q.image ? `<img src="${q.image}" alt="Ilustracja" class="q-img" data-src="${q.image}" onerror="this.style.display='none'"/>` : ''}
      <div class="odp-lista">${q.options.map((o, i) => `
        <div class="odp-btn odp-btn--lk ${i === q.correct ? 'odp-btn--ok' : ''}">
          <span class="odp-btn__l">${LT[i]}</span><span class="odp-btn__t">${o}</span>
        </div>`).join('')}</div>
    </div>
    ${navPanel(S.bi, tot)}
  </div>`;
  bindImgs(appEl);
  bindHardBtn(q);
  bindNavPanel('cheat');
}

// ═════════════════════════════════════════════════════════════
// WIDOK B — Trening
// ═════════════════════════════════════════════════════════════
function vTrain() {
  const q = S.qs[S.ti], tot = S.qs.length, pct = ((S.ti + 1) / tot) * 100;
  appEl.innerHTML = `<div>
    <div class="prog"><div class="prog__top">
      <span class="prog__l">Trening</span>
      <span class="prog__n">${S.ti + 1} / ${tot}</span></div>
      <div class="prog__bar"><div class="prog__fill" style="width:${pct}%"></div></div></div>
    <div class="pyt-kontener">
      <div class="q-top-row"><div class="q-n">Pytanie ${S.ti + 1}</div>
        <button class="btn-hard ${isHard(S.cat, q.id) ? 'btn-hard--on' : ''}" id="btn-hard" title="Oznacz jako trudne">${isHard(S.cat, q.id) ? I.flagFill : I.flag}</button></div>
      <div class="q-t">${q.question}</div>
      ${q.image ? `<img src="${q.image}" alt="Ilustracja" class="q-img" data-src="${q.image}" onerror="this.style.display='none'"/>` : ''}
      <div class="odp-lista" id="odp-lista">${q.options.map((o, i) => `
        <button class="odp-btn" data-i="${i}" id="o${i}">
          <span class="odp-btn__l">${LT[i]}</span><span class="odp-btn__t">${o}</span>
        </button>`).join('')}</div>
    </div>
    ${navPanel(S.ti, tot)}
  </div>`;

  bindImgs(appEl);

  $('odp-lista').querySelectorAll('.odp-btn').forEach(b => {
    b.onclick = () => {
      if (S.tAns) return;
      S.tAns = true;
      const ch = +b.dataset.i, ok = q.correct;
      setSaved(S.cat, S.ti);
      markDone(S.cat, q.id);

      document.querySelectorAll('#odp-lista .odp-btn').forEach(o => {
        const idx = +o.dataset.i;
        o.classList.add('odp-btn--lk');
        if (idx === ok) o.classList.add('odp-btn--ok');
        if (idx === ch && ch !== ok) o.classList.add('odp-btn--bad');
      });
    };
  });
  bindHardBtn(q);
  bindNavPanel('train');
}

// ─── PRZYCISK TRUDNE PYTANIE ─────────────────────────────────
function bindHardBtn(q) {
  const btn = $('btn-hard');
  if (!btn) return;
  btn.onclick = () => {
    const added = toggleHard(S.cat, q.id);
    btn.classList.toggle('btn-hard--on', added);
    btn.innerHTML = added ? I.flagFill : I.flag;
  };
}

// ═════════════════════════════════════════════════════════════
// WIDOK D — Schowek trudnych pytań
// ═════════════════════════════════════════════════════════════
function vClipboard() {
  const hardIds = (getHard()[S.cat] || []);
  const hardQs = S.qs.filter(q => hardIds.includes(q.id));

  let content = '';
  if (hardQs.length === 0) {
    content = `<div class="clip-empty">
      <div class="clip-empty__ic">${I.clip}</div>
      <h2>Brak zapisanych pytań</h2>
      <p>Jeśli na jakieś trafisz, oznacz je flagą podczas nauki!</p>
    </div>`;
  } else {
    content = hardQs.map((q, idx) => {
      const qNum = S.qs.findIndex(x => x.id === q.id) + 1;
      return `
      <div class="clip-card" id="clip-${idx}">
        <div class="clip-card__top">
          <div class="clip-card__q"><span class="clip-card__num">Pytanie ${qNum}</span>${q.question}</div>
          <button class="clip-card__del" data-qid="${q.id}" title="Usuń ze schowka">${I.trash}</button>
        </div>
        ${q.image ? `<img src="${q.image}" alt="Ilustracja" class="q-img" data-src="${q.image}" onerror="this.style.display='none'"/>` : ''}
        <div class="odp-lista">${q.options.map((o, i) => `
          <div class="odp-btn odp-btn--lk ${i === q.correct ? 'odp-btn--ok' : ''}">
            <span class="odp-btn__l">${LT[i]}</span><span class="odp-btn__t">${o}</span>
          </div>`).join('')}</div>
      </div>`;
    }).join('');
  }

  appEl.innerHTML = `<div>
    <header class="hdr"><h1 style="font-size:1.3rem">Trudne pytania <span class="a">(${hardQs.length})</span></h1>
      <p>Pytania oznaczone flagą — pokaż je instruktorowi</p></header>
    <div class="clip-list">${content}</div>
    <div class="r-acts" style="margin-top:16px">
      <button class="btn btn--o" id="clip-back">${I.aL} Wróć do menu</button>
    </div>
  </div>`;

  bindImgs(appEl);
  $('clip-back').onclick = () => go('menu');

  // Bind delete buttons
  appEl.querySelectorAll('.clip-card__del').forEach(btn => {
    btn.onclick = () => {
      const qid = parseInt(btn.dataset.qid, 10);
      removeHard(S.cat, qid);
      go('clipboard'); // re-render
    };
  });
}

// ═════════════════════════════════════════════════════════════
// PANEL NAWIGACJI
// ═════════════════════════════════════════════════════════════
function navPanel(cur, tot) {
  return `<div class="qnav" id="qnav">
    <button class="qnav__btn" id="nav-prev" ${cur === 0 ? 'disabled' : ''}>${I.chL} Poprzednie</button>
    <div class="qnav__mid"><span>Pytanie</span>
      <input type="number" class="qnav__input" id="nav-inp" min="1" max="${tot}" value="${cur + 1}"/>
      <span>z ${tot}</span></div>
    <button class="qnav__btn" id="nav-next" ${cur === tot - 1 ? 'disabled' : ''}>Następne ${I.chR}</button>
  </div>`;
}

function bindNavPanel(mode) {
  const tot = S.qs.length;
  const inp = $('nav-inp');

  $('nav-prev').onclick = () => {
    if (mode === 'cheat' && S.bi > 0) { S.bi--; go('cheat'); }
    if (mode === 'train' && S.ti > 0) { S.ti--; S.tAns = false; go('train'); }
  };
  $('nav-next').onclick = () => {
    if (mode === 'cheat' && S.bi < tot - 1) { S.bi++; go('cheat'); }
    if (mode === 'train' && S.ti < tot - 1) { S.ti++; S.tAns = false; go('train'); }
  };

  function jumpTo() {
    let v = parseInt(inp.value, 10);
    if (isNaN(v)) return;
    v = clamp(v, 1, tot);
    const idx = v - 1;
    if (mode === 'cheat') { S.bi = idx; go('cheat'); }
    if (mode === 'train') { S.ti = idx; S.tAns = false; go('train'); }
  }
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); jumpTo(); } };
  inp.onblur = jumpTo;
  inp.onfocus = () => inp.select();
}

// ═════════════════════════════════════════════════════════════
// WIDOK C — Egzamin
// ═════════════════════════════════════════════════════════════
function startExam() {
  S.eq = generateExam(S.qs, S.cat);
  const n = S.eq.length;
  S.ei = 0; S.ea = Array(n).fill(-1); S.et = EXAM_T;
  S.savedResult = false;
  clearInterval(S.eInt);
  S.eInt = setInterval(() => {
    S.et--; updTmr();
    if (S.et <= 0) { clearInterval(S.eInt); S.eInt = null; S.group === 'bhp' ? go('signature') : go('result'); }
  }, 1000);
  go('exam');
}

function vExam() {
  const q = S.eq[S.ei], tot = S.eq.length, pct = ((S.ei + 1) / tot) * 100, sel = S.ea[S.ei];
  appEl.innerHTML = `<div>
    <div class="top" style="justify-content:flex-end">
      <div class="tmr" id="tmr">${I.clk} <span id="tt">${fmt(S.et)}</span></div>
    </div>
    <div class="prog"><div class="prog__top">
      <span class="prog__l">Egzamin</span>
      <span class="prog__n">${S.ei + 1} / ${tot}</span></div>
      <div class="prog__bar"><div class="prog__fill" style="width:${pct}%"></div></div></div>
    <div class="pyt-kontener">
      <div class="q-n">Pytanie ${S.ei + 1}</div>
      <div class="q-t">${q.question}</div>
      ${q.image ? `<img src="${q.image}" alt="Ilustracja" class="q-img" data-src="${q.image}" onerror="this.style.display='none'"/>` : ''}
      <div class="odp-lista" id="odp-lista">${q.options.map((o, i) => `
        <button class="odp-btn ${i === sel ? 'odp-btn--sel' : ''}" data-i="${i}" id="eo${i}">
          <span class="odp-btn__l">${LT[i]}</span><span class="odp-btn__t">${o}</span>
        </button>`).join('')}</div>
      <div class="exam-nav-btns" style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;gap:10px">
        <button class="btn btn--o btn--s" id="eprv" ${S.ei === 0 ? 'disabled' : ''}>
          ${I.aL} Wstecz</button>
        <button class="btn btn--a btn--s" id="enx">
          ${S.ei < tot - 1 ? 'Następne' : 'Zakończ egzamin'} ${I.aR}</button>
      </div>
    </div></div>`;

  bindImgs(appEl);

  $('odp-lista').querySelectorAll('.odp-btn').forEach(b => {
    b.onclick = () => {
      S.ea[S.ei] = +b.dataset.i;
      document.querySelectorAll('#odp-lista .odp-btn').forEach(o => o.classList.remove('odp-btn--sel'));
      b.classList.add('odp-btn--sel');
    };
  });

  const eprv = $('eprv');
  if (eprv) {
    eprv.onclick = () => {
      if (S.ei > 0) { S.ei--; go('exam'); }
    };
  }

  $('enx').onclick = () => {
    if (S.ei < tot - 1) { S.ei++; go('exam'); }
    else { clearInterval(S.eInt); S.eInt = null; S.group === 'bhp' ? go('signature') : go('result'); }
  };
  updTmr();
}

function updTmr() {
  const t = $('tt'), p = $('tmr');
  if (!t || !p) return;
  t.textContent = fmt(S.et);
  p.classList.remove('tmr--w', 'tmr--c');
  if (S.et <= 60) p.classList.add('tmr--c');
  else if (S.et <= 180) p.classList.add('tmr--w');
}

// ═════════════════════════════════════════════════════════════
// WIDOK — Podpis egzaminu (tylko BHP — wyłącznie Imię i Nazwisko)
function vSignature() {
  const defName = S.studentLogin ? S.studentLogin.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  appEl.innerHTML = `<div>
    <header class="hdr" style="padding-top:16px">
      <h1 style="font-size:1.5rem">Podsumowanie <span class="a">egzaminu</span></h1>
      <p>Podaj imię i nazwisko, aby przekazać egzamin do zatwierdzenia</p>
    </header>
    <div class="lbox" style="margin-top:24px">
      <div class="fld">
        <label for="sig-name">IMIĘ I NAZWISKO KURSANTA</label>
        <input type="text" id="sig-name" placeholder="np. Jan Kowalski" value="${defName}" autocomplete="off"/>
        <div class="fld-err" id="sig-er">${I.alrt}<span></span></div>
      </div>
      <div style="text-align: center; margin-top:24px;">
        <button class="btn btn--a" id="sig-btn" style="min-width: 200px;">${I.chkC} <span>Zakończ i przekaż wynik</span></button>
      </div>
    </div>
  </div>`.replace(/\\/g, '');

  $('sig-btn').onclick = () => {
    const name = $('sig-name').value.trim();
    if (!name) {
      $('sig-name').classList.add('has-error');
      sErr($('sig-er'), 'Wpisz imię i nazwisko');
      return;
    }
    S.studentSignature = name;
    go('result');
  };
}

// ═════════════════════════════════════════════════════════════
// WIDOK — Wynik egzaminu
// ═════════════════════════════════════════════════════════════
function vResult() {
  const tot = S.eq.length;
  let sc = 0; const mis = [];
  S.eq.forEach((q, i) => {
    const a = S.ea[i];
    if (a === q.correct) sc++;
    else mis.push({ q: q.question, img: q.image || '', u: a >= 0 ? q.options[a] : 'Brak odpowiedzi', c: q.options[q.correct] });
  });
  const ec = examConf(S.cat, tot);
  const pass = sc >= ec.pass, pct = tot > 0 ? Math.round(sc / tot * 100) : 0;
  const isBhp = S.group === 'bhp';

  let actsHtml = '';
  if (isBhp) {
    if (pass) {
      actsHtml = `
        <button class="btn btn--o" id="rh">${I.home} Menu</button>
      `;
    } else {
      actsHtml = `<button class="btn btn--a" id="rr" style="width:100%">${I.rot} Spróbuj ponownie (Wymagane)</button>`;
    }
  } else {
    actsHtml = `
      <button class="btn btn--a" id="rr">${I.rot} Spróbuj ponownie</button>
      <button class="btn btn--o" id="rh">${I.home} Menu</button>
    `;
  }

  let revHtml = '';
  if (isBhp) {
    revHtml = mis.length ? `<div class="rev"><h2>Przegląd błędów (${mis.length})</h2>
      ${mis.map(m => `<div class="ri"><div class="ri__q">${m.q}</div>
        ${m.img ? `<img class="ri__img" src="${m.img}" alt="Grafika do pytania" loading="lazy">` : ''}
        <div class="ri__r ri__r--b"><span class="dot dot--r"></span><span>Twoja: ${m.u}</span></div>
        <div class="ri__r ri__r--g"><span class="dot dot--g"></span><span>Poprawna: ${m.c}</span></div></div>`).join('')}
    </div>` : `<div class="rev" style="text-align:center;margin-top:24px">
      <p style="color:var(--ok);font-weight:600">🏆 Bezbłędnie!</p></div>`;
  } else {
    // UDT: wszystkie pytania z egzaminu (pozytywne i negatywne) oraz wszystkie 4 opcje odpowiedzi w każdym pytaniu
    const cards = S.eq.map((q, i) => {
      const uIdx = S.ea[i];
      const cIdx = q.correct;
      const isOk = uIdx === cIdx;
      const statusBadge = isOk
        ? `<span class="rev-badge rev-badge--ok">✓ Poprawnie</span>`
        : (uIdx < 0
            ? `<span class="rev-badge rev-badge--none">Brak odpowiedzi</span>`
            : `<span class="rev-badge rev-badge--bad">✗ Błędna odpowiedź</span>`);

      const optsHtml = (q.options || []).map((opt, oIdx) => {
        const isCorrectOpt = oIdx === cIdx;
        const isUserOpt = oIdx === uIdx;
        let cls = 'odp-btn odp-btn--lk';
        let tag = '';
        if (isCorrectOpt && isUserOpt) {
          cls += ' odp-btn--ok';
          tag = `<span class="odp-btn__tag odp-btn__tag--ok">✓ Twoja i poprawna</span>`;
        } else if (isCorrectOpt) {
          cls += ' odp-btn--ok';
          tag = `<span class="odp-btn__tag odp-btn__tag--ok">✓ Poprawna</span>`;
        } else if (isUserOpt) {
          cls += ' odp-btn--bad';
          tag = `<span class="odp-btn__tag odp-btn__tag--bad">✗ Twoja odpowiedź</span>`;
        }
        return `<div class="${cls}">
          <span class="odp-btn__l">${LT[oIdx] || (oIdx + 1)}</span>
          <span class="odp-btn__t">${opt}</span>
          ${tag}
        </div>`;
      }).join('');

      return `<div class="clip-card rev-card ${isOk ? 'rev-card--ok' : 'rev-card--bad'}">
        <div class="clip-card__top">
          <div class="clip-card__q">
            <div class="rev-card__hdr">
              <span class="clip-card__num" style="margin-bottom:0">Pytanie ${i + 1} z ${tot}</span>
              ${statusBadge}
            </div>
            ${q.question}
          </div>
        </div>
        ${q.image ? `<img src="${q.image}" alt="Ilustracja" class="q-img" data-src="${q.image}" loading="lazy" onerror="this.style.display='none'"/>` : ''}
        <div class="odp-lista">${optsHtml}</div>
      </div>`;
    }).join('');

    revHtml = `<div class="rev">
      <h2>Przegląd wszystkich pytań (${tot}) — Dobrze: ${sc} • Błędnie: ${tot - sc}</h2>
      <div class="clip-list">${cards}</div>
    </div>`;
  }

  appEl.innerHTML = `<div>
    <header class="hdr" style="padding-top:16px">
      <h1 style="font-size:1.5rem">Wynik <span class="a">egzaminu</span></h1>
      <p>${CATS[S.cat].label}</p></header>
    <div class="rbox">
      <div class="r-ico ${pass ? 'r-ico--p' : 'r-ico--f'}">${pass ? I.chkC : I.xC}</div>
      <div class="r-sub">Twój wynik (próg: ${ec.pass}/${tot})</div>
      <div class="r-sc ${pass ? 'r-sc--p' : 'r-sc--f'}">${sc}/${tot}</div>
      <div class="r-sub">${pct}% poprawnych</div>
      <span class="r-badge ${pass ? 'r-badge--p' : 'r-badge--f'}">
        ${pass ? '👏 Zdałeś! Gratulacje!' : 'Nie zdałeś. Spróbuj ponownie.'}</span>
      ${isBhp && pass ? `<div style="margin-top:14px; font-weight:600; color:var(--txt2);">Kursant: <strong>${S.studentSignature}</strong><div style="font-size:0.84rem; color:var(--ok); margin-top:4px;">✓ Wynik przesłany do zatwierdzenia przez instruktora</div></div>` : ''}
    </div>
    ${revHtml}
    <div class="r-acts">
      ${actsHtml}
    </div></div>`;

  bindImgs(appEl);
  appEl.querySelectorAll('.ri__img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.onclick = () => olb(img.src);
  });

  if ($('rr')) $('rr').onclick = startExam;
  if ($('rh')) $('rh').onclick = () => go('menu');

  if (isBhp && pass && !S.savedResult) {
    S.savedResult = true;
    saveBhpResult(S.studentLogin, S.studentSignature, sc, tot, pct);
  }
}

async function saveBhpResult(login, signature, sc, tot, pct) {
  try {
    const expireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await addDoc(collection(db, "wyniki-bhp"), {
      login: login || 'nieznany',
      podpis: signature || '',
      kurs: CATS[S.cat].label,
      kurs_id: S.cat,
      sc: sc,
      tot: tot,
      wynik: `${sc}/${tot}`,
      procent: pct,
      q_ids: S.eq.map(q => q.id),
      ans: S.ea.slice(),
      status: 'pending',
      wygasa: expireDate
    });
    console.log("Zapisano egzamin BHP do zatwierdzenia w /panel!");
  } catch(e) {
    console.error("Błąd zapisu:", e);
  }
}

/// ─── INTERAKTYWNY SPIS TREŚCI (TOC) ─────────────────────────
function renderToc(data, itemPrefix = 'Pytanie') {
  if (!data || data.length === 0) return '';
  const items = data.map((q, idx) => `
    <button type="button" class="toc-item" data-idx="${idx}">
      <span class="toc-item__num">${idx + 1}.</span>
      <span class="toc-item__txt">${q.question || (itemPrefix + ' ' + (idx + 1))}</span>
    </button>
  `).join('');

  return `
    <nav class="toc-box" id="toc-box" aria-label="Spis treści">
      <div class="toc-hdr" id="toc-toggle" role="button" tabindex="0" aria-expanded="true">
        <span class="toc-hdr__title">📋 Spis treści <span class="toc-hdr__cnt">(${data.length})</span></span>
        <span class="toc-hdr__btn"><span id="toc-toggle-txt">Zwiń</span> ▲</span>
      </div>
      <div class="toc-list" id="toc-list">
        ${items}
      </div>
    </nav>
  `;
}

function bindToc(parentScrollEl, prefix = 'clip-') {
  const tocBox = $('toc-box');
  const tocList = $('toc-list');
  const tocToggle = $('toc-toggle');
  if (!tocBox || !tocList) return;

  const isElScroller = () => {
    if (!parentScrollEl) return false;
    const oy = getComputedStyle(parentScrollEl).overflowY;
    return oy === 'auto' || oy === 'scroll';
  };
  const getTop = () => isElScroller() ? parentScrollEl.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);
  const viewTop = () => {
    const hdr = $('main-header');
    if (isElScroller()) return parentScrollEl.getBoundingClientRect().top;
    return hdr ? hdr.getBoundingClientRect().bottom : 0;
  };
  const scrollToY = (targetTop) => {
    if (isElScroller()) {
      parentScrollEl.scrollTo({ top: targetTop, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  if (tocToggle) {
    tocToggle.onclick = () => {
      const collapsed = tocBox.classList.toggle('toc-box--collapsed');
      tocToggle.setAttribute('aria-expanded', String(!collapsed));
      const btnSpan = tocToggle.querySelector('.toc-hdr__btn');
      if (btnSpan) btnSpan.innerHTML = collapsed ? `<span id="toc-toggle-txt">Rozwiń</span> ▼` : `<span id="toc-toggle-txt">Zwiń</span> ▲`;
    };
  }

  const items = Array.from(tocList.querySelectorAll('.toc-item'));
  const cards = items.map(it => document.getElementById(prefix + it.dataset.idx));

  function setActive(i) {
    items.forEach((el, idx) => el.classList.toggle('active', idx === i));
  }

  // Tylko kliknięcie w pozycję spisu treści zaznacza ją jako aktywną (brak zmiany przy przewijaniu!)
  items.forEach((btn, i) => {
    btn.onclick = () => {
      const target = cards[i];
      if (!target) return;
      setActive(i);
      const offset = target.getBoundingClientRect().top - viewTop() - 12;
      scrollToY(Math.max(0, getTop() + offset));
    };
  });

  // Przyciski powrotu „↑ Spis treści" na kartach pytań (bez zmiany zaznaczonej pozycji!)
  appEl.querySelectorAll('.clip-card__top-link').forEach(btn => {
    btn.onclick = () => {
      const offset = tocBox.getBoundingClientRect().top - viewTop() - 12;
      scrollToY(Math.max(0, getTop() + offset));
    };
  });

  if (window._qNavScrollCleanup) {
    window._qNavScrollCleanup();
    window._qNavScrollCleanup = null;
  }
}

// ─── FORMATOWANIE TEKSTU BOGATEGO (Markdown / Rich Text z CMS) ───
function normMediaPath(u) {
  return ghUrl(u);
}

function getFileDisplayName(fileUrl) {
  if (!fileUrl) return 'plik';
  try {
    const cleanUrl = String(fileUrl).split('?')[0].split('#')[0];
    const base = decodeURIComponent(cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1));
    const noExt = base.replace(/\.[a-z0-9]{2,5}$/i, '').trim();
    return noExt || base || 'plik';
  } catch (_) {
    const parts = String(fileUrl).split('/');
    return (parts[parts.length - 1] || 'plik').replace(/\.pdf$/i, '');
  }
}

function formatInlineRich(line) {
  let s = String(line);
  const tags = [];
  const stash = (html) => {
    const token = `\x00TAG${tags.length}\x00`;
    tags.push(html);
    return token;
  };

  // Obrazy Markdown: ![alt](url) — obsługuje też PDF oraz pliki audio wstawione w edytorze
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, rawUrl) => {
    const cleanRaw = rawUrl.replace(/^["']|["']$/g, '').split(/\s+/)[0];
    const src = normMediaPath(cleanRaw);
    if (/\.pdf(\?.*)?$/i.test(cleanRaw)) {
      const fName = getFileDisplayName(alt && !/^ilustracja$/i.test(alt.trim()) ? alt : cleanRaw);
      return stash(`<a href="${src}" data-pdf-url="${src}" target="_blank" rel="noopener" class="btn btn--o btn--s" style="margin-top:8px;display:inline-flex;text-decoration:none">📄 Otwórz ${fName}</a>`);
    }
    if (/\.(mp3|m4a|wav|ogg)(\?.*)?$/i.test(cleanRaw)) {
      const fName = getFileDisplayName(alt && !/^ilustracja$/i.test(alt.trim()) ? alt : cleanRaw);
      return stash(`<div class="q-audio-box"><div class="q-audio-lbl">🎧 Nagranie (${fName})</div><audio controls preload="none" class="q-audio-el" src="${src}"></audio></div>`);
    }
    const cleanAlt = (alt || 'Ilustracja').replace(/"/g, '&quot;');
    return stash(`<img src="${src}" alt="${cleanAlt}" class="q-img rich-img" data-src="${src}" loading="lazy" onerror="this.style.display='none'"/>`);
  });
  // Obrazy HTML: <img ... src="..." ...>
  s = s.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (_, rawUrl) => {
    const src = normMediaPath(rawUrl);
    return stash(`<img src="${src}" alt="Ilustracja" class="q-img rich-img" data-src="${src}" loading="lazy" onerror="this.style.display='none'"/>`);
  });
  // Linki Markdown: [tekst](url) — obsługuje też PDF oraz pliki audio
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_, label, url) => {
    const href = normMediaPath(url);
    if (/\.pdf(\?.*)?$/i.test(url)) {
      const fName = getFileDisplayName(label || url);
      return stash(`<a href="${href}" data-pdf-url="${href}" target="_blank" rel="noopener" class="btn btn--o btn--s" style="margin-top:8px;display:inline-flex;text-decoration:none">📄 Otwórz ${fName}</a>`);
    }
    if (/\.(mp3|m4a|wav|ogg)(\?.*)?$/i.test(url)) {
      const fName = getFileDisplayName(label || url);
      return stash(`<div class="q-audio-box"><div class="q-audio-lbl">🎧 Nagranie (${fName})</div><audio controls preload="none" class="q-audio-el" src="${href}"></audio></div>`);
    }
    return stash(`<a href="${href}" target="_blank" rel="noopener" class="rich-link">${label}</a>`);
  });

  // Pogrubienie + kursywa: ***tekst***, **_tekst_**, _**tekst**_
  s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*_([^_]+)_\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/_\*\*([^*]+)\*\*_/g, '<strong><em>$1</em></strong>');
  // Pogrubienie: **tekst** lub __tekst__
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  // Kursywa: *tekst* lub _tekst_
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');
  // Przekreślenie: ~~tekst~~
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  // Kod inline: `tekst`
  s = s.replace(/`([^`]+)`/g, '<code class="rich-code">$1</code>');

  return s.replace(/\x00TAG(\d+)\x00/g, (_, idx) => tags[Number(idx)] || '');
}

function renderRichText(raw) {
  if (!raw) return '';
  const lines = String(raw).replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;
  let inTable = false;

  const closeLists = () => {
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }
    if (inTable) { html += '</tbody></table></div>'; inTable = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    // Linia pozioma: --- lub ***
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeLists();
      html += '<hr class="rich-hr"/>';
      continue;
    }

    // Nagłówki: # .. ####
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      closeLists();
      const lvl = Math.min(4, hMatch[1].length + 1); // h2..h4
      html += `<h${lvl} class="rich-h">${formatInlineRich(hMatch[2])}</h${lvl}>`;
      continue;
    }

    // Cytat: > tekst
    if (/^>\s?/.test(trimmed)) {
      closeLists();
      html += `<blockquote class="rich-quote">${formatInlineRich(trimmed.replace(/^>\s?/, ''))}</blockquote>`;
      continue;
    }

    // Lista punktowana: - tekst lub * tekst lub • tekst
    const ulMatch = trimmed.match(/^([-*•])\s+(.+)$/);
    if (ulMatch) {
      if (inOl) { html += '</ol>'; inOl = false; }
      if (inTable) { html += '</tbody></table></div>'; inTable = false; }
      if (!inUl) { html += '<ul class="rich-ul">'; inUl = true; }
      html += `<li>${formatInlineRich(ulMatch[2])}</li>`;
      continue;
    }

    // Lista numerowana: 1. tekst
    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (olMatch) {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inTable) { html += '</tbody></table></div>'; inTable = false; }
      if (!inOl) { html += '<ol class="rich-ol">'; inOl = true; }
      html += `<li>${formatInlineRich(olMatch[1])}</li>`;
      continue;
    }

    // Tabela Markdown: | col1 | col2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue; // separator wiersza nagłówka
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inOl) { html += '</ol>'; inOl = false; }
      const cells = trimmed.slice(1, -1).split('|').map(c => formatInlineRich(c.trim()));
      if (!inTable) {
        html += `<div class="rich-table-wrap"><table class="rich-table"><thead><tr>${cells.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>`;
        inTable = true;
      } else {
        html += `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
      }
      continue;
    }

    closeLists();
    html += `<p class="rich-p">${formatInlineRich(line)}</p>`;
  }

  closeLists();
  return html;
}

// ─── WSPÓŁDZIELONY SILNIK AUDIO (0 znaczników <audio> w DOM = 0 obciążenia telefonu!) ───
let SHARED_AUDIO = null;
const IC_AUD = {
  play: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><rect x="5" y="4" width="2.5" height="16" rx="1"/></svg>`,
  next: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><rect x="16.5" y="4" width="2.5" height="16" rx="1"/></svg>`,
  spk: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
};

function getSharedAudio() {
  if (!SHARED_AUDIO) {
    SHARED_AUDIO = new Audio();
    SHARED_AUDIO.preload = 'none';
  }
  return SHARED_AUDIO;
}

function stopSharedAudio() {
  if (SHARED_AUDIO) {
    try {
      SHARED_AUDIO.pause();
      SHARED_AUDIO.onended = null;
      SHARED_AUDIO.ontimeupdate = null;
      SHARED_AUDIO.onplay = null;
      SHARED_AUDIO.onpause = null;
    } catch (_) {}
  }
}

function fmtAudioTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const s = Math.floor(sec);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function renderList(title, data, subtitle, itemPrefix = 'Pytanie', allowAudio = false) {
  const isTemat = itemPrefix === 'Temat';
  const audioEntries = allowAudio ? (data || [])
    .map((q, idx) => ({ q, idx }))
    .filter(x => x.q && x.q.audio && String(x.q.audio).trim().length > 0) : [];

  let content = (!data || data.length === 0) ? `<div class="clip-empty">
      <div class="clip-empty__ic">${I.file}</div>
      <h2>${isTemat ? 'Brak tematów w tej zakładce' : 'Brak pytań w tej zakładce'}</h2>
      <p>W tej kategorii nie dodano jeszcze żadnych pozycji.<br/>Dodaj je w panelu CMS (<strong>/admin</strong>), aby się tu pojawiły.</p>
    </div>` :
    data.map((q, idx) => {
      const hasAnswer = q.answer && String(q.answer).trim().length > 0;
      const hasAudio = allowAudio && q.audio && String(q.audio).trim().length > 0;
      const singleAudioPill = hasAudio ? `<button type="button" class="q-audio-pill" data-single-audio-idx="${idx}" data-audio-src="${q.audio}" title="Odsłuchaj to pytanie">
          ${IC_AUD.play} <span class="q-audio-pill__txt">Odsłuchaj</span>
        </button>` : '';
      const pdfName = q.file ? getFileDisplayName(q.file) : '';
      const fileBtn = q.file ? `<a href="${q.file}" data-pdf-url="${q.file}" target="_blank" rel="noopener" class="btn btn--o btn--s" style="margin-top:10px;text-decoration:none">📄 Otwórz ${pdfName}</a>` : '';
      const linkBtn = q.link ? `<a href="${q.link}" target="_blank" rel="noopener" class="btn btn--a btn--s" style="margin-top:10px;text-decoration:none">🔗 Otwórz materiał / wideo</a>` : '';
      const extras = (fileBtn || linkBtn) ? `<div style="display:flex;flex-wrap:wrap;gap:8px">${fileBtn}${linkBtn}</div>` : '';

      return `
      <div class="clip-card" id="clip-${idx}" data-idx="${idx}">
        <div class="clip-card__top">
          <div class="clip-card__q">
            <div class="clip-card__hdr-row">
              <div class="clip-card__hdr-left">
                <span class="clip-card__num" style="margin-bottom:0">${itemPrefix} ${idx + 1}</span>
                ${singleAudioPill}
              </div>
              <button type="button" class="clip-card__top-link" title="Wróć do spisu treści">↑ Spis treści</button>
            </div>
            ${q.question}
          </div>
        </div>
        ${q.image ? `<img src="${q.image}" alt="Ilustracja" class="q-img" data-src="${q.image}" onerror="this.style.display='none'"/>` : ''}
        ${hasAnswer ? `<div class="odp-lista">
          <div class="odp-btn odp-btn--ok rich-ans-box" style="cursor:default;align-items:flex-start">
            <div class="odp-btn__t rich-content">${renderRichText(q.answer)}</div>
          </div>
        </div>` : ''}
        ${extras}
      </div>
    `;
    }).join('');

  // Kompaktowy pasek pomiędzy Spisem treści a pytaniami (wyłącznie gdy jest choć 1 nagranie)
  const playlistHtml = audioEntries.length > 0 ? `
    <div class="audio-bar" id="audio-playlist">
      <div class="audio-bar__left">
        <span class="audio-bar__ic">${IC_AUD.spk}</span>
        <span class="audio-bar__lbl" id="ap-status">Odsłuchaj wszystkie po kolei <span class="audio-bar__cnt">(${audioEntries.length})</span></span>
      </div>
      <div class="audio-bar__right">
        <div class="audio-bar__ctrls" id="ap-ctrls" style="display:none">
          <button type="button" class="audio-bar__ibtn" id="ap-prev" title="Poprzednie">${IC_AUD.prev}</button>
          <button type="button" class="audio-bar__ibtn" id="ap-next" title="Następne">${IC_AUD.next}</button>
          <button type="button" class="audio-bar__ibtn audio-bar__ibtn--stop" id="ap-stop" title="Zatrzymaj">${IC_AUD.stop}</button>
        </div>
        <button type="button" class="audio-bar__play" id="ap-toggle">
          ${IC_AUD.play} <span>Odtwórz wszystkie</span>
        </button>
      </div>
    </div>
  ` : '';

  const tocHtml = (data && data.length > 0) ? renderToc(data, itemPrefix) : '';

  appEl.innerHTML = `<div>
    <header class="hdr"><h1 style="font-size:1.3rem">${title}</h1>
      <p>${subtitle}</p></header>
    ${tocHtml}
    ${playlistHtml}
    <div class="clip-list">${content}</div>
    <div class="r-acts" style="margin-top:16px">
      <button class="btn btn--o" id="clip-back">${I.aL} Wróć do menu</button>
    </div>
  </div>`;

  bindImgs(appEl);

  if (audioEntries.length > 0) {
    let activeCardIdx = null;
    let apMode = false; // true = odtwarzanie po kolei, false = pojedyncze pytanie
    let apPos = 0;

    const apToggle = $('ap-toggle');
    const apCtrls = $('ap-ctrls');
    const apPrev = $('ap-prev');
    const apNext = $('ap-next');
    const apStop = $('ap-stop');
    const apStatus = $('ap-status');
    const pills = Array.from(appEl.querySelectorAll('.q-audio-pill'));

    function resetAllPillsAndCards() {
      pills.forEach(p => {
        p.classList.remove('is-playing');
        p.innerHTML = `${IC_AUD.play} <span class="q-audio-pill__txt">Odsłuchaj</span>`;
      });
      appEl.querySelectorAll('.clip-card--playing').forEach(c => c.classList.remove('clip-card--playing'));
    }

    function updateBarIdle() {
      if (apToggle) {
        apToggle.classList.remove('is-playing');
        apToggle.innerHTML = `${IC_AUD.play} <span>Odtwórz wszystkie</span>`;
      }
      if (apCtrls) apCtrls.style.display = 'none';
      if (apStatus) apStatus.innerHTML = `Odsłuchaj wszystkie po kolei <span class="audio-bar__cnt">(${audioEntries.length})</span>`;
    }

    function stopAll() {
      apMode = false;
      activeCardIdx = null;
      stopSharedAudio();
      resetAllPillsAndCards();
      updateBarIdle();
    }

    function startCardAudio(cardIdx, src, isPlaylist, scrollCard) {
      const aud = getSharedAudio();
      activeCardIdx = cardIdx;
      apMode = isPlaylist;

      resetAllPillsAndCards();
      const card = document.getElementById('clip-' + cardIdx);
      const pill = appEl.querySelector(`.q-audio-pill[data-single-audio-idx="${cardIdx}"]`);
      if (card) {
        card.classList.add('clip-card--playing');
        if (scrollCard) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (pill) {
        pill.classList.add('is-playing');
        pill.innerHTML = `${IC_AUD.pause} <span class="q-audio-pill__txt">Zatrzymaj</span>`;
      }

      if (isPlaylist) {
        if (apCtrls) apCtrls.style.display = 'inline-flex';
        if (apToggle) {
          apToggle.classList.add('is-playing');
          apToggle.innerHTML = `${IC_AUD.pause} <span>Wstrzymaj</span>`;
        }
        if (apStatus) {
          apStatus.innerHTML = `${itemPrefix} ${cardIdx + 1} <span class="audio-bar__cnt">(${apPos + 1}/${audioEntries.length})</span>`;
        }
      } else {
        updateBarIdle();
      }

      if (aud.src !== src) {
        aud.src = src;
      }
      aud.currentTime = 0;

      aud.ontimeupdate = () => {
        if (activeCardIdx !== cardIdx) return;
        const cur = fmtAudioTime(aud.currentTime);
        const dur = aud.duration ? ' / ' + fmtAudioTime(aud.duration) : '';
        if (pill && !aud.paused) {
          const txtEl = pill.querySelector('.q-audio-pill__txt');
          if (txtEl) txtEl.textContent = `${cur}${dur}`;
        }
      };

      aud.onended = () => {
        if (apMode && apPos + 1 < audioEntries.length) {
          apPos++;
          const nextEntry = audioEntries[apPos];
          startCardAudio(nextEntry.idx, nextEntry.q.audio, true, true);
        } else {
          stopAll();
        }
      };

      aud.play().catch(() => {});
    }

    // Kliknięcie przycisku "Odsłuchaj" na pojedynczym pytaniu
    pills.forEach(pill => {
      pill.onclick = () => {
        const idx = parseInt(pill.dataset.singleAudioIdx, 10);
        const src = pill.dataset.audioSrc;
        const aud = getSharedAudio();
        if (activeCardIdx === idx && !apMode) {
          if (aud.paused) {
            aud.play().catch(() => {});
            pill.classList.add('is-playing');
            pill.innerHTML = `${IC_AUD.pause} <span class="q-audio-pill__txt">Wznów</span>`;
          } else {
            stopAll();
          }
        } else {
          startCardAudio(idx, src, false, false);
        }
      };
    });

    // Obsługa paska "Odtwórz wszystkie po kolei"
    if (apToggle) {
      apToggle.onclick = () => {
        const aud = getSharedAudio();
        if (!apMode) {
          apPos = 0;
          const first = audioEntries[0];
          startCardAudio(first.idx, first.q.audio, true, true);
        } else {
          if (aud.paused) {
            aud.play().catch(() => {});
            apToggle.innerHTML = `${IC_AUD.pause} <span>Wstrzymaj</span>`;
          } else {
            aud.pause();
            apToggle.innerHTML = `${IC_AUD.play} <span>Wznów</span>`;
          }
        }
      };
    }
    if (apPrev) {
      apPrev.onclick = () => {
        apPos = Math.max(0, apPos - 1);
        const e = audioEntries[apPos];
        startCardAudio(e.idx, e.q.audio, true, true);
      };
    }
    if (apNext) {
      apNext.onclick = () => {
        if (apPos + 1 < audioEntries.length) {
          apPos++;
          const e = audioEntries[apPos];
          startCardAudio(e.idx, e.q.audio, true, true);
        } else {
          stopAll();
        }
      };
    }
    if (apStop) apStop.onclick = stopAll;
  }

  appEl.querySelectorAll('[data-pdf-url]').forEach(a => {
    a.onclick = async (e) => {
      const url = a.dataset.pdfUrl;
      if (!url || !url.toLowerCase().endsWith('.pdf')) return;
      e.preventDefault();
      const win = window.open('', '_blank');
      try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const blob = new Blob([buf], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        if (win) win.location.href = blobUrl;
        else window.open(blobUrl, '_blank');
      } catch (_) {
        if (win) win.location.href = url;
      }
    };
  });
  if (data && data.length > 0) {
    bindToc(appEl.firstElementChild, 'clip-');
  }
  $('clip-back').onclick = () => go('menu');
}

function vOpisyList() {
  renderList("Obsługa techniczna codzienna", S.opisy, CATS[S.cat].label, "Pytanie", true);
}

function vWiedzaList() {
  renderList("Materiały szkoleniowe", S.wiedza, CATS[S.cat].label, "Temat");
}

function vMaterialyList() {
  renderList("Materiały szkoleniowe", S.materialy, CATS[S.cat].label, "Temat");
}

// ═════════════════════════════════════════════════════════════
// WIDOK — Lista pytań (BHP — zachowany pomocniczo, ukryty w menu)
// ═════════════════════════════════════════════════════════════
function vBhpList() {
  go('menu');
}

// ─── HELPER ─────────────────────────────────────────────────
function bindImgs(el) {
  el.querySelectorAll('.q-img').forEach(i => {
    i.onclick = () => olb(i.dataset.src || i.src);
  });
}

// ─── START & URL ROUTING (Obsługa F5 i bezpośrednich linków np. /udt, /bhp, /udt/wozki-podnosnikowe) ───
async function restoreRouteFromUrl() {
  const segs = window.location.pathname.split('/').filter(Boolean);
  if (segs.length === 0 || segs[0] === 'index.html') {
    S.group = null;
    S.cat = null;
    go('home', false);
    return;
  }

  let grp = null;
  let cat = null;
  let subSlug = '';

  if (segs[0] === 'udt' || segs[0] === 'bhp') {
    grp = segs[0];
    cat = segs[1] || null;
    subSlug = segs[2] || '';
  } else if (CATS[segs[0]]) {
    cat = segs[0];
    grp = isBhpCat(cat) ? 'bhp' : 'udt';
    subSlug = segs[1] || '';
  } else {
    S.group = null;
    S.cat = null;
    go('home', false);
    return;
  }

  S.group = grp;
  if (!cat || !CATS[cat] || CATS[cat].locked) {
    S.cat = null;
    go('subcats', false);
    return;
  }

  const targetView = grp === 'bhp'
    ? (SLUG_TO_VIEW_BHP[subSlug] || 'menu')
    : (SLUG_TO_VIEW_UDT[subSlug] || 'menu');

  await pickCat(cat, targetView, false);
}

document.addEventListener('DOMContentLoaded', () => {
  $('top-bk').innerHTML = `${I.aL} <span class="nav-txt">Wróć</span>`;
  $('top-lo').innerHTML = `${I.out} <span class="nav-txt">Wyloguj</span>`;
  initTheme();
  restoreRouteFromUrl();
});

window.addEventListener('popstate', () => {
  // W trakcie egzaminu pytaj o potwierdzenie
  if (S.view === 'exam') {
    const c = confirm("Czy na pewno chcesz przerwać egzamin i wrócić do menu?");
    if (c) {
      if (S.eInt) { clearInterval(S.eInt); S.eInt = null; }
      go('menu', false);
    } else {
      history.pushState({ view: 'exam', group: S.group, cat: S.cat }, '', buildRoutePath('exam'));
    }
    return;
  }
  restoreRouteFromUrl();
});

// ─── SERVICE WORKER (Automatyczna aktualizacja bez Ctrl+F5) ─────
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
  navigator.serviceWorker.register('/sw.js').then(reg => {
    reg.update().catch(() => {});
  }).catch(() => {});
}

// ─── POLITYKA PRYWATNOŚCI (Zamykanie Modala) ───────────────────
const polModal = $('pol-modal');
const polX = $('pol-x');

if (polModal && polX) {
  polX.onclick = () => polModal.classList.remove('on');
  polModal.onclick = (e) => {
    if (e.target === polModal) polModal.classList.remove('on');
  };
}
