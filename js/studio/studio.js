// studio/studio.js — A's live-build engine behind the Studio API (CONTRACT §4).
// The journey decides the order (spec → human gate → build → test → review → ship); the studio
// renders each step: an opaque spec card, the gate, the ">" stamp, a screen-fixed frame whose
// mini-site lives in an <iframe srcdoc>, and DOM light over the frame (scan band, overlap box, pins).
// Every delay runs on the caller's Run (core.js), so Esc / back / restart cancel cleanly.

import { $$, mk, esc, rand, clamp, ease, REDUCED, Run, bus, isNarrow } from '../core.js?v=0cd00b25fdf6';
import { LOGO, MAIL, GITHUB, repoUrl, FOUNDER, TOOLS, TOOL_ORDER, toolLabel, RELEASES, COPY, SVC } from '../content.js?v=0cd00b25fdf6';
import { stream } from '../log.js?v=0cd00b25fdf6';
import { buildBriefMail, buildHandoffMail, copyText, summaryPairs, SIM_LABEL } from '../mail.js?v=0cd00b25fdf6';
import { layoutStandalone } from './standalone.js?v=0cd00b25fdf6';

export { esc };

/* =========================================================================
   Helpers shared with the scenario modules
   ========================================================================= */

// A text run of the mini-site; in blueprint mode it shows as a teal bar until "typed".
export const tx = (s, c) => `<span class="tx${c ? ` ${c}` : ''}">${s}</span>`;
const batchim = (w) => {
  const c = String(w).trim().slice(-1).charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 !== 0 : false;
};
export const topic = (w) => `${w}${batchim(w) ? '은' : '는'}`; // 치과 예약 서비스는 · 재고 관리 시스템은
export const koCount = (n) => ['영', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'][n] ?? String(n);
const clipCp = (s, n) => { const a = Array.from(String(s)); return a.length > n ? `${a.slice(0, n).join('')}…` : String(s); };
export function genericRevise(note) {
  const v = clipCp(note, 60);
  return { k: 'Request', v, extra: v, say: '요청하신 내용을 Spec에 반영합니다.' };
}
// A scenario's preset revisions (the gate's chips): [{ id, label, re, k, v, extra?, say }]. The gate sends the
// label; this finds the preset by id, label or (for older /build/ links and QA) a keyword.
export function reviseWith(presets, note) {
  const n = String(note ?? '');
  const p = presets.find((x) => x.id === n || x.label === n) || presets.find((x) => x.re?.test(n));
  return p ? { id: p.id, k: p.k, v: p.v, extra: p.extra, say: p.say } : null;
}

/* =========================================================================
   Module constants and DOM utilities
   ========================================================================= */

const SITES_CSS = new URL('../../css/sites.css?v=0cd00b25fdf6', import.meta.url).href;
const PRETENDARD = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
const MONO_FONT = 'IBM+Plex+Mono:wght@400;500';
const SVGNS = 'http://www.w3.org/2000/svg';

const compact = () => isNarrow();
// A promise that runs alongside the story and is awaited later. If the run is cancelled first,
// its CANCEL rejection must not surface as an unhandled rejection; awaiting it still rethrows.
const alongside = (p) => { p.catch(() => {}); return p; };
const where = () => (compact() ? '위' : '가운데');
// 24-hour clock for records and tool lines ("15:12", "15:12:08"), the runtime.log style
const clock = (sec) => new Date().toLocaleTimeString('en-GB', sec ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour: '2-digit', minute: '2-digit' });
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const ver = (id) => TOOLS[id]?.ver || '';

const glyphHTML = (which, cls = '') =>
  `<svg class="${cls}" viewBox="${which === 'L' ? '0 0 39.5 57' : '144 0 38.5 57'}" aria-hidden="true" focusable="false"><path d="${which === 'L' ? LOGO.L : LOGO.R}"/></svg>`;
function glyphEl(which, cls = '') {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', which === 'L' ? '0 0 39.5 57' : '144 0 38.5 57');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  if (cls) s.setAttribute('class', cls);
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', which === 'L' ? LOGO.L : LOGO.R);
  s.appendChild(p);
  return s;
}

// WAAPI helper: speed-aware, ≤180 ms in reduced motion, cancellable through the run.
function anim(el, kf, o = {}, run = null) {
  if (!el?.animate) return Promise.resolve();
  const sp = run ? clamp(run.speed, 1, 4) : 1;
  const duration = REDUCED ? Math.min(o.duration ?? 300, 180) : (o.duration ?? 300) / sp;
  const a = el.animate(kf, { fill: 'forwards', ...o, duration, delay: REDUCED ? 0 : (o.delay || 0) / sp });
  const p = a.finished.then(() => a, () => a);
  return run ? run.race(p) : p;
}

// CONTRACT §2 overlay rule. Show: hidden off → inert off → next frame .show. Hide: inert → no .show → hidden.
async function showBox(el) {
  el.hidden = false;
  el.inert = false;
  await nextFrame();
  el.classList.add('show');
}
function hideBox(el) {
  el.inert = true;
  el.classList.remove('show');
  const done = () => { if (!el.classList.contains('show')) el.hidden = true; };
  const t = parseFloat(getComputedStyle(el).transitionDuration) || 0;
  if (REDUCED || !t) return done();
  el.addEventListener('transitionend', done, { once: true });
  setTimeout(done, t * 1000 + 80); // UI safety net, not story timing
}

// Inert everything except `keep` while a mobile sheet is modal; returns the undo.
function modal(keep) {
  const changed = [];
  for (const el of document.body.children) {
    if (el === keep || el.contains(keep) || el.id === 'live' || el.id === 'toast' || el.tagName === 'SCRIPT') continue;
    if (!el.inert) { el.inert = true; changed.push(el); }
  }
  return () => { for (const el of changed) el.inert = false; };
}

function toRect(t) {
  if (!t) return null;
  if (typeof t.getBoundingClientRect === 'function') t = t.getBoundingClientRect();
  if (Number.isFinite(t.width) && Number.isFinite(t.height) && t.width > 0) return { left: t.left ?? t.x, top: t.top ?? t.y, width: t.width, height: t.height };
  if (Number.isFinite(t.x) && Number.isFinite(t.y)) { const h = 28, w = (h * 38.5) / 57; return { left: t.x - w / 2, top: t.y - h / 2, width: w, height: h }; }
  return null;
}

/* =========================================================================
   The mini-site inside the iframe (A Site, adapted to a separate document)
   ========================================================================= */

