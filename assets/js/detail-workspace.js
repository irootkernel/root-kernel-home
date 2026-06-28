window.ROOT_KERNEL_DETAIL = {
  "ko": {
    "ui": {
      "close": "닫기",
      "technologies": "기술 영역",
      "current_file": "상세 설명",
      "placeholder": "작동 예시",
      "detail": "기술 상세"
    },
    "pages": {
      "aipsr": [
        {
          "key": "sudal",
          "title": "Sudal",
          "subtitle": "Interactive Preference Data Collection Layer",
          "status": "prelaunch",
          "summary": "이미지 기반 A/B 선택과 밸런스 게임을 통해 취향과 시각적 선호 데이터를 수집하는 제품입니다.",
          "placeholder": "Sudal 제품 화면. 사용자가 두 이미지 중 하나를 선택하고, 선택 순간이 작은 preference signal로 저장되는 모바일 경험을 한 장면으로 표시.",
          "data-placeholder-id": "detail-1",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Sudal은 사람들이 이미지 기반 A/B 선택과 밸런스 게임을 통해 자연스럽게 취향, 선호, 컬러, 디자인, 스타일 데이터를 남기도록 설계된 interactive preference data collection layer입니다."
            },
            {
              "heading": "AI Persona 연구에서의 역할",
              "body": "Sudal의 반복 선택 데이터와 visual preference signal은 Space Compiler가 preference-grounded AI Persona를 만들기 위한 입력 데이터가 됩니다."
            },
            {
              "heading": "수집하는 데이터",
              "list": [
                "텍스트 기반 밸런스 게임 선택",
                "이미지 기반 forced-choice 선택",
                "컬러, 디자인, 스타일, 분위기에 대한 visual preference signal",
                "질문 맥락과 반복 선택 패턴"
              ]
            },
            {
              "heading": "현재 단계",
              "body": "Sudal은 출시 준비 단계의 제품입니다. 현재는 이미지 기반 선택 경험과 반복 선택 데이터를 안정적으로 수집하는 구조를 중심으로 준비하고 있습니다."
            }
          ]
        },
        {
          "key": "space-compiler",
          "title": "Space Compiler",
          "subtitle": "Preference & Persona Synthesis Engine",
          "status": "research",
          "summary": "AI와 심리계량학(Psychometrics)을 결합하여 선택 데이터와 이미지 기반 취향 신호를 가상 고객 페르소나로 합성하는 R&D 엔진입니다.",
          "placeholder": "Space Compiler 변환 이미지. 반복 선택과 이미지 취향 신호가 하나의 Preference Vector로 압축되고, 그 결과가 취향을 가진 Persona Artifact로 변환되는 장면. Evidence와 Confidence는 작은 신뢰 배지로만 표시.",
          "data-placeholder-id": "detail-2",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Space Compiler는 Sudal에서 쌓인 반복 선택 데이터와 이미지 기반 취향 신호를 Preference Vector와 AI Persona로 변환하는 분석 엔진입니다. 쉽게 말해, 사용자가 어떤 이미지와 스타일을 반복해서 선택했는지를 바탕으로 취향의 방향과 강도를 추정합니다."
            },
            {
              "heading": "처리 흐름",
              "body": "Raw Choice → Preference Signal → Preference Vector → Evidence Mapping → Confidence Scoring → Persona Artifact 흐름으로 작동합니다. 각 단계는 선택 데이터를 바로 결론으로 바꾸지 않고, 근거와 신뢰도를 함께 남기기 위한 구조입니다."
            },
            {
              "heading": "연구 기반",
              "list": [
                "Generative Agents: AI Persona가 기억, 반성, 계획을 가진 에이전트처럼 동작할 수 있다는 연구 흐름을 참고합니다.",
                "Forced-Choice Image Assessment: 짧은 이미지 A/B 선택이 성향 추정에 유의미한 신호가 될 수 있다는 연구를 참고합니다.",
                "MIRT/TIRT: A/B 선택의 상대 비교 특성을 다차원 취향 추정으로 연결하기 위한 모델링 방향입니다."
              ]
            },
            {
              "heading": "MIRT/TIRT 모델링",
              "body": "MIRT와 TIRT는 Space Compiler가 전문성을 갖는 핵심 모델링 방향입니다. MIRT는 취향을 여러 축으로 나누어 추정하고, TIRT는 A/B 선택처럼 서로 비교하는 응답을 잠재 유틸리티 비교로 해석합니다. 이를 통해 단순 선호 집계보다 더 안정적인 취향 벡터를 만드는 것을 목표로 합니다."
            },
            {
              "heading": "범위와 한계",
              "body": "Space Compiler는 임상적 심리 진단 도구가 아니며, 개인의 모든 내면을 완벽히 아는 것을 목표로 하지 않습니다. 실제 오프라인 고객 조사를 100% 대체하기보다, 고비용의 본 조사 진행 전에 가설을 빠르게 좁히고 아이디어를 반복 탐색하는 사전 연구(Pre-research) 인프라로 정의됩니다. R&D MVP 단계는 deterministic baseline(weighted_linear_v0)으로 안정적으로 시작하여, 충분한 calibration 데이터가 쌓인 이후 TIRT/MIRT 기반 적합 모델로 단계적으로 고도화합니다."
            },
            {
              "heading": "예상 산출물",
              "list": [
                "Persona Artifact",
                "Persona Pool",
                "Synthetic Audience",
                "Segment Map",
                "Visual Preference Profile",
                "Design Response Report",
                "Coverage Report",
                "Confidence Report"
              ]
            },
            {
              "heading": "현재 단계",
              "body": "Space Compiler는 연구 및 초기 구현 단계의 핵심 엔진입니다. 현재는 선택 데이터가 Preference Vector, Evidence, Confidence, AI Persona로 이어지는 흐름을 검증하는 데 집중하고 있습니다."
            }
          ]
        },
        {
          "key": "vision-feedback",
          "title": "Vision Feedback with AI Persona",
          "subtitle": "AI Persona Synthesis Research의 첫 적용 방향",
          "status": "direction",
          "summary": "상품, 브랜드, 광고, 패키지, UI 디자인 반응을 AI Persona와 synthetic audience로 탐색하는 첫 적용 방향입니다.",
          "placeholder": "Vision Feedback 초기 탐색 화면. 세 개의 디자인 시안 옆에 AI Persona 반응 카드가 붙고, 선호 이유, 거부 이유, 다음 확인 질문만 짧게 표시.",
          "data-placeholder-id": "detail-3",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Vision Feedback은 제품, 브랜드, 광고, 패키지, UI 시안을 AI Persona 관점에서 먼저 검토하는 적용 시나리오입니다."
            },
            {
              "heading": "적용 영역",
              "list": [
                "상품 패키지 디자인",
                "브랜드 이미지와 무드보드",
                "광고 소재와 썸네일",
                "UI 화면과 온보딩",
                "컬러 팔레트와 스타일 방향"
              ]
            },
            {
              "heading": "예상 산출물",
              "body": "Design Response Report, Segment Reaction Map, Visual Preference Profile, Persona Reaction Note, Risk and Question List 같은 산출물로 이어지는 방향을 지향합니다."
            },
            {
              "heading": "현재 단계",
              "body": "Vision Feedback은 Sudal의 선택 데이터와 Space Compiler의 Persona 변환 구조가 연결된 이후 가장 먼저 적용할 수 있는 디자인 검토 방향입니다. 실제 고객 조사 전에 디자인 가설, 선호 이유, 거부 요인, 추가 확인 질문을 빠르게 정리하는 것을 목표로 합니다."
            }
          ]
        },
        {
          "key": "ai-persona-synthetic-audience",
          "title": "AI Persona & Synthetic Audience",
          "subtitle": "AI Persona Pool as a Service",
          "status": "platform",
          "summary": "Vision Feedback을 넘어 설문조사와 여론조사에 활용할 수 있는 AI Persona Pool을 만들고, 장기적으로 조사 기관에 persona pool을 제공하는 서비스형 인프라를 지향합니다.",
          "placeholder": "AI Persona Pool 컨셉 이미지. 추상 Persona Card들이 하나의 Synthetic Audience로 묶이고, coverage, confidence, limitation 신뢰 정보가 함께 배치된 장기 플랫폼 방향 이미지.",
          "data-placeholder-id": "detail-4",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "AI Persona & Synthetic Audience는 개별 AI Persona, persona pool, synthetic audience를 하나의 장기 플랫폼 방향으로 묶은 개념입니다. Synthetic Audience는 여러 AI Persona를 조사 목적에 맞게 묶은 가상 고객군입니다."
            },
            {
              "heading": "제공 방향",
              "list": [
                "조사 목적에 맞는 AI Persona Pool 구성",
                "모집단 조건, 세그먼트, confidence, coverage 확인",
                "설문 문항 응답 시뮬레이션과 persona interview",
                "여론조사·시장조사 기관이 사용할 수 있는 persona pool 제공"
              ]
            },
            {
              "heading": "왜 필요한가",
              "body": "Vision Feedback은 첫 적용 제품이고, AI Persona Pool as a Service는 그 이후의 확장 방향입니다. 제품·디자인 반응을 넘어 브랜드 조사, 설문조사, 여론조사의 사전 가설 탐색과 패널 보완에 쓰일 수 있는 인프라로 발전시키는 계획입니다."
            },
            {
              "heading": "사용 범위",
              "body": "AI Persona & Synthetic Audience는 실제 사람 조사를 대체하지 않습니다. 대신 본 조사 전에 가설을 좁히고, 질문을 다듬고, 조사 설계의 리스크를 줄이는 보완 인프라로 사용하는 것을 목표로 합니다."
            }
          ]
        }
      ],
      "agent-technologies": [
        {
          "key": "doksuri",
          "title": "Doksuri",
          "subtitle": "Markdown-native Human-AI Collaboration Platform",
          "status": "operating_dev",
          "summary": "사람과 AI Agent가 같은 Markdown 문서를 보며 요구사항, 작업 결과, 근거, 리뷰를 함께 남기는 협업 표면입니다.",
          "placeholder": "Doksuri 은유 이미지. 독수리가 흩어진 Markdown 문서 조각 중 필요한 요구사항과 evidence를 정확히 낚아채고, 오른쪽 작업 문서에 Agent comment, 작업 결과, review 상태로 정리되는 장면.",
          "data-placeholder-id": "detail-5",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Doksuri는 Markdown-native Human-AI Collaboration Platform입니다. 쉽게 말하면, AI와의 작업이 채팅창에 흩어지지 않고 하나의 문서 안에 요구사항, 결과, 근거, 리뷰 기록으로 남게 하는 협업 도구입니다."
            },
            {
              "heading": "왜 Markdown인가",
              "body": "Markdown은 단순 문서 포맷이 아니라, 사람과 Agent가 함께 읽고 쓰는 업무 인터페이스가 됩니다."
            },
            {
              "heading": "작동 흐름",
              "list": [
                "사람이 문서에 업무 요구사항, 판단 기준, 작업 지시를 작성합니다.",
                "Agent가 같은 문서를 읽고 작업하며 필요한 질문과 결과를 남깁니다.",
                "작업 결과, 근거, 리뷰, 결정 기록이 같은 문서 상태 안에 남습니다.",
                "KAO와 연결되어 회사 전반의 Agent 작업 지시와 결과 기록 표면이 됩니다."
              ]
            }
          ]
        },
        {
          "key": "atn",
          "title": "ATN",
          "subtitle": "Agent Turn Network",
          "status": "improving",
          "summary": "여러 AI Agent가 하나의 문제를 역할별로 검토하고, 발언 순서와 반박 과정을 남기는 multi-agent deliberation layer입니다.",
          "placeholder": "ATN 대본형 토론 화면. Moderator가 Product, Architecture, Risk, User 역할의 발언 순서를 배정하고, 마지막에는 Decision Brief 하나만 표시.",
          "data-placeholder-id": "detail-6",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "ATN, Agent Turn Network는 Moderator가 발언 순서를 관리해 여러 AI Agent가 하나의 문제를 역할별로 검토하도록 만드는 구조입니다. 단순히 여러 답변을 모아 요약하는 방식이 아니라, 누가 어떤 근거로 말했고 어떤 반박이 있었는지를 대본처럼 남깁니다."
            },
            {
              "heading": "토론 흐름",
              "list": [
                "Moderator가 다음 발언자를 지정합니다.",
                "각 Agent가 역할 기반 의견을 냅니다.",
                "다른 Agent가 이전 발언을 보고 동의하거나 반박합니다.",
                "누가 어떤 순서로 말했고 무엇을 반박했는지 대본처럼 남습니다.",
                "사람의 최종 판단 전에 구조화된 decision material을 제공합니다."
              ]
            },
            {
              "heading": "적용 영역",
              "body": "제품 방향, architecture decision, risk review, research question refinement처럼 회사 전반의 중요한 판단에 사용됩니다."
            }
          ]
        },
        {
          "key": "ai-spark",
          "title": "AI-SPARK",
          "subtitle": "AI Spec, Policy, Approval, Runtime Kernel",
          "status": "patent",
          "summary": "AI가 제안한 서버 변경을 바로 적용하지 않고, 명세화, 검증, 승인 단계를 거쳐 안전하게 반영하는 백엔드 개발 거버넌스 기술입니다.",
          "placeholder": "AI-SPARK 승인 게이트 이미지. Requirement → Spec Bundle → Validator → Human Approval → Safe Runtime 흐름을 통해 승인된 서버 변경만 반영되는 구조.",
          "data-placeholder-id": "detail-7",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "AI-SPARK는 자연어 요구사항을 바로 서버 변경으로 반영하지 않고, 먼저 Spec Bundle로 정리한 뒤 Validator와 Approval Gate를 거치게 합니다. 핵심은 AI 개발 속도를 활용하되, 승인되지 않은 변경이나 정책 위반이 런타임에 반영되지 않도록 막는 것입니다."
            },
            {
              "heading": "핵심 구성",
              "list": [
                "Spec Bundle: 요구사항, API, 상태 변경, 권한 조건을 검토 가능한 명세로 묶습니다.",
                "Validator: 정책 위반, 스키마 오류, 승인되지 않은 변경을 사전에 점검합니다.",
                "Approval Gate: 사람이 승인한 변경만 다음 단계로 넘어가게 합니다.",
                "Fail-Closed: 불확실하거나 승인되지 않은 변경은 기본적으로 차단합니다.",
                "Audit Trail: 어떤 요구사항이 어떤 서버 변경으로 이어졌는지 추적 가능하게 남깁니다."
              ]
            },
            {
              "heading": "작동 흐름",
              "body": "서버 변경이 필요할 때 요구사항을 먼저 검토 가능한 명세로 정리하고, 정책 검증과 사람의 승인 절차를 통과한 변경만 반영하는 구조입니다."
            }
          ]
        }
      ],
      "hermes-supports": [
        {
          "key": "kao",
          "title": "KAO",
          "subtitle": "Kkachi Agent Organization",
          "status": "operating",
          "summary": "Hermes 위에서 Kkachi Agent를 프로젝트별, 역할별로 분리해 운영하는 Agent Operating Model입니다.",
          "placeholder": "KAO 오작교 협업 이미지. 사람이 정한 Epic을 향해 Blue, Red, Orange, Grey, Teal 색 포인트를 가진 까치 Agent들이 작업 조각을 이어 다리를 놓고, 중앙의 deliverable을 완성하는 장면.",
          "data-placeholder-id": "detail-8",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "KAO, Kkachi Agent Organization은 Root Kernel이 Hermes 위에서 운영하는 AI Agent 조직 모델입니다."
            },
            {
              "heading": "운영 구조",
              "body": "KAO는 하나의 AI에게 모든 일을 맡기지 않고, Kkachi Agent를 프로젝트별, 역할별로 분리해 운영합니다. 실행, 리뷰, 사용자 관점, 문서 정합성, UX 판단을 나누어 다루는 것이 핵심입니다."
            },
            {
              "heading": "대표 역할",
              "body": "각 색의 Kkachi Agent가 build, review, user check, docs, UX처럼 서로 다른 역할을 맡고, 사람이 정한 목표를 향해 작업 조각을 이어 하나의 결과물로 완성합니다."
            },
            {
              "heading": "개발 위임",
              "body": "Blue는 실행, Red는 리뷰, Orange는 사용자 관점, Grey는 문서 정합성, Teal은 UX/UI 판단을 보완합니다. 사람은 방향 설정, 검증 기준, 테스트, 최종 승인에 집중합니다."
            }
          ]
        },
        {
          "key": "klm",
          "title": "KLM",
          "subtitle": "Kkachi Letta Memory",
          "status": "improving",
          "summary": "AI Agent가 승인된 지식, 프로젝트 메모리, 임시 검색 결과를 구분해 사용하도록 돕는 메모리 신뢰 경계 시스템입니다.",
          "placeholder": "KLM 신뢰 경계 이미지. Approved Knowledge, Project Memory, Retrieval Result를 분리하고, Agent가 승인된 지식과 임시 검색 결과를 다르게 취급하는 장면.",
          "data-placeholder-id": "detail-9",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "KLM, Kkachi Letta Memory는 Hermes Agent가 과거 작업 기억과 승인된 지식, 임시 검색 결과를 구분해 사용하도록 돕는 메모리 관리 체계입니다. AI가 검증되지 않은 정보를 사실처럼 사용하는 위험을 줄이는 것이 목적입니다."
            },
            {
              "heading": "신뢰 경계",
              "list": [
                "Approved Knowledge: 사람이 검토했거나 기준 문서로 승인한 지식입니다.",
                "Project Memory: 프로젝트 진행 중 쌓인 작업 맥락입니다.",
                "Retrieval Result: 검색이나 조회로 가져온 임시 정보입니다.",
                "Review Boundary: 임시 정보가 승인된 지식으로 섞이기 전에 검토 단계를 둡니다."
              ]
            },
            {
              "heading": "운영 방향",
              "body": "Letta 기반 memory와 LLM Wiki를 활용하되, 승인된 지식과 임시 정보를 구분하는 방향으로 운영합니다."
            }
          ]
        },
        {
          "key": "krq",
          "title": "KRQ",
          "subtitle": "Kkachi Research Queue",
          "status": "improving",
          "summary": "Black과 Yellow Kkachi Agent가 자료 조사와 지식 재구성을 통해 검증된 지식 카드를 만들고, 다른 Agent가 재사용하게 하는 연구와 지식 운영 큐입니다.",
          "placeholder": "KRQ 지식 재사용 이미지. Black/Yellow 까치 Agent가 흩어진 자료를 검토해 verified knowledge card로 정리하고, 다른 Agent들이 그 카드를 다시 사용하는 장면.",
          "data-placeholder-id": "detail-10",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "KRQ, Kkachi Research Queue는 조사한 자료를 일회성 검색으로 끝내지 않고, 검토 가능한 지식 카드로 정리해 다음 작업에서 다시 사용할 수 있게 만드는 연구 운영 큐입니다."
            },
            {
              "heading": "운영 흐름",
              "body": "Research Topic → Verified Notes → Knowledge Card → Human Review → Reused by Agents 흐름으로 작동합니다."
            },
            {
              "heading": "역할",
              "list": [
                "Black은 프로젝트와 회사 의사결정에 필요한 배경 지식을 정리합니다.",
                "Yellow는 연구 주제의 논리적 배경과 가설 후보를 강화합니다.",
                "사람은 조사 범위와 검증 기준을 조정하고, 재사용 가능한 지식으로 승인합니다."
              ]
            }
          ]
        }
      ]
    }
  },
  "en": {
    "ui": {
      "close": "Close",
      "technologies": "Technology Areas",
      "current_file": "Detail",
      "placeholder": "Example",
      "detail": "Technology Detail"
    },
    "pages": {
      "aipsr": [
        {
          "key": "sudal",
          "title": "Sudal",
          "subtitle": "Interactive Preference Data Collection Layer",
          "status": "prelaunch",
          "summary": "A product for collecting preference and visual taste data through image-based A/B choices and balance games.",
          "placeholder": "Sudal product screen where a user chooses between two images and the choice is saved as a preference signal.",
          "data-placeholder-id": "detail-1",
          "sections": [
            {
              "heading": "What it is",
              "body": "Sudal is an interactive preference data collection layer designed for people to leave preference, color, design, and style signals through image-based A/B choices, balance games, and repeated comparison."
            },
            {
              "heading": "Role in AI Persona Research",
              "body": "Sudal’s repeated choice data and visual preference signals become inputs for Space Compiler."
            },
            {
              "heading": "Collected data",
              "list": [
                "Text-based balance-game choices",
                "Image-based forced-choice signals",
                "Visual preference around color, design, style, and mood",
                "Question context and repeated choice patterns"
              ]
            },
            {
              "heading": "Current stage",
              "body": "Sudal is a pre-launch product. The current focus is preparing a stable image-based choice experience and repeatable preference-signal collection flow."
            }
          ]
        },
        {
          "key": "space-compiler",
          "title": "Space Compiler",
          "subtitle": "Preference & Persona Synthesis Engine",
          "status": "research",
          "summary": "A synthesis engine fusing AI with psychometrics to research and build systems that transform choice data into persona artifacts.",
          "placeholder": "Space Compiler transformation image where repeated choices and visual taste signals become a Preference Vector and then a taste-grounded Persona Artifact with Evidence and Confidence markers.",
          "data-placeholder-id": "detail-2",
          "sections": [
            {
              "heading": "What it is",
              "body": "Space Compiler is an analysis engine that turns repeated Sudal choices and visual preference signals into Preference Vectors and AI Personas. In simpler terms, it estimates the direction and strength of taste from the images and styles a person repeatedly chooses."
            },
            {
              "heading": "Processing flow",
              "body": "Raw Choice → Preference Signal → Preference Vector → Evidence Mapping → Confidence Scoring → Persona Artifact. The flow is designed to keep evidence and confidence attached instead of turning choices directly into unsupported conclusions."
            },
            {
              "heading": "Research Foundations",
              "list": [
                "Generative Agents: draws from research showing how memory, reflection, and planning can make AI Personas a testable research direction.",
                "Forced-Choice Image Assessment: draws from research suggesting that short image A/B choices can carry meaningful personality and preference signals.",
                "MIRT/TIRT: connects relative-choice data to multidimensional preference estimation."
              ]
            },
            {
              "heading": "MIRT/TIRT modeling",
              "body": "MIRT and TIRT are core modeling directions for Space Compiler. MIRT estimates taste across multiple dimensions, while TIRT treats A/B choices as comparisons of latent utility. The goal is a more stable preference vector than a simple popularity count."
            },
            {
              "heading": "Scope and limitations",
              "body": "Space Compiler is not a clinical diagnostic tool and does not aim to perfectly predict individual psychology. Instead of replacing real-world customer research, it serves as a pre-research exploratory infrastructure to narrow down design hypotheses. The MVP starts with a robust deterministic baseline (weighted_linear_v0), and will scale to fully calibrated TIRT/MIRT models as empirical response data accumulates."
            },
            {
              "heading": "Expected outputs",
              "list": [
                "Persona Artifact",
                "Persona Pool",
                "Synthetic Audience",
                "Segment Map",
                "Visual Preference Profile",
                "Design Response Report",
                "Coverage Report",
                "Confidence Report"
              ]
            },
            {
              "heading": "Current stage",
              "body": "Space Compiler is a core engine in research and early implementation. The current focus is validating how choice data connects to Preference Vectors, Evidence, Confidence, and AI Personas."
            }
          ]
        },
        {
          "key": "vision-feedback",
          "title": "Vision Feedback with AI Persona",
          "subtitle": "First application direction for AI Persona Synthesis Research",
          "status": "direction",
          "summary": "The first application direction for exploring reactions to product, brand, advertising, package, and UI designs with AI Personas and synthetic audiences.",
          "placeholder": "Vision Feedback early exploration screen with design variants beside AI Persona reaction cards for preference reasons, rejection reasons, and next validation questions.",
          "data-placeholder-id": "detail-3",
          "sections": [
            {
              "heading": "What it is",
              "body": "Vision Feedback is an application scenario for reviewing product, brand, advertising, packaging, and UI design drafts through AI Persona perspectives."
            },
            {
              "heading": "Use cases",
              "list": [
                "Product packaging",
                "Brand images and moodboards",
                "Ad creatives and thumbnails",
                "UI screens and onboarding",
                "Color palettes and style directions"
              ]
            },
            {
              "heading": "Expected outputs",
              "body": "It connects to Design Response Report, Segment Reaction Map, Visual Preference Profile, Persona Reaction Note, and Risk and Question List."
            },
            {
              "heading": "Current stage",
              "body": "Vision Feedback is the first design-review direction to apply after Sudal choice data and Space Compiler persona synthesis are connected. It aims to organize design hypotheses, preference reasons, rejection factors, and follow-up questions before real customer research."
            }
          ]
        },
        {
          "key": "ai-persona-synthetic-audience",
          "title": "AI Persona & Synthetic Audience",
          "subtitle": "AI Persona Pool as a Service",
          "status": "platform",
          "summary": "Beyond Vision Feedback, Root Kernel aims to build AI Persona Pools for surveys and polling, and long-term infrastructure that can provide persona pools to research and polling organizations.",
          "placeholder": "AI Persona Pool concept image where abstract Persona Cards combine into one Synthetic Audience with coverage, confidence, and limitation trust markers.",
          "data-placeholder-id": "detail-4",
          "sections": [
            {
              "heading": "What it is",
              "body": "AI Persona & Synthetic Audience groups individual AI Personas, persona pools, and synthetic audiences into one long-term platform direction. A Synthetic Audience is a virtual customer group assembled from AI Personas for a specific research purpose."
            },
            {
              "heading": "Service direction",
              "list": [
                "AI Persona Pools configured for a research goal",
                "Population conditions, segments, confidence, and coverage",
                "Survey response simulation and persona interviews",
                "Persona pools that research and polling organizations can use"
              ]
            },
            {
              "heading": "Why it matters",
              "body": "Vision Feedback is the first application product. AI Persona Pool as a Service is the later expansion path: infrastructure for pre-research, question design, and panel augmentation across brand research, surveys, and polling."
            },
            {
              "heading": "Usage boundary",
              "body": "AI Persona & Synthetic Audience does not replace real-human research. It is intended as complementary infrastructure for narrowing hypotheses, improving questions, and reducing research-design risk before the main study."
            }
          ]
        }
      ],
      "agent-technologies": [
        {
          "key": "doksuri",
          "title": "Doksuri",
          "subtitle": "Markdown-native Human-AI Collaboration Platform",
          "status": "operating_dev",
          "summary": "A collaboration surface used across company work where people and AI Agents read and write the same Markdown documents.",
          "placeholder": "Doksuri metaphor image. An eagle precisely snatches the needed requirements and evidence from scattered Markdown fragments, then organizes them into a work document with Agent comments, work results, and review state.",
          "data-placeholder-id": "detail-5",
          "sections": [
            {
              "heading": "What it is",
              "body": "Doksuri is a Markdown-native Human-AI Collaboration Platform. In practical terms, it keeps requirements, results, evidence, and review records in one shared document instead of letting AI work scatter across chat logs."
            },
            {
              "heading": "Why Markdown",
              "body": "Markdown becomes a shared work interface for humans and Agents, not just a document format."
            },
            {
              "heading": "Workflow",
              "list": [
                "A person writes requirements, decision criteria, and task instructions in a document.",
                "An Agent reads from the same document and leaves questions, results, and evidence.",
                "Results, evidence, reviews, and decisions remain in the same document state.",
                "It connects to KAO as the company-wide instruction and result surface for Agent work."
              ]
            }
          ]
        },
        {
          "key": "atn",
          "title": "ATN",
          "subtitle": "Agent Turn Network",
          "status": "improving",
          "summary": "A deliberation layer where a moderator assigns turns so multiple AI Agents speak from their roles and challenge each other's claims.",
          "placeholder": "ATN script-style deliberation screen. A moderator assigns turns to Product, Architecture, Risk, and User roles, ending with one Decision Brief.",
          "data-placeholder-id": "detail-6",
          "sections": [
            {
              "heading": "What it is",
              "body": "ATN, Agent Turn Network, lets a Moderator manage speaking turns so multiple AI Agents can review one problem from different roles. Instead of collecting several answers and summarizing them at the end, ATN preserves who said what, what evidence they used, and which claims were challenged."
            },
            {
              "heading": "Deliberation flow",
              "list": [
                "The moderator assigns the next speaker.",
                "Agents provide role-based opinions.",
                "Other Agents see previous statements and agree or challenge them.",
                "The sequence shows who said what and which claim was challenged.",
                "It provides structured decision material before human judgment."
              ]
            },
            {
              "heading": "Use cases",
              "body": "Product direction, architecture decisions, risk review, and research question refinement across company work."
            }
          ]
        },
        {
          "key": "ai-spark",
          "title": "AI-SPARK",
          "subtitle": "AI Spec, Policy, Approval, Runtime Kernel",
          "status": "patent",
          "summary": "Backend development governance technology that turns AI-proposed server changes into specifications, validation steps, and approval gates before runtime adoption.",
          "placeholder": "AI-SPARK approval-gate image showing Requirement → Spec Bundle → Validator → Human Approval → Safe Runtime as the approved-change flow.",
          "data-placeholder-id": "detail-7",
          "sections": [
            {
              "heading": "What it is",
              "body": "AI-SPARK does not send natural-language requirements directly into server changes. It first organizes them into a Spec Bundle, then routes them through a Validator and Approval Gate. The core idea is to use AI development speed while preventing unapproved or policy-violating changes from reaching runtime."
            },
            {
              "heading": "Core components",
              "list": [
                "Spec Bundle: groups requirements, API behavior, state changes, and permission conditions into a reviewable specification.",
                "Validator: checks policy violations, schema errors, and unapproved changes before adoption.",
                "Approval Gate: lets only human-approved changes move forward.",
                "Fail-Closed: blocks uncertain or unapproved changes by default.",
                "Audit Trail: preserves how a requirement became a server change."
              ]
            },
            {
              "heading": "Workflow",
              "body": "When server changes are needed, requirements are first organized into a reviewable specification. Only changes that pass policy validation and human approval are reflected into the system."
            }
          ]
        }
      ],
      "hermes-supports": [
        {
          "key": "kao",
          "title": "KAO",
          "subtitle": "Kkachi Agent Organization",
          "status": "operating",
          "summary": "A Hermes-based Agent Operating Model that separates Kkachi Agents by project and role.",
          "placeholder": "KAO magpie-bridge collaboration image. Toward one human-defined Epic, magpie Agents with Blue, Red, Orange, Grey, and Teal color accents connect work pieces like a bridge and complete one central deliverable.",
          "data-placeholder-id": "detail-8",
          "sections": [
            {
              "heading": "What it is",
              "body": "KAO, Kkachi Agent Organization, is Root Kernel’s AI Agent organization model operating on Hermes."
            },
            {
              "heading": "Operating structure",
              "body": "KAO does not ask one AI to do everything. It separates Kkachi Agents by project and role so execution, review, user perspective, documentation consistency, and UX judgment can be handled as distinct responsibilities."
            },
            {
              "heading": "Representative roles",
              "body": "Each colored Kkachi Agent carries a different role such as build, review, user check, docs, or UX, then connects its work piece toward the human-defined goal."
            },
            {
              "heading": "Development delegation",
              "body": "Blue leads execution, Red reviews, Orange checks user perspective, Grey handles document consistency, and Teal supports UX/UI judgment. The human keeps direction, validation criteria, testing, and final approval."
            }
          ]
        },
        {
          "key": "klm",
          "title": "KLM",
          "subtitle": "Kkachi Letta Memory",
          "status": "improving",
          "summary": "A memory trust-boundary system that helps AI Agents distinguish approved knowledge, project memory, and temporary retrieval results.",
          "placeholder": "KLM trust-boundary image. Separate Approved Knowledge, Project Memory, and Retrieval Result, showing that an Agent treats approved knowledge differently from temporary search results.",
          "data-placeholder-id": "detail-9",
          "sections": [
            {
              "heading": "What it is",
              "body": "KLM, Kkachi Letta Memory, helps Hermes Agents distinguish past work memory, approved knowledge, and temporary retrieval results. Its purpose is to reduce the risk of treating unverified information as fact."
            },
            {
              "heading": "Trust boundary",
              "list": [
                "Approved Knowledge: reviewed or canonical knowledge.",
                "Project Memory: context accumulated during project work.",
                "Retrieval Result: temporary information from search or lookup.",
                "Review Boundary: the check before temporary information is promoted into approved knowledge."
              ]
            },
            {
              "heading": "Operating direction",
              "body": "KLM uses Letta-based memory and LLM Wiki while keeping approved knowledge separate from temporary information."
            }
          ]
        },
        {
          "key": "krq",
          "title": "KRQ",
          "subtitle": "Kkachi Research Queue",
          "status": "improving",
          "summary": "A research and knowledge operations queue where Black and Yellow Kkachi Agents collect, reframe, store, and index knowledge.",
          "placeholder": "KRQ knowledge-reuse image. Black/Yellow magpie Agents review scattered sources into a verified knowledge card, then other Agents reuse that card as work context.",
          "data-placeholder-id": "detail-10",
          "sections": [
            {
              "heading": "What it is",
              "body": "KRQ, Kkachi Research Queue, turns research from one-off lookup into reviewable knowledge cards that can be reused by later agent work."
            },
            {
              "heading": "Flow",
              "body": "Research Topic → Verified Notes → Knowledge Card → Human Review → Reused by Agents."
            },
            {
              "heading": "Roles",
              "list": [
                "Black organizes background knowledge needed for project and company decisions.",
                "Yellow strengthens the logical background and hypothesis candidates for research topics.",
                "The human adjusts research scope and verification criteria, then approves knowledge for reuse."
              ]
            }
          ]
        }
      ]
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
      development: '개발중',
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
      development: 'In development',
      research: 'Research / early implementation',
      direction: 'First application direction / in development',
      improving: 'In operation / improving',
      operating_dev: 'In operation / development',
      platform: 'Long-term platform direction',
      patent: 'Patent pending / in development'
    }
  };

  const pageMeta = {
    ko: {
      aipsr: { title: 'AI Persona Synthesis Research', short: 'AI Persona Synthesis Research', path: 'aipsr' },
      'agent-technologies': { title: 'Agent Technologies', short: 'Agent Tech', path: 'agent-technologies' },
      'hermes-supports': { title: 'Hermes Agent Supports', short: 'Hermes', path: 'hermes-supports' }
    },
    en: {
      aipsr: { title: 'AI Persona Synthesis Research', short: 'AI Persona Synthesis Research', path: 'aipsr' },
      'agent-technologies': { title: 'Agent Technologies', short: 'Agent Tech', path: 'agent-technologies' },
      'hermes-supports': { title: 'Hermes Agent Supports', short: 'Hermes', path: 'hermes-supports' }
    }
  };

  const imageCatalog = {
    "ko": {
      "sudal": [
        {
          "placeholder": "Sudal 모바일 선택 화면. 이미지 카드 2개, 선택된 상태, preference signal saved 배지만 보이는 실제 제품형 스크린.",
          "data-placeholder-id": "detail-11"
        },
        {
          "placeholder": "취향 신호 축적 이미지. 반복 선택들이 작은 점이나 카드로 쌓여 개인의 visual preference trail을 만드는 장면.",
          "data-placeholder-id": "detail-12"
        },
        {
          "placeholder": "질문 맥락 연결 도표. 이미지 선택, 밸런스 게임, 질문 맥락이 하나의 preference signal로 정리되는 3단 구조.",
          "data-placeholder-id": "detail-13"
        },
        {
          "placeholder": "Sudal 제품 경험 이미지. 사용자가 취향을 표현하는 선택의 순간을 중심에 둔 제품 화면.",
          "data-placeholder-id": "detail-14"
        }
      ],
      "space-compiler": [
        {
          "placeholder": "Preference Vector 생성 장면. Sudal 선택 데이터와 이미지 취향 신호가 하나의 벡터로 모이는 중간 변환 단계.",
          "data-placeholder-id": "detail-15"
        },
        {
          "placeholder": "입력 데이터 맵. Sudal 선택 데이터, 이미지 취향 데이터, 모집단 조건이 Space Compiler로 들어가는 구조만 간단히 표시.",
          "data-placeholder-id": "detail-16"
        },
        {
          "placeholder": "Evidence와 confidence 연결 도표. Persona 응답이 어떤 선택 데이터와 근거에 연결되고 coverage가 어디서 부족한지 보여주는 설명용 이미지.",
          "data-placeholder-id": "detail-17"
        },
        {
          "placeholder": "Persona Artifact 이미지. demographic profile, visual preference profile, evidence links, confidence, version이 하나의 결과물로 정리된 화면.",
          "data-placeholder-id": "detail-18"
        }
      ],
      "vision-feedback": [
        {
          "placeholder": "디자인 시안 비교 화면. AI Persona가 각 시안에 대해 예상 반응과 우려 지점을 카드 형태로 제시하는 장면.",
          "data-placeholder-id": "detail-19"
        },
        {
          "placeholder": "반응 근거 카드. 특정 시안에 대한 선호 이유, 거부 이유, 확인할 질문, confidence note만 간단히 표시.",
          "data-placeholder-id": "detail-20"
        },
        {
          "placeholder": "디자인별 예상 반응 맵. 패키지, 광고, UI 시안에 대해 세그먼트별 끌림과 거부 지점을 작게 비교.",
          "data-placeholder-id": "detail-21"
        },
        {
          "placeholder": "초기 검토 결과 화면. 다음 디자인 실험을 정하기 위한 shortlist와 risk question 중심의 결과 영역.",
          "data-placeholder-id": "detail-22"
        }
      ],
      "ai-persona-synthetic-audience": [
        {
          "placeholder": "AI Persona Pool 컨셉 이미지. 추상 Persona Card들이 하나의 Synthetic Audience로 묶이고 coverage, confidence, limitation만 작게 표시.",
          "data-placeholder-id": "detail-23"
        },
        {
          "placeholder": "Survey and polling workflow. 질문 → AI Persona Pool → 응답 분포 → confidence note로 이어지는 짧은 흐름.",
          "data-placeholder-id": "detail-24"
        },
        {
          "placeholder": "Persona evidence panel. 특정 persona 응답이 어떤 Sudal 선택 기록, 이미지 선택 신호, 공개 통계 보정에 연결되는지 보여주는 화면.",
          "data-placeholder-id": "detail-25"
        },
        {
          "placeholder": "Synthetic disclosure panel. 실제 사람 조사와 persona-only 결과를 구분하고 confidence, coverage, limitation을 함께 표시하는 리포트 영역.",
          "data-placeholder-id": "detail-26"
        }
      ],
      "doksuri": [
        {
          "placeholder": "Markdown 조각 선택 장면. 독수리가 requirement, evidence, decision 기준이 적힌 조각만 정확히 골라 작업 문서로 옮기는 close-up.",
          "data-placeholder-id": "detail-27"
        },
        {
          "placeholder": "Human-AI document workflow. 사람이 요구사항을 쓰고 Agent가 같은 Markdown 문서에 질문, 결과, review를 남기는 흐름.",
          "data-placeholder-id": "detail-28"
        },
        {
          "placeholder": "Task, evidence, review layout. 하나의 문서 안에 업무 지시, 근거 링크, Agent 결과, Red review, 승인 기록이 정리된 화면.",
          "data-placeholder-id": "detail-29"
        },
        {
          "placeholder": "협업 상태 이미지. 사람의 요청, Agent 작업 결과, Red review, 승인 상태가 하나의 Markdown 문서 안에서 연결되는 화면.",
          "data-placeholder-id": "detail-30"
        }
      ],
      "atn": [
        {
          "placeholder": "Turn assignment map. Moderator가 다음 발언자를 지정하고 각 역할 Agent의 발언 순서가 선으로 연결되는 장면.",
          "data-placeholder-id": "detail-31"
        },
        {
          "placeholder": "Deliberation transcript 화면. 발언, 근거, 반론, unresolved issue가 시간순으로 정리되고 마지막에 Decision Brief가 붙은 화면.",
          "data-placeholder-id": "detail-32"
        },
        {
          "placeholder": "Recommendation output. final recommendation, supporting evidence, disagreement log, human decision note가 함께 표시된 결과 화면.",
          "data-placeholder-id": "detail-33"
        },
        {
          "placeholder": "Multi-agent role map. ATN이 KAO의 역할 Agent 또는 다른 runtime의 Agent와 연결될 수 있음을 보여주는 추상도.",
          "data-placeholder-id": "detail-34"
        }
      ],
      "ai-spark": [
        {
          "placeholder": "Spec Bundle 변환 장면. 자연어 요구사항이 API, state model, permission policy를 포함한 승인 가능한 명세 묶음으로 정리되는 화면.",
          "data-placeholder-id": "detail-35"
        },
        {
          "placeholder": "Spec Bundle 화면. API, state model, binding, permission policy가 하나의 검토 가능한 명세 묶음으로 정리된 화면.",
          "data-placeholder-id": "detail-36"
        },
        {
          "placeholder": "Validation and approval gate. policy violation, schema mismatch, unapproved revision이 Fail-closed로 차단되는 화면.",
          "data-placeholder-id": "detail-37"
        },
        {
          "placeholder": "검증 추적 리포트. 테스트 실패가 관련 spec, state transition, API contract와 연결되어 원인을 찾는 화면.",
          "data-placeholder-id": "detail-38"
        }
      ],
      "kao": [
        {
          "placeholder": "KAO 역할 다리 이미지. Blue는 build, Red는 review, Orange는 user check, Grey는 docs, Teal은 UX 조각을 맡아 하나의 deliverable로 연결.",
          "data-placeholder-id": "detail-39"
        },
        {
          "placeholder": "색상 까치 역할 맵. 검정 까치 실루엣에 Blue, Red, Orange, Grey, Teal 포인트를 입혀 각 색이 맡는 책임을 직관적으로 보여주는 구조.",
          "data-placeholder-id": "detail-40"
        },
        {
          "placeholder": "업무 완성 흐름. 사람의 목표 설정, 역할별 Agent 수행, 사람의 최종 확인이 하나의 협업 루프로 이어지는 그림.",
          "data-placeholder-id": "detail-41"
        },
        {
          "placeholder": "Project-scoped Agent map. 여러 프로젝트 폴더 아래 role-scoped Kkachi Agent들이 분리되어 context contamination을 줄이는 구조도.",
          "data-placeholder-id": "detail-42"
        }
      ],
      "klm": [
        {
          "placeholder": "Approved Knowledge 중심 구조. Agent가 승인된 문서를 가장 강하게 참조하고, memory와 retrieval result는 근거 상태가 다르게 표시되는 레이어.",
          "data-placeholder-id": "detail-43"
        },
        {
          "placeholder": "Context trust map. source of truth, project memory, conversation memory, retrieval result가 서로 다른 신뢰 등급으로 구분되는 화면.",
          "data-placeholder-id": "detail-44"
        },
        {
          "placeholder": "검증 대기 컨텍스트 이미지. 새 retrieval result가 바로 진실로 병합되지 않고 review/approval boundary 밖에 머무는 장면.",
          "data-placeholder-id": "detail-45"
        },
        {
          "placeholder": "KLM integration flow. Hermes Agent가 LLM Wiki와 memory를 참조하되 approved document boundary를 넘지 않는 흐름.",
          "data-placeholder-id": "detail-46"
        }
      ],
      "krq": [
        {
          "placeholder": "Research Topic → Verified Knowledge Card → Human Review → Reused by Agents 흐름.",
          "data-placeholder-id": "detail-47"
        },
        {
          "placeholder": "Black/Yellow 연구 역할 이미지. Black은 프로젝트 지원 지식, Yellow는 가설 배경을 검토해 하나의 검증된 노트 묶음으로 정리.",
          "data-placeholder-id": "detail-48"
        },
        {
          "placeholder": "Knowledge card handoff. 정리된 연구 카드가 Blue, Red, Teal 등 다른 역할 Agent에게 전달되어 다음 작업의 컨텍스트가 되는 장면.",
          "data-placeholder-id": "detail-49"
        },
        {
          "placeholder": "Human validation checkpoint. Agent가 정리한 지식이 사람의 확인을 거친 뒤 재사용 가능한 연구 자산으로 바뀌는 단계형 이미지.",
          "data-placeholder-id": "detail-50"
        }
      ]
    },
    "en": {
      "sudal": [
        {
          "placeholder": "Sudal mobile choice screen with two image cards, a selected state, and a saved preference-signal chip.",
          "data-placeholder-id": "detail-11"
        },
        {
          "placeholder": "Preference-signal accumulation image where repeated choices build a visual preference trail from small dots or cards.",
          "data-placeholder-id": "detail-12"
        },
        {
          "placeholder": "Question-context diagram where image choice, balance game, and question context become one preference signal in three steps.",
          "data-placeholder-id": "detail-13"
        },
        {
          "placeholder": "Sudal product-experience image centered on the user’s moment of expressing taste.",
          "data-placeholder-id": "detail-14"
        }
      ],
      "space-compiler": [
        {
          "placeholder": "Preference Vector formation scene where Sudal choices and visual taste signals gather into one intermediate vector.",
          "data-placeholder-id": "detail-15"
        },
        {
          "placeholder": "Input data map showing only Sudal choice data, image preference data, and requested population definitions entering Space Compiler.",
          "data-placeholder-id": "detail-16"
        },
        {
          "placeholder": "Evidence and confidence diagram showing how persona responses connect to source signals and where coverage is insufficient.",
          "data-placeholder-id": "detail-17"
        },
        {
          "placeholder": "Persona artifact preview with demographic profile, visual preference profile, evidence links, confidence, and version.",
          "data-placeholder-id": "detail-18"
        }
      ],
      "vision-feedback": [
        {
          "placeholder": "Design-variant comparison screen where AI Personas provide expected reactions and concern cards beside each option.",
          "data-placeholder-id": "detail-19"
        },
        {
          "placeholder": "Reaction-evidence card with preference reason, rejection reason, next validation question, and confidence note only.",
          "data-placeholder-id": "detail-20"
        },
        {
          "placeholder": "Expected reaction map comparing attraction and rejection points across package, ad, and UI variants.",
          "data-placeholder-id": "detail-21"
        },
        {
          "placeholder": "Early review result screen focused on shortlist and risk questions for the next design experiment, not a finished report.",
          "data-placeholder-id": "detail-22"
        }
      ],
      "ai-persona-synthetic-audience": [
        {
          "placeholder": "AI Persona Pool concept image where abstract Persona Cards combine into one Synthetic Audience with coverage, confidence, and limitation markers.",
          "data-placeholder-id": "detail-23"
        },
        {
          "placeholder": "Survey and polling workflow: question → AI Persona Pool → response distribution → confidence note.",
          "data-placeholder-id": "detail-24"
        },
        {
          "placeholder": "Persona evidence panel showing how a persona response connects to Sudal choices, image-based signals, and demographic calibration.",
          "data-placeholder-id": "detail-25"
        },
        {
          "placeholder": "Synthetic disclosure panel distinguishing real-human research from persona-only results with confidence, coverage, and limitations.",
          "data-placeholder-id": "detail-26"
        }
      ],
      "doksuri": [
        {
          "placeholder": "Markdown-fragment selection close-up where an eagle picks only requirement, evidence, and decision-criteria fragments into a work document.",
          "data-placeholder-id": "detail-27"
        },
        {
          "placeholder": "Human-AI document workflow where a person writes requirements and Agents leave questions, results, and review in the same Markdown document.",
          "data-placeholder-id": "detail-28"
        },
        {
          "placeholder": "Document layout containing task instruction, evidence links, Agent results, Red review, and approval records.",
          "data-placeholder-id": "detail-29"
        },
        {
          "placeholder": "Collaboration-state image connecting human request, Agent result, Red review, and approval state inside one Markdown document.",
          "data-placeholder-id": "detail-30"
        }
      ],
      "atn": [
        {
          "placeholder": "Turn assignment map where the Moderator selects the next speaker and lines connect the role Agents in speaking order.",
          "data-placeholder-id": "detail-31"
        },
        {
          "placeholder": "Deliberation transcript showing statements, evidence, objections, unresolved issues, and one final Decision Brief.",
          "data-placeholder-id": "detail-32"
        },
        {
          "placeholder": "Recommendation output with final recommendation, supporting evidence, disagreement log, and human decision note.",
          "data-placeholder-id": "detail-33"
        },
        {
          "placeholder": "Multi-agent role map showing how ATN can connect to KAO role Agents or Agents from other runtimes.",
          "data-placeholder-id": "detail-34"
        }
      ],
      "ai-spark": [
        {
          "placeholder": "Spec Bundle transformation scene where natural-language requirements become an approvable bundle with API, state model, and permission policy.",
          "data-placeholder-id": "detail-35"
        },
        {
          "placeholder": "Spec Bundle screen with API, state model, binding, and permission policy organized as a reviewable specification.",
          "data-placeholder-id": "detail-36"
        },
        {
          "placeholder": "Validation and approval gate screen where policy violations, schema mismatches, and unapproved revisions are blocked Fail-closed.",
          "data-placeholder-id": "detail-37"
        },
        {
          "placeholder": "Verification trace report mapping a test failure back to the relevant spec, state transition, or API contract.",
          "data-placeholder-id": "detail-38"
        }
      ],
      "kao": [
        {
          "placeholder": "KAO role-bridge image where Blue carries build, Red review, Orange user check, Grey docs, and Teal UX pieces into one deliverable.",
          "data-placeholder-id": "detail-39"
        },
        {
          "placeholder": "Color-magpie role map using black magpie silhouettes with Blue, Red, Orange, Grey, and Teal accents to show each responsibility.",
          "data-placeholder-id": "detail-40"
        },
        {
          "placeholder": "Work-completion flow where a human sets the goal, role Agents perform their pieces, and the human confirms the final result.",
          "data-placeholder-id": "detail-41"
        },
        {
          "placeholder": "Project-scoped Agent map showing role-scoped Kkachi Agents separated under project folders to reduce context contamination.",
          "data-placeholder-id": "detail-42"
        }
      ],
      "klm": [
        {
          "placeholder": "Approved Knowledge centered structure where the Agent trusts approved documents most strongly while memory and retrieval results carry different evidence states.",
          "data-placeholder-id": "detail-43"
        },
        {
          "placeholder": "Context trust map separating source of truth, project memory, conversation memory, and retrieval result by trust level.",
          "data-placeholder-id": "detail-44"
        },
        {
          "placeholder": "Pending-context image where a new retrieval result stays outside the review/approval boundary instead of becoming truth immediately.",
          "data-placeholder-id": "detail-45"
        },
        {
          "placeholder": "KLM integration flow where Hermes Agent references LLM Wiki and memory without crossing the approved-document boundary.",
          "data-placeholder-id": "detail-46"
        }
      ],
      "krq": [
        {
          "placeholder": "Research Topic → Verified Knowledge Card → Human Review → Reused by Agents flow.",
          "data-placeholder-id": "detail-47"
        },
        {
          "placeholder": "Black/Yellow research role image where Black reviews project-support knowledge and Yellow strengthens hypothesis background into one verified note set.",
          "data-placeholder-id": "detail-48"
        },
        {
          "placeholder": "Knowledge-card handoff where a research card is passed to Blue, Red, Teal, and other role Agents as context for later work.",
          "data-placeholder-id": "detail-49"
        },
        {
          "placeholder": "Human validation checkpoint where Agent-organized research becomes reusable knowledge only after human review.",
          "data-placeholder-id": "detail-50"
        }
      ]
    }
  };

  const uiText = {
    ko: {
      close: '닫기',
      back: '돌아가기',
      explorer: '관련 기술',
      technologies: '기술 영역',
      imagePlaceholders: '작동 예시',
      currentFile: '상세 설명',
      primaryImage: '대표 이미지',
      visualPlan: '추가 예시',
      folderAria: '기술 폴더 열기 또는 닫기'
    },
    en: {
      close: 'Close',
      back: 'Back',
      explorer: 'Related technologies',
      technologies: 'Technology areas',
      imagePlaceholders: 'Examples',
      currentFile: 'Detail',
      primaryImage: 'Main visual',
      visualPlan: 'Additional example',
      folderAria: 'Open or close technology area'
    }
  };

  const order = ['aipsr', 'agent-technologies', 'hermes-supports'];
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
      src: '/assets/images/agent-1.png',
      alt: {
        ko: 'Doksuri에서 작업 항목, 프로젝트, Agent 설정, Command Center, Review 흐름이 하나의 협업 표면으로 연결되는 제품 이미지',
        en: 'Doksuri product image showing work items, projects, agent settings, Command Center, and review flow connected in one collaboration surface'
      }
    },
    'detail-6': {
      src: '/assets/images/agent-2.png',
      alt: {
        ko: 'Moderator가 여러 AI Agent의 토론 순서를 배정하고 Challenge, Risk, Final brief 항목이 있는 Decision Brief로 정리하는 Agent Turn Network 이미지',
        en: 'Agent Turn Network image showing a moderator-led multi-agent discussion thread connected by turn-order markers to a Decision Brief with challenge, risk, and final brief rows'
      }
    },
    'detail-7': {
      src: '/assets/images/home-2.png',
      alt: {
        ko: 'AI가 제안한 서버 변경이 Spec Check, Policy Check, Human Approval을 거쳐 안전한 runtime 변경으로 이어지는 AI-SPARK 승인 게이트 이미지',
        en: 'AI-SPARK approval-gate image showing an AI-proposed server change passing Spec Check, Policy Check, and Human Approval before reaching runtime'
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
      src: '/assets/images/hermes-3.png',
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
  const folderState = { aipsr: true, 'agent-technologies': true, 'hermes-supports': true };

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

  function chip(status) {
    const label = (statusLabels[lang] || statusLabels.ko)[status] || status;
    return '<span class="status-chip status-' + escapeHtml(status) + '">' + escapeHtml(label) + '</span>';
  }

  function imageEntry(value) {
    if (value && typeof value === 'object') {
      return {
        description: value.caption || value.placeholder,
        placeholderId: value['data-placeholder-id'] || ''
      };
    }
    return {
      description: value,
      placeholderId: ''
    };
  }

  function imageEntries(item) {
    const list = [];
    const seen = new Set();
    function add(value) {
      const entry = imageEntry(value);
      if (!entry.description || seen.has(entry.description)) return;
      seen.add(entry.description);
      list.push(entry);
    }
    add({
      placeholder: item.placeholder,
      'data-placeholder-id': item['data-placeholder-id']
    });
    const extras = ((imageCatalog[lang] || imageCatalog.ko || {})[item.key]) || [];
    extras.forEach(add);
    return list;
  }

  function detailPlaceholderKey(page, item, index) {
    return [page, item.key, String(index)].join(':');
  }

  function explicitDetailPlaceholderId(item) {
    return item['data-placeholder-id'] || '';
  }

  function explicitDetailPlaceholderIds() {
    const ids = new Set();
    order.forEach((page) => {
      pageItems(page).forEach((item) => {
        const placeholderId = explicitDetailPlaceholderId(item);
        if (placeholderId) ids.add(placeholderId);
        const extras = ((imageCatalog[lang] || imageCatalog.ko || {})[item.key]) || [];
        extras.forEach((extra) => {
          const entry = imageEntry(extra);
          if (entry.placeholderId) ids.add(entry.placeholderId);
        });
      });
    });
    return ids;
  }

  function buildDetailPlaceholderIds() {
    const ids = new Map();
    const explicitIds = explicitDetailPlaceholderIds();
    let nextId = 1;
    function nextGeneratedId() {
      let candidate = 'detail-' + String(nextId);
      while (explicitIds.has(candidate)) {
        nextId += 1;
        candidate = 'detail-' + String(nextId);
      }
      nextId += 1;
      return candidate;
    }
    order.forEach((page) => {
      pageItems(page).forEach((item) => {
        imageEntries(item).forEach((entry, index) => {
          const itemPlaceholderId = index === 0 ? explicitDetailPlaceholderId(item) : '';
          const placeholderId = entry.placeholderId || itemPlaceholderId || nextGeneratedId();
          ids.set(detailPlaceholderKey(page, item, index), placeholderId);
        });
      });
    });
    return ids;
  }

  const detailPlaceholderIds = buildDetailPlaceholderIds();

  function detailPlaceholderId(page, item, index) {
    return detailPlaceholderIds.get(detailPlaceholderKey(page, item, index)) || 'detail-' + String(index + 1);
  }

  function imageList(page, item) {
    return imageEntries(item).map((entry, index) => ({
      description: entry.description,
      placeholderId: entry.placeholderId || detailPlaceholderId(page, item, index)
    }));
  }

  function imageAsset(image) {
    const asset = reusableDetailImages[image.placeholderId];
    if (!asset) return null;
    return {
      src: asset.src,
      alt: (asset.alt && (asset.alt[lang] || asset.alt.ko || asset.alt.en)) || image.description
    };
  }

  function renderImageFigure(image, index) {
    const label = index === 0 ? text.primaryImage : text.visualPlan + ' ' + index;
    const asset = imageAsset(image);
    if (!asset) return '';
    return '<figure class="card-asset-figure detail-image-asset" data-placeholder-id="' + escapeHtml(image.placeholderId) + '">' +
      '<img src="' + escapeHtml(asset.src) + '" alt="' + escapeHtml(asset.alt) + '" width="1672" height="941" decoding="async" loading="lazy">' +
      '<figcaption><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(asset.alt) + '</span></figcaption>' +
      '</figure>';
  }

  function renderImageSection(page, item) {
    const images = imageList(page, item).slice(1).filter(imageAsset);
    if (!images.length) return '';
    return '<section class="doc-image-section">' +
      '<h3>' + escapeHtml(text.imagePlaceholders) + '</h3>' +
      '<div class="detail-image-grid">' + images.map((image, index) => renderImageFigure(image, index + 1)).join('') + '</div>' +
      '</section>';
  }

  function renderSections(item) {
    return (item.sections || []).map((section) => {
      const list = Array.isArray(section.list) ? '<ul>' + section.list.map((li) => '<li>' + escapeHtml(li) + '</li>').join('') + '</ul>' : '';
      const body = section.body ? '<p>' + escapeHtml(section.body) + '</p>' : '';
      return '<section class="doc-block"><h3>' + escapeHtml(section.heading) + '</h3>' + body + list + '</section>';
    }).join('');
  }

  function renderMain(page, item) {
    const breadcrumb = (labels[page]?.title || page) + ' / ' + item.title;
    const images = imageList(page, item);
    const heroFigure = images[0] ? renderImageFigure(images[0], 0) : '';
    const heroImage = heroFigure ? '<div class="doc-hero-image">' + heroFigure + '</div>' : '';
    return '<article class="workspace-document">' +
      '<div class="file-tab"><span>' + escapeHtml(breadcrumb) + '</span>' + chip(item.status) + '</div>' +
      '<header class="doc-head"><p class="eyebrow">' + escapeHtml(text.currentFile) + '</p><h2>' + escapeHtml(item.title) + '</h2><p class="hero-lead">' + escapeHtml(item.subtitle) + '</p><p>' + escapeHtml(item.summary || '') + '</p></header>' +
      heroImage +
      '<div class="doc-sections">' + renderSections(item) + '</div>' +
      renderImageSection(page, item) +
      '</article>';
  }

  function removeBrokenDetailImage(event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    const figure = image.closest('.detail-image-asset');
    if (!figure) return;

    const heroWrap = figure.closest('.doc-hero-image');
    const imageSection = figure.closest('.doc-image-section');
    figure.remove();
    if (heroWrap && !heroWrap.querySelector('.detail-image-asset')) {
      heroWrap.remove();
    }
    if (imageSection && !imageSection.querySelector('.detail-image-asset')) {
      imageSection.remove();
    }
  }

  function renderTree() {
    return order.map((page) => {
      const meta = labels[page] || { title: page, short: page };
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
  }

  function closeWorkspace() {
    if (!shell) return;
    shell.classList.remove('is-open');
    shell.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('detail-lock');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  function buildShell() {
    const el = document.createElement('div');
    el.className = 'detail-root';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="workspace-body">' +
        '<button class="workspace-close" type="button" aria-label="' + escapeHtml(text.close) + '">×</button>' +
        '<aside class="workspace-sidebar" aria-label="' + escapeHtml(text.technologies) + '">' +
          '<div class="sidebar-header"><button class="sidebar-back" type="button" aria-label="' + escapeHtml(text.back) + '">‹</button><div class="sidebar-head-text"><span>' + escapeHtml(text.explorer) + '</span><strong>' + escapeHtml(text.technologies) + '</strong></div></div>' +
          '<nav class="sidebar-tree" role="tree" data-workspace-nav></nav>' +
        '</aside>' +
        '<main class="workspace-main" tabindex="-1" data-workspace-main></main>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('error', removeBrokenDetailImage, true);
    el.querySelector('.workspace-close').addEventListener('click', closeWorkspace);
    el.querySelector('.sidebar-back').addEventListener('click', closeWorkspace);
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
})();
