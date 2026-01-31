# Sage Dashboard V2 - Architecture & Design

## Vision
**"A Symphony of Productivity"** - A Fortune 500-quality command center for AI operations. Watch agents work in real-time, manage projects, track costs, review outputs. Beautiful, fast, professional.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + custom design tokens
- **State:** Zustand (simple, fast)
- **Data Fetching:** TanStack Query (React Query)
- **Charts:** Recharts
- **Animations:** Framer Motion (subtle, purposeful)
- **Icons:** Lucide React

### Backend
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime (WebSocket subscriptions)
- **Auth:** Supabase Auth (future - not MVP)
- **API:** Next.js API routes + Supabase client

### Infrastructure
- **Hosting:** Vercel
- **Domain:** TBD (new project)
- **CI/CD:** Vercel auto-deploy from GitHub

---

## Design System

### Colors (Dark Theme)
```
Background:
  --bg-primary: #0a0a0b      (near black)
  --bg-secondary: #111113    (cards)
  --bg-tertiary: #1a1a1d     (hover states)
  --bg-elevated: #222225     (modals, dropdowns)

Text:
  --text-primary: #fafafa    (headings, important)
  --text-secondary: #a1a1aa  (body text)
  --text-muted: #71717a      (hints, timestamps)

Borders:
  --border-subtle: #27272a
  --border-default: #3f3f46

Accents:
  --accent-blue: #3b82f6     (primary actions, active states)
  --accent-green: #22c55e    (success, complete)
  --accent-amber: #f59e0b    (warning, pending)
  --accent-red: #ef4444      (error, failed)
  --accent-purple: #a855f7   (special, highlight)

Gradients (subtle, for hero elements):
  --gradient-blue: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)
  --gradient-glow: radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)
```

### Typography
```
Font Family: 'Inter', system-ui, sans-serif
Code Font: 'JetBrains Mono', monospace

Sizes:
  --text-xs: 0.75rem    (12px) - timestamps, labels
  --text-sm: 0.875rem   (14px) - body, secondary
  --text-base: 1rem     (16px) - body, primary
  --text-lg: 1.125rem   (18px) - subheadings
  --text-xl: 1.25rem    (20px) - card titles
  --text-2xl: 1.5rem    (24px) - section headers
  --text-3xl: 1.875rem  (30px) - page titles
  --text-4xl: 2.25rem   (36px) - hero numbers

Weights:
  --font-normal: 400
  --font-medium: 500
  --font-semibold: 600
  --font-bold: 700
```

### Spacing
```
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-5: 1.25rem  (20px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-10: 2.5rem  (40px)
--space-12: 3rem    (48px)
--space-16: 4rem    (64px)
```

### Components
```
Border Radius:
  --radius-sm: 0.375rem  (6px)
  --radius-md: 0.5rem    (8px)
  --radius-lg: 0.75rem   (12px)
  --radius-xl: 1rem      (16px)
  --radius-full: 9999px  (pills, avatars)

Shadows:
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3)
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4)
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5)
  --shadow-glow: 0 0 20px rgba(59,130,246,0.3)
```

---

## Page Structure

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main Content (fluid)               │
│  ┌─────────────┐  │  ┌─────────────────────────────────┐│
│  │ Logo        │  │  │ Page Header                     ││
│  │             │  │  │ (title, actions, breadcrumbs)   ││
│  │ Navigation  │  │  ├─────────────────────────────────┤│
│  │ - Dashboard │  │  │                                 ││
│  │ - Agents    │  │  │ Page Content                    ││
│  │ - Projects  │  │  │ (scrollable)                    ││
│  │ - Analytics │  │  │                                 ││
│  │ - Review    │  │  │                                 ││
│  │             │  │  │                                 ││
│  │ ─────────── │  │  │                                 ││
│  │ Quick Stats │  │  │                                 ││
│  │ (bottom)    │  │  │                                 ││
│  └─────────────┘  │  └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Pages

#### 1. Dashboard (Home)
**Purpose:** At-a-glance overview, the "symphony" view

```
┌─────────────────────────────────────────────┐
│  Welcome back, Tim              [Quick Add] │
│  3 agents active • $4.52 today             │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐│
│  │ LIVE AGENTS (Hero Section)              ││
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐    ││
│  │ │ Agent 1 │ │ Agent 2 │ │ Agent 3 │    ││
│  │ │ ██████░░│ │ ████░░░░│ │ ██░░░░░░│    ││
│  │ │ 75%     │ │ 50%     │ │ 25%     │    ││
│  │ └─────────┘ └─────────┘ └─────────┘    ││
│  └─────────────────────────────────────────┘│
├──────────────────────┬──────────────────────┤
│  RECENT ACTIVITY     │  TODAY'S METRICS     │
│  • Agent completed   │  ┌────┐ ┌────┐       │
│  • Task created      │  │ 12 │ │$4.5│       │
│  • Project updated   │  │runs│ │cost│       │
│  └───────────────────│  └────┘ └────┘       │
│                      │  ┌────┐ ┌────┐       │
│                      │  │45k │ │ 2m │       │
│                      │  │tkns│ │ avg│       │
│                      │  └────┘ └────┘       │
├──────────────────────┴──────────────────────┤
│  NEEDS ATTENTION (Review Queue Preview)     │
│  [2 agents pending review] [View All →]     │
└─────────────────────────────────────────────┘
```

