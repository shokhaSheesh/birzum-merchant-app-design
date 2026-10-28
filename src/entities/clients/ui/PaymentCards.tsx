import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { cardHolder, cardLabel } from '../cardBrand'
import { removeCard } from '../cardsApi'
import type { Client, PaymentCard } from '../clients'
import { CardLogo } from './CardLogo'

const tile = 'flex h-28 w-52 shrink-0 snap-start flex-col justify-between rounded-card p-4'

type Props = {
  client: Client
  /** Where the "add" tile leads. */
  addTo: string
}

/**
 * The client's cards in a sideways-scrolling row, ending with the add tile. A card can be
 * removed while another one remains: installments always need a card to be paid from.
 */
export function PaymentCards({ client, addTo }: Props) {
  const { t } = useI18n()
  const [removing, setRemoving] = useState<PaymentCard | null>(null)

  return (
    <>
      <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
        {client.cards.map((card) => (
          <div key={card.id} className={`${tile} relative bg-tile text-on-tile`}>
            <p className="font-semibold tracking-wider">
              {card.first4} •••• •••• {card.last4}
            </p>
            <div className="flex items-end justify-between text-sm">
              <span className="opacity-60">{cardHolder(card) || '••/••'}</span>
              <CardLogo card={card} />
            </div>
            {client.cards.length > 1 && (
              <button
                type="button"
                aria-label={t('client.cards.remove')}
                onClick={() => setRemoving(card)}
                className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full opacity-70 active:bg-white/15"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <Link
          to={addTo}
          className={`${tile} items-center justify-center! gap-2 border-[1.5px] border-dashed border-navy-400 font-semibold text-brand active:bg-navy-100`}
        >
          <Plus size={24} />
          {t('client.cards.add')}
        </Link>
      </div>
      <ConfirmSheet
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={t('client.cards.remove.title')}
        message={removing ? cardLabel(removing) : ''}
        confirmLabel={t('common.delete')}
        onConfirm={() => {
          if (!removing) return
          removeCard(client.id, removing.id)
          toast(t('toast.deleted'))
        }}
      />
    </>
  )
}
