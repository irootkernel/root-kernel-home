// journey/pages.js — the route panels (/company/ · /contact/ · /build/, and /products/ once router.js gives that
// route `panel: 'products'`), loaded by router.js the first time a panel route is shown, and the service details
// that follow each strength scene (serviceDetailsHTML, used by strengths/scene.js for /services/<slug>/).
// Opaque surfaces only; the page underneath is hidden and inert.
// A service page is an AREA (content.js SVC: web-app · erp · ax); its [시연 보기] buttons name the demo
// scenarios (data-demo = web · app · agent · consult) — AI 전환(AX) offers both of its demos.
// No typing on the site (founder, 2026-09-28): /contact/ offers two short choices (Topic · Timing) and
// opens the visitor's mail app with them; the mail app is the only place anyone writes.
// Copy (COPY-STYLE.md): English eyebrows and section labels, Korean body copy in 합니다체.
import { esc } from '../core.js?v=9a563d68cad3';
import { COPY, COMPANY, FOUNDER, FOUNDER_PROFILE, TRACK, CLIENT_LABEL, MAIL, SVC, SVC_KEYS, LOGO, PRODUCTS, PRODUCTS_HEAD } from '../content.js?v=9a563d68cad3';

// Topic (문의 종류 in the mail): the three areas (area · name), then 기타; Timing (희망 시기): four plain answers
const KINDS = [...SVC_KEYS.map((k) => ({ id: k, a: SVC[k].area, n: SVC[k].name })), { id: 'etc', n: '기타' }];
const WHENS = ['가능한 한 빨리', '1–3개월', '3개월 이후', '아직 모름'];
const glyphR = `<svg viewBox="144 0 38.5 57" aria-hidden="true" focusable="false"><path d="${LOGO.R}"/></svg>`;

export function wirePanel(panel, page, { ensureJourney, close }) {
  panel.querySelector('.jr-page-x')?.addEventListener('click', close);
  for (const b of panel.querySelectorAll('[data-demo]')) {
    b.addEventListener('click', () => ensureJourney().then((J) => J.startExample(b.dataset.demo, { fromLantern: page.name === 'service' })));
  }
  // a service page's 상담 메일: a draft with its area already chosen
  const svcMail = panel.querySelector('[data-mail-area]');
  if (svcMail) import('../mail.js?v=9a563d68cad3').then((M) => { svcMail.href = M.buildContactMail({ area: svcMail.dataset.mailArea, tag: '상담' }).url; });
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
      mail = M.buildContactMail({ area: SVC[sel.kind] ? sel.kind : null, kind: sel.kind === 'etc' ? '기타' : null, when: sel.when });
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
    import('../mail.js?v=9a563d68cad3').then((mod) => {
      M = mod;
      upd();
      cp.addEventListener('click', async () => {
        const ok = await M.copyText(MAIL);
        out.textContent = ok ? `메일 주소를 복사했습니다: ${MAIL}` : `복사하지 못했습니다. ${MAIL}로 보내 주세요.`;
      });
    });
  }
}

