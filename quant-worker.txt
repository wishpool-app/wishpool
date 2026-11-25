/**
 * 币安量化 · 手机版引擎（Cloudflare Worker 单文件）
 * ---------------------------------------------------------------
 * 为什么放云端：手机跑不了 Python 程序。这个文件丢进 Cloudflare
 * 免费 Worker，24 小时在线，不用电脑、不用开服务器、不花钱。
 *
 * 它干三件事：
 *   1. 每 15 分钟（K 线收盘后 2 分钟）拉行情、算指标、判信号
 *   2. 有信号 → 推微信（PushPlus）
 *   3. 可选：自动在币安下单（默认关闭，DRY-RUN 只推不下）
 *
 * 环境变量（在 Cloudflare 后台 Settings → Variables 里加）：
 *   PUSHPLUS_TOKEN   必填，微信推送的 token（pushplus.plus 微信登录拿）
 *   BINANCE_KEY      选填，币安 API Key（只勾「允许合约」+「允许读取」）
 *   BINANCE_SECRET   选填，币安 Secret
 *   LIVE             选填，填 1 才真下单；不填=只推信号
 *   EQUITY           选填，账户权益 USDT；查不到余额时用这个算仓位，默认 300
 *   SYMBOLS          选填，默认 BTCUSDT,SOLUSDT
 *   RISK_PCT         选填，单笔风险占权益比例，默认 0.02（2%）
 *
 * 访问域名可以看到迷你状态页；/api 是 JSON；/test 发一条测试推送。
 */

// ============ 策略参数（和电脑版 quant/config.py 一一对应，勿随意改） ============
const P = {
  tf: '15m',
  risk_pct: 0.02,
  leverage: 5,
  max_margin_pct: 0.40,
  stop_atr_mult: 1.5,
  tp1_r: 1.5,
  tp1_close_pct: 0.5,
  adx_min: 20,
  atr_pct_min: 0.0015,
  vol_ratio_min: 0.9,
  daily_ema: 50,
  fee_roundtrip: 0.0012,
};

const BN = 'https://fapi.binance.com';
const GATE = 'https://api.gateio.ws/api/v4/futures/usdt';

// ============ 指标（逐行对照 Python 版，全部只用已收盘数据） ============
const ewm = (v, alpha) => {
  const out = new Array(v.length);
  let e = v[0];
  out[0] = e;
  for (let i = 1; i < v.length; i++) {
    e = alpha * v[i] + (1 - alpha) * e;
    out[i] = e;
  }
  return out;
};

function trSeries(b) {
  const out = new Array(b.length);
  out[0] = b[0].h - b[0].l;
  for (let i = 1; i < b.length; i++) {
    const pc = b[i - 1].c;
    out[i] = Math.max(b[i].h - b[i].l, Math.abs(b[i].h - pc), Math.abs(b[i].l - pc));
  }
  return out;
}

function adxSeries(b, n = 14) {
  const pdm = [0], mdm = [0];
  for (let i = 1; i < b.length; i++) {
    const up = b[i].h - b[i - 1].h;
    const dn = b[i - 1].l - b[i].l;
    pdm.push(up > dn && up > 0 ? up : 0);
    mdm.push(dn > up && dn > 0 ? dn : 0);
  }
  const a = ewm(trSeries(b), 1 / n);
  const p = ewm(pdm, 1 / n);
  const m = ewm(mdm, 1 / n);
  const dx = b.map((_, i) => {
    const pdi = (100 * p[i]) / a[i];
    const mdi = (100 * m[i]) / a[i];
    const den = pdi + mdi;
    return den === 0 ? 0 : (100 * Math.abs(pdi - mdi)) / den;
  });
  return ewm(dx, 1 / n);
}

function supertrendDir(b, period = 10, mult = 3) {
  const atr = ewm(trSeries(b), 1 / period);
  const n = b.length;
  const up = new Array(n), lo = new Array(n), d = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    const hl2 = (b[i].h + b[i].l) / 2;
    up[i] = hl2 + mult * atr[i];
    lo[i] = hl2 - mult * atr[i];
  }
  for (let i = 1; i < n; i++) {
    if (b[i].c > up[i - 1]) d[i] = 1;
    else if (b[i].c < lo[i - 1]) d[i] = -1;
    else {
      d[i] = d[i - 1];
      if (d[i] === 1 && lo[i] < lo[i - 1]) lo[i] = lo[i - 1];
      if (d[i] === -1 && up[i] > up[i - 1]) up[i] = up[i - 1];
    }
  }
  for (let i = 0; i < period; i++) d[i] = 0;
  return d;
}

