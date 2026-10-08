// journey/journey.js — the one orchestrator (SPEC-engineering §2.4 · SPEC-experience §2 B1–B14).
// The order is fixed here and only here: Spec → Human approval → Build → Test → Review → Delivery.
// The world (B, WorldAdapter) and the studio (A) are two adapters it drives: every world cue is wrapped
// in run.within(p, maxMs), so a slow GPU never stalls the story; the studio renders each step on the
// same Run. Observers (rail, live region, QA) only listen to bus 'stage'.
// Areas and scenarios: the world (lantern), the URL and the stage events carry the service AREA (web · erp ·
// ax, content.js SVC); the studio loads a demo SCENARIO (js/scenarios/<scenario>.js: web · app · agent ·
// consult · handoff). A request for a plain homepage runs the 01 demo with HOMEPAGE_NOTE said first.
// Layouts: 'deep' when the world is there (high/mid/low), 'standalone' (A's studio: convo | frame | rail)
// for poster / calm, or when the world never arrived. WebGL loss mid-journey: the W facade swaps to
// NullWorld underneath and the story carries on over the poster.
// No typing on the site (founder, 2026-09-28): a journey starts from a chip (bus 'svc'), a service page's
// [시연 보기] or a /build/ link; at the gate the visitor approves or picks one of the scenario's preset
// revisions. The request router (router.js route/closestOf) still reads /build/?q= links, which is how a
// shared or reloaded demo comes back; nothing on the page reaches free text.
import { $, bus, Runs, isCancel, REDUCED, setSpeed, isNarrow, clamp, qs } from '../core.js?v=cfd99ce5c804';
import { SVC, SVC_KEYS, SCENARIO_AREA, COPY } from '../content.js?v=cfd99ce5c804';
import { W, NullWorld } from './director.js?v=cfd99ce5c804';
import { createLog, createTicker } from '../log.js?v=cfd99ce5c804';
import { route as intent, closestOf, exampleOf, buildPath, PRICE } from '../router.js?v=cfd99ce5c804';
import { showOverlay, hideOverlay } from '../world/labels.js?v=cfd99ce5c804';

const studioMod = () => import('../studio/studio.js?v=cfd99ce5c804');
const railMod = () => import('./rail.js?v=cfd99ce5c804');   // the rail (and the studio's standalone.js) load with the first journey
const BASE_SPEED = clamp(parseFloat(qs.get('speed')) || 1, 0.25, 8);
const alongside = (p) => { p?.catch?.(() => {}); return p; };   // runs beside the story; a cancel must not surface unhandled
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

