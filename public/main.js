const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmt = (s, o) => fromIso(s).toLocaleDateString('cs-CZ', o);
const dayOfYear = (s) => { const d = fromIso(s); return Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1; };
const weekdayIdx = (s) => (fromIso(s).getDay() + 6) % 7; // pondělí = 0
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* soukromé okno */ } },
};

const state = { me: null, topics: {}, mu: null, showMu: false, payments: 'off', today: isoLocal(new Date()), shown: null, entry: null, week: [] };
state.shown = state.today;

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Něco se nepovedlo. Zkus to znovu.'), { status: res.status });
  return data;
}

function toast(t) {
  const el = $('toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

// Co je právě vidět: výrok dne, nebo schovaný kóan
const current = () => (state.showMu && state.mu ? state.mu : state.entry?.quote);

// ---------- Načtení ----------
async function loadMe() {
  const r = await api('/api/me');
  state.me = r.user;
  state.topics = r.topics;
  state.mu = r.mu;
  state.payments = r.payments;
  $('credit').textContent = r.credit + ' · originál a pramen najdeš u každého výroku';
}

async function loadDay() {
  try {
    state.entry = await api(`/api/day?today=${state.today}&date=${state.shown}`);
  } catch (e) {
    if (e.status === 403) { toast(e.message); state.shown = state.today; return loadDay(); }
    throw e;
  }
  // Kameny za dny tohoto týdne. Přihlášeným je drží server, ostatním prohlížeč.
  if (state.entry.week) state.week = state.entry.week;
  else {
    const monday = isoLocal(new Date(fromIso(state.today) - weekdayIdx(state.today) * 864e5));
    const days = [...new Set([...store.get('tz-days', []), state.today])].filter((d) => d >= monday && d <= state.today).sort();
    store.set('tz-days', days);
    state.week = days;
  }
}

async function loadDays() {
  const r = await api(`/api/days?today=${state.today}`);
  const ul = $('days');
  ul.innerHTML = '';
  r.days.forEach((d, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-current', String(d.day === state.shown));
    const ds = document.createElement('span');
    ds.className = 'd';
    ds.textContent = i === 0 ? 'Dnes' : fmt(d.day, { weekday: 'short', day: 'numeric', month: 'numeric' });
    const qs = document.createElement('span');
    qs.className = 'q';
    qs.textContent = d.text;
    b.append(ds, qs);
    b.onclick = async () => {
      setMu(false);
      state.shown = d.day;
      await loadDay();
      renderDay();
      ul.querySelectorAll('button').forEach((x) => x.setAttribute('aria-current', String(x === b)));
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    };
    li.append(b);
    ul.append(li);
  });
  $('daysH').textContent = r.window === 7 ? 'Posledních sedm dní' : 'Posledních třicet dní';
}

const span = (cls, text) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; };
const plural = (n) => (n === 1 ? 'výrok' : n < 5 ? 'výroky' : 'výroků');

async function loadCollections() {
  const r = await api('/api/collections');
  const ul = $('cols');
  ul.innerHTML = '';
  r.collections.forEach((c) => {
    const li = document.createElement('li');
    const head = [span('t', c.title), span('n', r.open ? `${c.count} ${plural(c.count)}` : 'pro členy'), span('ds', c.desc)];
    if (r.open) {
      const d = document.createElement('details');
      const s = document.createElement('summary');
      s.append(...head);
      const ol = document.createElement('ol');
      c.quotes.forEach((q) => {
        const item = document.createElement('li');
        item.append(span('q', q.text), span('w', `${q.who} · ${q.source}`));
        ol.append(item);
      });
      d.append(s, ol);
      li.append(d);
    } else {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'locked';
      b.append(...head);
      b.onclick = () => $('plus').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      li.append(b);
    }
    ul.append(li);
  });
}

async function loadFavs() {
  $('favBox').hidden = !state.me;
  if (!state.me) return;
  const r = await api('/api/favorites');
  const ul = $('favs');
  ul.innerHTML = '';
  r.favorites.forEach((q) => {
    const li = document.createElement('li');
    li.append(span('q', q.text), span('w', '— ' + q.who));
    ul.append(li);
  });
  $('favEmpty').hidden = r.favorites.length > 0;
}

// ---------- Vykreslení ----------
function renderDay() {
  const e = state.entry;
  if (!e) return;
  const mu = state.showMu && state.mu;
  const q = current();
  const key = e.day + ':' + e.quote.id + ':' + !!mu;
  if (renderDay.last !== key) {
    renderDay.last = key;
    const s = document.querySelector('.saying');
    s.classList.remove('flow');
    void s.offsetWidth; // restart animace
    s.classList.add('flow');
    $('why').open = false;
  }
  $('todayLbl').textContent = fmt(state.today, { weekday: 'long', day: 'numeric', month: 'long' });
  const y = fromIso(e.day).getFullYear();
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  $('dayNo').textContent = mu ? mu.eyebrow : `Den ${dayOfYear(e.day)} z ${leap ? 366 : 365} · ${fmt(e.day, { day: 'numeric', month: 'long' })}`;
  $('quote').textContent = q.text;
  $('quote').classList.toggle('mu', !!mu);

  // Originál ve znacích, každý verš ve vlastním sloupci
  const o = $('orig');
  o.innerHTML = '';
  o.hidden = !!mu || !q.orig;
  if (!o.hidden) q.orig.split(/\s+/).forEach((part) => o.append(span('', part)));

  $('who').textContent = '— ' + q.who;
  $('src').textContent = q.source || '';
  $('why').hidden = !q.why;
  $('whyText').textContent = q.why || '';
  $('practice').textContent = q.practice;
  $('saveBtn').hidden = !!mu;
  $('todayBtn').hidden = e.day === state.today && !mu;
  $('saveBtn').textContent = e.favorite ? 'Uloženo' : 'Uložit si';
  $('saveBtn').setAttribute('aria-pressed', String(!!e.favorite));

  const premium = !!state.me?.premium;
  $('journalBox').hidden = !premium;
  if (premium) {
    $('journal').value = e.journal || '';
    $('journalState').textContent = '';
  }
}

function renderAccount() {
  const me = state.me;
  $('loginBtn').hidden = !!me;
  $('logoutBtn').hidden = !me;

  const premium = !!me?.premium;
  if (premium && me.garden) document.documentElement.dataset.garden = me.garden;
  else delete document.documentElement.dataset.garden;

  $('plusBadge').hidden = !premium;
  $('plusIntro').textContent = premium
    ? 'Tady si ladíš svou zahradu. Změny se ukládají hned.'
    : 'Členství otevírá tematické sbírky, vlastní deník ke každému dni, třicet dní zpátky a volbu témat i barvy zahrady.';
  $('buyRow').hidden = premium;
  $('manageRow').hidden = !premium;

  document.querySelectorAll('#gardenChips .btn').forEach((b) => {
    b.disabled = !premium;
    b.classList.toggle('on', (premium ? me.garden : '') === b.dataset.g);
  });
  const tc = $('topicChips');
  tc.innerHTML = '';
  Object.entries(state.topics).forEach(([key, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = label;
    b.disabled = !premium;
    b.classList.toggle('on', !!me?.topics?.includes(key));
    b.setAttribute('aria-pressed', String(!!me?.topics?.includes(key)));
    b.onclick = () => {
      const set = new Set(me.topics);
      set.has(key) ? set.delete(key) : set.add(key);
      saveSettings({ topics: [...set] });
    };
    tc.append(b);
  });

  $('payMode').textContent = state.payments === 'demo' ? 'zkušební režim: platby jsou vypnuté' : '';
}

async function refreshAll() {
  await loadMe();
  await loadDay();
  renderAccount();
  renderDay();
  await Promise.all([loadDays(), loadFavs(), loadCollections()]);
  draw();
}

// ---------- Akce ----------
async function saveSettings(patch) {
  try {
    const r = await api('/api/settings', { method: 'PUT', body: { garden: state.me.garden, topics: state.me.topics, ...patch } });
    state.me = { ...state.me, ...r.user };
    renderAccount();
    draw();
    if ('topics' in patch) { await loadDay(); renderDay(); await loadDays(); toast('Témata uložena'); }
  } catch (e) { toast(e.message); }
}

document.querySelectorAll('#gardenChips .btn').forEach((b) => (b.onclick = () => saveSettings({ garden: b.dataset.g })));

$('saveBtn').onclick = async () => {
  if (!state.me) return openAuth('register', 'Vlastní sbírka patří k účtu. Je zdarma.');
  try {
    const r = await api('/api/favorites', { method: 'POST', body: { quoteId: state.entry.quote.id } });
    state.entry.favorite = r.favorite;
    renderDay();
    loadFavs();
    toast(r.favorite ? 'Uloženo do tvé sbírky' : 'Odebráno ze sbírky');
  } catch (e) { toast(e.message); }
};

$('todayBtn').onclick = async () => { setMu(false); state.shown = state.today; await loadDay(); renderDay(); loadDays(); };

$('journalSave').onclick = async () => {
  try {
    await api('/api/journal', { method: 'PUT', body: { day: state.entry.day, text: $('journal').value } });
    $('journalState').textContent = 'Uloženo ' + new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { toast(e.message); }
};

async function buy(plan) {
  if (!state.me) return openAuth('register', 'Členství patří k účtu. Nejdřív si ho založ.');
  try {
    const r = await api('/api/checkout', { method: 'POST', body: { plan } });
    if (r.url) { location.href = r.url; return; }
    toast(r.demo ? 'Členství zapnuto (zkušební režim)' : 'Členství už máš');
    await refreshAll();
  } catch (e) { toast(e.message); }
}
$('buyBtn').onclick = () => buy('yearly');
$('buyMonthly').onclick = () => buy('monthly');

$('manageBtn').onclick = async () => {
  try {
    const r = await api('/api/portal', { method: 'POST', body: {} });
    if (r.url) { location.href = r.url; return; }
    toast('Členství zrušeno (zkušební režim)');
    await refreshAll();
  } catch (e) { toast(e.message); }
};

$('logoutBtn').onclick = async () => {
  await api('/api/logout', { method: 'POST', body: {} });
  toast('Odhlášeno');
  await refreshAll();
};

// ---------- Přihlášení / registrace ----------
let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  const reg = mode === 'register';
  $('authH').textContent = reg ? 'Nový účet' : 'Přihlášení';
  $('authSubmit').textContent = reg ? 'Založit účet' : 'Přihlásit';
  $('authSwitch').textContent = reg ? 'Už mám účet, chci se přihlásit' : 'Nemám účet, chci se registrovat';
  $('password').autocomplete = reg ? 'new-password' : 'current-password';
}
function openAuth(mode = 'login', msg = '') {
  setAuthMode(mode);
  $('authErr').textContent = msg;
  $('auth').showModal();
  $('email').focus();
}
$('loginBtn').onclick = () => openAuth('login');
$('authSwitch').onclick = () => { setAuthMode(authMode === 'login' ? 'register' : 'login'); $('authErr').textContent = ''; };
$('authCancel').onclick = () => $('auth').close();
$('authForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  $('authErr').textContent = '';
  try {
    await api(authMode === 'register' ? '/api/register' : '/api/login', {
      method: 'POST',
      body: { email: $('email').value, password: $('password').value },
    });
    $('auth').close();
    $('password').value = '';
    toast(authMode === 'register' ? 'Vítej v zahradě' : 'Vítej zpátky');
    await refreshAll();
  } catch (e) { $('authErr').textContent = e.message; }
});

// ---------- Kamenný pes (schovaný kóan) ----------
function setMu(on) {
  state.showMu = on;
  $('dog').setAttribute('aria-pressed', String(on));
}
$('dog').onclick = (ev) => {
  ev.stopPropagation(); // ať se nepoloží kámen
  setMu(!state.showMu);
  renderDay();
};

// ---------- Hrabaný písek ----------
const cssColors = () => {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(['sand', 'sand-line', 'stone', 'stone-hi'].map((n) => [n, cs.getPropertyValue('--' + n).trim()]));
};

function stoneShape(c, s, i, col) {
  c.beginPath();
  for (let k = 0; k <= 9; k++) {
    const a = k / 9 * Math.PI * 2, j = 1 + Math.sin(a * 3 + i * 1.7) * .09;
    const px = s.x + Math.cos(a) * s.r * j * 1.15, py = s.y + Math.sin(a) * s.r * j * .85;
    k ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath(); c.fillStyle = col.stone; c.fill();
  c.beginPath(); c.ellipse(s.x - s.r * .25, s.y - s.r * .3, s.r * .45, s.r * .2, -.3, 0, Math.PI * 2);
  c.fillStyle = col['stone-hi']; c.globalAlpha = .6; c.fill(); c.globalAlpha = 1;
}

// Nakreslí uhrabaný písek. `objs` = věci, kolem kterých se rýhy stáčejí do kruhů.
// `length` omezuje, kolik rýh už je vyhrabáno (pro Jednu minutu).
function paintSand(c, w, h, objs, col, { gap = 9, lw = 1.4, length = Infinity } = {}) {
  c.fillStyle = col.sand; c.fillRect(0, 0, w, h);
  c.strokeStyle = col['sand-line']; c.lineWidth = lw; c.lineCap = 'round';
  const step = Math.max(3, gap / 3);
  let left = length;
  for (let y = gap / 2; y < h && left > 0; y += gap) {
    c.beginPath();
    let pen = false;
    const end = Math.min(w, left);
    for (let x = 0; x <= end; x += step) {
      const yy = y + Math.sin(x / (gap * 10) + y / (gap * 4.4)) * gap * .13;
      if (objs.some((s) => Math.hypot(x - s.x, yy - s.y) < s.halo)) { pen = false; continue; }
      pen ? c.lineTo(x, yy) : c.moveTo(x, yy);
      pen = true;
    }
    c.stroke();
    left -= w;
  }
  objs.forEach((s) => { for (let r = s.r + gap * .9; r < s.halo; r += gap) { c.beginPath(); c.arc(s.x, s.y, r, 0, Math.PI * 2); c.stroke(); } });
  objs.forEach((s, i) => { if (!s.dog) stoneShape(c, s, s.seed ?? i, col); });
}

const cv = $('sand'), gd = $('garden');
const DOG = { x: .9, y: .34 };
// Sedm míst v písku, jedno pro každý den týdne (pondělí až neděle)
const SLOTS = [[.1, .62, 18], [.22, .4, 24], [.35, .66, 15], [.47, .42, 22], [.59, .66, 17], [.7, .4, 21], [.79, .72, 13]];
let extras = []; // kameny položené klepnutím; nezůstávají
const born = {}; // kdy se který kámen objevil (kvůli rozvlnění)

function draw() {
  const w = gd.clientWidth, h = gd.clientHeight, dpr = devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr;
  const c = cv.getContext('2d');
  c.scale(dpr, dpr);
  const col = cssColors();
  const k = Math.max(.62, Math.min(1, w / 760));
  const ring = w < 520 ? 20 : 34;
  const now = performance.now();
  let moving = false;
  const grow = (key, s) => {
    const t0 = born[key];
    const p = reduced || !t0 ? 1 : Math.min(1, (now - t0) / 1400);
    if (p < 1) moving = true;
    const e = 1 - Math.pow(1 - p, 3);
    return { ...s, r: s.r * (0.6 + 0.4 * Math.min(1, p * 3)), halo: s.r + 8 + ring * e };
  };
  const S = [
    ...state.week.map((day) => {
      const i = weekdayIdx(day), [x, y, r] = SLOTS[i];
      if (day === state.today && !(day in born)) born[day] = now; // dnešní kámen se právě položil
      return grow(day, { x: x * w, y: y * h, r: r * k, seed: i });
    }),
    ...extras.map((s, i) => grow('x' + s.id, { x: s.x * w, y: s.y * h, r: s.r * k, seed: i + 7 })),
  ];
  if (moving) requestAnimationFrame(draw);
  const dogHalo = w < 520 ? 44 : 52;
  const D = { x: Math.min(DOG.x * w, w - dogHalo - 10), y: DOG.y * h, r: 24, halo: dogHalo, dog: true };
  paintSand(c, w, h, [...S, D], col);
  drawDog(c, D, col);
}

function drawDog(c, D, col) {
  const x = D.x, y = D.y + 6;
  const el = (cx, cy, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2); c.fill(); };
  c.save();
  c.fillStyle = col.stone;
  el(x + 3, y + 6, 13, 10); el(x - 8, y - 3, 6, 11, -.35); c.fillRect(x - 12, y + 2, 4, 14); // tělo, hruď, přední noha
  el(x - 11, y - 15, 7, 6); el(x - 18, y - 13, 4.5, 3); // hlava a čumák
  c.beginPath(); c.moveTo(x - 12, y - 19); c.lineTo(x - 6, y - 25); c.lineTo(x - 6, y - 17); c.closePath(); c.fill(); // ucho
  c.strokeStyle = col.stone; c.lineWidth = 3.5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x + 14, y + 8); c.quadraticCurveTo(x + 22, y + 4, x + 19, y - 5); c.stroke(); // ocas
  c.fillStyle = col['stone-hi']; c.globalAlpha = .6; el(x - 12, y - 17, 3, 1.5, -.3);
  c.restore();
  const b = $('dog');
  b.style.left = (D.x - 28) + 'px';
  b.style.top = (D.y - 24) + 'px';
}

