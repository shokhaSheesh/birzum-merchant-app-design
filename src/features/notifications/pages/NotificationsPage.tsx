import { ArrowLeft, Ban, CircleCheck, CircleX, FileSignature, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  applicationNotifications,
  newsNotifications,
  type AppNotification,
  type NotificationType,
} from '@/entities/notifications/notifications'
import { applicationPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDateTime, groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'

type Tab = 'applications' | 'news'

const looks: Record<NotificationType, { icon: LucideIcon; tone: string }> = {
  contract: { icon: FileSignature, tone: 'bg-green-200 text-brand' },
  closed: { icon: CircleCheck, tone: 'bg-success-soft text-success' },
  rejected: { icon: CircleX, tone: 'bg-danger-soft text-danger' },
  cancelled: { icon: Ban, tone: 'bg-navy-100 text-ink-muted' },
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  const { t } = useI18n()
  const { icon: Icon, tone } = looks[notification.type]

  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        to={applicationPath(notification.applicationNumber)}
        className="flex items-start gap-3 py-3"
      >
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-full', tone)}>
          <Icon size={22} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-semibold">{t(`notification.${notification.type}.title`)}</p>
          <p className="text-sm text-ink-muted">
            {t(`notification.${notification.type}.body`, {
              number: groupDigits(notification.applicationNumber),
            })}
          </p>
          <p className="text-xs text-ink-subtle">{formatDateTime(notification.date)}</p>
        </div>
        {!notification.read && (
          <span className="mt-2 size-2.5 shrink-0 rounded-full bg-green-500" aria-hidden />
        )}
      </Link>
    </li>
  )
}

export function NotificationsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('applications')
  const items = tab === 'applications' ? applicationNotifications : newsNotifications

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-3 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
            className="-ml-2 grid size-10 place-items-center rounded-full text-brand active:bg-surface"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">{t('notifications.title')}</h1>
        </div>
        <SegmentedTabs
          label={t('notifications.title')}
          options={[
            { value: 'applications', label: t('nav.applications') },
            { value: 'news', label: t('notifications.tab.news') },
          ]}
          value={tab}
          onChange={setTab}
        />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {items.length === 0 ? (
          <EmptyState
            title={t('notifications.news.empty.title')}
            hint={t('notifications.news.empty.hint')}
          />
        ) : (
          <ul className="rounded-card bg-surface px-4">
            {items.map((notification) => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
