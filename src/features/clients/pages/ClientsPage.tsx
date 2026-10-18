import { Plus, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { useLoaded } from '@/shared/lib/useLoaded'
import { Button } from '@/shared/ui/Button'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SearchField } from '@/shared/ui/SearchField'
import { ClientRow } from '@/entities/clients/ui/ClientRow'
import { useListedClients } from '@/entities/clients/useClients'
import { searchClients } from '../lib/searchClients'

export function ClientsPage() {
  const { t } = useI18n()
  const loaded = useLoaded()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const clients = searchClients(useListedClients(), query)

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{t('nav.clients')}</h1>
          <button
            type="button"
            onClick={() => navigate(ROUTES.scanClient)}
            aria-label={t('scan.button')}
            title={t('scan.button')}
            className="ml-auto grid size-10 shrink-0 place-items-center rounded-full border border-line bg-canvas text-brand active:bg-navy-100"
          >
            <ScanLine size={20} />
          </button>
          <Button size="sm" onClick={() => navigate(ROUTES.newClient)}>
            <Plus size={18} />
            {t('clients.create')}
          </Button>
        </div>
        <SearchField
          label={t('clients.search')}
          placeholder={t('clients.search')}
          value={query}
          onChange={setQuery}
        />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-tabbar">
        {!loaded ? (
          <SkeletonRows />
        ) : clients.length === 0 ? (
          <EmptyState title={t('clients.empty.title')} hint={t('clients.empty.hint')} />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-muted">
              {t('clients.count', { count: String(clients.length) })}
            </p>
            <ul className="rounded-card border border-line bg-canvas px-4">
              {clients.map((client) => (
                <ClientRow key={client.id} client={client} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
