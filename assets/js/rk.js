/* Root Kernel — 비행 성화 engine (R13)
 *
 * One engine, one machine.  Launcher pads ride the page's H2s — one shot each,
 * one ember in the cup, a sling-loop inviting the pull.  A launched ember flies
 * the visible body, bouncing off the viewport edges and the obstacle plinths
 * ([data-ob]), lighting every brazier it passes and painting every text block it
 * touches in its own orb colour — a later ember's colour overwrites an earlier
 * one's.  The page starts bright; reload is the only reset.
 *
 * Determinism: the sim runs on the 12Hz monotonic accumulator in fixed-point
 * cell units; every outside influence enters through RK.input, so the same input
 * sequence always produces the same snapshot.  `?rk-tick=0` settles every input
 * synchronously; prefers-reduced-motion goes passive — no pads, no paint,
 * braziers lit — the same end state as a no-JS page, with the Podway hero and
 * the contact form still readable.
 *
 * Contains no sentences: every string comes from the #rk-cfg JSON block, which the
 * generator fills from _workspace/r5/copy/ui-strings.json.
 */
(function () {
  'use strict';

  /* Mobile nav toggle: the seven-item nav does not fit a phone header, so below
     768px a button named after the current page sits next to the language flag and
     opens the full list.  The button is injected here so a no-JS page keeps the
     always-visible nav (every hiding rule in site.css is gated on html.js), and it
     runs before the #rk-cfg early return so the 404 (machine:"static") gets it too. */
  (function () {
    var top = document.querySelector('.top');
    if (!top) { return; }
    var nav = top.querySelector('.nav');
    var lang = top.querySelector('.lang');
    if (!nav || !lang) { return; }
    var cur = nav.querySelector('a[aria-current]');
    if (!nav.id) { nav.id = 'primary-nav'; }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'navtoggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', nav.id);
    var lbl = document.createElement('span');
    lbl.className = 'nt-lbl';
    lbl.textContent = cur ? cur.textContent : 'Menu';
    var ind = document.createElement('span');
    ind.className = 'nt-ind';
    ind.setAttribute('aria-hidden', 'true');
    ind.textContent = '+';
    btn.appendChild(lbl);
    btn.appendChild(ind);
    top.insertBefore(btn, lang);
    function setOpen(open) {
      top.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      ind.textContent = open ? '-' : '+';
    }
    btn.addEventListener('click', function () {
      setOpen(!top.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (top.classList.contains('open') && !top.contains(e.target)) { setOpen(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && top.classList.contains('open')) { setOpen(false); }
    });
    var mq = matchMedia('(min-width:768px)');
    var onCut = function () { if (mq.matches) { setOpen(false); } };
    if (mq.addEventListener) { mq.addEventListener('change', onCut); }
    else if (mq.addListener) { mq.addListener(onCut); }
  })();

  var root = document.documentElement;
  var cfgEl = document.getElementById('rk-cfg');
  if (!cfgEl) { return; }
  var T = JSON.parse(cfgEl.textContent);
  root.className += (root.className ? ' ' : '') + 'js';

  var q = new URLSearchParams(location.search);
  /* PASSIVE (reduced motion): no toy at all — braziers stay lit, no pads, no fog.
     rk-tick=0 stays ACTIVE but settles every input synchronously, which is what the
     determinism harness drives. */
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PASSIVE = RM;
  var TICK_MS = (q.get('rk-tick') === '0' || RM) ? 0 : 1000 / 12;

  /* A board with no machine (the 404, spec §8.2: no HUD, no engine) still answers the
     hook contract (BRIEF §12) with the empty state: zero ports, no tick, one constant
     snapshot.  Nothing below this line runs, so the page draws nothing. */
  if (T.machine === 'static') {
    window.RK = {
      version: 'r7', TICK_MS: TICK_MS, tick: 0, reduced: (TICK_MS === 0),
      stepTo: function () {}, reset: function () {}, input: function () {},
      snapshot: function () { return JSON.stringify({ lit: [], events: [] }); },
      states: function () { return {}; }
    };
    return;
  }

  /* --- dom ---------------------------------------------------------------- */
  var stage = document.getElementById('main');
  var footEl = document.querySelector('.foot');
  var form = document.getElementById('rk-form');
  var idxDots = [].slice.call(document.querySelectorAll('.index i'));
  var hero = stage.querySelector('.hero-demo');
  var heroReplay = document.getElementById('rk-hero-replay');
  var heroState = hero ? hero.querySelector('.hstate') : null;
  var heroThread = hero ? hero.querySelector('.hthread') : null;
  var heroInspect = hero ? hero.querySelector('.hinspect') : null;
  var heroMessages = hero ? [].slice.call(hero.querySelectorAll('.hmsg')) : [];
  var heroNodes = hero ? [].slice.call(hero.querySelectorAll('.hnode')) : [];
  var heroEdges = hero ? [].slice.call(hero.querySelectorAll('.hedge')) : [];
  var heroRework = hero ? hero.querySelector('.hrework') : null;
  var heroPreview = hero ? hero.querySelector('.hpreview') : null;
  var heroAttempt = hero ? hero.querySelector('.hattempt') : null;

  /* --- text ---------------------------------------------------------------
     The `__rkt` cache keeps per-tick readout rewrites free of DOM churn. */
  function setText(el, s) {
    if (!el || el.__rkt === s) { return; }
    el.__rkt = s;
    el.textContent = s;
  }
  function fmt(tpl, vars) {
    var out = tpl, k;
    for (k in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, k)) {
        out = out.split('{' + k + '}').join(String(vars[k]));
      }
    }
    return out;
  }
  /* --- constants (cells; the sim's fixed point is 1/64 cell) --------------- */
  var FP = 64;            /* fixed-point scale                                   */
  var IMP = 22;           /* launch impulse: v[FP/tick] = pull[cells] * IMP      */
  var MAXPULL = 24;       /* longest sling pull, cells                           */
  var MINPULL = 3;        /* shortest pull that still launches                   */
  /* constant speed: no friction, perfectly elastic walls and obstacles — a
     launched ember patrols at its launch speed until reload (R13 §3) */
  var EH = 2;             /* ember half-size, cells                              */
  var IGNR = 24;          /* ignition radius around a brazier centre (doubled)   */
  var PANTR = 12;         /* paint radius around a flying ember (doubled)        */
  var MAXEMB = 10;        /* most embers on the page; past it pads go inactive   */
  var SETTLE = 600;       /* ticks a synchronous settle advances (deterministic) */
  var ORBS = ['c0', 'c1', 'c2', 'c3'];       /* blue, green, red, white          */
  var ORBK = ['b', 'g', 'r', 'w'];

  /* --- state ---------------------------------------------------------------- */
  var RK = window.RK = {
    version: 'r7', TICK_MS: TICK_MS, tick: 0, reduced: (TICK_MS === 0)
  };
  var pads = [];          /* [{el, pld, x, y (cup centre, cells), id, ci, shots}] */
  var embers = [];        /* [{x, y, vx, vy (FP), ci, st, el}]                    */
  var brzs = [];          /* [{el, x, y (centre), id, lit, litAt, host}]          */
  var obs = [];           /* [{x, y, w, h}] cells — plinths, then pads         */
  var obsBase = 0;        /* how many of obs are [data-ob]; the rest are pads  */
  var events = ['ignite'];
  var PX = 3, vh = window.innerHeight, MOB = false;
  var bounds = { l: 0, t: 0, r: 0, b: 0 };               /* stage-cell playfield */
  /* text paint (R13 §4): every paintable text block's rect, and the orb index of
     the last ember that passed it (-1 = untouched).  No fog — the page starts
     bright, and passing embers colour the words themselves. */
  var paintEls = [];      /* [{el, x, y, w, h}] cells                          */
  var paints = [];        /* colour index per element, -1 unpainted            */
  var drag = null;        /* active sling drag {pad, x0, y0, aim}                  */
  var sent = 0;

  /* --- geometry ------------------------------------------------------------- */
  function pxOf() {
    return parseInt(getComputedStyle(root).getPropertyValue('--px'), 10) || 3;
  }
  function rectCells(el) {
    var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { x: (r.left - s.left) / PX, y: (r.top - s.top) / PX,
             w: r.width / PX, h: r.height / PX };
  }
  /* the playfield is the visible slice of <main>: never the header, never the
     footer.  Recomputed on scroll and resize, and read by the sim — the ember
     bounces off its edges like walls. */
  function measureBounds() {
    var sr = stage.getBoundingClientRect();
    var vpB = vh;
    if (footEl) {
      var fr = footEl.getBoundingClientRect();
      if (fr.top < vpB) { vpB = Math.max(0, fr.top); }
    }
    var w = stage.clientWidth / PX;
    bounds = {
      l: 0,
      t: Math.max(0, -sr.top / PX),
      r: w,
      b: Math.max(0, Math.min(stage.scrollHeight / PX, (vpB - sr.top) / PX))
    };
    for (var i = 0; i < embers.length; i++) { clampIn(embers[i]); }
  }
  function clampIn(e) {
    if (e.x < (bounds.l + EH) * FP) { e.x = (bounds.l + EH) * FP; }
    if (e.x > (bounds.r - EH) * FP) { e.x = (bounds.r - EH) * FP; }
    if (e.y < (bounds.t + EH) * FP) { e.y = (bounds.t + EH) * FP; }
    if (e.y > (bounds.b - EH) * FP) { e.y = (bounds.b - EH) * FP; }
  }

  /* --- text paint (R13 §4) ------------------------------------------------------
     The engine splits the paintable text of <main> into one span per letter, and
     a flying ember colours the letters inside its paint radius — the trail reads
     character by character, and a later ember's colour overwrites an earlier
     one's.  textContent never changes: the split is spans, nothing else. */
  var PAINT_SEL = 'p, h1, h2, h3, h4, li, td, th';
  function splitPaints() {
    if (PASSIVE) { return; }
    var walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) { return NodeFilter.FILTER_REJECT; }
        var p = node.parentElement;
        if (!p) { return NodeFilter.FILTER_REJECT; }
        /* links keep their teal, hidden or screen-reader-only text stays out */
        if (p.closest('a,[aria-hidden="true"],.sr,.hero-demo')) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!p.closest(PAINT_SEL)) { return NodeFilter.FILTER_REJECT; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) { nodes.push(walker.currentNode); }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      Array.from(node.nodeValue).forEach(function (ch) {   /* code points */
        var s = document.createElement('span');
        s.className = 'pch';
        s.textContent = ch;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  function measurePaints() {
    var s = stage.getBoundingClientRect();
    paintEls = [].slice.call(stage.querySelectorAll('.pch')).map(function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, x: (r.left - s.left + r.width / 2) / PX,
               y: (r.top - s.top + r.height / 2) / PX };
    });
    /* the DOM order is stable, so colour assignments survive a resize by index */
    while (paints.length < paintEls.length) { paints.push(-1); }
  }
  function paintApply(i, ci) {
    var el = paintEls[i].el;
    if (paints[i] >= 0) { el.classList.remove(ORBS[paints[i]]); }
    else { el.classList.add('pc'); }
    el.classList.add(ORBS[ci]);
    paints[i] = ci;
  }
  function paintTouch(e) {
    var ex = e.x / FP, ey = e.y / FP, i, r, dx, dy;
    for (i = 0; i < paintEls.length; i++) {
      if (paints[i] === e.ci) { continue; }
      r = paintEls[i];
      dx = ex - r.x;
      dy = ey - r.y;
      if (dx * dx + dy * dy <= PANTR * PANTR) { paintApply(i, e.ci); }
    }
  }

  /* --- braziers ------------------------------------------------------------- */
  function hostOf(el) {
    var h = el.closest('section,li,tr');
    return h || stage;
  }
  function brzId(b, i) {
    return (b.host && b.host.id) || (T.anchorTag + (i + 1));
  }
  function measureBrzs() {
    var els = [].slice.call(stage.querySelectorAll('.brz'));
    brzs = els.map(function (el, i) {
      var r = rectCells(el);
      return { el: el, x: r.x + r.w / 2, y: r.y + r.h / 2,
               id: '', lit: el.classList.contains('lit') ? 1 : 0, litAt: 0,
               host: hostOf(el) };
    });
    brzs.forEach(function (b, i) { b.id = brzId(b, i); });
  }
  function lightUp(b, i) {
    b.lit = 1;
    b.litAt = RK.tick;
    if (b.host && b.host.classList) { b.host.classList.add('lit'); }
    var m = /^a(\d)$/.exec(b.host && b.host.id || '');
    if (m && idxDots[+m[1] - 1]) {
      idxDots[+m[1] - 1].classList.remove('wait');     /* home index dot */
    }
    pushEv('lit:' + b.id);
  }

  /* --- events ---------------------------------------------------------------- */
  function pushEv(name) {
    events.push(name);
  }

  /* --- launcher pads ----------------------------------------------------------
     One pad per H2 of <main>, plus one on any brazier section that has no H2 at
     all (the contact form — a brazier nobody could reach otherwise).  Injected,
     never emitted, so a no-JS page shows no dead control.  Colour cycles the
     four orbs in document order; the side alternates left/right on wide cuts
     and hugs the gutter on the stacked one. */
  function injectPads() {
    if (PASSIVE) { return; }
    var anchors = [].slice.call(stage.querySelectorAll('h2'));
    [].slice.call(stage.querySelectorAll('.sec.pt')).forEach(function (sec) {
      if (!sec.querySelector('h2')) { anchors.push(sec); }
    });
    anchors.forEach(function (h2, i) {
      var ci = i % 4;
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'pad ' + ORBS[ci];
      el.setAttribute('aria-label', fmt(T.pad.aria, { color: T.orb[ORBK[ci]] }));
      el.innerHTML = '<span class="pcr" aria-hidden="true">' +
        '<span class="pst"></span><span class="pbd"></span>' +
        '<span class="pld"></span></span>';
      var host = h2.closest('section') || stage;
      var pad = { el: el, pld: null, h2: h2, host: host, x: 0, y: 0,
                  id: h2.id || host.id || (T.anchorTag + (i + 1)),
                  ci: ci, shots: 0 };
      pad.pld = el.querySelector('.pld');
      el.addEventListener('pointerdown', onPadDown);
      el.addEventListener('click', function (e) { e.preventDefault(); });
      stage.appendChild(el);
      pads.push(pad);
    });
  }
  function padsInactive() { return embers.length >= MAXEMB; }
  function layoutPads() {
    var w = stage.clientWidth / PX;
    pads.forEach(function (p, i) {
      var r = rectCells(p.h2);
      var x;
      if (MOB) {
        x = 1;                                        /* the stacked gutter */
      } else if (i % 2) {
        x = w - 18 - 4;                               /* note column side */
      } else {
        x = 24;                                       /* retired rail gutter */
      }
      var y = Math.max(0, r.y - 3);
      p.x = x + 9;
      p.y = y + 9;                                    /* cup centre, cells */
      p.el.style.left = Math.round(x * PX) + 'px';
      p.el.style.top = Math.round(y * PX) + 'px';
    });
  }

  /* --- sling drag ------------------------------------------------------------ */
  function onPadDown(e) {
    var el = e.currentTarget;
    var pad = null, i;
    for (i = 0; i < pads.length; i++) {
      if (pads[i].el === el) { pad = pads[i]; break; }
    }
    if (!pad || padsInactive() || drag) { return; }   /* one sling at a time */
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ }
    drag = { pad: pad, x0: e.clientX, y0: e.clientY, aim: null };
    var onMove = function (ev) { dragMove(ev); };
    var onUp = function (ev) {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      dragEnd(ev, true);
    };
    var onCancel = function (ev) {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      dragEnd(ev, false);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
  }
  function dragVector(e) {
    /* the pull, in whole cells, clamped to MAXPULL: drag away from the cup and
       the ember flies the other way — the sling, not the throw */
    var dx = (e.clientX - drag.x0) / PX, dy = (e.clientY - drag.y0) / PX;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > MAXPULL) { dx *= MAXPULL / len; dy *= MAXPULL / len; len = MAXPULL; }
    return { dx: dx, dy: dy, len: len };
  }
  function dragMove(e) {
    if (!drag) { return; }
    var v = dragVector(e);
    var pad = drag.pad;
    if (!drag.aim) {
      var a = document.createElement('div');
      a.className = 'aim ' + ORBS[pad.ci];
      a.setAttribute('aria-hidden', 'true');
      a.style.left = Math.round(pad.x * PX) + 'px';
      a.style.top = Math.round(pad.y * PX) + 'px';
      stage.appendChild(a);
      drag.aim = a;
    }
    drag.aim.style.width = Math.round(v.len * PX) + 'px';
    drag.aim.style.transform = 'rotate(' + Math.atan2(v.dy, v.dx) + 'rad)';
    pad.pld.style.transform =
      'translate(' + Math.round(v.dx * PX) + 'px,' + Math.round(v.dy * PX) + 'px)';
  }
  function dragEnd(e, fire) {
    if (!drag) { return; }
    var v = dragVector(e), pad = drag.pad;
    if (drag.aim) { drag.aim.parentNode.removeChild(drag.aim); }
    pad.pld.style.transform = '';
    drag = null;
    if (fire && v.len >= MINPULL) {
      RK.input('launch', { pad: pads.indexOf(pad),
                           dx: Math.round(v.dx), dy: Math.round(v.dy) });
    }
  }
  /* keyboard launch (button + Enter/Space): the canonical pull — down and away
     from the page centre, so the ember always arcs in and up. */
  function canonicalPull(pad) {
    var leftish = pad.x < stage.clientWidth / PX / 2;
    return { dx: leftish ? -8 : 8, dy: 12 };
  }

  /* --- flight sim -------------------------------------------------------------- */
  /* the round sparkling ember of the retired rail (spec §5.2), recoloured per orb:
     a 13-pixel diamond body in the orb hue, four frames of highlight pixels in
     bone that make it sparkle — class swaps only, one inline SVG per ember */
  var FEMB_BODY = [[2, 0, 1, 1], [1, 1, 3, 1], [0, 2, 5, 1], [1, 3, 3, 1],
                   [2, 4, 1, 1]];
  var FEMB_HI = [
    [2, 0, 1, 1, 3, 1, 0, 2, 4, 2, 1, 3, 3, 3, 2, 4],   /* tips of the diamond */
    [1, 0, 3, 0, 2, 2, 1, 4, 3, 4],                     /* inner corners       */
    [2, 1, 1, 2, 2, 2, 3, 2, 2, 3],                     /* centre cross        */
    [0, 0, 4, 0, 2, 2, 0, 4, 4, 4]                      /* outer corners       */
  ];
  function emberSvg() {
    var out = '<svg class="px" viewBox="0 0 5 5"><g fill="var(--oc)">', i, f, r;
    for (i = 0; i < FEMB_BODY.length; i++) {
      r = FEMB_BODY[i];
      out += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] +
             '" height="' + r[3] + '"/>';
    }
    out += '</g>';
    for (f = 0; f < 4; f++) {
      out += '<g class="fe fe' + f + '" fill="var(--bone)">';
      for (i = 0; i < FEMB_HI[f].length; i += 2) {
        out += '<rect x="' + FEMB_HI[f][i] + '" y="' + FEMB_HI[f][i + 1] +
               '" width="1" height="1"/>';
      }
      out += '</g>';
    }
    return out + '</svg>';
  }
  function launch(i, dx, dy) {
    var pad = pads[i];
    /* pads reload instantly and fire again — the only cap is the sky itself:
       MAXEMB embers on the page, and past it every pad goes inactive */
    if (!pad || padsInactive()) { return false; }
    pad.shots++;
    var el = document.createElement('div');
    el.className = 'femb f0 ' + ORBS[pad.ci];
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = emberSvg();
    stage.appendChild(el);
    /* noob: the ember spawns inside its own pad, so that one pad is transparent
       to it until it has fully escaped — after which the pad is a wall like any
       other (R13 §3: pads are obstacles too) */
    embers.push({ x: pad.x * FP, y: pad.y * FP, vx: -dx * IMP, vy: -dy * IMP,
                  ci: pad.ci, st: 'fly', el: el, noob: obsBase + i });
    pushEv('launch:' + pad.id);
    return true;
  }
  function bounce(e, lo, hi, axis) {
    /* reflect only when moving INTO the wall: a launch clamped back inside the
       playfield (a pad below the fold) keeps its velocity, not a phantom bounce.
       Perfectly elastic — the patrol never slows. */
    var p = axis === 'vx' ? 'x' : 'y';
    if (e[p] < lo) {
      e[p] = lo;
      if (e[axis] < 0) { e[axis] = -e[axis]; }
    } else if (e[p] > hi) {
      e[p] = hi;
      if (e[axis] > 0) { e[axis] = -e[axis]; }
    }
  }
  function step() {
    RK.tick++;
    var i, j, e;
    for (i = 0; i < embers.length; i++) {
      e = embers[i];
      e.x += e.vx;
      e.y += e.vy;
      /* playfield walls */
      bounce(e, (bounds.l + EH) * FP, (bounds.r - EH) * FP, 'vx');
      bounce(e, (bounds.t + EH) * FP, (bounds.b - EH) * FP, 'vy');
      /* obstacle plinths (and launcher pads): push out along the least-penetrated
         axis and reflect.  The ember's own launch pad stays transparent until the
         ember has fully escaped it. */
      for (j = 0; j < obs.length; j++) {
        var o = obs[j];
        var ex = e.x / FP, ey = e.y / FP;
        var inX = ex + EH > o.x && ex - EH < o.x + o.w;
        var inY = ey + EH > o.y && ey - EH < o.y + o.h;
        if (j === e.noob) {
          if (inX && inY) { continue; }
          e.noob = -1;                     /* escaped its pad for good */
        }
        if (!inX || !inY) { continue; }
        var pl = (ex + EH) - o.x, pr = (o.x + o.w) - (ex - EH);
        var pt = (ey + EH) - o.y, pb = (o.y + o.h) - (ey - EH);
        var m = Math.min(pl, pr, pt, pb);
        if (m === pl) { e.x = (o.x - EH) * FP; e.vx = -e.vx; }
        else if (m === pr) { e.x = (o.x + o.w + EH) * FP; e.vx = -e.vx; }
        else if (m === pt) { e.y = (o.y - EH) * FP; e.vy = -e.vy; }
        else { e.y = (o.y + o.h + EH) * FP; e.vy = -e.vy; }
      }
      /* braziers in reach light up and stay lit */
      var ex2 = e.x / FP, ey2 = e.y / FP;
      for (j = 0; j < brzs.length; j++) {
        var b = brzs[j];
        if (b.lit) { continue; }
        var ddx = ex2 - b.x, ddy = ey2 - b.y;
        if (ddx * ddx + ddy * ddy <= IGNR * IGNR) { lightUp(b, j); }
      }
      paintTouch(e);
    }
    heroStep();
  }
  function settle() {
    /* embers never park, so a synchronous settle is a fixed advance: the same
       number of ticks every time keeps the no-motion run byte-identical to the
       animated one */
    var n = 0;
    while (n++ < SETTLE) { step(); }
    render();
  }

  /* --- Podway hero ----------------------------------------------------------
     The graph is built during planning and remains fixed after approval. Runtime
     changes only the active cursor, evidence validity and attempt number. */
  var HDUR = (T.heroDemo && T.heroDemo.duration) || 360;
  var H = { st: hero ? (PASSIVE ? 'complete' : 'running') : 'none', at: 0,
            runs: hero ? 1 : 0, msgCount: -1 };
  heroMessages.forEach(function (el) {
    var text = el.querySelector('.hmsg-text');
    if (text) { text.__full = text.textContent; }
  });
  function heroStart() {
    if (!hero || PASSIVE) { return; }
    H.st = 'running';
    H.at = RK.tick;
    H.runs++;
    H.msgCount = -1;
    events.push('hero:' + H.runs);
    renderHero();
  }
  function heroElapsed() {
    if (!hero) { return 0; }
    return H.st === 'complete' ? HDUR : Math.max(0, RK.tick - H.at);
  }
  function heroStep() {
    if (H.st === 'running' && RK.tick - H.at >= HDUR) { H.st = 'complete'; }
  }
  function heroStatusAt(e) {
    if (e < 108) { return 'planning'; }
    if (e < 126) { return 'approval'; }
    if (e < 192) { return 'executing'; }
    if (e < 244) { return 'waiting'; }
    if (e >= 264 && e < 280) { return 'approval'; }
    if (e < 346) { return 'rework'; }
    if (e < HDUR) { return 'closing'; }
    return 'complete';
  }
  function nodeMoment(el, e) {
    var first = +(el.getAttribute('data-at') || 0);
    var rerun = +(el.getAttribute('data-rerun') || 0);
    return rerun && e >= rerun ? rerun : first;
  }
  function renderHero() {
    if (!hero || !T.heroDemo) { return; }
    var e = heroElapsed(), at, dur, count = 0, maxAt = -1;
    hero.classList.add('hdemo-ready');
    heroMessages.forEach(function (el) {
      at = +(el.getAttribute('data-at') || 0);
      dur = +(el.getAttribute('data-dur') || 1);
      var text = el.querySelector('.hmsg-text');
      var chars = text && Array.from(text.__full || '');
      var shown = e >= at;
      el.classList.toggle('shown', shown);
      el.classList.toggle('typing', shown && e < at + dur);
      if (!text || !shown) { if (text) { setText(text, ''); } return; }
      count++;
      var n = e >= at + dur ? chars.length :
        Math.max(1, Math.floor(chars.length * (e - at) / dur));
      setText(text, chars.slice(0, n).join(''));
    });
    if (count !== H.msgCount && heroThread) {
      H.msgCount = count;
      heroThread.scrollTop = heroThread.scrollHeight;
    }
    heroNodes.forEach(function (el) {
      var moment = nodeMoment(el, e);
      if (moment <= e && moment > maxAt) { maxAt = moment; }
    });
    heroNodes.forEach(function (el) {
      var first = +(el.getAttribute('data-at') || 0);
      var moment = nodeMoment(el, e);
      var invalidAt = +(el.getAttribute('data-invalid') || 0);
      var rerun = +(el.getAttribute('data-rerun') || 0);
      var invalid = invalidAt && e >= invalidAt && (!rerun || e < rerun);
      el.classList.toggle('on', first <= e);
      el.classList.toggle('invalid', !!invalid);
      el.classList.toggle('retry', !!rerun && e >= rerun);
      el.classList.toggle('active', !invalid && moment === maxAt && H.st !== 'complete');
      el.classList.toggle('done', !invalid && first <= e &&
        (moment < maxAt || H.st === 'complete'));
    });
    heroEdges.forEach(function (el) {
      var first = +(el.getAttribute('data-at') || 0);
      var rerun = +(el.getAttribute('data-rerun') || 0);
      var invalidAt = +(el.getAttribute('data-invalid') || 0);
      var invalid = invalidAt && e >= invalidAt && (!rerun || e < rerun);
      el.classList.toggle('on', e >= first);
      el.classList.toggle('invalid', !!invalid);
      el.classList.toggle('retry', !!rerun && e >= rerun);
    });
    if (heroRework) { heroRework.classList.toggle('on', e >= 244); }
    if (heroPreview) { heroPreview.classList.toggle('on', e >= 150); }
    if (heroAttempt) { heroAttempt.classList.toggle('on', e >= 244); }
    setText(heroState, T.heroDemo.status[heroStatusAt(e)]);
    if (heroReplay) { heroReplay.disabled = PASSIVE || H.st === 'running'; }
  }
  function wireHero() {
    if (!hero) { return; }
    heroNodes.forEach(function (el) {
      var inspect = function () { setText(heroInspect, el.getAttribute('data-help')); };
      el.addEventListener('mouseenter', inspect);
      el.addEventListener('focus', inspect);
    });
    if (heroReplay) { heroReplay.addEventListener('click', heroStart); }
  }

  /* --- render (expression only) ------------------------------------------------ */
  function render() {
    var f = TICK_MS ? (RK.tick % 4) : 0;
    var bf = TICK_MS ? (Math.floor(RK.tick / 2) % 3) : 0;
    var i, g;
    for (i = 0; i < embers.length; i++) {
      var e = embers[i];
      e.el.className = 'femb f' + f + ' ' + ORBS[e.ci];
      e.el.style.transform =
        'translate(' + (e.x / FP - EH) * PX + 'px,' + (e.y / FP - EH) * PX + 'px)';
    }
    for (i = 0; i < brzs.length; i++) {
      var b = brzs[i];
      if (!b.lit) {
        b.el.className = b.el.className.replace(/ lit.*$/, '');
        continue;
      }
      g = TICK_MS ? RK.tick - b.litAt : 8;
      var base = 'brz' + (b.el.querySelector('.bi') ? ' hasimg' : '');
      b.el.className = base + (g < 8
        ? ' lit' + (g < 2 ? '' : ' f' + ((g >> 1) - 1)) + ' ig' + (g >> 1)
        : ' lit f' + bf);
    }
    for (i = 0; i < pads.length; i++) {
      var p = pads[i];
      if (padsInactive()) {
        /* at the cap every pad goes inactive: dim, disabled, no sling tug */
        p.el.disabled = true;
        p.el.className = 'pad inact ' + ORBS[p.ci];
        continue;
      }
      p.el.disabled = false;
      /* sling attract: the cup tugs in a three-frame loop, offset per pad so a
         row of pads never tugs in step.  Reduced motion never reaches here. */
      var s = TICK_MS ? (Math.floor(RK.tick / 4) + i) % 3 : 0;
      p.el.className = 'pad ' + ORBS[p.ci] + ' s' + s;
    }
    renderHero();
  }

  /* --- input ----------------------------------------------------------------- */
  function tops() {
    var y = window.scrollY;
    return [].slice.call(stage.querySelectorAll('section')).map(function (a) {
      return Math.round(a.getBoundingClientRect().top + y - 20 * PX);
    });
  }
  function key(code) {
    var y = window.scrollY, tp = tops(), i, j;
    if (code === 'ArrowDown' || code === 'KeyS' || code === 'KeyJ') {
      for (i = 0; i < tp.length; i++) {
        if (tp[i] > y + 2) { window.scrollTo(0, tp[i]); return; }
      }
      window.scrollTo(0, root.scrollHeight);
    } else if (code === 'ArrowUp' || code === 'KeyW' || code === 'KeyK') {
      for (j = tp.length - 1; j >= 0; j--) {
        if (tp[j] < y - 2) { window.scrollTo(0, tp[j]); return; }
      }
      window.scrollTo(0, 0);
    } else if (code === 'Escape') {
      window.scrollTo(0, 0);
    }
  }

  /* --- hook contract ---------------------------------------------------------- */
  RK.input = function (name, payload) {
    if (name === 'launch' && payload && !PASSIVE) {
      if (launch(payload.pad | 0, payload.dx | 0, payload.dy | 0)) {
        if (TICK_MS === 0) { settle(); } else { render(); }
      }
      return;
    }
    if (name === 'key') { key(payload); return; }
    if (name === 'hero') { heroStart(); return; }
    if (name === 'press') {
      var el = document.getElementById(payload);      /* unknown ids are ignored */
      if (el && !el.disabled) { el.click(); }
      return;
    }
    if (name === 'scroll') { measureBounds(); return; }
  };
  RK.stepTo = function (n) { while (RK.tick < n) { step(); } render(); };
  RK.reset = function () {
    RK.tick = 0;
    window.scrollTo(0, 0);
    embers.forEach(function (e) { e.el.parentNode.removeChild(e.el); });
    embers = [];
    events = ['ignite'];
    sent = 0;
    var i;
    for (i = 0; i < pads.length; i++) { pads[i].shots = 0; }
    for (i = 0; i < brzs.length; i++) {
      if (!PASSIVE) {
        brzs[i].lit = 0;
        brzs[i].litAt = 0;
        if (brzs[i].host && brzs[i].host.classList) {
          brzs[i].host.classList.remove('lit');
        }
      }
    }
    /* PASSIVE keeps the no-JS paint: dots lit like the braziers they mirror */
    if (!PASSIVE) { idxDots.forEach(function (d) { d.classList.add('wait'); }); }
    for (i = 0; i < paintEls.length; i++) {
      if (paints[i] >= 0) {
        paintEls[i].el.classList.remove('pc', ORBS[paints[i]]);
        paints[i] = -1;
      }
    }
    if (form) { form.classList.remove('sent'); }
    H = { st: hero ? (PASSIVE ? 'complete' : 'running') : 'none', at: 0,
          runs: hero ? 1 : 0, msgCount: -1 };
    measureBounds();
    render();
  };
  RK.snapshot = function () {
    var o = { tick: RK.tick,
              lit: brzs.map(function (b) { return b.lit; }),
              pads: pads.map(function (p) { return p.shots; }),
              padState: padsInactive() ? 'inactive' : 'active',
              embers: embers.map(function (e) {
                return { x: e.x, y: e.y, vx: e.vx, vy: e.vy,
                         ci: e.ci, st: e.st, noob: e.noob };
              }),
              paint: paints.slice(), events: events.slice() };
    if (form) { o.sent = sent; }
    if (hero) {
      o.hero = { st: H.st, at: H.at, runs: H.runs, elapsed: heroElapsed(),
                 active: heroNodes.filter(function (el) {
                   return el.classList.contains('active');
                 }).map(function (el) { return el.getAttribute('data-node'); }) };
    }
    return JSON.stringify(o);
  };
  RK.states = function () {
    var o = {};
    var ina = padsInactive();
    pads.forEach(function (p) { o['pad:' + p.id] = ina ? 'inactive' : 'ready'; });
    brzs.forEach(function (b) { o[b.id] = b.lit ? 'lit' : 'wait'; });
    o.embers = embers.length ? ('flying:' + embers.length) : 'none';
    if (hero) { o.hero = H.st; }
    return o;
  };

  /* --- contact form ------------------------------------------------------------ */
  function mailto() {
    var F = T.form, get = function (id) {
      var el = document.getElementById(id);
      return el ? String(el.value || '').trim() : '';
    };
    var topic = form.querySelector('input[name="topic"]:checked');
    var ti = topic ? (parseInt(topic.value, 10) || 1) - 1 : 0;
    var subj = '[' + F.topics[ti] + '] ' + get('subject');
    var lines = [
      F.labels.name + ': ' + get('name'),
      F.labels.email + ': ' + get('email'),
      F.labels.org + ': ' + get('org'),
      '', get('message').slice(0, F.limit)
    ];
    return { body: lines.join('\n'), subject: subj };
  }
  function wireForm() {
    var st = form.querySelector('.status');
    var fb = form.querySelector('.fallback');
    var pre = fb ? fb.querySelector('code') : null;
    var link = form.querySelector('.mlink');
    var msg = document.getElementById('message');
    var cnt = form.querySelector('[data-count]');
    if (msg && cnt) {
      msg.addEventListener('input', function () {
        cnt.textContent = String(msg.value.length);
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var m = mailto();
      var url = 'mailto:' + T.form.to + '?subject=' +
        encodeURIComponent(m.subject) + '&body=' +
        encodeURIComponent(m.body).replace(/%0A/g, '%0D%0A');
      link.setAttribute('href', url);
      var left = false;
      var mark = function () { left = true; };
      addEventListener('blur', mark, { once: true });
      document.addEventListener('visibilitychange', mark, { once: true });
      link.click();
      if (!sent) {
        sent = 1;
        pushEv('send');
        form.classList.add('sent');
        render();
      }
      setTimeout(function () {
        removeEventListener('blur', mark);
        if (left) {
          setText(st, T.form.ok);
          st.className = 'status on';
          return;
        }
        setText(st, T.form.fail);
        st.className = 'status on';
        if (pre) { pre.textContent = m.subject + '\n\n' + m.body; }
        if (fb) { fb.hidden = false; }
      }, 1500);
    });
  }

  /* --- wiring ------------------------------------------------------------------ */
  var KEYS = ['ArrowDown', 'ArrowUp', 'KeyS', 'KeyW', 'KeyJ', 'KeyK', 'Escape'];
  addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) { return; }
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
              t.tagName === 'SELECT')) { return; }
    if (t && t.classList && t.classList.contains('pad') &&
        (e.code === 'Enter' || e.code === 'Space')) {
      /* the keyboard sling: a focused pad fires its canonical shot */
      e.preventDefault();
      var pad = null, i;
      for (i = 0; i < pads.length; i++) {
        if (pads[i].el === t) { pad = pads[i]; break; }
      }
      if (pad && !padsInactive()) {
        var c = canonicalPull(pad);
        RK.input('launch', { pad: i, dx: c.dx, dy: c.dy });
      }
      return;
    }
    if (KEYS.indexOf(e.code) >= 0) {
      e.preventDefault();
      RK.input('key', e.code);
    }
  });
  wireHero();
  if (form && T.form) { wireForm(); }
  addEventListener('scroll', function () {
    RK.input('scroll', window.scrollY);
  }, { passive: true });
  addEventListener('resize', function () {
    layout();
    render();
  });

  var last = 0, acc = 0;
  function frame(now) {
    if (!last) { last = now; }
    acc += now - last;
    last = now;
    if (acc > TICK_MS * 12) { acc = TICK_MS * 12; }
    var moved = false;
    while (acc >= TICK_MS) { step(); acc -= TICK_MS; moved = true; }
    if (moved) { render(); }
    requestAnimationFrame(frame);
  }

  function layout() {
    PX = pxOf();
    vh = window.innerHeight;
    MOB = window.innerWidth <= 767;
    measureBrzs();
    layoutPads();
    /* obstacles: the [data-ob] plinths, then every launcher pad — a pad is an
       object on the page like any other, so embers bounce off it (R13 §3) */
    obs = [].slice.call(stage.querySelectorAll('[data-ob]')).map(rectCells);
    obsBase = obs.length;
    pads.forEach(function (p) {
      obs.push({ x: p.x - 9, y: p.y - 9, w: 18, h: 18 });
    });
    measurePaints();
    measureBounds();
  }
  function init() {
    injectPads();
    splitPaints();
    layout();
    RK.reset();
    if (TICK_MS > 0) { requestAnimationFrame(frame); } else { settle(); }
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
