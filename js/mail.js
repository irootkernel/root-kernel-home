// mail.js — mail drafts for the delivery and handoff cards, the contact page and the service pages.
// A's buildMail (priority trimming, compact mailto) merged with B's handoff mail.
// Rules: the encoded mailto stays ≤ 1800 characters, line breaks are CRLF, and the full text
// (for the copy fallback) keeps every line. Nothing is sent: the visitor's mail app does that — and the
// mail app is the only place anyone types (founder, 2026-09-28): the site itself only offers choices.

import { MAIL, SVC, MAIL_COPY } from './text.js?v=0cd00b25fdf6';

export const MAILTO_LIMIT = 1800;
// the disclosure over the demo's counts (ship card and mail): these numbers come from a browser simulation
export const SIM_LABEL = '[Demo record · browser simulation]';

// Lone surrogates would make encodeURIComponent throw; code-point slicing never creates them.
const wellFormed = (s) => {
  s = String(s ?? '');
  if (typeof s.toWellFormed === 'function') return s.toWellFormed();
  return s.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�');
};
const cps = (s) => Array.from(s);
const clip = (s, n) => { const a = cps(s); return a.length > n ? a.slice(0, n).join('') + '…' : s; };
const oneLine = (s) => s.replace(/\s+/g, ' ').trim();

