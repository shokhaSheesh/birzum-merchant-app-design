import {
  Ban,
  BellRing,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  CircleX,
  Gauge,
  type LucideIcon,
  Megaphone,
  Send,
  ThumbsUp,
} from 'lucide-react'
import { useState } from 'react'
import type { ApplicationStatus } from '@/entities/clients/clients'
import { upcomingPayments } from '@/entities/clients/upcoming'
import { NotificationRow } from '@/entities/notifications/ui/NotificationRow'
import { useCustomer } from '@/entities/session/customer'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { customerCatalogPath, customerPurchasePath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum, groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'

const looks: Record<ApplicationStatus, { icon: LucideIcon; tone: string; text: string }> = {
  pending: { icon: Send, tone: 'bg-warning-soft text-warning', text: 'cnotif.pending' },
  creating: { icon: ThumbsUp, tone: 'bg-green-200 text-brand', text: 'cnotif.creating' },
  processing: { icon: CircleCheck, tone: 'bg-green-200 text-brand', text: 'cnotif.processing' },
  received: { icon: CircleCheck, tone: 'bg-green-200 text-brand', text: 'cnotif.processing' },
  handed: { icon: CircleCheck, tone: 'bg-success-soft text-success', text: 'cnotif.processing' },
  closed: { icon: CircleCheck, tone: 'bg-success-soft text-success', text: 'notification.closed' },
  rejected: { icon: CircleX, tone: 'bg-danger-soft text-danger', text: 'notification.rejected' },
  cancelled: { icon: Ban, tone: 'bg-navy-100 text-ink-muted', text: 'notification.cancelled' },
}

type Item = {
  key: string
  icon: LucideIcon
  tone: string
  title: string
  body: string
  date: Date
  unread?: boolean
  to: string
}

const DAY = 24 * 60 * 60 * 1000

/**
 * The shopper's notifications, newest first: payment reminders and overdue warnings, payments
 * received, limit reminders, news from Birzum, and the news on each ariza. Sample content,
 * worked out from the shopper's own purchases where it can be.
 */
export function CustomerNotificationsPage() {
  const { t } = useI18n()
  const customer = useCustomer()
  // The moment the screen opened; sample times are counted back from it
  const [now] = useState(() => Date.now())
  if (!customer) return null
  const items: Item[] = []
  const { items: upcoming } = upcomingPayments(customer)

  for (const { application, payment } of upcoming) {
    const number = groupDigits(application.id)
    if (payment.state === 'overdue') {
      items.push({
        key: `overdue-${application.id}`,
        icon: CircleAlert,
        tone: 'bg-danger-soft text-danger',
        title: t('cnotif.overdue.title'),
        body: t('cnotif.overdue.body', { number, amount: formatSum(payment.amount) }),
        date: new Date(now - 2 * 60 * 60 * 1000),
        unread: true,
        to: customerPurchasePath(application.id),
      })
    } else {
      items.push({
        key: `due-${application.id}`,
        icon: CalendarClock,
        tone: 'bg-warning-soft text-warning',
        title: t('cnotif.due.title'),
        body: t('cnotif.due.body', {
          date: formatDate(payment.dueDate),
          amount: formatSum(payment.amount),
        }),
        date: new Date(now - 5 * 60 * 60 * 1000),
        unread: true,
        to: customerPurchasePath(application.id),
      })
      items.push({
        key: `paid-${application.id}`,
        icon: CircleCheck,
        tone: 'bg-success-soft text-success',
        title: t('cnotif.paid.title'),
        body: t('cnotif.paid.body', { number, amount: formatSum(payment.amount) }),
        date: new Date(now - 26 * DAY),
        to: customerPurchasePath(application.id),
      })
    }
  }

  if (customer.limitExpiresOn) {
    items.push({
      key: 'limit',
      icon: Gauge,
      tone: 'bg-green-200 text-brand',
      title: t('cnotif.limit.title'),
      body: t('cnotif.limit.body', { date: formatDate(customer.limitExpiresOn) }),
      date: new Date(now - 3 * DAY),
      to: ROUTES.customerHome,
    })
  }
  items.push(
    {
      key: 'news-sale',
      icon: Megaphone,
      tone: 'bg-navy-100 text-brand',
      title: t('cnotif.news.sale.title'),
      body: t('cnotif.news.sale.body'),
      date: new Date(now - 1 * DAY),
      unread: true,
      to: customerCatalogPath('stores'),
    },
    {
      key: 'news-app',
      icon: BellRing,
      tone: 'bg-navy-100 text-brand',
      title: t('cnotif.news.app.title'),
      body: t('cnotif.news.app.body'),
      date: new Date(now - 9 * DAY),
      to: ROUTES.customerProfile,
    },
  )
  for (const application of customer.applications) {
    const { icon, tone, text } = looks[application.status]
    items.push({
      key: `ariza-${application.id}`,
      icon,
      tone,
      title: t(`${text}.title` as TranslationKey),
      body: t(`${text}.body` as TranslationKey, { number: groupDigits(application.id) }),
      date: application.date,
      unread:
        application.status === 'pending' ||
        application.status === 'creating' ||
        application.status === 'processing',
      to: customerPurchasePath(application.id),
    })
  }
  items.sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('notifications.title')} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
        {items.length === 0 ? (
          <EmptyState
            title={t('notifications.empty.title')}
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