let extraId = 0;
gd.addEventListener('click', (e) => {
  const b = gd.getBoundingClientRect();
  const s = { id: ++extraId, x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height, r: 10 + Math.random() * 10 };
  born['x' + s.id] = performance.now();
  extras.push(s);
  if (extras.length > 3) extras.shift();
  draw();
});
addEventListener('resize', draw);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);

// ---------- Jedna minuta ----------
const MINUTE = 60_000;
const minute = { raf: 0, start: 0, audio: null, lock: null };
const bellOn = () => store.get('tz-bell', false);

function renderBell() {
  $('bellBtn').textContent = 'Zvon na konci: ' + (bellOn() ? 'zapnutý' : 'vypnutý');
  $('bellBtn').setAttribute('aria-pressed', String(bellOn()));
}
function audioCtx() {
  // Zvuk smí vzniknout jen po klepnutí, proto se připravuje při startu nebo přepnutí zvonu
  try {
    minute.audio ??= new (window.AudioContext || window.webkitAudioContext)();
    minute.audio.resume?.();
  } catch { minute.audio = null; }
  return minute.audio;
}
function ring() {
  const ctx = minute.audio;
  if (!ctx) return;
  const t = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = .14;
  master.connect(ctx.destination);
  // Tichý zvon: základní tón a tři svrchní, každý doznívá jinak dlouho
  [[392, .5, 7], [788, .25, 5], [1109, .14, 3.5], [1607, .07, 2.5]].forEach(([f, g, dur]) => {
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.frequency.value = f;
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(g, t + .015);
    a.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(a).connect(master);
    o.start(t);
    o.stop(t + dur);
  });
}

