// scenarios/consult.js — 03 AI · AI 전환(AX) 구축, the development side: a first-draft diagnosis of a team's AI development system (A SC.consult).
// Taps only (founder, 2026-09-28): after delivery each checkpoint folds open ("How to verify") — an accordion, nothing typed.
import { COPY, gateSubAt } from '../content.js?v=0cd00b25fdf6';
import { tx, esc, topic, genericRevise, reviseWith } from '../studio/studio.js?v=0cd00b25fdf6';

function closestOf(ctx = {}) {
  if (ctx.closest !== undefined) return ctx.closest || null;
  return null;
}

// [title, question, unsupported score, how it is checked] — the draft's bug: three scores with no evidence behind them.
const CHK = [
  ['Spec', 'AI Agent에게 작업을 맡기기 전에 Spec을 작성합니까?', '62점', '최근 작업 3건의 요청서와 결과물을 비교해, 구현 전에 합의한 Spec이 있었는지 확인합니다.'],
  ['Human approval', '되돌리기 어려운 단계 앞에 Gate가 있습니까?', '48점', '배포, 데이터 변경, 결제처럼 되돌리기 어려운 단계 앞에 사람의 승인 기록이 남는지 확인합니다.'],
  ['Test evidence', 'Test의 통과와 실패를 모두 원본 로그와 exit code로 남깁니까?', '71점', 'CI와 로컬 실행 모두에서 원본 로그와 exit code를 남기는지, 실패 기록을 지우지 않는지 확인합니다.'],
  ['Code review', 'AI가 작성한 코드는 누가, 어떤 관점으로 Code review를 진행합니까?', '', 'AI Code review 결과를 권고로만 쓰는지, merge는 사람이 승인하는지 확인합니다.'],
  ['Rework log', '실패했을 때 무엇을 되돌렸는지 기록합니까?', '', '실패 후 무엇을 왜 되돌렸는지 작업 기록에 남는지 확인합니다.'],
];

/* ---------- the gate's preset revisions (one tap each) ---------- */
const REVISIONS = [
  { id: 'training', label: '교육 일정 추가', re: /교육|일정|기획|pm|비개발/i, k: 'Outputs', v: '팀 교육 일정 — 4주 · 주 1회 실습', add: '팀 교육 일정 · 4주 동안 주 1회, 실제 작업 1건으로 실습', say: '팀 교육 일정을 Outputs에 추가합니다. 4주 동안 주 1회, 실제 작업 1건으로 실습합니다.' },
  { id: 'review', label: 'Code review 절차 강화', re: /리뷰|review/i, k: 'Outputs', v: 'Code review 절차서 — AI 권고와 사람 승인 분리', add: 'Code review 절차서 · AI Code review는 권고, merge 승인은 사람', say: 'Code review 절차서를 Outputs에 추가합니다. AI Code review는 권고로만 쓰고, merge 승인은 사람이 하도록 정리해 드립니다.' },
  { id: 'records', label: 'Test 기록 보관 기준', re: /테스트|기록|로그|보관/i, k: 'Outputs', v: 'Test 기록 보관 기준 — 원본 로그 · exit code · 보관 기간', add: 'Test 기록 보관 기준 · 원본 로그와 exit code의 보관 위치와 기간', say: 'Test 기록 보관 기준을 Outputs에 추가합니다. 원본 로그와 exit code를 어디에, 얼마 동안 보관할지 팀 환경에 맞춰 정해 드립니다.' },
];

