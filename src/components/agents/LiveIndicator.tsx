import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  status: 'active' | 'completed' | 'failed'
  className?: string
}

export function LiveIndicator({ status, className }: LiveIndicatorProps) {
  if (status === 'active') {
    return (
      <div className={cn('relative', className)}>
        <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
        <div className="absolute inset-0 w-2 h-2 bg-accent-green rounded-full animate-ping opacity-75" />
      </div>
    )
  }

  return (
    <div className={cn('w-2 h-2 rounded-full', className)}>
      {status === 'completed' && 'bg-accent-green'}
      {status === 'failed' && 'bg-accent-red'}
    </div>
  )
}