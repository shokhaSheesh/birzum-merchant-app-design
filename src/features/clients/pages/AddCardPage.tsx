import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { clientPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { addCard, sendCardCode, verifyCardCode } from '../api/mockClients'
import { CardForm } from '../components/CardForm'
import { useClient } from '../data/useClients'

/** Add another card to an existing client: card details, then the SMS code. */
export function AddCardPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const client = useClient(id)
  const [card, setCard] = useState<{ number: string; expiry: string } | null>(null)

  if (!client) return <Navigate to={ROUTES.clients} replace />
  const backToClient = () => navigate(clientPath(client.id), { replace: true })

  if (!card) {
    return (
      <CardForm
        onBack={backToClient}
        onCodeSent={(number, expiry) => setCard({ number, expiry })}
      />
    )
  }

  return (
    <OtpScreen
      subtitle={t('card.code.subtitle', { phone: formatPhone(client.phone) })}
      onBack={() => setCard(null)}
      resend={() => sendCardCode(card.number, card.expiry)}
      verify={(code) => verifyCardCode(card.number, code)}
      onVerified={async () => {
        await addCard(client.id, card.number)
        backToClient()
      }}
    />
  )
}
