window.MARKET = {
  intro: md`
## Что спрашивают работодатели
Программа собрана по вакансиям аналитиков данных и продуктовых аналитиков на hh.ru (ноябрь 2026) и по зарубежным разборам тысяч вакансий. Картина везде одна: **SQL — обязательный минимум**, Python с pandas ожидают почти в каждой второй вакансии, а в продуктовой аналитике к ним добавляются A/B-тесты, статистика и метрики продукта.
`,
  demand: [
    ['SQL (CTE, окна)', 95, 'почти всегда'],
    ['Python + pandas', 75, 'чаще всего'],
    ['A/B-тесты', 65, 'продукт'],
    ['Статистика', 60, 'продукт'],
    ['Продуктовые метрики', 60, 'продукт'],
    ['BI: DataLens, Tableau…', 50, 'часто'],
    ['Excel / Google Sheets', 40, 'часто'],
    ['NumPy, SciPy', 40, 'часто'],
    ['Основы ML', 20, 'плюсом'],
    ['Airflow, dbt, Spark', 15, 'плюсом'],
  ],
  after: md`
Шкала показывает примерную частоту упоминаний в просмотренных вакансиях, а не точную статистику рынка. Что из этого следует для курса:

- **SQL** разобран глубже всего: от SELECT до оконных функций, когорт и retention, потому что на собеседовании почти всегда есть живое SQL-задание.
- **pandas** изучается на тех же данных, что и SQL, чтобы вы видели одну задачу в двух инструментах.
- **Статистика и A/B-тесты** даны с упором на то, что спрашивают у junior и middle: p-value, мощность, размер выборки, z-тест для конверсий, бутстрап, CUPED, SRM и peeking.
- **ML** только в объёме, нужном аналитику: регрессия, классификация, метрики качества, переобучение.

Последний модуль — задачи в формате собеседований и чек-лист портфолио.
`,
  plan: [
    ['Недели 1–3', '«Python», «Python: функции, декораторы, ООП», «Файлы, форматы, регулярки, даты», «Библиотеки» и тренажёр Python. Решайте всё, даже простое: скорость набора кода тоже навык.'],
    ['Недели 4–5', '«NumPy», «pandas» и тренажёр pandas. Параллельно повторяйте упражнения в Jupyter у себя на компьютере.'],
    ['Недели 6–8', '«SQL: основы», «SQL: продвинутый» и тренажёр SQL. Самый важный блок для собеседований.'],
    ['Неделя 9', '«Теория вероятностей» и «Статистика».'],
    ['Неделя 10', '«A/B-тесты» и тренажёр расчётов.'],
    ['Неделя 11', '«Продуктовые метрики», тренажёр метрик, «Визуализация, BI и Excel». Соберите первый дашборд в DataLens.'],
    ['Неделя 12', '«ML для аналитика», «Собеседование и портфолио»: 2 проекта на GitHub, резюме.'],
  ],
  sources_md: md`
## Источники по рынку
- Вакансии на hh.ru: [аналитик данных (core-аналитика, продукт и A/B)](https://hh.ru/vacancy/135920532), [Data Analyst Middle+](https://hh.ru/vacancy/135206853), [продуктовый аналитик в Яндекс Образование](https://hh.ru/vacancy/135941500), [Senior Data Analyst](https://hh.ru/vacancy/135996369), [продуктовый аналитик в MAX](https://hh.ru/vacancy/133974836).
- Разборы вакансий: [2 585 вакансий, DEV Community](https://dev.to/gnana_6392e836fd500a957dc/data-analyst-skills-companies-want-in-2026-2500-posting-analysis-2518), [1 000 вакансий, 365 Data Science](https://365datascience.com/career-advice/the-data-analyst-job-market/), [Coursera: навыки аналитика](https://www.coursera.org/articles/in-demand-data-analyst-skills-to-get-hired).
- Подготовка к собеседованиям: [Habr: SQL в A/B-тестах](https://habr.com/ru/articles/893988), [tproger: задачи SQL с собеседований](https://tproger.ru/articles/5-zadanij-po-sql-s-realnyh-sobesedovanij), [Skyeng: что проверяют на разных уровнях](https://skyeng.ru/magazine/obrazovanie/chto-proveryayut-pri-postuplenii-na-analitika-dannykh-vse-8-urovney/).
`,
};

