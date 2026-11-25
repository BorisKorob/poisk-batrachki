(function () {
const { variants: V, pick, int, sample, r, comb, normCdf, normPpf } = G;
const { py, sql, num } = TK;
const list = (a) => '[' + a.map((x) => (typeof x === 'string' ? `'${x}'` : x)).join(', ') + ']';
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];
const CHANNELS = ['organic', 'ads', 'referral', 'social'];
const MONTHS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07'];
const MONTH_RU = { '2025-01': 'январь', '2025-02': 'февраль', '2025-03': 'март', '2025-04': 'апрель', '2025-05': 'май', '2025-06': 'июнь', '2025-07': 'июль' };
const CATS = ['Овощи', 'Фрукты', 'Молочка', 'Мясо и рыба', 'Выпечка', 'Напитки', 'Бытовое'];
const PRODUCTS = ['Огурцы', 'Помидоры', 'Бананы', 'Яблоки', 'Молоко 2.5%', 'Кефир', 'Творог 5%', 'Сыр Российский', 'Куриное филе', 'Хлеб', 'Кофе зерновой', 'Чай чёрный', 'Сок апельсиновый'];
const nextMonth = (m) => { const [y, mm] = m.split('-').map(Number); return mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}`; };
const WORDS = ['доставка', 'курьер', 'заказ', 'корзина', 'скидка', 'промокод', 'оплата', 'возврат', 'клиент', 'товар', 'склад', 'отзыв', 'акция', 'чек'];
const NAMES = ['Аня', 'Борис', 'Вика', 'Глеб', 'Дина', 'Егор', 'Женя', 'Зоя', 'Илья', 'Катя', 'Лёша', 'Маша', 'Ника', 'Олег'];
const ints = (R, n, lo, hi) => Array.from({ length: n }, () => int(R, lo, hi));

/* =========================== ТРЕНАЖЁР PYTHON =========================== */
const DP = [];
DP.push(V('dp-filter', 10, (R) => {
  const xs = ints(R, int(R, 8, 12), 50, 3000), th = pick(R, [500, 800, 1000, 1500]);
  return py('Фильтр и агрегаты', md`Дан список сумм ‹xs = ${list(xs)}›. Сохраните в ‹big› список сумм больше ${th} (порядок сохранить), в ‹n_big› — их количество, в ‹avg_big› — их среднее (если таких нет — 0).`,
    md`big = [x for x in xs if x > ${th}]
n_big = len(big)
avg_big = sum(big) / n_big if n_big else 0`, ['big', 'n_big', 'avg_big'], { setup: `xs = ${list(xs)}` });
}));
DP.push(V('dp-words', 10, (R) => {
  const ws = Array.from({ length: int(R, 6, 10) }, () => pick(R, WORDS)); const text = ws.map((w, i) => (i % 3 === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
  return py('Слова в строке', md`Дана строка ‹text = '${text}'›. Сохраните ‹n_words› — число слов, ‹longest› — самое длинное слово в нижнем регистре (при равной длине — первое), ‹uniq› — отсортированный список уникальных слов в нижнем регистре.`,
    md`words = text.lower().split()
n_words = len(words)
longest = max(words, key=len)
uniq = sorted(set(words))`, ['n_words', 'longest', 'uniq'], { setup: `text = '${text}'` });
}));
DP.push(V('dp-dict', 10, (R) => {
  const ks = sample(R, NAMES, int(R, 3, 5)); const pairs = Array.from({ length: int(R, 7, 11) }, () => [pick(R, ks), int(R, 100, 5000)]);
  const s = '[' + pairs.map(([k, v]) => `('${k}', ${v})`).join(', ') + ']';
  return py('Итоги по ключам', md`Список продаж менеджеров ‹sales = ${s}›. Сохраните ‹totals› — словарь менеджер → сумма продаж, ‹best› — менеджер с максимальной суммой, ‹share_best› — его доля в общей сумме (до 3 знаков).`,
    md`totals = {}
for k, v in sales:
    totals[k] = totals.get(k, 0) + v
best = max(totals, key=totals.get)
share_best = round(totals[best] / sum(totals.values()), 3)`, ['totals', 'best', 'share_best'], { setup: `sales = ${s}` });
}));
DP.push(V('dp-pct', 10, (R) => {
  const xs = ints(R, int(R, 6, 9), 80, 400);
  return py('Темпы роста', md`Выручка по месяцам: ‹rev = ${list(xs)}›. Сохраните ‹growth› — список месячных темпов роста в процентах (‹(тек / пред − 1) · 100›, округлить до 1 знака), ‹best_month› — номер месяца (с 1) с максимальным ростом (для первого месяца роста нет, нумерация роста начинается со 2-го месяца).`,
    md`growth = [round((b / a - 1) * 100, 1) for a, b in zip(rev, rev[1:])]
best_month = growth.index(max(growth)) + 2`, ['growth', 'best_month'], { setup: `rev = ${list(xs)}` });
}));
DP.push(V('dp-sets', 10, (R) => {
  const a = [...new Set(ints(R, 9, 1, 25))], b = [...new Set(ints(R, 9, 1, 25))];
  return py('Множества пользователей', md`Пользователи, купившие в мае: ‹may = ${list(a)}›, в июне: ‹jun = ${list(b)}›. Сохраните отсортированные списки ‹both› (покупали в оба месяца), ‹lost› (были в мае, не вернулись в июне), ‹new› (новые в июне), и ‹retention› — долю майских, вернувшихся в июне (до 3 знаков).`,
    md`m, j = set(may), set(jun)
both = sorted(m & j)
lost = sorted(m - j)
new = sorted(j - m)
retention = round(len(m & j) / len(m), 3)`, ['both', 'lost', 'new', 'retention'], { setup: `may = ${list(a)}\njun = ${list(b)}` });
}));
DP.push(V('dp-sort', 10, (R) => {
  const ns = sample(R, ['Ромашка', 'Вектор', 'Альфа', 'Бета', 'Омега', 'Лотос', 'Сигма', 'Дельта', 'Гамма', 'Рост'], 6); const rv = ns.map(() => int(R, 1, 9) * 100);
  const s = '[' + ns.map((n, i) => `('${n}', ${rv[i]})`).join(', ') + ']';
  return py('Сортировка клиентов', md`Клиенты и их выручка: ‹clients = ${s}›. Сохраните в ‹ranking› список названий по убыванию выручки, при равной выручке — по алфавиту, а в ‹top3_sum› — суммарную выручку первых трёх.`,
    md`ordered = sorted(clients, key=lambda c: (-c[1], c[0]))
ranking = [c[0] for c in ordered]
top3_sum = sum(c[1] for c in ordered[:3])`, ['ranking', 'top3_sum'], { setup: `clients = ${s}` });
}));
DP.push(V('dp-segment', 10, (R) => {
  const a = pick(R, [300, 500, 700]), b = a + pick(R, [700, 1000, 1500]); const xs = ints(R, 10, 50, 4000);
  return py('Функция-сегментатор', md`Напишите функцию ‹segment(amount)›: ‹'S'› если сумма меньше ${a}, ‹'M'› если меньше ${b}, иначе ‹'L'›. Посчитайте ‹counts› — словарь сегмент → число сумм из ‹xs = ${list(xs)}› (только встретившиеся сегменты).`,
    md`def segment(amount):
    if amount < ${a}:
        return 'S'
    if amount < ${b}:
        return 'M'
    return 'L'
counts = {}
for x in xs:
    s = segment(x)
    counts[s] = counts.get(s, 0) + 1`, ['counts', `segment(${a - 1})`, `segment(${a})`, `segment(${b})`], { setup: `xs = ${list(xs)}` });
}));
DP.push(V('dp-topk', 10, (R) => {
  const ws = Array.from({ length: 18 }, () => pick(R, WORDS.slice(0, 8))); const k = int(R, 2, 4);
  return py('Топ частых', md`Теги обращений в поддержку: ‹tags = ${list(ws)}›. С помощью ‹collections.Counter› сохраните ‹top› — ${k} самых частых тега как список кортежей ‹(тег, число)› (как ‹most_common(${k})›), и ‹n_unique› — число разных тегов.`,
    md`from collections import Counter
c = Counter(tags)
top = c.most_common(${k})
n_unique = len(c)`, ['top', 'n_unique'], { setup: `tags = ${list(ws)}` });
}));
DP.push(V('dp-parse', 10, (R) => {
  const ks = sample(R, ['dau', 'mau', 'orders', 'revenue', 'cart', 'refunds', 'tickets'], 4); const vs = ks.map(() => int(R, 10, 9999));
  const s = ks.map((k, i) => `${k}=${vs[i]}`).join(';');
  return py('Разбор строки параметров', md`Метрики пришли строкой ‹raw = '${s}'›. Превратите её в словарь ‹metrics› со значениями ‹int›, а в ‹biggest› сохраните имя метрики с максимальным значением.`,
    md`metrics = {k: int(v) for k, v in (p.split('=') for p in raw.split(';'))}
biggest = max(metrics, key=metrics.get)`, ['metrics', 'biggest'], { setup: `raw = '${s}'` });
}));
DP.push(V('dp-matrix', 10, (R) => {
  const rows = int(R, 3, 4), cols = int(R, 3, 5); const m = Array.from({ length: rows }, () => ints(R, cols, 0, 99));
  const s = '[' + m.map((row) => list(row)).join(', ') + ']';
  return py('Суммы по строкам и столбцам', md`Матрица продаж (строки — магазины, столбцы — дни) без NumPy: ‹m = ${s}›. Сохраните ‹row_sums›, ‹col_sums› (списки) и ‹best_store› — индекс строки с максимальной суммой.`,
    md`row_sums = [sum(r) for r in m]
col_sums = [sum(c) for c in zip(*m)]
best_store = row_sums.index(max(row_sums))`, ['row_sums', 'col_sums', 'best_store'], { setup: `m = ${s}` });
}));
DP.push(V('dp-dates', 10, (R) => {
  const d1 = `2025-${String(int(R, 1, 6)).padStart(2, '0')}-${String(int(R, 1, 28)).padStart(2, '0')}`; const add = int(R, 10, 200);
  return py('Арифметика дат', md`Подписка оформлена ‹${d1}› на ${add} дней. С помощью ‹datetime› сохраните ‹end› — дату окончания строкой ‹YYYY-MM-DD› (последний оплаченный день — старт + ${add} − 1 день), ‹end_weekday› — её день недели (0 — понедельник), ‹days_in_2025› — сколько оплаченных дней приходится на 2025 год.`,
    md`from datetime import date, timedelta
s = date.fromisoformat('${d1}')
e = s + timedelta(days=${add} - 1)
end = e.isoformat()
end_weekday = e.weekday()
days_in_2025 = (min(e, date(2025, 12, 31)) - s).days + 1`, ['end', 'end_weekday', 'days_in_2025']);
}));
DP.push(V('dp-dedupe', 10, (R) => {
  const xs = Array.from({ length: 14 }, () => pick(R, NAMES.slice(0, 7)));
  return py('Уникальные с сохранением порядка', md`Список посетителей ‹visits = ${list(xs)}›. Сохраните ‹first_seen› — уникальные имена в порядке первого появления, ‹repeaters› — отсортированный список тех, кто приходил больше одного раза.`,
    md`first_seen = list(dict.fromkeys(visits))
repeaters = sorted({v for v in visits if visits.count(v) > 1})`, ['first_seen', 'repeaters'], { setup: `visits = ${list(xs)}` });
}));
DP.push(V('dp-anagram', 10, (R) => {
  const pool = [['апельсин', 'спаниель'], ['кабан', 'банка'], ['марка', 'рамка'], ['сосна', 'насос'], ['ток', 'кот'], ['пила', 'липа'], ['норка', 'крона'], ['атлас', 'талас'], ['стол', 'слот'], ['сон', 'нос']];
  const pr = pick(R, pool); const w = pick(R, ['шалаш', 'казак', 'потоп', 'ротор', 'заказ', 'радар']);
  return py('Анаграммы и палиндромы', md`Напишите функции ‹is_anagram(a, b)› (буквы совпадают с учётом количества, регистр не важен) и ‹is_palindrome(s)› (читается одинаково в обе стороны, без учёта регистра и пробелов).`,
    md`def is_anagram(a, b):
    return sorted(a.lower()) == sorted(b.lower())
def is_palindrome(s):
    t = s.lower().replace(' ', '')
    return t == t[::-1]`, [`is_anagram('${pr[0]}', '${pr[1]}')`, `is_anagram('${pr[0]}', '${pr[1]}a')`, `is_palindrome('${w}')`, `is_palindrome('${w.toUpperCase()}ы')`, "is_palindrome('А роза упала на лапу Азора')"]);
}));
DP.push(V('dp-flatten', 10, (R) => {
  const n = int(R, 3, 5); const nested = Array.from({ length: n }, () => ints(R, int(R, 0, 4), 1, 50)); const s = '[' + nested.map(list).join(', ') + ']';
  return py('Вложенные списки', md`Корзины пользователей (цены товаров): ‹baskets = ${s}›. Сохраните ‹flat› — все цены одним списком, ‹non_empty› — число непустых корзин, ‹max_basket› — максимальную сумму корзины (0, если все пустые).`,
    md`flat = [p for b in baskets for p in b]
non_empty = sum(1 for b in baskets if b)
max_basket = max((sum(b) for b in baskets), default=0)`, ['flat', 'non_empty', 'max_basket'], { setup: `baskets = ${s}` });
}));
DP.push(V('dp-running', 10, (R) => {
  const xs = ints(R, 10, -300, 500); const lim = int(R, 300, 900);
  return py('Баланс счёта', md`Операции по счёту (‹+› пополнение, ‹−› списание): ‹ops = ${list(xs)}›. Начальный баланс 0. Сохраните ‹balance› — список баланса после каждой операции, ‹min_balance›, и ‹first_over› — номер операции (с 1), после которой баланс впервые превысил ${lim} (или ‹None›).`,
    md`balance, b = [], 0
for x in ops:
    b += x
    balance.append(b)
min_balance = min(balance)
first_over = next((i for i, v in enumerate(balance, 1) if v > ${lim}), None)`, ['balance', 'min_balance', 'first_over'], { setup: `ops = ${list(xs)}` });
}));
COURSE.add({ id: 'drpy', title: 'Тренажёр: Python', short: 'Сотни коротких задач на списки, строки, словари, множества, функции и даты — для скорости и автоматизма.', lessons: [
  { title: 'Списки, строки, словари', theory: md`Короткие задачи «на руку». Цель — решать каждую за 2–5 минут без подсказок. Переменные с данными уже созданы, значения показаны в условии.`, tasks: DP.slice(0, 5) },
  { title: 'Сортировки, функции, подсчёты', theory: md`Продолжаем: сортировка по ключу, функции с ветвлениями, ‹Counter›, разбор строк.`, tasks: DP.slice(5, 10) },
  { title: 'Даты, уникальность, вложенные структуры', theory: md`Даты через ‹datetime›, порядок первых появлений через ‹dict.fromkeys›, вложенные списки, накопительные суммы.`, tasks: DP.slice(10) },
] });

/* =========================== ТРЕНАЖЁР PANDAS =========================== */
const DD = [];
DD.push(V('dd-users', 12, (R) => {
  const c = pick(R, CITIES), a = int(R, 20, 35), b = a + int(R, 5, 15), ch = pick(R, CHANNELS);
  return py('Фильтр пользователей', md`Сколько пользователей из города «${c}» в возрасте от ${a} до ${b} включительно пришли из канала ‹${ch}›? Сохраните в ‹n›. Также сохраните ‹ids› — список их ‹user_id› по возрастанию.`,
    md`m = (users.city == '${c}') & users.age.between(${a}, ${b}) & (users.channel == '${ch}')
n = int(m.sum())
ids = sorted(users.loc[m, 'user_id'].tolist())`, ['n', 'ids'], { data: ['users'] });
}));
DD.push(V('dd-rev-city-month', 12, (R) => {
  const c = pick(R, CITIES), m = pick(R, MONTHS);
  return py('Выручка города за месяц', md`Посчитайте выручку доставленных заказов пользователей из города «${c}» за ${MONTH_RU[m]} 2025 (по ‹order_date›) — ‹rev›, и число таких заказов — ‹n_orders›.`,
    md`d = orders.merge(users[['user_id', 'city']], on='user_id')
d = d[(d.status == 'delivered') & (d.city == '${c}') & (d.order_date.dt.strftime('%Y-%m') == '${m}')]
rev = d.amount.sum()
n_orders = len(d)`, ['rev', 'n_orders'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-aov-channel', 10, (R) => {
  const ch = pick(R, CHANNELS), p = pick(R, [0, 1]);
  return py('Средний чек канала', md`Найдите средний чек (‹aov›, до 2 знаков) доставленных заказов ${p ? 'со' : 'без'} промо (‹promo == ${p}›) у пользователей из канала ‹${ch}›, и медианный чек ‹med›.`,
    md`d = orders.merge(users[['user_id', 'channel']], on='user_id')
d = d[(d.status == 'delivered') & (d.promo == ${p}) & (d.channel == '${ch}')]
aov = round(d.amount.mean(), 2)
med = d.amount.median()`, ['aov', 'med'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-top-products', 12, (R) => {
  const c = pick(R, CATS), k = int(R, 2, 4);
  return py('Топ товаров категории', md`Для категории «${c}» найдите ${k} товара с наибольшей выручкой (‹quantity × price› из ‹order_items›, только доставленные заказы). ‹top› — Series: индекс — название товара, значения — выручка, по убыванию.`,
    md`d = order_items.merge(orders[orders.status == 'delivered'][['order_id']], on='order_id').merge(products[['product_id', 'name', 'category']], on='product_id')
d = d[d.category == '${c}']
top = (d.quantity * d.price).groupby(d.name).sum().sort_values(ascending=False).head(${k})`, ['top'], { data: ['orders', 'order_items', 'products'] });
}));
DD.push(V('dd-weekday', 10, (R) => {
  const c = pick(R, CITIES);
  return py('Заказы по дням недели', md`Для пользователей из города «${c}» посчитайте число заказов (все статусы) по дням недели: ‹by_wd› — Series с индексом 0…6 (0 — понедельник), и ‹peak› — день недели с максимумом.`,
    md`d = orders.merge(users[['user_id', 'city']], on='user_id')
d = d[d.city == '${c}']
by_wd = d.order_date.dt.dayofweek.value_counts().sort_index()
peak = int(by_wd.idxmax())`, ['by_wd', 'peak'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-promo-share', 10, (R) => {
  const m = pick(R, MONTHS);
  return py('Доля промо', md`За ${MONTH_RU[m]} 2025 посчитайте долю промо-заказов среди всех заказов ‹promo_share›, долю выручки промо в выручке доставленных заказов ‹promo_rev_share› и долю отмен среди промо-заказов ‹promo_cancel›.`,
    md`d = orders[orders.order_date.dt.strftime('%Y-%m') == '${m}']
promo_share = d.promo.mean()
dl = d[d.status == 'delivered']
promo_rev_share = dl.loc[dl.promo == 1, 'amount'].sum() / dl.amount.sum()
promo_cancel = (d.loc[d.promo == 1, 'status'] == 'cancelled').mean()`, ['promo_share', 'promo_rev_share', 'promo_cancel'], { data: ['orders'] });
}));
DD.push(V('dd-no-orders', 10, (R) => {
  const c = pick(R, CITIES), ch = pick(R, CHANNELS);
  return py('Без покупок', md`Сколько пользователей из «${c}» с каналом ‹${ch}› не сделали ни одного **доставленного** заказа? Сохраните ‹n_silent› и ‹share_silent› — их долю среди пользователей этого города и канала.`,
    md`u = users[(users.city == '${c}') & (users.channel == '${ch}')]
buyers = set(orders.loc[orders.status == 'delivered', 'user_id'])
silent = ~u.user_id.isin(buyers)
n_silent = int(silent.sum())
share_silent = silent.mean()`, ['n_silent', 'share_silent'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-monthly-channel', 10, (R) => {
  const ch = pick(R, CHANNELS);
  return py('Месячная выручка канала', md`Постройте ‹monthly› — Series выручки доставленных заказов пользователей канала ‹${ch}› по месяцам (индекс — строки ‹YYYY-MM›), и ‹mom› — Series месячного прироста в долях (‹pct_change()›, первый месяц — NaN).`,
    md`d = orders.merge(users[['user_id', 'channel']], on='user_id')
d = d[(d.status == 'delivered') & (d.channel == '${ch}')]
monthly = d.groupby(d.order_date.dt.strftime('%Y-%m')).amount.sum()
mom = monthly.pct_change()`, ['monthly', 'mom'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-pivot', 10, (R) => {
  const st = pick(R, ['delivered', 'cancelled']); const ms = MONTHS.slice(int(R, 0, 3)); const m0 = ms[0];
  return py('Сводная город × месяц', md`Постройте ‹pv› — сводную таблицу числа заказов со статусом ‹${st}›: строки — город пользователя, столбцы — месяц (‹YYYY-MM›) начиная с ${m0}, пустые клетки — 0. Используйте ‹pd.pivot_table(..., aggfunc='count', fill_value=0)› по ‹order_id›.`,
    md`d = orders.merge(users[['user_id', 'city']], on='user_id')
d = d[(d.status == '${st}') & (d.order_date >= '${m0}-01')].assign(month=lambda x: x.order_date.dt.strftime('%Y-%m'))
pv = pd.pivot_table(d, index='city', columns='month', values='order_id', aggfunc='count', fill_value=0)`, ['pv'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-retention', 12, (R) => {
  const m = pick(R, MONTHS.slice(0, 6)), n = pick(R, [1, 3, 7, 14, 30]);
  return py(`Retention ${n}-го дня`, md`Для пользователей, зарегистрированных в ${MONTH_RU[m]} 2025, посчитайте retention ${n}-го дня: долю тех, у кого есть ‹app_open› ровно через ${n} дн. после ‹reg_date›. Сохраните ‹cohort_size› и ‹ret›.`,
    md`u = users[users.reg_date.dt.strftime('%Y-%m') == '${m}']
opens = events[events.event == 'app_open'][['user_id', 'event_date']]
d = u.assign(target=u.reg_date + pd.Timedelta(days=${n})).merge(opens, left_on=['user_id', 'target'], right_on=['user_id', 'event_date'], how='left')
cohort_size = len(u)
ret = d.event_date.notna().sum() / cohort_size`, ['cohort_size', 'ret'], { data: ['users', 'events'] });
}));
DD.push(V('dd-freq-city', 10, (R) => {
  const st = pick(R, ['delivered', 'cancelled', null]);
  return py('Частота покупок по городам', md`Посчитайте для каждого города среднее число заказов${st ? ` со статусом ‹${st}›` : ' (все статусы)'} на одного **покупателя** (пользователя, у которого есть хотя бы один такой заказ). ‹freq› — Series по городам, по алфавиту, до 3 знаков.`,
    md`d = orders${st ? `[orders.status == '${st}']` : ''}.merge(users[['user_id', 'city']], on='user_id')
freq = (d.groupby('city').order_id.count() / d.groupby('city').user_id.nunique()).round(3).sort_index()`, ['freq'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-conv-days', 12, (R) => {
  const ch = pick(R, CHANNELS), n = pick(R, [3, 7, 14, 30]);
  return py('Конверсия в первую покупку', md`Какая доля пользователей канала ‹${ch}› сделала первый доставленный заказ в течение ${n} дней с регистрации (разница дат от 0 до ${n} включительно)? Сохраните ‹cr›.`,
    md`first = orders[orders.status == 'delivered'].groupby('user_id').order_date.min()
u = users[users.channel == '${ch}'].set_index('user_id')
lag = (first.reindex(u.index) - u.reg_date).dt.days
cr = (lag <= ${n}).mean()`, ['cr'], { data: ['orders', 'users'] });
}));
DD.push(V('dd-cat-share', 10, (R) => {
  const c = pick(R, CITIES);
  return py('Структура корзины города', md`Для пользователей из «${c}» посчитайте долю каждой категории в выручке доставленных заказов (по ‹order_items›). ‹share› — Series по категориям, по убыванию, сумма = 1.`,
    md`d = (order_items.merge(orders[orders.status == 'delivered'][['order_id', 'user_id']], on='order_id')
       .merge(users[['user_id', 'city']], on='user_id').merge(products[['product_id', 'category']], on='product_id'))
d = d[d.city == '${c}']
rv = (d.quantity * d.price).groupby(d.category).sum()
share = (rv / rv.sum()).sort_values(ascending=False)`, ['share'], { data: ['orders', 'order_items', 'products', 'users'] });
}));
DD.push(V('dd-ab-seg', 10, (R) => {
  const th = pick(R, [0, 300, 500, 800, 1200]); const gt = R() < 0.5;
  return py('A/B в сегменте', md`В ‹ab_test› рассмотрите сегмент пользователей с ‹pre_revenue ${gt ? '>' : '<='} ${th}›. Сохраните ‹cr› — Series конверсии по группам (индекс A, B), ‹rpu› — Series средней выручки на пользователя по группам, и ‹n_seg› — размер сегмента.`,
    md`s = ab_test[ab_test.pre_revenue ${gt ? '>' : '<='} ${th}]
cr = s.groupby('grp').converted.mean()
rpu = s.groupby('grp').revenue.mean()
n_seg = len(s)`, ['cr', 'rpu', 'n_seg'], { data: ['ab_test'] });
}));
DD.push(V('dd-buyers-age', 10, (R) => {
  const p = pick(R, PRODUCTS);
  return py('Кто покупает товар', md`Найдите покупателей товара «${p}» (доставленные заказы). Сохраните ‹n_buyers› — число уникальных покупателей, ‹avg_age› — их средний возраст (до 1 знака), ‹top_city› — самый частый город среди них.`,
    md`pid = products.loc[products.name == '${p}', 'product_id'].iloc[0]
oids = order_items.loc[order_items.product_id == pid, 'order_id']
uids = orders.loc[orders.order_id.isin(oids) & (orders.status == 'delivered'), 'user_id'].unique()
b = users[users.user_id.isin(uids)]
n_buyers = len(b)
avg_age = round(b.age.mean(), 1)
top_city = b.city.value_counts().idxmax()`, ['n_buyers', 'avg_age', 'top_city'], { data: ['orders', 'order_items', 'products', 'users'] });
}));
COURSE.add({ id: 'drpd', title: 'Тренажёр: pandas', short: 'Задачи на реальных таблицах «Корзинки»: фильтры, группировки, merge, сводные, retention и A/B — десятки вариантов каждого типа.', lessons: [
  { title: 'Фильтры и агрегаты', theory: md`Каждая задача — на таблицах «Корзинки» (схема — на странице [Данные](#data)). Варианты одного типа отличаются городом, каналом, месяцем или категорией. Решайте, пока не начнёт получаться без подсказок.`, tasks: DD.slice(0, 4).flat() },
  { title: 'Время, доли, сводные', theory: md`Даты (‹dt.dayofweek›, ‹dt.strftime›), доли и ‹pivot_table›.`, tasks: DD.slice(4, 9).flat() },
  { title: 'Когорты, конверсии, сегменты', theory: md`Retention N-го дня, конверсия в первую покупку, структура выручки и анализ A/B в сегменте.`, tasks: DD.slice(9).flat() },
] });

