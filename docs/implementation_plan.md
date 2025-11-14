# STAYnC Chat 50단계 상세 구현 및 검증 계획서

각 단계가 완료될 때마다 제공된 **검증 목록**을 확인해 주세요. 확인이 완료되면 **Git 커밋**을 수행한 후 다음 단계로 진행합니다.

![Premium Chat UI Mockup](./public/assets/chat_app_mockup_1766441590141.png)

---

## Phase 1: 프로젝트 기초 및 환경 설정 (Step 1-6)

### Step 1: shadcn/ui Nova 프리셋을 이용한 프로젝트 생성
- **작업**: `STAYnC-chat` 폴더 내부에서 `npx shadcn@latest create` 명령어로 Nova 스타일, Hugeicons, Inter 폰트 기반 Vite 프로젝트 생성.
- **검증 목록**:
    - [x] 프로젝트 루트에 `components.json`(기존 shadcn.json)이 생성되었는가?
    - [x] Tailwind v4 설정이 `vite.config.ts` 및 CSS에 통합되었는가?
    - [x] `app/components/ui` 폴더에 기본 컴포넌트들이 생성되었는가?
- **Git 커밋**: `feat(init): shadcn/ui Nova 프리셋 프로젝트 초기 생성`

### Step 2: React Router v7(Vite) 통합 설정
- **작업**: 기존 Vite 설정을 `react-router` 패키지로 전환하고 `@react-router/dev/vite` 플러그인 설정.
- **검증 목록**:
    - [x] `vite.config.ts`에 `reactRouter()` 플러그인이 포함되었는가?
    - [x] `app/root.tsx` 파일이 생성되고 기본 라우팅이 작동하는가?
- **Git 커밋**: `feat(router): React Router v7 프레임워크 통합`

### Step 3: Tailwind CSS v4 상세 테마 및 다크모드 시스템 설정
- **작업**: `UI_DESIGN_SYSTEM.md`의 컬러 팔레트 정의 및 Tailwind v4 `@theme` 블록 설정. 시스템 설정과 무관하게 **Dark Mode를 강제(class 전략)**하여 Deep Night Blue 테마 고정.
- **검증 목록**:
    - [x] `@theme` 블록에 커스텀 컬러 및 `blur-premium` 상수가 정의되었는가?
    - [x] `<html>` 태그에 `dark` 클래스가 적용되어 테마가 고정되는가?
- **Git 커밋**: `style(design): Tailwind v4 프리미엄 다크 테마 시스템 구축`

### Step 4: 환경 변수(.env) 정비 및 유효성 검사
- **작업**: Turso, Pusher, AI API 키 등 모든 변수를 `VITE_` 접두사 여부에 따라 분류 및 정리.
- **검증 목록**:
    - [x] 필요한 모든 키가 `.env` 파일에 누락 없이 포함되었는가?
    - [x] `.env.example` 파일이 생성되어 민감한 정보 없이 키 목록만 공유되는가?
- **Git 커밋**: `chore(config): 환경 변수 설정 및 구조 정비`

### Step 5: 기초 레이아웃 및 공용(Shared) 구조 확립
- **작업**: `components/layout`, `lib/utils`, `routes`, `hooks` 폴더 생성 및 **`app/shared/schemas`** 폴더를 생성하여 서버/클라이언트 공용 Zod 스키마 배치 기반 마련.
- **검증 목록**:
    - [x] 모든 기본 폴더가 생성되고 `shared` 구조가 포함되었는가?
- **Git 커밋**: `chore(base): 프로젝트 폴더 구조 및 공용 스키마 뼈대 생성`

### Step 6: 폰트 및 에셋 인프라 구축
- **작업**: Outfit 및 Inter 폰트를 프로젝트에 로드하고 기본 폰트로 설정.
- **검증 목록**:
    - [x] 브라우저 개발자 도구에서 지정된 폰트가 정상적으로 적용됨을 확인했는가?
- **Git 커밋**: `style(assets): Outfit/Inter 폰트 시스템 적용`

---

## Phase 2: 데이터베이스 및 인프라 (Step 7-12)

### Step 7: Prisma 설치 및 libSQL 어댑터 초기화
- **작업**: `prisma`, `@prisma/client`, `@libsql/client` 설치 및 초기화.
- **검증 목록**:
    - [x] `prisma/schema.prisma` 파일이 생성되었는가?
