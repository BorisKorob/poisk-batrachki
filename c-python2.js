(function () {
const { py, pyt, ch, mu, num } = TK;

/* =========================== PYTHON: ПРОДВИНУТЫЙ =========================== */
COURSE.add({
  id: 'py2', title: 'Python: функции, декораторы, ООП', short: 'Функции высшего порядка, замыкания, декораторы, генераторы, классы, dataclass, исключения и контекстные менеджеры.',
  lessons: [
    {
      title: 'Функции высшего порядка и замыкания',
      theory: md`
В Python функция — обычный объект: её можно положить в переменную, передать в другую функцию, вернуть из функции. На этом построены ‹sorted(key=...)›, ‹map›, ‹filter›, ‹apply› в pandas и декораторы.

## *args, **kwargs, keyword-only
~~~py
def report(title, *values, sep=', ', **opts):
    print(title, sep.join(map(str, values)), opts)

report('Выручка', 100, 200, 300, sep=' | ', currency='₽')
# Выручка 100 | 200 | 300 {'currency': '₽'}

def f(a, b, /, c, *, d):   # a, b — только позиционные; d — только по имени
    return a + b + c + d
f(1, 2, 3, d=4)

nums = [3, 1, 2]
print(*nums)               # распаковка списка в аргументы: 3 1 2
params = {'sep': ';'}
report('x', 1, 2, **params)
~~~

## map, filter, reduce, lambda
~~~py
prices = [129, 189, 799]
list(map(lambda p: p * 0.9, prices))          # [116.1, 170.1, 719.1]
list(filter(lambda p: p > 150, prices))       # [189, 799]
from functools import reduce
reduce(lambda acc, x: acc * x, [1, 2, 3, 4])  # 24
any(p > 500 for p in prices), all(p > 100 for p in prices)   # True True
~~~
На практике comprehension читается лучше, чем ‹map›/‹filter› с lambda.

## Замыкания
Вложенная функция «помнит» переменные внешней, даже когда внешняя уже завершилась.
~~~py
def make_discount(rate):
    def apply(price):
        return round(price * (1 - rate), 2)
    return apply

black_friday = make_discount(0.3)
black_friday(1000)     # 700.0

def counter():
    n = 0
    def inc():
        nonlocal n        # без nonlocal присваивание создало бы локальную переменную
        n += 1
        return n
    return inc
~~~

## Области видимости (LEGB)
Имя ищется по порядку: **L**ocal → **E**nclosing (внешняя функция) → **G**lobal (модуль) → **B**uilt-in. Не называйте переменные ‹list›, ‹sum›, ‹max›, ‹id› — вы перекроете встроенные функции.
`,
      tasks: [
        py('Гибкая сумма', md`Напишите функцию ‹total(*amounts, discount=0)›: возвращает сумму всех переданных чисел, уменьшенную на долю ‹discount›, округлённую до 2 знаков.`,
          md`def total(*amounts, discount=0):
    return round(sum(amounts) * (1 - discount), 2)`, ['total(100, 200, 300)', 'total(100, 50, discount=0.1)', 'total()']),
        py('Фабрика скидок', md`Напишите функцию ‹make_discount(rate)›, которая возвращает функцию от цены: цена со скидкой ‹rate›, округлённая до 2 знаков. Создайте ‹minus20 = make_discount(0.2)›.`,
          md`def make_discount(rate):
    def apply(price):
        return round(price * (1 - rate), 2)
    return apply
minus20 = make_discount(0.2)`, ['minus20(1000)', 'minus20(99.9)', 'make_discount(0.5)(10)']),
        py('Счётчик вызовов', md`Напишите ‹make_counter()›, возвращающую функцию без аргументов: при каждом вызове она возвращает число вызовов (1, 2, 3…). Создайте ‹c = make_counter()› и сохраните в ‹res› список ‹[c(), c(), c()]›.`,
          md`def make_counter():
    n = 0
    def inc():
        nonlocal n
        n += 1
        return n
    return inc
c = make_counter()
res = [c(), c(), c()]`, ['res', 'make_counter()()']),
        py('map и filter', md`Дан список цен ‹prices›. Используя ‹map› и ‹filter› (или comprehension), сохраните в ‹vat› список цен с НДС 20% (округление до 2 знаков) только для цен от 100 включительно.`,
          md`vat = [round(p * 1.2, 2) for p in prices if p >= 100]`, ['vat'], { setup: 'prices = [59, 129, 99.99, 100, 799.5, 45]' }),
        py('Произведение через reduce', md`С помощью ‹functools.reduce› посчитайте ‹growth› — итоговый множитель за год, если помесячные темпы роста выручки заданы в списке ‹rates› (например, 0.05 — рост на 5%). Ответ — произведение ‹(1 + r)›.`,
          md`from functools import reduce
growth = reduce(lambda acc, r: acc * (1 + r), rates, 1.0)`, ['growth'], { setup: 'rates = [0.05, -0.02, 0.03, 0.10, -0.04, 0.01, 0.02, 0.0, 0.03, -0.01, 0.04, 0.06]' }),
        py('Сортировка по нескольким ключам', md`Список ‹employees› — кортежи ‹(имя, отдел, зарплата)›. Сохраните в ‹ordered› список имён, отсортированных по отделу по алфавиту, внутри отдела — по убыванию зарплаты.`,
          md`ordered = [e[0] for e in sorted(employees, key=lambda e: (e[1], -e[2]))]`, ['ordered'], { setup: "employees = [('Аня', 'BI', 180), ('Борис', 'DS', 250), ('Вика', 'BI', 210), ('Глеб', 'DS', 190), ('Дина', 'Риски', 230), ('Егор', 'BI', 150)]" }),
        py('Только по имени', md`Напишите функцию ‹price_with_tax(price, *, rate=0.2, digits=2)›, у которой ‹rate› и ‹digits› можно передать только по имени. Возвращает цену с налогом, округлённую до ‹digits›.`,
          md`def price_with_tax(price, *, rate=0.2, digits=2):
    return round(price * (1 + rate), digits)`, ['price_with_tax(100)', 'price_with_tax(99.99, rate=0.1, digits=1)'],
          { test: md`try:
    price_with_tax(100, 0.1)
    raise AssertionError('rate должен передаваться только по имени: price_with_tax(100, 0.1) должна падать с TypeError')
except TypeError:
    pass` }),
        ch('any и all', md`Что вернёт ‹all([])›?`, ['‹True›', '‹False›', '‹None›', 'Ошибку'], 0, md`Для пустой коллекции ‹all› возвращает ‹True› (нет ни одного ложного элемента), а ‹any› — ‹False›.`),
        ch('Изменяемый аргумент по умолчанию', md`Что выведет код?
~~~py
def add(x, items=[]):
    items.append(x)
    return items
add(1); print(add(2))
~~~`, ['‹[2]›', '‹[1, 2]›', '‹[1]›', 'Ошибку'], 1, md`Список по умолчанию создаётся один раз при определении функции и переиспользуется. Правильно: ‹items=None›, а внутри ‹if items is None: items = []›.`),
      ],
    },
    {
      title: 'Декораторы',
      theory: md`
Декоратор — функция, которая принимает функцию и возвращает новую, обычно «обёртку», добавляющую поведение: логирование, замер времени, кэширование, повтор при ошибке, проверку прав.

~~~py
import functools, time

def timer(func):
    @functools.wraps(func)            # сохраняет имя и docstring исходной функции
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f'{func.__name__}: {time.perf_counter() - start:.3f} с')
        return result
    return wrapper

@timer                 # то же самое, что load = timer(load)
def load(n):
    return sum(range(n))
~~~

## Декоратор с параметрами
Нужен ещё один уровень вложенности: функция, которая принимает параметры и возвращает декоратор.
~~~py
def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == times:
                        raise
        return wrapper
    return decorator

@retry(times=5)
def fetch(): ...
~~~

## Встроенные декораторы
- ‹@functools.lru_cache(maxsize=None)› / ‹@functools.cache› — запоминание результатов (мемоизация).
- ‹@property› — метод, который читается как атрибут.
- ‹@staticmethod›, ‹@classmethod› — методы класса.
- ‹@dataclass› — генерирует ‹__init__›, ‹__repr__›, ‹__eq__›.

## Где встречается у аналитика
Кэширование тяжёлых запросов, замер времени этапов пайплайна, ‹@task› в Airflow, ‹@app.get› в FastAPI, ‹@pytest.fixture› в тестах.

> **Сохраняйте состояние в атрибуте обёртки.** Удобный приём: ‹wrapper.calls = 0› внутри декоратора, затем ‹wrapper.calls += 1› при каждом вызове — счётчик доступен как ‹func.calls›.
`,
      tasks: [
        py('Счётчик вызовов', md`Напишите декоратор ‹count_calls›: обёрнутая функция ведёт счётчик в атрибуте ‹calls›. Задекорируйте им ‹def square(x): return x * x› и вызовите ‹square› три раза (с аргументами 2, 3, 4).`,
          md`import functools
def count_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def square(x):
    return x * x

square(2); square(3); square(4)`, ['square.calls', 'square(5)', 'square.__name__']),
        py('Логирование вызова', md`Напишите декоратор ‹log_call›, который перед вызовом печатает строку ‹вызов <имя>(<аргументы через запятую>)› (только позиционные, через ‹repr›), а результат возвращает без изменений. Задекорируйте ‹add(a, b)›, возвращающую сумму, и сохраните в ‹r = add(2, 3)›.`,
          md`import functools
def log_call(func):
    @functools.wraps(func)
    def wrapper(*args):
        print(f"вызов {func.__name__}({', '.join(map(repr, args))})")
        return func(*args)
    return wrapper

@log_call
def add(a, b):
    return a + b
r = add(2, 3)`, ['r', 'add(10, -1)'], { test: md`import io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    add(1, 'x' if False else 2)
assert buf.getvalue().strip() == 'вызов add(1, 2)', f'Печатается: {buf.getvalue().strip()!r}'` }),
        py('Декоратор с параметром', md`Напишите декоратор с параметром ‹round_result(digits)›, округляющий результат функции до ‹digits› знаков. Задекорируйте ‹ratio(a, b)› (возвращает ‹a / b›) с ‹digits=3›.`,
          md`import functools
def round_result(digits):
    def deco(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return round(func(*args, **kwargs), digits)
        return wrapper
    return deco

@round_result(3)
def ratio(a, b):
    return a / b`, ['ratio(1, 3)', 'ratio(2, 7)', 'ratio(10, 4)']),
        py('Повтор при ошибке', md`Напишите декоратор ‹retry(times)›: вызывает функцию до ‹times› раз, пока она не выполнится без исключения; если все попытки упали — пробрасывает последнее исключение. Функция ‹flaky› (уже задана) падает первые 2 раза. Задекорируйте её как ‹safe = retry(3)(flaky)› и сохраните ‹result = safe()›.`,
          md`import functools
def retry(times):
    def deco(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if i == times - 1:
                        raise
        return wrapper
    return deco
safe = retry(3)(flaky)
result = safe()`, ['result'], {
            setup: md`state = {'n': 0}
def flaky():
    state['n'] += 1
    if state['n'] < 3:
        raise ConnectionError('сеть недоступна')
    return 'ok'`,
            test: md`state['n'] = 0
try:
    retry(2)(flaky)()
    raise AssertionError('При двух попытках функция должна пробросить исключение')
except ConnectionError:
    pass` }),
        py('Мемоизация', md`Число путей в сетке ‹paths(m, n)› = ‹paths(m-1, n) + paths(m, n-1)›, ‹paths(m, 0) = paths(0, n) = 1›. Реализуйте рекурсивно с ‹@functools.lru_cache(maxsize=None)› и сохраните ‹p = paths(16, 16)›.`,
          md`import functools
@functools.lru_cache(maxsize=None)
def paths(m, n):
    if m == 0 or n == 0:
        return 1
    return paths(m - 1, n) + paths(m, n - 1)
p = paths(16, 16)`, ['p', 'paths(3, 3)']),
        py('Проверка типов аргументов', md`Напишите декоратор ‹positive›: если среди позиционных аргументов есть число меньше или равное нулю, функция не вызывается, а выбрасывается ‹ValueError›. Задекорируйте ‹area(w, h)›, возвращающую ‹w * h›.`,
          md`import functools
def positive(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if any(isinstance(a, (int, float)) and a <= 0 for a in args):
            raise ValueError('аргументы должны быть положительными')
        return func(*args, **kwargs)
    return wrapper

@positive
def area(w, h):
    return w * h`, ['area(2, 3)', 'area(1.5, 4)'], { test: md`for bad in [(0, 1), (-2, 5)]:
    try:
        area(*bad)
        raise AssertionError(f'area{bad} должна выбросить ValueError')
    except ValueError:
        pass` }),
        ch('Зачем functools.wraps', md`Что произойдёт, если в декораторе не использовать ‹@functools.wraps(func)›?`, ['Декоратор не будет работать', 'У обёрнутой функции имя и docstring станут ‹wrapper› и его документацией', 'Функция будет выполняться дважды', 'Ничего не изменится'], 1, md`Без ‹wraps› ‹func.__name__› станет ‹'wrapper'›, потеряется docstring — это мешает логированию, отладке и документации.`),
        ch('Порядок декораторов', md`В каком порядке применяются декораторы?
~~~py
@a
@b
def f(): ...
~~~`, ['‹f = a(b(f))›', '‹f = b(a(f))›', 'Одновременно', 'Только ‹a›'], 0, md`Декораторы применяются снизу вверх: сначала ближайший к функции (‹b›), затем ‹a›.`),
      ],
    },
    {
      title: 'Итераторы и генераторы',
      theory: md`
**Итерируемый объект** — то, по чему можно пройти ‹for›: список, строка, словарь, файл. **Итератор** выдаёт элементы по одному через ‹next()› и помнит позицию.

## Генераторы
Функция с ‹yield› возвращает генератор: значения вычисляются лениво, по запросу, и не хранятся в памяти целиком. Это ключ к обработке файлов, которые не помещаются в память.
~~~py
def read_big_file(path):
    with open(path, encoding='utf-8') as f:
        for line in f:                 # файл читается построчно
            yield line.rstrip('\n')

def batches(items, size):
    for i in range(0, len(items), size):
        yield items[i:i + size]

list(batches([1, 2, 3, 4, 5], 2))      # [[1, 2], [3, 4], [5]]

gen = (x * x for x in range(10**9))    # генераторное выражение: память не тратится
next(gen), next(gen)                   # 0 1
sum(x for x in range(1_000_000) if x % 3 == 0)
~~~

## Полезные встроенные
~~~py
enumerate(seq, start=1)       # пары (номер, элемент)
zip(a, b)                     # параллельный обход, до кратчайшего
zip(*pairs)                   # «транспонирование» списка пар
reversed(seq), sorted(seq)
iter(), next(it, default)
~~~

## itertools
~~~py
import itertools as it
list(it.islice(gen, 5))                       # первые 5 элементов любого итератора
list(it.chain([1, 2], [3]))                   # [1, 2, 3]
list(it.accumulate([1, 2, 3, 4]))             # [1, 3, 6, 10] — нарастающий итог
list(it.combinations('ABC', 2))               # AB AC BC
list(it.product([0, 1], repeat=2))            # все пары
for key, grp in it.groupby(sorted(words, key=len), key=len): ...   # группировка отсортированного
list(it.pairwise([1, 4, 9]))                  # (1, 4), (4, 9) — Python 3.10+
~~~

> **Генератор одноразовый.** После того как вы прошли его до конца, он пуст. Если данные нужны дважды — сохраните в список.
`,
      tasks: [
        py('Генератор пачек', md`Напишите генератор ‹batches(items, size)›, выдающий список кусками длины ‹size› (последний может быть короче). Сохраните ‹parts = list(batches(list(range(1, 11)), 4))›.`,
          md`def batches(items, size):
    for i in range(0, len(items), size):
        yield items[i:i + size]
parts = list(batches(list(range(1, 11)), 4))`, ['parts', 'list(batches([], 3))', "list(batches('abcde', 2))"],
          { test: md`import types
assert isinstance(batches([1], 1), types.GeneratorType), 'batches должна быть генератором (используйте yield)'` }),
        py('Скользящее окно', md`Напишите генератор ‹windows(seq, k)›, выдающий кортежи из ‹k› подряд идущих элементов. Сохраните ‹ma3› — список скользящих средних по 3 точкам (округлить до 2 знаков) для ‹sales›.`,
          md`def windows(seq, k):
    for i in range(len(seq) - k + 1):
        yield tuple(seq[i:i + k])
ma3 = [round(sum(w) / 3, 2) for w in windows(sales, 3)]`, ['ma3', 'list(windows([1, 2, 3, 4], 2))'], { setup: 'sales = [120, 135, 150, 110, 160, 170, 155, 180]' }),
        py('Бесконечный генератор', md`Напишите бесконечный генератор ‹fib()› чисел Фибоначчи (0, 1, 1, 2, 3, …). С помощью ‹itertools.islice› сохраните в ‹first15› первые 15 чисел, а в ‹first_big› — первое число Фибоначчи больше 1000.`,
          md`import itertools as it
def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
first15 = list(it.islice(fib(), 15))
first_big = next(x for x in fib() if x > 1000)`, ['first15', 'first_big']),
        py('Нарастающий итог', md`С помощью ‹itertools.accumulate› постройте ‹cum› — нарастающую сумму выручки ‹daily›, и найдите ‹day_100k› — номер дня (с 1), в который нарастающий итог впервые достиг 100 000.`,
          md`import itertools as it
cum = list(it.accumulate(daily))
day_100k = next(i for i, v in enumerate(cum, start=1) if v >= 100_000)`, ['cum', 'day_100k'], { setup: 'daily = [12000, 15500, 9800, 14300, 17100, 11000, 16400, 13900, 15800, 12600]' }),
        py('Все пары товаров', md`Для корзины ‹basket› сохраните в ‹pairs› список всех пар товаров (кортежи из 2, порядок как в ‹itertools.combinations›), а в ‹n_pairs› — их количество.`,
          md`import itertools as it
pairs = list(it.combinations(basket, 2))
n_pairs = len(pairs)`, ['pairs', 'n_pairs'], { setup: "basket = ['молоко', 'хлеб', 'сыр', 'кофе', 'яблоки']" }),
        py('Группировка подряд идущих', md`В ‹statuses› — статусы сервиса по минутам. С помощью ‹itertools.groupby› найдите ‹longest_down› — длину самой длинной серии подряд идущих ‹'down'›, и ‹n_incidents› — количество таких серий.`,
          md`import itertools as it
runs = [len(list(g)) for k, g in it.groupby(statuses) if k == 'down']
longest_down = max(runs)
n_incidents = len(runs)`, ['longest_down', 'n_incidents'], { setup: "statuses = ['up','up','down','down','up','down','down','down','up','up','down','up','down','down']" }),
        py('zip и транспонирование', md`Список ‹rows› — пары ‹(город, выручка)›. С помощью ‹zip(*rows)› получите кортежи ‹cities› и ‹revenues›, а затем словарь ‹share› город → доля выручки (округление до 3 знаков).`,
          md`cities, revenues = zip(*rows)
total = sum(revenues)
share = {c: round(r / total, 3) for c, r in zip(cities, revenues)}`, ['cities', 'revenues', 'share'], { setup: "rows = [('Москва', 520), ('Казань', 180), ('Пермь', 95), ('Сочи', 205)]" }),
        ch('Генератор дважды', md`Что выведет код?
~~~py
g = (x for x in [1, 2, 3])
print(sum(g), sum(g))
~~~`, ['‹6 6›', '‹6 0›', '‹0 0›', 'Ошибку'], 1, md`Генератор одноразовый: первая ‹sum› прошла его до конца, вторая получила пустую последовательность.`),
        ch('Память', md`Нужно посчитать сумму квадратов чисел от 1 до 100 млн. Какой вариант экономнее по памяти?`, ['‹sum([x*x for x in range(1, 10**8 + 1)])›', '‹sum(x*x for x in range(1, 10**8 + 1))›', 'Одинаково', '‹sum(list(map(...)))›'], 1, md`Генераторное выражение не создаёт список из 100 млн элементов, значения вычисляются по одному.`),
      ],
    },
    {
      title: 'Классы, dataclass, исключения и with',
      theory: md`
## Классы
Класс объединяет данные (атрибуты) и поведение (методы).
~~~py
class Order:
    vat = 0.2                               # атрибут класса — общий для всех

    def __init__(self, order_id, items):
        self.order_id = order_id            # атрибуты экземпляра
        self.items = items                  # список (название, цена, кол-во)

    @property
    def total(self):                        # читается как атрибут: order.total
        return sum(p * q for _, p, q in self.items)

    def with_vat(self):
        return round(self.total * (1 + self.vat), 2)

    def __repr__(self):
        return f'Order({self.order_id}, total={self.total})'

    def __len__(self):
        return len(self.items)

o = Order(1, [('чай', 199, 2), ('кофе', 799, 1)])
o.total, o.with_vat(), len(o)
~~~
Методы с двойным подчёркиванием (‹__init__›, ‹__repr__›, ‹__len__›, ‹__eq__›, ‹__lt__›, ‹__add__›) определяют, как объект ведёт себя со встроенными операциями.

## Наследование
~~~py
class PromoOrder(Order):
    def __init__(self, order_id, items, discount):
        super().__init__(order_id, items)
        self.discount = discount

    @property
    def total(self):
        return super().total * (1 - self.discount)
~~~

## dataclass
Для «записей» с данными не нужно писать ‹__init__› руками:
~~~py
from dataclasses import dataclass, field

@dataclass(order=True)
class Product:
    price: float
    name: str = field(compare=False)
    tags: list = field(default_factory=list, compare=False)

sorted([Product(799, 'кофе'), Product(199, 'чай')])   # по цене
~~~

## Исключения
~~~py
class DataQualityError(Exception):
    pass

def check(df):
    if df['amount'].lt(0).any():
        raise DataQualityError('отрицательные суммы')

try:
    check(df)
except DataQualityError as e:
    print('Ошибка качества данных:', e)
else:
    print('всё хорошо')            # если исключения не было
finally:
    print('проверка завершена')    # всегда
~~~

## Контекстные менеджеры (with)
‹with› гарантирует освобождение ресурса (закрытие файла, соединения), даже если внутри случилась ошибка.
~~~py
from contextlib import contextmanager
import time

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f'{label}: {time.perf_counter() - start:.2f} с')

with timer('загрузка'):
    data = load()
~~~
Класс-менеджер реализует ‹__enter__› и ‹__exit__›.
`,
      tasks: [
        py('Класс заказа', md`Создайте класс ‹Order› с конструктором ‹Order(order_id, items)›, где ‹items› — список кортежей ‹(название, цена, количество)›. Добавьте свойство ‹total› (сумма), метод ‹most_expensive()› (название позиции с максимальной стоимостью ‹цена × кол-во›) и ‹__len__› (число позиций). Создайте ‹o = Order(7, [('чай', 199, 2), ('кофе', 799, 1), ('сыр', 319, 3)])›.`,
          md`class Order:
    def __init__(self, order_id, items):
        self.order_id = order_id
        self.items = items

    @property
    def total(self):
        return sum(p * q for _, p, q in self.items)

    def most_expensive(self):
        return max(self.items, key=lambda it: it[1] * it[2])[0]

    def __len__(self):
        return len(self.items)

o = Order(7, [('чай', 199, 2), ('кофе', 799, 1), ('сыр', 319, 3)])`, ['o.total', 'o.most_expensive()', 'len(o)', "Order(1, [('x', 10, 1)]).total"]),
        py('Наследование', md`Используя класс ‹Order› из условия (он уже задан), создайте наследника ‹PromoOrder(order_id, items, discount)›, у которого ‹total› учитывает скидку (округление до 2 знаков). Создайте ‹p = PromoOrder(8, [('чай', 199, 2), ('кофе', 799, 1)], 0.15)›.`,
          md`class PromoOrder(Order):
    def __init__(self, order_id, items, discount):
        super().__init__(order_id, items)
        self.discount = discount

    @property
    def total(self):
        return round(super().total * (1 - self.discount), 2)

p = PromoOrder(8, [('чай', 199, 2), ('кофе', 799, 1)], 0.15)`, ['p.total', 'isinstance(p, Order)', 'p.order_id'], {
            setup: md`class Order:
    def __init__(self, order_id, items):
        self.order_id = order_id
        self.items = items
    @property
    def total(self):
        return sum(p * q for _, p, q in self.items)` }),
        py('Сравнение и сложение', md`Создайте класс ‹Money(amount, currency)›. Реализуйте:
- ‹__add__›: сложение сумм одной валюты (новый объект); при разных валютах — ‹ValueError›;
- ‹__eq__›: равенство по сумме и валюте;
- ‹__repr__›: строка вида ‹150.00 RUB›.

Сохраните ‹s = Money(100, 'RUB') + Money(50, 'RUB')›.`,
          md`class Money:
    def __init__(self, amount, currency):
        self.amount = amount
        self.currency = currency
    def __add__(self, other):
        if self.currency != other.currency:
            raise ValueError('разные валюты')
        return Money(self.amount + other.amount, self.currency)
    def __eq__(self, other):
        return isinstance(other, Money) and (self.amount, self.currency) == (other.amount, other.currency)
    def __repr__(self):
        return f'{self.amount:.2f} {self.currency}'

s = Money(100, 'RUB') + Money(50, 'RUB')`, ['repr(s)', "s == Money(150, 'RUB')", "Money(1, 'USD') == Money(1, 'RUB')"],
          { test: md`try:
    Money(1, 'USD') + Money(1, 'RUB')
    raise AssertionError('Сложение разных валют должно выбрасывать ValueError')
except ValueError:
    pass` }),
        py('dataclass', md`Опишите ‹@dataclass› ‹Employee› с полями ‹name: str›, ‹dept: str›, ‹salary: float›. Из списка ‹raw› (кортежи) создайте список объектов ‹staff›, а в ‹top› сохраните имя сотрудника с максимальной зарплатой, в ‹by_dept› — словарь отдел → средняя зарплата.`,
          md`from dataclasses import dataclass
@dataclass
class Employee:
    name: str
    dept: str
    salary: float

staff = [Employee(*r) for r in raw]
top = max(staff, key=lambda e: e.salary).name
by_dept = {}
for e in staff:
    by_dept.setdefault(e.dept, []).append(e.salary)
by_dept = {d: sum(v) / len(v) for d, v in by_dept.items()}`, ['top', 'by_dept', 'len(staff)', "repr(staff[0]).startswith('Employee(')"], { setup: "raw = [('Аня', 'BI', 180000), ('Борис', 'DS', 250000), ('Вика', 'BI', 210000), ('Глеб', 'DS', 190000)]" }),
        py('Своё исключение', md`Создайте исключение ‹NegativeAmountError(ValueError)›. Напишите функцию ‹validate(amounts)›, которая выбрасывает его с сообщением ‹'позиция N: значение'› для первой отрицательной суммы (N — индекс с нуля), иначе возвращает сумму. Сохраните ‹msg› — текст исключения для списка ‹[100, 50, -20, -5]›.`,
          md`class NegativeAmountError(ValueError):
    pass

def validate(amounts):
    for i, a in enumerate(amounts):
        if a < 0:
            raise NegativeAmountError(f'позиция {i}: {a}')
    return sum(amounts)

try:
    validate([100, 50, -20, -5])
except NegativeAmountError as e:
    msg = str(e)`, ['msg', 'validate([1, 2, 3])', 'issubclass(NegativeAmountError, ValueError)']),
        py('try / except / else', md`Функция ‹safe_ratio(a, b)› возвращает ‹a / b›, а при делении на ноль — ‹None›; при нечисловых аргументах (‹TypeError›) — строку ‹'ошибка типа'›. Посчитайте ‹results› для списка пар ‹pairs›.`,
          md`def safe_ratio(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
    except TypeError:
        return 'ошибка типа'

results = [safe_ratio(a, b) for a, b in pairs]`, ['results'], { setup: "pairs = [(10, 4), (5, 0), ('7', 2), (0, 3)]" }),
        py('Контекстный менеджер', md`С помощью ‹@contextmanager› напишите ‹collect(log)›: при входе добавляет в список ‹log› строку ‹'start'›, при выходе — ‹'end'›, даже если внутри было исключение (используйте ‹try/finally›). Выполните блок ‹with collect(log): log.append('work')›, затем блок, внутри которого выбрасывается и перехватывается снаружи ‹ValueError›.`,
          md`from contextlib import contextmanager
@contextmanager
def collect(log):
    log.append('start')
    try:
        yield
    finally:
        log.append('end')

log = []
with collect(log):
    log.append('work')
try:
    with collect(log):
        raise ValueError
except ValueError:
    pass`, ['log']),
        ch('self', md`Что такое ‹self› в методе класса?`, ['Ключевое слово Python', 'Ссылка на экземпляр, у которого вызван метод', 'Ссылка на класс', 'Глобальная переменная'], 1, md`‹self› — обычный первый параметр, в который Python передаёт экземпляр: ‹o.total()› превращается в ‹Order.total(o)›.`),
        ch('finally', md`Когда выполняется блок ‹finally›?`, ['Только при ошибке', 'Только без ошибки', 'Всегда, даже после return в try', 'Никогда, если есть else'], 2, md`‹finally› выполняется всегда: после успешного выполнения, после исключения и даже после ‹return› внутри ‹try›.`),
      ],
    },
  ],
});

/* =========================== ФАЙЛЫ И ФОРМАТЫ =========================== */
COURSE.add({
  id: 'pyfiles', title: 'Файлы, форматы, регулярки, даты', short: 'open и pathlib, CSV, JSON, Excel/Parquet, регулярные выражения, datetime и логи.',
  lessons: [
    {
      title: 'Текстовые файлы и pathlib',
      theory: md`
## open
~~~py
with open('report.txt', 'w', encoding='utf-8') as f:     # 'w' — перезаписать, 'a' — дописать
    f.write('Выручка: 1200\n')
    print('Заказов: 15', file=f)

with open('report.txt', encoding='utf-8') as f:          # 'r' по умолчанию
    text = f.read()            # весь файл строкой
# или построчно — экономно по памяти:
with open('report.txt', encoding='utf-8') as f:
    for line in f:
        print(line.rstrip('\n'))
lines = open('report.txt', encoding='utf-8').read().splitlines()
~~~
Всегда указывайте ‹encoding='utf-8'›: на Windows по умолчанию используется cp1251, и кириллица «ломается». Бинарные файлы открывают в режиме ‹'rb'›/‹'wb'›.

## pathlib — пути как объекты
~~~py
from pathlib import Path
p = Path('data') / '2025' / 'sales.csv'     # склейка путей без забот о слэшах
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text('a,b\n1,2\n', encoding='utf-8')
p.read_text(encoding='utf-8')
p.exists(), p.name, p.stem, p.suffix         # True 'sales.csv' 'sales' '.csv'
list(Path('data').rglob('*.csv'))            # все CSV во вложенных папках
p.stat().st_size                             # размер в байтах
~~~
В модуле ‹os› есть то же самое старым стилем: ‹os.listdir›, ‹os.path.join›, ‹os.makedirs›.

> В задачах этого модуля файловая система — виртуальная, внутри браузера. Файлы, которые создаёт условие задачи, уже лежат в текущей папке.
`,
      tasks: [
        py('Запись и чтение', md`Запишите в файл ‹hello.txt› три строки: ‹Москва›, ‹Казань›, ‹Пермь› (каждая на своей строке). Затем прочитайте файл и сохраните в ‹cities› список строк без символов перевода строки.`,
          md`with open('hello.txt', 'w', encoding='utf-8') as f:
    f.write('Москва\nКазань\nПермь\n')
with open('hello.txt', encoding='utf-8') as f:
    cities = f.read().splitlines()`, ['cities'], { test: md`assert open('hello.txt', encoding='utf-8').read().split() == ['Москва', 'Казань', 'Пермь'], 'Содержимое hello.txt неверное'` }),
        py('Подсчёт строк лога', md`В файле ‹app.log› журнал сервера. Посчитайте ‹n_lines› — число строк, ‹n_errors› — число строк, содержащих ‹ERROR›, и ‹error_share› — их долю.`,
          md`with open('app.log', encoding='utf-8') as f:
    lines = f.read().splitlines()
n_lines = len(lines)
n_errors = sum('ERROR' in l for l in lines)
error_share = n_errors / n_lines`, ['n_lines', 'n_errors', 'error_share'], {
            setup: md`import random
random.seed(5)
lvls = ['INFO'] * 7 + ['WARNING'] * 2 + ['ERROR']
with open('app.log', 'w', encoding='utf-8') as f:
    for i in range(237):
        f.write(f'2025-07-{1 + i % 30:02d} 12:{i % 60:02d}:00 {random.choice(lvls)} request {i}\n')` }),
        py('Дописать в файл', md`Файл ‹visits.txt› уже существует. Допишите в конец две строки ‹2025-07-30,140› и ‹2025-07-31,152› (режим ‹'a'›), затем посчитайте ‹total› — сумму чисел после запятой во всех строках файла.`,
          md`with open('visits.txt', 'a', encoding='utf-8') as f:
    f.write('2025-07-30,140\n2025-07-31,152\n')
with open('visits.txt', encoding='utf-8') as f:
    total = sum(int(line.split(',')[1]) for line in f if line.strip())`, ['total'], {
            setup: md`with open('visits.txt', 'w', encoding='utf-8') as f:
    f.write('2025-07-27,120\n2025-07-28,135\n2025-07-29,128\n')` }),
        py('pathlib: поиск файлов', md`В папке ‹reports› лежат файлы во вложенных папках. С помощью ‹Path.rglob› сохраните в ‹csv_names› отсортированный список **имён** всех ‹.csv›-файлов, а в ‹total_size› — их суммарный размер в байтах.`,
          md`from pathlib import Path
files = sorted(Path('reports').rglob('*.csv'))
csv_names = sorted(p.name for p in files)
total_size = sum(p.stat().st_size for p in files)`, ['csv_names', 'total_size'], {
            setup: md`from pathlib import Path
import shutil
shutil.rmtree('reports', ignore_errors=True)
for path, text in [('reports/2025/jan.csv', 'a,b\n1,2\n'), ('reports/2025/feb.csv', 'a,b\n3,4\n5,6\n'), ('reports/2024/dec.csv', 'a\n1\n'), ('reports/readme.txt', 'hello'), ('reports/2025/notes.md', '# x')]:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(text, encoding='utf-8')` }),
        py('Части пути', md`Для строки ‹path = 'data/2025/07/sales_moscow.csv'› с помощью ‹Path› получите ‹name›, ‹stem›, ‹suffix› и ‹parent› (строкой).`,
          md`from pathlib import Path
p = Path(path)
name, stem, suffix, parent = p.name, p.stem, p.suffix, str(p.parent)`, ['name', 'stem', 'suffix', 'parent'], { setup: "path = 'data/2025/07/sales_moscow.csv'" }),
        py('Самое частое слово', md`В файле ‹review.txt› отзыв клиента. Приведите текст к нижнему регистру, выделите слова (последовательности букв, используйте ‹re.findall(r'[а-яёa-z]+', text)›) и сохраните в ‹top3› три самых частых слова длиной от 4 букв как список кортежей ‹(слово, частота)› (как ‹Counter.most_common›).`,
          md`import re
from collections import Counter
text = open('review.txt', encoding='utf-8').read().lower()
words = [w for w in re.findall(r'[а-яёa-z]+', text) if len(w) >= 4]
top3 = Counter(words).most_common(3)`, ['top3'], {
            setup: md`open('review.txt', 'w', encoding='utf-8').write('Доставка быстрая, курьер вежливый. Но доставка опоздала на час, а курьер не позвонил. Продукты свежие, продукты хорошие, доставка в целом нормальная. Курьер молодец!')` }),
        ch('Кодировка', md`Почему в ‹open()› стоит явно указывать ‹encoding='utf-8'›?`, ['Так быстрее', 'Иначе на Windows файл может прочитаться в cp1251 и кириллица превратится в «кракозябры»', 'Без этого нельзя записывать файл', 'Это нужно только для бинарных файлов'], 1, md`Кодировка по умолчанию зависит от системы. Явная ‹utf-8› делает код переносимым.`),
      ],
    },
    {
      title: 'CSV, JSON, Excel и Parquet',
      theory: md`
## CSV модулем csv
~~~py
import csv
with open('orders.csv', newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):              # каждая строка — словарь
        print(row['order_id'], float(row['amount']))

with open('out.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['city', 'revenue'])
    w.writeheader()
    w.writerows([{'city': 'Москва', 'revenue': 100}])
~~~
‹csv› правильно обрабатывает кавычки и запятые внутри полей — не разбирайте CSV через ‹split(',')›.

## pandas
~~~py
df = pd.read_csv('orders.csv', sep=';', decimal=',', encoding='cp1251', parse_dates=['date'], dtype={'inn': str})
df.to_csv('out.csv', index=False)
pd.read_excel('report.xlsx', sheet_name='Лист1')        # нужен openpyxl
df.to_excel('out.xlsx', index=False)
pd.read_parquet('big.parquet')                         # колоночный формат: быстро и компактно
pd.read_json('data.json'); pd.json_normalize(records)  # вложенный JSON → таблица
~~~

## JSON
JSON — текстовый формат обмена данными: объекты ‹{}›, массивы ‹[]›, строки, числа, ‹true/false/null›. Так отвечают почти все API.
~~~py
import json
s = json.dumps({'city': 'Москва', 'users': 760}, ensure_ascii=False, indent=2)   # объект → строка
obj = json.loads(s)                                                             # строка → объект
with open('config.json', 'w', encoding='utf-8') as f:
    json.dump(obj, f, ensure_ascii=False)
with open('config.json', encoding='utf-8') as f:
    cfg = json.load(f)
~~~
‹ensure_ascii=False› сохраняет кириллицу читаемой. Даты в JSON не поддерживаются — храните строкой в ISO-формате (‹2025-07-31›).

## Какой формат выбрать
| Формат | Когда |
|---|---|
| CSV | обмен с людьми и Excel, небольшие данные |
| Excel | отчёты для бизнеса |
| JSON | API, конфиги, вложенные структуры |
| Parquet | большие таблицы в аналитике и DWH: типы, сжатие, быстрое чтение столбцов |
`,
      tasks: [
        py('csv.DictReader', md`Файл ‹sales.csv› (разделитель — запятая). С помощью модуля ‹csv› посчитайте ‹rev_by_city› — словарь город → сумма ‹amount› (float), и ‹n_rows›.`,
          md`import csv
rev_by_city, n_rows = {}, 0
with open('sales.csv', newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        n_rows += 1
        rev_by_city[row['city']] = rev_by_city.get(row['city'], 0) + float(row['amount'])`, ['rev_by_city', 'n_rows'], {
            setup: md`open('sales.csv', 'w', encoding='utf-8').write('order_id,city,amount\n1,Москва,1200.5\n2,Казань,800\n3,Москва,450\n4,"Санкт-Петербург",990.9\n5,Казань,310\n6,Москва,2000\n')` }),
        py('Запись CSV', md`Из словаря ‹stats› запишите файл ‹summary.csv› с заголовком ‹city,users› (по строке на город, в порядке словаря) через ‹csv.writer›. Сохраните в ‹content› текст получившегося файла.`,
          md`import csv
with open('summary.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['city', 'users'])
    for city, n in stats.items():
        w.writerow([city, n])
content = open('summary.csv', encoding='utf-8').read()`, ['content'], { setup: "stats = {'Москва': 760, 'Казань': 280, 'Пермь': 95}" }),
        py('Кривой CSV в pandas', md`Файл ‹bank.csv› выгружен из 1С: разделитель ‹;›, десятичная запятая. Прочитайте его в DataFrame ‹df› с помощью ‹pd.read_csv›, а в ‹total› сохраните сумму столбца ‹Сумма›.`,
          md`df = pd.read_csv('bank.csv', sep=';', decimal=',')
total = df['Сумма'].sum()`, ['total', 'df.shape', 'list(df.columns)'], {
            pkgs: ['pandas'], setup: md`open('bank.csv', 'w', encoding='utf-8').write('Дата;Контрагент;Сумма\n01.07.2025;ООО Ромашка;1500,50\n02.07.2025;ИП Петров;320,00\n03.07.2025;АО Вектор;12000,75\n')` }),
        py('JSON: чтение ответа API', md`В строке ‹raw› — ответ API в JSON. Разберите его и сохраните: ‹n_users› — число пользователей, ‹paying› — отсортированный список имён тех, у кого ‹is_paying› истинно, ‹avg_age› — средний возраст.`,
          md`import json
data = json.loads(raw)
users = data['users']
n_users = len(users)
paying = sorted(u['name'] for u in users if u['is_paying'])
avg_age = sum(u['age'] for u in users) / n_users`, ['n_users', 'paying', 'avg_age'], {
            setup: md`raw = '{"status": "ok", "users": [{"name": "Ира", "age": 28, "is_paying": true}, {"name": "Олег", "age": 35, "is_paying": false}, {"name": "Аня", "age": 22, "is_paying": true}, {"name": "Петя", "age": 41, "is_paying": false}]}'` }),
        py('JSON: запись конфига', md`Сохраните словарь ‹cfg› в файл ‹config.json› с ‹ensure_ascii=False› и ‹indent=2›, затем прочитайте его обратно в ‹loaded›. В ‹has_cyrillic› запишите ‹True›, если в тексте файла есть подстрока ‹Москва› (то есть кириллица не экранирована).`,
          md`import json
with open('config.json', 'w', encoding='utf-8') as f:
    json.dump(cfg, f, ensure_ascii=False, indent=2)
with open('config.json', encoding='utf-8') as f:
    loaded = json.load(f)
has_cyrillic = 'Москва' in open('config.json', encoding='utf-8').read()`, ['loaded', 'has_cyrillic'], { setup: "cfg = {'city': 'Москва', 'threshold': 0.05, 'metrics': ['dau', 'arpu']}" }),
        py('Вложенный JSON в таблицу', md`В ‹records› — заказы с вложенным клиентом. С помощью ‹pd.json_normalize› получите DataFrame ‹df› с колонками ‹id›, ‹amount›, ‹client.name›, ‹client.city› и найдите ‹rev_by_city› — Series выручки по ‹client.city›, отсортированную по убыванию.`,
          md`df = pd.json_normalize(records)
rev_by_city = df.groupby('client.city')['amount'].sum().sort_values(ascending=False)`, ['rev_by_city', 'sorted(df.columns)'], {
            pkgs: ['pandas'], setup: md`records = [{'id': 1, 'amount': 500, 'client': {'name': 'Ира', 'city': 'Казань'}}, {'id': 2, 'amount': 1500, 'client': {'name': 'Олег', 'city': 'Москва'}}, {'id': 3, 'amount': 700, 'client': {'name': 'Аня', 'city': 'Казань'}}, {'id': 4, 'amount': 300, 'client': {'name': 'Петя', 'city': 'Пермь'}}]` }),
        py('Склейка выгрузок', md`В папке ‹daily› лежат CSV-файлы за разные дни с одинаковыми колонками. Прочитайте все и склейте в ‹df› (‹pd.concat›, ‹ignore_index=True›, порядок файлов — по имени). Добавьте колонку ‹file› с именем файла. Сохраните ‹rows_per_file› — словарь имя файла → число строк.`,
          md`from pathlib import Path
parts = []
for p in sorted(Path('daily').glob('*.csv')):
    d = pd.read_csv(p)
    d['file'] = p.name
    parts.append(d)
df = pd.concat(parts, ignore_index=True)
rows_per_file = df['file'].value_counts().to_dict()`, ['rows_per_file', 'df.shape', 'round(df.amount.sum(), 2)'], {
            pkgs: ['pandas'], setup: md`from pathlib import Path
Path('daily').mkdir(exist_ok=True)
Path('daily/2025-07-01.csv').write_text('order_id,amount\n1,100\n2,250.5\n', encoding='utf-8')
Path('daily/2025-07-02.csv').write_text('order_id,amount\n3,90\n', encoding='utf-8')
Path('daily/2025-07-03.csv').write_text('order_id,amount\n4,400\n5,120\n6,75.25\n', encoding='utf-8')` }),
        ch('Parquet', md`Почему в аналитике большие таблицы часто хранят в Parquet, а не в CSV?`, ['Parquet читается в Excel', 'Колоночный формат хранит типы, сжимается и позволяет читать только нужные столбцы', 'CSV не поддерживает числа', 'Parquet — это текстовый формат'], 1, md`Parquet бинарный и колоночный: меньше места, быстрее чтение, типы данных сохраняются.`),
      ],
    },
    {
      title: 'Регулярные выражения',
      theory: md`
Регулярные выражения (модуль ‹re›) ищут и извлекают фрагменты текста по шаблону: телефоны, email, номера договоров, суммы из комментариев, UTM-метки.

## Синтаксис
| Шаблон | Значит |
|---|---|
| ‹\d› / ‹\D› | цифра / не цифра |
| ‹\w› | буква, цифра или ‹_› (кириллица тоже) |
| ‹\s› | пробельный символ |
| ‹.› | любой символ, кроме перевода строки |
| ‹[абв]›, ‹[0-9a-f]›, ‹[^0-9]› | набор символов / отрицание |
| ‹*›, ‹+›, ‹?›, ‹{2,4}› | 0+, 1+, 0 или 1, от 2 до 4 повторов |
| ‹^›, ‹$› | начало и конец строки |
| ‹( )› | группа (захват) |
| ‹(?P<name>...)› | именованная группа |
| ‹a|b› | или |

## Функции
~~~py
import re
text = 'Заказ №123 на 1 500 ₽, заказ №456 на 990 ₽'
re.findall(r'№(\d+)', text)                 # ['123', '456']
re.search(r'(\d+) ₽', text).group(1)        # первое совпадение
re.sub(r'\s+', ' ', '  много   пробелов ')  # замена
re.split(r'[;,]\s*', 'a, b;c')              # ['a', 'b', 'c']
re.fullmatch(r'\d{6}', '123456')            # проверка формата целиком
m = re.search(r'(?P<user>[\w.]+)@(?P<domain>[\w.]+)', 'mail: ivan.p@ya.ru')
m.group('domain')                           # 'ya.ru'
~~~
Пишите шаблоны в «сырых» строках ‹r'...'›, чтобы обратные слэши не экранировались. Квантификаторы жадные; ‹*?› и ‹+?› — ленивые.

В pandas: ‹df['col'].str.contains(r'...', regex=True)›, ‹.str.extract(r'(\d+)')›, ‹.str.replace(r'...', '', regex=True)›.
`,
      tasks: [
        py('Номера заказов', md`Из строки ‹text› извлеките все номера заказов (цифры после ‹№›) списком целых чисел ‹ids›.`,
          md`import re
ids = [int(x) for x in re.findall(r'№\s?(\d+)', text)]`, ['ids'], { setup: "text = 'Клиент жалуется на заказ №1024 и № 2048, а также на №77. Номер телефона 89991234567 не трогать.'" }),
        py('Телефоны', md`Нормализуйте телефоны из списка ‹phones› к виду ‹+7XXXXXXXXXX› (оставьте только цифры, ведущую ‹8› замените на ‹7›). Некорректные (не 11 цифр после очистки) замените на ‹None›. Результат — ‹clean›.`,
          md`import re
def norm(p):
    d = re.sub(r'\D', '', p)
    if len(d) == 11 and d[0] in '78':
        return '+7' + d[1:]
    return None
clean = [norm(p) for p in phones]`, ['clean'], { setup: "phones = ['8 (999) 123-45-67', '+7 912 000 11 22', '79161234567', '12345', '8-800-555-35-35']" }),
        py('Валидация email', md`Напишите функцию ‹is_email(s)›: ‹True›, если строка целиком соответствует шаблону «логин@домен.зона» (логин — латинские буквы, цифры, точки, дефисы, подчёркивания; домен — буквы, цифры, дефисы и точки; зона — 2–6 латинских букв). Сохраните ‹valid› — список валидных адресов из ‹emails›.`,
          md`import re
def is_email(s):
    return re.fullmatch(r'[\w.\-]+@[A-Za-z0-9\-.]+\.[A-Za-z]{2,6}', s) is not None
valid = [e for e in emails if is_email(e)]`, ['valid'], { setup: "emails = ['ivan@ya.ru', 'bad@', 'olga.p-k@mail.example.com', 'no at sign', 'x@y.z', 'a_b@corp.travel']" }),
        py('UTM-метки', md`Из ссылок ‹urls› извлеките значение параметра ‹utm_source› (или ‹None›, если его нет). Сохраните ‹sources› и ‹counts› — словарь источник → число ссылок (без ‹None›).`,
          md`import re
from collections import Counter
sources = [(m.group(1) if (m := re.search(r'[?&]utm_source=([^&#]+)', u)) else None) for u in urls]
counts = dict(Counter(s for s in sources if s))`, ['sources', 'counts'], {
            setup: md`urls = ['https://shop.ru/?utm_source=yandex&utm_medium=cpc', 'https://shop.ru/sale?utm_medium=email&utm_source=mailru', 'https://shop.ru/', 'https://shop.ru/?utm_source=yandex', 'https://shop.ru/item?id=5&utm_source=vk#top']` }),
        py('Суммы из комментариев', md`В комментариях операторов встречаются суммы вида ‹1 500 руб›, ‹2000р›, ‹350 ₽›. Извлеките из каждой строки ‹comments› первую сумму как int (без пробелов-разделителей) или ‹None›. Результат — ‹amounts›.`,
          md`import re
def first_amount(s):
    m = re.search(r'(\d[\d ]*\d|\d)\s*(?:руб|р\b|₽)', s)
    return int(m.group(1).replace(' ', '')) if m else None
amounts = [first_amount(c) for c in comments]`, ['amounts'], { setup: "comments = ['вернуть 1 500 руб клиенту', 'доплата 2000р', 'скидка 350 ₽ и бонус 100 ₽', 'без денег', 'итого 12 000 руб.']" }),
        py('Разбор строки лога', md`Строки лога имеют вид ‹2025-07-31 12:05:01 [ERROR] payment: timeout 30s›. С помощью именованных групп разберите каждую строку ‹logs› в словарь с ключами ‹date›, ‹time›, ‹level›, ‹service›, ‹message›. Результат — список ‹parsed›.`,
          md`import re
pat = re.compile(r'(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) \[(?P<level>\w+)\] (?P<service>\w+): (?P<message>.*)')
parsed = [pat.match(l).groupdict() for l in logs]`, ['parsed'], { setup: "logs = ['2025-07-31 12:05:01 [ERROR] payment: timeout 30s', '2025-07-31 12:05:02 [INFO] auth: user 15 logged in', '2025-08-01 00:00:00 [WARNING] courier: queue is long']" }),
        py('Регулярки в pandas', md`В DataFrame ‹df› столбец ‹comment›. Добавьте столбец ‹order_no› — номер заказа (число после ‹#›) через ‹str.extract›, приведённый к float (пропуски — NaN), и сохраните ‹n_refund› — число комментариев со словом «возврат» в любом регистре.`,
          md`df['order_no'] = df['comment'].str.extract(r'#(\d+)')[0].astype(float)
n_refund = df['comment'].str.contains('возврат', case=False).sum()`, ['df', 'n_refund'], {
            pkgs: ['pandas'], setup: md`import pandas as pd
df = pd.DataFrame({'comment': ['Возврат по заказу #101', 'курьер опоздал #102', 'просят ВОЗВРАТ денег', 'всё отлично', 'возврат #205, брак']})` }),
        ch('Жадность', md`Что вернёт ‹re.findall(r'<.+>', '<b>жир</b>')›?`, ['‹[\'<b>\', \'</b>\']›', '‹[\'<b>жир</b>\']›', '‹[]›', 'Ошибку'], 1, md`‹.+› жадный: захватывает максимум. Для тегов по отдельности нужен ленивый ‹<.+?>›.`),
      ],
    },
    {
      title: 'Дата и время',
      theory: md`
## datetime
~~~py
from datetime import date, datetime, timedelta
d = date(2025, 7, 31)
dt = datetime(2025, 7, 31, 18, 30)
d + timedelta(days=30)                        # 2025-08-30
(date(2025, 8, 1) - date(2025, 7, 1)).days    # 31
d.weekday()                                   # 3 — четверг (0 = понедельник)
d.isocalendar().week                          # номер недели ISO
datetime.strptime('31.07.2025', '%d.%m.%Y')   # строка → дата
dt.strftime('%Y-%m-%d %H:%M')                 # дата → строка
date.fromisoformat('2025-07-31')
d.replace(day=1)                              # начало месяца
~~~
Коды формата: ‹%Y› год, ‹%m› месяц, ‹%d› день, ‹%H› часы, ‹%M› минуты, ‹%S› секунды, ‹%a› день недели.

## Часовые пояса
~~~py
from zoneinfo import ZoneInfo
datetime(2025, 7, 31, 12, tzinfo=ZoneInfo('Europe/Moscow')).astimezone(ZoneInfo('Asia/Novosibirsk'))
~~~
Логи обычно пишут в UTC. Если делать «дневные» метрики без перевода во время пользователя, ночные заказы окажутся не в том дне.

## Даты в pandas
~~~py
s = pd.to_datetime(df['date'], format='%d.%m.%Y', errors='coerce')
s.dt.to_period('M'), s.dt.isocalendar().week, s.dt.day_name()
pd.date_range('2025-07-01', '2025-07-31', freq='D')     # полный календарь, чтобы найти пропущенные дни
df.set_index('date').resample('W-MON')['amount'].sum()
pd.offsets.MonthEnd(0)                                   # конец месяца
~~~

## Задачи, которые встречаются постоянно
- Возраст клиента на дату: разница лет с поправкой, если день рождения ещё не наступил.
- Число рабочих дней: ‹numpy.busday_count›.
- Начало недели/месяца для группировки.
- Время между событиями в минутах: ‹(t2 - t1).total_seconds() / 60›.
`,
      tasks: [
        py('Разница дат', md`Посчитайте ‹days› — число дней между датами ‹'2025-01-15'› и ‹'2025-07-31'›, и ‹weekday› — день недели второй даты (0 — понедельник).`,
          md`from datetime import date
a, b = date.fromisoformat('2025-01-15'), date.fromisoformat('2025-07-31')
days = (b - a).days
weekday = b.weekday()`, ['days', 'weekday']),
        py('Парсинг форматов', md`Даты в ‹raw› записаны в формате ‹ДД.ММ.ГГГГ ЧЧ:ММ›. Преобразуйте их в список строк ISO вида ‹2025-07-31T18:30:00› (‹isoformat()›) — ‹iso›, и найдите ‹span_hours› — разницу в часах между самой ранней и самой поздней датой.`,
          md`from datetime import datetime
dts = [datetime.strptime(s, '%d.%m.%Y %H:%M') for s in raw]
iso = [d.isoformat() for d in dts]
span_hours = (max(dts) - min(dts)).total_seconds() / 3600`, ['iso', 'span_hours'], { setup: "raw = ['31.07.2025 18:30', '01.08.2025 09:15', '30.07.2025 23:59']" }),
        py('Возраст', md`Напишите функцию ‹age_on(birth, on)› (обе — ‹date›), возвращающую полное число лет на дату ‹on›. Посчитайте ‹ages› для списка ‹births› на 31.07.2025.`,
          md`from datetime import date
def age_on(birth, on):
    return on.year - birth.year - ((on.month, on.day) < (birth.month, birth.day))
ages = [age_on(b, date(2025, 7, 31)) for b in births]`, ['ages', 'age_on(date(2000, 2, 29), date(2024, 2, 28))'], { setup: 'from datetime import date\nbirths = [date(1990, 7, 31), date(1990, 8, 1), date(2001, 1, 1), date(1985, 12, 31)]' }),
        py('Начало недели', md`Для каждой даты из ‹days› найдите понедельник её недели. Сохраните ‹mondays› — список строк ISO.`,
          md`from datetime import date, timedelta
mondays = [(d - timedelta(days=d.weekday())).isoformat() for d in days]`, ['mondays'], { setup: 'from datetime import date\ndays = [date(2025, 7, 31), date(2025, 7, 28), date(2025, 8, 3), date(2025, 1, 1)]' }),
        py('Пропущенные дни', md`В ‹df› ежедневная выручка, но некоторые дни пропущены. С помощью ‹pd.date_range› найдите ‹missing› — список пропущенных дат строками ‹YYYY-MM-DD› за период от минимальной до максимальной даты, и ‹full› — Series выручки по всем дням с нулями вместо пропусков (индекс — даты).`,
          md`rng = pd.date_range(df['date'].min(), df['date'].max(), freq='D')
missing = [d.strftime('%Y-%m-%d') for d in rng.difference(df['date'])]
full = df.set_index('date')['revenue'].reindex(rng, fill_value=0)`, ['missing', 'full'], {
            pkgs: ['pandas'], setup: md`import pandas as pd
df = pd.DataFrame({'date': pd.to_datetime(['2025-07-01', '2025-07-02', '2025-07-04', '2025-07-07', '2025-07-08']), 'revenue': [100, 120, 90, 150, 130]})` }),
        py('Часовой пояс', md`Время заказов ‹utc› записано в UTC. Переведите в московское время (‹Europe/Moscow›) и сохраните ‹msk_dates› — даты (строки ‹YYYY-MM-DD›) по Москве. Сколько заказов «переехало» на другой день — ‹n_shifted›?`,
          md`from datetime import datetime, timezone
from zoneinfo import ZoneInfo
msk = ZoneInfo('Europe/Moscow')
parsed = [datetime.fromisoformat(s).replace(tzinfo=timezone.utc) for s in utc]
msk_dates = [p.astimezone(msk).strftime('%Y-%m-%d') for p in parsed]
n_shifted = sum(p.strftime('%Y-%m-%d') != m for p, m in zip(parsed, msk_dates))`, ['msk_dates', 'n_shifted'], { pkgs: ['tzdata'], setup: "utc = ['2025-07-31T20:59:00', '2025-07-31T21:00:00', '2025-07-31T23:30:00', '2025-08-01T09:00:00']" }),
        py('Рабочие дни', md`С помощью ‹numpy.busday_count› посчитайте ‹workdays› — число рабочих дней (пн–пт) в июле 2025 года с учётом праздников из списка ‹holidays› (их нет в июле — используйте пустой список), и ‹workdays_may› — в мае 2025 с праздниками ‹['2025-05-01', '2025-05-02', '2025-05-08', '2025-05-09']›.`,
          md`import numpy as np
workdays = int(np.busday_count('2025-07-01', '2025-08-01'))
workdays_may = int(np.busday_count('2025-05-01', '2025-06-01', holidays=['2025-05-01', '2025-05-02', '2025-05-08', '2025-05-09']))`, ['workdays', 'workdays_may'], { pkgs: ['numpy'] }),
        ch('Формат', md`Какой формат подойдёт для ‹datetime.strptime('2025/07/31', ...)›?`, ['‹%d/%m/%Y›', '‹%Y/%m/%d›', '‹%Y-%m-%d›', '‹%y/%d/%m›'], 1, md`Год из 4 цифр — ‹%Y›, затем месяц ‹%m› и день ‹%d›, разделитель — слэш.`),
      ],
    },
  ],
});

/* =========================== БИБЛИОТЕКИ =========================== */
COURSE.add({
  id: 'pylibs', title: 'Библиотеки: collections, matplotlib, SciPy, statsmodels', short: 'Стандартная библиотека для данных, графики в matplotlib, статистические тесты в SciPy, регрессия в statsmodels, sqlite3 из Python.',
  lessons: [
    {
      title: 'collections, itertools, functools',
      theory: md`
## collections
~~~py
from collections import Counter, defaultdict, OrderedDict, deque, namedtuple
Counter('abracadabra').most_common(2)          # [('a', 5), ('b', 2)]
c1 + c2, c1 - c2                               # Counter складываются и вычитаются
g = defaultdict(list); g['Москва'].append(1)  # без KeyError
last5 = deque(maxlen=5)                        # хранит только 5 последних элементов
Point = namedtuple('Point', 'x y'); Point(1, 2).x
~~~

## functools
~~~py
from functools import partial, reduce, cache, cmp_to_key
round2 = partial(round, ndigits=2)              # функция с «зашитым» аргументом
round2(3.14159)                                 # 3.14
~~~

## operator
~~~py
from operator import itemgetter, attrgetter
sorted(rows, key=itemgetter('city', 'revenue'))   # быстрее и короче lambda
~~~

## heapq и bisect
~~~py
import heapq, bisect
heapq.nlargest(3, sales, key=lambda s: s['amount'])   # топ-N без полной сортировки
bisect.bisect_right([0, 500, 1500], 990)              # 2 — в какой интервал попадает значение
~~~

## statistics и math
~~~py
import statistics as st, math
st.mean(x), st.median(x), st.stdev(x), st.quantiles(x, n=4)
math.isclose(a, b), math.log(x), math.exp(x), math.comb(n, k), math.prod(xs)
~~~
`,
      tasks: [
        py('Counter', md`Для списка покупок ‹items› сохраните ‹top2› — два самых частых товара (как ‹most_common›), и ‹total› — сумму двух Counter: ‹Counter(items)› и ‹Counter(extra)› как обычный словарь.`,
          md`from collections import Counter
top2 = Counter(items).most_common(2)
total = dict(Counter(items) + Counter(extra))`, ['top2', 'total'], { setup: "items = ['хлеб', 'молоко', 'хлеб', 'сыр', 'молоко', 'хлеб']\nextra = ['сыр', 'сыр', 'кофе']" }),
        py('defaultdict', md`Сгруппируйте заказы ‹orders› (кортежи ‹(клиент, сумма)›) в словарь ‹by_client›: клиент → список сумм. Используйте ‹defaultdict(list)›, а результат приведите к обычному ‹dict›.`,
          md`from collections import defaultdict
g = defaultdict(list)
for client, amount in orders:
    g[client].append(amount)
by_client = dict(g)`, ['by_client'], { setup: "orders = [('a', 100), ('b', 50), ('a', 70), ('c', 10), ('b', 5)]" }),
        py('deque: последние N', md`Поток значений ‹stream›. С помощью ‹deque(maxlen=3)› посчитайте ‹rolling› — список скользящих средних по последним (до) 3 значениям после каждого нового элемента (округлить до 2).`,
          md`from collections import deque
win = deque(maxlen=3)
rolling = []
for x in stream:
    win.append(x)
    rolling.append(round(sum(win) / len(win), 2))`, ['rolling'], { setup: 'stream = [10, 20, 30, 40, 10, 5]' }),
        py('namedtuple', md`Опишите ‹Sale = namedtuple('Sale', 'city amount')›. Превратите ‹raw› в список ‹sales›, а в ‹best› сохраните город с максимальной суммой (атрибут ‹.city›).`,
          md`from collections import namedtuple
Sale = namedtuple('Sale', 'city amount')
sales = [Sale(*r) for r in raw]
best = max(sales, key=lambda s: s.amount).city`, ['best', 'len(sales)', 'sales[0].amount'], { setup: "raw = [('Москва', 500), ('Казань', 900), ('Пермь', 300)]" }),
        py('partial', md`С помощью ‹functools.partial› создайте ‹to_rub = partial(convert, rate=92.5)› для функции ‹convert(amount, rate)› (уже задана) и посчитайте ‹rub› — список сумм в рублях для ‹usd›.`,
          md`from functools import partial
to_rub = partial(convert, rate=92.5)
rub = [to_rub(x) for x in usd]`, ['rub'], { setup: 'def convert(amount, rate):\n    return round(amount * rate, 2)\nusd = [10, 2.5, 100]' }),
        py('itemgetter и heapq', md`Список ‹sales› — словари с ключами ‹city› и ‹amount›. С помощью ‹heapq.nlargest› найдите ‹top3› — три словаря с наибольшей суммой, а с помощью ‹sorted› и ‹itemgetter('city', 'amount')› — ‹ordered›, отсортированный по городу и сумме.`,
          md`import heapq
from operator import itemgetter
top3 = heapq.nlargest(3, sales, key=itemgetter('amount'))
ordered = sorted(sales, key=itemgetter('city', 'amount'))`, ['top3', 'ordered'], { setup: "sales = [{'city': 'Казань', 'amount': 300}, {'city': 'Москва', 'amount': 900}, {'city': 'Казань', 'amount': 150}, {'city': 'Москва', 'amount': 400}, {'city': 'Пермь', 'amount': 700}]" }),
        py('bisect: тарифная сетка', md`Скидка зависит от суммы заказа: до 1000 — 0%, от 1000 — 3%, от 3000 — 5%, от 10000 — 10% (границы ‹[1000, 3000, 10000]›, скидки ‹[0, 0.03, 0.05, 0.10]›). С помощью ‹bisect.bisect_right› посчитайте ‹discounts› для сумм ‹amounts›.`,
          md`import bisect
bounds = [1000, 3000, 10000]
rates = [0, 0.03, 0.05, 0.10]
discounts = [rates[bisect.bisect_right(bounds, a)] for a in amounts]`, ['discounts'], { setup: 'amounts = [500, 1000, 2999, 3000, 15000, 9999.99]' }),
        py('statistics', md`Для ‹x› посчитайте модулем ‹statistics›: ‹m› (среднее), ‹med›, ‹sd› (выборочное стандартное отклонение), ‹q› — квартили (‹quantiles(x, n=4)›).`,
          md`import statistics as st
m, med, sd, q = st.mean(x), st.median(x), st.stdev(x), st.quantiles(x, n=4)`, ['m', 'med', 'sd', 'q'], { setup: 'x = [12, 15, 11, 19, 14, 30, 13, 16, 12, 18]' }),
      ],
    },
    {
      title: 'matplotlib: графики в коде',
      theory: md`
matplotlib — базовая библиотека графиков, на ней работают ‹df.plot()› и seaborn. Объектный интерфейс (‹fig, ax›) даёт полный контроль.

~~~py
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(x, y, label='выручка', color='tab:green', linewidth=2)
ax.bar(categories, values)
ax.barh(names, values)                      # горизонтальные столбики
ax.scatter(x, y, s=10, alpha=0.5)
ax.hist(values, bins=30)
ax.boxplot([a, b], labels=['A', 'B'])
ax.set_title('Выручка по дням'); ax.set_xlabel('дата'); ax.set_ylabel('₽')
ax.legend(); ax.grid(alpha=0.3)
ax.axhline(100, linestyle='--', color='gray')   # линия-ориентир
fig.tight_layout()
fig.savefig('chart.png', dpi=150)
~~~

## Несколько графиков
~~~py
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].hist(a); axes[1].hist(b)
~~~

## Прямо из pandas
~~~py
df.groupby('city')['amount'].sum().sort_values().plot(kind='barh', title='Выручка по городам')
daily.plot(); daily.rolling(7).mean().plot()
pivot.plot(kind='bar', stacked=True)
~~~

> В задачах график рисуется под кодом. Проверка смотрит на объекты графика: тип, количество линий или столбиков, подписи. Используйте ‹fig, ax = plt.subplots()›.
`,
      tasks: [
        pyt('Линейный график', md`Постройте линейный график выручки ‹daily› (список из 14 чисел) по дням 1–14. Подпишите заголовок ‹Выручка по дням› и ось Y ‹₽›. Добавьте вторую линию — скользящее среднее за 3 дня (для первых двух дней — среднее доступных).`,
          md`fig, ax = plt.subplots(figsize=(8, 3))
days = list(range(1, 15))
ma = [sum(daily[max(0, i - 2):i + 1]) / len(daily[max(0, i - 2):i + 1]) for i in range(14)]
ax.plot(days, daily, label='выручка')
ax.plot(days, ma, label='MA3')
ax.set_title('Выручка по дням'); ax.set_ylabel('₽'); ax.legend()`,
          md`ax = plt.gcf().axes[0]
assert ax.get_title() == 'Выручка по дням', f'Заголовок: {ax.get_title()!r}'
assert ax.get_ylabel() == '₽', 'Подпишите ось Y: ₽'
assert len(ax.lines) == 2, f'Нужно 2 линии, а их {len(ax.lines)}'
import numpy as np
assert np.allclose(ax.lines[0].get_ydata(), daily), 'Первая линия должна показывать daily'
ma = [sum(daily[max(0, i - 2):i + 1]) / len(daily[max(0, i - 2):i + 1]) for i in range(14)]
assert np.allclose(ax.lines[1].get_ydata(), ma), 'Вторая линия — скользящее среднее за 3 дня'`,
          { pkgs: ['matplotlib'], setup: 'daily = [120, 135, 150, 110, 160, 170, 155, 180, 175, 190, 160, 200, 210, 205]', starter: 'fig, ax = plt.subplots(figsize=(8, 3))\n' }),
        pyt('Столбики по городам', md`Нарисуйте горизонтальную столбчатую диаграмму (‹barh›) выручки по городам из словаря ‹rev›, отсортировав города по возрастанию выручки (самый большой столбик сверху). Заголовок — ‹Выручка по городам›.`,
          md`fig, ax = plt.subplots()
items = sorted(rev.items(), key=lambda kv: kv[1])
ax.barh([k for k, _ in items], [v for _, v in items])
ax.set_title('Выручка по городам')`,
          md`ax = plt.gcf().axes[0]
bars = ax.patches
assert len(bars) == len(rev), f'Нужно {len(rev)} столбиков'
widths = [b.get_width() for b in bars]
assert widths == sorted(rev.values()), 'Столбики должны идти по возрастанию выручки (используйте barh)'
assert ax.get_title() == 'Выручка по городам'`,
          { pkgs: ['matplotlib'], setup: "rev = {'Москва': 980, 'Казань': 310, 'Пермь': 150, 'Сочи': 420, 'Омск': 205}", starter: 'fig, ax = plt.subplots()\n' }),
        pyt('Гистограмма чеков', md`Постройте гистограмму сумм доставленных заказов из ‹orders› с 40 корзинами и логарифмической осью X не нужно — обычной. Добавьте вертикальные линии медианы (‹axvline›) и среднего. Подпишите ось X ‹Сумма заказа, ₽›.`,
          md`x = orders.loc[orders.status == 'delivered', 'amount']
fig, ax = plt.subplots(figsize=(8, 3))
ax.hist(x, bins=40)
ax.axvline(x.median(), color='k', linestyle='--', label='медиана')
ax.axvline(x.mean(), color='r', label='среднее')
ax.set_xlabel('Сумма заказа, ₽'); ax.legend()`,
          md`ax = plt.gcf().axes[0]
assert len(ax.patches) == 40, f'Нужно 40 корзин, а их {len(ax.patches)}'
assert len(ax.lines) >= 2, 'Добавьте две вертикальные линии: медиану и среднее'
xs = sorted(round(l.get_xdata()[0], 2) for l in ax.lines[:2])
x = orders.loc[orders.status == 'delivered', 'amount']
assert xs == sorted([round(x.median(), 2), round(x.mean(), 2)]), 'Линии должны стоять на медиане и среднем доставленных заказов'
assert ax.get_xlabel() == 'Сумма заказа, ₽'`,
          { pkgs: ['matplotlib'], data: ['orders'] }),
        pyt('Два графика рядом', md`Создайте фигуру с двумя графиками в ряд (‹plt.subplots(1, 2)›): слева — гистограмма ‹revenue› группы A из ‹ab_test› (только ‹converted == 1›), справа — группы B. Заголовки ‹A› и ‹B›, одинаковые 30 корзин.`,
          md`fig, axes = plt.subplots(1, 2, figsize=(9, 3), sharey=True)
for ax, g in zip(axes, ['A', 'B']):
    ax.hist(ab_test.loc[(ab_test.grp == g) & (ab_test.converted == 1), 'revenue'], bins=30)
    ax.set_title(g)`,
          md`axes = plt.gcf().axes
assert len(axes) == 2, 'Нужно два графика'
assert [a.get_title() for a in axes] == ['A', 'B'], 'Заголовки A и B'
assert all(len(a.patches) == 30 for a in axes), 'По 30 корзин на каждом графике'
nA = (ab_test.grp.eq('A') & ab_test.converted.eq(1)).sum()
assert round(sum(p.get_height() for p in axes[0].patches)) == nA, 'Левый график — конвертировавшиеся из группы A'`,
          { pkgs: ['matplotlib'], data: ['ab_test'] }),
        pyt('Scatter', md`Для пользователей ‹ab_test› с ‹pre_revenue > 0› постройте диаграмму рассеяния: X — ‹pre_revenue›, Y — ‹revenue›, точки полупрозрачные (‹alpha=0.3›). Подпишите оси именами столбцов.`,
          md`d = ab_test[ab_test.pre_revenue > 0]
fig, ax = plt.subplots()
ax.scatter(d.pre_revenue, d.revenue, alpha=0.3, s=8)
ax.set_xlabel('pre_revenue'); ax.set_ylabel('revenue')`,
          md`ax = plt.gcf().axes[0]
assert len(ax.collections) == 1, 'Нужен один scatter'
pts = ax.collections[0].get_offsets()
assert len(pts) == (ab_test.pre_revenue > 0).sum(), 'Точек должно быть столько же, сколько пользователей с pre_revenue > 0'
assert abs(ax.collections[0].get_alpha() - 0.3) < 1e-9, 'Задайте alpha=0.3'
assert (ax.get_xlabel(), ax.get_ylabel()) == ('pre_revenue', 'revenue')`,
          { pkgs: ['matplotlib'], data: ['ab_test'] }),
        pyt('График из pandas', md`Постройте средствами pandas линейный график числа заказов по месяцам из ‹orders› (‹groupby(...).size().plot()›), индекс — строки ‹YYYY-MM›. Заголовок ‹Заказы по месяцам›.`,
          md`ax = orders.groupby(orders.order_date.dt.strftime('%Y-%m')).size().plot(title='Заказы по месяцам')`,
          md`ax = plt.gcf().axes[0]
assert ax.get_title() == 'Заказы по месяцам'
import numpy as np
exp = orders.groupby(orders.order_date.dt.strftime('%Y-%m')).size().to_numpy()
assert np.allclose(ax.lines[0].get_ydata(), exp), 'На графике должно быть число заказов по месяцам'`,
          { pkgs: ['matplotlib'], data: ['orders'] }),
        ch('Тип графика', md`Какой метод нарисует диаграмму размаха (ящик с усами)?`, ['‹ax.hist›', '‹ax.boxplot›', '‹ax.scatter›', '‹ax.pie›'], 1, md`‹boxplot› показывает медиану, квартили и выбросы.`),
      ],
    },
    {
      title: 'SciPy и statsmodels',
      theory: md`
## scipy.stats
~~~py
from scipy import stats
stats.norm.cdf(1.96), stats.norm.ppf(0.975)
stats.t.ppf(0.975, df=20)
stats.binom.pmf(k, n, p), stats.poisson.cdf(k, mu)
stats.ttest_ind(a, b, equal_var=False)       # t-тест Уэлча
stats.ttest_rel(before, after)               # парный
stats.mannwhitneyu(a, b)
stats.chi2_contingency(table)
stats.shapiro(x)                             # тест на нормальность
stats.pearsonr(x, y), stats.spearmanr(x, y)
stats.bootstrap((x,), np.median, n_resamples=2000)
~~~

## statsmodels
Библиотека для эконометрики и классической статистики: регрессии с p-value и доверительными интервалами, GLM, временные ряды, расчёты мощности.
~~~py
import statsmodels.formula.api as smf
m = smf.ols('revenue ~ pre_revenue + C(grp)', data=df).fit()
m.summary()          # таблица коэффициентов, p-value, R²
m.params, m.pvalues, m.conf_int()

from statsmodels.stats.proportion import proportions_ztest, proportion_confint
proportions_ztest([x_b, x_a], [n_b, n_a])
proportion_confint(x, n, method='wilson')

from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
NormalIndPower().solve_power(proportion_effectsize(0.11, 0.10), alpha=0.05, power=0.8)

from statsmodels.stats.multitest import multipletests
multipletests(pvals, method='holm')

smf.glm('claims ~ age', data=df, family=sm.families.Poisson(), offset=np.log(df.exposure)).fit()
~~~
Формулы как в R: ‹C(x)› — категориальный признак, ‹np.log(x)› — преобразование прямо в формуле, ‹a * b› — взаимодействие.

## sqlite3 из Python
~~~py
import sqlite3
con = sqlite3.connect(':memory:')
df.to_sql('orders', con, index=False)
pd.read_sql('SELECT city, SUM(amount) FROM orders GROUP BY city', con)
~~~
Так же через SQLAlchemy подключаются к PostgreSQL: ‹create_engine('postgresql://...')›.
`,
      tasks: [
        py('Тест Шапиро и Манна–Уитни', md`Для выручки конвертировавшихся пользователей A и B из ‹ab_test› посчитайте ‹p_shapiro_a› — p-value теста Шапиро–Уилка для группы A (первые 500 значений) и ‹p_mw› — p-value теста Манна–Уитни между A и B (все конвертировавшиеся, ‹alternative='two-sided'›).`,
          md`from scipy import stats
a = ab_test.loc[(ab_test.grp == 'A') & (ab_test.converted == 1), 'revenue']
b = ab_test.loc[(ab_test.grp == 'B') & (ab_test.converted == 1), 'revenue']
p_shapiro_a = stats.shapiro(a.iloc[:500]).pvalue
p_mw = stats.mannwhitneyu(a, b, alternative='two-sided').pvalue`, ['p_shapiro_a', 'p_mw'], { pkgs: ['scipy'], data: ['ab_test'] }),
        py('proportions_ztest', md`С помощью ‹statsmodels.stats.proportion.proportions_ztest› сравните конверсии B и A в ‹ab_test›. Сохраните ‹z› и ‹p› (порядок групп: сначала B, потом A), а также ДИ Уилсона для конверсии B: ‹lo›, ‹hi›.`,
          md`from statsmodels.stats.proportion import proportions_ztest, proportion_confint
g = ab_test.groupby('grp')['converted'].agg(['sum', 'count'])
z, p = proportions_ztest([g.loc['B', 'sum'], g.loc['A', 'sum']], [g.loc['B', 'count'], g.loc['A', 'count']])
lo, hi = proportion_confint(g.loc['B', 'sum'], g.loc['B', 'count'], method='wilson')`, ['z', 'p', 'lo', 'hi'], { pkgs: ['statsmodels'], data: ['ab_test'] }),
        py('OLS с формулой', md`Оцените регрессию ‹revenue ~ pre_revenue + C(grp)› на данных ‹ab_test› через ‹statsmodels.formula.api.ols›. Сохраните ‹coef_b› — коэффициент при группе B (‹C(grp)[T.B]›), его p-value ‹p_b› и ‹r2›.`,
          md`import statsmodels.formula.api as smf
m = smf.ols('revenue ~ pre_revenue + C(grp)', data=ab_test).fit()
coef_b = m.params['C(grp)[T.B]']
p_b = m.pvalues['C(grp)[T.B]']
r2 = m.rsquared`, ['coef_b', 'p_b', 'r2'], { pkgs: ['statsmodels'], data: ['ab_test'] }),
        py('Мощность и размер выборки', md`С помощью ‹NormalIndPower().solve_power› и ‹proportion_effectsize› найдите размер группы ‹n› для обнаружения роста конверсии с 10% до 11% при α = 0.05, мощности 0.8 (двусторонний тест), округлив вверх до целого.`,
          md`import math
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
es = proportion_effectsize(0.11, 0.10)
n = math.ceil(NormalIndPower().solve_power(effect_size=es, alpha=0.05, power=0.8))`, ['n'], { pkgs: ['statsmodels'] }),
        py('Поправка Холма', md`Для списка p-value ‹pvals› примените поправку Холма (‹multipletests(..., method='holm')›) при α = 0.05. Сохраните ‹reject› — список булевых значений и ‹p_adj› — скорректированные p-value списком.`,
          md`from statsmodels.stats.multitest import multipletests
r, padj, _, _ = multipletests(pvals, alpha=0.05, method='holm')
reject = [bool(x) for x in r]
p_adj = [float(x) for x in padj]`, ['reject', 'p_adj'], { pkgs: ['statsmodels'], setup: 'pvals = [0.001, 0.012, 0.02, 0.04, 0.3]' }),
        py('Бутстрап в SciPy', md`С помощью ‹scipy.stats.bootstrap› (2000 повторов, ‹random_state=0›, метод ‹percentile›) постройте 95% ДИ медианы суммы доставленных заказов. Сохраните ‹lo› и ‹hi›.`,
          md`from scipy import stats
x = orders.loc[orders.status == 'delivered', 'amount'].to_numpy()
res = stats.bootstrap((x,), np.median, n_resamples=2000, random_state=0, method='percentile')
lo, hi = res.confidence_interval.low, res.confidence_interval.high`, ['lo', 'hi'], { pkgs: ['scipy'], data: ['orders'] }),
        py('SQL из Python', md`Загрузите DataFrame ‹orders› в базу SQLite в памяти (‹sqlite3.connect(':memory:')›, ‹to_sql›) и выполните через ‹pd.read_sql› запрос: число и сумму доставленных заказов по ‹promo›. Результат — DataFrame ‹res› со столбцами ‹promo›, ‹cnt›, ‹revenue›, отсортированный по ‹promo›.`,
          md`import sqlite3
con = sqlite3.connect(':memory:')
orders.to_sql('orders', con, index=False)
res = pd.read_sql("SELECT promo, COUNT(*) AS cnt, SUM(amount) AS revenue FROM orders WHERE status = 'delivered' GROUP BY promo ORDER BY promo", con)`, ['res'], { pkgs: ['sqlite3', 'pandas'], data: ['orders'] }),
        ch('summary()', md`В выводе ‹ols(...).fit().summary()› у коэффициента P>|t| = 0.43. Что это значит?`, ['Коэффициент равен 0.43', 'Нет оснований считать коэффициент отличным от нуля на уровне 5%', 'Модель объясняет 43% дисперсии', 'Коэффициент значим'], 1, md`Это p-value проверки H₀: коэффициент = 0. При 0.43 гипотезу не отвергаем.`),
      ],
    },
  ],
});
})();
