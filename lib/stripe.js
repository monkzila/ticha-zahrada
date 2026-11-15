import crypto from 'node:crypto';

// Malý klient pro Stripe API (bez další knihovny).
export function stripeClient(secretKey) {
  return async function call(path, params) {
    const res = await fetch('https://api.stripe.com/v1/' + path, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + secretKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Stripe error');
    return json;
  };
}

// Ověří, že webhook opravdu poslal Stripe (hlavička Stripe-Signature).
export function verifyWebhook(rawBody, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => p.split('=')).filter((p) => p.length === 2).map(([k, v]) => [k, v])
  );
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

export function signForTest(rawBody, secret, t = Math.floor(Date.now() / 1000)) {
  const sig = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return `t=${t},v1=${sig}`;
}
