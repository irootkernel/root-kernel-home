// labels.js — B's 3D-anchored labels (deep/index.html 2350–2376), creature cards, picking and the leader
// line (2379–2458). Changes from B: names come from content.js (Podway / Agent Dispatch / Agent Turn
// Network / Aquarium are English-only), the card is hidden+inert while closed (B left it focusable at
// opacity 0), and the product lights above the surface get one quiet label at a time.
import { $, $$, clamp } from '../core.js?v=0cd00b25fdf6';
import { TOOLS, toolLabel, toolSub, repoUrl, RELEASES, PRODUCTS, UI } from '../text.js?v=0cd00b25fdf6';

// CONTRACT §2 overlay rule. Show: remove hidden → inert=false → next frame .show.
// Hide: inert=true at once → remove .show → hidden after the transition.
export function showOverlay(n) {
  if (!n) return;
  n.hidden = false; n.inert = false;
  requestAnimationFrame(() => { if (!n.hidden && !n.inert) n.classList.add('show'); });
}
export function hideOverlay(n) {
  if (!n || n.hidden) return;
  n.inert = true;
  const shown = n.classList.contains('show');
  n.classList.remove('show');
  const dur = parseFloat(getComputedStyle(n).transitionDuration) || 0;
  if (!dur || !shown) { n.hidden = true; return; }   // no transition will run: hide now
  const done = (e) => { if (e && e.target !== n) return; n.removeEventListener('transitionend', done); if (!n.classList.contains('show')) n.hidden = true; };
  n.addEventListener('transitionend', done);
}

