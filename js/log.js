// log.js — the conversation log (CONTRACT §3).
// One role="log" region with a speaker gutter (B) and A's natural, variable streaming.
// Messages are never deleted: older ones fold behind an "이전 기록 N줄" toggle.
// Every delay goes through the caller's Run (core.js), so Esc / restart cancel cleanly.

import { mk, rnd, rand, REDUCED, isNarrow } from './core.js?v=9a563d68cad3';
import { SPEAKER } from './content.js?v=9a563d68cad3';

/* ---------- streaming ---------- */

// A's chunkLen: mostly 1–4 characters, sometimes a whole word; prefers word boundaries.
export function chunkLen(s, i) {
  const r = rnd();
  let n = r < 0.14 ? 1 : r < 0.44 ? 2 : r < 0.7 ? 3 : r < 0.85 ? 4 : r < 0.95 ? 6 : 9;
  const sp = s.indexOf(' ', i);
  if (sp > i && sp - i <= n + 2 && sp - i >= n - 1) n = sp - i + 1;
  n = Math.max(1, Math.min(n, s.length - i));
  const c = s.charCodeAt(i + n - 1); // never split a surrogate pair
  if (c >= 0xd800 && c <= 0xdbff && i + n < s.length) n++;
  return n;
}

// Streams `text` into `el` (any document, including the mini-site iframe).
// Reduced motion or no run: the text appears whole.
export async function stream(el, text, { run = null, pace = 1, mono = false, cursor = true, onChunk = null } = {}) {
  const doc = el.ownerDocument || document;
  const tn = doc.createTextNode('');
  el.appendChild(tn);
  let cur = null;
  if (cursor) {
    cur = doc.createElement('span');
    cur.className = 'st-cur';
    cur.setAttribute('aria-hidden', 'true');
    el.appendChild(cur);
  }
  try {
    if (REDUCED || !run) { tn.data = text; onChunk?.(tn.data); return el; }
    let i = 0;
    while (i < text.length) {
      let n = mono ? 2 + Math.floor(rnd() * 5) : chunkLen(text, i);
      n = Math.min(n, text.length - i);
      const c = text.slice(i, i + n);
      i += n;
      tn.data += c;
      onChunk?.(tn.data);
      let d = (mono ? rand(9, 24) : rand(15, 44)) * pace;
      if (!mono) {
        const last = c.trim().slice(-1);
        if (last && '.?!'.includes(last)) d += rand(160, 320) * pace;
        else if (last && ',·:—'.includes(last)) d += rand(60, 150) * pace;
        if (rnd() < 0.045) d += rand(150, 420) * pace; // an occasional hesitation
      }
      await run.wait(d);
    }
  } finally {
    cur?.remove();
  }
  return el;
}

/* ---------- the log ---------- */

const MAX_RECENT = 8; // deep variant, desktop: about eight recent entries stay in view

// The founding principle on every line: deterministic work by Tools, judgment by the LLM, decisions by people.
// Drawn by CSS from data-tag under the speaker name. The speaker gutter is aria-hidden and each message is
// announced once as "who: text", so screen readers never hear the tag; textContent and innerText stay clean.
const TAG = { you: 'Human', example: 'Human', act: 'Human', ai: 'LLM', tool: 'Tool' };

