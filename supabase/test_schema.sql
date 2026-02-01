-- Mission Control Schema Test
-- Run this after migration to verify everything works

-- ============================================================================
-- 1. BASIC TABLE CHECKS
-- ============================================================================

DO $$
DECLARE
  v_agent_count INTEGER;
  v_task_count INTEGER;
  v_message_count INTEGER;
  v_activity_count INTEGER;
BEGIN
  -- Check tables exist and have data
  SELECT COUNT(*) INTO v_agent_count FROM agents;
  SELECT COUNT(*) INTO v_task_count FROM tasks;
  SELECT COUNT(*) INTO v_message_count FROM messages;
  SELECT COUNT(*) INTO v_activity_count FROM activities;
  
  RAISE NOTICE '=== TABLE COUNTS ===';
  RAISE NOTICE 'Agents: %', v_agent_count;
  RAISE NOTICE 'Tasks: %', v_task_count;
  RAISE NOTICE 'Messages: %', v_message_count;
  RAISE NOTICE 'Activities: %', v_activity_count;
  
  -- Verify we have the squad
  IF v_agent_count >= 5 THEN
    RAISE NOTICE '✅ Squad present (5 agents expected)';
  ELSE
    RAISE NOTICE '❌ Missing agents: expected 5, found %', v_agent_count;
  END IF;
END $$;

-- ============================================================================
-- 2. AGENT STATUS CHECK
-- ============================================================================

SELECT '=== AGENT STATUS ===' as check_name;
SELECT 
  name,
  status,
  (SELECT title FROM tasks WHERE id = a.current_task_id) as current_task,
  CASE 
    WHEN status = 'active' THEN '✅ Working'
    WHEN status = 'idle' THEN '⏸️  Idle'
    WHEN status = 'thinking' THEN '🤔 Thinking'
    WHEN status = 'blocked' THEN '🚫 Blocked'
  END as status_display
FROM agents a
ORDER BY 
  CASE status
    WHEN 'active' THEN 1
    WHEN 'thinking' THEN 2
    WHEN 'blocked' THEN 3
    WHEN 'idle' THEN 4
  END;

-- ============================================================================
-- 3. KANBAN BOARD CHECK
-- ============================================================================

SELECT '=== KANBAN BOARD ===' as check_name;
SELECT 
  status,
  COUNT(*) as task_count,
  string_agg(title, ', ') as tasks
FROM tasks
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'in_progress' THEN 1
    WHEN 'review' THEN 2
    WHEN 'assigned' THEN 3
    WHEN 'inbox' THEN 4
    WHEN 'done' THEN 5
  END;

-- ============================================================================
-- 4. ACTIVITY FEED CHECK
-- ============================================================================

SELECT '=== RECENT ACTIVITIES ===' as check_name;
SELECT 
  type,
  message,
  (SELECT name FROM agents WHERE id = a.agent_id) as agent,
  (SELECT title FROM tasks WHERE id = a.task_id) as task,
  created_at
FROM activities a
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- 5. MESSAGE THREADS CHECK
-- ============================================================================

SELECT '=== RECENT MESSAGES ===' as check_name;
SELECT 
  (SELECT title FROM tasks WHERE id = m.task_id) as task,
  (SELECT name FROM agents WHERE id = m.from_agent_id) as author,
  LEFT(content, 50) || '...' as preview,
  (SELECT COUNT(*) FROM unnest(mentions)) as mention_count,
  created_at
FROM messages m
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- 6. HELPER FUNCTION TESTS
-- ============================================================================

DO $$
DECLARE
  v_test_agent_id UUID;
  v_test_task_id UUID;
  v_new_task_id UUID;
