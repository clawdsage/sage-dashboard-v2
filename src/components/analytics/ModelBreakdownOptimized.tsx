import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { memo, useMemo } from 'react'

interface ModelBreakdownOptimizedProps {
  data: { model: string; count: number; cost: number }[]
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4']

// Memoized tooltip formatter to prevent re-renders
const CostTooltipFormatter = (value: number) => [`$${value.toFixed(4)}`, 'Cost']

// Memoized legend formatter
const LegendFormatter = (value: string) => (
  <span style={{ color: '#fafafa' }}>
    {value}
  </span>
)

export const ModelBreakdownOptimized = memo(function ModelBreakdownOptimized({ data }: ModelBreakdownOptimizedProps) {
  // Memoize the processed data to prevent re-renders when props haven't changed
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Add percentage for labels if needed
      percentage: (item.cost / data.reduce((sum, d) => sum + d.cost, 0)) * 100
    }))
  }, [data])

  // Memoize cells to prevent re-renders
  const cells = useMemo(() => 
    processedData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    )), 
    [processedData]
  )

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ model, percentage }) => `${model} ${percentage.toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cost"
          >
            {cells}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1d',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              color: '#fafafa',
            }}
            formatter={CostTooltipFormatter}
          />
          <Legend
            wrapperStyle={{ color: '#a1a1aa' }}
            formatter={LegendFormatter}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})