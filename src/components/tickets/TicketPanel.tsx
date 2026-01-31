'use client'

import { useState, useMemo } from 'react'
import { Filter } from 'lucide-react'
import { TicketCard } from './TicketCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Ticket } from '@/types'

interface TicketPanelProps {
  tickets: Ticket[]
  isLoading?: boolean
  onApprove: (id: string) => void
  onReject: (id: string, comment: string) => void
  onComment: (id: string) => void
  onDefer: (id: string) => void
}

export function TicketPanel({ tickets, isLoading, onApprove, onReject, onComment, onDefer }: TicketPanelProps) {
  const [filter, setFilter] = useState<'all' | 'review' | 'decision' | 'approval' | 'info'>('all')

  const filteredTickets = useMemo(() => {
    if (filter === 'all') return tickets
    return tickets.filter(ticket => ticket.type === filter)
  }, [tickets, filter])

  const pendingCount = tickets.filter(t => t.status === 'pending').length

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 bg-bg-tertiary rounded animate-pulse w-32"></div>
          <div className="h-6 bg-bg-tertiary rounded animate-pulse w-16"></div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-bg-tertiary rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Pending Review</h2>
          {pendingCount > 0 && (
            <Badge variant="warning" className="animate-pulse">
              {pendingCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <div className="flex gap-1">
            {(['all', 'review', 'decision', 'approval', 'info'] as const).map(type => (
              <Button
                key={type}
                size="sm"
                variant={filter === type ? 'default' : 'ghost'}
                onClick={() => setFilter(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-text-muted mb-2">
            {filter === 'all' ? 'No tickets found' : `No ${filter} tickets`}
          </div>
          <p className="text-sm text-text-muted">
            {filter === 'all'
              ? 'Tickets will appear here when they need review.'
              : `No ${filter} tickets match your filter.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onApprove={onApprove}
              onReject={onReject}
              onComment={onComment}
              onDefer={onDefer}
            />
          ))}
        </div>
      )}
    </div>
  )
}