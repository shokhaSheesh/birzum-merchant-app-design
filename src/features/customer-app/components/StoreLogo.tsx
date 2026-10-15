import { Store as StoreIcon } from 'lucide-react'
import type { Store } from '@/entities/catalog/products'
import { cn } from '@/shared/lib/cn'

type Props = { store?: Store; size?: 'sm' | 'md' | 'lg' }

/** A shop's logo, the same everywhere. A shop without one shows the shop icon on navy. */
export function StoreLogo({ store, size = 'md' }: Props) {
  const box =
    size === 'lg'
      ? 'size-16 rounded-card'
      : size === 'sm'
        ? 'size-7 rounded-lg'
        : 'size-11 rounded-control'
  if (store?.logo) {
    return (
      <img
        src={store.logo}
        alt=""
        className={cn('shrink-0 border border-line bg-white object-cover', box)}
      />
    )
  }
  return (
    <span className={cn('grid shrink-0 place-items-center bg-tile text-on-tile', box)}>
      <StoreIcon size={size === 'lg' ? 30 : size === 'sm' ? 16 : 22} />
    </span>
  )
}
