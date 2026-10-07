// content.js — the single source of facts and shared copy for the merged prototype.
// Every founder line, tool name, release line and guardrail string comes from here.
// Do not retype these strings in other modules; import them.

export const MAIL = 'cs@rootkernel.xyz';
export const GITHUB = 'https://github.com/irootkernel';
export const repoUrl = (repo) => `${GITHUB}/${repo}`;

// Logo geometry (viewBox "-6 -6 194.5 71").
// "<" and "_" are the machine side (teal); ">" is the human side (warm white).
export const LOGO = {
  viewBox: '-6 -6 194.5 71',
  L: 'M39.5,0 L0,24 L0,33 L39.5,57 L39.5,44 L14,28.5 L39.5,13 Z',
  U: { x: 66, y: 50, w: 52, h: 9 },
  R: 'M144,0 L182.5,24 L182.5,33 L144,57 L144,44 L169.5,28.5 L144,13 Z',
  teal: '#10C4BE',
  warm: '#EDE9E7',
};

// The English address (founder, 2026-10-08), in parts: the footer and /company/ show it as one line (addressEn),
// and the build gives the parts to the Organization JSON-LD (scripts/build.mjs).
const ADDRESS_EN = { street: '1F, Seoul 50 Plus Southern Campus, 36-25 Oryu-ro', locality: 'Guro-gu', region: 'Seoul', country: 'Republic of Korea', countryCode: 'KR', postalCode: '08350' };

export const COMPANY = {
  name: '루트커널',
  nameEn: 'Root Kernel',
  founded: '2026.06.17',
  address: '서울시 구로구 오류로 36-25, 서울시50플러스 남부캠퍼스 1층 공유오피스 힘나',
  addressEn: `${ADDRESS_EN.street}, ${ADDRESS_EN.locality}, ${ADDRESS_EN.region}, ${ADDRESS_EN.country} (${ADDRESS_EN.postalCode})`,
  addressEnParts: ADDRESS_EN,
  // The first screen's H1, one entry per line (.hero-title .ln). index.html carries the same lines for no-JS;
  // main.js fills each .ln from this array, so the line break never depends on searching the sentence.
  identityLines: ['AI를 제어하는 기술로', 'SW를 만듭니다.'],
  // The same claim as one sentence with its subject, for page text and meta descriptions.
  identity: '루트커널은 AI를 제어하는 기술로 SW를 만듭니다.',
  // The founding principle in one line: under the H1 (data-c="principle") and on /company/.
  principle: 'Deterministic한 작업은 Tool이, 판단이 필요한 작업은 AI가, 중요한 결정은 사람이 합니다.',
};

// Founder: one string everywhere (decided 2026-09-27: "15년 이상").
export const FOUNDER = {
  name: '정영훈',
  // English name and title for the footer, /company/ and the JSON-LD (founder, 2026-10-08)
  nameEn: 'Karl Jeong',
  title: 'Founder & CEO',
  experience: '개발 경력 15년 이상',
  line: '대표 정영훈 · 개발 경력 15년 이상 · 컴퓨터공학 석사 · LG전자 Linux Kernel · SAP Labs Korea SAP HANA',
};

// Founder profile for /company/ only (disclosure approved: education, papers, patents).
// Source: docs/reference/company.md. Master's research is "CGRA 컴파일러" (DECISIONS 2026-09-29).
// Experience stays "15년 이상" (FOUNDER), whatever company.md says.
// Do not show the founder's US patents on home/build screens (avoid confusion with AI-SPARK's application).
export const FOUNDER_PROFILE = [
  { k: 'Education', v: '울산과학기술원(UNIST) 컴퓨터공학 석사 · CGRA 컴파일러 연구' },
  { k: 'Papers', v: 'ACM TACO 2013 제1저자 · DATE 2013 공저 · 2014 한국반도체학술대회 우수논문상' },
  { k: 'LG전자', v: '2013.08–2016.10 · 차세대 모바일 SoC용 Linux Kernel 프로세스 스케줄러 · webOS 전력 관리' },
  { k: 'SAP Labs Korea', v: '2016.10–2026.01 · SAP HANA RDBMS 코어 · 클라우드 DB 인프라 Tech Lead · 장애 시 세션 복구 설계' },
  { k: 'Patent', v: 'US 11,663,091 — 클라이언트 캐싱을 이용한 데이터베이스 세션 복구 (발명자 · 유럽·일본 패밀리 등록)' },
  { k: 'Application', v: 'US 2024/0362354 — 데이터베이스 테넌트 생명주기 관리 (심사 중)' },
  { k: 'Certificates', v: 'CKA · CKAD (2022)' },
];

