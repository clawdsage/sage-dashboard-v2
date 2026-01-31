'use client'

import { useState } from 'react'
import { Eye, GitBranch, CheckCircle, Info, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ticket } from '@/types'
import { formatRelativeTime, truncateText } from '@/lib/utils'

interface TicketCardProps {
  ticket: Ticket
  onApprove: (id: string) => void
  onReject: (id: string, comment: string) => void
  onComment: (id: string) => void
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

export function TicketCard({ ticket, onApprove, onReject, onComment, onDefer }: TicketCardProps) {
  const [expanded, setExpanded] = useState(false)
  const TypeIcon = typeIcons[ticket.type]

  return (
    <Card className="hover:bg-bg-tertiary transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <TypeIcon className="w-5 h-5 text-accent-amber" />
            <div>
              <h3 className="font-semibold text-lg">{ticket.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={priorityColors[ticket.priority] as any}>
                  {ticket.priority}
                </Badge>
                <span className="text-sm text-text-muted">
                  {formatRelativeTime(ticket.created_at)}
                </span>
              </div>
            </div>
          </div>
          {ticket.project_id && (
            <div className="text-sm text-text-muted">
              Project linked
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-text-secondary mb-4">
          {expanded ? ticket.description : truncateText(ticket.description, 120)}
        </p>

        {ticket.description.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-accent-amber hover:text-accent-amber/80 text-sm font-medium mb-4 flex items-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show more
              </>
            )}
          </button>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => onApprove(ticket.id)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onReject(ticket.id, '')}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onComment(ticket.id)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Comment
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDefer(ticket.id)}
          >
            Defer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}