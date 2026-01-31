import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface PerformanceChartProps {
  data: {
    date: string
    avgResponseTime: number
    successRate: number
    totalRuns: number
    failedRuns: number
  }[]
  view?: 'responseTime' | 'successRate' | 'both'
  onViewChange?: (view: string) => void
}

export function PerformanceChart({ data, view = 'both', onViewChange }: PerformanceChartProps) {
  const [activeView, setActiveView] = useState(view)

  const handleViewChange = (newView: string) => {
    setActiveView(newView)
    onViewChange?.(newView)
  }

  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    successRatePercent: item.successRate * 100,
    failedRuns: item.failedRuns || 0,
    successRuns: item.totalRuns - (item.failedRuns || 0)
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Metrics</CardTitle>
          <div className="flex space-x-1">
            {['both', 'responseTime', 'successRate'].map((viewType) => (
              <Button
                key={viewType}
                variant={activeView === viewType ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange(viewType)}
                className="capitalize"
              >
                {viewType === 'both' ? 'Both' : viewType === 'responseTime' ? 'Response Time' : 'Success Rate'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeView === 'both' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Chart */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#a1a1aa"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1d',
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      color: '#fafafa',
                    }}
                    formatter={(value: number) => [`${(value / 1000).toFixed(2)}s`, 'Response Time']}
                    labelFormatter={(value) => `Date: ${value}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgResponseTime"
                    stroke="#3b82f6"
                    fill="url(#colorResponseTime)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <p className="text-sm text-text-muted">Average Response Time</p>
              </div>
            </div>

            {/* Success Rate Chart */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#a1a1aa"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1d',
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      color: '#fafafa',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'successRatePercent') return [`${value.toFixed(1)}%`, 'Success Rate']
                      return [value, name]
                    }}
                    labelFormatter={(value) => `Date: ${value}`}
                  />
                  <Bar
                    dataKey="successRatePercent"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <p className="text-sm text-text-muted">Success Rate</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              {activeView === 'responseTime' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#a1a1aa"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1d',
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      color: '#fafafa',
                    }}
                    formatter={(value: number) => [`${(value / 1000).toFixed(2)}s`, 'Response Time']}
                    labelFormatter={(value) => `Date: ${value}`}
                  />
                  <Legend
                    wrapperStyle={{ color: '#a1a1aa' }}
                    formatter={(value) => (
                      <span style={{ color: '#fafafa' }}>
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgResponseTime"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Response Time"
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#a1a1aa"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1d',
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      color: '#fafafa',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
                    labelFormatter={(value) => `Date: ${value}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="successRatePercent"
                    stroke="#22c55e"
                    fill="url(#colorSuccessRate)"
                    strokeWidth={2}
                    name="Success Rate"
                  />
                  <defs>
                    <linearGradient id="colorSuccessRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-bg-tertiary rounded-lg p-4">
            <div className="text-sm text-text-muted mb-1">Avg Response Time</div>
            <div className="text-2xl font-bold">
              {chartData.length > 0 
                ? `${(chartData.reduce((sum, item) => sum + item.avgResponseTime, 0) / chartData.length / 1000).toFixed(2)}s`
                : 'N/A'
              }
            </div>
          </div>
          <div className="bg-bg-tertiary rounded-lg p-4">
            <div className="text-sm text-text-muted mb-1">Avg Success Rate</div>
            <div className="text-2xl font-bold">
              {chartData.length > 0 
                ? `${(chartData.reduce((sum, item) => sum + item.successRatePercent, 0) / chartData.length).toFixed(1)}%`
                : 'N/A'
              }
            </div>
          </div>
          <div className="bg-bg-tertiary rounded-lg p-4">
            <div className="text-sm text-text-muted mb-1">Total Runs</div>
            <div className="text-2xl font-bold">
              {chartData.reduce((sum, item) => sum + item.totalRuns, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}