// 日线 EMA：Python 用的是 ewm(alpha=1/50)，不是 2/(n+1)，照抄才和回测一致
function dailyUp(daily, span = 50) {
  if (daily.length < span + 5) return null;
  const close = daily.map((x) => x.c);
  const e = ewm(close, 1 / span);
  const last = close.length - 1;
  return close[last] > e[last];
}

/** 把 K 线数组算成一整行指标，返回最后一根已收盘 bar 的全套值 */
function compute(bars, daily) {
  const n = bars.length;
  const atr = ewm(trSeries(bars), 1 / 14);
  const adx = adxSeries(bars);
  const d1 = supertrendDir(bars, 10, 3);
  const ema20 = ewm(bars.map((x) => x.c), 2 / 21);
  const volMa = new Array(n).fill(null);
  for (let i = 19; i < n; i++) {
    let s = 0;
    for (let k = i - 19; k <= i; k++) s += bars[k].v;
    volMa[i] = s / 20;
  }
  const i = n - 1;
  const b = bars[i];
  return {
    t: b.t,
    close: b.c,
    open: b.o,
    high: b.h,
    low: b.l,
    atr: atr[i],
    adx: adx[i],
    d1: d1[i],
    ema20: ema20[i],
    atr_pct: atr[i] / b.c,
    vol_ratio: volMa[i] ? b.v / volMa[i] : 0,
    daily_up: dailyUp(daily, P.daily_ema),
  };
}

/** 和 Python signal_of() 完全一致 */
function signalOf(x) {
  if (x.daily_up === true && x.d1 === 1 && x.adx >= P.adx_min && x.atr_pct >= P.atr_pct_min &&
      x.vol_ratio > P.vol_ratio_min && x.low <= x.ema20 && x.close > x.ema20 && x.close > x.open) return 'long';
  if (x.daily_up === false && x.d1 === -1 && x.adx >= P.adx_min && x.atr_pct >= P.atr_pct_min &&
      x.vol_ratio > P.vol_ratio_min && x.high >= x.ema20 && x.close < x.ema20 && x.close < x.open) return 'short';
  return null;
}

// ============ 行情：优先币安，被墙/451 自动降级 gate.io ============
async function getBars(symbol, tf) {
  const pair = symbol.replace('USDT', '');
  try {
    const r = await fetch(`${BN}/fapi/v1/klines?symbol=${symbol}&interval=${tf}&limit=500`);
    if (r.ok) {
      const j = await r.json();
      const bars = j.map((k) => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }));
      return { bars: bars.slice(0, -1), src: 'binance' };
    }
  } catch (e) { /* 落到 gate */ }
  const r = await fetch(`${GATE}/candlesticks?contract=${pair}_USDT&interval=${tf}&limit=500`);
  if (!r.ok) throw new Error(`行情源全挂 ${symbol} ${r.status}`);
  const j = await r.json();
  const bars = j.map((k) => ({ t: k.t * 1000, o: +k.o, h: +k.h, l: +k.l, c: +k.c, v: +k.v }));
  return { bars: bars.slice(0, -1), src: 'gate' };
}

async function getDaily(symbol) {
  const pair = symbol.replace('USDT', '');
  try {
    const r = await fetch(`${BN}/fapi/v1/klines?symbol=${symbol}&interval=1d&limit=200`);
    if (r.ok) {
      const j = await r.json();
      return j.map((k) => ({ t: k[0], c: +k[4] })).slice(0, -1);
    }
  } catch (e) { /* 忽略 */ }
  const r = await fetch(`${GATE}/candlesticks?contract=${pair}_USDT&interval=1d&limit=200`);
  if (!r.ok) return [];
  const j = await r.json();
  return j.map((k) => ({ t: k.t * 1000, c: +k.c })).slice(0, -1);
}

