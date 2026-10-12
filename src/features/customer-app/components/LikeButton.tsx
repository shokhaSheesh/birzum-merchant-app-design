import { Heart } from 'lucide-react'
import { toggleFavorite, useFavorites } from '@/entities/favorites/favoritesStore'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = { productId: string; className?: string }

/** The heart that saves a product to Sevimlilar. Filled red once liked. */
export function LikeButton({ productId, className }: Props) {
  const { t } = useI18n()
  const liked = useFavorites().includes(productId)

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={t(liked ? 'product.unlike' : 'product.like')}
      onClick={() => toggleFavorite(productId)}
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full',
        liked ? 'text-danger' : 'text-brand',
        className,
      )}
    >
      <Heart size={22} className={cn(liked && 'fill-current')} />
    </button>
  )
}
