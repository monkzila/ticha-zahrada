import fs from 'node:fs';
import path from 'node:path';
import { openDb } from './lib/db.js';
import { createApp } from './app.js';

const file = process.env.DATABASE_FILE || './data/zahrada.db';
fs.mkdirSync(path.dirname(file), { recursive: true });

const db = openDb(file);
const app = createApp({ db });
const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  const pay = process.env.STRIPE_SECRET_KEY ? 'Stripe' : process.env.NODE_ENV === 'production' ? 'vypnuto' : 'demo (bez placení)';
  console.log(`Tichá zahrada běží na http://localhost:${port}  ·  platby: ${pay}`);
});
