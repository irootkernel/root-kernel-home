// studio/standalone.js — the 'standalone' layout (A's studio without the evidence column):
// conversation | frame | vertical 6-step rail. Used by the poster / calm tiers and studio.html.
// runStandalone() is a deliberately small orchestrator for studio.html; the real one is the journey's.

import { esc, bus, Runs, isCancel, setSpeed, getSpeed, REDUCED, clamp, ease } from '../core.js?v=8999a49d35de';
import { PROCEDURE, COPY, toolLabel } from '../content.js?v=8999a49d35de';
import { createTicker } from '../log.js?v=8999a49d35de';

/* ---------- layout ---------- */

// Builds convo | bench | rail inside `host`. If the page already has the containers
// (index.html in the poster/calm tiers) nothing is rebuilt and the existing ones are returned.
export function layoutStandalone(host) {
  if (host._stRefs) return host._stRefs;
  const have = document.getElementById('bench');
  if (have) {
    host._stRefs = { convo: document.getElementById('convo'), bench: have, rail: document.getElementById('rail'), ship: document.getElementById('ship'), embedded: true };
    return host._stRefs;
  }
  host.classList.add('st-studio');
  host.innerHTML =
    '<div class="st-band" aria-hidden="true"></div>' +
    '<section class="st-zone st-zone--convo" id="st-convozone" aria-label="대화">' +
      '<div class="st-convo-h"><span>대화 기록</span><button type="button" class="st-convo-x">닫기</button></div>' +
      '<div id="convo" class="st-convo"></div>' +
      '<div class="st-convo-foot"></div>' +
    '</section>' +
    '<div class="st-zone st-zone--rail"><nav id="rail" aria-label="진행 절차"></nav></div>' +
    '<div class="st-zone st-zone--tick"><button type="button" class="st-tickbtn" aria-controls="st-convozone"></button></div>' +
    '<div class="st-zone st-zone--bench"><div id="bench" class="st-benchhost"></div><div id="ship" hidden></div></div>';
  const q = (s) => host.querySelector(s);
  host._stRefs = {
    convo: q('#convo'),
    convoZone: q('.st-zone--convo'),
    convoFoot: q('.st-convo-foot'),
    closeLog: q('.st-convo-x'),
    bench: q('#bench'),
    rail: q('#rail'),
    ship: q('#ship'),
    tick: q('.st-tickbtn'),
    embedded: false,
  };
  host._stRefs.ship.inert = true;
  return host._stRefs;
}

// Phones: the log is a sheet behind a one-line ticker. Desktop: the log is the left column.
export function wireMobileLog(refs, log) {
  if (!refs?.tick || refs.embedded) return null;
  const mq = matchMedia('(max-width: 760px)');
  let open = false;
  const zone = refs.convoZone;
  const apply = () => {
    const mob = mq.matches;
    zone.classList.toggle('st-sheet-open', mob && open);
    zone.hidden = mob && !open;
    zone.inert = mob && !open;
    if (mob && open) zone.setAttribute('role', 'dialog'); else zone.removeAttribute('role');
    if (mob && open) zone.setAttribute('aria-modal', 'true'); else zone.removeAttribute('aria-modal');
  };
  const ticker = createTicker(refs.tick, log, {
    onToggle(o) {
      open = o;
      apply();
      if (o) { refs.closeLog.focus(); refs.convo.scrollTop = refs.convo.scrollHeight; }
    },
  });
  refs.closeLog.addEventListener('click', () => { open = false; ticker.set(false); apply(); refs.tick.focus(); });
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) { e.stopPropagation(); open = false; ticker.set(false); apply(); refs.tick.focus(); }
  });
  mq.addEventListener('change', apply);
  apply();
  return { destroy() { ticker.destroy(); mq.removeEventListener('change', apply); } };
}

/* ---------- the procedure rail (vertical on desktop, 6 thin segments on phones) ---------- */

