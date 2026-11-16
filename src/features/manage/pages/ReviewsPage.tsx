import { MessageSquareReply, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { OWN_STORE_ID } from '@/entities/catalog/products'
import { reviewsStore, type Review } from '@/entities/catalog/reviews'
import { ReviewItem, Stars } from '@/entities/catalog/ui/ReviewItem'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ReplySheet } from '../components/ReplySheet'

/** Saves the shop's answer; it shows under the review in the client app. */
function saveReply(review: Review, text: string) {
  reviewsStore.update(review.id, { reply: { text, date: new Date() } })
}

/**
 * What shoppers wrote about the merchant's products, with the average on top. The merchant can
 * answer each review publicly (and edit the answer). A false or abusive review can be deleted,
 * which also takes it out of the client app and the rating.
 */
export function ReviewsPage() {
  const { t } = useI18n()
  const own = reviewsStore.useAll().filter((review) => review.storeId === OWN_STORE_ID)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [replying, setReplying] = useState<Review | null>(null)
  const average = own.reduce((sum, review) => sum + review.rating, 0) / (own.length || 1)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('manage.reviews')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        {own.length === 0 ? (
          <EmptyState title={t('manage.empty.title')} />
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-card border border-line bg-canvas p-4">
              <p className="text-4xl font-bold">{average.toFixed(1)}</p>
              <div className="flex flex-col gap-1">
                <Stars rating={average} size={20} />
                <p className="text-sm text-ink-muted">
                  {t('reviews.summary', { count: String(own.length) })}
                </p>
              </div>
            </div>
            <ul className="rounded-card border border-line bg-canvas px-4">
              {own.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  replyLabel={t('reply.yours')}
                  action={
                    <div className="-my-2 -mr-2 flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => setReplying(review)}
                        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand active:bg-navy-100"
                      >
                        {review.reply ? <Pencil size={16} /> : <MessageSquareReply size={18} />}
                        {review.reply ? t('reply.edit') : t('reply.button')}
                      </button>
                      <button
                        type="button"
                        aria-label={t('common.delete')}
                        onClick={() => setDeleting(review.id)}
                        className="grid size-10 place-items-center rounded-full text-danger active:bg-danger-soft"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  }
                />
              ))}
            </ul>
          </>
        )}
      </div>
      {replying && (
        <ReplySheet
          review={replying}
          onClose={() => setReplying(null)}
          onSend={(text) => {
            saveReply(replying, text)
            toast(t('toast.sent'))
          }}
        />
      )}
      <ConfirmSheet
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={t('reviews.delete.title')}
        message={t('reviews.delete.message')}
        confirmLabel={t('common.delete')}
        onConfirm={() => {
          if (!deleting) return
          reviewsStore.remove(deleting)
          toast(t('toast.deleted'))
        }}
      />
    </div>
  )
}
