import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { shortName } from '@/entities/clients/clientName'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/entities/clients/clients'
import { ApplicationRow } from '@/entities/clients/ui/ApplicationRow'
import { useApplications } from '@/entities/clients/useApplications'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FilterChips } from '@/shared/ui/FilterChips'
import { SearchField } from '@/shared/ui/SearchField'
import { searchApplications } from '../lib/searchApplications'

type Filter = 'all' | ApplicationStatus

export function ApplicationsPage() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const all = useApplications()
  const items = searchApplications(all, query).filter(
    ({ application }) => filter === 'all' || application.status === filter,
  )

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3">
        <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('nav.applications')}</h1>
        <SearchField
          label={t('applications.search')}
          placeholder={t('applications.search')}
          value={query}
          onChange={setQuery}
        />
        <FilterChips
          label={t('applications.filter.label')}
          options={[
            { value: 'all', label: t('applications.filter.all') },
            ...APPLICATION_STATUSES.map((status) => ({
              value: status,
              label: t(`application.status.${status}`),
            })),
          ]}
          value={filter}
          onChange={setFilter}
        />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3">
        {items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={t('applications.empty.title')}
            hint={t('applications.empty.hint')}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-muted">
              {t('applications.count', { count: String(items.length) })}
            </p>
            <ul className="rounded-card bg-surface px-4">
              {items.map(({ application, client }) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  clientName={shortName(client)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
