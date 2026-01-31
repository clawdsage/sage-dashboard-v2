import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { ActivityLog } from '@/types'

const eventTypeFilters = [
  { label: 'All', value: 'all' },
  { label: 'Agents', value: 'agent' },
  { label: 'Projects', value: 'project' },
  { label: 'Reviews', value: 'review' },
]

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const router = useRouter()

  const handleActivityClick = (activity: ActivityLog) => {
    if (activity.entity_type === 'project' && activity.entity_id) {
      router.push(`/projects/${activity.entity_id}`)
    } else if (activity.entity_type === 'agent' && activity.entity_id) {
      router.push(`/agents/${activity.entity_id}`)
    } else if (activity.entity_type === 'task' && activity.entity_id) {
      // Navigate to task or project
      router.push(`/projects`) // Adjust as needed
    }
    // Add more navigation logic as needed
  }

  const getEventTypeFilter = (filter: string): string[] | undefined => {
    switch (filter) {
      case 'agent':
        return ['agent_started', 'agent_completed', 'agent_failed']
      case 'project':
        return ['project_created', 'project_updated']
      case 'review':
        return ['review_approved', 'review_rejected']
      default:
        return undefined
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Activity</h1>

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {eventTypeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <ActivityTimeline
        eventType={getEventTypeFilter(activeFilter)}
        onActivityClick={handleActivityClick}
      />
    </div>
  )
}