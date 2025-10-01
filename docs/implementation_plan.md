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
    - [ ] 브라우저 개발자 도구에서 지정된 폰트가 정상적으로 적용됨을 확인했는가?
- **Git 커밋**: `style(assets): Outfit/Inter 폰트 시스템 적용`

---

## Phase 2: 데이터베이스 및 인프라 (Step 7-12)

### Step 7: Prisma 설치 및 libSQL 어댑터 초기화
- **작업**: `prisma`, `@prisma/client`, `@libsql/client` 설치 및 초기화.
- **검증 목록**:
    - [ ] `prisma/schema.prisma` 파일이 생성되었는가?
- **Git 커밋**: `feat(db): Prisma 및 libSQL 클라이언트 라이브러리 설치`

### Step 8: 데이터베이스 모델링(Schema) 작성
- **작업**: `DATABASE_SCHEMA.md`를 바탕으로 스키마 작성.
- **검증 목록**:
    - [ ] User, Room, Message 모델이 스키마 파일에 정확히 정의되었는가?
- **Git 커밋**: `feat(db): 채팅 서비스 핵심 데이터 스키마 정의`

### Step 9: Turso DB 연결 및 Prisma Client 생성
- **작업**: `PrismaLibSQL` 어댑터를 사용하여 DB 연결 유틸리티 작성.
- **검증 목록**:
    - [ ] 원격 Turso DB와 성공적으로 데이터를 주고받을 수 있는가?
- **Git 커밋**: `feat(db): Prisma Client 및 Turso DB 연결 유틸리티 구현`

### Step 10: Pusher 서버 및 클라이언트 유틸리티 작성
- **작업**: 메시지 전송 및 실시간 구독을 위한 `pusher` 설정 코드 작성.
- **검증 목록**:
    - [ ] Pusher 인스턴스가 정상적으로 초기화되는가?
- **Git 커밋**: `feat(realtime): Pusher 실시간 엔진 설정`

### Step 11: Zod 기반 공용 데이터 검증 객체 정의
- **작업**: `app/shared/schemas` 내에 API 요청/응답 및 DB 엔티티를 위한 Zod 스키마 작성. 클라이언트와 서버에서 동일한 스키마를 사용하여 Type Safety 보장.
- **검증 목록**:
    - [ ] 모든 핵심 데이터 모델(User, Room, Message)에 대응하는 Zod 스키마가 존재하는가?
- **Git 커밋**: `feat(validation): Zod를 이용한 전역 타입 안전 데이터 검증 체계 구축`

### Step 12: DB Seed 데이터 주입
- **작업**: 초기 테스트용 데이터 주입 스크립트 실행.
- **검증 목록**:
    - [ ] DB에 샘플 유저와 샘플 방 정보가 정상적으로 생성되었는가?
- **Git 커밋**: `chore(db): 테스트용 초기 데이터 시딩(Seeding) 완료`

---

## Phase 3: 디자인 시스템 및 루트 레이아웃 (Step 13-18)

### Step 13: 글로벌 글래스모피즘(Glassmorphism) CSS 정의
- **검증 목록**: [ ] `.glass-card` 등 효과가 디자인 가이드와 일치하는가?
- **Git 커밋**: `style(design): 글로벌 글래스모피즘 스타일 정의`

### Step 14: Safe Area 컨테이너 컴포넌트 구축
- **검증 목록**: [ ] 모바일 상단/하단 세이프 영역이 확보되었는가?
- **Git 커밋**: `feat(ui): 모바일 세이프 영역(Safe Area) 컨테이너 구현`

### Step 15: 프리미엄 앱 헤더(Header) 디자인
- **검증 목록**: [ ] 헤더의 반투명 효과와 타이포그래피가 조화로운가?
- **Git 커밋**: `feat(ui): 글래스모피즘 앱 헤더 구현`

### Step 16: 하단 탭 바(Bottom Navigation) UI 개발
- **검증 목록**: [ ] 각 탭 아이콘과 동작이 명확한가?
- **Git 커밋**: `feat(ui): 모바일 네비게이션 탭 바 구현`

### Step 17: 라우트 전환 애니메이션 및 SSR 최적화
- **작업**: RRv7 `Outlet`과 Framer Motion을 결합하여 페이지 이동 시 부드러운 전환 효과 구현. SSR 환경에서 하이드레이션 오류가 없도록 애니메이션 컴포넌트 최적화.
- **검증 목록**:
    - [ ] 페이지 이동 시 Slide-with-Fade 전환 효과가 매끄럽게 나타나는가?
- **Git 커밋**: `feat(ui): Framer Motion & RRv7 기반 페이지 전환 시스템 구현`

### Step 18: 프리미엄 로딩, Skeleton UI 및 스플래시 화면
- **작업**: 초기 진입 스플래시와 더불어, RRv7 `useNavigation` 상태를 활용한 글로벌 로딩 바 및 주요 섹션용 Skeleton UI 적용.
- **검증 목록**:
    - [ ] 데이터 로딩 중 스켈레톤 UI가 출력되어 시각적 불안정성이 제거되었는가?
- **Git 커밋**: `feat(ui): 앱 스플래시 및 Skeleton 로딩 시스템 구현`

---

## Phase 4: 인증 및 세션 (Step 19-23)

### Step 19: 소셜 로그인(Google/Kakao) 구조 설계
### Step 20: 인증 페이지(Login/Signup) 프리미엄 UI
### Step 21: OAuth 리다이렉트 콜백 처리 로직
### Step 22: 세션 가드(Protected Routes) 미들웨어
### Step 23: 사용자 프로필 DB 자동 동기화
(각 단계별 검증 및 커밋은 진행 시 상세 제시 예정)

---

## Phase 5: 대화 목록 및 메시징 인프라 (Step 24-28)
(대화 목록 구현, Presence 채널, 스와이프 액션 등)

---

## Phase 6: 실시간 채팅방 인터페이스 (Step 29-35)
(메시지 버블, 입력창 UI, 낙관적 업데이트 등)

---

## Phase 7: AI 에이전트 시스템 (Step 36-41)
(LangGraph, Orchestrator, 컨시어지 툴 연동 등)

---

## Phase 8: 모바일 하이브리드 통합 (Step 42-45)
(Capacitor 설정, iOS/Android 빌드 준비 등)

---

## Phase 9: 폴리싱 및 배포 (Step 46-50)
(햅틱 연동, 성능 최적화, 최종 다큐멘테이션 등)

*(※ 문서 용량 관계상 Phase 4 이후는 진행 단계에 맞춰 상세 체크리스트를 즉석에서 제공해 드리겠습니다.)*
