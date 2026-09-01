import React, { useState, useEffect, useMemo } from "react";
import { Volume2, Check, ChevronLeft } from "lucide-react";

/* Номер сборки: подставляется Vite (см. define в vite.config.js).
   Если файл открыт вне сборки — показываем «dev». */
const BUILD = typeof __BUILD__ !== "undefined" ? __BUILD__ : "dev";

/* ──────────────────────────────────────────────────────────────
   Նուռ — тренажёр армянского для русскоязычных с нуля
   Палитра: рукописи Матенадарана + ереванский розовый туф
   ────────────────────────────────────────────────────────────── */

/* LOGIC-START — этот блок чистый JS, он покрыт тестами в nur-tests.mjs */

const ALPHABET = [
  { g: 1, up: "Ա", lo: "ա", name: "айб",   s: "а",  note: "Как русское «а».", w: "արև", wt: "арэ́в", wr: "солнце" },
  { g: 1, up: "Բ", lo: "բ", name: "бэн",   s: "б",  note: "Как «б».", w: "բարև", wt: "барэ́в", wr: "привет" },
  { g: 1, up: "Գ", lo: "գ", name: "гим",   s: "г",  note: "Как «г».", w: "գիրք", wt: "гиркʰ", wr: "книга" },
  { g: 1, up: "Դ", lo: "դ", name: "да",    s: "д",  note: "Как «д».", w: "դուռ", wt: "дурр", wr: "дверь" },
  { g: 1, up: "Ե", lo: "ե", name: "еч",    s: "э / е", note: "В начале слова читается «е», внутри — «э».", w: "երգ", wt: "ерг", wr: "песня" },
  { g: 1, up: "Զ", lo: "զ", name: "за",    s: "з",  note: "Как «з».", w: "զանգ", wt: "занг", wr: "звонок" },

  { g: 2, up: "Է", lo: "է", name: "э",     s: "э",  note: "Всегда «э», даже в начале слова.", w: "էջ", wt: "эдж", wr: "страница" },
  { g: 2, up: "Ը", lo: "ը", name: "ыт",    s: "ы",  note: "Очень короткий неясный звук, как «а» в слове «карандаш».", w: "ընկեր", wt: "ынкэ́р", wr: "друг" },
  { g: 2, up: "Թ", lo: "թ", name: "то",    s: "тʰ", note: "«Т» с сильным выдохом, как в английском top.", w: "թեյ", wt: "тʰэй", wr: "чай" },
  { g: 2, up: "Ժ", lo: "ժ", name: "жэ",    s: "ж",  note: "Как «ж».", w: "ժամ", wt: "жам", wr: "час" },
  { g: 2, up: "Ի", lo: "ի", name: "ини",   s: "и",  note: "Как «и».", w: "ինը", wt: "и́ны", wr: "девять" },
  { g: 2, up: "Լ", lo: "լ", name: "люн",   s: "л",  note: "Мягче русского «л», ближе к «ль».", w: "լույս", wt: "луйс", wr: "свет" },

  { g: 3, up: "Խ", lo: "խ", name: "хэ",    s: "х",  note: "Как «х» в слове «хорошо».", w: "խնձոր", wt: "хндзо́р", wr: "яблоко" },
  { g: 3, up: "Ծ", lo: "ծ", name: "ца",    s: "ц",  note: "Как «ц», без выдоха.", w: "ծաղիկ", wt: "цағи́к", wr: "цветок" },
  { g: 3, up: "Կ", lo: "կ", name: "кэн",   s: "к",  note: "Как русское «к», без выдоха.", w: "կաթ", wt: "катʰ", wr: "молоко" },
  { g: 3, up: "Հ", lo: "հ", name: "hо",    s: "h",  note: "Лёгкий выдох, как английское h в hello. Не «х»!", w: "հաց", wt: "hац", wr: "хлеб" },
  { g: 3, up: "Ձ", lo: "ձ", name: "дза",   s: "дз", note: "Слитно «дз».", w: "ձյուն", wt: "дзюн", wr: "снег" },
  { g: 3, up: "Ղ", lo: "ղ", name: "ғат",   s: "ғ",  note: "Картавое «г», как французское r. Самый армянский звук.", w: "ղեկ", wt: "ғэк", wr: "руль" },

  { g: 4, up: "Ճ", lo: "ճ", name: "чэ",    s: "ч",  note: "Твёрдое «ч», без выдоха.", w: "ճաշ", wt: "чаш", wr: "обед" },
  { g: 4, up: "Մ", lo: "մ", name: "мэн",   s: "м",  note: "Как «м».", w: "մայր", wt: "майр", wr: "мать" },
  { g: 4, up: "Յ", lo: "յ", name: "йи",    s: "й",  note: "Как «й».", w: "յուղ", wt: "юғ", wr: "масло" },
  { g: 4, up: "Ն", lo: "ն", name: "ну",    s: "н",  note: "Как «н».", w: "նուռ", wt: "нурр", wr: "гранат" },
  { g: 4, up: "Շ", lo: "շ", name: "ша",    s: "ш",  note: "Как «ш».", w: "շուն", wt: "шун", wr: "собака" },
  { g: 4, up: "Ո", lo: "ո", name: "во",    s: "о / во", note: "В начале слова — «во», внутри — «о».", w: "ոսկի", wt: "воски́", wr: "золото" },

  { g: 5, up: "Չ", lo: "չ", name: "ча",    s: "чʰ", note: "«Ч» с выдохом, как в русском «чай».", w: "չիր", wt: "чʰир", wr: "сухофрукт" },
  { g: 5, up: "Պ", lo: "պ", name: "пэ",    s: "п",  note: "Как русское «п», без выдоха.", w: "պար", wt: "пар", wr: "танец" },
  { g: 5, up: "Ջ", lo: "ջ", name: "джэ",   s: "дж", note: "Слитно «дж».", w: "ջուր", wt: "джур", wr: "вода" },
  { g: 5, up: "Ռ", lo: "ռ", name: "рра",   s: "рр", note: "Раскатистое «р», как в слове «рычать».", w: "ռուս", wt: "ррус", wr: "русский" },
  { g: 5, up: "Ս", lo: "ս", name: "сэ",    s: "с",  note: "Как «с».", w: "սեր", wt: "сэр", wr: "любовь" },
  { g: 5, up: "Վ", lo: "վ", name: "вэв",   s: "в",  note: "Как «в».", w: "վարդ", wt: "вард", wr: "роза" },

  { g: 6, up: "Տ", lo: "տ", name: "тюн",   s: "т",  note: "Как русское «т», без выдоха.", w: "տուն", wt: "тун", wr: "дом" },
  { g: 6, up: "Ր", lo: "ր", name: "рэ",    s: "р",  note: "Мягкое короткое «р», один удар языка.", w: "րոպե", wt: "ропэ́", wr: "минута" },
  { g: 6, up: "Ց", lo: "ց", name: "цо",    s: "цʰ", note: "«Ц» с выдохом.", w: "ցուրտ", wt: "цʰурт", wr: "холодно" },
  { g: 6, up: "Ւ", lo: "ւ", name: "юн",    s: "—",  note: "Отдельно не читается: живёт только в паре ու = «у».", w: "ու", wt: "у", wr: "звук «у»" },
  { g: 6, up: "Փ", lo: "փ", name: "пʰюр",  s: "пʰ", note: "«П» с сильным выдохом.", w: "փող", wt: "пʰоғ", wr: "деньги" },
  { g: 6, up: "Ք", lo: "ք", name: "кʰэ",   s: "кʰ", note: "«К» с сильным выдохом.", w: "քաղաք", wt: "кʰағакʰ", wr: "город" },

  { g: 7, up: "Օ", lo: "օ", name: "о",     s: "о",  note: "Всегда «о», пишется в начале слова.", w: "օր", wt: "ор", wr: "день" },
  { g: 7, up: "Ֆ", lo: "ֆ", name: "фэ",    s: "ф",  note: "Как «ф».", w: "ֆիլմ", wt: "фильм", wr: "фильм" },
  { g: 7, up: "ՈՒ", lo: "ու", name: "у",   s: "у",  note: "Две буквы, один звук «у». Встречается постоянно.", w: "ուտել", wt: "утэ́л", wr: "есть (кушать)" },
  { g: 7, up: "ԵՎ", lo: "և", name: "ев",   s: "ев", note: "Значок-связка, читается «ев». Сам по себе значит «и».", w: "Երևան", wt: "ерэва́н", wr: "Ереван" },
];

