# STAYnC Chat (AI & Real-time Messenger) ✈️💬

> **여행의 시작과 끝을 함께하는 AI 컨시어지 & 실시간 채팅 애플리케이션**

STAYnC Chat은 사용자와 AI 간의 자연스러운 대화를 통해 여행 계획을 세우고, 다른 사용자들과 실시간으로 소통할 수 있는 하이브리드 모바일 앱입니다.

![App Screenshot](public/screenshot-placeholder.png)

## ✨ 주요 기능

- **🤖 AI 컨시어지**: OpenAI 기반의 지능형 에이전트가 여행지 추천, 일정 계획, 항공권 정보를 제공합니다.
- **💬 실시간 채팅**: Pusher를 활용한 저지연 실시간 메시징 (타이핑 인디케이터, 읽음 확인 포함).
- **📱 하이브리드 모바일 앱**: Capacitor를 통해 iOS 및 Android 네이티브 앱으로 동작.
- **🎨 프리미엄 UI**: Tailwind CSS v4 기반의 다크 모드, Glassmorphism 디자인, 부드러운 애니메이션.
- **📍 위치 기반 추천**: OpenStreetMap 지오코딩을 통한 정확한 장소 정보 제공.

## 🛠 기술 스택

- **Frontend**: React Router v7 (Remix), React 18, Tailwind CSS v4
- **Backend**: Node.js, Prisma ORM
- **Database**: SQLite (Local) / Turso (Remote, optional)
- **Real-time**: Pusher Channels
- **AI**: OpenAI GPT-4o, LangChain (Deprecated -> Native Fetch로 전환됨)
- **Mobile**: Ionic Capacitor (iOS/Android)
- **Deployment**: Vercel (Web)

## 🚀 시작하기

### 1. 환경 설정

필수 환경 변수를 `.env` 파일에 설정해야 합니다. (`.env.example` 참고)

```bash
# .env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="..."
VITE_PUSHER_KEY="..."
VITE_PUSHER_CLUSTER="..."
SESSION_SECRET="super-secret-key"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### 2. 설치 및 실행

```bash
# 패키지 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

### 3. 모바일 앱 빌드 (iOS/Android)

**사전 요구사항**: Xcode (iOS) 또는 Android Studio (Android) 설치 필요.

```bash
# 웹 앱 빌드 + 네이티브 동기화
npm run build
npx cap sync

# iOS 시뮬레이터 실행
npx cap open ios

# Android 스튜디오 실행
npx cap open android
```

## 📂 프로젝트 구조

```
app/
├── agents/       # AI 에이전트 및 툴 (Graph, Prompts)
├── components/   # UI 컴포넌트 (Shadcn UI, Chat Bubble 등)
├── hooks/        # Custom Hooks (usePusher, useChat)
├── lib/          # 유틸리티 및 서버 로직 (Prisma, Auth, Haptics)
├── routes/       # 페이지 및 API 라우트 (Remix File-system Routing)
└── root.tsx      # 앱 진입점 (Layout, Provider)
capacitor.config.ts # 모바일 빌드 설정
prisma/           # DB 스키마
```

## 🔒 라이선스

This project is proprietary software. All rights reserved.