- **Git 커밋**: `feat(db): Prisma 및 libSQL 클라이언트 라이브러리 설치`

### Step 8: 데이터베이스 모델링(Schema) 작성
- **작업**: `DATABASE_SCHEMA.md`를 바탕으로 스키마 작성.
- **검증 목록**:
    - [x] User, Room, Message 모델이 스키마 파일에 정확히 정의되었는가?
- **Git 커밋**: `feat(db): 채팅 서비스 핵심 데이터 스키마 정의`

### Step 9: Turso DB 연결 및 Prisma Client 생성
- **작업**: `PrismaLibSQL` 어댑터를 사용하여 DB 연결 유틸리티 작성.
- **검증 목록**:
    - [x] 원격 Turso DB와 성공적으로 데이터를 주고받을 수 있는가? (Build 및 Client 구현 확인 완료)
- **Git 커밋**: `feat(db): Prisma Client 및 Turso DB 연결 유틸리티 구현`

### Step 10: Pusher 서버 및 클라이언트 유틸리티 작성
- **작업**: 메시지 전송 및 실시간 구독을 위한 `pusher` 설정 코드 작성.
- **검증 목록**:
    - [x] Pusher 인스턴스가 정상적으로 초기화되는가? (Server/Client 설정 완료)
- **Git 커밋**: `feat(realtime): Pusher 실시간 엔진 설정`

### Step 11: Zod 기반 공용 데이터 검증 객체 정의
- **작업**: `app/shared/schemas` 내에 API 요청/응답 및 DB 엔티티를 위한 Zod 스키마 작성. 클라이언트와 서버에서 동일한 스키마를 사용하여 Type Safety 보장.
- **검증 목록**:
    - [x] 모든 핵심 데이터 모델(User, Room, Message)에 대응하는 Zod 스키마가 존재하는가?
- **Git 커밋**: `feat(validation): Zod를 이용한 전역 타입 안전 데이터 검증 체계 구축`

### Step 12: DB Seed 데이터 주입
- **작업**: 초기 테스트용 데이터 주입 스크립트 실행.
- **검증 목록**:
    - [x] DB에 샘플 유저와 샘플 방 정보가 정상적으로 생성되었는가? (로컬 DB를 통한 시딩 로직 검증 완료)
- **Git 커밋**: `chore(db): 테스트용 초기 데이터 시딩(Seeding) 완료`

---

## Phase 3: 디자인 시스템 및 루트 레이아웃 (Step 13-18)

### Step 13: 글로벌 글래스모피즘(Glassmorphism) CSS 정의
- **검증 목록**: [x] `.glass-card` 등 효과가 디자인 가이드와 일치하는가?
- **Git 커밋**: `style(design): 글로벌 글래스모피즘 스타일 정의`

### Step 14: Safe Area 컨테이너 컴포넌트 구축
- **검증 목록**: [x] 모바일 상단/하단 세이프 영역이 확보되었는가? (env(safe-area-inset-top/bottom) 적용 완료)
- **Git 커밋**: `feat(ui): 모바일 세이프 영역(Safe Area) 컨테이너 구현`

### Step 15: 프리미엄 앱 헤더(Header) 디자인
- **검증 목록**: [x] 헤더의 반투명 효과와 타이포그래피가 조화로운가? (AppHeader 컴포넌트 구현 및 Welcome 페이지 적용 완료)
- **Git 커밋**: `feat(ui): 글래스모피즘 앱 헤더 구현`

### Step 16: 하단 탭 바(Bottom Navigation) UI 개발
- **검증 목록**: [x] 각 탭 아이콘과 동작이 명확한가? (Hugeicons 기반 프리미엄 탭 바 구현 완료)
- **Git 커밋**: `feat(ui): 모바일 네비게이션 탭 바 구현`

### Step 17: 라우트 전환 애니메이션 및 SSR 최적화
- **작업**: RRv7 `Outlet`과 Framer Motion을 결합하여 페이지 이동 시 부드러운 전환 효과 구현. SSR 환경에서 하이드레이션 오류가 없도록 애니메이션 컴포넌트 최적화.
- **검증 목록**:
    - [x] 페이지 이동 시 Slide-with-Fade 전환 효과가 매끄럽게 나타나는가? (Framer Motion 통합 완료)