const GROUPS = [
  { g: 1, title: "Первая шестёрка", hint: "Ա Բ Գ Դ Ե Զ" },
  { g: 2, title: "Гласные и придыхание", hint: "Է Ը Թ Ժ Ի Լ" },
  { g: 3, title: "Горловые", hint: "Խ Ծ Կ Հ Ձ Ղ" },
  { g: 4, title: "Ежедневные", hint: "Ճ Մ Յ Ն Շ Ո" },
  { g: 5, title: "Два «р»", hint: "Չ Պ Ջ Ռ Ս Վ" },
  { g: 6, title: "Пары с выдохом", hint: "Տ Ր Ց Ւ Փ Ք" },
  { g: 7, title: "Хвост алфавита", hint: "Օ Ֆ ու և" },
];

const LESSONS = [
  {
    id: "hello", title: "Первые слова", sub: "То, что скажешь в первый же день",
    items: [
      { hy: "Բարև", tr: "барэ́в", ru: "Привет" },
      { hy: "Բարև ձեզ", tr: "барэ́в дзэз", ru: "Здравствуйте" },
      { hy: "Բարի լույս", tr: "бари́ луйс", ru: "Доброе утро" },
      { hy: "Բարի երեկո", tr: "бари́ ерэко́", ru: "Добрый вечер" },
      { hy: "Ցտեսություն", tr: "цтэсутʰю́н", ru: "До свидания" },
      { hy: "Այո", tr: "айо́", ru: "Да" },
      { hy: "Ոչ", tr: "вочʰ", ru: "Нет" },
      { hy: "Շնորհակալություն", tr: "шнорhакалутʰю́н", ru: "Спасибо" },
      { hy: "Խնդրեմ", tr: "хндрэ́м", ru: "Пожалуйста (в ответ)" },
      { hy: "Կներեք", tr: "кнэрэ́кʰ", ru: "Извините" },
    ],
  },
  {
    id: "meet", title: "Знакомство", sub: "Кто ты и откуда",
    items: [
      { hy: "Ի՞նչ է ձեր անունը", tr: "инчʰ э дзэр ану́ны", ru: "Как вас зовут?" },
      { hy: "Իմ անունը Կոնստանտին է", tr: "им ану́ны Константи́н э", ru: "Меня зовут Константин" },
      { hy: "Ինչպե՞ս եք", tr: "инчʰпэ́с экʰ", ru: "Как вы?" },
      { hy: "Լավ եմ", tr: "лав эм", ru: "Хорошо, я в порядке" },
      { hy: "Շատ հաճելի է", tr: "шат hачэли́ э", ru: "Очень приятно" },
      { hy: "Ես Ռուսաստանից եմ", tr: "ес ррусастани́ц эм", ru: "Я из России" },
      { hy: "Ես ապրում եմ Երևանում", tr: "ес апру́м эм ерэвану́м", ru: "Я живу в Ереване" },
      { hy: "Դուք հայերեն խոսու՞մ եք", tr: "дукʰ hайерэ́н хосу́м экʰ", ru: "Вы говорите по-армянски?" },
      { hy: "Ես հայերեն չեմ խոսում", tr: "ес hайерэ́н чʰэм хосу́м", ru: "Я не говорю по-армянски" },
      { hy: "Ես սովորում եմ հայերեն", tr: "ес совору́м эм hайерэ́н", ru: "Я учу армянский" },
    ],
  },
  {
    id: "cafe", title: "Кафе и еда", sub: "Заказать и не остаться голодным",
    items: [
      { hy: "Մեկ սուրճ, խնդրում եմ", tr: "мэк сурч, хндру́м эм", ru: "Один кофе, пожалуйста" },
      { hy: "Ջուր, խնդրում եմ", tr: "джур, хндру́м эм", ru: "Воду, пожалуйста" },
      { hy: "Հաշիվը, խնդրում եմ", tr: "hаши́вы, хндру́м эм", ru: "Счёт, пожалуйста" },
      { hy: "Ի՞նչ արժե", tr: "инчʰ аржэ́", ru: "Сколько стоит?" },
      { hy: "Համեղ է", tr: "hамэ́ғ э", ru: "Вкусно" },
      { hy: "Հաց", tr: "hац", ru: "Хлеб" },
      { hy: "Լավաշ", tr: "лава́ш", ru: "Лаваш" },
      { hy: "Պանիր", tr: "пани́р", ru: "Сыр" },
      { hy: "Թեյ", tr: "тʰэй", ru: "Чай" },
      { hy: "Գինի", tr: "гини́", ru: "Вино" },
    ],
  },
  {
    id: "city", title: "Город и такси", sub: "Доехать и найти дорогу",
    items: [
      { hy: "Որտե՞ղ է", tr: "вортэ́ғ э", ru: "Где находится?" },
      { hy: "Տաքսի, խնդրում եմ", tr: "такʰси́, хндру́м эм", ru: "Такси, пожалуйста" },
      { hy: "Կանգ առեք, խնդրում եմ", tr: "канг аррэ́кʰ, хндру́м эм", ru: "Остановитесь, пожалуйста" },
      { hy: "Ուղիղ", tr: "уғи́ғ", ru: "Прямо" },
      { hy: "Աջ", tr: "адж", ru: "Направо" },
      { hy: "Ձախ", tr: "дзах", ru: "Налево" },
      { hy: "Մոտ", tr: "мот", ru: "Близко" },
      { hy: "Հեռու", tr: "hэрру́", ru: "Далеко" },
      { hy: "Մետրո", tr: "мэтро́", ru: "Метро" },
      { hy: "Հանրապետության հրապարակ", tr: "hанрапэтутʰя́н hрапара́к", ru: "Площадь Республики" },
    ],
  },
  {
    id: "num", title: "Числа и деньги", sub: "От одного до десяти и «сколько?»",
    items: [
      { hy: "մեկ", tr: "мэк", ru: "один" },
      { hy: "երկու", tr: "ерку́", ru: "два" },
      { hy: "երեք", tr: "ерэ́кʰ", ru: "три" },
      { hy: "չորս", tr: "чʰорс", ru: "четыре" },
      { hy: "հինգ", tr: "hинг", ru: "пять" },
      { hy: "վեց", tr: "вэцʰ", ru: "шесть" },
      { hy: "յոթ", tr: "йотʰ", ru: "семь" },
      { hy: "ութ", tr: "утʰ", ru: "восемь" },
      { hy: "ինը", tr: "и́ны", ru: "девять" },
      { hy: "տասը", tr: "та́сы", ru: "десять" },
      { hy: "Ինչքա՞ն է", tr: "инчʰкʰа́н э", ru: "Сколько это стоит?" },
      { hy: "Թանկ է", tr: "тʰанк э", ru: "Дорого" },
    ],
  },
  {
    id: "flat", title: "Квартира", sub: "Снять жильё и разобраться в нём",
    items: [
      { hy: "Բնակարան", tr: "бнакара́н", ru: "Квартира" },
      { hy: "Վարձով", tr: "вардзо́в", ru: "В аренду" },
      { hy: "Սենյակ", tr: "сэнья́к", ru: "Комната" },
      { hy: "Խոհանոց", tr: "хоhано́ц", ru: "Кухня" },
      { hy: "Լոգարան", tr: "логара́н", ru: "Ванная" },
      { hy: "Բանալի", tr: "банали́", ru: "Ключ" },
      { hy: "Հասցե", tr: "hасцэ́", ru: "Адрес" },
      { hy: "Հարկ", tr: "hарк", ru: "Этаж" },
      { hy: "Ինտերնետ", tr: "интэрнэ́т", ru: "Интернет" },
      { hy: "Ե՞րբ կարող եմ տեսնել", tr: "ерб каро́ғ эм тэснэ́л", ru: "Когда я могу посмотреть?" },
    ],
  },
  {
    id: "dance", title: "Танцы и работа", sub: "Слова для зала и группы",
    items: [
      { hy: "Պար", tr: "пар", ru: "Танец" },
      { hy: "Ես պարում եմ", tr: "ес пару́м эм", ru: "Я танцую" },
      { hy: "Դաս", tr: "дас", ru: "Урок" },
      { hy: "Խումբ", tr: "хумб", ru: "Группа" },
      { hy: "Երաժշտություն", tr: "еражштутʰю́н", ru: "Музыка" },
      { hy: "Մարզիչ", tr: "марзи́чʰ", ru: "Тренер" },
      { hy: "Սկսնակ", tr: "сксна́к", ru: "Начинающий" },
      { hy: "Կրկնենք", tr: "кркнэ́нкʰ", ru: "Повторим" },
      { hy: "Հիանալի է", tr: "hианали́ э", ru: "Отлично" },
      { hy: "Ապրե՛ս", tr: "апрэ́с", ru: "Молодец!" },
    ],
  },
  {
    id: "day", title: "Каждый день", sub: "Время, желания, «пойдём»",
    items: [
      { hy: "Այսօր", tr: "айсо́р", ru: "Сегодня" },
      { hy: "Վաղը", tr: "ва́ғы", ru: "Завтра" },
      { hy: "Երեկ", tr: "ерэ́к", ru: "Вчера" },
      { hy: "Առավոտ", tr: "арраво́т", ru: "Утро" },
      { hy: "Երեկո", tr: "ерэко́", ru: "Вечер" },
      { hy: "Ժամը քանի՞սն է", tr: "жа́мы кʰани́сн э", ru: "Который час?" },
      { hy: "Գնանք", tr: "гнанкʰ", ru: "Пойдём" },
      { hy: "Ես ուզում եմ", tr: "ес узу́м эм", ru: "Я хочу" },
      { hy: "Ես կարող եմ", tr: "ес каро́ғ эм", ru: "Я могу" },
      { hy: "Ինձ դուր է գալիս", tr: "индз дур э гали́с", ru: "Мне нравится" },
    ],
  },
];

