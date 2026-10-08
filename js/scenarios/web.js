// scenarios/web.js — 01 제품 · 웹/앱 서비스 개발: "밀과 소금", a neighbourhood bakery's reservation-order service
// (from A SC.home). Not a brochure: the visitor picks breads, books a pickup slot (full slots are closed) and
// places the order; the shop sees it on one screen. The draft is built like any other (sections → type →
// draw → colour), fails the 390 px phone check once (menu name · price · stepper overlap), is reworked, and
// after delivery really works inside the iframe (no network: the order number is local).
// Taps only (founder, 2026-09-28): −/+ steppers, slot chips, 주문하기; the orderer is a read-only example.
import { COPY, HOMEPAGE_NOTE, gateSubAt } from '../content.js?v=0cd00b25fdf6';
import { tx, esc, topic, genericRevise, reviseWith } from '../studio/studio.js?v=0cd00b25fdf6';

/* ---------- closest example (the router decides; this is only the fallback without one) ---------- */
const BIZ = ['치과', '병원', '한의원', '미용실', '꽃집', '공방', '학원', '헬스장', '필라테스', '펜션', '쇼핑몰', '카페', '식당'];
function closestOf(ctx = {}) {
  if (ctx.closest !== undefined) return ctx.closest || null;
  const s = String(ctx.q || '');
  if (/빵집|베이커리|bakery/i.test(s)) return null;
  return BIZ.find((b) => s.includes(b)) || null;
}
const EXAMPLE = '동네 빵집 예약 주문 서비스';

/* ---------- the gate's preset revisions (one tap each; the visitor never types) ---------- */
const REVISIONS = [
  { id: 'cake', label: '케이크 예약 추가', re: /케이크|cake/i, k: 'Core features', v: '케이크 예약 — 날짜 · 수량 · 픽업 시간', extra: '케이크 예약 — 날짜와 수량, 픽업 시간을 골라 미리 주문하실 수 있어요', say: '케이크 예약을 Core features에 추가합니다. 날짜, 수량, 픽업 시간만 받으면 기존 주문 흐름을 그대로 쓸 수 있습니다. 범위는 크게 늘지 않습니다.' },
  { id: 'english', label: '영어 메뉴 안내', re: /영어|영문|외국|english/i, k: 'Screens', v: '영문 메뉴 · 주문 — 외국인 손님용', extra: 'English menu & pickup ordering available', say: '영문 메뉴와 주문 화면을 Screens에 추가합니다. 외국인 손님도 같은 흐름으로 주문할 수 있습니다.' },
  { id: 'sms', label: '주문 확인 문자', re: /문자|알림|카톡|카카오|sms|알림톡/i, k: 'Core features', v: '주문 확인 문자 — 접수 · 준비 완료', extra: '주문이 접수되면 확인 문자를, 빵이 준비되면 한 번 더 보내 드려요', say: '주문 확인 문자를 Core features에 추가합니다. 문자는 주문이 접수될 때와 빵이 준비됐을 때, 두 번 보냅니다. 발송에는 외부 문자 서비스 연동이 필요합니다.' },
  { id: 'delivery', label: '배달 가능 지역', re: /배달|택배|delivery/i, k: 'Core features', v: '배달 가능 지역 안내 — 동네별 가능 여부', extra: '가게에서 2km 안은 배달해 드려요(예시). 배달되는 동네는 주문 화면에서 바로 알려 드려요', say: '배달 가능 지역 안내를 Core features에 추가합니다. 이번 범위는 동네별 배달 가능 여부 안내까지입니다. 배달 주문은 다음 단계로 둡니다.' },
];

