'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { ArrowLeft, Calendar, User, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Project, Task } from '@/types/projects'

import { useProject } from '@/hooks/useProjects'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { project, isLoading, error } = useProject(projectId)

  const tasks = project?.tasks || []

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Placeholder functions - replace with real mutations
  const handleToggleComplete = (taskId: string) => {
    // TODO: Implement toggle complete mutation
    console.log('Toggle complete:', taskId)
  }

  const handleUpdateTitle = (taskId: string, title: string) => {
    // TODO: Implement update title mutation
    console.log('Update title:', taskId, title)
  }

  const handleOpenModal = (taskId: string) => {
    setSelectedTaskId(taskId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTaskId(null)
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    // TODO: Implement update task mutation
    console.log('Update task:', taskId, updates)
  }

  const handleDeleteTask = (taskId: string) => {
    // TODO: Implement delete task mutation
    console.log('Delete task:', taskId)
  }

  const handleReorderTasks = (taskIds: string[]) => {
    // TODO: Implement reordering logic
    console.log('Reorder tasks:', taskIds)
  }

  const handleCreateTask = (title: string, parentId?: string) => {
    // TODO: Implement create task mutation
    console.log('Create task:', title, parentId)
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-bg-tertiary rounded mb-6"></div>
          <div className="h-32 bg-bg-tertiary rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Project Not Found</h1>
        <Card className="p-6">
          <p className="text-text-red">Error loading project: {error?.message || 'Project not found'}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border-default bg-bg-secondary">
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text-primary mb-2">{project.name}</h1>
              <p className="text-text-muted mb-4">{project.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">Progress</span>
                  <span className="text-sm text-text-muted">{project.progress}%</span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2">
                  <motion.div
                    className="bg-accent-blue h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due {project.due_date ? formatDate(project.due_date) : 'No due date'}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {project.owner}
                </div>
                <Badge variant="outline">{project.status}</Badge>
                <Badge variant={
                  project.priority === 'urgent' ? 'danger' :
                  project.priority === 'high' ? 'warning' :
                  'secondary'
                }>
                  {project.priority}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task List */}
          <div className="lg:col-span-2">
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onUpdateTitle={handleUpdateTitle}
              onOpenModal={handleOpenModal}
              onReorderTasks={handleReorderTasks}
              onCreateTask={handleCreateTask}
            />
          </div>

          {/* Right Column - Project Details & Activity */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Project Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Tags</label>
                  <div className="flex gap-2 mt-1">
                    {project.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Created</label>
                  <p className="text-sm text-text-primary">{formatDate(project.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Last Updated</label>
                  <p className="text-sm text-text-primary">{formatDate(project.updated_at)}</p>
                </div>
              </div>
            </Card>

            {/* Activity Feed Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">Task "Implement authentication" was completed</p>
                    <p className="text-xs text-text-muted">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">Sage joined the project</p>
                    <p className="text-xs text-text-muted">1 day ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onCreateSubtask={handleCreateTask}
      />
    </div>
  )
}