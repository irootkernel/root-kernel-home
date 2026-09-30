// core.js — shared primitives for the merged prototype. No three.js here: this module
// is on the first-paint path and must stay small.

export const qs = new URLSearchParams(location.search);
export const REDUCED = qs.has('rm') || matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- DOM ---------- */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export function mk(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

/* ---------- math & easing ---------- */
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const ease = {
  linear: (t) => t,
  out3: (t) => 1 - Math.pow(1 - t, 3),
  in3: (t) => t * t * t,
  io3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  ios: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  out5: (t) => 1 - Math.pow(1 - t, 5),
};

/* ---------- seeded randomness (?seed=N makes runs reproducible for QA) ---------- */
let seed = qs.has('seed') ? (parseInt(qs.get('seed'), 10) >>> 0) : null;
export function rnd() {
  if (seed === null) return Math.random();
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rand = (a, b) => a + (b - a) * rnd();

/* ---------- playback speed (fast-forward applies to AI steps only; the journey sets it) ---------- */
let speed = clamp(parseFloat(qs.get('speed')) || 1, 0.25, 8);
export const getSpeed = () => speed;
export function setSpeed(s) { speed = clamp(s, 0.25, 8); bus.emit('speed', speed); }

/* ---------- event bus ---------- */
const handlers = new Map();
export const bus = {
  on(ev, fn) {
    if (!handlers.has(ev)) handlers.set(ev, new Set());
    handlers.get(ev).add(fn);
    return () => handlers.get(ev)?.delete(fn);
  },
  off(ev, fn) { handlers.get(ev)?.delete(fn); },
  emit(ev, data) {
    for (const fn of [...(handlers.get(ev) || [])]) {
      try { fn(data); } catch (e) { console.error(e); }
    }
  },
};

/* ---------- cancellation: one Run per journey ---------- */
export const CANCEL = Symbol('cancel');
export const isCancel = (e) => e === CANCEL;

export class Run {
  #ac = new AbortController();
  #fin = [];
  constructor({ speed: fixed } = {}) { this.fixedSpeed = fixed ?? null; }
  get signal() { return this.#ac.signal; }
  get alive() { return !this.#ac.signal.aborted; }
  get speed() { return this.fixedSpeed ?? speed; }
  check() { if (!this.alive) throw CANCEL; }
  // Register cleanup (fly nodes, rings, labels, camera restore). Runs once, in reverse order.
  defer(fn) { this.#fin.push(fn); return fn; }
  abort() { if (this.alive) { this.#ac.abort(); this.done(); } }
  done() {
    for (const f of this.#fin.splice(0).reverse()) {
      try { f(); } catch (e) { console.error(e); }
    }
  }
  #onAbort(rej, extra) {
    const h = () => { extra?.(); rej(CANCEL); };
    this.#ac.signal.addEventListener('abort', h, { once: true });
    return () => this.#ac.signal.removeEventListener('abort', h);
  }
  // Waits `ms` of *visible* time, scaled by the current speed (fast-forward applies mid-wait).
  wait(ms) {
    return new Promise((res, rej) => {
      if (!this.alive) return rej(CANCEL);
      let left = ms;
      let last = performance.now();
      let timer = 0;
      const unhook = this.#onAbort(rej, () => clearTimeout(timer));
      const tick = () => {
        const now = performance.now();
        if (!document.hidden) left -= (now - last) * this.speed;
        last = now;
        if (left <= 0) { unhook(); res(); return; }
        timer = setTimeout(tick, Math.max(8, Math.min(50, left / this.speed)));
      };
      timer = setTimeout(tick, Math.max(8, Math.min(50, ms / this.speed)));
    });
  }
  // rAF tween (pauses while hidden, like the render loop). Reduced motion jumps to the end.
  tween(ms, fn, easeFn = ease.linear) {
    return new Promise((res, rej) => {
      if (!this.alive) return rej(CANCEL);
      if (REDUCED || ms <= 0) { fn(1, 1); res(); return; }
      let k = 0;
      let last = performance.now();
      let id = 0;
      const unhook = this.#onAbort(rej, () => cancelAnimationFrame(id));
      const step = (now) => {
        // a tween started from a microtask during a frame's animation step gets that frame's (earlier) timestamp
        const dt = Math.max(0, Math.min(100, now - last));
        last = now;
        k = Math.min(1, k + (dt * this.speed) / ms);
        fn(easeFn(k), k);
        if (k >= 1) { unhook(); res(); } else id = requestAnimationFrame(step);
      };
      id = requestAnimationFrame(step);
    });
  }
  // Resolves/rejects with p, or rejects with CANCEL if the run is aborted first.
  race(p) {
    return new Promise((res, rej) => {
      if (!this.alive) return rej(CANCEL);
      const unhook = this.#onAbort(rej);
      Promise.resolve(p).then((v) => { unhook(); res(v); }, (e) => { unhook(); rej(e); });
    });
  }
  // World cues must never stall the story: resolve when p settles or after maxMs of visible time.
  within(p, maxMs) {
    return this.race(Promise.race([
      Promise.resolve(p).catch((e) => { if (e !== CANCEL) console.error(e); return 'error'; }),
      this.wait(maxMs).then(() => 'timeout'),
    ]));
  }
}

export const Runs = {
  cur: null,
  start(o) { this.cur?.abort(); this.cur = new Run(o); return this.cur; },
  cancel() { this.cur?.abort(); this.cur = null; },
};

/* ---------- quality tiers ---------- */
// high | mid | low → WebGL world at decreasing cost; poster → no WebGL (A studio layout + stills);
// calm → reduced motion (no camera, no particles, ≤200 ms fades). Override with ?tier=.
export function hasWebGL2() {
  if (qs.has('nogl')) return false;
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}
export function detectTier() {
  const forced = qs.get('tier');
  if (forced && ['high', 'mid', 'low', 'poster', 'calm'].includes(forced)) return forced;
  if (REDUCED) return 'calm';
  if (!hasWebGL2()) return 'poster';
  const conn = navigator.connection;
  if (conn?.saveData) return 'poster';
  const narrow = innerWidth <= 760;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  if (narrow || coarse || mem <= 4 || cores <= 4) return 'low';
  if (mem <= 8 && cores <= 8) return 'mid';
  return 'high';
}

export const isNarrow = () => innerWidth <= 760;
