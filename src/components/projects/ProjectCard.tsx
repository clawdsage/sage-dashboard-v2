import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row'] & {
  task_count: number
  completed_tasks: number
  in_progress_tasks: number
}

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onViewTasks: (id: string) => void
}

export function ProjectCard({ project, onEdit, onDelete, onViewTasks }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)

  const progress = project.task_count > 0 ? (project.completed_tasks / project.task_count) * 100 : 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      case 'on_hold':
        return <Badge variant="warning">On Hold</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color || '#3b82f6' }}
            />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(project.status)}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Task Counts */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {project.completed_tasks} / {project.task_count} tasks completed
            </span>
            <span className="text-text-muted">
              {project.in_progress_tasks} in progress
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-bg-tertiary rounded-full h-2">
            <div
              className="bg-accent-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {expanded && (
            <div className="pt-2 border-t border-border-subtle">
              {project.description && (
                <p className="text-sm text-text-muted mb-4">{project.description}</p>
              )}
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => onViewTasks(project.id)}>
                  View Tasks
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}