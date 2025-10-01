# STAYnC Chat Database Schema (Turso/libSQL)

이 문서는 STAYnC Chat의 데이터베이스 테이블 정의서입니다. Prisma를 사용하여 구현하며, Turso(libSQL) 환경에 최적화된 스키마를 정의합니다.

## 1. 개요
- **Engine**: libSQL (Turso)
- **ORM**: Prisma
- **Pattern**: 관계형 데이터베이스 모델링

## 2. 테이블 상세 정의

### 2.1 User (사용자)
가입된 사용자 정보를 관리합니다.
- `id`: String (Primary Key, UUID)
- `email`: String (Unique)
- `name`: String
- `avatarUrl`: String?
- `status`: String (ONLINE, OFFLINE, AWAY)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 2.2 Room (채팅방)
개인 및 그룹 채팅방 정보를 관리합니다.
- `id`: String (Primary Key, UUID)
- `name`: String? (그룹 채팅의 경우 이름 존재)
- `type`: Enum (DIRECT, GROUP)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 2.3 RoomMember (방 멤버)
사용자와 채팅방의 다대다(N:M) 관계를 정의합니다.
- `id`: String (Primary Key, UUID)
- `userId`: String (Foreign Key -> User.id)
- `roomId`: String (Foreign Key -> Room.id)
- `role`: Enum (OWNER, ADMIN, MEMBER)
- `joinedAt`: DateTime

### 2.4 Message (메시지)
각 채팅방에서 오고 가는 메시지 데이터를 저장합니다.
- `id`: String (Primary Key, UUID)
- `content`: Text
- `type`: Enum (TEXT, IMAGE, FILE, SYSTEM, AI_RESPONSE)
- `senderId`: String (Foreign Key -> User.id)
- `roomId`: String (Foreign Key -> Room.id)
- `createdAt`: DateTime

### 2.5 AgentExecution (에이전트 실행 기록)
AI 에이전트가 어떤 의도로 어떤 결과를 내놓았는지 기록합니다.
- `id`: String (Primary Key, UUID)
- `messageId`: String (Foreign Key -> Message.id)
- `agentName`: String (Orchestrator, Concierge 등)
- `intent`: String (사용자 의도 분석 결과)
- `promptTokens`: Int
- `completionTokens`: Int
- `totalTokens`: Int
- `rawOutput`: Json (에이전트 전체 응답 데이터)
- `createdAt`: DateTime

### 2.6 Todo (개인 비서용 할 일)
Personal Assistant 에이전트가 관리하는 사용자의 할 일 목록입니다.
- `id`: String (Primary Key, UUID)
- `userId`: String (Foreign Key -> User.id)
- `title`: String
- `description`: String?
- `status`: Enum (PENDING, COMPLETED, CANCELLED)
- `dueDate`: DateTime?
- `createdAt`: DateTime

## 3. 인덱스(Index) 전략
- `Message.roomId` + `Message.createdAt`: 대화 내역 조회 성능 최적화
- `RoomMember.userId`: 내가 참여 중인 방 목록 조회 최적화
- `User.email`: 로그인 및 사용자 검색 최적화
