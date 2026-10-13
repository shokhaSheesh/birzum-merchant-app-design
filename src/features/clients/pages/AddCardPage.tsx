import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AddCardFlow } from '@/entities/clients/ui/AddCardFlow'
import { useClient } from '@/entities/clients/useClients'
import { clientPath, ROUTES } from '@/shared/config/routes'

/** Add another card to an existing client. */
export function AddCardPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const client = useClient(id)

  if (!client) return <Navigate to={ROUTES.clients} replace />
  return (
    <AddCardFlow
      client={client}
      onDone={() => navigate(clientPath(client.id), { replace: true })}
    />
  )
}
