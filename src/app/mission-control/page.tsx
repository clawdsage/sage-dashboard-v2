'use client'

import { useState } from 'react'
import AgentColumn from '@/components/mission-control/AgentColumn'
import KanbanBoard from '@/components/mission-control/KanbanBoard'
import MobileTaskBoard from '@/components/mission-control/MobileTaskBoard'
import ActivityFeed from '@/components/mission-control/ActivityFeed'
import CreateTaskModal from '@/components/mission-control/CreateTaskModal'
import TaskDetailModal from '@/components/mission-control/TaskDetailModal'
import AgentInspector from '@/components/mission-control/AgentInspector'
import { useMissionControl } from '@/hooks/useMissionControl'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function MissionControlPage() {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [inspectorAgentId, setInspectorAgentId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'agents' | 'board' | 'feed'>('agents')
  
  const {
    agents,
    tasks,
    activities,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    createComment,
    updateAgentStatus
  } = useMissionControl()

  const handleTaskCreated = async (taskData: any) => {
    await createTask(taskData)
    setIsCreateTaskModalOpen(false)
  }

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  const handleTaskUpdated = async (taskId: string, updates: any) => {
    await updateTask(taskId, updates)
  }

  const handleTaskMoved = async (taskId: string, newStatus: string, newAssigneeIds?: string[]) => {
    await updateTask(taskId, { 
      status: newStatus as 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done',
      ...(newAssigneeIds && { assigneeIds: newAssigneeIds })
    })
  }

  const handleCommentAdded = async (taskId: string, content: string) => {
    await createComment(taskId, content)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading Mission Control...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Mission Control</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button variant="default" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Mission Control</h1>
            <p className="text-xs text-text-secondary">AI agent squad coordination</p>
          </div>
          <Button
            variant="default"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Mobile segmented nav */}
      <div className="md:hidden px-3 py-2 border-b border-border-subtle bg-bg-secondary">
        <div className="grid grid-cols-3 gap-1 bg-bg-tertiary p-1 rounded-lg">
          <button
            onClick={() => setMobileView('agents')}
            className={`text-xs py-2 rounded-md ${mobileView === 'agents' ? 'bg-bg-elevated border border-border-subtle' : 'text-text-secondary'}`}
          >
            Agents
          </button>
          <button
            onClick={() => setMobileView('board')}
            className={`text-xs py-2 rounded-md ${mobileView === 'board' ? 'bg-bg-elevated border border-border-subtle' : 'text-text-secondary'}`}
          >
            Board
          </button>
          <button
            onClick={() => setMobileView('feed')}
            className={`text-xs py-2 rounded-md ${mobileView === 'feed' ? 'bg-bg-elevated border border-border-subtle' : 'text-text-secondary'}`}
          >
            Feed
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Agent Cards */}
        <div className={`w-64 border-r border-border-subtle overflow-y-auto ${mobileView === 'agents' ? 'block' : 'hidden'} md:block`}>
          <AgentColumn 
            agents={agents}
            onAgentStatusChange={updateAgentStatus}
            onOpenInspector={(agent) => setInspectorAgentId(agent.id)}
          />
        </div>

        {/* Center Column: Kanban Board */}
        <div className={`flex-1 overflow-hidden relative ${mobileView === 'board' ? 'block' : 'hidden'} md:block`}>
          <div className="h-full overflow-y-auto">
            {/* Desktop kanban */}
            <div className="hidden md:block h-full">
              <KanbanBoard
                tasks={tasks}
                agents={agents}
                onTaskClick={handleTaskClick}
                onTaskMoved={handleTaskMoved}
                onTaskUpdated={handleTaskUpdated}
              />
            </div>

            {/* Mobile board (single column, swipe/picker style) */}
            <div className="md:hidden h-full">
              <MobileTaskBoard
                tasks={tasks}
                agents={agents}
                onTaskClick={handleTaskClick}
                onTaskUpdated={handleTaskUpdated}
              />
            </div>
          </div>

          {/* Desktop-only inspector overlays the board */}
          {inspectorAgentId && agents.find(a => a.id === inspectorAgentId) && (
            <div className="hidden md:block">
              <AgentInspector
                mode="desktop"
                agent={agents.find(a => a.id === inspectorAgentId)!}
                onClose={() => setInspectorAgentId(null)}
              />
            </div>
          )}
        </div>

        {/* Right Column: Activity Feed */}
        <div className={`w-72 border-l border-border-subtle overflow-y-auto ${mobileView === 'feed' ? 'block' : 'hidden'} md:block`}>
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Mobile-only inspector (full-screen overlay) */}
      {inspectorAgentId && agents.find(a => a.id === inspectorAgentId) && (
        <div className="md:hidden">
          <AgentInspector
            mode="mobile"
            agent={agents.find(a => a.id === inspectorAgentId)!}
            onClose={() => setInspectorAgentId(null)}
          />
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleTaskCreated}
        agents={agents}
      />

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdate={handleTaskUpdated}
          onCommentAdd={handleCommentAdded}
          agents={agents}
        />
      )}
    </div>
  )
}// Force redeploy
