// strengths/scene.js — the three strength scenes, one per service area (founder, 2026-09-30).
// The first screen's chips and the −200 m rows open /services/<slug>/, which is now the area's scene:
//   web → Stack Map (stack.js) · erp → Built to mesh (gear.js) · ax → AI at work, already (doksuri.js).
// router.js travels the camera to the scene's depth (SCENE_LAYER) and asks this module to open it over the
// live world. Each scene is mounted in a shadow root (its markup, CSS and ids never meet the site's), and the
// service details follow below it, with the ~1-minute demos behind 시연 보기 (founder: "상세의 '시연 보기'로만").
// The scene modules are generated from the approved prototypes (lab/formats/live/…); see their headers.
import { $, REDUCED } from '../core.js?v=8999a49d35de';
import { SVC } from '../content.js?v=8999a49d35de';

const MODS = { web: () => import('./stack.js?v=8999a49d35de'), erp: () => import('./gear.js?v=8999a49d35de'), ax: () => import('./doksuri.js?v=8999a49d35de') };
export const prefetch = (svc) => MODS[svc]?.().catch(() => {});

// Three layouts (founder, 2026-09-30: the diagram must keep its size — "규모가 1/10으로 확 줄었네"):
//   d  ≥ 1152 px — the whole 1440×900 composition, scaled to the screen (0.6–1.25);
//   t  761–1151 px — the message on top, the scene's visual below it, scaled so its crop fills the width;
//   m  ≤ 760 px (the site's phone layout) — the phone composition; the product scene shows its stack above the list.
export const sceneLayout = () => (innerWidth <= 760 ? 'm' : innerWidth < 1152 ? 't' : 'd');
const FRAME_W = 1440, FRAME_H = 900;
// every scene's text column starts at x 72 of the design space (lab/formats/live/shared.css .msg);
// the page's gutter is base.css --gut, clamp(20px, 5vw, 72px)
const MSG_X = 72;
const gutter = () => Math.min(72, Math.max(20, innerWidth * 0.05));

// shared by every scene: the frame, and the quiet link that leads to the service details below
const FRAME_CSS = `
  :host { display: block; position: relative; }
  .frame { position: relative; }
  /* the visual keeps the design space (1440×900) on every layout */
  .visw { position: absolute; left: 0; top: 0; width: ${FRAME_W}px; height: ${FRAME_H}px; }
  .vis { position: absolute; left: 0; top: 0; width: ${FRAME_W}px; height: ${FRAME_H}px; transform-origin: 0 0; }
  /* d: one scaled frame */
  :host(.d) { height: 100vh; height: 100dvh; overflow: hidden; }
  :host(.d) .frame { position: absolute; left: 0; top: 0; width: ${FRAME_W}px; height: ${FRAME_H}px; transform-origin: 0 0;
    transform: translate(var(--fx, 0px), var(--fy, 0px)) scale(var(--fs, 1)); }
  /* t and m: the message flows on top; the visual is a crop of the design space, scaled to the width */
  :host(.t) .visw, :host(.m) .visw { position: relative; width: auto; height: var(--vh, 0px); overflow: hidden; }
  :host(.t) .vis, :host(.m) .vis { transform: translate(var(--vx, 0px), var(--vy, 0px)) scale(var(--vs, 1)); }
  :host(.t) .frame { padding-bottom: 24px; }
  :host(.t) .msg { position: relative !important; left: auto !important; top: auto !important; width: auto !important; max-width: 640px; padding: 104px 0 0 var(--gx, 40px); }
  :host(.t) .visw { margin-top: 18px; }
  :host(.m) .visw { margin-top: 10px; }
  :host(.t) .frame > .legend, :host(.t) .frame > .key { max-width: 640px; margin: 22px var(--gx, 40px) 0; animation: sx-in .6s 1.1s both; }
  @keyframes sx-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  :host(.m) .frame { max-width: 560px; margin: 0 auto; padding-bottom: 24px; }
  /* the site's scroller already starts below the header on a phone (strengths.css) */
  :host(.m) .msg { padding-top: 24px; }
  a.more { text-decoration: none; cursor: pointer; transition: color .2s, border-color .2s; }
  a.more:hover { color: var(--ink); border-bottom-color: var(--ink2); }
  a.more:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }
  .lnk { cursor: pointer; }
`;

