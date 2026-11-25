(function () {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Не загрузился ' + src)); document.head.appendChild(s); }); }
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 4500); }
const plural = (n, f) => { const a = n % 100, b = n % 10; return n + ' ' + (a > 10 && a < 20 ? f[2] : b === 1 ? f[0] : b > 1 && b < 5 ? f[1] : f[2]); };
const PM = ['модуль', 'модуля', 'модулей'], PL = ['урок', 'урока', 'уроков'], PT = ['задача', 'задачи', 'задач'];
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* ================= индекс курса ================= */
const MODS = COURSE.mods;
const TR = window.TRACKS;
const LESSONS = {}; const TASKS = {};
for (const m of Object.values(MODS)) {
  m.lessons.forEach((l, li) => {
    l.mod = m; l.n = li + 1; l.key = m.id + '-' + (li + 1); LESSONS[l.key] = l;
    l.tasks = (l.tasks || []).flat();
    l.tasks.forEach((t, ti) => { t.key = l.key + '-' + (ti + 1); t.n = ti + 1; t.lesson = l; TASKS[t.key] = t; });
  });
}
for (const t of TR) { t.mods = t.modules.filter((id) => MODS[id]).map((id) => MODS[id]); t.lessons = t.mods.flatMap((m) => m.lessons); t.tasks = t.lessons.flatMap((l) => l.tasks); }
const ALL = Object.values(TASKS);
let track = TR.find((t) => t.id === ls.get('pb-track', 'da')) || TR[0];
const modNum = (m, tr = track) => tr.modules.indexOf(m.id) + 1;

/* ================= хранилище прогресса ================= */
const Store = {
  mode: 'local', uid: null, name: '', ref: null, solved: {}, code: {},
  init() { this.solved = ls.get('pb-solved-local', {}); this.code = ls.get('pb-code-local', {}); },
  async attach(user, fs) {
    this.mode = 'firebase'; this.uid = user.uid; this.name = user.displayName || user.email.split('@')[0];
    this.ref = fs.collection('users').doc(user.uid);
    const snap = await this.ref.get();
    this.solved = snap.exists ? snap.data().solved || {} : {};
    if (!snap.exists || snap.data().name !== this.name) await this.ref.set({ name: this.name, solved: this.solved, count: Object.keys(this.solved).length }, { merge: true });
    this.code = ls.get('pb-code-' + this.uid, {});
  },
  detach() { this.mode = 'local'; this.uid = null; this.ref = null; this.init(); },
  markSolved(key) {
    if (this.solved[key]) return;
    this.solved[key] = Date.now();
    if (this.mode === 'firebase') {
      this.ref.set({ solved: { [key]: this.solved[key] }, count: Object.keys(this.solved).length, updated: Date.now() }, { merge: true })
        .catch(() => toast('Не удалось сохранить прогресс в облаке. Проверьте интернет.'));
    } else ls.set('pb-solved-local', this.solved);
  },
  _t: null,
  saveCode(key, code) {
    if (code == null) delete this.code[key]; else this.code[key] = code;
    clearTimeout(this._t); this._t = setTimeout(() => ls.set(this.mode === 'firebase' ? 'pb-code-' + this.uid : 'pb-code-local', this.code), 400);
  },
};
Store.init();
const solvedIn = (arr) => arr.filter((t) => Store.solved[t.key]).length;

/* ================= Firebase ================= */
let FB = null;
const FB_V = 'https://www.gstatic.com/firebasejs/10.12.2/';
const AUTH_ERR = {
  'auth/invalid-email': 'Неверный формат почты.', 'auth/user-not-found': 'Такой пользователь не найден.', 'auth/wrong-password': 'Неверный пароль.',
  'auth/invalid-credential': 'Неверная почта или пароль.', 'auth/email-already-in-use': 'Эта почта уже зарегистрирована. Войдите.',
  'auth/weak-password': 'Пароль слишком простой: нужно минимум 6 символов.', 'auth/too-many-requests': 'Слишком много попыток. Подождите пару минут.',
  'auth/network-request-failed': 'Нет связи с сервером. Проверьте интернет.', 'auth/missing-password': 'Введите пароль.',
};
async function initFirebase() {
  await loadScript(FB_V + 'firebase-app-compat.js');
  await Promise.all([loadScript(FB_V + 'firebase-auth-compat.js'), loadScript(FB_V + 'firebase-firestore-compat.js')]);
  firebase.initializeApp(window.FIREBASE_CONFIG);
  FB = { auth: firebase.auth(), fs: firebase.firestore() };
  FB.auth.onAuthStateChanged(async (u) => {
    if (u) {
      try { await Store.attach(u, FB.fs); } catch (e) { toast('Не удалось загрузить прогресс: ' + (e.message || e)); }
      showApp(); route();
    } else if (!ls.get('pb-guest', false)) { Store.detach(); showAuth(); }
    else { Store.detach(); showApp(); route(); }
  });
}
function showApp() { $('#authRoot').hidden = true; $('#wrap').hidden = false; document.querySelector('.top').hidden = false; renderUserChip(); }
function renderUserChip() {
  const c = $('#userChip');
  if (!FB) { c.innerHTML = ''; return; }
  if (Store.mode === 'firebase') { c.innerHTML = `<b></b><button class="link-btn" id="logout">Выйти</button>`; c.querySelector('b').textContent = Store.name; $('#logout').onclick = () => { ls.set('pb-guest', false); FB.auth.signOut(); }; }
  else { c.innerHTML = `<button class="link-btn" id="login">Войти</button>`; $('#login').onclick = () => { ls.set('pb-guest', false); showAuth(); }; }
}
function showAuth() {
  $('#wrap').hidden = true; document.querySelector('.top').hidden = true;
  const r = $('#authRoot'); r.hidden = false;
  let mode = 'in';
  const draw = (msg, cls) => {
    r.innerHTML = `<div class="auth-wrap"><form class="auth" id="authForm" novalidate>
      <h1>Поиск <span style="color:var(--accent)">батрачки</span></h1>
      <p>Тренажёр для аналитиков данных, ML-специалистов и аналитиков страховых компаний. Войдите, чтобы прогресс сохранялся в вашем аккаунте.</p>
      <div class="tabs"><button type="button" data-m="in" class="${mode === 'in' ? 'on' : ''}">Вход</button><button type="button" data-m="up" class="${mode === 'up' ? 'on' : ''}">Регистрация</button></div>
      ${mode === 'up' ? '<label>Имя в рейтинге<input id="aName" autocomplete="nickname" maxlength="40" required></label>' : ''}
      <label>Почта<input id="aEmail" type="email" autocomplete="email" required></label>
      <label>Пароль<input id="aPass" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" minlength="6" required></label>
      ${msg ? `<div class="msg ${cls}">${esc(msg)}</div>` : ''}
      <button class="btn primary" type="submit">${mode === 'up' ? 'Зарегистрироваться' : 'Войти'}</button>
      <div class="row"><button type="button" class="link-btn" id="aReset">Забыли пароль?</button><button type="button" class="link-btn" id="aGuest">Продолжить без аккаунта</button></div>
    </form></div>`;
    r.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => { mode = b.dataset.m; draw(); }));
    $('#aGuest').onclick = () => { ls.set('pb-guest', true); Store.detach(); showApp(); route(); };
    $('#aReset').onclick = async () => {
      const em = $('#aEmail').value.trim(); if (!em) return draw('Введите почту, и мы пришлём ссылку для сброса пароля.', 'bad');
      try { await FB.auth.sendPasswordResetEmail(em); draw('Письмо со ссылкой для сброса пароля отправлено на ' + em + '.', 'ok'); }
      catch (e) { draw(AUTH_ERR[e.code] || e.message, 'bad'); }
    };
    $('#authForm').onsubmit = async (e) => {
      e.preventDefault();
      const em = $('#aEmail').value.trim(), pw = $('#aPass').value;
      try {
        if (mode === 'up') {
          const nm = $('#aName').value.trim(); if (!nm) return draw('Введите имя для рейтинга.', 'bad');
          const cr = await FB.auth.createUserWithEmailAndPassword(em, pw);
          await cr.user.updateProfile({ displayName: nm });
          await Store.attach(cr.user, FB.fs); showApp(); route();
        } else await FB.auth.signInWithEmailAndPassword(em, pw);
      } catch (err) { draw(AUTH_ERR[err.code] || err.message, 'bad'); }
    };
  };
  draw();
}