export function createLog(host, { variant = 'standalone' } = {}) {
  const deep = variant === 'deep';
  host.classList.add('st-log', `st-log--${variant}`);
  host.setAttribute('role', 'log');
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-relevant', 'additions');
  if (!host.hasAttribute('aria-label')) host.setAttribute('aria-label', '대화 기록');
  if (!deep) host.tabIndex = 0; // scrollable region: reachable by keyboard
  host.replaceChildren();

  const foldBtn = mk('button', 'st-foldbtn');
  foldBtn.type = 'button';
  foldBtn.hidden = true;
  foldBtn.setAttribute('aria-expanded', 'false');
  const older = mk('div', 'st-older');
  older.hidden = true;
  const recent = mk('div', 'st-recent');
  host.append(foldBtn, older, recent);

  let group = 0;
  let expanded = false;
  let busy = 0;
  let fitQueued = false;
  let lastLine = null;
  const subs = new Set();
  const streaming = new Set();

  const emit = (e) => { lastLine = e; for (const f of subs) { try { f(e); } catch (err) { console.error(err); } } };

  function setBusy(d) {
    busy = Math.max(0, busy + d);
    host.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function foldLabel() {
    const n = older.childElementCount;
    foldBtn.hidden = n === 0;
    foldBtn.textContent = expanded ? `이전 기록 ${n}줄 접기` : `이전 기록 ${n}줄`;
    foldBtn.setAttribute('aria-expanded', String(expanded));
  }

  function moveOldest() {
    const first = recent.firstElementChild;
    if (!first || streaming.has(first)) return false;
    older.appendChild(first);
    return true;
  }

  function fitNow() {
    fitQueued = false;
    if (!deep || expanded || isNarrow()) { foldLabel(); return; }
    while (recent.childElementCount > MAX_RECENT) if (!moveOldest()) break;
    const h = host.clientHeight;
    if (h > 0) {
      const btnH = foldBtn.hidden ? 34 : foldBtn.offsetHeight + 10;
      let guard = 60;
      while (guard-- > 0 && recent.childElementCount > 1 && recent.offsetHeight > h - btnH) if (!moveOldest()) break;
    }
    foldLabel();
  }
  function fit() {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(fitNow);
  }

  function scrollEnd(force) {
    if (deep && !expanded) return;
    const near = host.scrollHeight - host.scrollTop - host.clientHeight < 160;
    if (force || near) host.scrollTop = host.scrollHeight;
  }

  function add(kind, who, cls = '') {
    const m = mk('div', `st-msg st-msg--${kind}${cls ? ' ' + cls : ''}`);
    m.dataset.g = String(group);
    const w = mk('span', 'st-who');
    w.textContent = who;
    if (TAG[kind]) w.dataset.tag = TAG[kind];
    w.setAttribute('aria-hidden', 'true');
    const b = mk('div', 'st-body');
    const vis = mk('span', 'st-vis');
    vis.setAttribute('aria-hidden', 'true');
    b.appendChild(vis);
    m.append(w, b);
    recent.appendChild(m);
    fit();
    scrollEnd(true);
    return { m, b, vis };
  }

  // Complete messages are announced exactly once: a visually hidden copy is appended when done.
  function commit(e, who, text) {
    e.b.querySelector(':scope > .st-sr')?.remove();
    const sr = mk('span', 'st-sr');
    sr.textContent = `${who}: ${text}`;
    e.b.appendChild(sr);
  }

  function plain(kind, who, text, cls) {
    const e = add(kind, who, cls);
    e.vis.textContent = text;
    commit(e, who, text);
    emit({ kind, who, text, done: true });
    fit();
    return e.m;
  }

  foldBtn.addEventListener('click', () => {
    expanded = !expanded;
    // Showing the history must not re-announce it.
    host.setAttribute('aria-live', 'off');
    older.hidden = !expanded;
    host.classList.toggle('st-log--expanded', expanded);
    requestAnimationFrame(() => host.setAttribute('aria-live', 'polite'));
    foldLabel();
    if (expanded) host.scrollTop = 0; else fit();
  });

  let ro = null;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(() => fit()); ro.observe(host); }

  const Log = {
    el: host,
    variant,

    // The visitor's own words, verbatim.
    you(text) {
      group++;
      return plain('you', SPEAKER.me, text);
    },
    // Empty Enter or a service button: never put words in the visitor's mouth.
    example(text) {
      group++;
      return plain('example', SPEAKER.example, text);
    },
    // A visitor action, e.g. "나 ▸ 승인 · Spec r1".
    act(text) {
      group++;
      const e = add('act', SPEAKER.me);
      const a = mk('span', 'st-act');
      a.textContent = `▸ ${text}`;
      e.vis.appendChild(a);
      commit(e, SPEAKER.me, `▸ ${text}`);
      emit({ kind: 'act', who: SPEAKER.me, text: `▸ ${text}`, done: true });
      return e.m;
    },

    // 루트커널 AI. `think` = ms of visible "thinking" before the words stream.
    async ai(text, { run = null, think = 0, label = '', pace = 1 } = {}) {
      const who = SPEAKER.ai;
      const e = add('ai', who);
      streaming.add(e.m);
      setBusy(1);
      try {
        if (think > 0 && run) {
          const t = mk('span', 'st-think');
          t.appendChild(mk('i', 'st-cur'));
          if (label) { const l = mk('span', 'st-think-l'); l.textContent = label; t.appendChild(l); }
          e.vis.appendChild(t);
          emit({ kind: 'ai', who, text: label || '…', done: false });
          try { await run.wait(REDUCED ? Math.min(think, 160) : think); } finally { t.remove(); }
        }
        await stream(e.vis, text, {
          run, pace,
          onChunk: (s) => { emit({ kind: 'ai', who, text: s, done: false }); scrollEnd(); fit(); },
        });
        // Calm mode shows each sentence whole; give the reader the time streaming would have taken.
        if (REDUCED && run) await run.wait(Math.min(1700, Math.max(450, text.length * 24)));
        commit(e, who, text);
        emit({ kind: 'ai', who, text, done: true });
      } finally {
        streaming.delete(e.m);
        setBusy(-1);
        fit();
      }
      return e.m;
    },

    // Tool voices (podway · aquarium · gaori · mulgae). parts = [{t, cls?: 'good'|'bad'|'warm'|'dim'}].
    // Resolves with a handle: add(parts) grows the same line; set(parts) rewrites it; commit() re-announces it.
    async tool(id, parts, { run = null } = {}) {
      const who = SPEAKER[id] || id;
      const e = add('tool', who, `st-tool--${id}`);
      streaming.add(e.m);
      setBusy(1);
      const text = () => e.vis.textContent;
      const put = async (ps, r) => {
        for (const p of ps) {
          const s = mk('span', p.cls ? `st-${p.cls}` : '');
          e.vis.appendChild(s);
          if (r) await stream(s, p.t, { run: r, mono: true, cursor: false, onChunk: () => { emit({ kind: 'tool', who, text: text(), done: false }); fit(); } });
          else s.textContent = p.t;
        }
      };
      try {
        await put(parts, run);
        if (REDUCED && run) await run.wait(220);
        commit(e, who, text());
        emit({ kind: 'tool', who, text: text(), done: true });
      } finally {
        streaming.delete(e.m);
        setBusy(-1);
        fit();
      }
      return {
        el: e.m,
        async add(ps, o = {}) {
          await put(ps, o.run || null);
          emit({ kind: 'tool', who, text: text(), done: true });
          fit();
        },
        set(ps) {
          e.vis.replaceChildren();
          for (const p of ps) { const s = mk('span', p.cls ? `st-${p.cls}` : ''); s.textContent = p.t; e.vis.appendChild(s); }
          emit({ kind: 'tool', who, text: text(), done: true });
          fit();
        },
        commit() { commit(e, who, text()); },
      };
    },

    // A DOM block in the flow (spec summary, ship card). Spans the full column.
    card(el) {
      const m = mk('div', 'st-msg st-msg--card');
      m.dataset.g = String(group);
      m.appendChild(el);
      recent.appendChild(m);
      fit();
      scrollEnd(true);
      return m;
    },

    // Fold older content behind "이전 기록 N줄". Nothing is ever deleted.
    // Default: everything before the current group. { keep: n } keeps the last n entries.
    fold({ keep } = {}) {
      const items = [...recent.children];
      let n;
      if (Number.isFinite(keep)) n = Math.max(0, items.length - keep);
      else n = items.findIndex((m) => m.dataset.g === String(group));
      if (n < 0) n = 0;
      for (const m of items.slice(0, n)) if (!streaming.has(m)) older.appendChild(m);
      foldLabel();
      fit();
    },

    clear() {
      older.replaceChildren();
      recent.replaceChildren();
      streaming.clear();
      expanded = false;
      older.hidden = true;
      host.classList.remove('st-log--expanded');
      group = 0;
      lastLine = null;
      busy = 0;
      host.setAttribute('aria-busy', 'false');
      foldLabel();
    },

    // For tickers and mirrors: fn({kind, who, text, done}).
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    last() { return lastLine; },
    count() { return older.childElementCount + recent.childElementCount; },
    destroy() { ro?.disconnect(); subs.clear(); },
  };
  return Log;
}

