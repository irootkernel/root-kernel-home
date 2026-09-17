const ko = {
  "greeting": "안녕하세요! 만나서 반갑습니다. 루트커널입니다.",
  "nodes": {
    "intro": "루트커널",
    "approach": "AI 제어",
    "design": "설계",
    "build": "구현",
    "test": "테스트",
    "architect": "Architect",
    "security": "Security",
    "reliability": "Reliability",
    "review": "리뷰 결과",
    "products": "제품"
  },
  "questions": {
    "hello": "루트커널이 뭐야?",
    "approach": "AI가 일하는 과정을 어떻게 제어해?",
    "todo-design": "좋아. 그럼 예제로 간단한 ToDo list를 만들어줘.",
    "todo-build": "좋아. 이 설계대로 만들어줘.",
    "todo-test": "기본 기능은 잘 동작해?",
    "review-start": "코드도 한번 검토해줘.",
    "review-result": "리뷰 결과는 어때?",
    "todo-fix": "새로고침해도 목록이 남도록 고쳐줘.",
    "todo-retest": "이제 새로고침해도 남아 있어?",
    "rereview-start": "수정한 코드도 다시 검토해줘.",
    "rereview-result": "아까 발견한 문제는 해결됐어?",
    "products": "실제로 만드는 제품도 보여줘."
  },
  "answers": {
    "company": "루트커널은 AI를 제어하는 기술을 만듭니다. AI의 작업 범위와 실행 절차를 정하고, 사람이 정한 규칙과 승인에 따라 일하도록 합니다.",
    "control": "루트커널은 FSM에 기반한 두 가지 기술을 가지고 있습니다. AI-SPARK는 검증하고 승인한 명세에 따라 AI가 코드를 작성하도록 합니다. Podway는 작업 절차와 진행 조건을 관리하고, 문제가 생겼을 때 돌아갈 경로를 정합니다.",
    "design-start": "먼저 할 일의 상태와 전이를 FSM으로 설계하겠습니다. 추가한 할 일은 진행 중에서 완료로, 필요하면 다시 진행 중으로 바꿀 수 있습니다. 삭제한 항목은 목록에서 빠지고, 나머지 항목과 완료 상태는 새로고침해도 유지되도록 정하겠습니다.",
    "build-start": "설계한 상태 전이에 맞춰 입력창과 목록을 만들겠습니다.",
    "build-done": "입력창과 목록을 만들었습니다. 이제 기능을 확인하겠습니다.",
    "test-start": "할 일을 추가하고 완료로 표시한 뒤, 삭제해 봤습니다.",
    "test-pass": "세 가지 기능은 정상적으로 동작합니다.",
    "review-fork": "세 역할에 같은 코드를 맡겼습니다. Architect는 구조와 상태 관리, Security는 입력 처리, Reliability는 저장과 복구를 함께 검토합니다.",
    "architect-first": "구조와 상태 관리는 검토를 통과했습니다.",
    "security-first": "입력한 내용도 안전하게 표시합니다.",
    "reliability-first": "다만 새로고침하면 목록이 사라집니다.",
    "review-join-first": "리뷰는 모두 끝났지만, 목록이 유지되도록 수정이 필요합니다.",
    "return-build": "구현으로 돌아가 저장하는 부분을 보완하겠습니다.",
    "build-fixed": "목록이 바뀔 때 저장하고, 화면을 다시 열면 불러오도록 수정했습니다.",
    "retest-start": "목록을 만든 뒤 새로고침했습니다. 할 일과 완료 표시가 그대로 남아 있습니다.",
    "retest-pass": "추가·완료·삭제도 다시 확인했고, 모두 통과했습니다.",
    "rereview-fork": "세 역할이 수정된 코드를 다시 검토합니다. 저장 기능이 기존 동작에 영향을 주는지도 함께 살펴봅니다.",
    "architect-second": "저장과 화면 갱신이 잘 분리되어 있습니다.",
    "security-second": "저장한 내용도 안전하게 표시합니다.",
    "reliability-second": "새로고침 후 목록이 사라지던 문제도 해결됐습니다.",
    "review-join-second": "세 리뷰가 모두 통과했습니다. 수정 내용과 확인 결과도 함께 남겼습니다.",
    "products": "실시간 밸런스 게임 Sudal, 사람과 AI가 함께 일하는 프로젝트 관리 도구 Doksuri, 물리 퍼즐 RPG Ember Quest를 개발합니다. 직접 만든 도구를 제품 개발에 활용하고, 그 경험을 다시 기술에 반영합니다."
  },
  "evidence": {
    "build-r1": "할 일 입력창·목록·완료·삭제 첫 구현",
    "test-r1": "추가·완료·삭제 통과",
    "architect-evidence-r1": "화면과 상태 관리의 역할 확인",
    "security-evidence-r1": "사용자 입력을 HTML로 실행하지 않고 텍스트로 표시",
    "reliability-evidence-r1": "저장 기능이 없어 새로고침 후 목록 소실",
    "build-r2": "목록 변경 시 저장하고 새로고침 시 복원",
    "test-r2": "추가·완료·삭제 및 새로고침 후 목록·완료 상태 유지 통과",
    "architect-evidence-r2": "저장 기능과 화면 갱신의 역할 확인",
    "security-evidence-r2": "저장된 입력도 텍스트로 표시하는지 확인",
    "reliability-evidence-r2": "이전 지적과 수정된 저장·복원 동작 대조"
  },
  "rollback": {
    "return-build": "새로고침 후에도 목록이 남도록 저장 기능 보완"
  }
};

