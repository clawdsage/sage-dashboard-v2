import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface UsageBreakdownProps {
  data: { 
    model: string
    count: number
    cost: number
    tokens?: number
    duration?: number
  }[]
  view?: 'cost' | 'count' | 'tokens' | 'duration'
  onViewChange?: (view: string) => void
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#8b5cf6', '#ec4899']

export function UsageBreakdown({ data, view = 'cost', onViewChange }: UsageBreakdownProps) {
  const [activeView, setActiveView] = useState(view)

  const handleViewChange = (newView: string) => {
    setActiveView(newView)
    onViewChange?.(newView)
  }

  const getDataKey = () => {
    switch (activeView) {
      case 'count': return 'count'
      case 'tokens': return 'tokens'
      case 'duration': return 'duration'
      default: return 'cost'
    }
  }

  const getLabel = () => {
    switch (activeView) {
      case 'count': return 'Runs'
      case 'tokens': return 'Tokens'
      case 'duration': return 'Duration (ms)'
      default: return 'Cost'
    }
  }

  const getFormatter = (value: number) => {
    switch (activeView) {
      case 'count': return value.toLocaleString()
      case 'tokens': return value.toLocaleString()
      case 'duration': return `${(value / 1000).toFixed(1)}s`
      default: return `$${value.toFixed(4)}`
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[getDataKey() as keyof typeof a] || 0
    const bValue = b[getDataKey() as keyof typeof b] || 0
    return bValue - aValue
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usage Breakdown</CardTitle>
          <div className="flex space-x-1">
            {['cost', 'count', 'tokens', 'duration'].map((viewType) => (
              <Button
                key={viewType}
                variant={activeView === viewType ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange(viewType)}
                className="capitalize"
              >
                {viewType}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ model, percent }) => `${model} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={getDataKey()}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1d',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    color: '#fafafa',
                  }}
                  formatter={(value: number) => [getFormatter(value), getLabel()]}
                  labelFormatter={(value, payload) => {
                    const item = payload?.[0]?.payload
                    return item?.model || 'Unknown'
                  }}
                />
                <Legend
                  wrapperStyle={{ color: '#a1a1aa' }}
                  formatter={(value) => (
                    <span style={{ color: '#fafafa' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="model"
                  stroke="#a1a1aa"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (activeView === 'cost') return `$${value.toFixed(2)}`
                    if (activeView === 'duration') return `${(value / 1000).toFixed(0)}s`
                    return value.toLocaleString()
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1d',
                    border: '1px solid #3f3f46',
                    borderRadius: '6px',
                    color: '#fafafa',
                  }}
                  formatter={(value: number) => [getFormatter(value), getLabel()]}
                  labelFormatter={(value) => `Model: ${value}`}
                />
                <Bar
                  dataKey={getDataKey()}
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-2">Model</th>
                <th className="text-right py-2">Runs</th>
                <th className="text-right py-2">Cost</th>
                <th className="text-right py-2">Tokens</th>
                <th className="text-right py-2">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={item.model} className="border-b border-border-subtle">
                  <td className="py-2">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {item.model}
                    </div>
                  </td>
                  <td className="text-right py-2">{item.count.toLocaleString()}</td>
                  <td className="text-right py-2">${(item.cost || 0).toFixed(4)}</td>
                  <td className="text-right py-2">{(item.tokens || 0).toLocaleString()}</td>
                  <td className="text-right py-2">
                    {item.duration ? `${((item.duration / item.count) / 1000).toFixed(1)}s` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}