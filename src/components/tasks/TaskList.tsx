'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TaskItem } from './TaskItem'
import { Plus, List, Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/projects'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (taskId: string) => void
  onUpdateTitle: (taskId: string, title: string) => void
  onOpenModal: (taskId: string) => void
  onReorderTasks: (taskIds: string[]) => void
  onCreateTask: (title: string, parentId?: string) => void
  isLoading?: boolean
}

export function TaskList({
  tasks,
  onToggleComplete,
  onUpdateTitle,
  onOpenModal,
  onReorderTasks,
  onCreateTask,
  isLoading = false,
}: TaskListProps) {
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('flat')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle.trim())
      setNewTaskTitle('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateTask()
    }
  }

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Get subtasks for a task
  const getSubtasks = (parentId: string) => {
    return tasks.filter(task => task.parent_task_id === parentId)
  }

  const renderTaskItem = (task: Task, level = 0) => {
    const subtasks = getSubtasks(task.id)
    const isExpanded = expandedTasks.has(task.id)

    return (
      <div key={task.id}>
        <TaskItem
          task={task}
          onToggleComplete={onToggleComplete}
          onUpdateTitle={onUpdateTitle}
          onOpenModal={onOpenModal}
          subtasks={subtasks}
          onToggleExpand={() => toggleExpanded(task.id)}
          isExpanded={isExpanded}
          level={level}
        />
        <AnimatePresence>
          {isExpanded && subtasks.map(subtask => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTaskItem(subtask, level + 1)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 animate-pulse">
              <div className="w-4 h-4 bg-bg-secondary rounded"></div>
              <div className="flex-1 h-4 bg-bg-secondary rounded"></div>
              <div className="w-16 h-6 bg-bg-secondary rounded-full"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
        <p className="text-text-muted mb-4">
          Add tasks to get started.
        </p>
        <div className="flex gap-2 justify-center">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 bg-bg-secondary border border-border-default rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
          <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Tasks</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'flat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('flat')}
          >
            <List className="h-4 w-4 mr-2" />
            Flat
          </Button>
          <Button
            variant={viewMode === 'grouped' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grouped')}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grouped
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-1 mb-4">
        {viewMode === 'flat' ? (
          // Flat view
          tasks
            .filter(task => !task.parent_task_id) // Only top-level tasks
            .sort((a, b) => a.order_index - b.order_index)
            .map(task => renderTaskItem(task))
        ) : (
          // Grouped view
          Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <div key={status} className="mb-6">
              <h4 className="text-sm font-medium text-text-secondary mb-3 capitalize">
                {status.replace('_', ' ')} ({statusTasks.length})
              </h4>
              <div className="space-y-1">
                {statusTasks
                  .filter(task => !task.parent_task_id)
                  .sort((a, b) => a.order_index - b.order_index)
                  .map(task => renderTaskItem(task))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Input */}
      <div className="flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 bg-bg-secondary border border-border-default rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
        <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}