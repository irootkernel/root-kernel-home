// journey/pages.js — the route panels (/company/ · /contact/ · /build/, and /products/ once router.js gives that
// route `panel: 'products'`), loaded by router.js the first time a panel route is shown, and the service details
// that follow each strength scene (serviceDetailsHTML, used by strengths/scene.js for /services/<slug>/).
// Opaque surfaces only; the page underneath is hidden and inert.
// A service page is an AREA (content.js SVC: web-app · erp · ax); its [시연 보기] button names the demo
// scenario (data-demo = web · app · consult). An area with several demos gets one button per demo.
// No typing on the site (founder, 2026-09-28): /contact/ offers two short choices (Topic · Timing) and
// opens the visitor's mail app with them; the mail app is the only place anyone writes.
// Copy (COPY-STYLE.md): English eyebrows and section labels, Korean body copy in 합니다체. English pages (DECISIONS
// 4-21) take every string from content.en.js through text.js and show no demo: no [시연 보기], no /build/ panel.
import { esc } from '../core.js?v=57f526fdc266';
import { COPY, COMPANY, FOUNDER, FOUNDER_PROFILE, TRACK, CLIENT_LABEL, MAIL, SVC, SVC_KEYS, LOGO, PRODUCTS, PRODUCTS_HEAD, UI, MAIL_COPY, DEMOS } from '../text.js?v=57f526fdc266';
import { LANG, href } from '../lang.js?v=57f526fdc266';

// Topic (문의 종류 in the mail): the three areas (area · name), then 기타; Timing (희망 시기): four plain answers
const KINDS = [...SVC_KEYS.map((k) => ({ id: k, a: SVC[k].area, n: SVC[k].name })), { id: 'etc', n: UI.other }];
const WHENS = UI.whens;
const glyphR = `<svg viewBox="144 0 38.5 57" aria-hidden="true" focusable="false"><path d="${LOGO.R}"/></svg>`;

export function wirePanel(panel, page, { ensureJourney, close }) {
  panel.querySelector('.jr-page-x')?.addEventListener('click', close);
  for (const b of panel.querySelectorAll('[data-demo]')) {
    b.addEventListener('click', () => ensureJourney().then((J) => J?.startExample(b.dataset.demo, { fromLantern: page.name === 'service' })));
  }
  // a service page's 상담 메일: a draft with its area already chosen
  const svcMail = panel.querySelector('[data-mail-area]');
  if (svcMail) import('../mail.js?v=57f526fdc266').then((M) => { svcMail.href = M.buildContactMail({ area: svcMail.dataset.mailArea, tag: MAIL_COPY.consultTag }).url; });
  if (page.name === 'contact') {
    // "다른 문의가 있으신가요?" arrives with 문의 종류 = 기타 (history.state from main.js)
    const pre = history.state?.kind;
    const sel = { kind: KINDS.some((k) => k.id === pre) ? pre : null, when: null };
    const a = panel.querySelector('#pageMail'), cp = panel.querySelector('#pageCopy'), out = panel.querySelector('#pageOut');
    let mail = null, M = null;
    const upd = () => {
      for (const b of panel.querySelectorAll('[data-kind]')) b.setAttribute('aria-pressed', String(b.dataset.kind === sel.kind));
      for (const b of panel.querySelectorAll('[data-when]')) b.setAttribute('aria-pressed', String(b.dataset.when === sel.when));
      if (!M) return;
      mail = M.buildContactMail({ area: SVC[sel.kind] ? sel.kind : null, kind: sel.kind === 'etc' ? UI.other : null, when: sel.when });
      a.href = mail.url;
      a.dataset.len = String(mail.url.length);
    };
    // tap to choose, tap again to let go (one answer per question)
    panel.addEventListener('click', (e) => {
      const k = e.target.closest('[data-kind]'), w = e.target.closest('[data-when]');
      if (k) { sel.kind = sel.kind === k.dataset.kind ? null : k.dataset.kind; upd(); }
      if (w) { sel.when = sel.when === w.dataset.when ? null : w.dataset.when; upd(); }
    });
    upd();
    import('../mail.js?v=57f526fdc266').then((mod) => {
      M = mod;
      upd();
      cp.addEventListener('click', async () => {
        const ok = await M.copyText(MAIL);
        out.textContent = ok ? UI.copied(MAIL) : UI.copyFailed(MAIL);
      });
    });
  }
}

