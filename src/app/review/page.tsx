'use client'

import { useState, useMemo } from 'react'
import { TicketPanel } from '@/components/tickets/TicketPanel'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal'
import { Button } from '@/components/ui/Button'
import { Ticket } from '@/types'
import { ArrowUpDown, Calendar } from 'lucide-react'

// Mock data for now - replace with actual hook later
const mockTickets: Ticket[] = [
  {
    id: '1',
    type: 'review',
    title: 'Sage Dashboard V2 UI Improvements',
    description: 'Please review the new dashboard layout for Projects V2. The changes include improved navigation, better task management, and enhanced analytics views.',
    priority: 'high',
    status: 'pending',
    project_id: 'proj-1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date().toISOString(),
    created_by: 'sage',
  },
  {
    id: '2',
    type: 'decision',
    title: 'API Rate Limiting Strategy',
    description: 'Need to decide on the rate limiting approach for the new API endpoints. Options include fixed window, sliding window, or token bucket algorithms.',
    priority: 'medium',
    status: 'pending',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updated_at: new Date().toISOString(),
    created_by: 'sage',
  },
  {
    id: '3',
    type: 'approval',
    title: 'Database Schema Changes',
    description: 'Approve the proposed changes to the user permissions table and related indexes for improved performance.',
    priority: 'urgent',
    status: 'pending',
    task_id: 'task-1',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    updated_at: new Date().toISOString(),
    created_by: 'sage',
  },
]

export default function ReviewPage() {
  const [tickets] = useState<Ticket[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('priority')

  const filteredTickets = useMemo(() => {
    let filtered = tickets
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter)
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [tickets, statusFilter, sortBy])

  const handleApprove = (id: string, comment?: string) => {
    // TODO: Implement approve logic
    console.log('Approve ticket', id, comment)
  }

  const handleReject = (id: string, comment: string) => {
    // TODO: Implement reject logic
    console.log('Reject ticket', id, comment)
  }

  const handleComment = (id: string) => {
    const ticket = tickets.find(t => t.id === id)
    if (ticket) {
      setSelectedTicket(ticket)
      setIsModalOpen(true)
    }
  }

  const handleDefer = (id: string) => {
    // TODO: Implement defer logic
    console.log('Defer ticket', id)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ticket Review</h1>
          <p className="text-text-secondary mt-1">
            Review and manage tickets from Sage → Tim workflow
          </p>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'ghost'}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort:</span>
          <Button
            size="sm"
            variant={sortBy === 'priority' ? 'default' : 'ghost'}
            onClick={() => setSortBy('priority')}
            className="flex items-center gap-1"
          >
            <ArrowUpDown className="w-4 h-4" />
            Priority
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'date' ? 'default' : 'ghost'}
            onClick={() => setSortBy('date')}
            className="flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" />
            Date
          </Button>
        </div>
      </div>

      <TicketPanel
        tickets={filteredTickets}
        onApprove={handleApprove}
        onReject={handleReject}
        onComment={handleComment}
        onDefer={handleDefer}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTicket(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onDefer={handleDefer}
      />
    </div>
  )
}