function reportHTML(revs = []) {
  const adds = REVISIONS.filter((r) => revs.includes(r.id));
  return '<div class="ms rep">' +
    `<header class="ms-sec rep-h" data-sec="head" data-name="ReportHeader"><div class="k">${tx('AI Harness Assessment · Draft')}</div><h1><span class="drop">${tx('AI Agent와 일하는 방식을')}</span><br><span class="drop">${tx('절차로 바꾸는 4단계')}</span></h1><p>${tx('Scope: 요청하신 팀 · Method: 인터뷰 2회와 저장소 점검', 'dim')}</p></header>` +
    '<main>' +
    `<section class="ms-sec rep-s" data-sec="check" data-name="Checkpoints" aria-labelledby="chkH"><h2 id="chkH">${tx('Checkpoints · 5')}</h2><ul class="chk" id="chk">` +
    CHK.map(([t, q, s, how], i) => `<li><span class="i">${tx(String(i + 1))}</span><div class="c"><b>${tx(t)}</b><span class="q">${tx(q, 'dim')}</span>` +
      `<button type="button" class="more bx" aria-expanded="false" aria-controls="how${i + 1}">${tx('How to verify')}</button><p class="how" id="how${i + 1}" hidden>${esc(how)}</p></div>` +
      `${s ? `<em class="score">${tx(s)}</em>` : `<em>${tx('인터뷰 후 확정')}</em>`}</li>`).join('') +
    '</ul></section>' +
    `<section class="ms-sec rep-s" data-sec="road" data-name="Roadmap" aria-labelledby="roadH"><h2 id="roadH">${tx('Roadmap · 4 weeks')}</h2><ol class="road">` +
    `<li><span class="w">${tx('Week 1')}</span><b>${tx('Spec 양식과 Gate 위치 확정')}</b><span>${tx('Podway 절차 1개로 시작', 'dim')}</span></li>` +
    `<li><span class="w">${tx('Week 2')}</span><b>${tx('Test 증거 기록')}</b><span>${tx('Gaori로 실행 · 원본 로그 보관', 'dim')}</span></li>` +
    `<li><span class="w">${tx('Week 3')}</span><b>${tx('AI Code review 도입')}</b><span>${tx('Mulgae 6개 관점 · 권고로만', 'dim')}</span></li>` +
    `<li><span class="w">${tx('Week 4')}</span><b>${tx('팀 교육과 회고')}</b><span id="rd4">${tx('실제 작업 1건으로 실습', 'dim')}</span></li></ol>` +
    (adds.length ? `<div class="adds"><p class="adds-k">${tx('Added in Spec r2')}</p><ul>${adds.map((r) => `<li>${tx(esc(r.add))}</li>`).join('')}</ul></div>` : '') +
    '</section>' +
    '</main></div>';
}

