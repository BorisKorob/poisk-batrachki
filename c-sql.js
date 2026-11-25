/* =========================== МОДУЛЬ 4. SQL: ОСНОВЫ =========================== */
COURSE.add({
  id: 'sql', title: 'SQL: основы', short: 'SELECT, WHERE, CASE, агрегаты, GROUP BY, HAVING, JOIN и логика NULL.',
  lessons: [
    {
      title: 'SELECT, WHERE, ORDER BY, CASE',
      theory: md`
SQL — язык запросов к реляционным базам. В вакансиях его требуют почти всегда, а на собеседовании дают живое задание. В курсе запросы выполняются в **SQLite**; на работе вы чаще встретите PostgreSQL, ClickHouse, Greenplum или BigQuery. Базовый синтаксис везде одинаков, различаются в основном функции дат и строк.

## Анатомия запроса
~~~sql
SELECT user_id, city, age          -- какие столбцы
FROM users                          -- из какой таблицы
WHERE city = 'Казань' AND age > 40  -- фильтр строк
ORDER BY age DESC, user_id          -- сортировка
LIMIT 10;                           -- сколько строк вернуть
~~~
**Порядок выполнения** отличается от порядка записи, и это объясняет многие ошибки:

| Шаг | Что происходит |
|---|---|
| 1. FROM / JOIN | собирается исходная таблица |
| 2. WHERE | фильтруются строки |
| 3. GROUP BY | строки группируются |
| 4. HAVING | фильтруются группы |
| 5. SELECT | вычисляются выражения и алиасы, затем оконные функции |
| 6. DISTINCT | убираются дубликаты |
| 7. ORDER BY | сортировка (здесь алиасы уже доступны) |
| 8. LIMIT / OFFSET | отсечение |

Поэтому алиас из SELECT нельзя использовать в WHERE того же запроса, а в ORDER BY можно.

## Фильтры
~~~sql
WHERE status = 'delivered'
WHERE amount BETWEEN 500 AND 1500          -- включительно с обеих сторон
WHERE city IN ('Москва', 'Казань')
WHERE name LIKE 'Сок%'                      -- % — любая строка, _ — один символ
WHERE order_date >= '2025-07-01' AND order_date < '2025-08-01'
WHERE promo = 1 AND NOT (amount < 300)
~~~
У AND приоритет выше, чем у OR. Всегда ставьте скобки: ‹WHERE (a OR b) AND c›.

## DISTINCT и вычисляемые столбцы
~~~sql
SELECT DISTINCT channel FROM users;
SELECT order_id, amount, amount * 0.2 AS vat, ROUND(amount / 1000.0, 1) AS amount_k FROM orders;
~~~

> **Целочисленное деление.** В SQLite и PostgreSQL ‹5 / 2 = 2›. Чтобы получить дробь, умножьте на ‹1.0› или приведите тип: ‹1.0 * a / b›, ‹a::float / b› (PostgreSQL).

## CASE — условная логика
~~~sql
SELECT order_id, amount,
       CASE
           WHEN amount < 500  THEN 'small'
           WHEN amount < 1500 THEN 'medium'
           ELSE 'large'
       END AS segment
FROM orders;
~~~
Условия проверяются сверху вниз до первого совпадения. Без ELSE несовпавшие строки получают NULL.
`,
      tasks: [
        {
          type: 'sql', ordered: true, title: 'Казань, 40+',
          text: md`Выведите ‹user_id›, ‹city›, ‹age› пользователей из Казани старше 40 лет. Отсортируйте по возрасту по убыванию, при равном возрасте — по ‹user_id› по возрастанию.`,
          solution: md`SELECT user_id, city, age
FROM users
WHERE city = 'Казань' AND age > 40
ORDER BY age DESC, user_id;`,
        },
        {
          type: 'sql', ordered: true, title: 'Каналы привлечения',
          text: md`Выведите список уникальных каналов привлечения (‹channel›) в алфавитном порядке.`,
          solution: md`SELECT DISTINCT channel FROM users ORDER BY channel;`,
        },
        {
          type: 'sql', ordered: true, title: 'Сегменты заказов',
          text: md`Для первых 15 заказов по ‹order_id› выведите ‹order_id›, ‹amount› и ‹segment›: ‹'small'›, если сумма меньше 500, ‹'medium'› — меньше 1500, иначе ‹'large'›.`,
          solution: md`SELECT order_id, amount,
       CASE WHEN amount < 500 THEN 'small'
            WHEN amount < 1500 THEN 'medium'
            ELSE 'large' END AS segment
FROM orders
ORDER BY order_id
LIMIT 15;`,
        },
        {
          type: 'sql', ordered: true, title: 'Дешёвая молочка и выпечка',
          text: md`Выведите ‹name›, ‹category›, ‹price› товаров из категорий «Молочка» и «Выпечка» дешевле 100 ₽. Сортировка по цене, при равной цене — по названию.`,
          solution: md`SELECT name, category, price
FROM products
WHERE category IN ('Молочка', 'Выпечка') AND price < 100
ORDER BY price, name;`,
        },
      ],
    },
    {
      title: 'Агрегаты, GROUP BY и HAVING',
      theory: md`
## Агрегатные функции
‹COUNT›, ‹SUM›, ‹AVG›, ‹MIN›, ‹MAX› сворачивают набор строк в одно значение.
~~~sql
SELECT COUNT(*)                 AS orders_cnt,      -- все строки
       COUNT(DISTINCT user_id)  AS buyers,          -- уникальные
       SUM(amount)              AS revenue,
       ROUND(AVG(amount), 2)    AS avg_check
FROM orders
WHERE status = 'delivered';
~~~
‹COUNT(столбец)› не считает NULL, ‹COUNT(*)› считает все строки. ‹AVG› тоже игнорирует NULL.

## GROUP BY
~~~sql
SELECT city, COUNT(*) AS users_cnt
FROM users
GROUP BY city
ORDER BY users_cnt DESC;
~~~
Правило: в SELECT могут быть только столбцы из GROUP BY и агрегаты. SQLite прощает нарушение и молча вернёт значение из случайной строки, PostgreSQL выдаст ошибку.

## HAVING — фильтр по группам
~~~sql
SELECT user_id, COUNT(*) AS orders_cnt
FROM orders
WHERE status = 'delivered'     -- фильтр строк ДО группировки
GROUP BY user_id
HAVING COUNT(*) >= 5           -- фильтр групп ПОСЛЕ
ORDER BY orders_cnt DESC;
~~~

## Условная агрегация
Один из самых полезных приёмов: посчитать несколько метрик за один проход.
~~~sql
SELECT strftime('%Y-%m', order_date) AS month,
       COUNT(*) AS orders_cnt,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END) AS cancel_rate,
       SUM(CASE WHEN promo = 1 THEN amount END) AS promo_revenue
FROM orders
GROUP BY month
ORDER BY month;
~~~
В PostgreSQL то же записывают короче: ‹COUNT(*) FILTER (WHERE status = 'cancelled')›.

## Даты в SQLite и PostgreSQL
| Задача | SQLite | PostgreSQL |
|---|---|---|
| месяц | ‹strftime('%Y-%m', d)› | ‹DATE_TRUNC('month', d)› |
| день недели | ‹strftime('%w', d)› (0 — вс) | ‹EXTRACT(DOW FROM d)› |
| +7 дней | ‹date(d, '+7 day')› | ‹d + INTERVAL '7 day'› |
| разница в днях | ‹julianday(a) - julianday(b)› | ‹a::date - b::date› |
`,
      tasks: [
        {
          type: 'sql', ordered: true, title: 'Пользователи по городам',
          text: md`Посчитайте число пользователей в каждом городе. Столбцы: ‹city›, ‹users_cnt›. Сортировка по убыванию числа пользователей.`,
          solution: md`SELECT city, COUNT(*) AS users_cnt
FROM users
GROUP BY city
ORDER BY users_cnt DESC;`,
        },
        {
          type: 'sql', ordered: true, title: 'Промо и средний чек',
          text: md`Для доставленных заказов посчитайте по признаку ‹promo›: число заказов и средний чек, округлённый до 2 знаков. Столбцы: ‹promo›, ‹orders_cnt›, ‹avg_check›, сортировка по ‹promo›.`,
          solution: md`SELECT promo, COUNT(*) AS orders_cnt, ROUND(AVG(amount), 2) AS avg_check
FROM orders
WHERE status = 'delivered'
GROUP BY promo
ORDER BY promo;`,
        },
        {
          type: 'sql', ordered: true, title: 'Лояльные клиенты',
          text: md`Найдите пользователей, у которых не меньше 5 доставленных заказов. Столбцы: ‹user_id›, ‹orders_cnt›. Сортировка: по убыванию числа заказов, затем по ‹user_id›.`,
          solution: md`SELECT user_id, COUNT(*) AS orders_cnt
FROM orders
WHERE status = 'delivered'
GROUP BY user_id
HAVING COUNT(*) >= 5
ORDER BY orders_cnt DESC, user_id;`,
        },
        {
          type: 'sql', ordered: true, title: 'Доля отмен по месяцам',
          text: md`Для каждого месяца (формат ‹2025-01›) выведите число заказов и долю отменённых заказов, округлённую до 3 знаков. Столбцы: ‹month›, ‹orders_cnt›, ‹cancel_rate›. Сортировка по месяцу.`,
          solution: md`SELECT strftime('%Y-%m', order_date) AS month,
       COUNT(*) AS orders_cnt,
       ROUND(AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END), 3) AS cancel_rate
FROM orders
GROUP BY month
ORDER BY month;`,
          hint: md`Доля = среднее от индикатора: ‹AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END)›.`,
        },
      ],
    },
    {
      title: 'JOIN и NULL',
      theory: md`
## Виды соединений
| JOIN | Что вернёт |
|---|---|
| ‹INNER JOIN› | только строки с совпадением в обеих таблицах |
| ‹LEFT JOIN› | все строки левой таблицы; где совпадения нет — NULL справа |
| ‹RIGHT JOIN› | зеркально LEFT (на практике почти не используют) |
| ‹FULL JOIN› | все строки обеих таблиц |
| ‹CROSS JOIN› | все комбинации (декартово произведение) |

~~~sql
SELECT u.city, SUM(o.amount) AS revenue
FROM orders AS o
JOIN users AS u ON u.user_id = o.user_id
WHERE o.status = 'delivered'
GROUP BY u.city
ORDER BY revenue DESC;
~~~

## Антиджойн: «у кого нет»
~~~sql
SELECT u.user_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;          -- пользователи без заказов
-- то же через NOT EXISTS:
SELECT user_id FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);
~~~

> **Ловушка LEFT JOIN + WHERE.** Условие на правую таблицу в WHERE превращает LEFT JOIN в INNER: строки с NULL отфильтруются. Если нужно сохранить все строки слева, переносите условие в ON: ‹LEFT JOIN orders o ON o.user_id = u.user_id AND o.status = 'delivered'›.

> **Размножение строк.** Если ключ справа не уникален, каждая строка слева повторится столько раз, сколько совпадений. Перед JOIN спросите себя: «один к одному или один ко многим?». Суммы после такого JOIN легко задвоить.

## NULL — трёхзначная логика
- ‹NULL = NULL› даёт не TRUE, а NULL. Проверяйте ‹IS NULL› / ‹IS NOT NULL›.
- ‹NOT IN (подзапрос)› вернёт пустоту, если в подзапросе есть NULL. Безопаснее ‹NOT EXISTS›.
- Любая арифметика с NULL даёт NULL: ‹5 + NULL = NULL›.
- ‹COALESCE(x, 0)› подставляет значение вместо NULL.
`,
      tasks: [
        {
          type: 'sql', ordered: true, title: 'Выручка по городам',
          text: md`Посчитайте выручку доставленных заказов по городам. Столбцы: ‹city›, ‹revenue› (округлите до 2 знаков). Сортировка по убыванию выручки.`,
          solution: md`SELECT u.city, ROUND(SUM(o.amount), 2) AS revenue
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'delivered'
GROUP BY u.city
ORDER BY revenue DESC;`,
        },
        {
          type: 'sql', title: 'Без единого заказа',
          text: md`Сколько пользователей не сделали ни одного заказа (любого статуса)? Верните одно число.`,
          solution: md`SELECT COUNT(*) AS no_orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;`,
        },
        {
          type: 'sql', ordered: true, title: 'Выручка по категориям',
          text: md`Посчитайте выручку по категориям товаров для **доставленных** заказов как сумму ‹quantity * price› из ‹order_items›. Столбцы: ‹category›, ‹revenue› (2 знака). Сортировка по убыванию.`,
          solution: md`SELECT p.category, ROUND(SUM(oi.quantity * oi.price), 2) AS revenue
FROM order_items oi
JOIN orders o   ON o.order_id = oi.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'delivered'
GROUP BY p.category
ORDER BY revenue DESC;`,
        },
        {
          type: 'sql', ordered: true, title: 'Топ-5 товаров',
          text: md`Найдите 5 товаров, проданных в наибольшем количестве штук (только доставленные заказы). Столбцы: ‹name›, ‹qty_sold›. Сортировка по убыванию количества, при равенстве — по названию.`,
          solution: md`SELECT p.name, SUM(oi.quantity) AS qty_sold
FROM order_items oi
JOIN orders o   ON o.order_id = oi.order_id AND o.status = 'delivered'
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.name
ORDER BY qty_sold DESC, p.name
LIMIT 5;`,
        },
        {
          type: 'choice', title: 'Ловушка LEFT JOIN',
          text: md`Запрос должен вернуть **всех** пользователей и число их доставленных заказов (0, если заказов нет):
~~~sql
SELECT u.user_id, COUNT(o.order_id) AS cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.status = 'delivered'
GROUP BY u.user_id;
~~~
Что с ним не так?`,
          options: [
            'Всё правильно',
            'Условие в WHERE отбрасывает пользователей без доставленных заказов; его нужно перенести в ON',
            'Нужно COUNT(*) вместо COUNT(o.order_id)',
            'LEFT JOIN нужно заменить на INNER JOIN',
          ],
          answer: [1],
          explain: md`Для пользователей без заказов ‹o.status› равен NULL, и ‹WHERE o.status = 'delivered'› их отфильтрует. Правильно: ‹LEFT JOIN orders o ON o.user_id = u.user_id AND o.status = 'delivered'›. И ‹COUNT(o.order_id)› здесь как раз нужен: он даст 0, а ‹COUNT(*)› дал бы 1.`,
        },
      ],
    },
  ],
});

