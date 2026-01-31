'use client'

import { useState } from 'react'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { ReviewList } from '@/components/review/ReviewList'
import { ReviewModal } from '@/components/review/ReviewModal'
import { AgentRun } from '@/types'

export default function ReviewPage() {
  const { reviews, isLoading, error, approveReview, rejectReview, isApproving, isRejecting } = useReviewQueue()
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Review Queue</h1>
        <p className="text-text-secondary mt-1">
          Review and approve agent outputs before they move to production
        </p>
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