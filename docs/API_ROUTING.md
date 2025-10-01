# STAYnC Chat API & Routing Strategy (React Router v7)

React Router v7의 강력한 라우팅 기능을 활용한 STAYnC Chat의 경로 설계서입니다.

## 1. 라우트 설계 (Client-Side)

| Path | Component | Description | Access |
| :--- | :--- | :--- | :--- |
| `/` | `Splash` | 앱 초기 로드 및 세션 체크 | Public |
| `/auth/login` | `Login` | 소셜 로그인 기반 인증 페이지 | Public |
| `/auth/google/callback` | `GoogleCallback` | 구글 인증 결과 처리 | Public |
| `/auth/kakao/callback` | `KakaoCallback` | 카카오 인증 결과 처리 | Public |
| `/chat` | `ChatList` | 참여 중인 대화 목록 (Sidebar 포함) | Private |
| `/chat/:roomId` | `ChatRoom` | 활성화된 실시간 채팅 페이지 | Private |
| `/profile` | `Profile` | 사용자 프로필 및 알림 설정 | Private |
| `/ai/assistants` | `AiDashboard` | 에이전트 설정 및 기록 조회 | Private |

## 2. 로더(Loader) 및 액션(Action) 전략

### 2.1 Data Loading (Loaders)
- **Room List**: `/chat` 진입 시 Prisma(Turso)를 통해 내가 포함된 방 목록을 한꺼번에 로드.
- **Message History**: `/chat/:roomId` 진입 시 최근 50개의 메시지를 프리페칭(Prefetching).

### 2.2 Data Mutating (Actions)
- **Sending Message**: 메시지 전송 시 React Router `action`을 통해 DB에 저장 후, 서버 사이드에서 Pusher 이벤트 트리거.
- **Creating Room**: 새 채팅방 생성 및 멤버 초대 로직 처리.

## 3. API 레이어 (Server-Side)
React Router v7의 서버 사이드 기능을 사용하여 에이전트와 통신하는 API 전용 핸들러를 구성합니다.

- `POST /api/chat`: 에이전트 오케스트레이션 실행 및 응답 생성.
- `POST /api/upload`: 파일/이미지 업로드 처리 (Cloudinary 연동).
- `GET /api/agent/status`: 에이전트들의 현재 가동 상태 확인.

## 4. 데이터 검증 (Type Safety)
- 모든 API 요청 바디와 응답은 **Zod** 스키마를 기반으로 타입이 정의됨.
- 클라이언트와 서버 간의 일관된 타입 공유를 위해 `shared/schemas` 구조 활용.