/* ---------- artwork (A): the loaf, wheat, and the little map to the shop ---------- */
function bez(t, a, b, c, d) { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; }
function bezd(t, a, b, c, d) { const u = 1 - t; return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c); }
function wheatSVG(P, col, dark) {
  const G = 'M0 0 C5 -5.5 12 -6.6 18.5 -3.6 C12.5 1.6 5 2.6 0 0 Z';
  let s = `<path class="st" pathLength="1" d="M${P[0]} ${P[1]} C${P[2]} ${P[3]} ${P[4]} ${P[5]} ${P[6]} ${P[7]}" stroke="${dark}" stroke-width="1.5"/>`;
  for (let k = 0; k < 7; k++) {
    const t = 0.5 + k * 0.072, x = bez(t, P[0], P[2], P[4], P[6]), y = bez(t, P[1], P[3], P[5], P[7]);
    const a = Math.atan2(bezd(t, P[1], P[3], P[5], P[7]), bezd(t, P[0], P[2], P[4], P[6])) * 180 / Math.PI;
    for (const o of [-34, 34]) s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a + o).toFixed(1)})"><path class="fl" d="${G}" fill="${col}"/><path class="st" pathLength="1" d="${G}" stroke="${dark}" stroke-width="1"/></g>`;
  }
  const x = P[6], y = P[7], a = Math.atan2(bezd(1, P[1], P[3], P[5], P[7]), bezd(1, P[0], P[2], P[4], P[6])) * 180 / Math.PI;
  s += `<g transform="translate(${x} ${y}) rotate(${a.toFixed(1)})"><path class="fl" d="${G}" fill="${col}"/><path class="st" pathLength="1" d="${G}" stroke="${dark}" stroke-width="1"/></g>`;
  return s;
}
function loafSVG() {
  const body = 'M58 231 C50 176 98 124 170 122 C244 120 290 172 280 231 Z';
  const cut1 = 'M98 180 C132 151 190 141 242 153', cut2 = 'M118 208 C152 187 204 181 252 191';
  return '<svg viewBox="0 0 320 290" aria-hidden="true">' +
    '<defs><radialGradient id="gLoaf" cx="42%" cy="28%" r="80%"><stop offset="0" stop-color="#E9BD78"/><stop offset=".55" stop-color="#C98B47"/><stop offset="1" stop-color="#8C4F24"/></radialGradient>' +
    '<radialGradient id="gSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F2DDB6"/><stop offset=".7" stop-color="#F2DDB6" stop-opacity=".35"/><stop offset="1" stop-color="#F2DDB6" stop-opacity="0"/></radialGradient></defs>' +
    '<circle class="art-bg" cx="178" cy="128" r="132" fill="url(#gSun)"/>' +
    '<circle class="st" pathLength="1" cx="178" cy="128" r="98" stroke="#CFAE77" stroke-width="1" style="stroke-dasharray:.004 .012"/>' +
    wheatSVG([244, 256, 252, 196, 262, 140, 292, 58], '#D8A74E', '#7D5A22') +
    wheatSVG([272, 262, 286, 210, 300, 170, 318, 104], '#E2B866', '#7D5A22') +
    '<rect class="fl" x="34" y="231" width="262" height="15" rx="7.5" fill="#B7885A"/>' +
    '<path class="st" pathLength="1" d="M41.5 231 H288.5 A7.5 7.5 0 0 1 288.5 246 H41.5 A7.5 7.5 0 0 1 41.5 231 Z" stroke="#6E4524" stroke-width="1.3"/>' +
    `<path class="fl" d="${body}" fill="url(#gLoaf)"/>` +
    `<path class="st" pathLength="1" d="${body}" stroke="#5B3517" stroke-width="1.6"/>` +
    '<path class="fl" d="M98 180 C132 151 190 141 242 153 C198 151 146 161 104 188 Z" fill="#F4DFB9"/>' +
    `<path class="st" pathLength="1" d="${cut1}" stroke="#5B3517" stroke-width="1.3"/>` +
    '<path class="fl" d="M118 208 C152 187 204 181 252 191 C208 191 162 197 124 216 Z" fill="#F4DFB9"/>' +
    `<path class="st" pathLength="1" d="${cut2}" stroke="#5B3517" stroke-width="1.3"/>` +
    '<g class="flour" fill="#FFF6E6"><circle cx="140" cy="141" r="1.6"/><circle cx="170" cy="133" r="1.2"/><circle cx="197" cy="137" r="1.8"/><circle cx="216" cy="146" r="1.1"/><circle cx="156" cy="151" r="1"/><circle cx="184" cy="127" r="1.4"/><circle cx="126" cy="157" r="1.2"/><circle cx="230" cy="162" r="1.3"/><circle cx="110" cy="170" r="1"/></g>' +
    '</svg>';
}
function mapSVG() {
  return '<svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<path class="fl" d="M196 0 C184 50 214 104 190 180 L300 180 L300 0 Z" fill="#DCE2C6"/>' +
    '<path class="st" pathLength="1" d="M-10 52 C80 62 160 38 310 50" stroke="#FBF7F0" stroke-width="7"/>' +
    '<path class="st" pathLength="1" d="M222 -10 C230 52 244 112 268 190" stroke="#FBF7F0" stroke-width="7"/>' +
    '<path class="st" pathLength="1" d="M96 -10 C104 60 116 120 126 190" stroke="#FBF7F0" stroke-width="10"/>' +
    '<path class="st" pathLength="1" d="M-10 124 C70 114 150 138 310 98" stroke="#FBF7F0" stroke-width="13"/>' +
    '<circle class="fl" cx="162" cy="100" r="18" fill="#8B4B22" opacity=".14"/>' +
    '<path class="fl" d="M162 106 C154 96 150 90 150 84 A12 12 0 0 1 174 84 C174 90 170 96 162 106 Z" fill="#8B4B22"/>' +
    '<path class="st" pathLength="1" d="M162 106 C154 96 150 90 150 84 A12 12 0 0 1 174 84 C174 90 170 96 162 106 Z" stroke="#5B3517" stroke-width="1"/>' +
    '<circle class="fl" cx="162" cy="84" r="4.2" fill="#FBF7F0"/>' +
    '<text class="fl" x="180" y="81" font-size="12" fill="#4A2C14" font-family="Gowun Batang, serif" font-weight="700">밀과 소금</text>' +
    '</svg>';
}