#### 2. Agents (Live Monitor)
**Purpose:** Detailed view of all agents, real-time

- Live agents at top (pulsing indicator)
- Completed/failed agents below
- Filters: status, model, date range
- Click to expand: full logs, token usage, cost
- Virtual scrolling for performance

#### 3. Projects
**Purpose:** Organize work into projects with tasks

- Project cards with progress
- Click to expand: tasks, agents, notes
- Create/edit projects
- Drag-drop task ordering
- Link agents to projects

#### 4. Analytics
**Purpose:** Cost and usage insights

- Time period selector (today/week/month/custom)
- Cost over time chart
- Breakdown by model (pie chart)
- Breakdown by project (bar chart)
- Token usage trends
- Top expensive agents

#### 5. Review Queue
**Purpose:** Human-in-the-loop for agent outputs

- Cards for each pending review
- Show agent output/summary
- Approve / Request Changes / Reject
- Quick feedback input
- Mark as reviewed

---

## Database Schema

### Tables

```sql
-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active', -- active, completed, archived
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (belong to projects)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- todo, in_progress, done
  priority INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Runs (extended from existing)
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT,
  label TEXT,
  name TEXT NOT NULL,
  model TEXT,
  status TEXT DEFAULT 'active', -- active, completed, failed
  progress INTEGER DEFAULT 0,
  
  -- Task/Project linking
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  -- Execution details
  task_description TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Metrics
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  duration_ms INTEGER,
  
  -- Review
  review_status TEXT DEFAULT 'none', -- none, pending, approved, rejected
  output_summary TEXT,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log (for timeline)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- agent_started, agent_completed, agent_failed, project_created, task_completed, etc.
  entity_type TEXT, -- agent, project, task
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Stats (aggregated for fast queries)
CREATE TABLE daily_stats (
  date DATE PRIMARY KEY,
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0,
  avg_duration_ms INTEGER DEFAULT 0,
  models_used JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Real-time Subscriptions
- `agent_runs` - for live agent monitor
- `activity_log` - for activity timeline
- `projects` / `tasks` - for project updates

---

## API Integration

### Auto-Logging (Critical!)
Agents must automatically appear in the dashboard. Two approaches:

**Option A: Clawdbot Integration**
- Modify Clawdbot to POST to our API on agent spawn/complete
- Cleanest solution, requires Clawdbot changes

**Option B: Polling + Session Sync**
- Dashboard polls Clawdbot sessions_list API
- Syncs with database
- Less elegant but works without Clawdbot changes

**Recommendation:** Start with Option B (faster to implement), migrate to Option A later.

---

## File Structure

```
sage-dashboard-v2/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── agents/
│   │   └── page.tsx        # Live agents
│   ├── projects/
│   │   └── page.tsx        # Project manager
│   ├── analytics/
│   │   └── page.tsx        # Cost analytics
│   ├── review/
│   │   └── page.tsx        # Review queue
│   └── api/
│       ├── agents/
│       ├── projects/
│       └── stats/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── agents/
│   │   ├── AgentCard.tsx
│   │   ├── AgentList.tsx
│   │   └── LiveIndicator.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── TaskList.tsx
│   │   └── CreateProjectModal.tsx
│   ├── analytics/
│   │   ├── CostChart.tsx
│   │   ├── ModelBreakdown.tsx
│   │   └── StatCard.tsx
│   ├── review/
│   │   ├── ReviewCard.tsx
│   │   └── ReviewActions.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       └── ... (design system)
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── store.ts            # Zustand store
│   └── utils.ts            # Helpers
├── hooks/
│   ├── useAgents.ts        # Agent data + realtime
│   ├── useProjects.ts
│   ├── useAnalytics.ts
│   └── useRealtimeSubscription.ts
├── types/
│   └── index.ts            # TypeScript types
├── public/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## Build Phases

### Phase 1: Foundation (2-3 hours)
- [ ] Create Next.js project with TypeScript
- [ ] Configure Tailwind with design tokens
- [ ] Set up Supabase connection
- [ ] Create database schema
- [ ] Build layout (sidebar, header)
- [ ] Create base UI components

### Phase 2: Live Agents (3-4 hours)
- [ ] Agent data hooks with real-time
- [ ] AgentCard component
- [ ] AgentList with virtual scrolling
- [ ] Live indicators (pulsing, progress)
- [ ] Dashboard hero section
- [ ] Agent detail expansion

### Phase 3: Projects + Analytics (4-5 hours)
- [ ] Projects CRUD
- [ ] Task management
- [ ] Analytics charts
- [ ] Stats calculations
- [ ] Date range filters

### Phase 4: Review + Polish (overnight)
- [ ] Review queue UI
- [ ] Approve/reject flow
- [ ] Activity timeline
- [ ] Mobile responsive
- [ ] Error states
- [ ] Loading states
- [ ] Final visual polish

---

*Architecture document created: 2026-01-31 10:55 EST*
