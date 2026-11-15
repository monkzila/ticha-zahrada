const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmt = (s, o) => fromIso(s).toLocaleDateString('cs-CZ', o);
const dayOfYear = (s) => { const d = fromIso(s); return Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = { me: null, topics: {}, payments: 'off', today: isoLocal(new Date()), shown: null, entry: null };
state.shown = state.today;

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Něco se pokazilo. Zkus to znovu.'), { status: res.status });
  return data;
}

function toast(t) {
  const el = $('toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

// ---------- Načtení ----------
async function loadMe() {
  const r = await api('/api/me');
  state.me = r.user;
  state.topics = r.topics;
  state.payments = r.payments;
}

async function loadDay() {
  try {
    state.entry = await api(`/api/day?today=${state.today}&date=${state.shown}`);
  } catch (e) {
    if (e.status === 403) { toast(e.message); state.shown = state.today; return loadDay(); }
    throw e;
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
  $('daysMore').hidden = !!state.me?.premium;
}

async function loadFavs() {
  $('favBox').hidden = !state.me;
  if (!state.me) return;
  const r = await api('/api/favorites');
  const ul = $('favs');
  ul.innerHTML = '';
  r.favorites.forEach((q) => {
    const li = document.createElement('li');
    const a = document.createElement('span'); a.className = 'q'; a.textContent = q.text;
    const w = document.createElement('span'); w.className = 'w'; w.textContent = '— ' + q.who;
    li.append(a, w);
    ul.append(li);
  });
  $('favEmpty').hidden = r.favorites.length > 0;
}

// ---------- Vykreslení ----------
function renderDay() {
  const e = state.entry;
  if (!e) return;
  $('todayLbl').textContent = fmt(state.today, { weekday: 'long', day: 'numeric', month: 'long' });
  const y = fromIso(e.day).getFullYear();
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  $('dayNo').textContent = `Den ${dayOfYear(e.day)} z ${leap ? 366 : 365} · ${fmt(e.day, { day: 'numeric', month: 'long' })}`;
  const key = e.day + ':' + e.quote.id;
  if (renderDay.last !== key) {
    renderDay.last = key;
    const s = document.querySelector('.saying');
    s.classList.remove('flow');
    void s.offsetWidth; // restart animace
    s.classList.add('flow');
  }
  $('quote').textContent = e.quote.text;
  $('who').textContent = '— ' + e.quote.who;
  $('practice').textContent = e.quote.practice;
  $('todayBtn').hidden = e.day === state.today;
  $('saveBtn').textContent = e.favorite ? 'Uloženo ✓' : 'Uložit si';
  $('saveBtn').classList.toggle('on', e.favorite);

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
  const s = me?.streak || 0;
  $('streak').hidden = s < 2;
  $('streak').textContent = `${s} dní v kuse`;
  $('streak').title = 'Kolik dní po sobě jsi zahradu navštívil(a)';

  const premium = !!me?.premium;
  document.documentElement.dataset.garden = premium ? me.garden : '';
  if (!document.documentElement.dataset.garden) delete document.documentElement.dataset.garden;

  $('plusBadge').textContent = premium ? 'Aktivní' : 'Předplatné';
  $('plusIntro').textContent = premium
    ? 'Tady si ladíš svou zahradu. Změny se ukládají hned.'
    : 'S předplatným si vybereš témata mouder, barvu zahrady, píšeš si deník a vidíš 30 dní zpátky.';
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

  $('payMode').textContent = state.payments === 'demo' ? 'zkušební režim: platby jsou jen naoko' : '';
}

async function refreshAll() {
  await loadMe();
  await loadDay();
  renderAccount();
  renderDay();
  await Promise.all([loadDays(), loadFavs()]);
  draw();
}

// ---------- Akce ----------
async function saveSettings(patch) {
  try {
    const r = await api('/api/settings', { method: 'PUT', body: { garden: state.me.garden, topics: state.me.topics, ...patch } });
    state.me = { ...state.me, ...r.user };
    renderAccount();
    draw();
    if ('topics' in patch) { await loadDay(); renderDay(); await loadDays(); toast('Témata uložena. Moudra se přizpůsobí.'); }
  } catch (e) { toast(e.message); }
}

document.querySelectorAll('#gardenChips .btn').forEach((b) => (b.onclick = () => saveSettings({ garden: b.dataset.g })));

$('saveBtn').onclick = async () => {
  if (!state.me) return openAuth('register', 'Pro vlastní sbírku si založ účet. Je zdarma.');
  try {
    const r = await api('/api/favorites', { method: 'POST', body: { quoteId: state.entry.quote.id } });
    state.entry.favorite = r.favorite;
    renderDay();
    loadFavs();
    toast(r.favorite ? 'Uloženo do tvé sbírky' : 'Odebráno ze sbírky');
  } catch (e) { toast(e.message); }
};

$('copyBtn').onclick = () => {
  const t = `„${state.entry.quote.text}“ — ${state.entry.quote.who}`;
  navigator.clipboard.writeText(t).then(() => toast('Zkopírováno'), () => {
    const r = document.createRange();
    r.selectNodeContents($('quote'));
    getSelection().removeAllRanges();
    getSelection().addRange(r);
    toast('Označeno. Zkopíruj přes Ctrl+C.');
  });
};

$('todayBtn').onclick = async () => { state.shown = state.today; await loadDay(); renderDay(); loadDays(); };

$('journalSave').onclick = async () => {
  try {
    await api('/api/journal', { method: 'PUT', body: { day: state.entry.day, text: $('journal').value } });
    $('journalState').textContent = 'Uloženo ' + new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { toast(e.message); }
};

$('buyBtn').onclick = async () => {
  if (!state.me) return openAuth('register', 'Nejdřív si založ účet. Pak tě pošleme k platbě.');
  try {
    const r = await api('/api/checkout', { method: 'POST', body: {} });
    if (r.url) { location.href = r.url; return; }
    toast(r.demo ? 'Předplatné zapnuto (zkušební režim, nic se neplatí).' : 'Předplatné už máš.');
    await refreshAll();
  } catch (e) { toast(e.message); }
};

$('manageBtn').onclick = async () => {
  try {
    const r = await api('/api/portal', { method: 'POST', body: {} });
    if (r.url) { location.href = r.url; return; }
    toast('Předplatné zrušeno (zkušební režim).');
    await refreshAll();
  } catch (e) { toast(e.message); }
};

$('logoutBtn').onclick = async () => {
  await api('/api/logout', { method: 'POST', body: {} });
  toast('Odhlášeno. Ať se ti daří.');
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
    toast(authMode === 'register' ? 'Vítej v zahradě 🌿' : 'Vítej zpátky');
    await refreshAll();
  } catch (e) { $('authErr').textContent = e.message; }
});

// ---------- Hrabaný písek ----------
const cv = $('sand'), gd = $('garden');
let stones = [{ x: .22, y: .5, r: 30 }, { x: .7, y: .38, r: 22 }, { x: .78, y: .62, r: 14 }];
function draw() {
  const w = gd.clientWidth, h = gd.clientHeight, dpr = devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr;
  const c = cv.getContext('2d');
  c.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement), col = (n) => cs.getPropertyValue(n).trim();
  c.fillStyle = col('--sand'); c.fillRect(0, 0, w, h);
  c.strokeStyle = col('--sand-line'); c.lineWidth = 1.4; c.lineCap = 'round';
  // Nový kámen: kruhy se od něj rozvlní jako na vodě (p = 0 → 1)
  const now = performance.now();
  let moving = false;
  const S = stones.map((s) => {
    const p = reduced || !s.born ? 1 : Math.min(1, (now - s.born) / 1400);
    if (p < 1) moving = true;
    const e = 1 - Math.pow(1 - p, 3);
    return { x: s.x * w, y: s.y * h, r: s.r * (0.6 + 0.4 * Math.min(1, p * 3)), halo: s.r + 8 + 36 * e };
  });
  if (moving) requestAnimationFrame(draw);
  const gap = 9;
  for (let y = gap / 2; y < h; y += gap) {
    c.beginPath();
    let pen = false;
    for (let x = 0; x <= w; x += 3) {
      const yy = y + Math.sin(x / 90 + y / 40) * 1.2;
      if (S.some((s) => Math.hypot(x - s.x, yy - s.y) < s.halo)) { pen = false; continue; }
      pen ? c.lineTo(x, yy) : c.moveTo(x, yy);
      pen = true;
    }
    c.stroke();
  }
  S.forEach((s) => { for (let r = s.r + 8; r < s.halo; r += gap) { c.beginPath(); c.arc(s.x, s.y, r, 0, Math.PI * 2); c.stroke(); } });
  S.forEach((s, i) => {
    c.beginPath();
    for (let k = 0; k <= 9; k++) {
      const a = k / 9 * Math.PI * 2, j = 1 + Math.sin(a * 3 + i * 1.7) * .09;
      const px = s.x + Math.cos(a) * s.r * j * 1.15, py = s.y + Math.sin(a) * s.r * j * .85;
      k ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath(); c.fillStyle = col('--stone'); c.fill();
    c.beginPath(); c.ellipse(s.x - s.r * .25, s.y - s.r * .3, s.r * .45, s.r * .2, -.3, 0, Math.PI * 2);
    c.fillStyle = col('--stone-hi'); c.globalAlpha = .6; c.fill(); c.globalAlpha = 1;
  });
}
gd.addEventListener('click', (e) => {
  const b = gd.getBoundingClientRect();
  stones.push({ x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height, r: 10 + Math.random() * 16, born: performance.now() });
  if (stones.length > 6) stones.shift();
  draw();
});
addEventListener('resize', draw);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);

// ---------- Start ----------
const params = new URLSearchParams(location.search);
if (params.has('platba')) {
  history.replaceState(null, '', '/');
  setTimeout(() => toast(params.get('platba') === 'ok' ? 'Díky! Předplatné se zapne během chvilky.' : 'Platba zrušena. Nic se nestrhlo.'), 300);
}
draw();
refreshAll().catch((e) => { $('quote').textContent = 'Zahrada se teď nenačetla. Zkus obnovit stránku.'; console.error(e); });
// Po návratu z platby chvíli počkáme na potvrzení od Stripe a načteme znovu
if (params.get('platba') === 'ok') setTimeout(() => refreshAll(), 4000);
