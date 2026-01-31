'use client'

import { useState } from 'react'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { ReviewList } from '@/components/review/ReviewList'
import { ReviewModal } from '@/components/review/ReviewModal'
import { Button } from '@/components/ui/Button'
import { AgentRun } from '@/types'
import { CheckCircle } from 'lucide-react'

export default function ReviewPage() {
  const { reviews, isLoading, error, approveReview, rejectReview, bulkApprove, isApproving, isRejecting, isBulkApproving } = useReviewQueue()
  const [selectedReview, setSelectedReview] = useState<AgentRun | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = (review: AgentRun) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedReview(null)
  }

  const handleApprove = (id: string, comment?: string) => {
    approveReview({ id, comment })
  }

  const handleReject = (id: string, comment: string) => {
    rejectReview({ id, comment })
  }

  const handleBulkApprove = () => {
    const ids = reviews.map(r => r.id)
    if (ids.length > 0) {
      bulkApprove(ids)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Review Queue</h1>
          <p className="text-text-secondary mt-1">
            Review and approve agent outputs before they move to production
          </p>
        </div>
        {reviews.length > 0 && (
          <Button 
            onClick={handleBulkApprove} 
            disabled={isBulkApproving}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isBulkApproving ? 'Approving...' : `Approve All (${reviews.length})`}
          </Button>
        )}
      </div>

      <ReviewList
        reviews={reviews}
        isLoading={isLoading}
        error={error ?? undefined}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />

      <ReviewModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />
    </div>
  )
}