/* =========================== ТРЕНАЖЁР SQL =========================== */
const DS = [];
DS.push(V('ds-filter', 12, (R) => {
  const c = pick(R, CITIES), a = int(R, 20, 40), ch = pick(R, CHANNELS);
  return sql('Фильтр и сортировка', md`Выведите ‹user_id›, ‹age›, ‹reg_date› пользователей из «${c}» с каналом ‹${ch}› старше ${a} лет. Сортировка: по дате регистрации, затем по ‹user_id›.`,
    md`SELECT user_id, age, reg_date FROM users
WHERE city = '${c}' AND channel = '${ch}' AND age > ${a}
ORDER BY reg_date, user_id;`, true);
}));
DS.push(V('ds-count-month', 12, (R) => {
  const m = pick(R, MONTHS), st = pick(R, ['delivered', 'cancelled']);
  return sql('Заказы по городам за месяц', md`Посчитайте число заказов со статусом ‹${st}› за ${MONTH_RU[m]} 2025 по городам пользователей. Столбцы: ‹city›, ‹cnt›. Сортировка: по убыванию ‹cnt›, затем по городу.`,
    md`SELECT u.city, COUNT(*) AS cnt
FROM orders o JOIN users u ON u.user_id = o.user_id
WHERE o.status = '${st}' AND strftime('%Y-%m', o.order_date) = '${m}'
GROUP BY u.city
ORDER BY cnt DESC, u.city;`, true);
}));
DS.push(V('ds-rev-channel-month', 12, (R) => {
  const m = pick(R, MONTHS);
  return sql('Выручка и чек по каналам', md`За ${MONTH_RU[m]} 2025 для каждого канала посчитайте выручку доставленных заказов, число заказов и средний чек. Столбцы: ‹channel›, ‹revenue›, ‹orders_cnt›, ‹aov› (2 знака). Сортировка по выручке по убыванию.`,
    md`SELECT u.channel, ROUND(SUM(o.amount), 2) AS revenue, COUNT(*) AS orders_cnt, ROUND(AVG(o.amount), 2) AS aov
FROM orders o JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'delivered' AND strftime('%Y-%m', o.order_date) = '${m}'
GROUP BY u.channel
ORDER BY revenue DESC;`, true);
}));
DS.push(V('ds-top-cat', 12, (R) => {
  const c = pick(R, CATS), k = int(R, 2, 4);
  return sql('Топ товаров категории', md`Выведите ${k} товара категории «${c}» с наибольшим числом проданных штук в доставленных заказах. Столбцы: ‹name›, ‹qty›, ‹revenue› (2 знака). Сортировка по ‹qty› по убыванию, затем по названию.`,
    md`SELECT p.name, SUM(oi.quantity) AS qty, ROUND(SUM(oi.quantity * oi.price), 2) AS revenue
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id AND o.status = 'delivered'
JOIN products p ON p.product_id = oi.product_id
WHERE p.category = '${c}'
GROUP BY p.name
ORDER BY qty DESC, p.name
LIMIT ${k};`, true);
}));
DS.push(V('ds-having', 12, (R) => {
  const k = int(R, 3, 6), c = pick(R, CITIES);
  return sql('HAVING', md`Найдите пользователей из «${c}», у которых не меньше ${k} доставленных заказов. Столбцы: ‹user_id›, ‹orders_cnt›, ‹total› (2 знака). Сортировка по ‹total› по убыванию, затем по ‹user_id›.`,
    md`SELECT o.user_id, COUNT(*) AS orders_cnt, ROUND(SUM(o.amount), 2) AS total
FROM orders o JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'delivered' AND u.city = '${c}'
GROUP BY o.user_id
HAVING COUNT(*) >= ${k}
ORDER BY total DESC, o.user_id;`, true);
}));
DS.push(V('ds-anti', 10, (R) => {
  const c = pick(R, CITIES), m = pick(R, MONTHS.slice(0, 6));
  return sql('Зарегистрировались и не купили', md`Сколько пользователей из «${c}», зарегистрированных в ${MONTH_RU[m]} 2025, не сделали ни одного доставленного заказа? Одно число.`,
    md`SELECT COUNT(*) AS cnt
FROM users u
WHERE u.city = '${c}' AND strftime('%Y-%m', u.reg_date) = '${m}'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id AND o.status = 'delivered');`);
}));
DS.push(V('ds-rank-city', 12, (R) => {
  const k = int(R, 1, 3), m = pick(R, MONTHS);
  return sql('Топ клиентов в каждом городе', md`За ${MONTH_RU[m]} 2025 найдите в каждом городе ${k === 1 ? 'клиента' : k + ' клиентов'} с наибольшей выручкой доставленных заказов (при равенстве — меньший ‹user_id›). Столбцы: ‹city›, ‹user_id›, ‹revenue› (2 знака), ‹rn›. Сортировка: город, ‹rn›.`,
    md`WITH r AS (
    SELECT u.city, o.user_id, SUM(o.amount) AS revenue
    FROM orders o JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'delivered' AND strftime('%Y-%m', o.order_date) = '${m}'
    GROUP BY u.city, o.user_id
), x AS (
    SELECT city, user_id, revenue, ROW_NUMBER() OVER (PARTITION BY city ORDER BY revenue DESC, user_id) AS rn FROM r
)
SELECT city, user_id, ROUND(revenue, 2) AS revenue, rn FROM x WHERE rn <= ${k} ORDER BY city, rn;`, true);
}));
DS.push(V('ds-cum', 12, (R) => {
  const c = pick(R, CITIES), m = pick(R, MONTHS);
  return sql('Нарастающий итог за месяц', md`Для «${c}» за ${MONTH_RU[m]} 2025 выведите по дням выручку доставленных заказов и нарастающий итог с начала месяца. Столбцы: ‹order_date›, ‹revenue›, ‹cum_revenue› (оба 2 знака). Только дни, в которые были заказы. Сортировка по дате.`,
    md`WITH d AS (
    SELECT o.order_date, SUM(o.amount) AS revenue
    FROM orders o JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'delivered' AND u.city = '${c}' AND strftime('%Y-%m', o.order_date) = '${m}'
    GROUP BY o.order_date
)
SELECT order_date, ROUND(revenue, 2) AS revenue, ROUND(SUM(revenue) OVER (ORDER BY order_date), 2) AS cum_revenue
FROM d ORDER BY order_date;`, true);
}));
DS.push(V('ds-lag', 10, (R) => {
  const ch = pick(R, CHANNELS);
  return sql('Изменение к прошлому месяцу', md`Для канала ‹${ch}› выведите помесячную выручку доставленных заказов, выручку прошлого месяца и прирост в процентах. Столбцы: ‹month›, ‹revenue›, ‹prev_revenue›, ‹growth_pct› (все 2 знака; для первого месяца предыдущие значения NULL). Сортировка по месяцу.`,
    md`WITH m AS (
    SELECT strftime('%Y-%m', o.order_date) AS month, SUM(o.amount) AS revenue
    FROM orders o JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'delivered' AND u.channel = '${ch}'
    GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       ROUND(LAG(revenue) OVER (ORDER BY month), 2) AS prev_revenue,
       ROUND(100.0 * (revenue / LAG(revenue) OVER (ORDER BY month) - 1), 2) AS growth_pct
FROM m ORDER BY month;`, true);
}));
DS.push(V('ds-retention', 12, (R) => {
  const n = pick(R, [1, 3, 7, 14, 30]), ch = pick(R, CHANNELS);
  return sql(`Retention ${n}-го дня по каналу`, md`Для пользователей канала ‹${ch}› посчитайте retention ${n}-го дня (есть ‹app_open› ровно через ${n} дн. после регистрации) по месяцам регистрации. Столбцы: ‹cohort›, ‹users_cnt›, ‹ret› (3 знака). Сортировка по когорте.`,
    md`SELECT strftime('%Y-%m', u.reg_date) AS cohort, COUNT(*) AS users_cnt,
       ROUND(AVG(CASE WHEN e.user_id IS NOT NULL THEN 1.0 ELSE 0 END), 3) AS ret
FROM users u
LEFT JOIN events e ON e.user_id = u.user_id AND e.event = 'app_open' AND e.event_date = date(u.reg_date, '+${n} day')
WHERE u.channel = '${ch}'
GROUP BY cohort ORDER BY cohort;`, true);
}));
DS.push(V('ds-dau', 12, (R) => {
  const m = pick(R, MONTHS), c = pick(R, CITIES);
  return sql('DAU, MAU и sticky по городу', md`Для пользователей из «${c}» за ${MONTH_RU[m]} 2025 посчитайте средний DAU по ‹app_open›, MAU и sticky. Одна строка: ‹avg_dau› (2 знака), ‹mau›, ‹sticky› (3 знака). Средний DAU — по дням, в которые была хотя бы одна активность.`,
    md`WITH ev AS (
    SELECT e.user_id, e.event_date FROM events e JOIN users u ON u.user_id = e.user_id
    WHERE e.event = 'app_open' AND u.city = '${c}' AND strftime('%Y-%m', e.event_date) = '${m}'
), d AS (SELECT event_date, COUNT(DISTINCT user_id) AS dau FROM ev GROUP BY event_date)
SELECT ROUND(AVG(dau), 2) AS avg_dau, (SELECT COUNT(DISTINCT user_id) FROM ev) AS mau,
       ROUND(AVG(dau) / (SELECT COUNT(DISTINCT user_id) FROM ev), 3) AS sticky
FROM d;`);
}));
DS.push(V('ds-first-order', 12, (R) => {
  const c = pick(R, CITIES);
  return sql('Время до первой покупки', md`Для пользователей из «${c}», у которых есть доставленный заказ, посчитайте среднее и максимальное число дней от регистрации до первого доставленного заказа, а также число таких покупателей. Одна строка: ‹buyers›, ‹avg_days› (2 знака), ‹max_days›.`,
    md`WITH f AS (
    SELECT o.user_id, MIN(o.order_date) AS first_date FROM orders o WHERE o.status = 'delivered' GROUP BY o.user_id
)
SELECT COUNT(*) AS buyers,
       ROUND(AVG(julianday(f.first_date) - julianday(u.reg_date)), 2) AS avg_days,
       MAX(julianday(f.first_date) - julianday(u.reg_date)) AS max_days
FROM f JOIN users u ON u.user_id = f.user_id
WHERE u.city = '${c}';`);
}));
DS.push(V('ds-ab', 10, (R) => {
  const th = pick(R, [0, 200, 500, 1000]);
  return sql('Итоги A/B на SQL', md`По ‹ab_test› для пользователей с ‹pre_revenue > ${th}› посчитайте по группам: размер, конверсию (4 знака), выручку на пользователя (2 знака) и выручку на платящего (2 знака). Столбцы: ‹grp›, ‹n›, ‹cr›, ‹arpu›, ‹arppu›. Сортировка по группе.`,
    md`SELECT grp, COUNT(*) AS n, ROUND(AVG(converted), 4) AS cr, ROUND(AVG(revenue), 2) AS arpu,
       ROUND(SUM(revenue) / SUM(converted), 2) AS arppu
FROM ab_test WHERE pre_revenue > ${th}
GROUP BY grp ORDER BY grp;`, true);
}));
DS.push(V('ds-share-cat', 10, (R) => {
  const m = pick(R, MONTHS);
  return sql('Доля категорий', md`За ${MONTH_RU[m]} 2025 посчитайте долю каждой категории в выручке доставленных заказов (по ‹order_items›) с помощью оконной функции ‹SUM() OVER ()›. Столбцы: ‹category›, ‹revenue› (2 знака), ‹share› (3 знака). Сортировка по выручке по убыванию.`,
    md`WITH c AS (
    SELECT p.category, SUM(oi.quantity * oi.price) AS revenue
    FROM order_items oi JOIN orders o ON o.order_id = oi.order_id JOIN products p ON p.product_id = oi.product_id
    WHERE o.status = 'delivered' AND strftime('%Y-%m', o.order_date) = '${m}'
    GROUP BY p.category
)
SELECT category, ROUND(revenue, 2) AS revenue, ROUND(revenue / SUM(revenue) OVER (), 3) AS share
FROM c ORDER BY revenue DESC;`, true);
}));
DS.push(V('ds-streak', 10, (R) => {
  const k = int(R, 2, 5), c = pick(R, CITIES);
  return sql('Серии активности', md`Сколько пользователей из «${c}» хотя бы раз открывали приложение ${k} и более дней подряд? Одно число.`,
    md`WITH d AS (
    SELECT e.user_id, julianday(e.event_date) - ROW_NUMBER() OVER (PARTITION BY e.user_id ORDER BY e.event_date) AS grp
    FROM events e JOIN users u ON u.user_id = e.user_id
    WHERE e.event = 'app_open' AND u.city = '${c}'
), s AS (SELECT user_id, grp, COUNT(*) AS streak FROM d GROUP BY user_id, grp)
SELECT COUNT(DISTINCT user_id) AS users_cnt FROM s WHERE streak >= ${k};`);
}));
COURSE.add({ id: 'drsql', title: 'Тренажёр: SQL', short: 'Около двухсот SQL-задач на одной схеме: фильтры, JOIN, HAVING, окна, нарастающие итоги, retention, DAU/MAU, A/B, серии.', lessons: [
  { title: 'Фильтры, группировки, JOIN', theory: md`Каждый тип задачи дан в 10–12 вариантах. Не подглядывайте в решение, пока не сделаете хотя бы две попытки. Схема таблиц — на странице [Данные](#data).`, tasks: DS.slice(0, 6).flat() },
  { title: 'Оконные функции', theory: md`‹ROW_NUMBER›, нарастающие итоги, ‹LAG›, доли через ‹SUM() OVER ()›.`, tasks: [DS[6], DS[7], DS[8], DS[13]].flat() },
  { title: 'Продуктовые запросы', theory: md`Retention, DAU/MAU, время до первой покупки, итоги A/B-теста, серии активности.`, tasks: [DS[9], DS[10], DS[11], DS[12], DS[14]].flat() },
] });

