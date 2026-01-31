import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, DollarSign, Zap, TrendingUp, Activity, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Alert = Database['public']['Tables']['alerts']['Row']

interface AlertCardProps {
  alert: Alert
  onResolve?: (id: string, resolutionNote?: string) => void
  onDismiss?: (id: string) => void
  showActions?: boolean
}

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'cost':
      return DollarSign
    case 'performance':
      return TrendingUp
    case 'anomaly':
      return AlertTriangle
    case 'usage':
      return Activity
    default:
      return AlertTriangle
  }
}

const getSeverityColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical':
      return 'bg-accent-red/20 text-accent-red border-accent-red/30'
    case 'warning':
      return 'bg-accent-amber/20 text-accent-amber border-accent-amber/30'
    case 'info':
      return 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
    default:
      return 'bg-bg-tertiary text-text-muted border-border-subtle'
  }
}

const getTypeColor = (type: Alert['type']) => {
  switch (type) {
    case 'cost':
      return 'bg-purple-500/20 text-purple-500'
    case 'performance':
      return 'bg-cyan-500/20 text-cyan-500'
    case 'anomaly':
      return 'bg-pink-500/20 text-pink-500'
    case 'usage':
      return 'bg-emerald-500/20 text-emerald-500'
    default:
      return 'bg-bg-tertiary text-text-muted'
  }
}

export function AlertCard({ alert, onResolve, onDismiss, showActions = true }: AlertCardProps) {
  const [isResolving, setIsResolving] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')
  const [showResolutionForm, setShowResolutionForm] = useState(false)
  
  const Icon = getAlertIcon(alert.type)
  const severityColor = getSeverityColor(alert.severity)
  const typeColor = getTypeColor(alert.type)
  
  const handleResolve = () => {
    if (onResolve) {
      onResolve(alert.id, resolutionNote || undefined)
      setIsResolving(true)
      setTimeout(() => {
        setIsResolving(false)
        setShowResolutionForm(false)
        setResolutionNote('')
      }, 1000)
    }
  }
  
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(alert.id)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatValue = (value: number | null, metric: string) => {
    if (value === null) return 'N/A'
    
    switch (metric) {
      case 'daily_cost':
        return `$${value.toFixed(4)}`
      case 'avg_duration_ms':
        return `${(value / 1000).toFixed(1)}s`
      case 'avg_duration_change':
        return `${value.toFixed(1)}%`
      case 'run_count':
        return value.toString()
      default:
        return value.toString()
    }
  }
  
  return (
    <Card className="border-l-4 border-l-accent-amber">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${severityColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{alert.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={severityColor}>
                  {alert.severity}
                </Badge>
                <Badge className={typeColor}>
                  {alert.type}
                </Badge>
                <span className="text-sm text-text-muted flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(alert.triggered_at)}
                </span>
              </div>
            </div>
          </div>
          {alert.status === 'active' && showActions && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolutionForm(!showResolutionForm)}
                disabled={isResolving}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                disabled={isResolving}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-text-primary">{alert.description}</p>
          
          {(alert.metric || alert.threshold !== null || alert.current_value !== null) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-bg-tertiary rounded-lg">
              {alert.metric && (
                <div>
                  <div className="text-sm text-text-muted">Metric</div>
                  <div className="font-medium">{alert.metric.replace(/_/g, ' ')}</div>
                </div>
              )}
              {alert.threshold !== null && (
                <div>
                  <div className="text-sm text-text-muted">Threshold</div>
                  <div className="font-medium">{formatValue(alert.threshold, alert.metric)}</div>
                </div>
              )}
              {alert.current_value !== null && (
                <div>
                  <div className="text-sm text-text-muted">Current Value</div>
                  <div className="font-medium">{formatValue(alert.current_value, alert.metric)}</div>
                </div>
              )}
            </div>
          )}
          
          {showResolutionForm && (
            <div className="space-y-3 p-4 border border-border-subtle rounded-lg">
              <div>
                <label htmlFor="resolutionNote" className="block text-sm font-medium mb-2">
                  Resolution Note (Optional)
                </label>
                <textarea
                  id="resolutionNote"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-md bg-bg-primary text-text-primary"
                  rows={3}
                  placeholder="Add notes about how this alert was resolved..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResolutionForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleResolve}
                  disabled={isResolving}
                >
                  {isResolving ? 'Resolving...' : 'Confirm Resolution'}
                </Button>
              </div>
            </div>
          )}
          
          {alert.resolution_note && alert.status !== 'active' && (
            <div className="p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg">
              <div className="text-sm font-medium text-accent-green mb-1">
                {alert.status === 'resolved' ? 'Resolved' : 'Dismissed'} by {alert.resolved_by}
              </div>
              <div className="text-sm text-text-primary">{alert.resolution_note}</div>
              {alert.resolved_at && (
                <div className="text-xs text-text-muted mt-1">
                  {formatDate(alert.resolved_at)}
                </div>
              )}
            </div>
          )}
          
          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <div className="text-xs text-text-muted">
              <details>
                <summary className="cursor-pointer">View Details</summary>
                <pre className="mt-2 p-2 bg-bg-tertiary rounded overflow-auto">
                  {JSON.stringify(alert.metadata, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}