export default {
  id: 'consult',
  kind: 'build',
  url: 'ax-diagnosis',
  title: '우리 팀 AI 개발 체계 진단',
  fonts: ['Gowun+Batang:wght@400;700', 'Fraunces:opsz,wght@9..144,300..600'],

  spec(q, ctx = {}) {
    const c = closestOf({ ...ctx, q });
    const as = ['팀 현황을 아직 모르므로 점수는 매기지 않습니다', '도구는 루트커널이 GitHub에 공개한 AI Harness로 제안합니다', '일정은 팀 사정에 맞춰 조정합니다'];
    if (c) as.unshift(`예시는 팀 진단서로 보여 드립니다. 실제로는 ${c}에 맞게 바꿉니다`);
    return {
      title: '우리 팀 AI 개발 체계 진단',
      rows: [
        { k: 'Goal', v: '팀이 AI Agent와 개발하는 방식을 진단하고, AI Harness 도입 순서를 제안합니다.', m: 'AI 개발 방식 진단 · AI Harness 도입 순서 제안' },
        { k: 'Users', v: '개발자와 기획자, 도입을 결정하는 분', m: '개발자·기획자·결정권자' },
        { k: 'Outputs', pages: true, v: ['진단서 — 진단 항목 5개', '도입 순서 — 4주 Roadmap', '팀 교육 — 실제 작업으로 실습'] },
        { k: 'Approach', v: '인터뷰 2회와 저장소 점검', m: '인터뷰 2회 · 저장소 점검' },
        { k: 'Tone', v: '평가표가 아니라 함께 고칠 목록으로', m: '함께 고칠 목록으로' },
        { k: 'Assumptions', as: true, v: as },
      ],
    };
  },

  opening(ctx = {}) {
    const price = ctx.price ? `${COPY.priceAnswer} ` : '';
    const c = closestOf(ctx);
    if (c) return `${price}${topic(c)} 가장 가까운 예시인 팀 진단서로 보여 드립니다. 초안을 만들기 전에 진단 범위와 산출물을 Spec으로 정합니다.`;
    if (ctx.example) return `${price}AI 전환(AX) 가운데 개발팀의 AI 개발 체계를 팀 진단서 초안 예시로 보여 드리겠습니다. 초안을 만들기 전에 Spec부터 작성합니다. 진단 범위를 바꾸고 싶으시면 승인 전에 수정안을 골라 주세요.`;
    return `${price}AI 전환(AX) 구축으로 이해했습니다. 개발팀의 AI 개발 체계 진단부터 보여 드립니다. 초안을 만들기 전에 Spec부터 작성합니다.`;
  },

  afterSpec(ctx = {}) {
    const n = (ctx.spec?.rows.find((r) => r.as)?.v.length) || 3;
    return `팀 현황을 아직 모르므로 점수는 매기지 않는다고 Spec에 적었습니다. 확인이 필요한 가정 ${n}개는 Assumptions에 표시했습니다.`;
  },

  gate(ctx = {}) {
    return { title: COPY.gateQ, desc: gateSubAt(ctx.rev), approve: '승인하고 진행', meta: `Spec r${ctx.rev || 1}` };
  },

  revisions: REVISIONS,
  revise(note) { return reviseWith(REVISIONS, note) || genericRevise(note); },

  html(ctx = {}) { return reportHTML(ctx.revs); },

  build: {
    say: '승인한 Spec을 기준으로 진단서 초안을 작성합니다. 진단 항목, 질문, Roadmap 순서로 채웁니다.',
    say2: '진단 항목마다 팀에 확인할 질문을 1개씩 붙였습니다.',
    sections: [
      { id: 'head', name: 'ReportHeader', r: 'scope · method' },
      { id: 'check', name: 'Checkpoints', r: '5 checkpoints' },
      { id: 'road', name: 'Roadmap', r: '4 weeks' },
    ],
    art: [],
    tokens: 'report.md',
    tokensR: 'assessment · roadmap',
    diff: 'diff +142 −0 · 3 files',
  },

  test: {
    n: 8,
    say: 'Gaori가 초안의 Spec 준수 여부까지 Test를 실행합니다. Deterministic한 작업은 AI로부터 독립적으로 수행합니다.',
    pass: [['all 5 checkpoints have a question', '0.1s'], ['roadmap includes human approval', '0.1s'], ['tool names and versions match', '0.2s'], ['mobile 390px layout', '0.3s']],
    more: '3 more checks passed',
    fail: { pre: 'spec assumption compliance', text: '3 unsupported scores · spec assumption violated', log: 'gaori/run-1.log', score: '7/8' },
    failSay: 'Spec에는 점수를 매기지 않는다고 적었는데, 초안에 근거 없는 점수 3건이 들어갔습니다. Build 단계로 되돌려 수정합니다.',
    async show(X) {
      X.site.scrollTo(X.site.sec('check'), true);
      await X.wait(300);
      X.hl(X.site.$('#chk'), 'no evidence · 3 scores');
    },
    fix: [['dim', 'report.md'], ['del', '62점 · 48점 · 71점'], ['add', '인터뷰 후 확정']],
    fixSummary: 'report.md · 3 scores removed',
    async apply(X) {
      X.site.$$('#chk em.score').forEach((e) => { e.classList.remove('score'); e.innerHTML = '<span class="tx">인터뷰 후 확정</span>'; });
      await X.wait(400);
      X.hl(X.site.$('#chk'), 'unsupported scores removed', true);
      await X.wait(1200);
      X.hl(null);
    },
    run2a: '7 previous passes re-checked',
    run2b: 'no score without evidence',
    total: '8/8',
    passSay: '다시 실행한 결과 Test 8개가 모두 통과했습니다. 근거 없는 숫자는 진단서에 쓰지 않습니다.',
  },

  review: {
    say: 'Mulgae가 6개 관점으로 Code review를 진행합니다.',
    say2: 'Review 결과는 권고일 뿐 승인 권한이 없습니다. Spec과 대조해 2건 모두 반영합니다.',
    notes: [
      {
        role: 'documentation', text: '‘Gate’ not defined at first use', pin: '‘Gate’ undefined', target: '#chk li:nth-child(2)',
        done: '‘Gate’ definition added',
        async apply(X) { const s = X.site.$('#chk li:nth-child(2) .q'); if (s) s.textContent = '되돌리기 어려운 단계 앞에 Gate가 있습니까? (Gate: 사람이 승인해야 다음 단계로 넘어가는 지점)'; },
      },
      {
        role: 'product', text: 'training not split by role · developers / planners', pin: 'split training by role', target: '#rd4',
        done: 'training split by role',
        async apply(X) { const r = X.site.$('#rd4'); if (r) r.textContent = '개발자·기획자 따로, 실제 작업 1건으로 실습'; },
      },
    ],
    applied: '1 definition · 1 training split',
  },

  counts: { tests: '8/8', rework: 1, review: 2 },

  ship: {
    h: '진단서 초안이 준비됐습니다',
    p: '승인한 Spec과 이 시안으로 바로 상담을 요청하실 수 있습니다. 실제 Project도 같은 절차로 진행합니다.',
    done: (where) => `진단서 초안이 준비됐습니다. ${where} 화면에서 항목마다 ‘How to verify’를 눌러 보세요. 실제 진단은 인터뷰로 시작하며, 이 초안과 Spec으로 바로 상담을 요청하실 수 있습니다.`,
  },

  // After delivery: each checkpoint's "How to verify" folds open and shut (an accordion).
  interactive(X) {
    X.site.root?.addEventListener('click', (e) => {
      const b = e.target.closest('.more');
      if (!b) return;
      const p = X.site.$(`#${b.getAttribute('aria-controls')}`);
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      if (p) p.hidden = !open;
    });
  },
};
