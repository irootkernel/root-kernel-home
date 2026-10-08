// main.js — boot. Sets the boot flag at once (nothing on this path imports three.js), picks the tier,
// fills copy from text.js, runs the DOM intro, then imports the world after first paint (idle, or
// on the first scroll / focus), compiles it off the critical path and crossfades it in over the poster.
// Owns the rAF loop, visibility pause, resize and the runtime tier downgrade.
// No typing on the site (founder, 2026-09-28): the first screen asks COPY.ask ("어떤 지원이 필요하신가요?") and the
// visitor answers with one of three chips (SVC areas). A chip, like a −200 m row, opens the area's service page,
// which is its strength scene (founder, 2026-09-30; router.js → strengths/scene.js). The ~1-minute demos start only
// from 시연 보기 in the details below each scene, or from a /build/ link. English pages (DEMOS false) never load them.
// The real WorldAdapter (journey/adapter.js) arrives with the world chunk; until then W is NullWorld.
import { qs, REDUCED, $, $$, bus, detectTier, isNarrow, esc } from './core.js?v=cfd99ce5c804';
import { COPY, COMPANY, FOUNDER, SVC, SVC_KEYS, TOOLS, toolLabel, RELEASES, PRODUCTS, PRODUCTS_HEAD, AI_SPARK, TRACK, DEMOS } from './text.js?v=cfd99ce5c804';
import { href } from './lang.js?v=cfd99ce5c804';
import { W, NullWorld, DEPTH } from './journey/director.js?v=cfd99ce5c804';
import { createIntro } from './intro.js?v=cfd99ce5c804';
import { createScroll, metersFromLayer } from './world/scroll.js?v=cfd99ce5c804';
import { createLabels } from './world/labels.js?v=cfd99ce5c804';
import { createNav, LAYER_PATH } from './router.js?v=cfd99ce5c804';

const root = document.documentElement;
const lateBoot = performance.now() > 2300;   // the CSS failsafe has already revealed the page

/* ---------- DOM ---------- */
const el = {
  gl: $('#gl'), hdr: $('#hdr'), gauge: $('#gauge'), ticks: $$('#gauge .g-tick'), gMarker: $('#gMarker'), gName: $('#gName'), depthNow: $('#depthNow'), depthM: $('#depthM'),
  hero: $$('.hero-title .ln'), heroFoot: $('#heroFoot'), scrim: $('#scrim'), scrimB: $('#scrimB'),
  pick: $('#pick'), pickQ: $('#pickQ'), pickList: $('#pickList'), pickOther: $('#pick .pick-other'), cursor: $('#pickCur'),
  convo: $('#convo'), labels: $('#labels'), leader: $('#leader'), leaderLine: $('#leader line'), hoverTag: $('#hoverTag'),
  card: $('#card'), cardName: $('#cardName'), cardKo: $('#cardKo'), cardV: $('#cardV'), cardR: $('#cardR'), cardQ: $('#cardQ'), cardA: $('#cardA'), cardX: $('#cardX'),
  page: $('#page'), sections: $$('#page > section'), rv: $$('.rv'), bench: $('#bench'), finalQ: $('#finalQ'),
};

/* ---------- boot flag + tier ---------- */
let NARROW = isNarrow();
let tier = detectTier();
const FIXED_Q = qs.has('fixed');
const SLOW_FRAMES = Math.min(80, +qs.get('slowframes') || 0);   // QA only: burn N ms per frame to exercise the downgrade
const noWorld = tier === 'poster' || tier === 'calm';
root.dataset.tier = tier;
if (REDUCED) root.classList.add('rm');
if (noWorld) root.classList.add('nogl');

const state = {
  mode: 'intro', layerF: 0, scrollT: scrollY, scrollS: scrollY, kpK: 0, kpP: 0, depthM: 0,
  nav: { active: false, f: 0 }, occluded: false,
};