const ALL_ITEMS = LESSONS.flatMap((l) => l.items.map((it) => ({ ...it, lesson: l.id })));

const DAY_MS = 24 * 60 * 60 * 1000;
const BOX_DELAY = [0, 1, 2, 4, 8, 16];

function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function speechText(tr) {
  return tr
    .replace(/\u0301/g, "")
    .replace(/ʰ/g, "")
    .replace(/ғ/g, "г")
    .replace(/h/g, "х")
    .replace(/рр/g, "р");
}

/* Зёрна граната. Центры лежат в эллипсе (cx,cy,rx,ry), вписанном в контур плода;
   шаг сетки уменьшается, пока зёрен не хватит на весь алфавит. */
const POM = { cx: 50, cy: 62, rx: 23.5, ry: 27.5, seedR: 3.2 };

function seedPositions(total) {
  const { cx, cy, rx, ry, seedR } = POM;
  for (let step = 8.4; step > 3; step -= 0.2) {
    const rowStep = step * 0.86;
    const pts = [];
    for (let row = 0; ; row++) {
      const y = cy - ry + seedR + row * rowStep;
      if (y > cy + ry - seedR) break;
      for (let col = -6; col <= 6; col++) {
        const x = cx + col * step + (row % 2 ? step / 2 : 0);
        const nx = (x - cx) / (rx - seedR);
        const ny = (y - cy) / (ry - seedR);
        if (nx * nx + ny * ny <= 1) pts.push({ x, y });
      }
    }
    if (pts.length >= total) {
      return pts.sort((a, b) => a.y - b.y || a.x - b.x).slice(0, total);
    }
  }
  return [];
}

