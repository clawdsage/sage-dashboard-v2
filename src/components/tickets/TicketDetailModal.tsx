'use client'

import { useState } from 'react'
import { X, Eye, GitBranch, CheckCircle, Info, MessageSquare, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Ticket } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface TicketDetailModalProps {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, comment: string) => void
  onDefer: (id: string) => void
}

const typeIcons = {
  review: Eye,
  decision: GitBranch,
  approval: CheckCircle,
  info: Info,
}

const priorityColors = {
  low: 'secondary',
  medium: 'outline',
  high: 'warning',
  urgent: 'danger',
} as const

export function TicketDetailModal({ ticket, isOpen, onClose, onApprove, onReject, onDefer }: TicketDetailModalProps) {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !ticket) return null

  const TypeIcon = typeIcons[ticket.type]

  const handleApprove = async () => {
    setIsSubmitting(true)
    await onApprove(ticket.id, comment || undefined)
    setIsSubmitting(false)
    onClose()
  }

  const handleReject = async () => {
    if (!comment.trim()) return
    setIsSubmitting(true)
    await onReject(ticket.id, comment)
    setIsSubmitting(false)
    onClose()
  }

  const handleDefer = async () => {
    setIsSubmitting(true)
    await onDefer(ticket.id)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-bg-secondary border-b border-border-subtle p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TypeIcon className="w-6 h-6 text-accent-amber" />
            <div>
              <h2 className="text-xl font-semibold">{ticket.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={priorityColors[ticket.priority] as any}>
                  {ticket.priority}
                </Badge>
                <span className="text-sm text-text-muted capitalize">
                  {ticket.type}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-text-secondary whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {(ticket.project_id || ticket.task_id) && (
            <div>
              <h3 className="font-medium mb-2">Linked Items</h3>
              <div className="space-y-2">
                {ticket.project_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                    <span>Project: {ticket.project_id}</span>
                  </div>
                )}
                {ticket.task_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <span>Task: {ticket.task_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-muted" />
                <span>Created {formatRelativeTime(ticket.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-text-muted" />
                <span>By {ticket.created_by}</span>
              </div>
            </div>
          </div>

          {ticket.history && ticket.history.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">History</h3>
              <div className="space-y-2">
                {ticket.history.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-bg-tertiary rounded-md">
                    <div className="w-2 h-2 bg-accent-amber rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">{entry.action}</span>
                        <span className="text-xs text-text-muted">
                          {formatRelativeTime(entry.created_at)} by {entry.created_by}
                        </span>
                      </div>
                      {entry.comment && (
                        <p className="text-sm text-text-secondary">{entry.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Resolution Note</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment for this action..."
              className="w-full h-24 bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-amber focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border-subtle">
            <Button
              size="lg"
              variant="success"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1"
            >
              Approve
            </Button>
            <Button
              size="lg"
              variant="danger"
              onClick={handleReject}
              disabled={isSubmitting || !comment.trim()}
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleDefer}
              disabled={isSubmitting}
              className="flex-1"
            >
              Defer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}