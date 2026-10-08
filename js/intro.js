// intro.js — B's intro (deep/index.html 2463–2498: runIntro / introUpdate / caretRect) with two new branches:
//  • the world arrived late: if it is not ready by ~0.9 s, the particle logo is skipped and the canvas
//    simply crossfades in over the poster;
//  • mobile (≤760) and calm: no particle logo; the first screen (static logo, H1, the question, three answer
//    chips, founder line) is plain HTML and shows at once.
// The AI asks "어떤 지원이 필요하신가요?" and the logo's "_" is its cursor: on desktop the particle logo's bar flies to
// the end of the question line (U.caretScreen) and the DOM cursor lights up where it lands. There is no typing
// anywhere on the site (founder, 2026-09-28): the visitor answers with one of the chips.
import { clamp, ease, Run, isCancel } from './core.js?v=0cd00b25fdf6';

const LOGO_DEADLINE = 0.95;   // s after navigation start

export function createIntro({ el, narrow, calm, onDone }) {
  const T0 = Math.min(performance.now(), 380);
  const now = () => (performance.now() - T0) / 1000;
  const run = new Run({ speed: 1 });
  const at = (ms) => run.wait(Math.max(0, ms - (performance.now() - T0)));
  // anything focusable waits inert while it is still invisible (CONTRACT §7), and wakes as it fades in
  const show = (n) => { if (n) (Array.isArray(n) ? n : [n]).forEach(x => { if (!x) return; x.classList.add('in'); if (x.inert) x.inert = false; }); };
  if (!narrow && !calm) [el.hdr, el.pickList, el.pickOther, el.gauge].forEach(x => { if (x && !x.classList.contains('in')) x.inert = true; });
  let world = null, mode = 'pending', tw = 0, finished = false;

  // the cursor is a short teal bar (the logo's "_"): the particle bar lands on its centre, at its width
  function caretRect() {
    const r = el.cursor.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.max(8, r.width) };
  }
  const cursorOn = () => { if (el.cursor && !el.cursor.classList.contains('on')) el.cursor.classList.add('on'); };

  function finish() {
    if (finished) return;
    finished = true;
    onDone?.();
  }

  async function start() {
    try {
      if (narrow || calm) {
        // mobile / calm: static first screen, visible at once (CONTRACT §7)
        if (mode === 'pending') mode = 'fade';
        show([el.hdr, ...el.hero, el.pickQ, el.pickList, el.pickOther, el.heroFoot, el.gauge]);
        cursorOn();
        await at(calm ? 250 : 800);
        finish();
        return;
      }
      await at(520); show(el.hdr);
      await at(760); show(el.hero[0]);
      await at(890); show(el.hero[1]);
      await at(1080); show(el.pickQ);
      // past the logo deadline: without the particle logo the cursor is simply there with its question
      if (mode !== 'logo') cursorOn();
      await at(1450); show(el.pickList);
      await at(1760); show(el.pickOther);
      await at(1900);
      if (mode === 'pending') mode = 'fade';   // the world did not make it: no particle logo
      if (mode !== 'logo') cursorOn();
      await at(2350); show(el.gauge);
      if (mode === 'logo') await at(Math.max(3050, (tw + 2.95) * 1000));   // the logo's "_" has landed: it is the cursor now
      cursorOn();
      await at(3300); show(el.heroFoot);
      finish();
    } catch (e) { if (!isCancel(e)) throw e; }
  }

  // called once the world has compiled; decides between the particle logo and a plain crossfade
  function attachWorld(w) {
    world = w;
    tw = now();
    mode = (!narrow && !calm && mode === 'pending' && tw <= LOGO_DEADLINE) ? 'logo' : 'fade';
    return mode;
  }

  // per frame (B introUpdate), before world.update
  function update() {
    if (!world) return;
    const U = world.U, t = now();
    if (mode === 'logo') {
      U.fade = clamp(0.35 + (t - tw) / 0.9 * 0.65);
      U.logoForm = clamp((t - tw - 0.05) / 1.25);
      U.logoDis = clamp((t - tw - 1.95) / 1.25);
      if (t > tw + 1.75 && U.logoDis < 1) U.caretScreen = caretRect();   // the "_" flies to the end of the question
    } else {
      U.fade = 1; U.logoForm = 0; U.logoDis = 1;
    }
  }
  // the camera's slow push-in after the world appears (B: eIOs(t / 7.5))
  const introK = () => (world ? ease.ios(clamp((now() - tw) / 7.5)) : 0);

  // a late boot (main.js arrived after the CSS failsafe revealed the page): no choreography at all
  function revealAll() {
    show([el.hdr, ...el.hero, el.pickQ, el.pickList, el.pickOther, el.heroFoot, el.gauge, ...el.rv]);
    cursorOn();
    if (mode === 'pending') mode = 'fade';
  }

  return { start, attachWorld, update, introK, caretRect, revealAll, get mode() { return mode; }, get done() { return finished; } };
}
