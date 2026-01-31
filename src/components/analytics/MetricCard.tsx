import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  isLoading?: boolean
}

const variantColors = {
  default: 'text-text-primary',
  success: 'text-accent-green',
  warning: 'text-accent-amber',
  danger: 'text-accent-red',
  info: 'text-accent-blue',
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  variant = 'default',
  isLoading = false 
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-bg-tertiary rounded w-1/2"></div>
          {Icon && <div className="h-4 w-4 bg-bg-tertiary rounded"></div>}
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-bg-tertiary rounded mb-2"></div>
          {description && <div className="h-3 bg-bg-tertiary rounded w-3/4"></div>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-text-muted" />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", variantColors[variant])}>
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-1">
            {description && (
              <p className="text-xs text-text-muted">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center text-xs">
                <span className={cn(
                  "font-medium",
                  trend.positive === false ? 'text-accent-red' : 'text-accent-green'
                )}>
                  {trend.value >= 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-text-muted ml-1">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}