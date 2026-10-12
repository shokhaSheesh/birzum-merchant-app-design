import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { shortName } from '@/entities/clients/clientName'
import { useClients } from '@/entities/clients/useClients'
import { orderStatusTone } from '@/entities/orders/orderStatus'
import { useOrders } from '@/entities/orders/orders'
import { orderPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime, formatSum, groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/** Merchant side: orders that shoppers sent from the client app. */
export function OrdersPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const orders = useOrders()
  const clients = useClients()

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-2 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="-ml-2 grid size-10 place-items-center rounded-full text-brand active:bg-surface"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">{t('orders.title')}</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
        {orders.length === 0 ? (
          <EmptyState title={t('orders.empty.title')} hint={t('orders.empty.hint')} />
        ) : (
          <ul className="rounded-card bg-surface px-4">
            {orders.map((order) => {
              const client = clients.find((c) => c.id === order.clientId)
              return (
                <li key={order.id} className="border-b border-line last:border-b-0">
                  <Link to={orderPath(order.id)} className="flex items-center gap-2 py-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">№ {groupDigits(order.id)}</p>
                        <StatusBadge tone={orderStatusTone[order.status]}>
                          {t(`order.status.${order.status}`)}
                        </StatusBadge>
                      </div>
                      {client && <p className="truncate">{shortName(client)}</p>}
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm text-ink-muted">{formatDateTime(order.date)}</p>
                        <p className="font-semibold">{formatSum(order.total)}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