function buildLetterQuestions(letters) {
  const pool = ALPHABET.filter((x) => x.s !== "—");
  const qs = [];
  letters.forEach((l) => {
    if (l.s === "—") return;
    const wrong = shuffle(pool.filter((x) => x.up !== l.up && x.s !== l.s)).slice(0, 3);
    qs.push({
      kind: "l2s", prompt: l.up + " " + l.lo, ask: "Какой это звук?", letter: l,
      options: shuffle([l, ...wrong]).map((x) => ({ label: x.s, right: x.up === l.up })),
    });
    const wrong2 = shuffle(pool.filter((x) => x.up !== l.up && x.s !== l.s)).slice(0, 3);
    qs.push({
      kind: "s2l", prompt: l.s, ask: "Какая буква даёт этот звук?", hy: true, letter: l,
      options: shuffle([l, ...wrong2]).map((x) => ({ label: x.lo, right: x.up === l.up })),
    });
  });
  return shuffle(qs).slice(0, 10);
}

function buildQuestions(items) {
  const qs = [];
  items.forEach((it) => {
    const others = shuffle(ALL_ITEMS.filter((x) => x.ru !== it.ru && x.hy !== it.hy)).slice(0, 3);
    const kinds = ["ru2hy", "hy2ru", "audio"];
    if (it.hy.split(" ").length >= 2) kinds.push("build");
    const kind = kinds[Math.floor(Math.random() * kinds.length)];

    if (kind === "build") {
      const extra = shuffle(ALL_ITEMS.filter((x) => x.hy.split(" ").length > 1 && x.hy !== it.hy))
        .slice(0, 2).map((x) => x.hy.split(" ")[0]);
      qs.push({ kind: "build", item: it, bank: shuffle([...it.hy.split(" "), ...extra]) });
    } else if (kind === "ru2hy") {
      qs.push({
        kind, item: it, ask: "Как это по-армянски?", prompt: it.ru,
        options: shuffle([{ label: it.hy, right: true, hy: true }, ...others.map((o) => ({ label: o.hy, right: false, hy: true }))]),
      });
    } else if (kind === "hy2ru") {
      qs.push({
        kind, item: it, ask: "Что это значит?", prompt: it.hy,
        options: shuffle([{ label: it.ru, right: true }, ...others.map((o) => ({ label: o.ru, right: false }))]),
      });
    } else {
      qs.push({
        kind, item: it, ask: "Послушай и выбери",
        options: shuffle([{ label: it.hy, right: true, hy: true }, ...others.map((o) => ({ label: o.hy, right: false, hy: true }))]),
      });
    }
  });
  return shuffle(qs);
}

/* Интервальное повторение: верно — на коробку выше, ошибка — обратно в первую. */
function scheduleSRS(srs, items, wrongItems, now) {
  const next = { ...srs };
  const wrongSet = new Set(wrongItems.map((w) => w.hy));
  items.forEach((it) => {
    const cur = next[it.hy] || { box: 0 };
    const box = wrongSet.has(it.hy) ? 1 : Math.min(cur.box + 1, 5);
    next[it.hy] = { box, due: now + BOX_DELAY[box] * DAY_MS };
  });
  return next;
}

function countDue(progress, now) {
  const t = now === undefined ? Date.now() : now;
  return Object.values(progress.srs || {}).filter((s) => s.due <= t).length;
}

function dueItems(progress, now) {
  const t = now === undefined ? Date.now() : now;
  const srs = progress.srs || {};
  return ALL_ITEMS.filter((it) => srs[it.hy] && srs[it.hy].due <= t);
}

function seenItems(progress) {
  const srs = progress.srs || {};
  return ALL_ITEMS.filter((it) => srs[it.hy]);
}

/* LOGIC-END */

const C = {
  tuf: "#EADACE",
  parch: "#FBF3EA",
  ink: "#2B211B",
  lapis: "#22406E",
  garnet: "#9E1F26",
  apricot: "#D9973B",
  soft: "#8A7A6D",
  line: "#D6C2B2",
  ok: "#3F6E4A",
};

const FONT_HY = "'Noto Serif Armenian','Noto Sans Armenian',Mshtakan,Sylfaen,'Arian AMU',Georgia,serif";
const FONT_DISP = "Georgia,'Iowan Old Style','Times New Roman',serif";
const FONT_BODY = "'Segoe UI',system-ui,-apple-system,Roboto,sans-serif";
const WRAP = { overflowWrap: "anywhere", wordBreak: "break-word" };

const STORE_KEY = "nur-progress-v1";
const emptyProgress = { letters: {}, lessons: {}, srs: {}, xp: 0 };

/* Хранилище прогресса: если хост даёт своё window.storage — используем его,
   иначе обычный localStorage браузера. Форма { value } сохранена для совместимости. */
const storage =
  (typeof window !== "undefined" && window.storage) || {
    get(k) {
      try { return { value: window.localStorage.getItem(k) }; } catch (e) { return null; }
    },
    set(k, v) {
      try { window.localStorage.setItem(k, v); } catch (e) { /* приватный режим */ }
    },
  };

function speak(hy, tr) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const voices = synth.getVoices() || [];
    const hyVoice = voices.find((v) => /^hy/i.test(v.lang));
    let u;
    if (hyVoice) {
      u = new SpeechSynthesisUtterance(hy);
      u.voice = hyVoice;
      u.lang = hyVoice.lang;
    } else {
      u = new SpeechSynthesisUtterance(speechText(tr));
      const ru = voices.find((v) => /^ru/i.test(v.lang));
      if (ru) u.voice = ru;
      u.lang = "ru-RU";
    }
    u.rate = 0.8;
    synth.speak(u);
  } catch (e) { /* озвучка необязательна */ }
}