/* ================= подсветка и markdown ================= */
const PY_KW = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
const SQL_KW = new Set('select from where and or not in is null as join left right inner outer full on group by order having limit offset distinct case when then else end with union all over partition rows range between preceding following current row asc desc like count sum avg min max round cast coalesce exists insert into values create table update set delete date strftime julianday interval filter using cross lag lead row_number rank dense_rank ntile first_value last_value nullif ifnull extract date_trunc unbounded recursive'.split(' '));
function hl(code, lang) {
  const isSql = lang === 'sql';
  const re = isSql
    ? /(--[^\n]*)|('(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z_0-9]*)|([\s\S])/g
    : /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|[fr]?"(?:[^"\\\n]|\\.)*"|[fr]?'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|(@?[A-Za-z_][A-Za-z_0-9]*)(?=(\s*\()?)|([\s\S])/g;
  let out = '', m;
  while ((m = re.exec(code))) {
    if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
    else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
    else if (m[3]) out += '<span class="n">' + esc(m[3]) + '</span>';
    else if (m[4]) {
      const w = m[4];
      if (isSql ? SQL_KW.has(w.toLowerCase()) : PY_KW.has(w)) out += '<span class="k">' + w + '</span>';
      else if (!isSql && (m[5] || w[0] === '@')) out += '<span class="f">' + esc(w) + '</span>';
      else out += esc(w);
    } else out += esc(m[isSql ? 5 : 6] || '');
  }
  return out;
}
function inline(s) {
  return String(s).split(/(‹[^›]*›)/).map((p) => {
    if (p.startsWith('‹') && p.endsWith('›')) return '<code>' + esc(p.slice(1, -1)) + '</code>';
    return esc(p).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }).join('');
}
function mdRender(src) {
  const lines = String(src || '').replace(/^\n+/, '').split('\n');
  const nonEmpty = lines.filter((l) => l.trim());
  const ind = nonEmpty.length ? Math.min(...nonEmpty.map((l) => l.match(/^ */)[0].length)) : 0;
  const L = lines.map((l) => l.slice(ind));
  let html = '', i = 0, para = [];
  const flush = () => { if (para.length) { html += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } };
  while (i < L.length) {
    const line = L[i];
    if (line.startsWith('~~~')) {
      flush(); const lang = line.slice(3).trim() || 'py'; const buf = []; i++;
      while (i < L.length && !L[i].startsWith('~~~')) buf.push(L[i++]);
      i++; html += '<pre class="code">' + (lang === 'text' ? esc(buf.join('\n')) : hl(buf.join('\n'), lang)) + '</pre>'; continue;
    }
    if (/^#{2,3} /.test(line)) { flush(); const h = line.startsWith('### ') ? 'h3' : 'h2'; html += `<${h}>${inline(line.replace(/^#+ /, ''))}</${h}>`; i++; continue; }
    if (line.startsWith('$$')) { flush(); const buf = []; while (i < L.length && L[i].startsWith('$$')) buf.push(L[i++].replace(/^\$\$ ?/, '')); html += '<div class="formula">' + esc(buf.join('\n')) + '</div>'; continue; }
    if (line.startsWith('> ')) { flush(); const buf = []; while (i < L.length && L[i].startsWith('>')) buf.push(L[i++].replace(/^> ?/, '')); html += '<div class="callout">' + mdRender(buf.join('\n')) + '</div>'; continue; }
    if (line.startsWith('|')) {
      flush(); const rows = []; while (i < L.length && L[i].startsWith('|')) rows.push(L[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]); const body = rows.slice(2).map(cells);
      html += '<div class="tbl"><table><thead><tr>' + head.map((h) => '<th>' + inline(h) + '</th>').join('') + '</tr></thead><tbody>' +
        body.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
      continue;
    }
    if (/^(- |\d+\. )/.test(line)) {
      flush(); const ordered = /^\d+\. /.test(line); const items = [];
      while (i < L.length && (/^(- |\d+\. )/.test(L[i]) || (/^  \S/.test(L[i]) && items.length))) {
        if (/^(- |\d+\. )/.test(L[i])) items.push(L[i].replace(/^(- |\d+\. )/, '')); else items[items.length - 1] += ' ' + L[i].trim();
        i++;
      }
      html += (ordered ? '<ol>' : '<ul>') + items.map((t) => '<li>' + inline(t) + '</li>').join('') + (ordered ? '</ol>' : '</ul>'); continue;
    }
    if (!line.trim()) { flush(); i++; continue; }
    para.push(line.trim()); i++;
  }
  flush(); return html;
}

/* ================= SQL ================= */
let DB = null;
function getDB() {
  if (DB) return Promise.resolve(DB);
  return initSqlJs().then((SQL) => {
    const db = new SQL.Database();
    db.run('BEGIN');
    for (const [name, t] of Object.entries(DATA.tables)) {
      db.run(`CREATE TABLE ${name} (${t.cols.map((c, i) => c + ' ' + t.types[i]).join(', ')})`);
      const st = db.prepare(`INSERT INTO ${name} VALUES (${t.cols.map(() => '?').join(',')})`);
      for (const r of t.rows) st.run(r);
      st.free();
    }
    db.run('COMMIT');
    DB = db; return db;
  });
}
function runSQL(db, q) { const res = db.exec(q); return res.length ? res[res.length - 1] : { columns: [], values: [] }; }
const isNum = (v) => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));
function cellEq(a, b) {
  if (a === null || b === null) return a === b;
  if (isNum(a) && isNum(b)) { const x = Number(a), y = Number(b); return Math.abs(x - y) <= 0.011 + 1e-6 * Math.abs(y); }
  return String(a).trim() === String(b).trim();
}
const rowKey = (r) => r.map((v) => (v === null ? '∅' : isNum(v) ? (Math.round(Number(v) * 10) / 10).toFixed(1) : String(v).trim())).join('\u0001');
function compareSQL(user, ref, ordered) {
  if (user.columns.length !== ref.columns.length) return `Неверное число столбцов: ожидалось ${ref.columns.length}, у вас ${user.columns.length}.`;
  if (user.values.length !== ref.values.length) return `Неверное число строк: ожидалось ${ref.values.length}, у вас ${user.values.length}.`;
  let U = user.values, E = ref.values;
  if (!ordered) { const srt = (a) => a.slice().sort((x, y) => (rowKey(x) < rowKey(y) ? -1 : rowKey(x) > rowKey(y) ? 1 : 0)); U = srt(U); E = srt(E); }
  for (let i = 0; i < E.length; i++) for (let j = 0; j < E[i].length; j++) {
    if (!cellEq(U[i][j], E[i][j])) return `Строка ${i + 1}, столбец ${j + 1}: значение не совпадает с ожидаемым (у вас ${U[i][j] === null ? 'NULL' : esc(U[i][j])}).` + (ordered ? ' Проверьте также порядок сортировки.' : '');
  }
  return null;
}
function tableHTML(r, limit = 200) {
  if (!r.columns.length) return '<div class="res-note">Запрос выполнен, но не вернул таблицу.</div>';
  const rows = r.values.slice(0, limit);
  return '<div class="res"><table><thead><tr>' + r.columns.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    rows.map((row) => '<tr>' + row.map((v) => '<td>' + (v === null ? '<span style="color:var(--muted)">NULL</span>' : esc(v)) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div><div class="res-note">Строк: ' + r.values.length + (r.values.length > limit ? ` (показаны первые ${limit})` : '') + '</div>';
}

/* ================= Python (Pyodide) ================= */
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
let PY = null; const loadedPkgs = new Set();
const PY_BOOT = md`
import sys, io, traceback, math, base64, re as _re
_cache = {}
def _load(name):
    import pandas as pd
    if name not in _cache:
        _cache[name] = pd.read_csv(io.StringIO(_CSV[name]), parse_dates=list(_PARSE.get(name, [])))
    return _cache[name].copy()

def _fmt_exc(e):
    tb = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == '<ваш код>']
    lines = ''.join(traceback.format_list(tb)) if tb else ''
    return (('Traceback:\n' + lines) if lines else '') + type(e).__name__ + ': ' + str(e)

def _figs():
    plt = sys.modules.get('matplotlib.pyplot')
    if plt is None:
        return []
    out = []
    cur = plt.gcf() if plt.get_fignums() else None
    for n in plt.get_fignums():
        f = plt.figure(n); b = io.BytesIO()
        f.savefig(b, format='png', dpi=80, bbox_inches='tight')
        out.append(base64.b64encode(b.getvalue()).decode())
    if cur is not None:
        plt.figure(cur.number)
    return out

def _close_figs():
    plt = sys.modules.get('matplotlib.pyplot')
    if plt is not None:
        plt.close('all')

def _exec_in(code, setup, fname):
    ns = {'__name__': '__main__', '_load': _load}
    exec(compile(setup, '<setup>', 'exec'), ns)
    exec(compile(code, fname, 'exec'), ns)
    return ns

def _get(ns, expr):
    if _re.fullmatch(r'[A-Za-z_][A-Za-z_0-9]*', expr):
        if expr not in ns:
            raise NameError(expr, name=expr)
        return ns[expr]
    return eval(expr, ns)

def _run(user_code, setup_code, test_code, ref_code, checks):
    out = io.StringIO(); old = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = out
    status, msg, ns = 'ok', '', None
    try:
        ns = _exec_in(user_code, setup_code, '<ваш код>')
    except SyntaxError as e:
        status, msg = 'error', f'SyntaxError (строка {e.lineno}): {e.msg}'
    except BaseException as e:
        status, msg = 'error', _fmt_exc(e)
    finally:
        sys.stdout, sys.stderr = old
    figs = _figs()
    if status == 'ok' and (test_code or checks):
        chk = {}
        exec(compile(_CHK, '<chk>', 'exec'), chk)
        try:
            if test_code:
                tns = dict(ns)
                tns.update({k: v for k, v in chk.items() if not k.startswith('__')})
                exec(compile(test_code, '<test>', 'exec'), tns)
            _close_figs()
            if checks:
                saved = sys.stdout; sys.stdout = io.StringIO()
                try:
                    ref = _exec_in(ref_code, setup_code, '<ref>')
                finally:
                    sys.stdout = saved
                    _close_figs()
                for c in checks:
                    try:
                        got = _get(ns, c)
                    except NameError as e:
                        raise
                    except BaseException as e:
                        raise AssertionError(f'Вычисление «{c}» упало: {type(e).__name__}: {e}')
                    chk['same'](got, _get(ref, c), c)
            status = 'pass'
        except NameError as e:
            status, msg = 'fail', f'Не найдено имя «{getattr(e, "name", None) or e}». Проверьте, что переменная или функция создана и названа именно так.'
        except AssertionError as e:
            status, msg = 'fail', str(e) or 'Ответ не совпадает с ожидаемым.'
        except BaseException as e:
            status, msg = 'fail', 'Проверка упала: ' + type(e).__name__ + ': ' + str(e)
    _close_figs()
    return [status, out.getvalue(), msg, figs]
`;
const PY_CHK = md`
import math as _m, numbers as _nb
def _f(x, what):
    try:
        return float(x)
    except Exception:
        raise AssertionError(f'{what}: ожидалось число, получено {type(x).__name__}')
def near(a, b, tol=1e-6, what='Ответ'):
    a = _f(a, what); b = float(b)
    if _m.isnan(b) and _m.isnan(a):
        return
    if _m.isnan(a) or abs(a - b) > tol * max(1.0, abs(b)):
        raise AssertionError(f'{what}: значение {a:.6g} не совпадает с ожидаемым.')
def same_list(a, b, what='Список'):
    same(list(a) if isinstance(a, tuple) else a, list(b), what)
def same_series(a, b, what='Series', sort_index=False, tol=1e-6):
    import pandas as pd, numpy as np
    assert isinstance(a, pd.Series), f'{what}: ожидался pandas.Series, получен {type(a).__name__}'
    if sort_index:
        a = a.sort_index(); b = b.sort_index()
    assert len(a) == len(b), f'{what}: ожидалось {len(b)} элементов, у вас {len(a)}'
    ia = [str(x) for x in a.index]; ib = [str(x) for x in b.index]
    assert ia == ib, f'{what}: индекс не совпадает с ожидаемым (у вас начинается с {ia[:4]}, ожидалось {ib[:4]}). Проверьте группировку и сортировку.'
    va = a.to_numpy(); vb = b.to_numpy()
    if pd.api.types.is_numeric_dtype(b) and not pd.api.types.is_bool_dtype(b):
        try:
            ok = np.allclose(va.astype(float), vb.astype(float), rtol=tol, atol=tol, equal_nan=True)
        except Exception:
            ok = False
    else:
        ok = [str(x) for x in va] == [str(x) for x in vb]
    assert ok, f'{what}: значения не совпадают с ожидаемыми.'
def same_df(a, b, what='DataFrame', sort_by=None, tol=1e-6, check_names=True, check_index=None):
    import pandas as pd, numpy as np
    assert isinstance(a, pd.DataFrame), f'{what}: ожидался pandas.DataFrame, получен {type(a).__name__}'
    if check_names:
        assert [str(c) for c in a.columns] == [str(c) for c in b.columns], f'{what}: столбцы {[str(c) for c in a.columns]}, а ожидались {[str(c) for c in b.columns]}'
    else:
        assert a.shape[1] == b.shape[1], f'{what}: ожидалось {b.shape[1]} столбцов, у вас {a.shape[1]}'
        a = a.copy(); a.columns = b.columns
    assert a.shape == b.shape, f'{what}: размер {a.shape}, а ожидался {b.shape}'
    if check_index is None:
        check_index = not isinstance(b.index, pd.RangeIndex) and sort_by is None
    if check_index:
        ia = [str(x) for x in a.index]; ib = [str(x) for x in b.index]
        assert ia == ib, f'{what}: индекс не совпадает с ожидаемым (у вас {ia[:4]}…, ожидалось {ib[:4]}…)'
    if sort_by:
        a = a.sort_values(sort_by).reset_index(drop=True); b = b.sort_values(sort_by).reset_index(drop=True)
    else:
        a = a.reset_index(drop=True); b = b.reset_index(drop=True)
    for c in b.columns:
        x, y = a[c], b[c]
        if pd.api.types.is_numeric_dtype(y) and not pd.api.types.is_bool_dtype(y):
            try:
                ok = np.allclose(pd.to_numeric(x, errors='coerce').astype(float), y.astype(float), rtol=tol, atol=tol, equal_nan=True)
            except Exception:
                ok = False
        else:
            ok = [str(v) for v in x] == [str(v) for v in y]
        assert ok, f'{what}: значения в столбце «{c}» не совпадают с ожидаемыми.'
def same(a, b, what='Ответ'):
    import sys as _s
    pd = _s.modules.get('pandas'); np = _s.modules.get('numpy')
    if pd is not None and isinstance(b, pd.DataFrame):
        return same_df(a, b, what)
    if pd is not None and isinstance(b, pd.Series):
        return same_series(a, b, what)
    if np is not None and isinstance(b, np.ndarray):
        assert isinstance(a, (np.ndarray, list, tuple)) or (pd is not None and isinstance(a, pd.Series)), f'{what}: ожидался массив, получен {type(a).__name__}'
        a = np.asarray(a)
        assert a.shape == b.shape, f'{what}: форма {a.shape}, а ожидалась {b.shape}'
        if b.dtype.kind in 'fiub':
            assert np.allclose(a.astype(float), b.astype(float), rtol=1e-6, atol=1e-9, equal_nan=True), f'{what}: значения не совпадают с ожидаемыми.'
        else:
            assert (a.astype(str) == b.astype(str)).all(), f'{what}: значения не совпадают с ожидаемыми.'
        return
    if b is None:
        assert a is None, f'{what}: ожидалось None, получено {a!r}'
        return
    if isinstance(b, bool) or (np is not None and isinstance(b, np.bool_)):
        assert isinstance(a, (bool, int)) or (np is not None and isinstance(a, (np.bool_, np.integer))), f'{what}: ожидалось True/False, получено {type(a).__name__}'
        assert bool(a) == bool(b), f'{what}: ожидалось {bool(b)}, получено {bool(a)}'
        return
    if isinstance(b, _nb.Number) or (np is not None and isinstance(b, np.number)):
        return near(a, b, 1e-6, what)
    if isinstance(b, str):
        assert isinstance(a, str), f'{what}: ожидалась строка, получен {type(a).__name__}'
        assert a == b, f'{what}: строка отличается от ожидаемой (у вас {a[:80]!r})'
        return
    if isinstance(b, dict):
        assert isinstance(a, dict), f'{what}: ожидался словарь, получен {type(a).__name__}'
        ka = sorted(map(str, a)); kb = sorted(map(str, b))
        assert ka == kb, f'{what}: ключи {ka[:6]}, а ожидались {kb[:6]}'
        am = {str(k): v for k, v in a.items()}
        for k, v in b.items():
            same(am[str(k)], v, f'{what}[{k!r}]')
        return
    if isinstance(b, (set, frozenset)):
        assert isinstance(a, (set, frozenset)), f'{what}: ожидалось множество, получен {type(a).__name__}'
        assert set(a) == set(b), f'{what}: элементы множества не совпадают'
        return
    if isinstance(b, (list, tuple)):
        assert isinstance(a, (list, tuple)), f'{what}: ожидался {type(b).__name__}, получен {type(a).__name__}'
        assert len(a) == len(b), f'{what}: ожидалось {len(b)} элементов, у вас {len(a)}'
        for i, (x, y) in enumerate(zip(a, b)):
            same(x, y, f'{what}[{i}]')
        return
    assert a == b, f'{what}: значение отличается от ожидаемого ({a!r})'
`;
function toCSV(t) {
  const q = (v) => (typeof v === 'string' && /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  return t.cols.join(',') + '\n' + t.rows.map((r) => r.map(q).join(',')).join('\n');
}
function getPy(status) {
  if (!PY) {
    PY = (async () => {
      status('Загружаю Python (≈14 МБ, только при первом запуске)…');
      await loadScript(PYODIDE_URL + 'pyodide.js');
      const py = await loadPyodide({ indexURL: PYODIDE_URL });
      const csv = {}; for (const [n, t] of Object.entries(DATA.tables)) csv[n] = toCSV(t);
      py.globals.set('_CSV', py.toPy(csv)); py.globals.set('_PARSE', py.toPy(DATA.parseDates));
      py.globals.set('_CHK', PY_CHK);
      py.runPython(PY_BOOT);
      return py;
    })();
    PY.catch(() => { PY = null; });
  }
  return PY;
}
const PKG_LABEL = { numpy: 'NumPy', pandas: 'pandas', scipy: 'SciPy', 'scikit-learn': 'scikit-learn', matplotlib: 'matplotlib', statsmodels: 'statsmodels', xgboost: 'XGBoost', lightgbm: 'LightGBM', sqlite3: 'sqlite3' };
async function ensurePkgs(py, pkgs, status) {
  const need = pkgs.filter((p) => !loadedPkgs.has(p));
  if (!need.length) return;
  status('Загружаю ' + need.map((p) => PKG_LABEL[p] || p).join(', ') + ' (один раз за сессию, может занять до минуты)…');
  await py.loadPackage(need);
  need.forEach((p) => loadedPkgs.add(p));
}
async function runPython(task, code, status, runOnly) {
  const py = await getPy(status);
  const pkgs = (task.pkgs || []).slice();
  if (task.data && task.data.length && !pkgs.includes('pandas')) pkgs.push('pandas');
  if (pkgs.includes('statsmodels') && !pkgs.includes('pandas')) pkgs.push('pandas');
  await ensurePkgs(py, pkgs, status);
  status('Выполняю…');
  let imp = '';
  if (pkgs.includes('matplotlib')) imp += 'import matplotlib\nmatplotlib.use("Agg")\nimport matplotlib.pyplot as plt\n';
  if (pkgs.includes('pandas')) imp += 'import numpy as np\nimport pandas as pd\n'; else if (pkgs.includes('numpy') || pkgs.includes('scipy') || pkgs.includes('scikit-learn')) imp += 'import numpy as np\n';
  const setup = imp + (task.data || []).map((n) => `${n} = _load('${n}')`).join('\n') + '\n' + (task.setup || '');
  const fn = py.globals.get('_run');
  const checks = runOnly ? [] : task.check || [];
  const r = fn(code, setup, runOnly ? '' : task.test || '', task.solution || '', py.toPy(checks));
  const res = r.toJs(); r.destroy(); fn.destroy();
  return { status: res[0], stdout: res[1], msg: res[2], figs: Array.from(res[3] || []) };
}

/* ================= задачи ================= */
const TYPE_LABEL = { sql: ['SQL', 'sql'], py: ['Python', 'py'], choice: ['Тест', 'quiz'], multi: ['Тест', 'quiz'], num: ['Число', 'quiz'] };
const defaultCode = (t) => t.starter || (t.type === 'sql' ? '-- ваш запрос\nSELECT ' : '# ваш код\n');
function taskNo(t) { const m = t.lesson.mod; const n = modNum(m); return (n > 0 ? n : '·') + '.' + t.lesson.n + '.' + t.n; }
function taskCard(t) {
  const [lbl, cls] = TYPE_LABEL[t.type];
  const solved = !!Store.solved[t.key];
  let body = `<div class="task-text">${mdRender(t.text)}</div>`;
  if (t.type === 'sql' || t.type === 'py') {
    if (t.type === 'py' && t.data && t.data.length) body += `<div class="avail">Уже загружены DataFrame: ${t.data.map((d) => '<code>' + d + '</code>').join(', ')}; импортированы <code>pd</code> и <code>np</code></div>`;
    if (t.type === 'py' && t.check && t.check.length) body += `<div class="avail">Проверяется: ${t.check.map((c) => '<code>' + esc(c) + '</code>').join(', ')}</div>`;
    if (t.type === 'sql') body += `<div class="avail">Таблицы: ${(t.tables || ['users', 'orders', 'order_items', 'products', 'events', 'ab_test']).map((x) => '<code>' + x + '</code>').join(', ')} — <a href="#data">схема</a></div>`;
    const code = Store.code[t.key] != null ? Store.code[t.key] : defaultCode(t);
    body += `<textarea class="editor" id="ed-${t.key}" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Редактор кода">${esc(code)}</textarea>
      <div class="actions"><button class="btn primary" data-act="check">Проверить</button><button class="btn" data-act="run">${t.type === 'sql' ? 'Выполнить' : 'Запустить без проверки'}</button>
      ${t.hint ? '<button class="btn" data-act="hint">Подсказка</button>' : ''}${t.solution ? '<button class="btn" data-act="sol">Решение</button>' : ''}<button class="btn" data-act="reset">Сбросить</button><span class="kbd">Ctrl+Enter — проверить</span></div>`;
  } else if (t.type === 'choice' || t.type === 'multi') {
    const multi = t.type === 'multi';
    body += `<div class="opts">${t.options.map((o, i) => `<label class="opt"><input type="${multi ? 'checkbox' : 'radio'}" name="o-${t.key}" value="${i}"><span>${inline(o)}</span></label>`).join('')}</div>
      <div class="actions"><button class="btn primary" data-act="check">Ответить</button>${t.hint ? '<button class="btn" data-act="hint">Подсказка</button>' : ''}${t.explain ? '<button class="btn" data-act="sol">Разбор</button>' : ''}${multi ? '<span class="kbd">Несколько вариантов</span>' : ''}</div>`;
  } else if (t.type === 'num') {
    body += `<div class="actions"><input class="numin" inputmode="decimal" placeholder="Ваш ответ" aria-label="Числовой ответ"><button class="btn primary" data-act="check">Ответить</button>${t.hint ? '<button class="btn" data-act="hint">Подсказка</button>' : ''}${t.explain ? '<button class="btn" data-act="sol">Разбор</button>' : ''}</div>`;
  }
  body += `<div class="extra"></div><div class="out" aria-live="polite"></div>`;
  return `<article class="task ${solved ? 'is-solved' : ''}" id="t-${t.key}" data-key="${t.key}">
    <div class="task-head"><span class="no">${taskNo(t)}</span><span class="tt">${esc(t.title)}</span><span class="chip ${cls}">${lbl}</span>${solved ? '<span class="chip solved">Решено</span>' : ''}</div>
    <div class="task-body">${body}</div></article>`;
}
function markSolved(t, card) {
  if (t.sandbox) return;
  Store.markSolved(t.key);
  card.classList.add('is-solved');
  if (!card.querySelector('.chip.solved')) card.querySelector('.task-head').insertAdjacentHTML('beforeend', '<span class="chip solved">Решено</span>');
  renderSide(t.lesson.key);
  const h = document.querySelector('.tasks-h span'); if (h) h.textContent = `${solvedIn(t.lesson.tasks)} из ${t.lesson.tasks.length} решено`;
}
function showExtra(card, title, html) { card.querySelector('.extra').innerHTML = `<div class="reveal"><b>${title}</b>${html}</div>`; }

async function checkTask(t, card, runOnly) {
  if (t.sandbox) runOnly = true;
  const out = card.querySelector('.out');
  const btns = card.querySelectorAll('.actions .btn'); btns.forEach((b) => (b.disabled = true));
  const status = (m) => { out.innerHTML = `<div class="verdict info">${esc(m)}</div>`; };
  try {
    if (t.type === 'sql') {
      const code = card.querySelector('.editor').value;
      const db = await getDB();
      let user;
      try { user = runSQL(db, code); } catch (e) { out.innerHTML = `<div class="verdict bad">Ошибка SQL</div><pre class="stdout err">${esc(e.message)}</pre>`; return; }
      let html = '';
      if (!runOnly) {
        const err = compareSQL(user, runSQL(db, t.solution), !!t.ordered);
        if (err) html += `<div class="verdict bad">Пока не то. ${err}</div>`;
        else { html += `<div class="verdict ok">Верно! Результат совпал с эталоном.</div>`; markSolved(t, card); }
      }
      out.innerHTML = html + tableHTML(user);
    } else if (t.type === 'py') {
      const code = card.querySelector('.editor').value;
      const r = await runPython(t, code, status, runOnly);
      let html = '';
      if (r.status === 'pass') { html += '<div class="verdict ok">Верно! Все проверки пройдены.</div>'; markSolved(t, card); }
      else if (r.status === 'fail') html += `<div class="verdict bad">Пока не то. ${esc(r.msg)}</div>`;
      else if (r.status === 'error') html += `<div class="verdict bad">Код упал с ошибкой</div>`;
      else html += '<div class="verdict info">Код выполнен.</div>';
      if (r.stdout) html += `<pre class="stdout">${esc(r.stdout.slice(0, 20000))}</pre>`;
      if (r.status === 'error') html += `<pre class="stdout err">${esc(r.msg)}</pre>`;
      if (r.figs.length) html += '<div class="plots">' + r.figs.map((b) => `<img alt="График из вашего кода" src="data:image/png;base64,${b}">`).join('') + '</div>';
      out.innerHTML = html;
    } else if (t.type === 'choice' || t.type === 'multi') {
      const picked = [...card.querySelectorAll('input:checked')].map((i) => +i.value);
      if (!picked.length) { out.innerHTML = '<div class="verdict info">Выберите вариант ответа.</div>'; return; }
      const ok = picked.slice().sort().join(',') === t.answer.slice().sort().join(',');
      card.querySelectorAll('.opt').forEach((o, i) => { o.classList.remove('right', 'wrong'); if (picked.includes(i)) o.classList.add(t.answer.includes(i) ? 'right' : 'wrong'); });
      if (ok) { out.innerHTML = '<div class="verdict ok">Верно!</div>'; markSolved(t, card); if (t.explain) showExtra(card, 'Разбор', mdRender(t.explain)); }
      else out.innerHTML = `<div class="verdict bad">Неверно${t.type === 'multi' ? ': отмечены не все правильные варианты или есть лишние' : ''}. Попробуйте ещё раз.</div>`;
    } else if (t.type === 'num') {
      const v = card.querySelector('.numin').value.replace(',', '.').replace(/\s/g, '');
      if (!v || isNaN(Number(v))) { out.innerHTML = '<div class="verdict info">Введите число (дробную часть можно через точку или запятую).</div>'; return; }
      const x = Number(v), tol = t.tol != null ? t.tol : 1e-3;
      if (Math.abs(x - t.answer) <= tol * Math.max(1, Math.abs(t.answer))) { out.innerHTML = '<div class="verdict ok">Верно!</div>'; markSolved(t, card); if (t.explain) showExtra(card, 'Разбор', mdRender(t.explain)); }
      else out.innerHTML = '<div class="verdict bad">Неверно. Проверьте вычисления и округление.</div>';
    }
  } catch (e) {
    out.innerHTML = `<div class="verdict bad">Не удалось выполнить: ${esc(e.message || e)}</div>`;
  } finally { btns.forEach((b) => (b.disabled = false)); }
}
function bindTask(card, T = TASKS) {
  const t = T[card.dataset.key];
  const ed = card.querySelector('.editor');
  if (ed) {
    ed.addEventListener('input', () => Store.saveCode(t.key, ed.value));
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); checkTask(t, card, false); return; }
      if (e.key === 'Tab') {
        e.preventDefault(); const s = ed.selectionStart, en = ed.selectionEnd, v = ed.value;
        if (s === en && !e.shiftKey) ed.setRangeText('    ', s, en, 'end');
        else { const ls0 = v.lastIndexOf('\n', s - 1) + 1; const block = v.slice(ls0, en); ed.setRangeText(e.shiftKey ? block.replace(/^ {1,4}/gm, '') : block.replace(/^/gm, '    '), ls0, en, 'select'); }
        ed.dispatchEvent(new Event('input'));
      }
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const s = ed.selectionStart, v = ed.value; const cur = v.slice(v.lastIndexOf('\n', s - 1) + 1, s);
        let ind = cur.match(/^ */)[0]; if (/:\s*$/.test(cur) && t.type === 'py') ind += '    ';
        e.preventDefault(); ed.setRangeText('\n' + ind, s, ed.selectionEnd, 'end'); ed.dispatchEvent(new Event('input'));
      }
    });
  }
  card.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.act;
    if (a === 'check') checkTask(t, card, false);
    else if (a === 'run') checkTask(t, card, true);
    else if (a === 'hint') showExtra(card, 'Подсказка', mdRender(t.hint));
    else if (a === 'sol') {
      if (t.type === 'sql' || t.type === 'py') showExtra(card, 'Эталонное решение', '<pre class="code">' + hl(t.solution.trim(), t.type) + '</pre>' + (t.explain ? mdRender(t.explain) : ''));
      else showExtra(card, 'Разбор', mdRender(t.explain));
    } else if (a === 'reset') {
      ed.value = defaultCode(t); Store.saveCode(t.key, null);
      card.querySelector('.out').innerHTML = ''; card.querySelector('.extra').innerHTML = '';
    }
  }));
}