function minuteFrame() {
  const m = $('minuteSand');
  const w = m.clientWidth, h = m.clientHeight, dpr = devicePixelRatio || 1;
  if (m.width !== w * dpr) { m.width = w * dpr; m.height = h * dpr; }
  const c = m.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const gap = 14, lines = Math.ceil(h / gap);
  let p = Math.min(1, (performance.now() - minute.start) / MINUTE);
  if (reduced) p = Math.floor(p * lines) / lines; // bez plynulého pohybu: rýha po rýze
  const r = Math.min(w, h) * .07;
  paintSand(c, w, h, [{ x: w / 2, y: h * .44, r, halo: r + gap * 5.2, seed: 2 }], cssColors(), { gap, lw: 1.8, length: p * lines * w });
  if (p < 1) minute.raf = requestAnimationFrame(minuteFrame);
  else {
    if (bellOn()) ring();
    minute.raf = 0;
    setTimeout(() => endMinute(), bellOn() ? 6000 : 2500);
  }
}

async function startMinute() {
  if (bellOn()) audioCtx();
  renderBell();
  const el = $('minute');
  el.classList.remove('out');
  el.hidden = false;
  document.body.style.overflow = 'hidden';
  minute.start = performance.now();
  minute.raf = requestAnimationFrame(minuteFrame);
  try { minute.lock = await navigator.wakeLock?.request('screen'); } catch { /* nevadí */ }
  $('minuteEnd').focus();
}
function endMinute() {
  const el = $('minute');
  if (el.hidden || el.classList.contains('out')) return;
  cancelAnimationFrame(minute.raf);
  minute.lock?.release?.().catch(() => {});
  el.classList.add('out');
  setTimeout(() => { el.hidden = true; el.classList.remove('out'); document.body.style.overflow = ''; $('minuteBtn').focus(); }, reduced ? 0 : 1500);
}
$('minuteBtn').onclick = startMinute;
$('minuteEnd').onclick = endMinute;
$('bellBtn').onclick = () => { store.set('tz-bell', !bellOn()); if (bellOn()) audioCtx(); renderBell(); };
addEventListener('keydown', (e) => { if (e.key === 'Escape') endMinute(); });