// ============ 币安签名接口 ============
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function bn(env, path, params = {}, method = 'GET') {
  if (!env.BINANCE_KEY || !env.BINANCE_SECRET) throw new Error('未配置币安密钥');
  const qs = new URLSearchParams({ ...params, timestamp: Date.now(), recvWindow: 5000 }).toString();
  const sig = await hmac(env.BINANCE_SECRET, qs);
  const r = await fetch(`${BN}${path}?${qs}&signature=${sig}`, {
    method,
    headers: { 'X-MBX-APIKEY': env.BINANCE_KEY },
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`币安 ${path} ${r.status} ${txt.slice(0, 120)}`);
  return JSON.parse(txt);
}

async function equityOf(env) {
  const fallback = parseFloat(env.EQUITY || '300');
  // EQUITY 一旦设定，就是「策略专用资金」：仓位只按这个数算，不碰账户里的其他钱
  if (parseFloat(env.EQUITY || '0') > 0) return { eq: fallback, src: '设定值' };
  if (!env.BINANCE_KEY) return { eq: fallback, src: '设定值' };
  try {
    const b = await bn(env, '/fapi/v2/balance');
    const u = b.find((x) => x.asset === 'USDT');
    return { eq: parseFloat(u.availableBalance || u.balance) || fallback, src: '币安实时' };
  } catch (e) {
    return { eq: fallback, src: '设定值（余额读取失败）' };
  }
}

async function positionOf(env, symbol) {
  if (!env.BINANCE_KEY) return null;
  try {
    const r = await bn(env, '/fapi/v2/positionRisk', { symbol });
    const p = r.find((x) => x.symbol === symbol);
    const amt = parseFloat(p?.positionAmt || 0);
    return amt === 0 ? null : { amt, entry: parseFloat(p.entryPrice) };
  } catch (e) {
    return null;
  }
}

const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

// 交易所精度：数量步长/最小名义/价格步长，不取整会被币安直接拒单
const F = {};
async function symFilter(symbol) {
  if (F[symbol]) return F[symbol];
  let out = { step: 0.001, minQty: 0.001, minNotional: 5, tick: 0.01 };
  try {
    const r = await fetch(`${BN}/fapi/v1/exchangeInfo`);
    if (r.ok) {
      const j = await r.json();
      const s = j.symbols.find((x) => x.symbol === symbol);
      if (s) {
        const lot = s.filters.find((f) => f.filterType === 'LOT_SIZE');
        const mn = s.filters.find((f) => f.filterType === 'MIN_NOTIONAL');
        const pf = s.filters.find((f) => f.filterType === 'PRICE_FILTER');
        out = {
          step: parseFloat(lot?.stepSize || '0.001'),
          minQty: parseFloat(lot?.minQty || '0.001'),
          minNotional: parseFloat(mn?.notional || mn?.minNotional || '5'),
          tick: parseFloat(pf?.tickSize || '0.01'),
        };
      }
    }
  } catch (e) { /* 用默认值，宁可保守 */ }
  F[symbol] = out;
  return out;
}

const floorStep = (q, step) => {
  const d = step < 1 ? Math.min(8, Math.round(-Math.log10(step))) : 0;
  return +(Math.floor(q / step + 1e-9) * step).toFixed(d);
};
const snap = (p, tick) => {
  const d = tick < 1 ? Math.min(8, Math.round(-Math.log10(tick))) : 0;
  return +(Math.round(p / tick) * tick).toFixed(d);
};

// 同向信号去重：同一根 K 线/同一波行情只提醒一次（Cache 尽力而为，miss 也只多推一条）
async function seen(key, ms) {
  try {
    const c = caches.default;
    const hit = await c.match(key);
    if (hit) {
      const last = +(await hit.text());
      if (Date.now() - last < ms) return true;
    }
    return false;
  } catch (e) { return false; }
}
async function markSeen(key) {
  try {
    await caches.default.put(key, new Response(String(Date.now()), { headers: { 'Cache-Control': 'max-age=86400' } }));
  } catch (e) { /* 忽略 */ }
}

// ============ 下单（默认 DRY） ============
async function openPosition(env, symbol, side, qty, stop, tp1, live) {
  const buy = side === 'long';
  const plan = { symbol, side: buy ? 'BUY' : 'SELL', qty, stop, tp1 };
  if (!live) return { ok: true, dry: true, plan };
  try {
    await bn(env, '/fapi/v1/leverage', { symbol, leverage: P.leverage }, 'POST');
    await bn(env, '/fapi/v1/order', {
      symbol, side: plan.side, type: 'MARKET', quantity: plan.qty,
    }, 'POST');
    await bn(env, '/fapi/v1/order', {
      symbol, side: buy ? 'SELL' : 'BUY', type: 'STOP_MARKET',
      stopPrice: plan.stop, closePosition: 'true', workingType: 'MARK_PRICE',
    }, 'POST');
    return { ok: true, dry: false, plan };
  } catch (e) {
    // 自动下单失败也要让人知道：降级成「手动开仓指令」继续推送
    return { ok: false, dry: true, plan, err: String(e.message || e).slice(0, 140) };
  }
}

// ============ 推送 ============
async function push(env, title, content) {
  if (!env.PUSHPLUS_TOKEN) return false;
  const r = await fetch('https://www.pushplus.plus/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: env.PUSHPLUS_TOKEN, title, content, template: 'markdown' }),
  });
  return r.ok;
}