/* ---------- the shop's data (example values; see the spec's assumptions) ---------- */
const MENU = [
  { id: 'campagne', n: '천연발효 캄파뉴', p: 7500, d: '호밀 20% · 36시간 저온 발효', stock: 6 },
  { id: 'salt', n: '소금빵', p: 3200, d: '발효 버터와 굵은 소금', stock: 24 },
  { id: 'baguette', n: '바게트 트래디션', p: 4800, d: '매일 11시, 두 번째 굽기', stock: 10 },
  { id: 'fig', n: '무화과 호밀빵', p: 6800, d: '무화과 · 호두 · 호밀', stock: 5 },
  { id: 'anbutter', n: '앙버터', p: 4200, d: '팥앙금과 발효 버터', stock: 12 },
  { id: 'focaccia', n: '올리브 포카치아', p: 5500, d: '로즈마리 · 올리브유', stock: 8 },
];
// today's pickup slots and the places left in each (0 = full: the slot cannot be chosen)
const SLOTS = [['09:00', 0], ['10:00', 2], ['11:00', 4], ['13:00', 1], ['14:00', 0], ['15:00', 5], ['16:00', 3], ['17:00', 6]];
// the draft opens on an order in progress, so every stage shows a real receipt
const CART0 = { campagne: 1, salt: 2 };
const SLOT0 = '15:00';
const FIRST_NO = 142;

const num = (n) => n.toLocaleString('ko-KR');
const won = (n) => `${num(n)}원`;
const clock = (t) => { const [h, m] = t.split(':').map(Number); return `${h < 12 ? '오전' : '오후'} ${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')}`; };
const itemsOf = (cart) => MENU.filter((m) => cart[m.id] > 0);
const sumOf = (cart) => itemsOf(cart).reduce((s, m) => s + m.p * cart[m.id], 0);
const countOf = (cart) => itemsOf(cart).reduce((s, m) => s + cart[m.id], 0);
// t wraps a text run: tx() while the draft is built (blueprint bars until "typed"), plain text once it is live
const plain = (s) => s;
const lineHTML = (m, q, t = plain) => `<li><span>${t(esc(m.n))} <i>${t(`× ${q}`)}</i></span><b>${t(won(m.p * q))}</b></li>`;