/* =========================== ТРЕНАЖЁР: ТЕОРВЕР, СТАТИСТИКА, A/B =========================== */
const ST = [];
const pf = (x) => String(x).replace('.', ',');
ST.push(V('st-binom', 10, (R) => {
  const n = int(R, 5, 20), p = pick(R, [0.05, 0.1, 0.15, 0.2, 0.3, 0.4]), k = int(R, 0, Math.min(n, 5));
  const ans = comb(n, k) * p ** k * (1 - p) ** (n - k);
  return num('Биномиальное: ровно k', md`Конверсия ${pf(p)}, пользователи независимы. Вероятность, что из ${n} пользователей купят ровно ${k}? Ответ — 4 знака после запятой.`, r(ans, 4), 0.00011 / Math.max(1, ans), md`C(${n},${k})·${p}^${k}·${r(1 - p, 2)}^${n - k} ≈ ${r(ans, 4)}`);
}));
ST.push(V('st-binom-ge', 10, (R) => {
  const n = int(R, 5, 15), p = pick(R, [0.1, 0.2, 0.25, 0.3, 0.5]), k = int(R, 1, 3);
  let less = 0; for (let i = 0; i < k; i++) less += comb(n, i) * p ** i * (1 - p) ** (n - i);
  return num('Биномиальное: не меньше k', md`Каждый из ${n} клиентов независимо продлевает подписку с вероятностью ${pf(p)}. Вероятность, что продлят **не меньше ${k}**? 4 знака.`, r(1 - less, 4), 0.00011, md`1 − Σ P(X=i) для i < ${k} = ${r(1 - less, 4)}`);
}));
ST.push(V('st-pois', 10, (R) => {
  const l = pick(R, [0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), k = int(R, 0, 4);
  let f = 1; for (let i = 2; i <= k; i++) f *= i; const ans = l ** k * Math.exp(-l) / f;
  return num('Распределение Пуассона', md`В среднем приходит ${pf(l)} заявок в час. Вероятность ровно ${k} заявок за час? 4 знака.`, r(ans, 4), 0.00011, md`λ^k·e^(−λ)/k! = ${r(ans, 4)}`);
}));
ST.push(V('st-bayes', 10, (R) => {
  const prev = pick(R, [0.005, 0.01, 0.02, 0.05, 0.1]), sens = pick(R, [0.8, 0.9, 0.95, 0.99]), fpr = pick(R, [0.01, 0.02, 0.05, 0.1]);
  const ans = (sens * prev) / (sens * prev + fpr * (1 - prev));
  return num('Формула Байеса', md`Доля мошеннических заявок ${pf(prev)}. Скоринг помечает ${pf(sens * 100)}% мошенников и ${pf(fpr * 100)}% честных заявок. Какова вероятность, что помеченная заявка мошенническая? 3 знака.`, r(ans, 3), 0.0011, md`${sens}·${prev} / (${sens}·${prev} + ${fpr}·${r(1 - prev, 3)}) ≈ ${r(ans, 3)}`);
}));
ST.push(V('st-norm-tail', 10, (R) => {
  const mu = int(R, 8, 20) * 100, sd = int(R, 2, 6) * 50, a = mu + int(R, -2, 3) * sd / 2;
  const ans = 1 - normCdf((a - mu) / sd);
  return num('Нормальное: хвост', md`Время доставки распределено нормально: среднее ${mu} с, стандартное отклонение ${sd} с. Вероятность, что доставка займёт больше ${a} с? 3 знака.`, r(ans, 3), 0.0021, md`z = (${a} − ${mu}) / ${sd} = ${r((a - mu) / sd, 2)}; P = 1 − Φ(z) ≈ ${r(ans, 3)}`);
}));
ST.push(V('st-norm-q', 10, (R) => {
  const mu = int(R, 5, 30) * 100, sd = int(R, 1, 8) * 50, q = pick(R, [0.9, 0.95, 0.975, 0.99, 0.8]);
  const ans = mu + sd * normPpf(q);
  return num('Нормальное: квантиль', md`Чек распределён нормально со средним ${mu} ₽ и σ = ${sd} ₽. Найдите ${q * 100}-й перцентиль (значение, ниже которого ${q * 100}% чеков). Округлите до целого.`, Math.round(ans), 1.5 / Math.max(1, ans), md`μ + σ·z(${q}) = ${mu} + ${sd}·${r(normPpf(q), 3)} ≈ ${Math.round(ans)}`);
}));
ST.push(V('st-ci-prop', 10, (R) => {
  const n = int(R, 4, 40) * 100, x = Math.round(n * pick(R, [0.03, 0.05, 0.08, 0.12, 0.2])), lowSide = R() < 0.5;
  const p = x / n, se = Math.sqrt(p * (1 - p) / n), ans = lowSide ? p - 1.96 * se : p + 1.96 * se;
  return num('ДИ для конверсии', md`Из ${n} посетителей купили ${x}. Найдите ${lowSide ? 'нижнюю' : 'верхнюю'} границу 95% доверительного интервала конверсии по нормальной аппроксимации (z = 1.96). 4 знака.`, r(ans, 4), 0.00015, md`p = ${r(p, 4)}, SE = √(p(1−p)/n) = ${r(se, 5)}; граница = p ${lowSide ? '−' : '+'} 1.96·SE ≈ ${r(ans, 4)}`);
}));
ST.push(V('st-ci-mean', 10, (R) => {
  const n = int(R, 4, 30) * 50, m = int(R, 800, 2500), s = int(R, 300, 1500), up = R() < 0.5;
  const ans = m + (up ? 1 : -1) * 1.96 * s / Math.sqrt(n);
  return num('ДИ для среднего', md`По выборке из ${n} заказов средний чек ${m} ₽, стандартное отклонение ${s} ₽. Найдите ${up ? 'верхнюю' : 'нижнюю'} границу 95% ДИ среднего (z = 1.96). 1 знак.`, r(ans, 1), 0.051 / Math.max(1, ans), md`${m} ${up ? '+' : '−'} 1.96·${s}/√${n} ≈ ${r(ans, 1)}`);
}));
ST.push(V('st-ztest', 10, (R) => {
  const n1 = int(R, 20, 80) * 100, n2 = n1 + int(R, -10, 10) * 10, p1 = pick(R, [0.05, 0.08, 0.1, 0.12]), d = pick(R, [0.003, 0.005, 0.008, 0.01, 0.015]);
  const x1 = Math.round(n1 * p1), x2 = Math.round(n2 * (p1 + d));
  const pa = x1 / n1, pb = x2 / n2, pp = (x1 + x2) / (n1 + n2), z = (pb - pa) / Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2));
  const pv = 2 * (1 - normCdf(Math.abs(z)));
  return num('z-тест двух конверсий', md`Контроль: ${x1} покупок из ${n1}. Тест: ${x2} из ${n2}. Найдите двусторонний p-value z-теста с объединённой долей. 3 знака.`, r(pv, 3), 0.0021, md`z ≈ ${r(z, 3)}, p-value = 2·(1 − Φ(|z|)) ≈ ${r(pv, 3)}`);
}));
ST.push(V('st-n', 10, (R) => {
  const p = pick(R, [0.02, 0.05, 0.1, 0.15, 0.2, 0.3]), d = pick(R, [0.005, 0.01, 0.02]), pw = pick(R, [0.8, 0.9]);
  const z = 1.96 + normPpf(pw), p2 = p + d, n = Math.ceil(z * z * (p * (1 - p) + p2 * (1 - p2)) / (d * d));
  return num('Размер выборки', md`Базовая конверсия ${pf(p * 100)}%, хотим заметить абсолютный рост на ${pf(d * 100)} п.п., α = 0.05 (двусторонний), мощность ${pw * 100}%. Сколько пользователей нужно в **каждую** группу? Допуск 2%.`, n, 0.02, md`(1.96 + ${r(normPpf(pw), 4)})² · (p₁(1−p₁) + p₂(1−p₂)) / δ² ≈ ${n}`);
}));
ST.push(V('st-mde', 10, (R) => {
  const sd = int(R, 5, 30) * 100, n = int(R, 5, 50) * 1000;
  const mde = (1.96 + 0.8416) * Math.sqrt(2 * sd * sd / n);
  return num('MDE для среднего', md`Стандартное отклонение выручки на пользователя ${sd} ₽, в каждой группе по ${n} пользователей. Какой минимальный абсолютный эффект (₽) тест заметит при α = 0.05 и мощности 80%? 2 знака.`, r(mde, 2), 0.011 / Math.max(1, mde), md`MDE = (1.96 + 0.8416)·√(2σ²/n) ≈ ${r(mde, 2)} ₽`);
}));
ST.push(V('st-comb', 10, (R) => {
  const n = int(R, 6, 15), k = int(R, 2, 4), ordered = R() < 0.5;
  let ans = comb(n, k); if (ordered) for (let i = 2; i <= k; i++) ans *= i;
  return num('Комбинаторика', md`${ordered ? `Сколькими способами можно выбрать ${k} товаров из ${n} для мест 1–${k} на витрине (порядок важен)?` : `Сколькими способами можно выбрать ${k} товаров из ${n} для подборки (порядок не важен)?`}`, ans, 0, md`${ordered ? 'Размещения' : 'Сочетания'}: ${ans}`);
}));
ST.push(V('st-ev', 10, (R) => {
  const vals = sample(R, [0, 100, 250, 500, 1000, 2000, 5000], 3).sort((a, b) => a - b); const ps = [int(R, 3, 6), int(R, 2, 3), 1]; const s = ps.reduce((a, b) => a + b); const pr = ps.map((x) => x / s);
  const ev = vals.reduce((a, v, i) => a + v * pr[i], 0), ev2 = vals.reduce((a, v, i) => a + v * v * pr[i], 0), sdv = Math.sqrt(ev2 - ev * ev); const askSd = R() < 0.4;
  return num(askSd ? 'Стандартное отклонение' : 'Математическое ожидание', md`Выигрыш в акции: ${vals.map((v, i) => `${v} ₽ с вероятностью ${ps[i]}/${s}`).join(', ')}. Найдите ${askSd ? 'стандартное отклонение' : 'математическое ожидание'} выигрыша. 2 знака.`, r(askSd ? sdv : ev, 2), 0.011 / Math.max(1, askSd ? sdv : ev), md`E = ${r(ev, 2)}, E[X²] = ${r(ev2, 2)}, σ = ${r(sdv, 2)}`);
}));
ST.push(V('st-fwer', 10, (R) => {
  const m = int(R, 2, 30), a = pick(R, [0.01, 0.05, 0.1]); const ans = 1 - (1 - a) ** m;
  return num('Множественные проверки', md`Проверяют ${m} независимых гипотез, каждую на уровне α = ${a}, реальных эффектов нет. Вероятность хотя бы одного ложного «открытия»? 3 знака.`, r(ans, 3), 0.0011, md`1 − (1 − ${a})^${m} ≈ ${r(ans, 3)}`);
}));
ST.push(V('st-se', 10, (R) => {
  const prop = R() < 0.5;
  if (prop) { const p = pick(R, [0.05, 0.1, 0.2, 0.3, 0.5]), n = int(R, 1, 50) * 200; const se = Math.sqrt(p * (1 - p) / n); return num('Стандартная ошибка доли', md`Конверсия ${pf(p)} на выборке ${n}. Чему равна стандартная ошибка доли? 5 знаков.`, r(se, 5), 0.000011, md`√(p(1−p)/n) = ${r(se, 5)}`); }
  const s = int(R, 100, 3000), n = int(R, 2, 80) * 25; const se = s / Math.sqrt(n);
  return num('Стандартная ошибка среднего', md`Стандартное отклонение чека ${s} ₽, выборка ${n} чеков. Найдите стандартную ошибку среднего. 2 знака.`, r(se, 2), 0.011 / Math.max(1, se), md`s/√n = ${r(se, 2)}`);
}));
ST.push(V('st-welch', 10, (R) => {
  const n1 = int(R, 3, 30) * 100, n2 = int(R, 3, 30) * 100, m1 = int(R, 500, 1500), m2 = m1 + int(R, -60, 80), s1 = int(R, 300, 1200), s2 = int(R, 300, 1200);
  const t = (m2 - m1) / Math.sqrt(s1 * s1 / n1 + s2 * s2 / n2);
  return num('t-статистика Уэлча', md`Группа A: n = ${n1}, среднее ${m1}, sd = ${s1}. Группа B: n = ${n2}, среднее ${m2}, sd = ${s2}. Найдите t-статистику Уэлча (B − A). 3 знака.`, r(t, 3), 0.0011 / Math.max(1, Math.abs(t)), md`t = (${m2} − ${m1}) / √(${s1}²/${n1} + ${s2}²/${n2}) ≈ ${r(t, 3)}`);
}));
COURSE.add({ id: 'drstat', title: 'Тренажёр: теорвер, статистика, A/B', short: 'Расчётные задачи с меняющимися числами: распределения, Байес, ДИ, z- и t-тесты, размер выборки, MDE, множественные проверки.', lessons: [
  { title: 'Вероятности и распределения', theory: md`Числа в каждом варианте свои. Считайте на бумаге или в Python (‹scipy.stats›, ‹math›) и вводите ответ с нужной точностью. Дробную часть можно вводить через запятую.`, tasks: ST.slice(0, 6).flat().concat(ST[11], ST[12]) },
  { title: 'Оценки, интервалы, тесты', theory: md`Стандартные ошибки, доверительные интервалы, z-тест для конверсий, t-статистика Уэлча, множественные проверки.`, tasks: [ST[6], ST[7], ST[8], ST[13], ST[14], ST[15]].flat() },
  { title: 'Дизайн A/B-теста', theory: md`Размер выборки и MDE. Формулы — в модуле «A/B-тесты», урок «Мощность, MDE и размер выборки».`, tasks: [ST[9], ST[10]].flat() },
] });