// ============ 主流程 ============
async function run(env, trigger) {
  const symbols = (env.SYMBOLS || 'BTCUSDT,SOLUSDT').split(',').map((s) => s.trim().toUpperCase());
  const live = String(env.LIVE || '') === '1';
  const riskPct = parseFloat(env.RISK_PCT || P.risk_pct);
  const { eq, src } = await equityOf(env);
  const rows = [], hits = [];

  for (const sym of symbols) {
    try {
      const { bars, src: feed } = await getBars(sym, P.tf);
      const daily = await getDaily(sym);
      if (bars.length < 60) throw new Error('K 线不足');
      const x = compute(bars, daily);
      const sig = signalOf(x);
      const pos = await positionOf(env, sym);

      const row = { sym, feed, price: x.close, d1: x.d1, adx: x.adx, atr_pct: x.atr_pct,
        vol_ratio: x.vol_ratio, daily_up: x.daily_up, sig, pos: pos ? pos.amt : 0,
        barTime: new Date(x.t + 15 * 60 * 1000).toISOString().slice(5, 16).replace('T', ' ') };

      if (sig && !pos) {
        const dupKey = `sig:${sym}:${sig}`;
        if (await seen(dupKey, 50 * 60 * 1000)) {
          row.dup = true;                       // 同一波行情已提醒过，不重复喊、不重复下单
        } else {
          const f = await symFilter(sym);
          const stopDist = P.stop_atr_mult * x.atr;
          const entry = x.close;
          const riskBudget = eq * riskPct;
          let qty = riskBudget / (stopDist + entry * P.fee_roundtrip);
          qty = Math.min(qty, (eq * P.leverage) / entry, (eq * P.max_margin_pct * P.leverage) / entry);
          qty = floorStep(qty, f.step);
          const stop = snap(sig === 'long' ? entry - stopDist : entry + stopDist, f.tick);
          const tp1 = snap(sig === 'long' ? entry + P.tp1_r * stopDist : entry - P.tp1_r * stopDist, f.tick);

          if (qty < f.minQty || qty * entry < Math.max(f.minNotional, 5)) {
            row.skip = `仓位过小 ${round(qty * entry, 1)}U（币安下限 ${f.minNotional}U）`;
          } else {
            const res = await openPosition(env, sym, sig, qty, stop, tp1, live);
            row.order = res;
            await markSeen(dupKey);
            hits.push({ sym, sig, entry, stop, tp1, qty, notional: qty * entry, ...res });
          }
        }
      }
      rows.push(row);
    } catch (e) {
      rows.push({ sym, err: String(e.message || e).slice(0, 120) });
    }
  }

  // 有信号才推（推送次数省着用，也不吵）
  for (const h of hits) {
    const emo = h.sig === 'long' ? '🟢 开多' : '🔴 开空';
    const status = h.ok && !h.dry
      ? `> 已自动下单，止损单挂在交易所端（断网也保护）。`
      : h.err
        ? `> ⚠️ 自动下单失败（${h.err}）\n> **请在币安 App 手动按上面参数开${h.sig === 'long' ? '多' : '空'}，并挂止损。**`
        : `> DRY-RUN：没有下单。要跟就在币安 App 按上面参数开${h.sig === 'long' ? '多' : '空'}，挂好止损。`;
    const md = [
      `### ${emo} ${h.sym}`,
      ``,
      `**入场** ${round(h.entry, 2)}`,
      `**止损** ${round(h.stop, 2)}（距 ${round((Math.abs(h.entry - h.stop) / h.entry) * 100, 2)}%）`,
      `**TP1** ${round(h.tp1, 2)} → 到价平一半，止损推保本`,
      `**仓位** ${round(h.qty, 3)} 张 ≈ ${round(h.notional, 0)} U 名义 · ${P.leverage}x`,
      ``,
      status,
      ``,
      `权益 ${round(eq, 1)}U（${src}）｜单笔风险 ${round(eq * riskPct, 1)}U`,
    ].join('\n');
    await push(env, `${h.sig === 'long' ? '开多' : '开空'} ${h.sym} @ ${round(h.entry, 2)}${h.ok && !h.dry ? '' : '（手动）'}`, md);
  }

  // 每天 UTC 00:05 推一次日报（北京时间 08:05）
  const now = new Date();
  if (trigger === 'cron' && now.getUTCHours() === 0 && now.getUTCMinutes() < 20) {
    const lines = rows.map((r) => r.err
      ? `- ${r.sym} 异常：${r.err}`
      : `- ${r.sym} ${r.price} ｜ ${r.d1 === 1 ? '趋势多' : '趋势空'} ｜ ADX ${round(r.adx, 1)} ｜ ATR ${round(r.atr_pct * 100, 2)}% ｜ 日线${r.daily_up ? '上' : '下'}方 ｜ ${r.sig ? '⭐' + r.sig : '无信号'}`);
    await push(env, '量化引擎日报', [`### 引擎日报 ${now.toISOString().slice(0, 10)}`, '',
      ...lines, '', `权益 ${round(eq, 1)}U ｜ 模式 ${live ? '自动下单' : '仅推信号(DRY)'}`].join('\n'));
  }

  return { ok: true, at: now.toISOString(), live, eq, src, rows, pushed: hits.length };
}

