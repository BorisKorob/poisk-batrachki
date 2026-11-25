/* =========================== МОДУЛЬ 10. ВИЗУАЛИЗАЦИЯ И BI =========================== */
COURSE.add({
  id: 'viz', title: 'Визуализация, BI и Excel', short: 'Выбор графика, принципы, matplotlib/seaborn, дашборды, DataLens/Tableau/Power BI, Excel.',
  lessons: [
    {
      title: 'Как выбрать и построить график',
      theory: md`
График нужен, чтобы читатель за 5 секунд понял один вывод. Начинайте с вопроса «что я хочу показать?», а не с типа диаграммы.

## Выбор графика
| Задача | График |
|---|---|
| динамика во времени | линейный (line) |
| сравнение категорий | столбчатый (bar), горизонтальный — если подписи длинные |
| часть целого | столбик со стеком или просто доли в таблице; круговая — только для 2–3 частей |
| распределение | гистограмма, boxplot, violin, ECDF |
| связь двух величин | диаграмма рассеяния (scatter) |
| матрица «когорта × период» | тепловая карта (heatmap) |
| воронка | горизонтальные столбики по шагам |
| один KPI | крупное число + сравнение с прошлым периодом + спарклайн |

## Принципы
- Столбчатые графики **всегда** начинаются с нуля, иначе разница визуально раздувается.
- Один график — одна мысль. Заголовок формулирует вывод: «Retention новых когорт растёт», а не «Retention по когортам».
- Убирайте лишнее: рамки, 3D, тени, сетку, легенду (если можно подписать линии напрямую).
- Цвет — для смысла: выделите главную серию, остальное серым.
- Сортируйте категории по значению, если у них нет естественного порядка.
- Подписывайте единицы измерения и период.

## matplotlib и seaborn — минимум
~~~py
import matplotlib.pyplot as plt
import seaborn as sns

daily = orders.groupby('order_date')['amount'].sum()
fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(daily.index, daily.values, label='выручка')
ax.plot(daily.rolling(7).mean(), label='скользящее среднее 7 дн.')
ax.set_title('Выручка растёт с марта'); ax.set_ylabel('₽'); ax.legend()
plt.show()

sns.histplot(orders['amount'], bins=50, log_scale=True)
sns.boxplot(data=df, x='channel', y='revenue')
sns.heatmap(retention, annot=True, fmt='.0%', cmap='Greens')
df.plot(kind='bar')          # быстрый график прямо из pandas
~~~
Для интерактивных графиков — plotly (‹plotly.express›).

## Дашборды и BI
Самые частые в вакансиях: **Yandex DataLens**, **Apache Superset**, **Tableau**, **Power BI**, Metabase, Redash. Принципы одни:
1. Сверху — 3–5 ключевых KPI с динамикой к прошлому периоду.
2. Ниже — графики, объясняющие KPI (декомпозиция), затем детальные таблицы.
3. Фильтры: период, платформа, город.
4. Одинаковые определения метрик во всех отчётах (лучше — в витрине данных, а не в формулах дашборда).
5. У каждого дашборда есть владелец, описание метрик и дата обновления.

## Excel и Google Sheets
Всё ещё нужны почти везде. Минимум: сводные таблицы, ‹ВПР/XLOOKUP› (‹ПРОСМОТРX›), ‹СУММЕСЛИМН›, ‹СЧЁТЕСЛИМН›, условное форматирование, фильтры, простые графики. В Google Sheets полезна функция ‹QUERY› — почти SQL прямо в таблице.
`,
      tasks: [
        {
          type: 'choice', title: 'Динамика DAU',
          text: md`Нужно показать, как менялся DAU за последние 90 дней. Какой график подходит лучше всего?`,
          options: ['Круговая диаграмма', 'Линейный график', 'Гистограмма распределения', 'Диаграмма рассеяния'],
          answer: [1],
          explain: md`Динамика во времени — линейный график. Можно добавить скользящее среднее за 7 дней, чтобы убрать недельную сезонность.`,
        },
        {
          type: 'choice', title: 'Распределение чеков',
          text: md`Нужно сравнить распределение сумм заказов в четырёх городах. Что выбрать?`,
          options: ['Четыре круговые диаграммы', 'Boxplot (или violin) по городам', 'Линейный график', 'Один столбик со средним по каждому городу'],
          answer: [1],
          explain: md`Boxplot показывает медиану, квартили и выбросы сразу для всех групп. Столбик со средним скрывает форму распределения.`,
        },
        {
          type: 'choice', title: 'Обманчивая ось',
          text: md`На столбчатой диаграмме конверсия A = 10.2%, B = 10.6%, ось Y начинается с 10%. Столбик B выглядит втрое выше. В чём проблема?`,
          options: [
            'Проблемы нет',
            'Обрезанная ось преувеличивает различие; у столбчатой диаграммы ось должна начинаться с нуля',
            'Нужно было использовать круговую диаграмму',
            'Нужно добавить 3D-эффект',
          ],
          answer: [1],
          explain: md`Длина столбика кодирует значение, поэтому ось обязана начинаться с нуля. Если важна маленькая разница, покажите её отдельно (разница с ДИ) или используйте точечный график.`,
        },
        {
          type: 'multi', title: 'Хороший дашборд',
          text: md`Что из перечисленного относится к хорошим практикам дашборда? Отметьте все подходящие.`,
          options: [
            'Ключевые KPI сверху со сравнением с прошлым периодом',
            'Как можно больше графиков на одном экране',
            'Описание метрик и дата обновления данных',
            'Фильтры по периоду и ключевым срезам',
            'Разные определения одной метрики на разных вкладках',
          ],
          answer: [0, 2, 3],
          explain: md`Перегруженный экран и расходящиеся определения метрик — главные причины, почему дашбордам перестают доверять.`,
        },
      ],
    },
  ],
});

