# Mission Control - Setup Instructions

## 1. Database Migration

The Mission Control feature requires new database tables. Run the following SQL in your Supabase SQL Editor:

### Steps:
1. Go to: https://supabase.com/dashboard/project/kunkqedkkpwaspsucytj/sql
2. Copy the SQL from: `supabase/migrations/20250201170000_mission_control_tables.sql`
3. Paste and run in the SQL Editor

### Alternative: Run via Node.js script
```bash
cd /Users/moltbot/clawd/sage-dashboard-v2
node scripts/run-migration.js
```

## 2. Verify Tables Were Created

After running the migration, verify the following tables exist:
- `mission_control_agents` - AI agent squad members
- `mission_control_tasks` - Kanban board tasks
- `mission_control_messages` - Task comments
- `mission_control_activities` - Activity feed events

## 3. Seed Data

The migration includes seed data for 5 agents:
1. **Sage** - Squad Lead / Orchestrator
2. **Friday** - Coding Agent
3. **Loki** - Copy Agent
4. **Vision** - Researcher Agent
5. **Fury** - Web/Social Search Agent

## 4. Real-time Configuration

The migration enables real-time subscriptions for all Mission Control tables. Verify in Supabase:
- Go to Database → Replication
- Check that all mission_control_* tables are enabled for real-time

## 5. Access Mission Control

Once the migration is complete:
1. Start the development server: `npm run dev`
2. Navigate to: http://localhost:3000/mission-control
3. Or access via the sidebar: Click "Mission Control" (satellite icon)

## Features Implemented

### ✅ Task Creation
- Create tasks with title, description, priority
- Assign multiple agents
- Real-time updates

### ✅ Drag-and-Drop Kanban
- React Beautiful DND integration
- 5 columns: Inbox, Assigned, In Progress, Review, Done
- Visual status indicators

### ✅ Task Detail Modal
- View task details
- Edit title/description
- Change status
- View assigned agents

### ✅ Comment System
- Post comments on tasks
- @mention parsing for agents
- Real-time comment updates
- Mention highlighting

### ✅ Agent Management
- View agent squad status
- Activate/deactivate agents
- Real-time status updates
- Visual indicators

### ✅ Activity Feed
- Real-time activity stream
- Task creation/updates
- Agent status changes
- Comment notifications

### ✅ Real-time Updates
- Supabase real-time subscriptions
- Instant UI updates
- No page refresh needed

## Troubleshooting

### Tables not created?
- Run the migration SQL manually in Supabase SQL Editor
- Check for SQL errors in the console

### Real-time not working?
- Verify tables are enabled for real-time in Supabase Replication settings
- Check browser console for WebSocket connection errors

### UI not loading?
- Check browser console for errors
- Verify Supabase environment variables are set
- Ensure all dependencies are installed: `npm install`

## Next Steps

After Mission Control is working:
1. Integrate with actual agent spawning
2. Add cost tracking per task
3. Implement notifications for @mentions
4. Add task due dates and reminders
5. Create agent performance metrics