// Guardrails: never name or hint the financial client beyond "국내 금융권".
export const CLIENT_LABEL = '국내 금융권 기업뱅킹 고도화 Project 참여(2026.08–12)';
// AI-SPARK is always "출원", never "등록".
export const AI_SPARK = 'AI-SPARK 국내 특허 출원(2026.04)';

export const TRACK = [
  ['2026.01', 'Sudal 및 AI-SPARK 개발 착수'],
  ['2026.02', '서울50플러스재단 사무실 지원 사업 선정'],
  ['2026.04', 'AI-SPARK 국내 특허 출원'],
  ['2026.06', '루트커널 설립'],
  ['2026.07', 'Ember Quest · 게임제작환경 AX 지원사업 2차 선정'],
  ['2026.08–12', '국내 금융권 기업뱅킹 고도화 Project 참여'],
];

// The four things people can hire Root Kernel for. Key order == lantern index at −200 m.
// Three service areas (founder decision 2026-09-28): 제품 · 사내 시스템 · AI.
// "홈페이지 제작" is not offered. Key order == lantern order at −200 m.
// An area can hold several demo scenarios: the router picks the scenario; the world, rail and
// service pages use the area. Scenario modules keep their file names (js/scenarios/<scenario>.js).
export const SVC_KEYS = ['web', 'erp', 'ax'];
export const SVC = {
  web: {
    no: '01', area: '제품', name: '웹/앱 서비스 개발', short: '웹/앱 서비스 개발', slug: 'web-app',
    desc: '고객이 직접 쓰는 B2C·B2B 웹 서비스와 모바일 앱을 만듭니다.',
    scope: '고객용 웹 서비스·모바일 앱', ex: '동네 빵집 예약 주문 서비스', scenarios: ['web'],
  },
  erp: {
    no: '02', area: '사내 시스템', name: '맞춤형 ERP 개발', short: '맞춤형 ERP 개발', slug: 'erp',
    desc: '회사의 업무 흐름과 데이터에 맞춘 업무 시스템과 ERP를 설계하고, Cloud·DB 인프라까지 구축합니다.',
    scope: '업무 시스템·전사 ERP', ex: '사내 연차 신청/승인 시스템', scenarios: ['app'],
  },
  ax: {
    no: '03', area: 'AI', name: 'AI 전환(AX) 구축', short: 'AI 전환(AX) 구축', slug: 'ax',
    desc: '업무에는 AI Agent를, 개발팀에는 AI Harness를 도입합니다.',
    scope: 'AI Agent·AI Harness 도입', ex: '우리 팀에 AI Harness 도입', scenarios: ['consult'],
  },
};
// scenario → area
export const SCENARIO_AREA = { web: 'web', app: 'erp', consult: 'ax' };
// Retired service slugs → new ones (for /services/<old>/ redirects)
export const SVC_SLUG_REDIRECT = { web: 'web-app', app: 'erp', agent: 'ax', consult: 'ax' };
// A request for a plain homepage is redirected honestly to the 01 demo.
export const HOMEPAGE_NOTE = {
  say: '홈페이지 제작은 따로 제공하지 않습니다. 대신 예약·주문 기능이 있는 웹/앱 서비스를 만듭니다.',
  assume: '홈페이지 대신 예약·주문 기능이 있는 서비스로 보여 드립니다',
};

// Stage names (COPY-STYLE.md): English everywhere, in this order.
export const PROCEDURE = [
  { k: 'spec', label: 'Spec' },
  { k: 'gate', label: 'Human approval' },
  { k: 'build', label: 'Build' },
  { k: 'test', label: 'Test' },
  { k: 'review', label: 'Review' },
  { k: 'ship', label: 'Delivery' },
];

