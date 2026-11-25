// Помощники для генераторов задач: детерминированный ГСЧ, статистика, форматирование.
window.G = (function () {
  function rng(seed) {
    let s = typeof seed === 'string' ? [...seed].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7) : seed;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function erf(x) {
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const normCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  function normPpf(p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425;
    let q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function comb(n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); }
  const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
  const r = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;
  const nf = (x) => (Number.isInteger(x) ? x.toLocaleString('ru-RU') : String(x));
  // Сгенерировать n вариантов задачи: fn(R, i) -> task. Варианты стабильны между загрузками.
  function variants(name, n, fn) {
    const R = rng(name);
    const out = [];
    const seen = new Set();
    let guard = 0;
    while (out.length < n && guard < n * 20) {
      guard++;
      const t = fn(R, out.length);
      const sig = t.title + '|' + t.text;
      if (seen.has(sig)) continue;
      seen.add(sig); out.push(t);
    }
    return out;
  }
  const pick = (R, a) => a[Math.floor(R() * a.length)];
  const int = (R, lo, hi) => lo + Math.floor(R() * (hi - lo + 1));
  const sample = (R, a, k) => { const c = a.slice(); const o = []; while (o.length < k && c.length) o.push(c.splice(Math.floor(R() * c.length), 1)[0]); return o; };
  return { rng, normCdf, normPpf, comb, fact, r, nf, variants, pick, int, sample };
})();

// Короткие конструкторы задач для контент-файлов.
window.TK = {
  py: (title, text, solution, check, o = {}) => Object.assign({ type: 'py', title, text, solution, check }, o),
  pyt: (title, text, solution, test, o = {}) => Object.assign({ type: 'py', title, text, solution, test }, o),
  sql: (title, text, solution, ordered = false, o = {}) => Object.assign({ type: 'sql', title, text, solution, ordered }, o),
  ch: (title, text, options, answer, explain, o = {}) => Object.assign({ type: Array.isArray(answer) && answer.length > 1 ? 'multi' : 'choice', title, text, options, answer: Array.isArray(answer) ? answer : [answer], explain }, o),
  mu: (title, text, options, answer, explain, o = {}) => Object.assign({ type: 'multi', title, text, options, answer, explain }, o),
  num: (title, text, answer, tol, explain, o = {}) => Object.assign({ type: 'num', title, text, answer, tol, explain }, o),
};