function Btn({ children, onClick, tone = "solid", style, disabled }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{
      fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, padding: "14px 18px", borderRadius: 14,
      border: "1px solid " + (tone === "solid" ? C.garnet : C.line),
      background: tone === "solid" ? C.garnet : "transparent",
      color: tone === "solid" ? C.parch : C.ink,
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1, width: "100%",
      ...style,
    }}>{children}</button>
  );
}

function SoundBtn({ hy, tr, size = 40 }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); speak(hy, tr); }} aria-label="Послушать" style={{
      width: size, height: size, minWidth: size, borderRadius: size / 2, flexShrink: 0,
      border: "1px solid " + C.line, background: C.parch, color: C.lapis,
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    }}><Volume2 size={Math.round(size * 0.45)} /></button>
  );
}

function Pomegranate({ learned, total, size = 112 }) {
  const seeds = useMemo(() => seedPositions(total), [total]);
  const filled = total > 0 ? Math.round((learned / total) * seeds.length) : 0;
  return (
    <svg viewBox="0 0 100 112" width={size} height={size * 1.12}
      role="img" aria-label={"Выучено " + learned + " из " + total} style={{ flexShrink: 0 }}>
      <path d="M50 12 L44 2 L50 6 L56 2 Z" fill={C.apricot} />
      <path d="M50 14 C22 14 16 40 20 64 C24 90 38 104 50 104 C62 104 76 90 80 64 C84 40 78 14 50 14 Z"
        fill={C.parch} stroke={C.garnet} strokeWidth="2.4" />
      {seeds.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={POM.seedR}
          fill={i < filled ? C.garnet : "none"}
          stroke={i < filled ? C.garnet : C.line} strokeWidth="1" />
      ))}
    </svg>
  );
}

function BackRow({ onBack, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 2, background: "none", border: "none",
        color: C.lapis, cursor: "pointer", fontSize: 15, fontFamily: FONT_BODY, padding: 0,
      }}><ChevronLeft size={18} /> назад</button>
      <span style={{ marginLeft: "auto", fontSize: 13, color: C.soft, ...WRAP }}>{label}</span>
    </div>
  );
}

/* ─────────────  ГЛАВНАЯ  ───────────── */
function Home({ progress, go }) {
  const learned = Object.keys(progress.letters).length;
  const lessonsDone = Object.values(progress.lessons).filter((l) => l.done).length;
  const due = countDue(progress);
  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <Pomegranate learned={learned} total={ALPHABET.length} size={104} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT_DISP, fontSize: 28, color: C.ink, lineHeight: 1.1 }}>
            {learned} из {ALPHABET.length}
          </div>
          <div style={{ color: C.soft, fontSize: 14, marginTop: 4, ...WRAP }}>
            карточек алфавита выучено. Каждое зерно граната — одна буква.
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: C.lapis, fontWeight: 600 }}>
            {progress.xp} очков · {lessonsDone} из {LESSONS.length} уроков
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: C.line, margin: "18px 0" }} />
      <div style={{ fontFamily: FONT_DISP, fontSize: 19, marginBottom: 10 }}>С чего начать сегодня</div>

      <div style={{ display: "grid", gap: 10 }}>
        <TaskRow n="1" title="Алфавит по шестёркам"
          sub={learned === 0 ? "Начни отсюда: 6 букв за подход" : "Осталось " + (ALPHABET.length - learned) + " карточек"}
          onClick={() => go("alphabet")} />
        <TaskRow n="2" title="Уроки" sub={"Фразы для Еревана · пройдено " + lessonsDone}
          onClick={() => go("lessons")} />
        <TaskRow n="3" title="Повторение"
          sub={due > 0 ? due + " карточек ждут повторения" : "Пока нечего повторять"}
          onClick={() => go("review")} />
      </div>

      <div style={{ marginTop: 22, padding: 16, background: C.parch, border: "1px solid " + C.line, borderRadius: 16 }}>
        <div style={{ fontSize: 12, color: C.soft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
          Правило дня
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.55, color: C.ink, ...WRAP }}>
          В армянском ударение почти всегда падает на последний слог: барэ́в, шнорhакалутʰю́н, ерэва́н.
          В транслитерации ударный слог помечен значком.
        </div>
      </div>
    </div>
  );
}

function TaskRow({ n, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
      padding: "14px 16px", background: C.parch, border: "1px solid " + C.line,
      borderRadius: 16, cursor: "pointer", fontFamily: FONT_BODY,
    }}>
      <span style={{
        width: 30, height: 30, minWidth: 30, borderRadius: 15, background: C.lapis, color: C.parch,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
      }}>{n}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 17, fontWeight: 600, color: C.ink, ...WRAP }}>{title}</span>
        <span style={{ display: "block", fontSize: 13, color: C.soft, marginTop: 2, ...WRAP }}>{sub}</span>
      </span>
    </button>
  );
}

/* ─────────────  АЛФАВИТ  ───────────── */
function AlphabetHome({ progress, onOpen }) {
  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <h2 style={{ fontFamily: FONT_DISP, fontSize: 26, margin: "0 0 4px" }}>Алфавит</h2>
      <p style={{ color: C.soft, fontSize: 14, margin: "0 0 18px", ...WRAP }}>
        38 букв плюс сочетания ու и և — 40 карточек в семи группах. Учи по группе, потом проверка.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {GROUPS.map((gr) => {
          const letters = ALPHABET.filter((l) => l.g === gr.g);
          const known = letters.filter((l) => progress.letters[l.up]).length;
          const done = known === letters.length;
          return (
            <button key={gr.g} onClick={() => onOpen(gr.g)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%",
              padding: "14px 16px", background: C.parch, border: "1px solid " + (done ? C.ok : C.line),
              borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: FONT_BODY,
            }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 16, fontWeight: 600, color: C.ink, ...WRAP }}>{gr.title}</span>
                <span style={{ display: "block", fontFamily: FONT_HY, fontSize: 20, color: C.garnet, marginTop: 4, ...WRAP }}>{gr.hint}</span>
              </span>
              <span style={{ fontSize: 13, color: done ? C.ok : C.soft, fontWeight: 600, flexShrink: 0 }}>
                {done ? "готово" : known + "/" + letters.length}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 20, padding: 16, border: "1px dashed " + C.line, borderRadius: 16 }}>
        <div style={{ fontSize: 12, color: C.soft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
          Ключ к транслитерации
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: C.ink, ...WRAP }}>
          <li><b>h</b> — лёгкий выдох (հ), не «х»</li>
          <li><b>ғ</b> — картавое «г» (ղ), как французское r</li>
          <li><b>ы</b> — очень короткий неясный звук (ը)</li>
          <li><b>рр</b> — раскатистое «р» (ռ), <b>р</b> — короткое (ր)</li>
          <li><b>ʰ</b> — сильный выдох после согласной (թ փ ք չ ց)</li>
        </ul>
      </div>
    </div>
  );
}