/* =========================== МОДУЛЬ 11. ML =========================== */
COURSE.add({
  id: 'ml', title: 'Машинное обучение для аналитика', short: 'Обучение с учителем, train/test, переобучение, регрессия, классификация, метрики качества.',
  lessons: [
    {
      title: 'Основы: задачи, валидация, переобучение',
      theory: md`
От аналитика обычно ждут не построения нейросетей, а понимания базовых моделей: прогноз спроса, скоринг оттока, сегментация, оценка вклада факторов. И умения отличить хорошую модель от переобученной.

## Типы задач
| Тип | Что предсказываем | Пример | Модели |
|---|---|---|---|
| Регрессия | число | выручка пользователя через месяц | линейная регрессия, градиентный бустинг |
| Классификация | класс / вероятность | уйдёт ли клиент | логистическая регрессия, деревья, бустинг |
| Кластеризация | группы без разметки | сегменты клиентов | k-means, DBSCAN |
| Временные ряды | будущие значения ряда | заказы на неделю вперёд | сезонные модели, Prophet, бустинг на лагах |

## Обучение и проверка
Модель всегда оценивают на данных, **которых она не видела**:
~~~py
from sklearn.model_selection import train_test_split, cross_val_score
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
model.fit(X_train, y_train)
model.score(X_test, y_test)
cross_val_score(model, X, y, cv=5, scoring='roc_auc')   # кросс-валидация по 5 фолдам
~~~
Для временных данных случайное разбиение недопустимо: обучаемся на прошлом, проверяемся на будущем (‹TimeSeriesSplit›).

## Переобучение и недообучение
- **Переобучение**: отличное качество на train, плохое на test. Модель запомнила шум. Лечится упрощением модели, регуляризацией, большим объёмом данных.
- **Недообучение**: плохо и там и там. Модель слишком простая или признаки неинформативны.

## Утечка данных (data leakage)
Признак содержит информацию из будущего или из самого ответа. Пример: предсказываем отток по признаку «дата последнего входа», который считали уже после даты прогноза. Модель покажет нереально высокое качество и бесполезна в бою. Самая частая и коварная ошибка.

## Подготовка признаков
- Категориальные → one-hot (‹pd.get_dummies›, ‹OneHotEncoder›).
- Масштабирование для линейных моделей и kNN (‹StandardScaler›). Деревьям не нужно.
- Пропуски, логарифм для скошенных величин, признаки из дат.
- Всё это обучают **только на train** — удобнее в ‹Pipeline›.
`,
      tasks: [
        {
          type: 'choice', title: 'Диагноз',
          text: md`Модель оттока: ROC-AUC на обучении 0.99, на тесте 0.64. Что происходит?`,
          options: ['Недообучение', 'Переобучение', 'Всё хорошо, модель отличная', 'Нужно смотреть только на обучающую выборку'],
          answer: [1],
          explain: md`Большой разрыв между train и test — классический признак переобучения. Уменьшите сложность (глубина деревьев), добавьте регуляризацию, проверьте признаки на утечку.`,
        },
        {
          type: 'choice', title: 'Утечка',
          text: md`Предсказываем, сделает ли пользователь заказ в следующем месяце. Какой признак содержит утечку?`,
          options: [
            'Число заказов за прошлые 3 месяца',
            'Город пользователя',
            'Сумма заказов пользователя за следующий месяц',
            'Число дней с регистрации',
          ],
          answer: [2],
          explain: md`Сумма заказов за следующий месяц напрямую содержит ответ и в момент прогноза неизвестна.`,
        },
        {
          type: 'choice', title: 'Валидация временного ряда',
          text: md`Прогнозируем ежедневные заказы. Как правильно проверить качество модели?`,
          options: [
            'Случайно перемешать дни и разбить 75/25',
            'Обучить на ранних датах, проверить на более поздних',
            'Проверить на тех же данных, на которых обучали',
            'Кросс-валидация с перемешиванием',
          ],
          answer: [1],
          explain: md`В бою модель всегда предсказывает будущее по прошлому. Перемешивание даёт модели «подсмотреть» соседние дни и завышает качество.`,
        },
      ],
    },
    {
      title: 'Регрессия, классификация и метрики',
      theory: md`
## Линейная регрессия
$$ ŷ = w₀ + w₁x₁ + … + wₖxₖ
Веса подбираются методом наименьших квадратов. Коэффициент ‹wᵢ› — на сколько в среднем меняется y при росте xᵢ на 1 при прочих равных. Интерпретируемость — главное достоинство для аналитика.
~~~py
from sklearn.linear_model import LinearRegression
m = LinearRegression().fit(X_train, y_train)
m.coef_, m.intercept_
pred = m.predict(X_test)
~~~
Метрики регрессии:
| Метрика | Смысл |
|---|---|
| MAE | средняя абсолютная ошибка, в единицах y |
| RMSE | корень из средней квадратичной ошибки, сильнее штрафует крупные промахи |
| MAPE | средняя относительная ошибка, плохо работает при y около 0 |
| R² | доля объяснённой дисперсии: 1 — идеально, 0 — не лучше среднего |

## Логистическая регрессия
Классификатор, выдающий вероятность: ‹p = 1 / (1 + e^(−(w₀ + Σwᵢxᵢ)))›. Порог (обычно 0.5, но его выбирают под бизнес-задачу) превращает вероятность в класс.

## Деревья и ансамбли
Решающее дерево задаёт вопросы «x > порога?». Случайный лес усредняет много деревьев, градиентный бустинг (CatBoost, LightGBM, XGBoost) строит их последовательно, исправляя ошибки. На табличных данных бустинг — стандарт.

## Метрики классификации
Матрица ошибок:
| | предсказали 1 | предсказали 0 |
|---|---|---|
| на самом деле 1 | TP | FN |
| на самом деле 0 | FP | TN |

$$ accuracy  = (TP + TN) / всего
$$ precision = TP / (TP + FP)     — какая доля «пойманных» действительно положительные
$$ recall    = TP / (TP + FN)     — какую долю положительных поймали
$$ F1        = 2 · precision · recall / (precision + recall)

- **Accuracy обманчива при дисбалансе**: если мошенников 1%, модель «все честные» даёт 99%.
- **ROC-AUC** — вероятность, что случайный положительный объект получит оценку выше случайного отрицательного. Не зависит от порога; 0.5 — случайное угадывание.
- **PR-AUC** — лучше при сильном дисбалансе.

Выбор: если ложная тревога дорогая (блокируем клиента) — важнее precision; если пропуск дорогой (не заметили фрод) — recall.
`,
      tasks: [
        {
          type: 'py', title: 'Метрики вручную',
          text: md`По спискам ‹y_true› и ‹y_pred› посчитайте без sklearn: ‹tp›, ‹fp›, ‹fn›, ‹tn›, ‹accuracy›, ‹precision›, ‹recall›, ‹f1›.`,
          starter: md`y_true = [1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0]
`,
          solution: md`y_true = [1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0]
pairs = list(zip(y_true, y_pred))
tp = sum(t == 1 and p == 1 for t, p in pairs)
fp = sum(t == 0 and p == 1 for t, p in pairs)
fn = sum(t == 1 and p == 0 for t, p in pairs)
tn = sum(t == 0 and p == 0 for t, p in pairs)
accuracy = (tp + tn) / len(pairs)
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print(tp, fp, fn, tn, accuracy, precision, recall, f1)`,
          test: md`assert (tp, fp, fn, tn) == (3, 2, 2, 5), f'Матрица ошибок неверна: tp={tp}, fp={fp}, fn={fn}, tn={tn}'
near(accuracy, 8 / 12, 1e-9, 'accuracy'); near(precision, 0.6, 1e-9, 'precision')
near(recall, 0.6, 1e-9, 'recall'); near(f1, 0.6, 1e-9, 'f1')`,
        },
        {
          type: 'py', pkgs: ['scikit-learn', 'pandas'], title: 'Линейная регрессия',
          text: md`В ‹df› — данные по рекламным кампаниям: бюджет на ТВ, онлайн-рекламу и продажи. Разбейте данные ‹train_test_split(X, y, test_size=0.25, random_state=0)›, обучите ‹LinearRegression›, сохраните модель в ‹model›, коэффициенты при ‹tv› и ‹online› в ‹coef_tv› и ‹coef_online›, R² на тесте в ‹r2› и MAE на тесте в ‹mae›.`,
          setup: md`import numpy as np, pandas as pd
_r = np.random.default_rng(3)
df = pd.DataFrame({'tv': _r.uniform(0, 100, 400), 'online': _r.uniform(0, 50, 400)})
df['sales'] = 20 + 0.8 * df['tv'] + 1.5 * df['online'] + _r.normal(0, 8, 400)`,
          starter: md`from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
X = df[['tv', 'online']]
y = df['sales']
`,
          solution: md`from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
X = df[['tv', 'online']]
y = df['sales']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
model = LinearRegression().fit(X_train, y_train)
coef_tv, coef_online = model.coef_
pred = model.predict(X_test)
r2 = r2_score(y_test, pred)
mae = mean_absolute_error(y_test, pred)
print(coef_tv, coef_online, r2, mae)`,
          test: md`from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
Xa, Xb, ya, yb = train_test_split(df[['tv', 'online']], df['sales'], test_size=0.25, random_state=0)
m = LinearRegression().fit(Xa, ya); p = m.predict(Xb)
near(coef_tv, m.coef_[0], 1e-6, 'coef_tv'); near(coef_online, m.coef_[1], 1e-6, 'coef_online')
near(r2, r2_score(yb, p), 1e-6, 'r2'); near(mae, mean_absolute_error(yb, p), 1e-6, 'mae')`,
        },
        {
          type: 'py', pkgs: ['scikit-learn'], title: 'Модель оттока',
          text: md`В ‹X›, ‹y› — синтетические данные о клиентах (1 — ушёл). Разбейте их с ‹test_size=0.3, random_state=42, stratify=y›, обучите ‹LogisticRegression(max_iter=1000)› и сохраните в ‹auc› ROC-AUC на тесте (по вероятностям ‹predict_proba›), в ‹recall_05› — recall на тесте при пороге 0.5, в ‹recall_03› — при пороге 0.3.`,
          setup: md`from sklearn.datasets import make_classification
X, y = make_classification(n_samples=2000, n_features=8, n_informative=5, weights=[0.8, 0.2], random_state=1)`,
          starter: md`from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, recall_score
`,
          solution: md`from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, recall_score
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
proba = clf.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, proba)
recall_05 = recall_score(y_test, proba >= 0.5)
recall_03 = recall_score(y_test, proba >= 0.3)
print(auc, recall_05, recall_03)`,
          test: md`from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, recall_score
a, b, c, d = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
p = LogisticRegression(max_iter=1000).fit(a, c).predict_proba(b)[:, 1]
near(auc, roc_auc_score(d, p), 1e-4, 'auc')
near(recall_05, recall_score(d, p >= 0.5), 1e-6, 'recall_05')
near(recall_03, recall_score(d, p >= 0.3), 1e-6, 'recall_03')
assert recall_03 >= recall_05, 'При снижении порога recall не может уменьшиться'`,
          hint: md`‹predict_proba(X_test)[:, 1]› — вероятность класса 1. Класс при пороге t: ‹proba >= t›.`,
        },
        {
          type: 'choice', title: 'Метрика для фрода',
          text: md`Мошеннических транзакций 0.3%. Модель «всё честное» даёт accuracy 99.7%. Какую метрику разумнее использовать для сравнения моделей?`,
          options: ['Accuracy', 'PR-AUC или recall при фиксированном precision', 'R²', 'MAE'],
          answer: [1],
          explain: md`При сильном дисбалансе accuracy бесполезна. Нужны метрики, фокусирующиеся на редком классе: PR-AUC, recall при приемлемом уровне precision (или наоборот).`,
        },
      ],
    },
  ],
});

