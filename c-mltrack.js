window.MARKET_ML = {
  intro: md`
## Что спрашивают у ML-специалистов
Программа собрана по вакансиям junior и middle Data Scientist / ML-инженер на hh.ru, Хабр Карьере и DOU. Почти везде одно и то же ядро: **уверенный Python, pandas/NumPy, классический ML в scikit-learn, градиентный бустинг (CatBoost, LightGBM, XGBoost), SQL и математика**. PyTorch чаще идёт как плюс или требование для DL-ролей. На middle добавляются MLOps: Docker, Airflow, MLflow, деплой моделей.
`,
  demand: [
    ['Python, pandas, NumPy', 95, 'всегда'], ['scikit-learn, классический ML', 85, 'почти всегда'], ['SQL', 75, 'часто'],
    ['Бустинг: CatBoost/LightGBM/XGBoost', 65, 'часто'], ['Математика и статистика', 60, 'часто'], ['PyTorch / TensorFlow', 45, 'плюсом'],
    ['Git, Docker', 45, 'часто'], ['MLflow, Airflow, деплой', 30, 'middle+'], ['NLP / CV', 30, 'по направлению'], ['A/B-тесты', 25, 'продуктовые ML'],
  ],
  after: md`
Как устроен трек:
- общие модули Python, pandas, SQL и статистики засчитываются и в треке аналитика;
- **математика для ML** — линейная алгебра, производные и градиентный спуск на NumPy;
- **классические модели** реализуются руками на NumPy и затем используются из scikit-learn;
- **валидация и метрики** разобраны глубже всего: именно на них чаще всего «валят» на собеседовании;
- нейросети — на NumPy (прямой и обратный проход) плюс теория PyTorch;
- финальный модуль — вопросы с ML-собеседований и ML system design.
`,
  plan: [
    ['Недели 1–3', 'Python, NumPy, pandas, тренажёры. SQL — базовый уровень.'],
    ['Недели 4–5', 'Математика для ML, теорвер и статистика.'],
    ['Недели 6–8', 'Классические модели, валидация и метрики, признаки и пайплайны.'],
    ['Недели 9–10', 'Ансамбли и бустинг, кластеризация и понижение размерности.'],
    ['Недели 11–12', 'Временные ряды, тексты, нейросети.'],
    ['Недели 13–14', 'MLOps, собеседование, 2 проекта в портфолио (табличная задача с бустингом и NLP или CV).'],
  ],
  sources_md: md`
## Источники
- [hh.ru: Junior data scientist](https://hh.ru/vacancy/135921622), [hh.ru: Data Engineer / MLOps Junior](https://hh.ru/vacancy/135022987)
- [Хабр Карьера: профессия Data Scientist](https://career.habr.com/professions/data-scientist)
- Разбор 500 вакансий DS 2026: [Medium](https://medium.com/ai-analytics-diaries/i-analyzed-500-data-science-job-posts-in-2026-heres-exactly-what-they-want-eaac5980590b)
`,
};

