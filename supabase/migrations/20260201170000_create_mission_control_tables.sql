-- Mission Control Phase 1: Database Schema
-- Created: 2026-02-01 17:00:00 EST
-- Purpose: Create tables for Mission Control dashboard

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. AGENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  model TEXT NOT NULL,
  session_key TEXT,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'thinking', 'blocked')),
  current_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  avatar TEXT DEFAULT '🤖',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'assigned', 'in_progress', 'review', 'done')),
  assignee_ids UUID[] DEFAULT '{}',
  created_by TEXT NOT NULL DEFAULT 'sage',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. MESSAGES TABLE (Task Comments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. ACTIVITIES TABLE (Feed Events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_session_key ON agents(session_key);
CREATE INDEX IF NOT EXISTS idx_agents_current_task_id ON agents(current_task_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_task_id ON messages(task_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_agent_id ON messages(from_agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_agent_id ON activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_activities_task_id ON activities(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
CREATE TRIGGER update_agents_updated_at 
  BEFORE UPDATE ON agents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 1. Agents RLS Policies
-- Allow public read access (anyone can see agent status)
CREATE POLICY "Agents are viewable by everyone" ON agents
  FOR SELECT USING (true);

-- Only authenticated users can insert/update agents
CREATE POLICY "Agents are editable by authenticated users" ON agents
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. Tasks RLS Policies
-- Allow public read access
CREATE POLICY "Tasks are viewable by everyone" ON tasks
  FOR SELECT USING (true);

-- Only authenticated users can modify tasks
CREATE POLICY "Tasks are editable by authenticated users" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Messages RLS Policies
-- Allow public read access
CREATE POLICY "Messages are viewable by everyone" ON messages
  FOR SELECT USING (true);

-- Only authenticated users can post messages
CREATE POLICY "Messages are editable by authenticated users" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Activities RLS Policies
-- Allow public read access
CREATE POLICY "Activities are viewable by everyone" ON activities
  FOR SELECT USING (true);

-- Only authenticated users can create activities
CREATE POLICY "Activities are editable by authenticated users" ON activities
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- REAL-TIME PUBLICATION
-- ============================================================================

-- Enable real-time for all mission control tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- ============================================================================
-- SEED DATA: The Squad
-- ============================================================================

-- Insert the 5 core agents
INSERT INTO agents (name, role, model, session_key, avatar) VALUES
  ('Sage', 'Squad Lead / Orchestrator', 'claude-sonnet-4-5', 'agent:main:main', '🧠'),
  ('Friday', 'Coding Agent', 'grok-code-fast-1', 'agent:coding:main', '💻'),
  ('Loki', 'Copy Agent', 'gpt-4o', 'agent:copy:main', '📝'),
  ('Vision', 'Researcher Agent', 'gemini-2.0-flash', 'agent:research:main', '🔍'),
  ('Fury', 'Web/Social Search Agent', 'grok-4.2', 'agent:search:main', '🌐')
ON CONFLICT DO NOTHING;

-- Create a sample task to demonstrate the system
INSERT INTO tasks (title, description, status, assignee_ids, priority) VALUES
  ('Build Mission Control Dashboard', 'Create the Mission Control UI with real-time agent status updates', 'in_progress', ARRAY[(SELECT id FROM agents WHERE name = 'Sage')], 'high')
ON CONFLICT DO NOTHING;

-- Create sample activity for the task creation
INSERT INTO activities (type, agent_id, task_id, message) VALUES
  ('task_created', (SELECT id FROM agents WHERE name = 'Sage'), (SELECT id FROM tasks WHERE title = 'Build Mission Control Dashboard'), 'Sage created task: Build Mission Control Dashboard')
ON CONFLICT DO NOTHING;

-- Create sample message/comment
INSERT INTO messages (task_id, from_agent_id, content) VALUES
  ((SELECT id FROM tasks WHERE title = 'Build Mission Control Dashboard'), (SELECT id FROM agents WHERE name = 'Sage'), 'Starting Phase 1: Database schema and real-time setup')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update agent status and log activity
CREATE OR REPLACE FUNCTION update_agent_status(
  p_agent_id UUID,
  p_status TEXT,
  p_current_task_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_agent_name TEXT;
  v_task_title TEXT;
BEGIN
  -- Update agent status
  UPDATE agents 
  SET status = p_status, 
      current_task_id = p_current_task_id,
      updated_at = NOW()
  WHERE id = p_agent_id
  RETURNING name INTO v_agent_name;
  
  -- Log activity
  INSERT INTO activities (type, agent_id, task_id, message)
  VALUES (
    'agent_status_changed',
    p_agent_id,
    p_current_task_id,
    v_agent_name || ' status changed to ' || p_status || 
    CASE WHEN p_current_task_id IS NOT NULL THEN 
      ' (Task: ' || COALESCE((SELECT title FROM tasks WHERE id = p_current_task_id), 'Unknown') || ')'
    ELSE '' END
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create task with activity logging
CREATE OR REPLACE FUNCTION create_task_with_activity(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium',
  p_created_by TEXT DEFAULT 'sage'
)
RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
BEGIN
  -- Create task
  INSERT INTO tasks (title, description, priority, created_by)
  VALUES (p_title, p_description, p_priority, p_created_by)
  RETURNING id INTO v_task_id;
  
  -- Log activity
  INSERT INTO activities (type, task_id, message)
  VALUES ('task_created', v_task_id, 'Task created: ' || p_title);
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

/*
Mission Control Database Schema Ready

Tables Created:
1. agents - The AI agent squad members
2. tasks - Kanban board tasks
3. messages - Task comments and communication
4. activities - Real-time activity feed events

Features:
- UUID primary keys
- Automatic timestamps (created_at, updated_at)
- Row Level Security (RLS) policies
- Real-time publication enabled
- Performance indexes
- Helper functions for common operations
- Seed data for 5 agents

To deploy:
1. Run this SQL in Supabase SQL Editor
2. Verify tables appear in Table Editor
3. Check real-time is enabled in Replication settings
4. Test with sample queries below

Sample Queries:
-- Get all agents with their current task
SELECT a.*, t.title as current_task_title
FROM agents a
LEFT JOIN tasks t ON a.current_task_id = t.id
ORDER BY a.created_at;

-- Get tasks with assignee names
SELECT t.*, 
  array_agg(a.name) as assignee_names
FROM tasks t
LEFT JOIN agents a ON a.id = ANY(t.assignee_ids)
GROUP BY t.id
ORDER BY t.created_at DESC;

-- Get recent activity feed
SELECT a.type, a.message, ag.name as agent_name, t.title as task_title, a.created_at
FROM activities a
LEFT JOIN agents ag ON a.agent_id = ag.id
LEFT JOIN tasks t ON a.task_id = t.id
ORDER BY a.created_at DESC
LIMIT 20;
*/