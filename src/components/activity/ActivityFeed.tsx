'use client'

import React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ActivityItem } from './ActivityItem'
import { useActivity } from '@/hooks/useActivity'
import { ActivityLog } from '@/types'

interface ActivityFeedProps {
  limit?: number
  onActivityClick?: (activity: ActivityLog) => void
}

export function ActivityFeed({ limit = 5, onActivityClick }: ActivityFeedProps) {
  const { activities, isLoading } = useActivity()

  const recentActivities = activities.slice(0, limit)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <Link
          href="/activity"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View All
        </Link>
      </div>
      <div className="space-y-0">
        {isLoading && recentActivities.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : recentActivities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet</p>
        ) : (
          <AnimatePresence initial={false}>
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ActivityItem
                  activity={activity}
                  onClick={() => onActivityClick?.(activity)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}