function itemHTML(m) {
  const q = CART0[m.id] || 0;
  return `<li data-id="${m.id}"${q ? ' class="on"' : ''}><div class="ln"><span class="n">${tx(m.n)}</span><span class="p">${tx(num(m.p))}</span></div>` +
    `<p class="d">${tx(m.d, 'dim')}</p>` +
    `<div class="buy"><span class="left">${tx(`남은 ${m.stock - q}개`)}</span>` +
    `<span class="qty"><button type="button" class="dec bx" data-id="${m.id}"${q ? '' : ' disabled'}>${tx('−')}</button><b class="q">${tx(String(q))}</b>` +
    `<button type="button" class="inc bx" data-id="${m.id}">${tx('+')}</button></span></div></li>`;
}
function slotHTML([t, left]) {
  const on = t === SLOT0;
  return `<button type="button" class="slot bx${on ? ' on' : ''}" data-slot="${t}" aria-pressed="${on}"${left ? '' : ' disabled'}><b>${tx(clock(t))}</b><span>${tx(left ? `남은 자리 ${left}` : '마감')}</span></button>`;
}
function doneHTML(no, slot, cart) {
  const items = itemsOf(cart);
  return '<div class="tk">' +
    '<p class="k"><i aria-hidden="true">✓</i>주문이 접수됐습니다</p>' +
    `<p class="no">주문 번호 <b>#${String(no).padStart(4, '0')}</b> · <span>픽업 <b>${clock(slot)}</b></span></p>` +
    `<p class="sum">${items.map((m) => `${esc(m.n)} ${cart[m.id]}`).join(' · ')} · 합계 ${won(sumOf(cart))}</p>` +
    '<p class="hint">찾으러 오실 때 주문 번호를 말씀해 주세요. 결제는 가게에서 합니다.</p>' +
    '<div class="tk-f"><span>시연 화면이라 실제로 전송되지는 않습니다</span><button type="button" class="ms-btn gh" id="oNew">새 주문</button></div>' +
    '</div>';
}