// mailto:cs@rootkernel.xyz?subject=…&body=… with CRLF (%0D%0A) between lines.
export function mailtoURL(subject, lines) {
  const body = lines.flatMap((t) => String(t).split(/\r\n|\r|\n/)).map(encodeURIComponent).join('%0D%0A');
  return `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

// The demo record, in the order the delivery card shows it. Short English labels: the card's five cells leave
// ~59 px for a 12 px nowrap label, so "Human approval" / "Review applied" would be cut off. No elapsed time, ever.
export function summaryPairs(counts = {}) {
  return [
    ['Spec', '1'],
    ['Approval', '1'],
    ['Test', String(counts.tests ?? '—')],
    ['Rework', String(counts.rework ?? 0)],
    ['Review', String(counts.review ?? 0)],
  ];
}
export const summaryText = (counts) => summaryPairs(counts).map(([k, v]) => `${k} ${v}`).join(' · ');

// items: [{t, p, q?, s?}] — p is the priority (lower goes first; ≥ 95 never drops).
// s marks a line that is shortened once before it is dropped; q marks the visitor's request,
// which is shortened (never dropped) as a last resort.
function fit(subject, items) {
  // lvl: 2 full · 1 shortened · 0 left out (the full-text copy still has everything).
  const st = items.map((x) => ({ ...x, lvl: 2 }));
  const shortOf = (x) => { const a = cps(x.t); return a.slice(0, Math.max(18, Math.floor(a.length * 0.55))).join('') + '…'; };
  const lines = () => {
    const on = st.filter((x) => x.lvl > 0);
    // no leading, trailing or doubled blank lines
    const out = on.filter((x, i, a) => x.t !== '' || (i > 0 && a[i - 1].t !== '' && i < a.length - 1));
    return out.map((x) => (x.lvl === 1 ? shortOf(x) : x.t));
  };
  const len = () => mailtoURL(subject, lines()).length;

  // 1) degrade: the least important line first
  let guard = 600;
  while (len() > MAILTO_LIMIT && guard-- > 0) {
    const cand = st.filter((x) => x.p < 95 && x.lvl > 0).sort((a, b) => a.p - b.p)[0];
    if (cand) { cand.lvl = cand.s && cand.lvl === 2 ? 1 : 0; continue; }
    const qi = st.find((x) => x.q);
    const n = qi ? cps(qi.t).length : 0;
    if (qi && n > 24) {
      qi.t = cps(qi.t.replace(/…$/, '')).slice(0, Math.max(20, Math.floor(n * 0.8))).join('') + '…';
    } else {
      const g = st.find((x) => x.greet && x.lvl > 0);
      if (g) g.lvl = 0; else break;
    }
  }
  // 2) restore: bring back the most important lines that still fit
  for (const x of st.filter((y) => y.p < 95).sort((a, b) => b.p - a.p)) {
    while (x.lvl < 2) {
      const prev = x.lvl;
      x.lvl = x.s ? x.lvl + 1 : 2;
      if (len() > MAILTO_LIMIT) { x.lvl = prev; break; }
    }
  }
  const url = mailtoURL(subject, lines());
  return { url, trimmed: st.some((x) => x.lvl < 2 || (x.q && x.t !== x.orig)) };
}

// The full-text copy ends with where to send it.
const footer = () => ['--', `${MAIL_COPY.sendTo}: ${MAIL}`];
const fullText = (subject, body) => `${MAIL_COPY.to}: ${MAIL}\n${MAIL_COPY.subject}: ${subject}\n\n${body.join('\n')}\n\n${footer().join('\n')}`;

// Delivery (the ship card's "상담 신청하기"): the same short consultation request as the contact page, with the
// demo's area already chosen. The consultation is about the visitor's own project, not the demo draft (founder,
// 2026-09-29), so no spec, revisions or demo record go into the mail.
export function buildBriefMail(ctx = {}) {
  return { ...buildContactMail({ area: ctx.svc, tag: '상담', greet: '안녕하세요. 루트커널 홈페이지에서 시연을 보고 상담을 신청합니다.' }), trimmed: false };
}

// Out of scope: the visitor's words go to the founder unchanged (B handoffFinish + A runHandoff).
export function buildHandoffMail(text, { notes = [] } = {}) {
  const q = wellFormed(text || '');
  const add = notes.map(wellFormed);
  const subject = `[루트커널 문의] ${clip(oneLine(q), 40)}`;
  const body = ['안녕하세요. 루트커널 홈페이지에서 남기는 문의입니다.', '', '[문의 내용]', q, ''];
  for (const n of add) body.push(`덧붙임: ${n}`, '');
  body.push('[연락처]', '', '[희망 일정]');
  const L = [
    { t: '안녕하세요. 루트커널 홈페이지에서 남기는 문의입니다.', p: 99, greet: true },
    { t: '', p: 99 },
    { t: q, p: 98, q: true, orig: q },
    { t: '', p: 90 },
    ...add.map((n) => ({ t: `덧붙임: ${n}`, p: 80, s: true })),
    { t: '', p: 99 }, { t: '연락처:', p: 99 }, { t: '희망 일정:', p: 99 },
  ];
  const { url, trimmed } = fit(subject, L);
  return { subject, url, full: fullText(subject, body), trimmed, letter: body.join('\n') };
}

// Contact (the /contact/ chips) and a service page's "상담 메일": the visitor's choices go into the draft,
// then empty sections to write in — in the mail app. area: an SVC key; kind: UI.other (or another label); when: 희망 시기.
// The labels are MAIL_COPY's, so an English page drafts in English (DECISIONS 4-21).
export function buildContactMail({ area = null, kind = null, when = null, tag = MAIL_COPY.tag, greet = MAIL_COPY.greet } = {}) {
  const k = SVC[area] ? `${SVC[area].area} · ${SVC[area].name}` : wellFormed(kind || '');
  const w = wellFormed(when || '');
  const subject = `${MAIL_COPY.subjectOf(tag)}${k ? ` ${k}` : ''}`;
  const body = [greet, '', `${MAIL_COPY.kind}: ${k}`, `${MAIL_COPY.when}: ${w}`, '', MAIL_COPY.want, '', '', MAIL_COPY.contact, ''];
  // short by construction (two choices, fixed lines): well under MAILTO_LIMIT, no trimming needed
  const url = mailtoURL(subject, body);
  return { subject, url, full: fullText(subject, body) };
}

// Clipboard, with a fallback that selects a plain (non-editable) node: no text field ever appears on the page.
export async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    try {
      const pre = document.createElement('pre');
      pre.textContent = t;
      pre.setAttribute('aria-hidden', 'true');
      pre.style.cssText = 'position:fixed;left:-9999px;top:0;white-space:pre;user-select:text;-webkit-user-select:text';
      document.body.appendChild(pre);
      const sel = getSelection();
      const range = document.createRange();
      range.selectNodeContents(pre);
      sel.removeAllRanges();
      sel.addRange(range);
      const ok = document.execCommand('copy');
      sel.removeAllRanges();
      pre.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