/* =========================== ТРЕНАЖЁР: ПРОДУКТОВЫЕ МЕТРИКИ =========================== */
const PM = [];
PM.push(V('pm-arpu', 10, (R) => { const rev = int(R, 2, 90) * 10000, u = int(R, 5, 100) * 100, pay = Math.round(u * pick(R, [0.02, 0.04, 0.05, 0.08, 0.1])); const a = R() < 0.5; const ans = a ? rev / u : rev / pay;
  return num(a ? 'ARPU' : 'ARPPU', md`Выручка за месяц ${rev.toLocaleString('ru-RU')} ₽, активных пользователей ${u.toLocaleString('ru-RU')}, платящих ${pay}. Найдите ${a ? 'ARPU' : 'ARPPU'} (₽, 2 знака).`, r(ans, 2), 0.011 / Math.max(1, ans), md`${a ? 'выручка / активные' : 'выручка / платящие'} = ${r(ans, 2)}`); }));
PM.push(V('pm-ltv', 10, (R) => { const arpu = int(R, 5, 60) * 10, mg = pick(R, [0.2, 0.3, 0.4, 0.5]), ch = pick(R, [0.05, 0.08, 0.1, 0.2, 0.25]); const ans = arpu * mg / ch;
  return num('LTV', md`ARPU ${arpu} ₽/мес, маржинальность ${mg * 100}%, постоянный отток ${ch * 100}% в месяц. Оцените LTV (₽ валовой прибыли, 2 знака).`, r(ans, 2), 0.011 / Math.max(1, ans), md`${arpu}·${mg} / ${ch} = ${r(ans, 2)}`); }));
