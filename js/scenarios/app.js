// scenarios/app.js — 02 사내 시스템 · 맞춤형 ERP 개발: the 인사 module's leave request and approval (A SC.tool).
// Taps only (founder, 2026-09-28): 종류 as segmented chips (연차 · 반차 · 병가), dates with −/+ steppers (a working
// day at a time), 사유 as optional preset chips, 신청하기 → 내 신청. A 직원 | 팀장 switch opens the team lead's
// inbox, which approves or rejects by buttons — and the employee's list follows. No text or date is ever typed.
import { COPY, SVC, gateSubAt } from '../content.js?v=0cd00b25fdf6';
import { tx, esc, topic, genericRevise, reviseWith } from '../studio/studio.js?v=0cd00b25fdf6';

const EXAMPLE = SVC.erp.ex;   // 사내 연차 신청/승인 시스템

// ctx.closest (from the router) wins; without it, a quick guess from the request
function closestOf(ctx = {}) {
  if (ctx.closest !== undefined) return ctx.closest || null;
  const s = String(ctx.q || '');
  if (/연차|휴가|leave|erp|인사/i.test(s)) return null;
  const m = s.match(/(재고|근태|출퇴근|결재|정산|회계|급여)/);
  return m ? `${m[1]} 관리 시스템` : null;
}

/* ---------- the gate's preset revisions (one tap each) ---------- */
const REVISIONS = [
  { id: 'half', label: '반차·반반차 신청', re: /반반차|반차|half/i, k: 'Core features', v: '반차 · 반반차 신청 — 0.5일 · 0.25일 단위', say: '반차와 반반차 신청을 Core features에 추가합니다. 남은 연차는 0.5일, 0.25일 단위로 계산합니다.' },
  { id: 'proxy', label: '대신 결재자 지정', re: /대신|위임|대결|대리|proxy/i, k: 'Core features', v: '대신 결재자 지정 — 팀장 부재 시 결재 위임', say: '대신 결재자 지정을 Core features에 추가합니다. 팀장이 부재 중이면 미리 지정한 사람이 결재합니다. 누가 대신 결재했는지는 기록에 남깁니다.' },
  { id: 'remind', label: '잔여 연차 알림', re: /잔여|남은 연차|알림|슬랙|slack|메신저|카톡/i, k: 'Core features', v: '잔여 연차 알림 — 매월 1일 · 소멸 30일 전', say: '잔여 연차 알림을 Core features에 추가합니다. 알림은 매월 1일과 연차 소멸 30일 전에 메일로 보냅니다.' },
];

