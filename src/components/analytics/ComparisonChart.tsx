'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Download, Filter, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface ComparisonDataPoint {
  name: string
  values: Record<string, number>
  metadata?: Record<string, any>
}

interface ComparisonChartProps {
  data: ComparisonDataPoint[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  valueFormatter?: (value: number) => string
  showExport?: boolean
  height?: number
  colors?: string[]
  metrics?: string[]
  comparisonType?: 'stacked' | 'grouped' | 'percentage'
  showTrendLines?: boolean
  onBarClick?: (data: ComparisonDataPoint, metric: string) => void
}

export function ComparisonChart({
  data,
  title,
  xAxisLabel = 'Category',
  yAxisLabel = 'Value',
  valueFormatter = (value) => value.toFixed(2),
  showExport = true,
  height = 400,
  colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'],
  metrics = [],
  comparisonType = 'grouped',
  showTrendLines = false,
  onBarClick,
}: ComparisonChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(metrics)
  const [sortBy, setSortBy] = useState<string>('total')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Extract all metrics if not provided
  const allMetrics = useMemo(() => {
    if (metrics.length > 0) return metrics
    
    const metricSet = new Set<string>()
    data.forEach(item => {
      Object.keys(item.values).forEach(key => metricSet.add(key))
    })
    return Array.from(metricSet)
  }, [data, metrics])

  // Process and sort data
  const processedData = useMemo(() => {
    const processed = data.map(item => {
      const total = Object.values(item.values).reduce((sum, val) => sum + val, 0)
      return {
        ...item,
        total,
        values: { ...item.values }
      }
    })

    // Sort data
    return processed.sort((a, b) => {
      let aValue, bValue

      if (sortBy === 'total') {
        aValue = a.total
        bValue = b.total
      } else {
        aValue = a.values[sortBy] || 0
        bValue = b.values[sortBy] || 0
      }

      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue
    })
  }, [data, sortBy, sortDirection])

  // Calculate statistics
  const stats = useMemo(() => {
    const allValues = processedData.flatMap(item => 
      Object.values(item.values).filter(val => selectedMetrics.length === 0 || selectedMetrics.includes(Object.keys(item.values)[0]))
    )
    
    if (allValues.length === 0) return null

    const sum = allValues.reduce((a, b) => a + b, 0)
    const avg = sum / allValues.length
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)

    return { avg, min, max, total: sum, count: allValues.length }
  }, [processedData, selectedMetrics])

  // Calculate trend lines if enabled
  const trendLines = useMemo(() => {
    if (!showTrendLines || processedData.length < 2) return []

    const lines = []
    const firstItem = processedData[0]
    
    Object.keys(firstItem.values).forEach(metric => {
      const values = processedData.map(item => item.values[metric] || 0)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      lines.push({ metric, value: avg })
    })

    return lines
  }, [processedData, showTrendLines])

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Name', ...allMetrics, 'Total'].join(','),
      ...processedData.map(item => [
        item.name,
        ...allMetrics.map(metric => item.values[metric] || 0),
        item.total
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comparison-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, [processedData, allMetrics])

  const handleExportImage = useCallback(() => {
    const svg = document.querySelector('.recharts-wrapper svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = `comparison-${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }, [])

  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = processedData.find(item => item.name === label)
      
      return (
        <div className="bg-bg-primary border border-border-subtle rounded-lg p-3 shadow-lg min-w-48">
          <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-text-secondary">{entry.dataKey}</span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {valueFormatter(entry.value)}
              </span>
            </div>
          ))}
          {dataItem?.total !== undefined && (
            <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Total</span>
              <span className="text-sm font-bold text-text-primary">
                {valueFormatter(dataItem.total)}
              </span>
            </div>
          )}
          {dataItem?.metadata && (
            <div className="mt-2 pt-2 border-t border-border-subtle">
              {Object.entries(dataItem.metadata).map(([key, value]) => (
                <p key={key} className="text-xs text-text-muted">
                  {key}: {String(value)}
                </p>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }, [processedData, valueFormatter])

  const handleMetricToggle = useCallback((metric: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric)
      } else {
        return [...prev, metric]
      }
    })
  }, [])

  const handleSort = useCallback((metric: string) => {
    if (sortBy === metric) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(metric)
      setSortDirection('desc')
    }
  }, [sortBy])

