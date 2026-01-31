'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AgentRun } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCost, formatTokens, formatRelativeTime } from '@/lib/formatters'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
  review: AgentRun
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, comment: string) => void
  isApproving: boolean
  isRejecting: boolean
}

export function ReviewCard({ review, onApprove, onReject, isApproving, isRejecting }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [comment, setComment] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)

  const outputPreview = review.output?.slice(0, 200) || 'No output'
  const hasMoreOutput = review.output && review.output.length > 200

  const handleApprove = () => {
    onApprove(review.id, comment || undefined)
    setComment('')
    setShowCommentInput(false)
  }

  const handleReject = () => {
    if (!comment.trim()) {
      setShowCommentInput(true)
      return
    }
    onReject(review.id, comment)
    setComment('')
    setShowCommentInput(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-amber-200 bg-amber-50/30">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge variant="warning" className="capitalize">
                Pending Review
              </Badge>
              <h3 className="font-semibold text-text-primary">{review.name}</h3>
            </div>
            <div className="text-sm text-text-muted">
              {formatRelativeTime(review.completed_at || review.started_at)}
            </div>
          </div>

          {/* Task Description */}
          <div className="mb-3">
            <p className="text-text-secondary text-sm">
              {review.task_description || 'No description'}
            </p>
          </div>

          {/* Output Preview */}
          <div className="mb-4">
            <h4 className="font-medium text-text-primary mb-2 text-sm">Output</h4>
            <div className="bg-bg-secondary rounded-md p-3 text-sm">
              <p className="text-text-primary whitespace-pre-wrap">
                {isExpanded ? review.output : outputPreview}
                {!isExpanded && hasMoreOutput && '...'}
              </p>
              {hasMoreOutput && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-accent-blue hover:text-accent-blue/80 text-xs flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show more
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="text-text-muted">Tokens Used</div>
              <div className="text-text-primary font-medium">
                {formatTokens(review.tokens_used)}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Cost</div>
              <div className="text-text-primary font-medium">
                {formatCost(review.cost)}
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <AnimatePresence>
            {showCommentInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4"
              >
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a review comment..."
                  className="w-full p-3 border border-border-default rounded-md bg-bg-primary text-text-primary text-sm resize-none"
                  rows={3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={isApproving || isRejecting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}