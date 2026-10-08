// router.js — two routers, both small enough for the boot path.
//  1. route(text): what does a request say? B's scoring router (deep/index.html 613–683: weights,
//     INFO, TOOL_NAMES, price, info-first) re-cut for the three service areas (founder, 2026-09-28):
//     keywords score the areas (web · erp · ax), the areas compete, and the winner runs its demo scenario
//     (content.js SVC[area].scenarios: web · app · consult). A plain-homepage request says so
//     (`homepage` → HOMEPAGE_NOTE); `closest` is the honest "가장 가까운 예시" disclosure. Nothing on the page is
//     typed any more (founder, 2026-09-28): this reads the q of /build/?q= links (a shared or reloaded demo).
//  2. pages: depth = route (SPEC-experience §6). parse(location) → page; createNav() moves the scroll
//     (the camera follows it) with the route travel time, keeps title/description in step, handles
//     popstate, retired /services/<slug>/ links, and owns the opaque route panels (/company/, /contact/,
//     /build/) and the strength scenes (/services/<slug>/, strengths/scene.js) — a service page opens its
//     area's scene over the live world at the scene's own depth (SCENE_LAYER).
//  English pages (DECISIONS 4-21) live under /en/ with the same slugs and no demo: the other language's paths are not
//  routes here, so following one (the EN / KO switch) loads that language's shell.
import { $, $$, mk, clamp, bus, REDUCED, isNarrow } from './core.js?v=0cd00b25fdf6';
import * as TEXT from './text.js?v=0cd00b25fdf6';
import { SVC, SVC_KEYS, SCENARIO_AREA, SVC_SLUG_REDIRECT } from './text.js?v=0cd00b25fdf6';
import { BASE, href, counterpart } from './lang.js?v=0cd00b25fdf6';
import { travelSeconds } from './journey/director.js?v=0cd00b25fdf6';

/* =========================================================================
   1. intent
   ========================================================================= */
