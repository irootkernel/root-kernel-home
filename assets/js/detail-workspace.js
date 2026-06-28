window.ROOT_KERNEL_DETAIL = {
  "ko": {
    "ui": {
      "close": "닫기",
      "technologies": "TECHNOLOGIES",
      "current_file": "CURRENT FILE",
      "placeholder": "Image Placeholder",
      "detail": "Detail Workspace"
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
              "heading": "Overview",
              "body": "Sudal은 사람들이 이미지 기반 A/B 선택, 밸런스 게임, 실시간 비교를 통해 자연스럽게 취향, 선호, 컬러, 디자인, 스타일 데이터를 남기도록 설계된 interactive preference data collection layer입니다."
            },
            {
              "heading": "Role in AI Persona Synthesis Research",
              "body": "Sudal의 반복 선택 데이터와 visual preference signal은 Space Compiler가 preference-grounded AI Persona를 만들기 위한 입력 데이터가 됩니다."
            },
            {
              "heading": "What it collects",
              "list": [
                "텍스트 기반 밸런스 게임 선택",
                "이미지 기반 forced-choice 선택",
                "컬러, 디자인, 스타일, 분위기에 대한 visual preference signal",
                "질문 맥락과 반복 선택 패턴"
              ]
            },
            {
              "heading": "Current position",
              "body": "외부 공개 출시는 아직 전입니다. 홈페이지에서는 출시 준비중 제품으로 표현하고, 실제 동작 화면을 통해 제품 실체를 보여주는 것이 좋습니다."
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
              "heading": "Overview",
              "body": "Space Compiler는 AI 기술과 심리계량학(Psychometrics) 연구를 결합하여, 사람의 반복 선택 데이터와 이미지 기반 취향 데이터를 신뢰할 수 있는 취향 공간 및 가상 고객 페르소나로 변환하는 시스템을 구축하고 있습니다."
            },
            {
              "heading": "Processing flow",
              "body": "Raw Choice → Visual and Text Preference Signal → Latent Trait Estimation → Demographic Calibration → Evidence Mapping → Confidence Scoring → Persona Artifact 흐름을 지향합니다."
            },
            {
              "heading": "Research Foundations (학술 연구 기반)",
              "list": [
                "Generative Agents (Park et al., 2023): LLM 기반 에이전트의 기억(Memory), 반성(Reflection), 계획(Planning) 메커니즘을 통한 인간 행동 시뮬레이션 타당성을 에이전트 설계의 근간으로 삼습니다. [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)",
                "Forced-Choice Image Assessment (Hilliard et al., 2022): 약 5분간의 이미지 A/B 선택(Forced-Choice)만으로도 기존 120문항의 Big Five 성격검사(IPIP-NEO-120)와 높은 상관관계(수렴 타당도 O=.71, C=.70, E=.78, A=.60, ES=.70)를 낼 수 있음을 입증하여, Sudal의 A/B 선택 데이터를 신뢰도 높은 심리적 선호 신호로 다룰 수 있는 근거를 제공합니다. [DOI: 10.3390/jintelligence10010012](https://doi.org/10.3390/jintelligence10010012)",
                "MIRT & Thurstonian IRT (TIRT): 일반 척도와 달리 A/B 선택은 ipsative(상호 간섭) 문제를 유발하여 단순히 점수를 합산할 수 없습니다. Space Compiler는 Thurstonian IRT 모델을 적용해 선택을 잠재 유틸리티의 상대적 크기로 모델링하여 다차원 성향(Multidimensional Item Response Theory)을 강인하게 추정합니다."
              ]
            },
            {
              "heading": "Mathematical Model (수학적 유틸리티 모델링)",
              "body": "선택지 j와 k에 대해 사용자가 j를 더 선호할 확률은 Thurstonian IRT 프레임워크에 따라 다음과 같이 모델링됩니다: P(U_j > U_k) = Φ((μ_j - μ_k) / sqrt(σ_j^2 + σ_k^2 - 2σ_jk)). 이를 통해 각 문항의 정보량(Item Information)하고 변별력(Discrimination)을 계산하고, 추정 벡터의 신뢰도(Confidence)와 근거(Evidence)를 통계적으로 도출합니다."
            },
            {
              "heading": "Safe Scope & Limitations (안전성 범위 및 제약)",
              "body": "Space Compiler는 임상적 심리 진단 도구가 아니며, 개인의 모든 내면을 완벽히 아는 것을 목표로 하지 않습니다. 실제 오프라인 고객 조사를 100% 대체하기보다, 고비용의 본 조사 진행 전에 가설을 빠르게 좁히고 아이디어를 반복 탐색하는 사전 연구(Pre-research) 인프라로 정의됩니다. R&D MVP 단계는 deterministic baseline(weighted_linear_v0)으로 안정적으로 시작하여, 충분한 calibration 데이터가 쌓인 이후 TIRT/MIRT 기반 적합 모델로 단계적으로 고도화합니다."
            },
            {
              "heading": "Outputs",
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
              "heading": "Current position",
              "body": "핵심 엔진이지만 아직 연구 및 초기 구현 단계입니다. 완성형 dashboard보다 데이터 흐름, 모델 경계, confidence와 evidence 연결 방식을 보여주는 rough diagram이 적합합니다."
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
              "heading": "Overview",
              "body": "Vision Feedback은 디자인 반응을 가진 AI Persona와 synthetic audience 활용해 상품, 브랜드, 광고, 패키지, UI 시안 반응을 사전 탐색하는 AI Persona Synthesis Research의 첫 적용 방향입니다."
            },
            {
              "heading": "Use cases",
              "list": [
                "상품 패키지 디자인",
                "브랜드 이미지와 무드보드",
                "광고 소재와 썸네일",
                "UI 화면과 온보딩",
                "컬러 팔레트와 스타일 방향"
              ]
            },
            {
              "heading": "Output direction",
              "body": "Design Response Report, Segment Reaction Map, Visual Preference Profile, Persona Reaction Note, Risk and Question List 같은 산출물로 이어지는 방향을 지향합니다."
            },
            {
              "heading": "Current position",
              "body": "현재 판매 가능한 PoC로 표현하지 않습니다. Sudal 데이터 수집과 Space Compiler 구현 이후에 연결될 첫 application direction으로 보여주는 것이 적절합니다."
            }
          ]
        },
        {
          "key": "ai-persona-synthetic-audience",
          "title": "AI Persona & Synthetic Audience",
          "subtitle": "AI Persona Pool as a Service",
          "status": "platform",
          "summary": "Vision Feedback을 넘어 설문조사와 여론조사에 활용할 수 있는 AI Persona Pool을 만들고, 장기적으로 조사 기관에 persona pool을 제공하는 서비스형 인프라를 지향합니다.",
          "placeholder": "AI Persona Pool 컨셉 이미지. 실제 사람 사진 없이 추상 Persona Card들이 하나의 Synthetic Audience로 묶이고, 옆에는 coverage, confidence, limitation만 작은 신뢰 표시로 배치. 완성형 SaaS 대시보드가 아니라 장기 플랫폼 방향처럼 보이게 처리.",
          "data-placeholder-id": "detail-4",
          "sections": [
            {
              "heading": "Overview",
              "body": "AI Persona & Synthetic Audience는 개별 AI Persona, persona pool, synthetic audience를 하나의 장기 플랫폼 방향으로 묶은 개념입니다. Vision Feedback에서 시작하되, 최종적으로는 설문조사와 여론조사에도 활용할 수 있는 AI Persona Pool as a Service를 지향합니다."
            },
            {
              "heading": "What it provides",
              "list": [
                "조사 목적에 맞는 AI Persona Pool 구성",
                "모집단 조건, 세그먼트, confidence, coverage 확인",
                "설문 문항 응답 시뮬레이션과 persona interview",
                "여론조사·시장조사 기관이 사용할 수 있는 persona pool 제공"
              ]
            },
            {
              "heading": "Why it matters",
              "body": "Vision Feedback은 첫 적용 제품이고, AI Persona Pool as a Service는 그 이후의 확장 방향입니다. 제품·디자인 반응을 넘어 브랜드 조사, 설문조사, 여론조사의 사전 가설 탐색과 패널 보완에 쓰일 수 있는 인프라로 발전시키는 계획입니다."
            },
            {
              "heading": "Boundary",
              "body": "실제 사람 조사를 대체한다고 표현하지 않습니다. 실제 조사 전에 가설을 좁히고, 질문을 정리하고, 조사기관이 보유한 패널과 함께 사용할 수 있는 보완적 persona pool로 설명하는 것이 적절합니다."
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
          "summary": "회사 활동 전반에서 사람과 AI Agent가 같은 Markdown 문서를 읽고 쓰며 업무 지시, 결과, evidence, review를 기록하는 협업 표면입니다.",
          "placeholder": "Doksuri 은유 이미지. 독수리가 흩어진 Markdown 문서 조각 중 필요한 요구사항과 evidence를 정확히 낚아채고, 오른쪽 작업 문서에 Agent comment, 작업 결과, review 상태로 정리되는 장면.",
          "data-placeholder-id": "detail-5",
          "sections": [
            {
              "heading": "Overview",
              "body": "Doksuri는 Markdown을 기반으로 사람과 AI Agent가 같은 사내 문서를 읽고 쓰며 협업하는 Human-AI Collaboration Platform입니다. Root Kernel에서는 AI Agent와 소통하고 작업 기록을 남기는 기본 표면으로 사용됩니다."
            },
            {
              "heading": "Why Markdown",
              "body": "Markdown은 단순 문서 포맷이 아니라, 사람과 Agent가 함께 읽고 쓰는 업무 인터페이스가 됩니다."
            },
            {
              "heading": "Workflow",
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
          "summary": "Moderator가 turn을 배정해 여러 AI Agent가 각자의 역할과 관점에서 발언하고, 서로의 주장에 반박하도록 만드는 deliberation layer입니다.",
          "placeholder": "ATN 대본형 토론 화면. Moderator가 Product, Architecture, Risk, User 역할의 발언 순서를 배정하고, 마지막에는 Decision Brief 하나만 표시.",
          "data-placeholder-id": "detail-6",
          "sections": [
            {
              "heading": "Overview",
              "body": "ATN, Agent Turn Network는 moderator가 발언 순서를 배정해 여러 AI Agent가 하나의 문제에 대해 관점을 나누어 토론하도록 만드는 multi-agent deliberation system입니다. Root Kernel에서는 AI들이 말만 많이 한 뒤 마지막에 합성되는 방식이 아니라, 발언과 반박의 흐름을 대본처럼 확인할 수 있는 토론 구조로 사용합니다."
            },
            {
              "heading": "Deliberation flow",
              "list": [
                "Moderator가 다음 발언자를 지정합니다.",
                "각 Agent가 역할 기반 의견을 냅니다.",
                "다른 Agent가 이전 발언을 보고 동의하거나 반박합니다.",
                "누가 어떤 순서로 말했고 무엇을 반박했는지 대본처럼 남습니다.",
                "사람의 최종 판단 전에 구조화된 decision material을 제공합니다."
              ]
            },
            {
              "heading": "Use cases",
              "body": "제품 방향, architecture decision, risk review, research question refinement처럼 회사 전반의 중요한 판단에 사용됩니다."
            }
          ]
        },
        {
          "key": "ai-spark",
          "title": "AI-SPARK",
          "subtitle": "AI Spec, Policy, Approval, Runtime Kernel",
          "status": "patent",
          "summary": "Sudal 서비스 서버 개발에 사용된 특허 출원 기술로, 서버 변경을 명세, 정책 검증, 승인 게이트를 통해 다루는 agentic backend development 체계입니다.",
          "placeholder": "AI-SPARK 승인 게이트 그림. Requirement → Spec Bundle → Validator → Human Approval → Safe Runtime을 주 흐름으로 두고, Fail-closed와 ReverseMap은 작은 보조 배지로 표시.",
          "data-placeholder-id": "detail-7",
          "sections": [
            {
              "heading": "Overview",
              "body": "AI-SPARK는 Sudal 서비스 서버 개발 과정에서 사용된 Root Kernel의 특허 출원 기술입니다. 자연어 요구사항을 곧바로 서버 변경으로 보내지 않고, Spec Bundle, Validator, Approval Gate, FSM Runtime 흐름으로 구조화합니다."
            },
            {
              "heading": "Components",
              "list": [
                "Spec Bundle",
                "Validator",
                "Approval Gate",
                "bundle_revision_id",
                "FSM Runtime",
                "ReverseMap",
                "Fail-Closed principle"
              ]
            },
            {
              "heading": "Workflow",
              "body": "Sudal 서버 변경이 필요할 때 요구사항을 먼저 Spec Bundle로 정리하고, 검증과 승인 절차를 통과한 revision만 runtime에 반영하는 구조로 사용되었습니다."
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
          "summary": "Hermes 위에서 수십 개의 project-scoped, role-scoped Kkachi Agent를 운영하는 Agent Operating Model입니다.",
          "placeholder": "KAO 오작교 협업 이미지. 사람이 정한 Epic을 향해 Blue, Red, Orange, Grey, Teal 색 포인트를 가진 까치 Agent들이 작업 조각을 이어 다리를 놓고, 중앙의 deliverable을 완성하는 장면.",
          "data-placeholder-id": "detail-8",
          "sections": [
            {
              "heading": "Overview",
              "body": "KAO, Kkachi Agent Organization은 Root Kernel이 Hermes 위에서 운영하는 AI Agent 조직 모델입니다."
            },
            {
              "heading": "Organization",
              "body": "수십 개의 project-scoped, role-scoped Kkachi Agent가 Blue, Red, Orange, Grey, Teal, Green, Yellow, White, Black 역할 체계로 운영됩니다."
            },
            {
              "heading": "Role Bridge",
              "body": "각 색의 Kkachi Agent가 build, review, user check, docs, UX처럼 서로 다른 역할을 맡고, 사람이 정한 목표를 향해 작업 조각을 이어 하나의 결과물로 완성합니다."
            },
            {
              "heading": "Development Delegation",
              "body": "Blue는 실행, Red는 리뷰, Orange는 사용자 관점, Grey는 문서 정합성, Teal은 UX/UI 판단을 보완합니다. 사람은 방향 설정, 검증 기준, 테스트, 최종 승인에 집중합니다."
            }
          ]
        },
        {
          "key": "klm",
          "title": "KLM",
          "subtitle": "Kkachi Letta Memory",
          "status": "improving",
          "summary": "Hermes Agent가 Letta memory와 LLM Wiki를 더 정확하게 활용하도록 돕는 plugin, daemon, CLI 프로젝트입니다.",
          "placeholder": "KLM 신뢰 경계 이미지. Approved Knowledge, Project Memory, Retrieval Result를 분리하고, Agent가 승인된 지식과 임시 검색 결과를 다르게 취급하는 장면.",
          "data-placeholder-id": "detail-9",
          "sections": [
            {
              "heading": "Overview",
              "body": "KLM, Kkachi Letta Memory는 Hermes Agent가 Letta 기반 memory와 LLM Wiki를 더 정확하게 활용하도록 돕는 plugin, daemon, CLI 프로젝트입니다."
            },
            {
              "heading": "Components",
              "list": [
                "KLM Plugin",
                "KLM Daemon",
                "KLM CLI",
                "Letta memory integration",
                "LLM Wiki retrieval and update policy"
              ]
            },
            {
              "heading": "Memory boundary",
              "body": "KLM은 memory, source of truth, retrieval result를 구분해 Agent가 더 정확하게 작업하도록 돕는 integration layer입니다."
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
              "heading": "Overview",
              "body": "KRQ, Kkachi Research Queue는 Black과 Yellow Kkachi Agent가 주로 사용하는 Agent Knowledge Operations Pipeline입니다."
            },
            {
              "heading": "Flow",
              "body": "Research Topic → Verified Notes → LLM Wiki Entry → Index Update → Search CLI → Project Agents and Human Review 흐름으로 작동합니다."
            },
            {
              "heading": "Roles",
              "list": [
                "Black은 회사와 프로젝트 committee 관점에서 필요한 정보를 수집하고 재구성합니다.",
                "Yellow는 연구 주제의 논리적 배경과 가설 후보를 강화합니다.",
                "사용자는 필요할 때 방향을 조정해 탐색 범위를 넓힙니다."
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
      "technologies": "TECHNOLOGIES",
      "current_file": "CURRENT FILE",
      "placeholder": "Image Placeholder",
      "detail": "Detail Workspace"
    },
    "pages": {
      "aipsr": [
        {
          "key": "sudal",
          "title": "Sudal",
          "subtitle": "Interactive Preference Data Collection Layer",
          "status": "prelaunch",
          "summary": "A product for collecting preference and visual taste data through image-based A/B choices and balance games.",
          "placeholder": "Sudal product screen. Show a mobile moment where a user chooses between two images and that choice is saved as a small preference-signal chip.",
          "data-placeholder-id": "detail-1",
          "sections": [
            {
              "heading": "Overview",
              "body": "Sudal is an interactive preference data collection layer designed for people to leave preference, color, design, and style signals through image-based A/B choices, balance games, and repeated comparison."
            },
            {
              "heading": "Role in AI Persona Synthesis Research",
              "body": "Sudal’s repeated choice data and visual preference signals become inputs for Space Compiler."
            },
            {
              "heading": "What it collects",
              "list": [
                "Text-based balance-game choices",
                "Image-based forced-choice signals",
                "Visual preference around color, design, style, and mood",
                "Question context and repeated choice patterns"
              ]
            },
            {
              "heading": "Current position",
              "body": "Sudal is presented as a pre-launch product. Real working screens should make the product tangible."
            }
          ]
        },
        {
          "key": "space-compiler",
          "title": "Space Compiler",
          "subtitle": "Preference & Persona Synthesis Engine",
          "status": "research",
          "summary": "A synthesis engine fusing AI with psychometrics to research and build systems that transform choice data into persona artifacts.",
          "placeholder": "Space Compiler transformation image. Show repeated choices and visual taste signals compressed into one Preference Vector, then transformed into a taste-grounded Persona Artifact. Evidence and Confidence appear only as small trust badges.",
          "data-placeholder-id": "detail-2",
          "sections": [
            {
              "heading": "Overview",
              "body": "Space Compiler is a Preference & Persona Synthesis Engine fusing AI with psychometrics, researching and building systems to transform repeated choice data into reliable preference spaces and persona artifacts."
            },
            {
              "heading": "Processing flow",
              "body": "Raw Choice → Visual and Text Preference Signal → Latent Trait Estimation → Demographic Calibration → Evidence Mapping → Confidence Scoring → Persona Artifact."
            },
            {
              "heading": "Research Foundations",
              "list": [
                "Generative Agents (Park et al., 2023): Adopts the memory, reflection, and planning mechanisms of LLM agents as architectural validation for human behavior simulation. [arXiv:2304.03442](https://arxiv.org/abs/2304.03442)",
                "Forced-Choice Image Assessment (Hilliard et al., 2022): Leverages empirical findings showing a 5-minute image-based forced-choice test correlates strongly with traditional Big Five personality inventories (IPIP-NEO-120 convergent validity: O=.71, C=.70, E=.78, A=.60, ES=.70), validating Sudal's A/B UX as a robust behavioral preference signal. [DOI: 10.3390/jintelligence10010012](https://doi.org/10.3390/jintelligence10010012)",
                "MIRT & Thurstonian IRT (TIRT): Unlike standard rating scales, A/B choices introduce ipsative measurement issues (where choosing one option automatically constrains other scores). We apply a Thurstonian IRT model to represent pairwise choices as utility comparisons, enabling robust estimation of multidimensional trait vectors."
              ]
            },
            {
              "heading": "Mathematical Model",
              "body": "By setting latent utility variables U_j and U_k for options j and k, the probability of selecting option j over k is modeled using a Thurstonian IRT framework: P(U_j > U_k) = Φ((μ_j - μ_k) / sqrt(σ_j^2 + σ_k^2 - 2σ_jk)). This enables the calculation of Item Information and discrimination, outputting statistical confidence scores and evidence trails."
            },
            {
              "heading": "Safe Scope & Limitations",
              "body": "Space Compiler is not a clinical diagnostic tool and does not aim to perfectly predict individual psychology. Instead of replacing real-world customer research, it serves as a pre-research exploratory infrastructure to narrow down design hypotheses. The MVP starts with a robust deterministic baseline (weighted_linear_v0), and will scale to fully calibrated TIRT/MIRT models as empirical response data accumulates."
            },
            {
              "heading": "Outputs",
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
              "heading": "Current position",
              "body": "It is a core engine in research and early implementation. Use rough system diagrams rather than polished product dashboards."
            }
          ]
        },
        {
          "key": "vision-feedback",
          "title": "Vision Feedback with AI Persona",
          "subtitle": "First application direction for AI Persona Synthesis Research",
          "status": "direction",
          "summary": "The first application direction for exploring reactions to product, brand, advertising, package, and UI designs with AI Personas and synthetic audiences.",
          "placeholder": "Vision Feedback early exploration screen. Place three design variants beside AI Persona reaction cards showing only preference reason, rejection reason, and next validation question.",
          "data-placeholder-id": "detail-3",
          "sections": [
            {
              "heading": "Overview",
              "body": "Vision Feedback is the first application direction for using AI Personas and synthetic audiences to explore reactions to product, brand, advertising, packaging, and UI design variants."
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
              "heading": "Output direction",
              "body": "It connects to Design Response Report, Segment Reaction Map, Visual Preference Profile, Persona Reaction Note, and Risk and Question List."
            },
            {
              "heading": "Current position",
              "body": "Do not present it as a currently sold PoC product. Present it as the first application direction after Sudal data collection and Space Compiler implementation."
            }
          ]
        },
        {
          "key": "ai-persona-synthetic-audience",
          "title": "AI Persona & Synthetic Audience",
          "subtitle": "AI Persona Pool as a Service",
          "status": "platform",
          "summary": "Beyond Vision Feedback, Root Kernel aims to build AI Persona Pools for surveys and polling, and long-term infrastructure that can provide persona pools to research and polling organizations.",
          "placeholder": "AI Persona Pool concept image. Abstract Persona Cards combine into one Synthetic Audience, with coverage, confidence, and limitation shown only as small trust markers. Keep it from looking like a finished SaaS dashboard.",
          "data-placeholder-id": "detail-4",
          "sections": [
            {
              "heading": "Overview",
              "body": "AI Persona & Synthetic Audience groups individual AI Personas, persona pools, and synthetic audiences into one long-term platform direction. It starts from Vision Feedback, but ultimately points toward AI Persona Pool as a Service for surveys and polling."
            },
            {
              "heading": "What it provides",
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
              "heading": "Boundary",
              "body": "It should not be presented as a replacement for real-human research. It is better framed as a complementary persona pool for narrowing hypotheses, improving questions, and supporting research organizations alongside their own panels."
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
              "heading": "Overview",
              "body": "Doksuri is a Markdown-native Human-AI Collaboration Platform where people and AI Agents read and write the same internal documents. Root Kernel uses it as the main surface for communicating with AI Agents and preserving work records."
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
              "heading": "Overview",
              "body": "ATN, Agent Turn Network, is a multi-agent deliberation system where a moderator assigns speaking turns so AI Agents can discuss one problem from different roles. Root Kernel uses it to avoid loose multi-agent chatter that only gets summarized at the end, making the sequence of statements and challenges visible like a script."
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
          "summary": "Patent-pending technology used in Sudal service server development to handle server changes through specifications, validation policies, and approval gates.",
          "placeholder": "AI-SPARK approval-gate image. Use Requirement → Spec Bundle → Validator → Human Approval → Safe Runtime as the main flow, with Fail-closed and ReverseMap as small support badges.",
          "data-placeholder-id": "detail-7",
          "sections": [
            {
              "heading": "Overview",
              "body": "AI-SPARK is Root Kernel’s patent-pending technology used during Sudal service server development. Instead of sending natural language requirements directly into server changes, it structures them through Spec Bundle, Validator, Approval Gate, and FSM Runtime."
            },
            {
              "heading": "Components",
              "list": [
                "Spec Bundle",
                "Validator",
                "Approval Gate",
                "bundle_revision_id",
                "FSM Runtime",
                "ReverseMap",
                "Fail-Closed principle"
              ]
            },
            {
              "heading": "Workflow",
              "body": "When Sudal server changes are needed, requirements are first organized into a Spec Bundle, then only validated and approved revisions are reflected into runtime."
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
          "summary": "A Hermes-based Agent Operating Model with dozens of project-scoped and role-scoped Kkachi Agents.",
          "placeholder": "KAO magpie-bridge collaboration image. Toward one human-defined Epic, magpie Agents with Blue, Red, Orange, Grey, and Teal color accents connect work pieces like a bridge and complete one central deliverable.",
          "data-placeholder-id": "detail-8",
          "sections": [
            {
              "heading": "Overview",
              "body": "KAO, Kkachi Agent Organization, is Root Kernel’s AI Agent organization model operating on Hermes."
            },
            {
              "heading": "Organization",
              "body": "Dozens of project-scoped and role-scoped Kkachi Agents operate across Blue, Red, Orange, Grey, Teal, Green, Yellow, White, and Black roles."
            },
            {
              "heading": "Role Bridge",
              "body": "Each colored Kkachi Agent carries a different role such as build, review, user check, docs, or UX, then connects its work piece toward the human-defined goal."
            },
            {
              "heading": "Development Delegation",
              "body": "Blue leads execution, Red reviews, Orange checks user perspective, Grey handles document consistency, and Teal supports UX/UI judgment. The human keeps direction, validation criteria, testing, and final approval."
            }
          ]
        },
        {
          "key": "klm",
          "title": "KLM",
          "subtitle": "Kkachi Letta Memory",
          "status": "improving",
          "summary": "A plugin, daemon, and CLI project that helps Hermes Agents use Letta memory and LLM Wiki more accurately.",
          "placeholder": "KLM trust-boundary image. Separate Approved Knowledge, Project Memory, and Retrieval Result, showing that an Agent treats approved knowledge differently from temporary search results.",
          "data-placeholder-id": "detail-9",
          "sections": [
            {
              "heading": "Overview",
              "body": "KLM, Kkachi Letta Memory, is a plugin, daemon, and CLI project that helps Hermes Agents use Letta-based memory and LLM Wiki more accurately."
            },
            {
              "heading": "Components",
              "list": [
                "KLM Plugin",
                "KLM Daemon",
                "KLM CLI",
                "Letta memory integration",
                "LLM Wiki retrieval and update policy"
              ]
            },
            {
              "heading": "Memory boundary",
              "body": "KLM helps separate memory, source of truth, and retrieval results so Agents can work with more accurate context."
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
              "heading": "Overview",
              "body": "KRQ, Kkachi Research Queue, is an Agent Knowledge Operations Pipeline mainly used by Black and Yellow Kkachi Agents."
            },
            {
              "heading": "Flow",
              "body": "Research Topic → Verified Notes → LLM Wiki Entry → Index Update → Search CLI → Project Agents and Human Review."
            },
            {
              "heading": "Roles",
              "list": [
                "Black collects and reframes project support knowledge from a company committee perspective.",
                "Yellow strengthens the logical background and hypothesis candidates for research topics.",
                "The user can guide scope and direction when needed."
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
          "placeholder": "Sudal 제품 경험 이미지. 분석 dashboard보다 사용자가 취향을 표현하는 선택의 순간을 중심에 둔 화면.",
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
          "placeholder": "Persona artifact preview. demographic profile, visual preference profile, evidence links, confidence, version이 하나의 artifact로 정리된 mockup.",
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
          "placeholder": "초기 검토 결과 화면. 완성형 리포트가 아니라 다음 디자인 실험을 정하기 위한 shortlist와 risk question 중심.",
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
          "placeholder": "Deliberation transcript mockup. 발언, 근거, 반론, unresolved issue가 시간순으로 정리되고 마지막에 Decision Brief가 붙은 화면.",
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
          "placeholder": "Spec Bundle 화면. API, state model, binding, permission policy, bundle_revision_id가 하나의 명세 묶음으로 정리된 mockup.",
          "data-placeholder-id": "detail-36"
        },
        {
          "placeholder": "Validation and approval gate. policy violation, schema mismatch, unapproved revision이 Fail-closed로 차단되는 화면.",
          "data-placeholder-id": "detail-37"
        },
        {
          "placeholder": "ReverseMap debug flow. 테스트 실패가 관련 spec, state transition, API contract로 되돌아가 원인을 찾는 리포트.",
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
          "placeholder": "Research Topic → Verified Knowledge Card → Reused by Agents 흐름. Wiki Entry와 Search CLI는 작은 보조 표식으로만 표시.",
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
          "placeholder": "Sudal product-experience image centered on the user’s moment of expressing taste, not an analytics dashboard.",
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
          "placeholder": "Deliberation transcript mockup showing statements, evidence, objections, unresolved issues, and one final Decision Brief.",
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
          "placeholder": "Spec Bundle screen with API, state model, binding, permission policy, and bundle_revision_id.",
          "data-placeholder-id": "detail-36"
        },
        {
          "placeholder": "Validation and approval gate screen where policy violations, schema mismatches, and unapproved revisions are blocked Fail-closed.",
          "data-placeholder-id": "detail-37"
        },
        {
          "placeholder": "ReverseMap debug report mapping test failure back to the relevant spec, state transition, or API contract.",
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
          "placeholder": "Research Topic → Verified Knowledge Card → Reused by Agents flow, with Wiki Entry and Search CLI only as small support marks.",
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
      explorer: 'EXPLORER',
      technologies: 'Technologies',
      imagePlaceholders: 'Image Placeholders',
      currentFile: 'CURRENT FILE',
      primaryImage: 'Primary image',
      visualPlan: 'Visual plan',
      folderAria: '기술 폴더 열기 또는 닫기'
    },
    en: {
      close: 'Close',
      back: 'Back',
      explorer: 'EXPLORER',
      technologies: 'Technologies',
      imagePlaceholders: 'Image Placeholders',
      currentFile: 'CURRENT FILE',
      primaryImage: 'Primary image',
      visualPlan: 'Visual plan',
      folderAria: 'Open or close technology folder'
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
    'detail-6': {
      src: '/assets/images/agent-2.png',
      alt: {
        ko: 'Moderator가 여러 AI Agent의 토론 순서를 배정하고 Challenge, Risk, Final brief 항목이 있는 Decision Brief로 정리하는 Agent Turn Network 이미지',
        en: 'Agent Turn Network image showing a moderator-led multi-agent discussion thread connected by turn-order markers to a Decision Brief with challenge, risk, and final brief rows'
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

  function slug(value) {
    return String(value || 'detail').toLowerCase().replace(/[^a-z0-9가-힣]+/gi, '-').replace(/^-|-$/g, '') || 'detail';
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
        description: value.placeholder,
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
    if (asset) {
      return '<figure class="card-asset-figure detail-image-asset" data-placeholder-id="' + escapeHtml(image.placeholderId) + '">' +
        '<img src="' + escapeHtml(asset.src) + '" alt="' + escapeHtml(asset.alt) + '" width="1672" height="941" decoding="async" loading="lazy">' +
        '<figcaption><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(image.description) + '</span></figcaption>' +
        '</figure>';
    }
    return '<figure class="image-placeholder detail-image-placeholder" data-placeholder-id="' + escapeHtml(image.placeholderId) + '">' +
      '<div class="placeholder-grid" aria-hidden="true"></div>' +
      '<figcaption><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(image.description) + '</span></figcaption>' +
      '</figure>';
  }

  function renderImageSection(page, item) {
    const images = imageList(page, item).slice(1);
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
    const filename = (labels[page]?.path || page) + '/' + slug(item.title) + '.md';
    const images = imageList(page, item);
    const heroImage = images[0] ? '<div class="doc-hero-image">' + renderImageFigure(images[0], 0) + '</div>' : '';
    return '<article class="workspace-document">' +
      '<div class="file-tab"><span>' + escapeHtml(filename) + '</span>' + chip(item.status) + '</div>' +
      '<header class="doc-head"><p class="eyebrow">' + escapeHtml(text.currentFile) + '</p><h2>' + escapeHtml(item.title) + '</h2><p class="hero-lead">' + escapeHtml(item.subtitle) + '</p><p>' + escapeHtml(item.summary || '') + '</p></header>' +
      heroImage +
      '<div class="doc-sections">' + renderSections(item) + '</div>' +
      renderImageSection(page, item) +
      '</article>';
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