(function () {
const { variants: V, pick, int, sample, r } = G;
const { py, pyt, ch, mu, num } = TK;
const SK = ['scikit-learn'];

/* ---------- генераторы ML-расчётов ---------- */
const cmGen = V('ml-cm', 12, (R) => {
  const tp = int(R, 5, 90), fn = int(R, 1, 40), fp = int(R, 1, 50), tn = int(R, 50, 400); const what = pick(R, ['precision', 'recall', 'f1', 'accuracy', 'specificity']);
  const P = tp / (tp + fp), Rc = tp / (tp + fn); const v = { precision: P, recall: Rc, f1: 2 * P * Rc / (P + Rc), accuracy: (tp + tn) / (tp + tn + fp + fn), specificity: tn / (tn + fp) }[what];
  return num(`Матрица ошибок: ${what}`, md`TP = ${tp}, FN = ${fn}, FP = ${fp}, TN = ${tn}. Найдите ${what} (4 знака).`, r(v, 4), 0.00011, md`precision = ${r(P, 4)}, recall = ${r(Rc, 4)}, ${what} = ${r(v, 4)}`);
});
const regGen = V('ml-reg', 10, (R) => {
  const y = Array.from({ length: 5 }, () => int(R, 1, 20)); const p = y.map((v) => v + int(R, -4, 4)); const what = pick(R, ['MAE', 'MSE', 'RMSE', 'R²']);
  const n = y.length, e = y.map((v, i) => v - p[i]); const mae = e.reduce((a, x) => a + Math.abs(x), 0) / n, mse = e.reduce((a, x) => a + x * x, 0) / n; const ym = y.reduce((a, b) => a + b) / n; const sst = y.reduce((a, v) => a + (v - ym) ** 2, 0);
  const v = { MAE: mae, MSE: mse, RMSE: Math.sqrt(mse), 'R²': 1 - (mse * n) / sst }[what];
  return num(`Метрика регрессии: ${what}`, md`Истинные значения ‹y = [${y.join(', ')}]›, прогноз ‹ŷ = [${p.join(', ')}]›. Найдите ${what} (4 знака).`, r(v, 4), 0.00011 * Math.max(1, Math.abs(v)) / Math.max(1, Math.abs(v)), md`ошибки: [${e.join(', ')}]; MAE = ${r(mae, 4)}, MSE = ${r(mse, 4)}, R² = ${r(1 - (mse * n) / sst, 4)}`);
});
const giniGen = V('ml-gini', 10, (R) => {
  const a = int(R, 0, 30), b = int(R, 1, 30), c = R() < 0.4 ? int(R, 1, 20) : 0; const ks = [a, b, c].filter((x) => x > 0); const n = ks.reduce((x, y) => x + y); const ent = R() < 0.5;
  const v = ent ? -ks.reduce((s, k) => s + (k / n) * Math.log2(k / n), 0) : 1 - ks.reduce((s, k) => s + (k / n) ** 2, 0);
  return num(ent ? 'Энтропия узла' : 'Gini узла', md`В узле дерева объекты классов: ${[a, b, c].map((x, i) => `класс ${i}: ${x}`).join(', ')}. Найдите ${ent ? 'энтропию (log₂)' : 'индекс Джини'} (4 знака).`, r(v, 4), 0.00011, md`${ent ? 'H = −Σ pᵢ log₂ pᵢ' : 'G = 1 − Σ pᵢ²'} = ${r(v, 4)}`);
});
const gdGen = V('ml-gd', 10, (R) => {
  const w = pick(R, [0, 0.5, 1, 2]), lr = pick(R, [0.01, 0.05, 0.1]); const xs = [1, 2, 3], ys = xs.map((x) => x * pick(R, [2, 3]) + int(R, -1, 1));
  const g = (2 / 3) * xs.reduce((s, x, i) => s + (w * x - ys[i]) * x, 0); const w1 = w - lr * g;
  return num('Шаг градиентного спуска', md`Модель ‹ŷ = w·x› без свободного члена, MSE-лосс ‹L = mean((w·x − y)²)›. Данные: ‹x = [1, 2, 3]›, ‹y = [${ys.join(', ')}]›. Текущее ‹w = ${w}›, шаг обучения ${lr}. Найдите новое значение ‹w› после одного шага (4 знака).`, r(w1, 4), 0.00011, md`∂L/∂w = 2·mean((w·x − y)·x) = ${r(g, 4)}; w − η·g = ${r(w1, 4)}`);
});
const sigGen = V('ml-sig', 10, (R) => {
  const b0 = pick(R, [-3, -2, -1, 0, 0.5]), b1 = pick(R, [0.2, 0.5, 1, 1.5]), x = int(R, -3, 6); const y = pick(R, [0, 1]); const z = b0 + b1 * x, p = 1 / (1 + Math.exp(-z)); const ll = -(y * Math.log(p) + (1 - y) * Math.log(1 - p)); const askLoss = R() < 0.5;
  return num(askLoss ? 'Log-loss объекта' : 'Вероятность логистической регрессии', md`Логистическая регрессия: ‹z = ${b0} + ${b1}·x›, ‹p = σ(z)›. Для объекта с ‹x = ${x}›${askLoss ? ` и истинным классом ${y} найдите log-loss (натуральный логарифм)` : ' найдите вероятность класса 1'} (4 знака).`, r(askLoss ? ll : p, 4), 0.00011 , md`z = ${r(z, 3)}, p = ${r(p, 4)}${askLoss ? `, loss = ${r(ll, 4)}` : ''}`);
});
const knnGen = V('ml-knn', 10, (R) => {
  const pts = Array.from({ length: 7 }, () => [int(R, 0, 10), int(R, 0, 10), pick(R, ['A', 'B'])]); const q = [int(R, 0, 10), int(R, 0, 10)]; const k = pick(R, [1, 3, 5]);
  const d = pts.map((p) => [Math.hypot(p[0] - q[0], p[1] - q[1]), p[2]]).sort((a, b) => a[0] - b[0]);
  if (k > 1 && d[k - 1][0] === d[k][0]) return num('kNN', 'skip', 0, 0);
  const votes = d.slice(0, k).reduce((s, x) => (s[x[1]] = (s[x[1]] || 0) + 1, s), {}); const cls = (votes.A || 0) > (votes.B || 0) ? 'A' : 'B';
  return ch('kNN вручную', md`Обучающие точки: ${pts.map((p) => `(${p[0]}, ${p[1]}) → ${p[2]}`).join('; ')}. Какой класс предскажет kNN с k = ${k} (евклидово расстояние) для точки (${q[0]}, ${q[1]})?`, ['A', 'B'], cls === 'A' ? 0 : 1, md`Ближайшие ${k}: ${d.slice(0, k).map((x) => `${x[1]} (${r(x[0], 2)})`).join(', ')}`);
}).filter((t) => t.text !== 'skip');
const softGen = V('ml-soft', 8, (R) => {
  const z = [int(R, -2, 3), int(R, -2, 3), int(R, -2, 3)]; const i = int(R, 0, 2); const ex = z.map(Math.exp); const s = ex.reduce((a, b) => a + b);
  return num('Softmax', md`Логиты трёх классов ‹z = [${z.join(', ')}]›. Найдите вероятность класса ${i} после softmax (4 знака).`, r(ex[i] / s, 4), 0.00011, md`e^${z[i]} / Σ e^zⱼ = ${r(ex[i] / s, 4)}`);
});
const tfidfGen = V('ml-tfidf', 8, (R) => {
  const N = int(R, 5, 50), df = int(R, 1, N), tf = int(R, 1, 6), len = tf + int(R, 5, 40);
  const v = (tf / len) * Math.log(N / df);
  return num('TF-IDF', md`Слово встречается ${tf} раз в документе из ${len} слов; документов в корпусе ${N}, слово есть в ${df} из них. Найдите TF-IDF = (tf/длина) · ln(N/df) (4 знака).`, r(v, 4), 0.00011, md`${tf}/${len} · ln(${N}/${df}) = ${r(v, 4)}`);
});
const kmGen = V('ml-km', 8, (R) => {
  const pts = Array.from({ length: 6 }, () => [int(R, 0, 10), int(R, 0, 10)]); const c = [[int(R, 0, 4), int(R, 0, 4)], [int(R, 6, 10), int(R, 6, 10)]];
  const asg = pts.map((p) => (Math.hypot(p[0] - c[0][0], p[1] - c[0][1]) <= Math.hypot(p[0] - c[1][0], p[1] - c[1][1]) ? 0 : 1));
  const g = asg.filter((a) => a === 0).length ? 0 : 1; const mem = pts.filter((_, i) => asg[i] === g); const nx = mem.reduce((s, p) => s + p[0], 0) / mem.length;
  return num('Шаг k-means', md`Точки: ${pts.map((p) => `(${p[0]}, ${p[1]})`).join(', ')}. Центроиды: C0 = (${c[0].join(', ')}), C1 = (${c[1].join(', ')}). Отнесите точки к ближайшему центроиду (при равенстве — к C0) и найдите новую координату **x** центроида C${g} (4 знака).`, r(nx, 4), 0.00011, md`В кластере C${g}: ${mem.map((p) => `(${p.join(', ')})`).join(', ')}; среднее x = ${r(nx, 4)}`);
});
const ridgeGen = V('ml-l2', 8, (R) => {
  const w = [pick(R, [-2, -1, 0.5, 1, 3]), pick(R, [-1.5, 0.2, 2, 4])], lam = pick(R, [0.01, 0.1, 0.5, 1]), mse = int(R, 5, 50) / 10; const l1 = R() < 0.5;
  const pen = l1 ? lam * (Math.abs(w[0]) + Math.abs(w[1])) : lam * (w[0] ** 2 + w[1] ** 2);
  return num(l1 ? 'Лосс Lasso' : 'Лосс Ridge', md`MSE на обучении ${mse}, веса ‹w = [${w.join(', ')}]›, λ = ${lam}. Найдите полный лосс ${l1 ? 'Lasso: MSE + λ·Σ|wᵢ|' : 'Ridge: MSE + λ·Σwᵢ²'} (4 знака).`, r(mse + pen, 4), 0.00011, md`штраф = ${r(pen, 4)}, итого ${r(mse + pen, 4)}`);
});

/* =========================== МАТЕМАТИКА ДЛЯ ML =========================== */
COURSE.add({
  id: 'mlmath', title: 'Математика для ML', short: 'Векторы и матрицы, скалярное произведение, нормы, производные, градиент и градиентный спуск — на NumPy.',
  lessons: [
    {
      title: 'Линейная алгебра на NumPy',
      theory: md`
Данные в ML — это матрица ‹X› размера ‹n × d› (объекты × признаки), веса модели — вектор ‹w›, предсказания линейной модели — ‹X @ w›.

## Векторы
~~~py
a = np.array([1, 2, 3]); b = np.array([4, 0, -1])
a @ b                        # скалярное произведение: 1·4 + 2·0 + 3·(−1) = 1
np.linalg.norm(a)            # L2-норма (длина): √14
np.abs(a).sum()              # L1-норма
cos = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))   # косинусная близость
~~~
Косинусная близость — основа поиска похожих текстов, товаров и эмбеддингов.

## Матрицы
~~~py
X = np.array([[1, 2], [3, 4], [5, 6]])   # 3 × 2
X.T                     # транспонирование: 2 × 3
X.T @ X                 # 2 × 2 — матрица Грама
np.linalg.inv(A)        # обратная (только квадратная невырожденная)
np.linalg.det(A)
np.linalg.solve(A, b)   # решить A·x = b — точнее и быстрее, чем inv(A) @ b
np.eye(3)               # единичная матрица
~~~
Правило умножения: ‹(n × k) @ (k × m) = (n × m)›; внутренние размеры должны совпадать.

## Линейная регрессия в закрытой форме
$$ w = (XᵀX)⁻¹ Xᵀ y
~~~py
X1 = np.column_stack([np.ones(len(X)), X])    # столбец единиц для свободного члена
w = np.linalg.solve(X1.T @ X1, X1.T @ y)
# или устойчивее: np.linalg.lstsq(X1, y, rcond=None)[0]
~~~

## Собственные векторы и SVD
‹np.linalg.eigh(C)› для симметричной матрицы (ковариационной) даёт собственные значения и векторы — это основа PCA. ‹np.linalg.svd(X)› — сингулярное разложение, используется в PCA, рекомендательных системах и сжатии.
`,
      tasks: [
        py('Скалярное произведение и нормы', md`Для векторов ‹a› и ‹b› посчитайте ‹dot›, ‹l2_a›, ‹l1_b› и ‹cos› — косинусную близость.`,
          md`dot = a @ b
l2_a = np.linalg.norm(a)
l1_b = np.abs(b).sum()
cos = dot / (np.linalg.norm(a) * np.linalg.norm(b))`, ['dot', 'l2_a', 'l1_b', 'cos'], { pkgs: ['numpy'], setup: 'import numpy as np\na = np.array([3, -1, 2, 5])\nb = np.array([1, 4, 0, -2])' }),
        py('Похожие товары', md`Матрица ‹E› — эмбеддинги 6 товаров (строки). Найдите для товара 0 самый похожий другой товар по косинусной близости: ‹best› — его индекс, ‹sims› — массив близостей товара 0 со всеми (включая себя).`,
          md`n = np.linalg.norm(E, axis=1)
sims = E @ E[0] / (n * n[0])
best = int(np.argsort(-sims)[1])`, ['best', 'sims'], { pkgs: ['numpy'], setup: 'import numpy as np\nE = np.array([[1, 0.2, 0.1], [0.1, 1, 0.3], [0.9, 0.3, 0.0], [0, 0, 1], [0.5, 0.5, 0.5], [-1, 0.1, 0.2]])' }),
        py('Умножение матриц', md`Дана матрица признаков ‹X› (5 × 3) и вектор весов ‹w›. Посчитайте предсказания ‹pred = X @ w + b› и матрицу Грама ‹G = Xᵀ X›.`,
          md`pred = X @ w + b
G = X.T @ X`, ['pred', 'G'], { pkgs: ['numpy'], setup: 'import numpy as np\nX = np.array([[1, 2, 0], [0, 1, 1], [2, 0, 1], [1, 1, 1], [3, 1, 0]])\nw = np.array([0.5, -1.0, 2.0])\nb = 0.3' }),
        py('Система уравнений', md`Решите систему ‹A·x = c› с помощью ‹np.linalg.solve›: ‹x›. Также найдите определитель ‹det› и проверьте ‹ok = np.allclose(A @ x, c)›.`,
          md`x = np.linalg.solve(A, c)
det = np.linalg.det(A)
ok = bool(np.allclose(A @ x, c))`, ['x', 'det', 'ok'], { pkgs: ['numpy'], setup: 'import numpy as np\nA = np.array([[3, 1, -1], [2, 4, 1], [-1, 2, 5]], dtype=float)\nc = np.array([4, 1, 1], dtype=float)' }),
        py('Регрессия в закрытой форме', md`Найдите веса линейной регрессии со свободным членом по формуле нормального уравнения для данных ‹X›, ‹y›. Сохраните ‹w› — массив ‹[w0, w1, w2]› (‹w0› — свободный член) и ‹mse› на обучении.`,
          md`X1 = np.column_stack([np.ones(len(X)), X])
w = np.linalg.solve(X1.T @ X1, X1.T @ y)
mse = np.mean((X1 @ w - y) ** 2)`, ['w', 'mse'], { pkgs: ['numpy'], setup: 'import numpy as np\nrng = np.random.default_rng(0)\nX = rng.normal(size=(50, 2))\ny = 4 + 2 * X[:, 0] - 3 * X[:, 1] + rng.normal(0, 0.5, 50)' }),
        py('Собственные значения', md`Для матрицы ковариации ‹C› признаков ‹X› (‹np.cov(X, rowvar=False)›) найдите собственные значения ‹vals› по убыванию и долю дисперсии ‹share_1›, которую объясняет первая главная компонента.`,
          md`C = np.cov(X, rowvar=False)
vals = np.sort(np.linalg.eigvalsh(C))[::-1]
share_1 = vals[0] / vals.sum()`, ['vals', 'share_1'], { pkgs: ['numpy'], setup: 'import numpy as np\nrng = np.random.default_rng(1)\nz = rng.normal(size=200)\nX = np.column_stack([z + rng.normal(0, 0.3, 200), 2 * z + rng.normal(0, 0.3, 200), rng.normal(size=200)])' }),
        ch('Размерности', md`‹X› имеет форму (100, 5), ‹w› — (5,). Какая форма у ‹X @ w›?`, ['(5,)', '(100,)', '(100, 5)', 'Ошибка'], 1, md`(100 × 5) @ (5,) = (100,) — по одному предсказанию на объект.`),
      ],
    },
    {
      title: 'Производные, градиент и градиентный спуск',
      theory: md`
Обучение модели — это поиск параметров, минимизирующих функцию потерь. Для большинства моделей это делает **градиентный спуск**: шаг против градиента.

## Производные, которые нужно знать
| f(x) | f′(x) |
|---|---|
| ‹xⁿ› | ‹n·xⁿ⁻¹› |
| ‹eˣ› | ‹eˣ› |
| ‹ln x› | ‹1/x› |
| ‹σ(x) = 1/(1+e⁻ˣ)› | ‹σ(x)(1 − σ(x))› |
| ‹(wx − y)²› по w | ‹2x(wx − y)› |

Цепное правило: ‹(f(g(x)))′ = f′(g(x))·g′(x)› — на нём построен backpropagation.

## Градиент
Вектор частных производных по всем параметрам. Указывает направление наибольшего роста функции.
$$ MSE(w) = (1/n)·‖Xw − y‖²,   ∇MSE = (2/n)·Xᵀ(Xw − y)

## Градиентный спуск
~~~py
w = np.zeros(d)
for step in range(1000):
    grad = 2 / n * X.T @ (X @ w - y)
    w -= lr * grad
~~~
- **Шаг обучения (learning rate)**: слишком большой — расходимся, слишком маленький — учимся вечность.
- **Стохастический (SGD)** и **mini-batch** считают градиент по случайной части данных: быстрее на больших данных, шум помогает выбираться из плохих областей.
- **Масштабирование признаков** ускоряет сходимость.
- Оптимизаторы в нейросетях: Momentum, RMSProp, Adam.

## Численная проверка градиента
$$ f′(x) ≈ (f(x + h) − f(x − h)) / 2h
Так проверяют, что аналитический градиент написан без ошибок.
`,
      tasks: [
        py('Численная производная', md`Напишите функцию ‹num_grad(f, x, h=1e-5)› — центральная разностная производная. Посчитайте ‹d1› — производную ‹sigmoid› в точке 0.5 численно и ‹d2› — аналитически (‹σ(x)(1 − σ(x))›).`,
          md`import math
def sigmoid(x):
    return 1 / (1 + math.exp(-x))
def num_grad(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)
d1 = num_grad(sigmoid, 0.5)
d2 = sigmoid(0.5) * (1 - sigmoid(0.5))`, ['d1', 'd2', 'num_grad(lambda t: t ** 3, 2.0)']),
        py('Градиентный спуск для регрессии', md`Обучите линейную регрессию градиентным спуском (MSE, без регуляризации): признаки ‹X› уже содержат столбец единиц. ‹w› стартует с нулей, ‹lr = 0.1›, 500 шагов. Сохраните итоговые веса ‹w› и ‹losses› — список MSE после каждого шага.`,
          md`w = np.zeros(X.shape[1])
losses = []
n = len(y)
for _ in range(500):
    grad = 2 / n * X.T @ (X @ w - y)
    w = w - 0.1 * grad
    losses.append(float(np.mean((X @ w - y) ** 2)))`, ['w', 'losses[-1]', 'len(losses)', 'losses[0]'], { pkgs: ['numpy'], setup: 'import numpy as np\nrng = np.random.default_rng(2)\nx = rng.normal(size=(80, 2))\nX = np.column_stack([np.ones(80), x])\ny = 1.5 + 2 * x[:, 0] - x[:, 1] + rng.normal(0, 0.3, 80)' }),
        py('Логистическая регрессия с нуля', md`Реализуйте логистическую регрессию градиентным спуском: ‹p = sigmoid(X @ w)›, градиент log-loss ‹Xᵀ(p − y)/n›. ‹w› с нулей, ‹lr = 0.5›, 300 шагов. Сохраните ‹w› и ‹acc› — долю верных ответов на обучении при пороге 0.5.`,
          md`def sigmoid(z):
    return 1 / (1 + np.exp(-z))
w = np.zeros(X.shape[1])
for _ in range(300):
    p = sigmoid(X @ w)
    w = w - 0.5 * X.T @ (p - y) / len(y)
acc = np.mean((sigmoid(X @ w) >= 0.5) == y)`, ['w', 'acc'], { pkgs: ['numpy'], setup: 'import numpy as np\nrng = np.random.default_rng(3)\nx = rng.normal(size=(200, 2))\nX = np.column_stack([np.ones(200), x])\ny = (0.5 + 2 * x[:, 0] - 1.5 * x[:, 1] + rng.normal(0, 1, 200) > 0).astype(float)' }),
        py('Mini-batch SGD', md`Повторите градиентный спуск для регрессии из задачи выше, но мини-батчами по 16 объектов: 50 эпох, ‹lr = 0.05›, в начале каждой эпохи перемешивайте индексы через ‹rng.permutation(n)› генератора ‹rng = np.random.default_rng(0)›. Сохраните итоговые ‹w›.`,
          md`rng = np.random.default_rng(0)
w = np.zeros(X.shape[1]); n = len(y)
for _ in range(50):
    idx = rng.permutation(n)
    for s in range(0, n, 16):
        b = idx[s:s + 16]
        grad = 2 / len(b) * X[b].T @ (X[b] @ w - y[b])
        w = w - 0.05 * grad`, ['w'], { pkgs: ['numpy'], setup: 'import numpy as np\n_r = np.random.default_rng(2)\nx = _r.normal(size=(80, 2))\nX = np.column_stack([np.ones(80), x])\ny = 1.5 + 2 * x[:, 0] - x[:, 1] + _r.normal(0, 0.3, 80)' }),
        ch('Шаг обучения', md`Лосс при обучении растёт и уходит в бесконечность. Наиболее вероятная причина?`, ['Слишком маленький learning rate', 'Слишком большой learning rate', 'Мало данных', 'Слишком много эпох'], 1, md`При большом шаге спуск «перепрыгивает» минимум и раскачивается. Уменьшите lr или отмасштабируйте признаки.`),
        ch('Цепное правило', md`Чему равна производная ‹f(x) = ln(1 + e²ˣ)›?`, ['‹1/(1 + e²ˣ)›', '‹2e²ˣ/(1 + e²ˣ)›', '‹e²ˣ›', '‹2/(1 + e²ˣ)›'], 1, md`(ln u)′ = u′/u, u = 1 + e²ˣ, u′ = 2e²ˣ.`),
        ...gdGen,
      ],
    },
  ],
});

/* =========================== КЛАССИЧЕСКИЕ МОДЕЛИ =========================== */
COURSE.add({
  id: 'mlclassic', title: 'Классические модели', short: 'Линейная и логистическая регрессия, регуляризация, kNN, деревья решений, наивный Байес, SVM — руками и в scikit-learn.',
  lessons: [
    {
      title: 'Линейные модели и регуляризация',
      theory: md`
## API scikit-learn
Все модели устроены одинаково: ‹model.fit(X_train, y_train)›, ‹model.predict(X)›, у классификаторов ещё ‹predict_proba›. Обучаемые параметры заканчиваются на ‹_›: ‹coef_›, ‹intercept_›.

~~~py
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, LogisticRegression
from sklearn.datasets import load_diabetes
X, y = load_diabetes(return_X_y=True)
m = Ridge(alpha=1.0).fit(X, y)
m.coef_, m.intercept_, m.score(X, y)     # score — R² для регрессии, accuracy для классификации
~~~

## Регуляризация
Штраф за большие веса снижает переобучение.
| Модель | Штраф | Эффект |
|---|---|---|
| Ridge (L2) | ‹α·Σwᵢ²› | сжимает все веса, устойчива к мультиколлинеарности |
| Lasso (L1) | ‹α·Σ|wᵢ|› | зануляет часть весов — отбор признаков |
| ElasticNet | смесь | компромисс |

В ‹LogisticRegression› сила регуляризации задаётся ‹C = 1/α›: чем меньше ‹C›, тем сильнее штраф.

## Допущения и интерпретация линейной регрессии
- линейная связь, независимые ошибки с постоянной дисперсией;
- коэффициенты сравнимы между собой только после стандартизации признаков;
- мультиколлинеарность делает коэффициенты неустойчивыми (VIF).

## Логистическая регрессия
Линейная модель для логита вероятности: ‹log(p/(1−p)) = w₀ + Σwᵢxᵢ›. ‹exp(wᵢ)› — во сколько раз меняются шансы при росте xᵢ на 1. Многоклассовая — через softmax.
`,
      tasks: [
        py('Ridge и Lasso', md`На ‹load_diabetes› обучите ‹LinearRegression›, ‹Ridge(alpha=1.0)› и ‹Lasso(alpha=1.0)› на всех данных. Сохраните ‹n_zero_lasso› — число нулевых коэффициентов у Lasso, ‹norm_lr›, ‹norm_ridge› — L2-нормы векторов коэффициентов первых двух моделей.`,
          md`from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression, Ridge, Lasso
X, y = load_diabetes(return_X_y=True)
lr = LinearRegression().fit(X, y); rg = Ridge(alpha=1.0).fit(X, y); ls = Lasso(alpha=1.0).fit(X, y)
n_zero_lasso = int((ls.coef_ == 0).sum())
norm_lr, norm_ridge = np.linalg.norm(lr.coef_), np.linalg.norm(rg.coef_)`, ['n_zero_lasso', 'norm_lr', 'norm_ridge'], { pkgs: SK }),
        py('Путь регуляризации', md`Для ‹Lasso› на ‹load_diabetes› с ‹alpha› из списка ‹[0.01, 0.1, 0.5, 1, 2, 5]› посчитайте число ненулевых коэффициентов. Сохраните ‹nonzero› — список чисел в том же порядке.`,
          md`from sklearn.datasets import load_diabetes
from sklearn.linear_model import Lasso
X, y = load_diabetes(return_X_y=True)
nonzero = [int((Lasso(alpha=a).fit(X, y).coef_ != 0).sum()) for a in [0.01, 0.1, 0.5, 1, 2, 5]]`, ['nonzero'], { pkgs: SK }),
        py('Шансы в логистической регрессии', md`На ‹load_breast_cancer› стандартизируйте признаки (‹StandardScaler›), обучите ‹LogisticRegression(max_iter=1000)›. Сохраните ‹top_feature› — название признака с наибольшим по модулю коэффициентом и ‹odds_ratio› — ‹exp› этого коэффициента.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
d = load_breast_cancer()
Xs = StandardScaler().fit_transform(d.data)
m = LogisticRegression(max_iter=1000).fit(Xs, d.target)
i = int(np.argmax(np.abs(m.coef_[0])))
top_feature = str(d.feature_names[i])
odds_ratio = float(np.exp(m.coef_[0][i]))`, ['top_feature', 'odds_ratio'], { pkgs: SK }),
        py('Многоклассовая классификация', md`На ‹load_iris› обучите ‹LogisticRegression(max_iter=1000)› на всех данных. Сохраните ‹probs› — вероятности классов для первого объекта (массив из 3) и ‹acc› — accuracy на обучении.`,
          md`from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
X, y = load_iris(return_X_y=True)
m = LogisticRegression(max_iter=1000).fit(X, y)
probs = m.predict_proba(X[:1])[0]
acc = m.score(X, y)`, ['probs', 'acc'], { pkgs: SK }),
        ch('L1 или L2', md`Нужно обучить линейную модель и заодно отобрать небольшое число важных признаков из 500. Какую регуляризацию выбрать?`, ['L2 (Ridge)', 'L1 (Lasso)', 'Никакую', 'Только масштабирование'], 1, md`L1 зануляет часть весов — модель сама отбирает признаки.`),
        ch('Параметр C', md`В ‹LogisticRegression(C=0.01)› по сравнению с ‹C=100› регуляризация…`, ['слабее', 'сильнее', 'такая же', 'отключена'], 1, md`‹C› — обратная сила регуляризации.`),
        ...ridgeGen,
        ...sigGen,
      ],
    },
    {
      title: 'kNN, деревья, наивный Байес, SVM',
      theory: md`
## k ближайших соседей (kNN)
Класс объекта — большинство среди k ближайших обучающих объектов. Нет обучения как такового, но предсказание медленное на больших данных. **Обязательно масштабировать признаки.** Маленькое k — переобучение, большое — недообучение.

## Решающее дерево
Рекурсивно делит данные по условию «признак ≤ порог», выбирая разбиение, которое сильнее всего уменьшает неопределённость:
$$ Gini = 1 − Σ pₖ²         Энтропия = −Σ pₖ log₂ pₖ
$$ Information gain = H(родитель) − Σ (nᵢ/n)·H(потомокᵢ)
Глубокое дерево переобучается; регулируют ‹max_depth›, ‹min_samples_leaf›. Деревьям не нужно масштабирование, они ловят нелинейности и взаимодействия.

## Наивный Байес
‹P(класс | x) ∝ P(класс)·Π P(xᵢ | класс)› при «наивном» допущении о независимости признаков. Быстрый и хороший бейзлайн для текстов (‹MultinomialNB›).

## SVM
Ищет разделяющую гиперплоскость с максимальным зазором. Ядра (RBF, полиномиальное) дают нелинейные границы. Хорош на небольших данных средней размерности; плохо масштабируется на миллионы объектов.

~~~py
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
tree = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X, y)
print(export_text(tree, feature_names=names))
tree.feature_importances_
~~~
`,
      tasks: [
        py('kNN и масштабирование', md`На ‹load_wine› разбейте данные (‹test_size=0.3, random_state=0, stratify=y›). Обучите ‹KNeighborsClassifier(n_neighbors=5)› без масштабирования и с ‹StandardScaler› (обучите скейлер на train). Сохраните ‹acc_raw› и ‹acc_scaled› — accuracy на тесте.`,
          md`from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
X, y = load_wine(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
acc_raw = KNeighborsClassifier(5).fit(Xa, ya).score(Xb, yb)
sc = StandardScaler().fit(Xa)
acc_scaled = KNeighborsClassifier(5).fit(sc.transform(Xa), ya).score(sc.transform(Xb), yb)`, ['acc_raw', 'acc_scaled'], { pkgs: SK }),
        py('Подбор k', md`Для той же задачи (‹load_wine›, тот же сплит, со ‹StandardScaler›) переберите ‹k› от 1 до 25 и сохраните ‹best_k› — наименьшее k с максимальной accuracy на тесте, и ‹accs› — список accuracy.`,
          md`from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
X, y = load_wine(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
sc = StandardScaler().fit(Xa); Xa, Xb = sc.transform(Xa), sc.transform(Xb)
accs = [KNeighborsClassifier(k).fit(Xa, ya).score(Xb, yb) for k in range(1, 26)]
best_k = int(np.argmax(accs)) + 1`, ['best_k', 'accs'], { pkgs: SK }),
        py('Gini и information gain руками', md`Напишите ‹gini(labels)› (индекс Джини для списка меток) и ‹info_gain(parent, left, right)› на основе Джини: ‹G(parent) − (nL/n)·G(left) − (nR/n)·G(right)›.`,
          md`from collections import Counter
def gini(labels):
    n = len(labels)
    return 1 - sum((c / n) ** 2 for c in Counter(labels).values())
def info_gain(parent, left, right):
    n = len(parent)
    return gini(parent) - len(left) / n * gini(left) - len(right) / n * gini(right)`, ['gini([0, 0, 1, 1])', 'gini([1, 1, 1])', "gini(['a', 'b', 'c', 'a'])", 'info_gain([0, 0, 1, 1, 1, 0], [0, 0, 0], [1, 1, 1])', 'info_gain([0, 1, 0, 1], [0, 1], [0, 1])']),
        py('Лучшее разбиение', md`Для одного признака ‹x› и меток ‹y› переберите пороги — середины между соседними уникальными значениями ‹x› — и найдите ‹best_thr›, дающий максимальный прирост по Джини (функции ‹gini› и ‹info_gain› уже заданы), и ‹best_gain›. Разбиение: ‹x <= thr› влево.`,
          md`xs = sorted(set(x))
best_gain, best_thr = -1, None
for a, b in zip(xs, xs[1:]):
    t = (a + b) / 2
    L = [yy for xx, yy in zip(x, y) if xx <= t]
    Rr = [yy for xx, yy in zip(x, y) if xx > t]
    g = info_gain(y, L, Rr)
    if g > best_gain:
        best_gain, best_thr = g, t`, ['best_thr', 'best_gain'], { setup: md`from collections import Counter
def gini(labels):
    n = len(labels)
    return 1 - sum((c / n) ** 2 for c in Counter(labels).values())
def info_gain(parent, left, right):
    n = len(parent)
    return gini(parent) - len(left) / n * gini(left) - len(right) / n * gini(right)
x = [2, 3, 5, 7, 8, 10, 11, 13]
y = [0, 0, 0, 1, 0, 1, 1, 1]` }),
        py('Глубина дерева и переобучение', md`На ‹load_breast_cancer› (сплит ‹test_size=0.3, random_state=42, stratify=y›) обучите ‹DecisionTreeClassifier(random_state=0)› с ‹max_depth› из ‹[1, 2, 3, 5, 8, None]›. Сохраните ‹train_acc› и ‹test_acc› — списки accuracy, и ‹best_depth_idx› — индекс глубины с лучшей accuracy на тесте (первый при равенстве).`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
X, y = load_breast_cancer(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
train_acc, test_acc = [], []
for d in [1, 2, 3, 5, 8, None]:
    m = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xa, ya)
    train_acc.append(m.score(Xa, ya)); test_acc.append(m.score(Xb, yb))
best_depth_idx = int(np.argmax(test_acc))`, ['train_acc', 'test_acc', 'best_depth_idx'], { pkgs: SK }),
        py('Наивный Байес и SVM', md`На ‹load_breast_cancer› (тот же сплит, что выше) сравните ‹GaussianNB()› и ‹SVC()› на стандартизированных признаках (скейлер на train). Сохраните ‹acc_nb›, ‹acc_svm›.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
X, y = load_breast_cancer(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
sc = StandardScaler().fit(Xa); Xa, Xb = sc.transform(Xa), sc.transform(Xb)
acc_nb = GaussianNB().fit(Xa, ya).score(Xb, yb)
acc_svm = SVC().fit(Xa, ya).score(Xb, yb)`, ['acc_nb', 'acc_svm'], { pkgs: SK }),
        ch('Масштабирование', md`Какой модели **не нужно** масштабирование признаков?`, ['kNN', 'SVM с RBF-ядром', 'Решающее дерево', 'Логистическая регрессия с регуляризацией'], 2, md`Дерево сравнивает признак с порогом, масштаб на разбиение не влияет.`),
        ...giniGen,
        ...knnGen,
      ],
    },
  ],
});

/* =========================== ВАЛИДАЦИЯ И МЕТРИКИ =========================== */
COURSE.add({
  id: 'mlval', title: 'Валидация и метрики', short: 'Train/val/test, кросс-валидация, подбор гиперпараметров, метрики классификации и регрессии, ROC и PR, калибровка, дисбаланс.',
  lessons: [
    {
      title: 'Кросс-валидация и подбор гиперпараметров',
      theory: md`
## Схемы валидации
| Схема | Когда |
|---|---|
| hold-out (train/test) | много данных, быстрые эксперименты |
| K-fold | стандарт для табличных данных |
| Stratified K-fold | классификация, особенно с дисбалансом |
| Group K-fold | несколько строк на одного клиента: клиент целиком в train или в test |
| TimeSeriesSplit | данные во времени: учимся на прошлом, проверяем на будущем |

Отдельный **test** откладывается до самого конца: по нему не выбирают модель, иначе оценка станет оптимистичной.

~~~py
from sklearn.model_selection import cross_val_score, StratifiedKFold, GridSearchCV, RandomizedSearchCV
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_val_score(model, X, y, cv=cv, scoring='roc_auc')
gs = GridSearchCV(model, {'max_depth': [2, 4, 6], 'min_samples_leaf': [1, 5]}, cv=cv, scoring='roc_auc').fit(X, y)
gs.best_params_, gs.best_score_
~~~
Для больших пространств параметров — ‹RandomizedSearchCV› или Optuna (байесовская оптимизация).

## Кривые обучения
Если качество на train высокое, а на валидации низкое — переобучение (больше данных, регуляризация, проще модель). Если обе низкие — недообучение (сложнее модель, новые признаки).
`,
      tasks: [
        py('cross_val_score', md`На ‹load_breast_cancer› оцените ‹LogisticRegression(max_iter=5000)› 5-кратной стратифицированной кросс-валидацией (‹StratifiedKFold(5, shuffle=True, random_state=0)›) по ROC-AUC. Сохраните ‹scores› (массив) и ‹mean_auc›.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold
X, y = load_breast_cancer(return_X_y=True)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
scores = cross_val_score(LogisticRegression(max_iter=5000), X, y, cv=cv, scoring='roc_auc')
mean_auc = scores.mean()`, ['scores', 'mean_auc'], { pkgs: SK }),
        py('GridSearchCV', md`Подберите для ‹DecisionTreeClassifier(random_state=0)› на ‹load_breast_cancer› параметры ‹max_depth ∈ {2, 3, 4, 6}› и ‹min_samples_leaf ∈ {1, 5, 20}› через ‹GridSearchCV› (cv — ‹StratifiedKFold(5, shuffle=True, random_state=0)›, scoring ‹roc_auc›). Сохраните ‹best_params› (словарь) и ‹best_score›.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV, StratifiedKFold
X, y = load_breast_cancer(return_X_y=True)
gs = GridSearchCV(DecisionTreeClassifier(random_state=0), {'max_depth': [2, 3, 4, 6], 'min_samples_leaf': [1, 5, 20]},
                  cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring='roc_auc').fit(X, y)
best_params, best_score = gs.best_params_, gs.best_score_`, ['best_params', 'best_score'], { pkgs: SK }),
        py('K-fold руками', md`Реализуйте 5-fold кросс-валидацию без ‹cross_val_score›: используйте ‹KFold(5, shuffle=True, random_state=1)›, модель ‹Ridge(alpha=1.0)›, данные ‹load_diabetes›, метрика — MAE на валидационной части. Сохраните ‹maes› — список из 5 значений.`,
          md`from sklearn.datasets import load_diabetes
from sklearn.linear_model import Ridge
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error
X, y = load_diabetes(return_X_y=True)
maes = []
for tr, va in KFold(5, shuffle=True, random_state=1).split(X):
    m = Ridge(alpha=1.0).fit(X[tr], y[tr])
    maes.append(mean_absolute_error(y[va], m.predict(X[va])))`, ['maes'], { pkgs: SK }),
        py('GroupKFold', md`В ‹df› несколько строк на клиента. Сделайте разбиение ‹GroupKFold(n_splits=3)› по ‹client_id› и проверьте, что клиенты не пересекаются: сохраните ‹overlaps› — список размеров пересечения множеств клиентов train и val для каждого фолда (должны быть нули) и ‹val_sizes› — размеры валидационных частей.`,
          md`from sklearn.model_selection import GroupKFold
overlaps, val_sizes = [], []
for tr, va in GroupKFold(n_splits=3).split(df, groups=df.client_id):
    overlaps.append(len(set(df.client_id.iloc[tr]) & set(df.client_id.iloc[va])))
    val_sizes.append(len(va))`, ['overlaps', 'val_sizes'], { pkgs: ['scikit-learn', 'pandas'], setup: 'import pandas as pd\nimport numpy as np\n_r = np.random.default_rng(0)\ndf = pd.DataFrame({"client_id": _r.integers(0, 30, 120), "x": _r.normal(size=120)})' }),
        ch('Утечка через подбор', md`Модель выбирали по качеству на test из 20 вариантов, и на test получили AUC 0.91. Что не так с этой оценкой?`, ['Всё правильно', 'Оценка оптимистична: test использован для выбора модели, нужен отдельный отложенный набор или вложенная CV', 'Нужно было использовать accuracy', 'Нужно больше вариантов'], 1, md`Выбор по test превращает его в валидацию. Для честной оценки нужен ещё один нетронутый набор.`),
        ch('Схема валидации', md`Данные — транзакции клиентов, у каждого клиента 20–200 строк. Предсказываем фрод для новых клиентов. Какая схема валидации правильная?`, ['Обычный KFold по строкам', 'GroupKFold по клиенту', 'Leave-one-out', 'Train = test'], 1, md`Строки одного клиента похожи. Если клиент попадёт и в train, и в val, модель «узнает» его, и качество будет завышено.`),
      ],
    },
    {
      title: 'Метрики классификации и регрессии',
      theory: md`
## Классификация
- **Accuracy** — бесполезна при дисбалансе.
- **Precision / Recall / F1** — для фиксированного порога.
- **ROC-AUC** — качество ранжирования по всем порогам: вероятность, что случайный положительный объект получит скор выше случайного отрицательного.
- **PR-AUC (average precision)** — лучше при сильном дисбалансе.
- **Log-loss** — качество вероятностей, сильно штрафует уверенные ошибки.
- **Brier score** — среднеквадратичная ошибка вероятностей.

~~~py
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, log_loss, confusion_matrix, classification_report, precision_recall_curve, roc_curve)
~~~

## Выбор порога
Порог выбирают под бизнес: «recall не ниже 80%», «не больше 1000 звонков в день», «максимум ожидаемой прибыли». ‹precision_recall_curve› даёт значения для всех порогов.

## Калибровка
Модель калибрована, если среди объектов с прогнозом 0.3 доля положительных ≈ 30%. Важно, когда вероятности используют в расчётах денег (ожидаемый убыток, скоринг). Проверка — ‹calibration_curve›, исправление — ‹CalibratedClassifierCV› (Platt, isotonic).

## Дисбаланс классов
‹class_weight='balanced'›, undersampling/oversampling (SMOTE), подбор порога, метрики PR-AUC.

## Регрессия
MAE (устойчива к выбросам), RMSE (штрафует большие ошибки), MAPE/SMAPE (относительные), R², для денег — иногда квантильные лоссы.
`,
      tasks: [
        py('Метрики по порогу', md`Даны ‹y_true› и скоры ‹score› (из ‹setup›). Сохраните ‹auc›, ‹ap› (average precision), ‹prec›, ‹rec›, ‹f1› при пороге 0.5 и ‹cm› — матрицу ошибок ‹confusion_matrix› (массив 2×2).`,
          md`from sklearn.metrics import roc_auc_score, average_precision_score, precision_score, recall_score, f1_score, confusion_matrix
pred = (score >= 0.5).astype(int)
auc = roc_auc_score(y_true, score)
ap = average_precision_score(y_true, score)
prec, rec, f1 = precision_score(y_true, pred), recall_score(y_true, pred), f1_score(y_true, pred)
cm = confusion_matrix(y_true, pred)`, ['auc', 'ap', 'prec', 'rec', 'f1', 'cm'], { pkgs: SK, setup: 'import numpy as np\n_r = np.random.default_rng(4)\ny_true = (_r.random(500) < 0.15).astype(int)\nscore = np.clip(0.3 * y_true + _r.random(500) * 0.7, 0, 1)' }),
        py('ROC-AUC руками', md`Напишите функцию ‹auc_pairs(y, s)›: доля пар (положительный, отрицательный), где скор положительного больше (ничьи считаются как 0.5). Сравните с ‹roc_auc_score›: сохраните ‹mine› и ‹sk› для данных из условия.`,
          md`from sklearn.metrics import roc_auc_score
def auc_pairs(y, s):
    pos = [v for v, t in zip(s, y) if t == 1]
    neg = [v for v, t in zip(s, y) if t == 0]
    tot = 0.0
    for p in pos:
        for n in neg:
            tot += 1.0 if p > n else 0.5 if p == n else 0.0
    return tot / (len(pos) * len(neg))
mine = auc_pairs(y, s)
sk = roc_auc_score(y, s)`, ['mine', 'sk', 'auc_pairs([1, 0], [0.4, 0.4])'], { pkgs: SK, setup: 'y = [1, 0, 1, 1, 0, 0, 1, 0, 0, 1]\ns = [0.9, 0.3, 0.6, 0.45, 0.45, 0.2, 0.8, 0.7, 0.1, 0.55]' }),
        py('Порог под recall', md`Для ‹y_true›, ‹score› из условия найдите ‹thr› — максимальный порог, при котором recall не ниже 0.8 (перебирайте уникальные значения ‹score›, класс 1 — если ‹score >= thr›), и ‹prec_at› — precision при этом пороге.`,
          md`from sklearn.metrics import recall_score, precision_score
best = None
for t in sorted(set(score), reverse=True):
    if recall_score(y_true, score >= t) >= 0.8:
        best = t
        break
thr = best
prec_at = precision_score(y_true, score >= thr)`, ['thr', 'prec_at'], { pkgs: SK, setup: 'import numpy as np\n_r = np.random.default_rng(4)\ny_true = (_r.random(500) < 0.15).astype(int)\nscore = np.round(np.clip(0.3 * y_true + _r.random(500) * 0.7, 0, 1), 3)' }),
        py('class_weight', md`На несбалансированных данных из условия (‹X›, ‹y›, ~5% положительных) разбейте ‹test_size=0.3, random_state=0, stratify=y› и сравните ‹LogisticRegression(max_iter=1000)› с ‹class_weight=None› и ‹'balanced'›. Сохраните ‹rec_plain›, ‹rec_bal› (recall на тесте при пороге 0.5) и ‹auc_plain›, ‹auc_bal›.`,
          md`from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import recall_score, roc_auc_score
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
m1 = LogisticRegression(max_iter=1000).fit(Xa, ya)
m2 = LogisticRegression(max_iter=1000, class_weight='balanced').fit(Xa, ya)
rec_plain, rec_bal = recall_score(yb, m1.predict(Xb)), recall_score(yb, m2.predict(Xb))
auc_plain, auc_bal = roc_auc_score(yb, m1.predict_proba(Xb)[:, 1]), roc_auc_score(yb, m2.predict_proba(Xb)[:, 1])`, ['rec_plain', 'rec_bal', 'auc_plain', 'auc_bal'], { pkgs: SK, setup: 'from sklearn.datasets import make_classification\nX, y = make_classification(n_samples=3000, n_features=10, n_informative=4, weights=[0.95, 0.05], random_state=2)' }),
        py('Калибровка', md`Для ‹GaussianNB› на ‹load_breast_cancer› (сплит ‹test_size=0.4, random_state=0, stratify=y›) посчитайте Brier score на тесте до (‹brier_raw›) и после калибровки ‹CalibratedClassifierCV(GaussianNB(), method='isotonic', cv=5)› (‹brier_cal›).`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss
X, y = load_breast_cancer(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.4, random_state=0, stratify=y)
brier_raw = brier_score_loss(yb, GaussianNB().fit(Xa, ya).predict_proba(Xb)[:, 1])
brier_cal = brier_score_loss(yb, CalibratedClassifierCV(GaussianNB(), method='isotonic', cv=5).fit(Xa, ya).predict_proba(Xb)[:, 1])`, ['brier_raw', 'brier_cal'], { pkgs: SK }),
        mu('Когда важен precision', md`В каких задачах ошибка FP (ложная тревога) обычно дороже FN? Отметьте все.`, ['Блокировка карты клиента по подозрению во фроде без проверки', 'Скрининг на редкое опасное заболевание', 'Рассылка дорогого подарка «клиентам, склонным уйти»', 'Поиск дефектов на конвейере, где пропуск дефекта — отзыв партии'], [0, 2], md`Блокировка честного клиента и дорогой подарок «не тем» — дорогие ложные срабатывания. В скрининге и контроле качества дороже пропуск.`),
        ...cmGen,
        ...regGen,
      ],
    },
  ],
});

/* =========================== ПРИЗНАКИ И ПАЙПЛАЙНЫ =========================== */
COURSE.add({
  id: 'mlfeat', title: 'Признаки и пайплайны', short: 'Кодирование категорий, масштабирование, пропуски, признаки из дат и агрегатов, Pipeline и ColumnTransformer, отбор и важность признаков.',
  lessons: [
    {
      title: 'Feature engineering',
      theory: md`
Качество табличной модели определяют прежде всего признаки.

## Категориальные признаки
| Способ | Когда |
|---|---|
| One-hot | немного категорий, линейные модели |
| Ordinal | категории с порядком (S < M < L) |
| Target / mean encoding | много категорий; **только по out-of-fold**, иначе утечка |
| Частотное кодирование | быстро, часто полезно для деревьев |
| Нативная обработка | CatBoost, LightGBM |

## Числовые
Логарифм для скошенных величин (‹np.log1p›), биннинг, отношения (чек = выручка / заказы), разности, взаимодействия.

## Даты и время
День недели, час, месяц, праздник, «дней с регистрации», «дней с последней покупки» (recency), циклическое кодирование ‹sin/cos› для часа.

## Агрегаты по истории (RFM и др.)
Для каждого клиента: число покупок, сумма, средний чек, дней с последней покупки — **только по данным до момента прогноза**.

## Pipeline
Весь препроцессинг внутри ‹Pipeline›: обучается только на train-фолде, нет утечки, легко деплоить.
~~~py
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
pre = ColumnTransformer([
    ('num', make_pipeline(SimpleImputer(strategy='median'), StandardScaler()), num_cols),
    ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols),
])
model = Pipeline([('pre', pre), ('clf', LogisticRegression(max_iter=1000))])
cross_val_score(model, df, y, cv=5, scoring='roc_auc')
~~~

## Важность признаков
‹feature_importances_› деревьев (смещена к признакам с большим числом значений), permutation importance (‹sklearn.inspection.permutation_importance›), SHAP.
`,
      tasks: [
        py('One-hot в pandas', md`Закодируйте ‹channel› и ‹city› таблицы ‹users› через ‹pd.get_dummies(..., columns=[...], dtype=int)›. Сохраните ‹X› — получившийся DataFrame без ‹user_id› и ‹reg_date›, и ‹n_cols› — число столбцов.`,
          md`X = pd.get_dummies(users.drop(columns=['user_id', 'reg_date']), columns=['channel', 'city'], dtype=int)
n_cols = X.shape[1]`, ['X', 'n_cols'], { data: ['users'] }),
        py('RFM-признаки', md`По доставленным заказам ‹orders› до 2025-07-01 (не включая) постройте для каждого пользователя: ‹recency› — дней от последнего заказа до 2025-07-01, ‹frequency› — число заказов, ‹monetary› — сумма. ‹rfm› — DataFrame с индексом ‹user_id› и тремя столбцами в этом порядке.`,
          md`d = orders[(orders.status == 'delivered') & (orders.order_date < '2025-07-01')]
rfm = d.groupby('user_id').agg(recency=('order_date', lambda s: (pd.Timestamp('2025-07-01') - s.max()).days), frequency=('order_id', 'count'), monetary=('amount', 'sum'))`, ['rfm'], { data: ['orders'] }),
        py('Целевая переменная без утечки', md`Постройте задачу оттока на «Корзинке». Признаки — RFM до 2025-07-01 (как в прошлой задаче, для пользователей с хотя бы одним доставленным заказом до этой даты). Цель ‹churn› = 1, если у пользователя **нет** доставленных заказов в июле 2025. Сохраните DataFrame ‹ds› = RFM + столбец ‹churn› (индекс ‹user_id›) и ‹churn_rate›.`,
          md`d = orders[orders.status == 'delivered']
hist = d[d.order_date < '2025-07-01']
ds = hist.groupby('user_id').agg(recency=('order_date', lambda s: (pd.Timestamp('2025-07-01') - s.max()).days), frequency=('order_id', 'count'), monetary=('amount', 'sum'))
july = set(d.loc[d.order_date >= '2025-07-01', 'user_id'])
ds['churn'] = (~ds.index.isin(july)).astype(int)
churn_rate = ds.churn.mean()`, ['ds', 'churn_rate'], { data: ['orders'] }),
        py('Pipeline с ColumnTransformer', md`Обучите модель оттока: к ‹ds› из прошлой задачи (уже построен в ‹setup›) добавлены ‹age›, ‹city›, ‹channel›. Соберите ‹Pipeline›: числовые (‹recency, frequency, monetary, age›) — ‹StandardScaler›, категориальные (‹city, channel›) — ‹OneHotEncoder(handle_unknown='ignore')›, модель — ‹LogisticRegression(max_iter=1000)›. Сохраните ‹cv_auc› — средний ROC-AUC по ‹StratifiedKFold(5, shuffle=True, random_state=0)›.`,
          md`from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold
num_cols = ['recency', 'frequency', 'monetary', 'age']; cat_cols = ['city', 'channel']
pre = ColumnTransformer([('num', StandardScaler(), num_cols), ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)])
pipe = Pipeline([('pre', pre), ('clf', LogisticRegression(max_iter=1000))])
cv_auc = cross_val_score(pipe, ds[num_cols + cat_cols], ds.churn, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring='roc_auc').mean()`, ['cv_auc'], {
            pkgs: ['scikit-learn', 'pandas'], data: ['orders', 'users'], setup: md`d = orders[orders.status == 'delivered']
hist = d[d.order_date < '2025-07-01']
ds = hist.groupby('user_id').agg(recency=('order_date', lambda s: (pd.Timestamp('2025-07-01') - s.max()).days), frequency=('order_id', 'count'), monetary=('amount', 'sum'))
ds['churn'] = (~ds.index.isin(set(d.loc[d.order_date >= '2025-07-01', 'user_id']))).astype(int)
ds = ds.join(users.set_index('user_id')[['age', 'city', 'channel']])` }),
        py('Target encoding без утечки', md`Закодируйте ‹city› средним таргетом out-of-fold: для каждого из 5 фолдов ‹KFold(5, shuffle=True, random_state=0)› среднее ‹churn› по городу считается только по обучающей части и записывается в валидационную. Сохраните Series ‹te› (индекс как у ‹ds›).`,
          md`from sklearn.model_selection import KFold
te = pd.Series(np.nan, index=ds.index)
for tr, va in KFold(5, shuffle=True, random_state=0).split(ds):
    means = ds.iloc[tr].groupby('city').churn.mean()
    te.iloc[va] = ds.iloc[va].city.map(means).to_numpy()`, ['te'], {
            pkgs: ['scikit-learn', 'pandas'], data: ['orders', 'users'], setup: md`d = orders[orders.status == 'delivered']
hist = d[d.order_date < '2025-07-01']
ds = hist.groupby('user_id').agg(recency=('order_date', lambda s: (pd.Timestamp('2025-07-01') - s.max()).days), frequency=('order_id', 'count'), monetary=('amount', 'sum'))
ds['churn'] = (~ds.index.isin(set(d.loc[d.order_date >= '2025-07-01', 'user_id']))).astype(int)
ds = ds.join(users.set_index('user_id')[['age', 'city', 'channel']])` }),
        py('Permutation importance', md`Обучите ‹RandomForestClassifier(n_estimators=100, random_state=0)› на ‹load_breast_cancer› (сплит ‹test_size=0.3, random_state=0, stratify=y›) и посчитайте ‹permutation_importance› на тесте (‹n_repeats=5, random_state=0›). Сохраните ‹top3› — названия трёх признаков с наибольшей средней важностью.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split
d = load_breast_cancer()
Xa, Xb, ya, yb = train_test_split(d.data, d.target, test_size=0.3, random_state=0, stratify=d.target)
m = RandomForestClassifier(n_estimators=100, random_state=0).fit(Xa, ya)
pi = permutation_importance(m, Xb, yb, n_repeats=5, random_state=0)
top3 = [str(d.feature_names[i]) for i in np.argsort(-pi.importances_mean)[:3]]`, ['top3'], { pkgs: SK }),
        py('Циклическое кодирование', md`Для часа ‹h› (0–23) постройте признаки ‹h_sin = sin(2πh/24)› и ‹h_cos = cos(2πh/24)›. Сохраните массивы для ‹hours› и ‹dist_23_0› — евклидово расстояние между часами 23 и 0 в этом представлении, ‹dist_12_0› — между 12 и 0.`,
          md`h = np.array(hours)
h_sin, h_cos = np.sin(2 * np.pi * h / 24), np.cos(2 * np.pi * h / 24)
pt = lambda x: np.array([np.sin(2 * np.pi * x / 24), np.cos(2 * np.pi * x / 24)])
dist_23_0 = float(np.linalg.norm(pt(23) - pt(0)))
dist_12_0 = float(np.linalg.norm(pt(12) - pt(0)))`, ['h_sin', 'h_cos', 'dist_23_0', 'dist_12_0'], { pkgs: ['numpy'], setup: 'hours = [0, 6, 12, 18, 23]' }),
        ch('Где обучать скейлер', md`Где правильно вызывать ‹fit› у ‹StandardScaler›?`, ['На всех данных до разбиения', 'Только на обучающей части (внутри каждого фолда)', 'Только на тестовой', 'Неважно'], 1, md`Иначе статистики теста «просачиваются» в обучение. ‹Pipeline› делает это автоматически.`),
      ],
    },
  ],
});

/* =========================== АНСАМБЛИ И БУСТИНГ =========================== */
COURSE.add({
  id: 'mlens', title: 'Ансамбли и бустинг', short: 'Bagging и случайный лес, градиентный бустинг, CatBoost/LightGBM/XGBoost, ранняя остановка, стекинг.',
  lessons: [
    {
      title: 'Случайный лес и градиентный бустинг',
      theory: md`
## Bagging и случайный лес
Много деревьев на бутстрап-выборках; в каждом разбиении — случайное подмножество признаков. Ответ — среднее/голосование. Снижает дисперсию, почти не переобучается с ростом числа деревьев, мало настраивается. OOB-оценка — качество на объектах, не попавших в бутстрап.

## Градиентный бустинг
Деревья строятся **последовательно**: каждое следующее учится на градиенте лосса (для MSE — на остатках) предыдущего ансамбля:
$$ F_m(x) = F_{m−1}(x) + η · h_m(x)
Ключевые параметры: ‹learning_rate› (η), ‹n_estimators›, ‹max_depth›/‹num_leaves›, ‹subsample›, ‹colsample›, регуляризация, ‹min_child_samples›. Маленький learning_rate + много деревьев + **ранняя остановка** по валидации — стандартный рецепт.

| Библиотека | Особенности |
|---|---|
| XGBoost | классика, регуляризация, работает везде |
| LightGBM | очень быстрый, leaf-wise рост, нативные категории |
| CatBoost | лучший с категориями «из коробки», симметричные деревья, мало тюнинга |
| sklearn ‹HistGradientBoosting› | быстрый, встроен в sklearn |

## Стекинг
Предсказания нескольких моделей (out-of-fold) подаются на вход мета-модели. ‹StackingClassifier› в sklearn.

На табличных данных бустинг почти всегда сильнее нейросетей и линейных моделей.
`,
      tasks: [
        py('Случайный лес и OOB', md`На ‹load_breast_cancer› обучите ‹RandomForestClassifier(n_estimators=200, oob_score=True, random_state=0)› на всех данных. Сохраните ‹oob› — OOB-accuracy и ‹top_feature› — признак с максимальной ‹feature_importances_›.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
d = load_breast_cancer()
m = RandomForestClassifier(n_estimators=200, oob_score=True, random_state=0).fit(d.data, d.target)
oob = m.oob_score_
top_feature = str(d.feature_names[int(np.argmax(m.feature_importances_))])`, ['oob', 'top_feature'], { pkgs: SK }),
        py('Бустинг руками', md`Реализуйте градиентный бустинг для регрессии с MSE: начальный прогноз — среднее ‹y›, затем 50 итераций: обучить ‹DecisionTreeRegressor(max_depth=2, random_state=0)› на остатках ‹y − F›, обновить ‹F += 0.1 · tree.predict(X)›. Данные ‹load_diabetes›. Сохраните ‹mse_hist› — список MSE на обучении после каждой итерации.`,
          md`from sklearn.datasets import load_diabetes
from sklearn.tree import DecisionTreeRegressor
X, y = load_diabetes(return_X_y=True)
F = np.full(len(y), y.mean())
mse_hist = []
for _ in range(50):
    t = DecisionTreeRegressor(max_depth=2, random_state=0).fit(X, y - F)
    F = F + 0.1 * t.predict(X)
    mse_hist.append(float(np.mean((y - F) ** 2)))`, ['mse_hist'], { pkgs: SK }),
        py('Ранняя остановка', md`Обучите ‹GradientBoostingClassifier(n_estimators=500, learning_rate=0.05, max_depth=3, random_state=0)› на ‹load_breast_cancer› (сплит ‹test_size=0.3, random_state=0, stratify=y›). С помощью ‹staged_predict_proba› найдите ‹best_iter› — число деревьев (с 1) с минимальным log-loss на тесте, и ‹best_loss›.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import log_loss
X, y = load_breast_cancer(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
m = GradientBoostingClassifier(n_estimators=500, learning_rate=0.05, max_depth=3, random_state=0).fit(Xa, ya)
losses = [log_loss(yb, p[:, 1]) for p in m.staged_predict_proba(Xb)]
best_iter = int(np.argmin(losses)) + 1
best_loss = min(losses)`, ['best_iter', 'best_loss'], { pkgs: SK }),
        py('HistGradientBoosting', md`На ‹make_classification(n_samples=5000, n_features=20, n_informative=8, random_state=0)› сравните 5-fold ROC-AUC (‹StratifiedKFold(5, shuffle=True, random_state=0)›) у ‹LogisticRegression(max_iter=1000)› и ‹HistGradientBoostingClassifier(random_state=0)›. Сохраните ‹auc_lr›, ‹auc_hgb›.`,
          md`from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
X, y = make_classification(n_samples=5000, n_features=20, n_informative=8, random_state=0)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
auc_lr = cross_val_score(LogisticRegression(max_iter=1000), X, y, cv=cv, scoring='roc_auc').mean()
auc_hgb = cross_val_score(HistGradientBoostingClassifier(random_state=0), X, y, cv=cv, scoring='roc_auc').mean()`, ['auc_lr', 'auc_hgb'], { pkgs: SK }),
        py('Стекинг', md`Соберите ‹StackingClassifier› из ‹RandomForestClassifier(n_estimators=100, random_state=0)› и ‹LogisticRegression(max_iter=5000)› с мета-моделью ‹LogisticRegression(max_iter=5000)› (‹cv=5›). На ‹load_breast_cancer› (сплит ‹test_size=0.3, random_state=0, stratify=y›) сохраните ‹acc_stack› на тесте.`,
          md`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import StackingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
X, y = load_breast_cancer(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
st = StackingClassifier([('rf', RandomForestClassifier(n_estimators=100, random_state=0)), ('lr', LogisticRegression(max_iter=5000))], final_estimator=LogisticRegression(max_iter=5000), cv=5)
acc_stack = st.fit(Xa, ya).score(Xb, yb)`, ['acc_stack'], { pkgs: SK }),
        ch('Bagging vs boosting', md`Какое утверждение верно?`, ['Бустинг уменьшает в основном дисперсию, бэггинг — смещение', 'Бэггинг уменьшает в основном дисперсию, бустинг — смещение', 'Оба строят деревья параллельно', 'Случайный лес — это бустинг'], 1, md`Лес усредняет сильные переобученные деревья (снижает дисперсию), бустинг последовательно исправляет ошибки слабых моделей (снижает смещение).`),
        ch('Learning rate бустинга', md`Уменьшили ‹learning_rate› в 10 раз. Что обычно нужно сделать с ‹n_estimators›?`, ['Уменьшить', 'Увеличить, примерно в 10 раз (с ранней остановкой)', 'Оставить', 'Поставить 1'], 1, md`Каждый шаг стал меньше — деревьев нужно больше. Обычно это даёт чуть лучшее качество ценой времени.`),
        ch('Категории', md`В данных 15 категориальных признаков с сотнями значений. Какая библиотека бустинга работает с ними лучше всего без ручного кодирования?`, ['XGBoost старых версий', 'CatBoost', 'Линейная регрессия', 'kNN'], 1, md`CatBoost использует упорядоченное target-кодирование без утечки.`),
      ],
    },
  ],
});

/* =========================== БЕЗ УЧИТЕЛЯ =========================== */
COURSE.add({
  id: 'mlunsup', title: 'Кластеризация и понижение размерности', short: 'k-means, выбор числа кластеров, DBSCAN, иерархическая кластеризация, PCA, t-SNE/UMAP, поиск аномалий.',
  lessons: [
    {
      title: 'Кластеризация и PCA',
      theory: md`
## k-means
1. Случайно выбрать k центроидов. 2. Отнести каждую точку к ближайшему. 3. Пересчитать центроиды как средние. 4. Повторять до сходимости.
- Чувствителен к масштабу признаков и выбросам, ищет «круглые» кластеры одинакового размера.
- Число кластеров: метод локтя (‹inertia_›), силуэт (‹silhouette_score›), а главное — бизнес-интерпретация.

## DBSCAN
Кластер — область высокой плотности; точки в разреженных местах помечаются как шум (‹-1›). Не нужно задавать k, находит кластеры любой формы. Параметры ‹eps› и ‹min_samples›.

## Иерархическая кластеризация
Строит дерево объединений (дендрограмму); удобно для небольших данных и объяснения.

## PCA
Новые оси — направления максимальной дисперсии (собственные векторы матрицы ковариации). Используют для визуализации, сжатия, борьбы с мультиколлинеарностью. Признаки нужно стандартизировать.
~~~py
from sklearn.decomposition import PCA
pca = PCA(n_components=0.95)        # столько компонент, чтобы объяснить 95% дисперсии
Z = pca.fit_transform(StandardScaler().fit_transform(X))
pca.explained_variance_ratio_
~~~
t-SNE и UMAP — нелинейные методы для **визуализации** (не для признаков модели).

## Аномалии
Isolation Forest, Local Outlier Factor, z-score и IQR по одному признаку.

## Сегментация клиентов — типичная задача аналитика/DS
RFM → логарифм → стандартизация → k-means → описание кластеров средними значениями → названия сегментов («спящие», «киты», «новички»).
`,
      tasks: [
        py('k-means и силуэт', md`На ‹make_blobs(n_samples=500, centers=4, cluster_std=1.2, random_state=0)› обучите ‹KMeans(n_clusters=k, n_init=10, random_state=0)› для k от 2 до 7. Сохраните ‹inertias›, ‹silhouettes› (списки) и ‹best_k› — k с максимальным силуэтом.`,
          md`from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
X, _ = make_blobs(n_samples=500, centers=4, cluster_std=1.2, random_state=0)
inertias, silhouettes = [], []
for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    inertias.append(km.inertia_); silhouettes.append(silhouette_score(X, km.labels_))
best_k = int(np.argmax(silhouettes)) + 2`, ['best_k', 'inertias', 'silhouettes'], { pkgs: SK }),
        py('k-means руками', md`Реализуйте k-means: начальные центроиды — первые ‹k=3› точки ‹X›, 10 итераций (присвоение по евклидову расстоянию, при равенстве — меньший номер; пересчёт средних). Сохраните итоговые ‹centers› (3×2) и ‹labels›.`,
          md`centers = X[:3].astype(float).copy()
for _ in range(10):
    d = ((X[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2)
    labels = d.argmin(axis=1)
    centers = np.array([X[labels == j].mean(axis=0) for j in range(3)])`, ['centers', 'labels'], { pkgs: ['numpy'], setup: 'import numpy as np\n_r = np.random.default_rng(5)\nX = np.vstack([_r.normal(c, 0.6, size=(30, 2)) for c in [(0, 0), (4, 4), (0, 5)]])\nX = X[_r.permutation(90)]' }),
        py('Сегментация RFM', md`Постройте RFM по доставленным заказам «Корзинки» (recency на 2025-08-01). Прологарифмируйте ‹frequency› и ‹monetary› (‹np.log1p›), стандартизируйте все три признака и разбейте на 4 кластера ‹KMeans(n_clusters=4, n_init=10, random_state=0)›. Сохраните ‹sizes› — отсортированный по убыванию список размеров кластеров и ‹profile› — DataFrame средних **исходных** R, F, M по кластерам, отсортированный по средней ‹monetary› по убыванию (индекс сбросьте).`,
          md`from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
d = orders[orders.status == 'delivered']
rfm = d.groupby('user_id').agg(recency=('order_date', lambda s: (pd.Timestamp('2025-08-01') - s.max()).days), frequency=('order_id', 'count'), monetary=('amount', 'sum'))
Z = rfm.assign(frequency=np.log1p(rfm.frequency), monetary=np.log1p(rfm.monetary))
lab = KMeans(n_clusters=4, n_init=10, random_state=0).fit_predict(StandardScaler().fit_transform(Z))
rfm['cl'] = lab
sizes = sorted(rfm.cl.value_counts().tolist(), reverse=True)
profile = rfm.groupby('cl')[['recency', 'frequency', 'monetary']].mean().sort_values('monetary', ascending=False).reset_index(drop=True)`, ['sizes', 'profile'], { pkgs: ['scikit-learn', 'pandas'], data: ['orders'] }),
        py('DBSCAN', md`На ‹make_moons(n_samples=300, noise=0.07, random_state=0)› кластеризуйте ‹DBSCAN(eps=0.2, min_samples=5)› и ‹KMeans(n_clusters=2, n_init=10, random_state=0)›. Сохраните ‹n_clusters_db› (без шума), ‹n_noise› и ‹ari_db›, ‹ari_km› — adjusted Rand index с истинными метками.`,
          md`from sklearn.datasets import make_moons
from sklearn.cluster import DBSCAN, KMeans
from sklearn.metrics import adjusted_rand_score
X, y = make_moons(n_samples=300, noise=0.07, random_state=0)
db = DBSCAN(eps=0.2, min_samples=5).fit_predict(X)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)
n_clusters_db = len(set(db) - {-1})
n_noise = int((db == -1).sum())
ari_db, ari_km = adjusted_rand_score(y, db), adjusted_rand_score(y, km)`, ['n_clusters_db', 'n_noise', 'ari_db', 'ari_km'], { pkgs: SK }),
        py('PCA', md`Стандартизируйте ‹load_wine› и примените ‹PCA()›. Сохраните ‹evr› — доли объяснённой дисперсии, ‹n95› — минимальное число компонент, объясняющих не меньше 95% дисперсии, и ‹Z2› — проекцию первых 5 объектов на 2 компоненты (обучите отдельный ‹PCA(n_components=2)›; знаки компонент приведите так, чтобы первый объект имел неотрицательные координаты).`,
          md`from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
Xs = StandardScaler().fit_transform(load_wine().data)
evr = PCA().fit(Xs).explained_variance_ratio_
n95 = int(np.searchsorted(np.cumsum(evr), 0.95) + 1)
Z = PCA(n_components=2).fit_transform(Xs)
Z = Z * np.where(Z[0] < 0, -1, 1)
Z2 = Z[:5]`, ['evr', 'n95', 'Z2'], { pkgs: SK }),
        py('Isolation Forest', md`Найдите аномальные чеки среди доставленных заказов: ‹IsolationForest(contamination=0.01, random_state=0)› на признаках ‹amount› и числе позиций заказа (из ‹order_items›). Сохраните ‹n_anom› и ‹mean_amount_anom› — средний чек аномальных заказов.`,
          md`from sklearn.ensemble import IsolationForest
n_items = order_items.groupby('order_id').size().rename('n_items')
d = orders[orders.status == 'delivered'].join(n_items, on='order_id')
lab = IsolationForest(contamination=0.01, random_state=0).fit_predict(d[['amount', 'n_items']])
n_anom = int((lab == -1).sum())
mean_amount_anom = d.loc[lab == -1, 'amount'].mean()`, ['n_anom', 'mean_amount_anom'], { pkgs: ['scikit-learn', 'pandas'], data: ['orders', 'order_items'] }),
        ch('Масштаб в k-means', md`Признаки: возраст (18–70) и годовой доход в рублях (300 000–5 000 000). Что будет, если запустить k-means без стандартизации?`, ['Ничего плохого', 'Кластеры будут определяться почти только доходом', 'Кластеры будут определяться только возрастом', 'k-means не запустится'], 1, md`Расстояние будет почти целиком состоять из разницы доходов.`),
        ...kmGen,
      ],
    },
  ],
});

/* =========================== ВРЕМЕННЫЕ РЯДЫ =========================== */
COURSE.add({
  id: 'mlts', title: 'Временные ряды', short: 'Тренд и сезонность, лаги и скользящие признаки, бейзлайны, валидация во времени, прогноз спроса бустингом, метрики MAPE/SMAPE.',
  lessons: [
    {
      title: 'Прогнозирование временных рядов',
      theory: md`
## Компоненты ряда
Тренд, сезонность (недельная, годовая), праздники, шум. Декомпозиция: ‹statsmodels.tsa.seasonal.seasonal_decompose›.

## Бейзлайны — с них начинают всегда
- **Наивный**: завтра = сегодня.
- **Сезонный наивный**: значение неделю назад.
- **Скользящее среднее** последних N дней.
Сложная модель должна заметно обгонять бейзлайн, иначе она не нужна.

## Модели
| Подход | Примеры |
|---|---|
| Классические | ARIMA/SARIMA, ETS (Holt-Winters), Prophet |
| ML на признаках | бустинг на лагах, скользящих статистиках, календарных признаках |
| Нейросети | N-BEATS, TFT, для больших наборов рядов |

## Признаки для ML-подхода
Лаги (‹shift(1)›, ‹shift(7)›), скользящие средние **сдвинутые на 1** (‹shift(1).rolling(7).mean()›), день недели, месяц, праздник, промо.

> **Главная ловушка — утечка из будущего.** Скользящее среднее без ‹shift(1)› включает сегодняшнее значение, которое мы прогнозируем.

## Валидация
Только по времени: обучение на прошлом, проверка на следующем периоде; лучше — несколько окон (rolling origin, ‹TimeSeriesSplit›).

## Метрики
MAE, RMSE, MAPE (‹mean(|y − ŷ| / |y|)›, плохо при y ≈ 0), SMAPE, WAPE (‹Σ|y − ŷ| / Σ|y|› — стандарт в ритейле).
`,
      tasks: [
        py('Дневной ряд и бейзлайны', md`Постройте ряд ‹s› — выручка доставленных заказов по дням (индекс — даты, пропущенные дни заполните 0 по полному календарю от минимальной до максимальной даты). Для последних 28 дней посчитайте WAPE прогнозов: наивного (вчера) — ‹wape_naive›, сезонного наивного (7 дней назад) — ‹wape_seasonal›, скользящего среднего за 7 предыдущих дней — ‹wape_ma7›.`,
          md`s = orders[orders.status == 'delivered'].groupby('order_date').amount.sum()
s = s.reindex(pd.date_range(s.index.min(), s.index.max(), freq='D'), fill_value=0)
y = s.iloc[-28:]
wape = lambda f: (y - f.iloc[-28:]).abs().sum() / y.abs().sum()
wape_naive = wape(s.shift(1))
wape_seasonal = wape(s.shift(7))
wape_ma7 = wape(s.shift(1).rolling(7).mean())`, ['wape_naive', 'wape_seasonal', 'wape_ma7', 'len(s)'], { data: ['orders'] }),
        py('Признаки без утечки', md`Для ряда ‹s› (уже построен в ‹setup›) соберите DataFrame ‹feat› со столбцами: ‹y› (значение), ‹lag1›, ‹lag7›, ‹ma7› (среднее 7 **предыдущих** дней), ‹dow› (день недели). Удалите строки с пропусками.`,
          md`feat = pd.DataFrame({'y': s, 'lag1': s.shift(1), 'lag7': s.shift(7), 'ma7': s.shift(1).rolling(7).mean(), 'dow': s.index.dayofweek}).dropna()`, ['feat'], {
            data: ['orders'], setup: md`s = orders[orders.status == 'delivered'].groupby('order_date').amount.sum()
s = s.reindex(pd.date_range(s.index.min(), s.index.max(), freq='D'), fill_value=0)` }),
        py('Бустинг на лагах', md`На ‹feat› из прошлой задачи (уже в ‹setup›) обучите ‹GradientBoostingRegressor(random_state=0)› на всех днях, кроме последних 28, и спрогнозируйте последние 28. Признаки — ‹lag1, lag7, ma7, dow›. Сохраните ‹wape_gb›.`,
          md`from sklearn.ensemble import GradientBoostingRegressor
cols = ['lag1', 'lag7', 'ma7', 'dow']
tr, te = feat.iloc[:-28], feat.iloc[-28:]
m = GradientBoostingRegressor(random_state=0).fit(tr[cols], tr.y)
wape_gb = (te.y - m.predict(te[cols])).abs().sum() / te.y.abs().sum()`, ['wape_gb'], {
            pkgs: ['scikit-learn', 'pandas'], data: ['orders'], setup: md`s = orders[orders.status == 'delivered'].groupby('order_date').amount.sum()
s = s.reindex(pd.date_range(s.index.min(), s.index.max(), freq='D'), fill_value=0)
feat = pd.DataFrame({'y': s, 'lag1': s.shift(1), 'lag7': s.shift(7), 'ma7': s.shift(1).rolling(7).mean(), 'dow': s.index.dayofweek}).dropna()` }),
        py('Сезонная декомпозиция', md`Разложите недельный ряд из ‹setup› (‹s›) функцией ‹seasonal_decompose(s, period=7, model='additive')›. Сохраните ‹seasonal7› — значения сезонной компоненты для первых 7 дней (массив) и ‹peak_dow› — день недели (0 — понедельник) с максимальной сезонной компонентой.`,
          md`from statsmodels.tsa.seasonal import seasonal_decompose
dec = seasonal_decompose(s, period=7, model='additive')
seasonal7 = dec.seasonal.iloc[:7].to_numpy()
peak_dow = int(dec.seasonal.groupby(dec.seasonal.index.dayofweek).mean().idxmax())`, ['seasonal7', 'peak_dow'], {
            pkgs: ['statsmodels'], data: ['orders'], setup: md`s = orders[orders.status == 'delivered'].groupby('order_date').amount.sum()
s = s.reindex(pd.date_range(s.index.min(), s.index.max(), freq='D'), fill_value=0)` }),
        py('MAPE и SMAPE', md`Напишите функции ‹mape(y, f)› и ‹smape(y, f)› (‹mean(2|y − f| / (|y| + |f|))›), принимающие списки. Посчитайте их для ‹y›, ‹f› из условия, а также ‹wape›.`,
          md`import numpy as np
def mape(y, f):
    y, f = np.array(y, float), np.array(f, float)
    return float(np.mean(np.abs(y - f) / np.abs(y)))
def smape(y, f):
    y, f = np.array(y, float), np.array(f, float)
    return float(np.mean(2 * np.abs(y - f) / (np.abs(y) + np.abs(f))))
wape = float(np.abs(np.array(y) - np.array(f)).sum() / np.abs(np.array(y)).sum())`, ['mape(y, f)', 'smape(y, f)', 'wape'], { pkgs: ['numpy'], setup: 'y = [120, 80, 5, 200, 150]\nf = [110, 95, 15, 180, 160]' }),
        ch('TimeSeriesSplit', md`Почему для временного ряда нельзя использовать обычный ‹KFold(shuffle=True)›?`, ['Он медленный', 'Модель будет обучаться на будущем и проверяться на прошлом — качество окажется завышенным', 'Он не поддерживает регрессию', 'Можно, разницы нет'], 1, md`Перемешивание даёт модели «подсмотреть» соседние по времени точки.`),
        ch('Скользящее среднее', md`Признак ‹s.rolling(7).mean()› (без ‹shift›) для прогноза ‹s› на сегодня — это…`, ['нормальный признак', 'утечка: окно включает прогнозируемое значение', 'лаг 7', 'сезонность'], 1, md`Нужно ‹s.shift(1).rolling(7).mean()›.`),
      ],
    },
  ],
});

/* =========================== ТЕКСТЫ =========================== */
COURSE.add({
  id: 'mlnlp', title: 'Работа с текстами', short: 'Токенизация, мешок слов, TF-IDF, классификация текстов, косинусная близость, эмбеддинги и трансформеры (теория).',
  lessons: [
    {
      title: 'Классический NLP и эмбеддинги',
      theory: md`
## Предобработка
Нижний регистр, токенизация (‹re.findall(r'\w+', text)›), стоп-слова, лемматизация (pymorphy3 для русского), n-граммы.

## Мешок слов и TF-IDF
Документ → вектор частот слов. TF-IDF понижает вес слов, встречающихся везде:
$$ tfidf(t, d) = tf(t, d) · log(N / df(t))
~~~py
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2)
X = vec.fit_transform(texts)          # разреженная матрица
~~~
TF-IDF + логистическая регрессия — сильный и быстрый бейзлайн для классификации отзывов, тикетов, спама.

## Близость текстов
Косинусная близость TF-IDF-векторов или эмбеддингов: поиск дубликатов, похожих тикетов, FAQ-бот.

## Эмбеддинги и трансформеры
Word2Vec/fastText дают векторы слов. Трансформеры (BERT, ruBERT, sentence-transformers) — контекстные эмбеддинги предложений. Типичный путь: взять предобученную модель, получить эмбеддинги, обучить поверх простую модель, или дообучить (fine-tune) целиком. LLM используют для разметки, извлечения сущностей и генерации, с оценкой качества на отложенной выборке.
`,
      tasks: [
        py('Токенизация и частоты', md`Напишите ‹tokenize(text)› — нижний регистр и ‹re.findall(r'[а-яёa-z0-9]+', ...)›. Для списка отзывов ‹docs› сохраните ‹vocab› — отсортированный список уникальных токенов и ‹df› — словарь токен → число документов, где он встречается.`,
          md`import re
def tokenize(text):
    return re.findall(r'[а-яёa-z0-9]+', text.lower())
toks = [set(tokenize(d)) for d in docs]
vocab = sorted(set().union(*toks))
df = {w: sum(w in t for t in toks) for w in vocab}`, ['vocab', 'df'], { setup: "docs = ['Курьер опоздал, еда холодная', 'Быстрая доставка, курьер вежливый', 'Еда вкусная, доставка быстрая', 'Опоздал на час!']" }),
        py('TF-IDF руками', md`Для тех же ‹docs› посчитайте TF-IDF слова ‹'курьер'› в первом документе по формуле ‹(count / len(doc_tokens)) · ln(N / df)›: ‹tfidf_k›. Затем сравните с ‹TfidfVectorizer(smooth_idf=False, norm=None, token_pattern=r'[а-яёa-z0-9]+')›: в sklearn idf = ‹ln(N/df) + 1›, tf — сырой счёт. Сохраните ‹sk_val› — значение sklearn для этого слова в первом документе.`,
          md`import math, re
from sklearn.feature_extraction.text import TfidfVectorizer
toks = [re.findall(r'[а-яёa-z0-9]+', d.lower()) for d in docs]
N = len(docs); dfk = sum('курьер' in t for t in toks)
tfidf_k = toks[0].count('курьер') / len(toks[0]) * math.log(N / dfk)
vec = TfidfVectorizer(smooth_idf=False, norm=None, token_pattern=r'[а-яёa-z0-9]+')
M = vec.fit_transform(docs)
sk_val = float(M[0, vec.vocabulary_['курьер']])`, ['tfidf_k', 'sk_val'], { pkgs: SK, setup: "docs = ['Курьер опоздал, еда холодная', 'Быстрая доставка, курьер вежливый', 'Еда вкусная, доставка быстрая', 'Опоздал на час!']" }),
        py('Классификатор отзывов', md`На размеченных отзывах ‹texts›, ‹labels› (1 — негатив) обучите ‹make_pipeline(TfidfVectorizer(), LogisticRegression())› на всех данных и предскажите классы для ‹new›. Сохраните ‹pred› (список int) и ‹p_neg› — вероятность негатива для первого нового отзыва.`,
          md`from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
m = make_pipeline(TfidfVectorizer(), LogisticRegression()).fit(texts, labels)
pred = [int(x) for x in m.predict(new)]
p_neg = float(m.predict_proba(new[:1])[0, 1])`, ['pred', 'p_neg'], { pkgs: SK, setup: md`texts = ['курьер опоздал на час', 'холодная еда и грубый курьер', 'всё привезли быстро спасибо', 'отличная доставка вкусно', 'заказ потеряли верните деньги', 'быстро и вежливо', 'опоздал и забыл соус', 'свежие продукты быстрая доставка', 'грубый оператор не помог', 'всё супер приду ещё']
labels = [1, 1, 0, 0, 1, 0, 1, 0, 1, 0]
new = ['курьер грубый и опоздал', 'спасибо всё быстро и вкусно']` }),
        py('Похожие тикеты', md`Для базы тикетов ‹kb› и нового обращения ‹q› найдите самый похожий тикет по косинусной близости TF-IDF (‹TfidfVectorizer()› обучите на ‹kb›). Сохраните ‹best_idx› и ‹best_sim›.`,
          md`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
vec = TfidfVectorizer().fit(kb)
sims = cosine_similarity(vec.transform([q]), vec.transform(kb))[0]
best_idx = int(sims.argmax()); best_sim = float(sims.max())`, ['best_idx', 'best_sim'], { pkgs: SK, setup: "kb = ['не пришёл код подтверждения', 'как вернуть деньги за заказ', 'курьер не может найти адрес', 'изменить адрес доставки', 'промокод не применяется']\nq = 'хочу вернуть деньги, заказ не привезли'" }),
        ch('TF-IDF', md`Слово встречается во **всех** документах корпуса. Чему равен его IDF = ln(N/df)?`, ['1', '0', 'N', 'бесконечность'], 1, md`ln(N/N) = 0 — слово не помогает различать документы.`),
        ch('Эмбеддинги', md`Чем контекстные эмбеддинги (BERT) лучше TF-IDF?`, ['Они быстрее', 'Учитывают смысл и контекст: синонимы близки, одно слово в разных контекстах получает разные векторы', 'Они разреженные', 'Ничем'], 1, md`TF-IDF не знает, что «курьер» и «доставщик» похожи; эмбеддинги — знают.`),
        ...tfidfGen,
      ],
    },
  ],
});

/* =========================== НЕЙРОСЕТИ =========================== */
COURSE.add({
  id: 'mldl', title: 'Нейросети', short: 'Перцептрон, функции активации, прямой и обратный проход на NumPy, обучение MLP, PyTorch: тензоры, модули, цикл обучения, CNN и трансформеры.',
  lessons: [
    {
      title: 'Нейросеть на NumPy',
      theory: md`
## Полносвязный слой
‹h = activation(X @ W + b)›. Сеть — композиция слоёв. Без нелинейностей несколько слоёв эквивалентны одному линейному.

| Активация | Формула | Где |
|---|---|---|
| ReLU | ‹max(0, x)› | скрытые слои |
| sigmoid | ‹1/(1+e⁻ˣ)› | выход бинарной классификации |
| softmax | ‹eᶻⁱ / Σeᶻʲ› | выход многоклассовой |
| tanh | ‹(eˣ−e⁻ˣ)/(eˣ+e⁻ˣ)› | RNN, иногда скрытые слои |

## Обратное распространение
Градиент лосса по весам считается цепным правилом от выхода к входу. Для softmax + кросс-энтропии градиент по логитам простой: ‹(p − y_onehot) / n›.

## Обучение на практике
Батчи, оптимизатор Adam, нормализация (BatchNorm/LayerNorm), dropout, ранняя остановка, аугментации, learning rate schedule.

## PyTorch (теория — в браузере его не запустить)
~~~py
import torch, torch.nn as nn
model = nn.Sequential(nn.Linear(20, 64), nn.ReLU(), nn.Dropout(0.2), nn.Linear(64, 2))
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()
for epoch in range(10):
    model.train()
    for xb, yb in loader:
        opt.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()          # автоматический backprop
        opt.step()
    model.eval()
    with torch.no_grad():
        val_logits = model(X_val)
~~~
Архитектуры: CNN (изображения: свёртки, пулинг), RNN/LSTM (последовательности), трансформеры (attention; тексты, а теперь и картинки, звук, таблицы). Transfer learning: берём предобученную модель и дообучаем на своих данных.
`,
      tasks: [
        py('Функции активации', md`Реализуйте векторные ‹relu(x)›, ‹sigmoid(x)›, ‹softmax(z)› (по последней оси, численно устойчиво: вычтите максимум). Проверка вызовет их на массивах.`,
          md`def relu(x):
    return np.maximum(0, x)
def sigmoid(x):
    return 1 / (1 + np.exp(-x))
def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)`, ['relu(np.array([-2.0, 0.0, 3.5]))', 'sigmoid(np.array([0.0, 2.0, -1.0]))', 'softmax(np.array([[1.0, 2.0, 3.0], [1000.0, 1000.0, 1000.0]]))'], { pkgs: ['numpy'] }),
        py('Прямой проход', md`Двухслойная сеть: ‹h = relu(X @ W1 + b1)›, ‹p = softmax(h @ W2 + b2)›. Веса заданы в ‹setup›. Сохраните ‹p› для ‹X› и ‹loss› — среднюю кросс-энтропию для меток ‹y›.`,
          md`h = np.maximum(0, X @ W1 + b1)
z = h @ W2 + b2
z = z - z.max(axis=1, keepdims=True)
p = np.exp(z) / np.exp(z).sum(axis=1, keepdims=True)
loss = float(-np.mean(np.log(p[np.arange(len(y)), y])))`, ['p', 'loss'], { pkgs: ['numpy'], setup: 'import numpy as np\n_r = np.random.default_rng(0)\nX = _r.normal(size=(6, 4)); y = np.array([0, 1, 2, 1, 0, 2])\nW1 = _r.normal(0, 0.5, (4, 5)); b1 = np.zeros(5)\nW2 = _r.normal(0, 0.5, (5, 3)); b2 = np.zeros(3)' }),
        py('Обучение MLP с нуля', md`Обучите сеть из прошлой задачи на ‹load_iris› (стандартизируйте признаки ‹(X − mean)/std›): скрытый слой 16 нейронов, веса — ‹rng = np.random.default_rng(0)›, ‹W1 = rng.normal(0, 0.5, (4, 16))›, ‹W2 = rng.normal(0, 0.5, (16, 3))›, нулевые смещения; полный батч, 300 шагов, ‹lr = 0.1›, backprop вручную. Сохраните ‹acc› — accuracy на обучении и ‹final_loss›.`,
          md`from sklearn.datasets import load_iris
X, y = load_iris(return_X_y=True)
X = (X - X.mean(0)) / X.std(0)
rng = np.random.default_rng(0)
W1 = rng.normal(0, 0.5, (4, 16)); b1 = np.zeros(16)
W2 = rng.normal(0, 0.5, (16, 3)); b2 = np.zeros(3)
Y = np.eye(3)[y]; n = len(y)
for _ in range(300):
    a1 = X @ W1 + b1; h = np.maximum(0, a1)
    z = h @ W2 + b2; z = z - z.max(1, keepdims=True)
    p = np.exp(z) / np.exp(z).sum(1, keepdims=True)
    dz = (p - Y) / n
    dW2 = h.T @ dz; db2 = dz.sum(0)
    dh = dz @ W2.T; da1 = dh * (a1 > 0)
    dW1 = X.T @ da1; db1 = da1.sum(0)
    W1 -= 0.1 * dW1; b1 -= 0.1 * db1; W2 -= 0.1 * dW2; b2 -= 0.1 * db2
h = np.maximum(0, X @ W1 + b1); z = h @ W2 + b2; z = z - z.max(1, keepdims=True)
p = np.exp(z) / np.exp(z).sum(1, keepdims=True)
acc = float((p.argmax(1) == y).mean())
final_loss = float(-np.mean(np.log(p[np.arange(n), y])))`, ['acc', 'final_loss'], { pkgs: SK }),
        py('MLPClassifier', md`На ‹load_digits› (сплит ‹test_size=0.25, random_state=0, stratify=y›, признаки поделите на 16) обучите ‹MLPClassifier(hidden_layer_sizes=(64,), max_iter=300, random_state=0)›. Сохраните ‹acc› на тесте и ‹n_params› — общее число весов и смещений сети (по ‹coefs_› и ‹intercepts_›).`,
          md`from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
X, y = load_digits(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X / 16, y, test_size=0.25, random_state=0, stratify=y)
m = MLPClassifier(hidden_layer_sizes=(64,), max_iter=300, random_state=0).fit(Xa, ya)
acc = m.score(Xb, yb)
n_params = int(sum(w.size for w in m.coefs_) + sum(b.size for b in m.intercepts_))`, ['acc', 'n_params'], { pkgs: SK }),
        num('Число параметров', md`Полносвязная сеть: вход 784, скрытые слои 128 и 64, выход 10 (со смещениями). Сколько обучаемых параметров?`, 784 * 128 + 128 + 128 * 64 + 64 + 64 * 10 + 10, 0, md`784·128+128 + 128·64+64 + 64·10+10 = 109 386`),
        ch('Dropout', md`Как dropout ведёт себя на инференсе (‹model.eval()›)?`, ['Отключает случайные нейроны, как при обучении', 'Отключён: используются все нейроны (с соответствующим масштабированием при обучении)', 'Удваивает веса', 'Удаляет слой'], 1, md`Поэтому важно переключать ‹model.train()› / ‹model.eval()›.`),
        ch('zero_grad', md`Зачем в цикле PyTorch вызывают ‹optimizer.zero_grad()›?`, ['Чтобы обнулить веса', 'Градиенты накапливаются между вызовами ‹backward()›, их нужно обнулять перед новым шагом', 'Чтобы ускорить обучение', 'Это необязательно'], 1, md`По умолчанию ‹.grad› суммируется.`),
        ch('Табличные данные', md`Для табличных данных о клиентах (50 признаков, 100 тыс. строк) какая модель обычно даёт лучшее качество с наименьшими усилиями?`, ['Глубокая полносвязная сеть', 'Градиентный бустинг', 'kNN', 'Трансформер с нуля'], 1, md`На таблицах бустинг остаётся стандартом.`),
        ...softGen,
      ],
    },
  ],
});

/* =========================== MLOPS =========================== */
COURSE.add({
  id: 'mlops', title: 'MLOps и продакшн', short: 'Воспроизводимость, git и окружения, сериализация моделей, MLflow, Docker, сервис на FastAPI, Airflow, мониторинг и дрейф данных.',
  lessons: [
    {
      title: 'От ноутбука к продакшну',
      theory: md`
## Воспроизводимость
- Код в git, ноутбуки — для исследований, пайплайны — в модулях ‹.py›.
- Фиксированные версии библиотек (‹requirements.txt›, poetry, uv), фиксированные ‹random_state›.
- Версионирование данных (DVC) и экспериментов (MLflow: параметры, метрики, артефакты).

## Сохранение модели
~~~py
import joblib
joblib.dump(pipeline, 'model.joblib')        # сохраняйте весь Pipeline с препроцессингом
model = joblib.load('model.joblib')
~~~
Для обмена между фреймворками — ONNX. CatBoost/LightGBM имеют свои форматы.

## Сервис предсказаний
~~~py
from fastapi import FastAPI
from pydantic import BaseModel
app = FastAPI()
class Client(BaseModel):
    recency: int
    frequency: int
    monetary: float
@app.post('/predict')
def predict(c: Client):
    return {'churn_proba': float(model.predict_proba([[c.recency, c.frequency, c.monetary]])[0, 1])}
~~~
Docker упаковывает сервис с окружением; Kubernetes разворачивает и масштабирует.

## Батч-скоринг и оркестрация
Airflow (DAG из задач: выгрузить признаки → скорить → записать в таблицу), расписание, ретраи, алерты.

## Мониторинг
- технические метрики: латентность, ошибки;
- **дрейф данных**: распределения признаков в проде отличаются от обучения (PSI, KS-тест);
- **дрейф концепции**: связь признаков с целевой меняется;
- качество модели по мере появления реальных меток;
- A/B-тест новой модели против старой — финальная проверка бизнес-эффекта.

## PSI (Population Stability Index)
$$ PSI = Σ (actualᵢ − expectedᵢ) · ln(actualᵢ / expectedᵢ)
по бинам распределения. < 0.1 — стабильно, 0.1–0.25 — заметный сдвиг, > 0.25 — сильный.
`,
      tasks: [
        py('Сохранение и загрузка', md`Обучите ‹make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))› на ‹load_breast_cancer›, сохраните его через ‹joblib.dump› в ‹model.joblib›, загрузите в ‹loaded› и сохраните ‹identical› — совпадают ли предсказания вероятностей исходной и загруженной модели на всех данных (‹np.allclose›).`,
          md`import joblib
from sklearn.datasets import load_breast_cancer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
X, y = load_breast_cancer(return_X_y=True)
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X, y)
joblib.dump(pipe, 'model.joblib')
loaded = joblib.load('model.joblib')
identical = bool(np.allclose(pipe.predict_proba(X), loaded.predict_proba(X)))`, ['identical', "type(loaded).__name__"], { pkgs: SK }),
        py('PSI', md`Напишите ‹psi(expected, actual, bins=10)›: границы бинов — квантили ‹expected› (‹np.quantile(expected, np.linspace(0, 1, bins + 1))›, крайние заменить на ‹−inf› и ‹+inf›), доли считаются ‹np.histogram› и ограничиваются снизу ‹1e-6›. Посчитайте ‹psi_same› для ‹base› и ‹same_dist›, и ‹psi_shift› для ‹base› и ‹shifted›.`,
          md`def psi(expected, actual, bins=10):
    edges = np.quantile(expected, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))
psi_same = psi(base, same_dist)
psi_shift = psi(base, shifted)`, ['psi_same', 'psi_shift'], { pkgs: ['numpy'], setup: 'import numpy as np\n_r = np.random.default_rng(0)\nbase = _r.normal(0, 1, 5000)\nsame_dist = _r.normal(0, 1, 5000)\nshifted = _r.normal(0.5, 1.2, 5000)' }),
        py('KS-тест на дрейф', md`Сравните распределения ‹base› и ‹shifted› из прошлой задачи тестом Колмогорова–Смирнова (‹scipy.stats.ks_2samp›). Сохраните ‹ks_stat›, ‹ks_p› и ‹drift› (‹True›, если p < 0.01).`,
          md`from scipy import stats
r = stats.ks_2samp(base, shifted)
ks_stat, ks_p = r.statistic, r.pvalue
drift = bool(ks_p < 0.01)`, ['ks_stat', 'ks_p', 'drift'], { pkgs: ['scipy'], setup: 'import numpy as np\n_r = np.random.default_rng(0)\nbase = _r.normal(0, 1, 5000)\nsame_dist = _r.normal(0, 1, 5000)\nshifted = _r.normal(0.5, 1.2, 5000)' }),
        mu('Что сохранять', md`Что нужно сохранить, чтобы через полгода воспроизвести модель? Отметьте все.`, ['Код обучения в git с конкретным коммитом', 'Версии библиотек', 'Снимок или версию обучающих данных', 'Параметры и random_state', 'Скриншот графика обучения'], [0, 1, 2, 3], md`Скриншот не помогает воспроизвести результат.`),
        ch('Дрейф', md`Модель кредитного скоринга обучена до кризиса. После кризиса доля дефолтов при тех же значениях признаков выросла. Это…`, ['дрейф данных (covariate shift)', 'дрейф концепции (concept drift)', 'переобучение', 'утечка'], 1, md`Изменилась связь признаков с целевой переменной.`),
        ch('Pipeline в проде', md`Почему в прод лучше отправлять весь ‹Pipeline›, а не только обученную модель?`, ['Он меньше весит', 'Препроцессинг (импутация, масштаб, кодирование) гарантированно будет тем же, что при обучении', 'Так быстрее инференс', 'Так требует Docker'], 1, md`Расхождение препроцессинга между обучением и продом (training-serving skew) — частая причина деградации.`),
      ],
    },
  ],
});

/* =========================== СОБЕСЕДОВАНИЕ ML =========================== */
COURSE.add({
  id: 'mljob', title: 'Собеседование ML и портфолио', short: 'Частые теоретические вопросы, ML system design, задачи на кодинг, план портфолио.',
  lessons: [
    {
      title: 'Вопросы и ML system design',
      theory: md`
## Теория, которую спрашивают почти всегда
- Bias–variance trade-off, переобучение и способы борьбы.
- Как работает градиентный бустинг; чем отличается от случайного леса.
- Регуляризация L1/L2, почему L1 зануляет веса.
- Метрики: ROC-AUC vs PR-AUC, когда accuracy вредна, log-loss, калибровка.
- Валидация: утечки, временные данные, группы.
- Логистическая регрессия: функция потерь, вывод градиента.
- Дисбаланс классов.
- Для DL: backprop, функции активации, batch norm, dropout, attention.

## ML system design — структура ответа
1. **Бизнес-цель и метрика**: что оптимизируем в деньгах, как измерим (онлайн A/B).
2. **Постановка ML-задачи**: таргет, объект, горизонт прогноза, офлайн-метрика.
3. **Данные**: источники, разметка, утечки, объём, частота обновления.
4. **Признаки**.
5. **Бейзлайн** (правило или простая модель) → основная модель.
6. **Валидация** офлайн.
7. **Инференс**: онлайн или батч, латентность, нагрузка.
8. **Мониторинг**, переобучение, A/B-тест.

Пример: «Предсказать, какие клиенты уйдут, чтобы дать им скидку». Таргет — нет покупок 30 дней после даты среза; признаки — RFM, поведение в приложении, обращения в поддержку; модель — бустинг; метрика — uplift-эффект скидки в A/B, а не только AUC (часть клиентов купили бы и без скидки → uplift-моделирование).

## Портфолио
1. Табличная задача от сырых данных до сервиса: признаки, бустинг, валидация, FastAPI + Docker.
2. NLP или CV с предобученной моделью и честной оценкой.
3. Kaggle-соревнование с описанием решения.
`,
      tasks: [
        ch('Bias–variance', md`Ошибка на обучении 2%, на валидации 25%. Что поможет скорее всего?`, ['Усложнить модель', 'Регуляризация, больше данных, упрощение модели', 'Убрать валидацию', 'Добавить признаков-шумов'], 1, md`Это высокая дисперсия (переобучение).`),
        ch('Уходящие клиенты', md`Модель оттока с AUC 0.85 отобрала клиентов для скидки. Почему этого недостаточно, чтобы сказать, что скидка окупится?`, ['AUC слишком низкий', 'Модель предсказывает уход, но не эффект скидки: нужен A/B-тест или uplift-модель', 'Нужно использовать accuracy', 'Всё в порядке'], 1, md`Важно, кого скидка **удержит**, а не кто уйдёт. Часть уйдёт всё равно, часть купила бы и без скидки.`),
        ch('Градиент log-loss', md`Для логистической регрессии ‹p = σ(Xw)› чему равен градиент средней log-loss по ‹w›?`, ['‹Xᵀ(p − y)/n›', '‹Xᵀ(y − p)²/n›', '‹(p − y)/n›', '‹Xᵀp›'], 0, md`Красивый результат: такой же вид, как у MSE для линейной регрессии.`),
        ch('PR-AUC', md`Положительных объектов 0.1%. Две модели: ROC-AUC 0.97 и 0.96, PR-AUC 0.20 и 0.35. Какую выбрать для поиска редких событий?`, ['Первую', 'Вторую', 'Любую', 'Ни одну'], 1, md`При экстремальном дисбалансе PR-AUC лучше отражает качество на редком классе.`),
        ch('Признак-утечка', md`В модели оттока самый важный признак — «дата отправки письма об удержании». Что это значит?`, ['Отличный признак', 'Скорее всего утечка: письмо отправляют уже тем, кто признан уходящим, это следствие таргета', 'Нужно больше деревьев', 'Признак нужно стандартизировать'], 1, md`Признак, который появляется из-за целевого события или процесса вокруг него, недоступен в момент прогноза.`),
        pyt('Кодинг: train_test_split руками', md`Напишите функцию ‹split(n, test_size, seed)›, возвращающую кортеж ‹(train_idx, test_idx)› — списки индексов от 0 до n−1, перемешанные ‹np.random.default_rng(seed).permutation(n)›, где тест — первые ‹round(n·test_size)› индексов перестановки. Оба списка должны быть отсортированы.`,
          md`def split(n, test_size, seed):
    p = np.random.default_rng(seed).permutation(n)
    k = round(n * test_size)
    return sorted(p[k:].tolist()), sorted(p[:k].tolist())`,
          md`import numpy as np
tr, te = split(10, 0.3, 0)
assert len(te) == 3 and len(tr) == 7, 'Размеры частей неверны'
assert sorted(tr + te) == list(range(10)), 'Индексы должны покрывать 0..n-1 без повторов'
p = np.random.default_rng(0).permutation(10)
assert te == sorted(p[:3].tolist()), 'Тест — первые round(n·test_size) элементов перестановки'
assert tr == sorted(tr) and te == sorted(te), 'Отсортируйте списки'`, { pkgs: ['numpy'] }),
        py('Кодинг: confusion matrix руками', md`Напишите ‹confusion(y_true, y_pred, labels)›, возвращающую список списков: строка — истинный класс, столбец — предсказанный, в порядке ‹labels›.`,
          md`def confusion(y_true, y_pred, labels):
    idx = {l: i for i, l in enumerate(labels)}
    m = [[0] * len(labels) for _ in labels]
    for t, p in zip(y_true, y_pred):
        m[idx[t]][idx[p]] += 1
    return m`, ["confusion(['a', 'b', 'a', 'c'], ['a', 'a', 'a', 'c'], ['a', 'b', 'c'])", 'confusion([1, 0, 1, 1], [1, 1, 0, 1], [0, 1])']),
      ],
    },
  ],
});
})();
