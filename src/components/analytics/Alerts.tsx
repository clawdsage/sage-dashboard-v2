import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle, DollarSign, Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'cost' | 'performance' | 'error' | 'usage'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  resolved?: boolean
  data?: Record<string, any>
}

interface AlertsProps {
  alerts: Alert[]
  isLoading?: boolean
  onResolve?: (id: string) => void
  maxItems?: number
}

const alertIcons = {
  cost: DollarSign,
  performance: Clock,
  error: AlertTriangle,
  usage: Zap,
}

const alertColors = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function Alerts({ alerts, isLoading = false, onResolve, maxItems = 10 }: AlertsProps) {
  const displayedAlerts = alerts.slice(0, maxItems)
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved)
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.severity === 'critical')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-border-subtle rounded-md">
                <div className="h-5 w-5 bg-bg-tertiary rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
                  <div className="h-3 bg-bg-tertiary rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-tertiary mb-4">
            <AlertTriangle className="h-6 w-6 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium mb-2">No alerts</h3>
          <p className="text-text-muted">
            Everything looks good! No alerts to display.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alerts</CardTitle>
          <div className="flex items-center gap-2">
            {criticalAlerts.length > 0 && (
              <span className="px-2 py-1 bg-accent-red/20 text-accent-red text-xs rounded-full">
                {criticalAlerts.length} critical
              </span>
            )}
            <span className="text-sm text-text-muted">
              {unresolvedAlerts.length} unresolved
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedAlerts.map((alert) => {
            const Icon = alertIcons[alert.type]
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 border rounded-md transition-colors",
                  alert.resolved 
                    ? "border-border-subtle bg-bg-tertiary/50 opacity-70" 
                    : alertColors[alert.severity]
                )}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate">{alert.title}</h4>
                    <span className="text-xs text-text-muted">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{alert.description}</p>
                  {alert.data && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(alert.data).map(([key, value]) => (
                        <span key={key} className="px-2 py-1 bg-bg-tertiary text-xs rounded">
                          {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!alert.resolved && onResolve && (
                  <button
                    onClick={() => onResolve(alert.id)}
                    className="flex-shrink-0 text-xs px-2 py-1 bg-bg-tertiary hover:bg-bg-tertiary/80 rounded transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}