function LetterStudy({ group, onDone, onBack }) {
  const letters = ALPHABET.filter((l) => l.g === group);
  const [i, setI] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const l = letters[i];

  if (quiz) return <LetterQuiz letters={letters} onExit={() => setQuiz(false)} onPass={(xp) => onDone(letters, xp)} />;

  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <BackRow onBack={onBack} label={"Карточка " + (i + 1) + " из " + letters.length} />

      <div style={{ background: C.parch, border: "1px solid " + C.line, borderRadius: 22, padding: "26px 18px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT_HY, fontSize: 78, lineHeight: 1.15, color: C.garnet, ...WRAP }}>
          {l.up} {l.lo}
        </div>
        <div style={{ marginTop: 8, fontSize: 15, color: C.soft }}>название буквы: {l.name}</div>
        <div style={{
          marginTop: 14, display: "inline-block", padding: "6px 16px", borderRadius: 20,
          background: C.lapis, color: C.parch, fontSize: 19, fontWeight: 700,
        }}>звук: {l.s}</div>
        <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.5, color: C.ink, ...WRAP }}>{l.note}</p>

        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.line,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap",
        }}>
          <div style={{ textAlign: "left", minWidth: 0 }}>
            <div style={{ fontFamily: FONT_HY, fontSize: 26, color: C.ink, ...WRAP }}>{l.w}</div>
            <div style={{ fontSize: 14, color: C.lapis, ...WRAP }}>{l.wt}</div>
            <div style={{ fontSize: 14, color: C.soft, ...WRAP }}>{l.wr}</div>
          </div>
          <SoundBtn hy={l.w} tr={l.wt} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Btn tone="ghost" disabled={i === 0} onClick={() => setI(i - 1)} style={{ flex: 1 }}>Назад</Btn>
        {i < letters.length - 1
          ? <Btn onClick={() => setI(i + 1)} style={{ flex: 2 }}>Дальше</Btn>
          : <Btn onClick={() => setQuiz(true)} style={{ flex: 2 }}>Проверить себя</Btn>}
      </div>
    </div>
  );
}

function LetterQuiz({ letters, onPass, onExit }) {
  const questions = useMemo(() => buildLetterQuestions(letters), [letters]);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  if (!questions.length) {
    return <div style={{ padding: 30 }}><Btn onClick={onExit}>Вернуться к буквам</Btn></div>;
  }

  if (n >= questions.length) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT_DISP, fontSize: 44, color: passed ? C.ok : C.garnet }}>{pct}%</div>
        <p style={{ fontSize: 16, color: C.ink, margin: "10px 0 24px", ...WRAP }}>
          {passed ? "Группа засчитана — зёрна в гранате добавлены." : "Меньше 70%. Пройди карточки ещё раз, это нормально."}
        </p>
        {passed
          ? <Btn onClick={() => onPass(score * 5)}>Забрать {score * 5} очков</Btn>
          : <Btn onClick={onExit}>Вернуться к буквам</Btn>}
      </div>
    );
  }

  const q = questions[n];
  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <BackRow onBack={onExit} label={"Вопрос " + (n + 1) + " из " + questions.length} />
      <div style={{ background: C.parch, border: "1px solid " + C.line, borderRadius: 22, padding: "28px 18px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 12 }}>{q.ask}</div>
        <div style={{
          fontFamily: q.kind === "l2s" ? FONT_HY : FONT_BODY,
          fontSize: q.kind === "l2s" ? 58 : 38, color: C.garnet, lineHeight: 1.2, ...WRAP,
        }}>{q.prompt}</div>
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {q.options.map((o, idx) => {
          const reveal = picked !== null;
          let bg = C.parch, bd = C.line, col = C.ink;
          if (reveal && o.right) { bg = "#E7F0E8"; bd = C.ok; col = C.ok; }
          else if (picked === idx && !o.right) { bg = "#F6E4E4"; bd = C.garnet; col = C.garnet; }
          return (
            <button key={idx} disabled={reveal}
              onClick={() => { setPicked(idx); if (o.right) setScore(score + 1); }}
              style={{
                padding: "16px 18px", background: bg, border: "1.5px solid " + bd, borderRadius: 14,
                fontFamily: q.hy ? FONT_HY : FONT_BODY, fontSize: q.hy ? 28 : 20, color: col,
                cursor: reveal ? "default" : "pointer", textAlign: "center", fontWeight: 600, ...WRAP,
              }}>{o.label}</button>
          );
        })}
      </div>
      {picked !== null && (
        <div style={{ marginTop: 14 }}>
          <div style={{ textAlign: "center", fontSize: 14, color: C.soft, marginBottom: 10, ...WRAP }}>
            {q.letter.up} {q.letter.lo} — {q.letter.s} · {q.letter.w} ({q.letter.wt}) — {q.letter.wr}
          </div>
          <Btn onClick={() => { setPicked(null); setN(n + 1); }}>Дальше</Btn>
        </div>
      )}
    </div>
  );
}

