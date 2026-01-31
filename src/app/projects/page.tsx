'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { useProjects } from '@/hooks/useProjects'
import { Plus } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row'] & {
  task_count: number
  completed_tasks: number
  in_progress_tasks: number
}

export default function ProjectsPage() {
  const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleCreateProject = (projectData: Database['public']['Tables']['projects']['Insert']) => {
    createProject.mutate(projectData)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleUpdateProject = (projectData: Database['public']['Tables']['projects']['Insert']) => {
    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, updates: projectData })
      setEditingProject(null)
    }
  }

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate(id)
    }
  }

  const handleViewTasks = (id: string) => {
    setSelectedProjectId(id)
    // In a real app, this might navigate to a task view or expand inline
    // For now, just select it
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <Card className="p-6">
          <p className="text-text-red">Error loading projects: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-bg-tertiary rounded mb-4"></div>
              <div className="h-2 bg-bg-tertiary rounded"></div>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-text-muted mb-4">
            Create your first project to start organizing your tasks.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onViewTasks={handleViewTasks}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProject(null)
        }}
        onCreate={editingProject ? handleUpdateProject : handleCreateProject}
        isLoading={createProject.isPending || updateProject.isPending}
        initialData={editingProject || undefined}
      />
    </div>
  )
}