/* =========================== МОДУЛЬ 5. SQL: ПРОДВИНУТЫЙ =========================== */
COURSE.add({
  id: 'sql2', title: 'SQL: продвинутый', short: 'Подзапросы, CTE, оконные функции, нарастающие итоги, DAU/MAU и retention на SQL.',
  lessons: [
    {
      title: 'Подзапросы и CTE',
      theory: md`
## Подзапросы
Подзапрос — запрос внутри запроса. Бывает скалярным (одно значение), табличным (во FROM) и коррелированным (ссылается на внешний запрос).
~~~sql
-- скалярный: заказы дороже среднего
SELECT order_id, amount FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);

-- в IN: пользователи, покупавшие кофе
SELECT DISTINCT o.user_id FROM orders o
WHERE o.order_id IN (SELECT order_id FROM order_items WHERE product_id = 25);

-- коррелированный: последний заказ каждого пользователя
SELECT * FROM orders o
WHERE order_date = (SELECT MAX(order_date) FROM orders o2 WHERE o2.user_id = o.user_id);
~~~

## CTE (WITH)
Общие табличные выражения делают сложный запрос читаемым: вы называете промежуточные шаги и собираете из них результат. На собеседованиях решения через CTE ценят выше, чем «матрёшку» подзапросов.
~~~sql
WITH buyers AS (
    SELECT DISTINCT user_id
    FROM orders
    WHERE status = 'delivered'
),
by_channel AS (
    SELECT u.channel,
           COUNT(*) AS users_cnt,
           COUNT(b.user_id) AS buyers_cnt
    FROM users u
    LEFT JOIN buyers b ON b.user_id = u.user_id
    GROUP BY u.channel
)
SELECT channel, users_cnt, buyers_cnt,
       ROUND(1.0 * buyers_cnt / users_cnt, 3) AS cr
FROM by_channel
ORDER BY cr DESC;
~~~

### Как решать сложную задачу
1. Определите **зерно** результата: одна строка — это что? (пользователь, день, город × месяц).
2. Разбейте на шаги, каждый шаг — отдельный CTE.
3. Проверяйте промежуточные результаты: ‹SELECT * FROM step1 LIMIT 10›.
4. Сверяйте итоговые числа с простыми контрольными запросами (общее количество, общая сумма).

## UNION
~~~sql
SELECT user_id FROM a
UNION          -- без дубликатов (дороже)
SELECT user_id FROM b;
-- UNION ALL — с дубликатами, быстрее
~~~
`,
      tasks: [
        {
          type: 'sql', title: 'Чек выше среднего',
          text: md`Сколько пользователей имеют средний чек доставленных заказов выше, чем средний чек по всем доставленным заказам? Верните одно число.`,
          solution: md`WITH u AS (
    SELECT user_id, AVG(amount) AS avg_check
    FROM orders
    WHERE status = 'delivered'
    GROUP BY user_id
)
SELECT COUNT(*) AS users_cnt
FROM u
WHERE avg_check > (SELECT AVG(amount) FROM orders WHERE status = 'delivered');`,
        },
        {
          type: 'sql', ordered: true, title: 'Конверсия каналов',
          text: md`Для каждого канала посчитайте: ‹users_cnt› — число пользователей, ‹buyers_cnt› — сколько из них сделали хотя бы один доставленный заказ, ‹cr› — их долю (3 знака). Сортировка по ‹channel›.`,
          solution: md`WITH buyers AS (
    SELECT DISTINCT user_id FROM orders WHERE status = 'delivered'
)
SELECT u.channel,
       COUNT(*) AS users_cnt,
       COUNT(b.user_id) AS buyers_cnt,
       ROUND(1.0 * COUNT(b.user_id) / COUNT(*), 3) AS cr
FROM users u
LEFT JOIN buyers b ON b.user_id = u.user_id
GROUP BY u.channel
ORDER BY u.channel;`,
          hint: md`Сначала в CTE получите уникальных покупателей, потом LEFT JOIN к пользователям. ‹COUNT(b.user_id)› посчитает только совпавших.`,
        },
        {
          type: 'sql', title: 'Лучший месяц',
          text: md`Найдите месяц с максимальной выручкой доставленных заказов. Одна строка, столбцы ‹month› (формат ‹2025-07›) и ‹revenue› (2 знака).`,
          solution: md`SELECT strftime('%Y-%m', order_date) AS month, ROUND(SUM(amount), 2) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY month
ORDER BY revenue DESC
LIMIT 1;`,
        },
      ],
    },
    {
      title: 'Оконные функции: ранжирование',
      theory: md`
Оконные функции считают значение для каждой строки по «окну» связанных строк и, в отличие от GROUP BY, **не схлопывают** строки. Это самая частая тема на SQL-собеседованиях.

~~~sql
функция() OVER (
    PARTITION BY ...   -- на какие группы делить (как GROUP BY)
    ORDER BY ...       -- порядок внутри группы
    ROWS BETWEEN ...   -- рамка окна (для накопительных и скользящих)
)
~~~

## Ранжирующие функции
| Функция | Значения для сумм 900, 900, 700 |
|---|---|
| ‹ROW_NUMBER()› | 1, 2, 3 — всегда уникальный номер |
| ‹RANK()› | 1, 1, 3 — пропуск после повторов |
| ‹DENSE_RANK()› | 1, 1, 2 — без пропусков |
| ‹NTILE(4)› | номер квартиля |

~~~sql
SELECT user_id, order_id, amount,
       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date, order_id) AS order_num
FROM orders;
~~~

## Топ-N в каждой группе
Классическая задача: окно нельзя использовать в WHERE того же запроса (оно вычисляется после WHERE), поэтому оборачиваем в CTE.
~~~sql
WITH ranked AS (
    SELECT u.city, o.order_id, o.amount,
           ROW_NUMBER() OVER (PARTITION BY u.city ORDER BY o.amount DESC, o.order_id) AS rn
    FROM orders o JOIN users u ON u.user_id = o.user_id
)
SELECT * FROM ranked WHERE rn <= 3;
~~~

## Агрегаты как окна
~~~sql
SELECT order_id, user_id, amount,
       SUM(amount) OVER (PARTITION BY user_id)           AS user_total,
       amount / SUM(amount) OVER (PARTITION BY user_id)  AS share,
       AVG(amount) OVER ()                               AS global_avg
FROM orders;
~~~
Пустое ‹OVER ()› означает окно из всей таблицы.

## FIRST_VALUE, LAST_VALUE
~~~sql
FIRST_VALUE(order_date) OVER (PARTITION BY user_id ORDER BY order_date) AS first_order
~~~
> **Ловушка LAST_VALUE.** При наличии ORDER BY рамка по умолчанию заканчивается текущей строкой, и ‹LAST_VALUE› вернёт текущее значение. Нужна явная рамка ‹ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING› или ‹FIRST_VALUE› с обратной сортировкой.
`,
      tasks: [
        {
          type: 'sql', ordered: true, title: 'Топ-3 заказа в каждом городе',
          text: md`Для каждого города найдите 3 самых крупных **доставленных** заказа. При равной сумме выше заказ с меньшим ‹order_id›. Столбцы: ‹city›, ‹order_id›, ‹amount›, ‹rn› (1–3). Сортировка: по городу, затем по ‹rn›.`,
          solution: md`WITH ranked AS (
    SELECT u.city, o.order_id, o.amount,
           ROW_NUMBER() OVER (PARTITION BY u.city ORDER BY o.amount DESC, o.order_id) AS rn
    FROM orders o
    JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'delivered'
)
SELECT city, order_id, amount, rn
FROM ranked
WHERE rn <= 3
ORDER BY city, rn;`,
        },
        {
          type: 'sql', title: 'Первый заказ',
          text: md`Для каждого пользователя, у которого есть заказы, выведите его первый заказ (любой статус): самая ранняя дата, при равенстве — меньший ‹order_id›. Столбцы: ‹user_id›, ‹order_id›, ‹order_date›, ‹amount›.`,
          solution: md`WITH r AS (
    SELECT user_id, order_id, order_date, amount,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date, order_id) AS rn
    FROM orders
)
SELECT user_id, order_id, order_date, amount FROM r WHERE rn = 1;`,
        },
        {
          type: 'sql', title: 'Ранг цены в категории',
          text: md`Для каждого товара выведите ‹category›, ‹name›, ‹price› и ‹price_rank› — место по цене внутри своей категории (самый дорогой — 1, одинаковые цены — одно место, без пропусков).`,
          solution: md`SELECT category, name, price,
       DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS price_rank
FROM products;`,
        },
        {
          type: 'choice', title: 'RANK или DENSE_RANK',
          text: md`Суммы заказов пользователя: 1500, 1500, 1200, 900. Какие значения вернёт ‹RANK() OVER (ORDER BY amount DESC)›?`,
          options: ['1, 2, 3, 4', '1, 1, 2, 3', '1, 1, 3, 4', '1, 1, 3, 3'],
          answer: [2],
          explain: md`RANK даёт одинаковым значениям один ранг и пропускает следующие номера: 1, 1, 3, 4. DENSE_RANK дал бы 1, 1, 2, 3, а ROW_NUMBER — 1, 2, 3, 4.`,
        },
      ],
    },
    {
      title: 'LAG, LEAD, нарастающие и скользящие',
      theory: md`
## Смещения: LAG и LEAD
‹LAG(x, n)› — значение из строки на n позиций раньше внутри окна, ‹LEAD› — позже.
~~~sql
SELECT user_id, order_id, order_date,
       LAG(order_date) OVER (PARTITION BY user_id ORDER BY order_date, order_id) AS prev_date,
       julianday(order_date)
         - julianday(LAG(order_date) OVER (PARTITION BY user_id ORDER BY order_date, order_id)) AS days_since_prev
FROM orders;
~~~
Типичные применения: интервал между покупками, изменение метрики день к дню, поиск сессий.

## Нарастающий итог
~~~sql
WITH daily AS (
    SELECT order_date, SUM(amount) AS revenue
    FROM orders WHERE status = 'delivered'
    GROUP BY order_date
)
SELECT order_date, revenue,
       SUM(revenue) OVER (ORDER BY order_date) AS cum_revenue
FROM daily;
~~~

## Рамка окна
‹ROWS BETWEEN 6 PRECEDING AND CURRENT ROW› — текущая строка и 6 предыдущих, то есть скользящее окно на 7 строк.
~~~sql
AVG(dau) OVER (ORDER BY event_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS dau_ma7
~~~
- ‹ROWS› считает физические строки; если в данных пропущен день, окно растянется на 8 календарных дней.
- ‹RANGE› работает по значениям ключа сортировки (в PostgreSQL можно ‹RANGE BETWEEN INTERVAL '6 day' PRECEDING AND CURRENT ROW›).
- Рамка по умолчанию при наличии ORDER BY: ‹RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW›, поэтому ‹SUM() OVER (ORDER BY …)› и даёт нарастающий итог.

> **Фильтр после окна.** Если нужна скользящая средняя только за июль, сначала посчитайте окно по всем дням, а затем отфильтруйте во внешнем запросе. Иначе первые дни июля посчитаются по неполному окну.

## Задача «дни подряд» (gaps and islands)
Пользователи, заходившие N дней подряд: если вычесть из даты номер строки, у последовательных дат получится одна и та же «опорная» дата.
~~~sql
WITH d AS (
    SELECT user_id, event_date,
           julianday(event_date) - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date) AS grp
    FROM events WHERE event = 'app_open'
)
SELECT user_id, MIN(event_date) AS start_date, COUNT(*) AS streak
FROM d GROUP BY user_id, grp
HAVING COUNT(*) >= 3;
~~~
`,
      tasks: [
        {
          type: 'sql', ordered: true, title: 'Нарастающая выручка',
          text: md`Посчитайте дневную выручку доставленных заказов и нарастающий итог. Столбцы: ‹order_date›, ‹revenue›, ‹cum_revenue› (оба округлите до 2 знаков). Сортировка по дате.`,
          solution: md`WITH daily AS (
    SELECT order_date, SUM(amount) AS revenue
    FROM orders
    WHERE status = 'delivered'
    GROUP BY order_date
)
SELECT order_date, ROUND(revenue, 2) AS revenue,
       ROUND(SUM(revenue) OVER (ORDER BY order_date), 2) AS cum_revenue
FROM daily
ORDER BY order_date;`,
        },
        {
          type: 'sql', title: 'Интервал между заказами',
          text: md`Посчитайте средний интервал в днях между последовательными заказами одного пользователя (все статусы; порядок — по дате, затем по ‹order_id›). Первый заказ пользователя в расчёт не входит. Одно число, 2 знака.`,
          solution: md`WITH x AS (
    SELECT julianday(order_date)
           - julianday(LAG(order_date) OVER (PARTITION BY user_id ORDER BY order_date, order_id)) AS gap
    FROM orders
)
SELECT ROUND(AVG(gap), 2) AS avg_gap FROM x WHERE gap IS NOT NULL;`,
        },
        {
          type: 'sql', ordered: true, title: 'Скользящий DAU',
          text: md`Посчитайте DAU — число уникальных пользователей с событием ‹app_open› за день — и его скользящее среднее за 7 дней (текущий день и 6 предыдущих строк). Выведите только даты июля 2025. Столбцы: ‹event_date›, ‹dau›, ‹dau_ma7› (2 знака). Сортировка по дате.`,
          solution: md`WITH d AS (
    SELECT event_date, COUNT(DISTINCT user_id) AS dau
    FROM events
    WHERE event = 'app_open'
    GROUP BY event_date
), m AS (
    SELECT event_date, dau,
           ROUND(AVG(dau) OVER (ORDER BY event_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS dau_ma7
    FROM d
)
SELECT * FROM m
WHERE event_date >= '2025-07-01'
ORDER BY event_date;`,
          hint: md`Окно считайте по всем дням в CTE, а фильтр по июлю ставьте во внешнем запросе.`,
        },
        {
          type: 'sql', title: 'Три дня подряд',
          text: md`Сколько пользователей хотя бы раз открывали приложение (‹app_open›) **3 и более дней подряд**? Верните одно число.`,
          solution: md`WITH d AS (
    SELECT user_id,
           julianday(event_date) - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date) AS grp
    FROM events
    WHERE event = 'app_open'
), s AS (
    SELECT user_id, grp, COUNT(*) AS streak
    FROM d
    GROUP BY user_id, grp
)
SELECT COUNT(DISTINCT user_id) AS users_cnt FROM s WHERE streak >= 3;`,
          hint: md`Приём «дата минус номер строки»: у дней, идущих подряд, разность одинакова. Событие ‹app_open› у пользователя бывает не чаще раза в день.`,
        },
      ],
    },
    {
      title: 'Продуктовые метрики на SQL',
      theory: md`
Самые частые продуктовые запросы на собеседованиях: DAU/MAU, retention, воронка, когорты. Разберём шаблоны.

## DAU, MAU и sticky factor
~~~sql
WITH daily AS (
    SELECT event_date, COUNT(DISTINCT user_id) AS dau
    FROM events
    WHERE event = 'app_open' AND event_date BETWEEN '2025-07-01' AND '2025-07-31'
    GROUP BY event_date
)
SELECT AVG(dau) AS avg_dau,
       (SELECT COUNT(DISTINCT user_id) FROM events
        WHERE event = 'app_open' AND event_date BETWEEN '2025-07-01' AND '2025-07-31') AS mau
FROM daily;
~~~
Sticky factor = DAU / MAU: какую долю месячной аудитории вы видите в среднем за день.

## Retention N-го дня
Доля пользователей когорты, вернувшихся **ровно** на N-й день после первого визита (или регистрации).
~~~sql
SELECT strftime('%Y-%m', u.reg_date) AS cohort,
       COUNT(*) AS users_cnt,
       ROUND(AVG(CASE WHEN e.user_id IS NOT NULL THEN 1.0 ELSE 0 END), 3) AS ret_d7
FROM users u
LEFT JOIN events e
       ON e.user_id = u.user_id
      AND e.event = 'app_open'
      AND e.event_date = date(u.reg_date, '+7 day')
GROUP BY cohort
ORDER BY cohort;
~~~
Варианты определения: «ровно на N-й день» (classic), «на N-й день или позже» (rolling / unbounded), «в течение N-й недели». На собеседовании уточняйте, какое имеется в виду.

> **Неполные когорты.** Если когорта зарегистрировалась 28 июля, а данные заканчиваются 31 июля, её retention 7-го дня ещё неизвестен. Такие когорты исключают или помечают.

## Воронка
~~~sql
SELECT COUNT(DISTINCT CASE WHEN event = 'app_open'    THEN user_id END) AS opened,
       COUNT(DISTINCT CASE WHEN event = 'add_to_cart' THEN user_id END) AS carted,
       COUNT(DISTINCT CASE WHEN event = 'purchase'    THEN user_id END) AS purchased
FROM events;
~~~
Конверсия шага = следующий шаг / предыдущий. Строгая воронка требует, чтобы шаги шли в правильном порядке по времени: тогда сравнивают времена событий одного пользователя.

## Когортная таблица
Строка — месяц регистрации, столбец — номер месяца жизни, значение — доля активных. Номер месяца в SQLite:
~~~sql
(CAST(strftime('%Y', e.event_date) AS INT) - CAST(strftime('%Y', u.reg_date) AS INT)) * 12
 + CAST(strftime('%m', e.event_date) AS INT) - CAST(strftime('%m', u.reg_date) AS INT) AS month_n
~~~
`,
      tasks: [
        {
          type: 'sql', title: 'DAU, MAU, sticky за июль',
          text: md`Для июля 2025 посчитайте средний DAU (по событиям ‹app_open›), MAU (уникальные пользователи с ‹app_open› за июль) и sticky = средний DAU / MAU. Одна строка: ‹avg_dau› (2 знака), ‹mau›, ‹sticky› (3 знака).`,
          solution: md`WITH ev AS (
    SELECT user_id, event_date FROM events
    WHERE event = 'app_open' AND event_date BETWEEN '2025-07-01' AND '2025-07-31'
), daily AS (
    SELECT event_date, COUNT(DISTINCT user_id) AS dau FROM ev GROUP BY event_date
)
SELECT ROUND(AVG(dau), 2) AS avg_dau,
       (SELECT COUNT(DISTINCT user_id) FROM ev) AS mau,
       ROUND(AVG(dau) / (SELECT COUNT(DISTINCT user_id) FROM ev), 3) AS sticky
FROM daily;`,
        },
        {
          type: 'sql', ordered: true, title: 'Retention 7-го дня по когортам',
          text: md`Для когорт по месяцу регистрации (январь–июнь) посчитайте размер когорты и retention 7-го дня: долю пользователей, у которых есть ‹app_open› ровно через 7 дней после ‹reg_date›. Столбцы: ‹cohort› (‹2025-01›), ‹users_cnt›, ‹ret_d7› (3 знака). Сортировка по когорте.`,
          solution: md`SELECT strftime('%Y-%m', u.reg_date) AS cohort,
       COUNT(*) AS users_cnt,
       ROUND(AVG(CASE WHEN e.user_id IS NOT NULL THEN 1.0 ELSE 0 END), 3) AS ret_d7
FROM users u
LEFT JOIN events e
       ON e.user_id = u.user_id
      AND e.event = 'app_open'
      AND e.event_date = date(u.reg_date, '+7 day')
WHERE u.reg_date < '2025-07-01'
GROUP BY cohort
ORDER BY cohort;`,
        },
        {
          type: 'sql', title: 'Воронка событий',
          text: md`Посчитайте воронку за всё время: число уникальных пользователей с ‹app_open›, с ‹add_to_cart›, с ‹purchase›, а также конверсию из открытия в покупку (3 знака). Одна строка: ‹opened›, ‹carted›, ‹purchased›, ‹cr_total›.`,
          solution: md`WITH f AS (
    SELECT COUNT(DISTINCT CASE WHEN event = 'app_open'    THEN user_id END) AS opened,
           COUNT(DISTINCT CASE WHEN event = 'add_to_cart' THEN user_id END) AS carted,
           COUNT(DISTINCT CASE WHEN event = 'purchase'    THEN user_id END) AS purchased
    FROM events
)
SELECT opened, carted, purchased, ROUND(1.0 * purchased / opened, 3) AS cr_total FROM f;`,
        },
        {
          type: 'sql', ordered: true, title: 'Когортная таблица',
          text: md`Постройте когортную таблицу в «длинном» виде: для каждой когорты (месяц регистрации) и номера месяца жизни ‹month_n› (0 — месяц регистрации) — доля пользователей когорты, у которых был ‹app_open› в этом месяце. Столбцы: ‹cohort›, ‹month_n›, ‹retention› (3 знака). Сортировка по когорте и ‹month_n›.`,
          solution: md`WITH sizes AS (
    SELECT strftime('%Y-%m', reg_date) AS cohort, COUNT(*) AS n FROM users GROUP BY cohort
), act AS (
    SELECT DISTINCT strftime('%Y-%m', u.reg_date) AS cohort, u.user_id,
           (CAST(strftime('%Y', e.event_date) AS INT) - CAST(strftime('%Y', u.reg_date) AS INT)) * 12
           + CAST(strftime('%m', e.event_date) AS INT) - CAST(strftime('%m', u.reg_date) AS INT) AS month_n
    FROM users u
    JOIN events e ON e.user_id = u.user_id AND e.event = 'app_open'
)
SELECT a.cohort, a.month_n, ROUND(1.0 * COUNT(*) / s.n, 3) AS retention
FROM act a
JOIN sizes s ON s.cohort = a.cohort
GROUP BY a.cohort, a.month_n, s.n
ORDER BY a.cohort, a.month_n;`,
          hint: md`Шаг 1: размер каждой когорты. Шаг 2: уникальные пары (когорта, пользователь, month_n) из событий. Шаг 3: число пользователей в паре (когорта, month_n), делённое на размер когорты.`,
        },
      ],
    },
  ],
});
