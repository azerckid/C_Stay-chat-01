# STAYnC Chat UI Design System

'STAYnC Chat'의 시각적 정체성을 정의하는 디자인 시스템 문서입니다. Stitch 디자인을 기준으로 Material Design 3 스타일의 깔끔하고 현대적인 UI를 제공합니다.

## 1. 디자인 원칙
- **Material Design 3**: Google의 Material Design 3 가이드라인 준수
- **Clean & Modern**: 깔끔하고 현대적인 인터페이스
- **Consistent Spacing**: 일관된 간격과 레이아웃
- **Dynamic Interaction**: 미세한 애니메이션(Micro-interactions)으로 살아있는 UI 구현

## 2. 타이포그래피 (Typography)
- **Primary Font**: [Inter](https://fonts.google.com/specimen/Inter) - 가독성 극대화, 대부분의 화면에서 사용
- **Chat Font**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) - 채팅 화면에서 사용 (선택적)
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Base Size**: 16px (Mobile standard)

## 3. 컬러 팔레트 (Color Palette)

### 3.1 Backgrounds (Stitch Design)
- **Background Dark**: `#111827` (hsl(221, 39%, 11%)) - 메인 다크 배경
- **Background Light**: `#F3F4F6` - 라이트 모드 배경 (참고용)
- **Surface Dark**: `#1F2937` (hsl(215, 28%, 17%)) - 카드/서페이스 배경
- **Surface Input**: `#283339` (hsl(201, 18%, 19%)) - 입력 필드 배경

### 3.2 Primary Colors (Context-dependent)
- **Chat Primary**: `#13a4ec` (hsl(200, 85%, 50%)) - 채팅 화면 메인 컬러
- **List Primary**: `#EF4444` - 리스트 화면 메인 컬러 (향후 적용 가능)
- **Auth Primary**: `#ec4899` - 로그인/회원가입 화면 메인 컬러 (향후 적용 가능)

### 3.3 Text Colors
- **Text Primary Dark**: `#F9FAFB` (hsl(210, 20%, 98%)) - 다크 모드 주요 텍스트
- **Text Secondary Dark**: `#9CA3AF` (hsl(218, 11%, 65%)) - 다크 모드 보조 텍스트

### 3.4 Status Colors
- **Success/Online**: `#10B981` (Green-500) - 온라인 상태 표시
- **Error**: `#EF4444` (Red-500)
- **Warning**: `#F59E0B` (Amber-500)

## 4. shadcn/ui & Tailwind v4 Implementation
- **Base Components**: shadcn/ui의 `Button`, `Input`, `Dialog`, `Sheet` 등을 기본으로 사용.
- **Glassmorphism Utils**: Tailwind v4의 `@theme` 기능을 사용하여 커스텀 글래스 효과 정의.
  ```css
  @theme {
    --color-glass-base: rgba(255, 255, 255, 0.05);
    --blur-premium: 12px;
  }
  ```
- **Custom Classes**: `.glass-card`, `.glass-input` 등 유틸리티 클래스를 `app/app.css`에 정의하여 일관성 유지.

## 5. 애니메이션 흐름 (Animation & Physics)
- **Page Transitions**: Slide with Fade (React Router Outlet transition)
- **Message Stack**: 메시지가 추가될 때 살짝 튕기는 느낌의 Spring physics (stiffness: 100, damping: 10).
- **Hover/Active**: `scale(0.98)` 효과로 클릭감 제공.

## 6. 아이콘 시스템
- **Material Icons Round**: 일반 화면에서 사용
- **Material Symbols Outlined**: 채팅 화면에서 사용
- **Font Awesome**: 로그인/회원가입 화면에서 사용

## 7. Border Radius
- **Default**: `0.75rem` (12px) - 대부분의 화면
- **Chat Screens**: `0.25rem` (4px) 기본, `0.5rem`, `0.75rem`, `2xl`, `full` 변형 사용
- **Message Bubbles**: `rounded-2xl` (1rem) - 채팅 메시지 버블

## 8. 참고 문서
- **Stitch 디자인 분석**: `docs/STITCH_DESIGN_ANALYSIS.md`
- **Stitch 디자인 파일**: `docs/stitch/` 폴더