export function createScene({ el, onClose, ensureJourney, go }) {
  const hostWrap = $('.sx-stage', el), details = $('.sx-details', el), scroller = $('.sx-scroll', el);
  let cur = null;        // { svc, host, stop, layout, crop }
  let want = null;       // the area asked for last (imports may resolve out of order)
  let scale = 1, hideT = 0;
  const px = (v) => `${v.toFixed(1)}px`;

  function fit() {
    if (!cur) { scale = 1; return; }
    const H = cur.host, w = H.clientWidth;
    if (cur.layout === 'd') {
      const h = H.clientHeight;
      scale = Math.max(0.6, Math.min(1.25, w / FRAME_W, h / FRAME_H));
      H.style.setProperty('--fs', scale.toFixed(4));
      // the frame's text column lands on the page's left line, as every layer's text does (founder, 2026-09-30:
      // "서비스 항목부터 왼쪽 정렬"); a wider screen shows more of the world on the right, not a centred frame
      H.style.setProperty('--fx', px(gutter() - MSG_X * scale));
      H.style.setProperty('--fy', px(Math.max(0, (h - FRAME_H * scale) / 2)));
      return;
    }
    // t / m: the scene's crop of the design space, as wide as the column allows
    const crop = cur.layout === 't' ? cur.crop?.t : cur.crop?.m;
    if (!crop) { scale = 1; return; }
    const [x0, y0, x1, y1] = crop, cw = x1 - x0, ch = y1 - y0;
    const gx = cur.layout === 't' ? gutter() : 12;
    const avail = w - 2 * gx;
    // medium: as wide as the column, but never taller than the screen below the header
    scale = cur.layout === 't' ? Math.min(1.1, avail / cw, (innerHeight - 96) / ch) : Math.min(0.9, avail / cw);
    const left = gx + (avail - cw * scale) / 2;
    H.style.setProperty('--gx', px(gx));
    H.style.setProperty('--vs', scale.toFixed(4));
    H.style.setProperty('--vx', px(left - x0 * scale));
    H.style.setProperty('--vy', px(-y0 * scale));
    H.style.setProperty('--vh', px(ch * scale));
  }

  function unmount() {
    if (!cur) return;
    try { cur.stop?.(); } catch (e) { console.error(e); }
    cur.host.remove();
    cur = null;
  }

  async function mount(svc) {
    const M = await MODS[svc]();
    if (want !== svc) return;
    unmount();
    const layout = sceneLayout(), narrow = layout === 'm';
    const host = document.createElement('div');
    host.className = 'sx-host';
    host.classList.add(layout, REDUCED ? 'still' : 'pre');
    const sr = host.attachShadow({ mode: 'open' });
    sr.innerHTML = `<style>${M.css}${FRAME_CSS}</style>${M.html}`;
    // the link to the details, named after the service (content.js SVC)
    const more = sr.querySelector('.more');
    if (more) more.innerHTML = `${SVC[svc].name} 자세히 보기 <span aria-hidden="true">→</span>`;
    // on a medium screen the visual comes right after the sentence; the legend / key follow it
    if (layout === 't') { const vis = sr.querySelector('.visw'); for (const n of sr.querySelectorAll('.msg > .legend, .msg > .key')) vis.after(n); }
    sr.addEventListener('click', (e) => {
      if (e.target.closest?.('.more, .lnk')) { e.preventDefault(); toDetails(); }
    });
    hostWrap.replaceChildren(host);
    cur = { svc, host, layout, crop: M.crop, stop: null };
    fit();
    window.__sx = { svc, narrow, layout, host };
    cur.stop = M.run({ sr, host, still: REDUCED, narrow, scale: () => scale });
  }

  function renderDetails(svc) {
    return import('../journey/pages.js?v=8999a49d35de').then((P) => {
      if (want !== svc) return;
      const page = { name: 'service', svc, layer: 1 };
      details.innerHTML = P.serviceDetailsHTML(svc);
      P.wirePanel(details, page, { ensureJourney, go, close: onClose });
    });
  }

  function toDetails() {
    const top = details.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 24;
    scroller.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
  }

  // Esc closes the scene (the journey's own Esc handles journeys and panels)
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || !want || el.hidden) return;
    e.preventDefault();
    onClose();
  });
  $('.sx-x', el).addEventListener('click', () => onClose());

  let rzT = 0;
  addEventListener('resize', () => {
    if (!cur) return;
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      if (!cur) return;
      // crossing a layout threshold rebuilds the scene in the other layout; otherwise it only rescales
      if (sceneLayout() !== cur.layout) mount(cur.svc);
      else fit();
    }, 140);
  });

  function open(svc) {
    if (!MODS[svc]) return Promise.resolve();
    clearTimeout(hideT);
    const same = want === svc && cur?.svc === svc;
    want = svc;
    el.setAttribute('aria-label', `${SVC[svc].area} · ${SVC[svc].name}`);
    el.hidden = false; el.inert = false;
    requestAnimationFrame(() => { if (want === svc) el.classList.add('show'); });
    if (same) return Promise.resolve();
    scroller.scrollTop = 0;
    details.replaceChildren();
    scroller.focus({ preventScroll: true });
    return Promise.all([mount(svc), renderDetails(svc)]);
  }

  function close() {
    if (!want) return;
    want = null;
    el.classList.remove('show');
    el.inert = true;
    const done = () => { if (want) return; el.hidden = true; unmount(); details.replaceChildren(); window.__sx = null; };
    if (REDUCED) done(); else hideT = setTimeout(done, 480);   // after the fade
  }

  return { open, close, get svc() { return want; }, toDetails };
}