/* ---------- copy from text.js: content.js, or content.en.js on English pages (the static HTML carries the same strings for no-JS) ---------- */
function hydrate() {
  $$('[data-c="founder"]').forEach(n => { n.textContent = FOUNDER.line; });
  // headline: one COMPANY.identityLines entry per .ln (the static markup has the same two spans; intro.js reveals them in turn)
  COMPANY.identityLines.forEach((t, i) => { if (el.hero[i]) el.hero[i].textContent = t; });
  $$('[data-c="principle"]').forEach(n => { n.textContent = COMPANY.principle; });
  $$('[data-c="svcHook"]').forEach(n => { n.textContent = COPY.svcHook; });
  $$('[data-c="ask"]').forEach(n => { n.textContent = COPY.ask; });
  $$('[data-c="pickOther"]').forEach(n => { n.textContent = COPY.pickOther; });
  $$('[data-c="spark"]').forEach(n => { n.textContent = AI_SPARK; });
  // the three service areas (content.js SVC; key order == lantern order at −200 m)
  const fill = (b, sel, t) => { const n = b.querySelector(sel); if (n) n.textContent = t; };
  // the answer chips: title = the area, second line = its scope (the demo shows the concrete example)
  $$('.pick-c[data-svc]').forEach(a => {
    const s = SVC[a.dataset.svc]; if (!s) return;
    fill(a, '.pick-t', s.area); fill(a, '.pick-x', s.scope);
    if (a.tagName === 'A') a.setAttribute('href', href(`/services/${s.slug}/`));
    a.setAttribute('aria-label', `${s.area} — ${s.scope}`);
  });
  // the −200 m rows: links to the area's service page
  $$('.svc [data-svc]').forEach(b => {
    const s = SVC[b.dataset.svc]; if (!s) return;
    fill(b, '.n', s.no); fill(b, '.a', s.area); fill(b, '.t', s.name); fill(b, '.d', s.desc);
    if (b.tagName === 'A') b.setAttribute('href', href(`/services/${s.slug}/`));
  });
  $$('[data-c="ops"]').forEach(n => { n.textContent = COPY.opsNote; });
  // tools: English names; only the sea creatures carry their Korean meaning; the tag (an Aquarium edition: its host) +
  // version below
  $$('.tool[data-tool]').forEach(b => {
    const id = b.dataset.tool, T = TOOLS[id]; if (!T) return;
    b.querySelector('.tn').innerHTML = esc(T.name) + (T.ko ? `<i>${esc(T.ko)}</i>` : '');
    b.querySelector('.tk').textContent = [T.host || T.tag, T.ver].filter(Boolean).join(' · ');
  });
  const ev = $('#evid');
  if (ev) {
    ev.querySelectorAll('p').forEach(p => p.remove());
    for (const r of RELEASES) { const i = r.text.indexOf(' — '); const p = document.createElement('p'); p.innerHTML = `<b>${esc(r.text.slice(0, i))}</b> — ${esc(r.text.slice(i + 3))}`; ev.appendChild(p); }
  }
  const rec = $('#record');
  if (rec) rec.innerHTML = TRACK.map(([d, t]) => `<li><span class="mono">${esc(d)}</span><span>${esc(t)}</span></li>`).join('');
  // products: the heading (one line per entry) and lede, then per row name · mono tag (+ badge) · lead · one sentence · status
  $$('[data-c="prodHead"]').forEach(n => { n.innerHTML = PRODUCTS_HEAD.lines.map(esc).join('<br>'); });
  $$('[data-c="prodLede"]').forEach(n => { n.textContent = PRODUCTS_HEAD.lede; });
  $$('#prodList [data-prod]').forEach(li => {
    const P = PRODUCTS.find(p => p.id === li.dataset.prod); if (!P) return;
    fill(li, '.d', P.line); fill(li, '.x', P.note); fill(li, '.s', P.status);
    const k = li.querySelector('.k'); if (k) k.innerHTML = esc(P.tag) + (P.badge ? `<em>${esc(P.badge)}</em>` : '');
  });
}
hydrate();

