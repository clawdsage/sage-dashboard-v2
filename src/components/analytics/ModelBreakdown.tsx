import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ModelBreakdownProps {
  data: { model: string; count: number; cost: number }[]
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4']

export function ModelBreakdown({ data }: ModelBreakdownProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ model, percent }) => `${model} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cost"
          >
            {data.map((entry, index) => (
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
            formatter={(value: number, name: string) => [`$${value.toFixed(4)}`, 'Cost']}
          />
          <Legend
            wrapperStyle={{ color: '#a1a1aa' }}
            formatter={(value, entry) => (
              <span style={{ color: '#fafafa' }}>
                {entry.payload ? `${entry.payload.model}: $${entry.payload.cost.toFixed(4)}` : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}