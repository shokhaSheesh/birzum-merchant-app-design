import { Bell, FileClock } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { applicationStatusTone } from '@/entities/clients/applicationStatus'
import { APPLICATION_STATUSES } from '@/entities/clients/clients'
import { useApplications, type ApplicationWithClient } from '@/entities/clients/useApplications'
import { unreadCount } from '@/entities/notifications/notifications'
import { LocationChip } from '@/entities/merchant/ui/LocationChip'
import { useMyLocations } from '@/entities/merchant/useMyLocations'
import { currentUser } from '@/entities/session/user'
import { ROUTES } from '@/shared/config/routes'
import { calendarNames } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { inPeriod, periodDays, type Period } from '@/shared/lib/period'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Avatar } from '@/shared/ui/Avatar'
import { BarChart, type Bar } from '@/shared/ui/BarChart'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PeriodPicker } from '@/shared/ui/PeriodPicker'
import { Section } from '@/shared/ui/Section'
import { StatusBadge } from '@/shared/ui/StatusBadge'

// A day is charted in two-hour blocks across shop hours
const FIRST_HOUR = 8
const HOUR_BLOCKS = 7
const pad = (n: number) => String(n).padStart(2, '0')

/** Counts the period's applications into the bars for its kind: hours, weekdays or dates. */
function toBars(items: ApplicationWithClient[], period: Period, weekdays: string[]): Bar[] {
  const { first, last } = periodDays(period)

  if (period.unit === 'day') {
    return Array.from({ length: HOUR_BLOCKS }, (_, i) => {
      const from = FIRST_HOUR + i * 2
      return {
        label: pad(from),
        name: `${pad(from)}:00–${pad(from + 2)}:00`,
        value: items.filter(({ application }) => {
          const block = Math.floor((application.date.getHours() - FIRST_HOUR) / 2)
          return Math.min(HOUR_BLOCKS - 1, Math.max(0, block)) === i
        }).length,
      }
    })
  }

  const count = period.unit === 'week' ? 7 : last.getDate()
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i)
    const dayOfMonth = day.getDate()
    return {
      label:
        period.unit === 'week'
          ? weekdays[i]
          : dayOfMonth === 1 || dayOfMonth % 5 === 0
            ? String(dayOfMonth)
            : '',
      name: formatDate(day),
      value: items.filter(({ application }) => formatDate(application.date) === formatDate(day))
        .length,
    }
  })
}

/** Start screen: the chosen day, week or month in numbers. */
export function HomePage() {
  const { t, tl, lang } = useI18n()
  const myLocations = useMyLocations()
  const user = currentUser
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>(() => ({ unit: 'week', anchor: new Date() }))

  const [locationId, setLocationId] = useState<string | null>(null)

  const all = useApplications().filter(
    ({ application }) => locationId === null || application.locationId === locationId,
  )
  const pendingOrders = all.filter(({ application }) => application.status === 'pending').length
  const items = all.filter(({ application }) => inPeriod(application.date, period))
  const total = items.reduce((sum, { application }) => sum + application.installmentTotal, 0)
  const clientCount = new Set(items.map(({ client }) => client.id)).size
  const formatCount = (count: number) => t('home.chart.tip', { count: String(count) })

  return (
    <div className="flex min-h-full flex-col gap-6 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-tabbar">
      <header className="flex items-center gap-3">
        <Avatar initials={`${user.firstName[0]}${user.lastName[0]}`} photoUrl={user.photoUrl} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-lg leading-tight font-bold">
            {t('home.greeting', { name: user.firstName })}
          </p>
          <p className="truncate text-sm text-ink-muted">
            {user.store}
            {myLocations.length === 1 && ` · ${tl(myLocations[0].name)}`}
            {myLocations.length > 1 &&
              ` · ${t('home.locations', { count: String(myLocations.length) })}`}
          </p>
        </div>
        <Link
          to={ROUTES.notifications}
          aria-label={t('notifications.title')}
          className="relative grid size-11 shrink-0 place-items-center rounded-full bg-surface text-brand active:bg-navy-100"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-green-500 ring-2 ring-surface" />
          )}
        </Link>
      </header>

      {pendingOrders > 0 && (
        <ActionCard
          icon={FileClock}
          title={t('home.pending.title')}
          description={t('home.pending.count', { count: String(pendingOrders) })}
          onClick={() => navigate(`${ROUTES.applications}?status=pending`)}
        />
      )}

      {myLocations.length > 1 && (
        <div className="-mb-2 flex">
          <LocationChip value={locationId} onChange={setLocationId} />
        </div>
      )}

      <PeriodPicker value={period} onChange={setPeriod} />

      <div className="flex flex-col">
        <p className="text-sm text-ink-muted">{t('home.total')}</p>
        <p className="text-3xl font-bold">{formatSum(total)}</p>
        <p className="text-sm text-ink-muted">
          {t('home.summary', {
            applications: String(items.length),
            clients: String(clientCount),
          })}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState title={t('home.empty.title')} hint={t('home.empty.hint')} />
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-card bg-surface p-4">
            <h2 className="font-semibold">{t('home.chart.title')}</h2>
            <BarChart
              label={t('home.chart.title')}
              bars={toBars(items, period, calendarNames[lang].weekdays)}
              formatValue={formatCount}
              hint={t('home.chart.hint')}
            />
          </div>

          <Section title={t('home.statuses')}>
            <ul className="rounded-card bg-surface px-4">
              {APPLICATION_STATUSES.map((status) => (
                <li
                  key={status}
                  className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"
                >
                  <StatusBadge tone={applicationStatusTone[status]}>
                    {t(`application.status.${status}`)}
                  </StatusBadge>
                  <span className="font-bold">
                    {items.filter(({ application }) => application.status === status).length}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}
    </div>
  )
}
