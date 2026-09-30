// scenarios/agent.js — 03 AI · AI 전환(AX) 구축, the work side: an AI agent answering an online shop's questions (A SC.agent).
// Taps only (founder, 2026-09-28): the widget offers suggested questions as buttons — three it may answer from its
// documents, one out of scope that it hands to a person instead of guessing. Nothing is typed.
import { COPY, gateSubAt } from '../content.js?v=cfb647b9bfd4';
import { REDUCED } from '../core.js?v=cfb647b9bfd4';
import { stream } from '../log.js?v=cfb647b9bfd4';
import { tx, esc, topic, genericRevise, reviseWith } from '../studio/studio.js?v=cfb647b9bfd4';

function closestOf(ctx = {}) {
  if (ctx.closest !== undefined) return ctx.closest || null;
  const s = String(ctx.q || '');
  if (/쇼핑몰|문의|상담|faq|고객/i.test(s)) return null;
  const m = s.match(/(예약|병원|학원|호텔|식당|민원|사내)/);
  return m ? m[1] : null;
}

function shirtSVG(col) {
  const d = 'M50 18 L68 10 C74 18 86 18 92 10 L110 18 L132 44 L116 56 L108 48 L108 128 L52 128 L52 48 L44 56 L28 44 Z';
  return `<svg viewBox="0 0 160 140" aria-hidden="true"><path class="fl" d="${d}" fill="${col}"/><path class="st" pathLength="1" d="${d}" stroke="#3B3833" stroke-width="1.4"/><path class="st" pathLength="1" d="M80 20 L80 128" stroke="#3B3833" stroke-width="1"/></svg>`;
}

// the widget's suggested questions: in scope (answered from the shop's documents) and one out of scope
const QS = [
  { k: 'ship', q: '배송은 얼마나 걸리나요?', a: '평일 오후 2시 전에 주문하시면 당일 출발하고, 보통 1–2일 안에 도착해요.' },
  { k: 'refund', q: '교환·환불은 어떻게 하나요?', a: '받으신 날부터 7일 안에 마이페이지에서 신청하실 수 있어요. 단순 변심일 때는 왕복 배송비가 들어요.' },
  { k: 'hours', q: '고객센터 운영 시간은요?', a: '고객센터는 평일 오전 10시부터 오후 5시까지 운영해요.' },
];
// the out-of-scope one: the same question Gaori caught the draft guessing at (no document says when stock returns)
const OOS = { k: 'oos', q: '다음 주에 린넨 셔츠 다시 들어오나요?', oos: true };
// what an applied revision adds to the widget
const QX = {
  refund: { k: 'sale', q: '세일 상품도 환불되나요?', a: '세일 상품도 받으신 날부터 7일 안에 교환·환불하실 수 있어요. 다만 30% 넘게 할인한 상품은 교환만 돼요(예시 정책).' },
  afterhours: { k: 'late', q: '지금 문의하면 언제 답이 오나요?', a: '고객센터 운영 시간(평일 10–17시) 밖에 남기신 문의는 접수해 두었다가 다음 영업일 오전에 답해 드려요.' },
  escalate: { k: 'pay', q: '결제가 두 번 됐어요', h: '결제 문제는 제가 답하지 않고 바로 담당자에게 연결해 드릴게요. 확인되는 대로 연락드릴게요.' },
};
const questionsFor = (revs = []) => [...QS, ...Object.keys(QX).filter((id) => revs.includes(id)).map((id) => QX[id]), OOS];
const HANDOFF_TXT = '그 내용은 제가 확실히 알 수 없어요. 추측해서 답하지 않고 담당자에게 전달하겠습니다.';

