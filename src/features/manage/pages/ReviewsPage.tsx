import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { OWN_STORE_ID } from '@/entities/catalog/products'
import { reviewsStore } from '@/entities/catalog/reviews'
import { ReviewItem, Stars } from '@/entities/catalog/ui/ReviewItem'
import { useI18n } from '@/shared/i18n/useI18n'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * What shoppers wrote about the merchant's shop, with the average on top. A false or abusive
 * review can be deleted, which also takes it out of the client app and the rating.
 */
export function ReviewsPage() {
  const { t } = useI18n()
  const own = reviewsStore.useAll().filter((review) => review.storeId === OWN_STORE_ID)
  const [deleting, setDeleting] = useState<string | null>(null)
  const average = own.reduce((sum, review) => sum + review.rating, 0) / (own.length || 1)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('manage.reviews')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        {own.length === 0 ? (
          <EmptyState title={t('manage.empty.title')} />
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-card bg-surface p-4">
              <p className="text-4xl font-bold">{average.toFixed(1)}</p>
              <div className="flex flex-col gap-1">
                <Stars rating={average} size={20} />
                <p className="text-sm text-ink-muted">
                  {t('reviews.summary', { count: String(own.length) })}
                </p>
              </div>
            </div>
            <ul className="rounded-card bg-surface px-4">
              {own.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  action={
                    <button
                      type="button"
                      aria-label={t('common.delete')}
                      onClick={() => setDeleting(review.id)}
                      className="-my-2 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-danger active:bg-danger-soft"
                    >
                      <Trash2 size={18} />
                    </button>
                  }
                />
              ))}
            </ul>
          </>
        )}
      </div>
      <ConfirmSheet
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={t('reviews.delete.title')}
        message={t('reviews.delete.message')}
        confirmLabel={t('common.delete')}
        onConfirm={() => deleting && reviewsStore.remove(deleting)}
      />
    </div>
  )
}
