# Productivity Pet — Living AI Productivity Agent

> A virtual companion that is your autonomous AI productivity agent & persistent Windows desktop companion.

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

3. **🖥️ True Desktop Floating Pet Mode (Tauri + Standalone)**:
   - **Always-On-Top Windows Companion**: The pet stays hovering above VS Code, Chrome, or any desktop window even when the main browser is minimized or closed.
   - **Transparent & Frameless**: Zero browser chrome or white rectangular frames. Only the living avatar and its energy aura appear on your desktop.
   - **Native Dragging & Persistence**: Drag anywhere on screen; position is automatically remembered across reboots.
   - **Interactive Desktop AI Bubble**: Click the desktop pet to reveal quick actions (*"Plan My Day"*, *"Start 25m Focus"*, *"What's Next?"*, *"Motivation"*) or type custom requests.
   - **Real-Time Synchronized State**: Completing tasks in the web dashboard or API immediately triggers celebrations and floating +XP particle bursts on your desktop pet.
   - **System Tray Integration**: Background tray menu with Show/Hide, Start Focus, Web Workspace, and Quit options.

4. **Gamification & Streak Mechanics**:
   - Task completion triggers XP gain, level-up milestones, audio cues, and confetti celebrations.
   - 7-day visual calendar streak tracker.
   - Supportive recovery behavior: Pet becomes `concerned` after 3+ days away and gently suggests one small win instead of guilt.
   - Full achievement trophy room with real-time progress tracking.

5. **Immersive Deep Focus Protocol**:
   - Full-screen distraction-free focus workspace.
   - Enlarged focused companion, calming ambient aura, live countdown timer, and XP payout upon completion.

6. **Persistent Memory & Context Layer**:
   - Remembers user preferences, project context, working habits, and past milestones.
   - Database-backed fallback ensuring zero external dependencies during offline development.

7. **Web Audio Synthesizer**:
   - Satisfying synthesized sound effects for task completions, level-ups, focus chimes, and AI thinking blips without external audio asset downloads.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
│     (TypeScript, Tailwind CSS, Framer Motion)         │
├───────────────────────────┬────────────────────────────┤
│     Web Dashboard Mode    │   Tauri Desktop Companion  │
│  (Full Productivity OS)   │  (Transparent / Frameless) │
└─────────────┬─────────────┴─────────────┬──────────────┘
              │                           │
              └─────────────┬─────────────┘
                            │ REST APIs (Zero Secrets in Frontend)
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

## Quick Start 🚀

### 1. One-Click Vercel Deployment

You can deploy the web version of Productivity Pet Agent directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fukseemanth-cmd%2FProductivity-Pet-Agent&env=MEMCODE_API_KEY,DATABASE_URL)

**Required Environment Variables:**
- `MEMCODE_API_KEY`: Your API key for Memcode / AI provider.
- `DATABASE_URL`: A PostgreSQL connection string for database persistence (e.g., from Vercel Postgres or Supabase).

---

### Local Setup (Web Mode)
- **Python 3.10+**
- **Node.js 18+** & **npm**

#### 1. Backend Setup

```bash
# 1. Install dependencies (if not already done)
pip install -r requirements.txt

# 2. Verify .env file
```

Example `.env`:
```ini
MEMCODE_API_KEY=your-api-key-here
MEMCODE_BASE_URL=https://api.memcode.ai/v1
MEMCODE_MODEL=gpt-4o-mini
DATABASE_URL=
CORS_ORIGINS=http://localhost:5173
VITE_API_URL=http://localhost:8000
```

```bash
# 3. Start the FastAPI server (keep this terminal open)
uvicorn app.main:app --reload --port 8000
```

---

### 2. Frontend & Web Mode

Open a **new terminal** in the root directory:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. True Desktop Floating Companion Mode

You have two ways to run the desktop companion:

#### Option A: Native Tauri App (Always-On-Top Windows Executable)
```bash
npm run tauri:dev
```
*(Requires Rust `cargo` installed on your machine. Builds the native transparent Windows desktop executable.)*

#### Option B: Standalone Popout Window (Instant Zero-Install Mode)
1. Open [http://localhost:5173](http://localhost:5173)
2. Click the **"Desktop Pet"** button in the top navigation bar.
3. Click **"Launch Floating Companion Window"** (or open `http://localhost:5173/?mode=desktop`).
4. A standalone frameless floating companion pops out on your desktop!

---

## 🧪 Automated Testing

Run the comprehensive backend test suite:

```bash
python -m pytest tests/ -v
```

Tests verify:
- ✅ Task CRUD and completion reward pipeline
- ✅ Level thresholds and XP progression
- ✅ Behavior Engine scoring and emotional pet states
- ✅ Achievement evaluation
- ✅ Agent chat and fallback resilience
