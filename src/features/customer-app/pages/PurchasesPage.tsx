import { orderStatusTone } from '@/entities/orders/orderStatus'
import { useOrders } from '@/entities/orders/orders'
import { getCustomerId } from '@/entities/session/customer'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime, formatSum, groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/** The shopper's orders and what the merchant decided. */
export function PurchasesPage() {
  const { t } = useI18n()
  const orders = useOrders().filter((order) => order.clientId === getCustomerId())

  return (
    <div className="flex min-h-full flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">
        {t('customer.nav.purchases')}
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState title={t('purchases.empty.title')} hint={t('purchases.empty.hint')} />
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-2 rounded-card bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold">
                    {t('order.number', { number: groupDigits(order.id) })}
                  </p>
                  <p className="text-sm text-ink-muted">{formatDateTime(order.date)}</p>
                </div>
                <StatusBadge tone={orderStatusTone[order.status]}>
                  {t(`order.status.${order.status}`)}
                </StatusBadge>
              </div>
              <p className="text-sm text-ink-muted">
                {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
              </p>
              <div className="flex items-baseline justify-between border-t border-line pt-2">
                <p className="text-sm text-ink-muted">
                  {t('term.months', { count: String(order.terms.term) })} ·{' '}
                  {formatSum(order.terms.monthlyPayment)}
                </p>
                <p className="font-bold">{formatSum(order.terms.installmentTotal)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