/* =========================== МОДУЛЬ 1. PYTHON =========================== */
COURSE.add({
  id: 'py', title: 'Python для анализа данных', short: 'Типы, строки, коллекции, функции, comprehension, сортировки — всё, что нужно до pandas.',
  lessons: [
    {
      title: 'Типы данных, переменные и строки',
      theory: md`
Python — основной язык аналитика наряду с SQL. Вам не нужно быть разработчиком, но писать чистый код без ошибок нужно уверенно: на тестовых заданиях часто дают «сырой» CSV и просят посчитать метрики.

## Базовые типы
| Тип | Пример | Комментарий |
|---|---|---|
| ‹int› | ‹42› | целые числа любой длины |
| ‹float› | ‹3.14›, ‹1e-3› | числа с плавающей точкой; ‹0.1 + 0.2 != 0.3› |
| ‹bool› | ‹True›, ‹False› | подтип int: ‹True + True == 2› |
| ‹str› | ‹'Москва'› | неизменяемая строка |
| ‹None› | ‹None› | «нет значения», аналог NULL |

~~~py
price = 1290          # int
discount = 0.15       # float
total = price * 3 * (1 - discount)
print(total)          # 3289.5
print(type(total))    # <class 'float'>
print(7 // 2, 7 % 2, 2 ** 10)   # 3 1 1024 — целочисленное деление, остаток, степень
print(round(2.675, 2))          # 2.67 — float хранится неточно!
~~~

> **Важно.** Сравнивайте дробные числа с допуском: ‹abs(a - b) < 1e-9› или ‹math.isclose(a, b)›. Деньги в реальных системах хранят в копейках (int) или типе Decimal.

## Строки
Строки индексируются с нуля, поддерживают срезы ‹s[start:stop:step]›, неизменяемы.

~~~py
s = '  Санкт-Петербург '
s.strip()                 # 'Санкт-Петербург'
s.strip().lower()         # 'санкт-петербург'
s.strip()[:5]             # 'Санкт'
'a,b,c'.split(',')        # ['a', 'b', 'c']
'-'.join(['2025', '07', '31'])   # '2025-07-31'
'Москва'.replace('ква', 'КВА')   # 'МосКВА'
'user@Mail.RU'.split('@')[1].lower()  # 'mail.ru'
'42'.isdigit()            # True
~~~

### f-строки
Самый удобный способ форматирования. После двоеточия идёт спецификация формата.

~~~py
n, amount, cr = 3, 3289.5, 0.12345
print(f'Заказ: {n} шт. на {amount:.2f} ₽')   # Заказ: 3 шт. на 3289.50 ₽
print(f'Конверсия: {cr:.1%}')                # Конверсия: 12.3%
print(f'{1234567:,}'.replace(',', ' '))      # 1 234 567
print(f'{n=}')                               # n=3 — удобно для отладки
~~~

## Приведение типов
~~~py
int('15'), float('3.5'), str(10), bool(0), bool('')   # 15 3.5 '10' False False
int(3.99)        # 3 — отбрасывает дробную часть
float('1 200,50'.replace(' ', '').replace(',', '.'))  # 1200.5
~~~
Пустые строки, ‹0›, ‹None›, пустые коллекции считаются «ложными» в условиях.
`,
      tasks: [
        {
          type: 'py', title: 'Сумма заказа со скидкой',
          text: md`Даны переменные ‹price = 1290›, ‹qty = 3›, ‹discount = 0.15›. Посчитайте итоговую стоимость с учётом скидки и сохраните в переменную ‹total›, округлив до 2 знаков.`,
          starter: md`price = 1290
qty = 3
discount = 0.15
total = ...
print(total)`,
          solution: md`price = 1290
qty = 3
discount = 0.15
total = round(price * qty * (1 - discount), 2)
print(total)`,
          test: md`near(total, 3289.5, 1e-9, 'total')`,
          hint: md`Стоимость без скидки ‹price * qty›, скидка уменьшает её в ‹(1 - discount)› раз. Округление — ‹round(x, 2)›.`,
        },
        {
          type: 'py', title: 'Сообщение для клиента',
          text: md`Сформируйте строку ‹msg› вида ‹Заказ №42: 3 шт. на сумму 3289.50 ₽›, используя переменные ‹order_id›, ‹qty›, ‹amount›. Сумма — всегда с двумя знаками после точки.`,
          starter: md`order_id = 42
qty = 3
amount = 3289.5
msg = ...
print(msg)`,
          solution: md`order_id = 42
qty = 3
amount = 3289.5
msg = f'Заказ №{order_id}: {qty} шт. на сумму {amount:.2f} ₽'
print(msg)`,
          test: md`assert msg == 'Заказ №42: 3 шт. на сумму 3289.50 ₽', f'Строка отличается: {msg!r}'`,
          hint: md`В f-строке формат ‹{amount:.2f}› даёт два знака после точки.`,
        },
        {
          type: 'py', title: 'Домен из email',
          text: md`В переменной ‹email› лежит адрес с пробелами по краям и разным регистром. Сохраните в ‹domain› домен в нижнем регистре (часть после ‹@›), а в ‹login› — часть до ‹@› тоже в нижнем регистре.`,
          starter: md`email = '  Ivan.Petrov@Yandex.RU '
login = ...
domain = ...`,
          solution: md`email = '  Ivan.Petrov@Yandex.RU '
login, domain = email.strip().lower().split('@')`,
          test: md`assert domain == 'yandex.ru', f'domain = {domain!r}'
assert login == 'ivan.petrov', f'login = {login!r}'`,
        },
        {
          type: 'choice', title: 'Сравнение дробных чисел',
          text: md`Что выведет ‹print(0.1 + 0.2 == 0.3)› в Python?`,
          options: ['‹True›', '‹False›', 'Ошибку TypeError', '‹0.3›'],
          answer: [1],
          explain: md`Числа 0.1 и 0.2 нельзя точно представить в двоичной системе, сумма равна ‹0.30000000000000004›. Для сравнения используйте ‹math.isclose›.`,
        },
      ],
    },
    {
      title: 'Коллекции: list, dict, set, tuple',
      theory: md`
## Список (list)
Упорядоченная изменяемая коллекция.
~~~py
amounts = [520, 1890, 340, 2750]
amounts.append(990)          # добавить в конец
amounts[0], amounts[-1]      # 520 990 — первый и последний
amounts[1:3]                 # [1890, 340]
len(amounts), sum(amounts), max(amounts), min(amounts)
sorted(amounts, reverse=True)   # новый отсортированный список
amounts.sort()                  # сортировка на месте, вернёт None!
~~~

## Словарь (dict)
Отображение ключ → значение. Поиск по ключу за O(1). Главная структура для подсчётов и группировок.
~~~py
city_users = {'Москва': 760, 'Казань': 280}
city_users['Новосибирск'] = 220          # добавить
city_users.get('Омск', 0)                # 0 — значение по умолчанию
for city, n in city_users.items():
    print(city, n)

# подсчёт частот вручную
counts = {}
for c in ['ads', 'organic', 'ads']:
    counts[c] = counts.get(c, 0) + 1     # {'ads': 2, 'organic': 1}
~~~

Для подсчётов есть готовые инструменты в модуле ‹collections›:
~~~py
from collections import Counter, defaultdict
Counter(['ads', 'organic', 'ads']).most_common(1)   # [('ads', 2)]
rev = defaultdict(float)
for user, amount in [(1, 500), (2, 300), (1, 250)]:
    rev[user] += amount                              # {1: 750.0, 2: 300.0}
~~~

## Множество (set)
Неупорядоченный набор уникальных элементов. Идеален для «кто был и там и там».
~~~py
jan = {1, 2, 3, 5}
feb = {2, 3, 4}
jan & feb    # {2, 3} — пересечение: вернувшиеся
feb - jan    # {4}    — новые в феврале
jan | feb    # {1, 2, 3, 4, 5} — объединение
len(set([1, 1, 2]))   # 2 — число уникальных
~~~

## Кортеж (tuple)
Неизменяемый список. Используется для записей фиксированной структуры и как ключ словаря.
~~~py
order = (101, 'Москва', 1890.0)
order_id, city, amount = order      # распаковка
~~~

## Comprehension
Компактная запись цикла, создающего коллекцию. Читается как «что — для чего — при каком условии».
~~~py
big = [a for a in amounts if a > 1000]
squares = {x: x ** 2 for x in range(5)}       # dict comprehension
cities = {row['city'] for row in rows}        # set comprehension
labels = ['big' if a > 1000 else 'small' for a in amounts]
~~~
`,
      tasks: [
        {
          type: 'py', title: 'Выручка по пользователям',
          text: md`Дан список заказов ‹orders› в виде кортежей ‹(user_id, amount)›. Постройте словарь ‹total_by_user›: ключ — user_id, значение — суммарная выручка пользователя.`,
          starter: md`orders = [(1, 500), (2, 1200), (1, 250), (3, 990), (2, 310), (1, 40)]
total_by_user = {}
`,
          solution: md`orders = [(1, 500), (2, 1200), (1, 250), (3, 990), (2, 310), (1, 40)]
total_by_user = {}
for user_id, amount in orders:
    total_by_user[user_id] = total_by_user.get(user_id, 0) + amount
print(total_by_user)`,
          test: md`assert isinstance(total_by_user, dict), 'Нужен словарь'
assert total_by_user == {1: 790, 2: 1510, 3: 990}, f'Получилось {total_by_user}'`,
        },
        {
          type: 'py', title: 'Крупные чеки',
          text: md`С помощью list comprehension создайте список ‹big› из сумм больше 1000 из списка ‹amounts›, увеличенных на 20% (НДС) и округлённых до 2 знаков. Порядок сохраните.`,
          starter: md`amounts = [520.0, 1890.5, 340.0, 2750.0, 1000.0, 1200.99]
big = ...`,
          solution: md`amounts = [520.0, 1890.5, 340.0, 2750.0, 1000.0, 1200.99]
big = [round(a * 1.2, 2) for a in amounts if a > 1000]`,
          test: md`same_list(big, [2268.6, 3300.0, 1441.19], 'big')`,
          hint: md`Условие строго «больше 1000», поэтому 1000.0 не попадает.`,
        },
        {
          type: 'py', title: 'Вернувшиеся и новые',
          text: md`Даны списки id пользователей, активных в январе и в феврале (с повторами). Найдите:
- ‹retained› — отсортированный список тех, кто был активен в оба месяца;
- ‹new_feb› — отсортированный список тех, кто был в феврале, но не в январе;
- ‹retention› — долю январских уникальных пользователей, вернувшихся в феврале (число от 0 до 1).`,
          starter: md`jan = [1, 2, 3, 3, 5, 8, 9, 9, 10]
feb = [2, 3, 4, 4, 7, 9, 11]
`,
          solution: md`jan = [1, 2, 3, 3, 5, 8, 9, 9, 10]
feb = [2, 3, 4, 4, 7, 9, 11]
j, f = set(jan), set(feb)
retained = sorted(j & f)
new_feb = sorted(f - j)
retention = len(j & f) / len(j)`,
          test: md`same_list(retained, [2, 3, 9], 'retained')
same_list(new_feb, [4, 7, 11], 'new_feb')
near(retention, 3 / 7, 1e-9, 'retention')`,
          hint: md`Уникальных январских пользователей 7, а не 9 — сначала превратите списки в множества.`,
        },
        {
          type: 'py', title: 'Самый частый канал',
          text: md`В списке ‹channels› — канал привлечения каждого пользователя. Сохраните в ‹top› самый частый канал, а в ‹share› — его долю среди всех пользователей.`,
          starter: md`channels = ['ads', 'organic', 'ads', 'social', 'referral', 'ads', 'organic', 'social', 'ads', 'organic']
`,
          solution: md`from collections import Counter
channels = ['ads', 'organic', 'ads', 'social', 'referral', 'ads', 'organic', 'social', 'ads', 'organic']
top, cnt = Counter(channels).most_common(1)[0]
share = cnt / len(channels)`,
          test: md`assert top == 'ads', f'top = {top!r}'
near(share, 0.4, 1e-9, 'share')`,
        },
      ],
    },
    {
      title: 'Условия, циклы, функции, ошибки',
      theory: md`
## Условия и циклы
~~~py
def segment(amount):
    if amount < 500:
        return 'small'
    elif amount < 1500:
        return 'medium'
    else:
        return 'large'

for i, a in enumerate([300, 900, 2000]):     # enumerate даёт индекс
    print(i, a, segment(a))

for name, price in zip(['чай', 'кофе'], [199, 799]):   # zip — параллельный обход
    print(name, price)

n = 0
while n < 3:
    n += 1          # break — выйти из цикла, continue — к следующей итерации
~~~

## Функции
~~~py
def conversion(buyers, visitors, digits=3):
    """Доля покупателей среди посетителей."""
    if visitors == 0:
        return 0.0
    return round(buyers / visitors, digits)

conversion(30, 1000)              # 0.03
conversion(buyers=30, visitors=1000, digits=4)
~~~
- Аргументы по умолчанию указываются после обязательных.
- **Не используйте изменяемые значения по умолчанию** (‹def f(x=[])›): список создаётся один раз и копит данные между вызовами. Пишите ‹x=None› и внутри ‹if x is None: x = []›.
- ‹*args› собирает позиционные аргументы в кортеж, ‹**kwargs› — именованные в словарь.

## lambda и сортировка по ключу
‹lambda› — короткая безымянная функция, обычно для ‹key=› в сортировке.
~~~py
products = [{'name': 'Кофе', 'rev': 8000}, {'name': 'Чай', 'rev': 8000}, {'name': 'Сок', 'rev': 1200}]
sorted(products, key=lambda p: (-p['rev'], p['name']))
# по убыванию выручки, при равенстве — по имени
max(products, key=lambda p: p['rev'])['name']    # 'Кофе'
~~~

## Исключения
~~~py
def parse_amount(s):
    try:
        return float(s.replace(' ', '').replace(',', '.'))
    except ValueError:
        return None

try:
    1 / 0
except ZeroDivisionError as e:
    print('Ошибка:', e)
finally:
    print('выполнится всегда')
~~~
Перехватывайте конкретные исключения, а не все подряд (‹except Exception› прячет баги).

## Полезная стандартная библиотека
- ‹math› — ‹sqrt›, ‹log›, ‹comb› (сочетания), ‹isclose›;
- ‹datetime› — даты: ‹date(2025, 7, 31) - date(2025, 7, 1)› даёт ‹timedelta(days=30)›;
- ‹statistics› — ‹mean›, ‹median›, ‹stdev›;
- ‹collections› — ‹Counter›, ‹defaultdict›;
- ‹itertools› — комбинации, группировки.
`,
      tasks: [
        {
          type: 'py', title: 'Функция конверсии',
          text: md`Напишите функцию ‹conversion(buyers, visitors)›, которая возвращает долю покупателей, округлённую до 4 знаков. Если ‹visitors› равно 0, функция возвращает ‹0.0›.`,
          starter: md`def conversion(buyers, visitors):
    ...
`,
          solution: md`def conversion(buyers, visitors):
    if visitors == 0:
        return 0.0
    return round(buyers / visitors, 4)`,
          test: md`near(conversion(30, 1000), 0.03, 1e-12, 'conversion(30, 1000)')
near(conversion(1, 3), 0.3333, 1e-12, 'conversion(1, 3)')
assert conversion(5, 0) == 0.0, 'При visitors = 0 нужно вернуть 0.0'`,
        },
        {
          type: 'py', title: 'Своя медиана',
          text: md`Напишите функцию ‹median(xs)› без модулей ‹statistics› и ‹numpy›. Для чётной длины медиана — среднее двух центральных элементов. Исходный список менять нельзя.`,
          starter: md`def median(xs):
    ...
`,
          solution: md`def median(xs):
    s = sorted(xs)
    n = len(s)
    mid = n // 2
    if n % 2:
        return s[mid]
    return (s[mid - 1] + s[mid]) / 2`,
          test: md`near(median([5, 1, 3]), 3, 1e-12, 'median([5, 1, 3])')
near(median([4, 1, 3, 2]), 2.5, 1e-12, 'median([4, 1, 3, 2])')
data = [9, 2, 7]
median(data)
assert data == [9, 2, 7], 'Функция изменила исходный список — используйте sorted(), а не .sort()'`,
        },
        {
          type: 'py', title: 'Парсинг сумм',
          text: md`Из выгрузки пришли суммы строками в «бухгалтерском» формате: ‹'1 200,50 ₽'›, ‹'15 000 ₽'›, ‹'—'›. Напишите функцию ‹parse_amount(s)›, которая возвращает float, а для строк, которые не получилось распарсить, — ‹None›. Затем посчитайте ‹total› — сумму всех распознанных значений из списка ‹raw›.`,
          starter: md`raw = ['1 200,50 ₽', '15 000 ₽', '—', '99,9 ₽', '', '0 ₽']

def parse_amount(s):
    ...

total = ...`,
          solution: md`raw = ['1 200,50 ₽', '15 000 ₽', '—', '99,9 ₽', '', '0 ₽']

def parse_amount(s):
    s = s.replace('₽', '').replace(' ', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return None

total = sum(v for v in map(parse_amount, raw) if v is not None)`,
          test: md`near(parse_amount('1 200,50 ₽'), 1200.5, 1e-9, "parse_amount('1 200,50 ₽')")
assert parse_amount('—') is None, 'Для «—» нужно вернуть None'
assert parse_amount('') is None, 'Для пустой строки нужно вернуть None'
near(parse_amount('0 ₽'), 0.0, 1e-9, "parse_amount('0 ₽')")
near(total, 16300.4, 1e-9, 'total')`,
          hint: md`Уберите символ рубля и пробелы, замените запятую на точку, оберните ‹float()› в ‹try/except ValueError›. Осторожно: ‹0.0› — ложное значение, проверяйте ‹is not None›.`,
        },
        {
          type: 'py', title: 'Рейтинг товаров',
          text: md`Отсортируйте список словарей ‹products› по убыванию выручки, при равной выручке — по названию по алфавиту. Сохраните в ‹ranking› список **названий** в этом порядке.`,
          starter: md`products = [
    {'name': 'Чай', 'rev': 8000},
    {'name': 'Сок', 'rev': 1200},
    {'name': 'Кофе', 'rev': 8000},
    {'name': 'Вода', 'rev': 1200},
    {'name': 'Хлеб', 'rev': 5000},
]
ranking = ...`,
          solution: md`products = [
    {'name': 'Чай', 'rev': 8000},
    {'name': 'Сок', 'rev': 1200},
    {'name': 'Кофе', 'rev': 8000},
    {'name': 'Вода', 'rev': 1200},
    {'name': 'Хлеб', 'rev': 5000},
]
ranking = [p['name'] for p in sorted(products, key=lambda p: (-p['rev'], p['name']))]`,
          test: md`same_list(ranking, ['Кофе', 'Чай', 'Хлеб', 'Вода', 'Сок'], 'ranking')`,
        },
      ],
    },
  ],
});

