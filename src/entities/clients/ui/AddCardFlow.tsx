import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { addCard, sendCardCode, verifyCardCode } from '../cardsApi'
import type { Client } from '../clients'
import { CardForm } from './CardForm'

type Props = { client: Client; onDone: () => void }

/** Adds a card to a client: card details, then the SMS code. Used by both apps. */
export function AddCardFlow({ client, onDone }: Props) {
  const { t } = useI18n()
  const [card, setCard] = useState<{ number: string; expiry: string } | null>(null)

  if (!card) {
    return <CardForm onBack={onDone} onCodeSent={(number, expiry) => setCard({ number, expiry })} />
  }

  return (
    <OtpScreen
      subtitle={t('card.code.subtitle', { phone: formatPhone(client.phone) })}
      onBack={() => setCard(null)}
      resend={() => sendCardCode(card.number, card.expiry)}
      verify={(code) => verifyCardCode(card.number, code)}
      onVerified={async () => {
        await addCard(client.id, card.number)
        onDone()
      }}
    />
  )
}