// ---------- Kartička ke sdílení ----------
const CARD = { sand: '#e6e7e1', 'sand-line': '#cdcfc6', stone: '#73766e', 'stone-hi': '#959890', bg: '#f4f4f0', ink: '#30342d', muted: '#767a71' };
const CJK = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif';

function wrapLines(c, text, maxW) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const t = line ? line + ' ' + word : word;
    if (line && c.measureText(t).width > maxW) { lines.push(line); line = word; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

async function paintCard() {
  const q = current();
  const cvs = $('card'), c = cvs.getContext('2d'), W = 1080, H = 1920;
  const big = q.text.length <= 2; // kóan o jednom znaku
  const size = big ? 380 : q.text.length > 90 ? 58 : q.text.length > 50 ? 68 : 80;
  const quoteFont = big ? `400 ${size}px ${CJK}` : `300 ${size}px Nunito, sans-serif`;
  const orig = big ? '' : (q.orig || '');
  try {
    await Promise.all([
      document.fonts.load(quoteFont, q.text),
      document.fonts.load('400 36px Nunito', q.who),
      orig && document.fonts.load(`400 46px ${CJK}`, orig),
    ]);
  } catch { /* nakreslí se náhradním písmem */ }

  c.fillStyle = CARD.bg; c.fillRect(0, 0, W, H);
  // Pruh písku s jedním kamenem
  c.save();
  c.beginPath(); c.rect(0, 0, W, 700); c.clip();
  paintSand(c, W, 700, [{ x: 330, y: 360, r: 74, halo: 74 + 150, seed: 1 }], CARD, { gap: 27, lw: 3.6 });
  const fade = c.createLinearGradient(0, 520, 0, 700);
  fade.addColorStop(0, 'rgba(244,244,240,0)'); fade.addColorStop(1, CARD.bg);
  c.fillStyle = fade; c.fillRect(0, 520, W, 180);
  c.restore();

  // Výrok
  const left = 110, textW = orig ? 700 : 860;
  c.fillStyle = CARD.ink; c.font = quoteFont; c.textBaseline = 'top';
  const lines = big ? [q.text] : wrapLines(c, q.text, textW);
  const lh = size * (big ? 1 : 1.3);
  let y = 820;
  lines.forEach((l) => { c.fillText(l, left, y); y += lh; });
  y += 44;
  c.fillStyle = CARD.muted; c.font = '400 36px Nunito, sans-serif';
  c.fillText('— ' + q.who, left, y);
  if (q.source) {
    c.font = '400 28px Nunito, sans-serif';
    wrapLines(c, q.source, textW).forEach((l, i) => c.fillText(l, left, y + 58 + i * 40));
  }

  // Originál: svislé sloupce zprava doleva
  if (orig) {
    const fs = 46, colW = 82, perCol = 15;
    const cols = orig.split(/\s+/).flatMap((part) => part.match(new RegExp(`.{1,${perCol}}`, 'gu')));
    c.font = `400 ${fs}px ${CJK}`; c.textAlign = 'center'; c.fillStyle = CARD.muted;
    c.strokeStyle = CARD['sand-line']; c.lineWidth = 2;
    const x0 = W - 120;
    cols.slice(0, 3).forEach((col, i) => [...col].forEach((ch, j) => c.fillText(ch, x0 - i * colW, 830 + j * fs * 1.28)));
    c.textAlign = 'left';
  }

  c.fillStyle = CARD.ink; c.font = '300 40px Nunito, sans-serif'; c.textBaseline = 'alphabetic';
  c.fillText('Tichá zahrada', left, H - 120);
  return cvs;
}

const cardBlob = () => new Promise((res) => $('card').toBlob(res, 'image/png'));
let cardUrl = '';
$('shareBtn').onclick = async () => {
  $('share').showModal();
  await paintCard();
  const blob = await cardBlob();
  URL.revokeObjectURL(cardUrl);
  cardUrl = URL.createObjectURL(blob);
  $('shareSave').href = cardUrl;
  const file = new File([blob], 'ticha-zahrada.png', { type: 'image/png' });
  $('shareSend').hidden = !navigator.canShare?.({ files: [file] });
  $('shareSend').onclick = () => navigator.share({ files: [file] }).catch(() => {});
};
$('shareCopy').onclick = () => {
  const q = current();
  const t = `„${q.text}“ — ${q.who}`;
  navigator.clipboard.writeText(t).then(() => toast('Zkopírováno'), () => toast('Kopírování se nepovedlo'));
};
$('shareClose').onclick = () => $('share').close();

// ---------- Ikona na ploše (iPhone) ----------
// Nápověda se ukáže jen v Safari na iPhonu či iPadu, dokud zahrada není na ploše.
const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
if (ios && !standalone && !store.get('tz-a2hs', false)) $('a2hs').hidden = false;
$('a2hsClose').onclick = () => { store.set('tz-a2hs', true); $('a2hs').hidden = true; };

// ---------- Start ----------
const params = new URLSearchParams(location.search);
if (params.has('platba')) {
  history.replaceState(null, '', '/');
  setTimeout(() => toast(params.get('platba') === 'ok' ? 'Děkujeme. Členství se zapne během chvilky.' : 'Platba zrušena. Nic se nestrhlo.'), 300);
}
renderBell();
draw();
refreshAll().catch((e) => { $('quote').textContent = 'Zahrada se nenačetla. Zkus obnovit stránku.'; console.error(e); });
// Po návratu z platby chvíli počkáme na potvrzení od Stripe a načteme znovu
if (params.get('platba') === 'ok') setTimeout(() => refreshAll(), 4000);