// [pattern, weight]: '|'-separated substrings of the lowercased request, or one RegExp
const kw = (w, words) => (typeof words === 'string' ? words.split('|') : [words]).map((p) => [p, w]);
const KW = {
  // 01 제품 · 웹/앱 서비스 개발 (scenario web)
  web: [...kw(2.5, '웹서비스|웹 서비스|웹앱|웹 앱'), ...kw(2, '쇼핑몰|플랫폼|커머스'), ...kw(1.5, '웹|배달|스토어|모바일'),
    ...kw(1.2, '예약|주문|회원|픽업|결제|구독|커뮤니티|빵집|베이커리'),
    ...kw(1, '서비스|매장|가게|카페|식당|음식점|병원|치과|한의원|학원|미용실|꽃집|공방|헬스장|필라테스|펜션|숙소|마켓'),
    ...kw(1.5, /\bweb\b|\bshop\b|\bstore\b|e-?commerce|\bbooking|\breservation|\bdelivery\b|\bplatform\b/)],
  // app words count for 01 — unless the request is about the company's own work (then they count for 02)
  apps: [...kw(1.5, '앱|어플|애플리케이션'), ...kw(1.5, /\bapps?\b|\bapplication\b/)],
  // homepage-type words: they route to 01 and raise `homepage` (no plain homepages: HOMEPAGE_NOTE)
  home: [...kw(2.5, '홈페이지|웹사이트|웹 사이트|랜딩'), ...kw(2, '사이트|블로그|포트폴리오|소개 페이지'), ...kw(2.5, /\bweb ?site\b|\bhome ?page\b|\blanding\b|\bblog\b|\bportfolio\b/)],
  // 02 사내 시스템 · 맞춤형 ERP 개발 (scenario app)
  erp: [...kw(3, '전사|그룹웨어'), ...kw(3, /\berp\b|\bmes\b|\bwms\b|\bscm\b|groupware/),
    ...kw(2, '회계|발주|재고|결재|근태|급여|연차|휴가|반차|출퇴근|관리 시스템|관리시스템|백오피스|구매 관리|생산 관리'),
    ...kw(2, /인사\s?(관리|모듈|시스템|업무|평가|팀|기록|정보|발령)|\bhr\b|\bcrm\b|intranet|back ?office|payroll|inventory|accounting|procurement/),
    ...kw(1.5, '엑셀|스프레드시트|자동화|대시보드|입고|출고|정산|거래처|물류'), ...kw(1.5, /dashboard|automat|excel|spreadsheet/), ...kw(0.8, '신청|팀장')],
  // …and the words that only say where the work happens: with AI in the request they describe where the AI works
  erpCtx: [...kw(2, '사내|임직원'), ...kw(1.5, '내부|직원|사원|업무'), ...kw(1.5, /internal|employee|\bstaff\b/)],
  // 03 AI · AI 전환(AX): area words, then AI Agent words and team (AI Harness) words; all three count for AX
  ai: [...kw(3, 'ai 전환|ai전환|인공지능 전환'), ...kw(3, /\bax\b/), ...kw(2.5, 'ai 도입|ai도입'), ...kw(2, /\bgpt|\bllm\b|\brag\b|chatgpt|claude|gemini|copilot|openai/), ...kw(1, /\bai\b|인공지능/)],
  agent: [...kw(3, '에이전트|챗봇|챗 봇|상담봇|문의 응대|자동 응답|자동응답'), ...kw(2, '비서|어시스턴트|faq'),
    ...kw(1.5, '답변|답하|응대|요약'), ...kw(1, '문의|고객센터|분류|번역'), ...kw(0.8, '상담'),
    ...kw(2.5, /\bagents?\b|chat ?bot|\bbot\b|assistant|customer support|summar/)],
  consult: [...kw(3, '개발 체계|개발체계'), ...kw(2.5, '컨설팅|개발 프로세스|개발 문화'),
    ...kw(2, '교육|강의|워크숍|워크샵|코칭|코드 리뷰|코드리뷰|바이브|개발팀|방법론'), ...kw(1.5, '온보딩|가이드라인'),
    ...kw(1, '팀|프로세스|가이드|개발자'), ...kw(0.5, '도입'), ...kw(2, /consult|training|workshop|lecture|coaching|onboarding|vibe|code review/), ...kw(1, /\bteam\b|\bprocess\b/)],
};
// internal-work signals: 앱/어플/app then means a company system (02), never a product (01)
const INTERNAL = /사내|업무|연차|휴가|반차|결재|재고|근태|출퇴근|직원|사원|임직원|내부|인사|급여|회계|발주|그룹웨어|\berp\b|internal|intranet|employee/;
const AI_WORD = /\bai\b|인공지능|\bax\b|\bgpt|\bllm\b|에이전트|챗봇|상담봇|\bbot\b|chat ?bot/;
export const PRICE = /가격|비용|견적|얼마|예산|요금|price|cost|quote|budget/;
// first match wins; `demo` is new (is this real?), contact comes before about ("대표 메일")
const INFO = [
  { key: 'demo', re: /시연|데모|demo|진짜\s?(ai|에이아이)|진짜로|실제로\s?만들|정말\s?만들|가짜|시뮬레이션|미리\s?짜/ },
  { key: 'tools', re: /오픈\s?소스|open\s?source|github|깃허브|깃헙|aquarium|아쿠아리움|podway|포드웨이|gaori|가오리|mulgae|물개|sanho|산호|sorage|소라게|dolgorae|돌고래|dispatch|디스패치|turn network|하네스|harness/ },
  { key: 'kernel', re: /커널|kernel|제어|control|ai-?spark|스파크|특허|patent|경계|승인 게이트/ },
  { key: 'products', re: /제품|product|sudal|수달|doksuri|독수리|ember|엠버|게임|game/ },
  { key: 'price', re: PRICE },
  { key: 'contact', re: /연락|메일|이메일|전화|contact|e-?mail|\bmail\b|\bcall\b/ },
  { key: 'about', re: /대표|회사|누구|창업|설립|founder|ceo|about|\bwho\b|정영훈|경력|연혁|실적|어떤 곳/ },
  { key: 'greet', re: /^(안녕|하이|헬로|hello|hi\b|hey|반가)/ },
];
export const TOOL_NAMES = [['podway', /podway|포드웨이/], ['gaori', /gaori|가오리/], ['mulgae', /mulgae|물개/], ['sanho', /sanho|산호/], ['sorage', /sorage|소라게/], ['dolgorae', /dolgorae|돌고래/], ['dispatch', /dispatch|디스패치/], ['atn', /turn network|\batn\b/], ['aquarium', /aquarium|아쿠아리움|하네스|harness/]];
// info that wins over a weak (< 2) commission score: "gaori 테스트 도구", "회사 소개해 주세요"
const INFO_FIRST = ['tools', 'kernel', 'products', 'demo', 'about', 'contact'];

