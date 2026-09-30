// journey/adapter.js — the real WorldAdapter (CONTRACT §5): the verbs the journey choreographs with the
// studio, implemented on top of world.js. main.js imports it next to world.js (the world chunk) and hands
// it to W (director.js), the facade the journey keeps.
//
// Rules for every verb: it takes the journey's Run; delays and motion use run.wait / run.tween (visible
// time, fast-forward aware, cancellable); cleanup goes through run.defer; and it tolerates being abandoned
// by run.within(p, maxMs) — each actor is "claimed" by the newest verb, so an older tween that is still
// running stops writing instead of fighting the new one.
import { clamp, lerp, sstep, ease, REDUCED } from '../core.js?v=8999a49d35de';
import { SVC_KEYS, LOGO } from '../content.js?v=8999a49d35de';
import { DEPTH, travelSeconds, rectAt, fromRect, toRect } from './director.js?v=8999a49d35de';

/* =========================================================================
   The real adapter.
   ========================================================================= */
export function createDirector(world, env = {}) {
  const { V3, THREE } = world;
  const { rig, cap, U, lantern, gaori, mulgae, bench, main, gates, humanMat } = world;
  const pod = world.pod;
  const mob = () => world.lay.narrow;
  const vp = () => world.size();

  /* ---- actor claims + run bookkeeping ---- */
  const claims = {};
  function claim(...actors) {
    const tok = { dead: false };
    for (const a of actors) { if (claims[a]) claims[a].dead = true; claims[a] = tok; }
    return tok;
  }
  const adopted = new WeakSet();
  function adopt(run) {
    if (!run || adopted.has(run)) return;
    adopted.add(run);
    // a new run starts clean: the last journey's frame, beam and creatures go back to the sea
    freshStart();
    // an aborted journey (Esc, back, restart) returns the world to exploration; a finished one keeps its last frame
    run.defer(() => { if (!run.alive) explore(); });
  }
  const tw = (run, tok, ms, fn, e = ease.io3) => run.tween(ms, (k, raw) => { if (!tok.dead) fn(k, raw); }, e);
  const tmpA = V3(), tmpB = V3(), tmpC = V3();

  function journeyCam() { rig.mode = 'journey'; rig.follow = false; rig.track = null; rig.snap = true; rig.jPos.copy(rig.pos); rig.jLook.copy(rig.look); }

  /* ---- "< _ >": the logo's brackets at the capsule's ends (projected DOM glyphs) ---- */
  const G = { l: null, r: null, state: 'off', show: false };
  function mkGlyph(cls, d, vb) {
    const NS = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', `wglyph ${cls}`); s.setAttribute('viewBox', vb); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.appendChild(p);
    (env.glyphHost || document.getElementById('labels') || document.body).appendChild(s);
    return s;
  }
  function ensureGlyphs() {
    if (G.l) return;
    G.l = mkGlyph('wglyph-l', LOGO.L, '0 0 39.5 57');
    G.r = mkGlyph('wglyph-r', LOGO.R, '144 0 38.5 57');
  }
  // geometry of "< _ >" around the projected capsule: the capsule is the bar, the brackets stand on its baseline
  function glyphBoxes() {
    const cam = world.camera;
    tmpC.setFromMatrixColumn(cam.matrixWorld, 0);
    const pL = world.project(tmpA.copy(cap.pos).addScaledVector(tmpC, -cap.halfLen));
    const pR = world.project(tmpB.copy(cap.pos).addScaledVector(tmpC, cap.halfLen), { x: 0, y: 0, z: 0, ok: false });
    const Lb = Math.max(24, Math.hypot(pR.x - pL.x, pR.y - pL.y));
    // the logo's proportions, tightened: the capsule's glow reads larger than the bar it stands for
    const gh = Lb * 0.8, gw = gh * 39.5 / 57, gap = Lb * 0.36;
    const base = (pL.y + pR.y) / 2 + Lb * 0.2;
    return { l: { x: pL.x - gap - gw, y: base - gh, w: gw, h: gh }, r: { x: pR.x + gap, y: base - gh, w: gw, h: gh }, Lb, ok: pL.ok && pR.ok };
  }
  function placeGlyphs() {
    if (!G.l || !G.show) return;
    const b = glyphBoxes();
    for (const [n, q] of [[G.l, b.l], [G.r, b.r]]) {
      n.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) scale(${(q.h / 57).toFixed(4)})`;
      n.style.visibility = b.ok && cap.vis > 0.05 ? '' : 'hidden';
    }
  }
  world.hooks.add(placeGlyphs);
  function slot(on) {
    ensureGlyphs();
    for (const n of [G.l, G.r]) { n.style.transformOrigin = '0 0'; n.style.width = '39.5px'; n.style.height = '57px'; }
    if (on) {
      G.show = true;
      G.state = on === 'filled' ? 'filled' : 'wait';
      G.r.classList.toggle('filled', G.state === 'filled');
      placeGlyphs();
      requestAnimationFrame(() => { if (G.show) { G.l.classList.add('show'); G.r.classList.add('show'); } });
    } else {
      G.show = false; G.state = 'off';
      G.l.classList.remove('show'); G.r.classList.remove('show');
    }
  }

  /* ---- the surface light: put the human light where a screen ray meets the water ---- */
  function placeSurfaceLight(cam, sx, sy) {
    const [vw, vh] = vp();
    const p = world.unprojectWith(cam, sx / vw, sy / vh, 10);
    const dir = p.sub(cam.position).normalize();
    const yS = world.SURF - 1.4;
    let pos;
    if (dir.y > 0.08 && cam.position.y < yS) pos = cam.position.clone().addScaledVector(dir, (yS - cam.position.y) / dir.y);
    else pos = cam.position.clone().addScaledVector(dir, 60);
    humanMat.uniforms.uPos.value.copy(pos);
    const dist = pos.distanceTo(cam.position);
    U.humanSize = clamp(dist * 0.12, 9.5, 30);
    return pos;
  }

  /* ---- shots ---- */
  // −200 m: the lit lantern and the parked capsule, the camera looking up ~12° toward the far surface light
  function lanternShot(i) {
    const cam = world.camera, narrow = mob();
    const Lp = lantern.items[i].base.clone();
    const yaw = Math.atan2(6, 52) * (narrow ? 0.3 : 1), pitch = 12 * Math.PI / 180;
    const fwd = V3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    const right = V3().crossVectors(fwd, V3(0, 1, 0)).normalize(), up = V3().crossVectors(right, fwd).normalize();
    const tv = Math.tan(world.rig.baseFov * Math.PI / 360), th = tv * cam.aspect;
    const D = narrow ? 19 : 16;
    const SL = narrow ? [0.86, 0.2] : [0.71, 0.2], SC = narrow ? [0.47, 0.17] : [0.49, 0.21];
    const at = (P, s) => P.clone().addScaledVector(right, (s[0] * 2 - 1) * D * th).addScaledVector(up, (1 - s[1] * 2) * D * tv);
    const camPos = Lp.clone().addScaledVector(fwd, -D).addScaledVector(right, -(SL[0] * 2 - 1) * D * th).addScaledVector(up, -(1 - SL[1] * 2) * D * tv);
    const capPos = at(camPos.clone().addScaledVector(fwd, D), SC);
    return { camPos, look: camPos.clone().addScaledVector(fwd, 10), capPos, sc: SC };
  }
  // −4,000 m: the workbench. The camera holds here while the frame is on screen (parallax off).
  function workbenchCam() {
    return mob() ? { p: V3(-9, -238.5, -63), l: V3(-11, -247, -96) } : { p: V3(-6, -240, -66), l: V3(-10, -247.5, -96) };
  }

  /* ---- verbs ---- */
  function sampleText(node, text, maxN) {
    // B sampleText: render the text with the element's font and return screen points
    const r = node.getBoundingClientRect();
    const cs = getComputedStyle(node);
    const S = 2;
    const c = document.createElement('canvas'); c.width = Math.max(4, Math.ceil(r.width * S)); c.height = Math.max(4, Math.ceil(r.height * S));
    const x = c.getContext('2d', { willReadFrequently: true });
    x.scale(S, S);
    x.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    x.fillStyle = '#fff'; x.textBaseline = 'middle';
    x.fillText(text, 0, r.height / 2 + 1);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const pts = [];
    for (let yy = 0; yy < c.height; yy += 2) for (let xx = 0; xx < c.width; xx += 2) { if (d[(yy * c.width + xx) * 4 + 3] > 110) pts.push([r.left + xx / S, r.top + yy / S]); }
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    const out = pts.slice(0, maxN);
    let minX = r.left, maxX = r.left + 1;
    for (const p of out) { if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0]; }
    return { pts: out, minX, maxX, rect: r };
  }

  // B condenseFrom: the visitor's words rise as particles and condense into the horizontal capsule (the "_")
  async function condense(srcEl, text, run) {
    adopt(run);
    const tok = claim('cap', 'cam');
    const [vw, vh] = vp();
    const birth = mob() ? [vw / 2, vh * 0.42] : [vw / 2, vh * 0.46];
    const capPos = world.screenToWorld(birth[0], birth[1], 11);
    cap.pos.copy(capPos); cap.vis = 0; cap.open = 0; cap.colT.set(0.05, 0.9, 0.84); cap.col.copy(cap.colT); cap.tr.reset(capPos); cap.face = true;
    journeyCam();
    let samp = null;
    try { if (srcEl) samp = sampleText(srcEl, text, world.SW_N); } catch (e) { samp = null; }
    const pts = samp && samp.pts.length ? samp.pts : Array.from({ length: 300 }, () => [birth[0] + (Math.random() - 0.5) * 240, birth[1] + (Math.random() - 0.5) * 20]);
    const n = Math.min(world.SW_N, pts.length);
    const span = samp ? Math.max(1, samp.maxX - samp.minX) : 240;
    for (let i = 0; i < n; i++) {
      const a = world.screenToWorld(pts[i][0], pts[i][1], 9, tmpA);
      world.swA[i * 3] = a.x; world.swA[i * 3 + 1] = a.y; world.swA[i * 3 + 2] = a.z;
      const th = Math.random() * Math.PI * 2, rr = Math.random() * 0.34;
      world.swB[i * 3] = capPos.x + (Math.random() - 0.5) * 1.3; world.swB[i * 3 + 1] = capPos.y + Math.cos(th) * rr; world.swB[i * 3 + 2] = capPos.z + Math.sin(th) * rr;
      const rx = samp ? (pts[i][0] - samp.minX) / span : Math.random();
      world.swR[i * 4] = rx * 0.85 + Math.random() * 0.15; world.swR[i * 4 + 1] = Math.random(); world.swR[i * 4 + 2] = Math.random(); world.swR[i * 4 + 3] = Math.random();
    }
    const g = world.swGeo;
    g.attributes.aA.needsUpdate = true; g.attributes.aB.needsUpdate = true; g.attributes.aR.needsUpdate = true;
    g.setDrawRange(0, n);
    const su = world.swMat.uniforms;
    su.uColA.value.set(0.92, 0.9, 0.88); su.uColB.value.set(0.1, 1.0, 0.92); su.uLift.value = 1.2; su.uSize.value = mob() ? 0.05 : 0.06; su.uFadeEnd.value = 1.0;
    su.uP.value = 0; world.swarm.visible = true;
    run.defer(() => { world.swarm.visible = false; });
    await tw(run, tok, 1250, (e, k) => { su.uP.value = k; cap.vis = sstep(0.55, 0.95, k); }, ease.linear);
    world.swarm.visible = false; cap.vis = 1;
  }

  // the capsule dives to −200 m and parks beside lantern svc; the camera follows (no fovKick)
  let park = null;
  async function toLantern(svc, run) {
    adopt(run);
    const tok = claim('cap', 'cam');
    const i = Math.max(0, SVC_KEYS.indexOf(svc));
    lantern.focus = i; lantern.pulse = 0;
    pod.calm = true; pod.dimT = 0.5;
    const J = lanternShot(i);
    journeyCam();
    cap.face = true;
    if (cap.vis < 1) world.animTo(cap, 'vis', 1, 300);
    const p0 = cap.pos.clone(), c0 = rig.pos.clone(), l0 = rig.look.clone();
    const mid = p0.clone().lerp(J.capPos, 0.55); mid.x -= 3; mid.z -= 5;
    const curve = new THREE.CatmullRomCurve3([p0, mid, J.capPos], false, 'catmullrom', 0.5);
    // the far surface light (visible above the capsule at the gate) is placed now, off until humanBeam
    const [vw, vh] = vp();
    placeSurfaceLight(world.camAt(J.camPos, J.look), J.sc[0] * vw + vw * (mob() ? 0.12 : 0.07), vh * 0.035);
    const dur = mob() ? 1600 : 2200;
    const look = V3();
    await tw(run, tok, dur, (e, k) => {
      curve.getPointAt(e, cap.pos);
      const ec = ease.ios(clamp((k - 0.05) / 0.95));
      rig.jPos.lerpVectors(c0, J.camPos, ec);
      look.lerpVectors(l0, J.look, ec);
      rig.jLook.copy(look).lerp(cap.pos, 0.4 * Math.sin(Math.PI * k));
    }, ease.io3);
    if (tok.dead) return;
    cap.pos.copy(J.capPos); rig.jPos.copy(J.camPos); rig.jLook.copy(J.look);
    park = J;
  }

  // gate waiting: a thin warm beam from the surface light to the capsule
  function humanBeam(on) {
    U.beamT = on ? 1 : 0;
    U.beamW = 1.0;
    world.animTo(U, 'humanI', on ? 0.62 : Math.min(U.humanI, 0.0), on ? 900 : 600);
  }

  async function lanternPulse(run) {
    adopt(run);
    const tok = claim('lantern');
    run.defer(() => { lantern.pulse = 0; cap.scan = -9; });
    await tw(run, tok, 900, (e, k) => { lantern.pulse = Math.sin(Math.PI * k); cap.scan = lerp(-1.4, 1.4, k); }, ease.linear);
    lantern.pulse = 0; cap.scan = -9;
  }

  // B approveBloom, capped so text stays legible. If the ">" has not been placed yet, wait for the stamp.
  async function approveBloom(run) {
    adopt(run);
    const tok = claim('bloom');
    if (G.state !== 'filled') { await run.wait(760); if (!tok.dead) slot('filled'); }
    if (REDUCED) { U.humanI = 0.8; U.warm = 0.2; return; }
    cap.colT.set(1.0, 0.86, 0.68);
    const h0 = U.humanI;
    run.defer(() => { U.beamW = 1.0; U.bloomBoost = 0; });
    await tw(run, tok, 1400, (e, k) => {
      const pulse = Math.sin(clamp(k * 1.15) * Math.PI);
      U.humanI = lerp(h0, 0.85, ease.out3(k));
      U.humanBloom = Math.min(0.6, pulse * 0.6 + k * 0.06);
      U.warm = Math.min(0.34, pulse * 0.3 + k * 0.04);
      U.bloomBoost = Math.min(0.24, pulse * 0.24);
      U.beamW = 1.0 + pulse * 2.4;
    }, ease.linear);
    U.beamW = 1.0; U.bloomBoost = 0;
    world.animTo(U, 'warm', 0.05, 900); world.animTo(U, 'humanBloom', 0.08, 900);
    cap.colT.set(0.05, 0.9, 0.84);
  }

  // −200 → −4,000 m along the main Podway current, through its two gates, settling on the workbench view
  async function dive(run) {
    adopt(run);
    const tok = claim('cap', 'cam');
    slot(false); U.beamT = 0;
    world.animTo(U, 'humanI', 0, 700); world.animTo(U, 'warm', 0, 700);
    journeyCam();
    const C = main.curve, uIn = 0.14, uOut = 0.33;
    const start = cap.pos.clone();
    const entry = C.getPointAt(uIn).clone().add(V3(0, 2.2, 0));
    const pts = [start,
      V3(lerp(start.x, entry.x, 0.3) + 4, lerp(start.y, entry.y, 0.3), lerp(start.z, entry.z, 0.3) - 6),
      V3(lerp(start.x, entry.x, 0.72) - 3, lerp(start.y, entry.y, 0.75), lerp(start.z, entry.z, 0.7) - 2), entry];
    for (const u of [0.19, 0.24, 0.29, uOut]) pts.push(C.getPointAt(u).clone().add(V3(0, 0.6 + 1.6 * (1 - (u - uIn) / (uOut - uIn)), 0)));
    const path = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    const near = (p) => { let best = 0, bd = 1e9; for (let s = 0; s <= 1; s += 0.004) { const d = path.getPointAt(s, tmpA).distanceToSquared(p); if (d < bd) { bd = d; best = s; } } return best; };
    const eIn = near(entry), gU = gates.map(g => near(g.p));
    const WB = workbenchCam();
    const c0 = rig.pos.clone(), l0 = rig.look.clone();
    const off1 = V3(0, 3.6, 10.5), look1 = V3(0, -2.4, -7), off2 = V3(-5.5, 4.6, 11.5), look2 = V3(3.5, -0.6, -5);
    const fp = V3(), fl = V3();
    const lit = [false, false];
    const M = main.mat.uniforms;
    run.defer(() => { M.uBoost.value = 0; });
    const dur = mob() ? 1600 : 2600;
    await tw(run, tok, dur, (e, k) => {
      path.getPointAt(e, cap.pos);
      const ride = sstep(eIn - 0.15, eIn + 0.1, e);
      fp.copy(off1).lerp(off2, ride).add(cap.pos); fl.copy(look1).lerp(look2, ride).add(cap.pos);
      const a = sstep(0, 0.16, k), b = sstep(0.68, 1, k);
      rig.jPos.copy(c0).lerp(fp, a).lerp(WB.p, b);
      rig.jLook.copy(l0).lerp(fl, a).lerp(WB.l, b);
      if (e > eIn) { M.uHead.value = lerp(uIn, uOut, (e - eIn) / (1 - eIn)); M.uBoost.value = 1 - sstep(0.85, 1, k); }
      gU.forEach((g, gi) => { if (!lit[gi] && e > g) { lit[gi] = true; gates[gi].flash = 1.6; } });
    }, ease.io3);
    M.uBoost.value = 0; M.uHead.value = -1;
    if (tok.dead) return;
    lantern.focus = -1; pod.calm = false; pod.dimT = 1;
    rig.jPos.copy(WB.p); rig.jLook.copy(WB.l);
  }

  function setRect(r) {
    if (!r) return;
    if (typeof Element !== 'undefined' && r instanceof Element) { bench.el = r; const b = r.getBoundingClientRect(); bench.rect = { x: b.left, y: b.top, w: b.width, h: b.height }; }
    else { bench.el = null; bench.rect = toRect(r); }
  }
  // the capsule flies to the screen-fixed frame rect and stretches into a light rectangle exactly behind it
  async function benchEnter(rect, run) {
    adopt(run);
    const tok = claim('cap', 'cam', 'bench');
    setRect(rect);
    slot(false);
    const deep = cap.pos.y < -150;
    const WB = workbenchCam();
    const c0 = rig.pos.clone(), l0 = rig.look.clone();
    const camP = deep ? WB.p : c0.clone(), camL = deep ? WB.l : l0.clone();
    journeyCam();
    rig.par.set(0, 0);
    bench.on = false; bench.open = 0; bench.fill = 1; bench.warm = 0; bench.red = 0;
    cap.face = true;
    const [vw, vh] = vp(), R = bench.rect;
    const endCam = world.camAt(camP, camL);
    const target = world.unprojectWith(endCam, (R.x + R.w / 2) / vw, (R.y + R.h / 2) / vh, bench.d);
    const p0 = cap.pos.clone();
    const mid = p0.clone().lerp(target, 0.5).add(V3(0, 1.2, 0));
    const curve = new THREE.CatmullRomCurve3([p0, mid, target], false, 'catmullrom', 0.5);
    await tw(run, tok, 650, (e, k) => {
      rig.jPos.lerpVectors(c0, camP, ease.ios(k)); rig.jLook.lerpVectors(l0, camL, ease.ios(k));
      curve.getPointAt(e, cap.pos);
    }, ease.io3);
    if (tok.dead) return;
    rig.jPos.copy(camP); rig.jLook.copy(camL);
    const L = 2 * cap.halfLen / world.worldPerPixel(bench.d);
    bench.pill = [L, L * 0.44];
    bench.on = true; bench.i = 1;
    world.buildFeeder();
    world.feeder.aT = 0.85;
    run.defer(() => { if (!run.alive) return; cap.vis = 0; bench.open = 1; });
    await tw(run, tok, 620, (e, k) => { bench.open = k; cap.vis = 1 - sstep(0, 0.5, k); cap.open = k; }, ease.linear);
    if (tok.dead) return;
    bench.open = 1; cap.vis = 0; cap.open = 0;
    world.animTo(bench, 'fill', 0.3, 800); world.animTo(bench, 'i', 0.62, 1400);
  }
  function benchRect(r) { setRect(r); if (bench.on) world.buildFeeder(); }
  const benchProjectedRect = () => world.benchProjectedRect();

  // Dolgorae's pod circles behind the frame; the other creatures stay calm (one actor per beat)
  function podOn(on) {
    pod.mode = on ? 'bench' : 'ambient';
    pod.dimT = 1;
    gaori.dimT = on ? 0.45 : 1; mulgae.dimT = on ? 0.4 : 1;
  }
  const dispatchPulse = () => world.dispatchPulse();

  // Gaori glides above the frame's top edge; its curtain falls through the frame and onY reports the
  // projected lead edge (0 top → 1 bottom) every frame so the DOM scan band stays in sync
  async function gaoriSweep(ms, run, onY) {
    adopt(run);
    const tok = claim('gaori');
    const Gr = gaori;
    Gr.mode = 'bench'; Gr.leaveIn = -1; Gr.dimT = 1; Gr.pitchT = 0.36;
    pod.dimT = 0.35; mulgae.dimT = 0.35;
    const place = () => {
      const r = bench.rect, [vw] = vp();
      const gy = Math.max(r.y - (mob() ? 30 : 56), 26);
      world.screenToWorld(r.x + r.w * 0.5, gy, bench.d - 7, Gr.goal);
      Gr.goalHead = Math.atan2(bench.fwd.x, bench.fwd.z) + 0.42;
      const spanPx = Math.min(r.w * 0.78, mob() ? vw * 0.8 : 560);
      Gr.scaleT = spanPx * world.worldPerPixel(bench.d - 7) / 14.4;
    };
    place();
    let y01 = 0;
    const hook = () => {
      if (tok.dead) return;
      place();
      const r = bench.rect;
      const pr = world.project(tmpA.copy(Gr.pos).addScaledVector(V3(0, 1, 0), -Gr.curtainLen));
      y01 = clamp((pr.y - r.y) / r.h);
      if (Gr.curtainA > 0.02 && onY) onY(y01);
    };
    world.hooks.add(hook);
    run.defer(() => { world.hooks.delete(hook); });
    // glide in (from wherever it was) if it is far from its place above the frame
    if (Gr.pos.distanceTo(Gr.goal) > 3) await run.wait(900);
    const cam = world.camera;
    const lenFor = (e) => {
      const r = bench.rect;
      const depth = tmpB.copy(Gr.pos).sub(cam.position).dot(bench.fwd);
      const P = world.screenToWorld(r.x + r.w / 2, r.y + r.h * e, Math.max(1, depth), tmpC);
      return Math.max(0.01, Gr.pos.y - P.y);
    };
    Gr.curtainLen = lenFor(0);
    await tw(run, tok, ms, (e, k) => { Gr.curtainA = Math.min(1, k * 8) * 0.9; Gr.curtainLen = lenFor(e); }, ease.ios);
    if (onY) onY(1);
    world.hooks.delete(hook);
    world.animTo(Gr, 'curtainA', 0, 380);
  }
  function fail() { gaori.red = 1; bench.red = 1; U.red = 1; }
  function pass() {
    gaori.red = 0; gaori.teal = 1; bench.teal = 1; bench.red = 0; U.red = 0;
    gaori.leaveIn = 1.4; gaori.pitchT = 0; world.animTo(gaori, 'curtainA', 0, 300);
    pod.dimT = 1; mulgae.dimT = 1;
  }

  // the current visibly runs backwards (~1 s): test → build rework
  async function reworkCurrent(run) {
    adopt(run);
    const tok = claim('current');
    const F = world.feeder, M = main.mat.uniforms, FU = F.U;
    const restore = () => { main.dir = 1; F.dir = 1; FU.uBoost.value = 0; FU.uHead.value = -1; M.uBoost.value = 0; M.uHead.value = -1; };
    run.defer(restore);
    await tw(run, tok, 1100, (e, k) => {
      const back = Math.sin(Math.PI * clamp(k * 1.05));
      main.dir = lerp(1, -2.4, back); F.dir = lerp(1, -3, back);
      FU.uHead.value = 1 - k * 1.1; FU.uBoost.value = back;
      M.uHead.value = lerp(F.u, F.u - 0.16, k); M.uBoost.value = back * 0.9;
    }, ease.linear);
    restore();
  }
  // repair sparks travel around the frame's edges
  async function repair(run) {
    adopt(run);
    const tok = claim('repair');
    run.defer(() => { U.rimI = 0; bench.beadI = 0; });
    await tw(run, tok, 1300, (e, k) => { U.rimI = Math.sin(Math.PI * k) * 1.3; bench.beadS = e * 1.25; bench.beadI = Math.sin(Math.PI * k); }, ease.io3);
    U.rimI = 0; bench.beadI = 0;
  }
  // Mulgae circles behind the frame; its arcs show in the margins
  function mulgaeOn(on) {
    mulgae.mode = on ? 'bench' : 'ambient';
    mulgae.w = on ? 1.15 : 2.2; mulgae.dimT = 1;
    pod.dimT = on ? 0.35 : 1; gaori.dimT = on ? 0.4 : 1;
  }

  // the frame stays, the world flows down to 0 m, surface light fills from the top
  async function rise(run) {
    adopt(run);
    const tok = claim('cam', 'rise');
    gaori.mode = 'ambient'; gaori.curtainA = 0; gaori.scaleT = 1.25; gaori.pitchT = 0; gaori.dimT = 1;
    mulgae.mode = 'ambient'; mulgae.w = 2.2; mulgae.dimT = 1;
    pod.mode = 'ambient'; pod.calm = false; pod.dimT = 1;
    world.feeder.aT = 0;
    journeyCam();
    const end = world.lay.poses[0];
    const p0 = rig.pos.clone(), l0 = rig.look.clone(), p1 = end.p.clone(), l1 = end.t.clone();
    const [vw, vh] = vp(), R = bench.rect;
    placeSurfaceLight(world.camAt(p1, l1), R && R.w > 1 ? R.x + R.w / 2 : vw / 2, vh * 0.05);
    const dur = mob() ? 2800 : 3300;
    await tw(run, tok, dur, (e, k) => {
      rig.jPos.lerpVectors(p0, p1, e); rig.jLook.lerpVectors(l0, l1, ease.ios(k));
      U.humanI = sstep(0.55, 1, k) * 0.72;
      bench.warm = sstep(0.6, 1, k) * 0.55;
    }, ease.io3);
    if (tok.dead) return;
    rig.jPos.copy(p1); rig.jLook.copy(l1);
  }
  // warm bloom (≤0.5), settling into a calm surface light
  async function deliverBloom(run) {
    adopt(run);
    const tok = claim('bloom');
    if (REDUCED) { U.warm = 0.16; bench.warm = 1; return; }
    const h0 = U.humanI, w0 = bench.warm;
    run.defer(() => { U.bloomBoost = 0; });
    await tw(run, tok, 1600, (e, k) => {
      const pulse = Math.sin(clamp(k * 1.2) * Math.PI);
      U.warm = Math.min(0.5, pulse * 0.5 * (1 - k) + k * 0.16);
      U.humanBloom = Math.min(0.5, pulse * 0.5);
      U.bloomBoost = Math.min(0.2, pulse * 0.2);
      U.humanI = lerp(h0, 0.78, k);
      bench.warm = lerp(w0, 1, k);
    }, ease.linear);
    U.bloomBoost = 0; U.warm = 0.16; U.humanBloom = 0.1;
  }

  // handoff: straight up to the surface light, no dive
  async function toSurfaceDirect(run) {
    adopt(run);
    const tok = claim('cap', 'cam');
    slot(false);
    cap.face = true;
    if (cap.vis < 1) world.animTo(cap, 'vis', 1, 300);
    journeyCam();
    const from = cap.pos.clone();
    const light = V3(from.x * 0.5, world.SURF - 1.4, from.z - 16);
    humanMat.uniforms.uPos.value.copy(light); U.humanSize = 9.5;
    const stop = light.clone().add(V3(0, -6.8, 1.9));
    const camEnd = stop.clone().add(V3(0, -14.8, 14.6)), lookEnd = stop.clone().add(V3(0, -0.6, -0.4));
    const dur = clamp(900 + (stop.y - from.y) * 6.5, 1200, 2600);
    const c0 = rig.pos.clone(), l0 = rig.look.clone();
    const mid = V3(lerp(from.x, stop.x, 0.5), lerp(from.y, stop.y, 0.62), lerp(from.z, stop.z, 0.5));
    const curve = new THREE.CatmullRomCurve3([from, mid, stop], false, 'catmullrom', 0.5);
    await tw(run, tok, dur, (e, k) => {
      curve.getPointAt(e, cap.pos);
      rig.jPos.lerpVectors(c0, camEnd, ease.ios(k));
      tmpA.lerpVectors(l0, lookEnd, ease.ios(k));
      rig.jLook.copy(tmpA).lerp(cap.pos, 0.3 * Math.sin(Math.PI * k));
      U.humanI = Math.max(U.humanI, sstep(0.25, 1, k) * 0.8);
    }, ease.io3);
    if (tok.dead) return;
    rig.jPos.copy(camEnd); rig.jLook.copy(lookEnd);
  }

  // route navigation (open-source/, technology/, products/ …); negative meters = above the surface
  const fForMeters = (m) => {
    if (m < -0.5) return 4;
    const D = [0, 200, 4000, 10935];
    for (let k = 0; k < 3; k++) if (m <= D[k + 1]) return k + clamp((m - D[k]) / (D[k + 1] - D[k]));
    return 3;
  };
  async function travelTo(meters, run) {
    adopt(run);
    const tok = claim('cam');
    const m = typeof meters === 'string' ? (DEPTH[meters] ?? 0) : meters;
    const f = fForMeters(m);
    const pose = world.poseAt(f, { p: V3(), t: V3() });
    const m0 = depth();
    journeyCam();
    if (cap.vis > 0) world.animTo(cap, 'vis', 0, 500);
    const p0 = rig.pos.clone(), l0 = rig.look.clone();
    // crossing the surface: pass just under it so the break-through reads
    const cross = (m < -0.5) !== (m0 < -0.5);
    const via = cross ? V3(lerp(p0.x, pose.p.x, 0.7), world.SURF - 5, lerp(p0.z, pose.p.z, 0.7)) : null;
    const curve = via ? new THREE.CatmullRomCurve3([p0, via, pose.p], false, 'catmullrom', 0.5) : null;
    await tw(run, tok, travelSeconds(m - m0) * 1000, (e, k) => {
      if (curve) curve.getPointAt(e, rig.jPos); else rig.jPos.lerpVectors(p0, pose.p, e);
      rig.jLook.lerpVectors(l0, pose.t, ease.ios(k));
    }, ease.io3);
    if (tok.dead) return;
    rig.jPos.copy(pose.p); rig.jLook.copy(pose.t);
    env.onTravel?.(f);
  }

  // camera to a creature (open-source/<tool>) and its card
  function focusTool(id) {
    const labels = env.labels;
    if (!id) { if (rig.track) { rig.track = null; } labels?.closeCard(); return; }
    const p = world.pickables.find(q => q.key === id) || (id === 'aquarium' ? { pos: () => gaori.pos } : null);
    if (!p) return;
    claim('cam');
    const fwd = world.camera.getWorldDirection(V3()); fwd.y = 0; fwd.normalize();
    const D = { gaori: 34, aquarium: 44, dolgorae: 30, mulgae: 16, sanho: 15, sorage: 10, atn: 13, podway: 15, dispatch: 13 }[id] || 16;
    const right = V3(-fwd.z, 0, fwd.x);
    rig.mode = 'journey'; rig.follow = false; rig.snap = false; rig.jK = 2.2;
    rig.jLook.copy(rig.look);
    // the creature sits right of centre: the camera stands a little to its left, behind the current view direction
    rig.track = { fn: p.pos, off: V3().addScaledVector(fwd, -D).addScaledVector(right, -D * 0.28).add(V3(0, D * 0.34, 0)) };
    labels?.openCard(id, p.pos);
  }

  function setLoad(l) { world.setLoad(l); }
  function setTier(t) {
    const order = ['low', 'mid', 'high'];
    // during a journey the tier only goes down
    if (env.state?.mode === 'journey' && order.indexOf(t) > order.indexOf(world.tier)) return world.tier;
    return world.setTier(t);
  }
  function depth() { return world.camDepthMeters(world.camera.position.y); }

  function anchor(name) {
    const [n, arg] = String(name).split(':');
    const [vw, vh] = vp();
    if (n === 'capsule') { const pr = world.project(cap.pos); const b = glyphBoxes(); return rectAt(pr.x, pr.y, b.Lb, b.Lb * 0.44); }
    if (n === 'slot') {
      if (G.r && G.show) { const r = G.r.getBoundingClientRect(); if (r.width) return fromRect(r); }
      const q = glyphBoxes().r; return rectAt(q.x + q.w / 2, q.y + q.h / 2, q.w, q.h);
    }
    if (n === 'lantern') { const i = SVC_KEYS.indexOf(arg); const L = lantern.items[i >= 0 ? i : 0]; const pr = world.project(L.grp.position); return rectAt(pr.x, pr.y); }
    if (n === 'surface') { const pr = world.project(humanMat.uniforms.uPos.value); return rectAt(pr.x, pr.y); }
    if (n === 'bench') { const r = bench.rect; return rectAt(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h); }
    return rectAt(vw / 2, vh / 2);
  }

  // not in the contract: hand the camera back to the scroll rig and let journey actors fade (also on abort)
  function explore() {
    for (const k in claims) claims[k].dead = true;
    rig.mode = 'scroll'; rig.follow = false; rig.snap = false; rig.track = null;
    slot(false); U.beamT = 0;
    world.animTo(cap, 'vis', 0, 900); world.animTo(U, 'humanI', 0, 1200); world.animTo(U, 'warm', 0, 1200);
    world.animTo(U, 'humanBloom', 0, 900); world.animTo(bench, 'i', 0, 700);
    U.bloomBoost = 0; U.rimI = 0; U.red = 0; U.beamW = 1;
    bench.on = false; bench.beadI = 0; world.feeder.aT = 0;
    lantern.focus = -1; lantern.pulse = 0;
    gaori.mode = 'ambient'; gaori.curtainA = 0; gaori.scaleT = 1.25; gaori.pitchT = 0; gaori.dimT = 1; gaori.leaveIn = -1;
    mulgae.mode = 'ambient'; mulgae.w = 2.2; mulgae.dimT = 1;
    pod.mode = 'ambient'; pod.calm = false; pod.dimT = 1;
    cap.face = false; cap.open = 0; cap.scan = -9; cap.colT.set(0.05, 0.9, 0.84);
    main.dir = 1; world.feeder.dir = 1;
    world.swarm.visible = false;
    park = null;
    env.onExplore?.();
  }
  // leftovers of a previous (finished) journey fade away when the next run begins; the camera stays put
  function freshStart() {
    slot(false); U.beamT = 0; U.beamW = 1; U.bloomBoost = 0; U.rimI = 0; U.red = 0;
    if (bench.on || bench.i > 0) { bench.on = false; world.animTo(bench, 'i', 0, 500); }
    bench.beadI = 0; world.feeder.aT = 0;
    world.animTo(U, 'warm', 0, 600); world.animTo(U, 'humanBloom', 0, 600); world.animTo(U, 'humanI', 0, 600);
    gaori.mode = 'ambient'; gaori.curtainA = 0; gaori.scaleT = 1.25; gaori.pitchT = 0; gaori.dimT = 1; gaori.leaveIn = -1;
    mulgae.mode = 'ambient'; mulgae.w = 2.2; mulgae.dimT = 1;
    pod.mode = 'ambient'; pod.calm = false; pod.dimT = 1;
    lantern.pulse = 0; cap.open = 0; cap.scan = -9;
    main.dir = 1; world.feeder.dir = 1;
    rig.track = null;
  }
  function occlude(on) { env.setOccluded?.(!!on); }
  function detach() { world.hooks.delete(placeGlyphs); slot(false); }
  function dispose() { explore(); detach(); env.onDispose?.(); }

  return {
    ready: true, isNull: false, world,
    depth, anchor, condense, toLantern, slot, humanBeam, lanternPulse, approveBloom, dive, benchEnter, benchRect, benchProjectedRect,
    pod: podOn, dispatchPulse, gaoriSweep, fail, pass, reworkCurrent, repair, mulgae: mulgaeOn, rise, deliverBloom, toSurfaceDirect,
    travelTo, focusTool, setLoad, setTier, explore, occlude, detach, dispose,
    get park() { return park; },
  };
}
