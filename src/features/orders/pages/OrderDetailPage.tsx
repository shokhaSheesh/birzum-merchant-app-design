import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { fullName, initials } from '@/entities/clients/clientName'
import { ProductsSummary } from '@/entities/clients/ui/ProductsSummary'
import { useClient } from '@/entities/clients/useClients'
import { orderStatusTone } from '@/entities/orders/orderStatus'
import { approveOrder, rejectOrder, useOrder } from '@/entities/orders/orders'
import { applicationPath, clientPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime, groupDigits } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { Section } from '@/shared/ui/Section'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/** Merchant side: review a shopper's order, then approve it (which creates the ariza) or reject it. */
export function OrderDetailPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const order = useOrder(Number(id))
  const client = useClient(order?.clientId)
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)

  if (!order) return <Navigate to={ROUTES.orders} replace />

  const approve = async () => {
    setBusy('approve')
    const applicationNumber = await approveOrder(order.id)
    if (applicationNumber) navigate(applicationPath(applicationNumber), { replace: true })
    else setBusy(null)
  }

  const reject = async () => {
    setBusy('reject')
    await rejectOrder(order.id)
    setBusy(null)
  }

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
        <p className="text-lg font-bold">{t('order.title')}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-3 pb-6">
        <div className="flex flex-col items-start gap-2">
          <StatusBadge tone={orderStatusTone[order.status]}>
            {t(`order.status.${order.status}`)}
          </StatusBadge>
          <h1 className="text-2xl font-bold">
            {t('order.number', { number: groupDigits(order.id) })}
          </h1>
          <p className="text-ink-muted">{formatDateTime(order.date)}</p>
        </div>

        {client && (
          <Section title={t('client.title')}>
            <Link
              to={clientPath(client.id)}
              className="flex items-center gap-3 rounded-card bg-surface p-4 active:bg-navy-100"
            >
              <Avatar initials={initials(client)} photoUrl={client.photoUrl} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-semibold">{fullName(client)}</p>
                <p className="text-sm text-ink-muted">{formatPhone(client.phone)}</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
            </Link>
          </Section>
        )}

        <Section title={t('contract.products')}>
          <ProductsSummary products={order.items} />
        </Section>

        <Section title={t('contract.conditions')}>
          <InstallmentTermsCard terms={order.terms} />
        </Section>
      </div>

      {order.status === 'pending' && (
        <footer className="flex shrink-0 flex-col gap-1 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button
            variant="ghost"
            block
            loading={busy === 'reject'}
            disabled={busy !== null}
            onClick={() => void reject()}
          >
            {t('order.reject')}
          </Button>
          <Button
            block
            loading={busy === 'approve'}
            disabled={busy !== null}
            onClick={() => void approve()}
          >
            {t('code.submit')}
          </Button>
        </footer>
      )}
    </div>
  )
}