/* =========================== МОДУЛЬ 2. NUMPY =========================== */
COURSE.add({
  id: 'np', title: 'NumPy', short: 'Массивы, векторизация, маски, оси, broadcasting и симуляции.',
  lessons: [
    {
      title: 'Массивы, векторизация и маски',
      theory: md`
NumPy — библиотека для быстрых вычислений над массивами чисел. На ней построены pandas, SciPy и scikit-learn. Главная идея: **операции применяются сразу ко всему массиву** (векторизация), без циклов Python, и работают в десятки раз быстрее.

## Создание массивов
~~~py
import numpy as np
a = np.array([520, 1890, 340, 2750])
np.arange(1, 11)              # 1..10
np.linspace(0, 1, 5)          # [0.  0.25 0.5  0.75 1.  ]
np.zeros(3), np.ones((2, 3))  # нули, единицы (2 строки × 3 столбца)
a.dtype, a.shape, a.ndim      # dtype('int64') (4,) 1
~~~

## Векторизация
~~~py
prices = np.array([129, 189, 799])
qty = np.array([2, 1, 3])
prices * qty                  # [ 258  189 2397] — поэлементно
(prices * qty).sum()          # 2844
prices * 0.9                  # скидка всем сразу
np.log(prices), np.sqrt(prices), np.round(prices / 7, 2)
~~~

## Индексация и булевы маски
~~~py
a = np.array([520, 1890, 340, 2750, 990])
a[0], a[-1], a[1:3]           # как у списков
mask = a > 900                # [False  True False  True  True]
a[mask]                       # [1890 2750  990]
a[(a > 500) & (a < 2000)]     # & — «и», | — «или», ~ — «не»; скобки обязательны
mask.sum(), mask.mean()       # 3 и 0.6 — сколько и какая доля
np.where(a > 1000, 'big', 'small')   # векторный if
a.argmax(), a.argsort()       # индекс максимума, индексы сортировки
~~~

> **Частая ошибка.** ‹and›/‹or› не работают с массивами — используйте ‹&›, ‹|› и скобки: ‹(a > 1) & (a < 5)›.

## Стандартизация (z-score)
Многие методы требуют привести признаки к одному масштабу:
$$ z = (x − mean(x)) / std(x)
~~~py
z = (a - a.mean()) / a.std()      # среднее 0, стандартное отклонение 1
~~~
‹a.std()› по умолчанию считает **смещённое** отклонение (делит на n). Для выборочного несмещённого — ‹a.std(ddof=1)›. В pandas, наоборот, по умолчанию ‹ddof=1›. Это частый источник расхождений.
`,
      tasks: [
        {
          type: 'py', pkgs: ['numpy'], title: 'Сумма чётных',
          text: md`Создайте массив ‹a› с числами от 1 до 100 включительно и сохраните в ‹evens_sum› сумму чётных чисел, используя булеву маску (без циклов).`,
          starter: md`import numpy as np
a = ...
evens_sum = ...`,
          solution: md`import numpy as np
a = np.arange(1, 101)
evens_sum = a[a % 2 == 0].sum()`,
          test: md`import numpy as np
assert isinstance(a, np.ndarray) and len(a) == 100 and a[0] == 1 and a[-1] == 100, 'a должен содержать числа 1..100'
near(evens_sum, 2550, 1e-12, 'evens_sum')`,
        },
        {
          type: 'py', pkgs: ['numpy'], title: 'Выручка по позициям',
          text: md`Даны массивы цен и количеств. Посчитайте:
- ‹revenue› — общую выручку;
- ‹top_idx› — индекс позиции с максимальной выручкой;
- ‹share_big› — долю позиций, выручка которых больше 1000.`,
          starter: md`import numpy as np
prices = np.array([129, 189, 799, 59, 449, 890])
qty = np.array([5, 3, 2, 12, 2, 2])
`,
          solution: md`import numpy as np
prices = np.array([129, 189, 799, 59, 449, 890])
qty = np.array([5, 3, 2, 12, 2, 2])
rev = prices * qty
revenue = rev.sum()
top_idx = rev.argmax()
share_big = (rev > 1000).mean()`,
          test: md`near(revenue, 645+567+1598+708+898+1780, 1e-12, 'revenue')
assert int(top_idx) == 5, f'top_idx = {top_idx}'
near(share_big, 2/6, 1e-12, 'share_big')`,
          hint: md`Выручка по позициям: ‹prices * qty›. Доля — среднее булевой маски.`,
        },
        {
          type: 'py', pkgs: ['numpy'], title: 'Стандартизация',
          text: md`Стандартизируйте массив ‹x›: сохраните в ‹z› значения ‹(x − среднее) / стандартное отклонение›, где отклонение выборочное (‹ddof=1›). Затем найдите ‹n_out› — количество значений с ‹|z| > 2›.`,
          starter: md`import numpy as np
x = np.array([12, 15, 14, 10, 13, 55, 11, 14, 16, 12, 13, -20])
`,
          solution: md`import numpy as np
x = np.array([12, 15, 14, 10, 13, 55, 11, 14, 16, 12, 13, -20])
z = (x - x.mean()) / x.std(ddof=1)
n_out = int((np.abs(z) > 2).sum())`,
          test: md`import numpy as np
xx = np.array([12, 15, 14, 10, 13, 55, 11, 14, 16, 12, 13, -20])
zz = (xx - xx.mean()) / xx.std(ddof=1)
assert np.allclose(z, zz), 'z посчитан неверно — проверьте ddof=1'
assert int(n_out) == int((np.abs(zz) > 2).sum()), f'n_out = {n_out}'`,
        },
      ],
    },
    {
      title: 'Оси, broadcasting и случайные числа',
      theory: md`
## Двумерные массивы и оси
Матрица — это массив формы ‹(строки, столбцы)›. Агрегаты принимают параметр ‹axis›:
- ‹axis=0› — схлопываем строки, результат по каждому **столбцу**;
- ‹axis=1› — схлопываем столбцы, результат по каждой **строке**.

~~~py
M = np.array([[10, 20, 30],
              [ 1,  2,  3]])     # 2 магазина × 3 дня
M.shape                 # (2, 3)
M.sum()                 # 66 — всё
M.sum(axis=0)           # [11 22 33] — по дням
M.sum(axis=1)           # [60  6]   — по магазинам
M[:, 1]                 # столбец: [20  2]
M[0]                    # строка:  [10 20 30]
M.T                     # транспонирование
M.reshape(3, 2)         # другая форма с теми же данными
~~~

## Broadcasting
Если формы массивов разные, NumPy «растягивает» меньший массив по недостающей оси.
~~~py
M - M.mean(axis=0)              # из каждого столбца вычитается его среднее
M / M.sum(axis=1, keepdims=True)   # доли внутри каждой строки
~~~
Правило: размеры сравниваются с конца; они совместимы, если равны или один из них 1. ‹keepdims=True› сохраняет ось размером 1, чтобы деление по строкам сработало.

## Случайные числа и симуляции
Современный способ — генератор ‹default_rng› с фиксированным seed для воспроизводимости:
~~~py
rng = np.random.default_rng(42)
rng.integers(1, 7, size=10)          # 10 бросков кубика
rng.normal(loc=100, scale=15, size=1000)
rng.binomial(n=1, p=0.1, size=1000)  # 1000 пользователей с конверсией 10%
rng.choice(['A', 'B'], size=5)
rng.exponential(scale=2, size=1000)
~~~

Метод Монте-Карло: если формулу вывести сложно, смоделируйте процесс много раз и посчитайте долю нужных исходов.
~~~py
rolls = rng.integers(1, 7, size=(100_000, 2))   # 100 тыс. бросков двух кубиков
p = (rolls.sum(axis=1) == 7).mean()             # ≈ 1/6
~~~
Точность оценки доли растёт как ‹1/√n›: 100 000 испытаний дают погрешность порядка 0.001–0.002.
`,
      tasks: [
        {
          type: 'py', pkgs: ['numpy'], title: 'Продажи по магазинам и дням',
          text: md`Матрица ‹sales› — продажи 4 магазинов (строки) за 5 дней (столбцы). Найдите:
- ‹by_store› — суммы по магазинам (массив из 4 чисел);
- ‹by_day_mean› — среднее по дням (массив из 5 чисел);
- ‹best_store› — индекс магазина с максимальной суммой;
- ‹shares› — матрицу долей: каждая ячейка делится на сумму своей строки.`,
          starter: md`import numpy as np
sales = np.array([
    [120, 135, 150, 110, 160],
    [ 80,  95,  70,  85,  90],
    [200, 210, 190, 220, 230],
    [ 60,  55,  75,  65,  70],
])
`,
          solution: md`import numpy as np
sales = np.array([
    [120, 135, 150, 110, 160],
    [ 80,  95,  70,  85,  90],
    [200, 210, 190, 220, 230],
    [ 60,  55,  75,  65,  70],
])
by_store = sales.sum(axis=1)
by_day_mean = sales.mean(axis=0)
best_store = by_store.argmax()
shares = sales / sales.sum(axis=1, keepdims=True)`,
          test: md`import numpy as np
S = np.array([[120,135,150,110,160],[80,95,70,85,90],[200,210,190,220,230],[60,55,75,65,70]])
assert np.allclose(by_store, S.sum(1)), 'by_store неверно — суммируйте по axis=1'
assert np.allclose(by_day_mean, S.mean(0)), 'by_day_mean неверно — среднее по axis=0'
assert int(best_store) == 2, f'best_store = {best_store}'
assert np.shape(shares) == (4, 5) and np.allclose(shares, S / S.sum(1, keepdims=True)), 'shares неверно: каждая строка должна суммироваться в 1'`,
        },
        {
          type: 'py', pkgs: ['numpy'], title: 'Монте-Карло: два кубика',
          text: md`Методом Монте-Карло оцените вероятность того, что сумма двух игральных кубиков **не меньше 10**. Используйте ‹np.random.default_rng(1)› и не менее 100 000 бросков. Сохраните оценку в ‹p_est›.`,
          starter: md`import numpy as np
rng = np.random.default_rng(1)
`,
          solution: md`import numpy as np
rng = np.random.default_rng(1)
rolls = rng.integers(1, 7, size=(200_000, 2))
p_est = (rolls.sum(axis=1) >= 10).mean()
print(p_est, 6 / 36)`,
          test: md`assert abs(float(p_est) - 6/36) < 0.006, f'p_est = {p_est}: далеко от теоретического значения. Проверьте, что кубик даёт числа 1..6 (integers(1, 7))'`,
          hint: md`‹rng.integers(1, 7, size=(n, 2))› — правая граница не включается. Точный ответ 6/36: (4,6),(5,5),(6,4),(5,6),(6,5),(6,6).`,
        },
        {
          type: 'choice', title: 'Формы массивов',
          text: md`‹A› имеет форму ‹(3, 4)›. Какая операция завершится ошибкой?`,
          options: ['‹A - A.mean(axis=0)›', '‹A - A.mean(axis=1)›', '‹A / A.sum(axis=1, keepdims=True)›', '‹A * 2›'],
          answer: [1],
          explain: md`‹A.mean(axis=1)› имеет форму ‹(3,)›. Формы ‹(3, 4)› и ‹(3,)› сравниваются с конца: 4 ≠ 3, broadcasting невозможен. Нужно ‹keepdims=True› → форма ‹(3, 1)›.`,
        },
      ],
    },
  ],
});

