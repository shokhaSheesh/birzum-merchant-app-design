import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clientAddCardPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import type { Client } from '@/entities/clients/clients'
import { cardBrand } from '../lib/cardBrand'

const tile = 'flex h-28 w-52 shrink-0 snap-start flex-col justify-between rounded-card p-4'

/** The client's cards in a sideways-scrolling row, ending with the add tile. */
export function PaymentCards({ client }: { client: Client }) {
  const { t } = useI18n()

  return (
    <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
      {client.cards.map((card) => (
        <div key={card.id} className={`${tile} bg-tile text-on-tile`}>
          <p className="font-semibold tracking-wider">
            {card.first4} •••• •••• {card.last4}
          </p>
          <div className="flex items-end justify-between text-sm">
            <span className="opacity-60">••/••</span>
            <span className="font-semibold">{cardBrand(card)}</span>
          </div>
        </div>
      ))}
      <Link
        to={clientAddCardPath(client.id)}
        className={`${tile} items-center justify-center! gap-2 border-[1.5px] border-dashed border-navy-400 font-semibold text-brand active:bg-surface`}
      >
        <Plus size={24} />
        {t('client.cards.add')}
      </Link>
    </div>
  )
}