/* ---------- modules ---------- */
let world = null;
const scroll = createScroll({ el, state });
const labels = createLabels({ el, state, getWorld: () => world, isNarrow: () => NARROW });
const nav = createNav({ scroll, state, labels, getWorld: () => world, ensureJourney: () => ensureJourney(), beforeRoute: (page, how) => journey?.beforeRoute(page, how) });
const intro = createIntro({ el, narrow: NARROW, calm: tier === 'calm' || REDUCED, onDone: () => { if (state.mode === 'intro') state.mode = 'explore'; } });
if (lateBoot) intro.revealAll();
root.classList.remove('nojs'); root.classList.add('js', 'booted');   // the boot flag: set before anything slow can happen
window.__rkBoot = true;
intro.start();

/* ---------- the journey: a lazy chunk (orchestrator + log), loaded on first focus / tap / deep link; the rail and the studio follow with the first journey ---------- */
let journeyP = null, journey = null;
function ensureJourney() {
  if (!DEMOS) return Promise.resolve(null);   // the English edition has no demos (DECISIONS 4-21)
  if (!journeyP) {
    journeyP = import('./journey/journey.js?v=cfd99ce5c804')
      .then(m => (journey = m.createJourney({ el, state, nav, labels, intro, scroll, loadWorld: () => loadWorld(), getTier: () => tier, getWorld: () => world })))
      .catch(e => { journeyP = null; console.error(e); return null; });
  }
  return journeyP;
}
// the area's scene arrives with the first hover / focus / press (it is not on the first-paint path)
const prefetchScene = (svc) => { import('./strengths/scene.js?v=cfd99ce5c804').then((M) => M.prefetch(svc)).catch(() => {}); };

/* ---------- the answers: a tap on a chip opens that area's service page (its strength scene); nothing is typed ---------- */
// a plain left click takes over the link; a modified click (new tab, …) still opens the service page itself
const plainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
const warm = (svc) => { loadWorld(); prefetchScene(svc); };
// the chips (first screen, the final question) and B's list at −200 m: data-svc is the area.
// Hover / focus lights the matching lantern once the world is there; a tap opens /services/<slug>/.
$$('.pick-c[data-svc], .svc [data-svc]').forEach(b => {
  const i = SVC_KEYS.indexOf(b.dataset.svc);
  const on = () => { if (world && state.mode !== 'journey') world.lantern.focus = i; };
  // (the area's own service page keeps its lantern lit: the scene covering the chip must not switch it off)
  const off = () => { if (world && state.mode !== 'journey' && world.lantern.focus === i && nav.panel?.svc !== b.dataset.svc && nav.scene?.svc !== b.dataset.svc) world.lantern.focus = -1; };
  const w = () => warm(b.dataset.svc);
  b.addEventListener('mouseenter', () => { on(); w(); }); b.addEventListener('focus', () => { on(); w(); });
  b.addEventListener('mouseleave', off); b.addEventListener('blur', off);
  b.addEventListener('pointerdown', w, { passive: true });
  b.addEventListener('click', (e) => {
    if (b.tagName === 'A' && !plainClick(e)) return;
    e.preventDefault();
    const svc = b.dataset.svc;
    if (SVC[svc]) nav.go(href(`/services/${SVC[svc].slug}/`));
  });
});
// "다른 문의가 있으신가요? →": the contact page, with 문의 종류 = 기타 already chosen
$$('.pick-other').forEach(a => a.addEventListener('click', (e) => {
  if (!plainClick(e)) return;
  e.preventDefault();
  nav.go(href('/contact/'), { state: { kind: a.dataset.kind || null } });
}));
// the gauge is navigation: depth = route (router.js moves the scroll; the camera follows)
el.ticks.forEach(b => b.addEventListener('click', () => { if (state.mode !== 'journey') nav.go(LAYER_PATH[+b.dataset.go] || href('/')); }));
$('.brand')?.addEventListener('click', e => { e.preventDefault(); nav.go(href('/')); });

/* ---------- journey hooks (for journey.js) ---------- */
function setMode(m) {
  if (m === 'journey') { state.mode = 'journey'; document.body.classList.add('journey'); el.page.inert = true; labels.closeCard(); }
  else { state.mode = 'explore'; document.body.classList.remove('journey'); el.page.inert = false; }
}
bus.on('mode', setMode);
bus.on('occlude', v => { state.occluded = !!v; });