PM.push(V('pm-romi', 10, (R) => { const cost = int(R, 1, 50) * 20000, inc = Math.round(cost * pick(R, [0.6, 0.9, 1.2, 1.5, 2.1, 3])); const ans = (inc - cost) / cost;
  return num('ROMI', md`Расходы на кампанию ${cost.toLocaleString('ru-RU')} ₽, маржинальная прибыль от привлечённых клиентов ${inc.toLocaleString('ru-RU')} ₽. ROMI дробью (3 знака).`, r(ans, 3), 0.0011, md`(${inc} − ${cost}) / ${cost} = ${r(ans, 3)}`); }));
PM.push(V('pm-cac', 10, (R) => { const cost = int(R, 2, 40) * 25000, n = int(R, 20, 600), m = int(R, 50, 400); const cac = cost / n; const ans = cac / m;
  return num('CAC и окупаемость', md`На рекламу потратили ${cost.toLocaleString('ru-RU')} ₽ и привлекли ${n} клиентов. Клиент приносит ${m} ₽ маржинальной прибыли в месяц. За сколько месяцев окупается привлечение? 2 знака.`, r(ans, 2), 0.011 / Math.max(1, ans), md`CAC = ${r(cac, 2)} ₽, окупаемость = CAC / ${m} = ${r(ans, 2)} мес.`); }));
