// scenarios/handoff.js — out of scope: the request goes to the founder unchanged (A runHandoff + B handoffFinish).
// No build, test or review. The "spec" of a handoff is the mail draft, streamed into the frame verbatim.
// Reached from a /build/?svc=handoff&q= link (nothing on the site is typed); at the gate the visitor may add one
// of three preset lines to the letter.
import { COPY, MAIL } from '../content.js?v=8999a49d35de';
import { esc } from '../studio/studio.js?v=8999a49d35de';

const oneLine = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => { const a = Array.from(s); return a.length > n ? `${a.slice(0, n).join('')}…` : s; };

const [gateQ, ...gateRest] = COPY.handoffGate.split(/(?<=\?)\s+/);
// the gate's preset lines ("덧붙이기"): one tap each, appended to the letter as they are
const REVISIONS = [
  { id: 'pm', label: '연락은 평일 오후가 편합니다' },
  { id: 'call', label: '전화로 먼저 이야기하고 싶습니다' },
  { id: 'quote', label: '견적부터 받아 보고 싶습니다' },
];

export default {
  id: 'handoff',
  kind: 'handoff',
  url: MAIL,
  title: '문의 전달',
  fonts: [],

  subject: (q) => `[루트커널 문의] ${clip(oneLine(q), 40)}`,
  letter: (q) => `안녕하세요. 루트커널 홈페이지에서 남기는 문의입니다.\n\n[문의 내용]\n${q}\n\n[연락처]\n\n[희망 일정]`,

  spec() { return { title: '문의 전달', rows: [] }; },
  opening: () => COPY.handoffAck,
  afterSpec: (ctx = {}) => `메일 초안을 ${ctx.where || '가운데'} 화면에 준비했습니다. 요청하신 문장은 한 글자도 바꾸지 않았습니다.`,

  gate() {
    return { title: gateQ, desc: gateRest.join(' '), approve: '승인하고 초안 만들기', meta: 'Human', kind: 'handoff' };
  },
  revisions: REVISIONS,
  revise(note) {
    const p = REVISIONS.find((x) => x.id === note || x.label === note);
    return { id: p?.id, k: 'Note', v: p ? p.label : String(note), say: '고르신 문장을 메일 초안 끝에 그대로 넣었습니다.' };
  },

  html(ctx = {}) {
    return '<div class="ms letter"><main class="ms-sec sheet in typed" data-sec="letter" data-name="MailDraft">' +
      `<div class="hd"><span>받는 사람</span><b>${esc(MAIL)}</b><span>제목</span><b id="ltSub">${esc(this.subject(ctx.q))}</b></div>` +
      '<div class="bd" id="ltBody"></div></main></div>';
  },

  approved: '메일 앱에서 보내 주시면 확인 후 답장드립니다.',
  ship: {
    k: 'Handoff · Mail draft',
    h: '메일 초안을 준비했습니다',
    p: '버튼을 누르면 메일 앱에서 초안이 열립니다. 내용을 확인하신 뒤 직접 보내 주세요.',
    cta: '메일 앱에서 초안 열기',
  },
  counts: null,
  interactive() {},
};
