import { ChevronRight, History } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getStore, OWN_STORE_ID } from '@/entities/catalog/products'
import { upcomingPayments, type Upcoming } from '@/entities/clients/upcoming'
import { useCustomer } from '@/entities/session/customer'
import { customerPurchasePath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { PaySheet } from '../components/PaySheet'

/**
 * Everything the shopper owes in one place: the total and what is overdue on top, then the
 * next payment of each running purchase, soonest first, each payable from here.
 */
export function PaymentsPage() {
  const { t } = useI18n()
  const customer = useCustomer()
  const [paying, setPaying] = useState<Upcoming | null>(null)
  if (!customer) return null
  const { items, total, overdue } = upcomingPayments(customer)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('payments.overview')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-8">
        <div className="flex flex-col gap-4 rounded-card bg-surface p-4">
          <div className="flex flex-col">
            <p className="text-sm text-ink-muted">{t('payments.totalDebt')}</p>
            <p className="text-3xl font-bold">{formatSum(total)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
            <div className="flex flex-col">
              <p className="text-sm text-ink-muted">{t('payments.overdueSum')}</p>
              <p className={cn('font-bold', overdue > 0 && 'text-danger')}>{formatSum(overdue)}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-ink-muted">{t('payments.nextDate')}</p>
              <p className="font-bold">{items[0] ? formatDate(items[0].payment.dueDate) : '—'}</p>
            </div>
          </div>
          <Link
            to={ROUTES.customerPaymentHistory}
            className="flex h-11 items-center justify-center gap-2 rounded-control bg-canvas text-sm font-semibold text-brand active:bg-navy-100"
          >
            <History size={18} />
            {t('payhistory.title')}
          </Link>
        </div>

        <Section title={t('payments.upcoming')}>
          {items.length === 0 ? (
            <EmptyState title={t('payments.none')} />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => {
                const { application, payment, left } = item
                const late = payment.state === 'overdue'
                const product = application.details?.products[0]?.name ?? ''
                return (
                  <li
                    key={application.id}
                    className="flex flex-col gap-3 rounded-card bg-surface p-4"
                  >
                    <Link
                      to={customerPurchasePath(application.id)}
                      className="flex items-start gap-3"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p
                          className={cn(
                            'text-sm',
                            late ? 'font-semibold text-danger' : 'text-ink-muted',
                          )}
                        >
                          {late ? t('upcoming.overdue') : formatDate(payment.dueDate)}
                        </p>
                        <p className="truncate font-semibold">{product}</p>
                        <p className="text-sm text-ink-muted">
                          {getStore(application.storeId ?? OWN_STORE_ID)?.name} ·{' '}
                          {t('payments.left', { count: String(left) })}
                        </p>
                      </div>
                      <p className="shrink-0 font-bold">{formatSum(payment.amount)}</p>
                      <ChevronRight size={20} className="mt-0.5 shrink-0 text-ink-subtle" />
                    </Link>
                    <Button
                      size="sm"
                      variant={late ? 'primary' : 'secondary'}
                      block
                      onClick={() => setPaying(item)}
                    >
                      {t('pay.submit')}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>
      </div>

      {paying && (
        <PaySheet
          application={paying.application}
          payment={paying.payment}
          cards={customer.cards}
          onClose={() => setPaying(null)}
        />
      )}
    </div>
  )
}
