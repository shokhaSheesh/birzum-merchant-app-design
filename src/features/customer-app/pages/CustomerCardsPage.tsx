import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cardBrand, cardLabel } from '@/entities/clients/cardBrand'
import { removeCard } from '@/entities/clients/cardsApi'
import type { PaymentCard } from '@/entities/clients/clients'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * The shopper's cards, one per row, with the add button at the top right. A card can be
 * removed while another one remains: installments always need a card to be paid from.
 */
export function CustomerCardsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const customer = useCustomer()
  const [removing, setRemoving] = useState<PaymentCard | null>(null)
  const cards = customer?.cards ?? []

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={t('client.cards')}
        end={
          <Button size="sm" className="mr-2" onClick={() => navigate(ROUTES.customerAddCard)}>
            <Plus size={18} />
            {t('clients.create')}
          </Button>
        }
      />
      <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-6">
        {cards.map((card) => (
          <li
            key={card.id}
            className="flex items-center gap-3 rounded-card bg-tile p-4 text-on-tile"
          >
            <CreditCard size={24} className="shrink-0 opacity-75" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="font-semibold tracking-wider">
                {card.first4} •••• •••• {card.last4}
              </p>
              <p className="text-sm opacity-75">{cardBrand(card)}</p>
            </div>
            {cards.length > 1 && (
              <button
                type="button"
                aria-label={t('client.cards.remove')}
                onClick={() => setRemoving(card)}
                className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full opacity-80 active:bg-white/15"
              >
                <Trash2 size={20} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <ConfirmSheet
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={t('client.cards.remove.title')}
        message={removing ? cardLabel(removing) : ''}
        confirmLabel={t('common.delete')}
        onConfirm={() => customer && removing && removeCard(customer.id, removing.id)}
      />
    </div>
  )
}
