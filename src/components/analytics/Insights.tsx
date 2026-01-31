import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Lightbulb, TrendingUp, TrendingDown, Zap, DollarSign, Clock, Users, BarChart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Insight {
  id: string
  type: 'cost' | 'performance' | 'usage' | 'efficiency' | 'trend'
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  confidence: 'low' | 'medium' | 'high'
  data?: Record<string, any>
  recommendations?: string[]
}

interface InsightsProps {
  insights: Insight[]
  isLoading?: boolean
  maxItems?: number
}

const insightIcons = {
  cost: DollarSign,
  performance: Clock,
  usage: Users,
  efficiency: Zap,
  trend: TrendingUp,
}

const impactColors = {
  positive: 'text-accent-green',
  negative: 'text-accent-red',
  neutral: 'text-text-muted',
}

const confidenceColors = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-green-500/20 text-green-400',
}

export function Insights({ insights, isLoading = false, maxItems = 5 }: InsightsProps) {
  const displayedInsights = insights.slice(0, maxItems)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-bg-tertiary rounded"></div>
                  <div className="h-4 bg-bg-tertiary rounded w-1/3"></div>
                </div>
                <div className="h-3 bg-bg-tertiary rounded w-full"></div>
                <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-tertiary mb-4">
            <Lightbulb className="h-6 w-6 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium mb-2">No insights yet</h3>
          <p className="text-text-muted">
            Run more agents to generate insights about your usage patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Insights</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">
              {insights.length} total
            </span>
            <span className="px-2 py-1 bg-accent-green/20 text-accent-green text-xs rounded-full">
              {insights.filter(i => i.impact === 'positive').length} positive
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedInsights.map((insight) => {
            const Icon = insightIcons[insight.type]
            const ImpactIcon = insight.impact === 'positive' ? TrendingUp : 
                              insight.impact === 'negative' ? TrendingDown : BarChart
            
            return (
              <div
                key={insight.id}
                className="p-3 border border-border-subtle rounded-md hover:bg-bg-tertiary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-text-muted" />
                    <h4 className="font-medium">{insight.title}</h4>
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      confidenceColors[insight.confidence]
                    )}>
                      {insight.confidence} confidence
                    </span>
                  </div>
                  <ImpactIcon className={cn(
                    "h-4 w-4",
                    impactColors[insight.impact]
                  )} />
                </div>
                
                <p className="text-sm text-text-secondary mb-3">{insight.description}</p>
                
                {insight.data && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(insight.data).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-bg-tertiary text-xs rounded">
                        {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    ))}
                  </div>
                )}
                
                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-subtle">
                    <h5 className="text-xs font-medium text-text-muted mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-accent-blue mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}