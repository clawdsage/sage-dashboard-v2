-- Mission Control Seed Data
-- Run this after the migration to populate initial data

-- Clear existing data (optional - be careful!)
-- DELETE FROM activities;
-- DELETE FROM messages;
-- DELETE FROM tasks;
-- DELETE FROM agents;

-- ============================================================================
-- 1. INSERT THE SQUAD (5 Agents)
-- ============================================================================
INSERT INTO agents (name, role, model, session_key, avatar, status) VALUES
  ('Sage', 'Squad Lead / Orchestrator', 'claude-sonnet-4-5', 'agent:main:main', '🧠', 'active'),
  ('Friday', 'Coding Agent', 'grok-code-fast-1', 'agent:coding:main', '💻', 'idle'),
  ('Loki', 'Copy Agent', 'gpt-4o', 'agent:copy:main', '📝', 'idle'),
  ('Vision', 'Researcher Agent', 'gemini-2.0-flash', 'agent:research:main', '🔍', 'idle'),
  ('Fury', 'Web/Social Search Agent', 'grok-4.2', 'agent:search:main', '🌐', 'idle')
ON CONFLICT (name) DO UPDATE SET
  role = EXCLUDED.role,
  model = EXCLUDED.model,
  session_key = EXCLUDED.session_key,
  avatar = EXCLUDED.avatar,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================================
-- 2. CREATE SAMPLE TASKS FOR DEMONSTRATION
-- ============================================================================

-- Task 1: Mission Control Dashboard (In Progress)
INSERT INTO tasks (title, description, status, assignee_ids, priority) VALUES
  (
    'Build Mission Control Dashboard',
    'Create the Mission Control UI with real-time agent status updates, kanban board, and activity feed',
    'in_progress',
    ARRAY[(SELECT id FROM agents WHERE name = 'Sage')],
    'high'
  )
ON CONFLICT DO NOTHING;

-- Task 2: Database Schema (Review)
INSERT INTO tasks (title, description, status, assignee_ids, priority) VALUES
  (
    'Create Database Schema',
    'Design and implement Supabase tables for agents, tasks, messages, and activities with RLS policies',
    'review',
    ARRAY[(SELECT id FROM agents WHERE name = 'Friday')],
    'high'
  )
ON CONFLICT DO NOTHING;

-- Task 3: Real-time Integration (Assigned)
INSERT INTO tasks (title, description, status, assignee_ids, priority) VALUES
  (
    'Set up Real-time Subscriptions',
    'Implement Supabase real-time subscriptions for live updates across all mission control components',
    'assigned',
    ARRAY[(SELECT id FROM agents WHERE name = 'Friday')],
    'medium'
  )
ON CONFLICT DO NOTHING;

-- Task 4: Agent Cards UI (Inbox)
INSERT INTO tasks (title, description, status, assignee_ids, priority) VALUES
  (
    'Design Agent Cards',
    'Create visually appealing agent cards with status indicators, avatars, and current task info',
    'inbox',
    '{}',
    'medium'
  )
ON CONFLICT DO NOTHING;

