import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProjectCard } from './ProjectCard'
import { Search, Filter } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row'] & {
  task_count: number
  completed_tasks: number
  in_progress_tasks: number
  due_date?: string
  priority?: string
  tags?: string[]
  owner?: string
}

interface ProjectListProps {
  projects: Project[]
  isLoading: boolean
}

type FilterType = 'all' | 'active' | 'mine' | 'completed'
type SortType = 'priority' | 'due_date' | 'progress' | 'name'

export function ProjectList({ projects, isLoading }: ProjectListProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortType>('name')

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Filter by status
      if (filter === 'active' && project.status !== 'active') return false
      if (filter === 'completed' && project.status !== 'completed') return false
      if (filter === 'mine' && project.owner !== 'sage') return false // Assuming current user is 'sage'

      // Filter by search
      if (search && !project.name.toLowerCase().includes(search.toLowerCase())) return false

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'progress':
          const aProgress = a.task_count > 0 ? a.completed_tasks / a.task_count : 0
          const bProgress = b.task_count > 0 ? b.completed_tasks / b.task_count : 0
          return bProgress - aProgress
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [projects, filter, search, sortBy])

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'mine', label: 'Mine' },
    { value: 'completed', label: 'Completed' },
  ]

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'priority', label: 'Priority' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'progress', label: 'Progress' },
    { value: 'name', label: 'Name' },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-bg-tertiary rounded-full"></div>
                  <div className="h-6 bg-bg-tertiary rounded w-32"></div>
                </div>
                <div className="h-4 bg-bg-tertiary rounded w-full"></div>
                <div className="h-2 bg-bg-tertiary rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
        <p className="text-text-muted mb-4">
          Create your first project to start organizing your tasks.
        </p>
        <Button>
          Create Project
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-bg-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm w-64"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-bg-primary border border-border-default rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredAndSortedProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-text-muted">
            Try adjusting your filters or search terms.
          </p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>
      )}
    </div>
  )
}