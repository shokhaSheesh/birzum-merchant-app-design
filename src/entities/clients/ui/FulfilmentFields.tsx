import { Store, Truck } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { Select } from '@/shared/ui/Select'
import { TextField } from '@/shared/ui/TextField'
import { cardLabel } from '../cardBrand'
import { DELIVERY_METHODS, type Fulfilment, type PaymentCard } from '../clients'

const icons = { pickup: Store, delivery: Truck }

type CardProps = {
  cards: PaymentCard[]
  cardId: string | null
  onCard: (cardId: string) => void
  showErrors: boolean
}

/** Which of the client's cards the monthly payments are taken from. */
export function CardSelect({ cards, cardId, onCard, showErrors }: CardProps) {
  const { t } = useI18n()

  return (
    <Select
      label={t('field.card')}
      options={cards.map((card) => ({ value: card.id, label: cardLabel(card) }))}
      value={cardId}
      onChange={onCard}
      hint={t('card.hint')}
      error={showErrors && !cardId ? t('error.required') : undefined}
    />
  )
}

type Props = {
  fulfilment: Fulfilment
  onFulfilment: (value: Fulfilment) => void
  /** Set after a failed submit. */
  showErrors: boolean
  /** Where the goods can be collected. With two or more, pickup asks which one. */
  points?: { id: string; name: string }[]
  pointId?: string | null
  onPoint?: (pointId: string) => void
}

/**
 * How the goods are received: pickup (and from which filial) or delivery to an address.
 * The same block in the merchant's contract form and in the shopper's checkout.
 */
export function FulfilmentFields({
  fulfilment,
  onFulfilment,
  showErrors,
  points = [],
  pointId = null,
  onPoint,
}: Props) {
  const { t } = useI18n()

  return (
    <>
      <ChoiceGrid
        label={t('delivery.method')}
        columns={2}
        options={DELIVERY_METHODS.map((value) => ({
          value,
          label: t(`delivery.${value}`),
          icon: icons[value],
        }))}
        value={fulfilment.method}
        onChange={(method) => onFulfilment({ ...fulfilment, method })}
      />
      {fulfilment.method === 'pickup' && points.length > 1 && onPoint && (
        <Select
          label={t('delivery.point')}
          options={points.map((point) => ({ value: point.id, label: point.name }))}
          value={pointId}
          onChange={onPoint}
          error={showErrors && !pointId ? t('error.required') : undefined}
        />
      )}
      {fulfilment.method === 'delivery' && (
        <TextField
          label={t('delivery.address')}
          autoComplete="street-address"
          value={fulfilment.address}
          onChange={(e) => onFulfilment({ ...fulfilment, address: e.target.value })}
          error={showErrors && fulfilment.address.trim() === '' ? t('error.required') : undefined}
        />
      )}
    </>
  )
}
