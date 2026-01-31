export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0s'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export function formatCost(dollars: number): string {
  if (dollars === null || dollars === undefined || dollars === 0) return '$0.00'
  
  // Show more precision for small amounts (< $0.01)
  if (dollars < 0.01) {
    // Show up to 4 decimal places, remove trailing zeros
    const formatted = Number(dollars).toFixed(4).replace(/\.?0+$/, '')
    return `$${formatted}`
  }
  
  return `$${Number(dollars).toFixed(2)}`
}

export function formatTokens(num: number): string {
  if (!num) return '0'

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  } else {
    return num.toString()
  }
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}