PM.push(V('pm-sticky', 10, (R) => { const mau = int(R, 10, 200) * 1000, dau = Math.round(mau * pick(R, [0.08, 0.12, 0.15, 0.2, 0.3, 0.45])); const ans = dau / mau;
  return num('Sticky factor', md`Средний DAU ${dau.toLocaleString('ru-RU')}, MAU ${mau.toLocaleString('ru-RU')}. Найдите sticky factor (3 знака).`, r(ans, 3), 0.0011, md`DAU/MAU = ${r(ans, 3)}`); }));
PM.push(V('pm-funnel', 10, (R) => { const s = [1, pick(R, [0.4, 0.5, 0.6, 0.7]), pick(R, [0.3, 0.4, 0.5]), pick(R, [0.5, 0.6, 0.7, 0.8])]; const n0 = int(R, 5, 50) * 1000; const ns = [n0]; for (let i = 1; i < 4; i++) ns.push(Math.round(ns[i - 1] * s[i])); const ask = int(R, 1, 3); const ans = ns[3] / ns[0]; const worst = [1, 2, 3].reduce((b, i) => (ns[i] / ns[i - 1] < ns[b] / ns[b - 1] ? i : b), 1);
  return ask === 1 ? num('Сквозная конверсия', md`Воронка: каталог ${ns[0]} → карточка ${ns[1]} → корзина ${ns[2]} → покупка ${ns[3]}. Найдите сквозную конверсию из каталога в покупку (4 знака).`, r(ans, 4), 0.00011, md`${ns[3]} / ${ns[0]} = ${r(ans, 4)}`)
    : num('Слабый шаг воронки', md`Воронка: каталог ${ns[0]} → карточка ${ns[1]} → корзина ${ns[2]} → покупка ${ns[3]}. Номер шага (1 — каталог→карточка, 2 — карточка→корзина, 3 — корзина→покупка) с наименьшей конверсией?`, worst, 0, md`Конверсии шагов: ${[1, 2, 3].map((i) => r(ns[i] / ns[i - 1], 3)).join(', ')}`); }));
