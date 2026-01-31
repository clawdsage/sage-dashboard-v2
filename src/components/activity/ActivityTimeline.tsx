import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ActivityItem } from './ActivityItem'
import { useActivity } from '@/hooks/useActivity'
import { ActivityLog } from '@/types'
import { Button } from '@/components/ui/Button'

interface ActivityTimelineProps {
  eventType?: string
  onActivityClick?: (activity: ActivityLog) => void
}

export function ActivityTimeline({ eventType, onActivityClick }: ActivityTimelineProps) {
  const { activities, isLoading, error, hasMore, loadMore } = useActivity(eventType)

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load activities</p>
      </div>
    )
  }

  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <AnimatePresence initial={false}>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ActivityItem
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {hasMore && (
        <div className="text-center py-4">
          <Button onClick={loadMore} variant="outline" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}