import {
  ArrowLeft,
  Ban,
  CircleCheck,
  CircleX,
  FileSignature,
  Megaphone,
  ShoppingBag,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '@/entities/clients/useApplications'
import {
  applicationNotifications,
  type NotificationType,
} from '@/entities/notifications/notifications'
import { NotificationRow } from '@/entities/notifications/ui/NotificationRow'
import { applicationPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'

type Tab = 'applications' | 'news'

const looks: Record<NotificationType, { icon: LucideIcon; tone: string }> = {
  new: { icon: ShoppingBag, tone: 'bg-warning-soft text-warning' },
  approved: { icon: ThumbsUp, tone: 'bg-green-200 text-brand' },
  contract: { icon: FileSignature, tone: 'bg-green-200 text-brand' },
  closed: { icon: CircleCheck, tone: 'bg-success-soft text-success' },
  rejected: { icon: CircleX, tone: 'bg-danger-soft text-danger' },
  cancelled: { icon: Ban, tone: 'bg-navy-100 text-ink-muted' },
}

export function NotificationsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('applications')
  const all = useApplications()
  // A shopper's order waiting for the shop shows up here as "Yangi buyurtma"
  const orders = all
    .filter(({ application }) => application.status === 'pending')
    .map(({ application }) => ({
      key: `new-${application.id}`,
      ...looks.new,
      title: t('notification.new.title'),
      body: t('notification.new.body', { number: groupDigits(application.id) }),
      date: application.date,
      unread: true,
      to: applicationPath(application.id),
    }))
  const stored = applicationNotifications.map((notification) => ({
    key: notification.id,
    ...looks[notification.type],
    title: t(`notification.${notification.type}.title`),
    body: t(`notification.${notification.type}.body`, {
      number: groupDigits(notification.applicationNumber),
    }),
    date: notification.date,
    unread: !notification.read,
    to: applicationPath(notification.applicationNumber),
  }))
  const news = {
    key: 'news',
    icon: Megaphone,
    tone: 'bg-navy-100 text-brand',
    title: t('notification.news.title'),
    body: t('notification.news.body'),
    date: new Date(2026, 9, 1, 10, 0),
    unread: false,
    to: ROUTES.home,
  }
  const items = (tab === 'applications' ? [...orders, ...stored] : [news]).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  )

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-3 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
            className="-ml-2 grid size-10 place-items-center rounded-full text-brand active:bg-navy-100"
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
          <ul className="rounded-card border border-line bg-canvas px-4">
            {items.map(({ key, ...item }) => (
              <NotificationRow key={key} {...item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