-- Task 5: Kanban Board (Done)
INSERT INTO tasks (title, description, status, assignee_ids, priority, completed_at) VALUES
  (
    'Research Kanban Libraries',
    'Evaluate drag-and-drop kanban libraries for React (dnd-kit, react-beautiful-dnd, etc.)',
    'done',
    ARRAY[(SELECT id FROM agents WHERE name = 'Vision')],
    'low',
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. CREATE SAMPLE MESSAGES/COMMENTS
-- ============================================================================

-- Get task IDs for reference
DO $$
DECLARE
  v_dashboard_task_id UUID := (SELECT id FROM tasks WHERE title = 'Build Mission Control Dashboard');
  v_schema_task_id UUID := (SELECT id FROM tasks WHERE title = 'Create Database Schema');
  v_realtime_task_id UUID := (SELECT id FROM tasks WHERE title = 'Set up Real-time Subscriptions');
  v_sage_id UUID := (SELECT id FROM agents WHERE name = 'Sage');
  v_friday_id UUID := (SELECT id FROM agents WHERE name = 'Friday');
  v_vision_id UUID := (SELECT id FROM agents WHERE name = 'Vision');
BEGIN

  -- Comments on Dashboard task
  INSERT INTO messages (task_id, from_agent_id, content, mentions) VALUES
    (v_dashboard_task_id, v_sage_id, 'Starting Phase 1: Database schema and real-time setup. @Friday can you handle the SQL migration?', ARRAY[v_friday_id]),
    (v_dashboard_task_id, v_friday_id, 'On it! Creating tables for agents, tasks, messages, and activities with proper indexes and RLS.', '{}'),
    (v_dashboard_task_id, v_sage_id, 'Great! Make sure to enable real-time publication on all tables.', '{}');

  -- Comments on Schema task
  INSERT INTO messages (task_id, from_agent_id, content, mentions) VALUES
    (v_schema_task_id, v_friday_id, 'Schema complete! Created 4 tables with UUIDs, timestamps, and proper relationships.', '{}'),
    (v_schema_task_id, v_sage_id, 'Excellent. @Vision can you review the schema design?', ARRAY[v_vision_id]),
    (v_schema_task_id, v_vision_id, 'Reviewing now. Looks good - I like the array columns for assignee_ids and mentions.', '{}');

  -- Comments on Real-time task
  INSERT INTO messages (task_id, from_agent_id, content) VALUES
    (v_realtime_task_id, v_friday_id, 'Setting up Supabase real-time subscriptions. Need to configure the publication.', '{}'),
    (v_realtime_task_id, v_sage_id, 'Remember to test with multiple clients to ensure updates propagate correctly.', '{}');

END $$;

-- ============================================================================
-- 4. CREATE SAMPLE ACTIVITIES (FEED EVENTS)
-- ============================================================================

-- Get IDs for reference
DO $$
DECLARE
  v_sage_id UUID := (SELECT id FROM agents WHERE name = 'Sage');
  v_friday_id UUID := (SELECT id FROM agents WHERE name = 'Friday');
  v_vision_id UUID := (SELECT id FROM agents WHERE name = 'Vision');
  v_dashboard_task_id UUID := (SELECT id FROM tasks WHERE title = 'Build Mission Control Dashboard');
  v_schema_task_id UUID := (SELECT id FROM tasks WHERE title = 'Create Database Schema');
  v_realtime_task_id UUID := (SELECT id FROM tasks WHERE title = 'Set up Real-time Subscriptions');
  v_kanban_task_id UUID := (SELECT id FROM tasks WHERE title = 'Research Kanban Libraries');
BEGIN

  -- Agent activations
  INSERT INTO activities (type, agent_id, message) VALUES
    ('agent_activated', v_sage_id, 'Sage activated as Squad Lead'),
    ('agent_activated', v_friday_id, 'Friday activated for coding tasks'),
    ('agent_activated', v_vision_id, 'Vision activated for research');

  -- Task activities (spread over time)
  INSERT INTO activities (type, agent_id, task_id, message, created_at) VALUES
    ('task_created', v_sage_id, v_dashboard_task_id, 'Sage created task: Build Mission Control Dashboard', NOW() - INTERVAL '3 hours'),
    ('task_assigned', v_sage_id, v_dashboard_task_id, 'Sage assigned themselves to: Build Mission Control Dashboard', NOW() - INTERVAL '3 hours'),
    ('task_created', v_sage_id, v_schema_task_id, 'Sage created task: Create Database Schema', NOW() - INTERVAL '2.5 hours'),
    ('task_assigned', v_sage_id, v_schema_task_id, 'Friday assigned to: Create Database Schema', NOW() - INTERVAL '2.5 hours'),
    ('task_status_changed', v_friday_id, v_schema_task_id, 'Friday moved "Create Database Schema" to Review', NOW() - INTERVAL '1 hour'),
    ('task_created', v_sage_id, v_realtime_task_id, 'Sage created task: Set up Real-time Subscriptions', NOW() - INTERVAL '2 hours'),
    ('task_assigned', v_sage_id, v_realtime_task_id, 'Friday assigned to: Set up Real-time Subscriptions', NOW() - INTERVAL '2 hours'),
    ('task_created', v_sage_id, NULL, 'Sage created task: Design Agent Cards', NOW() - INTERVAL '1.5 hours'),
    ('task_status_changed', v_vision_id, v_kanban_task_id, 'Vision completed: Research Kanban Libraries', NOW() - INTERVAL '2 hours');

  -- Comment activities
  INSERT INTO activities (type, agent_id, task_id, message, created_at) VALUES
    ('comment_posted', v_sage_id, v_dashboard_task_id, 'Sage commented on: Build Mission Control Dashboard', NOW() - INTERVAL '2.9 hours'),
    ('comment_posted', v_friday_id, v_dashboard_task_id, 'Friday commented on: Build Mission Control Dashboard', NOW() - INTERVAL '2.8 hours'),
    ('comment_posted', v_sage_id, v_schema_task_id, 'Sage commented on: Create Database Schema', NOW() - INTERVAL '2.4 hours'),
    ('comment_posted', v_vision_id, v_schema_task_id, 'Vision commented on: Create Database Schema', NOW() - INTERVAL '2.3 hours'),
    ('mention', v_sage_id, v_dashboard_task_id, 'Sage mentioned @Friday in a comment', NOW() - INTERVAL '2.9 hours'),
    ('mention', v_sage_id, v_schema_task_id, 'Sage mentioned @Vision in a comment', NOW() - INTERVAL '2.4 hours');

END $$;

-- ============================================================================
-- 5. UPDATE AGENT CURRENT TASKS
-- ============================================================================
UPDATE agents 
SET current_task_id = (SELECT id FROM tasks WHERE title = 'Build Mission Control Dashboard')
WHERE name = 'Sage';

UPDATE agents 
SET current_task_id = (SELECT id FROM tasks WHERE title = 'Set up Real-time Subscriptions')
WHERE name = 'Friday';

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Show all agents
SELECT '=== AGENTS ===' as section;
SELECT name, role, status, 
  (SELECT title FROM tasks WHERE id = agents.current_task_id) as current_task
FROM agents 
ORDER BY created_at;

-- Show all tasks with status
SELECT '=== TASKS ===' as section;
SELECT title, status, priority,
  (SELECT string_agg(name, ', ') FROM agents WHERE id = ANY(tasks.assignee_ids)) as assignees,
  created_at
FROM tasks 
ORDER BY 
  CASE status 
    WHEN 'in_progress' THEN 1
    WHEN 'review' THEN 2
    WHEN 'assigned' THEN 3
    WHEN 'inbox' THEN 4
    WHEN 'done' THEN 5
  END,
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END;

-- Show recent activity feed
SELECT '=== RECENT ACTIVITY ===' as section;
SELECT 
  a.type,
  a.message,
  ag.name as agent,
  t.title as task,
  a.created_at
FROM activities a
LEFT JOIN agents ag ON a.agent_id = ag.id
LEFT JOIN tasks t ON a.task_id = t.id
ORDER BY a.created_at DESC
LIMIT 10;

-- Show message threads
SELECT '=== RECENT MESSAGES ===' as section;
SELECT 
  t.title as task,
  a.name as from_agent,
  m.content,
  (SELECT string_agg(name, ', ') FROM agents WHERE id = ANY(m.mentions)) as mentions,
  m.created_at
FROM messages m
LEFT JOIN tasks t ON m.task_id = t.id
LEFT JOIN agents a ON m.from_agent_id = a.id
ORDER BY m.created_at DESC
LIMIT 5;

-- ============================================================================
-- COMMENTS
-- ============================================================================

/*
Seed Data Summary:
- 5 agents inserted/updated (Sage, Friday, Loki, Vision, Fury)
- 5 sample tasks across different statuses
- 9 sample messages/comments with @mentions
- 15 sample activities showing timeline
- Agent current tasks updated

The system now has realistic data to demonstrate:
1. Agent cards with different statuses
2. Kanban board with tasks in all columns
3. Activity feed with recent events
4. Comment threads with mentions
5. Real-time updates ready

To reset: Run DELETE statements at top (commented out for safety)
*/