-- Sage Dashboard V2 - Schema Extensions
-- Run these in Supabase SQL Editor if columns don't exist

-- Add model column to subagent_runs (if not exists)
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS model TEXT;

-- Add session_key for linking to Clawdbot sessions
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS session_key TEXT;

-- Add label for agent identification  
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS label TEXT;

-- Add tokens breakdown
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS tokens_input INTEGER DEFAULT 0;

ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS tokens_output INTEGER DEFAULT 0;

-- Add duration in milliseconds
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- Add output_summary for review queue
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS output_summary TEXT;

-- Add color to projects for visual distinction
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Add order_index to tasks for drag-drop ordering
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subagent_runs_status ON subagent_runs(status);
CREATE INDEX IF NOT EXISTS idx_subagent_runs_started_at ON subagent_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_subagent_runs_project_id ON subagent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Enable realtime on tables (if not already enabled)
-- Run in Supabase Dashboard > Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE subagent_runs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE projects;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
