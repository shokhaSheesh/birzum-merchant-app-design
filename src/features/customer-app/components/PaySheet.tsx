import { useState } from 'react'
import { payInstallment } from '@/entities/clients/applicationsApi'
import { cardLabel } from '@/entities/clients/cardBrand'
import type { Application, PaymentCard } from '@/entities/clients/clients'
import type { Payment } from '@/entities/clients/payments'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'

type Props = {
  application: Application
  payment: Payment
  cards: PaymentCard[]
  onClose: () => void
}

/** Confirms one installment payment: how much, for which date, from which card. */
export function PaySheet({ application, payment, cards, onClose }: Props) {
  const { t } = useI18n()
  const [cardId, setCardId] = useState<string | null>(
    cards.find((card) => card.id === application.details?.cardId)?.id ?? cards[0]?.id ?? null,
  )
  const [loading, setLoading] = useState(false)

  const pay = async () => {
    setLoading(true)
    await payInstallment(application.id)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t('purchase.pay.title')}>
      <div className="flex flex-col gap-4 pt-1 pb-1">
        <InfoList>
          <InfoRow label={t('purchase.pay.due')} value={formatDate(payment.dueDate)} />
          <InfoRow label={t('purchase.pay.amount')} value={formatSum(payment.amount)} />
        </InfoList>
        <Select
          label={t('field.card')}
          options={cards.map((card) => ({ value: card.id, label: cardLabel(card) }))}
          value={cardId}
          onChange={setCardId}
        />
        <Button
          block
          loading={loading}
          disabled={!cardId}
          className="mt-2"
          onClick={() => void pay()}
        >
          {t('purchase.pay.button', { amount: formatSum(payment.amount) })}
        </Button>
      </div>
    </Sheet>
  )
}