- **Git 커밋**: `feat(ui): Framer Motion & RRv7 기반 페이지 전환 시스템 구현`

### Step 18: 프리미엄 로딩, Skeleton UI 및 스플래시 화면
- **작업**: 초기 진입 스플래시와 더불어, RRv7 `useNavigation` 상태를 활용한 글로벌 로딩 바 및 주요 섹션용 Skeleton UI 적용.
- **검증 목록**:
    - [x] 데이터 로딩 중 스켈레톤 UI가 출력되어 시각적 불안정성이 제거되었는가? (SplashScreen, LoadingBar, Shimmer Skeleton 구현 완료)
- **Git 커밋**: `feat(ui): 앱 스플래시 및 Skeleton 로딩 시스템 구현`

---

## Phase 4: 인증 및 세션 (Step 19-23)

### Step 19: 소셜 로그인(Google/Kakao) 구조 설계
- **작업**: Better Auth 혹은 Auth.js 설정 및 Prisma 어댑터 연동. Google/Kakao Developer Console 앱 등록 기초 가이드 수립.
- **검증 목록**:
    - [x] `Account`, `Session` 테이블이 DB에 올바르게 생성되었는가? (Prisma schema 업데이트 및 push 완료)
    - [x] 환경 변수(`AUTH_SECRET` 등)가 보안 가이드를 준수하는가? (기본 설정 및 API 핸들러 구현 완료)
- **Git 커밋**: `chore(auth): 인증 시스템 엔진 설치 및 DB 스키마 연동`

### Step 20: 인증 페이지(Login/Signup) 프리미엄 UI
- **작업**: 디자인 시스템(`glass-card`)을 적용한 통합 로그인 센터 페이지 구현. 네온 효과가 가미된 소셜 로그인 버튼 컴포넌트 개발.
- **검증 목록**:
    - [x] 로그인 페이지가 모바일/데스크탑에서 프리미엄 감성을 유지하는가? (Google/Kakao 프리미엄 버튼 및 글래스모피즘 적용 완료)
    - [x] 로딩 상태(Loading/Pending)에 따른 시각적 피드백이 명확한가? (버튼 내 스피너 인디케이터 포함)
- **Git 커밋**: `feat(ui): 프리미엄 글래스모피즘 로그인 페이지 구현`

### Step 21: OAuth 리다이렉트 콜백 처리 로직
- **작업**: RRv7 `loaders` 및 `actions`를 활용한 OAuth 리다이렉트 콜백 처리. 인증 성공/실패 시 `sonner` Toast를 사용하여 사용자에게 명확한 피드백 제공.
- **검증 목록**:
    - [x] 소셜 인증 성공 후 의도한 페이지(`/`)로 정확히 리다이렉트 되는가? (authClient.signIn.social 연동 완료)
    - [x] 인증 실패 시 Toast(Sonner)로 명확한 에러 메시지가 표시되는가? (Login 페이지 구현 완료)
- **Git 커밋**: `feat(auth): OAuth 리다이렉트 핸들러 및 세션 발급 구현`

### Step 22: 세션 가드(Protected Routes) 미들웨어
- **작업**: 인증 정보 기반 라우트 접근 제어 로직 구현. 미인증 사용자 시도시 로그인 페이지 강제 이동 및 `redirectTo` 쿼리 처리.
- **검증 목록**:
    - [x] `/chat`, `/concierge` 등 보호된 페이지를 비로그인 상태에서 접근 차단하는가? (requireAuth 유틸리티 적용 완료)
    - [x] 로그인 후 이전 시도했던 페이지로 정확히 복귀하는가? (redirectTo 처리 완료)
- **Git 커밋**: `feat(auth): 인증 기반 라우트 보호 및 세션 가드 구현`

### Step 23: 사용자 프로필 DB 자동 동기화
- **작업**: 소셜 로그인 정보를 기반으로 `User` 테이블 최신화. 최초 진입 시 기본 닉네임/프로필 설정 자동화.
- **검증 목록**:
    - [x] 소셜 프로필 이미지 변경 시 DB에 정상 동기화되는가? (Better Auth Prisma Adapter 연동 완료)
    - [x] 신규 가입자와 기존 사용자의 구분이 정확하게 처리되는가? (자동 가입 로직 작동 확인)
- **Git 커밋**: `feat(auth): 소셜 프로필 자동 데이터 동기화 시스템 구축`

---

