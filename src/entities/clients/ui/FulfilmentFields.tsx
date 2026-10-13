import { useI18n } from '@/shared/i18n/useI18n'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { Select } from '@/shared/ui/Select'
import { TextField } from '@/shared/ui/TextField'
import { cardLabel } from '../cardBrand'
import { DELIVERY_METHODS, type Fulfilment, type PaymentCard } from '../clients'

type Props = {
  fulfilment: Fulfilment
  onFulfilment: (value: Fulfilment) => void
  cards: PaymentCard[]
  cardId: string | null
  onCard: (cardId: string) => void
  /** Set after a failed submit. */
  showErrors: boolean
}

/**
 * How the goods are received and which card pays. The same block in the merchant's
 * contract form and in the shopper's checkout.
 */
export function FulfilmentFields({
  fulfilment,
  onFulfilment,
  cards,
  cardId,
  onCard,
  showErrors,
}: Props) {
  const { t } = useI18n()

  return (
    <>
      <ChoiceGrid
        label={t('delivery.method')}
        columns={2}
        options={DELIVERY_METHODS.map((value) => ({ value, label: t(`delivery.${value}`) }))}
        value={fulfilment.method}
        onChange={(method) => onFulfilment({ ...fulfilment, method })}
      />
      {fulfilment.method === 'delivery' && (
        <TextField
          label={t('delivery.address')}
          autoComplete="street-address"
          value={fulfilment.address}
          onChange={(e) => onFulfilment({ ...fulfilment, address: e.target.value })}
          error={showErrors && fulfilment.address.trim() === '' ? t('error.required') : undefined}
        />
      )}
      <Select
        label={t('field.card')}
        options={cards.map((card) => ({ value: card.id, label: cardLabel(card) }))}
        value={cardId}
        onChange={onCard}
        hint={t('card.hint')}
        error={showErrors && !cardId ? t('error.required') : undefined}
      />
    </>
  )
}