// Tools, public on GitHub (not "all open source": three have no LICENSE yet). Only the five sea-creature
// tools carry a Korean name (their literal meaning). Podway, Agent Dispatch, Agent Turn Network and Aquarium
// are English-only (founder decision); they show their English tag instead. `license: null` means no LICENSE
// file was found; do not print "MIT" for those.
// Aquarium comes in two editions shown side by side, Codex and Claude Code (founder, 2026-10-08: Aquarium for
// Claude as prominent as Aquarium): `host` names the edition on the tool list's second line, in place of the tag.
// `install`, when nothing else fills the card's last line, shows how to install it.
export const TOOLS = {
  aquarium: {
    name: 'Aquarium', ko: '', tag: 'AI Harness', host: 'Codex', ver: '0.1.18', lang: 'Codex plugin', license: 'MIT', repo: 'aquarium',
    role: '여러 Tool을 한 작업 흐름으로 묶는 AI Harness입니다. 계획을 승인하기 전에는 아무것도 바꾸지 않습니다.',
    quote: 'Software engineering with AI Fleets, not vibe coding.',
  },
  'aquarium-for-claude': {
    name: 'Aquarium for Claude', ko: '', tag: 'AI Harness', host: 'Claude Code', ver: '0.1.17', lang: 'Claude Code plugin', license: 'MIT', repo: 'aquarium-for-claude',
    role: 'Aquarium을 Claude Code 플러그인으로 만든 판입니다. 모든 작업의 상태를 기록하고, 완료하려면 검증된 증거가 있어야 하며, 중요한 실행은 사람의 승인을 기다립니다.',
    install: 'claude plugin marketplace add irootkernel/aquarium-for-claude\nclaude plugin install aquarium@aquarium-for-claude',
  },
  podway: {
    name: 'Podway', ko: '', tag: 'Procedure control', ver: '0.2.11', lang: 'Rust', license: 'MIT', repo: 'podway',
    role: 'Gate와 rework 경로가 있는 FSM 절차로 작업 상태를 기록합니다. 검사는 직접 실행하지 않습니다.',
    limit: 'You do the work',
  },
  gaori: {
    name: 'Gaori', ko: '가오리', tag: 'Test evidence', ver: '0.1.17', lang: 'Go', license: null, repo: 'gaori',
    role: 'Test 명령을 실행하고 원본 로그를 남긴 뒤 실패 증거를 돌려줍니다. 통과 여부는 exit code가 정합니다.',
    limit: 'not a test gate',
    install: 'go install github.com/irootkernel/gaori@v0.1.17',
  },
  mulgae: {
    name: 'Mulgae', ko: '물개', tag: 'Multi-model review', ver: '0.1.23', lang: 'Go', license: 'MIT', repo: 'mulgae',
    role: '여러 AI 모델에 Code review를 맡깁니다. 결과는 권고일 뿐 승인 권한이 없습니다.',
    limit: 'advisory',
    roles: ['testing', 'logic', 'maintainability', 'documentation', 'product', 'security'],
  },
  sanho: {
    name: 'Sanho', ko: '산호', tag: 'Doc sync', ver: '0.2.8', lang: 'Go', license: null, repo: 'sanho',
    role: '여러 저장소의 문서를 하나의 표준 문서 저장소와 동기화합니다.',
  },
  sorage: {
    name: 'Sorage', ko: '소라게', tag: 'Cross-session review', ver: '0.1.1', lang: 'TypeScript', license: 'MIT', repo: 'sorage',
    role: 'AI 코딩 세션 사이에서 문서와 Review 의견을 넘기는 local broker입니다.',
  },
  dolgorae: {
    name: 'Dolgorae', ko: '돌고래', tag: 'Codex run control', ver: '0.1.2', lang: 'Rust', license: null, repo: 'dolgorae',
    role: '장시간 실행되는 Codex 작업에 신원, 권한, 복구, 감사 기록을 붙이는 제어 계층입니다.',
  },
  dispatch: {
    name: 'Agent Dispatch', ko: '', branch: 'AI Agent', tag: 'File → work', ver: '0.1.8', lang: 'Go', license: 'MIT', repo: 'agent-dispatch',
    role: '문서 저장소의 변경을 Deterministic한 계획과 receipt로 바꿔 AI Agent 작업으로 보냅니다.',
  },
  atn: {
    name: 'Agent Turn Network', ko: '', branch: 'AI Agent', tag: 'Agent deliberation', ver: '', lang: 'Go · Python', license: null, repo: 'agent-turn-network-control',
    role: '여러 AI Agent의 논의 진행 상태와 기록을 관리합니다.',
  },
};
export const TOOL_ORDER = ['aquarium', 'aquarium-for-claude', 'podway', 'gaori', 'mulgae', 'sanho', 'sorage', 'dolgorae', 'dispatch', 'atn'];
// Display helpers: "Gaori · 가오리", "Podway · Procedure control". Never produces "undefined".
export const toolSub = (id) => TOOLS[id].ko || TOOLS[id].tag;
export const toolLabel = (id) => [TOOLS[id].name, toolSub(id)].filter(Boolean).join(' · ');

