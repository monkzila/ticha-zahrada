import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUOTES, TOPICS, MU, pickQuote, quoteById } from './lib/quotes.js';
import { COLLECTIONS, TRANSLATION_CREDIT } from './lib/details.js';
import { hashPassword, checkPassword, createSession, userFromToken, deleteSession, parseCookies, rateLimiter } from './lib/auth.js';
import { stripeClient, verifyWebhook } from './lib/stripe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GARDENS = ['', 'moss', 'dusk'];
const PLUS_THEMES = ['', 'matcha', 'kincugi', 'ticho']; // '' = Kámen
const ARCHIVE_FREE = 7;
const ARCHIVE_PREMIUM = 30;
const COOKIE = 'tz_session';

const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
const addDays = (day, n) => new Date(Date.parse(day + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const utcToday = () => new Date().toISOString().slice(0, 10);

export function createApp({ db, env = process.env }) {
  const app = express();
  const prod = env.NODE_ENV === 'production';
  const baseUrl = (env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const stripe = env.STRIPE_SECRET_KEY ? stripeClient(env.STRIPE_SECRET_KEY) : null;
  const demoPayments = !stripe && !prod; // bez Stripe klíčů a mimo produkci se prémium zapne "naoko"

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ---------- Stripe webhook (potřebuje surové tělo, proto je před express.json) ----------
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const raw = req.body.toString('utf8');
    if (!verifyWebhook(raw, req.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET)) {
      return res.status(400).send('Bad signature');
    }
    const event = JSON.parse(raw);
    const obj = event.data?.object || {};
    if (event.type === 'checkout.session.completed' && obj.client_reference_id) {
      db.prepare('UPDATE users SET premium = 1, stripe_customer = ? WHERE id = ?').run(obj.customer || null, Number(obj.client_reference_id));
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const active = event.type === 'customer.subscription.updated' && ['active', 'trialing'].includes(obj.status);
      db.prepare('UPDATE users SET premium = ? WHERE stripe_customer = ?').run(active ? 1 : 0, obj.customer);
    }
    res.json({ received: true });
  });

  app.use(express.json({ limit: '20kb' }));

  // Základní bezpečnostní hlavičky
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:",
    });
    next();
  });

  // Zápisy přijímáme jen jako JSON (spolu se SameSite cookie to brání CSRF)
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && !req.is('application/json')) {
      return res.status(415).json({ error: 'Očekávám JSON.' });
    }
    next();
  });

  // Kdo je přihlášený
  app.use((req, res, next) => {
    req.token = parseCookies(req.get('cookie'))[COOKIE];
    req.user = userFromToken(db, req.token);
    next();
  });

  const setCookie = (res, token, maxAge) =>
    res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: prod, maxAge, path: '/' });

  const needUser = (req, res, next) => (req.user ? next() : res.status(401).json({ error: 'Nejdřív se přihlas.' }));
  const needPremium = (req, res, next) =>
    req.user?.premium ? next() : res.status(403).json({ error: 'Tohle je součást předplatného.' });

  const topicsOf = (u) => (u?.premium ? JSON.parse(u.topics || '[]') : []);
  const publicUser = (u) =>
    u && { email: u.email, premium: !!u.premium, garden: u.premium ? u.garden : '', plus: u.premium ? u.plus : '', topics: topicsOf(u) };

  // Dny tohoto týdne (pondělí až dnešek), kdy člověk zahradu otevřel. Za každý leží v písku kámen.
  function week(userId, today) {
    const dow = (new Date(today + 'T00:00:00Z').getUTCDay() + 6) % 7;
    return db.prepare('SELECT day FROM visits WHERE user_id = ? AND day >= ? AND day <= ? ORDER BY day')
      .all(userId, addDays(today, -dow), today).map((r) => r.day);
  }

  // Den, který klient považuje za "dnes" (podle svého časového pásma). Povolíme ±1 den proti serveru.
  function clientToday(req) {
    const t = req.query.today;
    const s = utcToday();
    if (!isDay(t) || t < addDays(s, -1) || t > addDays(s, 1)) return s;
    return t;
  }

  // ---------- Účet ----------
  const authLimit = rateLimiter(env.NODE_ENV === 'test' ? 1000 : 20);

  app.post('/api/register', authLimit, (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: 'Zkontroluj e-mail.' });
    if (password.length < 8) return res.status(400).json({ error: 'Heslo musí mít aspoň 8 znaků.' });
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return res.status(409).json({ error: 'Tento e-mail už má účet. Přihlas se.' });
    const { lastInsertRowid } = db.prepare('INSERT INTO users (email, pass) VALUES (?, ?)').run(email, hashPassword(password));
    const s = createSession(db, Number(lastInsertRowid));
    setCookie(res, s.token, s.maxAge);
    res.status(201).json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid)) });
  });

  app.post('/api/login', authLimit, (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !checkPassword(String(req.body.password || ''), user.pass)) {
      return res.status(401).json({ error: 'E-mail nebo heslo nesedí.' });
    }
    const s = createSession(db, user.id);
    setCookie(res, s.token, s.maxAge);
    res.json({ user: publicUser(user) });
  });

  app.post('/api/logout', (req, res) => {
    deleteSession(db, req.token);
    res.clearCookie(COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/me', (req, res) => res.json({ user: publicUser(req.user), topics: TOPICS, mu: MU, credit: TRANSLATION_CREDIT, payments: stripe ? 'stripe' : demoPayments ? 'demo' : 'off' }));

  // ---------- Moudro ----------
  app.get('/api/day', (req, res) => {
    const today = clientToday(req);
    const day = isDay(req.query.date) ? req.query.date : today;
    const window = req.user?.premium ? ARCHIVE_PREMIUM : ARCHIVE_FREE;
    if (day > today || day <= addDays(today, -window)) {
      return res.status(403).json({ error: req.user?.premium ? 'Tak daleko archiv nesahá.' : 'Starší dny jsou v předplatném.' });
    }
    const q = pickQuote(day, topicsOf(req.user));
    const out = { day, today, quote: q, favorite: false, journal: null };
    if (req.user) {
      if (day === today) db.prepare('INSERT OR IGNORE INTO visits (user_id, day) VALUES (?, ?)').run(req.user.id, today);
      out.favorite = !!db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND quote_id = ?').get(req.user.id, q.id);
      if (req.user.premium) out.journal = db.prepare('SELECT text FROM journal WHERE user_id = ? AND day = ?').get(req.user.id, day)?.text ?? '';
      out.week = week(req.user.id, today);
    }
    res.json(out);
  });

  app.get('/api/days', (req, res) => {
    const today = clientToday(req);
    const window = req.user?.premium ? ARCHIVE_PREMIUM : ARCHIVE_FREE;
    const topics = topicsOf(req.user);
    const days = Array.from({ length: window }, (_, i) => {
      const day = addDays(today, -i);
      const q = pickQuote(day, topics);
      return { day, id: q.id, text: q.text };
    });
    res.json({ days, window });
  });

  // ---------- Sbírky ----------
  app.get('/api/collections', (req, res) => {
    const open = !!req.user?.premium;
    res.json({
      open,
      collections: COLLECTIONS.map((c) => ({
        key: c.key, title: c.title, desc: c.desc, count: c.ids.length,
        quotes: open ? c.ids.map(quoteById).filter(Boolean) : undefined,
        notes: open ? c.notes : undefined,
        hasNotes: !!c.notes,
      })),
    });
  });

  // ---------- Oblíbené ----------
  app.get('/api/favorites', needUser, (req, res) => {
    const rows = db.prepare('SELECT quote_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ favorites: rows.map((r) => quoteById(r.quote_id)).filter(Boolean) });
  });

  app.post('/api/favorites', needUser, (req, res) => {
    const id = Number(req.body.quoteId);
    if (!quoteById(id)) return res.status(400).json({ error: 'Neznámý výrok.' });
    const exists = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND quote_id = ?').get(req.user.id, id);
    if (exists) db.prepare('DELETE FROM favorites WHERE user_id = ? AND quote_id = ?').run(req.user.id, id);
    else db.prepare('INSERT INTO favorites (user_id, quote_id) VALUES (?, ?)').run(req.user.id, id);
    res.json({ favorite: !exists });
  });

  // ---------- Prémiové funkce ----------
  app.put('/api/settings', needUser, needPremium, (req, res) => {
    const garden = GARDENS.includes(req.body.garden) ? req.body.garden : '';
    const plus = PLUS_THEMES.includes(req.body.plus) ? req.body.plus : '';
    const topics = Array.isArray(req.body.topics) ? [...new Set(req.body.topics.filter((t) => t in TOPICS))] : [];
    db.prepare('UPDATE users SET garden = ?, plus = ?, topics = ? WHERE id = ?').run(garden, plus, JSON.stringify(topics), req.user.id);
    res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)) });
  });

  app.put('/api/journal', needUser, needPremium, (req, res) => {
    const { day } = req.body;
    const text = String(req.body.text || '').slice(0, 4000);
    if (!isDay(day)) return res.status(400).json({ error: 'Neplatné datum.' });
    if (text.trim()) {
      db.prepare(`INSERT INTO journal (user_id, day, text) VALUES (?, ?, ?)
        ON CONFLICT(user_id, day) DO UPDATE SET text = excluded.text, updated_at = datetime('now')`).run(req.user.id, day, text);
    } else {
      db.prepare('DELETE FROM journal WHERE user_id = ? AND day = ?').run(req.user.id, day);
    }
    res.json({ ok: true });
  });

  // ---------- Platby ----------
  app.post('/api/checkout', needUser, async (req, res) => {
    if (req.user.premium) return res.json({ already: true });
    if (demoPayments) {
      db.prepare('UPDATE users SET premium = 1 WHERE id = ?').run(req.user.id);
      return res.json({ demo: true });
    }
    const plan = req.body.plan === 'monthly' ? 'monthly' : 'yearly';
    const price = plan === 'yearly' ? env.STRIPE_PRICE_YEARLY : env.STRIPE_PRICE_MONTHLY || env.STRIPE_PRICE_ID;
    if (!stripe || !price) return res.status(503).json({ error: 'Platby zatím nejsou zapnuté.' });
    try {
      const params = {
        mode: 'subscription',
        'line_items[0][price]': price,
        'line_items[0][quantity]': '1',
        success_url: baseUrl + '/?platba=ok',
        cancel_url: baseUrl + '/?platba=zrusena',
        client_reference_id: String(req.user.id),
        locale: 'cs',
        'subscription_data[trial_period_days]': String(env.TRIAL_DAYS || 14),
      };
      if (req.user.stripe_customer) params.customer = req.user.stripe_customer;
      else params.customer_email = req.user.email;
      const session = await stripe('checkout/sessions', params);
      res.json({ url: session.url });
    } catch (e) {
      console.error(e);
      res.status(502).json({ error: 'Platební brána teď neodpovídá. Zkus to za chvíli.' });
    }
  });

  app.post('/api/portal', needUser, async (req, res) => {
    if (demoPayments) {
      db.prepare('UPDATE users SET premium = 0 WHERE id = ?').run(req.user.id);
      return res.json({ demo: true });
    }
    if (!stripe || !req.user.stripe_customer) return res.status(400).json({ error: 'Předplatné nenalezeno.' });
    try {
      const s = await stripe('billing_portal/sessions', { customer: req.user.stripe_customer, return_url: baseUrl + '/' });
      res.json({ url: s.url });
    } catch (e) {
      console.error(e);
      res.status(502).json({ error: 'Správa předplatného teď neodpovídá.' });
    }
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Nenalezeno.' }));
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: prod ? '1h' : 0 }));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

  return app;
}

export { QUOTES };
