import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { Avatar } from '@/shared/ui/Avatar'
import type { Review } from '../reviews'

export function Stars({ rating, size }: { rating: number; size: number }) {
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

type Props = {
  review: Review
  /** Controls at the bottom right, e.g. the merchant's reply and delete buttons. */
  action?: ReactNode
  /** Hide the product name, e.g. on the product's own reviews page. */
  hideProduct?: boolean
  /** Who answered, shown over the reply: the shop's name, or «Sizning javobingiz». */
  replyLabel?: string
}

/** One shopper review as a list row: who, stars, date, the text, the product and the shop's reply. */
export function ReviewItem({ review, action, hideProduct, replyLabel }: Props) {
  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0">
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
      {review.text && <p>{review.text}</p>}
      {review.reply && (
        <div className="flex flex-col gap-1 rounded-control bg-surface px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-semibold">{replyLabel}</p>
            <p className="shrink-0 text-xs text-ink-muted">{formatDate(review.reply.date)}</p>
          </div>
          <p className="text-sm">{review.reply.text}</p>
        </div>
      )}
      {(!hideProduct || action) && (
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-ink-muted">
            {!hideProduct && review.productName}
          </p>
          {action}
        </div>
      )}
    </li>
  )
}