// Real public release validation lines (runtime-log style). Use only these four.
// main.js splits each at ' — ' (name + version in bold, the result after it).
export const RELEASES = [
  { tool: 'podway', text: 'Podway 0.2.11 — release qa · 21/21 passed' },
  { tool: 'aquarium', text: 'Aquarium 0.1.17 — scenarios · 46 passed' },
  { tool: 'gaori', text: 'Gaori 0.1.17 — 1 fix · re-run passed' },
  { tool: 'dispatch', text: 'Agent Dispatch 0.1.8 — release build ×2 · byte-identical' },
];

// Products live above the surface (land / sky); Ember Quest is off-axis (founder-approved copy, 2026-09-29).
// tag: mono tech tag · badge: small pill after the tag · line: the lead · note: one sentence (home layer)
// · desc: the fuller description (/products/ panel) · status: chip.
export const PRODUCTS = [
  {
    id: 'sudal', name: 'Sudal', ko: '수달', place: 'land', tag: 'B2C · runs on AI-SPARK session runtime',
    line: '대화가 시작되는 실시간 밸런스 게임',
    note: 'QR 코드나 초대 링크로 각자의 기기에서 참여하고, 연결이 잠시 끊겨도 다시 들어와 게임을 이어갑니다.',
    desc: '친구, 연인, 동료와 함께 질문에 답하며 이야기할 거리를 찾습니다. QR 코드나 초대 링크로 각자의 기기에서 참여하고, 모두가 답을 고르면 결과를 함께 확인합니다. 연결이 잠시 끊겨도 다시 참여해 게임을 이어갑니다. 실시간 세션은 AI-SPARK session runtime 위에서 움직입니다. 클라이언트는 이벤트만 보내고, 상태 전이는 runtime이 판단합니다.',
    status: 'In development',
  },
  {
    id: 'doksuri', name: 'Doksuri', ko: '독수리', place: 'sky', tag: 'B2B · Markdown-native · two-way sync',
    line: '사람과 AI가 함께 일하는 Project 관리 도구',
    note: 'AI는 Markdown 파일의 문맥을 읽고 고치며, 서버와 맞춰야 하는 작업은 CLI로 처리합니다. 중요한 변경은 사람이 승인합니다.',
    desc: '소수의 사람과 다수의 AI가 협업하기 위한 도구입니다. 업무와 문서는 Markdown 파일로 관리하며 로컬 파일과 서버 상태를 양방향으로 동기화합니다. AI는 Markdown 파일의 문맥을 읽고 고치며, 검색·댓글·상태 확인처럼 서버와 맞춰야 하는 작업은 CLI로 처리합니다. AI마다 권한을 구분하고, 중요한 변경은 사람이 확인하고 승인합니다.',
    status: 'In development',
  },
  {
    id: 'ember-quest', name: 'Ember Quest', ko: '', place: 'off-axis', tag: 'Game · Deterministic core', badge: '2026 AX 지원사업 선정',
    line: '불씨로 길을 여는 물리 퍼즐 RPG',
    note: '30Hz 고정 tick의 Deterministic core 위에서 움직여, 같은 명령을 넣으면 기기가 달라도 같은 결과가 나옵니다.',
    desc: '불씨를 쏘아 어두운 미로를 밝히는 세로형 픽셀 아트 퍼즐 RPG입니다. 30Hz 고정 tick의 Deterministic core 위에서 움직여, 같은 스테이지에 같은 명령을 넣으면 기기와 시점이 달라도 같은 결과가 나옵니다. 리플레이는 다시 실행할 수 있는 기록이 됩니다.',
    status: 'In development',
  },
];
// The products heading (two lines on the home layer, one on /products/) and its lede.
export const PRODUCTS_HEAD = {
  lines: ['Three products.', 'One shared root.'],
  lede: '제품에서 발견한 문제로 기술을 발전시키고, 개선한 기술을 다시 제품에 적용합니다.',
};

export const SPEAKER = {
  me: '나',
  example: '예시',
  ai: '루트커널 AI',
  podway: 'podway',
  aquarium: 'aquarium',
  gaori: 'gaori',
  mulgae: 'mulgae',
};

