# Mission Control - Database Migrations

## Migration Files

### `20260201170000_create_mission_control_tables.sql`
**Primary migration file** - Run this first.

Contains:
1. Table creation (agents, tasks, messages, activities)
2. Indexes for performance
3. RLS policies for security
4. Real-time publication configuration
5. Helper functions
6. Basic seed data (5 agents)

**To deploy:**
1. Copy the SQL content
2. Open Supabase Dashboard → SQL Editor
3. Paste and run
4. Verify tables appear in Table Editor

## Additional Files

### `../seed_mission_control.sql`
**Optional seed data** - Run after migration for demonstration.

Contains:
- 5 sample tasks across all statuses
- 9 sample messages with @mentions
- 15 sample activities showing timeline
- Agent current task assignments

### `../test_schema.sql`
**Verification script** - Test that everything works.

Run to verify:
- Tables exist and have data
- RLS policies are correct
- Real-time is configured
- Helper functions work
- Indexes are created

### `../MISSION_CONTROL_SCHEMA.md`
**Documentation** - Complete schema reference.

Includes:
- Table relationships diagram
- Column details and constraints
- Common queries
- Integration notes
- Troubleshooting guide

## Deployment Order

1. **Run migration:** `20260201170000_create_mission_control_tables.sql`
2. **Verify:** Check tables in Supabase Table Editor
3. **Optional:** Run `seed_mission_control.sql` for demo data
4. **Test:** Run `test_schema.sql` to verify everything works
5. **Document:** Review `MISSION_CONTROL_SCHEMA.md` for reference

## Real-time Configuration

The migration automatically adds tables to the `supabase_realtime` publication. Verify:

```sql
-- Check real-time configuration
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

Should show: `agents`, `tasks`, `messages`, `activities`

## RLS Policies

All tables have:
- `SELECT` allowed for everyone (public read)
- `INSERT/UPDATE/DELETE` require authentication

To test RLS:
```sql
-- Should work (public read)
SELECT * FROM agents LIMIT 1;

-- May fail without auth (authenticated write)
INSERT INTO agents (name, role, model) VALUES ('Test', 'Test', 'test');
```

## Helper Functions

Two helper functions are created:

### `update_agent_status(agent_id, status, task_id)`
Updates agent status and logs activity.

### `create_task_with_activity(title, description, priority, created_by)`
Creates task and logs creation activity.

## Troubleshooting

### Tables not appearing
- Check SQL ran without errors
- Refresh Supabase Table Editor
- Verify in SQL Editor: `SELECT * FROM agents;`

### Real-time not working
- Check publication: `SELECT * FROM pg_publication_tables`
- Ensure RLS allows reads
- Test with Supabase client subscription

### RLS blocking writes
- Use service role key for Sage
- Ensure proper authentication
- Check policies: `SELECT * FROM pg_policies`

## Next Steps

After database deployment:
1. Build UI components (Phase 2)
2. Set up Supabase client (Phase 3)
3. Implement real-time subscriptions (Phase 3)
4. Create task management UI (Phase 4)
5. Integrate with agent spawning (Phase 5)

---

**Migration Version:** 1.0  
**Created:** 2026-02-01  
**For:** Mission Control Phase 1