import { Ban, CircleCheck, CircleX, Send, ThumbsUp, type LucideIcon } from 'lucide-react'
import type { ApplicationStatus } from '@/entities/clients/clients'
import { NotificationRow } from '@/entities/notifications/ui/NotificationRow'
import { useCustomer } from '@/entities/session/customer'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'

const looks: Record<ApplicationStatus, { icon: LucideIcon; tone: string; text: string }> = {
  pending: { icon: Send, tone: 'bg-warning-soft text-warning', text: 'cnotif.pending' },
  processing: { icon: ThumbsUp, tone: 'bg-green-200 text-brand', text: 'cnotif.processing' },
  handed: { icon: CircleCheck, tone: 'bg-success-soft text-success', text: 'cnotif.processing' },
  closed: { icon: CircleCheck, tone: 'bg-success-soft text-success', text: 'notification.closed' },
  rejected: { icon: CircleX, tone: 'bg-danger-soft text-danger', text: 'notification.rejected' },
  cancelled: { icon: Ban, tone: 'bg-navy-100 text-ink-muted', text: 'notification.cancelled' },
}

/** The shopper's notifications: the latest news on each of their arizalar. */
export function CustomerNotificationsPage() {
  const { t } = useI18n()
  const applications = useCustomer()?.applications ?? []

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('notifications.title')} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
        {applications.length === 0 ? (
          <EmptyState
            title={t('notifications.empty.title')}
            hint={t('notifications.news.empty.hint')}
          />
        ) : (
          <ul className="rounded-card bg-surface px-4">
            {applications.map((application) => {
              const { icon, tone, text } = looks[application.status]
              return (
                <NotificationRow
                  key={application.id}
                  icon={icon}
                  tone={tone}
                  title={t(`${text}.title` as TranslationKey)}
                  body={t(`${text}.body` as TranslationKey, {
                    number: groupDigits(application.id),
                  })}
                  date={application.date}
                  unread={application.status === 'pending' || application.status === 'processing'}
                  to={ROUTES.customerPurchases}
                />
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