export const COPY = {
  // the AI's question on the first screen and at the end of the page (founder, 2026-09-29: polite, service-oriented)
  ask: '어떤 지원이 필요하신가요?',
  // first-screen chips: title = SVC[area].area, second line = SVC[area].scope (founder, 2026-09-29: general, not the demo's example)
  pickOther: '다른 문의가 있으신가요?',
  // interaction rule (founder decision 2026-09-28): no typing on the site; mail drafts are the only place to write
  mailHint: '자세한 내용은 열리는 메일에 적어 주세요.',
  // /company/: heading and the company line (founder, 2026-09-29: never emphasize or reveal a one-person company)
  companyHook: 'From the kernel up.',
  companyLine: '루트커널은 AI의 작업을 제어하는 기술을 연구하고, 그 기술로 고객의 SW와 자체 제품을 개발합니다. 2026년 6월 서울에서 설립했습니다.',
  // the −200 m H2 (English display hook). The founder may swap it: change it here only.
  svcHook: 'From intent to execution.',
  // /contact/: heading and the line under it
  contactHook: "Let's build it under control.",
  contactLine: 'AI Harness·AI Agent 도입, 외주 개발, 기술 협업 문의를 받습니다. 도움이 필요한 Project나 함께 풀고 싶은 기술 과제가 있다면 연락해 주세요.',
  demoChip: '시연',
  demoNote: '실제 작업 절차를 줄여서 보여 드리는 시연입니다. 견적과 일정은 문의를 확인한 후 답장드립니다.',
  gateQ: '이 Spec으로 진행할까요?',
  // says "Spec r1"; for a later revision use gateSubAt(rev) below
  gateSub: '승인하면 Spec r1이 확정되고, Build·Test·Review는 모두 이 revision을 기준으로 진행합니다. Spec을 고치면 revision이 바뀌고, 기존 승인은 무효가 됩니다.',
  gateWait: '승인 전에는 아무것도 실행하지 않습니다.',
  ffTip: 'AI와 Tool이 진행하는 단계만 빠르게 봅니다. 승인은 건너뛸 수 없습니다.',
  handoffAck: '이 요청은 정해진 서비스 범위에 해당하지 않습니다. 추측해서 만들지 않고, 요청하신 내용을 그대로 문의 메일에 담습니다.',
  // scenarios/handoff.js splits this after the "?": question, then the gate's sub line
  handoffGate: '이 내용으로 문의를 보낼까요? 메일 앱에서 직접 보내기 전에는 아무것도 전송되지 않습니다.',

  // rail controls and answers outside the build
  restart: '처음부터',
  skip: '결과로',
  skipTip: '승인한 뒤에만 쓸 수 있습니다. 남은 기록을 바로 채우고 Delivery 단계로 넘어갑니다.',
  demoAnswer: '이 화면의 Build는 실제 절차를 줄여서 보여 드리는 시연입니다. 실제 Project는 대표와 Spec을 확정한 뒤 같은 절차로 진행합니다.',
  priceAnswer: '비용은 범위를 정한 뒤 견적으로 드립니다.',
  // /services/<slug>/ pages, keyed by area (SVC_KEYS): what we make, the demo example(s), what is delivered
  svcPage: {
    web: {
      make: '고객이 매일 쓰는 서비스를 만듭니다. 모바일 화면부터 설계하고, 로그인·알림·지도 같은 외부 연동도 함께 구현합니다.',
      scope: 'Web · Mobile App · Admin · API · 외부 서비스 연동',
      deliver: '승인한 Spec · 동작하는 서비스 · Test 기록 · Review 반영 목록 · 소스 코드',
    },
    erp: {
      make: '회사마다 다른 결재선과 권한, 이미 쌓인 데이터를 반영해 설계합니다. 신청하는 사람과 승인하는 사람의 화면과 권한을 나눠 구현합니다.',
      scope: '인사·근태 · 전자결재 · 재고·구매 · 회계 연동 · Cloud·DB 인프라',
      deliver: '승인한 Spec · 동작하는 시스템 · Test 기록 · Review 반영 목록 · 운영 안내',
      basis: '대표는 SAP Labs Korea에서 SAP HANA 코어와 클라우드 DB 인프라를 개발했습니다. 현재 국내 금융권 기업뱅킹 고도화 Project에 참여하고 있습니다(2026.08–12).',
    },
    ax: {
      make: 'AI Agent는 정해진 범위 안에서만 일하고, 모르는 질문은 추측하지 않고 사람에게 넘깁니다. 개발팀에는 Spec·Test·Review·승인 절차를 갖춘 AI Harness를 도입하고, 실제 작업 한 건으로 교육합니다.',
      scope: 'AI Agent 개발 · AI Harness 도입 · 팀 교육',
      deliver: '승인한 Spec · 답변 범위 문서 또는 진단서 · Test 기록 · 교육 자료 · 절차 문서',
    },
  },
  opsNote: '세 가지 모두 만든 뒤 운영·유지보수까지 함께합니다.',
};
// COPY.gateSub for the revision the gate is asking about (the approved line names r1). The particle follows
// the English reading of r1…r9 (원 → 이, 투 → 가, 쓰리 → 가 … 세븐 → 이): "Spec r1이", "Spec r2가".
const REV_JOSA = '이가가가가가이이이';
export const gateSubAt = (rev = 1) => { const n = rev || 1; return COPY.gateSub.replace('Spec r1이', `Spec r${n}${REV_JOSA[n - 1] || '이'}`); };

