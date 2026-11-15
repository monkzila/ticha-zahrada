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
  { id: 9, text: 'Každý den je dobrý den.', who: 'Jün-men', practice: 'Večer si zapiš jednu věc, která se povedla.', topics: ['tezke', 'klid'] },
  { id: 10, text: 'Sedmkrát upadnout, poosmé vstát.', who: 'japonské přísloví', practice: 'Vrať se k jedné věci, kterou jsi kdysi odložil(a).', topics: ['tezke', 'prace'] },
  { id: 11, text: 'Sedíš tiše, nic neděláš. Jaro přichází a tráva roste sama.', who: 'ze sbírky Zenrin kušú', practice: 'Nech jednu věc být. Ať dozraje sama.', topics: ['klid', 'prace'] },
  { id: 12, text: 'Ičigo ičie. Jedno setkání, jedna příležitost.', who: 'rčení z čajového obřadu', practice: 'Při dalším rozhovoru dej telefon z dohledu.', topics: ['vztahy'] },
  { id: 13, text: 'Obyčejná mysl je cesta.', who: 'Ma-cu', practice: 'Najdi klid v něčem úplně běžném. Třeba v mytí nádobí.', topics: ['klid'] },
  { id: 14, text: 'Krása je v nedokonalém, pomíjivém a neúplném.', who: 'myšlenka wabi-sabi', practice: 'Najdi krásu v něčem obnošeném nebo prasklém.', topics: ['tezke', 'vztahy'] },
  { id: 15, text: 'Hory jsou hory a voda je voda.', who: 'Čching-jüan', practice: 'Dnes neposuzuj. Jen popisuj, co vidíš.', topics: ['klid'] },
  { id: 16, text: 'Nevědění je to nejdůvěrnější.', who: 'Ti-cang', practice: 'Jednou dnes řekni nahlas: Nevím.', topics: ['prace', 'tezke'] },
  { id: 17, text: 'Nehledej pravdu. Jen přestaň lpět na názorech.', who: 'Seng-cchan', practice: 'V jednom sporu dnes zkus vidět, co vidí ten druhý.', topics: ['vztahy', 'klid'] },
  { id: 18, text: 'Velká cesta není těžká pro toho, kdo nemá zalíbení ani odpor.', who: 'Seng-cchan', practice: 'Všimni si jedné věci, kterou hned označíš za otravnou. A nech ji být.', topics: ['vztahy'] },
  { id: 19, text: 'Sníh padá. Každá vločka na své místo.', who: 'zenové rčení', practice: 'Dnes nic nepřerovnávej. Nech věci tam, kam dopadly.', topics: ['klid', 'tezke'] },
  { id: 20, text: 'Napij se čaje.', who: 'Čao-čou', practice: 'Uvař si čaj a pij ho. Jen pij.', topics: ['klid', 'prace'] },
  { id: 21, text: 'Dojedl jsi kaši? Tak si umyj misku.', who: 'Čao-čou', practice: 'Dokonči jednu drobnost, kterou odkládáš.', topics: ['prace'] },
  { id: 22, text: 'Plující mraky, tekoucí voda.', who: 'zenový obraz poutníka', practice: 'Změň dnes jednu zaběhnutou cestu. Jdi jinudy.', topics: ['tezke', 'klid'] },
  { id: 23, text: 'Celý měsíc se odráží i v jedné kapce rosy.', who: 'Dógen', practice: 'Najdi celý den v jedné malé chvíli.', topics: ['vztahy', 'klid'] },
  { id: 24, text: 'Polož to.', who: 'Čao-čou', practice: 'Napiš si, co tě dnes tíží. Pak papír odlož.', topics: ['tezke'] },
  { id: 25, text: 'Modrá hora nebrání bílým oblakům v letu.', who: 'zenové rčení', practice: 'Nech dnes někoho jít vlastní cestou.', topics: ['vztahy'] },
  { id: 26, text: 'Bez bláta není lotos.', who: 'Thich Nhat Hanh', practice: 'Vzpomeň si, co tě naučil jeden těžký den.', topics: ['tezke'] },
  { id: 27, text: 'Nadechuji se a zklidňuji tělo. Vydechuji a usmívám se.', who: 'Thich Nhat Hanh', practice: 'Třikrát za den se takhle nadechni.', topics: ['klid', 'tezke'] },
  { id: 28, text: 'Nehledej stopy starých mistrů. Hledej to, co hledali oni.', who: 'připisováno Macuo Bašóovi', practice: 'Zeptej se, proč děláš jednu věc tak, jak ji děláš.', topics: ['prace'] },
  { id: 29, text: 'Ukazuje rub, ukazuje líc, padá javorový list.', who: 'Rjókan', practice: 'Ukaž dnes někomu i svou nedokonalou stránku.', topics: ['vztahy', 'tezke'] },
  { id: 30, text: 'Déšť, kroupy, sníh i led jsou různé. Když roztají, je to stejná voda.', who: 'připisováno Ikkjúovi', practice: 'U člověka, který tě štve, najdi jednu věc, kterou máte společnou.', topics: ['vztahy'] },
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
