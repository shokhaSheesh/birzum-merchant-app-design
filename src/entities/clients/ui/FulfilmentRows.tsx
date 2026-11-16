import { useI18n } from '@/shared/i18n/useI18n'
import { InfoRow } from '@/shared/ui/InfoList'
import { cardLabel } from '../cardBrand'
import type { ApplicationDetails, PaymentCard } from '../clients'
import { addressExtras } from '../fulfilment'

type Props = { details: Pick<ApplicationDetails, 'fulfilment' | 'cardId'>; cards: PaymentCard[] }

/** Read-only rows for an `InfoList`: how the goods are received, where to, and the paying card. */
export function FulfilmentRows({ details, cards }: Props) {
  const { t } = useI18n()
  const card = cards.find((item) => item.id === details.cardId)

  return (
    <>
      {details.fulfilment && (
        <InfoRow label={t('delivery.method')} value={t(`delivery.${details.fulfilment.method}`)} />
      )}
      {details.fulfilment?.method === 'delivery' && (
        <InfoRow
          label={t('delivery.address')}
          value={[
            details.fulfilment.address,
            ...addressExtras(details.fulfilment, (part, value) =>
              t(`address.${part}.short`, { value }),
            ),
          ].join(', ')}
        />
      )}
      {details.fulfilment?.method === 'delivery' && details.fulfilment.note && (
        <InfoRow label={t('address.note')} value={details.fulfilment.note} />
      )}
      {card && <InfoRow label={t('field.card')} value={cardLabel(card)} />}
    </>
  )
}
