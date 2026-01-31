'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Download, ZoomIn, ZoomOut, Filter } from 'lucide-react'

interface TimeSeriesDataPoint {
  timestamp: string
  value: number
  category?: string
  metadata?: Record<string, any>
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  valueFormatter?: (value: number) => string
  dateFormatter?: (date: string) => string
  showBrush?: boolean
  showExport?: boolean
  height?: number
  colors?: string[]
  categories?: string[]
  onDataPointClick?: (data: TimeSeriesDataPoint) => void
  onZoomChange?: (startIndex: number, endIndex: number) => void
}

export function TimeSeriesChart({
  data,
  title,
  xAxisLabel = 'Time',
  yAxisLabel = 'Value',
  valueFormatter = (value) => value.toFixed(2),
  dateFormatter = (date) => new Date(date).toLocaleDateString(),
  showBrush = true,
  showExport = true,
  height = 400,
  colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'],
  categories = [],
  onDataPointClick,
  onZoomChange,
}: TimeSeriesChartProps) {
  const [zoom, setZoom] = useState<{ startIndex: number; endIndex: number } | null>(null)
  const [isZoomActive, setIsZoomActive] = useState(false)
  const [zoomStart, setZoomStart] = useState<number | null>(null)
  const [zoomEnd, setZoomEnd] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [brushIndex, setBrushIndex] = useState({ startIndex: 0, endIndex: data.length - 1 })

  // Process data for multiple categories
  const processedData = useMemo(() => {
    if (!categories.length || selectedCategory === 'all') {
      return data
    }

    return data.filter(item => item.category === selectedCategory)
  }, [data, categories, selectedCategory])

  // Get visible data based on brush/zoom
  const visibleData = useMemo(() => {
    if (zoom) {
      return processedData.slice(zoom.startIndex, zoom.endIndex + 1)
    }
    if (brushIndex) {
      return processedData.slice(brushIndex.startIndex, brushIndex.endIndex + 1)
    }
    return processedData
  }, [processedData, zoom, brushIndex])

  // Calculate statistics for visible data
  const stats = useMemo(() => {
    if (!visibleData.length) return null

    const values = visibleData.map(d => d.value)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }, [visibleData])

  const handleMouseDown = useCallback((e: any) => {
    if (!isZoomActive || !e) return
    const { activeLabel } = e
    if (activeLabel) {
      const index = processedData.findIndex(d => d.timestamp === activeLabel)
      setZoomStart(index)
    }
  }, [isZoomActive, processedData])

  const handleMouseMove = useCallback((e: any) => {
    if (!isZoomActive || zoomStart === null || !e) return
    const { activeLabel } = e
    if (activeLabel) {
      const index = processedData.findIndex(d => d.timestamp === activeLabel)
      setZoomEnd(index)
    }
  }, [isZoomActive, zoomStart, processedData])

  const handleMouseUp = useCallback(() => {
    if (!isZoomActive || zoomStart === null || zoomEnd === null) {
      setIsZoomActive(false)
      setZoomStart(null)
      setZoomEnd(null)
      return
    }

    const start = Math.min(zoomStart, zoomEnd)
    const end = Math.max(zoomStart, zoomEnd)

    setZoom({ startIndex: start, endIndex: end })
    onZoomChange?.(start, end)
    
    setIsZoomActive(false)
    setZoomStart(null)
    setZoomEnd(null)
  }, [isZoomActive, zoomStart, zoomEnd, onZoomChange])

  const handleResetZoom = useCallback(() => {
    setZoom(null)
    setBrushIndex({ startIndex: 0, endIndex: data.length - 1 })
  }, [data.length])

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Timestamp', 'Value', 'Category', ...Object.keys(data[0]?.metadata || {})].join(','),
      ...visibleData.map(item => [
        item.timestamp,
        item.value,
        item.category || '',
        ...Object.values(item.metadata || {}).map(v => JSON.stringify(v))
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeseries-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, [visibleData, data])

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
      a.download = `timeseries-${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }, [])

  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-primary border border-border-subtle rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-text-primary mb-1">
            {dateFormatter(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-text-secondary">
                {entry.dataKey}: {valueFormatter(entry.value)}
              </span>
            </div>
          ))}
          {payload[0]?.payload?.metadata && (
            <div className="mt-2 pt-2 border-t border-border-subtle">
              {Object.entries(payload[0].payload.metadata).map(([key, value]) => (
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
  }, [dateFormatter, valueFormatter])

  return (
    <div className="w-full">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {stats && (
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="text-sm">
                <span className="text-text-muted">Avg: </span>
                <span className="font-medium text-text-primary">
                  {valueFormatter(stats.avg)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-text-muted">Min: </span>
                <span className="font-medium text-text-primary">
                  {valueFormatter(stats.min)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-text-muted">Max: </span>
                <span className="font-medium text-text-primary">
                  {valueFormatter(stats.max)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-text-muted">Points: </span>
                <span className="font-medium text-text-primary">{stats.count}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                className="bg-bg-secondary border border-border-subtle rounded px-2 py-1 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Zoom controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsZoomActive(!isZoomActive)}
            className={isZoomActive ? 'bg-bg-tertiary' : ''}
          >
            {isZoomActive ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            <span className="ml-1">{isZoomActive ? 'Cancel Zoom' : 'Zoom'}</span>
          </Button>

          {zoom && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              Reset View
            </Button>
          )}

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

      {/* Chart */}
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={(data) => {
              if (data && data.activePayload && onDataPointClick) {
                onDataPointClick(data.activePayload[0].payload)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="timestamp"
              stroke="#a1a1aa"
              fontSize={12}
              tickFormatter={dateFormatter}
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

            {/* Main line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, onClick: (data) => onDataPointClick?.(data.payload) }}
              name={yAxisLabel}
            />

            {/* Zoom area visualization */}
            {isZoomActive && zoomStart !== null && zoomEnd !== null && (
              <ReferenceArea
                x1={processedData[Math.min(zoomStart, zoomEnd)]?.timestamp}
                x2={processedData[Math.max(zoomStart, zoomEnd)]?.timestamp}
                strokeOpacity={0.3}
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            )}

            {/* Brush for navigation */}
            {showBrush && !zoom && (
              <Brush
                dataKey="timestamp"
                height={30}
                stroke="#3f3f46"
                fill="#1a1a1d"
                tickFormatter={dateFormatter}
                onChange={(index) => {
                  if (index && typeof index === 'object' && 'startIndex' in index && 'endIndex' in index) {
                    setBrushIndex(index)
                  }
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Zoom instructions */}
        {isZoomActive && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-bg-primary/90 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary">
            Click and drag to select zoom area
          </div>
        )}
      </div>

      {/* Zoom status */}
      {zoom && (
        <div className="mt-3 text-sm text-text-muted">
          Zoomed: {dateFormatter(processedData[zoom.startIndex]?.timestamp)} to{' '}
          {dateFormatter(processedData[zoom.endIndex]?.timestamp)} •{' '}
          <button
            className="text-accent-blue hover:underline"
            onClick={handleResetZoom}
          >
            Reset view
          </button>
        </div>
      )}
    </div>
  )
}