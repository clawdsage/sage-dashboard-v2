'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AgentRun } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LiveIndicator } from './LiveIndicator'
import { formatDuration, formatCost, formatTokens, formatRelativeTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: AgentRun
}

export function AgentCard({ agent }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusVariants = {
    idle: 'secondary',
    active: 'default',
    completed: 'success',
    failed: 'danger',
  } as const

  const now = new Date()
  const startedAt = new Date(agent.started_at)
  const elapsedMs = agent.status === 'active' 
    ? now.getTime() - startedAt.getTime() 
    : (agent.completed_at ? new Date(agent.completed_at).getTime() - startedAt.getTime() : 0)

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg',
        agent.status === 'active' && 'ring-1 ring-accent-blue/20 shadow-glow'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <LiveIndicator status={agent.status} />
            <h3 className="font-semibold text-text-primary">{agent.name}</h3>
          </div>
          <Badge variant={statusVariants[agent.status]} className="capitalize">
            {agent.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        {agent.status === 'active' && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-text-secondary mb-1">
              <span>Progress</span>
              <span>{agent.progress}%</span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2">
              <motion.div
                className="bg-accent-blue h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${agent.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Time</div>
            <div className="text-text-primary font-medium">
              {formatDuration(elapsedMs)}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Tokens</div>
            <div className="text-text-primary font-medium">
              {formatTokens(agent.tokens_used)}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Cost</div>
            <div className="text-text-primary font-medium">
              {formatCost(agent.cost)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-3">
          <p className="text-text-secondary text-sm line-clamp-2">
            {agent.task_description || 'No description'}
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border-subtle"
          >
            <div className="p-4 pt-3 space-y-3">
              <div>
                <h4 className="font-medium text-text-primary mb-2">Details</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Started</dt>
                    <dd className="text-text-primary">{formatRelativeTime(agent.started_at)}</dd>
                  </div>
                  {agent.completed_at && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Completed</dt>
                      <dd className="text-text-primary">{formatRelativeTime(agent.completed_at)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Tokens Used</dt>
                    <dd className="text-text-primary">{agent.tokens_used.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">API Calls</dt>
                    <dd className="text-text-primary">{agent.api_calls}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}