const scoreOf = (t, list) => list.reduce((s, [p, w]) => s + ((typeof p === 'string' ? t.includes(p) : p.test(t)) ? w : 0), 0);
// area totals (web · erp · ax) and the scenario scores inside ax
function scores(t) {
  const s = Object.fromEntries(Object.entries(KW).map(([k, list]) => [k, scoreOf(t, list)]));
  const internal = INTERNAL.test(t), ai = AI_WORD.test(t);
  return {
    s,
    web: s.web + s.home + (internal ? 0 : s.apps),
    erp: s.erp + (ai ? 0 : s.erpCtx) + (internal ? s.apps : 0),
    ax: s.ai + s.agent + s.consult,
  };
}

// the closest example, disclosed ("가장 가까운 예시") in the opening and as an amber assumption; null = exact
const BAKERY = /빵집|베이커리|제과|bakery/;
const FOOD = /카페|커피|식당|음식점|맛집|레스토랑|분식|떡집|반찬|도시락|디저트|cafe|coffee|restaurant|food/;
const PICKUP = /주문|픽업|포장|테이크아웃|pickup|order/;
const FAR = /쇼핑몰|스토어|마켓|커머스|배달|택배|회원|커뮤니티|플랫폼|구독|중고|매칭|shop|store|commerce|delivery/;
const BIZ = ['한의원', '동물병원', '치과', '병원', '의원', '약국', '미용실', '네일', '꽃집', '공방', '학원', '헬스장', '필라테스', '요가', '펜션', '호텔', '숙소', '스튜디오', '부동산', '세탁소', '캠핑장', '교회'];
// "치과 예약 서비스를 만들고 싶어요" → "치과 예약 서비스": the visitor's own words, without the request around them
const ASKED = /\s*(?:을|를|이|가|은|는|도)?\s*(?:만들|만드|개발|제작|구축|부탁|원해|원합니다|하고\s?싶|싶어|필요|주세요|해\s?주|할\s?수|가능|얼마|어떻게|좀).*$/;
function phraseOf(raw) {
  const p = String(raw).replace(/\s+/g, ' ').trim().replace(/[?!.~…]+$/, '').replace(ASKED, '').trim();
  const n = Array.from(p).length;
  return n >= 2 && n <= 18 ? p : '';
}
export function closestOf(scenario, raw, homepage = false) {
  const t = String(raw || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (scenario === 'web') {
    if (BAKERY.test(t)) return null;                                  // the bakery's reservation-order service is exact
    if (FOOD.test(t) && PICKUP.test(t) && !FAR.test(t)) return null;   // so is any food shop's pickup order
    const noun = BIZ.find((b) => t.includes(b)) || (t.match(FOOD) || [])[0];
    if (homepage) return noun || null;                                 // HOMEPAGE_NOTE already says what we show instead
    if (!noun && !FAR.test(t) && /예약|주문|픽업/.test(t)) return null; // a reservation / order service is the demo itself
    return phraseOf(raw) || (noun ? `${noun} ${/앱|어플|\bapp/.test(t) ? '앱' : '서비스'}` : '말씀하신 서비스');
  }
  if (scenario === 'app') {
    if (/연차|휴가|반차|leave|vacation|\bpto\b/.test(t)) return null;   // the leave system is exact
    if (/\berp\b|전사|그룹웨어|인사\s?(관리|모듈|시스템)|\bhr\b/.test(t)) return null;   // ERP as a whole: the opening says it starts from 인사
    const ac = t.match(/\b(mes|wms|scm|crm)\b/);
    if (ac) return ac[1].toUpperCase();                                   // "MES는 가장 가까운 예시인 …"
    if (/재고|입고|출고|inventory|stock/.test(t)) return '재고 관리 시스템';
    if (/엑셀|스프레드|excel|spreadsheet/.test(t)) return '엑셀 업무';
    if (/자동화|반복|automat/.test(t)) return '반복 업무 자동화';
    const m = t.match(/(근태|출퇴근|결재|정산|일정|회계|급여|구매|발주|생산|물류|주문|예약|고객)/);
    return m ? `${m[1]} 관리 시스템` : '말씀하신 업무 시스템';
  }
  if (scenario === 'consult') return /교육|강의|워크숍|워크샵|training|workshop|lecture|코칭|coaching/.test(t) ? '교육 과정' : null;
  return null;
}

// → {type:'commission', svc: area, scenario, closest, price, example, homepage} | {type:'info', key, tool} | {type:'handoff'} | {type:'unclear'}
export function route(raw) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim();
  const t = text.toLowerCase();
  if (!t) return { type: 'unclear' };
  const sc = scores(t);
  let best = null, bestS = 0;
  for (const k of SVC_KEYS) if (sc[k] > bestS) { best = k; bestS = sc[k]; }
  const info = INFO.find((i) => i.re.test(t));
  const price = PRICE.test(t);
  const infoFirst = info && INFO_FIRST.includes(info.key) && bestS < 2;
  if (best && bestS >= 1.2 && !infoFirst) {
    const scenario = SVC[best].scenarios[0];
    const homepage = best === 'web' && sc.s.home > 0;
    return { type: 'commission', svc: best, scenario, closest: closestOf(scenario, text, homepage), price, example: false, homepage, score: +bestS.toFixed(2) };
  }
  if (info) {
    const tool = info.key === 'tools' ? (TOOL_NAMES.find(([, re]) => re.test(t)) || [null])[0] : null;
    return { type: 'info', key: info.key, tool };
  }
  if (text.replace(/\s/g, '').length < 5) return { type: 'unclear' };
  return { type: 'handoff' };
}
// the demo request of a scenario: an area's first scenario shows `ex`, its second `ex2`
export function exampleOf(scenario) {
  const area = SCENARIO_AREA[scenario] || 'web', i = SVC[area].scenarios.indexOf(scenario);
  return (i > 0 && SVC[area][`ex${i + 1}`]) || SVC[area].ex;
}