// A one-line ticker that mirrors the latest log line (mobile). The button toggles the log sheet.
// Only completed lines reach the ticker's own live region, and only while the sheet is closed,
// so nothing is announced twice. The one line has no room for the speaker tag: the sheet shows it.
export function createTicker(btn, log, { onToggle } = {}) {
  btn.classList.add('st-ticker');
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span class="st-ticker-who" aria-hidden="true"></span><span class="st-ticker-t" aria-hidden="true"></span><span class="st-ticker-go" aria-hidden="true">기록</span><span class="st-sr">대화 기록 열기</span>';
  const live = mk('span', 'st-sr');
  live.setAttribute('aria-live', 'polite');
  btn.after(live);
  const who = btn.querySelector('.st-ticker-who');
  const t = btn.querySelector('.st-ticker-t');
  let open = false;
  const off = log.subscribe((e) => {
    who.textContent = e.who;
    t.textContent = e.text;
    btn.dataset.kind = e.kind;
    if (e.done && !open) live.textContent = `${e.who}: ${e.text}`;
  });
  btn.addEventListener('click', () => {
    open = !open;
    btn.setAttribute('aria-expanded', String(open));
    onToggle?.(open);
  });
  return {
    set(o) { open = !!o; btn.setAttribute('aria-expanded', String(open)); },
    destroy() { off(); live.remove(); },
  };
}
