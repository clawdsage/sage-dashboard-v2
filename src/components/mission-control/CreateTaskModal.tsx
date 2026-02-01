'use client'

import { useState } from 'react'
import { MissionControlAgent } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => Promise<void>
  agents: MissionControlAgent[]
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  agents
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        assignee_ids: selectedAgentIds,
        priority
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setSelectedAgentIds([])
      setPriority('medium')
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const priorityOptions = [
    { value: 'low', label: 'Low', icon: CheckCircle, color: 'text-accent-green' },
    { value: 'medium', label: 'Medium', icon: Clock, color: 'text-accent-amber' },
    { value: 'high', label: 'High', icon: AlertCircle, color: 'text-accent-red' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-primary rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Create New Task</h2>
              <p className="text-sm text-text-secondary mt-1">Add a task to the mission control board</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Task Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, context, or requirements..."
              rows={4}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                      priority === option.value
                        ? "border-accent-blue bg-accent-blue/10"
                        : "border-border-subtle hover:border-border hover:bg-bg-tertiary"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mb-2", option.color)} />
                    <span className="text-sm font-medium text-text-primary">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Assign Agents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-text-primary">
                Assign Agents
              </label>
              <span className="text-xs text-text-muted">
                {selectedAgentIds.length} selected
              </span>
            </div>
            
            {agents.length === 0 ? (
              <div className="text-center py-4 border border-border-subtle rounded-lg">
                <Users className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No agents available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center p-3 rounded-lg border border-border-subtle hover:border-border hover:bg-bg-tertiary transition-colors"
                    onClick={() => toggleAgentSelection(agent.id)}
                  >
                    <Checkbox
                      checked={selectedAgentIds.includes(agent.id)}
                      onCheckedChange={() => toggleAgentSelection(agent.id)}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{agent.avatar}</div>
                      <div>
                        <div className="font-medium text-text-primary">{agent.name}</div>
                        <div className="text-xs text-text-secondary">{agent.role}</div>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        agent.status === 'active' ? "bg-accent-amber/10 text-accent-amber" :
                        agent.status === 'thinking' ? "bg-accent-blue/10 text-accent-blue" :
                        agent.status === 'blocked' ? "bg-accent-red/10 text-accent-red" :
                        "bg-gray-500/10 text-gray-500"
                      )}>
                        {agent.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}