/* ---------- the gate's preset revisions (one tap each) ---------- */
const REVISIONS = [
  { id: 'refund', label: '교환·환불 규정 추가', re: /교환|환불|반품|refund/i, k: 'Answer scope', v: '교환·환불 세부 규정 — 세일 상품 · 사이즈 교환', say: '교환·환불 세부 규정을 Answer scope에 추가합니다. 세일 상품과 사이즈 교환 규정은 별도 문서로 두고, AI는 그 문서 안에서만 답합니다.' },
  { id: 'afterhours', label: '영업시간 밖 안내', re: /영업시간|시간 밖|야간|주말|after/i, k: 'Core features', v: '영업시간 밖 문의 — 접수 후 다음 영업일 답변 안내', say: '영업시간 밖 안내를 Core features에 추가합니다. 고객센터 운영 시간이 아니면 문의를 접수만 하고, 다음 영업일에 답변한다고 안내합니다.' },
  { id: 'escalate', label: '담당자 연결 기준 강화', re: /담당자|사람|연결|기준|escalat/i, k: 'Core features', v: '담당자 연결 기준 — 결제 · 배송 사고 · 불만은 바로 사람에게', say: '담당자 연결 기준을 Core features에 추가합니다. 결제 문제, 배송 사고, 불만 문의는 AI가 답하지 않고 바로 담당자에게 넘깁니다.' },
];

// One bubble in the widget. Answers stream; the visitor's own question appears whole.
async function say(X, text, cls, run) {
  const b = X.site.$('#wgB');
  const m = X.site.doc.createElement('div');
  m.className = `wm ${cls}`;
  b.appendChild(m);
  b.scrollTop = b.scrollHeight;
  if (cls === 'u' || cls === 't' || REDUCED || !run) { m.textContent = text; b.scrollTop = b.scrollHeight; return m; }
  await stream(m, text, { run, pace: 0.8, cursor: false, onChunk: () => { b.scrollTop = b.scrollHeight; } });
  return m;
}

function agentHTML(revs = []) {
  return '<div class="ms agent">' +
    `<header class="ms-sec shop-top" data-sec="top" data-name="ShopHeader"><b>${tx('소소옷')}</b><span>${tx('기본에 충실한 옷', 'dim')}</span></header>` +
    '<main>' +
    `<section class="ms-sec shop-body" data-sec="prod" data-name="Products" aria-label="상품">` +
    `<div><div class="prod">${shirtSVG('#D3CCBE')}</div><div class="prod-t"><b>${tx('옥스퍼드 셔츠')}</b>${tx('39,000원', 'dim')}</div></div>` +
    `<div><div class="prod">${shirtSVG('#AEBDB5')}</div><div class="prod-t"><b>${tx('린넨 셔츠')}</b>${tx('45,000원', 'dim')}</div></div></section>` +
    `<section class="ms-sec widget" data-sec="chat" data-name="ChatWidget" aria-label="문의 도우미">` +
    `<div class="wg-h"><i></i><b>${tx('문의 도우미')}</b><small>${tx('AI · 모르면 담당자 연결')}</small></div>` +
    `<div class="wg-b" id="wgB" role="log" aria-label="상담 내용"><div class="wm a" id="wgHi">${tx('안녕하세요. 배송, 교환·환불, 고객센터 시간을 안내해 드려요.')}</div></div>` +
    `<p class="wg-ql" id="wgQl">${tx('이런 걸 물어보세요')}</p>` +
    `<div class="wg-q" id="wgQ" role="group" aria-labelledby="wgQl">${questionsFor(revs).map((x) => `<button type="button" class="bx${x.oos ? ' oos' : ''}" data-k="${x.k}">${tx(esc(x.q))}${x.oos ? `<i>${tx('범위 밖')}</i>` : ''}</button>`).join('')}</div>` +
    `<p class="wg-note" id="wgNote">${tx('AI가 답합니다. 확실하지 않은 질문은 담당자에게 넘깁니다.', 'dim')}</p></section>` +
    '</main></div>';
}

