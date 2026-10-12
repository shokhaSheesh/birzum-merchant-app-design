import { Bell, Calculator, FileText, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shortName } from '@/entities/clients/clientName'
import { ApplicationRow } from '@/entities/clients/ui/ApplicationRow'
import { ClientRow } from '@/entities/clients/ui/ClientRow'
import { useApplications } from '@/entities/clients/useApplications'
import { useClients } from '@/entities/clients/useClients'
import { unreadCount } from '@/entities/notifications/notifications'
import { currentUser } from '@/entities/session/user'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Avatar } from '@/shared/ui/Avatar'
import { Section } from '@/shared/ui/Section'
import { ShortcutTile } from '@/shared/ui/ShortcutTile'
import { StatTile } from '@/shared/ui/StatTile'

const RECENT = 3
const seeAll = 'text-sm font-semibold text-brand'

/** Start screen: who is signed in, the numbers at a glance, shortcuts and the latest activity. */
export function HomePage() {
  const { t } = useI18n()
  const clients = useClients()
  const applications = useApplications()
  const user = currentUser

  const financed = applications.filter(({ application }) => application.installmentTotal > 0)
  const total = financed.reduce((sum, { application }) => sum + application.installmentTotal, 0)
  const processing = applications.filter(
    ({ application }) => application.status === 'processing',
  ).length

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <header className="flex items-center gap-3">
        <Avatar initials={`${user.firstName[0]}${user.lastName[0]}`} photoUrl={user.photoUrl} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-lg leading-tight font-bold">
            {t('home.greeting', { name: user.firstName })}
          </p>
          <p className="truncate text-sm text-ink-muted">
            {user.store} · {user.branch}
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

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-card bg-tile p-5 text-on-tile">
          <p className="text-sm opacity-75">{t('home.total')}</p>
          <p className="text-3xl font-bold">{formatSum(total)}</p>
          <p className="text-sm opacity-75">
            {t('home.total.hint', { count: String(financed.length) })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label={t('nav.clients')} value={String(clients.length)} to={ROUTES.clients} />
          <StatTile
            label={t('nav.applications')}
            value={String(applications.length)}
            to={ROUTES.applications}
          />
          <StatTile label={t('home.stat.processing')} value={String(processing)} />
        </div>
      </div>

      <Section title={t('home.shortcuts')}>
        <div className="grid grid-cols-3 gap-3">
          <ShortcutTile icon={UserPlus} label={t('home.addClient')} to={ROUTES.newClient} />
          <ShortcutTile icon={Calculator} label={t('nav.calculator')} to={ROUTES.calculator} />
          <ShortcutTile icon={FileText} label={t('nav.applications')} to={ROUTES.applications} />
        </div>
      </Section>

      <Section
        title={t('home.recentApplications')}
        action={
          <Link to={ROUTES.applications} className={seeAll}>
            {t('common.all')}
          </Link>
        }
      >
        <ul className="rounded-card bg-surface px-4">
          {applications.slice(0, RECENT).map(({ application, client }) => (
            <ApplicationRow
              key={application.id}
              application={application}
              clientName={shortName(client)}
            />
          ))}
        </ul>
      </Section>

      <Section
        title={t('home.recentClients')}
        action={
          <Link to={ROUTES.clients} className={seeAll}>
            {t('common.all')}
          </Link>
        }
      >
        <ul className="rounded-card bg-surface px-4">
          {clients.slice(0, RECENT).map((client) => (
            <ClientRow key={client.id} client={client} />
          ))}
        </ul>
      </Section>
    </div>
  )
}