function bakeryHTML(extras = []) {
  const items = itemsOf(CART0);
  return '<div class="ms bake">' +
    `<header class="ms-sec ms-nav" data-sec="nav" data-name="Header"><a class="ms-logo" data-go="hero" href="#">${tx('밀과 소금')}<small>${tx('BAKERY')}</small></a>` +
    `<nav class="ms-links" aria-label="빵집 메뉴"><a class="bx" data-go="menu" href="#">${tx('메뉴')}</a><a class="bx" data-go="pickup" href="#">${tx('픽업')}</a>` +
    `<a class="pill bx" data-go="order" href="#">${tx('주문 내역')}<b class="ms-cnt" id="cartN">${tx(String(countOf(CART0)))}</b></a></nav></header>` +
    '<main>' +
    // Hero: what the service does, today's bakes, the way in
    `<section class="ms-sec ms-hero" data-sec="hero" data-name="Hero"><div class="ms-hero-t">` +
    `<p class="ms-eye">${tx('매일 아침 7시, 첫 빵이 나옵니다')}</p>` +
    `<h1><span class="drop">${tx('오늘 구운 빵,')}</span><br><span class="drop">${tx('미리 담아 두세요')}</span></h1>` +
    `<p class="ms-lede">${tx('빵과 수량을 고르고 찾으러 오실 시간을 정하면, 그 시간에 맞춰 포장해 둡니다. 결제는 가게에서 합니다.', 'dim')}</p>` +
    `<div class="ms-acts"><a class="ms-btn bx" data-go="menu" href="#">${tx('예약 주문하기')}</a><a class="ms-btn gh bx" data-go="pickup" href="#">${tx('픽업 시간 보기')}</a></div>` +
    `</div><figure class="ms-art" id="artHero">${loafSVG()}</figure>` +
    `<div class="ms-today"><h3>${tx('오늘 나온 빵')}</h3><ul>` +
    `<li><span class="num">${tx('07:00')}</span>${tx('캄파뉴')}<i>${tx('나왔어요')}</i></li>` +
    `<li><span class="num">${tx('08:30')}</span>${tx('소금빵')}<i>${tx('나왔어요')}</i></li>` +
    `<li><span class="num">${tx('11:00')}</span>${tx('바게트')}<i class="soon">${tx('곧 나와요')}</i></li></ul></div></section>` +
    // Menu: six breads, a stepper each (the 390 px bug lives here until the rework)
    `<section class="ms-sec ms-menu bug" data-sec="menu" data-name="Menu"><div class="ms-h2"><h2><span class="drop">${tx('메뉴')}</span></h2><p>${tx('그날 구운 빵만 팝니다', 'dim')}</p></div>` +
    `<ul class="ms-grid" id="mGrid">${MENU.map(itemHTML).join('')}</ul></section>` +
    // Pickup: time slots with their places left; where to come
    `<section class="ms-sec ms-pickup" data-sec="pickup" data-name="Pickup"><div class="ms-pk">` +
    `<div class="ms-h2"><h2><span class="drop">${tx('픽업 시간')}</span></h2><p>${tx('오늘 · 시간대마다 정원이 있어요', 'dim')}</p></div>` +
    `<div class="ms-slots" id="slots" role="group" aria-label="픽업 시간">${SLOTS.map(slotHTML).join('')}</div>` +
    `<p class="ms-pk-note">${tx('마감된 시간은 고를 수 없어요. 고르신 시간에 맞춰 포장해 둡니다.', 'dim')}</p></div>` +
    `<div class="ms-place"><div class="ms-map" id="artMap">${mapSVG()}<a class="bx" data-map href="#">${tx('지도 앱에서 열기')}</a></div>` +
    `<p class="ms-addr"><b>${tx('찾으러 오실 곳')}</b>${tx('○○로 12길 3, 1층 (예시 주소)')}<br>${tx('화–일 07:00–19:00 · 월요일은 쉽니다', 'dim')}</p></div></section>` +
    // Order: the receipt, who orders, one button
    `<section class="ms-sec ms-order" data-sec="order" data-name="Order">` +
    `<div class="ms-o-head"><h2><span class="drop">${tx('주문 내역')}</span></h2><span class="ms-o-when" id="oWhen">${tx(`픽업 · 오늘 ${clock(SLOT0)}`)}</span></div>` +
    '<div class="ms-o-body" id="oBody"><div class="ms-o-cart">' +
    `<ul class="ms-o-lines" id="oLines">${items.map((m) => lineHTML(m, CART0[m.id], tx)).join('')}</ul>` +
    '<p class="ms-o-empty" id="oEmpty" hidden>아직 담은 빵이 없어요.<a data-go="menu" href="#">메뉴 보기</a></p>' +
    `<p class="ms-o-note">${tx('결제는 픽업할 때 가게에서 합니다.', 'dim')}</p>` +
    extras.map((x) => `<p class="ms-extra">${tx(esc(x))}</p>`).join('') +
    '</div><div class="ms-o-form">' +
    // who orders: a read-only example (a real service fills it from the customer's account) — nothing to type
    `<div class="ms-o-who" id="oWho"><p class="k"><span>${tx('주문하시는 분')}</span><i>${tx('예시')}</i></p>` +
    `<p class="v">${tx('이도윤')}<span>${tx('010-1234-5678')}</span></p>` +
    `<p class="n">${tx('시연이라 예시 손님으로 주문합니다', 'dim')}</p></div>` +
    `<div class="ms-o-total"><span>${tx('합계')}</span><b id="oTotal">${tx(won(sumOf(CART0)))}</b></div>` +
    '<p class="ms-o-err" id="oErr" role="alert"></p>' +
    `<button type="button" class="ms-go bx" id="oGo">${tx('주문하기')}</button></div></div>` +
    '<div class="ms-o-done" id="oDone" role="status" hidden></div></section>' +
    '</main>' +
    `<footer class="ms-sec ms-foot" data-sec="foot" data-name="Footer"><span>${tx('밀과 소금 · 동네 빵집 · 시안')}</span>` +
    `<nav aria-label="바로가기"><a data-demo="sns" href="#">${tx('인스타그램')}</a><a data-map href="#">${tx('지도')}</a><a data-go="hero" href="#">${tx('맨 위로')}</a></nav></footer>` +
    '</div>';
}