const SUB = {
  spec: toolLabel('podway'),
  gate: 'Gate · Human',
  build: toolLabel('aquarium'),
  test: toolLabel('gaori'),
  review: toolLabel('mulgae'),
  ship: toolLabel('podway'),
};
// read after each step (screen readers) and shown as the phone rail's status
const STATE_SR = { act: 'In progress', wait: 'Waiting', done: 'Done', human: 'Approved by human', fail: 'Failed', na: 'n/a' };
// returns to an earlier step, [from, to]: the human gate sends the spec back (a revision), a failed test the build (rework)
const LOOPS = { revise: ['gate', 'spec'], rework: ['test', 'build'] };
const fmtDepth = (m) => (m <= 0 ? '0 m' : `−${Math.round(m).toLocaleString('en-US')} m`);

export function mountRail(el, { ff = true } = {}) {
  el.classList.add('st-rail');
  el.innerHTML =
    `<ol class="st-rail-ol">${PROCEDURE.map((p, i) => `<li class="st-rn" data-k="${p.k}"><i class="st-rn-dot" aria-hidden="true"></i><span class="st-rn-t"><i>0${i + 1}</i> <span class="st-rn-l">${esc(p.label)}</span></span><span class="st-rn-s">${esc(SUB[p.k])}</span><span class="st-sr st-rn-sr"></span></li>`).join('')}</ol>` +
    `<svg class="st-rail-arc" aria-hidden="true">${Object.keys(LOOPS).map((k) => `<g class="st-arc" data-loop="${k}"><path class="st-arc-p" pathLength="1"/><path class="st-arc-h"/></g>`).join('')}</svg>` +
    '<div class="st-rail-now" aria-hidden="true"></div>' +
    `<div class="st-rail-foot"><span class="st-depth" title="Depth">0 m</span>${ff ? `<button type="button" class="st-ff" aria-pressed="false" title="${esc(COPY.ffTip)}">▸▸ 3×</button>` : ''}</div>`;
  const node = (k) => el.querySelector(`.st-rn[data-k="${k}"]`);
  const now = el.querySelector('.st-rail-now');
  const depthEl = el.querySelector('.st-depth');
  const ffBtn = el.querySelector('.st-ff');
  const svg = el.querySelector('.st-rail-arc');
  const on = new Set();   // the returns drawn so far (LOOPS keys)
  let depth = 0;
  let depthRaf = 0;
  let rework = false;
  let asked = false;      // the gate has asked once: a spec step after that is a revision
  let handoff = false;

  function set(k, st, label) {
    const n = node(k);
    if (!n) return;
    n.classList.remove('act', 'wait', 'done', 'human', 'fail', 'na');
    if (st) n.classList.add(st);
    n.querySelector('.st-rn-sr').textContent = STATE_SR[st] ? ` · ${STATE_SR[st]}` : '';
    const sub = n.querySelector('.st-rn-s');
    sub.textContent = st === 'na' ? 'n/a' : label || (handoff ? HSUB[k] : SUB[k]);
    for (const x of el.querySelectorAll('.st-rn')) x.removeAttribute('aria-current');
    if (st === 'act' || st === 'wait' || st === 'fail') n.setAttribute('aria-current', 'step');
    if (st === 'act' || st === 'wait' || st === 'fail' || (k === 'ship' && st === 'done')) {
      const i = PROCEDURE.findIndex((p) => p.k === k);
      const t = n.querySelector('.st-rn-l').textContent;
      const tone = st === 'wait' ? 'a' : st === 'fail' ? 'r' : '';
      now.innerHTML = `<i>0${i + 1}</i><span>${esc(t)}</span><span class="st-now-s ${tone}">${esc(k === 'ship' && st === 'done' ? 'Done' : label || STATE_SR[st])}</span>${rework ? '<span class="st-now-rw">rework r2</span>' : ''}`;
    }
  }

  // A return leaves the later node's dot, bends through the rail's left margin and ends, arrowhead last, at the
  // earlier node's dot. Measured in the SVG's own box, and redrawn whenever a node changes size: a sub-label that
  // gains or loses lines moves every dot below it.
  function drawLoops() {
    if (!on.size) return;
    const box = svg.getBoundingClientRect();
    if (!box.width) return;   // hidden (the phone rail) or not laid out yet
    const dot = (k) => node(k).querySelector('.st-rn-dot').getBoundingClientRect();
    for (const k of on) {
      const f = dot(LOOPS[k][0]), t = dot(LOOPS[k][1]);
      const x = Math.min(f.left, t.left) - box.left - 2;
      const yf = f.top - box.top + f.height / 2, yt = t.top - box.top + t.height / 2;
      const g = svg.querySelector(`[data-loop="${k}"]`);
      g.querySelector('.st-arc-p').setAttribute('d', `M${x} ${yf} C${x - 12} ${yf} ${x - 12} ${yt} ${x} ${yt}`);
      g.querySelector('.st-arc-h').setAttribute('d', `M${x - 4.5} ${yt - 3.5} L${x} ${yt} L${x - 4.5} ${yt + 3.5}`);
    }
  }
  function loop(k) {
    on.add(k);
    requestAnimationFrame(() => {
      if (!on.has(k)) return;   // reset meanwhile
      drawLoops();
      svg.querySelector(`[data-loop="${k}"]`).classList.add('on');
      if (k === 'rework') el.classList.add('st-rail--arc');
    });
  }

  function spinDepth(to) {
    cancelAnimationFrame(depthRaf);
    const from = depth;
    depth = to;
    if (REDUCED || from === to) { depthEl.textContent = fmtDepth(to); return; }
    const t0 = performance.now(), dur = 800;
    const tick = (t) => {
      const k = clamp((t - t0) / dur);
      depthEl.textContent = fmtDepth(from + (to - from) * ease.io3(k));
      if (k < 1) depthRaf = requestAnimationFrame(tick);
    };
    depthRaf = requestAnimationFrame(tick);
  }

  const HSUB = { spec: 'Mail draft', gate: 'Gate · Human', build: 'n/a', test: 'n/a', review: 'n/a', ship: 'Inquiry' };
  function mode(h) {
    handoff = !!h;
    el.classList.toggle('st-rail--handoff', handoff);
    const titles = handoff ? { spec: 'Request', gate: 'Human check', ship: 'Handoff' } : {};
    for (const p of PROCEDURE) {
      const n = node(p.k);
      n.querySelector('.st-rn-l').textContent = titles[p.k] || p.label;
      n.querySelector('.st-rn-s').textContent = handoff ? HSUB[p.k] : SUB[p.k];
    }
  }

  function reset() {
    rework = false;
    asked = false;
    on.clear();
    el.classList.remove('st-rail--arc');
    for (const g of svg.children) g.classList.remove('on');
    for (const p of PROCEDURE) set(p.k, '', '');
    now.textContent = '';
    spinDepth(0);
    if (ffBtn) ffBtn.hidden = false;
  }

  const off = bus.on('stage', (e) => {
    if (e.depth != null) spinDepth(e.depth);
    if (e.k === 'rework') {
      rework = true;
      set('test', 'fail', 'exit 1');
      set('build', 'act', 'fix r2');
      loop('rework');
      return;
    }
    if (e.k === 'test' && e.st === 'act' && rework) set('build', 'done');
    if (e.k === 'spec' && e.st === 'act' && asked) loop('revise');
    if (e.k === 'gate' && e.st === 'wait') { asked = true; if (ffBtn) ffBtn.hidden = true; }
    else if (e.k === 'gate' && e.st === 'human') { if (ffBtn) ffBtn.hidden = false; }
    set(e.k, e.st, e.label);
  });
  const offSpeed = bus.on('speed', (s) => ffBtn?.setAttribute('aria-pressed', String(s > 1)));
  ffBtn?.addEventListener('click', () => setSpeed(getSpeed() > 1 ? 1 : 3));
  ffBtn?.setAttribute('aria-pressed', String(getSpeed() > 1));
  // keep the drawn returns on their nodes: any node that changes size moves the dots below it
  const ro = new ResizeObserver(drawLoops);
  for (const n of el.querySelectorAll('.st-rn')) ro.observe(n);
  addEventListener('resize', drawLoops);

  return { set, mode, reset, destroy() { off(); offSpeed(); ro.disconnect(); removeEventListener('resize', drawLoops); } };
}

