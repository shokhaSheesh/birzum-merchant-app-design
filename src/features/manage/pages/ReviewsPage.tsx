import { useState } from 'react'
import type { Review } from '@/entities/catalog/reviews'
import { ReviewItem, Stars } from '@/entities/catalog/ui/ReviewItem'
import { loadReviews } from '@/entities/merchant/merchantApi'
import { toastError } from '@/shared/api/client'
import { useRemote } from '@/shared/api/useRemote'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SkeletonRows } from '@/shared/ui/Skeleton'

/**
 * What shoppers wrote about the merchant's shop, with the average on top. Read only: the server
 * has no way to delete or answer a review yet.
 */
export function ReviewsPage() {
  const { t } = useI18n()
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [average, setAverage] = useState(0)
  const [page, setPage] = useState(1)
  const [more, setMore] = useState(false)

  const { loading, failed, reload } = useRemote(async () => {
    const first = await loadReviews(1)
    setReviews(first.items)
    setTotal(first.total)
    setAverage(first.average)
    setPage(1)
  })

  const loadMore = async () => {
    setMore(true)
    try {
      const next = await loadReviews(page + 1)
      setReviews((list) => [...list, ...next.items])
      setPage(page + 1)
    } catch (error) {
      toastError(error)
    } finally {
      setMore(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('manage.reviews')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        {loading ? (
          <SkeletonRows />
        ) : failed ? (
          <ErrorState kind={failed} onAction={reload} />
        ) : reviews.length === 0 ? (
          <EmptyState title={t('manage.empty.title')} />
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-card border border-line bg-canvas p-4">
              <p className="text-4xl font-bold">{average.toFixed(1)}</p>
              <div className="flex flex-col gap-1">
                <Stars rating={average} size={20} />
                <p className="text-sm text-ink-muted">
                  {t('reviews.summary', { count: String(total) })}
                </p>
              </div>
            </div>
            <ul className="rounded-card border border-line bg-canvas px-4">
              {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
            {reviews.length < total && (
              <Button variant="secondary" block loading={more} onClick={loadMore}>
                {t('reviews.more')}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
