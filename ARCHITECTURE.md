# System Architecture — Productivity Pet

This document details the architectural layers and data flow of **Productivity Pet**, including Web Dashboard Mode and True Desktop Companion Mode.

---

## 1. End-to-End Execution Flow

```
┌────────────────────────────────────────────────────────┐
│                      User Action                       │
│    (Web Dashboard or Desktop Companion AI Command)     │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼ (REST POST /api/agent/chat)    ▼ (REST POST /api/tasks/:id/complete)
┌────────────────────────────────────────────────────────┐
│                   FastAPI Gateway                      │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────────────────┐  ┌───────────────────────────────────┐
│        Agent Orchestrator         │  │          Behavior Engine          │
│ • Intent Detection                │  │ • Productivity Score (0-100)      │
│ • Context Retrieval & Memory      │  │ • Energy & Happiness              │
│ • AI Plan / Next Action           │  │ • Pet State (11 animation modes)  │
└───────────┬───────────────────────┘  │ • XP & Level Progression          │
            │                          └─────────────┬─────────────────────┘
            ▼                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   SQLite / PostgreSQL Database Layer                     │
│        (users, pets, tasks, goals, focus_sessions, daily_stats...)       │
└───────────┬────────────────────────────────┬─────────────────────────────┘
            │                                │
            ▼                                ▼
┌───────────────────────────────────┐  ┌───────────────────────────────────┐
│        React Web Dashboard        │  │     Tauri Desktop Companion       │
│ • Living Companion Canvas         │  │ • Transparent & Frameless         │
│ • Full Backlog & Focus Chamber    │  │ • Always-On-Top Windows Window    │
│ • Analytics & Milestones          │  │ • Native Dragging & Auto-Sync     │
└───────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 2. Core Subsystems

### A. Dual Presentation Layer (`frontend/`)
- **Web Dashboard Mode**: Full productivity operating system with ⌘K command bar, task manager, focus room, charts, and gamification gallery.
- **Desktop Pet Mode (`DesktopPetApp.tsx` & `src-tauri/`)**:
  - Transparent, frameless window.
  - Native window dragging with `data-tauri-drag-region`.
  - Stays always-on-top above IDEs (e.g. VS Code) and browser windows.
  - Background auto-sync with `/api/pet` and `/api/tasks`.
  - System tray menu with companion visibility and quick focus controls.

### B. Living Companion Renderer (`PetRenderer.tsx`)
- High-performance, lightweight SVG Framer Motion avatar.
- 11 distinct animation states (`idle`, `thinking`, `happy`, `excited`, `sleepy`, `tired`, `concerned`, `celebrating`, `encouraging`, `working`, `focused`).
- Dynamically rendered across both the web dashboard and native desktop companion window.

### C. Agent & AI Provider Layer (`backend/app/services/`)
- **`agent_service.py`**: Coordinates intent detection, memory extraction, system prompt generation, and response assembly.
- **`ai_provider.py` & `memcode_client.py`**: Isolated OpenAI-compatible HTTP client for MemCode with deterministic fallbacks.
- **`memory_service.py`**: Context retrieval and preference cache.

### D. Behavior & Gamification Engine (`behavior_engine.py`)
- Calculates deterministic metrics:
  - **Productivity Score** = $f(\text{Completion Rate}, \text{Difficulty}, \text{Focus Time}, \text{Consistency}, \text{Recency})$
  - **Energy** = $f(\text{Activity Density}, \text{Daily Load})$
  - **Happiness** = $f(\text{Streak Momentum}, \text{Recent Wins}, \text{Inactivity Recovery})$
  - **Pet State** = Prioritized state machine evaluating immediate user action vs. historical energy/consistency.
  - **XP & Levels** = Step progression with quadratic growth.
