# Stitch 디자인 분석 리포트

이 문서는 `docs/stitch` 폴더에 포함된 디자인 파일들의 분석 결과를 정리합니다.

## 📋 포함된 화면 목록

1. **home_screen** - 여행 홈 화면 (인기 여행지 카드 목록)
2. **people_chats_list_screen** - 사람과의 채팅 목록 화면
3. **people_chat_screen** - 사람과의 1:1 채팅 대화 화면
4. **ai_chat_screen** - AI 여행 컨시어지 채팅 화면
5. **ai_chats_list_screen** - AI 채팅 목록 화면
6. **login_screen** - 로그인 화면
7. **signup_screen** - 회원가입 화면
8. **profile_screen** - 사용자 프로필 화면

## 🎨 디자인 시스템 분석

### 1. 컬러 팔레트 (Color Palette)

#### Primary 컬러 (화면별 상이)
- **Home, People Chats List, Profile, AI Chats List**: `#EF4444` (Reddish hue)
- **People Chat, AI Chat**: `#13a4ec` (Blue/Cyan)
- **Login, Signup**: `#ec4899` (Pink/Magenta)

#### Background 컬러
- **Background Light**: `#F3F4F6` (Light gray)
- **Background Dark**: 
  - `#111827` (대부분의 화면)
  - `#101c22` (People Chat)
  - `#111618` (AI Chat)

#### Surface 컬러
- **Surface Light**: `#FFFFFF`
- **Surface Dark**: 
  - `#1F2937` (일반)
  - `#1e2930` (People Chat)
  - `#283339` (AI Chat, 입력 필드)

#### Text 컬러
- **Text Primary Light**: `#111827`
- **Text Primary Dark**: `#F9FAFB`
- **Text Secondary Light**: `#6B7280`
- **Text Secondary Dark**: `#9CA3AF`, `#9db0b9`

### 2. 타이포그래피 (Typography)

#### 폰트 패밀리
- **주요 폰트**: Inter (대부분의 화면)
- **채팅 화면**: Plus Jakarta Sans (People Chat, AI Chat)
- **폰트 웨이트**: 400, 500, 600, 700

#### 폰트 크기
- **Heading 1**: text-2xl (1.5rem, 24px)
- **Heading 2**: text-xl (1.25rem, 20px)
- **Body**: text-base (1rem, 16px) / text-sm (0.875rem, 14px)
- **Small**: text-xs (0.75rem, 12px)

### 3. 아이콘 시스템

- **Material Icons Round** (대부분의 화면)
- **Material Symbols Outlined** (채팅 화면)
- **Font Awesome** (로그인 화면)

### 4. Border Radius

- **Default**: 0.75rem (12px) - 대부분의 화면
- **Chat 화면**: 0.25rem (4px) 기본, lg/xl/2xl 변형 사용
- **Rounded Full**: 9999px (원형)

### 5. 주요 UI 패턴

#### 채팅 화면 공통
- 날짜 구분선: rounded-full 배지 형태
- 메시지 버블: rounded-2xl, 좌우 구분 (rounded-bl-sm / rounded-br-sm)
- 읽음 확인: Material Icons의 `done_all`
- 온라인 상태: 녹색 점 (bg-green-500)

#### 리스트 화면 공통
- Favorites 섹션: 가로 스크롤 (overflow-x-auto)
- 검색 입력: rounded-xl, 포커스시 ring-2
- 스크롤바 숨김: `.no-scrollbar` 클래스

#### 홈 화면
- 여행지 카드: rounded-2xl, 그라데이션 오버레이
- 카테고리 배지: backdrop-blur-md (글래스모피즘)
- 호버 효과: scale-110 이미지 확대

## 🔄 현재 프로젝트와의 차이점

### 컬러 시스템
| 항목 | 현재 프로젝트 | Stitch 디자인 |
|------|--------------|---------------|
| Primary Bg | `#0B0F19` (Deep Night Blue) | `#111827` (더 밝은 그레이) |
| Primary Accent | `#00D1FF` (Neon Blue) | `#EF4444` / `#13a4ec` (화면별 상이) |
| Surface Dark | `#161B26` | `#1F2937` / `#283339` |

### 폰트
| 항목 | 현재 프로젝트 | Stitch 디자인 |
|------|--------------|---------------|
| Primary Font | Outfit | Inter (대부분) |
| Secondary Font | Inter | Plus Jakarta Sans (채팅) |

### 디자인 철학
- **현재 프로젝트**: Glassmorphism, Neon 색상 (프리미엄/미래지향적)
- **Stitch 디자인**: Material Design 3 스타일, 더 밝은 다크 모드, 실용적

## 📝 구현 제안사항

### 1. 컬러 시스템 통일
Stitch 디자인을 기준으로 할 경우:
- 다크 배경: `#111827` 또는 `#101c22`로 변경
- Primary 컬러: 채팅 화면은 `#13a4ec` 사용 고려
- Surface 컬러: `#283339` 채택 검토

### 2. 폰트 시스템
- Inter는 이미 사용 중이므로 일관성 유지 가능
- Plus Jakarta Sans는 채팅 화면에만 선택적 적용 고려

### 3. UI 컴포넌트 업데이트
- 채팅 메시지 버블 스타일 조정 (rounded-2xl, 더 명확한 좌우 구분)
- 날짜 구분선 디자인 (rounded-full 배지)
- 검색 입력 필드 스타일 통일
- Favorites 섹션 가로 스크롤 구현

### 4. 화면별 우선순위
1. **High Priority**: 
   - People Chat Screen (현재 구현과 가장 유사)
   - AI Chat Screen
   - Login Screen

2. **Medium Priority**:
   - People Chats List Screen
   - AI Chats List Screen
   - Profile Screen

3. **Low Priority**:
   - Home Screen (여행 관련 기능이 프로젝트 범위에 포함되는지 확인 필요)

## 🎯 다음 단계

1. 디자인 시스템 결정: Stitch 디자인을 완전히 채택할지, 현재 디자인과 하이브리드로 할지 결정
2. 디자인 토큰 업데이트: `UI_DESIGN_SYSTEM.md` 업데이트
3. Tailwind 설정 업데이트: 컬러 팔레트 반영
4. 컴포넌트 마이그레이션: 단계적으로 UI 컴포넌트 업데이트

## 📎 참고 파일

각 화면의 실제 디자인과 코드는 다음 위치에서 확인 가능:
- `docs/stitch/{screen_name}/screen.png` - 디자인 시각화
- `docs/stitch/{screen_name}/code.html` - HTML/Tailwind 구현 코드