/* ---------- panel markup (text is always on the panel's opaque surface) ---------- */
function aiLine(t) { return `<div class="jr-page-ai"><span class="jr-who">${esc(UI.ai)}</span><p>${esc(t)}</p></div>`; }
// a name in this page's language, then the other one (marked as Korean on an English page)
const named = (o) => (LANG === 'en' ? `${esc(o.name)} (<span lang="ko">${esc(o.nameKo)}</span>)` : `${esc(o.name)} (${esc(o.nameEn)})`);
// a service area's details: what we build, scope, deliverables, then the demo(s) and 상담 신청하기
function serviceBody(k, hid, eyebrow) {
  const s = SVC[k], d = COPY.svcPage[k];
  const row = (t, v) => `<div><dt>${esc(t)}</dt><dd>${esc(v)}</dd></div>`;
  // one [시연 보기] per demo, on Korean pages only; with two demos each button names its example (SVC[k].ex / ex2)
  const two = DEMOS && s.scenarios.length > 1;
  const demos = DEMOS ? s.scenarios.map((sc, i) => `<button type="button" class="jr-btn jr-demo" data-demo="${esc(sc)}"><span>시연 보기 · 약 1분</span>${two ? `<small>${esc(i ? s[`ex${i + 1}`] : s.ex)}</small>` : ''}</button>`).join('') : '';
  return `<p class="jr-page-k">${eyebrow}</p>` +
    `<h2 class="jr-page-h" id="${hid}">${esc(s.name)}</h2>` +
    `<p class="jr-page-lede">${esc(s.desc)}</p>` +
    '<h3 class="jr-page-s">What we build</h3>' +
    aiLine(d.make) +
    `<dl class="jr-dl">${row('Scope', d.scope)}${row('Deliverables', d.deliver)}${d.basis ? row('Basis', d.basis) : ''}${row('Operations', COPY.opsNote)}</dl>` +
    `<div class="jr-page-acts${two ? ' jr-page-acts--two' : ''}">${demos}<a class="jr-btn ghost" data-mail-area="${esc(k)}" href="mailto:${esc(MAIL)}?subject=${encodeURIComponent(`${MAIL_COPY.subjectOf(MAIL_COPY.consultTag)} ${s.area} · ${s.name}`)}">${esc(UI.consult)}</a></div>` +
    `<p class="jr-note">${esc(UI.quoteNote)} <a href="${href('/contact/')}">${esc(UI.contactPage)}</a></p>`;
}
// the same details below the area's strength scene (strengths/scene.js); the scene is the service page's first screen
export function serviceDetailsHTML(k) {
  return serviceBody(k, 'svcH', `<b>${esc(SVC[k].no)}</b>· Services · ${esc(SVC[k].area)}`);
}
// the first screen's answer chip, as a button (the build panel starts the demo in place)
function pickChip(k) {
  const s = SVC[k];
  return `<button type="button" class="pick-c" data-demo="${esc(k)}" aria-label="${esc(`${s.area} — ${s.scope}, 시연 시작`)}"><i class="orb" aria-hidden="true"></i><span class="pick-t">${esc(s.area)}</span><span class="pick-e"><span class="pick-x">${esc(s.scope)}</span></span><svg class="pick-go" viewBox="144 0 38.5 57" aria-hidden="true" focusable="false"><path d="${LOGO.R}"/></svg></button>`;
}
export function panelHTML(page) {
  const x = `<button type="button" class="jr-page-x" aria-label="${esc(UI.close)}"><span aria-hidden="true">×</span></button>`;
  const row = (t, v) => `<div><dt>${esc(t)}</dt><dd>${esc(v)}</dd></div>`;
  if (page.name === 'company') {
    return x + '<p class="jr-page-k"><b>0 m</b>· Company</p>' +
      `<h2 class="jr-page-h" id="pageH">${esc(COPY.companyHook)}</h2>` +
      aiLine(`${COPY.companyLine} ${COMPANY.principle}`) +
      `<p class="jr-founder">${esc(FOUNDER.line)}</p>` +
      // the company's facts come first (DECISIONS 4-20); on Korean pages the address in Korean, then the footer's
      // English line (English pages: the English line only)
      '<h3 class="jr-page-s">Company</h3>' +
      `<dl class="jr-dl"><div><dt>Name</dt><dd>${named(COMPANY)}</dd></div><div><dt>${esc(FOUNDER.title)}</dt><dd>${named(FOUNDER)}</dd></div>${row('Founded', COMPANY.founded)}<div><dt>Address</dt><dd>${COMPANY.address === COMPANY.addressEn ? esc(COMPANY.addressEn) : `${esc(COMPANY.address)}<br><span lang="en">${esc(COMPANY.addressEn)}</span>`}</dd></div>${row('Ongoing', CLIENT_LABEL)}<div><dt>Contact</dt><dd><a href="mailto:${esc(MAIL)}">${esc(MAIL)}</a></dd></div></dl>` +
      '<h3 class="jr-page-s">Founder</h3>' +
      `<dl class="jr-dl">${FOUNDER_PROFILE.map((r) => row(r.k, r.v)).join('')}</dl>` +
      '<h3 class="jr-page-s">Timeline</h3>' +
      `<ol class="jr-track">${TRACK.map(([d, t]) => `<li><span class="mono">${esc(d)}</span><span>${esc(t)}</span></li>`).join('')}</ol>` +
      `<div class="jr-page-acts"><a class="jr-btn" href="${href('/contact/')}" data-nav>${esc(UI.toContact)}</a><a class="jr-btn ghost" href="${href('/open-source/')}" data-nav>${esc(UI.toOpenSource)}</a></div>`;
  }
  if (page.name === 'contact') {
    const kind = (o) => `<button type="button" class="jr-opt" data-kind="${esc(o.id)}" aria-pressed="false">${o.a ? `<span><span class="a">${esc(o.a)} ·</span> ${esc(o.n)}</span>` : `<span>${esc(o.n)}</span>`}</button>`;
    return x + '<p class="jr-page-k"><b>0 m</b>· Contact</p>' +
      `<h2 class="jr-page-h" id="pageH">${esc(COPY.contactHook)}</h2>` +
      `<p class="jr-page-lede">${esc(COPY.contactLine)}</p>` +
      aiLine(UI.contactAi) +
      '<h3 class="jr-page-s" id="cKindH">Topic</h3>' +
      `<div class="jr-opts jr-opts--kind" role="group" aria-labelledby="cKindH">${KINDS.map(kind).join('')}</div>` +
      '<h3 class="jr-page-s" id="cWhenH">Timing</h3>' +
      `<div class="jr-opts jr-opts--when" role="group" aria-labelledby="cWhenH">${WHENS.map((w) => `<button type="button" class="jr-opt" data-when="${esc(w)}" aria-pressed="false">${esc(w)}</button>`).join('')}</div>` +
      `<a class="jr-send" id="pageMail" href="mailto:${esc(MAIL)}">${esc(UI.openDraft)}${glyphR}</a>` +
      `<p class="jr-hint">${esc(COPY.mailHint)}</p>` +
      `<div class="jr-copyrow"><span>${esc(UI.noMailApp)}</span><button type="button" id="pageCopy">${esc(UI.copyMail)}</button></div><p class="jr-out" id="pageOut" role="status"></p>` +
      `<p class="jr-founder">${esc(FOUNDER.line)}</p>`;
  }
  if (page.name === 'service') return x + serviceBody(page.svc, 'pageH', `<b>−200 m</b>· Services · ${esc(SVC[page.svc].no)} ${esc(SVC[page.svc].area)}`);
  if (page.name === 'products') {
    // the home layer's rows, with the fuller description (PRODUCTS.desc) in place of the one sentence
    const item = (P) => `<li><span class="t">${esc(P.name)}</span><span class="k">${esc(P.tag)}${P.badge ? `<em>${esc(P.badge)}</em>` : ''}</span><span class="d">${esc(P.line)}</span><span class="x">${esc(P.desc)}</span><span class="s">${esc(P.status)}</span></li>`;
    return x + '<p class="jr-page-k"><b>Above surface</b>· Products</p>' +
      `<h2 class="jr-page-h" id="pageH">${esc(PRODUCTS_HEAD.lines.join(' '))}</h2>` +
      `<p class="jr-page-lede">${esc(PRODUCTS_HEAD.lede)}</p>` +
      `<ul class="prod jr-prods">${PRODUCTS.map(item).join('')}</ul>`;
  }
  // build (no request): what the demo is, and the three ways in — the first screen's answer chips
  return x + '<p class="jr-page-k">Demo</p>' +
    `<h2 class="jr-page-h" id="pageH">${esc(COPY.ask)}</h2>` +
    aiLine(`서비스를 고르면 Spec부터 시안까지 약 1분 동안 보여 드립니다. ${COPY.demoNote}`) +
    `<div class="pick-list" role="group" aria-labelledby="pageH">${SVC_KEYS.map(pickChip).join('')}</div>` +
    `<p class="jr-note"><a href="/contact/">${esc(COPY.pickOther)} →</a></p>`;
}
