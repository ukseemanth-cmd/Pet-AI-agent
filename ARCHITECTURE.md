# System Architecture — Productivity Pet

This document details the architectural layers and data flow of **Productivity Pet**.

---

## 1. End-to-End Execution Flow

```
┌───────────────────┐
│     User Goal     │  (e.g., "I need to finish my ML project")
└─────────┬─────────┘
          │ (REST POST /api/agent/chat)
          ▼
┌───────────────────┐
│ FastAPI Gateway   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────────────────────────┐
│            Agent Orchestrator                 │
│  1. Intent Detection (Goal Breakdown)        │
│  2. Context Retrieval (Active tasks & stats)  │
│  3. Memory Extraction (Past patterns)         │
└─────────┬─────────────────────────┬───────────┘
          │                         │
          ▼                         ▼
┌───────────────────┐     ┌───────────────────┐
│    AI Provider    │     │   Memory Layer    │
│  (MemCode Client) │     │ (DB Context Cache)│
└─────────┬─────────┘     └─────────┬─────────┘
          │                         │
          ▼                         │
┌───────────────────────────────────▼───────────┐
│              Structured Plan                  │
│    (Goal difficulty, tasks, XP, action)       │
└───────────────────┬───────────────────────────┘
          │
          ▼
┌───────────────────┐
│  Behavior Engine  │ ◄─── Observes task completions, focus minutes, consistency
└─────────┬─────────┘
          │
          ├─────────────────────────┐
          ▼                         ▼
┌───────────────────┐     ┌───────────────────┐
│     Pet State     │     │  Database Update  │
│ (Happy, Focused,  │     │ (SQLite/Postgres) │
│  Excited, etc.)   │     └───────────────────┘
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  React Dashboard  │
│ (Live Pet Action, │
│  XP, Audio, HUD)  │
└───────────────────┘
```

---

## 2. Core Subsystems

### A. Frontend Layer (`frontend/`)
- **Technology**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React.
- **Pet Mascot Renderer (`PetRenderer.tsx`)**: Custom layered SVG avatar featuring dynamic eye shapes, floating antennae, pulsating arc reactor core, and animated particle states.
- **Audio Synthesizer (`audio.ts`)**: Built on native browser Web Audio API to create zero-latency micro-interaction sound cues without audio file downloads.
- **State Management**: React state hooks synchronized via TanStack Query and standard REST API clients.

### B. API & Agent Layer (`backend/app/routes/` & `services/`)
- **`agent_service.py`**: Coordinates intent detection, memory extraction, system prompt generation, and response assembly.
- **`ai_provider.py`**: Clean interface wrapping AI models with deterministic fallbacks when offline.
- **`memcode_client.py`**: Isolated OpenAI-compatible HTTP client honoring `MEMCODE_BASE_URL`, `MEMCODE_API_KEY`, and `MEMCODE_MODEL`.
- **`memory_service.py`**: Stores interaction context, preferences, and session summaries.

### C. Behavior & Gamification Engine (`behavior_engine.py`)
- Calculates deterministic metrics:
  - **Productivity Score** = $f(\text{Completion Rate}, \text{Difficulty}, \text{Focus Time}, \text{Consistency}, \text{Recency})$
  - **Energy** = $f(\text{Activity Density}, \text{Daily Load})$
  - **Happiness** = $f(\text{Streak Momentum}, \text{Recent Wins}, \text{Inactivity Recovery})$
  - **Pet State** = Prioritized state machine evaluating immediate user action vs. historical energy/consistency.
  - **XP & Levels** = Step progression with quadratic growth.

### D. Relational Data Layer (`models.py`)
- **Tables**: `users`, `pets`, `goals`, `tasks`, `focus_sessions`, `productivity_events`, `daily_stats`, `xp_transactions`, `achievements`, `user_achievements`, `memories`, `agent_sessions`, `agent_messages`.