/* ---------- panel markup (text is always on the panel's opaque surface) ---------- */
function aiLine(t) { return `<div class="jr-page-ai"><span class="jr-who">루트커널 AI</span><p>${esc(t)}</p></div>`; }
// a service area's details: what we build, scope, deliverables, then the demo(s) and 상담 신청하기
function serviceBody(k, hid, eyebrow) {
  const s = SVC[k], d = COPY.svcPage[k];
  const row = (t, v) => `<div><dt>${esc(t)}</dt><dd>${esc(v)}</dd></div>`;
  // one [시연 보기] per demo; with two demos each button names its example (SVC.ax.ex / ex2)
  const demos = s.scenarios.map((sc, i) => `<button type="button" class="jr-btn jr-demo" data-demo="${esc(sc)}"><span>시연 보기 · 약 1분</span>${s.scenarios.length > 1 ? `<small>${esc(i ? s[`ex${i + 1}`] : s.ex)}</small>` : ''}</button>`).join('');
  return `<p class="jr-page-k">${eyebrow}</p>` +
    `<h2 class="jr-page-h" id="${hid}">${esc(s.name)}</h2>` +
    `<p class="jr-page-lede">${esc(s.desc)}</p>` +
    '<h3 class="jr-page-s">What we build</h3>' +
    aiLine(d.make) +
    `<dl class="jr-dl">${row('Scope', d.scope)}${row('Deliverables', d.deliver)}${d.basis ? row('Basis', d.basis) : ''}${row('Operations', COPY.opsNote)}</dl>` +
    `<div class="jr-page-acts${s.scenarios.length > 1 ? ' jr-page-acts--two' : ''}">${demos}<a class="jr-btn ghost" data-mail-area="${esc(k)}" href="mailto:${esc(MAIL)}?subject=${encodeURIComponent(`[루트커널 상담] ${s.area} · ${s.name}`)}">상담 신청하기</a></div>` +
    '<p class="jr-note">비용과 기간은 Spec을 확정한 뒤 견적으로 드립니다. <a href="/contact/">문의 페이지 →</a></p>';
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
  const x = '<button type="button" class="jr-page-x" aria-label="닫기"><span aria-hidden="true">×</span></button>';
  const row = (t, v) => `<div><dt>${esc(t)}</dt><dd>${esc(v)}</dd></div>`;
  if (page.name === 'company') {
    return x + '<p class="jr-page-k"><b>0 m</b>· Company</p>' +
      `<h2 class="jr-page-h" id="pageH">${esc(COPY.companyHook)}</h2>` +
      aiLine(`${COPY.companyLine} ${COMPANY.principle}`) +
      `<p class="jr-founder">${esc(FOUNDER.line)}</p>` +
      '<h3 class="jr-page-s">Founder</h3>' +
      `<dl class="jr-dl">${FOUNDER_PROFILE.map((r) => row(r.k, r.v)).join('')}</dl>` +
      '<h3 class="jr-page-s">Timeline</h3>' +
      `<ol class="jr-track">${TRACK.map(([d, t]) => `<li><span class="mono">${esc(d)}</span><span>${esc(t)}</span></li>`).join('')}</ol>` +
      '<h3 class="jr-page-s">Company</h3>' +
      `<dl class="jr-dl">${row('Name', `${COMPANY.name} (${COMPANY.nameEn})`)}${row('Founded', COMPANY.founded)}${row('Address', COMPANY.address)}${row('Ongoing', CLIENT_LABEL)}<div><dt>Contact</dt><dd><a href="mailto:${esc(MAIL)}">${esc(MAIL)}</a></dd></div></dl>` +
      '<div class="jr-page-acts"><a class="jr-btn" href="/contact/" data-nav>문의하기</a><a class="jr-btn ghost" href="/open-source/" data-nav>Open source 보기</a></div>';
  }
  if (page.name === 'contact') {
    const kind = (o) => `<button type="button" class="jr-opt" data-kind="${esc(o.id)}" aria-pressed="false">${o.a ? `<span><span class="a">${esc(o.a)} ·</span> ${esc(o.n)}</span>` : `<span>${esc(o.n)}</span>`}</button>`;
    return x + '<p class="jr-page-k"><b>0 m</b>· Contact</p>' +
      `<h2 class="jr-page-h" id="pageH">${esc(COPY.contactHook)}</h2>` +
      `<p class="jr-page-lede">${esc(COPY.contactLine)}</p>` +
      aiLine('두 가지를 고르면 메일 앱에 초안이 열립니다. 메일 앱에서 보내기 전에는 아무것도 전송되지 않습니다. 보내 주시면 확인 후 답장드립니다.') +
      '<h3 class="jr-page-s" id="cKindH">Topic</h3>' +
      `<div class="jr-opts jr-opts--kind" role="group" aria-labelledby="cKindH">${KINDS.map(kind).join('')}</div>` +
      '<h3 class="jr-page-s" id="cWhenH">Timing</h3>' +
      `<div class="jr-opts jr-opts--when" role="group" aria-labelledby="cWhenH">${WHENS.map((w) => `<button type="button" class="jr-opt" data-when="${esc(w)}" aria-pressed="false">${esc(w)}</button>`).join('')}</div>` +
      `<a class="jr-send" id="pageMail" href="mailto:${esc(MAIL)}">메일 초안 열기${glyphR}</a>` +
      `<p class="jr-hint">${esc(COPY.mailHint)}</p>` +
      '<div class="jr-copyrow"><span>메일 앱이 열리지 않으면</span><button type="button" id="pageCopy">메일 주소 복사</button></div><p class="jr-out" id="pageOut" role="status"></p>' +
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
