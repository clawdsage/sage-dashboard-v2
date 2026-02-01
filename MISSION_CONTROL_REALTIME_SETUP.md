# Mission Control Phase 3: Real-Time Plumbing Setup

## Overview
This document describes the real-time setup for Mission Control Phase 3. The system uses Supabase real-time subscriptions to provide live updates for agents, tasks, messages, and activities.

## Database Schema

### Tables Created
1. **agents** - AI agent status and information
2. **tasks** - Extended with Mission Control columns (assignee_ids, created_by, priority, completed_at)
3. **messages** - Task comments and communication
4. **activities** - Activity feed events

### Migration
Run the SQL migration file:
```
supabase/migrations/20250201170000_create_mission_control_tables.sql
```

This will:
- Create the new tables
- Add columns to existing `tasks` table
- Create indexes for performance
- Insert initial agent data (The Squad: Sage, Friday, Loki, Vision, Fury)

## Real-Time Setup

### Enable Real-Time in Supabase
1. Go to Supabase Dashboard > Database > Replication
2. Click "Add tables"
3. Select: `agents`, `tasks`, `messages`, `activities`
4. Click "Save"

Or run this SQL in SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
```

## React Hooks

### Available Hooks
1. **`useRealtimeSubscription`** - Base hook for real-time subscriptions
2. **`useAgents()`** - Subscribe to agent status changes
3. **`useTasks(options?)`** - Subscribe to task updates with filtering
4. **`useActivities(options?)`** - Subscribe to activity feed
5. **`useMessages(taskId)`** - Subscribe to task comments

### Features
- **Connection Management**: Automatic reconnection on error
- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Error Handling**: Comprehensive error states and recovery
- **Filtering**: Subscribe to specific data subsets
- **Type Safety**: Full TypeScript support

## Usage Example

```typescript
import { useAgents, useTasks, useActivities } from '@/hooks'

function MissionControl() {
  const agents = useAgents()
  const tasks = useTasks({ status: 'in_progress' })
  const activities = useActivities({ limit: 10 })

  return (
    <div>
      {/* Render real-time data */}
      {agents.agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
```

## Test Page
A test page is available at `/mission-control-test` to verify real-time connections:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/mission-control-test`
3. Check connection status for each table
4. Test real-time updates by modifying data in Supabase

## Integration Points

### Agent Lifecycle
1. **Activation**: Update agent status to 'active'
2. **Working**: Update status to 'thinking' during API calls
3. **Completion**: Update status to 'idle', task to 'review'
4. **Error**: Update status to 'blocked' on failure

### Task Management
1. **Create Task**: Use `tasks.createTask()`
2. **Assign Agents**: Use `tasks.assignTask()`
3. **Update Status**: Use `tasks.updateTaskStatus()`
4. **Drag & Drop**: Use `tasks.updateTaskOrder()`

### Activity Logging
```typescript
const activities = useActivities()

// Log common events
activities.logTaskCreated(taskId, 'Build login form')
activities.logAgentActivated(agentId, 'Friday')
activities.logCommentPosted(taskId, agentId, 'Friday')
```

## Error Handling

### Connection States
- `connecting` - Establishing connection
- `connected` - Successfully connected
- `disconnected` - Not connected
- `error` - Connection error

### Recovery
- Automatic reconnection after 5 seconds on error
- Manual reconnect via `reconnect()` method
- Error details available in `error` property

## Performance Considerations

### Subscription Limits
- Each hook creates one real-time channel
- Filter subscriptions to minimize data transfer
- Use `limit` option for activity feeds

### Optimistic Updates
- UI updates immediately on user action
- Server confirmation updates local state
- Automatic rollback on error

## Next Steps

1. **Build UI Components**:
   - Agent cards with status indicators
   - Kanban board for tasks
   - Activity feed component
   - Task detail modal with comments

2. **Integration Testing**:
   - Test agent activation flow
   - Verify real-time updates across tabs
   - Test error recovery scenarios

3. **Production Readiness**:
   - Add connection status indicators
   - Implement offline mode
   - Add loading skeletons
   - Optimize subscription management

## Troubleshooting

### Common Issues

1. **No real-time updates**:
   - Verify tables are enabled for real-time in Supabase
   - Check browser console for WebSocket errors
   - Verify environment variables are set

2. **Connection errors**:
   - Check Supabase project status
   - Verify network connectivity
   - Check for CORS issues

3. **Type errors**:
   - Run TypeScript compiler: `npx tsc --noEmit`
   - Check type definitions in `src/lib/supabase.ts`

### Debugging
- Use the test page to verify connections
- Check browser DevTools > Network > WS (WebSocket)
- Monitor Supabase Dashboard > Realtime