function createSite(iframe, frameApi) {
  let doc = null, win = null, root = null;
  let ready = null;

  function shell() {
    return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      `<title>시안 미리보기</title><link rel="stylesheet" href="${SITES_CSS}"></head><body class="st-sitebody"></body></html>`;
  }

  return {
    get doc() { return doc; },
    get win() { return win; },
    get root() { return root; },
    // (Re)load the document shell. Fonts load after the shell so a slow CDN never blocks the build.
    load(fonts = []) {
      ready = new Promise((res) => {
        iframe.addEventListener('load', () => {
          doc = iframe.contentDocument;
          win = iframe.contentWindow;
          if (REDUCED) doc.documentElement.classList.add('rm');
          const families = [...fonts, MONO_FONT].map((f) => `family=${f}`).join('&');
          for (const href of [PRETENDARD, `https://fonts.googleapis.com/css2?${families}&display=swap`]) {
            const l = doc.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            doc.head.appendChild(l);
          }
          const onMove = () => frameApi.overlaysMoved();
          win.addEventListener('scroll', onMove, { passive: true });
          win.addEventListener('resize', onMove);
          res();
        }, { once: true });
      });
      root = null;
      iframe.srcdoc = shell();
      return ready;
    },
    get ready() { return ready; },
    async mount(html) {
      await ready;
      doc.body.innerHTML = html;
      root = doc.body.firstElementChild;
      root.classList.add(REDUCED ? 'rm' : 'bp');
      win.scrollTo(0, 0);
      return root;
    },
    $(s) { return doc?.querySelector(s) ?? null; },
    $$(s) { return doc ? [...doc.querySelectorAll(s)] : []; },
    sec(id) { return root?.querySelector(`[data-sec="${id}"]`) ?? null; },
    unfocus() { root?.querySelectorAll('.ms-sec.focus').forEach((x) => x.classList.remove('focus')); },
    reveal(id) {
      const s = this.sec(id);
      if (!s) return null;
      this.unfocus();
      s.classList.add('in', 'focus');
      if (REDUCED) s.classList.add('typed', 'drawn');
      this.scrollTo(s);
      return s;
    },
    type(id) { this.sec(id)?.classList.add('typed'); },
    draw(id) { this.sec(id)?.classList.add('drawn'); },
    // Blueprint → colour: a warm sweep passes and the sections take their colours in a cascade.
    color(run) {
      if (!root) return;
      const secs = [...root.querySelectorAll('.ms-sec')];
      if (!REDUCED) {
        const sw = frameApi.sweep();
        if (sw) anim(sw, [{ transform: 'translateY(-180px)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { transform: `translateY(${frameApi.screenH()}px)`, opacity: 0 }], { duration: 1500, easing: 'cubic-bezier(.45,0,.25,1)' }).then(() => sw.remove());
        secs.forEach((s, i) => s.style.setProperty('--d', `${(i * 0.13).toFixed(2)}s`));
        run?.wait(2600).then(() => secs.forEach((s) => s.style.removeProperty('--d'))).catch(() => {});
      }
      this.unfocus();
      root.classList.remove('bp');
    },
    scrollTo(el, instant) {
      if (!el || !win || !el.getClientRects().length) return;   // a view that is not on screen (another role's) stays put
      const top = Math.max(0, el.getBoundingClientRect().top + win.scrollY - 14);
      win.scrollTo({ top, behavior: REDUCED || instant ? 'auto' : 'smooth' });
    },
    top(instant) { win?.scrollTo({ top: 0, behavior: REDUCED || instant ? 'auto' : 'smooth' }); },
  };
}

/* =========================================================================
   Scope board (standalone only): the spec, drawn in the frame before anything is built (A)
   ========================================================================= */

const WF = [
  [[6, 6, 88, 9], [6, 22, 58, 26], [6, 54, 40, 6], [6, 64, 48, 6], [6, 76, 26, 10]],
  [[6, 6, 88, 9], [6, 22, 40, 6], [6, 34, 26, 18], [37, 34, 26, 18], [68, 34, 26, 18], [6, 58, 26, 18], [37, 58, 26, 18], [68, 58, 26, 18]],
  [[6, 6, 88, 9], [6, 22, 42, 6], [6, 32, 34, 5], [6, 42, 38, 5], [54, 22, 40, 44], [6, 74, 30, 12]],
];
const wfHTML = (i, delay = 0) => `<span class="st-wf" aria-hidden="true">${WF[i % 3].map(([x, y, w, h], k) => `<i style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;animation-delay:${(delay + 0.2 + k * 0.05).toFixed(2)}s"></i>`).join('')}</span>`;

/* =========================================================================
   The frame (slate): opaque, screen-fixed, top bar "● ● ●  < request _ >  draft url · r1 · 626px  [Demo]"
   ========================================================================= */

function createFrame({ world }) {
  const fr = mk('section', 'st-frame');
  fr.setAttribute('aria-label', '시안 작업대');
  fr.tabIndex = -1;
  fr.innerHTML =
    '<div class="st-bar">' +
      '<span class="st-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      `<span class="st-req">${glyphHTML('L', 'st-br st-br-l')}<span class="st-req-t"></span><i class="st-u" aria-hidden="true"></i>` +
        `<span class="st-slot" aria-hidden="true"><i class="st-slot-box"></i>${glyphHTML('R', 'st-br st-br-r')}</span></span>` +
      '<span class="st-url"><span class="st-url-h"><span class="st-url-l">draft</span> <b class="st-url-n"></b> · </span><em class="st-url-r">r1</em> · <span class="st-url-w">—</span></span>' +
      '<span class="st-state" hidden></span>' +
      '<span class="st-dtog" role="group" aria-label="미리보기 크기" hidden>' +
        '<button type="button" data-d="desk" aria-pressed="true">Desktop</button><button type="button" data-d="phone" aria-pressed="false">Mobile</button></span>' +
      '<span class="st-demo">Demo</span>' +
    '</div>' +
    '<div class="st-screen">' +
      '<iframe class="st-site" title="시안 미리보기"></iframe>' +
      '<div class="st-bp" aria-hidden="true"></div>' +
      `<div class="st-cols" aria-hidden="true">${'<i></i>'.repeat(12)}</div>` +
      '<div class="st-wait" aria-hidden="true" hidden><div class="st-wait-in"><span class="st-wait-k"></span><p class="st-wait-p"></p></div></div>' +
      '<div class="st-ov" aria-hidden="true"><div class="st-scan"></div><div class="st-hl"><span></span></div></div>' +
    '</div>';

  const q = (s) => fr.querySelector(s);
  const iframe = q('iframe');
  iframe.inert = true;
  const screen = q('.st-screen');
  const ov = q('.st-ov');
  const scan = q('.st-scan');
  const hlBox = q('.st-hl');
  const urlW = q('.st-url-w');
  const pins = [];
  let hlEl = null;
  let extScanAt = -1e9;
  const rectCbs = new Set();

  const api = {
    el: fr,
    iframe,
    rect: () => fr.getBoundingClientRect(),
    screenH: () => ov.clientHeight,
    slotRect: () => q('.st-slot .st-br-r').getBoundingClientRect(),
    onRect(fn) { rectCbs.add(fn); return () => rectCbs.delete(fn); },

    // World follows the DOM rect (never the other way round).
    syncRect() {
      const r = fr.getBoundingClientRect();
      urlW.textContent = `${Math.round(iframe.clientWidth)}px`;
      try { world?.benchRect?.(r); } catch (e) { console.error(e); }
      bus.emit('bench', { rect: r });
      for (const f of rectCbs) f(r);
    },

    request(text) { q('.st-req-t').textContent = text; q('.st-req').title = text; },
    url(name, rev) {
      q('.st-url-n').textContent = name;
      q('.st-url-r').textContent = `r${rev}`;
    },
    urlLabel(label) { q('.st-url-l').textContent = label; },
    state(text, tone = '') {
      const s = q('.st-state');
      s.hidden = !text;
      s.textContent = text || '';
      s.className = `st-state${tone ? ` st-state--${tone}` : ''}`;
    },
    u(mode) { q('.st-u').dataset.mode = mode; }, // work (blinks) · idle · done
    slotWait(on) { q('.st-slot').classList.toggle('st-slot--wait', !!on); },
    shut() { const s = q('.st-slot'); s.classList.remove('st-slot--wait'); s.classList.add('st-slot--shut'); },
    bp(on) { q('.st-bp').classList.toggle('on', !!on); q('.st-bp').classList.toggle('faint', on === 'faint'); },
    cols(on) { const c = q('.st-cols'); c.classList.toggle('on', !!on); c.classList.toggle('off', !on); },
    glow(on) { fr.classList.toggle('st-glow', !!on); },
    async flash(tone, run) {
      fr.classList.remove('st-flash-bad', 'st-flash-good');
      void fr.offsetWidth;
      fr.classList.add(`st-flash-${tone}`);
      if (run) await run.wait(REDUCED ? 60 : 700).catch(() => {});
    },
    wait(k, p, amber) {
      const w = q('.st-wait');
      w.hidden = false;
      w.classList.toggle('amber', !!amber);
      w.classList.remove('off');
      q('.st-wait-k').textContent = k;
      q('.st-wait-p').textContent = p;
    },
    waitOff() { const w = q('.st-wait'); w.classList.add('off'); },

    // The iframe stays inert (no focus, no clicks) and unscrollable until delivery.
    lock(on) {
      iframe.inert = !!on;
      fr.classList.toggle('st-locked', !!on);
      const d = iframe.contentDocument;
      if (d?.documentElement) d.documentElement.classList.toggle('locked', !!on);
    },

    // Narrow the frame for the phone check (390) and back (null). Resolves when the width settles.
    async setWidth(px, run) {
      const bench = fr.parentElement;
      // the frame's natural width: --st-frame-w (628 px by default; index.html lets it fill the bench)
      const cap = parseFloat(getComputedStyle(fr).getPropertyValue('--st-frame-w')) || 628;
      const full = Math.min(cap, bench ? bench.clientWidth : cap);
      const from = fr.getBoundingClientRect().width;
      const to = px ? Math.min(full, Math.round(px) + 2) : full;
      const phone = !!px && px < 600;
      fr.style.width = `${from}px`;
      void fr.offsetWidth;
      const dur = REDUCED || !run ? 0 : 950 / clamp(run.speed, 1, 4);
      fr.style.transition = dur ? `width ${dur}ms cubic-bezier(.65,0,.35,1), border-radius ${dur * 0.6}ms` : 'none';
      fr.classList.toggle('st-phone', phone);
      fr.style.width = `${to}px`;
      q('.st-cols').classList.toggle('four', phone);
      if (run && dur) await run.tween(dur + 40, () => api.syncRect());
      fr.style.transition = '';
      if (!px) fr.style.width = '';
      api.syncRect();
    },

    // Called by the world every frame (Gaori's projected position); the DOM draws the band.
    scanAt(y01) { extScanAt = performance.now(); api.scanPos(y01); },
    scanPos(y01) {
      if (y01 == null || !(y01 >= 0 && y01 <= 1)) { scan.classList.remove('on'); return; }
      scan.style.transform = `translateY(${Math.round(y01 * ov.clientHeight)}px)`;
      scan.classList.add('on');
    },
    // The studio's own scan; yields to the world whenever it is driving scanAt().
    async ownScan(ms, run) {
      if (REDUCED) return;
      await run.tween(ms, (e) => { if (performance.now() - extScanAt > 150) api.scanPos(e); }, ease.ios);
      api.scanPos(null);
    },
    sweep() { const s = mk('div', 'st-sweep'); ov.appendChild(s); return s; },

    // Overlap box over an element inside the iframe (red = problem, teal = fixed).
    hl(el, label, ok) {
      hlEl = el || null;
      if (!el) { hlBox.classList.remove('on'); return; }
      hlBox.querySelector('span').textContent = label;
      hlBox.classList.toggle('ok', !!ok);
      api.overlaysMoved();
      hlBox.classList.add('on');
    },

    // Advisory pins (Mulgae): amber, one by one; teal ✓ once applied.
    pin(i, el, text) {
      const box = mk('div', 'st-pinbox');
      const p = mk('div', 'st-pin');
      p.innerHTML = `<b>${i + 1}</b><span></span>`;
      p.querySelector('span').textContent = text;
      ov.append(box, p);
      pins[i] = { el, p, box };
      api.overlaysMoved();
      requestAnimationFrame(() => { box.classList.add('on'); p.classList.add('on'); });
    },
    pinDone(i, text) {
      const x = pins[i];
      if (!x) return;
      x.p.classList.add('ok');
      x.box.classList.add('ok');
      x.p.querySelector('b').textContent = '✓';
      if (text) x.p.querySelector('span').textContent = text;
    },
    pinsQuiet() { for (const x of pins) x?.p.classList.add('quiet'); },
    clearPins() { for (const x of pins.splice(0)) { x?.p.remove(); x?.box.remove(); } },

    overlaysMoved() {
      if (hlEl) {
        if (!hlEl.isConnected) hlBox.classList.remove('on');
        else {
          const r = hlEl.getBoundingClientRect();
          Object.assign(hlBox.style, { left: `${r.left - 6}px`, top: `${r.top - 6}px`, width: `${r.width + 12}px`, height: `${r.height + 12}px` });
          hlBox.classList.toggle('inside', r.top < 30);
        }
      }
      const W = ov.clientWidth;
      for (const x of pins) {
        if (!x) continue;
        const r = x.el?.isConnected ? x.el.getBoundingClientRect() : null;
        if (!r) { x.p.style.display = 'none'; x.box.style.display = 'none'; continue; }
        x.p.style.display = ''; x.box.style.display = '';
        Object.assign(x.box.style, { left: `${r.left - 4}px`, top: `${r.top - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px` });
        const px = clamp(r.right - 2, 14, W - 14), py = clamp(r.top - 2, 14, ov.clientHeight - 14);
        x.p.style.left = `${px}px`;
        x.p.style.top = `${py}px`;
        x.p.classList.toggle('left', px > W * 0.5);
      }
    },

    showToggle(on) { q('.st-dtog').hidden = !on; },
    delivered(on) { fr.classList.toggle('st-delivered', !!on); },

    /* scope board */
    scope: {
      el: null,
      mount() {
        this.unmount();
        const s = mk('div', 'st-scope');
        s.setAttribute('aria-hidden', 'true');
        s.innerHTML = '<div class="st-scope-in"><div class="st-scope-h"><span><b>Scope</b> · <span class="st-scope-r">r1</span></span><span class="st-scope-st">Draft · not built</span></div><div class="st-scope-pages"></div><div class="st-scope-tags"></div></div>';
        screen.insertBefore(s, ov);
        this.el = s;
      },
      unmount() { this.el?.remove(); this.el = null; },
      row(row) {
        if (!this.el) return;
        const pages = this.el.querySelector('.st-scope-pages'), tags = this.el.querySelector('.st-scope-tags');
        if (row.pages && !pages.childElementCount) {
          row.v.slice(0, 3).forEach((it, i) => {
            const [t, sub] = it.split(' — ');
            const c = mk('div', 'st-pg');
            c.style.animationDelay = `${i * 0.12}s`;
            c.innerHTML = `${wfHTML(i, i * 0.12)}<b>${esc(t)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}`;
            pages.appendChild(c);
          });
          return;
        }
        if (row.k === 'Goal' || row.k === 'Users' || row.k === 'Tone') return;
        const items = Array.isArray(row.v) ? row.v : [row.m || row.v];
        items.forEach((it, i) => {
          const t = mk('span', row.as ? 'as' : '');
          t.textContent = (row.as ? 'Assumption · ' : '') + it.split(' — ')[0];
          t.style.animationDelay = `${i * 0.08}s`;
          tags.appendChild(t);
        });
      },
      add(text, rev) {
        if (!this.el) return;
        const t = mk('span', 'new');
        t.textContent = `${text.split(' — ')[0]} · r${rev}`;
        this.el.querySelector('.st-scope-tags').appendChild(t);
        this.el.querySelector('.st-scope-r').textContent = `r${rev}`;
      },
      state(st, label) {
        if (!this.el) return;
        this.el.classList.remove('wait', 'ok');
        if (st) this.el.classList.add(st);
        this.el.querySelector('.st-scope-st').textContent = label;
      },
      async hide(run) {
        const el = this.el;
        if (!el) return;
        el.classList.add('off');
        await run.wait(REDUCED ? 120 : 650);
        if (el === this.el) this.unmount();
      },
    },
  };

  let ro = null;
  if ('ResizeObserver' in window) ro = new ResizeObserver(() => { api.syncRect(); api.overlaysMoved(); });
  api.observe = () => { ro?.observe(fr); };
  api.unobserve = () => { ro?.disconnect(); rectCbs.clear(); };
  return api;
}

/* =========================================================================
   mountStudio
   ========================================================================= */

export async function mountStudio(host = document.body, { layout = 'standalone', log = null, world = null } = {}) {
  const deep = layout === 'deep';
  const html = document.documentElement;
  html.classList.add('st-on', deep ? 'st-deep' : 'st-standalone');
  html.classList.toggle('st-rm', REDUCED);

  const L = deep ? null : layoutStandalone(host);
  const box = (id, cls = '') => {
    let el = document.getElementById(id);
    if (!el) {
      el = mk('div', cls);
      el.id = id;
      el.hidden = true;
      el.inert = true;
      document.body.appendChild(el);
    }
    return el;
  };
  const C = {
    bench: box('bench', 'st-benchhost'),
    specHost: box('specHost'),
    gate: box('gate'),
    ship: box('ship'),
    dev: box('dev'),
    toast: box('toast'),
  };
  C.bench.classList.add('st-bench');

  const st = {
    sc: null,
    ctx: null,
    card: null,
    frame: null,
    site: null,
    gate: null,
    ui: new Run({ speed: 1 }),
    tree: [],
    raw: [],
    said: new Set(),
    gateWaits: 0,
    ctaBar: null,
    io: null,
    lastFocus: null,
    destroyed: false,
  };

  const Lg = log || nullLog();
  const raw = (line) => st.raw.push(line);
  const announce = (t) => { const l = document.getElementById('live'); if (l && !l.hidden) { l.textContent = ''; requestAnimationFrame(() => { l.textContent = t; }); } };

  /* ---------- toast ---------- */
  let toastT = 0;
  function toast(msg) {
    const t = C.toast;
    t.classList.add('st-toast');
    t.setAttribute('role', 'status');
    t.hidden = false;
    t.inert = false;
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastT);
    toastT = setTimeout(() => hideBox(t), 2800); // UI feedback, outside the story
  }

  /* ---------- the frame ---------- */
  function slate() {
    if (st.frame) return st.frame;
    const f = createFrame({ world });
    st.frame = f;
    st.site = createSite(f.iframe, f);
    C.bench.appendChild(f.el);
    f.observe();
    f.el.querySelector('.st-dtog').addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      for (const x of f.el.querySelectorAll('.st-dtog button')) x.setAttribute('aria-pressed', String(x === b));
      try { world?.setLoad?.('dom-heavy'); } catch {}
      await f.setWidth(b.dataset.d === 'phone' ? 390 : null, st.ui).catch(() => {});
      try { world?.setLoad?.('normal'); } catch {}
    });
    return f;
  }
  const X = (run) => ({
    get site() { return st.site; },
    get slate() { return st.frame; },
    run, ui: st.ui,
    compact: compact(),
    wait: (ms) => run.wait(ms),
    hl: (el, label, ok) => st.frame?.hl(el, label, ok),
    toast,
  });

  /* ---------- spec card ---------- */
  function specCardEl(ctx, thumbs) {
    const card = mk('section', 'st-spec');
    card.setAttribute('aria-label', `Spec r${ctx.rev}`);
    card.innerHTML =
      `<header class="st-spec-h"><span class="st-spec-t">Spec · <b class="st-rev">r${ctx.rev}</b></span><span class="st-spec-by">Podway record</span></header>` +
      '<div class="st-spec-b"><dl class="st-rows"></dl></div>' +
      '<footer class="st-spec-f"><span class="st-lk">Draft · not approved</span><span class="st-cnt"></span></footer>' +
      '<div class="st-spec-g"></div>';
    card._thumbs = thumbs;
    return card;
  }
  const rowEl = (row) => {
    const r = mk('div', `st-row${row.as ? ' st-row--as' : ''}`);
    r.innerHTML = `<dt>${esc(row.k)}</dt><dd></dd>`;
    return r;
  };
  function specCount(card, ctx) {
    const rows = ctx.spec?.rows || [];
    const nAs = rows.find((r) => r.as)?.v.length || 0;
    card.querySelector('.st-cnt').textContent = `${rows.length} items · ${nAs} assumptions`;
  }
  function specMini(ctx) {
    const d = mk('details', 'st-specmini');
    const rows = ctx.spec?.rows || [];
    const nAs = rows.find((r) => r.as)?.v.length || 0;
    d.innerHTML = `<summary><span class="st-specmini-k">Spec r${ctx.rev} · approved</span><span class="st-specmini-n">${rows.length} items · ${nAs} assumptions</span></summary>` +
      `<dl>${rows.map((r) => `<div class="${r.as ? 'as' : ''}"><dt>${esc(r.k)}</dt><dd>${esc(Array.isArray(r.v) ? r.v.join(' · ') : r.v)}</dd></div>`).join('')}</dl>`;
    return d;
  }
  function sheetHost() {
    let s = document.getElementById('st-sheet');
    if (!s) {
      s = mk('div', 'st-sheethost');
      s.id = 'st-sheet';
      s.hidden = true;
      s.inert = true;
      s.innerHTML = '<div class="st-sheet-scrim" aria-hidden="true"></div>';
      document.body.appendChild(s);
    }
    return s;
  }

  /* ---------- gate ---------- */
  // No typing (founder, 2026-09-28): a revision is one of the scenario's preset chips; the ones already
  // applied drop out of the next gate. [수정] folds the chips open; Esc folds them away again.
  const presetsFor = (sc, ctx) => (sc.revisions || []).filter((p) => !(ctx.revs || []).includes(p.id));
  function gateEl(g, presets, ctx) {
    const handoff = g.kind === 'handoff';
    const el = mk('section', `st-gate${handoff ? ' st-gate--handoff' : ''}`);
    el.setAttribute('role', 'group');
    el.setAttribute('aria-labelledby', 'st-gate-q');
    const lead = handoff ? '덧붙일 문장을 고르세요. 메일 초안 끝에 그대로 넣습니다.' : `무엇을 바꿀까요? 고르시면 Spec을 r${(ctx.rev || 1) + 1}로 고칩니다.`;
    el.innerHTML =
      `<div class="st-gate-k"><i aria-hidden="true"></i>${handoff ? 'Human check · Podway Gate' : 'Human approval · Podway Gate'}</div>` +
      `<h3 class="st-gate-q" id="st-gate-q">${esc(g.title)}</h3>` +
      `<p class="st-gate-p">${esc(g.desc)}</p>` +
      '<div class="st-gate-acts">' +
        `<button type="button" class="st-approve" aria-label="${esc(`${g.approve} · ${g.meta}`)}"><span class="st-gt">${glyphHTML('R')}</span><span class="st-approve-t">${esc(g.approve)}</span><small>${esc(g.meta)}</small></button>` +
        (presets.length ? `<button type="button" class="st-revise" aria-expanded="false" aria-controls="st-revbox">${handoff ? '덧붙이기' : '수정'}</button>` : '') +
      '</div>' +
      (presets.length ? '<div class="st-revbox" id="st-revbox" hidden>' +
        `<p class="st-rev-l" id="st-rev-l">${esc(lead)}</p>` +
        `<div class="st-revs" role="group" aria-labelledby="st-rev-l">${presets.map((p) => `<button type="button" class="st-rv" data-rev="${esc(p.id)}"><i aria-hidden="true">+</i>${esc(p.label)}</button>`).join('')}</div>` +
      '</div>' : '');
    return el;
  }
  function recordEl(label, detail) {
    const r = mk('div', 'st-record');
    r.innerHTML = `<span class="st-ok" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M1.6 5.3 4 7.6 8.5 2.6" fill="none" stroke="#0B0D0E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><b>${esc(label)}</b> · ${esc(detail)}</span><span class="st-ts">${esc(clock(true))}</span>`;
    return r;
  }

  /* ---------- ship card ---------- */
  function shipCard(ctx, mail, handoff) {
    const sc = st.sc;
    const c = mk('section', `st-ship${handoff ? ' st-ship--handoff' : ''}`);
    c.setAttribute('aria-labelledby', 'st-ship-h');
    const nums = handoff ? '' :
      `<div class="st-simrec"><div class="st-simrec-h">${esc(SIM_LABEL)}</div><dl class="st-nums">${summaryPairs(sc.counts).map(([k, v], i) => `<div class="${i > 1 ? 'm' : 'h'}"><dd>${esc(v)}</dd><dt>${esc(k)}</dt></div>`).join('')}</dl></div>`;
    c.innerHTML =
      `<div class="st-ship-k">${handoff ? esc(sc.ship.k) : `Delivery · Draft r${ctx.draftRev || 2}${SVC[ctx.svc] ? ` · ${esc(SVC[ctx.svc].name)}` : ''}`}</div>` +
      `<h3 id="st-ship-h">${esc(sc.ship.h)}</h3>` +
      `<p class="st-ship-p">${esc(sc.ship.p)}</p>` + nums +
      `<a class="st-cta" href="${esc(mail.url)}">${esc(handoff ? sc.ship.cta : '상담 신청하기')}${glyphHTML('R')}</a>` +
      (handoff ? '' : '<button type="button" class="st-cta2" data-dev>Developer view<span>spec · log · tools</span></button>') +
      `<div class="st-copyrow"><span>메일 앱이 열리지 않으면</span><button type="button" data-copy>메일 주소 복사</button></div>` +
      (handoff ? '' : `<p class="st-demonote">${esc(COPY.demoNote)}</p>`) +
      `<p class="st-founder">${esc(FOUNDER.line)}</p>`;
    c.querySelector('[data-copy]').addEventListener('click', async () => {
      const ok = await copyText(MAIL);
      toast(ok ? `메일 주소를 복사했습니다: ${MAIL}` : `복사하지 못했습니다. ${MAIL}로 보내 주세요.`);
    });
    c.querySelector('[data-dev]')?.addEventListener('click', (e) => S.dev.open('spec', e.currentTarget));
    return c;
  }
  function ctaBar(mail, handoff) {
    st.ctaBar?.remove();
    const b = mk('div', 'st-ctabar');
    b.innerHTML = `<a class="st-cta" href="${esc(mail.url)}">${esc(handoff ? '메일 앱에서 초안 열기' : '상담 신청하기')}${glyphHTML('R')}</a>` +
      (handoff ? '' : '<button type="button" class="st-gbtn" data-dev aria-label="Developer view">Dev</button>');
    b.querySelector('[data-dev]')?.addEventListener('click', (e) => S.dev.open('log', e.currentTarget));
    document.body.appendChild(b);
    st.ctaBar = b;
    return b;
  }

  /* ---------- developer panel ---------- */
  const DEV_TABS = [['spec', 'spec.json'], ['tree', 'tree'], ['log', 'gaori.log'], ['tools', 'tools']];
  function specJSON() {
    const ctx = st.ctx || {};
    const sc = st.sc;
    const o = { procedure: 'live-build', service: SVC[ctx.svc]?.name || null, scenario: sc?.id || null, revision: `r${ctx.rev || 1}`, request: ctx.q || '', approved_by: 'visitor · human gate' };
    const rows = ctx.spec?.rows || [];
    if (rows.length) {
      o.spec = {};
      for (const r of rows) if (!r.as) o.spec[r.k] = r.v;
      const as = rows.find((r) => r.as);
      if (as) o.assumptions = as.v;
    }
    if (ctx.notes?.length) o.revisions = ctx.notes;
    if (sc?.counts) o.trace = { draft: `r${ctx.draftRev || 1}`, tests: sc.counts.tests, rework: sc.counts.rework, review_applied: sc.counts.review, note: 'simulated in the browser' };
    return o;
  }
  const hlJSON = (o) => esc(JSON.stringify(o, null, 2))
    .replace(/&quot;([^&]*?)&quot;(\s*:)/g, '<span class="k">"$1"</span>$2')
    .replace(/:\s&quot;(.*?)&quot;/g, ': <span class="s">"$1"</span>');
  function devBody(tab) {
    if (tab === 'spec') return `<pre>${hlJSON(specJSON())}</pre>`;
    if (tab === 'tree') return `<pre>${esc(st.tree.length ? st.tree.join('\n') : '(before build)')}</pre>`;
    if (tab === 'log') return `<pre>${esc(st.raw.length ? st.raw.join('\n') : '(no log yet)')}</pre>`;
    const main = ['aquarium', 'podway', 'gaori', 'mulgae'];
    const rest = TOOL_ORDER.filter((id) => !main.includes(id));
    const card = (id) => {
      const T = TOOLS[id];
      const meta = [T.ver, T.lang, T.license].filter(Boolean).join(' · ');
      return `<a class="st-tool" href="${esc(repoUrl(T.repo))}" target="_blank" rel="noopener"><span class="st-tool-n">${esc(toolLabel(id))}${meta ? `<i>${esc(meta)}</i>` : ''}<u>github.com/irootkernel/${esc(T.repo)} ↗</u></span><span class="st-tool-r">${esc(T.role)}</span></a>`;
    };
    return `<div class="st-tools">${main.map(card).join('')}</div>` +
      `<h3 class="st-dv-sec">More tools</h3><div class="st-tools st-tools--sm">${rest.map(card).join('')}</div>` +
      `<h3 class="st-dv-sec">Real release checks</h3><ul class="st-vlines">${RELEASES.map((r) => `<li>${esc(r.text)}</li>`).join('')}</ul>` +
      `<p class="st-dv-note">이 화면의 Build는 브라우저에서 미리 짜 둔 시연입니다. 로그의 숫자는 이번 시안의 값입니다. 위의 Tool과 release 기록은 실제입니다. 전체 목록: <a href="${esc(GITHUB)}" target="_blank" rel="noopener">github.com/irootkernel</a></p>`;
  }
  function devShell() {
    const d = C.dev;
    if (d.dataset.st) return d;
    d.dataset.st = '1';
    d.classList.add('st-devhost');
    d.innerHTML =
      '<div class="st-dev-scrim" data-close></div>' +
      '<aside class="st-dev" role="dialog" aria-modal="true" aria-labelledby="st-dev-t">' +
        '<header class="st-dev-h"><h2 id="st-dev-t">&lt;/&gt; Developer view</h2><button type="button" class="st-dev-x" data-close>닫기 <kbd>Esc</kbd></button></header>' +
        `<div class="st-dev-tabs" role="tablist" aria-label="Developer view">${DEV_TABS.map(([k, n], i) => `<button type="button" role="tab" id="st-tab-${k}" data-tab="${k}" aria-controls="st-dev-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${n}</button>`).join('')}</div>` +
        '<div class="st-dev-b" id="st-dev-panel" role="tabpanel" tabindex="0" aria-labelledby="st-tab-spec"></div>' +
      '</aside>';
    const tabs = [...d.querySelectorAll('[role="tab"]')];
    const show = (k, focus) => {
      for (const b of tabs) {
        const on = b.dataset.tab === k;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      }
      const p = d.querySelector('.st-dev-b');
      p.setAttribute('aria-labelledby', `st-tab-${k}`);
      p.innerHTML = devBody(k);
      p.scrollTop = 0;
    };
    d._show = show;
    d.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) S.dev.close();
      const t = e.target.closest('[role="tab"]');
      if (t) show(t.dataset.tab);
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); S.dev.close(); return; }
      const i = tabs.indexOf(document.activeElement);
      if (i >= 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        show(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].dataset.tab, true);
      }
      if (e.key === 'Tab') { // focus trap
        const f = [...d.querySelectorAll('.st-dev button, .st-dev a[href], .st-dev [tabindex="0"]')].filter((x) => x.tabIndex >= 0 && x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return d;
  }

  /* =========================================================================
     The API
     ========================================================================= */
  const S = {
    layout,
    refs: L, // standalone layout containers (null in deep)
    get sc() { return st.sc; },
    get ctx() { return st.ctx; },
    get where() { return where(); },

    // a demo scenario (not a service area: the journey maps area → scenario, content.js SVC[area].scenarios)
    async load(scenario) {
      const id = { home: 'web', tool: 'app' }[scenario] || scenario;
      if (!['web', 'app', 'consult', 'handoff'].includes(id)) throw new Error(`unknown scenario: ${scenario}`);
      const mod = await import(`../scenarios/${id}.js?v=0cd00b25fdf6`);
      st.sc = mod.default;
      st.said.clear();
      st.gateWaits = 0;
      return st.sc;
    },

    /* ----- lines the orchestrator may place where its beats need them (each is said once) ----- */
    narrate: {
      async opening(ctx, run) {
        st.ctx = ctx;
        const sc = st.sc;
        // one line, or several (a plain-homepage request: HOMEPAGE_NOTE.say comes first, on its own)
        for (const [i, t] of [].concat(sc.opening(ctx)).entries()) await Lg.ai(t, { run, think: i ? 260 : 380 });
        if (sc.kind === 'handoff') await Lg.tool('podway', [{ t: 'procedure · ' }, { t: 'request', cls: 'good' }, { t: ' → ' }, { t: 'human check', cls: 'warm' }, { t: ' → handoff · no build' }], { run });
        else await Lg.tool('podway', [{ t: 'procedure · ' }, { t: 'spec', cls: 'good' }, { t: ' → ' }, { t: 'human approval', cls: 'warm' }, { t: ' → build → test → review → delivery' }], { run });
        raw(`## podway · procedure · live-build ${ver('podway')}`);
        raw('· state: intake → spec');
      },
      async afterSpec(ctx, run) {
        const sc = st.sc;
        const t = typeof sc.afterSpec === 'function' ? sc.afterSpec({ ...ctx, where: where() }) : sc.afterSpec;
        await Lg.ai(t, { run, think: 220, pace: 0.9 });
      },
      async gateWait(ctx, run) {
        const handoff = st.sc.kind === 'handoff';
        st.gateWaits++;
        await Lg.tool('podway', [{ t: 'gate · ' }, { t: handoff ? 'waiting for human check' : 'waiting for human approval', cls: 'warm' }, ...(ctx.rev > 1 && !handoff ? [{ t: ` · spec r${ctx.rev}` }] : [])], { run });
        raw(`… gate: human ${handoff ? 'check' : 'approval'} required · waiting${ctx.rev > 1 ? ` · spec r${ctx.rev}` : ''}`);
        if (st.gateWaits === 1) await Lg.ai(handoff ? '확인 전에는 아무것도 준비하지 않습니다.' : COPY.gateWait, { run, think: 160 });
        announce(handoff ? 'Waiting for human check' : 'Waiting for human approval');
      },
      async approved(ctx, run) {
        const sc = st.sc;
        if (sc.kind === 'handoff') {
          await Lg.tool('podway', [{ t: 'handoff · ' }, { t: 'human check 1', cls: 'warm' }, { t: ' · to the founder' }], { run });
          await Lg.ai(sc.approved, { run, think: 200 });
          return;
        }
        await Lg.tool('podway', [{ t: 'gate passed · ' }, { t: 'human approval', cls: 'warm' }, { t: ` · spec r${ctx.rev} locked · ${clock()}` }], { run });
        await Lg.ai(`Podway가 승인을 기록했습니다. 이제 Spec r${ctx.rev} 기준으로 구현합니다.`, { run, think: 200 });
      },
      async dive(ctx, run) {
        if (st.said.has('dive') || st.sc.kind === 'handoff') return;
        st.said.add('dive');
        const n = st.sc.build.sections.length;
        await Lg.tool('aquarium', [{ t: `build r1 · from spec r${ctx.rev} · ` }, { t: `${n} tasks`, cls: 'good' }], { run });
        raw(`## aquarium · build r1 · AI fleet ${ver('aquarium')}`);
        raw(`· from spec r${ctx.rev} · split into ${n} tasks`);
      },
      async rise(ctx, run) {
        if (st.said.has('rise') || st.sc.kind === 'handoff') return;
        st.said.add('rise');
        const c = st.sc.counts;
        await Lg.tool('podway', [{ t: 'deliver · ' }, { t: `spec r${ctx.rev} · draft r${ctx.draftRev || 2}`, cls: 'good' }, { t: ` · rework ${c.rework} · review ${c.review}` }], { run });
        raw(`## podway · deliver ${ver('podway')}`);
        raw(`✓ state: delivered · spec r${ctx.rev} · draft r${ctx.draftRev || 2} · rework ${c.rework} · review ${c.review}`);
      },
    },

    /* ----- spec ----- */
    spec: {
      mount(hostEl) {
        const ctx = st.ctx || { rev: 1 };
        st.card?.remove();
        const sheet = compact();
        const card = specCardEl(ctx, deep || sheet);
        st.card = card;
        if (sheet) {
          const h = sheetHost();
          card.classList.add('st-spec--sheet');
          h.appendChild(card);
          showBox(h);
        } else if (hostEl) {
          hostEl.appendChild(card);
        } else if (deep) {
          C.specHost.appendChild(card);
          showBox(C.specHost);
        } else {
          Lg.card(card);
        }
        if (!REDUCED && !sheet) anim(card, [{ transform: 'scaleX(.04)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'none' });
        return card;
      },

      async stream(ctx, run) {
        st.ctx = ctx;
        const sc = st.sc;
        if (sc.kind === 'handoff') return streamLetter(ctx, run);
        ctx.spec = sc.spec(ctx.q, ctx);
        if (!st.card) S.spec.mount();
        const card = st.card;
        const dl = card.querySelector('.st-rows');
        const body = card.querySelector('.st-spec-b');
        st.frame?.scope.el && st.frame.scope.state('', 'Draft · not built');
        for (const row of ctx.spec.rows) {
          const r = rowEl(row);
          dl.appendChild(r);
          body.scrollTop = body.scrollHeight;
          await run.wait(REDUCED ? 40 : rand(90, 200));
          const dd = r.querySelector('dd');
          if (row.pages && card._thumbs) {
            const strip = mk('div', 'st-wfs');
            strip.innerHTML = row.v.slice(0, 3).map((it, i) => `<span class="st-wfc">${wfHTML(i, i * 0.1)}<b>${esc(it.split(' — ')[0])}</b></span>`).join('');
            dd.appendChild(strip);
            body.scrollTop = body.scrollHeight;
            await run.wait(REDUCED ? 60 : 420);
          } else if (Array.isArray(row.v)) {
            const ul = mk('ul');
            dd.appendChild(ul);
            for (const it of row.v) {
              const li = mk('li');
              ul.appendChild(li);
              await stream(li, it, { run, pace: 0.5 });
              body.scrollTop = body.scrollHeight;
              await run.wait(REDUCED ? 20 : rand(60, 160));
            }
          } else {
            await stream(dd, row.v, { run, pace: 0.5 });
          }
          body.scrollTop = body.scrollHeight;
          st.frame?.scope.row(row);
        }
        specCount(card, ctx);
        raw(`✓ spec r${ctx.rev} recorded · ${ctx.spec.rows.length} items · ${ctx.spec.rows.find((r) => r.as)?.v.length || 0} assumptions`);
        return card;
      },

      async revise(ctx, note, run) {
        st.ctx = ctx;
        const sc = st.sc;
        ctx.notes = ctx.notes || [];
        ctx.notes.push(note);
        // which presets are applied: the next gate drops them, and the scenario's html(ctx) can show them
        const track = (ch) => { ctx.revs = [...(ctx.revs || []), ch.id || String(note)]; if (ch.extra) { ctx.extra = ch.extra; ctx.extras = [...(ctx.extras || []), ch.extra]; } };
        if (sc.kind === 'handoff') {
          const ch = sc.revise(note, ctx);
          track(ch);
          await Lg.ai(ch.say, { run, think: 500, label: 'appending to the mail draft' });
          const b = st.site?.$('#ltBody');
          if (b) await stream(b, `\n\n덧붙임: ${note}`, { run, pace: 0.6, cursor: false });
          raw('› gate: note → mail draft');
          return;
        }
        const ch = sc.revise(note, ctx);
        track(ch);
        await Lg.ai(ch.say, { run, think: 700, label: 'revising the spec' });
        ctx.rev = (ctx.rev || 1) + 1;
        // the spec itself (for the mail and spec.json)
        const rows = ctx.spec.rows;
        let row = rows.find((r) => r.k === ch.k);
        if (!row) { row = { k: ch.k, v: [] }; rows.splice(Math.max(0, rows.findIndex((r) => r.as)), 0, row); }
        if (!Array.isArray(row.v)) { row.v = [row.v]; delete row.m; }
        row.v.push(ch.v);
        row.rev = ctx.rev;
        // the card
        const card = st.card;
        if (card) {
          const rv = card.querySelector('.st-rev');
          rv.textContent = `r${ctx.rev}`;
          rv.classList.remove('bump');
          void rv.offsetWidth;
          rv.classList.add('bump');
          card.setAttribute('aria-label', `Spec r${ctx.rev}`);
          const dl = card.querySelector('.st-rows');
          let r = [...dl.querySelectorAll('.st-row')].find((x) => x.querySelector('dt').textContent === ch.k);
          if (!r) { r = rowEl({ k: ch.k }); dl.insertBefore(r, dl.querySelector('.st-row--as')); }
          r.classList.add('st-row--new');
          const dd = r.querySelector('dd');
          let ul = dd.querySelector('ul');
          if (!ul) {
            const strip = dd.querySelector('.st-wfs');
            const prev = strip ? '' : dd.textContent;
            if (!strip) dd.textContent = '';
            ul = mk('ul');
            dd.appendChild(ul);
            if (prev) { const li0 = mk('li'); li0.textContent = prev; ul.appendChild(li0); }
          }
          const li = mk('li', 'st-li--new');
          ul.appendChild(li);
          const body = card.querySelector('.st-spec-b');
          r.scrollIntoView?.({ block: 'nearest' });
          await stream(li, ch.v, { run, pace: 0.6 });
          li.appendChild(mk('span', 'st-chg', `r${ctx.rev}`));
          body.scrollTop = Math.max(0, r.offsetTop - 40);
          card.querySelector('.st-lk').textContent = 'Revised · not approved';
          specCount(card, ctx);
        }
        st.frame?.scope.add(ch.v, ctx.rev);
        st.frame?.scope.state('', 'Revised · not built');
        raw(`› gate: revision → spec r${ctx.rev} written`);
        raw(`✓ spec r${ctx.rev} recorded · 1 change`);
      },

      // The approved card folds away: into the capsule (deep) or into a one-line record (standalone).
      async fold(run) {
        const card = st.card;
        const ctx = st.ctx;
        if (!card) return;
        st.card = null;
        const g = card.querySelector('.st-gate');
        if (g) g.replaceWith(recordEl('Human approval', `Spec r${ctx.rev} locked`));
        card.classList.add('st-locked');
        card.querySelector('.st-lk').textContent = `Approved · r${ctx.rev} locked`;
        const mini = specMini(ctx);
        if (card.classList.contains('st-spec--sheet')) {
          const h = card.parentElement;
          await anim(card, [{ transform: 'none' }, { transform: 'translateY(104%)' }], { duration: 480, easing: 'cubic-bezier(.65,0,.35,1)' }, run);
          card.remove();
          hideBox(h);
          Lg.card(mini);
          return;
        }
        if (deep && card.parentElement === C.specHost) {
          const a = toRect(world?.anchor?.('capsule'));
          const r = card.getBoundingClientRect();
          const dx = a ? a.left + a.width / 2 - (r.left + r.width / 2) : 0;
          const dy = a ? a.top + a.height / 2 - (r.top + r.height / 2) : 0;
          await anim(card, [{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.06,.02)`, opacity: 0 }], { duration: 620, easing: 'cubic-bezier(.65,0,.35,1)' }, run);
          card.remove();
          hideBox(C.specHost);
          Lg.card(mini);
          return;
        }
        // standalone desktop: the card collapses in place into its record
        await anim(card, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }, run);
        card.replaceWith(mini);
        anim(mini, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, fill: 'none' });
      },
    },

    /* ----- the human gate ----- */
    gate: {
      get waiting() { return !!st.gate; },

      ask(ctx, run) {
        st.ctx = ctx;
        const sc = st.sc;
        const handoff = sc.kind === 'handoff';
        const g = sc.gate(ctx);
        g.kind = handoff ? 'handoff' : g.kind;
        const presets = presetsFor(sc, ctx);
        const el = gateEl(g, presets, ctx);
        // In the standalone column the spec card is part of the log, so the gate follows the newest
        // line (A); in #specHost (deep) and in the phone sheet it is the card's own footer.
        const card = st.card && !st.card.closest('.st-log') ? st.card : null;
        let host = null;
        let undo = null;
        if (card) {
          card.querySelector('.st-spec-g').replaceChildren(el);
          card.classList.add('st-spec--gate');
          if (card.classList.contains('st-spec--sheet')) {
            card.setAttribute('role', 'dialog');
            card.setAttribute('aria-modal', 'true');
            undo = modal(card.parentElement);
          }
        } else if (compact()) {
          host = sheetHost();
          el.classList.add('st-gate--sheet');
          host.appendChild(el);
          showBox(host);
          el.setAttribute('role', 'dialog');
          el.setAttribute('aria-modal', 'true');
          undo = modal(host);
        } else if (deep) {
          host = C.gate;
          host.replaceChildren(el);
          showBox(host);
        } else {
          Lg.card(el);
        }
        st.frame?.slotWait(true);
        st.frame?.u('idle');
        st.frame?.state('');
        if (st.frame?.scope.el) st.frame.scope.state('wait', handoff ? 'Waiting for check' : 'Waiting for approval');
        if (!deep && st.frame) st.frame.wait(handoff ? 'Waiting for human check' : 'Waiting for human approval', handoff ? '확인하시면 메일 초안을 준비합니다. 메일 앱에서 직접 보내시기 전에는 아무것도 전송되지 않습니다.' : '승인하시면 여기서 구현을 시작합니다. 승인 전에는 아무것도 실행하지 않습니다.', true);
        if (handoff && st.frame) st.frame.waitOff();

        const ap = el.querySelector('.st-approve');
        const rv = el.querySelector('.st-revise');
        const bx = el.querySelector('.st-revbox');
        let used = false;
        let cleaned = false;
        const cleanup = () => {
          if (cleaned) return;
          cleaned = true;
          if (st.gate?.el === el) st.gate = null;
          undo?.();
          if (card?.getAttribute('role') === 'dialog') { card.removeAttribute('role'); card.removeAttribute('aria-modal'); }
        };
        run.defer(cleanup);
        // After a revision the gate leaves; a fresh one comes back with the next spec revision.
        const dispose = () => {
          if (card) { el.remove(); card.classList.remove('st-spec--gate'); }
          else if (host) { hideBox(host); el.remove(); }
          else (el.closest('.st-msg--card') || el).remove();
        };

        const p = new Promise((resolve) => {
          const finish = (v) => {
            if (used) return;
            used = true;
            cleanup();
            st.frame?.slotWait(false);
            resolve(v);
          };
          const openBox = (on) => {
            if (!bx) return;
            bx.hidden = !on;
            rv.setAttribute('aria-expanded', String(on));
            if (on) bx.querySelector('.st-rv')?.focus(); else rv.focus();
          };
          ap.addEventListener('click', () => {
            if (used || !run.alive) return;
            Lg.act(handoff ? '확인 · 메일 초안' : `승인 · Spec r${ctx.rev}`);
            finish({ type: 'approve', glyphEl: ap.querySelector('.st-gt svg') });
          });
          rv?.addEventListener('click', () => openBox(bx.hidden));
          // a tap on a preset: an action record ("나 ▸ 수정 · 케이크 예약 추가"), never words put in the visitor's mouth
          const pick = (key) => {
            if (used || !run.alive) return;
            const p = presets.find((x) => x.id === key || x.label === key);
            if (!p) return;
            Lg.act(`${handoff ? '덧붙임' : '수정'} · ${p.label}`);
            finish({ type: 'revise', note: p.label, id: p.id });
            dispose();
          };
          bx?.addEventListener('click', (e) => { const b = e.target.closest('[data-rev]'); if (b) pick(b.dataset.rev); });
          // Esc never cancels at the gate: it only folds the revision chips.
          el.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            e.stopPropagation();
            if (bx && !bx.hidden) openBox(false);
          });
          st.gate = { el, pick, handoff };
        });

        // Focus goes to the approve button once the gate is on screen.
        (async () => {
          try {
            await run.wait(REDUCED ? 40 : 360);
            if (!used && el.isConnected) {
              if (!card?.classList.contains('st-spec--sheet')) el.scrollIntoView?.({ block: 'nearest' });
              ap.focus({ preventScroll: true });
            }
          } catch { /* cancelled */ }
        })();
        return run.race(p);
      },

      // Picks one of the open preset revisions (by id or label) — the same as tapping its chip.
      revise(key) { st.gate?.pick(String(key || '')); },
      // the preset revisions the gate is offering right now ([{id, label}])
      get presets() { return st.gate ? [...st.gate.el.querySelectorAll('[data-rev]')].map((b) => ({ id: b.dataset.rev, label: b.textContent.replace(/^\+/, '') })) : []; },

      // The ">" flies from the approve button to targetRect (W.anchor('slot') in deep; the frame's slot here).
      async stamp(glyph, target, run) {
        const ctx = st.ctx || {};
        const handoff = st.sc?.kind === 'handoff';
        let dst = toRect(target);
        if (!dst && st.frame) dst = toRect(st.frame.slotRect());
        const src = glyph?.isConnected ? glyph.getBoundingClientRect() : null;
        const gateEl = glyph?.closest?.('.st-gate');
        const land = () => {
          if (!deep && st.frame) st.frame.shut();
          if (st.frame) st.frame.u(handoff ? 'done' : 'work');
          if (gateEl) {
            const rec = recordEl(handoff ? 'Human check' : 'Human approval', handoff ? 'Mail draft confirmed' : `Spec r${ctx.rev} locked`);
            const inSheet = gateEl.closest('#st-sheet');
            const inGateBox = gateEl.parentElement === C.gate;
            if (inSheet && !gateEl.closest('.st-spec')) { hideBox(inSheet); gateEl.remove(); Lg.card(rec); }
            else if (inGateBox) { hideBox(C.gate); gateEl.remove(); Lg.card(rec); }
            else gateEl.replaceWith(rec);
          }
          if (st.card) st.card.querySelector('.st-lk').textContent = `Approved · r${ctx.rev} locked`;
          st.frame?.scope.state('ok', handoff ? 'Checked · handoff' : `Approved · r${ctx.rev} locked`);
          if (!deep && st.frame && !handoff) st.frame.wait('Approved', `Spec r${ctx.rev} 승인을 기록했습니다. 이 revision을 기준으로 구현을 시작합니다.`);
          raw(handoff ? '› gate passed · human check' : `› gate passed · human approval · spec r${ctx.rev} locked`);
          announce(handoff ? 'Human check · Mail draft confirmed' : `Human approval · Spec r${ctx.rev} locked`);
        };
        if (glyph) glyph.style.visibility = 'hidden';
        if (REDUCED || !src || !dst) {
          land();
          if (dst) rings(dst, run, true);
          return;
        }
        const f = glyphEl('R', 'st-fly');
        Object.assign(f.style, { left: `${dst.left}px`, top: `${dst.top}px`, width: `${dst.width}px`, height: `${dst.height}px` });
        document.body.appendChild(f);
        run.defer(() => f.remove());
        const dx = src.left - dst.left, dy = src.top - dst.top, s = src.height / dst.height;
        await anim(f, [
          { transform: `translate(${dx}px,${dy}px) scale(${s})`, easing: 'cubic-bezier(.3,0,.25,1)' },
          { transform: `translate(${dx * 0.42}px,${dy * 0.42 - 70}px) scale(${Math.max(s * 1.7, 2)}) rotate(-7deg)`, offset: 0.52, easing: 'cubic-bezier(.75,0,1,.55)' },
          { transform: 'translate(0,0) scale(1.32)', offset: 0.86, easing: 'cubic-bezier(.2,.8,.2,1)' },
          { transform: 'none' },
        ], { duration: 780 }, run);
        f.remove();
        land();
        rings(dst, run, false);
      },
    },

    /* ----- the frame ----- */
    slate: {
      mount(ctx) {
        if (ctx) st.ctx = ctx;
        const f = slate();
        const c = st.ctx || {};
        const sc = st.sc;
        f.request(c.q || sc?.title || '');
        if (sc?.kind === 'handoff') { f.urlLabel('draft'); f.url(MAIL, 1); f.el.querySelector('.st-url-r').textContent = 'unsent'; }
        else f.url(sc?.url || 'draft', c.draftRev || 1);
        f.u(c.approved ? 'work' : 'idle');
        // an unapproved frame keeps its ">" slot open (standalone, and a handoff's letter in the deep layout)
        if (!c.approved) f.slotWait(false); else f.shut();
        f.lock(true);
        if (sc && !f.loaded) { st.site.load(sc.fonts || []); f.loaded = sc.id; }
        // Standalone: the frame is on screen before the gate, so it says so — nothing is built yet.
        if (!deep && !c.approved && sc) {
          if (sc.kind === 'handoff') f.wait('Mail draft', '맞는 예시가 없으면 짐작해서 만들지 않습니다.');
          else {
            f.bp('faint');
            f.scope.mount();
            f.wait('Writing spec', '아직 아무것도 구현하지 않습니다. 무엇을 만들지 먼저 Spec으로 합의합니다.');
          }
        }
        showBox(C.bench);
        requestAnimationFrame(() => f.syncRect());
        return {
          el: f.el,
          rect: f.rect,
          setWidth: (px, run) => f.setWidth(px, run),
          scanAt: (y) => f.scanAt(y),
          lock: (on) => f.lock(on),
          slotRect: f.slotRect,
          onRect: f.onRect,
        };
      },
      get api() { return st.frame; },
    },

    /* ----- 03 build (A buildGeneric) ----- */
    async build(ctx, run, hooks = {}) {
      st.ctx = ctx;
      const sc = st.sc;
      if (sc.kind === 'handoff') return 'na';
      ctx.approved = true;
      ctx.draftRev = ctx.draftRev || 1;
      const P = sc.build;
      const f = slate();
      if (!st.site.ready || f.loaded !== sc.id) { st.site.load(sc.fonts || []); f.loaded = sc.id; }
      f.shut();
      f.u('work');
      f.state('');
      f.waitOff();
      const scopeGone = alongside(f.scope.hide(run));
      await S.narrate.dive(ctx, run);
      await run.within(st.site.ready, 6000);
      await st.site.mount(sc.html(ctx));
      await scopeGone;
      f.lock(true);
      if (!REDUCED) { f.bp(true); f.cols(true); } // calm: sections simply appear, in order
      f.glow(true);
      try { world?.setLoad?.('dom-heavy'); } catch {}
      const talk = alongside(Lg.ai(P.say, { run, think: 300 }));
      await run.wait(REDUCED ? 100 : 700);
      st.tree = ['site/'];
      const line = await Lg.tool('aquarium', [{ t: 'site/ ' }], { run });
      for (const [i, s] of P.sections.entries()) {
        st.site.reveal(s.id);
        const p = i === P.sections.length - 1 ? '└ ' : '├ ';
        st.tree.push(`${p}${s.name.padEnd(12)} ${s.r}`);
        raw(`${p}${s.name}  [${s.r}]`);
        await line.add([{ t: `${i ? ' · ' : ''}${s.name}` }]);
        try { hooks.onSection?.(i, s); } catch (e) { console.error(e); }
        await run.wait(REDUCED ? 180 : rand(340, 480));
      }
      line.commit();
      if (!REDUCED) {
        st.site.unfocus();
        st.site.top();
        await run.wait(520);
        for (const [i, s] of P.sections.entries()) {
          st.site.type(s.id);
          if (i >= 2 && s.id !== 'foot') st.site.scrollTo(st.site.sec(s.id));
          await run.wait(rand(260, 360));
        }
        st.site.top();
      }
      await talk;
      if (P.art?.length) {
        for (const id of P.art) st.site.draw(id);
        st.tree.push(`illustration.svg  line → color`);
        raw('· illustration.svg  [line → color]');
        await run.wait(REDUCED ? 200 : 1500);
      }
      if (P.say2) await Lg.ai(P.say2, { run, think: 200 });
      f.cols(false);
      f.bp(false);
      st.site.color(run);
      st.tree.push(`${P.tokens.padEnd(14)} ${P.tokensR}`);
      raw(`· ${P.tokens}  [${P.tokensR}]`);
      await run.wait(REDUCED ? 200 : 1700);
      try { world?.setLoad?.('normal'); } catch {}
      await Lg.tool('aquarium', [{ t: P.diff, cls: 'good' }], { run });
      raw(`■ ${P.diff}`);
      f.glow(false);
      return 'done';
    },

    /* ----- 04 test (A testGeneric): exit 1 → rework r2 → fix → exit 0 ----- */
    async test(ctx, run, hooks = {}) {
      st.ctx = ctx;
      const sc = st.sc;
      if (sc.kind === 'handoff') return 'na';
      const T = sc.test;
      const f = slate();
      const x = X(run);
      const sweep = async (ms) => {
        const own = f.ownScan(ms, run);
        const ext = hooks.sweep ? run.within(hooks.sweep(ms), ms + 2500) : null;
        await Promise.all([own, ext]);
        f.scanPos(null);
      };
      await Lg.ai(T.say, { run, think: 260 });
      // run 1
      raw(`## gaori · run 1 · ${T.n} checks ${ver('gaori')}`);
      if (T.phone) {
        if (!compact()) await f.setWidth(390, run);
        else f.state('390px check', 'teal');
      }
      const count = await Lg.tool('gaori', [{ t: `run 1 · ${T.n} checks · ` }, { t: '✓ 0', cls: 'good' }], { run });
      const passN = T.n - 1;
      const ticks = (async () => {
        const step = (REDUCED ? 0 : 1250) / passN;
        for (let k = 1; k <= passN; k++) {
          if (step) await run.wait(step);
          count.set([{ t: `run 1 · ${T.n} checks · ` }, { t: `✓ ${k}`, cls: 'good' }]);
        }
      })();
      await Promise.all([sweep(1250), ticks]);
      for (const [t, r] of T.pass) raw(`✓ ${t}  [${r}]`);
      raw(`✓ ${T.more}`);
      count.commit();
      await T.show(x);
      f.flash('bad');
      try { hooks.fail?.(); } catch (e) { console.error(e); }
      await Lg.tool('gaori', [{ t: 'exit 1', cls: 'bad' }, { t: ` · ${T.fail.score} · ${T.fail.text} · raw log kept` }], { run });
      raw(`✗ ${T.fail.text}  [exit 1]`);
      raw(`· raw log kept · ${T.fail.log}`);
      raw(`✗ run 1 verdict · exit 1 · ${T.fail.score}`);
      await Lg.ai(T.failSay, { run, think: 220 });
      // rework: Podway records the rollback; the world runs the current backwards
      await Lg.tool('podway', [{ t: 'rework', cls: 'warm' }, { t: ' · test → build · r2' }], { run });
      raw(`## podway · rework ${ver('podway')}`);
      raw('✓ rework · test → build · r2 recorded');
      await Promise.all([hooks.rework ? run.within(hooks.rework(), 3200) : null, run.wait(REDUCED ? 120 : 450)]);
      // fix r2
      ctx.draftRev = 2;
      f.url(sc.url, 2);
      raw(`## aquarium · fix r2 ${ver('aquarium')}`);
      for (const [k, t] of T.fix) raw(`${k === 'add' ? '+' : k === 'del' ? '−' : '·'} ${t}`);
      await Promise.all([
        Lg.tool('aquarium', [{ t: 'fix r2 · ' }, { t: T.fixSummary, cls: 'good' }], { run }),
        hooks.repair ? run.within(hooks.repair(), 3200) : null,
        T.apply(x),
      ]);
      // run 2
      raw(`## gaori · run 2 · ${T.n} checks ${ver('gaori')}`);
      const r2 = await Lg.tool('gaori', [{ t: 'run 2 · running' }], { run });
      await sweep(900);
      r2.set([{ t: 'run 2 · ' }, { t: 'exit 0', cls: 'good' }, { t: ` · ${T.total}` }]);
      r2.commit();
      raw(`✓ ${T.run2a}`);
      raw(`✓ ${T.run2b}`);
      raw(`■ exit 0 · ${T.total}  [verdict: pass]`);
      f.flash('good');
      try { hooks.pass?.(); } catch (e) { console.error(e); }
      await Lg.ai(T.passSay, { run, think: 200 });
      if (T.phone) {
        if (!compact()) await f.setWidth(null, run);
        else f.state('');
      }
      return 'done';
    },

    /* ----- 05 review (A reviewGeneric): pins appear one by one, then ✓ ----- */
    async review(ctx, run, hooks = {}) {
      st.ctx = ctx;
      const sc = st.sc;
      if (sc.kind === 'handoff') return 'na';
      const V = sc.review;
      const f = slate();
      const x = X(run);
      await Lg.ai(V.say, { run, think: 220 });
      await Lg.tool('mulgae', [{ t: 'review · 6 roles · ' }, { t: `${V.notes.length} advisories`, cls: 'warm' }], { run });
      raw(`## mulgae · review · 6 roles ${ver('mulgae')} · advisory`);
      for (const role of TOOLS.mulgae.roles) {
        const n = V.notes.find((y) => y.role === role);
        raw(n ? `… [${role}] ${n.text}  [advisory]` : `✓ [${role}] no findings`);
      }
      for (const [i, n] of V.notes.entries()) {
        const el = st.site.$(n.target);
        if (el) { st.site.scrollTo(el); await run.wait(REDUCED ? 60 : 420); }
        f.pin(i, el, `advisory · ${n.role} — ${n.pin}`);
        try { hooks.note?.(i, `${n.role} — ${n.pin}`); } catch (e) { console.error(e); }
        await run.wait(REDUCED ? 120 : 900);
      }
      await Lg.ai(V.say2, { run, think: 200 });
      raw(`## aquarium · review applied ${ver('aquarium')}`);
      for (const [i, n] of V.notes.entries()) {
        const el = st.site.$(n.target);
        if (el) { st.site.scrollTo(el); await run.wait(REDUCED ? 60 : 380); }
        await n.apply?.(x);
        f.pinDone(i, `applied · ${n.done}`);
        raw(`+ ${n.done}`);
        await run.wait(REDUCED ? 100 : 750);
      }
      await Lg.tool('aquarium', [{ t: 'review applied · ' }, { t: V.applied, cls: 'good' }], { run });
      raw(`✓ ${V.notes.length} advisories applied · recorded`);
      f.pinsQuiet();
      return 'done';
    },

    /* ----- 06 ship: unlock → toggle → chip → card, all within about a second ----- */
    async deliver(ctx, run) {
      st.ctx = ctx;
      const sc = st.sc;
      const f = slate();
      if (sc.kind === 'handoff') return deliverHandoff(ctx, run);
      await S.narrate.rise(ctx, run);
      f.clearPins();
      f.hl(null);
      // 1) the draft comes alive
      f.lock(false);
      f.u('done');
      f.delivered(true);
      try { sc.interactive?.(X(st.ui), ctx); } catch (e) { console.error(e); }
      const land = sc.landing && st.site.$(sc.landing);
      if (land) st.site.scrollTo(land, true); else st.site.top(true);
      await run.wait(REDUCED ? 0 : 220);
      // 2) desktop / mobile toggle (desktop only; a phone is already phone-width)
      if (!compact()) f.showToggle(true);
      await run.wait(REDUCED ? 0 : 220);
      // 3) the delivered chip
      f.state(compact() ? `Delivered · r${ctx.draftRev || 2}` : `Delivered · Draft r${ctx.draftRev || 2}`, 'warm');
      announce(`Delivered · Draft r${ctx.draftRev || 2}. 시안을 직접 눌러 볼 수 있습니다.`);
      const talk = alongside(Lg.ai(sc.ship.done(where()), { run, think: 150 }));
      const mail = buildBriefMail(ctx, sc.counts);
      const card = shipCard(ctx, mail, false);
      await run.wait(REDUCED ? 0 : 420);
      // 4) the card
      placeShip(card, mail, false);
      await talk;
      return { card, mail };
    },

    /* ----- developer panel ----- */
    dev: {
      get isOpen() { return C.dev.classList.contains('show'); },
      open(tab = 'spec', opener = null) {
        const d = devShell();
        st.lastFocus = opener || document.activeElement;
        d._show(DEV_TABS.some(([k]) => k === tab) ? tab : 'spec');
        showBox(d).then(() => d.querySelector('.st-dev-x')?.focus());
      },
      close() {
        if (C.dev.hidden) return;
        hideBox(C.dev);
        const back = st.lastFocus;
        st.lastFocus = null;
        if (back?.isConnected) back.focus?.({ preventScroll: true });
      },
    },

    toast,

    destroy() {
      if (st.destroyed) return;
      st.destroyed = true;
      st.ui.abort();
      st.frame?.unobserve();
      st.frame?.el.remove();
      st.frame = null;
      st.site = null;
      st.card?.remove();
      st.ctaBar?.remove();
      st.io?.disconnect();
      document.getElementById('st-sheet')?.remove();
      for (const k of ['specHost', 'gate', 'ship']) { C[k].replaceChildren(); C[k].hidden = true; C[k].inert = true; C[k].classList.remove('show'); }
      if (C.dev.dataset.st) { C.dev.replaceChildren(); delete C.dev.dataset.st; C.dev.hidden = true; C.dev.inert = true; C.dev.classList.remove('show'); }
      $$('.st-fly, .st-ring, .st-flash').forEach((n) => n.remove());
      html.classList.remove('st-on', 'st-deep', 'st-standalone', 'st-rm');
    },
  };

  /* ---------- internals that need S ---------- */

  function rings(dst, run, quiet) {
    if (REDUCED || quiet) return;
    const c = { x: dst.left + dst.width / 2, y: dst.top + dst.height / 2 };
    for (const [d, col, sc] of [[0, 'var(--st-ink)', 3.6], [90, 'var(--st-teal)', 2.4]]) {
      const r = mk('div', 'st-ring');
      r.style.cssText = `left:${c.x - 16}px;top:${c.y - 16}px;width:32px;height:32px;border-color:${col};opacity:0`;
      document.body.appendChild(r);
      run.defer(() => r.remove());
      anim(r, [{ transform: 'scale(.5)', opacity: 0.95 }, { transform: `scale(${sc})`, opacity: 0 }], { duration: 700, delay: d, easing: 'cubic-bezier(.2,.8,.2,1)' }).then(() => r.remove());
    }
    if (!deep) {
      const fl = mk('div', 'st-flash');
      document.body.appendChild(fl);
      anim(fl, [{ opacity: 0.06 }, { opacity: 0 }], { duration: 360 }).then(() => fl.remove());
    }
  }

  async function streamLetter(ctx, run) {
    const f = slate();
    if (!st.site.ready || f.loaded !== st.sc.id) { st.site.load([]); f.loaded = st.sc.id; }
    f.state('');
    f.waitOff();
    await run.within(st.site.ready, 6000);
    await st.site.mount(st.sc.html(ctx));
    st.site.root.classList.remove('bp', 'rm');
    raw('## podway · procedure · handoff');
    raw('… route: no matching scenario');
    raw('✓ handoff: to the founder · original text kept');
    const b = st.site.$('#ltBody');
    await stream(b, st.sc.letter(ctx.q), { run, pace: 0.45, cursor: false });
  }

  function placeShip(card, mail, handoff) {
    if (compact()) {
      C.ship.replaceChildren(card);
      C.ship.classList.add('st-shiphost');
      showBox(C.ship);
      const bar = ctaBar(mail, handoff);
      const own = card.querySelector('.st-cta');
      if (own && 'IntersectionObserver' in window) {
        st.io?.disconnect();
        st.io = new IntersectionObserver((es) => es.forEach((en) => {
          bar.classList.toggle('away', en.isIntersecting);
          bar.inert = en.isIntersecting;
        }), { threshold: 0.6 });
        st.io.observe(own);
      }
      if (!REDUCED) anim(card, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, fill: 'none' });
    } else {
      Lg.card(card);
      if (!REDUCED) anim(card, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, fill: 'none' });
    }
  }

  async function deliverHandoff(ctx, run) {
    const f = slate();
    f.lock(false);
    f.u('done');
    f.delivered(true);
    f.state('Handoff ready', 'warm');
    const mail = buildHandoffMail(ctx.q, { notes: ctx.notes || [] });
    const card = shipCard(ctx, mail, true);
    await run.wait(REDUCED ? 0 : 300);
    placeShip(card, mail, true);
    raw('## podway · handoff ready');
    raw('✓ state: handed_off · human check 1');
    return { card, mail };
  }

  return S;
}

// A silent stand-in so the studio can run without a visible conversation.
function nullLog() {
  const handle = { el: null, add: async () => {}, set() {}, commit() {} };
  return {
    you() {}, example() {}, act() {},
    ai: async () => null, tool: async () => handle,
    card() {}, fold() {}, clear() {}, subscribe: () => () => {},
  };
}