/* ---------- the world: imported after first paint, compiled off the critical path ---------- */
let loading = null, firstFrame = false, worldStart = 0;
const env = {
  state, labels, scroll, glyphHost: el.labels,
  onTravel(f) { state.nav.f = f; },
  onExplore() { state.nav.active = false; },
  setOccluded(v) { state.occluded = v; },
  onDispose() { goPoster(); },
};
function loadWorld() {
  if (noWorld || tier === 'poster') return null;
  if (loading) return loading;
  loading = (async () => {
    const t0 = performance.now();
    let mod, A, w;
    // the world and its adapter (the verbs the journey uses) arrive together, off the first-paint path
    try { [mod, A] = await Promise.all([import('./world/world.js?v=cfd99ce5c804'), import('./journey/adapter.js?v=cfd99ce5c804')]); } catch (e) { goPoster(); return null; }
    try { w = mod.createWorld({ canvas: el.gl, tier, narrow: NARROW }); } catch (e) { goPoster(); return null; }
    await w.compile();
    if (tier === 'poster') { w.dispose(); return null; }
    world = w; worldStart = performance.now();
    W.use(A.createDirector(w, env));
    intro.attachWorld(w);
    // a deep link (or an early scroll) starts the camera at its depth instead of gliding down from the hero
    if (state.layerF > 0.05 && state.mode !== 'journey') {
      const pose = w.poseAt(state.layerF, { p: w.V3(), t: w.V3() });
      pose.p.y += 5; pose.p.z += 8; pose.t.y += 6.5; pose.t.z += 10;   // the intro push-in offset at t = 0 (world.update)
      w.rig.pos.copy(pose.p); w.rig.look.copy(pose.t);
    }
    const pg = nav.page;
    if (pg?.tool && state.mode !== 'journey') labels.openCard(pg.tool, labels.anchorFor(pg.tool));
    if (pg?.svc && state.mode !== 'journey') w.lantern.focus = pg.svc === 'web' ? SVC_KEYS.indexOf('web') : -1;   // only 제품's scene is seen at the lanterns
    if (pg?.panel && state.mode !== 'journey') nav.warm();
    firstFrame = true;
    bus.emit('world', { ready: true, tier: w.tier, ms: Math.round(performance.now() - t0) });
    return w;
  })();
  return loading;
}
function goPoster() {
  const w = world;
  world = null; W.use(NullWorld);
  tier = 'poster'; root.dataset.tier = tier;
  root.classList.remove('gl-on'); root.classList.add('nogl');
  if (w) { try { w.dispose(); } catch (e) { /* context may already be gone */ } }
  bus.emit('tier', tier);
}
el.gl.addEventListener('webglcontextlost', e => {
  // mid-journey too: the story continues on NullWorld over the poster
  e.preventDefault();
  world = null; W.use(NullWorld);
  tier = 'poster'; root.dataset.tier = tier;
  root.classList.remove('gl-on'); root.classList.add('nogl');
  bus.emit('tier', tier);
});
if (!noWorld) {
  const idle = window.requestIdleCallback ? (f) => requestIdleCallback(f, { timeout: 220 }) : (f) => setTimeout(f, 40);
  requestAnimationFrame(() => requestAnimationFrame(() => idle(() => loadWorld())));
  addEventListener('scroll', () => loadWorld(), { once: true, passive: true });
}

/* ---------- runtime quality: p95 over budget in a 2 s window → one step down (never up in a journey) ---------- */
const perf = { buf: [], t0: 0, bad: 0, log: [] };
const budget = () => (NARROW || matchMedia('(pointer: coarse)').matches ? 40 : 20);
function perfSample(now, ms) {
  if (FIXED_Q || !world || now - worldStart < 4000) return;
  if (!perf.t0) perf.t0 = now;
  perf.buf.push(ms);
  if (now - perf.t0 < 2000) return;
  const n = perf.buf.length;
  if (n >= 20) {
    const s = perf.buf.slice().sort((a, b) => a - b), p95 = s[Math.min(n - 1, Math.floor(n * 0.95))];
    perf.log.push(Math.round(p95 * 10) / 10); if (perf.log.length > 30) perf.log.shift();
    if (p95 > budget()) {
      const next = { high: 'mid', mid: 'low' }[world.tier];
      if (next) { tier = world.setTier(next); root.dataset.tier = tier; bus.emit('tier', tier); perf.bad = 0; }
      else if (p95 > budget() * 2 && state.mode !== 'journey' && ++perf.bad >= 3) goPoster();
    } else perf.bad = 0;
  }
  perf.buf.length = 0; perf.t0 = now;
}

