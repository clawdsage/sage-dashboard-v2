import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Download, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import type { Database } from '@/lib/supabase'

type AgentRun = Database['public']['Tables']['subagent_runs']['Row']

interface AgentTableProps {
  data: AgentRun[]
  isLoading?: boolean
  onExport?: (format: 'csv' | 'json') => void
  onRowClick?: (run: AgentRun) => void
}

const statusColors = {
  completed: 'bg-accent-green/20 text-accent-green',
  failed: 'bg-accent-red/20 text-accent-red',
  running: 'bg-accent-amber/20 text-accent-amber',
  pending: 'bg-bg-tertiary text-text-muted',
  cancelled: 'bg-text-muted/20 text-text-muted',
}

export function AgentTable({ data, isLoading = false, onExport, onRowClick }: AgentTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof AgentRun>('started_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  const handleSort = (field: keyof AgentRun) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredData = data.filter(run => {
    const matchesSearch = search === '' || 
      run.name?.toLowerCase().includes(search.toLowerCase()) ||
      run.model?.toLowerCase().includes(search.toLowerCase()) ||
      run.task?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }
    
    return 0
  })

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const paginatedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'running', label: 'Running' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const formatDuration = (startedAt: string, completedAt?: string) => {
    if (!completedAt) return 'N/A'
    const start = new Date(startedAt)
    const end = new Date(completedAt)
    const durationMs = end.getTime() - start.getTime()
    return `${(durationMs / 1000).toFixed(1)}s`
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-bg-tertiary rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Recent Agent Runs</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search runs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full md:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th 
                  className="text-left py-3 px-2 cursor-pointer hover:bg-bg-tertiary rounded-l"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-2 cursor-pointer hover:bg-bg-tertiary"
                  onClick={() => handleSort('model')}
                >
                  <div className="flex items-center">
                    Model
                    {sortField === 'model' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-2 cursor-pointer hover:bg-bg-tertiary"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-bg-tertiary"
                  onClick={() => handleSort('cost')}
                >
                  <div className="flex items-center justify-end">
                    Cost
                    {sortField === 'cost' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-bg-tertiary"
                  onClick={() => handleSort('tokens_used')}
                >
                  <div className="flex items-center justify-end">
                    Tokens
                    {sortField === 'tokens_used' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-bg-tertiary"
                  onClick={() => handleSort('started_at')}
                >
                  <div className="flex items-center justify-end">
                    Duration
                    {sortField === 'started_at' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-bg-tertiary rounded-r"
                  onClick={() => handleSort('started_at')}
                >
                  <div className="flex items-center justify-end">
                    Started
                    {sortField === 'started_at' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((run) => (
                <tr 
                  key={run.id}
                  className="border-b border-border-subtle hover:bg-bg-tertiary cursor-pointer"
                  onClick={() => onRowClick?.(run)}
                >
                  <td className="py-3 px-2">
                    <div className="font-medium truncate max-w-xs">{run.name || 'Unnamed'}</div>
                    {run.task && (
                      <div className="text-xs text-text-muted truncate max-w-xs">{run.task}</div>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-mono text-xs">{run.model || 'N/A'}</div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[run.status as keyof typeof statusColors] || statusColors.pending}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="text-right py-3 px-2 font-mono">
                    ${(run.cost || 0).toFixed(4)}
                  </td>
                  <td className="text-right py-3 px-2 font-mono">
                    {(run.tokens_used || 0).toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-2">
                    {formatDuration(run.started_at, run.completed_at)}
                  </td>
                  <td className="text-right py-3 px-2 text-text-muted">
                    {formatDate(run.started_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted">No agent runs found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-muted">
              Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, sortedData.length)} of {sortedData.length} runs
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span className="text-text-muted">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}