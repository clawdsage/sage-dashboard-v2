'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { X, Trash2, Plus, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/projects'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onCreateSubtask: (parentId: string, title: string) => void
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const assigneeOptions = ['sage', 'tim', 'both'] // Placeholder

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onCreateSubtask,
}: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Update editedTask when task changes
  React.useEffect(() => {
    if (task) {
      setEditedTask(task)
    }
  }, [task])

  if (!task) return null

  const handleSave = () => {
    onUpdate(task.id, editedTask)
    onClose()
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      setIsDeleting(true)
      onDelete(task.id)
      onClose()
    }
  }

  const handleCreateSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onCreateSubtask(task.id, newSubtaskTitle.trim())
      setNewSubtaskTitle('')
    }
  }

  const handleKeyDownSubtask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateSubtask()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-bg-secondary rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-default">
              <h2 className="text-xl font-semibold text-text-primary">Task Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
                <input
                  type="text"
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                  placeholder="Add a description..."
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                  <select
                    value={editedTask.status || task.status}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Priority</label>
                  <select
                    value={editedTask.priority || task.priority}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Assignee</label>
                  <select
                    value={editedTask.assigned_to || task.assigned_to || ''}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, assigned_to: e.target.value || undefined }))}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="">Unassigned</option>
                    {assigneeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Due Date</label>
                  <input
                    type="date"
                    value={editedTask.due_date || task.due_date || ''}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, due_date: e.target.value || undefined }))}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>

              {/* Time Tracking */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editedTask.estimated_hours || task.estimated_hours || ''}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Actual Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editedTask.actual_hours || task.actual_hours || ''}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, actual_hours: parseFloat(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Subtasks</label>
                <div className="space-y-2 mb-3">
                  {/* Placeholder for subtasks list */}
                  <div className="text-sm text-text-muted">Subtasks will be listed here</div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleKeyDownSubtask}
                    placeholder="Add a subtask..."
                    className="flex-1 px-3 py-2 bg-bg-primary border border-border-default rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                  <Button onClick={handleCreateSubtask} disabled={!newSubtaskTitle.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comments Section Placeholder */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Comments</label>
                <div className="p-4 bg-bg-primary border border-border-default rounded-md">
                  <p className="text-text-muted">Comments section (use CommentThread component placeholder)</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border-default">
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}