export function createJourney(env) {
  const { el, state, nav } = env;
  const root = document.documentElement;
  const worldTier = () => !['poster', 'calm'].includes(env.getTier());
  const ui = {
    band: $('#jrBand'), restart: $('#restart'), ticker: $('#ticker'), logClose: $('#logClose'),
    specHost: $('#specHost'), bench: $('#bench'), toast: $('#toast'), rail: $('#rail'), gauge: $('#gauge'),
  };

  /* ---------- the log (one role="log"; folded, never deleted) ---------- */
  let variant = worldTier() ? 'deep' : 'standalone';
  let log = createLog(el.convo, { variant });
  let ticker = null;
  function bindTicker() {
    ticker?.destroy();
    ticker = createTicker(ui.ticker, log, { onToggle: (o) => logSheet(o) });
  }
  bindTicker();
  function ensureVariant(v) {
    if (v === variant) return;
    log.destroy();
    el.convo.classList.remove('st-log--deep', 'st-log--standalone', 'st-log--expanded');
    log = createLog(el.convo, { variant: v });
    variant = v;
    bindTicker();
  }
  // the studio talks through this proxy: `결과로` makes every remaining line appear whole, at once
  const L = {
    get el() { return log.el; },
    get variant() { return log.variant; },
    you: (t) => log.you(t), example: (t) => log.example(t), act: (t) => log.act(t),
    ai: (t, o = {}) => log.ai(t, J.skipping ? { ...o, run: null, think: 0 } : o),
    tool: (id, p, o = {}) => log.tool(id, p, J.skipping ? { ...o, run: null } : o),
    card: (n) => log.card(n), fold: (o) => log.fold(o), clear: () => log.clear(),
    subscribe: (f) => log.subscribe(f), last: () => log.last(), count: () => log.count(),
  };

  const J = {
    phase: 'idle',        // idle · running · gate · delivered
    run: null, S: null, ctx: null, V: NullWorld, deep: false, handoff: false,
    approved: false, skipping: false, pushed: false, scrollY: 0, meta: null,
  };
  const busy = () => J.phase === 'running' || J.phase === 'gate';

  let rail = null;
  const railReady = () => railMod().then((m) => (rail ||= m.createRail(ui.rail, ui.gauge, { depth: () => (J.phase === 'idle' ? null : J.V.depth()), onSkip: () => skip() })));

  /* ---------- small UI pieces ---------- */
  let lastInput = 'pointer';
  addEventListener('keydown', () => { lastInput = 'key'; }, true);
  addEventListener('pointerdown', () => { lastInput = 'pointer'; }, true);

  let toastT = 0;
  function toast(msg) {
    const t = ui.toast;
    t.classList.add('st-toast');
    t.setAttribute('role', 'status');
    t.hidden = false; t.inert = false;
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.classList.remove('show'); setTimeout(() => { if (!t.classList.contains('show')) { t.hidden = true; t.inert = true; } }, 420); }, 2800);   // UI feedback, not story time
  }

  /* ---------- mobile: the log behind a ticker, a sheet on demand ---------- */
  function logSheet(open) {
    root.classList.toggle('jr-logsheet', !!open);
    ui.logClose.hidden = !open;
    ticker?.set(open);
    if (open) { el.convo.scrollTop = el.convo.scrollHeight; ui.logClose.focus(); }
  }
  ui.logClose.addEventListener('click', () => { logSheet(false); ui.ticker.focus(); });

  // the world renders nothing while a sheet covers most of a phone screen (CONTRACT §7)
  let occRaf = 0, occ = false;
  function occLoop() {
    occRaf = requestAnimationFrame(occLoop);
    const sheet = document.getElementById('st-sheet');
    const v = isNarrow() && ((!!sheet && !sheet.hidden && !J.approved) || root.classList.contains('jr-logsheet'));
    if (v !== occ) { occ = v; W.occlude(v); }
  }

  /* ---------- entering and leaving a journey ---------- */
  function enter(layout, handoff) {
    bus.emit('mode', 'journey');            // main.js: body.journey, #page inert, card closed
    nav.hidePanel();
    root.classList.remove('jr-flow', 'jr-deep', 'jr-standalone', 'jr-logsheet');
    root.classList.add('jr-on', `jr-${layout}`, 'lock');
    root.classList.toggle('jr-handoff', !!handoff);
    el.convo.classList.add('show');
    el.convo.inert = false;
    showOverlay(ui.band);
    ui.restart.hidden = false;
    rail?.show({ handoff, live: layout === 'deep' });
    ui.ticker.hidden = false;
    if (!occRaf) occLoop();
  }
  function teardown() {
    if (J.run) { if (Runs.cur === J.run) Runs.cancel(); else J.run.abort(); }
    J.run = null;
    endSkip();
    J.S?.destroy();
    J.S = null;
    for (const c of ['jr-pre', 'jr-warm', 'jr-shrink']) ui.bench.classList.remove(c);
    ui.bench.classList.remove('show');
    ui.bench.hidden = true; ui.bench.inert = true;
    ui.specHost.removeAttribute('style');
  }
  function leave(o = {}) {
    if (J.phase === 'idle') return;
    teardown();
    J.phase = 'idle';
    J.approved = false;
    J.pushed = false;
    root.classList.remove('jr-on', 'jr-deep', 'jr-standalone', 'jr-handoff', 'jr-flow', 'jr-logsheet', 'lock');
    delete root.dataset.zone;
    hideOverlay(ui.band);
    ui.restart.hidden = true;
    ui.ticker.hidden = true;
    ui.logClose.hidden = true;
    rail?.hide();
    cancelAnimationFrame(occRaf); occRaf = 0;
    if (occ) { occ = false; W.occlude(false); }
    el.convo.classList.remove('show');
    el.convo.inert = true;
    W.explore();
    bus.emit('mode', 'explore');
    setSpeed(BASE_SPEED);
    window.scrollTo(0, J.scrollY || 0);
    state.scrollT = state.scrollS = J.scrollY || 0;
    if (o.toast) toast(o.toast);
  }
  function cancel() {
    const pushed = J.pushed;
    leave({ toast: '멈췄습니다. 처음부터 다시 시작할 수 있습니다.' });
    if (pushed) history.back(); else nav.go('/', { replace: true });
  }
  function restart() {
    const pushed = J.pushed;
    const key = lastInput === 'key';
    leave();
    nav.go('/', { replace: pushed });
    // a keyboard visitor lands back on the first answer (a pointer visitor sees the first screen as it was)
    if (key && !isNarrow()) document.querySelector('#pickList .pick-c')?.focus({ preventScroll: true });
  }
  ui.restart.addEventListener('click', restart);

  /* ---------- fast-forward: `결과로` (after the human gate only) ---------- */
  function skip() {
    if (!J.approved || J.phase !== 'running' || J.skipping || !J.run?.alive || J.handoff) return;
    J.skipping = true;
    J.run.fixedSpeed = 1e4;
    rail?.skipDone();
    log.act(`${COPY.skip} · 남은 기록을 바로 채웁니다`);   // echoes the rail's button label
  }
  function endSkip() {
    if (!J.skipping) return;
    J.skipping = false;
    if (J.run) J.run.fixedSpeed = null;
  }

  /* ---------- world helpers ---------- */
  // the studio's frame reports its rect; the world follows the frame element itself (tracked every frame)
  const studioWorld = (V) => ({
    benchRect(r) { const f = J.S?.slate?.api?.el; V.benchRect(f && f.isConnected ? f : r); },
    setLoad: (l) => V.setLoad(l),
    anchor: (n) => V.anchor(n),
  });
  // /services/<slug>/ → "시연 보기": the lantern's own light becomes the capsule (no condense); svc = the area
  function capAtLantern(svc) {
    const w = W.impl?.world;
    const L0 = w?.lantern.items[SVC_KEYS.indexOf(svc)];
    if (!L0) return;
    w.cap.pos.copy(L0.grp.position);
    w.cap.tr.reset(w.cap.pos);
    w.cap.vis = 0;
  }
  // the spec card unfolds from the capsule's right end, just under "< _ >"
  function placeSpec(card, V) {
    if (isNarrow() || !card) return;
    const a = V.anchor('capsule'), s = V.anchor('slot');
    const glyph = Math.max(a.y + (a.h || 24) / 2, s.bottom ?? s.y + 20);
    const top = Math.round(clamp(glyph + 26, 104, innerHeight * 0.42));
    ui.specHost.style.top = `${top}px`;
    ui.specHost.style.setProperty('--jr-spec-max', `${Math.round(innerHeight - top - 18)}px`);
    const hr = ui.specHost.getBoundingClientRect();
    card.style.transformOrigin = `${Math.round(clamp((a.right ?? a.x) - hr.left, 0, hr.width))}px 0`;
  }
  bus.on('resize', () => { const c = ui.specHost.querySelector('.st-spec'); if (c && J.deep) placeSpec(c, J.V); });

  // the capsule opens into a light rectangle exactly behind the DOM frame; the frame fades in over it
  async function mountFrame(S, V, ctx, run) {
    ui.bench.classList.add('jr-pre');
    const slate = S.slate.mount(ctx);
    await nextFrame();
    await run.within(V.benchEnter(slate.el, run), 1800);
    ui.bench.classList.remove('jr-pre');
    return slate;
  }
  // phones: during the rise the frame steps back to 82% so the world can be seen flowing past
  async function shrinkFrame(run) {
    if (!isNarrow() || REDUCED) return;
    ui.bench.classList.add('jr-shrink');
    await run.wait(2100);
    ui.bench.classList.remove('jr-shrink');
    await run.wait(500);
  }
  function zone(k, depth) {
    root.dataset.zone = k === 'ship' ? 'home' : depth >= 1000 ? 'deep' : depth >= 100 ? 'lantern' : 'surface';
  }

  /* =========================================================================
     the journey
     o: { q, svc: area, scenario, example, closest, price, homepage, handoff, srcEl, sampleText, entry: 'ask'|'lantern'|'build' }
     (entry 'ask' = a first-screen chip: its example's words condense into the capsule)
     ========================================================================= */
  async function start(o) {
    if (J.phase !== 'idle') teardown();
    const run = Runs.start();
    Object.assign(J, { run, phase: 'running', approved: false, skipping: false, handoff: !!o.handoff, meta: o, S: null, ctx: null });
    if (root.classList.contains('jr-on')) J.scrollY = J.scrollY || 0; else J.scrollY = scrollY;
    setSpeed(BASE_SPEED);
    const H = !!o.handoff;
    const area = H ? 'handoff' : o.svc;
    const scenario = H ? 'handoff' : o.scenario || SVC[o.svc].scenarios[0];
    const studio = alongside(studioMod());
    const railP = alongside(railReady());
    try {
      // the layout follows the tier; a world tier whose world has not arrived runs 'deep' over NullWorld
      const deep = worldTier();
      const layout = deep ? 'deep' : 'standalone';
      ensureVariant(deep ? 'deep' : 'standalone');
      // B1 · the request, at once: a chip's example is logged as "예시 ▸ …" (never put in the visitor's mouth)
      if (o.example) L.example(o.q); else L.you(o.q);
      L.fold();
      if (deep && !W.ready) { const p = env.loadWorld(); if (p) await run.within(p, o.entry === 'ask' ? 1500 : 4500); }
      const V = deep && W.ready ? W : NullWorld;
      Object.assign(J, { V, deep });
      const cd = V.ready && o.entry === 'ask' && o.srcEl?.isConnected ? V.condense(o.srcEl, o.sampleText || o.q, run) : null;
      await run.race(railP);
      enter(layout, H);
      const path = buildPath(area, H ? null : scenario, o.q);
      if (nav.page?.name === 'build') nav.replace(path);
      else { nav.push(path); J.pushed = true; }

      const { mountStudio } = await run.race(studio);
      const S = await mountStudio(document.body, { layout, log: L, world: studioWorld(V) });
      J.S = S;
      await run.race(S.load(scenario));
      // earlier journeys' cards stay in the log's history; only the newest keeps the ids it is labelled by
      for (const h of el.convo.querySelectorAll('#st-ship-h, #st-gate-q')) { h.removeAttribute('id'); h.closest('[aria-labelledby]')?.removeAttribute('aria-labelledby'); }
      const ctx = { q: o.q, svc: area, scenario, rev: 1, notes: [], revs: [], spec: null, example: !!o.example, price: !!o.price, homepage: !H && !o.example && !!o.homepage, draftRev: 1 };
      if (!H) ctx.closest = o.example ? null : (o.closest ?? null);
      J.ctx = ctx;

      const T = (p, ms) => run.within(p, ms);
      const stage = (k, st, label) => { const d = Math.round(V.depth()); zone(k, d); bus.emit('stage', { k, st, label, depth: d, svc: area, scenario }); };
      const qa = (tag) => bus.emit('qa', { tag });
      const qaLater = (tag, ms) => { run.wait(ms).then(() => qa(tag), () => {}); };

      stage('spec', 'act', H ? 'Mail draft' : undefined);
      if (H) {
        bus.emit('stage', { k: 'handoff', st: 'act', depth: 0, svc: area, scenario });
        for (const k of ['build', 'test', 'review']) rail?.set(k, 'na');   // known from the start: nothing to build (the stage events follow the gate)
      }
      if (!deep) S.slate.mount(ctx);   // standalone: the frame is on screen first — scope board or letter, nothing built
      const ack = alongside(S.narrate.opening(ctx, run));
      if (cd) { qaLater('condense', 520); await T(cd, 2200); }

      // B2 · down to the service lantern (−200 m); out of scope: straight up to the surface light instead
      if (H) { if (deep) { qaLater('surface', 900); await T(V.toSurfaceDirect(run), 3200); } }
      else if (deep && o.entry === 'build') { run.fixedSpeed = 1e4; try { await T(V.toLantern(o.svc, run), 600); } finally { run.fixedSpeed = null; } }
      else { if (o.entry === 'lantern') capAtLantern(o.svc); await T(V.toLantern(o.svc, run), 3200); }
      await ack;
      qa('lantern');

      // B3 · the spec: an opaque card under "< _ >" (a handoff's spec is the mail draft, streamed into the frame)
      if (H) {
        if (deep) await mountFrame(S, V, ctx, run);
        // a mail draft has no pixel width worth showing
        const w = S.slate.api?.el.querySelector('.st-url-w');
        if (w) { w.previousSibling?.remove(); w.remove(); }
        await S.spec.stream(ctx, run);
      } else {
        const card = S.spec.mount();
        if (deep) placeSpec(card, V);
        await S.spec.stream(ctx, run);
      }
      await S.narrate.afterSpec(ctx, run);
      stage('spec', 'done');
      qa('spec');

      // B4 · the human gate: a thin warm beam from the surface, the empty ">" beside the capsule.
      // The visitor approves, or picks one of the scenario's preset revisions (spec → r2) and comes back here.
      if (deep && !H) { V.slot(true); V.humanBeam(true); }
      let act;
      for (;;) {
        J.phase = 'gate';
        stage('gate', 'wait');
        await S.narrate.gateWait(ctx, run);
        const ask = S.gate.ask(ctx, run);
        // the gate takes the card's footer (desktop) or the sheet's (phones): keep the amber assumptions in view
        const body = [...document.querySelectorAll('#specHost .st-spec-b, #st-sheet .st-spec-b')].at(-1);
        if (body) body.scrollTop = body.scrollHeight;
        qaLater('gate', REDUCED ? 140 : 560);
        act = await ask;
        if (act.type === 'approve') break;
        J.phase = 'running';
        rail?.set('gate', '');
        stage('spec', 'act', H ? 'Note' : `Spec r${ctx.rev + 1}`);
        await Promise.all([S.spec.revise(ctx, act.note, run), deep && !H ? T(V.lanternPulse(run), 1400) : null]);
        stage('spec', 'done');
        qa('revised');
      }

      // B5 · the ">" flies from the button and closes "< _ >"; a capped warm bloom
      J.phase = 'running';
      J.approved = true;
      const target = deep && !H ? V.anchor('slot') : (S.slate.api?.slotRect() ?? null);
      const bloom = deep ? T(V.approveBloom(run), 2600) : null;
      await S.gate.stamp(act.glyphEl, target, run);
      if (deep && !H) V.slot('filled');
      if (deep && H) S.slate.api?.shut();
      ctx.approved = true;
      stage('gate', 'human');
      qa('stamp');
      await Promise.all([S.narrate.approved(ctx, run), bloom]);

      if (H) {
        // nothing to build: straight to the person (rail 03–05 n/a)
        for (const k of ['build', 'test', 'review']) stage(k, 'na');
        stage('ship', 'act', 'Preparing handoff');
        const b2 = deep ? T(V.deliverBloom(run), 2200) : null;
        const out = await S.deliver(ctx, run);
        await b2;
        stage('ship', 'done', 'Handoff ready');
        return finish(out);
      }

      // B6 · approved, so now it goes down: along the Podway current, through two gates, to −4,000 m
      stage('build', 'act');
      await S.spec.fold(run);
      const dive = T(V.dive(run), 3400);
      qaLater('dive', 900);
      await Promise.all([S.narrate.dive(ctx, run), dive]);

      // B7 · the capsule becomes a light rectangle behind the screen-fixed frame
      const slate = deep ? await mountFrame(S, V, ctx, run) : S.slate.mount(ctx);
      if (deep) V.pod(true);
      qa('frame');

      // B8 · build (Dolgorae's pod circles behind; a dispatch pulse per section)
      const mid = Math.min(3, (S.sc.build?.sections?.length || 4) - 1);
      await S.build(ctx, run, { onSection: (i) => { V.dispatchPulse(); if (i === mid) qa('build-mid'); } });
      V.pod(false);
      stage('build', 'done');

      // B9–B11 · Gaori tests: exit 1 → Podway rework r2 → fix → exit 0
      stage('test', 'act', 'run 1');
      let sweeps = 0;
      await S.test(ctx, run, {
        sweep: (ms) => {
          if (++sweeps === 2) stage('test', 'act', 'run 2'); else qaLater('scan', Math.round(ms * 0.5));
          return V.gaoriSweep(ms, run, (y) => slate.scanAt(y));
        },
        fail: () => { stage('test', 'fail', 'exit 1'); V.fail(); qaLater('failbox', 520); },
        rework: () => { stage('rework', 'act', 'rework r2'); qaLater('arc', 1150); return V.reworkCurrent(run); },
        repair: () => V.repair(run),
        pass: () => { stage('test', 'done', 'exit 0'); V.pass(); },
      });

      // B12 · Mulgae reviews: advisory pins, one by one
      stage('review', 'act');
      V.mulgae(true);
      await S.review(ctx, run, { note: (i) => { if (i === 1) qaLater('pins', 450); } });
      V.mulgae(false);
      stage('review', 'done', `${S.sc.review?.notes?.length ?? 2} advisories applied`);

      // B13 · rise: the frame stays, the world flows down to 0 m, surface light fills from the top
      stage('ship', 'act');
      ui.bench.classList.add('jr-warm');
      qaLater('rise', 1500);
      await Promise.all([T(V.rise(run), 4200), S.narrate.rise(ctx, run), shrinkFrame(run)]);

      // B14 · delivery: bloom, then unlock → toggle → chip → card, within about a second
      endSkip();
      const b2 = deep ? T(V.deliverBloom(run), 2200) : null;
      const out = await S.deliver(ctx, run);
      await b2;
      stage('ship', 'done', 'Done · Podway record');
      finish(out);
    } catch (e) {
      if (isCancel(e)) return;
      console.error(e);
      leave({ toast: '시연을 이어 가지 못했습니다. 처음부터 다시 시작해 주세요.' });
    } finally {
      if (run.alive) run.done();
    }
  }

  function finish(out) {
    J.phase = 'delivered';
    endSkip();
    if (J.ctx) nav.replace(buildPath(J.ctx.svc, J.ctx.svc === 'handoff' ? null : J.ctx.scenario, J.ctx.q));
    if (isNarrow()) { root.classList.add('jr-flow'); root.classList.remove('lock'); }
    J.run?.wait(REDUCED ? 200 : 1100).then(() => bus.emit('qa', { tag: 'delivered' }), () => {});
    if (lastInput === 'key') out?.card?.querySelector('.st-cta')?.focus({ preventScroll: !isNarrow() });
  }

  /* =========================================================================
     entry points (all taps or links — nothing typed)
     ========================================================================= */
  function begin(text, r, src = {}) {
    if (r.type === 'commission') return start({ q: text, svc: r.svc, scenario: r.scenario, example: !!r.example, closest: r.closest, price: r.price, homepage: !!r.homepage, srcEl: src.el, sampleText: src.text || text, entry: src.entry || 'ask' });
    return start({ q: text, handoff: true, srcEl: src.el, sampleText: src.text || text, entry: src.entry || 'ask' });
  }
  // key: an area (a chip, a lantern: its first demo, or o.scenario) or a scenario (service pages: data-demo)
  function startExample(key, o = {}) {
    const area = SVC[key] ? key : SCENARIO_AREA[key];
    if (busy() || !area) return;
    const scenario = SVC[key] ? (SVC[area].scenarios.includes(o.scenario) ? o.scenario : SVC[area].scenarios[0]) : key;
    const src = o.srcEl;
    start({ q: exampleOf(scenario), svc: area, scenario, example: true, closest: null, srcEl: src, sampleText: src?.textContent?.replace(/\s+/g, ' ').trim(), entry: o.entry || (o.fromLantern || !src ? 'lantern' : 'ask') });
  }
  // /build/?svc=<area>&scenario=<scenario>&q= : starts from the spec; the approval is asked for again, every time
  function fromRoute(page) {
    if (busy()) return;
    const area = page.qsvc && page.qsvc !== 'handoff' ? page.qsvc : null;
    // no words: the area's demo (a handoff without a request has nothing to hand over)
    if (!page.q) { startExample(page.qscenario || area || 'web', { entry: 'build' }); return; }
    if (page.qsvc === 'handoff') { begin(page.q, { type: 'handoff' }, { entry: 'build' }); return; }
    const q = page.q;
    let r = intent(q);
    // the URL names the area (and maybe the demo); the words still decide closest, homepage and price
    if (area) {
      const scenario = page.qscenario || (r.type === 'commission' && r.svc === area ? r.scenario : SVC[area].scenarios[0]);
      const homepage = area === 'web' && r.type === 'commission' && !!r.homepage;
      r = { type: 'commission', svc: area, scenario, closest: closestOf(scenario, q, homepage), price: PRICE.test(q.toLowerCase()), homepage };
    }
    if (r.type !== 'commission' && r.type !== 'handoff') r = { type: 'commission', svc: 'web', scenario: 'web', closest: closestOf('web', q), price: PRICE.test(q.toLowerCase()) };
    begin(q, r, { entry: 'build' });
  }

  // a chip / lantern (main.js emits bus 'svc' {svc: area, scenario, source})
  function onSvc(ev) {
    ev.claim();
    if (busy() || !SVC[ev.svc]) return;
    startExample(ev.svc, { scenario: ev.scenario, srcEl: ev.source });
  }
  bus.on('svc', onSvc);

  /* ---------- routes: leaving a journey when the visitor goes elsewhere ---------- */
  function beforeRoute(page) {
    if (J.phase !== 'idle' && !(page.name === 'build' && page.q && busy())) leave();
  }

  /* ---------- Esc: stop (never at the gate's revision chips, never under the developer panel) ---------- */
  // (a route panel's Esc is router.js's: it also works before the journey loads, and on English pages)
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (J.S?.dev.isOpen) return;
    if (root.classList.contains('jr-logsheet')) { logSheet(false); ui.ticker.focus(); return; }
    if (busy()) {
      if (document.querySelector('.st-revbox:not([hidden])')) return;
      e.preventDefault();
      cancel();
    }
  });

  return {
    get phase() { return J.phase; },
    get ctx() { return J.ctx; },
    get S() { return J.S; },
    get deep() { return J.deep; },
    get log() { return log; },
    onSvc, start, startExample, fromRoute, beforeRoute, leave, cancel, restart, skip,
  };
}
