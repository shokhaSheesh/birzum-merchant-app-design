import humo from '@/shared/assets/cards/humo.png'
import uzcard from '@/shared/assets/cards/uzcard.png'
import { cn } from '@/shared/lib/cn'
import { cardBrand } from '../cardBrand'
import type { PaymentCard } from '../clients'

const logos: Record<string, string> = { Humo: humo, Uzcard: uzcard }

type Props = { card: PaymentCard; className?: string }

/**
 * The card scheme's logo on a small white plate, so it reads on navy tiles and in the dark
 * theme alike. A card of an unknown scheme shows nothing.
 */
export function CardLogo({ card, className }: Props) {
  const brand = cardBrand(card)
  const src = logos[brand]
  if (!src) return null

  return (
    <span
      className={cn(
        'flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-white p-1',
        className,
      )}
    >
      <img src={src} alt={brand} className="max-h-full max-w-full object-contain" />
    </span>
  )
}