/* ---------- dates: local YYYY-MM-DD, working days only ---------- */
const WK = ['일', '월', '화', '수', '목', '금', '토'];
const D = (s) => new Date(`${s}T00:00:00`);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtD = (s) => { const d = D(s); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const fmtDW = (s) => `${fmtD(s)} (${WK[D(s).getDay()]})`;
function stepDay(s, n) { const d = D(s); do d.setDate(d.getDate() + n); while (d.getDay() === 0 || d.getDay() === 6); return iso(d); }
function workdays(f, t) { let n = 0; for (const d = D(f); d <= D(t); d.setDate(d.getDate() + 1)) if (d.getDay() % 6) n++; return n; }
const FROM0 = '2026-10-15', TO0 = '2026-10-16';   // 목 · 금: 연차 2일
const WHY = ['가족 행사', '병원', '개인 사정', '여행'];
const days = (n) => `${n}일`;

const stepper = (k, v, label) => `<div class="stp" role="group" aria-labelledby="lv${k}L">` +
  `<button type="button" class="bx" data-step="${k}" data-d="-1" aria-label="${label} 하루 앞으로">${tx('−')}</button>` +
  `<span class="v" id="lv${k}V" aria-live="polite">${tx(fmtDW(v))}</span>` +
  `<button type="button" class="bx" data-step="${k}" data-d="1" aria-label="${label} 하루 뒤로">${tx('+')}</button></div>`;
const ACTS = '<span class="acts"><button type="button" class="bx no" data-act="no">반려</button><button type="button" class="bx ok" data-act="ok">승인</button></span>';

function appHTML(ctx = {}) {
  const revs = ctx.revs || [];
  const types = ['연차', '반차', ...(revs.includes('half') ? ['반반차'] : []), '병가'];
  return '<div class="ms app">' +
    `<header class="ms-sec app-top" data-sec="top" data-name="AppBar"><div class="app-id"><span class="erp-tag">${tx('ERP · 인사')}</span><h1>${tx('연차 신청')}<small>${tx('우리 팀')}</small></h1></div>` +
    `<div class="role" id="lvRole" role="group" aria-label="보기"><button type="button" class="bx on" data-role="me" aria-pressed="true">${tx('직원')}</button><button type="button" class="bx" data-role="lead" aria-pressed="false">${tx('팀장')}</button></div></header>` +
    '<main class="app-grid" id="lvMe">' +
    `<section class="ms-sec card" data-sec="form" data-name="LeaveForm" aria-labelledby="lvH"><h2 id="lvH">${tx('새 신청')}<small>${tx('김하늘 · 남은 연차')} <em id="lvLeft">${tx('12일')}</em></small></h2>` +
    (revs.includes('remind') ? `<p class="note">${tx('잔여 연차 알림 · 매월 1일과 소멸 30일 전에 메일로 알려 드려요')}</p>` : '') +
    `<div class="fld"><span class="lb" id="lvTypeL">${tx('종류')}</span><div class="seg" id="lvType" role="group" aria-labelledby="lvTypeL">${types.map((t, i) => `<button type="button" class="bx${i ? '' : ' on'}" data-type="${t}" aria-pressed="${!i}">${tx(t)}</button>`).join('')}</div></div>` +
    `<div class="fld"><span class="lb" id="lvfromL">${tx('시작일')}</span>${stepper('from', FROM0, '시작일')}</div>` +
    `<div class="fld" id="lvToF"><span class="lb" id="lvtoL">${tx('종료일')}</span>${stepper('to', TO0, '종료일')}</div>` +
    `<div class="fld" id="lvHalfF" hidden><span class="lb" id="lvHalfL">${tx('시간')}</span><div class="seg" id="lvHalf" role="group" aria-labelledby="lvHalfL"><button type="button" class="bx on" data-half="오전" aria-pressed="true">오전</button><button type="button" class="bx" data-half="오후" aria-pressed="false">오후</button></div></div>` +
    '<p class="err" id="lvErr" role="alert"></p>' +
    `<div class="fld"><span class="lb" id="lvWhyL">${tx('사유')}<i>${tx('선택')}</i></span><div class="chips" id="lvWhy" role="group" aria-labelledby="lvWhyL">${WHY.map((w) => `<button type="button" class="bx" data-why="${w}" aria-pressed="false">${tx(w)}</button>`).join('')}</div></div>` +
    `<button class="sbtn bx" type="button" id="lvGo">${tx('신청하기')}<span id="lvGoN">${tx(' · 연차 2일')}</span></button>` +
    '<p class="hint" id="lvHint" hidden>신청하면 바로 확인 메시지가 뜨고, 승인 결과는 메일로 알려 드려요.</p></section>' +
    `<section class="ms-sec card" data-sec="list" data-name="MyRequests" aria-labelledby="lvL"><h2 id="lvL">${tx('내 신청')}<small>${tx('최근순')}</small></h2><ul class="lrows" id="lvList">` +
    `<li data-req="r1"><span class="d">${tx('10월 20일 – 10월 21일')}</span><span class="s">${tx('연차 2일 · 가족 행사', 'dim')}</span><span class="st8 w">${tx('대기')}</span></li>` +
    `<li><span class="d">${tx('9월 12일')}</span><span class="s">${tx('오후 반차 · 병원', 'dim')}</span><span class="st8 o">${tx('승인')}</span></li>` +
    '</ul></section></main>' +
    // the team lead's screen: another role, opened by the 팀장 switch once the draft is delivered
    '<section class="ms-sec lead in typed drawn" data-sec="lead" data-name="TeamLead" id="lvLead" hidden aria-labelledby="lvLeadH"><div class="card">' +
    '<h2 id="lvLeadH">결재함<small>팀장 박지훈</small></h2>' +
    (revs.includes('proxy') ? '<p class="note">대신 결재 · 최유진 — 팀장이 자리를 비우면 대신 결재하고 기록에 남깁니다</p>' : '') +
    '<ul class="lrows" id="lvInbox">' +
    `<li data-req="r1" data-days="2"><span class="d">김하늘 · 10월 20일 – 10월 21일</span><span class="s">연차 2일 · 가족 행사</span>${ACTS}</li>` +
    `<li data-req="r0" data-days="0"><span class="d">이서준 · 10월 8일</span><span class="s">오전 반차 · 병원</span>${ACTS}</li>` +
    '</ul><p class="empty" id="lvInboxE" hidden>결재할 신청이 없어요.</p>' +
    '<p class="rolenote" id="lvRoleNote" hidden>실제 서비스에서는 팀장 계정에만 보이는 화면입니다. 시연에서는 두 역할을 오가며 볼 수 있습니다.</p>' +
    '</div></section></div>';
}

export default {
  id: 'app',
  kind: 'build',
  url: 'leave-app',
  title: EXAMPLE,
  fonts: [],

  spec(q, ctx = {}) {
    const c = closestOf({ ...ctx, q });
    const as = ['화면은 권한별로 나눕니다 — 직원은 신청, 팀장은 승인', '기존 인사 데이터와 연결합니다 — 이번 시연은 예시 데이터입니다', '로그인은 사내 계정 연동 전까지 예시 계정(직원 · 팀장)으로 대신합니다', '급여·근태 모듈 연동은 다음 단계로 둡니다'];
    if (c) as.unshift(`예시는 ${EXAMPLE}으로 보여 드립니다. 실제로는 ${c}에 맞게 바꿉니다`);
    return {
      title: EXAMPLE,
      rows: [
        { k: 'Goal', v: '휴가 신청과 승인을 메신저와 엑셀 대신 한 화면에서 처리합니다.', m: '휴가 신청·승인을 한 화면에서' },
        { k: 'Users', v: '신청하는 직원과 승인하는 팀장. 휴대폰에서도 사용합니다.', m: '직원, 팀장' },
        { k: 'Screens', pages: true, v: ['신청 — 종류 · 날짜 · 사유', '내 신청 — 상태 표시', '팀장 승인 — 승인 · 반려'] },
        { k: 'Core features', v: ['남은 연차 자동 계산', '날짜 검증', '승인 결과 메일 알림'] },
        { k: 'Tone', v: '군더더기 없이. 한 손으로, 누르기만 해서 30초 안에 신청할 수 있게.', m: '군더더기 없이' },
        { k: 'Assumptions', as: true, v: as },
      ],
    };
  },

  opening(ctx = {}) {
    const price = ctx.price ? '비용은 범위를 정한 뒤 견적으로 드립니다. ' : '';
    const c = closestOf(ctx);
    if (c) return `${price}${topic(c)} 가장 가까운 예시인 ${EXAMPLE}으로 보여 드리겠습니다. ERP 인사 모듈의 일부이며, 신청자와 승인자의 화면을 나눕니다. 구현 전에 Spec부터 작성합니다.`;
    if (ctx.example) return `${price}맞춤형 ERP 개발을 인사 모듈의 ${EXAMPLE} 예시로 보여 드리겠습니다. 구현 전에 Spec부터 작성합니다. 추가할 기능이 있으시면 승인 전에 수정안을 골라 주세요.`;
    return `${price}맞춤형 ERP 개발로 이해했습니다. 구현 전에 Spec부터 작성합니다. 예시는 인사 모듈의 연차 신청/승인 기능입니다.`;
  },

  afterSpec(ctx = {}) {
    const n = (ctx.spec?.rows.find((r) => r.as)?.v.length) || 3;
    return `확인이 필요한 가정 ${n}건은 따로 표시했습니다.`;
  },

  gate(ctx = {}) {
    return { title: COPY.gateQ, desc: gateSubAt(ctx.rev), approve: '승인하고 진행', meta: `Spec r${ctx.rev || 1}` };
  },

  revisions: REVISIONS,
  revise(note) { return reviseWith(REVISIONS, note) || genericRevise(note); },

  html(ctx = {}) { return appHTML(ctx); },

  build: {
    say: 'Wireframe부터 Section, Copy, Color 순서로 화면을 구현합니다.',
    say2: '날짜는 −/+ 버튼으로 근무일 기준 하루씩 옮깁니다. 신청 버튼은 엄지가 닿는 아래쪽에 두었습니다.',
    sections: [
      { id: 'top', name: 'AppBar', r: 'employee · lead view' },
      { id: 'form', name: 'LeaveForm', r: 'type · dates −/+ · reason' },
      { id: 'list', name: 'MyRequests', r: '3 states' },
    ],
    art: [],
    tokens: 'store.js',
    tokensR: 'requests · approvals · days left',
    diff: 'diff +236 −0 · 7 files',
  },

  test: {
    n: 9,
    say: 'Gaori가 Test를 실행합니다. Deterministic한 작업은 AI로부터 독립적으로 수행합니다.',
    pass: [['required choices', '0.2s'], ['leave balance', '0.1s'], ['list newest first', '0.1s'], ['keyboard submit · approve', '0.3s'], ['mobile 390px layout', '0.4s']],
    more: '3 more checks passed',
    fail: { pre: 'date validation', text: 'end date before start date accepted', log: 'gaori/run-1.log', score: '8/9' },
    failSay: '종료일이 시작일보다 빠른 신청이 그대로 접수됩니다. 실패를 기록하고 Build 단계로 되돌려 날짜 검증을 추가합니다.',
    async show(X) {
      X.site.scrollTo(X.site.sec('form'), true);
      X.site.$('#lvfromV').textContent = fmtDW('2026-10-28');
      X.site.$('#lvtoV').textContent = fmtDW('2026-10-26');
      await X.wait(500);
      const li = X.site.doc.createElement('li');
      li.className = 'new';
      li.id = 'lvBad';
      li.innerHTML = '<span class="d">10월 28일 – 10월 26일</span><span class="s">연차 -1일</span><span class="st8 w">대기</span>';
      X.site.$('#lvList').prepend(li);
      await X.wait(250);
      X.hl(li, 'validation missing · end < start');
    },
    fix: [['dim', 'LeaveForm.js'], ['add', 'if (to < from) return error("종료일이 시작일보다 빠릅니다");'], ['add', 'submit.disabled = !valid;']],
    fixSummary: 'LeaveForm.js · date validation',
    async apply(X) {
      X.site.$('#lvBad')?.remove();
      await X.wait(300);
      X.site.$('#lvErr').textContent = '종료일이 시작일보다 빠릅니다.';
      X.site.$('#lvGo').disabled = true;
      X.hl(X.site.$('#lvErr'), 'validation added · submit blocked', true);
      await X.wait(1200);
      X.hl(null);
      X.site.$('#lvErr').textContent = '';
      X.site.$('#lvGo').disabled = false;
      X.site.$('#lvfromV').textContent = fmtDW(FROM0);
      X.site.$('#lvtoV').textContent = fmtDW(TO0);
    },
    run2a: '8 prior passes rechecked',
    run2b: 'end < start → error shown · submit blocked',
    total: '9/9',
    passSay: '다시 실행한 Test 9개가 모두 통과했습니다. 첫 실행의 실패 기록도 삭제하지 않고 보관합니다.',
  },

  review: {
    say: 'Mulgae가 6개 관점으로 Code review를 진행합니다.',
    say2: 'Review 결과는 권고일 뿐 승인 권한이 없습니다. Spec과 대조해 2건 모두 반영합니다.',
    notes: [
      {
        role: 'product', text: 'No confirmation message after submit', pin: 'No confirmation after submit', target: '#lvGo',
        done: 'Confirmation notice added',
        async apply(X) { const h = X.site.$('#lvHint'); if (h) h.hidden = false; },
      },
      {
        role: 'security', text: 'Team lead view switch skips the permission check', pin: 'Team lead view · no permission check', target: '#lvRole',
        done: 'Team lead view — lead accounts only (demo: example accounts)',
        async apply(X) {
          const b = X.site.$('#lvRole [data-role="lead"]');
          if (b && !b.querySelector('.lock')) { const i = X.site.doc.createElement('i'); i.className = 'lock'; i.textContent = '권한'; b.appendChild(i); b.setAttribute('aria-label', '팀장 · 팀장 권한이 있는 계정만'); }
          const n = X.site.$('#lvRoleNote'); if (n) n.hidden = false;
        },
      },
    ],
    applied: 'notice ×1 · permission check ×1',
  },

  counts: { tests: '9/9', rework: 1, review: 2 },

  ship: {
    h: '연차 신청/승인 시스템 시안이 준비됐습니다',
    p: '승인한 Spec과 이 시안으로 바로 상담을 요청하실 수 있습니다. 실제 Project도 같은 절차로 진행합니다.',
    done: (where) => `시안이 준비됐습니다. ${where} 화면에서 직접 신청해 보실 수 있습니다. 종료일을 시작일보다 앞으로 옮기면 신청 버튼이 비활성화됩니다. 시안 상단에서 ‘팀장’으로 전환하면 승인과 반려도 눌러 보실 수 있습니다.`,
  },

  // After delivery the app works by taps alone: type · dates · reason → 신청하기 → 내 신청 (대기);
  // 팀장 → 결재함: 승인 / 반려 → the employee's list shows the result; a rejected leave returns its days.
  interactive(X) {
    const site = X.site, root = site.root, doc = site.doc;
    if (!root) return;
    const $ = (s) => site.$(s), $$ = (s) => site.$$(s);
    const S = { type: '연차', from: FROM0, to: TO0, half: '오전', why: null, left: 12, n: 2 };
    const single = () => S.type === '반차' || S.type === '반반차';
    const fromLeft = () => S.type !== '병가';
    const count = () => (S.type === '반차' ? 0.5 : S.type === '반반차' ? 0.25 : workdays(S.from, S.to));
    const press = (sel, on) => { for (const b of $$(sel)) { const v = on(b); b.classList.toggle('on', v); b.setAttribute('aria-pressed', String(v)); } };
    const go = $('#lvGo'), err = $('#lvErr');
    function render() {
      press('#lvType [data-type]', (b) => b.dataset.type === S.type);
      press('#lvHalf [data-half]', (b) => b.dataset.half === S.half);
      press('#lvWhy [data-why]', (b) => b.dataset.why === S.why);
      $('#lvfromV').textContent = fmtDW(S.from);
      $('#lvtoV').textContent = fmtDW(S.to);
      $('#lvfromL').textContent = single() ? '날짜' : '시작일';
      $('#lvToF').hidden = single();
      $('#lvHalfF').hidden = !single();
      const bad = !single() && S.to < S.from;
      const n = count();
      const over = fromLeft() && n > S.left;
      err.textContent = bad ? '종료일이 시작일보다 빠릅니다.' : over ? '남은 연차보다 많습니다.' : '';
      go.disabled = bad || over || n <= 0;
      $('#lvGoN').textContent = bad ? '' : ` · ${single() ? `${S.half} ${S.type}` : `${S.type} ${days(n)}`}`;
      $('#lvLeft').textContent = days(S.left);
      const inbox = $$('#lvInbox li .acts').length;
      $('#lvInboxE').hidden = inbox > 0;
    }
    function submit() {
      render();
      if (go.disabled) return;
      const n = count(), id = `n${S.n++}`;
      if (fromLeft()) S.left -= n;
      const when = single() ? fmtD(S.from) : S.from === S.to ? fmtD(S.from) : `${fmtD(S.from)} – ${fmtD(S.to)}`;
      const kind = `${single() ? `${S.half} ${S.type}` : `${S.type} ${days(n)}`}${S.why ? ` · ${S.why}` : ''}`;
      const mine = doc.createElement('li');
      mine.className = 'new';
      mine.dataset.req = id;
      mine.innerHTML = `<span class="d">${esc(when)}</span><span class="s">${esc(kind)}</span><span class="st8 w">대기</span>`;
      $('#lvList').prepend(mine);
      // the same request lands in the team lead's inbox
      const lead = doc.createElement('li');
      lead.className = 'new';
      lead.dataset.req = id;
      lead.dataset.days = String(fromLeft() ? n : 0);
      lead.innerHTML = `<span class="d">${esc(`김하늘 · ${when}`)}</span><span class="s">${esc(kind)}</span>${ACTS}`;
      $('#lvInbox').prepend(lead);
      S.why = null;
      render();
      X.toast('신청했습니다. 시안 상단에서 ‘팀장’으로 전환하면 승인해 보실 수 있습니다.');
    }
    function role(r) {
      press('#lvRole [data-role]', (b) => b.dataset.role === r);
      $('#lvMe').hidden = r !== 'me';
      $('#lvLead').hidden = r !== 'lead';
      site.top(true);
    }
    function decide(li, ok) {
      const id = li.dataset.req;
      const st = site.$(`#lvList li[data-req="${id}"] .st8`);
      if (st) { st.className = `st8 ${ok ? 'o' : 'x'}`; st.textContent = ok ? '승인' : '반려'; }
      if (!ok) S.left += +(li.dataset.days || 0);   // a rejected leave gives its days back
      li.querySelector('.acts')?.replaceWith(Object.assign(doc.createElement('span'), { className: `st8 ${ok ? 'o' : 'x'}`, textContent: ok ? '승인함' : '반려함' }));
      li.classList.add('done');
      render();
      X.toast(ok ? '승인했습니다. 신청한 분에게 메일로 알립니다(시연).' : '반려했습니다. 신청한 분에게 메일로 알립니다(시연).');
    }
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (b.dataset.type) { S.type = b.dataset.type; if (single()) S.to = S.from; render(); }
      else if (b.dataset.half) { S.half = b.dataset.half; render(); }
      else if (b.dataset.why) { S.why = S.why === b.dataset.why ? null : b.dataset.why; render(); }
      else if (b.dataset.step) {
        const k = b.dataset.step, d = +b.dataset.d;
        S[k] = stepDay(S[k], d);
        if (single()) S.to = S.from;
        render();
      } else if (b.id === 'lvGo') submit();
      else if (b.dataset.role) role(b.dataset.role);
      else if (b.dataset.act) decide(b.closest('li'), b.dataset.act === 'ok');
    });
    render();
  },
};
