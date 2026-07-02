window.ROOT_KERNEL_DETAIL = {
  "ko": {
    "pages": {
      "aipsr": [
        {
          "key": "sudal",
          "title": "Sudal",
          "subtitle": "Interactive Preference Data Collection Layer",
          "status": "prelaunch",
          "summary": "이미지 기반 A/B 선택과 밸런스 게임을 통해 취향과 시각적 선호 데이터를 수집합니다.",
          "data-placeholder-id": "detail-1",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Sudal은 사람들이 이미지 기반 A/B 선택과 밸런스 게임을 하며 자연스럽게 취향과 시각적 선호 데이터를 남기도록 설계된 interactive preference data collection layer입니다."
            },
            {
              "heading": "AI Persona 연구에서의 역할",
              "body": "Sudal에서 쌓이는 반복 선택 데이터와 시각적 선호 신호는 Space Compiler가 preference-grounded AI Persona를 만드는 기반 데이터가 됩니다."
            },
            {
              "heading": "수집하는 데이터",
              "list": [
                "텍스트와 이미지 기반 밸런스 게임",
                "컬러, 디자인, 스타일, 분위기에 대한 시각적 선호 신호",
                "질문 맥락과 반복 선택 패턴"
              ]
            },
            {
              "heading": "현재 단계",
              "body": "Sudal은 출시 준비 단계의 제품으로, 이미지 기반 선택 경험과 반복 선택 데이터를 안정적으로 수집하는 구조를 중심으로 개발되고 있습니다."
            }
          ]
        },
        {
          "key": "space-compiler",
          "title": "Space Compiler",
          "subtitle": "Preference & Persona Synthesis Engine",
          "status": "research",
          "summary": "AI와 심리계량학을 결합해 선택 데이터와 이미지 기반 선호를 신뢰성 높은 persona artifact로 변환하는 R&D 엔진입니다.",
          "data-placeholder-id": "detail-2",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Space Compiler는 Sudal에서 쌓인 반복 선택 데이터와 시각적 선호 신호를 분석해 Preference Vector와 AI Persona로 변환합니다. 사용자가 어떤 이미지와 스타일을 반복해서 선택했는지를 바탕으로 취향의 방향과 강도를 추정합니다."
            },
            {
              "heading": "처리 흐름",
              "body": "Raw Choice → Preference Signal → Preference Vector → Evidence Mapping → Confidence Scoring → Persona Artifact 순서로 처리합니다. 선택 데이터를 곧바로 결론으로 바꾸기보다, 각 단계에서 근거와 신뢰도를 함께 남기도록 설계되어 있습니다."
            },
            {
              "heading": "연구 기반",
              "list": [
                "Generative Agents: 기억, 반성, 계획을 가진 에이전트처럼 동작하는 AI Persona 연구 흐름을 참고합니다.",
                "Forced-Choice Image Assessment: 짧은 이미지 A/B 선택이 성향 추정에 의미 있는 신호가 될 수 있다는 연구를 참고합니다.",
                "MIRT/TIRT: A/B 선택의 상대 비교를 다차원 취향 추정으로 연결하는 모델링 방향을 참고합니다."
              ]
            },
            {
              "heading": "MIRT/TIRT 모델링",
              "body": "MIRT와 TIRT는 Space Compiler의 핵심 모델링 방향입니다. MIRT는 취향을 여러 축으로 나누어 추정하고, TIRT는 A/B 선택처럼 서로 비교하는 응답을 잠재 유틸리티 비교로 해석합니다. Space Compiler는 이를 바탕으로 단순 선호 집계보다 더 안정적인 취향 벡터를 만드는 것을 목표로 합니다."
            },
            {
              "heading": "예상 산출물",
              "list": [
                "Persona Pool",
                "Synthetic Audience",
                "Visual Preference Profile",
                "Design Response Report"
              ]
            },
            {
              "heading": "현재 단계",
              "body": "Space Compiler는 연구 및 초기 구현 단계의 핵심 엔진입니다. 선택 데이터가 Preference Vector, Evidence, Confidence, AI Persona로 이어지는 흐름을 검증하는 데 집중하고 있습니다."
            }
          ]
        },
        {
          "key": "vision-feedback",
          "title": "Vision Feedback with AI Persona",
          "subtitle": "First product of AI Persona Synthesis Research",
          "status": "direction",
          "summary": "상품, 브랜드, 광고, 패키지, UI 디자인 반응 분석에 먼저 적용합니다.",
          "data-placeholder-id": "detail-3",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Vision Feedback은 제품, 브랜드, 광고, 패키지, UI 시안에 대한 반응을 AI Persona로 먼저 확인하는 적용 시나리오입니다."
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
              "body": "시안별 선호안, 비선호 이유, 응답군별 후속 질문, 전체 패널 개선 방향, 응답 집계처럼 실제 조사 흐름에서 바로 쓰이는 단위로 정리하는 것을 목표로 합니다."
            },
            {
              "heading": "현재 단계",
              "body": "Vision Feedback은 Sudal의 선택 데이터와 Space Compiler의 Persona 변환 구조를 연결해 가장 먼저 적용할 디자인 반응 조사 영역입니다. 사람 패널을 매번 모집하지 않고, 수만·수십만·수백만 단위의 대규모 Synthetic Audience와 빠르게 대화하며 제품, 브랜드, 광고, 패키지, UI 시안에 대한 선호 이유와 거부 요인, 개선 방향을 수집하고 비교하는 것을 목표로 합니다."
            }
          ]
        },
        {
          "key": "ai-persona-synthetic-audience",
          "title": "AI Persona & Synthetic Audience",
          "subtitle": "AI Persona Pool as a Service",
          "status": "platform",
          "summary": "Vision Feedback을 넘어 더 넓은 설문, 인터뷰, 후속 리서치 흐름을 지원할 AI Persona Pool과 Synthetic Audience 인프라로 확장합니다.",
          "data-placeholder-id": "detail-4",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "AI Persona & Synthetic Audience는 개별 AI Persona를 persona pool과 Synthetic Audience로 확장해 가는 장기 플랫폼 개념입니다. Synthetic Audience는 여러 AI Persona를 조사 목적에 맞게 묶은 가상 고객군입니다."
            },
            {
              "heading": "제공 방향",
              "list": [
                "조사 목적에 맞는 AI Persona Pool 구성",
                "모집단 조건, 세그먼트, confidence, coverage 확인",
                "설문 문항 응답 시뮬레이션과 persona interview 지원",
                "더 넓은 리서치 흐름에서 재사용 가능한 persona pool"
              ]
            },
            {
              "heading": "왜 필요한가",
              "body": "Vision Feedback은 첫 적용 제품이고, AI Persona Pool as a Service는 그 이후의 확장 방향입니다. 기존 설문조사와 인터뷰는 응답자 모집, raw data 수집, 분석에 며칠 이상의 시간과 인건비·패널 비용이 필요합니다. AIPSR은 접촉 가능한 사람 응답과 Synthetic Audience 응답을 함께 다루며, 브랜드 조사와 설문, 후속 인터뷰를 더 빠르고 낮은 비용으로 반복할 수 있는 인프라로 발전하는 것을 목표로 합니다."
            },
            {
              "heading": "사용 범위",
              "body": "AI Persona & Synthetic Audience는 모든 사람 응답을 AI로 대체하려는 방식이 아닙니다. 실제 접촉 가능한 응답자는 사람 응답으로 다루고, 접촉하기 어렵거나 응답이 부족한 세그먼트는 AI Persona와 Synthetic Audience로 보완하는 조사 인프라를 목표로 합니다."
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
          "summary": "사람과 AI Agent가 같은 Markdown 문서를 기반으로 소통하고, 업무 지시부터 작업 결과, evidence, review까지 한곳에 기록하는 협업 도구입니다.",
          "data-placeholder-id": "detail-5",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "Doksuri는 Markdown-native Human-AI Collaboration Platform입니다. AI와의 작업이 채팅창에 흩어지지 않고, 요구사항, 결과, 근거, 리뷰 기록이 하나의 문서 안에 남도록 돕는 협업 도구입니다."
            },
            {
              "heading": "왜 Markdown인가",
              "body": "Markdown은 단순한 문서 포맷이 아니라, 사람과 Agent가 함께 읽고 쓰며 일하는 업무 인터페이스입니다."
            },
            {
              "heading": "작동 흐름",
              "list": [
                "사람이 문서에 업무 요구사항, 판단 기준, 작업 지시를 작성합니다.",
                "Agent는 같은 문서를 읽고 작업하며, 필요한 질문과 결과를 남깁니다.",
                "작업 결과, 근거, 리뷰, 결정 기록은 같은 문서 안에 남습니다.",
                "Kkachi Agent들과 연결되어 회사 전반의 Agent 작업 지시와 결과 기록을 관리합니다."
              ]
            }
          ]
        },
        {
          "key": "atn",
          "title": "ATN",
          "subtitle": "Agent Turn Network",
          "status": "improving",
          "summary": "Moderator가 발언 순서를 배정하고, 여러 AI Agent가 각자의 역할과 관점에서 의견을 내고 서로 검토하도록 돕는 deliberation layer입니다.",
          "data-placeholder-id": "detail-6",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "ATN, Agent Turn Network는 Moderator가 발언 순서를 관리해 여러 AI Agent가 하나의 문제를 역할별로 검토하도록 만드는 구조입니다. 단순히 여러 답변을 모아 요약하는 방식이 아니라, 누가 어떤 근거로 말했고 어떤 반박이 있었는지를 대화 흐름으로 남깁니다."
            },
            {
              "heading": "토론 흐름",
              "list": [
                "Moderator가 다음 발언자를 지정합니다.",
                "각 Agent가 역할에 맞는 의견을 냅니다.",
                "다른 Agent가 이전 발언을 보고 동의하거나 반박합니다.",
                "누가 어떤 순서로 말했고 무엇을 검토했는지 실제 대화 흐름처럼 남습니다.",
                "사람이 최종 판단을 내리기 전에 구조화된 판단 자료를 제공합니다."
              ]
            },
            {
              "heading": "적용 영역",
              "body": "제품 방향, architecture decision, risk review, research question refinement 등 회사 전반의 중요한 판단을 검토하는 데 활용합니다."
            }
          ]
        },
        {
          "key": "ai-spark",
          "title": "AI-SPARK",
          "subtitle": "AI Spec, Policy, Approval, Runtime Kit",
          "status": "patent",
          "summary": "AI가 제안한 서버 변경을 바로 적용하지 않고, 명세화, 검증, 승인 단계를 거쳐 안전하게 반영하는 agentic backend development 기술입니다.",
          "data-placeholder-id": "detail-7",
          "sections": [
            {
              "heading": "무엇인가",
              "body": "AI-SPARK는 자연어 요구사항을 바로 서버 변경으로 반영하지 않고, 먼저 Spec Bundle로 정리한 뒤 Validator와 Approval Gate를 거치게 합니다. AI 개발 속도를 활용하면서도, 승인되지 않은 변경이나 정책 위반이 런타임에 반영되지 않도록 관리합니다."
            },
            {
              "heading": "핵심 구성",
              "list": [
                "Spec Bundle: 요구사항, API, 상태 변경, 권한 조건을 검토 가능한 명세로 묶습니다.",
                "Validator: 정책 위반, 스키마 오류, 승인되지 않은 변경을 사전에 점검합니다.",
                "Approval Gate: 사람이 승인한 변경만 다음 단계로 진행되도록 합니다.",
                "Fail-Closed: 불확실하거나 승인되지 않은 변경은 기본적으로 차단합니다.",
                "Audit Trail: 어떤 요구사항이 어떤 서버 변경으로 이어졌는지 추적할 수 있게 남깁니다."
              ]
            },
            {
              "heading": "작동 흐름",
              "body": "서버 변경이 필요할 때 요구사항을 먼저 검토 가능한 명세로 정리하고, 정책 검증과 사람의 승인을 거친 변경만 반영하는 구조입니다."
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
      "aipsr": [
        {
          "key": "sudal",
          "title": "Sudal",
          "subtitle": "Interactive Preference Data Collection Layer",
          "status": "prelaunch",
          "summary": "A product for collecting preference and visual taste data through image-based A/B choices and balance games.",
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
              "body": "Space Compiler is not a clinical diagnostic tool and does not aim to perfectly predict individual psychology. It is designed to turn grounded choice and preference signals into AI Personas that can participate in Synthetic Audience and design-response workflows, especially where some audience segments are hard to contact or underrepresented. The MVP starts with a robust deterministic baseline (weighted_linear_v0), and will scale to fully calibrated TIRT/MIRT models as empirical response data accumulates."
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
          "summary": "The first application direction for asking Synthetic Audiences about product, brand, advertising, packaging, and UI design drafts.",
          "data-placeholder-id": "detail-3",
          "sections": [
            {
              "heading": "What it is",
              "body": "Vision Feedback is an application scenario for asking Synthetic Audiences about reactions to product, brand, advertising, packaging, and UI design drafts."
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
              "body": "It is designed to organize draft preference, rejection reasons, segment-level follow-up questions, full-panel improvement directions, and response aggregation into units teams can use directly in a research workflow."
            },
            {
              "heading": "Current stage",
              "body": "Vision Feedback is the first design-response research direction to apply after Sudal choice data and Space Compiler persona synthesis are connected. Instead of recruiting a new human panel every time, it aims to let teams quickly interact with Synthetic Audiences at tens of thousands, hundreds of thousands, or millions of responses, gathering and comparing preference reasons, rejection factors, and improvement directions for product, brand, advertising, packaging, and UI variants."
            }
          ]
        },
        {
          "key": "ai-persona-synthetic-audience",
          "title": "AI Persona & Synthetic Audience",
          "subtitle": "AI Persona Pool as a Service",
          "status": "platform",
          "summary": "Beyond Vision Feedback, Root Kernel aims to build AI Persona Pools and Synthetic Audience infrastructure that can support broader surveys, interviews, and research workflows as a later platform direction.",
          "data-placeholder-id": "detail-4",
          "sections": [
            {
              "heading": "What it is",
              "body": "AI Persona & Synthetic Audience groups individual AI Personas, persona pools, and Synthetic Audiences into one long-term platform direction. A Synthetic Audience is a virtual customer group assembled from AI Personas for a specific research purpose."
            },
            {
              "heading": "Service direction",
              "list": [
                "AI Persona Pools configured for a research goal",
                "Population conditions, segments, confidence, and coverage",
                "Survey response simulation and persona interviews",
                "Reusable persona pools for broader research workflows"
              ]
            },
            {
              "heading": "Why it matters",
              "body": "Vision Feedback is the first application product. AI Persona Pool as a Service is the later expansion path: while conventional surveys and interviews can spend days on respondent recruitment, raw-data collection, analysis, labor, and panel costs, AIPSR is planned as infrastructure for combining reachable human responses with Synthetic Audience responses across brand research, surveys, and follow-up interviews at faster iteration speed and lower unit cost."
            },
            {
              "heading": "Usage boundary",
              "body": "AI Persona & Synthetic Audience is not a blanket replacement for every human response. It is intended as research infrastructure that can use real human responses where people can be contacted, while extending or partially replacing hard-to-contact and underrepresented segments with AI Personas and Synthetic Audiences."
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
          "summary": "A collaboration tool where people and AI Agents use the same Markdown documents for task instructions, results, evidence, and review.",
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
          "subtitle": "AI Spec, Policy, Approval, Runtime Kit",
          "status": "patent",
          "summary": "Backend development governance technology that turns AI-proposed server changes into specifications, validation steps, and approval gates before runtime adoption.",
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
          "data-placeholder-id": "detail-8",
          "sections": [
            {
              "heading": "What it is",
              "body": "KAO, Kkachi Agent Organization, is Root Kernel’s role-based AI Agent operating model built on Hermes."
            },
            {
              "heading": "Operating structure",
              "body": "KAO does not ask one AI to do everything. It separates Kkachi Agents by project and role so execution, review, user perspective, documentation consistency, and UX judgment can be handled as distinct responsibilities."
            },
            {
              "heading": "Representative roles",
              "body": "Each colored Kkachi Agent carries a different role such as build, review, user check, docs, or UX, then connects its work piece toward the human-defined goal and final deliverable."
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
          "summary": "A research and knowledge operations system where Black and Yellow Kkachi Agents create verified knowledge cards for reuse by other Agents.",
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
        direction: 'First application direction / in development',
        improving: 'In operation / improving',
        operating_dev: 'In operation / development',
        platform: 'Long-term platform direction',
        patent: 'Patent pending / in development'
      }
    };

    const pageMeta = {
      ko: {
        aipsr: { title: 'AI Persona Synthesis Research' },
        'agent-technologies': { title: 'Agent Technologies' },
        'hermes-supports': { title: 'Hermes Agent Supports' }
      },
      en: {
        aipsr: { title: 'AI Persona Synthesis Research' },
        'agent-technologies': { title: 'Agent Technologies' },
        'hermes-supports': { title: 'Hermes Agent Supports' }
      }
    };
    const uiText = {
      ko: {
        close: '닫기',
        back: '돌아가기',
        explorer: '관련 기술',
        technologies: '기술 영역',
        currentFile: '상세 설명',
        folderAria: '기술 폴더 열기 또는 닫기'
      },
      en: {
        close: 'Close',
        back: 'Back',
        explorer: 'Related technologies',
        technologies: 'Technology areas',
        currentFile: 'Detail',
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
      src: '/assets/images/detail-5.png',
      alt: {
        ko: 'Doksuri에서 작업 항목, 프로젝트, Agent 설정, Command Center, Review 흐름이 하나의 협업 도구로 연결되는 제품 이미지',
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
      src: '/assets/images/detail-7.png',
      alt: {
        ko: 'AI-SPARK에서 Requirement, Spec Bundle, Validator, Human Approval, Safe Runtime 흐름과 Fail-Closed, Audit Trail이 함께 표시되는 승인 게이트 이미지',
        en: 'AI-SPARK approval-gate image showing Requirement, Spec Bundle, Validator, Human Approval, Safe Runtime, Fail-Closed, and Audit Trail in one governed flow'
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

  function imageList(item) {
    const placeholderId = item['data-placeholder-id'] || '';
    return placeholderId ? [{ placeholderId }] : [];
  }

  function imageAsset(image) {
    const asset = reusableDetailImages[image.placeholderId];
    if (!asset) return null;
    return {
      src: asset.src,
      alt: (asset.alt && (asset.alt[lang] || asset.alt.ko || asset.alt.en)) || ''
    };
  }

  function renderImageFigure(image) {
    const asset = imageAsset(image);
    if (!asset) return '';
    return '<figure class="card-asset-figure detail-image-asset" data-placeholder-id="' + escapeHtml(image.placeholderId) + '">' +
      '<img src="' + escapeHtml(asset.src) + '" alt="' + escapeHtml(asset.alt) + '" width="1672" height="941" decoding="async" loading="lazy">' +
      '</figure>';
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
    const images = imageList(item);
    const heroFigure = images[0] ? renderImageFigure(images[0]) : '';
    const heroImage = heroFigure ? '<div class="doc-hero-image">' + heroFigure + '</div>' : '';
    return '<article class="workspace-document">' +
      '<div class="file-tab"><span>' + escapeHtml(breadcrumb) + '</span>' + chip(item.status) + '</div>' +
      '<header class="doc-head"><p class="eyebrow">' + escapeHtml(text.currentFile) + '</p><h2>' + escapeHtml(item.title) + '</h2><p class="hero-lead">' + escapeHtml(item.subtitle) + '</p><p>' + escapeHtml(item.summary || '') + '</p></header>' +
      heroImage +
      '<div class="doc-sections">' + renderSections(item) + '</div>' +
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
