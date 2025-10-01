# STAYnC Chat Auth Plan

사용자 경험과 보안을 고려한 STAYnC Chat의 인증 시스템 설계서입니다.

## 1. 인증 서비스 선정
- **주요 선택지**: Clerk vs Supabase Auth vs Auth.js
- **최종 결정**: **Clerk** 또는 **Auth.js (NextAuth)**
- **이유**: 
    - 프로젝트가 Turso DB를 사용하므로, DB 종속성이 낮은 인증 시스템이 유리함.
    - 특히 **Clerk**은 "Premium" UI 부합도가 가장 높고, MFA(다중 인증) 및 소셜 로그인 연동이 매우 강력함.
    - 사용자님의 `.env`에 이미 Google 및 Kakao API 키가 있으므로, 이를 연동한 Social Login 위주로 구성.

## 2. 인증 흐름 (Auth Flow)

### 2.1 Social Login (Main)
1. 사용자가 앱 접속 시 스플래시 화면 또는 로그인 제안.
2. 구글/카카오 아이콘 클릭.
   - Google Redirect: `http://localhost:5173/auth/google/callback`
   - Kakao Redirect: `http://localhost:5173/auth/kakao/callback`
3. OAuth 인증 완료 후 사용자 프로필 정보 수신.
4. **Onboarding**: 첫 가입 시 Turso DB의 `User` 테이블에 최초 1회 저장.

### 2.2 JWT & Session Management
- **Token**: JWT 기반의 Stateless 세션 관리 (React Router v7 Loader에서 유효성 검증).
- **Persistent Storage**: 로그아웃 전까지 로컬 저장소 또는 쿠키에 세션 정보 안전하게 보관.

## 3. 요구사항 (User Rules 반영)
- **Validation**: 로그인 및 프로필 수정 시 **Zod** 스키마를 사용하여 데이터 형식을 철저히 검증.
- **Real-time Sync**: 사용자 로그인/로그아웃 시 Pusher 이벤트를 트리거하여 친구 목록에 실시간 접속 상태 반영.

## 4. UI 구성
- **Login Screen**: 글래스모피즘 배경 위로 은은한 그라데이션이 감도는 카드 형태의 로그인 인터페이스.
- **Loading State**: 화려한 루티(Lottie) 애니메이션이나 커스텀 스피너를 통한 프리미엄 로딩 경험 제공.
