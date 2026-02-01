'use client'

import { useAgents, useTasks, useActivities } from '@/hooks'

export default function MissionControlTestPage() {
  const agents = useAgents()
  const tasks = useTasks()
  const activities = useActivities({ limit: 10 })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mission Control - Real-Time Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agents Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Agents</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${agents.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{agents.subscriptionStatus}</span>
            </div>
          </div>
          
          {agents.isLoading ? (
            <div className="text-gray-500">Loading agents...</div>
          ) : agents.error ? (
            <div className="text-red-500">Error: {agents.error.message}</div>
          ) : (
            <div className="space-y-4">
              {agents.agents.map(agent => (
                <div key={agent.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{agent.avatar}</div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-600">{agent.role}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      agent.status === 'active' ? 'bg-green-100 text-green-800' :
                      agent.status === 'thinking' ? 'bg-blue-100 text-blue-800' :
                      agent.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.status}
                    </span>
                    <span className="text-sm text-gray-500">{agent.model}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${tasks.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{tasks.subscriptionStatus}</span>
            </div>
          </div>
          
          {tasks.isLoading ? (
            <div className="text-gray-500">Loading tasks...</div>
          ) : tasks.error ? (
            <div className="text-red-500">Error: {tasks.error.message}</div>
          ) : (
            <div className="space-y-4">
              {tasks.tasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-4 border rounded-lg">
                  <div className="font-medium">{task.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {task.assignee_ids?.length || 0} assignees
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activities Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Activity Feed</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${activities.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{activities.subscriptionStatus}</span>
            </div>
          </div>
          
          {activities.isLoading ? (
            <div className="text-gray-500">Loading activities...</div>
          ) : activities.error ? (
            <div className="text-red-500">Error: {activities.error.message}</div>
          ) : (
            <div className="space-y-4">
              {activities.activities.map(activity => (
                <div key={activity.id} className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </div>
                  <div className="mt-1">{activity.message}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Type: {activity.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Connection Status Summary */}
      <div className="mt-12 p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded border">
            <div className="font-medium">Agents</div>
            <div className={`mt-2 ${agents.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {agents.subscriptionStatus}
            </div>
            {agents.error && (
              <div className="mt-2 text-sm text-red-500">{agents.error.message}</div>
            )}
          </div>
          
          <div className="p-4 bg-white rounded border">
            <div className="font-medium">Tasks</div>
            <div className={`mt-2 ${tasks.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {tasks.subscriptionStatus}
            </div>
            {tasks.error && (
              <div className="mt-2 text-sm text-red-500">{tasks.error.message}</div>
            )}
          </div>
          
          <div className="p-4 bg-white rounded border">
            <div className="font-medium">Activities</div>
            <div className={`mt-2 ${activities.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {activities.subscriptionStatus}
            </div>
            {activities.error && (
              <div className="mt-2 text-sm text-red-500">{activities.error.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Run the SQL migration to create Mission Control tables</li>
          <li>Enable real-time on tables in Supabase Dashboard</li>
          <li>Test real-time updates by modifying data in Supabase</li>
          <li>Build the Mission Control UI components</li>
        </ol>
      </div>
    </div>
  )
}