const en = {
  greeting: 'Hello! It’s good to meet you. We’re Root Kernel.',
  nodes: {intro:'Root Kernel',approach:'AI control',design:'Design',build:'Implement',test:'Test',architect:'Architect',security:'Security',reliability:'Reliability',review:'Review results',products:'Products'},
  questions: {
    hello:'What is Root Kernel?',
    approach:'How do you control the way AI works?',
    'todo-design':'Okay, build a simple to-do list as an example.',
    'todo-build':'Sounds good. Build it from that design.',
    'todo-test':'Do the basic features work?',
    'review-start':'Can you review the code too?',
    'review-result':'What did the reviews find?',
    'todo-fix':'Fix it so the list stays after a refresh.',
    'todo-retest':'Does it keep the list after a refresh now?',
    'rereview-start':'Review the updated code too.',
    'rereview-result':'Is the issue you found earlier resolved?',
    products:'Show me the products you’re building.',
  },
  answers: {
    company:'Root Kernel builds technology that controls AI. We define the scope and steps of its work so it follows rules and approvals set by people.',
    control:'We have two technologies based on finite state machines, or FSMs. AI-SPARK guides AI to write code from validated, approved specifications. Podway manages the workflow, the conditions for moving forward, and where to return when something goes wrong.',
    'design-start':'First, let’s define the task states and transitions with an FSM. A task can move from in progress to complete and back again. Deleted tasks leave the list. The remaining tasks and their completion status should survive a refresh.',
    'build-start':'I’ll build the input field and list around those state transitions.',
    'build-done':'The input field and list are ready. Let’s check the features.',
    'test-start':'I added a task, marked it complete, and deleted it.',
    'test-pass':'All three features work as expected.',
    'review-fork':'Three reviewers have the same code. Architect checks structure and state management, Security checks input handling, and Reliability checks storage and recovery. They review it in parallel.',
    'architect-first':'The structure and state management passed review.',
    'security-first':'User input is displayed safely too.',
    'reliability-first':'But the list disappears when the page is refreshed.',
    'review-join-first':'All reviews are complete. We need to fix the list’s persistence before moving on.',
    'return-build':'I’ll return to implementation and add the missing storage.',
    'build-fixed':'The list now saves when it changes and loads again when the page opens.',
    'retest-start':'I created a list and refreshed the page. The tasks and completion marks are still there.',
    'retest-pass':'I also checked adding, completing, and deleting tasks again. All tests passed.',
    'rereview-fork':'The three reviewers are checking the updated code, including whether storage affects the existing features.',
    'architect-second':'Storage and screen updates are kept separate.',
    'security-second':'Saved content is displayed safely too.',
    'reliability-second':'The list no longer disappears after a refresh.',
    'review-join-second':'All three reviews passed. The changes and verification results have been recorded.',
    products:'We’re building Sudal, a live would-you-rather game; Doksuri, a project management tool for people and AI; and Ember Quest, a physics puzzle RPG. We use our own tools to develop these products and bring what we learn back into the technology.',
  },
  evidence: {
    'build-r1':'First implementation of task input, list, completion, and deletion',
    'test-r1':'Adding, completing, and deleting tasks passed',
    'architect-evidence-r1':'Checked the separation of display and state management',
    'security-evidence-r1':'User input is displayed as text, not executed as HTML',
    'reliability-evidence-r1':'No storage: the list is lost after a refresh',
    'build-r2':'Save the list on changes and restore it after a refresh',
    'test-r2':'Adding, completing, deleting, and preserving tasks and completion status after a refresh passed',
    'architect-evidence-r2':'Checked the separation of storage and screen updates',
    'security-evidence-r2':'Checked that saved input is also displayed as text',
    'reliability-evidence-r2':'Checked the storage and restore fix against the earlier finding',
  },
  rollback: {'return-build':'Add storage so the list remains after a refresh'},
};

export function getHomeCopy(locale = 'ko') {
  if (!['ko','en'].includes(locale)) throw new Error('Unknown home locale: '+locale);
  const copy = locale === 'ko' ? ko : en;
  for (const [group, values] of Object.entries(ko)) {
    if (typeof values === 'string') {
      if (!copy[group]) throw new Error(`Missing home translation: ${locale}.${group}`);
    } else for (const key of Object.keys(values)) {
      if (typeof copy[group]?.[key] !== 'string' || !copy[group][key]) throw new Error(`Missing home translation: ${locale}.${group}.${key}`);
    }
  }
  return copy;
}