/* ================= виды ================= */
function trackOf(lessonKey) {
  const l = LESSONS[lessonKey]; if (!l) return track;
  if (track.modules.includes(l.mod.id)) return track;
  return TR.find((t) => t.modules.includes(l.mod.id)) || track;
}
function setTrack(t) { track = t; ls.set('pb-track', t.id); }
function renderSide(activeKey) {
  const side = $('#side');
  const openMod = activeKey && LESSONS[activeKey] ? LESSONS[activeKey].mod.id : null;
  side.innerHTML = `<div class="track-switch"><select id="trackSel" aria-label="Трек">${TR.map((t) => `<option value="${t.id}" ${t.id === track.id ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select></div><h3>Программа</h3>` +
    track.mods.map((m) => {
      const mt = m.lessons.flatMap((l) => l.tasks); const s = solvedIn(mt);
      return `<div class="mod ${s === mt.length && mt.length ? 'done' : ''}">
      <button aria-expanded="${openMod === m.id}"><span class="mod-n">${String(modNum(m)).padStart(2, '0')}</span><span>${esc(m.title)}</span><span class="mod-c">${s}/${mt.length}</span></button>
      <ul ${openMod === m.id ? '' : 'hidden'}>${m.lessons.map((l) => {
        const ls1 = solvedIn(l.tasks); const dot = l.tasks.length && ls1 === l.tasks.length ? 'full' : ls1 ? 'half' : '';
        return `<li><a href="#${l.key}" class="${l.key === activeKey ? 'on' : ''}"><span class="dot ${dot}"></span><span>${esc(l.title)}</span></a></li>`;
      }).join('')}</ul></div>`;
    }).join('');
  side.querySelectorAll('.mod > button').forEach((b) => b.addEventListener('click', () => { const ul = b.nextElementSibling; ul.hidden = !ul.hidden; b.setAttribute('aria-expanded', String(!ul.hidden)); }));
  $('#trackSel').onchange = (e) => { setTrack(TR.find((t) => t.id === e.target.value)); location.hash = 'track-' + track.id; };
  const total = track.tasks.length, done = solvedIn(track.tasks);
  $('#progTxt').textContent = `${done} / ${total}`;
  $('#progBar').style.width = (total ? (100 * done) / total : 0) + '%';
}
let hideSolved = ls.get('pb-hide-solved', false);
function viewLesson(l) {
  const lt = l.tasks; const tl = track.lessons; const idx = tl.indexOf(l);
  const prev = tl[idx - 1], next = tl[idx + 1];
  $('#view').innerHTML = `<div class="crumb">${esc(track.title)} · модуль ${modNum(l.mod)} «${esc(l.mod.title)}» · урок ${l.n} из ${l.mod.lessons.length}</div>
    <h1>${esc(l.title)}</h1><div class="md">${mdRender(l.theory)}</div>
    ${lt.length ? `<div class="tasks-h"><h2>Практика</h2><span>${solvedIn(lt)} из ${lt.length} решено</span></div>
      <div class="filter-row" style="margin-bottom:14px"><button class="btn ${hideSolved ? '' : 'on'}" id="fAll">Все задачи</button><button class="btn ${hideSolved ? 'on' : ''}" id="fOpen">Только нерешённые</button></div>
      <div id="taskList">${lt.map(taskCard).join('')}</div>` : ''}
    <nav class="pager">${prev ? `<a href="#${prev.key}"><small>← Назад</small>${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="next" href="#${next.key}"><small>Дальше →</small>${esc(next.title)}</a>` : ''}</nav>`;
  document.querySelectorAll('.task').forEach((c) => bindTask(c));
  const applyFilter = () => document.querySelectorAll('.task').forEach((c) => c.classList.toggle('hide-solved', hideSolved));
  applyFilter();
  if ($('#fAll')) {
    $('#fAll').onclick = () => { hideSolved = false; ls.set('pb-hide-solved', false); $('#fAll').classList.add('on'); $('#fOpen').classList.remove('on'); applyFilter(); };
    $('#fOpen').onclick = () => { hideSolved = true; ls.set('pb-hide-solved', true); $('#fOpen').classList.add('on'); $('#fAll').classList.remove('on'); applyFilter(); };
  }
}
function viewHome() {
  const tot = ALL.length;
  $('#view').innerHTML = `<section class="hero"><div class="eyebrow">${TR.length} трека · ${tot} задач с автопроверкой</div>
    <h1>Поиск батрачки</h1>
    <p class="lead">Тренажёр для подготовки к работе: теория и задачи с проверкой прямо в браузере. SQL выполняется в SQLite, Python — в настоящем интерпретаторе с pandas, SciPy, statsmodels, scikit-learn и matplotlib. Выберите трек — общие модули (Python, SQL, статистика) засчитываются во всех.</p></section>
    <div class="tracks">${TR.map((t) => { const s = solvedIn(t.tasks); return `<a class="track-card" href="#track-${t.id}"><span class="tk">Трек</span><b>${esc(t.title)}</b><p>${esc(t.short)}</p><div class="meta">${plural(t.mods.length, PM)} · ${plural(t.tasks.length, PT)} · решено ${s}</div><div class="mini"><i style="width:${t.tasks.length ? (100 * s) / t.tasks.length : 0}%"></i></div></a>`; }).join('')}</div>
    <div class="md">${mdRender(md`
> **Как работать.** ${Store.mode === 'firebase' ? 'Вы вошли в аккаунт: решённые задачи сохраняются в облаке и видны с любого устройства, черновики кода хранятся в этом браузере.' : 'Сейчас прогресс хранится только в этом браузере.'} Первый запуск Python загружает интерпретатор (≈14 МБ), библиотеки подгружаются при первой задаче, где нужны.
`)}</div>`;
}
function viewTrack(t) {
  setTrack(t);
  const M = t.market || {};
  const s = solvedIn(t.tasks);
  const firstOpen = t.lessons.find((l) => l.tasks.some((x) => !Store.solved[x.key])) || t.lessons[0];
  $('#view').innerHTML = `<section class="hero"><div class="eyebrow">Трек · ${plural(t.mods.length, PM)} · ${plural(t.lessons.length, PL)} · ${plural(t.tasks.length, PT)}</div>
    <h1>${esc(t.title)}</h1><p class="lead">${esc(t.short)}</p>
    <div class="stats"><div><b>${s}</b><span>решено</span></div><div><b>${t.tasks.filter((x) => x.type === 'sql').length}</b><span>SQL</span></div><div><b>${t.tasks.filter((x) => x.type === 'py').length}</b><span>Python</span></div><div><b>${t.tasks.filter((x) => !['sql', 'py'].includes(x.type)).length}</b><span>тестов и расчётов</span></div></div>
    <div class="actions" style="margin-top:14px"><a class="btn primary" href="#${firstOpen.key}" style="text-decoration:none">${s ? 'Продолжить' : 'Начать'}</a></div></section>
    <div class="md">${mdRender(M.intro || '')}</div>
    ${M.demand ? `<div class="demand">${M.demand.map((d) => `<div class="demand-row"><span>${esc(d[0])}</span><div class="track"><i style="width:${d[1]}%"></i></div><span class="lvl">${esc(d[2])}</span></div>`).join('')}</div>` : ''}
    <div class="md">${mdRender(M.after || '')}</div>
    <h2 style="font-family:var(--f-display);font-weight:500;font-size:21px;margin:34px 0 4px">Модули</h2>
    <div class="grid-mods">${t.mods.map((m) => { const mt = m.lessons.flatMap((l) => l.tasks); const ms = solvedIn(mt); return `<a class="card-mod" href="#${m.lessons[0].key}"><span class="n">Модуль ${String(modNum(m, t)).padStart(2, '0')} · ${m.lessons.length} ур. · ${plural(mt.length, PT)}</span><b>${esc(m.title)}</b><p>${esc(m.short)}</p><div class="mini"><i style="width:${mt.length ? (100 * ms) / mt.length : 0}%"></i></div></a>`; }).join('')}</div>
    ${M.plan ? `<h2 style="font-family:var(--f-display);font-weight:500;font-size:21px;margin:34px 0 10px">План</h2><div class="plan">${M.plan.map((p) => `<div><b>${esc(p[0])}</b><span>${inline(p[1])}</span></div>`).join('')}</div>` : ''}
    <div class="md">${mdRender(M.sources_md || '')}</div>`;
}
const SANDBOX = {
  'sandbox-sql': { key: 'sandbox-sql', sandbox: true, type: 'sql', title: 'SQL-песочница', text: 'Пишите любые запросы ко всем таблицам. «Проверить» и «Выполнить» просто выполняют запрос.', starter: "SELECT city, COUNT(*) AS users\nFROM users\nGROUP BY city\nORDER BY users DESC;", solution: '', n: 1, tables: Object.keys(DATA.tables), lesson: { key: 'data', n: 'S', mod: { id: 'x' }, tasks: [] } },
  'sandbox-py': { key: 'sandbox-py', sandbox: true, type: 'py', title: 'Python-песочница', text: 'Все таблицы уже загружены как DataFrame. Доступны numpy, pandas, scipy, matplotlib.', data: Object.keys(DATA.tables), pkgs: ['pandas', 'scipy', 'matplotlib'], starter: "print(orders.head())\norders.groupby('order_date')['amount'].sum().plot(figsize=(9, 3), title='Выручка по дням')", solution: '', n: 2, lesson: { key: 'data', n: 'S', mod: { id: 'x' }, tasks: [] } },
};
function viewData() {
  const T = DATA.tables;
  $('#view').innerHTML = `<div class="crumb">Справочник</div><h1>Данные и песочница</h1>
    <div class="md">${mdRender(md`
Задачи используют два вымышленных набора данных. **«Корзинка»** — сервис доставки продуктов, январь–июль 2025 (таблицы без префикса). **«Надёжный полис»** — страховая компания: договоры ОСАГО и КАСКО 2021–2024, убытки и выплаты на отчётную дату 31.12.2024 (таблицы с префиксом ‹ins_›). В Python-задачах те же таблицы приходят как pandas DataFrame, колонки с датами уже в ‹datetime64›.
`)}</div>
    <div class="schema">${Object.entries(T).map(([n, t]) => `<div class="schema-t"><h3>${n} <span style="color:var(--muted);font-weight:400;font-size:13px">· ${t.rows.length.toLocaleString('ru-RU')} строк</span></h3><p>${esc(t.desc)}</p><div class="cols">${t.cols.map((c, i) => `<span>${c}<em>${t.types[i].toLowerCase()}</em></span>`).join('')}</div></div>`).join('')}</div>
    <div class="tasks-h"><h2>Песочницы</h2><span>без проверки</span></div>
    ${taskCard(SANDBOX['sandbox-sql'])}${taskCard(SANDBOX['sandbox-py'])}`;
  document.querySelectorAll('.task').forEach((c) => bindTask(c, SANDBOX));
}
async function viewRating() {
  $('#view').innerHTML = `<div class="crumb">Сообщество</div><h1>Рейтинг</h1><div id="rt" class="loading-box">Загружаю…</div>`;
  if (!FB || Store.mode !== 'firebase') { $('#rt').outerHTML = `<div class="md">${mdRender(FB ? 'Войдите в аккаунт, чтобы попасть в рейтинг и видеть прогресс друзей.' : 'Рейтинг появится, когда на сайте будет включён вход через Firebase (см. SETUP.md).')}</div>`; return; }
  try {
    const snap = await FB.fs.collection('users').orderBy('count', 'desc').limit(100).get();
    const rows = snap.docs.map((d, i) => ({ i: i + 1, id: d.id, name: d.data().name || 'Без имени', count: d.data().count || 0 }));
    const box = document.createElement('div'); box.className = 'rating';
    rows.forEach((r) => { const el = document.createElement('div'); if (r.id === Store.uid) el.className = 'me'; el.innerHTML = `<span>${r.i}</span><span></span><span style="text-align:right">${r.count} задач</span>`; el.children[1].textContent = r.name; box.appendChild(el); });
    $('#rt').replaceWith(box);
  } catch (e) { $('#rt').textContent = 'Не удалось загрузить рейтинг: ' + (e.message || e); }
}
async function viewSelftest(filter) {
  $('#view').innerHTML = '<h1>Самопроверка эталонов</h1><p id="st-prog"></p><div id="st"></div>';
  const box = $('#st'); let bad = 0, n = 0;
  const list = ALL.filter((t) => !filter || t.key.startsWith(filter));
  for (const t of list) {
    let res = '';
    try {
      if (t.type === 'sql') { const r = runSQL(await getDB(), t.solution); if (!r.values.length) { bad++; res = 'ПУСТО'; } }
      else if (t.type === 'py') { const r = await runPython(t, t.solution, () => {}); if (r.status !== 'pass') { bad++; res = 'FAIL ' + r.status + ': ' + r.msg; } }
      else if (t.type === 'num') { if (typeof t.answer !== 'number' || !isFinite(t.answer)) { bad++; res = 'BAD ANSWER'; } }
      else if (!t.answer || !t.answer.length || t.answer.some((a) => a >= t.options.length)) { bad++; res = 'BAD CHOICE'; }
    } catch (e) { res = 'ERR ' + e.message; bad++; }
    n++; $('#st-prog').textContent = `${n} / ${list.length}, проблем: ${bad}`;
    if (res) box.insertAdjacentHTML('beforeend', `<div class="st-row"><span>${t.key}</span><span>${esc(res)}</span></div>`);
  }
  box.insertAdjacentHTML('afterbegin', `<p id="st-done"><b>Готово. Проверено ${n}, проблем: ${bad}</b></p>`);
}
function route() {
  const h = decodeURIComponent(location.hash.replace('#', '')) || 'home';
  $('#side').classList.remove('open');
  ['Home', 'Data', 'Rating'].forEach((x) => $('#lnk' + x).classList.remove('on'));
  if (LESSONS[h]) { setTrack(trackOf(h)); renderSide(h); viewLesson(LESSONS[h]); }
  else if (h.startsWith('track-') && TR.find((t) => t.id === h.slice(6))) { viewTrack(TR.find((t) => t.id === h.slice(6))); renderSide(null); }
  else if (h === 'data') { renderSide(null); viewData(); $('#lnkData').classList.add('on'); }
  else if (h === 'rating') { renderSide(null); viewRating(); $('#lnkRating').classList.add('on'); }
  else if (h.startsWith('selftest')) { renderSide(null); viewSelftest(h.split(':')[1]); }
  else { renderSide(null); viewHome(); $('#lnkHome').classList.add('on'); }
  window.scrollTo(0, 0);
}
$('#menuBtn').addEventListener('click', () => $('#side').classList.toggle('open'));
window.addEventListener('hashchange', route);
window.__pb = { TASKS, LESSONS, runPython, getDB, runSQL };

if (window.FIREBASE_CONFIG) {
  $('#view').innerHTML = '<div class="loading-box">Подключаюсь к аккаунту…</div>';
  initFirebase().catch((e) => { toast('Вход недоступен: ' + (e.message || e) + '. Прогресс сохранится в браузере.'); showApp(); route(); });
} else { renderUserChip(); route(); }
})();
