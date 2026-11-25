// Синтетические данные сервиса доставки «Корзинка». Генерация детерминирована (фиксированный seed).
(function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = rng(20250101);
  function wpick(items, weights) {
    let s = 0; for (const w of weights) s += w;
    let x = R() * s;
    for (let i = 0; i < items.length; i++) { x -= weights[i]; if (x < 0) return items[i]; }
    return items[items.length - 1];
  }
  function gauss() { const u = 1 - R(), v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const DAY = 86400000, START = Date.UTC(2025, 0, 1), END = Date.UTC(2025, 6, 31);
  const fmt = (t) => new Date(t).toISOString().slice(0, 10);
  const r2 = (x) => Math.round(x * 100) / 100;

  const products = [
    [1, 'Огурцы', 'Овощи', 129], [2, 'Помидоры', 'Овощи', 189], [3, 'Картофель 2 кг', 'Овощи', 159], [4, 'Морковь', 'Овощи', 69], [5, 'Лук репчатый', 'Овощи', 49],
    [6, 'Бананы', 'Фрукты', 119], [7, 'Яблоки', 'Фрукты', 149], [8, 'Апельсины', 'Фрукты', 169], [9, 'Авокадо', 'Фрукты', 99],
    [10, 'Молоко 2.5%', 'Молочка', 89], [11, 'Кефир', 'Молочка', 79], [12, 'Творог 5%', 'Молочка', 139], [13, 'Сыр Российский', 'Молочка', 319], [14, 'Йогурт', 'Молочка', 59], [15, 'Сметана 15%', 'Молочка', 99],
    [16, 'Куриное филе', 'Мясо и рыба', 389], [17, 'Фарш говяжий', 'Мясо и рыба', 449], [18, 'Сёмга', 'Мясо и рыба', 890], [19, 'Сосиски', 'Мясо и рыба', 259],
    [20, 'Хлеб', 'Выпечка', 59], [21, 'Батон', 'Выпечка', 49], [22, 'Круассан', 'Выпечка', 89],
    [23, 'Вода 1.5 л', 'Напитки', 45], [24, 'Сок апельсиновый', 'Напитки', 159], [25, 'Кофе зерновой', 'Напитки', 799], [26, 'Чай чёрный', 'Напитки', 199],
    [27, 'Средство для посуды', 'Бытовое', 179], [28, 'Бумажные полотенца', 'Бытовое', 149], [29, 'Губки', 'Бытовое', 99], [30, 'Пакеты для мусора', 'Бытовое', 129],
  ];
  const catW = { 'Овощи': 1.3, 'Фрукты': 1.1, 'Молочка': 1.4, 'Мясо и рыба': 0.8, 'Выпечка': 1.2, 'Напитки': 0.9, 'Бытовое': 0.5 };
  const prodW = products.map((p) => catW[p[2]]);

  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];
  const cityW = [0.38, 0.24, 0.14, 0.13, 0.11];
  const channels = ['organic', 'ads', 'referral', 'social'];
  const chW = [0.35, 0.35, 0.12, 0.18];
  const chBase = { organic: 1.0, ads: 0.7, referral: 1.15, social: 0.8 };

  const users = [], orders = [], items = [], events = [];
  let oid = 1;
  for (let uid = 1; uid <= 2000; uid++) {
    const regDay = Math.floor(181 * Math.sqrt(R()));
    const reg = START + regDay * DAY;
    const city = wpick(cities, cityW), ch = wpick(channels, chW);
    const age = Math.max(18, Math.min(70, Math.round(33 + 9 * gauss())));
    users.push([uid, fmt(reg), city, ch, age]);
    const base = chBase[ch] * (city === 'Москва' ? 1.1 : 1);
    const ghost = R() < 0.15;
    const life = ghost ? 0 : -Math.log(1 - R()) * 45 * base;
    const last = Math.min(END, reg + Math.floor(life) * DAY);
    for (let t = reg; t <= last; t += DAY) {
      const first = t === reg;
      const wd = new Date(t).getUTCDay();
      const wk = wd === 0 || wd === 6 ? 1.2 : 1;
      if (!first && R() > 0.22 * base * wk) continue;
      const d = fmt(t);
      events.push([uid, d, 'app_open']);
      if (R() < (first ? 0.5 : 0.35)) {
        events.push([uid, d, 'add_to_cart']);
        if (R() < 0.6) {
          events.push([uid, d, 'purchase']);
          const promo = R() < 0.2 ? 1 : 0;
          const n = 1 + Math.floor(R() * 4);
          const used = new Set();
          let amount = 0;
          for (let k = 0; k < n; k++) {
            const p = wpick(products, prodW);
            if (used.has(p[0])) continue;
            used.add(p[0]);
            const q = 1 + Math.floor(R() * 3);
            const price = promo ? Math.round(p[3] * 0.9) : p[3];
            amount += q * price;
            items.push([oid, p[0], q, price]);
          }
          const status = R() < 0.07 ? 'cancelled' : 'delivered';
          orders.push([oid, uid, d, r2(amount), status, promo]);
          oid++;
        }
      }
    }
  }

  const ab = [];
  for (let i = 0; i < 3000; i++) {
    const uid = 10001 + i;
    const grp = R() < 0.5 ? 'A' : 'B';
    const spender = R() < 0.6;
    const pre = spender ? r2(Math.exp(6.5 + 0.8 * gauss())) : 0;
    let pc = 0.10 + (spender ? 0.04 : 0);
    if (grp === 'B') pc *= 1.15;
    const conv = R() < pc ? 1 : 0;
    let rev = 0;
    if (conv) {
      rev = (spender ? pre * 0.6 : 0) + Math.exp(6.8 + 0.5 * gauss());
      if (grp === 'B') rev *= 1.03;
      rev = r2(rev);
    }
    ab.push([uid, grp, pre, conv, rev]);
  }

  window.DATA = {
    tables: {
      users: { cols: ['user_id', 'reg_date', 'city', 'channel', 'age'], types: ['INTEGER', 'TEXT', 'TEXT', 'TEXT', 'INTEGER'], rows: users,
        desc: 'Пользователи сервиса: дата регистрации, город, канал привлечения, возраст.' },
      products: { cols: ['product_id', 'name', 'category', 'price'], types: ['INTEGER', 'TEXT', 'TEXT', 'REAL'], rows: products,
        desc: 'Каталог товаров с базовой ценой в рублях.' },
      orders: { cols: ['order_id', 'user_id', 'order_date', 'amount', 'status', 'promo'], types: ['INTEGER', 'INTEGER', 'TEXT', 'REAL', 'TEXT', 'INTEGER'], rows: orders,
        desc: 'Заказы. status: delivered или cancelled. promo = 1, если заказ со скидкой 10%. amount — сумма заказа.' },
      order_items: { cols: ['order_id', 'product_id', 'quantity', 'price'], types: ['INTEGER', 'INTEGER', 'INTEGER', 'REAL'], rows: items,
        desc: 'Позиции заказов: товар, количество и фактическая цена за штуку (с учётом промо).' },
      events: { cols: ['user_id', 'event_date', 'event'], types: ['INTEGER', 'TEXT', 'TEXT'], rows: events,
        desc: 'События в приложении: app_open (не больше одного в день на пользователя), add_to_cart, purchase.' },
      ab_test: { cols: ['user_id', 'grp', 'pre_revenue', 'converted', 'revenue'], types: ['INTEGER', 'TEXT', 'REAL', 'INTEGER', 'REAL'], rows: ab,
        desc: 'Эксперимент с новым экраном оформления заказа. grp: A (контроль) или B (тест). pre_revenue — траты за месяц до теста, converted — была ли покупка в тесте, revenue — выручка с пользователя за время теста.' },
    },
    parseDates: { users: ['reg_date'], orders: ['order_date'], events: ['event_date'] },
  };
})();

