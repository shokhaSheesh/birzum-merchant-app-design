import { Navigate, useNavigate } from 'react-router-dom'
import { AddCardFlow } from '@/entities/clients/ui/AddCardFlow'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'

/** The shopper adds another card of their own. */
export function CustomerAddCardPage() {
  const navigate = useNavigate()
  const customer = useCustomer()

  if (!customer) return <Navigate to={ROUTES.customerApp} replace />
  return (
    <AddCardFlow
      client={customer}
      onDone={() => navigate(ROUTES.customerCards, { replace: true })}
    />
  )
}
