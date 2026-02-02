-- Mission Control: Agent Runs + Live Log Events
-- Created: 2026-02-02
-- Purpose: Support clean live logs (streaming) + archives per agent

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. AGENT_RUNS
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  session_key TEXT,

  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','failed','cancelled')),
  title TEXT,
  summary TEXT,
  last_line TEXT,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_started ON agent_runs(agent_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);

-- ============================================================================
-- 2. AGENT_RUN_EVENTS (append-only stream)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_run_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info','warn','error')),
  verb TEXT NOT NULL DEFAULT 'working',
  message TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_run_events_run_created ON agent_run_events(run_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_agent_run_events_agent_created ON agent_run_events(agent_id, created_at DESC);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_run_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent runs are viewable by everyone" ON agent_runs
  FOR SELECT USING (true);
CREATE POLICY "Agent runs are editable by authenticated users" ON agent_runs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Agent run events are viewable by everyone" ON agent_run_events
  FOR SELECT USING (true);
CREATE POLICY "Agent run events are editable by authenticated users" ON agent_run_events
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE agent_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_run_events;
