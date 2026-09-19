export const locales = ['ko', 'en'];
export const pages = ['home', 'technology', 'products', 'company', 'contact'];

export function pageHref(page, locale = 'ko') {
  if (!locales.includes(locale) || !pages.includes(page)) throw new Error(`Unknown route: ${locale}/${page}`);
  return `/${locale}/${page === 'home' ? '' : `${page}/`}`;
}

export const preferredLocale = language => String(language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';

export function languageHref(page, locale, readMode = false) {
  return `${pageHref(page, locale === 'ko' ? 'en' : 'ko')}?start=1${readMode ? '&view=transcript' : ''}`;
}

export function readNavigation(search) {
  const params = new URLSearchParams(search);
  return {readMode: params.get('view') === 'transcript', restart: params.get('start') === '1'};
}

export function readStepHash(hash) {
  try { return decodeURIComponent(hash.replace(/^#/, '')).replace(/^step=/, ''); }
  catch { return ''; }
}

const copy = {
  ko: {
    companyDescription:'AI의 작업을 제어하는 기술과 제품을 만드는 루트커널의 이름에 담긴 뜻, 대표의 개발 경험과 연혁을 소개합니다.',
    description:'루트커널은 AI를 제어하는 기술을 만듭니다.', mainNav:'주 메뉴', languageNav:'언어 선택', languageTarget:'영어로 전환',
    skip:'애니메이션 없이 본문 읽기', chat:'누적 대화', content:'대화에 연결된 콘텐츠', flow:'전체 이야기 흐름',
    latest:'최근으로 ↘', previous:'이전 대화', next:'다음 대화', transcript:'텍스트로 읽기', start:'이야기 시작', historical:'이전 대화',
    scrollStart:'SCROLL TO START', scrollExplore:'SCROLL TO EXPLORE',
    current:'현재', complete:'완료', failed:'실패', readStory:'이야기 읽기', readIntro:'대화와 콘텐츠를 순서대로 읽을 수 있습니다.',
    animate:'스크롤 애니메이션 보기 →', contactLink:'개발·도입 문의하기 →',
    homeGraphTitle:'회사 소개에서 작업 예시와 제품까지의 전체 흐름',
    homeGraphDescription:'설계에서 ToDo의 FSM을 정하고 구현과 테스트 뒤 Architect, Security, Reliability가 병렬 리뷰합니다. 문제가 있으면 구현으로 돌아가 수정합니다.',
    rollback:'↶ 구현 보완 후 다시 테스트·리뷰', branchesRunning:'{n}개 리뷰 진행 중', branchesComplete:'필수 {n}개 리뷰 완료',
    announcement:'{node}, 리비전 {revision}, {turn}번째 대화',
    contactTitle:'어떤 일을<br>함께할까요', contactIntro:'앱과 웹 서비스, 사내 업무 도구, AI Agent 구축, 홈페이지 제작을 지원합니다. 필요한 일과 업무 방식을 알려 주세요.',
    company:'루트커널 · Root Kernel<br>대표 정영훈', address:'서울시 구로구 오류로 36-25<br>서울시50플러스 남부캠퍼스 1층 공유오피스 힘나',
  },
  en: {
    companyDescription:'Meet Root Kernel: the story behind our name, our founder’s engineering experience, our history, and our work with clients.',
    description:'Root Kernel builds technology that controls AI.', mainNav:'Main navigation', languageNav:'Language selection', languageTarget:'Switch to Korean',
    skip:'Read without animation', chat:'Conversation history', content:'Content for this conversation', flow:'Story flow',
    latest:'Latest ↘', previous:'Previous conversation', next:'Next conversation', transcript:'Read as text', start:'Story begins', historical:'Earlier conversation',
    scrollStart:'SCROLL TO START', scrollExplore:'SCROLL TO EXPLORE',
    current:'Current', complete:'Complete', failed:'Failed', readStory:'Read the story', readIntro:'Read the conversation and its content in order.',
    animate:'View the scroll animation →', contactLink:'Ask about development or adoption →',
    homeGraphTitle:'The full journey from company introduction to a working example and products',
    homeGraphDescription:'Design the ToDo state machine, implement and test it, then run parallel Architect, Security and Reliability reviews. If a review finds an issue, return to implementation and fix it.',
    rollback:'↶ Fix, then test and review again', branchesRunning:'{n} reviews in progress', branchesComplete:'All {n} required reviews complete',
    announcement:'{node}, revision {revision}, conversation {turn}',
    contactTitle:'What should we work on<br>together', contactIntro:'We support app and web services, internal tools, AI Agent systems, and websites. Tell us the work you need and how you work today.',
    company:'Root Kernel<br>Founder Yeonghun Jeong', address:'36-25 Oryu-ro, Guro-gu, Seoul<br>Himna Shared Office, 1F, Seoul 50 Plus Southern Campus',
  },
};

export function ui(locale, key, values = {}) {
  const value = copy[locale]?.[key];
  if (typeof value !== 'string' || !value) throw new Error(`Missing UI translation: ${locale}.${key}`);
  return value.replace(/\{(\w+)\}/g, (_, name) => {
    if (!(name in values)) throw new Error(`Missing UI value: ${key}.${name}`);
    return String(values[name]);
  });
}

export function validateUi() {
  for (const locale of locales) {
    for (const key of Object.keys(copy.ko)) {
      if (typeof copy[locale][key] !== 'string' || !copy[locale][key]) throw new Error(`Missing UI translation: ${locale}.${key}`);
    }
  }
}
