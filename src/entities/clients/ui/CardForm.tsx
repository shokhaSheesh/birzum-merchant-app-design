import { CreditCard } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { isCardExpiry, isCardNumber } from '@/shared/lib/card'
import { Button } from '@/shared/ui/Button'
import { CardExpiryField, CardNumberField } from '@/shared/ui/CardFields'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { sendCardCode } from '../cardsApi'

type Props = {
  progress?: { step: number; total: number }
  onBack: () => void
  /** True when the card's owner is typing it in themselves, in the client app. */
  own?: boolean
  /** Called once the SMS code has been sent for this card. */
  onCodeSent: (cardNumber: string, cardExpiry: string) => void
}

/** Card number and expiry. Used when creating a client and when adding another card. */
export function CardForm({ progress, onBack, onCodeSent, own }: Props) {
  const { t } = useI18n()
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setSubmitted(true)
    if (!isCardNumber(cardNumber) || !isCardExpiry(cardExpiry)) return
    setLoading(true)
    await sendCardCode(cardNumber, cardExpiry)
    onCodeSent(cardNumber, cardExpiry)
  }

  return (
    <FormScreen
      onSubmit={() => void submit()}
      onBack={onBack}
      progress={progress}
      footer={
        <Button type="submit" block loading={loading}>
          {t('auth.confirm.send')}
        </Button>
      }
    >
      <IconBadge icon={CreditCard} />
      <ScreenIntro
        title={t(own ? 'card.title.own' : 'card.title')}
        subtitle={t(own ? 'card.subtitle.own' : 'card.subtitle')}
      />
      <div className="flex flex-col gap-4">
        <CardNumberField
          label={t('field.cardNumber')}
          value={cardNumber}
          onChange={setCardNumber}
          error={submitted && !isCardNumber(cardNumber) ? t('error.cardNumber') : undefined}
        />
        <CardExpiryField
          label={t('field.cardExpiry')}
          value={cardExpiry}
          onChange={setCardExpiry}
          error={submitted && !isCardExpiry(cardExpiry) ? t('error.cardExpiry') : undefined}
        />
      </div>
    </FormScreen>
  )
}