export default {
  id: 'web',
  kind: 'build',
  url: 'milgwa-sogeum-order',
  title: EXAMPLE,
  fonts: ['Gowun+Batang:wght@400;700', 'Fraunces:opsz,wght@9..144,300..600'],

  spec(q, ctx = {}) {
    const c = closestOf({ ...ctx, q });
    const as = ['상호는 가칭 ‘밀과 소금’으로 둡니다', '가격·시간은 예시 값입니다', '온라인 결제는 이번 범위에서 빼고 현장에서 결제합니다'];
    if (c) as.unshift(`예시는 ${EXAMPLE}로 보여 드립니다. 실제로는 ${c}에 맞게 바꿉니다`);
    if (ctx.homepage) as.unshift(HOMEPAGE_NOTE.assume);
    return {
      title: EXAMPLE,
      rows: [
        { k: 'Goal', v: '손님은 휴대폰으로 빵을 담고 픽업 시간을 예약해 주문합니다. 가게는 들어온 주문을 한 화면에서 확인합니다.', m: '빵 담기 · 픽업 예약 · 주문 확인' },
        { k: 'Users', v: '근처 주민과 단골손님(주문), 가게 직원(주문 확인)' },
        { k: 'Screens', pages: true, v: ['메뉴 담기 — 빵 6종 · 수량', '픽업 시간 — 시간대별 정원', '주문 확인 — 주문 번호'] },
        { k: 'Core features', v: ['빵 수량 담기', '시간대별 정원', '주문 번호 안내'] },
        { k: 'Tone', v: '따뜻하고 단정하게. 크림색 바탕에 밀빛 포인트, 제목은 명조.', m: '따뜻하고 단정하게' },
        { k: 'Assumptions', as: true, v: as },
      ],
    };
  },

  // a plain homepage request: HOMEPAGE_NOTE.say first, on its own line; then the 01 demo as usual
  opening(ctx = {}) {
    const price = ctx.price ? `${COPY.priceAnswer} ` : '';
    const c = closestOf(ctx);
    if (ctx.homepage) return [HOMEPAGE_NOTE.say, `${price}가장 가까운 예시는 ${EXAMPLE}입니다. 구현 전에 Spec부터 작성합니다.`];
    if (c) return `${price}${topic(c)} 가장 가까운 예시인 ${EXAMPLE}로 보여 드리겠습니다. 구현 전에 Spec부터 작성합니다.`;
    if (ctx.example) return `${price}웹/앱 서비스 개발을 ${EXAMPLE} 예시로 보여 드리겠습니다. 구현 전에 Spec부터 작성합니다. 추가할 기능이 있으시면 승인 전에 수정안을 골라 주세요.`;
    return `${price}웹/앱 서비스 개발로 이해했습니다. 구현 전에 Spec부터 작성합니다. 완료 기준이 있어야 결과를 검증할 수 있습니다.`;
  },

  afterSpec(ctx = {}) {
    const n = (ctx.spec?.rows.find((r) => r.as)?.v.length) || 3;
    return `확인이 필요한 가정 ${n}건은 따로 표시했습니다.`;
  },

  gate(ctx = {}) {
    return { title: COPY.gateQ, desc: gateSubAt(ctx.rev), approve: '승인하고 진행', meta: `Spec r${ctx.rev || 1}` };
  },

  // the gate's chips; revise() takes a chip's label (or id) and returns the spec change
  revisions: REVISIONS,
  revise(note) { return reviseWith(REVISIONS, note) || genericRevise(note); },

  html(ctx = {}) { return bakeryHTML(ctx.extras || (ctx.extra ? [ctx.extra] : [])); },

  build: {
    say: 'Wireframe부터 Section, Copy, Illustration, Color 순서로 화면을 구현합니다.',
    say2: '손님이 휴대폰으로 주문하므로 수량 버튼은 엄지로 누르기 쉬운 크기로 만들었습니다. 합계는 주문 버튼 바로 위에 두었습니다.',
    sections: [
      { id: 'nav', name: 'Header', r: 'nav 3 · cart count' },
      { id: 'hero', name: 'Hero', r: 'h1 · order CTA' },
      { id: 'menu', name: 'Menu', r: '6 breads · qty −/+' },
      { id: 'pickup', name: 'Pickup', r: '8 slots · capacity' },
      { id: 'order', name: 'Order', r: 'total · customer (example) · submit' },
      { id: 'foot', name: 'Footer', r: '3 links' },
    ],
    art: ['hero', 'pickup'],
    tokens: 'tokens.css',
    tokensR: 'cream · wheat · crust',
    diff: 'diff +412 −0 · 11 files',
  },

  test: {
    n: 16,
    phone: true, // the frame narrows to 390 px on desktop; phones light a "390px 검사" chip instead
    say: 'Gaori가 Test를 실행합니다. Deterministic한 작업은 AI로부터 독립적으로 수행합니다.',
    pass: [['desktop layout', '0.4s'], ['order total', '0.2s'], ['full slot not selectable', '0.3s'], ['order blocked without pickup time', '0.1s'], ['qty never below 0', '0.1s'], ['order blocked with empty cart', '0.1s'], ['9 links respond', '0.6s'], ['text contrast AA', '0.3s']],
    more: '7 more checks passed',
    fail: { pre: 'mobile 390px layout', text: 'mobile 390px — menu name · price · add button overlap', log: 'gaori/run-1.log', score: '15/16' },
    failSay: '모바일 390px 폭에서 메뉴 이름, 가격, 담기 버튼이 겹칩니다. 이 상태로는 손님이 수량을 잘못 누를 수 있습니다. 실패를 기록하고 Build 단계로 되돌려 수정합니다.',
    async show(X) {
      X.site.scrollTo(X.site.sec('menu'), true);
      await X.wait(380);
      X.hl(X.site.$('#mGrid'), 'overlap · menu name · price · add button');
    },
    fix: [['dim', 'Menu.css'], ['del', '@media (max-width: 560px) { grid-template-columns: repeat(3, 1fr); }'], ['add', '@media (max-width: 560px) { grid-template-columns: 1fr; }'], ['add', '.buy { flex-wrap: wrap; }'], ['del', '.n { white-space: nowrap; }']],
    fixSummary: 'Menu.css · 1 fix',
    async apply(X) {
      X.site.sec('menu').classList.remove('bug');
      await X.wait(650);
      X.hl(X.site.$('#mGrid'), 'no overlap · 390px', true);
      await X.wait(1100);
      X.hl(null);
    },
    run2a: '15 prior passes rechecked',
    run2b: 'mobile 390px — no menu overlap',
    total: '16/16',
    passSay: '다시 실행한 Test 16개가 모두 통과했습니다. 첫 실행의 실패 기록도 삭제하지 않고 보관합니다.',
  },

  review: {
    say: 'Mulgae가 6개 관점으로 Code review를 진행합니다.',
    say2: 'Review 결과는 권고일 뿐 승인 권한이 없습니다. Spec과 대조해 2건 모두 반영합니다.',
    notes: [
      {
        // the review scrolls each target to the top: this one sits below the next, so both pins stay in view
        role: 'maintainability', text: 'Repeated color value ×3 → token', pin: 'Color value ×3 → token', target: '#mGrid li:nth-child(4) .p',
        done: 'tokens.css — color ×3 → var(--crust)',
        async apply(X) { X.site.root?.style.setProperty('--crust', '#8B4B22'); },
      },
      {
        role: 'product', text: 'Missing accessible names on 2 qty buttons — add · remove', pin: 'Missing accessible names ×2 · qty buttons', target: '#mGrid li:first-child .qty',
        done: 'aria-label ×12 — add · remove buttons',
        async apply(X) {
          for (const li of X.site.$$('#mGrid li')) {
            const n = li.querySelector('.n')?.textContent.trim() || '빵';
            const q = li.querySelector('.qty');
            q?.setAttribute('role', 'group');
            q?.setAttribute('aria-label', `${n} 수량`);
            li.querySelector('.dec')?.setAttribute('aria-label', `${n} 한 개 빼기`);
            li.querySelector('.inc')?.setAttribute('aria-label', `${n} 한 개 담기`);
          }
        },
      },
    ],
    applied: 'tokens.css ×1 · aria-label ×12',
  },

  counts: { tests: '16/16', rework: 1, review: 2 },

  ship: {
    h: '예약 주문 서비스 시안이 준비됐습니다',
    p: '승인한 Spec과 이 시안으로 바로 상담을 요청하실 수 있습니다. 실제 Project도 같은 절차로 진행합니다.',
    done: (where) => `시안이 준비됐습니다. ${where} 화면에서 빵을 담고 픽업 시간을 골라 직접 주문해 보실 수 있습니다.`,
  },

  // After delivery the service works by taps alone: steppers, slots (full ones closed), the total, the order and
  // its number. Nothing leaves the page: the order number is counted here.
  interactive(X) {
    const site = X.site, root = site.root;
    if (!root) return;
    const $ = (s) => site.$(s);
    const cart = { ...CART0 };
    const left = Object.fromEntries(SLOTS);
    let slot = SLOT0, no = FIRST_NO;
    const err = $('#oErr');
    const say = (t) => { if (err) err.textContent = t; };
    function render() {
      for (const m of MENU) {
        const li = root.querySelector(`#mGrid li[data-id="${m.id}"]`);
        if (!li) continue;
        const q = cart[m.id] || 0;
        li.classList.toggle('on', q > 0);
        li.querySelector('.q').textContent = String(q);
        li.querySelector('.left').textContent = q < m.stock ? `남은 ${m.stock - q}개` : '남은 빵을 다 담았어요';
        li.querySelector('.dec').disabled = q <= 0;
        li.querySelector('.inc').disabled = q >= m.stock;
      }
      const items = itemsOf(cart);
      $('#oLines').innerHTML = items.map((m) => lineHTML(m, cart[m.id])).join('');
      $('#oEmpty').hidden = items.length > 0;
      $('#oTotal').textContent = won(sumOf(cart));
      const n = $('#cartN');
      n.textContent = String(countOf(cart));
      n.hidden = !countOf(cart);
      $('#oWhen').textContent = slot ? `픽업 · 오늘 ${clock(slot)}` : '픽업 시간을 골라 주세요';
      for (const b of root.querySelectorAll('#slots .slot')) {
        const t = b.dataset.slot;
        b.disabled = left[t] <= 0;
        b.classList.toggle('on', t === slot);
        b.setAttribute('aria-pressed', String(t === slot));
        b.querySelector(':scope > span').textContent = left[t] > 0 ? `남은 자리 ${left[t]}` : '마감';
      }
    }
    function order() {
      if (!itemsOf(cart).length) return say('빵을 한 가지 이상 담아 주시면 주문할 수 있어요.');
      if (!slot) return say('찾으러 오실 시간을 골라 주세요.');
      if (left[slot] <= 0) { slot = null; render(); return say('그 시간은 방금 마감됐어요. 다른 시간을 골라 주세요.'); }
      say('');
      left[slot] -= 1;
      const done = $('#oDone');
      done.innerHTML = doneHTML(no++, slot, cart);
      $('#oBody').hidden = true;
      done.hidden = false;
      for (const m of MENU) cart[m.id] = 0;   // the order is in: the basket starts empty again
      render();
      site.scrollTo(site.sec('order'));
      X.toast('주문을 받았습니다. 시연 화면이라 실제로 전송되지는 않습니다.');
    }
    function again() {
      const done = $('#oDone');
      done.hidden = true;
      done.replaceChildren();
      $('#oBody').hidden = false;
      slot = null;
      render();
      site.scrollTo(site.sec('menu'));
    }
    root.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) {
        e.preventDefault();
        if (a.dataset.go) { const s = site.sec(a.dataset.go); if (s) site.scrollTo(s); }
        else if (a.dataset.demo === 'sns') X.toast('시안 화면입니다. 실제 서비스에서는 가게 인스타그램이 열립니다.');
        else if (a.hasAttribute('data-map')) X.toast('시안 화면입니다. 실제 서비스에서는 지도 앱이 열립니다.');
        return;
      }
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (b.dataset.id) {
        const m = MENU.find((x) => x.id === b.dataset.id);
        cart[m.id] = Math.max(0, Math.min(m.stock, (cart[m.id] || 0) + (b.classList.contains('inc') ? 1 : -1)));
        say('');
        render();
      } else if (b.dataset.slot) { slot = b.dataset.slot; say(''); render(); }
      else if (b.id === 'oGo') order();
      else if (b.id === 'oNew') again();
    });
    render();
  },
};