/* =========================== МОДУЛЬ 12. СОБЕСЕДОВАНИЕ И ПОРТФОЛИО =========================== */
COURSE.add({
  id: 'job', title: 'Собеседование и портфолио', short: 'Смешанные задачи в формате собеседований, план портфолио, резюме и стек инструментов.',
  lessons: [
    {
      title: 'Задачи в формате собеседования',
      theory: md`
## Как обычно устроен отбор
1. **Скрининг с HR** — мотивация, ожидания, опыт.
2. **Техническое интервью**: живой SQL (почти всегда), вопросы по статистике и A/B, иногда Python/pandas.
3. **Продуктовый кейс**: «метрика упала», «как оценить новую фичу», «какие метрики у сервиса X».
4. **Тестовое задание** (не везде): датасет + вопросы, на 1–3 дня. Оформляйте как отчёт: выводы сверху, код ниже.
5. **Финал с руководителем**.

## Как решать SQL вживую
- Проговаривайте зерно результата и шаги.
- Пишите через CTE, давайте понятные алиасы.
- Уточняйте крайние случаи: дубликаты, NULL, одинаковые значения при ранжировании, пустые дни.
- Проверьте результат на здравый смысл.

## Частые вопросы (проверьте себя)
- Чем отличаются WHERE и HAVING? ROW_NUMBER, RANK и DENSE_RANK? UNION и UNION ALL?
- Что такое p-value, ошибки I и II рода, мощность? Как посчитать размер выборки?
- Что делать, если в A/B-тесте SRM? Почему нельзя подглядывать?
- Как посчитать retention? Чем отличается classic и rolling?
- Что такое CUPED? Когда использовать бутстрап?
- Чем медиана лучше среднего? Как найти выбросы?
- Как бы вы оценили эффект фичи, которую нельзя протестировать A/B? (до/после с контрольной группой, difference-in-differences, синтетический контроль)

Ниже — задачи, похожие на реальные с собеседований.
`,
      tasks: [
        {
          type: 'sql', ordered: true, title: 'Второй по величине чек',
          text: md`Для каждого города найдите **вторую по величине уникальную** сумму доставленного заказа (если в городе две одинаковые максимальные суммы, вторая — следующая меньшая). Столбцы: ‹city›, ‹second_amount›. Сортировка по городу.`,
          solution: md`WITH a AS (
    SELECT DISTINCT u.city, o.amount
    FROM orders o JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'delivered'
), r AS (
    SELECT city, amount, DENSE_RANK() OVER (PARTITION BY city ORDER BY amount DESC) AS rnk
    FROM a
)
SELECT city, amount AS second_amount FROM r WHERE rnk = 2 ORDER BY city;`,
          hint: md`DENSE_RANK по убыванию суммы внутри города, затем ‹rnk = 2›.`,
        },
        {
          type: 'sql', ordered: true, title: 'Доля повторных покупателей',
          text: md`Для каждого месяца первой покупки (когорта покупателей) посчитайте долю пользователей, сделавших **второй** доставленный заказ в течение 30 дней после первого (включительно). Учитывайте только доставленные заказы; первый — по дате, затем по ‹order_id›. Столбцы: ‹cohort›, ‹buyers›, ‹repeat_30d› (3 знака). Сортировка по когорте.`,
          solution: md`WITH r AS (
    SELECT user_id, order_date,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date, order_id) AS rn
    FROM orders WHERE status = 'delivered'
), f AS (
    SELECT a.user_id, a.order_date AS first_date, b.order_date AS second_date
    FROM r a LEFT JOIN r b ON b.user_id = a.user_id AND b.rn = 2
    WHERE a.rn = 1
)
SELECT strftime('%Y-%m', first_date) AS cohort,
       COUNT(*) AS buyers,
       ROUND(AVG(CASE WHEN second_date IS NOT NULL
                       AND julianday(second_date) - julianday(first_date) <= 30
                      THEN 1.0 ELSE 0 END), 3) AS repeat_30d
FROM f
GROUP BY cohort
ORDER BY cohort;`,
          hint: md`Пронумеруйте доставленные заказы пользователя, затем соедините заказ №1 с заказом №2 того же пользователя через LEFT JOIN.`,
        },
        {
          type: 'py', data: ['orders', 'users'], title: 'Тестовое: отчёт по городам',
          text: md`Классическое тестовое. Постройте ‹report› — DataFrame с индексом ‹city›, отсортированный по ‹revenue› по убыванию, со столбцами:
- ‹users› — число пользователей города;
- ‹buyers› — пользователи с хотя бы одним доставленным заказом;
- ‹orders› — число доставленных заказов;
- ‹revenue› — выручка доставленных заказов;
- ‹aov› — средний чек;
- ‹cancel_rate› — доля отменённых среди **всех** заказов города.`,
          starter: md`# переменную orders не перезаписывайте — она нужна для проверки
`,
          solution: md`o = orders.merge(users[['user_id', 'city']], on='user_id')
d = o[o['status'] == 'delivered']
report = pd.DataFrame({
    'users': users.groupby('city')['user_id'].nunique(),
    'buyers': d.groupby('city')['user_id'].nunique(),
    'orders': d.groupby('city').size(),
    'revenue': d.groupby('city')['amount'].sum(),
})
report['aov'] = report['revenue'] / report['orders']
report['cancel_rate'] = o.groupby('city')['status'].apply(lambda s: (s == 'cancelled').mean())
report = report.sort_values('revenue', ascending=False)
print(report.round(3))`,
          test: md`import pandas as pd
O = _load('orders'); U = _load('users')
o = O.merge(U[['user_id', 'city']], on='user_id'); d = o[o.status == 'delivered']
e = pd.DataFrame({'users': U.groupby('city').user_id.nunique(), 'buyers': d.groupby('city').user_id.nunique(), 'orders': d.groupby('city').size(), 'revenue': d.groupby('city').amount.sum()})
e['aov'] = e.revenue / e.orders
e['cancel_rate'] = (o.status == 'cancelled').groupby(o.city).mean()
e = e.sort_values('revenue', ascending=False)
assert list(report.index) == list(e.index), f'Порядок городов: {list(report.index)}'
same_df(report, e, 'report')`,
        },
        {
          type: 'num', title: 'Вероятностная задачка', answer: 1 - (364 / 365) * (363 / 365) * (362 / 365) * (361 / 365) * (360 / 365) * (359 / 365) * (358 / 365) * (357 / 365) * (356 / 365), tol: 0.003,
          text: md`В команде 10 человек. Какова вероятность, что хотя бы у двоих день рождения в один день (365 дней в году, все дни равновероятны)? 3 знака.`,
          explain: md`P(все разные) = 365·364·…·356 / 365¹⁰ ≈ 0.883. Ответ: 1 − 0.883 ≈ 0.117.`,
        },
        {
          type: 'choice', title: 'Нельзя провести A/B',
          text: md`Фичу запустили сразу во всём Екатеринбурге, A/B-теста не было. Остальные города фичу не получили. Как корректнее оценить эффект?`,
          options: [
            'Сравнить метрику Екатеринбурга до и после запуска',
            'Difference-in-differences: изменение в Екатеринбурге минус изменение в похожих городах за тот же период',
            'Сравнить Екатеринбург с Москвой после запуска',
            'Оценить невозможно',
          ],
          answer: [1],
          explain: md`Простое «до/после» смешивает эффект фичи с сезонностью и общими трендами. DiD вычитает общий тренд, наблюдаемый в контрольных городах (при допущении параллельных трендов). Ещё вариант — синтетический контроль.`,
        },
      ],
    },
    {
      title: 'Портфолио, резюме и что изучать дальше',
      theory: md`
## Портфолио: 2–3 сильных проекта лучше десяти учебных
Хороший проект решает бизнес-вопрос, а не «исследует датасет». Структура: вопрос → данные → метод → вывод → рекомендация.

Идеи проектов:
1. **Продуктовый анализ**: когорты, retention, воронка и LTV на открытых данных e-commerce (например, бразильский Olist на Kaggle). Дашборд в DataLens + отчёт.
2. **A/B-тест от и до**: дизайн, расчёт размера выборки, проверка SRM, анализ с бутстрапом и CUPED на открытом датасете (Cookie Cats, Kaggle).
3. **SQL-проект**: витрина данных на PostgreSQL, набор запросов для метрик, описание схемы.
4. **Прогноз/модель**: отток клиентов или спрос, с честной валидацией и интерпретацией признаков.
5. **Свой источник данных**: парсинг вакансий hh.ru через открытое API и анализ требований и зарплат.

Оформление: репозиторий на GitHub с README (цель, выводы с графиками сверху, как запустить), чистые ноутбуки, ‹requirements.txt›.

## Резюме
- Одна страница. Сверху — стек: SQL (PostgreSQL, ClickHouse), Python (pandas, NumPy, SciPy), A/B-тесты, BI.
- Достижения в формате «сделал → результат в цифрах»: «Нашёл причину падения конверсии на шаге оплаты, исправление вернуло +3% выручки».
- Ссылки на GitHub и дашборды.
- Под каждую вакансию подсвечивайте релевантный опыт её же словами.

## Стек, который стоит освоить следом
| Инструмент | Зачем |
|---|---|
| PostgreSQL / ClickHouse | реальные СУБД, отличия от SQLite: ‹DATE_TRUNC›, ‹FILTER›, массивы, ‹uniqExact› |
| Jupyter + git | рабочая среда и контроль версий |
| DataLens / Superset | дашборды |
| Airflow, dbt | автоматизация расчётов и витрин (часто в middle+) |
| statsmodels | регрессии со статистиками, тесты, мощность |
| CatBoost | бустинг на табличных данных |

## Полезные ресурсы
- [SQL-тренажёр SQL Academy](https://sql-academy.org/ru/trainer), [LeetCode Database](https://leetcode.com/problemset/database/)
- [Документация pandas: 10 minutes to pandas](https://pandas.pydata.org/docs/user_guide/10min.html)
- Книги: «Доверительное A/B-тестирование» (Кохави, Тан, Сюй), «Статистика и котики» (Савельев), «Python и анализ данных» (Маккинли).
- [Калькулятор размера выборки Эвана Миллера](https://www.evanmiller.org/ab-testing/sample-size.html)

> **Последний совет.** Повторяйте задачи этого курса через неделю, не подсматривая. Скорость и уверенность на живом собеседовании берутся из повторения, а не из одного прочтения.
`,
      tasks: [],
    },
  ],
});