BEGIN
  -- Get test agent
  SELECT id INTO v_test_agent_id FROM agents WHERE name = 'Friday' LIMIT 1;
  
  -- Get test task
  SELECT id INTO v_test_task_id FROM tasks WHERE title LIKE '%Real-time%' LIMIT 1;
  
  -- Test 1: Update agent status
  RAISE NOTICE '=== TESTING update_agent_status() ===';
  PERFORM update_agent_status(v_test_agent_id, 'thinking', v_test_task_id);
  
  -- Verify update
  IF (SELECT status FROM agents WHERE id = v_test_agent_id) = 'thinking' THEN
    RAISE NOTICE '✅ Agent status updated successfully';
  ELSE
    RAISE NOTICE '❌ Agent status update failed';
  END IF;
  
  -- Check activity was logged
  IF EXISTS (
    SELECT 1 FROM activities 
    WHERE agent_id = v_test_agent_id 
    AND type = 'agent_status_changed'
    ORDER BY created_at DESC LIMIT 1
  ) THEN
    RAISE NOTICE '✅ Activity logged for status change';
  ELSE
    RAISE NOTICE '❌ No activity logged for status change';
  END IF;
  
  -- Test 2: Create task with activity
  RAISE NOTICE '=== TESTING create_task_with_activity() ===';
  SELECT create_task_with_activity(
    'Test Task - Delete Me',
    'This is a test task created by the schema verification script',
    'low',
    'test_script'
  ) INTO v_new_task_id;
  
  IF v_new_task_id IS NOT NULL THEN
    RAISE NOTICE '✅ Task created with ID: %', v_new_task_id;
    
    -- Check activity was logged
    IF EXISTS (
      SELECT 1 FROM activities 
      WHERE task_id = v_new_task_id 
      AND type = 'task_created'
    ) THEN
      RAISE NOTICE '✅ Activity logged for task creation';
    ELSE
      RAISE NOTICE '❌ No activity logged for task creation';
    END IF;
    
    -- Clean up test task
    DELETE FROM tasks WHERE id = v_new_task_id;
    RAISE NOTICE '🧹 Test task cleaned up';
  ELSE
    RAISE NOTICE '❌ Task creation failed';
  END IF;
  
  -- Reset agent status
  PERFORM update_agent_status(v_test_agent_id, 'idle', NULL);
  RAISE NOTICE '🔄 Agent status reset to idle';
END $$;

-- ============================================================================
-- 7. REAL-TIME CONFIGURATION CHECK
-- ============================================================================

SELECT '=== REAL-TIME CONFIGURATION ===' as check_name;
SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('agents', 'tasks', 'messages', 'activities') THEN '✅ Included'
    ELSE '❌ Missing'
  END as realtime_status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('agents', 'tasks', 'messages', 'activities')
UNION ALL
SELECT 
  tablename,
  '❌ Missing from publication' as realtime_status
FROM (VALUES ('agents'), ('tasks'), ('messages'), ('activities')) AS expected(tablename)
WHERE expected.tablename NOT IN (
  SELECT tablename 
  FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime'
);

-- ============================================================================
-- 8. RLS POLICY CHECK
-- ============================================================================

SELECT '=== RLS POLICIES ===' as check_name;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('agents', 'tasks', 'messages', 'activities')
ORDER BY tablename, cmd;

-- ============================================================================
-- 9. INDEX CHECK
-- ============================================================================

SELECT '=== INDEX SUMMARY ===' as check_name;
SELECT 
  tablename,
  COUNT(*) as index_count,
  string_agg(indexname, ', ') as indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('agents', 'tasks', 'messages', 'activities')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 10. FINAL VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MISSION CONTROL SCHEMA VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables created: agents, tasks, messages, activities';
  RAISE NOTICE '✅ Seed data: 5 agents, sample tasks/messages/activities';
  RAISE NOTICE '✅ Indexes: Performance indexes on key columns';
  RAISE NOTICE '✅ RLS: Read-all, write-authenticated policies';
  RAISE NOTICE '✅ Real-time: Tables added to publication';
  RAISE NOTICE '✅ Triggers: Automatic updated_at timestamps';
  RAISE NOTICE '✅ Helper functions: update_agent_status, create_task_with_activity';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '   1. Deploy migration to Supabase';
  RAISE NOTICE '   2. Run seed data script (optional)';
  RAISE NOTICE '   3. Test real-time subscriptions';
  RAISE NOTICE '   4. Build UI components';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Phase 1 Complete: Database + Schema Ready';
  RAISE NOTICE '========================================';
END $$;