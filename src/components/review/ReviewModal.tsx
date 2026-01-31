'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AgentRun } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCost, formatTokens, formatRelativeTime, formatDuration } from '@/lib/formatters'
import { X, Check, Clock, DollarSign, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewModalProps {
  review: AgentRun | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, comment: string) => void
  isApproving: boolean
  isRejecting: boolean
}

export function ReviewModal({
  review,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: ReviewModalProps) {
  const [comment, setComment] = useState('')

  if (!review) return null

  const handleApprove = () => {
    onApprove(review.id, comment || undefined)
    setComment('')
    onClose()
  }

  const handleReject = () => {
    if (!comment.trim()) return
    onReject(review.id, comment)
    setComment('')
    onClose()
  }

  const duration = review.completed_at
    ? new Date(review.completed_at).getTime() - new Date(review.started_at).getTime()
    : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-bg-secondary border border-border-subtle rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <Badge variant="warning">Pending Review</Badge>
                  <h2 className="text-xl font-semibold">{review.name}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
                {/* Main Content */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  {/* Task Description */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Task Description</h3>
                    <div className="bg-bg-primary rounded-lg p-4 border">
                      <p className="text-text-primary whitespace-pre-wrap">
                        {review.task_description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Agent Output</h3>
                    <div className="bg-bg-primary rounded-lg p-4 border max-h-96 overflow-y-auto">
                      <pre className="text-text-primary whitespace-pre-wrap font-mono text-sm">
                        {review.output || 'No output generated'}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-border-subtle space-y-6">
                  {/* Stats */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Run Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-text-muted" />
                        <div>
                          <div className="text-sm text-text-muted">Completed</div>
                          <div className="text-text-primary">
                            {formatRelativeTime(review.completed_at || review.started_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-text-muted" />
                        <div>
                          <div className="text-sm text-text-muted">Duration</div>
                          <div className="text-text-primary">
                            {formatDuration(duration)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 flex items-center justify-center">
                          <span className="text-xs font-mono text-text-muted">T</span>
                        </div>
                        <div>
                          <div className="text-sm text-text-muted">Tokens Used</div>
                          <div className="text-text-primary">
                            {formatTokens(review.tokens_used)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-text-muted" />
                        <div>
                          <div className="text-sm text-text-muted">Cost</div>
                          <div className="text-text-primary">
                            {formatCost(review.cost)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Review Comment</h3>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Optional comment for approval, required for rejection..."
                      className="w-full p-3 border border-border-default rounded-md bg-bg-primary text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      rows={4}
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      variant="success"
                      onClick={handleApprove}
                      disabled={isApproving || isRejecting}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {isApproving ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleReject}
                      disabled={isApproving || isRejecting || !comment.trim()}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {isRejecting ? 'Rejecting...' : 'Reject'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}