  return (
    <div className="w-full">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {stats && (
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="text-sm">
                <span className="text-text-muted">Total: </span>
                <span className="font-medium text-text-primary">
                  {valueFormatter(stats.total)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-text-muted">Avg: </span>
                <span className="font-medium text-text-primary">
                  {valueFormatter(stats.avg)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-text-muted">Range: </span>
                <span className="font-medium text-text-primary">
                  {valueFormatter(stats.min)} - {valueFormatter(stats.max)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Chart type selector */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-text-muted" />
            <select
              className="bg-bg-secondary border border-border-subtle rounded px-2 py-1 text-sm"
              value={comparisonType}
              onChange={(e) => {}}
              disabled
            >
              <option value="grouped">Grouped</option>
              <option value="stacked">Stacked</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          {/* Sort controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-muted">Sort by:</span>
            <select
              className="bg-bg-secondary border border-border-subtle rounded px-2 py-1 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="total">Total</option>
              {allMetrics.map(metric => (
                <option key={metric} value={metric}>{metric}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              {sortDirection === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </Button>
          </div>

          {/* Export controls */}
          {showExport && (
            <div className="relative group">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                <span className="ml-1">Export</span>
              </Button>
              <div className="absolute right-0 mt-1 w-40 bg-bg-primary border border-border-subtle rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-bg-secondary rounded-t-lg"
                  onClick={handleExport}
                >
                  Export as CSV
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-bg-secondary rounded-b-lg"
                  onClick={handleExportImage}
                >
                  Export as PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric filter */}
      {allMetrics.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Metrics:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allMetrics.map((metric, index) => (
              <Button
                key={metric}
                variant={selectedMetrics.includes(metric) ? "default" : "outline"}
                size="sm"
                onClick={() => handleMetricToggle(metric)}
                style={{
                  backgroundColor: selectedMetrics.includes(metric) ? colors[index % colors.length] : undefined,
                  borderColor: selectedMetrics.includes(metric) ? colors[index % colors.length] : undefined,
                }}
              >
                {metric}
              </Button>
            ))}
            {selectedMetrics.length < allMetrics.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMetrics(allMetrics)}
              >
                Select All
              </Button>
            )}
            {selectedMetrics.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMetrics([])}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="name"
              stroke="#a1a1aa"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -5, fill: '#a1a1aa' }}
            />
            <YAxis
              stroke="#a1a1aa"
              fontSize={12}
              tickFormatter={valueFormatter}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#a1a1aa' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#a1a1aa', fontSize: '12px' }}
              formatter={(value) => (
                <span style={{ color: '#fafafa' }}>{value}</span>
              )}
            />

            {/* Render bars for selected metrics */}
            {allMetrics
              .filter(metric => selectedMetrics.length === 0 || selectedMetrics.includes(metric))
              .map((metric, index) => (
                <Bar
                  key={metric}
                  dataKey={`values.${metric}`}
                  name={metric}
                  fill={colors[index % colors.length]}
                  stackId={comparisonType === 'stacked' || comparisonType === 'percentage' ? 'stack' : undefined}
                  onClick={(data) => onBarClick?.(data.payload, metric)}
                >
                  {processedData.map((entry, barIndex) => (
                    <Cell
                      key={`cell-${barIndex}`}
                      fill={colors[index % colors.length]}
                      style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                      onClick={() => onBarClick?.(entry, metric)}
                    />
                  ))}
                </Bar>
              ))}

            {/* Trend lines */}
            {showTrendLines && trendLines.map((line, index) => (
              <ReferenceLine
                key={line.metric}
                y={line.value}
                stroke={colors[index % colors.length]}
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: `${line.metric} avg: ${valueFormatter(line.value)}`,
                  position: 'right',
                  fill: colors[index % colors.length],
                  fontSize: 10,
                }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-sm text-text-muted">Total Items</div>
            <div className="text-lg font-semibold text-text-primary">{stats.count}</div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-sm text-text-muted">Average Value</div>
            <div className="text-lg font-semibold text-text-primary">
              {valueFormatter(stats.avg)}
            </div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-sm text-text-muted">Minimum</div>
            <div className="text-lg font-semibold text-text-primary">
              {valueFormatter(stats.min)}
            </div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="text-sm text-text-muted">Maximum</div>
            <div className="text-lg font-semibold text-text-primary">
              {valueFormatter(stats.max)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}