// Obsah aplikace: výroky, autor, malý úkol na den a témata.
// Témata: klid, prace, vztahy, tezke (těžké dny).
// Překlady jsou volné. Nové výroky stačí přidat na konec seznamu (id musí být unikátní).

export const TOPICS = {
  klid: 'Klid',
  prace: 'Práce',
  vztahy: 'Vztahy',
  tezke: 'Těžké dny',
};

export const QUOTES = [
  { id: 1, text: 'Když jdeš, jdi. Když jíš, jez. Hlavně nezaváhej.', who: 'zenové rčení', practice: 'Udělej dnes jednu věc úplně celou, bez telefonu po ruce.', topics: ['klid', 'prace'] },
  { id: 2, text: 'V mysli začátečníka je mnoho možností, v mysli odborníka jen málo.', who: 'Šunrjú Suzuki', practice: 'Podívej se na něco známého, jako by to bylo poprvé.', topics: ['prace'] },
  { id: 3, text: 'Před osvícením štípej dříví a nos vodu. Po osvícení štípej dříví a nos vodu.', who: 'zenové rčení', practice: 'Udělej jednu všední práci pomalu a pečlivě.', topics: ['prace', 'klid'] },
  { id: 4, text: 'Starý rybník. Žába skočí. Šplouchnutí.', who: 'Macuo Bašó', practice: 'Zastav se a poslouchej jeden zvuk až do konce.', topics: ['klid'] },
  { id: 5, text: 'Studovat cestu znamená studovat sebe. Studovat sebe znamená zapomenout na sebe.', who: 'Dógen', practice: 'Pět minut nemysli na to, jak působíš na ostatní.', topics: ['klid', 'tezke'] },
  { id: 6, text: 'Zloděj odnesl všechno. Jen měsíc v okně tu nechal.', who: 'Rjókan', practice: 'Všimni si něčeho krásného, co ti nikdo nevezme.', topics: ['tezke'] },
  { id: 7, text: 'Prst, který ukazuje na měsíc, není měsíc.', who: 'zenové rčení', practice: 'Dnes méně vysvětluj a víc zkoušej.', topics: ['prace'] },
  { id: 8, text: 'Plný šálek už nic nepojme.', who: 'podle příběhu mistra Nan-ina', practice: 'Vyslechni někoho až do konce. Bez rady.', topics: ['vztahy', 'prace'] },
  { id: 9, text: 'Každý den je dobrý den.', who: 'Unmon', practice: 'Večer si zapiš jednu věc, která se povedla.', topics: ['tezke', 'klid'] },
  { id: 10, text: 'Sedmkrát upadnout, poosmé vstát.', who: 'japonské přísloví', practice: 'Vrať se k něčemu, co dlouho leží odložené.', topics: ['tezke', 'prace'] },
  { id: 11, text: 'Sedíš tiše, nic neděláš. Jaro přichází a tráva roste sama.', who: 'ze sbírky Zenrin kušú', practice: 'Nech jednu věc být. Ať dozraje sama.', topics: ['klid', 'prace'] },
  { id: 12, text: 'Ičigo ičie. Jedno setkání, jedna příležitost.', who: 'rčení z čajového obřadu', practice: 'Při dalším rozhovoru dej telefon z dohledu.', topics: ['vztahy'] },
  { id: 13, text: 'Obyčejná mysl je cesta.', who: 'Baso', practice: 'Najdi klid v něčem úplně běžném. Třeba v mytí nádobí.', topics: ['klid'] },
  { id: 14, text: 'Krása je v nedokonalém, pomíjivém a neúplném.', who: 'myšlenka wabi-sabi', practice: 'Najdi krásu v něčem obnošeném nebo prasklém.', topics: ['tezke', 'vztahy'] },
  { id: 15, text: 'Hory jsou hory a voda je voda.', who: 'Seigen Išin', practice: 'Dnes neposuzuj. Jen popisuj, co vidíš.', topics: ['klid'] },
  { id: 16, text: 'Když nevíš, zůstaň u nevím.', who: 'zenové rčení', practice: 'Jednou dnes řekni nahlas: Nevím.', topics: ['prace', 'tezke'] },
  { id: 17, text: 'Když potkáš Buddhu, zabij ho.', who: 'Rinzai', practice: 'Zpochybni dnes jednu autoritu. Klidně i svou vlastní.', topics: ['prace'] },
  { id: 18, text: 'Kde jsi, tam buď pánem. Kde stojíš, tam je pravda.', who: 'Rinzai', practice: 'V jedné situaci dnes převezmi otěže.', topics: ['prace', 'tezke'] },
  { id: 19, text: 'V té hroudě rudého masa sídlí pravý člověk bez hodnosti.', who: 'Rinzai', practice: 'Zapomeň na chvíli na svou pracovní pozici.', topics: ['prace', 'vztahy'] },
  { id: 20, text: 'Co je Buddha? Tři libry lnu.', who: 'Tózan Šušo', practice: 'Na velkou otázku odpověz něčím obyčejným.', topics: ['klid'] },
  { id: 21, text: 'Co je Buddha? Suché lejno na tyčce.', who: 'Unmon', practice: 'Hledej posvátno i tam, kde ho nikdo nečeká.', topics: ['tezke'] },
  { id: 22, text: 'Snědl jsi kaši? Tak si jdi umýt misku.', who: 'Džóšú', practice: 'Dokonči, co máš rozdělané, než začneš nové.', topics: ['prace'] },
  { id: 23, text: 'Cypřiš na nádvoří.', who: 'Džóšú', practice: 'Podívej se dnes na jeden strom. Opravdu se podívej.', topics: ['klid'] },
  { id: 24, text: 'Jdi a vypij si čaj.', who: 'Džóšú', practice: 'Dej si čaj. Jen čaj, bez telefonu.', topics: ['klid'] },
  { id: 25, text: 'Jaký je zvuk tleskání jedné ruky?', who: 'Hakuin', practice: 'Nech jednu otázku znít celý den.', topics: ['klid'] },
  { id: 26, text: 'Všechny bytosti jsou od počátku buddhy.', who: 'Hakuin, Píseň o zazenu', practice: 'U jednoho člověka dnes předpokládej víc moudrosti, než ukazuje.', topics: ['vztahy'] },
  { id: 27, text: 'Na jaře květy, v létě chladný vánek, na podzim měsíc, v zimě sníh.', who: 'Mumon', practice: 'Najdi na dnešku jednu věc, kterou umí jen tahle roční doba.', topics: ['klid'] },
  { id: 28, text: 'Velká cesta nemá bránu.', who: 'Mumon', practice: 'Začni tam, kde zrovna stojíš.', topics: ['prace', 'tezke'] },
  { id: 29, text: 'Kdykoli se ho na něco zeptali, Gutei jen zvedl prst.', who: 'Mumonkan, případ třetí', practice: 'Odpověz dnes co nejkratší větou.', topics: ['vztahy', 'prace'] },
  { id: 30, text: 'Promluvíš, třicet ran. Mlčíš, třicet ran.', who: 'Tokusan', practice: 'Rozhodni se. I špatné rozhodnutí je pohyb.', topics: ['prace', 'tezke'] },
  { id: 31, text: 'Velká cesta není těžká pro toho, kdo nevybírá.', who: 'Sósan, Šindžinmei', practice: 'U jedné drobnosti dnes nevybírej. Vezmi, co přijde.', topics: ['klid', 'vztahy'] },
  { id: 32, text: 'Nehledej pravdu. Jen přestaň lpět na názorech.', who: 'Sósan, Šindžinmei', practice: 'Jeden svůj názor dnes nech nevyslovený.', topics: ['vztahy'] },
  { id: 33, text: 'Nemysli na dobré, nemysli na zlé. Jaká je v tu chvíli tvá původní tvář?', who: 'Enó', practice: 'Na pět minut přestaň hodnotit.', topics: ['klid'] },
  { id: 34, text: 'Od počátku není nic. Kam by sedal prach?', who: 'Enó', practice: 'Nepřidávej si dnes práci, kterou nikdo nechce.', topics: ['prace', 'klid'] },
  { id: 35, text: 'Nic svatého. Jen šíře prázdna.', who: 'Daruma, císaři Wu', practice: 'Neudělej dnes nic jen kvůli dojmu.', topics: ['prace', 'vztahy'] },
  { id: 36, text: 'Když mám hlad, jím. Když jsem unavený, spím.', who: 'Daidžu Ekai', practice: 'Jdi spát, když přijde únava. Ne až dočteš feed.', topics: ['klid'] },
  { id: 37, text: 'Den bez práce je den bez jídla.', who: 'Hjakudžó', practice: 'Udělej dnes jednu věc vlastníma rukama.', topics: ['prace'] },
  { id: 38, text: 'Jeden úder a veškeré vědění je pryč.', who: 'Kjógen', practice: 'Nech se dnes jednou vyrušit. Bez mrzutosti.', topics: ['tezke', 'prace'] },
  { id: 39, text: 'Nevědět je to nejbližší.', who: 'Džizó', practice: 'Zeptej se na věc, kterou se stydíš nevědět.', topics: ['prace', 'vztahy'] },
  { id: 40, text: 'Mysl, která se nikde nezastaví.', who: 'Takuan', practice: 'Když tě něco rozhodí, nech to projít dál.', topics: ['tezke', 'klid'] },
  { id: 41, text: 'Všichni máte nezrozenou mysl Buddhy.', who: 'Bankei', practice: 'Dnes se na nic nepřipravuj. Reaguj.', topics: ['klid', 'prace'] },
  { id: 42, text: 'Osvícení je jako měsíc na hladině. Měsíc nezvlhne, voda se nerozbije.', who: 'Dógen, Gendžókóan', practice: 'Buď u toho a nic neměň.', topics: ['klid', 'tezke'] },
  { id: 43, text: 'Bytí je čas.', who: 'Dógen', practice: 'Nepočítej dnes čas. Žij ho.', topics: ['klid'] },
  { id: 44, text: 'Voda je čistá až na dno, ryba plave jako ryba. Nebe je bez konce, pták letí jako pták.', who: 'Dógen', practice: 'Dělej dnes to, co umíš nejlíp. A nic víc.', topics: ['prace'] },
  { id: 45, text: 'Na uschlé větvi usedla vrána. Podzimní večer.', who: 'Macuo Bašó', practice: 'Večer se pět minut jen dívej z okna.', topics: ['klid', 'tezke'] },
  { id: 46, text: 'Ticho. Do skály se vpíjí zpěv cikád.', who: 'Macuo Bašó', practice: 'Najdi místo, kde je slyšet ticho.', topics: ['klid'] },
  { id: 47, text: 'Nehledej stopy starých mistrů. Hledej, co hledali oni.', who: 'připisováno Bašóovi', practice: 'Nekopíruj. Zeptej se proč.', topics: ['prace'] },
  { id: 48, text: 'Svět rosy je svět rosy. A přece, a přece…', who: 'Kobajaši Issa', practice: 'Nech smutek a smír být vedle sebe.', topics: ['tezke'] },
  { id: 49, text: 'Hlemýždi, pomalu, pomalu vystoupej na Fudži.', who: 'Kobajaši Issa', practice: 'Udělej jeden malý krok k velké věci.', topics: ['prace', 'tezke'] },
  { id: 50, text: 'Kráčíme po střeše pekla a díváme se na květy.', who: 'Kobajaši Issa', practice: 'Užij si jednu krásnou věc. I kdyby byl den těžký.', topics: ['tezke'] },
  { id: 51, text: 'Jarní moře. Celý den se vlní sem a tam.', who: 'Josa Buson', practice: 'Nech jednu věc plynout bez plánu.', topics: ['klid'] },
  { id: 52, text: 'Ukazuje rub, ukazuje líc. Padá javorový list.', who: 'Rjókan', practice: 'Ukaž dnes někomu i svou slabší stránku.', topics: ['vztahy', 'tezke'] },
  { id: 53, text: 'Čaj není nic jiného než ohřát vodu, uvařit čaj a vypít ho.', who: 'připisováno Sen no Rikjúovi', practice: 'Uvař si čaj a dělej jen to.', topics: ['klid'] },
  { id: 54, text: 'Bambusový stín zametá schody. Prach se ani nehne.', who: 'ze sbírky Zenrin kušú', practice: 'Pomoz dnes někomu a nikomu to neříkej.', topics: ['vztahy'] },
  { id: 55, text: 'Řeka teče bez ustání, a přece to nikdy není tatáž voda.', who: 'Kamo no Čómei, Zápisky z poustevny', practice: 'Všimni si, co se u tebe za rok změnilo.', topics: ['tezke', 'klid'] },
  { id: 56, text: 'Nejcennější na životě je jeho nejistota.', who: 'Jošida Kenkó', practice: 'Udělej dnes něco, co nejde naplánovat.', topics: ['tezke'] },
  { id: 57, text: 'I opice padá ze stromu.', who: 'japonské přísloví', practice: 'Odpusť si dnes jednu chybu.', topics: ['tezke', 'prace'] },
  { id: 58, text: 'I z prachu se nakonec stane hora.', who: 'japonské přísloví', practice: 'Věnuj pět minut velkému cíli.', topics: ['prace'] },
  { id: 59, text: 'Tři roky na kameni a i kámen se zahřeje.', who: 'japonské přísloví', practice: 'Vydrž u něčeho, co tě zatím nebaví.', topics: ['prace', 'tezke'] },
  { id: 60, text: 'Prasklina spravená zlatem patří k příběhu misky.', who: 'myšlenka kincugi', practice: 'Nezakrývej dnes jednu svou chybu.', topics: ['tezke', 'vztahy'] },
  { id: 61, text: 'Sníh padá. Každá vločka na své místo.', who: 'zenové rčení', practice: 'Dnes nic nepřerovnávej. Nech věci tam, kam dopadly.', topics: ['klid', 'tezke'] },
  { id: 62, text: 'Plující mraky, tekoucí voda.', who: 'zenový obraz poutníka', practice: 'Změň dnes jednu zaběhnutou cestu. Jdi jinudy.', topics: ['tezke', 'klid'] },
  { id: 63, text: 'Celý měsíc se odráží i v jedné kapce rosy.', who: 'Dógen', practice: 'Najdi celý den v jedné malé chvíli.', topics: ['vztahy', 'klid'] },
  { id: 64, text: 'Polož to.', who: 'Džóšú', practice: 'Napiš si, co tě dnes tíží. Pak papír odlož.', topics: ['tezke'] },
  { id: 65, text: 'Modrá hora nebrání bílým oblakům v letu.', who: 'zenové rčení', practice: 'Nech dnes někoho jít vlastní cestou.', topics: ['vztahy'] },
  { id: 66, text: 'Bez bláta není lotos.', who: 'Thich Nhat Hanh', practice: 'Vzpomeň si, co tě naučil jeden těžký den.', topics: ['tezke'] },
  { id: 67, text: 'Nadechuji se a zklidňuji tělo. Vydechuji a usmívám se.', who: 'Thich Nhat Hanh', practice: 'Třikrát za den se takhle nadechni.', topics: ['klid', 'tezke'] },
  { id: 68, text: 'Déšť, kroupy, sníh i led jsou různé. Když roztají, je to stejná voda.', who: 'připisováno Ikkjúovi', practice: 'U člověka, který tě štve, najdi jednu věc, kterou máte společnou.', topics: ['vztahy'] },
];

const EPOCH = Date.UTC(2026, 0, 1);
export const dayNumber = (day) => Math.floor((Date.parse(day + 'T00:00:00Z') - EPOCH) / 864e5);

// Výrok pro daný den. S vybranými tématy se vybírá jen z nich.
export function pickQuote(day, topics = []) {
  let pool = topics.length ? QUOTES.filter((q) => q.topics.some((t) => topics.includes(t))) : QUOTES;
  if (!pool.length) pool = QUOTES;
  const n = dayNumber(day);
  return pool[((n % pool.length) + pool.length) % pool.length];
}

export const quoteById = (id) => QUOTES.find((q) => q.id === id);

// Schovaný kóan: ukáže se po kliknutí na kamenného psa v zahradě.
export const MU = {
  eyebrow: 'Mumonkan · případ první',
  text: '無',
  who: 'Džóšú, na otázku, zda má i pes buddhovskou podstatu',
  practice: 'Nech dnes jednu otázku bez odpovědi.',
};