// ============ HTTP 入口：状态页 / api / test ============
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env, 'cron'));
  },

  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/test') {
      const ok = await push(env, '测试推送', '### 通了 ✅\n\n微信能收到这条，说明引擎已经接到你手机上了。');
      return new Response(ok ? '已发送，去看微信' : '没配 PUSHPLUS_TOKEN，或推送失败');
    }
    let data;
    try {
      data = await run(env, 'http');
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/api') {
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    const rows = data.rows.map((r) => r.err
      ? `<div class=card><b>${r.sym}</b><div class=bad>${r.err}</div></div>`
      : `<div class=card>
          <div class=head><b>${r.sym}</b><span class="${r.d1 === 1 ? 'up' : 'dn'}">${r.d1 === 1 ? '趋势多' : '趋势空'}</span></div>
          <div class=px>${r.price}</div>
          <div class=kv>ADX ${r.adx.toFixed(1)} · ATR ${(r.atr_pct * 100).toFixed(2)}% · 量比 ${r.vol_ratio.toFixed(2)}</div>
          <div class=kv>日线${r.daily_up ? '上方（只做多）' : '下方（只做空）'} · 持仓 ${r.pos}</div>
          <div class="${r.sig ? 'sig' : 'nosig'}">${r.sig ? '⭐ 信号：' + r.sig : '无信号'}</div>
        </div>`).join('');
    return new Response(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
<style>
body{background:#0b0e14;color:#e6edf3;font-family:-apple-system,sans-serif;margin:0;padding:16px}
h1{font-size:16px;font-weight:600;margin:0 0 4px}
.sub{color:#8b949e;font-size:12px;margin-bottom:14px}
.card{background:#131820;border:1px solid #1f2632;border-radius:12px;padding:14px;margin-bottom:10px}
.head{display:flex;justify-content:space-between;font-size:14px}
.px{font-size:26px;font-weight:600;margin:6px 0 4px;font-variant-numeric:tabular-nums}
.kv{color:#8b949e;font-size:12px;line-height:1.7}
.up{color:#ff4d4f}.dn{color:#3fb950}
.sig{color:#ffd666;font-size:13px;margin-top:8px;font-weight:600}
.nosig{color:#484f58;font-size:12px;margin-top:8px}
.bad{color:#ff7875;font-size:13px;margin-top:6px}
</style>
<h1>量化引擎 · 在线</h1>
<div class=sub>${data.at.slice(0, 16).replace('T', ' ')} UTC ｜ 权益 ${Math.round(data.eq)}U（${data.src}）｜ ${data.live ? '自动下单' : '仅推信号 DRY'}</div>
${rows}
<div class=sub style="margin-top:16px">信号条件：双 Supertrend + ADX≥20 + 日线 EMA50 同向 + 回踩 EMA20 收复 + 放量<br>15m 周期，每根 K 线收盘后 2 分钟算一次</div>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
