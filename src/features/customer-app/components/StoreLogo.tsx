import { Store } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

/** A shop's mark, the same everywhere. A real logo from the admin panel will replace the icon. */
export function StoreLogo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center bg-tile text-on-tile',
        size === 'lg' ? 'size-16 rounded-card' : 'size-11 rounded-control',
      )}
    >
      <Store size={size === 'lg' ? 30 : 22} />
    </span>
  )
}