/* =========================================================================
   2. pages (depth = route)
   ========================================================================= */
export const LAYER_PATH = ['/', '/services/', '/open-source/', '/technology/', '/products/'].map(href);
// where each area's strength scene is seen (founder, 2026-09-30): 제품 at the −200 m lanterns, 사내 시스템 on the
// −4,000 m floor where the tools live, AI above the surface where Doksuri (the eagle) flies
export const SCENE_LAYER = { web: 1, erp: 2, ax: 4 };
export const LAYER_METERS = [0, 200, 4000, 10935, -40];
// one language's page table from its copy (content.js or content.en.js) under its base ('' or '/en'): the browser
// builds this page's language; the build and the tests build both
export function pagesFor(C, base = '') {
  const { COMPANY, COPY, FOUNDER, SVC, SVC_KEYS, TOOLS, TOOL_ORDER, toolLabel, AI_SPARK, META, DEMOS } = C;
  const TITLE = (s) => `${s} · ${COMPANY.name}`;
  const at = (p) => base + p;
  return [
    { path: at('/'), name: 'home', layer: 0, title: `${COMPANY.name} · ${COMPANY.identityLines.join(' ').replace(/\.$/, '')}`, desc: `${COMPANY.identity} ${COMPANY.principle}` },
    { path: at('/services/'), name: 'services', layer: 1, title: TITLE('Services'), desc: `${META.services}: ${SVC_KEYS.map((k) => SVC[k].name).join(', ')}. ${COPY.opsNote}` },
    ...SVC_KEYS.map((k) => ({ path: at(`/services/${SVC[k].slug}/`), name: 'service', layer: SCENE_LAYER[k], svc: k, scene: true, title: TITLE(SVC[k].name), desc: `${SVC[k].name} — ${SVC[k].desc.replace(/\.\s*$/, '')}. ${COPY.svcPage[k].make}` })),
    ...(DEMOS ? [{ path: at('/build/'), name: 'build', layer: null, panel: 'build', noindex: true, title: TITLE('Demo'), desc: META.build }] : []),
    { path: at('/open-source/'), name: 'tools', layer: 2, title: TITLE('AI Harness · AI Agent'), desc: META.openSource },
    // a tool's title names its branch, once (Aquarium's own label already ends with AI Harness)
    ...TOOL_ORDER.map((id) => ({ path: at(`/open-source/${id}/`), name: 'tool', layer: 2, tool: id, title: TITLE([toolLabel(id), TOOLS[id].branch || 'AI Harness'].reduce((l, b) => (l.endsWith(b) ? l : `${l} · ${b}`))), desc: `${toolLabel(id)} — ${TOOLS[id].role}` })),
    { path: at('/technology/'), name: 'kernel', layer: 3, title: TITLE('Kernel'), desc: `${META.kernel} ${AI_SPARK}.` },
    { path: at('/products/'), name: 'products', layer: 4, title: TITLE('Products'), desc: META.products },
    { path: at('/company/'), name: 'company', layer: 0, panel: 'company', title: TITLE('Company'), desc: `${FOUNDER.line}. ${COMPANY.identity}` },
    { path: at('/contact/'), name: 'contact', layer: 0, panel: 'contact', title: TITLE(META.contactTitle), desc: META.contact },
  ];
}
const P = pagesFor(TEXT, BASE);
const BY_PATH = new Map(P.map((p) => [p.path, p]));
export const PAGES = P;