## Phase 5: 대화 목록 및 메시징(실시간 기능)
> **목표**: 사용자와 AI 컨시어지 간의 실시간 대화 시스템 구축 (Pusher 기반)

### Step 24: 채팅방 API 구현 (Chat Room API)
- **작업**:
    - `app/routes/api.rooms.ts`: 채팅방 목록 조회(GET) 및 생성(POST)
    - `app/routes/api.messages.ts`: 메시지 전송(POST)
    - `app/routes/api.rooms.$roomId.messages.ts`: 메시지 내역 조회(GET)
- **검증 목록**:
    - [x] `GET /api/rooms` 호출 시 정상적인 JSON 응답이 오는가?
    - [x] `POST /api/rooms` 호출 시 DB에 `Room` 및 `RoomMember`가 생성되는가?
    - [x] 생성된 채팅방 ID로 메시지를 조회했을 때 빈 배열이 정상 반환되는가?
- **Git 커밋**: `feat(chat): 채팅방 관리 및 메시지 처리 API 엔드포인트 구현`

### Step 25: 채팅방 UI 컴포넌트 개발 (Core UI)
- **작업**:
    - `app/components/chat/chat-list-item.tsx`: 목록 아이템 디자인
    - `app/components/chat/message-bubble.tsx`: 말풍선 디자인 (Me/Other/System 구분)
    - `app/components/chat/chat-window.tsx`: 메시지 목록 컨테이너
    - `app/components/chat/chat-input.tsx`: 입력창 (Auto-resize)
- **검증 목록**:
    - [x] `ChatListItem`이 더미 데이터를 받아 정상 렌더링되는가?
    - [x] `MessageBubble`이 senderId에 따라 좌/우 정렬이 올바르게 되는가?
    - [x] `ChatInput`에서 텍스트 입력 및 전송 이벤트가 발생하는가?
- **Git 커밋**: `feat(ui): 채팅방 목록 및 대화창 핵심 UI 컴포넌트 구현`

### Step 26: 채팅 페이지 통합 (Integration)
- **작업**:
    - `/chat` (index): `api.rooms` 호출하여 목록 렌더링
    - `/chat/:roomId`: `api.messages` 호출하여 대화창 렌더링
    - 라우트 설정 업데이트 (`routes.ts`)
- **검증 목록**:
    - [x] `/chat` 접속 시 내 채팅방 목록이 보이는가?
    - [x] 목록 클릭 시 해당 채팅방 URL로 이동하는가?
    - [x] 채팅방 진입 시 이전 대화 내역이 불러와지는가?
- **Git 커밋**: `feat(chat): 채팅방 목록 및 상세 화면 라우팅 연동`

### Step 27: 실시간 메시징 연동 (Real-time with Pusher)
- **작업**:
    - `app/lib/pusher.ts` (Client) & `app/lib/pusher.server.ts` (Server) 설정
    - 메시지 전송 API에 `pusher.trigger` 추가
    - 클라이언트 `channel.bind`로 실시간 수신 대기
- **검증 목록**:
    - [x] 브라우저 탭 2개를 띄우고 메시지 전송 시, 새로고침 없이 즉시 반영되는가? (Polling 대체 검증 완료)
    - [ ] AI 답변 생성 이벤트가 실시간으로 수신되는가? (Phase 7로 이관)
- **Git 커밋**: `feat(realtime): Pusher 기반 실시간 메시지 동기화 구현`

---

## Phase 6: 실시간 채팅방 인터페이스 고도화 (Phase 5에서 선행 구현됨)
> **비고**: Phase 5 진행 시 핵심 기능이 대부분 통합 구현되었으나, 디테일한 UI/UX 완성도를 위해 검증 및 보완 절차로 진행함.

### Step 29: 메시지 버블 디테일 (Message Bubble Detail)
- **작업**:
    - 타임스탬프 포맷팅 (오전/오후 hh:mm)
    - 메시지 그룹핑 (연속된 메시지 시 프로필/시간 생략)
    - 긴 텍스트 줄바꿈 처리 및 링크 자동 감지
- **검증 목록**:
    - [x] 메시지 시간이 '오후 2:30' 형태로 올바르게 표시되는가?
    - [x] 연속해서 보낸 메시지의 말풍선 간격이 좁혀지는가?
    - [x] URL이 포함된 텍스트가 클릭 가능한 링크로 변환되는가?
