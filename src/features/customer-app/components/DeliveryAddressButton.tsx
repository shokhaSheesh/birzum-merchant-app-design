import { ChevronRight, MapPin } from 'lucide-react'
import type { Fulfilment } from '@/entities/clients/clients'
import { addressExtras } from '@/entities/clients/fulfilment'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  fulfilment: Fulfilment
  /** Set after a failed submit with no address. */
  error: boolean
  onClick: () => void
}

/**
 * Checkout's delivery address: one big «Manzilni koʻrsatish» button until it is given, then the
 * address itself as a card. Both open the delivery address page.
 */
export function DeliveryAddressButton({ fulfilment, error, onClick }: Props) {
  const { t } = useI18n()
  const address = fulfilment.address.trim()

  if (!address) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex h-13 items-center justify-center gap-2 rounded-control bg-green-200 font-semibold active:opacity-80',
            error && 'ring-2 ring-danger',
          )}
        >
          <MapPin size={20} />
          {t('address.choose')}
        </button>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {t('address.required')}
          </p>
        )}
      </div>
    )
  }

  const extras = addressExtras(fulfilment, (part, value) => t(`address.${part}.short`, { value }))
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4 text-left active:bg-navy-100"
    >
      <MapPin size={22} className="shrink-0 text-brand" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm text-ink-muted">{t('delivery.address')}</p>
        <p className="font-semibold break-words">{address}</p>
        {extras.length > 0 && <p className="text-sm text-ink-muted">{extras.join(', ')}</p>}
        {fulfilment.note && <p className="truncate text-sm text-ink-muted">{fulfilment.note}</p>}
      </div>
      <span className="flex shrink-0 items-center text-sm font-semibold text-brand">
        {t('address.change')}
        <ChevronRight size={18} />
      </span>
    </button>
  )
}