/* ---------- main loop ---------- */
const T0 = Math.min(performance.now(), 380);
const drive = { layerF: 0, intro: 0, px: 0, py: 0, kpK: 0, kpP: 0, ptrX: 0, ptrY: 0, ptrOn: 0 };
const fpsLog = [];
let last = performance.now(), raf = 0, acc = 0;
function frame(now) {
  raf = requestAnimationFrame(frame);
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.1) dt = 0.1;
  const t = (now - T0) / 1000;
  scroll.tick(now, dt);
  intro.update();
  const journeyCam = world && world.rig.mode === 'journey';
  const m = journeyCam ? world.camDepthMeters(world.camera.position.y) : metersFromLayer(state.layerF);
  state.depthM = m;
  scroll.updateGauge(m);
  scroll.updateScrims();
  nav.syncScroll();
  if (!world || state.occluded) return;
  // mobile renders at 30 fps (CONTRACT §7)
  if (NARROW) { acc += dt; if (acc < 1 / 30 - 0.003) return; dt = Math.min(acc, 0.1); acc = 0; }
  const ptr = labels.pointer;
  drive.layerF = state.layerF; drive.intro = intro.introK(); drive.kpK = state.kpK; drive.kpP = state.kpP;
  drive.px = REDUCED || NARROW ? 0 : ptr.nx; drive.py = REDUCED || NARROW ? 0 : ptr.ny;
  drive.ptrX = ptr.x / innerWidth * 2 - 1; drive.ptrY = -(ptr.y / innerHeight * 2 - 1);
  drive.ptrOn = !REDUCED && ptr.in && now - ptr.t < 1400 && state.mode !== 'journey' ? 1 : 0;
  world.update(dt, REDUCED ? 14 : t, drive);
  world.render();
  if (SLOW_FRAMES) { const end = performance.now() + SLOW_FRAMES; while (performance.now() < end); }
  if (firstFrame) { firstFrame = false; requestAnimationFrame(() => root.classList.add('gl-on')); }
  labels.update(dt, NARROW);
  perfSample(now, dt * 1000);
  fpsLog.push(dt); if (fpsLog.length > 240) fpsLog.shift();
}
raf = requestAnimationFrame(frame);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
  else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
});
let rzT = 0;
function onResize() {
  clearTimeout(rzT);
  rzT = setTimeout(() => {
    NARROW = isNarrow();
    if (world) world.resize();
    scroll.computeHolds();
    bus.emit('resize', { narrow: NARROW });
  }, 120);
}
addEventListener('resize', onResize);
scroll.computeHolds();
// depth = route: a deep link starts at its depth, without the intro choreography
let userScrolled = false;
['wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { userScrolled = true; }, { passive: true, once: true }));
const deepLink = nav.start();
if (deepLink) { intro.revealAll(); if (nav.page?.panel || nav.page?.name === 'build') ensureJourney(); }
document.fonts?.ready.then(() => {
  scroll.computeHolds();
  const pg = nav.page;
  if (deepLink && !userScrolled && pg?.layer && state.mode !== 'journey') nav.travel(pg.layer, true);
});

/* ---------- QA / integration handle ---------- */
window.__rk = {
  bus, W, state, scroll, labels, intro, DEPTH, loadWorld, setMode, nav, ensureJourney,
  get world() { return world; },
  get tier() { return tier; },
  get journey() { return journey; },
  goLayer: (i) => scroll.goLayer(i),
  fps() { const a = fpsLog.slice(-120); return a.length ? a.length / a.reduce((s, x) => s + x, 0) : 0; },
  frameTimes: () => fpsLog.map(x => x * 1000),
  perf: () => ({ tier, p95s: perf.log.slice() }),
  toolLabel,
};
