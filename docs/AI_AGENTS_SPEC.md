# STAYnC AI Agents Specification

이 문서는 STAYnC Chat 내에서 작동하는 AI 에이전트들의 역할, 도구 및 상호작용 방식을 정의합니다.

## 1. 에이전트 개요
STAYnC Chat은 단순히 메시지를 주고받는 앱을 넘어, 사용자의 일상과 업무를 돕는 지능형 에이전트들을 포함합니다.

| 에이전트 이름 | 역할 | 주요 특징 |
| :--- | :--- | :--- |
| **Orchestrator** | 대화 관리 및 중앙 제어 | 사용자의 의도를 분석하여 적절한 에이전트에게 할당 |
| **Personal Assistant** | 개인 일정 및 할 일 관리 | 캘린더 연동, 리마인더 설정, 사용자 맞춤형 제안 |
| **Concierge** | 정보 검색 및 예약 보조 | 여행, 식당, 숙박 정보 검색 및 추천 |
| **Moderator** | 채팅방 환경 관리 | 스팸 방지, 정책 위반 감지, 대화 요약 |

## 2. 기술 스택 (Agents)
- **Engine**: LangGraph (상태 기반 에이전트 워크플로우 관리)
- **Model**: GPT-4o 또는 Claude 3.5 Sonnet
- **Memory**: Supabase (Vector Store를 활용한 장기 기억 저장)
- **Validation**: Zod (에이전트 입출력 데이터 검증)

## 3. 에이전트 상세 정의

### 3.1 Orchestrator (중앙 조정자)
- **설명**: 사용자의 메시지를 가장먼저 받아 어떤 에이전트가 응답해야 할지 결정합니다.
- **Tools**:
    - `intent_router`: 메시지 분류 및 타겟 에이전트 결정
    - `context_retriever`: 이전 대화 맥락 요약 및 불러오기

### 3.2 Personal Assistant (개인 비서)
- **설명**: 사용자의 개인 데이터를 기반으로 생산성을 높여줍니다.
- **Workflow**:
    1. 사용자의 요청(예: "내일 오후 3시 회의 잡아줘") 수신
    2. 필요한 정보 추출 (일시, 제목 등)
    3. 도구 실행을 통해 DB에 저장
- **Tools**:
    - `manage_todo`: 할 일 생성/수정/삭제
    - `schedule_meeting`: 일정 등록

### 3.3 Concierge (컨시어지)
- **설명**: 외부 정보 검색 및 생활 편의 서비스를 제공합니다.
- **Tools**:
    - `place_search`: 주변 맛집, 카페 검색 (Geocoding 연동)
    - `travel_planner`: 여행 경로 및 숙소 제안

## 4. 데이터 흐름 (Data Flow)
1. **Input**: 사용자가 채팅창에 메시지 입력
2. **Analysis**: Orchestrator가 의도 분석 및 에이전트 선택
3. **Execution**: 선택된 에이전트가 필요한 Tool 실행
4. **Output**: 가공된 결과를 프리미엄 UI(카드, 리스트 등)로 출력
5. **Memory**: 대화 결과 및 주요 정보를 추후 사용을 위해 저장

## 5. 보안 및 정책
- 모든 에이전트는 사용자의 명시적인 동의 없이 개인 정보를 외부로 유출하지 않습니다.
- Moderator 에이전트는 실시간으로 대화 내용을 모니터링하여 건전한 채팅 환경을 유지합니다.
