'use client'

import { useState, useEffect } from 'react'
import { MissionControlAgent, MissionControlTask, MissionControlMessage } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  X, 
  MessageSquare, 
  User, 
  Clock, 
  Edit2,
  CheckCircle,
  AlertCircle,
  Send,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase'

interface TaskDetailModalProps {
  taskId: string
  isOpen: boolean
  onClose: () => void
  onTaskUpdate: (taskId: string, updates: any) => Promise<void>
  onCommentAdd: (taskId: string, content: string) => Promise<void>
  agents: MissionControlAgent[]
}

export default function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
  onTaskUpdate,
  onCommentAdd,
  agents
}: TaskDetailModalProps) {
  const [task, setTask] = useState<MissionControlTask | null>(null)
  const [messages, setMessages] = useState<MissionControlMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (!isOpen || !taskId) return

    const fetchTaskDetails = async () => {
      setIsLoading(true)
      try {
        // Fetch task
        const { data: taskData, error: taskError } = await supabase
          .from('mission_control_tasks')
          .select('*')
          .eq('id', taskId)
          .single()

        if (taskError) throw taskError

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('mission_control_messages')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        setTask(taskData)
        setEditTitle(taskData.title)
        setEditDescription(taskData.description || '')
        setMessages(messagesData || [])
      } catch (error) {
        console.error('Error fetching task details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskDetails()

    // Subscribe to task updates
    const taskSubscription = supabase
      .channel(`task-${taskId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_control_tasks',
        filter: `id=eq.${taskId}`
      }, (payload) => {
        setTask(payload.new as MissionControlTask)
      })
      .subscribe()

    // Subscribe to message updates
    const messagesSubscription = supabase
      .channel(`task-messages-${taskId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_control_messages',
        filter: `task_id=eq.${taskId}`
      }, () => {
        fetchTaskDetails()
      })
      .subscribe()

    return () => {
      taskSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
    }
  }, [isOpen, taskId])

  const handleSaveEdit = async () => {
    if (!task) return

    try {
      await onTaskUpdate(task.id, {
        title: editTitle,
        description: editDescription || undefined
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return

    setIsSubmittingComment(true)
    try {
      await onCommentAdd(task.id, newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleStatusChange = async (newStatus: MissionControlTask['status']) => {
    if (!task) return

    try {
      await onTaskUpdate(task.id, { status: newStatus })
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const getAgentById = (agentId: string) => {
    return agents.find(agent => agent.id === agentId)
  }

  const parseMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      // Add mention
      const agentName = match[1]
      const agent = agents.find(a => a.name.toLowerCase() === agentName.toLowerCase())
      
      if (agent) {
        parts.push(
          <span key={match.index} className="text-accent-blue font-medium">
            @{agent.name}
          </span>
        )
      } else {
        parts.push(`@${agentName}`)
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.length > 0 ? parts : [content]
  }

  if (!isOpen) return null

  if (isLoading || !task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-bg-primary rounded-lg w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading task details...</p>
          </div>
        </div>
      </div>
    )
  }

  const assignedAgents = agents.filter(agent => task.assignee_ids.includes(agent.id))
  const timeAgo = formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })
  const createdAgo = formatDistanceToNow(new Date(task.created_at), { addSuffix: true })

  const statusOptions = [
    { value: 'inbox', label: 'Inbox', color: 'bg-gray-500' },
    { value: 'assigned', label: 'Assigned', color: 'bg-blue-500' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
    { value: 'review', label: 'Review', color: 'bg-purple-500' },
    { value: 'done', label: 'Done', color: 'bg-green-500' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-primary rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold"
                    autoFocus
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add description..."
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveEdit}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditTitle(task.title)
                        setEditDescription(task.description || '')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-text-primary">{task.title}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {task.description && (
                    <p className="text-text-secondary mt-2">{task.description}</p>
                  )}
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Task Details */}
          <div className="w-2/3 border-r border-border-subtle overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={task.status === option.value ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusChange(option.value as any)}
                        className={cn(
                          "transition-all",
                          task.status === option.value && option.value === 'done' && "bg-accent-green hover:bg-accent-green/90",
                          task.status === option.value && option.value === 'in_progress' && "bg-accent-amber hover:bg-accent-amber/90"
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Priority</h3>
                  <Badge
                    variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}
                    className="text-sm"
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Assigned Agents */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Assigned Agents</h3>
                {assignedAgents.length === 0 ? (
                  <p className="text-sm text-text-muted">No agents assigned</p>
                ) : (
                  <div className="space-y-2">
                    {assignedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center p-3 rounded-lg border border-border-subtle"
                      >
                        <div className="text-2xl mr-3">{agent.avatar}</div>
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{agent.name}</div>
                          <div className="text-xs text-text-secondary">{agent.role}</div>
                        </div>
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
                    ))}
                  </div>
                )}
              </div>

              {/* Task Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Created</h3>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Clock className="h-4 w-4 mr-2" />
                    {createdAgo}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Last Updated</h3>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Clock className="h-4 w-4 mr-2" />
                    {timeAgo}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Comments */}
          <div className="w-1/3 flex flex-col">
            <div className="p-6 border-b border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary">Comments</h3>
              <p className="text-sm text-text-secondary mt-1">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary">No comments yet</p>
                  <p className="text-sm text-text-muted mt-1">
                    Be the first to comment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const agent = message.from_agent_id ? getAgentById(message.from_agent_id) : null
                    const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
                    
                    return (
                      <Card key={message.id} className="p-3">
                        <div className="flex items-start gap-3">
                          {agent ? (
                            <div className="text-xl">{agent.avatar}</div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-bg-tertiary flex items-center justify-center">
                              <User className="h-4 w-4 text-text-muted" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-text-primary">
                                {agent ? agent.name : 'Tim'}
                              </div>
                              <div className="text-xs text-text-muted">
                                {timeAgo}
                              </div>
                            </div>
                            <div className="text-sm text-text-primary">
                              {parseMentions(message.content)}
                            </div>
                            {message.mentions.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-text-muted">Mentioned: </span>
                                {message.mentions.map((mentionId, index) => {
                                  const mentionedAgent = getAgentById(mentionId)
                                  return mentionedAgent ? (
                                    <span key={mentionId} className="text-xs text-accent-blue mx-1">
                                      @{mentionedAgent.name}
                                      {index < message.mentions.length - 1 ? ', ' : ''}
                                    </span>
                                  ) : null
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-6 border-t border-border-subtle">
              <div className="space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your comment... Use @ to mention agents"
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-text-muted">
                    Type @ followed by agent name to mention
                  </div>
                  <Button
                    variant="default"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    loading={isSubmittingComment}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}