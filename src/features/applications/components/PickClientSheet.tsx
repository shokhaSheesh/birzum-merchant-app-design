import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initials, shortName } from '@/entities/clients/clientName'
import { useListedClients } from '@/entities/clients/useClients'
import { clientContractPath, clientPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SearchField } from '@/shared/ui/SearchField'
import { Sheet } from '@/shared/ui/Sheet'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/**
 * First step of a new ariza started from the Arizalar tab: whose is it. A client with a
 * limit goes straight to the contract form; one without is opened to calculate it first.
 */
export function PickClientSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase().replace(/\s/g, '')
  const clients = useListedClients().filter(
    (client) =>
      needle === '' ||
      shortName(client).toLowerCase().replace(/\s/g, '').includes(needle) ||
      client.phone.includes(needle) ||
      client.pinfl.includes(needle) ||
      client.passport.toLowerCase().includes(needle),
  )

  return (
    <Sheet open onClose={onClose} title={t('applications.create.title')}>
      <div className="flex flex-col gap-3 pt-1 pb-1">
        <SearchField
          label={t('clients.search')}
          placeholder={t('clients.search')}
          value={query}
          onChange={setQuery}
        />
        {clients.length === 0 ? (
          <EmptyState title={t('clients.empty.title')} />
        ) : (
          <ul className="rounded-card border border-line bg-canvas px-4">
            {clients.map((client) => (
              <li key={client.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      client.limits ? clientContractPath(client.id, 12) : clientPath(client.id),
                    )
                  }
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <Avatar initials={initials(client)} photoUrl={client.photoUrl} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate font-semibold">{shortName(client)}</p>
                    <p className="text-sm text-ink-muted">{formatPhone(client.phone)}</p>
                  </div>
                  {!client.limits && (
                    <StatusBadge tone="warning">{t('applications.create.noLimit')}</StatusBadge>
                  )}
                  <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  )
}
