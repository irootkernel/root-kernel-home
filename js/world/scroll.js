// scroll.js — B's scroll anchoring (deep/index.html 2277–2347): each layer holds while its text scrolls,
// the camera travels between holds; cinematic scrollTo/goLayer; the depth gauge. (B's docked ask is gone:
// there is no typing on the site.)
// Home order (CONTRACT §5): 0 m → −200 m → −4,000 m → −10,935 m → quick rise → above the surface.
// No three.js here: this runs from first paint, with or without a world.
import { clamp, lerp, sstep, ease, REDUCED } from '../core.js?v=57f526fdc266';

// `name` is the gauge read-out under the depth (English). The tick labels in index.html add the depth part
// ("Services · −200 m", "Products · above surface"); above the surface the read-out itself says "+40 m".
export const LAYERS = [
  { key: 'company', name: 'Company', m: 0 },
  { key: 'services', name: 'Services', m: 200 },
  { key: 'tools', name: 'Open source', m: 4000 },
  { key: 'kernel', name: 'Kernel', m: 10935 },
  { key: 'products', name: 'Products', m: -40 },
];
const LM = LAYERS.map(l => l.m);
// layer position f (0…4) → meters. f 3→4 is the quick rise from the kernel to above the surface.
export function metersFromLayer(f) { const k = Math.min(3, Math.max(0, Math.floor(f))); return lerp(LM[k], LM[k + 1], clamp(f - k)); }
// "−4,000" / "0" / "+35" (above the surface reads as altitude)
export function fmtDepth(m) {
  if (m < -0.5) return '+' + Math.round(-m).toLocaleString('en-US');
  return m < 0.5 ? '0' : '−' + Math.round(m).toLocaleString('en-US');
}
// gauge track position (0 = top … 1 = bottom): above the surface sits above 0 m
const GP = [[-40, 0], [0, 0.25], [200, 0.5], [4000, 0.75], [10935, 1]];
export function gaugePos(m) {
  if (m <= GP[0][0]) return 0;
  for (let i = 0; i < GP.length - 1; i++) if (m <= GP[i + 1][0]) return lerp(GP[i][1], GP[i + 1][1], (m - GP[i][0]) / (GP[i + 1][0] - GP[i][0]));
  return 1;
}
export function layerForMeters(m) { return m < -5 ? 4 : m < 100 ? 0 : m < 2100 ? 1 : m < 7500 ? 2 : 3; }