export function createLabels({ el, state, getWorld, isNarrow }) {
  /* ---- 3D-anchored labels (one at a time is the rule; ids replace each other) ---- */
  const Labels = {
    list: new Map(),
    add(id, text, anchorFn, cls = '', off = [18, -10], side = 'right', html = null) {
      this.remove(id, true);
      const n = document.createElement('div');
      n.className = `lbl ${cls} ${side === 'left' ? 'left' : ''}`;
      const s = document.createElement('span');
      if (html) s.innerHTML = html; else s.textContent = text;
      n.appendChild(s);
      el.labels.appendChild(n);
      const L = { n, s, anchorFn, off, side, gone: false };
      this.list.set(id, L);
      requestAnimationFrame(() => n.classList.add('show'));
      return L;
    },
    set(id, text, cls) { const L = this.list.get(id); if (!L) return; if (text != null) L.s.textContent = text; if (cls != null) L.n.className = `lbl show ${cls} ${L.side === 'left' ? 'left' : ''}`; },
    remove(id, now = false) {
      const L = this.list.get(id); if (!L) return;
      this.list.delete(id);
      if (now || !L.n.classList.contains('show')) { L.n.remove(); return; }
      L.n.classList.remove('show');
      L.n.addEventListener('transitionend', () => L.n.remove(), { once: true });
    },
    clear() { for (const id of [...this.list.keys()]) this.remove(id); },
    update() {
      const world = getWorld(); if (!world) return;
      for (const L of this.list.values()) {
        const pr = world.project(L.anchorFn());
        const w = L.n.offsetWidth;
        if (L.auto) {   // flip to the other side near the screen edge
          const left = pr.x + L.off[0] + w > innerWidth - 12;
          if (left !== (L.side === 'left')) { L.side = left ? 'left' : 'right'; L.n.classList.toggle('left', left); }
        }
        const x = L.side === 'left' ? pr.x - w - L.off[0] : pr.x + L.off[0] - 2;
        L.n.style.transform = `translate(${x.toFixed(1)}px, ${(pr.y + L.off[1]).toFixed(1)}px)`;
        L.n.style.visibility = pr.ok ? '' : 'hidden';
      }
    },
  };

  /* ---- creature card / hover ---- */
  let cardTool = null, cardAnchor = null, hoverKey = null, listHover = null;
  const quoteOf = (key) => {
    const T = TOOLS[key];
    if (T.quote) return `“${T.quote}”`;
    if (T.limit) return `Known limits — “${T.limit}”`;
    if (T.roles) return T.roles.join(' · ');
    if (T.install) return T.install;
    const r = RELEASES.find(x => x.tool === key);
    return r ? r.text : '';
  };
  function openCard(key, anchorFn) {
    const T = TOOLS[key]; if (!T) return;
    cardTool = key; cardAnchor = anchorFn || anchorFor(key);
    el.cardName.textContent = T.name; el.cardKo.textContent = toolSub(key);
    el.cardV.textContent = [T.ver ? 'v' + T.ver : '', T.lang].filter(Boolean).join(' · ') || 'Public repository';
    el.cardR.textContent = T.role;
    const q = quoteOf(key); el.cardQ.textContent = q; el.cardQ.hidden = !q;
    el.cardA.href = repoUrl(T.repo);
    el.cardA.setAttribute('aria-label', UI.repoLink(toolLabel(key)));
    showOverlay(el.card);
    $$('.tool').forEach(b => b.classList.toggle('on', b.dataset.tool === key));
    highlight(key, 1);
    positionCard();
  }
  function closeCard() {
    if (!cardTool && el.card.hidden) return;
    hideOverlay(el.card); cardTool = null; cardAnchor = null;
    $$('.tool').forEach(b => b.classList.remove('on')); highlight(null, 0); el.leader.classList.remove('show');
  }
  el.cardX.addEventListener('click', closeCard);
  function positionCard() {
    if (!cardTool) return;
    const world = getWorld();
    const cw = el.card.offsetWidth, ch = el.card.offsetHeight;
    let x, y;
    if (isNarrow()) { x = 16; y = innerHeight - ch - 92; }
    else if (cardAnchor && world) {
      const pr = world.project(cardAnchor());
      x = clamp(pr.x + 36, 16, innerWidth - cw - 16); y = clamp(pr.y - ch / 2, 80, innerHeight - ch - 110);
      if (pr.x + 36 + cw > innerWidth - 16) x = clamp(pr.x - cw - 36, 16, innerWidth - cw - 16);
    } else { x = innerWidth - cw - 120; y = innerHeight / 2 - ch / 2; }
    el.card.style.transform = `translate(${x}px, ${y}px)`;
  }
  function highlight(key, v) {
    const W = getWorld(); if (!W) return;
    // either Aquarium edition is the whole harness: every tool lights with it
    if (key === 'aquarium-for-claude') key = 'aquarium';
    W.gaori.hi = key === 'gaori' || key === 'aquarium' ? v : 0;
    W.mulgae.hi = key === 'mulgae' || key === 'aquarium' ? v : 0;
    W.pod.highlight = key === 'dolgorae' || key === 'aquarium' ? v : 0;
    W.corals.forEach(c => { c.mat.uniforms.uHi.value = key === 'sanho' || key === 'aquarium' ? v * 0.8 : 0; c.pm.uniforms.uHi.value = key === 'sanho' ? v : 0; });
    W.atn.mat.uniforms.uHi.value = key === 'atn' || key === 'aquarium' ? v * 1.2 : 0;
    W.gates.forEach(g => { if (key === 'podway' || key === 'aquarium') g.flash = Math.max(g.flash, v); });
  }
  function anchorFor(key) {
    const W = getWorld(); if (!W) return null;
    const p = W.pickables.find(q => q.key === key);
    return p ? p.pos : (key === 'aquarium' || key === 'aquarium-for-claude' ? () => W.gaori.pos : null);
  }
  $$('.tool').forEach(b => {
    b.addEventListener('click', () => { const k = b.dataset.tool; if (cardTool === k) { closeCard(); return; } openCard(k, anchorFor(k)); });
    b.addEventListener('mouseenter', () => hoverList(b.dataset.tool, b));
    b.addEventListener('focus', () => hoverList(b.dataset.tool, b));
    b.addEventListener('mouseleave', () => hoverList(null));
    b.addEventListener('blur', () => hoverList(null));
  });
  function hoverList(key, btn) { listHover = key ? { key, btn, kind: 'tool' } : null; if (!cardTool) highlight(key, key ? 0.8 : 0); }

  /* ---- products above the surface: hover a row → its light brightens; one label at a time ---- */
  const prodAnchor = (id) => { const W = getWorld(); if (!W) return null; return id === 'sudal' ? () => W.sudal.glow.position : id === 'doksuri' ? () => W.doksuri.pos : () => W.ember.pos; };
  const prodLit = (id, v) => { const W = getWorld(); if (!W) return; W.sudal.hi = id === 'sudal' ? v : 0; W.doksuri.hi = id === 'doksuri' ? v : 0; W.ember.hi = id === 'ember-quest' ? v : 0; };
  let prodHover = null, prodCycle = 0, prodIdx = -1, prodOn = false;
  $$('#prodList [data-prod]').forEach(li => {
    li.addEventListener('mouseenter', () => { prodHover = { key: li.dataset.prod, btn: li, kind: 'prod' }; prodLit(li.dataset.prod, 0.9); showProd(PRODUCTS.findIndex(p => p.id === li.dataset.prod)); });
    li.addEventListener('mouseleave', () => { prodHover = null; prodLit(null, 0); });
  });
  function showProd(i) {
    const P = PRODUCTS[i], a = P && prodAnchor(P.id); if (!a) return;
    prodIdx = i;
    const L = Labels.add('prod', '', a, 'prod', [16, -9], 'right', `<b>${P.name}</b>${P.status}`);
    L.auto = true;
  }
  function updateProducts(dt) {
    // one quiet label while the products are on screen; none once the final ask scrolls in
    const on = !!getWorld() && state.mode !== 'journey' && state.layerF > 3.86 && state.kpP < 0.5;
    if (on && !prodOn) { prodOn = true; prodCycle = 0; showProd(0); }
    if (!on && prodOn) { prodOn = false; Labels.remove('prod'); prodLit(null, 0); }
    if (!on || prodHover) return;
    prodCycle += dt;
    if (prodCycle > 3.8) { prodCycle = 0; showProd((prodIdx + 1) % PRODUCTS.length); }
  }

  /* ---- leader line from the hovered list row to its light ---- */
  function updateLeader() {
    const world = getWorld();
    const src = prodHover || listHover || (cardTool && !isNarrow() ? { key: cardTool, btn: $(`.tool[data-tool="${cardTool}"]`), kind: 'tool' } : null);
    if (!src || !src.btn || !world || isNarrow() || state.mode === 'journey') { el.leader.classList.remove('show'); return; }
    const f = src.kind === 'prod' ? prodAnchor(src.key) : anchorFor(src.key);
    if (!f) { el.leader.classList.remove('show'); return; }
    const pr = world.project(f()); const r = src.btn.getBoundingClientRect();
    if (!pr.ok || r.bottom < 0 || r.top > innerHeight) { el.leader.classList.remove('show'); return; }
    const l = el.leaderLine;
    const x1 = src.kind === 'prod' ? r.right - 90 : r.right + 6;
    l.setAttribute('x1', x1); l.setAttribute('y1', r.top + r.height / 2); l.setAttribute('x2', pr.x); l.setAttribute('y2', pr.y);
    el.leader.classList.toggle('warm', src.kind === 'prod');
    el.leader.classList.add('show');
  }

  /* ---- picking in the tool layer ---- */
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, in: false, t: -1e9 };
  addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.nx = e.clientX / innerWidth * 2 - 1; pointer.ny = e.clientY / innerHeight * 2 - 1; pointer.in = true; pointer.t = performance.now(); }, { passive: true });
  addEventListener('pointerdown', e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.in = true; pointer.t = performance.now(); }, { passive: true });
  function pickAt(x, y) {
    const world = getWorld();
    if (!world || state.mode === 'journey' || world.rig.mode !== 'scroll' || state.layerF < 1.6 || state.layerF > 2.6) return null;
    let best = null, bd = 1e9;
    for (const p of world.pickables) {
      const pr = world.project(p.pos());
      if (!pr.ok) continue;
      const d = Math.hypot(pr.x - x, pr.y - y);
      const lim = Math.max(34, p.r / world.worldPerPixel(world.camera.position.distanceTo(p.pos())) * 0.8);
      if (d < lim && d < bd) { bd = d; best = p; }
    }
    return best;
  }
  el.gl.addEventListener('click', e => { const p = pickAt(e.clientX, e.clientY); if (p) openCard(p.key, p.pos); else if (cardTool) closeCard(); });
  document.addEventListener('pointerdown', e => { if (cardTool && !el.card.contains(e.target) && !e.target.closest('.tool') && e.target !== el.gl) closeCard(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && cardTool) closeCard(); });

  // per frame, after world.update
  function update(dt, narrow) {
    Labels.update();
    if (cardTool) positionCard();
    updateLeader();
    updateProducts(dt);
    const world = getWorld();
    if (world && !narrow && pointer.in && state.mode !== 'journey') {
      const p = pickAt(pointer.x, pointer.y);
      const k = p ? p.key : null;
      if (k !== hoverKey) { hoverKey = k; document.body.classList.toggle('pick', !!k); if (!cardTool && !listHover) highlight(k, k ? 0.7 : 0); }
      if (k) { el.hoverTag.textContent = toolLabel(k); el.hoverTag.style.transform = `translate(${pointer.x + 16}px, ${pointer.y + 14}px)`; el.hoverTag.classList.add('show'); }
      else el.hoverTag.classList.remove('show');
    } else el.hoverTag.classList.remove('show');
  }

  return { Labels, openCard, closeCard, anchorFor, highlight, update, pointer, get cardTool() { return cardTool; } };
}