/* ---------- a minimal orchestrator for studio.html ---------- */

// Depth only: every world verb is a no-op here (NullWorld-like), the story is the same.
function nullWorld() {
  let d = 0;
  return { ready: false, depth: () => d, at(m) { d = m; }, anchor: () => null };
}

// spec → human gate (with revisions) → build → test (fail → rework → pass) → review → ship.
// The handoff path: request → human check → (03–05 n/a) → hand over.
// With S.layout === 'deep' it follows the deep order instead: the frame appears only after the
// approval, and the ">" stamp lands on world.anchor('slot').
// svc is the service area (web · erp · ax, or 'handoff'); scenario the demo it loads (web · app · consult).
export async function runStandalone({ q, svc, scenario = svc, log, S, example = false, closest, price = false, homepage = false, qa = () => {}, world = null } = {}) {
  const run = Runs.start();
  const W = nullWorld();
  const deep = S.layout === 'deep';
  const stage = (k, st, label) => bus.emit('stage', { k, st, label, depth: W.depth(), svc, scenario });
  const ctx = { q, svc, scenario, rev: 1, notes: [], spec: null, example, price, homepage: !!homepage && !example, draftRev: 1 };
  if (closest !== undefined) ctx.closest = closest;
  try {
    await S.load(scenario);
    const handoff = S.sc.kind === 'handoff';
    W.at(handoff ? 0 : 200);
    stage('spec', 'act', handoff ? 'Mail draft' : undefined);
    if (example) log.example(q); else log.you(q);
    if (!deep || handoff) S.slate.mount(ctx);
    await S.narrate.opening(ctx, run);
    if (!handoff) S.spec.mount();
    await S.spec.stream(ctx, run);
    qa('spec');
    await S.narrate.afterSpec(ctx, run);
    stage('spec', 'done');

    let act;
    for (;;) {
      stage('gate', 'wait', 'Waiting');
      await S.narrate.gateWait(ctx, run);
      qa('gate');
      act = await S.gate.ask(ctx, run);
      if (act.type === 'approve') break;
      stage('gate', '');
      stage('spec', 'act', handoff ? 'Note' : `Spec r${ctx.rev + 1}`);
      await S.spec.revise(ctx, act.note, run);
      qa('revised');
      stage('spec', 'done');
    }
    await S.gate.stamp(act.glyphEl, deep ? world?.anchor?.('slot') ?? null : null, run);
    stage('gate', 'human', 'Approved by human');
    qa('stamped');
    await S.narrate.approved(ctx, run);

    if (handoff) {
      for (const k of ['build', 'test', 'review']) stage(k, 'na');
      stage('ship', 'act', 'Preparing handoff');
      const out = await S.deliver(ctx, run);
      stage('ship', 'done', 'Handoff ready');
      qa('ship');
      return out;
    }

    await S.spec.fold(run);
    W.at(4000);
    stage('build', 'act');
    if (deep) S.slate.mount(ctx);
    await S.narrate.dive(ctx, run);
    await S.build(ctx, run, { onSection: (i) => { if (i === 2) qa('build'); } });
    stage('build', 'done');
    stage('test', 'act', 'run 1');
    let sweeps = 0;
    await S.test(ctx, run, {
      sweep: async () => { if (++sweeps === 2) stage('test', 'act', 'run 2'); },
      fail: () => { stage('test', 'fail', 'exit 1'); qa('fail'); },
      rework: async () => { stage('rework', 'act', 'rework r2'); },
      repair: async () => { qa('repair'); },
      pass: () => { stage('test', 'done', 'exit 0'); qa('pass'); },
    });
    stage('review', 'act', 'Advisory');
    await S.review(ctx, run, { note: (i) => { if (i === 1) qa('review'); } });
    stage('review', 'done', '2 advisories applied');
    W.at(0);
    stage('ship', 'act');
    const out = await S.deliver(ctx, run);
    stage('ship', 'done', 'Done · Podway record');
    qa('ship');
    return out;
  } catch (e) {
    if (!isCancel(e)) throw e;
    return null;
  } finally {
    if (run.alive) run.done();
  }
}
