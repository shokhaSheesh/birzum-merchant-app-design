import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { formatPhone } from '@/shared/lib/phone'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { addCard, sendCardCode, verifyCardCode } from '../cardsApi'
import type { Client } from '../clients'
import { CardForm } from './CardForm'

type Props = {
  client: Client
  onDone: () => void
  /** True in the client app, where the shopper adds their own card. */
  own?: boolean
}

/** Adds a card to a client: card details, then the SMS code. Used by both apps. */
export function AddCardFlow({ client, onDone, own }: Props) {
  const { t } = useI18n()
  const [card, setCard] = useState<{ number: string; expiry: string } | null>(null)

  if (!card) {
    return (
      <CardForm
        own={own}
        onBack={onDone}
        onCodeSent={(number, expiry) => setCard({ number, expiry })}
      />
    )
  }

  return (
    <OtpScreen
      subtitle={t(own ? 'card.code.subtitle.own' : 'card.code.subtitle', {
        phone: formatPhone(client.phone),
      })}
      onBack={() => setCard(null)}
      resend={() => sendCardCode(card.number, card.expiry)}
      verify={(code) => verifyCardCode(card.number, code)}
      onVerified={async () => {
        await addCard(client.id, card.number)
        toast(t('toast.saved'))
        onDone()
      }}
    />
  )
}