/* ─────────────  УРОКИ  ───────────── */
function LessonsHome({ progress, onOpen }) {
  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <h2 style={{ fontFamily: FONT_DISP, fontSize: 26, margin: "0 0 4px" }}>Уроки</h2>
      <p style={{ color: C.soft, fontSize: 14, margin: "0 0 18px", ...WRAP }}>
        Сначала слова с озвучкой, потом упражнения. Пройденное уходит в повторение.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {LESSONS.map((l, idx) => {
          const done = progress.lessons[l.id] && progress.lessons[l.id].done;
          return (
            <button key={l.id} onClick={() => onOpen(l.id)} style={{
              display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
              padding: "14px 16px", background: C.parch, border: "1px solid " + (done ? C.ok : C.line),
              borderRadius: 16, cursor: "pointer", fontFamily: FONT_BODY,
            }}>
              <span style={{
                width: 34, height: 34, minWidth: 34, borderRadius: 17,
                background: done ? C.ok : C.tuf, color: done ? C.parch : C.soft,
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14,
              }}>{done ? <Check size={17} /> : idx + 1}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 17, fontWeight: 600, color: C.ink, ...WRAP }}>{l.title}</span>
                <span style={{ display: "block", fontSize: 13, color: C.soft, marginTop: 2, ...WRAP }}>{l.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Lesson({ lesson, onBack, onFinish }) {
  const [stage, setStage] = useState("study");

  if (stage === "drill") {
    return <Drill items={lesson.items} title={lesson.title} onBack={() => setStage("study")} onFinish={onFinish} />;
  }

  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <BackRow onBack={onBack} label={lesson.title} />
      <div style={{ display: "grid", gap: 8 }}>
        {lesson.items.map((it, idx) => (
          <div key={idx} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            background: C.parch, border: "1px solid " + C.line, borderRadius: 14,
          }}>
            <SoundBtn hy={it.hy} tr={it.tr} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: FONT_HY, fontSize: 20, color: C.ink, lineHeight: 1.35, ...WRAP }}>{it.hy}</div>
              <div style={{ fontSize: 13, color: C.lapis, ...WRAP }}>{it.tr}</div>
              <div style={{ fontSize: 14, color: C.soft, ...WRAP }}>{it.ru}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <Btn onClick={() => setStage("drill")}>К упражнениям</Btn>
      </div>
    </div>
  );
}

function chipStyle(borderColor, textColor) {
  return {
    padding: "10px 14px", borderRadius: 12, border: "1.5px solid " + borderColor,
    background: "transparent", color: textColor, fontFamily: FONT_HY, fontSize: 19,
    cursor: "pointer", lineHeight: 1.25, maxWidth: "100%", ...WRAP,
  };
}

function Drill({ items, onBack, onFinish, title }) {
  const questions = useMemo(() => buildQuestions(items), [items]);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState(null);
  const [built, setBuilt] = useState([]);
  const [checked, setChecked] = useState(false);
  const [right, setRight] = useState(0);
  const [wrongItems, setWrongItems] = useState([]);

  const next = () => { setPicked(null); setBuilt([]); setChecked(false); setN(n + 1); };
  const markWrong = (item) => setWrongItems((w) => [...w, item]);

  if (n >= questions.length) {
    const pct = Math.round((right / questions.length) * 100);
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT_DISP, fontSize: 44, color: pct >= 70 ? C.ok : C.garnet }}>{pct}%</div>
        <p style={{ fontSize: 16, margin: "10px 0 6px" }}>{right} из {questions.length} верно</p>
        <p style={{ fontSize: 14, color: C.soft, margin: "0 0 24px", ...WRAP }}>
          {pct >= 70 ? "Фразы отправлены в повторение — вернутся через день." : "Ошибки вернутся завтра, это и есть тренировка."}
        </p>
        <Btn onClick={() => onFinish({ pct, right, total: questions.length, items, wrongItems })}>
          Забрать {right * 4} очков
        </Btn>
      </div>
    );
  }

  const q = questions[n];

  if (q.kind === "build") {
    const correct = built.join(" ") === q.item.hy;
    return (
      <div style={{ padding: "8px 20px 28px" }}>
        <BackRow onBack={onBack} label={title + " · " + (n + 1) + "/" + questions.length} />
        <div style={{ background: C.parch, border: "1px solid " + C.line, borderRadius: 22, padding: "22px 16px" }}>
          <div style={{ fontSize: 13, color: C.soft, marginBottom: 10 }}>Собери фразу</div>
          <div style={{ fontSize: 19, color: C.ink, fontWeight: 600, ...WRAP }}>{q.item.ru}</div>
          <div style={{
            marginTop: 18, minHeight: 52, borderBottom: "2px solid " + C.line, paddingBottom: 8,
            display: "flex", flexWrap: "wrap", gap: 8,
          }}>
            {built.map((w, idx) => (
              <button key={idx} onClick={() => !checked && setBuilt(built.filter((_, k) => k !== idx))}
                style={chipStyle(checked ? (correct ? C.ok : C.garnet) : C.lapis, checked ? (correct ? C.ok : C.garnet) : C.lapis)}>{w}</button>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {q.bank.map((w, idx) => {
              const used = built.filter((b) => b === w).length;
              const inBank = q.bank.filter((b) => b === w).length;
              const disabled = used >= inBank || checked;
              return (
                <button key={idx} disabled={disabled} onClick={() => setBuilt([...built, w])}
                  style={{ ...chipStyle(C.line, C.ink), opacity: disabled ? 0.35 : 1 }}>{w}</button>
              );
            })}
          </div>
        </div>
        {checked && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: correct ? "#E7F0E8" : "#F6E4E4" }}>
            <div style={{ fontFamily: FONT_HY, fontSize: 21, ...WRAP }}>{q.item.hy}</div>
            <div style={{ fontSize: 14, color: C.lapis, ...WRAP }}>{q.item.tr}</div>
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          {!checked
            ? <Btn disabled={built.length === 0} onClick={() => {
                setChecked(true);
                if (correct) setRight(right + 1); else markWrong(q.item);
              }}>Проверить</Btn>
            : <Btn onClick={next}>Дальше</Btn>}
        </div>
      </div>
    );
  }

  const promptIsHy = q.kind === "hy2ru";
  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <BackRow onBack={onBack} label={title + " · " + (n + 1) + "/" + questions.length} />
      <div style={{ background: C.parch, border: "1px solid " + C.line, borderRadius: 22, padding: "24px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 12 }}>{q.ask}</div>
        {q.kind === "audio" ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => speak(q.item.hy, q.item.tr)} aria-label="Проиграть ещё раз" style={{
              width: 84, height: 84, borderRadius: 42, border: "none", background: C.lapis, color: C.parch,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}><Volume2 size={34} /></button>
          </div>
        ) : (
          <div style={{ fontFamily: promptIsHy ? FONT_HY : FONT_BODY, fontSize: promptIsHy ? 27 : 21, color: C.ink, lineHeight: 1.4, ...WRAP }}>
            {q.prompt}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {q.options.map((o, idx) => {
          const reveal = picked !== null;
          let bg = C.parch, bd = C.line, col = C.ink;
          if (reveal && o.right) { bg = "#E7F0E8"; bd = C.ok; col = C.ok; }
          else if (picked === idx && !o.right) { bg = "#F6E4E4"; bd = C.garnet; col = C.garnet; }
          return (
            <button key={idx} disabled={reveal}
              onClick={() => { setPicked(idx); if (o.right) setRight(right + 1); else markWrong(q.item); }}
              style={{
                padding: "15px 16px", background: bg, border: "1.5px solid " + bd, borderRadius: 14,
                fontFamily: o.hy ? FONT_HY : FONT_BODY, fontSize: o.hy ? 21 : 17, color: col,
                cursor: reveal ? "default" : "pointer", textAlign: "center", fontWeight: 500, lineHeight: 1.4, ...WRAP,
              }}>{o.label}</button>
          );
        })}
      </div>

      {picked !== null && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <SoundBtn hy={q.item.hy} tr={q.item.tr} size={34} />
            <span style={{ fontFamily: FONT_HY, fontSize: 19, ...WRAP }}>{q.item.hy}</span>
            <span style={{ fontSize: 13, color: C.soft, ...WRAP }}>{q.item.tr}</span>
          </div>
          <Btn onClick={next}>Дальше</Btn>
        </div>
      )}
    </div>
  );
}

/* ─────────────  ПОВТОРЕНИЕ  ───────────── */
function ReviewScreen({ progress, onFinish }) {
  const [started, setStarted] = useState(false);
  const due = dueItems(progress);
  const seen = seenItems(progress);
  const pool = due.length ? due : seen;

  if (!pool.length) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT_DISP, fontSize: 22, marginBottom: 8 }}>Повторять пока нечего</div>
        <p style={{ color: C.soft, fontSize: 15, ...WRAP }}>Пройди хотя бы один урок — фразы появятся здесь сами.</p>
      </div>
    );
  }

  if (started) {
    return <Drill items={shuffle(pool).slice(0, 10)} title="Повторение"
      onBack={() => setStarted(false)} onFinish={(r) => { setStarted(false); onFinish(r); }} />;
  }

  return (
    <div style={{ padding: "8px 20px 28px" }}>
      <h2 style={{ fontFamily: FONT_DISP, fontSize: 26, margin: "0 0 4px" }}>Повторение</h2>
      <p style={{ color: C.soft, fontSize: 14, margin: "0 0 20px", ...WRAP }}>
        Фразы возвращаются через 1, 2, 4, 8, 16 дней. Ошибся — вернётся завтра.
      </p>
      <div style={{ background: C.parch, border: "1px solid " + C.line, borderRadius: 20, padding: 22, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_DISP, fontSize: 46, color: C.garnet }}>{due.length}</div>
        <div style={{ color: C.soft, fontSize: 14, marginBottom: 18 }}>
          {due.length ? "карточек ждут сегодня" : "на сегодня всё повторено"}
        </div>
        <Btn onClick={() => setStarted(true)}>{due.length ? "Начать повторение" : "Повторить всё равно"}</Btn>
      </div>
    </div>
  );
}