export default {
  id: 'agent',
  kind: 'build',
  url: 'soso-help',
  title: '쇼핑몰 문의에 답하는 AI',
  fonts: ['Fraunces:opsz,wght@9..144,400..600'],
  landing: '[data-sec="chat"]',   // the delivered draft opens on the widget: its questions are the thing to try

  spec(q, ctx = {}) {
    const c = closestOf({ ...ctx, q });
    const as = ['답변 내용은 예시 운영 정책입니다', '주문 조회 Tool 연동은 다음 단계로 둡니다', '가게 이름은 가칭 ‘소소옷’으로 둡니다'];
    if (c) as.unshift(`예시는 쇼핑몰 문의 도우미로 보여 드립니다. 실제로는 ${c}에 맞게 바꿉니다`);
    return {
      title: '쇼핑몰 문의에 답하는 AI',
      rows: [
        { k: 'Goal', v: '쇼핑몰에 자주 들어오는 문의에 AI가 바로 답하고, 문서에 없는 질문은 담당자에게 넘깁니다.', m: '자주 오는 문의 즉답 · 범위 밖은 담당자 연결' },
        { k: 'Users', v: '쇼핑몰 방문 고객. 답변 품질은 운영 담당자가 확인합니다.', m: '쇼핑몰 고객' },
        { k: 'Answer scope', pages: true, v: ['배송 기간', '교환 · 환불', '고객센터 운영 시간'] },
        { k: 'Core features', v: ['정해진 문서 안에서만 답변', '근거 없으면 담당자 연결 — 추측 금지', '개인정보 입력 시 가림'] },
        { k: 'Tone', v: '친절하고 짧게. 확실하지 않은 내용은 확실하지 않다고 답합니다.', m: '친절하고 짧게' },
        { k: 'Assumptions', as: true, v: as },
      ],
    };
  },

  opening(ctx = {}) {
    const price = ctx.price ? `${COPY.priceAnswer} ` : '';
    const c = closestOf(ctx);
    if (c) return `${price}${topic(/AI$/.test(c) ? c : `${c} 문의 응대`)} 가장 가까운 예시인 쇼핑몰 문의 도우미로 보여 드립니다. 구현 전에 답변 범위부터 Spec으로 정합니다.`;
    if (ctx.example) return `${price}AI 전환(AX) 구축을 쇼핑몰 문의에 답하는 AI Agent 예시로 보여 드리겠습니다. 구현 전에 Spec부터 작성합니다. 답변 범위를 바꾸고 싶으시면 승인 전에 수정안을 골라 주세요.`;
    return `${price}AI 전환(AX) 구축으로 이해했습니다. 업무용 AI Agent부터 보여 드립니다. 구현 전에 Spec부터 작성합니다.`;
  },

  afterSpec(ctx = {}) {
    const n = (ctx.spec?.rows.find((r) => r.as)?.v.length) || 3;
    return `범위 밖 질문은 추측하지 않고 담당자에게 넘긴다고 Spec에 적었습니다. 확인이 필요한 가정 ${n}개는 Assumptions에 표시했습니다.`;
  },

  gate(ctx = {}) {
    return { title: COPY.gateQ, desc: gateSubAt(ctx.rev), approve: '승인하고 진행', meta: `Spec r${ctx.rev || 1}` };
  },

  revisions: REVISIONS,
  revise(note) { return reviseWith(REVISIONS, note) || genericRevise(note); },

  html(ctx = {}) { return agentHTML(ctx.revs); },

  build: {
    say: '규정 조회는 Tool이, 답변 문장은 LLM이, 범위 밖 질문은 담당자가 맡도록 구현합니다.',
    say2: '상담 창은 상품을 가리지 않도록 화면 아래에 두었습니다.',
    sections: [
      { id: 'top', name: 'ShopHeader', r: 'demo shop' },
      { id: 'prod', name: 'Products', r: '2 products' },
      { id: 'chat', name: 'ChatWidget', r: '4 question buttons · human handoff' },
    ],
    art: ['prod'],
    tokens: 'answers.md',
    tokensR: '3 source docs',
    diff: 'diff +236 −0 · 7 files',
  },

  test: {
    n: 10,
    say: 'Gaori가 범위 밖 질문까지 포함해 Test를 실행합니다. Deterministic한 작업은 AI로부터 독립적으로 수행합니다.',
    pass: [['answers within policy · 3 FAQs', '0.6s'], ['every answer cites a source doc', '0.2s'], ['personal data masked', '0.3s'], ['mobile 390px layout', '0.4s']],
    more: '5 more checks passed',
    fail: { pre: 'out-of-scope handling', text: 'out-of-scope → guessed answer', log: 'gaori/run-1.log', score: '9/10' },
    failSay: '재입고 날짜처럼 문서에 없는 질문에 AI가 추측으로 답했습니다. 가장 위험한 유형의 실패이므로 Build 단계로 되돌려 수정합니다.',
    async show(X) {
      X.site.scrollTo(X.site.sec('chat'), true);
      const q = await say(X, '다음 주에 린넨 셔츠 다시 들어오나요?', 't', X.run);
      q.dataset.test = '1';
      await X.wait(300);
      const m = await say(X, '네, 다음 주 화요일에 재입고됩니다.', 'a', X.run);
      m.id = 'wgBad';
      m.dataset.test = '1';
      await X.wait(200);
      X.hl(m, 'guessed answer · no source');
    },
    fix: [['dim', 'policy.ts'], ['add', 'if (!answer.source) return handoff("담당자 연결");'], ['del', 'fallback: "generate"']],
    fixSummary: 'policy.ts · no source → human handoff',
    async apply(X) {
      const m = X.site.$('#wgBad');
      if (!m) return;
      m.className = 'wm h';
      m.textContent = HANDOFF_TXT;
      await X.wait(200);
      X.hl(m, 'human handoff · no guess', true);
      await X.wait(1300);
      X.hl(null);
    },
    run2a: '9 previous passes re-checked',
    run2b: 'out-of-scope → human handoff',
    total: '10/10',
    passSay: '다시 실행한 결과 Test 10개가 모두 통과했습니다. 이제 문서에 없는 질문은 담당자에게 넘깁니다.',
  },

  review: {
    say: 'Mulgae가 6개 관점으로 Code review를 진행합니다.',
    say2: 'Review 결과는 권고일 뿐 승인 권한이 없습니다. Spec과 대조해 2건 모두 반영합니다.',
    notes: [
      {
        role: 'product', text: 'greeting does not mention human handoff', pin: 'no handoff notice in greeting', target: '#wgHi',
        done: 'handoff notice added to greeting',
        async apply(X) { const f = X.site.$('#wgHi'); if (f) f.textContent = '안녕하세요. 배송, 교환·환불, 고객센터 시간을 안내해 드려요. 그 밖의 질문은 담당자에게 연결해 드려요.'; },
      },
      {
        role: 'security', text: 'chat log retention not disclosed', pin: 'no chat retention notice', target: '#wgNote',
        done: 'retention notice added',
        async apply(X) { const n = X.site.$('#wgNote'); if (n) n.textContent = 'AI가 답합니다. 확실하지 않은 질문은 담당자에게 넘기고, 대화 기록은 30일 뒤 삭제합니다(예시 정책).'; },
      },
    ],
    applied: '2 notices',
  },

  counts: { tests: '10/10', rework: 1, review: 2 },

  ship: {
    h: '문의 도우미 시안이 준비됐습니다',
    p: '승인한 Spec과 이 시안으로 바로 상담을 요청하실 수 있습니다. 실제 Project도 같은 절차로 진행합니다.',
    done: (where) => `시안이 준비됐습니다. ${where} 화면에서 질문을 눌러 보세요. ‘범위 밖’ 질문은 추측하지 않고 담당자에게 넘깁니다.`,
  },

  // After delivery: tap a question — an answer from the documents, or (out of scope) a hand-off to a person.
  interactive(X, ctx = {}) {
    X.site.$$('#wgB [data-test]').forEach((n) => n.remove());
    const all = questionsFor(ctx.revs);
    const btns = () => X.site.$$('#wgQ button');
    let busy = false;
    const ask = async (x) => {
      if (busy) return;
      busy = true;
      for (const b of btns()) b.setAttribute('aria-disabled', 'true');
      try {
        await say(X, x.q, 'u', X.ui);
        await X.ui.wait(REDUCED ? 0 : 520);
        if (x.oos) await say(X, HANDOFF_TXT, 'h', X.ui);
        else if (x.h) await say(X, x.h, 'h', X.ui);
        else await say(X, x.a, 'a', X.ui);
      } catch { /* the page moved on */ } finally {
        busy = false;
        for (const b of btns()) b.removeAttribute('aria-disabled');
      }
    };
    X.site.$('#wgQ').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-k]');
      const x = b && all.find((y) => y.k === b.dataset.k);
      if (x) ask(x);
    });
  },
};