export function createScroll({ el, state }) {
  const sections = el.sections;
  let holds = [];
  let gaugeH = 0;
  // an element's document y before transforms (.rv text moves while it fades in)
  const docTop = (n) => { let y = 0; for (; n; n = n.offsetParent) y += n.offsetTop; return y; };
  function computeHolds() {
    const vh = innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    // the products hold ends where the final ask is centred, not at the page end: the company footer below it
    // (DECISIONS 4-20) adds room without slowing the bottom scrim and the camera lift (kpP)
    const ask = el.finalQ ? docTop(el.finalQ) + el.finalQ.offsetHeight / 2 - vh / 2 : max;
    holds = sections.map((s, i) => {
      const top = s.offsetTop, h = s.offsetHeight;
      if (i === 0) return [0, vh * 0.06];
      const a = top - vh * 0.12, b = i === sections.length - 1 ? Math.min(max, ask) : top + h - vh * 0.9;
      return [Math.min(a, max), Math.min(Math.max(a, b), max)];
    });
    gaugeH = el.gauge ? el.gauge.clientHeight : 0;
  }
  // B's creep (+0.1 toward the next pose while a layer holds) stays for 0–2; the kernel and the
  // product layer use their own in-hold camera moves (kpK / kpP) instead.
  const CREEP = [0.1, 0.1, 0.1, 0, 0];
  function layerFromScroll(y) {
    for (let k = 0; k < holds.length; k++) {
      const [a, b] = holds[k];
      if (y < a && k > 0) {
        const pb = holds[k - 1][1];
        const u = clamp((y - pb) / Math.max(1, a - pb));
        const c = CREEP[k - 1];
        return (k - 1) + c + (1 - c) * u;
      }
      if (y <= b) return k + CREEP[k] * clamp((y - a) / Math.max(1, b - a));
    }
    return holds.length - 1;
  }
  const holdProgress = (k, y) => { const h = holds[k]; return h ? clamp((y - h[0]) / Math.max(1, h[1] - h[0])) : 0; };

  /* ---- custom programmatic scroll (cinematic dive) ---- */
  let anim = null;
  function scrollToY(y, dur) {
    const y0 = scrollY;
    if (anim) { const r = anim.res; anim = null; r(); }
    if (REDUCED || Math.abs(y - y0) < 2) { window.scrollTo(0, y); return Promise.resolve(); }
    dur = dur ?? clamp(Math.abs(y - y0) / 2400, 0.9, 2.8) * 1000;
    return new Promise(res => { anim = { y0, y, t0: performance.now(), dur, res }; });
  }
  ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, e => {
    // scrolling a strength scene (its own scroller) never stops the dive to the scene's depth
    if (e.target?.closest?.('#svcScene')) return;
    if (anim && (ev !== 'keydown' || ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key))) { const r = anim.res; anim = null; r(); }
  }, { passive: true }));
  // Where to land on a layer: the start of its camera hold, lifted just enough that the text block
  // ends above the bottom edge (with a margin), but never so far that its first line slips under the header.
  // The kernel layer keeps its own low text placement (the camera descends the trench first).
  function landingY(i, base) {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const s = sections[i];
    if (i === 0 || !s) return 0;
    let y = base ?? (holds[i] ? holds[i][0] : s.offsetTop);
    const inner = s.querySelector('.layer-in');
    if (inner && !s.classList.contains('layer-k')) {
      const cs = getComputedStyle(inner);
      const r = inner.getBoundingClientRect();
      const top = r.top + scrollY + parseFloat(cs.paddingTop);
      const bottom = r.bottom + scrollY - parseFloat(cs.paddingBottom);
      const dock = innerWidth <= 760 ? 36 : 56;
      const head = 88;
      if (bottom - y > innerHeight - dock) y = bottom - (innerHeight - dock);
      if (top - y < head) y = top - head;
    }
    return Math.min(Math.max(0, y), max);
  }
  function goLayer(i) {
    const s = sections[i];
    if (!s) return Promise.resolve();
    const target = i === 0 ? 0 : landingY(i, holds[i] ? holds[i][0] + innerHeight * 0.12 : s.offsetTop);
    return scrollToY(Math.min(target, document.documentElement.scrollHeight - innerHeight));
  }

  /* ---- reveal-on-view for layer text ---- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -4% 0px' });
  el.rv.forEach(n => io.observe(n));

  // per frame: scroll animation, smoothed scroll, layer position and the in-hold progress values
  function tick(now, dt) {
    if (anim) {
      const k = clamp((now - anim.t0) / anim.dur);
      window.scrollTo(0, lerp(anim.y0, anim.y, ease.io3(k)));
      if (k >= 1) { const r = anim.res; anim = null; r(); }
    }
    state.scrollT = scrollY;
    state.scrollS = REDUCED ? state.scrollT : lerp(state.scrollS, state.scrollT, 1 - Math.exp(-7 * dt));
    if (state.mode !== 'journey' && !state.nav.active) state.layerF = layerFromScroll(state.scrollS);
    else if (state.nav.active) state.layerF = state.nav.f;
    state.kpK = holdProgress(3, state.scrollS);
    state.kpP = holdProgress(4, state.scrollS);
  }

  /* ---- the depth gauge (B's marker + ticks; above the surface reads "+N m · Products" in warm) ---- */
  function updateGauge(m) {
    const txt = fmtDepth(m);
    if (el.depthNow.textContent !== txt) { el.depthNow.textContent = txt; el.depthM.textContent = txt + ' m'; }
    const act = layerForMeters(m);
    el.ticks.forEach(b => b.classList.toggle('on', +b.dataset.go === act));
    const name = LAYERS[act].name;
    if (el.gName.textContent !== name) el.gName.textContent = name;
    el.gauge.classList.toggle('above', m < -0.5);
    if (!gaugeH) gaugeH = el.gauge.clientHeight;
    el.gMarker.style.transform = `translateY(${(gaugePos(m) * gaugeH).toFixed(1)}px) translateY(-50%)`;
  }

  /* ---- legibility scrims (B): left column + bottom scrim under the kernel text and the final ask ---- */
  // every layer's text sits in the left column (the kernel's too, since 2026-09-30), so the left scrim stays on
  function updateScrims() {
    const F = state.layerF, off = state.mode === 'journey';
    const kernel = sstep(2.55, 2.95, F) * (1 - sstep(3.05, 3.45, F));
    const prod = sstep(3.6, 3.95, F);
    const b = off ? 0 : Math.max(sstep(0, 0.5, state.kpK) * kernel * 0.95, sstep(0.45, 0.9, state.kpP) * prod * 0.9);
    const l = off ? 0 : sstep(0.35, 0.8, F);
    el.scrimB.style.opacity = b.toFixed(3);
    el.scrim.style.opacity = l.toFixed(3);
  }

  return { computeHolds, layerFromScroll, goLayer, landingY, scrollToY, tick, updateGauge, updateScrims, get holds() { return holds; } };
}