/* =========================== МОДУЛЬ 3. PANDAS =========================== */
COURSE.add({
  id: 'pd', title: 'pandas', short: 'DataFrame, фильтрация, groupby, merge, pivot, даты, пропуски и очистка данных.',
  lessons: [
    {
      title: 'DataFrame: чтение, выбор, фильтрация',
      theory: md`
pandas — основной инструмент аналитика в Python. ‹DataFrame› — таблица со столбцами разных типов, ‹Series› — один столбец с индексом.

## Загрузка и первый взгляд
~~~py
import pandas as pd
df = pd.read_csv('orders.csv', parse_dates=['order_date'])
# также: pd.read_excel, pd.read_parquet, pd.read_sql(query, connection)
df.head(), df.tail(3), df.sample(5)
df.shape            # (строк, столбцов)
df.info()           # типы и пропуски
df.describe()       # статистики числовых столбцов
df.columns, df.dtypes
df['status'].value_counts()      # частоты
df['user_id'].nunique()          # число уникальных
~~~
В задачах курса таблицы уже загружены: ‹users›, ‹orders›, ‹order_items›, ‹products›, ‹events›, ‹ab_test›.

## Выбор столбцов и строк
~~~py
orders['amount']                  # Series
orders[['order_id', 'amount']]    # DataFrame (двойные скобки!)
orders.loc[0, 'amount']           # по метке индекса и имени столбца
orders.iloc[0, 3]                 # по позиции
orders.loc[orders['amount'] > 2000, ['order_id', 'amount']]
~~~

## Фильтрация
~~~py
orders[orders['status'] == 'delivered']
orders[(orders['amount'] > 1000) & (orders['promo'] == 1)]
users[users['city'].isin(['Москва', 'Казань'])]
products[products['name'].str.contains('Сок')]
orders.query('amount > 1000 and status == "delivered"')
orders[orders['order_date'] >= '2025-07-01']    # даты можно сравнивать со строкой
~~~

## Новые столбцы и сортировка
~~~py
orders['amount_k'] = orders['amount'] / 1000
orders['big'] = orders['amount'] > 1500
orders['segment'] = pd.cut(orders['amount'], bins=[0, 500, 1500, float('inf')], labels=['small', 'medium', 'large'])
orders.sort_values(['user_id', 'order_date'], ascending=[True, False])
orders.nlargest(5, 'amount')
df.rename(columns={'amount': 'revenue'})
df.reset_index(drop=True)
~~~

> **SettingWithCopyWarning.** Если отфильтровали таблицу и хотите менять результат, делайте копию: ‹big = orders[orders.amount > 1000].copy()›.
`,
      tasks: [
        {
          type: 'py', data: ['users'], title: 'Москвичи старше 30',
          text: md`Создайте DataFrame ‹moscow› с пользователями из Москвы старше 30 лет (строго). Оставьте столбцы ‹user_id›, ‹age›, ‹channel› в этом порядке, отсортируйте по ‹user_id›.`,
          starter: md`moscow = ...
print(moscow.head())
print(len(moscow))`,
          solution: md`moscow = users.loc[(users['city'] == 'Москва') & (users['age'] > 30), ['user_id', 'age', 'channel']].sort_values('user_id')
print(moscow.head())
print(len(moscow))`,
          test: md`exp = users.loc[(users['city'] == 'Москва') & (users['age'] > 30), ['user_id', 'age', 'channel']].sort_values('user_id')
same_df(moscow, exp, 'moscow')`,
        },
        {
          type: 'py', data: ['products'], title: 'Справочник товаров',
          text: md`По таблице ‹products› найдите:
- ‹n_expensive› — сколько товаров дороже 150 ₽;
- ‹cheapest_drink› — название самого дешёвого товара в категории «Напитки»;
- ‹avg_dairy› — среднюю цену в категории «Молочка».`,
          starter: md`print(products.head())
`,
          solution: md`n_expensive = (products['price'] > 150).sum()
drinks = products[products['category'] == 'Напитки']
cheapest_drink = drinks.loc[drinks['price'].idxmin(), 'name']
avg_dairy = products.loc[products['category'] == 'Молочка', 'price'].mean()`,
          test: md`near(n_expensive, (products['price'] > 150).sum(), 0, 'n_expensive')
assert cheapest_drink == 'Вода 1.5 л', f'cheapest_drink = {cheapest_drink!r}'
near(avg_dairy, products.loc[products['category'] == 'Молочка', 'price'].mean(), 1e-9, 'avg_dairy')`,
          hint: md`‹idxmin()› возвращает метку индекса строки с минимумом, затем ‹.loc[метка, 'name']›.`,
        },
        {
          type: 'py', data: ['orders'], title: 'Июльские доставки',
          text: md`Создайте ‹july› — доставленные (‹status == 'delivered'›) заказы за июль 2025. Добавьте в него столбец ‹segment›: ‹'small'› для суммы меньше 500, ‹'medium'› — от 500 до 1500 (не включая 1500), ‹'large'› — от 1500. Затем сохраните в ‹seg_counts› число заказов по сегментам (Series, индекс — сегмент, отсортирован по алфавиту).`,
          starter: md`july = ...
`,
          solution: md`july = orders[(orders['status'] == 'delivered') & (orders['order_date'] >= '2025-07-01') & (orders['order_date'] < '2025-08-01')].copy()
july['segment'] = 'large'
july.loc[july['amount'] < 1500, 'segment'] = 'medium'
july.loc[july['amount'] < 500, 'segment'] = 'small'
seg_counts = july['segment'].value_counts().sort_index()
print(seg_counts)`,
          test: md`import numpy as np
e = orders[(orders.status == 'delivered') & (orders.order_date.dt.month == 7)].copy()
assert len(july) == len(e), f'В july {len(july)} строк, а ожидалось {len(e)}'
e['segment'] = np.select([e.amount < 500, e.amount < 1500], ['small', 'medium'], 'large')
assert 'segment' in july.columns, 'В july нет столбца segment'
same_series(july.sort_values('order_id')['segment'].reset_index(drop=True), e.sort_values('order_id')['segment'].reset_index(drop=True), 'segment')
same_series(seg_counts.astype(int), e['segment'].value_counts().sort_index(), 'seg_counts')`,
          hint: md`Удобно через ‹np.select([условие1, условие2], [значение1, значение2], default)› или ‹pd.cut(..., right=False)›.`,
        },
      ],
    },
    {
      title: 'Группировки: groupby и agg',
      theory: md`
Группировка — сердце аналитики. Логика «split → apply → combine»: разбить строки на группы, посчитать агрегат в каждой, собрать результат.

~~~py
orders.groupby('status')['amount'].mean()            # Series: средний чек по статусам
orders.groupby('status').size()                      # число строк в группах
orders.groupby(['status', 'promo'])['amount'].sum()  # несколько ключей → MultiIndex
~~~

## agg: несколько метрик сразу
~~~py
orders.groupby('user_id').agg(
    orders_cnt=('order_id', 'count'),
    revenue=('amount', 'sum'),
    avg_check=('amount', 'mean'),
    first_order=('order_date', 'min'),
).reset_index()
~~~
Именованная агрегация (‹имя=(столбец, функция)›) даёт аккуратные названия столбцов. Функции: ‹count›, ‹nunique›, ‹sum›, ‹mean›, ‹median›, ‹min›, ‹max›, ‹std›, ‹first›, ‹last›, а также любая своя ‹lambda›.

> **count и size.** ‹count› не считает пропуски (NaN), ‹size› считает все строки.

## transform: вернуть результат на уровне строк
‹agg› схлопывает группу в одну строку, а ‹transform› возвращает значение для каждой исходной строки. Это аналог оконных функций в SQL.
~~~py
orders['user_total'] = orders.groupby('user_id')['amount'].transform('sum')
orders['share_in_user'] = orders['amount'] / orders['user_total']
orders['order_num'] = orders.groupby('user_id').cumcount() + 1   # номер заказа пользователя
~~~

## Сортировка и топы
~~~py
rev = orders.groupby('user_id')['amount'].sum().sort_values(ascending=False)
rev.head(10)
users['channel'].value_counts(normalize=True)      # доли
~~~

## Фильтрация групп
~~~py
orders.groupby('user_id').filter(lambda g: len(g) >= 5)   # строки пользователей с ≥5 заказами
cnt = orders.groupby('user_id').size()
loyal = cnt[cnt >= 5].index                                # аналог HAVING
~~~
`,
      tasks: [
        {
          type: 'py', data: ['orders'], title: 'Статистика по статусам',
          text: md`Сохраните в ‹by_status› DataFrame с индексом ‹status› и двумя столбцами: ‹cnt› — число заказов, ‹avg_amount› — средняя сумма заказа.`,
          starter: md`by_status = ...
print(by_status)`,
          solution: md`by_status = orders.groupby('status').agg(cnt=('order_id', 'count'), avg_amount=('amount', 'mean'))
print(by_status)`,
          test: md`e = orders.groupby('status').agg(cnt=('order_id', 'count'), avg_amount=('amount', 'mean'))
assert list(by_status.index) == list(e.index), f'Индекс должен быть status: {list(e.index)}'
same_df(by_status, e, 'by_status')`,
        },
        {
          type: 'py', data: ['orders'], title: 'Топ-10 клиентов',
          text: md`Найдите 10 пользователей с наибольшей суммарной выручкой по **доставленным** заказам. Результат ‹top_users› — Series: индекс ‹user_id›, значения — выручка, по убыванию.`,
          starter: md`top_users = ...
print(top_users)`,
          solution: md`top_users = (orders[orders['status'] == 'delivered']
             .groupby('user_id')['amount'].sum()
             .sort_values(ascending=False)
             .head(10))
print(top_users)`,
          test: md`e = orders[orders.status == 'delivered'].groupby('user_id')['amount'].sum().sort_values(ascending=False).head(10)
same_series(top_users, e, 'top_users')`,
        },
        {
          type: 'py', data: ['orders'], title: 'Номер заказа и доля в выручке',
          text: md`Добавьте в ‹orders› два столбца (учитывайте все заказы, любой статус):
- ‹order_num› — порядковый номер заказа пользователя по дате (при равной дате — по ‹order_id›), начиная с 1;
- ‹share› — доля суммы заказа в общей сумме всех заказов этого пользователя.

Затем сохраните в ‹first_avg› средний чек **первых** заказов, а в ‹repeat_avg› — средний чек всех остальных.`,
          starter: md`orders = orders.sort_values(['user_id', 'order_date', 'order_id'])
`,
          solution: md`orders = orders.sort_values(['user_id', 'order_date', 'order_id'])
orders['order_num'] = orders.groupby('user_id').cumcount() + 1
orders['share'] = orders['amount'] / orders.groupby('user_id')['amount'].transform('sum')
first_avg = orders.loc[orders['order_num'] == 1, 'amount'].mean()
repeat_avg = orders.loc[orders['order_num'] > 1, 'amount'].mean()
print(first_avg, repeat_avg)`,
          test: md`e = _load('orders').sort_values(['user_id', 'order_date', 'order_id'])
e['order_num'] = e.groupby('user_id').cumcount() + 1
e['share'] = e['amount'] / e.groupby('user_id')['amount'].transform('sum')
o = orders.sort_values('order_id'); e = e.sort_values('order_id')
same_series(o['order_num'].reset_index(drop=True).astype(int), e['order_num'].reset_index(drop=True), 'order_num')
same_series(o['share'].reset_index(drop=True), e['share'].reset_index(drop=True), 'share')
near(first_avg, e.loc[e.order_num == 1, 'amount'].mean(), 1e-9, 'first_avg')
near(repeat_avg, e.loc[e.order_num > 1, 'amount'].mean(), 1e-9, 'repeat_avg')`,
          hint: md`‹groupby('user_id').cumcount()› нумерует строки внутри группы с нуля в текущем порядке строк, поэтому сначала отсортируйте. Для доли — ‹transform('sum')›.`,
        },
      ],
    },
    {
      title: 'Объединение таблиц и сводные',
      theory: md`
## merge — аналог JOIN
~~~py
df = orders.merge(users, on='user_id', how='left')
# how: 'inner' (только совпавшие), 'left', 'right', 'outer'
items = order_items.merge(products[['product_id', 'category']], on='product_id')
orders.merge(users, left_on='user_id', right_on='id')   # разные имена ключей
pd.merge(a, b, on='key', how='left', indicator=True)     # столбец _merge: both / left_only
~~~

> **Проверяйте размер после merge.** Если ключ во второй таблице не уникален, строки размножатся. Помогает параметр ‹validate='many_to_one'› — он выбросит ошибку, если справа есть дубликаты ключа.

## concat — склеить таблицы
~~~py
pd.concat([df_jan, df_feb], ignore_index=True)   # друг под другом
pd.concat([a, b], axis=1)                         # рядом по индексу
~~~

## Сводные таблицы
~~~py
pd.pivot_table(df, index='city', columns='channel', values='user_id',
               aggfunc='count', fill_value=0, margins=True)
df.groupby(['city', 'channel']).size().unstack(fill_value=0)   # то же через unstack
pd.crosstab(users['city'], users['channel'], normalize='index')  # доли по строкам
~~~
Обратная операция — ‹melt›: из «широкой» таблицы в «длинную».
~~~py
wide.melt(id_vars='city', var_name='channel', value_name='users')
~~~

## apply и map
~~~py
users['age_group'] = users['age'].apply(lambda a: '18-24' if a < 25 else '25-34' if a < 35 else '35+')
users['ch_ru'] = users['channel'].map({'ads': 'реклама', 'organic': 'органика'})
~~~
‹apply› со строковой функцией работает медленно (это цикл). Когда можно, используйте векторные операции, ‹np.where›, ‹np.select›, ‹pd.cut›.
`,
      tasks: [
        {
          type: 'py', data: ['orders', 'users'], title: 'Выручка по городам',
          text: md`Посчитайте выручку доставленных заказов по городам пользователей. Результат ‹rev_by_city› — Series: индекс — город, значения — выручка, по убыванию.`,
          starter: md`rev_by_city = ...
print(rev_by_city)`,
          solution: md`rev_by_city = (orders[orders['status'] == 'delivered']
               .merge(users[['user_id', 'city']], on='user_id')
               .groupby('city')['amount'].sum()
               .sort_values(ascending=False))
print(rev_by_city)`,
          test: md`e = orders[orders.status == 'delivered'].merge(users, on='user_id').groupby('city')['amount'].sum().sort_values(ascending=False)
same_series(rev_by_city, e, 'rev_by_city')`,
        },
        {
          type: 'py', data: ['users'], title: 'Города × каналы',
          text: md`Постройте сводную таблицу ‹pivot›: строки — города, столбцы — каналы, значения — число пользователей. Строки и столбцы отсортированы по алфавиту, пустые ячейки — 0, без итогов.`,
          starter: md`pivot = ...
print(pivot)`,
          solution: md`pivot = pd.pivot_table(users, index='city', columns='channel', values='user_id', aggfunc='count', fill_value=0)
print(pivot)`,
          test: md`import pandas as pd
e = pd.crosstab(users['city'], users['channel'])
assert list(pivot.index) == list(e.index), f'Строки: {list(pivot.index)}'
assert [str(c) for c in pivot.columns] == [str(c) for c in e.columns], f'Столбцы: {list(pivot.columns)}'
import numpy as np
assert np.allclose(pivot.to_numpy(dtype=float), e.to_numpy(dtype=float)), 'Значения не совпадают'`,
          starter_note: '',
          hint: md`‹pd.pivot_table(users, index=..., columns=..., values='user_id', aggfunc='count', fill_value=0)› или ‹pd.crosstab›. Не забудьте ‹import pandas as pd›.`,
        },
        {
          type: 'py', data: ['orders', 'order_items', 'products'], title: 'Выручка по категориям',
          text: md`Посчитайте выручку по категориям товаров для **доставленных** заказов: ‹quantity × price› из ‹order_items› (цена фактическая, с учётом промо). Результат ‹cat_rev› — Series, индекс — категория, по убыванию выручки. Дополнительно сохраните в ‹top_cat_share› долю самой крупной категории в общей выручке.`,
          starter: md`cat_rev = ...
`,
          solution: md`delivered = orders.loc[orders['status'] == 'delivered', ['order_id']]
df = (order_items.merge(delivered, on='order_id')
                 .merge(products[['product_id', 'category']], on='product_id'))
df['rev'] = df['quantity'] * df['price']
cat_rev = df.groupby('category')['rev'].sum().sort_values(ascending=False)
top_cat_share = cat_rev.iloc[0] / cat_rev.sum()
print(cat_rev, top_cat_share)`,
          test: md`d = order_items.merge(orders[orders.status == 'delivered'][['order_id']], on='order_id').merge(products[['product_id', 'category']], on='product_id')
e = (d.quantity * d.price).groupby(d.category).sum().sort_values(ascending=False)
same_series(cat_rev, e, 'cat_rev')
near(top_cat_share, e.iloc[0] / e.sum(), 1e-9, 'top_cat_share')`,
          hint: md`Внимание: в ‹products› тоже есть столбец ‹price› (базовая цена). Возьмите из ‹products› только ‹product_id› и ‹category›, иначе появятся ‹price_x›/‹price_y›.`,
        },
      ],
    },
    {
      title: 'Даты, пропуски и очистка данных',
      theory: md`
## Даты
~~~py
orders['order_date'] = pd.to_datetime(orders['order_date'])   # если пришли строкой
d = orders['order_date']
d.dt.year, d.dt.month, d.dt.day, d.dt.dayofweek   # 0 — понедельник
d.dt.to_period('M')            # месяц как период: 2025-07
d.dt.strftime('%Y-%m')         # строкой
d.dt.to_period('W').dt.start_time   # начало недели
(d - pd.Timestamp('2025-01-01')).dt.days     # разница в днях
d + pd.Timedelta(days=7)
orders.set_index('order_date').resample('W')['amount'].sum()   # агрегат по неделям
~~~

## Пропуски
~~~py
df.isna().sum()                   # пропуски по столбцам
df.dropna(subset=['amount'])      # удалить строки без суммы
df['age'] = df['age'].fillna(df['age'].median())
df['city'] = df['city'].fillna('Не указан')
~~~
Перед заполнением подумайте, **почему** значения пропущены. Заполнение медианой искажает дисперсию; иногда пропуск сам по себе информативен (стоит добавить флаг ‹is_missing›).

## Дубликаты и типы
~~~py
df.duplicated().sum()
df.drop_duplicates()                               # полные дубликаты
df.drop_duplicates(subset=['user_id'], keep='last')
df['amount'] = pd.to_numeric(df['amount'], errors='coerce')   # плохие значения → NaN
df['city'] = df['city'].str.strip().str.title()
df['promo'] = df['promo'].astype(bool)
~~~

## Чек-лист очистки данных
1. Посмотреть ‹shape›, ‹dtypes›, ‹head›, ‹describe›.
2. Привести типы: числа, даты, категории.
3. Нормализовать строки: пробелы, регистр, опечатки (‹value_counts› помогает их найти).
4. Найти дубликаты: полные и по ключу.
5. Разобраться с пропусками.
6. Проверить выбросы и невозможные значения (возраст 250, отрицательная сумма).
7. Сверить итоги с источником: число строк, сумма выручки.
`,
      tasks: [
        {
          type: 'py', data: ['orders'], title: 'Заказы по месяцам',
          text: md`Сохраните в ‹monthly› число заказов (все статусы) по месяцам: Series, индекс — строки вида ‹'2025-01'›, по возрастанию. В ‹best_month› — месяц (строка) с наибольшим числом заказов.`,
          starter: md`monthly = ...
`,
          solution: md`monthly = orders.groupby(orders['order_date'].dt.strftime('%Y-%m')).size()
best_month = monthly.idxmax()
print(monthly, best_month)`,
          test: md`e = orders.groupby(orders.order_date.dt.strftime('%Y-%m')).size()
same_series(monthly, e, 'monthly')
assert str(best_month) == e.idxmax(), f'best_month = {best_month!r}'`,
        },
        {
          type: 'py', data: ['orders'], title: 'Дни недели',
          text: md`Посчитайте долю заказов (все статусы), приходящихся на каждый день недели. ‹weekday_share› — Series с индексом 0…6 (0 — понедельник), сумма значений равна 1. В ‹weekend_share› — суммарная доля субботы и воскресенья.`,
          starter: md`weekday_share = ...
`,
          solution: md`weekday_share = orders['order_date'].dt.dayofweek.value_counts(normalize=True).sort_index()
weekend_share = weekday_share.loc[[5, 6]].sum()
print(weekday_share, weekend_share)`,
          test: md`e = orders.order_date.dt.dayofweek.value_counts(normalize=True).sort_index()
same_series(weekday_share, e, 'weekday_share')
near(weekend_share, e.loc[[5, 6]].sum(), 1e-9, 'weekend_share')`,
        },
        {
          type: 'py', pkgs: ['pandas'], title: 'Очистка грязной выгрузки',
          text: md`В DataFrame ‹raw› типичная «грязная» выгрузка из CRM. Создайте ‹clean›:
1. удалите полные дубликаты строк;
2. в ‹city› уберите пробелы по краям и приведите к виду «Москва» (‹str.title()›);
3. ‹amount› переведите в float (пробелы — разделители тысяч, запятая — десятичная);
4. пропуски в ‹age› заполните медианой возраста (после удаления дубликатов);
5. сбросьте индекс (‹reset_index(drop=True)›).

Столбцы и их порядок оставьте прежними.`,
          setup: md`import pandas as pd, numpy as np
raw = pd.DataFrame({
    'client': ['a1', 'a2', 'a2', 'a3', 'a4', 'a5', 'a5'],
    'city': [' москва', 'Казань ', 'Казань ', 'МОСКВА', 'санкт-петербург', ' казань', ' казань'],
    'amount': ['1 200,50', '890', '890', '15 000', '99,9', '2 000', '2 000'],
    'age': [34, np.nan, np.nan, 41, 29, np.nan, np.nan],
})`,
          starter: md`print(raw)
clean = ...
print(clean)`,
          solution: md`clean = raw.drop_duplicates().copy()
clean['city'] = clean['city'].str.strip().str.title()
clean['amount'] = clean['amount'].str.replace(' ', '').str.replace(',', '.').astype(float)
clean['age'] = clean['age'].fillna(clean['age'].median())
clean = clean.reset_index(drop=True)
print(clean)`,
          test: md`import pandas as pd
e = pd.DataFrame({'client': ['a1', 'a2', 'a3', 'a4', 'a5'],
                  'city': ['Москва', 'Казань', 'Москва', 'Санкт-Петербург', 'Казань'],
                  'amount': [1200.5, 890.0, 15000.0, 99.9, 2000.0],
                  'age': [34.0, 34.0, 41.0, 29.0, 34.0]})
same_df(clean, e, 'clean')`,
          hint: md`Медиана возраста считается по 3 известным значениям (34, 41, 29) = 34. ‹str.title()› превратит «санкт-петербург» в «Санкт-Петербург».`,
        },
      ],
    },
  ],
});
