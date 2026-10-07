// journey/rail.js — during a journey the depth gauge becomes the 6-step procedure rail, in the same place.
// The rail itself is the studio's (standalone.js mountRail: PROCEDURE labels, return arrows gate → spec and
// test → build, ▸▸ 3배, depth);
// this adds the swap with #gauge, the COPY.skip jump (after the human gate only), the rework caption
// ("rework · r2 · Podway record") and a depth read-out that follows the camera while the world runs.
import { mk, bus } from '../core.js?v=7797e944718b';
import { COPY } from '../content.js?v=7797e944718b';
import { mountRail } from '../studio/standalone.js?v=7797e944718b';
import { hideOverlay } from '../world/labels.js?v=7797e944718b';

const fmt = (m) => (m < -0.5 ? `+${Math.round(-m).toLocaleString('en-US')} m` : m < 0.5 ? '0 m' : `−${Math.round(m).toLocaleString('en-US')} m`);

export function createRail(host, gauge, { depth, onSkip } = {}) {
  const R = mountRail(host, { ff: true });
  host.classList.add('jr-rail');
  host.setAttribute('aria-label', '진행 절차');
  const foot = host.querySelector('.st-rail-foot');
  const ff = host.querySelector('.st-ff');
  const skip = mk('button', 'st-ff jr-skip');
  skip.type = 'button';
  skip.textContent = COPY.skip;
  skip.title = COPY.skipTip;
  skip.hidden = true;
  skip.addEventListener('click', () => onSkip?.());
  foot.appendChild(skip);
  const live = mk('span', 'st-depth jr-depth');
  live.title = 'Depth';
  foot.prepend(live);

  let on = false, raf = 0, last = '', handoff = false, approved = false;
  // sub-labels break after the dot, never inside a role ("Podway ·" / "Procedure control")
  const tidy = () => { for (const s of host.querySelectorAll('.st-rn-s')) { const t = s.textContent, u = t.replace(/ · /g, ' ·\n'); if (u !== t) s.textContent = u; } };
  // the gauge stays inert while the rail stands in its place (the intro's delayed reveal must not wake it)
  const guard = new MutationObserver(() => { if (on && !gauge.inert) gauge.inert = true; });
  guard.observe(gauge, { attributes: true, attributeFilter: ['inert'] });
  const off = bus.on('stage', (e) => {
    if (!on) return;
    if (e.k === 'gate' && e.st === 'wait') skip.hidden = true;
    if (e.k === 'gate' && e.st === 'human') { approved = true; skip.hidden = handoff; }
    if (e.k === 'ship' && e.st === 'act') skip.hidden = true;
    if (e.k === 'ship' && e.st === 'done') { skip.hidden = true; if (ff) ff.hidden = true; host.classList.add('jr-done'); }
    // mountRail (registered first) marked 04 exit 1 and 03 "fix r2"; say what Podway recorded
    if (e.k === 'rework') R.set('build', 'act', 'rework · r2 · Podway record');
    tidy();
  });

  function tick() {
    raf = requestAnimationFrame(tick);
    const m = depth?.();
    if (m == null) return;
    const t = fmt(m);
    if (t !== last) { last = t; live.textContent = t; }
  }

  return {
    el: host,
    set: R.set,
    // live: the world is there and the read-out follows the camera; otherwise mountRail's spin shows depth
    show({ handoff: h = false, live: lv = false } = {}) {
      on = true; handoff = h; approved = false;
      R.reset();
      R.mode(h);
      tidy();
      host.classList.remove('jr-done');
      host.classList.toggle('jr-live', lv);
      skip.hidden = true;
      if (ff) ff.hidden = false;
      last = '';
      if (lv && !raf) tick();
      gauge.inert = true;
      gauge.classList.add('jr-away');
      // shown, then interactive once it is actually visible (nothing focusable at opacity 0)
      host.hidden = false;
      host.inert = true;
      let woke = false;
      const wake = () => { if (on && !woke) { woke = true; host.inert = false; } };
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!on) return;
        host.classList.add('show');
        host.addEventListener('transitionend', wake, { once: true });
        setTimeout(wake, 700);   // UI safety net if no transition runs (reduced motion)
      }));
    },
    hide() {
      on = false;
      cancelAnimationFrame(raf); raf = 0;
      hideOverlay(host);
      gauge.classList.remove('jr-away');
      gauge.inert = false;
    },
    skipDone() { skip.hidden = true; },
    get approved() { return approved; },
    destroy() { off(); guard.disconnect(); R.destroy(); cancelAnimationFrame(raf); },
  };
}
