import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()

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

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">High</Badge>
      case 'medium':
        return <Badge variant="warning">Medium</Badge>
      case 'low':
        return <Badge variant="secondary">Low</Badge>
      default:
        return null
    }
  }

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return 'text-text-muted'
    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'text-text-red'
    if (diffDays <= 3) return 'text-accent-amber'
    return 'text-text-muted'
  }

  const handleClick = () => {
    router.push(`/projects/${project.id}`)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header: Name, Color, Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color || '#3b82f6' }}
                />
                <h3 className="text-lg font-semibold">{project.name}</h3>
              </div>
              {getStatusBadge(project.status)}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {project.completed_tasks} / {project.task_count} tasks
                </span>
                <span className="text-text-muted">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2">
                <motion.div
                  className="bg-accent-blue h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Due Date */}
            {project.due_date && (
              <div className={`text-sm ${getDueDateColor(project.due_date)}`}>
                Due: {new Date(project.due_date).toLocaleDateString()}
              </div>
            )}

            {/* Priority and Tags */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getPriorityBadge(project.priority)}
                {project.tags && project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}