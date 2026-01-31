import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface LiveIndicatorProps {
  status: 'active' | 'completed' | 'failed' | 'idle'
  className?: string
}

export function LiveIndicator({ status, className }: LiveIndicatorProps) {
  // Active: pulsing green dot
  if (status === 'active') {
    return (
      <div className={cn('relative', className)}>
        <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
        <div className="absolute inset-0 w-2 h-2 bg-accent-green rounded-full animate-ping opacity-75" />
      </div>
    )
  }

  // Completed: muted gray checkmark (not green - save green for active only)
  if (status === 'completed') {
    return (
      <div className={cn('w-4 h-4 rounded-full bg-text-muted/20 flex items-center justify-center', className)}>
        <Check className="w-3 h-3 text-text-muted" />
      </div>
    )
  }

  // Failed/Idle: colored dot
  const statusColors = {
    failed: 'bg-accent-red',
    idle: 'bg-text-muted',
  } as const

  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full',
        statusColors[status as keyof typeof statusColors] || 'bg-text-muted',
        className
      )}
    />
  )
}