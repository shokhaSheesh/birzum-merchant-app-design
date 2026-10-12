import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import type { Client } from '../data/clients'

const initials = (fullName: string) =>
  fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

/** "AB1234567" -> "AB 1234567" */
const formatPassport = (passport: string) => `${passport.slice(0, 2)} ${passport.slice(2)}`

export function ClientRow({ client }: { client: Client }) {
  const { t } = useI18n()

  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-200 text-sm font-bold text-navy-900">
        {initials(client.fullName)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate font-semibold">{client.fullName}</p>
        <p className="text-sm text-ink-muted">{formatPhone(client.phone)}</p>
        <p className="truncate text-sm text-ink-muted">
          {formatPassport(client.passport)} · {t('clients.pinfl')} {client.pinfl}
        </p>
      </div>
    </li>
  )
}