/* ─────────────  КАРКАС  ───────────── */
export default function App() {
  const [progress, setProgress] = useState(emptyProgress);
  const [tab, setTab] = useState("home");
  const [group, setGroup] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(STORE_KEY);
        if (r && r.value) setProgress({ ...emptyProgress, ...JSON.parse(r.value) });
      } catch (e) { /* первый запуск — пустой прогресс */ }
      setLoaded(true);
    })();
    try { window.speechSynthesis.getVoices(); } catch (e) { /* нет озвучки */ }
  }, []);

  const persist = (p) => {
    setProgress(p);
    try { storage.set(STORE_KEY, JSON.stringify(p)); } catch (e) { /* останемся в памяти */ }
  };

  const finishLetters = (letters, xp) => {
    const lettersMap = { ...progress.letters };
    letters.forEach((l) => { lettersMap[l.up] = true; });
    persist({ ...progress, letters: lettersMap, xp: progress.xp + xp });
    setGroup(null);
  };

  const finishDrill = ({ right, items, wrongItems }) => {
    const srs = scheduleSRS(progress.srs, items, wrongItems, Date.now());
    const lessons = { ...progress.lessons };
    const fromLesson = lessonId;
    if (fromLesson) lessons[fromLesson] = { done: true };
    persist({ ...progress, srs, lessons, xp: progress.xp + right * 4 });
    setLessonId(null);
    setTab(fromLesson ? "lessons" : "review");
  };

  const currentLesson = LESSONS.find((l) => l.id === lessonId);

  let body;
  if (!loaded) body = <div style={{ padding: 40, color: C.soft }}>Открываю тетрадь…</div>;
  else if (tab === "home") body = <Home progress={progress} go={setTab} />;
  else if (tab === "alphabet") body = group
    ? <LetterStudy group={group} onBack={() => setGroup(null)} onDone={finishLetters} />
    : <AlphabetHome progress={progress} onOpen={setGroup} />;
  else if (tab === "lessons") body = currentLesson
    ? <Lesson lesson={currentLesson} onBack={() => setLessonId(null)} onFinish={finishDrill} />
    : <LessonsHome progress={progress} onOpen={setLessonId} />;
  else body = <ReviewScreen progress={progress} onFinish={finishDrill} />;

  const tabs = [
    { id: "home", label: "Главная" },
    { id: "alphabet", label: "Алфавит" },
    { id: "lessons", label: "Уроки" },
    { id: "review", label: "Повтор" },
  ];

  return (
    <div style={{
      background: C.tuf, minHeight: "100vh", fontFamily: FONT_BODY, color: C.ink,
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.lapis}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
      `}</style>

      <header style={{ padding: "16px 20px 12px", display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: FONT_HY, fontSize: 26, color: C.garnet, letterSpacing: 1 }}>Նուռ</span>
        <span style={{ fontSize: 12, color: C.soft, letterSpacing: 2, textTransform: "uppercase" }}>армянский с нуля</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: C.soft, letterSpacing: 0.5 }}>
          сборка {BUILD}
        </span>
      </header>

      <main style={{
        flex: 1, maxWidth: 560, width: "100%", margin: "0 auto",
        display: "flex", flexDirection: "column", minHeight: 0,
      }}>{body}</main>

      <nav style={{
        position: "sticky", bottom: 0, background: C.parch, borderTop: "1px solid " + C.line,
        display: "flex", padding: "0 4px", gap: 2,
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setGroup(null); setLessonId(null); }}
            style={{
              flex: 1, padding: "11px 2px 9px", background: "none", border: "none", cursor: "pointer",
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? C.garnet : C.soft,
              borderTop: "2px solid " + (tab === t.id ? C.garnet : "transparent"),
            }}>{t.label}</button>
        ))}
      </nav>
    </div>
  );
}
