# Productivity Pet — Living AI Productivity Agent

> A virtual companion that is your autonomous AI productivity agent.

Productivity Pet is not a generic Todo app with a mascot attached. **The Pet itself is the AI Agent.** It understands high-level human goals, breaks them down into structured work, monitors behavioral signals, reacts emotionally to progress and inactivity, manages deep focus sessions, awards XP and achievements, and continuously learns user patterns through a persistent memory layer.

---

## 🌟 Key Features

1. **Autonomous AI Agent Core (Nova)**:
   - Understands natural language goals (e.g. *"I need to finish my ML project."*).
   - Generates actionable, structured multi-task plans with difficulty ratings, time estimates, and XP reward previews.
   - Recommends the optimal next immediate action.
   - Multi-step visual thinking sequence without disclosing chain-of-thought internals.

2. **Living Emotional & Behavioral State Engine**:
   - 11 distinct SVG/Framer-Motion animated states: `idle`, `thinking`, `happy`, `excited`, `sleepy`, `tired`, `concerned`, `celebrating`, `encouraging`, `working`, `focused`.
   - Real behavioral scoring algorithm calculates **Productivity Score (0-100)**, **Energy (%)**, **Happiness (%)**, and **Focus Score (%)** from completion consistency, focus minutes, goal difficulty, streaks, and recovery behavior.
   - Backend is the single source of truth (zero hardcoded/client-calculated scores).

3. **Gamification & Streak Mechanics**:
   - Task completion triggers XP gain, level-up milestones, audio cues, and confetti celebrations.
   - 7-day visual calendar streak tracker.
   - Supportive recovery behavior: Pet becomes `concerned` after 3+ days away and gently suggests one small win instead of guilt.
   - Full achievement trophy room with real-time progress tracking.

4. **Immersive Deep Focus Protocol**:
   - Full-screen distraction-free focus workspace.
   - Enlarged focused companion, calming ambient aura, live countdown timer, and XP payout upon completion.

5. **Persistent Memory & Context Layer**:
   - Remembers user preferences, project context, working habits, and past milestones.
   - Database-backed fallback ensuring zero external dependencies during offline development.

6. **Web Audio Synthesizer**:
   - Satisfying synthesized sound effects for task completions, level-ups, focus chimes, and AI thinking blips without external audio asset downloads.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
│     (TypeScript, Tailwind CSS, Framer Motion)         │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Backend                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │               Agent Orchestrator                 │  │
│  │   • Intent Detection                             │  │
│  │   • Goal Breakdown & Planning                    │  │
│  │   • Next Action Selection                        │  │
│  └──────────┬─────────────────┬─────────────────┬───┘  │
│             │                 │                 │      │
│  ┌──────────▼─────────┐ ┌─────▼─────┐ ┌─────────▼───┐  │
│  │  AI Provider       │ │ Memory    │ │ Behavior    │  │
│  │  (MemCode Client)  │ │ Service   │ │ Engine      │  │
│  └────────────────────┘ └───────────┘ └─────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ SQLAlchemy
┌───────────────────────────▼────────────────────────────┐
│           SQLite / PostgreSQL Relational DB            │
│   (users, pets, goals, tasks, focus, daily_stats...)   │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 1. Backend Setup

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Verify or create your backend .env file
# (Copy from .env.example if needed)
```

Example `backend/.env`:
```ini
MEMCODE_API_KEY=your-api-key-here
MEMCODE_BASE_URL=https://api.memcode.ai/v1
MEMCODE_MODEL=gpt-4o-mini
DATABASE_URL=
CORS_ORIGINS=http://localhost:5173
```

> 🔒 **Security Notice**: AI provider credentials live **exclusively in `backend/.env`**. They are never exposed to the frontend bundle or client localStorage.

```bash
# 3. Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The server will automatically initialize SQLite with demo data and start at `http://localhost:8000`.

---

### 2. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run the comprehensive unit and integration test suite:

```bash
cd backend
python -m pytest tests/ -v
```

Tests verify:
- ✅ Task CRUD and completion reward pipeline
- ✅ Level thresholds and XP progression
- ✅ Behavior Engine scoring and emotional pet states
- ✅ Achievement evaluation
- ✅ Agent chat and fallback resilience

---

## 🎬 30-Second Hackathon Demo Flow

1. **First Glance**:
   - Open [http://localhost:5173](http://localhost:5173).
   - Notice Nova breathing, the real-time HUD (Productivity 68, Energy 72%, Happiness 78%, Focus 65%), LVL 7 badge, and 5-day streak.
2. **AI Goal Breakdown**:
   - Click the prompt chip **"Finish ML project"** or type `I need to finish my ML project.` in the command bar (or press `⌘K` / `Ctrl+K`).
   - Observe Nova entering the **THINKING** state with live activity statuses: *Understanding your goal → Checking workload → Building plan → Choosing next action*.
   - Nova becomes **ENCOURAGING** and reveals the structured **Plan Card** with XP rewards and time estimates.
3. **Execute & Observe**:
   - Click **"Add All to Tasks"** or **"Start Now"**.
   - Tasks are populated in the active backlog.
   - Click the checkmark on any task — listen to the synthesized chime, watch the +XP animation, level badge progress, and observe Nova transitioning to **EXCITED** or **CELEBRATING**.
4. **Deep Focus Chamber**:
   - Navigate to the **Focus** tab or click the Play icon next to a task.
   - Enter the full-screen Focus Room with the enlarged concentrated companion and countdown timer.
   - Complete or exit to claim deep focus XP.
5. **Analytics & Milestones**:
   - Visit the **Progress** tab to inspect the glowing productivity trend and focus distributions.
   - Visit **Achieve** to review unlocked badges.