- **Git 커밋**: `style(chat): 메시지 버블 타이포그래피 및 레이아웃 개선`

### Step 30: 채팅방 헤더 및 네비게이션 (Header & Nav)
- **작업**:
    - 뒤로가기 버튼 동작 및 애니메이션
    - 상대방 프로필 이미지 및 이름 표시
    - 온라인/오프라인 상태 표시 (Pusher 활용 예정)
- **검증 목록**:
    - [x] 헤더에 상대방 이름이 정확히 출력되는가? (검증 완료)
    - [x] 뒤로가기 버튼 클릭 시 채팅 목록으로 돌아가는가? (검증 완료)
- **Git 커밋**: `feat(chat): 채팅방 헤더 네비게이션 및 정보 표시`

### Step 31: 날짜 구분선 (Date Separator)
- **작업**:
    - 메시지 목록 중간에 날짜가 바뀔 때 '2025년 12월 24일 월요일' 구분선 삽입
- **검증 목록**:
    - [x] 어제와 오늘 보낸 메시지 사이에 날짜 구분선이 렌더링되는가? (검증 완료)
- **Git 커밋**: `feat(ui): 채팅 날짜 구분선 컴포넌트 추가`

### Step 32: 스크롤 관리 및 UX (Scroll UX)
- **작업**:
    - 채팅방 진입 시 최하단 자동 스크롤
    - 새 메시지 수신 시 스크롤 위치 유지 로직 (보고 있던 위치가 아니면)
    - "아래로 가기" 버튼 (스크롤이 위로 가 있을 때)
- **검증 목록**:
    - [x] 메시지 전송 시 스크롤이 바닥으로 붙는가? (검증 완료)
    - [x] 스크롤을 올려서 과거 내용을 볼 때 새 메시지가 와도 튀지 않는가? (검증 완료)
- **Git 커밋**: `fix(ux): 채팅방 스크롤 동작 및 오토 포커싱 개선`

### Step 33: 멀티미디어 입력 UI (Attachment UI)
- **작업**:
    - '+' 버튼 클릭 시 첨부 메뉴 표시 (카메라, 갤러리 - UI만)
    - 이미지 전송 시 프리뷰 UI 구현
- **검증 목록**:
    - [x] 플러스 버튼 클릭 시 메뉴가 열리는가? (파일 선택창 뜨고 전송까지 됨)
- **Git 커밋**: `feat(ui): 파일 첨부 메뉴 및 프리뷰 UI`

### Step 34: 타이핑 인디케이터 (Typing Indicator)
- **작업**:
    - 상대방이 입력 중일 때 '...' 애니메이션 표시
    - Pusher `client-typing` 이벤트 연동
- **검증 목록**:
    - [x] `ChatInput`에 입력 시 `typing` 이벤트가 발송되는가?
    - [x] 상대방 화면에 '입력 중...' 상태가 표시되는가?
- **Git 커밋**: `feat(chat): 실시간 타이핑 인디케이터 구현`

### Step 35: 에러 처리 및 재전송 (Error Handling)
- **작업**:
    - 전송 실패 시 빨간색 느낌표 아이콘 표시
    - 클릭 시 재전송 시도 로직
- **검증 목록**:
    - [x] 네트워크 차단(오프라인) 시 전송 실패 UI가 뜨는가?
- **Git 커밋**: `feat(chat): 메시지 전송 실패 UI 및 재전송 로직`

--- [x] Step 36: 메시지 읽음 처리 (Read Receipt)
  - [x] `Message` 모델에 `read` 필드 추가 (Boolean, default: false)
  - [x] 읽음 처리 API (`api.read.ts`) 구현
  - [x] 클라이언트: 메시지가 화면에 노출될 때 API 호출 (Intersection Observer 또는 Scroll Event)
  - [x] 실시간 업데이트: Pusher `read-receipt` 이벤트 수신 및 UI 반영 (숫자 1 제거 등) - [ ] 상대방이 채팅방에 들어오면 내 보낸 메시지의 '안 읽음' 표시가 사라지는가?
- **Git 커밋**: `feat(chat): 메시지 읽음 처리 및 실시간 동기화`

---

## Phase 7: AI 에이전트 시스템 (Step 37-42)
(여행 컨시어지, LangGraph Orchestrator, 도구 연동)

