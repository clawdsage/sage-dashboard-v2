'use client'

import { AgentRun } from '@/types'
import { ReviewCard } from './ReviewCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle } from 'lucide-react'

interface ReviewListProps {
  reviews: AgentRun[]
  isLoading?: boolean
  error?: Error
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, comment: string) => void
  isApproving: boolean
  isRejecting: boolean
}

export function ReviewList({
  reviews,
  isLoading,
  error,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Review Queue</h2>
          <div className="h-6 w-8 bg-bg-tertiary rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-bg-tertiary rounded mb-2"></div>
              <div className="h-3 bg-bg-tertiary rounded mb-4"></div>
              <div className="h-20 bg-bg-tertiary rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-accent-red mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Failed to load reviews</h3>
        <p className="text-text-secondary mb-4">{error.message}</p>
      </Card>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-green-500 mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No pending reviews</h3>
        <p className="text-text-secondary">All caught up! 🎉</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Review Queue</h2>
        <Badge variant="warning" className="text-xs">
          {reviews.length} pending
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onApprove={onApprove}
            onReject={onReject}
            isApproving={isApproving}
            isRejecting={isRejecting}
          />
        ))}
      </div>
    </div>
  )
}