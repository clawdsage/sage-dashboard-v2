'use client'

import { useState } from 'react'
import AgentColumn from '@/components/mission-control/AgentColumn'
import KanbanBoard from '@/components/mission-control/KanbanBoard'
import ActivityFeed from '@/components/mission-control/ActivityFeed'
import CreateTaskModal from '@/components/mission-control/CreateTaskModal'
import TaskDetailModal from '@/components/mission-control/TaskDetailModal'
import { useMissionControl } from '@/hooks/useMissionControl'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function MissionControlPage() {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  
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
      status: newStatus,
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
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Mission Control</h1>
            <p className="text-text-secondary mt-1">Coordinate your AI agent squad in real-time</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Agent Cards */}
        <div className="w-80 border-r border-border-subtle overflow-y-auto">
          <AgentColumn 
            agents={agents}
            onAgentStatusChange={updateAgentStatus}
          />
        </div>

        {/* Center Column: Kanban Board */}
        <div className="flex-1 overflow-y-auto">
          <KanbanBoard
            tasks={tasks}
            agents={agents}
            onTaskClick={handleTaskClick}
            onTaskMoved={handleTaskMoved}
            onTaskUpdated={handleTaskUpdated}
          />
        </div>

        {/* Right Column: Activity Feed */}
        <div className="w-96 border-l border-border-subtle overflow-y-auto">
          <ActivityFeed activities={activities} />
        </div>
      </div>

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
}