PM.push(V('pm-lifetime', 10, (R) => { const ch = pick(R, [0.02, 0.04, 0.05, 0.08, 0.1, 0.125, 0.2]); const ans = 1 / ch;
  return num('Lifetime из оттока', md`Ежемесячный отток подписчиков постоянный и равен ${pf(ch * 100)}%. Средняя продолжительность жизни клиента в месяцах? 2 знака.`, r(ans, 2), 0.011 / Math.max(1, ans), md`1 / ${ch} = ${r(ans, 2)}`); }));
PM.push(V('pm-ret', 10, (R) => { const n = int(R, 5, 60) * 100, d = pick(R, [1, 7, 30]), k = Math.round(n * pick(R, [0.05, 0.12, 0.25, 0.4])); const ans = k / n;
  return num(`Retention D${d}`, md`В когорте ${n} новых пользователей, на ${d}-й день вернулись ${k}. Найдите retention D${d} (3 знака).`, r(ans, 3), 0.0011, md`${k} / ${n} = ${r(ans, 3)}`); }));
PM.push(V('pm-decomp', 10, (R) => { const a = pick(R, [-0.2, -0.1, -0.05, 0.05, 0.1, 0.2, 0.3]), b = pick(R, [-0.25, -0.15, -0.1, 0, 0.1, 0.15]), c = pick(R, [-0.1, -0.05, 0, 0.05, 0.08]); const ans = (1 + a) * (1 + b) * (1 + c) - 1; const sg = (x) => (x >= 0 ? '+' : '') + Math.round(x * 100) + '%';
  return num('Декомпозиция выручки', md`Выручка = Трафик × Конверсия × Средний чек. Трафик ${sg(a)}, конверсия ${sg(b)}, средний чек ${sg(c)}. Изменение выручки дробью (4 знака, падение — со знаком минус).`, r(ans, 4), 0.00011, md`(1${a >= 0 ? '+' : ''}${a})(1${b >= 0 ? '+' : ''}${b})(1${c >= 0 ? '+' : ''}${c}) − 1 = ${r(ans, 4)}`); }));
