'use client'

import { MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface TicketBadgeProps {
  count: number
  onClick?: () => void
}

export function TicketBadge({ count, onClick }: TicketBadgeProps) {
  if (count === 0) return null

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-md hover:bg-bg-tertiary transition-colors"
      title={`${count} pending ticket${count === 1 ? '' : 's'}`}
    >
      <MessageSquare className="h-5 w-5" />
      <Badge
        variant="warning"
        className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs animate-pulse ${
          count > 9 ? 'px-1' : ''
        }`}
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </button>
  )
}