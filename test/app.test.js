import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../lib/db.js';
import { createApp } from '../app.js';
import { pickQuote, QUOTES } from '../lib/quotes.js';
import { signForTest } from '../lib/stripe.js';

const SECRET = 'whsec_test';
let server, base, db;
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.parse(today) - n * 864e5).toISOString().slice(0, 10);

function client() {
  let cookie = '';
  return async (path, { method = 'GET', body } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => null) };
  };
}

before(async () => {
  db = openDb(':memory:');
  const app = createApp({ db, env: { NODE_ENV: 'test', STRIPE_WEBHOOK_SECRET: SECRET } });
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('každý den má výrok a ids jsou unikátní', () => {
  assert.equal(new Set(QUOTES.map((q) => q.id)).size, QUOTES.length);
  assert.ok(pickQuote('2026-11-15').text);
  assert.notEqual(pickQuote('2026-11-15').id, pickQuote('2026-11-16').id);
  assert.ok(pickQuote('2026-11-15', ['vztahy']).topics.includes('vztahy'));
});

test('anonym vidí dnešek a 7 dní, ale ne starší', async () => {
  const api = client();
  const d = await api(`/api/day?today=${today}`);
  assert.equal(d.status, 200);
  assert.equal(d.body.day, today);
  assert.equal((await api(`/api/days?today=${today}`)).body.days.length, 7);
  assert.equal((await api(`/api/day?today=${today}&date=${daysAgo(10)}`)).status, 403);
  assert.equal((await api(`/api/day?today=${today}&date=${daysAgo(-1)}`)).status, 403, 'budoucnost je skrytá');
});

test('registrace, přihlášení, oblíbené', async () => {
  const api = client();
  assert.equal((await api('/api/register', { method: 'POST', body: { email: 'a@b.cz', password: 'kratke' } })).status, 400);
  const r = await api('/api/register', { method: 'POST', body: { email: 'A@b.cz', password: 'tichavoda1' } });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.premium, false);
  assert.equal((await api('/api/register', { method: 'POST', body: { email: 'a@b.cz', password: 'tichavoda1' } })).status, 409);

  const d = await api(`/api/day?today=${today}`);
  assert.deepEqual(d.body.week, [today]);
  assert.equal(d.body.streak, undefined, 'žádná počítadla sérií');
  const f = await api('/api/favorites', { method: 'POST', body: { quoteId: d.body.quote.id } });
  assert.equal(f.body.favorite, true);
  assert.equal((await api('/api/favorites')).body.favorites.length, 1);

  await api('/api/logout', { method: 'POST', body: {} });
  assert.equal((await api('/api/favorites')).status, 401);
  assert.equal((await api('/api/login', { method: 'POST', body: { email: 'a@b.cz', password: 'spatne-heslo' } })).status, 401);
  assert.equal((await api('/api/login', { method: 'POST', body: { email: 'a@b.cz', password: 'tichavoda1' } })).status, 200);
});

test('prémiové funkce jsou zamčené, po zaplacení odemčené', async () => {
  const api = client();
  await api('/api/register', { method: 'POST', body: { email: 'p@b.cz', password: 'tichavoda1' } });
  assert.equal((await api('/api/settings', { method: 'PUT', body: { garden: 'moss', topics: ['vztahy'] } })).status, 403);
  assert.equal((await api('/api/journal', { method: 'PUT', body: { day: today, text: 'x' } })).status, 403);

  const c = await api('/api/checkout', { method: 'POST', body: {} });
  assert.equal(c.body.demo, true);
  const s = await api('/api/settings', { method: 'PUT', body: { garden: 'moss', plus: 'kincugi', topics: ['vztahy', 'nesmysl'] } });
  assert.deepEqual(s.body.user.topics, ['vztahy']);
  assert.equal(s.body.user.plus, 'kincugi');
  const bad = await api('/api/settings', { method: 'PUT', body: { garden: 'moss', plus: 'tus', topics: ['vztahy'] } });
  assert.equal(bad.body.user.plus, '', 'neznámá barva se vrátí na Kámen');
  await api('/api/settings', { method: 'PUT', body: { garden: 'moss', plus: 'kincugi', topics: ['vztahy'] } });
  assert.equal(s.body.user.garden, 'moss');

  const d = await api(`/api/day?today=${today}`);
  assert.ok(d.body.quote.topics.includes('vztahy'));
  await api('/api/journal', { method: 'PUT', body: { day: today, text: 'Dnes jsem poslouchal.' } });
  assert.equal((await api(`/api/day?today=${today}`)).body.journal, 'Dnes jsem poslouchal.');
  assert.equal((await api(`/api/days?today=${today}`)).body.days.length, 30);
  assert.equal((await api(`/api/day?today=${today}&date=${daysAgo(20)}`)).status, 200);
});

test('Stripe webhook: podpis je povinný, zapíná a vypíná prémium', async () => {
  const api = client();
  await api('/api/register', { method: 'POST', body: { email: 's@b.cz', password: 'tichavoda1' } });
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get('s@b.cz');
  const send = (event, sig) => fetch(base + '/api/stripe/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': sig ?? signForTest(JSON.stringify(event), SECRET) },
    body: JSON.stringify(event),
  });

  const paid = { type: 'checkout.session.completed', data: { object: { client_reference_id: String(user.id), customer: 'cus_1' } } };
  assert.equal((await send(paid, 't=1,v1=podvrh')).status, 400);
  assert.equal((await send(paid)).status, 200);
  assert.equal((await api('/api/me')).body.user.premium, true);

  await send({ type: 'customer.subscription.deleted', data: { object: { customer: 'cus_1', status: 'canceled' } } });
  assert.equal((await api('/api/me')).body.user.premium, false);
});

test('každý výrok má pramen a kontext, sbírky odkazují na existující výroky', async () => {
  for (const q of QUOTES) assert.ok(q.source && q.why, `výrok ${q.id}`);
  const api = client();
  const free = await api('/api/collections');
  assert.equal(free.body.open, false);
  assert.ok(free.body.collections.length >= 3);
  for (const c of free.body.collections) assert.equal(c.quotes, undefined, 'obsah sbírek je v předplatném');
  await api('/api/register', { method: 'POST', body: { email: 'c@b.cz', password: 'tichavoda1' } });
  await api('/api/checkout', { method: 'POST', body: { plan: 'yearly' } });
  const paid = await api('/api/collections');
  for (const c of paid.body.collections) assert.equal(c.quotes.length, c.count);
});

test('zápisy bez JSON jsou odmítnuté', async () => {
  const res = await fetch(base + '/api/login', { method: 'POST', body: 'email=a' });
  assert.equal(res.status, 415);
});