PM.push(V('pm-uplift', 10, (R) => { const a = pick(R, [0.04, 0.06, 0.08, 0.1, 0.12]), b = a + pick(R, [-0.005, 0.003, 0.005, 0.008, 0.012, 0.02]); const ans = (b - a) / a;
  return num('Относительный uplift', md`Конверсия контроля ${pf(r(a * 100, 2))}%, теста ${pf(r(b * 100, 2))}%. Относительный uplift дробью (4 знака).`, r(ans, 4), 0.00011, md`(${r(b, 4)} − ${a}) / ${a} = ${r(ans, 4)}`); }));
COURSE.add({ id: 'drprod', title: 'Тренажёр: продуктовые метрики', short: 'Сто расчётных задач на ARPU, LTV, ROMI, CAC, sticky, воронки, retention, декомпозицию и uplift.', lessons: [
  { title: 'Деньги и окупаемость', theory: md`Формулы — в модуле «Продуктовые метрики». Цифры в каждом варианте свои.`, tasks: [PM[0], PM[1], PM[2], PM[3], PM[6]].flat() },
  { title: 'Аудитория, воронки, эффекты', theory: md`Sticky, воронки, retention, декомпозиция изменений и uplift.`, tasks: [PM[4], PM[5], PM[7], PM[8], PM[9]].flat() },
] });
})();