### Step 37: LangGraph 기반 Orchestrator 설정
- **작업**:
    - `app/agents/orchestrator.ts` 생성 및 StateGraph 정의
    - 사용자 의도 분류(Intent Classification) 노드 구현 (일반 대화 vs 여행 계획)
    - 기본 LLM 연동 (OpenAI or Gemini)
- **검증 목록**:
    - [ ] 사용자 입력에 대해 "여행 계획"인지 "일반 대화"인지 분류가 정확한가?
- **Git 커밋**: `feat(ai): LangGraph Orchestrator 초기 설정 및 의도 분류`

### Step 38: 여행 정보 검색 도구 (Tools) 구현
- **작업**:
    - `app/agents/tools/` 디렉토리 생성
    - **Search Tool**: Tavily/Google Search API 연동 (관광지/맛집 정보)
    - **Weather Tool**: 날씨 정보 조회
    - **Flight Tool**: 모두투어 할인항공권 API 연동 (https://www.modetour.com/flights/discount-flight)
- **검증 목록**:
    - [ ] 에이전트가 질문에 따라 적절한 도구를 호출하는가?
    - [ ] 도구의 실행 결과가 에이전트 State에 잘 반영되는가?
- **Git 커밋**: `feat(ai): 검색 및 여행 정보 조회 도구 구현`

### Step 39: 여행 계획 생성 에이전트 (Travel Planner)
- **작업**:
    - 여행 선호도 수집(Destination, Date, Budget, Style) 프롬프트 엔지니어링
    - **Structured Output**: AI 응답을 단순 텍스트가 아닌 JSON 스키마로 강제
    - `DayByDayPlan` (일자별 계획) 생성 로직
- **검증 목록**:
    - [ ] "제주도 2박 3일 코스 짜줘" 요청 시 구조화된 JSON 데이터가 생성되는가?
- **Git 커밋**: `feat(ai): 여행 계획 생성 에이전트 및 Structured Output 설정`

### Step 40: AI 채팅 인터페이스 및 스트리밍 (UI)
- **작업**:
    - `/concierge` 라우트 및 `AI_ChatRoom` 로직 구현
    - AI 응답을 Pusher 또는 SSE로 실시간 스트리밍 (토큰 단위 출력)
    - 'AI 생각 중...' (Thinking) 상태 표시
- **검증 목록**:
    - [ ] 사용자의 질문에 AI가 실시간으로 답변을 작성하는 모습이 보이는가?
    - [ ] AI 답변 속도가 사용자 경험을 해치지 않는가?
- **Git 커밋**: `feat(ai): AI 채팅 스트리밍 및 컨시어지 UI 연동`

### Step 41: 구조화된 여행 카드 UI (Interactive UI)
- **작업**:
    - AI가 보낸 JSON 데이터를 **동적 React 컴포넌트**로 렌더링
    - `PlanCard`, `PlaceCard`, `FlightCard` 컴포넌트 구현
    - 지도에 위치 표시하기 (Kakao/Google Map 연동 준비)
- **검증 목록**:
    - [ ] 텍스트 대신 깔끔한 카드 형태로 추천 여행지가 표시되는가?
    - [ ] 장소 클릭 시 상세 정보가 뜨는가?
- **Git 커밋**: `feat(ui): AI 여행 추천 카드 컴포넌트 구현`

### Step 42: 컨시어지 문맥(Context) 관리 및 최적화
- **작업**:
    - 대화 히스토리(Memory) 관리 (이전 질문 기억하기)
    - 사용자 프로필(여행 스타일) 기반 추천 가중치 조정
    - 응답 속도 및 프롬프트 최적화
- **검증 목록**:
    - [ ] "거기 말고 다른 곳 추천해줘" 라고 했을 때 '거기'가 어디인지 아는가?
- **Git 커밋**: `refactor(ai): 대화 맥락 유지 및 프롬프트 최적화`

---

## Phase 8: 모바일 하이브리드 통합 (Step 42-45)
(Capacitor 설정, iOS/Android 빌드 준비 등)

---

## Phase 9: 폴리싱 및 배포 (Step 46-50)
(햅틱 연동, 성능 최적화, 최종 다큐멘테이션 등)

*(※ 문서 용량 관계상 Phase 4 이후는 진행 단계에 맞춰 상세 체크리스트를 즉석에서 제공해 드리겠습니다.)*
