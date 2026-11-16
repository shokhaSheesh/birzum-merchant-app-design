import { Star } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  /** The shopper's rating once given; until then the stars are buttons. */
  rating?: number
  onRate: (rating: number) => void
}

/**
 * Five stars under a bought product, right in the purchase's «Mahsulotlar» tab. Tapping one
 * opens the review with that rating; once sent, the stars just show it.
 */
export function ProductReviewStars({ rating, onRate }: Props) {
  const { t } = useI18n()
  if (rating) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex gap-0.5" aria-label={`${rating} / 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={18}
              aria-hidden
              className={cn(n <= rating ? 'fill-warning text-warning' : 'text-navy-200')}
            />
          ))}
        </span>
        <span className="text-sm text-ink-muted">{t('feedback.yours')}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-ink-muted">{t('feedback.rate')}</span>
      <span className="-my-1.5 flex" role="group" aria-label={t('feedback.rate')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} / 5`}
            onClick={() => onRate(n)}
            className="grid size-9 place-items-center rounded-full active:bg-navy-100"
          >
            <Star size={24} className="text-navy-200" />
          </button>
        ))}
      </span>
    </div>
  )
}
