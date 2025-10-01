# AGENTS.md

Welcome! I am Antigravity, your AI coding agent. This file follows the [AGENTS.md](https://agents.md/) standard to provide me with the context and instructions I need to work on the **STAYnC Chat** project effectively.

## Project Overview
STAYnC Chat is a premium, AI-driven mobile chat application built with React Router v7, Turso (libSQL), and LangGraph. It features high-end aesthetics (glassmorphism, Tailwind v4) and integrated AI agents for travel and personal assistance.

## Setup Commands
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build production bundle: `npm run build`
- Database migration: `npx prisma migrate dev`
- Database studio: `npx prisma studio`

## Tech Stack
- **Framework**: React Router v7 (Vite)
- **Styling**: Tailwind CSS v4, shadcn/ui (Nova Preset)
- **Database**: Turso (libSQL) with Prisma ORM
- **AI**: LangGraph, OpenAI/Claude
- **Real-time**: Pusher
- **Mobile**: Capacitor (Hybrid)

## Code Style & Conventions
- Use **TypeScript** for all files.
- Stick to functional components and React Hooks.
- Follow the shadcn/ui Nova design system for UI consistency.
- Use **Zod** for all schema validations and type-safe parsing.
- Use **Luxon** for date and time handling.
- Git commit messages must follow Conventional Commits in Korean (e.g., `feat(ui): 로그인 기능 추가`).

## Testing Instructions
- Currently, tests are being integrated as part of the development phase (Phase 9).
- Run available tests using: `npm test`

## Key Documentation
- `docs/AI_AGENTS_SPEC.md`: Detailed definitions of internal AI agents (Orchestrator, Concierge, etc.)
- `docs/implementation_plan.md`: The 50-step roadmap for project completion.
- `docs/UI_DESIGN_SYSTEM.md`: Design tokens and visual guidelines.
- `docs/DATABASE_SCHEMA.md`: Prisma schema and storage logic.
