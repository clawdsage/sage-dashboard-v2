'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProjectList } from '@/components/projects/ProjectList'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { useProjects } from '@/hooks/useProjects'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const { projects, isLoading, error, createProject } = useProjects()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateProject = (projectData: any) => {
    // For now, only pass the fields that exist in the database
    const { name, description, color, status } = projectData
    createProject.mutate({ name, description, color, status })
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

      <ProjectList projects={projects} isLoading={isLoading} />

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
        isLoading={createProject.isPending}
      />
    </div>
  )
}