// The ~1-minute demos (journey/, studio/, scenarios/) run on the Korean pages only. content.en.js says false: the
// English edition has no demo, no /build/ route and no demo wording (founder, 2026-10-08; DECISIONS 4-21).
export const DEMOS = true;

// Route descriptions that the tables above don't already say (router.js pagesFor).
export const META = {
  services: '루트커널은 다음의 서비스를 제공합니다',   // + ": " + the three service names + ". " + COPY.opsNote
  build: '서비스를 고르시면 Spec부터 시안까지 약 1분짜리 시연으로 보여 드립니다.',
  openSource: '루트커널이 직접 만들어 쓰는 도구입니다. 모두 GitHub에 공개했습니다. AI Harness는 Aquarium(Codex·Claude Code)을 중심으로 Test·Code review·작업 절차를 맡고, AI Agent는 Agent를 실행하고 심의하고 전달합니다.',
  kernel: '모든 일을 AI에게 맡기지 않습니다. Deterministic한 작업은 CLI·MCP Tool로 실행하고, 판단과 생성이 필요한 Non-deterministic한 작업만 AI/LLM에게 맡깁니다.',   // + " " + AI_SPARK + "."
  products: 'Sudal · Doksuri · Ember Quest. 루트커널이 직접 만드는 제품입니다. 모두 개발 중입니다.',
  contactTitle: '문의',
  contact: `${MAIL}로 보내 주시면 확인 후 답장드립니다.`,
};

// Interface strings of the route panels, the tool card and the scenes (journey/pages.js, world/labels.js,
// strengths/scene.js). The demos keep their own (SPEAKER, COPY above).
export const UI = {
  close: '닫기',
  ai: '루트커널 AI',
  other: '기타',                                       // the fourth topic on /contact/ (and in its mail draft)
  whens: ['가능한 한 빨리', '1–3개월', '3개월 이후', '아직 모름'],
  copied: (mail) => `메일 주소를 복사했습니다: ${mail}`,
  copyFailed: (mail) => `복사하지 못했습니다. ${mail}로 보내 주세요.`,
  consult: '상담 신청하기',
  quoteNote: '비용과 기간은 Spec을 확정한 뒤 견적으로 드립니다.',
  contactPage: '문의 페이지 →',
  toContact: '문의하기',
  toOpenSource: 'Open source 보기',
  contactAi: '두 가지를 고르면 메일 앱에 초안이 열립니다. 메일 앱에서 보내기 전에는 아무것도 전송되지 않습니다. 보내 주시면 확인 후 답장드립니다.',
  openDraft: '메일 초안 열기',
  noMailApp: '메일 앱이 열리지 않으면',
  copyMail: '메일 주소 복사',
  repoLink: (label) => `${label} · GitHub 저장소 열기`,
  more: (name) => `${name} 자세히 보기`,
};

// Mail drafts (mail.js): the contact page and a service page's 상담 신청하기.
export const MAIL_COPY = {
  subjectOf: (tag) => `[루트커널 ${tag}]`,
  tag: '문의',
  consultTag: '상담',
  greet: '안녕하세요. 루트커널 홈페이지에서 문의드립니다.',
  kind: '문의 종류',
  when: '희망 시기',
  want: '[하고 싶은 일]',
  contact: '[연락처]',
  to: '받는 사람',
  subject: '제목',
  sendTo: '보낼 곳',
};
