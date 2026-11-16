import { Star } from 'lucide-react'
import { ratingOf, useProductReviews } from '@/entities/catalog/reviews'

/** A product card's rating: a star, the average and, in brackets, how many reviews. Hidden with none. */
export function ProductRating({ productId }: { productId: string }) {
  const { average, count } = ratingOf(useProductReviews(productId))
  if (count === 0) return null
  return (
    <p className="flex items-center gap-1 text-sm">
      <Star size={14} className="fill-warning text-warning" aria-hidden />
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-ink-muted">({count})</span>
    </p>
  )
}
