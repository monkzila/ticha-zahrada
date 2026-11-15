# Tichá zahrada 🪨

Jedno zenové moudro a jeden malý úkol na každý den. Toto je **MVP**: nejmenší verze, se kterou už jde ověřit, jestli o to lidi stojí.

## Co umí

**Zdarma**
- moudro dne + úkol „Na dnešek“
- posledních 7 dní
- účet (e-mail + heslo), vlastní sbírka oblíbených
- počítadlo dní v kuse

**Předplatné**
- výběr témat (Klid, Práce, Vztahy, Těžké dny)
- barva zahrady (Šedý písek, Mech, Soumrak)
- deník ke každému dni
- archiv 30 dní
- placení přes Stripe, 14 dní zdarma, zrušení přes Stripe portál

## Spuštění u sebe (5 minut)

Potřebuješ [Node.js](https://nodejs.org) verze 22.13 nebo novější.

```bash
npm install
npm start
```

Otevři http://localhost:3000. Bez Stripe klíčů běží platby **naoko**: tlačítko „Vyzkoušet zdarma“ předplatné rovnou zapne.

Testy: `npm test`

## Jak přidat nová moudra

Otevři `lib/quotes.js` a přidej řádek na konec seznamu. Každé moudro má `id` (nové číslo), `text`, `who` (autor), `practice` (úkol) a `topics` (témata).

> Cíl: aspoň 365 mouder, ať se rok neopakují. Teď jich je 68.

## Jak to dostat na internet

1. **GitHub**: nahraj složku do nového repozitáře.
2. **Hosting**: např. Railway nebo Render. Založ „Web Service“ z repozitáře.
   - Start: `npm start`
   - Přidej **trvalý disk** (volume) a nastav `DATABASE_FILE` na cestu na něm, např. `/data/zahrada.db`. Bez disku se data smažou při každém nasazení!
3. **Proměnné prostředí**: zkopíruj z `.env.example` a vyplň.
4. **Doména**: v nastavení hostingu připoj svou doménu a nastav ji do `BASE_URL`.

## Jak zapnout platby (Stripe)

1. Založ účet na stripe.com (nejdřív v testovacím režimu).
2. **Produkt**: Produkty → Přidat → „Tichá zahrada – předplatné“, cena 79 Kč měsíčně, opakovaná. Zkopíruj `price_...` do `STRIPE_PRICE_ID`.
3. **Klíč**: Vývojáři → API klíče → tajný klíč do `STRIPE_SECRET_KEY`.
4. **Webhook**: Vývojáři → Webhooky → přidat endpoint `https://tvoje-domena.cz/api/stripe/webhook` s událostmi
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   Podpisový klíč `whsec_...` do `STRIPE_WEBHOOK_SECRET`.
5. **Zákaznický portál**: Nastavení → Billing → Customer portal → zapnout (aby si lidi mohli předplatné zrušit sami).
6. Vyzkoušej testovací kartou `4242 4242 4242 4242`. Pak přepni na ostré klíče.

Cenu na stránce změníš v `public/index.html` (hledej „79 Kč“).

## Než to pustíš lidem

- [ ] obchodní podmínky a zásady ochrany osobních údajů (GDPR), odkaz do patičky
- [ ] vlastní překlady nebo ověřená práva k citátům
- [ ] víc mouder
- [ ] zálohy databáze (stačí kopírovat soubor `.db`)

## Co v MVP záměrně není (další kroky)

- zapomenuté heslo (zatím ručně přes podporu)
- ranní e-mail s moudrem
- přihlášení přes Google
- mobilní aplikace (web jde ale „Přidat na plochu“)

## Jak je to postavené

- `server.js` spouští aplikaci, `app.js` obsahuje všechny cesty API
- `lib/` databáze (SQLite vestavěné v Node), přihlášení, Stripe, moudra
- `public/` web, který vidí uživatel
- `test/` automatické testy