// ---------------- Страховая компания «Надёжный полис» ----------------
(function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = rng(777);
  const gauss = () => { const u = 1 - R(), v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const expo = (m) => -Math.log(1 - R()) * m;
  function poisson(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; }
  function wpick(items, w) { let s = 0; for (const x of w) s += x; let x = R() * s; for (let i = 0; i < items.length; i++) { x -= w[i]; if (x < 0) return items[i]; } return items[items.length - 1]; }
  const DAY = 86400000, S = Date.UTC(2021, 0, 1), VAL = Date.UTC(2024, 11, 31);
  const fmt = (t) => new Date(t).toISOString().slice(0, 10);
  const r2 = (x) => Math.round(x * 100) / 100;
  const regions = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];
  const regW = [0.36, 0.22, 0.14, 0.15, 0.13];
  const terr = { 'Москва': 1.8, 'Санкт-Петербург': 1.64, 'Казань': 1.4, 'Екатеринбург': 1.48, 'Новосибирск': 1.6 };
  const regRisk = { 'Москва': 1.25, 'Санкт-Петербург': 1.15, 'Казань': 0.95, 'Екатеринбург': 1.0, 'Новосибирск': 1.05 };
  const KBM = [0.46, 0.5, 0.54, 0.6, 0.68, 0.78, 0.88, 0.94, 1.0];
  const pol = [], cl = [], pay = [];
  let cid = 1;
  for (let pid = 1; pid <= 12000; pid++) {
    const product = R() < 0.65 ? 'ОСАГО' : 'КАСКО';
    const region = wpick(regions, regW);
    const age = Math.max(18, Math.min(75, Math.round(40 + 12 * gauss())));
    const exp = Math.max(0, Math.min(age - 18, age - 18 - Math.floor(R() * 6)));
    const power = Math.max(60, Math.min(300, Math.round(115 + 35 * gauss())));
    const value = Math.round(Math.exp(14.2 + 0.45 * gauss()) / 1000) * 1000;
    let kbm = 1.0;
    if (exp >= 1) { const r = R(); kbm = r < 0.05 ? [1.4, 1.56, 2.45][Math.floor(R() * 3)] : KBM[Math.max(0, Math.min(8, 8 - Math.floor(exp / 2 + R() * 3)))]; }
    const start = S + Math.floor(R() * 1461) * DAY;
    let end = start + 364 * DAY;
    if (R() < 0.04) end = start + Math.floor(30 + R() * 300) * DAY;
    const dur = (end - start + DAY) / (365 * DAY);
    const ka = age < 22 ? 1.9 : age < 25 ? 1.7 : age < 30 ? 1.2 : age > 60 ? 1.05 : 1.0;
    const km = power <= 70 ? 0.6 : power <= 100 ? 1.0 : power <= 120 ? 1.2 : power <= 150 ? 1.4 : 1.6;
    const premium = product === 'ОСАГО'
      ? r2(6500 * terr[region] * ka * km * kbm * dur)
      : r2(value * 0.045 * (age < 25 ? 1.5 : age < 30 ? 1.15 : 1) * (regRisk[region]) * dur);
    pol.push([pid, product, region, age, exp, power, value, kbm, fmt(start), fmt(end), r2(dur), premium]);
    let lam = (product === 'ОСАГО' ? 0.055 : 0.16) * (age < 25 ? 1.8 : age < 30 ? 1.3 : age > 60 ? 1.15 : 1) * (exp < 2 ? 1.4 : 1) * (power > 150 ? 1.3 : 1) * regRisk[region] * (kbm > 1 ? 1.6 : kbm < 0.6 ? 0.8 : 1);
    const n = poisson(lam * dur);
    for (let k = 0; k < n; k++) {
      const acc = start + Math.floor(R() * ((end - start) / DAY + 1)) * DAY;
      if (acc > VAL) continue;
      const early = acc - start < 30 * DAY;
      const fraud = R() < 0.03 * (early ? 4 : 1) ? 1 : 0;
      let sev = product === 'ОСАГО' ? Math.exp(10.9 + 0.8 * gauss()) : (R() < 0.05 ? value * 0.8 : Math.min(value, Math.exp(11.2 + 0.9 * gauss())));
      if (fraud) sev *= 1.6;
      sev = r2(Math.min(product === 'ОСАГО' ? 400000 : value, sev));
      const delay = Math.floor(expo(20) + (R() < 0.06 ? expo(200) : 0));
      const rep = acc + delay * DAY;
      if (rep > VAL) continue;
      const settle = rep + Math.floor(15 + expo(60)) * DAY;
      const parts = R() < 0.4 ? [[settle, 0.6], [settle + Math.floor(60 + expo(120)) * DAY, 0.4]] : [[settle, 1]];
      let paid = 0, full = true;
      for (const [t, sh] of parts) { if (t <= VAL) { const a = r2(sev * sh); pay.push([cid, fmt(t), a]); paid += a; } else full = false; }
      const status = full ? 'closed' : 'open';
      const incurred = full ? r2(paid) : r2(sev * (0.8 + 0.5 * R()));
      cl.push([cid, pid, fmt(acc), fmt(rep), incurred, r2(paid), status, fraud]);
      cid++;
    }
  }
  pay.sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] - b[0]));
  Object.assign(window.DATA.tables, {
    ins_policies: { cols: ['policy_id', 'product', 'region', 'driver_age', 'experience', 'car_power', 'car_value', 'kbm', 'start_date', 'end_date', 'exposure', 'premium'],
      types: ['INTEGER', 'TEXT', 'TEXT', 'INTEGER', 'INTEGER', 'INTEGER', 'REAL', 'REAL', 'TEXT', 'TEXT', 'REAL', 'REAL'], rows: pol,
      desc: 'Договоры ОСАГО и КАСКО 2021–2024. exposure — срок договора в годах (досрочно расторгнутые короче года), premium — начисленная премия за весь срок, kbm — коэффициент бонус-малус, car_power — мощность в л. с.' },
    ins_claims: { cols: ['claim_id', 'policy_id', 'accident_date', 'report_date', 'incurred', 'paid', 'status', 'fraud'],
      types: ['INTEGER', 'INTEGER', 'TEXT', 'TEXT', 'REAL', 'REAL', 'TEXT', 'INTEGER'], rows: cl,
      desc: 'Заявленные убытки на 31.12.2024. incurred — оценка полного убытка (выплачено + резерв заявленного убытка), paid — выплачено, status: closed/open, fraud = 1 — признан мошенническим.' },
    ins_payments: { cols: ['claim_id', 'pay_date', 'amount'], types: ['INTEGER', 'TEXT', 'REAL'], rows: pay,
      desc: 'Выплаты по убыткам до 31.12.2024 (по убытку может быть несколько выплат). Основа для треугольников развития.' },
  });
  Object.assign(window.DATA.parseDates, { ins_policies: ['start_date', 'end_date'], ins_claims: ['accident_date', 'report_date'], ins_payments: ['pay_date'] });
})();
