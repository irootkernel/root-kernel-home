window.ROOT_KERNEL_DETAIL = {
  "ko": {
    "pages": {
      "aipsr": [],
     "ai-spark": [
        {
          "key": "spec-bundle",
          "title": "Spec Bundle",
          "subtitle": "Spec Bundle · Revision Identity",
          "status": "patent",
          "summary": "서버의 인터페이스, 상태, 바인딩, 권한 정책과 전역 설정을 하나의 선언형 번들로 묶어 함께 검증하고 원자적으로 승인합니다.",
          "sections": [
            {
              "heading": "번들의 구성",
              "body": "gRPC proto 또는 OpenAPI 인터페이스, state.yaml의 상태 전이, binding.yaml의 처리 방식, auth_policies.yaml의 권한 규칙과 전역 설정을 함께 관리합니다."
            },
            {
              "heading": "하나의 리비전",
              "body": "번들 파일을 정규화하고 파일별 digest를 정렬한 manifest를 해시해 bundle_revision_id를 만듭니다. 구성 파일 하나가 바뀌면 전체 번들의 리비전도 달라집니다."
            },
            {
              "heading": "검증과 승인 단위",
              "body": "서로 참조하는 명세가 같은 리비전으로 묶이므로 불일치를 검사하고, 번들 전체를 하나의 단위로 승인하거나 다시 검토할 수 있습니다."
            },
            {
              "heading": "사람과 AI의 역할",
              "list": ["사람은 서버가 따라야 할 의도와 정책, 승인 기준을 정합니다.", "AI는 명세가 제시하는 목표와 확장 지점을 기준으로 구현에 집중합니다.", "Spec Bundle의 구성 파일이 수정되면 새 bundle_revision_id가 생성되며, 변경된 번들은 다시 검증과 승인을 거칩니다."]
            }
          ],
          "data-placeholder-id": "detail-spark-spec-bundle"
        },
        {
          "key": "validator-gate",
          "title": "Validator · Approval Gate",
          "subtitle": "Deterministic Validation · Exact Approval",
          "status": "patent",
          "summary": "Validator는 명세 정합성을 결정적으로 검사하고, Approval Gate는 검증된 바로 그 리비전과 규칙 조건이 일치하는지 확인합니다.",
          "data-placeholder-id": "detail-7",
          "sections": [
            {
              "heading": "결정적 Validator",
              "body": "같은 명세 번들을 같은 규칙과 profile로 검사하면 항상 같은 ValidationResult를 냅니다. Interface-Binding 완비성, Binding-State 참조, 권한 정책 누락, 구현 Registry와 상태 도달성을 확인합니다."
            },
            {
              "heading": "검증 결과의 식별자",
              "body": "ValidationResult에는 bundle_revision_id, validation_profile, rule_set_version, validator_version, 위반 rule_id와 근거가 함께 남습니다."
            },
            {
              "heading": "Approval Attestation",
              "body": "사람의 승인은 정확한 리비전에 대한 증명으로 기록됩니다. Gate는 리비전, 검증 성공 여부, profile, rule-set과 Validator 버전이 모두 일치하는지 확인합니다."
            },
            {
              "heading": "적용 지점",
              "body": "승인 전제조건은 CI/CD의 빌드·테스트·배포와 서버 기동에 적용할 수 있습니다. 요청 단위 검증은 운영 구성에 따라 선택적으로 적용합니다."
            }
          ]
        },
        {
          "key": "fsm-runtime",
          "title": "FSM Runtime",
          "subtitle": "Binding · FSM Runtime",
          "status": "patent",
          "summary": "Binding은 연산을 Stateful과 Stateless 경로로 분류하고, FSM Runtime은 상태 변경의 정상 경로에서 선언된 전이 규칙을 평가합니다.",
          "sections": [
            {
              "heading": "두 가지 실행 경로",
              "body": "Stateful 연산은 runtime_event를 통해 FSM으로 연결되고, 상태 전이가 없는 연산은 entrypoint_id로 Usecase를 호출합니다. binding.yaml 자체는 설계·검증 명세이며 런타임 입력이 아닙니다."
            },
            {
              "heading": "FSM Runtime의 역할",
              "body": "전이 규칙 평가, 상태 버전 확인과 동시성 제어, 상태 변경 기록, 롤백과 스트림 발행 같은 공통 동작을 Runtime이 담당합니다."
            },
            {
              "heading": "AI가 구현하는 범위",
              "body": "AI는 어떤 event를 발화할지 결정하고 Guard, Action, Usecase처럼 목적이 분명한 확장 지점을 구현합니다. 상태 저장과 전이 엔진을 반복해서 작성하는 부담과 검증 범위를 줄입니다."
            },
            {
              "heading": "하나의 상태 명세",
              "list": ["AI 구현의 목표", "FSM Runtime의 실행 기준", "테스트의 기대값", "ReverseMap이 참조하는 명세 좌표"]
            }
          ]
        },
        {
          "key": "reverse-map",
          "title": "ReverseMap",
          "subtitle": "Test Synthesis · ReverseMap",
          "status": "patent",
          "summary": "거부되어야 하는 시나리오를 명세에서 합성하고, 실패한 테스트 단계와 관련 명세 요소·요청·로그 근거·파일 위치를 연결합니다.",
          "data-placeholder-id": "detail-spark-reverse-map",
          "sections": [
            {
              "heading": "제약 위반 테스트 합성",
              "body": "권한 정책과 상태 모델, 인터페이스 명세에서 허용되지 않아야 하는 요청과 상태 전이를 E2E 시나리오로 만듭니다."
            },
            {
              "heading": "연결되는 근거",
              "body": "실패 시나리오와 단계, rule_id, operation·policy·binding·state event의 spec_element_id, 실제 요청·응답과 로그, 관련 파일 위치를 하나의 리포트로 묶습니다."
            },
            {
              "heading": "RunIdentity",
              "body": "번들 리비전과 검증 profile, rule-set, Validator 버전을 함께 기록해 어떤 검증 기준과 명세 리비전에서 발생한 실패인지 확인할 수 있습니다."
            },
            {
              "heading": "Inverted Mapping",
              "body": "명세 요소의 Key를 기준으로 관련 시나리오 단계를 연결해 중복을 줄이고, 명세가 바뀌었을 때 다시 실행해야 할 테스트의 범위를 파악합니다."
            },
            {
              "heading": "다음 검토",
              "body": "개발자와 AI는 리포트가 가리키는 명세 요소와 실행 근거에서 검토를 시작합니다. 구현을 수정하면 E2E 테스트를 다시 실행하고, Spec Bundle을 수정하면 새 리비전으로 검증과 승인을 거칩니다."
            }
          ]
        }
      ],
      "ai-harness": [
        {
          "key": "doksuri",
          "title": "Doksuri",
          "subtitle": "Markdown-first PMS · Human-AI Collaboration",
          "status": "operating_dev",
          "summary": "소규모 팀의 Epic·Task·Bug·Doc을 Markdown으로 관리하고, 사람과 AI Agent가 같은 item·comment·review 맥락에서 협업하는 PMS입니다.",
          "data-placeholder-id": "detail-5",
          "sections": [
            {"heading": "업무 입력", "body": "요구사항과 작업 지시는 Markdown item으로, Agent 결과는 댓글과 작업 결과로, 중요한 변경은 검토 가능한 proposal로 입력됩니다."},
            {"heading": "검증과 동기화", "body": "로컬 daemon이 workspace 변경을 schema와 version 기준으로 검증하고 중앙 서버와 동기화합니다. 현재 쓰기와 동기화에는 활성 서버 연결과 인증이 필요합니다."},
            {"heading": "사람의 결정", "body": "AI는 기본적으로 읽기·댓글 범위에서 작업합니다. 본문·메타데이터·상태·담당자 변경과 item 생성은 proposal로 제출하며, 사람이 검토한 뒤 적용 여부를 결정합니다."},
            {"heading": "남는 결과", "body": "동기화된 Markdown workspace와 서버가 관리하는 comment·review state, proposal 적용 결과와 결정 기록이 함께 남습니다."}
          ]
        },
        {
          "key": "dolgorae",
          "title": "Dolgorae",
          "subtitle": "Local-first development control plane",
          "status": "direction",
          "summary": "Mission·Task·Workflow의 상태와 정책, 실행 근거, 복구 지점, 승인 이력을 실행 엔진과 분리해 관리하도록 설계하는 로컬 제어 계층입니다.",
          "sections": [
            {"heading": "설계 역할", "body": "실행 엔진과 분리된 control plane에서 작업의 현재 상태와 전달 계약, 정책과 승인 경계를 복구 가능한 형태로 유지합니다."},
            {"heading": "입력과 출력", "list": ["입력: Mission과 Task 정의, Workflow, 정책, 실행 근거", "출력: 현재 상태, 다음 허용 동작, 전달 결과, 승인과 복구 지점"]},
            {"heading": "실행 경계", "body": "Dolgorae는 상태와 정책을 관리하고 실제 코드 작성·빌드·테스트·Git 동작은 연결된 실행 도구가 수행하는 구조를 지향합니다."},
            {"heading": "현재 상태", "body": "현재 canonical 구현은 CLI와 daemon의 기반 계약을 구축하는 단계이며, 공개 제품 동작은 help·version·config check 범위에서 시작합니다."}
          ]
        },
        {
          "key": "podway",
          "title": "Podway",
          "subtitle": "Procedure guard for one worktree",
          "status": "operating",
          "summary": "Goal과 FSM을 함께 유지해 AI가 긴 작업에서도 목적과 현재 단계를 잃지 않고, 세션이 바뀐 뒤에도 같은 과정에서 이어가도록 돕는 로컬 도구입니다.",
          "data-placeholder-id": "detail-harness-podway-goal-fsm",
          "sections": [
            {"heading": "절차의 현재 상태", "body": "현재 단계, 누락된 필수 항목, 허용 동작과 다음 명령을 사람이 읽는 형식과 버전된 JSON으로 제공합니다."},
            {"heading": "복구와 동시성", "body": "retry·return·block·reopen으로 재작업을 기록하고, precondition과 idempotency key로 재시도하거나 겹친 호출의 상태 손상을 막습니다."},
            {"heading": "Agent 계약", "body": "Agent는 대화 기억이 아니라 worktree의 authoritative status와 next 응답에서 다음 행동을 다시 계산합니다."},
            {"heading": "작동 범위", "body": "절차 상태를 관리하며 실제 빌드 명령과 Git 변경, 원격 서비스 호출은 기존 실행 도구에서 수행합니다. 현재 공개 릴리스 대상은 Apple Silicon macOS입니다."},
            {"heading": "공개 저장소", "link": "https://github.com/irootkernel/podway", "linkLabel": "GitHub에서 보기"}
          ]
        },
        {
          "key": "sanho",
          "title": "Sanho",
          "subtitle": "Canonical docs sync",
          "status": "operating",
          "summary": "하나의 프로젝트를 여러 저장소로 나눠 작업할 때 각 저장소의 문서를 같은 프로젝트 지식에 맞춰, 팀과 Agent가 동일한 기준을 보도록 돕는 동기화 기술입니다.",
          "data-placeholder-id": "detail-harness-sanho-project-docs",
          "sections": [
            {"heading": "두 시점의 계약", "body": "git commit에서는 로컬 상태만 읽어 기준 문서와의 drift를 한 줄로 알리고 차단하지 않습니다. git push에서는 docs 변경을 기준 저장소에 게시합니다."},
            {"heading": "충돌과 복구", "body": "sanho sync는 일반 Git conflict marker를 작업 공간에 남기며, 사용자가 편집·add·commit한 뒤 --continue로 완료하거나 --abort로 되돌립니다."},
            {"heading": "신뢰 경계", "body": "Sanho는 애플리케이션 저장소의 commit을 작성하거나 ref를 이동하지 않습니다. 문서 내용의 검토는 기존 Git 리뷰 절차와 연결합니다."},
            {"heading": "공개 저장소", "link": "https://github.com/irootkernel/sanho", "linkLabel": "GitHub에서 보기"}
          ]
        },
        {
          "key": "mulgae",
          "title": "Mulgae",
          "subtitle": "Multi-provider AI code review",
          "status": "operating",
          "summary": "여러 AI가 Security·Logic·Maintainability 역할을 나눠 같은 코드 변경을 서로 다른 관점에서 살펴보고, 결과와 근거를 하나의 리뷰로 모으는 도구입니다.",
          "data-placeholder-id": "detail-harness-mulgae-role-review",
          "sections": [
            {"heading": "고정된 검토 대상", "body": "workspace·stage·dirty·revision diff·patch·stdin 중 정확히 하나를 캡처해 각 역할이 같은 변경을 검토하게 합니다."},
            {"heading": "역할별 실행", "body": "각 역할은 설정된 provider 하나에서 독립적으로 실행됩니다. 한 역할이 실패해도 다른 검토는 이어지고 실패 이유와 재실행 명령이 보고됩니다."},
            {"heading": "지속 가능한 근거", "body": "자유 형식 역할 보고서와 선택적 구조화 finding·evidence, provider identity를 .mulgae/에 보존합니다."},
            {"heading": "사람의 결정", "body": "Mulgae의 검토는 advisory evidence입니다. 병합·release·waiver와 조직의 승인은 개발팀이 결정합니다."},
            {"heading": "공개 저장소", "link": "https://github.com/irootkernel/mulgae", "linkLabel": "GitHub에서 보기"}
          ]
        },
        {
          "key": "gaori",
          "title": "Gaori",
          "subtitle": "Test evidence compression",
          "status": "operating",
          "summary": "긴 테스트 명령의 원본 출력을 보존하면서 실패 지점과 핵심 문맥을 사람과 Agent가 검토하기 좋은 작은 근거로 압축하는 로컬 adapter입니다.",
          "data-placeholder-id": "detail-harness-gaori-evidence",
          "sections": [
            {"heading": "실행과 압축", "body": "설정된 테스트나 ad-hoc 명령을 실행하고 parser와 로컬 extraction rule로 실패 중심 Markdown·JSON summary를 만듭니다."},
            {"heading": "원본과 민감 정보", "body": "요약에는 redaction을 적용할 수 있지만 raw log는 원문 그대로 로컬에 보존하므로 필요할 때만 제한적으로 열어봅니다."},
            {"heading": "두 개의 상태", "body": "명령의 exit code와 artifact status가 테스트 결과를 나타내고, extractor_status는 근거 압축의 품질만 설명합니다."},
            {"heading": "작동 범위", "body": "Gaori는 테스트 결과를 바꾸거나 acceptance를 결정하지 않습니다. 원본 로그와 작은 실패 근거를 제공해 다음 검토를 돕습니다."},
            {"heading": "공개 저장소", "link": "https://github.com/irootkernel/gaori", "linkLabel": "GitHub에서 보기"}
          ]
        }
      ],
     "ai-agent": [
        {
          "key": "hermes-agent",
          "title": "Hermes Agent",
          "subtitle": "Root Kernel–tuned agent runtime",
          "status": "operating",
          "summary": "NousResearch Hermes Agent의 검증된 오픈소스 릴리스를 기반으로, 다중 프로필·다중 Agent 환경에 필요한 보완을 선별해 관리하는 Root Kernel 운영 환경입니다.",
          "sections": [
            {
              "heading": "Upstream foundation",
              "body": "Agent loop와 도구, skill·memory, subagent, scheduler와 messaging gateway 등 Hermes Agent의 기반 기능은 NousResearch의 오픈소스 프로젝트에서 옵니다."
            },
            {
              "heading": "검증된 운영 보완",
              "body": "Root Kernel은 CJK 세션 복구, fail-closed skill write 승인, 프로필별 Codex credential pinning, Discord thread ownership과 같은 운영 보완을 선별해 유지합니다."
            },
            {
              "heading": "Multi-agent workflow",
              "body": "같은 Kanban card에서 구현·review·변경 요청·최종 수락을 이어가고, mutex key와 workflow type으로 동시 claim과 작업 규칙을 제어합니다."
            },
            {
              "heading": "운영 변경 관리",
              "body": "각 보완은 이유와 검증 결과, 복구 경로와 종료 기준을 기록하며 upstream이 같은 해결을 제공하면 제거합니다."
            },
            {
              "heading": "공개 저장소",
              "link": "https://github.com/irootkernel/hermes-agent",
              "linkLabel": "GitHub에서 보기"
            }
          ]
        },
        {
          "key": "atn",
          "title": "ATN",
          "subtitle": "Agent Turn Network",
          "status": "improving",
          "summary": "Hermes Agent가 참여하는 위임과 협의의 턴·이벤트·상태를 로컬에 영속적으로 기록하고, 검토할 수 있는 대화록과 요약 자료로 연결합니다.",
          "data-placeholder-id": "detail-6",
          "sections": [
            {
              "heading": "Plugin boundary",
              "body": "atn-plugin은 Hermes-facing 도구와 Moderator·Participant skill, 명시적인 daemon client를 제공합니다. 요청 payload를 검증하고 구조화된 command envelope를 control에 전달합니다."
            },
            {
              "heading": "Control authority",
              "body": "atn-control daemon과 CLI가 registry, channel.jsonl event source of truth, SQLite projection, 상태 전이, replay·ack·recovery와 transcript·export를 소유합니다."
            },
            {
              "heading": "Council and delegation",
              "body": "Moderator가 참여자와 턴을 조율하는 council, 작업을 맡기고 결과를 review하는 delegation을 event와 state transition으로 기록합니다."
            },
            {
              "heading": "검토와 결정",
              "body": "Transcript와 export bundle에는 세션 이력과 brief, event log와 registry snapshot이 함께 남습니다. 사람은 이 기록을 검토해 방향과 다음 실행을 결정합니다."
            },
            {
              "heading": "공개 저장소",
              "link": "https://github.com/irootkernel/agent-turn-network-plugin",
              "linkLabel": "GitHub에서 보기"
            }
          ]
        }
      ],
      "agent-technologies": [],
      "hermes-supports": [
        {
          "key": "kao",
          "title": "KAO",
          "subtitle": "Kkachi Agent Organization",
          "status": "operating",
          "summary": "Hermes를 기반으로 여러 Kkachi Agent를 프로젝트와 역할별로 나누어 운영하는 Agent Operating Model입니다.",
          "data-placeholder-id": "detail-8",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "KAO, Kkachi Agent Organization은 Root Kernel이 Hermes를 기반으로 운영하는 AI Agent 조직 모델입니다."
            },
            {
              "heading": "운영 구조",
              "body": "KAO는 하나의 AI에게 모든 일을 맡기지 않고, Kkachi Agent를 프로젝트별, 역할별로 나누어 운영합니다. 실행, 리뷰, 사용자 관점, 문서 일관성, UX 판단을 각기 다른 역할로 분리해 다룹니다."
            },
            {
              "heading": "대표 역할",
              "body": "색상별 Kkachi Agent가 build, review, user check, docs, UX 등 서로 다른 역할을 맡고, 사람이 정한 목표를 여러 작업 조각으로 나누어 하나의 결과물로 완성합니다."
            },
            {
              "heading": "개발 위임",
              "body": "Blue는 실행을 맡고, Red는 리뷰, Orange는 사용자 관점, Grey는 문서 일관성, Teal은 UX/UI 판단을 검토합니다. 사람은 방향 설정, 검증 기준, 테스트, 최종 승인에 집중합니다."
            }
          ]
        },
        {
          "key": "klm",
          "title": "KLM",
          "subtitle": "Kkachi Letta Memory",
          "status": "improving",
          "summary": "AI Agent가 승인된 지식, 프로젝트 메모리, 임시 검색 결과를 구분해 사용하도록 돕는 memory trust boundary 시스템입니다.",
          "data-placeholder-id": "detail-9",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "KLM, Kkachi Letta Memory는 Hermes Agent가 과거 작업 기억과 승인된 지식, 임시 검색 결과를 구분해 사용하도록 돕는 메모리 관리 체계입니다. AI가 검증되지 않은 정보를 사실처럼 사용하는 위험을 줄이기 위해 설계되었습니다."
            },
            {
              "heading": "신뢰 경계",
              "list": [
                "Approved Knowledge: 사람이 검토했거나 기준 문서로 승인한 지식입니다.",
                "Project Memory: 프로젝트 진행 중 쌓인 작업 맥락입니다.",
                "Retrieval Result: 검색이나 조회로 가져온 임시 정보입니다.",
                "Review Boundary: 임시 정보가 승인된 지식과 섞이기 전에 검토 과정을 거치게 합니다."
              ]
            },
            {
              "heading": "운영 방향",
              "body": "Letta 기반 memory와 LLM Wiki를 활용하면서도, 승인된 지식과 임시 정보를 구분해 운영합니다."
            }
          ]
        },
        {
          "key": "krq",
          "title": "KRQ",
          "subtitle": "Kkachi Research Queue",
          "status": "improving",
          "summary": "Black과 Yellow Kkachi Agent가 자료 조사와 지식 재구성을 맡아 검증된 지식 카드를 만들고, 이를 다른 Agent가 재사용할 수 있도록 관리하는 연구·지식 운영 시스템입니다.",
          "data-placeholder-id": "detail-10",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "KRQ, Kkachi Research Queue는 조사한 자료를 일회성 검색으로 끝내지 않고, 검토 가능한 지식 카드로 정리해 다음 작업에서 다시 사용할 수 있도록 돕는 연구·지식 운영 시스템입니다."
            },
            {
              "heading": "운영 흐름",
              "body": "Research Topic → Verified Notes → Knowledge Card → Human Review → Agent Reuse 순서로 지식을 정리하고 다시 활용합니다."
            },
            {
              "heading": "역할",
              "list": [
                "Black은 프로젝트와 회사 의사결정에 필요한 배경 지식을 정리합니다.",
                "Yellow는 연구 주제의 논리적 배경과 가설 후보를 강화합니다.",
                "사람은 조사 범위와 검증 기준을 조정하고, 재사용 가능한 지식으로 남길지 승인합니다."
              ]
            }
          ]
        }
      ]
    }
  },
  "en": {
    "pages": {
      "ai-spark": [
        {
          "key": "spec-bundle",
          "title": "Spec Bundle",
          "subtitle": "Spec Bundle · Revision Identity",
          "status": "patent",
          "summary": "Packages server interfaces, state, bindings, authorization policies, and global settings into one declarative bundle for joint validation and atomic approval.",
          "data-placeholder-id": "detail-spark-spec-bundle",
          "sections": [
            {"heading": "Bundle composition", "body": "The bundle manages gRPC proto or OpenAPI interfaces, state transitions in state.yaml, handling modes in binding.yaml, authorization rules in auth_policies.yaml, and global settings together."},
            {"heading": "One revision", "body": "AI-SPARK normalizes the bundle files, sorts their digests into a manifest, and hashes it to create bundle_revision_id. Changing any constituent file changes the revision of the entire bundle."},
            {"heading": "Unit of validation and approval", "body": "Because cross-referencing specifications share one revision, the Validator can detect inconsistencies and the entire bundle can be approved or returned for review as a single unit."},
            {"heading": "People and AI", "list": ["People define the server intent, policies, and approval criteria.", "AI focuses implementation on the goals and extension points defined by the specification.", "Changing a Spec Bundle file creates a new bundle_revision_id, and the revised bundle must pass validation and approval again."]}
          ]
        },
        {
          "key": "validator-gate",
          "title": "Validator · Approval Gate",
          "subtitle": "Deterministic Validation · Exact Approval",
          "status": "patent",
          "summary": "The Validator checks specification consistency deterministically. The Approval Gate verifies that the exact validated revision and rule conditions still match.",
          "data-placeholder-id": "detail-7",
          "sections": [
            {"heading": "Deterministic Validator", "body": "The same specification bundle, rules, and profile always produce the same ValidationResult. Checks cover Interface–Binding completeness, Binding–State references, missing authorization policies, the implementation Registry, and state reachability."},
            {"heading": "Validation identity", "body": "ValidationResult records bundle_revision_id, validation_profile, rule_set_version, validator_version, violated rule_id values, and supporting evidence."},
            {"heading": "Approval Attestation", "body": "Human approval is recorded as an attestation for an exact revision. The Gate verifies the revision, successful validation, profile, rule-set version, and Validator version together."},
            {"heading": "Enforcement points", "body": "Approval prerequisites can be enforced during CI/CD build, test, and deployment, as well as server startup. Per-request verification is optional and depends on the operating configuration."}
          ]
        },
        {
          "key": "fsm-runtime",
          "title": "FSM Runtime",
          "subtitle": "Binding · FSM Runtime",
          "status": "patent",
          "summary": "Bindings classify operations into Stateful and Stateless paths. The FSM Runtime evaluates declared transition rules on the canonical state-changing path.",
          "sections": [
            {"heading": "Two execution paths", "body": "Stateful operations connect to the FSM through runtime_event. Operations without state transitions invoke a Usecase through entrypoint_id. binding.yaml is a design and validation specification, not a runtime input."},
            {"heading": "Runtime responsibilities", "body": "The Runtime handles transition-rule evaluation, state-version and concurrency checks, state-change records, rollback, and stream publication."},
            {"heading": "What AI implements", "body": "AI decides which event to emit and implements focused extension points such as Guard, Action, and Usecase. This reduces repeated state-engine code and narrows the surface that needs review."},
            {"heading": "One state specification", "list": ["Implementation target for AI", "Execution standard for the FSM Runtime", "Expected behavior for tests", "Specification coordinates referenced by ReverseMap"]}
          ]
        },
        {
          "key": "reverse-map",
          "title": "ReverseMap",
          "subtitle": "Test Synthesis · ReverseMap",
          "status": "patent",
          "summary": "Synthesizes scenarios that should be rejected, then links failed test steps to relevant specification elements, requests, log evidence, and file locations.",
          "data-placeholder-id": "detail-spark-reverse-map",
          "sections": [
            {"heading": "Constraint-violation test synthesis", "body": "Authorization policies, state models, and interface specifications are used to generate E2E scenarios for requests and transitions that the system must reject."},
            {"heading": "Connected evidence", "body": "A report brings together the failed scenario and step, rule_id, spec_element_id for the operation, policy, binding, or state event, actual requests and responses, logs, and related file locations."},
            {"heading": "RunIdentity", "body": "The bundle revision, validation profile, rule-set version, and Validator version identify the exact specification and validation conditions under which a failure occurred."},
            {"heading": "Inverted Mapping", "body": "Related scenario steps are indexed by each specification element's Key, reducing duplication and identifying which tests must run again after a specification change."},
            {"heading": "Next review", "body": "Developers and AI begin from the specification element and execution evidence named in the report. Implementation changes rerun E2E tests; Spec Bundle changes create a new revision that must pass validation and approval again."}
          ]
        }
      ],
      "ai-harness": [
        {
          "key": "doksuri", "title": "Doksuri", "subtitle": "Markdown-first PMS · Human-AI Collaboration", "status": "operating_dev",
          "summary": "A Markdown-based PMS where small teams manage Epics, Tasks, Bugs, and Docs while people and AI agents work in the same item, comment, and review context.",
          "data-placeholder-id": "detail-5",
          "sections": [
            {"heading": "Work input", "body": "Requirements and instructions enter as Markdown items, agent results as comments and work output, and consequential changes as reviewable proposals."},
            {"heading": "Validation and synchronization", "body": "A local daemon validates workspace changes against schema and version rules before synchronizing them with the central server. Writing and synchronization currently require an active server connection and authentication."},
            {"heading": "Human decision", "body": "AI works within read and comment permissions by default. Changes to content, metadata, state, ownership, or item creation are submitted as proposals for human review and acceptance."},
            {"heading": "Durable result", "body": "The synchronized Markdown workspace remains connected to server-managed comments, review state, proposal outcomes, and decision records."}
          ]
        },
        {
          "key": "dolgorae", "title": "Dolgorae", "subtitle": "Local-first development control plane", "status": "direction",
          "summary": "A local control layer designed to manage Mission, Task, and Workflow state, policies, execution evidence, recovery points, and approval history separately from execution engines.",
          "sections": [
            {"heading": "Design role", "body": "The control plane preserves current work state, handoff contracts, policies, and approval boundaries in recoverable form while remaining separate from execution engines."},
            {"heading": "Input and output", "list": ["Input: Mission and Task definitions, Workflows, policies, and execution evidence", "Output: current state, next allowed action, handoff result, approval, and recovery point"]},
            {"heading": "Execution boundary", "body": "Dolgorae manages state and policy. Connected execution tools perform code edits, builds, tests, and Git operations."},
            {"heading": "Current state", "body": "The canonical implementation is establishing its CLI and daemon contracts. Public product behavior begins with help, version, and configuration checks."}
          ]
        },
        {
          "key": "podway", "title": "Podway", "subtitle": "Procedure guard for one worktree", "status": "operating",
          "summary": "A local tool that keeps Goal and FSM together so an AI retains its purpose and current stage through long work and resumes the same process after a session changes.",
          "data-placeholder-id": "detail-harness-podway-goal-fsm",
          "sections": [
            {"heading": "Current procedure state", "body": "Provides the current stage, missing requirements, allowed actions, and next command in both human-readable output and versioned JSON."},
            {"heading": "Recovery and concurrency", "body": "retry, return, block, and reopen record rework. Preconditions and idempotency Keys protect state from retries and overlapping calls."},
            {"heading": "Agent contract", "body": "An agent recalculates its next action from the worktree's authoritative status and next response, not from conversational memory."},
            {"heading": "Operating boundary", "body": "Podway manages procedural state, while existing execution tools run builds, make Git changes, and call remote services. The current public release targets Apple Silicon macOS."},
            {"heading": "Public repository", "link": "https://github.com/irootkernel/podway", "linkLabel": "View on GitHub"}
          ]
        },
        {
          "key": "sanho", "title": "Sanho", "subtitle": "Canonical docs sync", "status": "operating",
          "summary": "A synchronization technology that keeps documents across multiple repositories aligned with the same project knowledge so teams and agents work from one shared reference.",
          "data-placeholder-id": "detail-harness-sanho-project-docs",
          "sections": [
            {"heading": "Two-point contract", "body": "On git commit, Sanho reads local state and reports canonical-document drift in one line without blocking. On git push, it publishes docs changes to the canonical repository."},
            {"heading": "Conflict and recovery", "body": "sanho sync leaves ordinary Git conflict markers in the workspace. The user edits, adds, and commits before finishing with --continue, or restores the prior state with --abort."},
            {"heading": "Trust boundary", "body": "Sanho does not create commits or move refs in the application repository. Documentation content remains subject to the existing Git review process."},
            {"heading": "Public repository", "link": "https://github.com/irootkernel/sanho", "linkLabel": "View on GitHub"}
          ]
        },
        {
          "key": "mulgae", "title": "Mulgae", "subtitle": "Multi-provider AI code review", "status": "operating",
          "summary": "A tool that assigns Security, Logic, and Maintainability roles to multiple AIs, reviews the same code change from distinct perspectives, and combines their evidence into one review.",
          "data-placeholder-id": "detail-harness-mulgae-role-review",
          "sections": [
            {"heading": "Fixed review target", "body": "Captures exactly one of workspace, stage, dirty, revision diff, patch, or stdin so every role reviews the same change."},
            {"heading": "Role-based execution", "body": "Each role runs independently with one configured provider. If one role fails, other reviews continue while the failure reason and rerun command are recorded."},
            {"heading": "Durable evidence", "body": "Free-form role reports, optional structured findings and evidence, and provider identity are preserved under .mulgae/."},
            {"heading": "Human decision", "body": "Mulgae produces advisory evidence. The development team retains authority over merge, release, waiver, and organizational approval."},
            {"heading": "Public repository", "link": "https://github.com/irootkernel/mulgae", "linkLabel": "View on GitHub"}
          ]
        },
        {
          "key": "gaori", "title": "Gaori", "subtitle": "Test evidence compression", "status": "operating",
          "summary": "A local adapter that preserves the raw output of long test commands while compressing failures and essential context into evidence people and agents can review quickly.",
          "data-placeholder-id": "detail-harness-gaori-evidence",
          "sections": [
            {"heading": "Execution and compression", "body": "Runs configured tests or ad hoc commands, then uses parsers and local extraction rules to create failure-focused Markdown and JSON summaries."},
            {"heading": "Raw output and sensitive data", "body": "Summaries can apply redaction, but raw logs remain unchanged on the local machine and should be opened only when necessary."},
            {"heading": "Two statuses", "body": "The command exit code and artifact status represent the test result. extractor_status describes only the quality of evidence compression."},
            {"heading": "Operating boundary", "body": "Gaori neither changes test outcomes nor decides acceptance. It provides the raw log and focused failure evidence for the next review."},
            {"heading": "Public repository", "link": "https://github.com/irootkernel/gaori", "linkLabel": "View on GitHub"}
          ]
        }
      ],
      "ai-agent": [
        {
          "key": "hermes-agent", "title": "Hermes Agent", "subtitle": "Root Kernel–tuned agent runtime", "status": "operating",
          "summary": "A Root Kernel operating environment based on verified open-source releases of NousResearch Hermes Agent, with selected enhancements for multi-profile and multi-agent operations.",
          "sections": [
            {"heading": "Upstream foundation", "body": "The agent loop, tools, skills, memory, subagents, scheduler, and messaging gateways originate in the NousResearch open-source project."},
            {"heading": "Verified operational enhancements", "body": "Root Kernel selectively maintains CJK session recovery, fail-closed approval for skill writes, per-profile Codex credential pinning, and Discord thread ownership."},
            {"heading": "Multi-agent workflow", "body": "Implementation, review, change requests, and final acceptance continue on the same Kanban card, while mutex Keys and workflow types control concurrent claims and work rules."},
            {"heading": "Operational change management", "body": "Each enhancement records its rationale, validation evidence, recovery path, and retirement criteria, and is removed when upstream provides an equivalent solution."},
            {"heading": "Public repository", "link": "https://github.com/irootkernel/hermes-agent", "linkLabel": "View on GitHub"}
          ]
        },
        {
          "key": "atn", "title": "ATN", "subtitle": "Agent Turn Network", "status": "improving",
          "summary": "Persistently records delegation and council turns, events, and state for Hermes agents, then connects them to reviewable transcripts and briefs.",
          "data-placeholder-id": "detail-6",
          "sections": [
            {"heading": "Plugin boundary", "body": "atn-plugin provides Hermes-facing tools, Moderator and Participant skills, and an explicit daemon client. It validates request payloads and passes structured command envelopes to Control."},
            {"heading": "Control authority", "body": "The atn-control daemon and CLI own the registry, channel.jsonl event source of truth, SQLite projection, state transitions, replay, acknowledgment, recovery, transcripts, and exports."},
            {"heading": "Council and delegation", "body": "Council sessions coordinated by a Moderator and delegated work reviewed on completion are both recorded as events and state transitions."},
            {"heading": "Review and decision", "body": "A transcript and export bundle preserve session history and briefs alongside the event log and registry snapshot. People review this record to determine direction and the next execution."},
            {"heading": "Public repository", "link": "https://github.com/irootkernel/agent-turn-network-plugin", "linkLabel": "View on GitHub"}
          ]
        }
      ],
      "aipsr": [],
      "agent-technologies": [],
      "hermes-supports": [],
    }
  }
};
(function () {
  const rootData = window.ROOT_KERNEL_DETAIL || {};
  const lang = document.body.dataset.lang || 'ko';
  const pageFromBody = document.body.dataset.detailPage || document.body.dataset.page || 'aipsr';
  const data = rootData[lang] || rootData.ko;
  if (!data || !data.pages) return;

    const statusLabels = {
      ko: {
        operating: '운영중',
        prelaunch: '출시 준비중',
        research: '연구·구현중',
        direction: '개발중',
        improving: '운영중',
        operating_dev: '운영중',
        platform: '장기 플랫폼 방향',
        patent: '특허 출원'
      },
      en: {
        operating: 'In operation',
        prelaunch: 'Pre-launch',
        research: 'Research / early implementation',
        direction: 'In development',
        improving: 'In operation · evolving',
        operating_dev: 'In operation · evolving',
        platform: 'Long-term platform direction',
        patent: 'Patent pending'
      }
    };

    const pageMeta = {
      ko: {
        'ai-spark': { title: 'AI-SPARK' },
        'ai-harness': { title: 'AI Harness' },
        'ai-agent': { title: 'AI Agent' },
        'agent-technologies': { title: 'AI Harness' },
        'hermes-supports': { title: 'AI Agent' }
      },
      en: {
        'ai-spark': { title: 'AI-SPARK' },
        'ai-harness': { title: 'AI Harness' },
        'ai-agent': { title: 'AI Agent' },
        aipsr: { title: 'AI-SPARK' },
        'agent-technologies': { title: 'AI Harness' },
        'hermes-supports': { title: 'AI Agent' }
      }
    };
    const uiText = {
      ko: {
        close: '닫기',
        back: '돌아가기',
        explorer: 'Technology Dossier',
        technologies: '기술 상세',
        currentFile: '상세 설명',
        folderAria: '기술 분류 열기 또는 닫기',
        chooseTechnology: '다른 기술 보기',
        previous: '이전 기술',
        next: '다음 기술'
      },
      en: {
        close: 'Close',
        back: 'Back',
        explorer: 'Technology Dossier',
        technologies: 'Technology details',
        currentFile: 'Detailed overview',
        folderAria: 'Open or close technology group',
        chooseTechnology: 'Explore another technology',
        previous: 'Previous technology',
        next: 'Next technology'
      }
    };

  const order = ['ai-spark', 'ai-harness', 'ai-agent'];
  const labels = pageMeta[lang] || pageMeta.ko;
  const text = uiText[lang] || uiText.ko;
  const reusableDetailImages = {
    'detail-1': {
      src: '/assets/images/aipsr-1.png',
      alt: {
        ko: '사용자가 두 시각 스타일 중 하나를 선택하고 선택 결과가 preference signal로 저장되는 Sudal 모바일 제품 화면',
        en: 'Sudal mobile product screen showing a user choosing between two visual styles and saving the selected choice as a preference signal'
      }
    },
    'detail-2': {
      src: '/assets/images/home-4.png',
      alt: {
        ko: '반복 선택과 이미지 취향 신호가 Preference Vector로 압축되고 취향 기반 Persona Artifact와 evidence, confidence 표시로 변환되는 Space Compiler 이미지',
        en: 'Space Compiler image showing repeated choices and visual taste signals compressed into a Preference Vector and transformed into a taste-grounded Persona Artifact with evidence and confidence markers'
      }
    },
    'detail-3': {
      src: '/assets/images/aipsr-3.png',
      alt: {
        ko: '세 개의 디자인 시안이 AI Persona 반응 카드와 연결되고 선호 이유, 거부 이유, 다음 확인 질문이 표시되는 Vision Feedback 초기 탐색 이미지',
        en: 'Vision Feedback early exploration image showing three design options connected to AI Persona reaction cards with preference, rejection, and next-question notes'
      }
    },
    'detail-4': {
      src: '/assets/images/aipsr-4.png',
      alt: {
        ko: '추상 Persona Card들이 하나의 Synthetic Audience로 묶이고 coverage, confidence, limitation 신뢰 표시가 함께 배치된 AI Persona Pool 컨셉 이미지',
        en: 'AI Persona Pool concept image showing abstract persona cards combining into one Synthetic Audience with coverage, confidence, and limitation trust markers'
      }
    },
    'detail-5': {
      src: '/assets/images/detail-5.webp',
      width: 1672,
      height: 941,
      caption: {
        ko: '제품 구조 예시',
        en: 'Product structure example'
      },
      alt: {
        ko: 'Doksuri에서 작업 항목, 프로젝트, Agent 설정, Command Center, Review 흐름이 하나의 협업 도구로 연결되는 제품 이미지',
        en: 'Doksuri product image showing work items, projects, agent settings, Command Center, and review flow connected in one collaboration surface'
      }
    },
    'detail-6': {
      src: '/assets/images/agent-2.webp',
      width: 1672,
      height: 941,
      caption: {
        ko: '토론·결정 흐름 예시',
        en: 'Discussion and decision flow example'
      },
      alt: {
        ko: 'Moderator가 여러 AI Agent의 토론 순서를 배정하고 Challenge, Risk, Final brief 항목이 있는 Decision Brief로 정리하는 Agent Turn Network 이미지',
        en: 'Agent Turn Network image showing a moderator-led multi-agent discussion thread connected by turn-order markers to a Decision Brief with challenge, risk, and final brief rows'
      }
    },
    'detail-7': {
      src: '/assets/images/detail-7.webp',
      width: 1672,
      height: 941,
      caption: {
        ko: '승인 게이트 구조 예시',
        en: 'Approval gate structure example'
      },
      alt: {
        ko: 'AI-SPARK에서 Requirement, Spec Bundle, Validator, Human Approval, Safe Runtime 흐름과 Fail-Closed, Audit Trail이 함께 표시되는 승인 게이트 이미지',
        en: 'AI-SPARK approval-gate image showing Requirement, Spec Bundle, Validator, Human Approval, Safe Runtime, Fail-Closed, and Audit Trail in one governed flow'
      }
    },
    'detail-spark-spec-bundle': {
      src: '/assets/images/detail-spark-spec-bundle.svg?v=3',
      width: 1200,
      height: 900,
      caption: {
        ko: '다섯 명세 모듈을 하나의 리비전으로 묶어 함께 검증하는 구조',
        en: 'Five specification modules bound into one revision and validated together'
      },
      alt: {
        ko: 'Interface, State, Binding, Policy, Config 다섯 명세 모듈이 하나의 Revision으로 묶여 함께 검증되는 구조도',
        en: 'Diagram showing Interface, State, Binding, Policy, and Config modules bound into one revision and validated together'
      }
    },
    'detail-spark-reverse-map': {
      src: '/assets/images/detail-spark-reverse-map.svg?v=2',
      width: 1600,
      height: 900,
      caption: {
        ko: '실패 단계에서 명세와 실행 근거를 거쳐 재실행 범위를 찾는 흐름',
        en: 'Tracing a failed step through specifications and evidence to the rerun scope'
      },
      alt: {
        ko: '실패한 단계가 Rule, Spec, Request, Log, File 근거를 거쳐 재실행 대상으로 연결되는 ReverseMap 구조도',
        en: 'ReverseMap diagram tracing a failed step through rule, specification, request, log, and file evidence to a rerun target'
      }
    },
    'detail-harness-podway-goal-fsm': {
      src: '/assets/images/detail-harness-podway-goal-fsm.svg?v=4',
      width: 1200,
      height: 900,
      caption: {
        ko: 'Goal과 FSM을 함께 유지해 세션이 바뀌어도 목적과 현재 단계에서 이어가는 구조',
        en: 'Keeping Goal and FSM together so work resumes with the same purpose and current stage'
      },
      alt: {
        ko: '고정된 Goal이 FSM의 Orient, Plan, Work, Verify 단계를 안내하고 AI가 세션 변경 후에도 현재 Work 단계로 돌아오는 Podway 개념도',
        en: 'Podway concept diagram showing a fixed Goal guiding Orient, Plan, Work, and Verify FSM states while an AI resumes the current Work state after a session change'
      }
    },
    'detail-harness-sanho-project-docs': {
      src: '/assets/images/detail-harness-sanho-project-docs.svg?v=4',
      width: 1200,
      height: 900,
      caption: {
        ko: '하나의 프로젝트에 속한 여러 저장소의 문서를 같은 프로젝트 지식으로 맞추는 구조',
        en: 'Aligning documents across multiple repositories with the same project knowledge'
      },
      alt: {
        ko: '하나의 Project 안에서 Repo A, Repo B, Repo C의 문서가 중앙 Project Docs와 연결되어 모두 In Sync 상태가 되는 Sanho 개념도',
        en: 'Sanho concept diagram showing documents in Repo A, Repo B, and Repo C connected to central Project Docs and brought into sync within one project'
      }
    },
    'detail-harness-mulgae-role-review': {
      src: '/assets/images/detail-harness-mulgae-role-review.svg?v=4',
      width: 1200,
      height: 900,
      caption: {
        ko: '여러 AI가 역할을 나눠 같은 변경을 살펴보고 하나의 리뷰로 모으는 구조',
        en: 'Multiple AIs reviewing the same change by role and combining their perspectives into one review'
      },
      alt: {
        ko: '같은 코드 변경을 Security, Logic, Maintainability 역할의 AI가 각각 검토하고 결과를 One Review로 모으는 Mulgae 개념도',
        en: 'Mulgae concept diagram showing Security, Logic, and Maintainability AIs reviewing the same code change and combining their findings into one review'
      }
    },
    'detail-harness-gaori-evidence': {
      src: '/assets/images/detail-harness-gaori-evidence.svg?v=4',
      width: 1200,
      height: 900,
      caption: {
        ko: '원본 로그를 보존하며 실패 요약과 두 상태를 분리하는 구조',
        en: 'Preserving raw logs while separating the failure summary and two statuses'
      },
      alt: {
        ko: 'Raw Log가 Parser를 거쳐 Summary로 압축되고 Test Status와 Extractor Status가 별도로 표시되는 Gaori 구조도',
        en: 'Gaori diagram showing a raw log compressed through a parser into a summary with separate test and extractor statuses'
      }
    },
    'detail-8': {
      src: '/assets/images/home-3.png',
      alt: {
        ko: 'Blue, Red, Orange, Grey, Teal 색 포인트를 가진 Kkachi Agent들이 작업 조각을 이어 사람이 정한 Epic과 중앙 deliverable을 완성하는 KAO 오작교 협업 이미지',
        en: 'KAO magpie-bridge image showing role-colored Kkachi Agents connecting work pieces toward a human-defined Epic and central deliverable'
      }
    },
    'detail-9': {
      src: '/assets/images/hermes-2.png',
      alt: {
        ko: 'Kkachi Agent가 Approved Knowledge, Project Memory, Retrieval Result를 분리해 승인된 지식과 임시 검색 결과를 다르게 취급하는 KLM 신뢰 경계 이미지',
        en: 'KLM trust-boundary image showing a Kkachi Agent separating Approved Knowledge, Project Memory, and Retrieval Result so approved knowledge is handled differently from temporary search results'
      }
    },
    'detail-10': {
      src: '/assets/images/detail-10.png',
      alt: {
        ko: 'KRQ에서 조사 자료가 검토 가능한 지식 카드로 정리되고 역할별 Agent 작업에 재사용되는 연구 운영 이미지',
        en: 'KRQ research-operations image showing research material becoming reusable knowledge cards for role-based agent work'
      }
    }
  };
  let shell = null;
  let activePage = pageFromBody;
  let activeKey = null;
  let previousFocus = null;
  let backgroundState = [];
  const folderState = { aipsr: true, 'agent-technologies': true, 'hermes-supports': true };
  const detailParam = 'detail';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function selectorValue(value) {
    return String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function pageItems(page) {
    return Array.isArray(data.pages[page]) ? data.pages[page].filter(Boolean) : [];
  }

  function findEntry(key, preferredPage) {
    if (preferredPage) {
      const found = pageItems(preferredPage).find((item) => item.key === key);
      if (found) return { page: preferredPage, item: found };
    }
    for (const page of order) {
      const found = pageItems(page).find((item) => item.key === key);
      if (found) return { page, item: found };
    }
    for (const page of order) {
      const first = pageItems(page)[0];
      if (first) return { page, item: first };
    }
    return null;
  }

  function allEntries() {
    return order.flatMap((page) => pageItems(page).map((item) => ({ page, item })));
  }

  function updateDetailUrl(key) {
    const url = new URL(window.location.href);
    if (key) url.searchParams.set(detailParam, key);
    else url.searchParams.delete(detailParam);
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }

  function chip(status) {
    const label = (statusLabels[lang] || statusLabels.ko)[status] || status;
    return '<span class="status-chip status-' + escapeHtml(status) + '">' + escapeHtml(label) + '</span>';
  }

  function imageList(item) {
    const placeholderId = item['data-placeholder-id'] || '';
    return placeholderId ? [{ placeholderId }] : [];
  }

  function imageAsset(image) {
    const asset = reusableDetailImages[image.placeholderId];
    if (!asset) return null;
    return {
      src: asset.src,
      alt: (asset.alt && (asset.alt[lang] || asset.alt.ko || asset.alt.en)) || '',
      caption: (asset.caption && (asset.caption[lang] || asset.caption.ko || asset.caption.en)) || '',
      width: Number(asset.width) || 1672,
      height: Number(asset.height) || 941
    };
  }

  function renderImageFigure(image) {
    const asset = imageAsset(image);
    if (!asset) return '';
    return '<figure class="card-asset-figure detail-image-asset" data-placeholder-id="' + escapeHtml(image.placeholderId) + '">' +
      '<img src="' + escapeHtml(asset.src) + '" alt="' + escapeHtml(asset.alt) + '" width="' + escapeHtml(asset.width) + '" height="' + escapeHtml(asset.height) + '" decoding="async" loading="lazy">' +
      (asset.caption ? '<figcaption><span>' + escapeHtml(asset.caption) + '</span></figcaption>' : '') +
      '</figure>';
  }

  function renderSections(item) {
    return (item.sections || []).map((section) => {
      const list = Array.isArray(section.list) ? '<ul>' + section.list.map((li) => '<li>' + escapeHtml(li) + '</li>').join('') + '</ul>' : '';
      const body = section.body ? '<p>' + escapeHtml(section.body) + '</p>' : '';
      const link = section.link ? '<p><a class="text-link" href="' + escapeHtml(section.link) + '" target="_blank" rel="noopener">' + escapeHtml(section.linkLabel || section.link) + '</a></p>' : '';
      return '<section class="doc-block"><h3>' + escapeHtml(section.heading) + '</h3>' + body + list + link + '</section>';
    }).join('');
  }

  function renderMain(page, item) {
    const breadcrumb = (labels[page]?.title || page) + ' / ' + item.title;
    const statusChip = page === 'ai-spark' ? '' : chip(item.status);
    const images = imageList(item);
    const heroFigure = images[0] ? renderImageFigure(images[0]) : '';
    const heroImage = heroFigure ? '<div class="doc-hero-image">' + heroFigure + '</div>' : '';
    const entries = allEntries();
    const index = entries.findIndex((entry) => entry.page === page && entry.item.key === item.key);
    const previous = entries[index - 1];
    const next = entries[index + 1];
    const pagerButton = (entry, label, direction) => entry
      ? '<button type="button" class="doc-pager-button doc-pager-' + direction + '" data-workspace-page="' + escapeHtml(entry.page) + '" data-workspace-key="' + escapeHtml(entry.item.key) + '"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(entry.item.title) + '</strong></button>'
      : '<span></span>';
    return '<article class="workspace-document">' +
      '<div class="file-tab"><span>' + escapeHtml(breadcrumb) + '</span>' + statusChip + '</div>' +
      '<header class="doc-head"><p class="eyebrow">' + escapeHtml(text.currentFile) + '</p><h2>' + escapeHtml(item.title) + '</h2><p class="hero-lead">' + escapeHtml(item.subtitle) + '</p><p>' + escapeHtml(item.summary || '') + '</p></header>' +
      heroImage +
      '<div class="doc-sections">' + renderSections(item) + '</div>' +
      '<nav class="doc-pagination" aria-label="' + escapeHtml(text.technologies) + '">' + pagerButton(previous, text.previous, 'previous') + pagerButton(next, text.next, 'next') + '</nav>' +
      '</article>';
  }

  function removeBrokenDetailImage(event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    const figure = image.closest('.detail-image-asset');
    if (!figure) return;

    const heroWrap = figure.closest('.doc-hero-image');
    figure.remove();
    if (heroWrap && !heroWrap.querySelector('.detail-image-asset')) {
      heroWrap.remove();
    }
  }

  function renderTree() {
    return order.map((page) => {
      const meta = labels[page] || { title: page };
      const open = folderState[page] !== false;
      const items = pageItems(page);
      const children = items.map((item) => {
        const selected = page === activePage && item.key === activeKey;
        return '<button type="button" class="sidebar-item" role="treeitem" aria-selected="' + String(selected) + '" data-workspace-page="' + escapeHtml(page) + '" data-workspace-key="' + escapeHtml(item.key) + '">' +
          '<span class="file-icon" aria-hidden="true">▹</span><span class="sidebar-file-text"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.subtitle) + '</span></span>' +
          '</button>';
      }).join('');
      return '<section class="sidebar-folder' + (open ? ' is-open' : ' is-closed') + '" data-folder="' + escapeHtml(page) + '">' +
        '<button type="button" class="folder-toggle" aria-label="' + escapeHtml(text.folderAria) + '" aria-expanded="' + String(open) + '" data-folder-toggle="' + escapeHtml(page) + '">' +
          '<span class="folder-caret" aria-hidden="true">' + (open ? '▾' : '▸') + '</span><span class="folder-icon" aria-hidden="true">' + '▣' + '</span><span class="folder-name">' + escapeHtml(meta.title) + '</span><span class="folder-count">' + items.length + '</span>' +
        '</button>' +
        '<div class="folder-list" role="group">' + children + '</div>' +
      '</section>';
    }).join('');
  }

  function updateTree() {
    if (!shell) return;
    const nav = shell.querySelector('[data-workspace-nav]');
    if (nav) nav.innerHTML = renderTree();
    const select = shell.querySelector('[data-workspace-select]');
    if (select) select.value = activePage + '|' + activeKey;
  }

  function renderMobileSelect() {
    return allEntries().map((entry) => '<option value="' + escapeHtml(entry.page + '|' + entry.item.key) + '">' + escapeHtml((labels[entry.page]?.title || entry.page) + ' · ' + entry.item.title) + '</option>').join('');
  }

  function setActive(page, key, focusMain) {
    const entry = findEntry(key, page);
    if (!entry || !shell) return;
    activePage = entry.page;
    activeKey = entry.item.key;
    folderState[activePage] = true;

    const title = shell.querySelector('[data-workspace-title]');
    const sub = shell.querySelector('[data-workspace-subtitle]');
    const main = shell.querySelector('[data-workspace-main]');
    const pageLabel = labels[activePage]?.title || activePage;
    if (title) title.textContent = entry.item.title;
    if (sub) sub.textContent = pageLabel + ' · ' + entry.item.subtitle;
    if (main) {
      main.innerHTML = renderMain(activePage, entry.item);
      main.scrollTop = 0;
      if (focusMain) main.focus();
    }
    updateTree();
    updateDetailUrl(activeKey);
  }

  function closeWorkspace(options) {
    if (!shell) return;
    shell.classList.remove('is-open');
    shell.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('detail-lock');
    backgroundState.forEach(({ node, ariaHidden }) => {
      node.inert = false;
      if (ariaHidden == null) node.removeAttribute('aria-hidden');
      else node.setAttribute('aria-hidden', ariaHidden);
    });
    backgroundState = [];
    if (!options || options.updateUrl !== false) updateDetailUrl('');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  function buildShell() {
    const el = document.createElement('div');
    el.className = 'detail-root';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', text.technologies);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="workspace-body">' +
        '<button class="workspace-close" type="button" aria-label="' + escapeHtml(text.close) + '">×</button>' +
        '<aside class="workspace-sidebar" aria-label="' + escapeHtml(text.technologies) + '">' +
          '<div class="sidebar-header"><button class="sidebar-back" type="button" aria-label="' + escapeHtml(text.back) + '">‹</button><div class="sidebar-head-text"><span>' + escapeHtml(text.explorer) + '</span><strong>' + escapeHtml(text.technologies) + '</strong></div></div>' +
          '<label class="workspace-mobile-picker"><span>' + escapeHtml(text.chooseTechnology) + '</span><select data-workspace-select>' + renderMobileSelect() + '</select></label>' +
          '<nav class="sidebar-tree" role="tree" data-workspace-nav></nav>' +
        '</aside>' +
        '<main class="workspace-main" tabindex="-1" data-workspace-main></main>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('error', removeBrokenDetailImage, true);
    el.querySelector('.workspace-close').addEventListener('click', closeWorkspace);
    el.querySelector('.sidebar-back').addEventListener('click', closeWorkspace);
    el.querySelector('[data-workspace-select]').addEventListener('change', (event) => {
      const parts = event.target.value.split('|');
      openWorkspace(parts[0], parts[1]);
    });
    el.addEventListener('click', (event) => {
      const folderButton = event.target.closest('[data-folder-toggle]');
      if (folderButton) {
        const folder = folderButton.getAttribute('data-folder-toggle');
        folderState[folder] = !folderState[folder];
        updateTree();
        const replacement = el.querySelector('[data-folder-toggle="' + selectorValue(folder) + '"]');
        if (replacement) replacement.focus();
        return;
      }
      const itemButton = event.target.closest('[data-workspace-key][data-workspace-page]');
      if (itemButton) {
        setActive(itemButton.getAttribute('data-workspace-page'), itemButton.getAttribute('data-workspace-key'), true);
      }
    });
    document.addEventListener('keydown', (event) => {
      if (!el.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWorkspace();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((node) => !node.disabled && node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    return el;
  }

  function openWorkspace(page, key) {
    const entry = findEntry(key, page);
    if (!entry) return;
    previousFocus = document.activeElement;
    if (!shell) shell = buildShell();
    shell.classList.add('is-open');
    shell.setAttribute('aria-hidden', 'false');
    document.body.classList.add('detail-lock');
    if (!backgroundState.length) {
      backgroundState = Array.from(document.querySelectorAll('body > .site-header, body > main, body > .site-footer, body > .scroll-progress')).map((node) => ({ node, ariaHidden: node.getAttribute('aria-hidden') }));
      backgroundState.forEach(({ node }) => {
        node.inert = true;
        node.setAttribute('aria-hidden', 'true');
      });
    }
    setActive(entry.page, entry.item.key, false);
    if (window.matchMedia('(max-width: 560px)').matches) {
      const main = shell.querySelector('[data-workspace-main]');
      if (main) main.focus();
      return;
    }
    const activeButton = shell.querySelector('[data-workspace-key="' + selectorValue(entry.item.key) + '"][data-workspace-page="' + selectorValue(entry.page) + '"]');
    if (activeButton) activeButton.focus();
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-detail-key]');
    if (!trigger) return;
    event.preventDefault();
    openWorkspace(trigger.getAttribute('data-detail-page') || pageFromBody, trigger.getAttribute('data-detail-key'));
  });
  window.addEventListener('popstate', () => {
    const key = new URL(window.location.href).searchParams.get(detailParam);
    if (!key) {
      closeWorkspace({ updateUrl: false });
      return;
    }
    const entry = findEntry(key);
    if (entry) openWorkspace(entry.page, entry.item.key);
  });
  const initialKey = new URL(window.location.href).searchParams.get(detailParam);
  if (initialKey) {
    const entry = findEntry(initialKey, pageFromBody);
    if (entry) openWorkspace(entry.page, entry.item.key);
  }
})();
