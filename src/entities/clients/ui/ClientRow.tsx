import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clientPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPassport } from '@/shared/lib/passport'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import type { Client } from '../clients'
import { initials, shortName } from '../clientName'

export function ClientRow({ client }: { client: Client }) {
  const { t } = useI18n()

  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={clientPath(client.id)} className="flex items-center gap-3 py-3">
        <Avatar initials={initials(client)} photoUrl={client.photoUrl} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate font-semibold">{shortName(client)}</p>
          <p className="text-sm text-ink-muted">{formatPhone(client.phone)}</p>
          <p className="truncate text-sm text-ink-muted">
            {formatPassport(client.passport)} · {t('clients.pinfl')} {client.pinfl}
          </p>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </Link>
    </li>
  )
}