export function parse(pathname = location.pathname, search = location.search) {
  let path = pathname || '/';
  if (!path.endsWith('/')) path += '/';
  // retired service slugs (/services/web|app|agent|consult/, under /en/ too) open their area's page; `moved` makes the
  // caller replace the URL
  const old = path.startsWith(`${BASE}/services/`) ? /^\/services\/([a-z]+)\/$/.exec(path.slice(BASE.length)) : null;
  const moved = old && !BY_PATH.has(path) ? SVC_SLUG_REDIRECT[old[1]] : null;
  const page = BY_PATH.get(moved ? href(`/services/${moved}/`) : path);
  if (!page) return null;
  const qs = new URLSearchParams(search || '');
  const out = { ...page };
  if (moved) out.moved = true;
  if (page.name === 'build') {
    const q = (qs.get('q') || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const svc = qs.get('svc'), sc = qs.get('scenario');
    if (q) out.q = q;
    if (svc === 'handoff') out.qsvc = 'handoff';
    else {
      // ?svc= is an area (web · erp · ax); older links carry a scenario there (web · app · consult)
      const area = SVC[svc] ? svc : SCENARIO_AREA[svc] || SCENARIO_AREA[sc] || null;
      if (area) {
        out.qsvc = area;
        const s = [sc, svc].find((x) => SVC[area].scenarios.includes(x));
        if (s) out.qscenario = s;
      }
    }
  }
  return out;
}
// /build/?svc=<area>&scenario=<scenario>&q=… (a handoff has no scenario)
export const buildPath = (svc, scenario, q) => `/build/?${new URLSearchParams(scenario ? { svc, scenario, q } : { svc, q }).toString()}`;

/* =========================================================================
   3. navigation + route panels
   env: { scroll, state, labels, getWorld, ensureJourney, beforeRoute }
   ========================================================================= */
export function createNav(env) {
  const { scroll, state } = env;
  let cur = parse() || parse(href('/'));
  let animating = 0;
  let lastScroll = 0;
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });

  function setMeta(page) {
    document.title = page.title;
    const d = $('meta[name="description"]');
    if (d) d.setAttribute('content', page.desc);
    let r = $('meta[name="robots"]');
    if (page.noindex) { if (!r) { r = mk('meta'); r.name = 'robots'; document.head.appendChild(r); } r.content = 'noindex'; }
    else r?.remove();
    // the EN / KO switch names this page in the other language (the Korean /build/ has no English page)
    const other = counterpart(page.name === 'build' ? href('/') : page.path);
    for (const a of $$('a[data-lang-switch]')) a.setAttribute('href', other);
  }

  // the scroll moves; the camera follows it (B's rig). Travel time = SPEC's depth formula.
  function travel(layer, instant) {
    const holds = scroll.holds;
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    // the start of the layer's hold: the camera arrives at the route's exact depth (no in-hold creep yet)
    const base = layer === 0 ? 0 : holds[layer] ? holds[layer][0] : 0;
    const y = Math.min(max, scroll.landingY ? scroll.landingY(layer, base) : base);
    if (instant || REDUCED) { window.scrollTo(0, y); state.scrollT = state.scrollS = y; return Promise.resolve(); }
    const dm = Math.abs((LAYER_METERS[layer] ?? 0) - (state.depthM || 0));
    animating++;
    return scroll.scrollToY(y, travelSeconds(dm) * 1000).finally(() => { animating--; });
  }

  /* ---------- route panels (opaque; the page underneath is hidden and inert) ---------- */
  const panel = $('#pagePanel');
  let panelPage = null;
  // /company/ and /contact/ sit at 0 m, looking up at the warm light of the people above (upper right, beside the panel)
  const warm = (on) => {
    const w = env.getWorld?.();
    if (!w || state.mode === 'journey') return;
    if (on) { w.humanMat.uniforms.uPos.value.set(isNarrow() ? 4 : 15, w.SURF - 1.4, -46); w.U.humanSize = isNarrow() ? 13 : 17; }
    w.animTo(w.U, 'humanI', on ? 0.6 : 0, on ? 1600 : 700);
    w.animTo(w.U, 'warm', on ? 0.14 : 0, on ? 1400 : 700);
  };
  // the panel markup loads on first use (js/journey/pages.js): it is not needed to answer a first question
  function showPanel(page) {
    panelPage = page;
    document.body.classList.add('jr-panel');
    $('#page').inert = true;
    document.documentElement.classList.add('lock');
    if (state.mode === 'explore' || state.mode === 'intro') state.mode = 'panel';
    warm(page.layer === 0);
    import('./journey/pages.js?v=0cd00b25fdf6').then((M) => {
      if (panelPage !== page) return;
      panel.innerHTML = M.panelHTML(page);
      panel.setAttribute('aria-labelledby', 'pageH');
      panel.scrollTop = 0;
      M.wirePanel(panel, page, { go, ensureJourney: env.ensureJourney, close: () => go(LAYER_PATH[page.layer ?? 0]) });
      panel.hidden = false; panel.inert = false;
      requestAnimationFrame(() => { if (!panel.hidden && panelPage === page) panel.classList.add('show'); });
      bus.emit('panel', { name: page.name, open: true });
    });
  }
  function hidePanel() {
    if (!panelPage) return;
    const was = panelPage;
    panelPage = null;
    panel.inert = true;
    panel.classList.remove('show');
    const done = () => { if (!panelPage) { panel.hidden = true; panel.replaceChildren(); } };
    if (REDUCED) done(); else setTimeout(done, 260);   // UI safety net for the fade, outside any story
    document.body.classList.remove('jr-panel');
    if (state.mode !== 'journey') { $('#page').inert = false; document.documentElement.classList.remove('lock'); }
    if (state.mode === 'panel') state.mode = 'explore';
    warm(false);
    bus.emit('panel', { name: was.name, open: false });
  }
  /* ---------- the strength scenes (a service page is its area's scene; details and demos below it) ---------- */
  let scenePage = null, sceneP = null, sceneBack = null;
  const sceneHost = $('#svcScene');
  const scenes = () => (sceneP ||= import('./strengths/scene.js?v=0cd00b25fdf6').then((M) => M.createScene({
    el: sceneHost, ensureJourney: env.ensureJourney, go,
    // × and Esc: back to where the visitor chose the area (the first screen, −200 m, the final question)
    onClose: () => go(sceneBack || LAYER_PATH[1]),
  })));
  function openScene(page) {
    scenePage = page;
    document.body.classList.add('sx-open');
    $('#page').inert = true;
    document.documentElement.classList.add('lock');
    if (state.mode === 'explore' || state.mode === 'intro') state.mode = 'panel';
    scenes().then((S) => { if (scenePage === page) return S.open(page.svc); }).then(() => {
      if (scenePage === page) bus.emit('panel', { name: 'scene', svc: page.svc, open: true });
    });
  }
  function closeScene() {
    if (!scenePage) return;
    const was = scenePage;
    scenePage = null;
    sceneP?.then((S) => { if (!scenePage) S.close(); });
    document.body.classList.remove('sx-open');
    if (state.mode !== 'journey' && !panelPage) { $('#page').inert = false; document.documentElement.classList.remove('lock'); }
    if (state.mode === 'panel' && !panelPage) state.mode = 'explore';
    bus.emit('panel', { name: 'scene', svc: was.svc, open: false });
  }
  /* ---------- apply a page ---------- */
  let applying = 0;
  async function apply(page, how = {}) {
    const my = ++applying;
    env.beforeRoute?.(page, how);
    if (page.name === 'build') {
      hidePanel(); closeScene();
      if (page.q || page.qsvc) { env.ensureJourney().then((J) => J?.fromRoute(page, how)); return; }
      showPanel(page);
      return;
    }
    if (page.scene) {
      hidePanel();
      const w = env.getWorld?.();
      if (w) w.lantern.focus = page.svc === 'web' ? SVC_KEYS.indexOf('web') : -1;
      env.labels?.closeCard();
      openScene(page);
      await travel(page.layer, how.instant);
      return;
    }
    closeScene();
    if (!page.panel) hidePanel();
    else if (panelPage && panelPage.path !== page.path) hidePanel();
    const w = env.getWorld?.();
    if (w && page.name !== 'service') w.lantern.focus = -1;
    if (!page.tool) env.labels?.closeCard();
    if (page.layer != null) await travel(page.layer, how.instant);
    if (my !== applying) return;
    if (page.tool) env.labels?.openCard(page.tool, env.labels.anchorFor(page.tool));
    if (page.svc && w) w.lantern.focus = SVC_KEYS.indexOf(page.svc);
    if (page.panel) showPanel(page);
  }

  function go(path, { replace = false, instant = false, silent = false, state: hs = null } = {}) {
    const u = new URL(path, location.origin);
    const page = parse(u.pathname, u.search);
    if (!page) { location.href = path; return Promise.resolve(); }
    const url = page.moved ? page.path : u.pathname + u.search;
    if (page.scene && !cur?.scene) sceneBack = cur ? location.pathname + location.search : null;
    if (url !== location.pathname + location.search || replace) history[replace ? 'replaceState' : 'pushState']({ rk: 1, ...hs }, '', url);
    cur = page;
    setMeta(page);
    bus.emit('route', { path: url });
    if (silent) return Promise.resolve();
    return apply(page, { instant });
  }

  // same-origin links to a known route move through the world instead of reloading the page
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    if (!a || a.target || a.hasAttribute('download') || a.dataset.later != null) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !parse(u.pathname, u.search)) return;
    e.preventDefault();
    go(u.pathname + u.search);
  });

  // Esc closes a route panel. A journey keeps Esc for itself (stop, the log sheet, the developer view), and the
  // English edition never loads the journey (no demos), so the panel's Esc lives here.
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || !panelPage || state.mode === 'journey') return;
    if (document.documentElement.classList.contains('jr-logsheet') || $('#dev')?.hidden === false) return;
    go(LAYER_PATH[panelPage.layer ?? 0]);
  });

  addEventListener('popstate', () => {
    const page = parse();
    if (!page) return;
    if (page.moved) history.replaceState({ rk: 1 }, '', page.path);
    if (page.scene && !cur?.scene) sceneBack = null;
    cur = page;
    setMeta(page);
    bus.emit('route', { path: location.pathname + location.search, pop: true });
    apply(page, { from: 'pop' });
  });

  // free scrolling keeps the URL on the depth you are reading (replaceState, no new entries)
  function syncScroll() {
    if (animating || state.mode !== 'explore' || panelPage) return;
    if (performance.now() - lastScroll < 280) return;
    if (!cur || (cur.layer == null) || cur.name === 'service' || cur.panel) return;
    const f = clamp(state.layerF, 0, 4), L = Math.round(f);
    if (Math.abs(f - L) > 0.3 || L === cur.layer) return;
    if (cur.name === 'tool' && L === 2) return;
    const page = parse(LAYER_PATH[L]);
    history.replaceState({ rk: 1 }, '', page.path);
    cur = page;
    setMeta(page);
  }

  function start() {
    setMeta(cur);
    if (cur.name === 'home') return false;
    history.replaceState({ rk: 1 }, '', cur.moved ? cur.path : location.pathname + location.search);
    apply(cur, { instant: true, initial: true });
    return true;
  }

  return {
    get page() { return cur; },
    get panel() { return panelPage; },
    get scene() { return scenePage; },
    parse, go, apply, start, setMeta, syncScroll, travel,
    // a journey takes the whole screen: it closes a route panel and a scene alike (journey.js enter)
    hidePanel: () => { hidePanel(); closeScene(); },
    warm: () => warm(!!panelPage && panelPage.layer === 0),
    replace: (path) => go(path, { replace: true, silent: true }),
    push: (path) => go(path, { silent: true }),
  };
}
