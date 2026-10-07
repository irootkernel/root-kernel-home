// director.js — the WorldAdapter facade (CONTRACT §5): W, the object the journey holds (main.js swaps
// what is behind it: the real adapter once the world has loaded, NullWorld if WebGL is lost mid-journey),
// NullWorld itself (every verb resolves at once; anchors come from the DOM), route depths and travel time.
//
// The real adapter — createDirector(), the verbs on top of world.js — lives in adapter.js and loads with
// the world chunk: it is useless without three.js, so it stays off the first-paint path.
//
// No three.js import here (this module is on the first-paint path).
import { clamp, ease, isNarrow, REDUCED } from '../core.js?v=7797e944718b';

// route depths (meters; negative = above the surface)
export const DEPTH = { company: 0, services: 200, tools: 4000, kernel: 10935, products: -40 };
// route travel time (CONTRACT §5): t = clamp(0.9 + 0.35·log10(Δm+1), 0.9, 2.2) s
export const travelSeconds = (dm) => clamp(0.9 + 0.35 * Math.log10(Math.abs(dm) + 1), 0.9, 2.2);

export const rectAt = (x, y, w = 0, h = 0) => ({ x, y, w, h, width: w, height: h, left: x - w / 2, top: y - h / 2, right: x + w / 2, bottom: y + h / 2 });
export const fromRect = (r) => rectAt(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height);
function domRect(sel) {
  const n = typeof sel === 'string' ? document.querySelector(sel) : sel;
  if (!n || n.hidden || !n.isConnected) return null;
  const r = n.getBoundingClientRect();
  return r.width || r.height ? r : null;
}
export const toRect = (r) => (r ? { x: r.left ?? r.x, y: r.top ?? r.y, w: r.width ?? r.w, h: r.height ?? r.h } : null);

/* =========================================================================
   NullWorld — no WebGL (poster / calm / context lost). Verbs resolve at once.
   Anchors come from the layout: [data-anchor="…"] if the studio marks one, else #specHost / #bench.
   ========================================================================= */
let nullDepth = 0;
export const NullWorld = {
  ready: false,
  isNull: true,
  depth: () => nullDepth,
  anchor(name) {
    const own = domRect(`[data-anchor="${name}"]`);
    if (own) return fromRect(own);
    const [n, arg] = String(name).split(':');
    const vw = innerWidth, vh = innerHeight;
    if (n === 'capsule' || n === 'slot') {
      const spec = domRect('#specHost'), bench = domRect('#bench');
      const c = spec ? rectAt(spec.left + 56, spec.top - 34, 80, 32) : bench ? rectAt(bench.left + bench.width / 2, bench.top - 40, 80, 32) : rectAt(vw / 2, vh * (isNarrow() ? 0.17 : 0.22), 80, 32);
      return n === 'capsule' ? c : rectAt(c.x + 94, c.y - 16, 40, 57);
    }
    if (n === 'lantern') { const b = domRect(`#pickList [data-svc="${arg}"]`) || domRect(`.svc [data-svc="${arg}"]`); return b ? fromRect(b) : rectAt(vw * 0.62, vh * 0.3); }
    if (n === 'surface') return rectAt(vw / 2, 0);
    if (n === 'bench') { const b = domRect('#bench'); return b ? fromRect(b) : rectAt(vw / 2, vh / 2); }
    return rectAt(vw / 2, vh / 2);
  },
  async condense() {}, async toLantern() { nullDepth = 200; }, slot() {}, humanBeam() {}, async lanternPulse() {},
  async approveBloom() {}, async dive() { nullDepth = 4000; }, async benchEnter() {}, benchRect() {},
  benchProjectedRect() { const b = domRect('#bench'); return b ? { left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height } : null; },
  pod() {}, dispatchPulse() {},
  // no creature to watch, but the DOM scan band still needs its position: drive onY over ms
  async gaoriSweep(ms, run, onY) {
    if (!onY) return;
    if (REDUCED || !run) { onY(1); return; }
    await run.tween(ms, (e) => onY(e), ease.ios);
  },
  fail() {}, pass() {}, async reworkCurrent() {}, async repair() {}, mulgae() {},
  async rise() { nullDepth = 0; }, async deliverBloom() {}, async toSurfaceDirect() { nullDepth = 0; },
  async travelTo(m) { nullDepth = typeof m === 'string' ? (DEPTH[m] ?? 0) : m; },
  focusTool() {}, setLoad() {}, setTier() {}, explore() {}, occlude() {}, dispose() {},
};

/* =========================================================================
   W — the facade. The journey holds W; main.js swaps what is behind it.
   ========================================================================= */
const VERBS = ['condense', 'toLantern', 'slot', 'humanBeam', 'lanternPulse', 'approveBloom', 'dive', 'benchEnter', 'benchRect', 'benchProjectedRect',
  'pod', 'dispatchPulse', 'gaoriSweep', 'fail', 'pass', 'reworkCurrent', 'repair', 'mulgae', 'rise', 'deliverBloom', 'toSurfaceDirect', 'travelTo',
  'focusTool', 'setLoad', 'setTier', 'depth', 'anchor', 'explore', 'occlude', 'dispose'];
let impl = NullWorld;
export const W = {
  get ready() { return !!impl.ready; },
  get impl() { return impl; },
  use(next) { const prev = impl; impl = next || NullWorld; if (prev !== impl && prev.detach) prev.detach(); return impl; },
};
for (const v of VERBS) W[v] = (...a) => impl[v](...a);
