# kushidō

Jedno zenové moudro a jeden malý úkol na každý den. Toto je **MVP**: nejmenší verze, se kterou už jde ověřit, jestli o to lidi stojí.

## Pro koho

Pro náročného a vytíženého čtenáře. Chce vědět, odkud výrok je, a nemá čas na meditační aplikaci.
Proto tu nejsou odznaky, počítadla sérií ani gratulace.

## Co umí

**Zdarma**
- výrok dne s originálem ve znacích, pramenem a kontextem „Proč to říkal“
- úkol „Na dnešek“
- **Jedna minuta**: stránka ztichne, v písku přibývají rýhy, na konci volitelný zvon
- kámen v zahradě za každý den v týdnu, kdy člověk přišel (v neděli se písek uhrabe)
- kartička ke sdílení (obrázek 1080 × 1920 pro stories)
- posledních 7 dní, účet, vlastní sbírka oblíbených

**Členství**
- tematické sbírky (Čajový obřad s průvodcem po japonských čajích, Haiku čtyř ročních období, Kóany starých mistrů)
- výběr témat, barva zahrady a barva celé aplikace (Kámen, Matcha, Kincugi, Ticho)
- deník ke každému dni
- archiv 30 dní
- 690 Kč ročně (hlavní nabídka) nebo 79 Kč měsíčně, 14 dní zdarma, platba přes Stripe

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
Původ (`orig` znaky, `source` pramen, `why` kontext) se píše pod stejným `id` do `lib/details.js`. Tam jsou i sbírky.

> Cíl: aspoň 365 mouder, ať se rok neopakují. Teď jich je 68.

## Jak to dostat na internet

1. **GitHub**: nahraj složku do nového repozitáře.
2. **Hosting**: např. Railway nebo Render. Založ „Web Service“ z repozitáře.
   - Start: `npm start`
   - Přidej **trvalý disk** (volume) a nastav `DATABASE_FILE` na cestu na něm, např. `/data/zahrada.db`. Bez disku se data smažou při každém nasazení!
3. **Proměnné prostředí**: zkopíruj z `.env.example` a vyplň.
4. **Doména**: v nastavení hostingu připoj svou doménu a nastav ji do `BASE_URL`.

## Aplikace v iPhonu (ikona na ploše)

Web se dá přidat na plochu a pak se otevírá jako aplikace: s vlastní ikonou, na celou obrazovku.

1. Web musí běžet na internetu na adrese s `https://` (viz výše).
2. Otevři ho v **Safari**.
3. Klepni na **Sdílet** (čtvereček se šipkou) > **Přidat na plochu** > **Přidat**.

Ikony jsou v `public/icons/`, název a barvy v `public/manifest.webmanifest`.

## Jak zapnout platby (Stripe)

1. Založ účet na stripe.com (nejdřív v testovacím režimu).
2. **Produkt**: Produkty > Přidat > „kushidō, členství“ se dvěma opakovanými cenami: 690 Kč ročně (`price_...` do `STRIPE_PRICE_YEARLY`) a 79 Kč měsíčně (do `STRIPE_PRICE_MONTHLY`).
3. **Klíč**: Vývojáři > API klíče > tajný klíč do `STRIPE_SECRET_KEY`.
4. **Webhook**: Vývojáři > Webhooky > přidat endpoint `https://tvoje-domena.cz/api/stripe/webhook` s událostmi
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   Podpisový klíč `whsec_...` do `STRIPE_WEBHOOK_SECRET`.
5. **Zákaznický portál**: Nastavení > Billing > Customer portal > zapnout (aby si lidi mohli předplatné zrušit sami).
6. Vyzkoušej testovací kartou `4242 4242 4242 4242`. Pak přepni na ostré klíče.

Ceny na stránce změníš v `public/index.html` (hledej „690 Kč“ a „79 Kč“).

## Než to pustíš lidem

- [ ] obchodní podmínky a zásady ochrany osobních údajů (GDPR), odkaz do patičky
- [ ] **kontrola znaků** člověkem, který umí japonsky a čínsky: `docs/kontrola-znaku.md`
- [ ] kontrola kontextů „Proč to říkal“ a jméno překladatele (`TRANSLATION_CREDIT` v `lib/details.js`)
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
