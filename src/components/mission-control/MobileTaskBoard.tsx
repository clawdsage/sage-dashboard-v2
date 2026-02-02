'use client'

import { useMemo, useState } from 'react'
import { MissionControlAgent, MissionControlTask } from '@/types'
import TaskCard from './TaskCard'

const columns = [
  { id: 'inbox', title: 'Inbox' },
  { id: 'assigned', title: 'Assigned' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
] as const

interface MobileTaskBoardProps {
  tasks: MissionControlTask[]
  agents: MissionControlAgent[]
  onTaskClick: (taskId: string) => void
  onTaskUpdated: (taskId: string, updates: any) => Promise<void>
}

export default function MobileTaskBoard({ tasks, agents, onTaskClick, onTaskUpdated }: MobileTaskBoardProps) {
  const [status, setStatus] = useState<(typeof columns)[number]['id']>('inbox')

  const tasksByStatus = useMemo(() => {
    return tasks
      .filter(t => t.status === status)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [tasks, status])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of columns) map[c.id] = 0
    for (const t of tasks) map[t.status] = (map[t.status] || 0) + 1
    return map
  }, [tasks])

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border-subtle bg-bg-secondary">
        <div className="flex gap-2 overflow-x-auto">
          {columns.map(c => (
            <button
              key={c.id}
              onClick={() => setStatus(c.id)}
              className={`shrink-0 text-xs px-3 py-2 rounded-full border ${status === c.id ? 'bg-bg-elevated border-border-subtle' : 'bg-transparent border-border-subtle text-text-secondary'}`}
            >
              {c.title} <span className="text-text-muted">({counts[c.id] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tasksByStatus.length === 0 ? (
          <div className="text-sm text-text-muted p-6 text-center">No tasks in {columns.find(c => c.id === status)?.title}.</div>
        ) : (
          tasksByStatus.map(task => (
            <div key={task.id}>
              <TaskCard task={task} agents={agents} onClick={() => onTaskClick(task.id)} onUpdate={onTaskUpdated} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
