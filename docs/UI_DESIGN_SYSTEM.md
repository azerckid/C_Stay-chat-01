# STAYnC Chat UI Design System

'STAYnC Chat'의 시각적 정체성을 정의하는 디자인 시스템 문서입니다. '프리미엄'과 '최첨단' 느낌을 주기 위한 구체적인 수치와 가이드를 포함합니다.

## 1. 디자인 원칙
- **Elevation through Depth**: 그림자와 블러 효과를 레이어드하여 깊이감을 표현.
- **Glassmorphism**: 반투명한 요소들을 통해 현대적인 질감을 강조.
- **Dynamic Interaction**: 미세한 애니메이션(Micro-interactions)으로 살아있는 UI 구현.

## 2. 타이포그래피 (Typography)
- **Primary Font**: [Outfit](https://fonts.google.com/specimen/Outfit) (Heading & Buttons) - 기하학적이고 세련된 느낌.
- **Secondary Font**: [Inter](https://fonts.google.com/specimen/Inter) (Body & Chat Messages) - 가독성 극대화.
- **Base Size**: 16px (Mobile standard)

## 3. 컬러 팔레트 (Color Palette)

### 3.1 Backgrounds
- **Primary Bg**: `#0B0F19` (Deep Night Blue)
- **Secondary Bg**: `#161B26` (Charcoal Blue)
- **Glass Base**: `rgba(255, 255, 255, 0.05)`

### 3.2 Accents
- **Neon Blue**: `#00D1FF` (Main action)
- **Neon Purple**: `#9D50FF` (AI special state)
- **Neon Green**: `#00FF94` (Online status)

### 3.3 Status
- **Success**: `#10B981`
- **Error**: `#EF4444`
- **Warning**: `#F59E0B`

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

## 6. 아이콘 (Hugeicons)
- 얇은 선(Stroke 1.5px)을 사용하여 미니멀리즘 유지.
- 아이콘 주변에 은은한 글로우(Glow) 효과 적용 시 AI 인지 강조.
