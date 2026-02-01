'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { MissionControlTask, MissionControlAgent } from '@/types'
import TaskCard from './TaskCard'
import { Card } from '@/components/ui/Card'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  tasks: MissionControlTask[]
  agents: MissionControlAgent[]
  onTaskClick: (taskId: string) => void
  onTaskMoved: (taskId: string, newStatus: string, newAssigneeIds?: string[]) => Promise<void>
  onTaskUpdated: (taskId: string, updates: any) => Promise<void>
}

const columns = [
  { id: 'inbox', title: 'Inbox', color: 'bg-gray-500' },
  { id: 'assigned', title: 'Assigned', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'review', title: 'Review', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' }
]

export default function KanbanBoard({
  tasks,
  agents,
  onTaskClick,
  onTaskMoved,
  onTaskUpdated
}: KanbanBoardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false)

    if (!result.destination) return

    const { source, destination, draggableId } = result

    // If dropped in same column, reorder within column
    if (source.droppableId === destination.droppableId) {
      // TODO: Implement reordering within column
      return
    }

    // Move task to new column
    try {
      await onTaskMoved(draggableId, destination.droppableId)
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const getColumnStats = (status: string) => {
    const columnTasks = getTasksByStatus(status)
    const highPriority = columnTasks.filter(t => t.priority === 'high').length
    const assigned = columnTasks.filter(t => t.assignee_ids.length > 0).length
    
    return {
      total: columnTasks.length,
      highPriority,
      assigned
    }
  }

  return (
    <div className="h-full p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Task Board</h2>
        <p className="text-sm text-text-secondary">Drag and drop tasks between columns</p>
      </div>

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-[calc(100%-4rem)]">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
            const stats = getColumnStats(column.id)

            return (
              <div key={column.id} className="flex-1 flex flex-col">
                {/* Column header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", column.color)} />
                      <h3 className="font-medium text-text-primary">{column.title}</h3>
                      <span className="text-sm text-text-muted bg-bg-tertiary px-2 py-0.5 rounded">
                        {stats.total}
                      </span>
                    </div>
                    {stats.highPriority > 0 && (
                      <span className="text-xs text-accent-red bg-accent-red/10 px-2 py-0.5 rounded">
                        {stats.highPriority} high
                      </span>
                    )}
                  </div>
                  {stats.assigned > 0 && (
                    <p className="text-xs text-text-muted mt-1">
                      {stats.assigned} assigned
                    </p>
                  )}
                </div>

                {/* Droppable area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 rounded-lg border-2 border-dashed transition-colors",
                        snapshot.isDraggingOver
                          ? "border-accent-blue bg-accent-blue/5"
                          : "border-border-subtle bg-bg-tertiary/50",
                        isDragging && "border-accent-blue/50"
                      )}
                    >
                      <div className="p-2 space-y-2 min-h-[200px]">
                        {columnTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "cursor-grab active:cursor-grabbing",
                                  snapshot.isDragging && "opacity-50"
                                )}
                              >
                                <TaskCard
                                  task={task}
                                  agents={agents}
                                  onClick={() => onTaskClick(task.id)}
                                  onUpdate={onTaskUpdated}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {/* Empty state */}
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-full flex items-center justify-center p-4">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📋</div>
                            <p className="text-sm text-text-muted">No tasks</p>
                            {column.id === 'inbox' && (
                              <p className="text-xs text-text-muted mt-1">
                                Create a task to get started
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}