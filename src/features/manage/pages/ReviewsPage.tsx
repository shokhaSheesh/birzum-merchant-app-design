import { Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { OWN_STORE_ID } from '@/entities/catalog/products'
import { reviewsStore } from '@/entities/catalog/reviews'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { Avatar } from '@/shared/ui/Avatar'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'

function Stars({ rating, size }: { rating: number; size: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={cn(n <= Math.round(rating) ? 'fill-warning text-warning' : 'text-navy-200')}
        />
      ))}
    </span>
  )
}

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
                <li
                  key={review.id}
                  className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={review.author
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate font-semibold">{review.author}</p>
                      <Stars rating={review.rating} size={14} />
                    </div>
                    <p className="shrink-0 text-sm text-ink-muted">{formatDate(review.date)}</p>
                  </div>
                  <p>{review.text}</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm text-ink-muted">{review.productName}</p>
                    <button
                      type="button"
                      aria-label={t('common.delete')}
                      onClick={() => setDeleting(review.id)}
                      className="-my-2 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-danger active:bg-danger-soft"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
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
