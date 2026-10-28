import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getStore, OWN_STORE_ID } from '@/entities/catalog/products'
import {
  CUSTOMER_STATUSES,
  customerStatus,
  customerStatusTone,
  type CustomerStatus,
} from '@/entities/clients/customerStatus'
import { useCustomer } from '@/entities/session/customer'
import { customerPurchasePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { useLoaded } from '@/shared/lib/useLoaded'
import { SkeletonCards } from '@/shared/ui/Skeleton'
import { formatDateTime, formatSum, groupDigits } from '@/shared/lib/format'
import { DateRangeChip, type DateRange } from '@/shared/ui/DateRangeChip'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FilterChips } from '@/shared/ui/FilterChips'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/** Shartnomalar: the shopper's own arizalar and where each one stands, running ones (Faol) first. */
export function PurchasesPage() {
  const { t } = useI18n()
  const loaded = useLoaded()
  const all = useCustomer()?.applications ?? []
  const [status, setStatus] = useState<'all' | CustomerStatus>('active')
  const [range, setRange] = useState<DateRange>({ from: null, to: null })

  const dayStart = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : -Infinity
  const dayEnd = range.to ? new Date(range.to).setHours(23, 59, 59, 999) : Infinity
  // Faol is every contract that exists: made by FlexSoft (waiting for the goods) or running
  const matches = (application: (typeof all)[number]) => {
    const current = customerStatus(application)
    return status === 'active' ? current === 'active' || current === 'approved' : current === status
  }
  const applications = all.filter(
    (application) =>
      (status === 'all' || matches(application)) &&
      application.date.getTime() >= dayStart &&
      application.date.getTime() <= dayEnd,
  )

  return (
    <div className="flex min-h-full flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">
        {t('customer.nav.purchases')}
      </h1>

      {all.length > 0 && (
        <FilterChips
          label={t('applications.filter.label')}
          leading={
            <DateRangeChip
              label={t('applications.filter.date')}
              value={range}
              onChange={setRange}
            />
          }
          options={[
            // Faol comes first and is chosen when the screen opens
            { value: 'active', label: t('cstatus.active') },
            { value: 'all', label: t('applications.filter.all') },
            ...CUSTOMER_STATUSES.filter((value) => value !== 'active' && value !== 'approved').map(
              (value) => ({
                value,
                label: t(`cstatus.${value}`),
              }),
            ),
          ]}
          value={status}
          onChange={setStatus}
        />
      )}

      {!loaded ? (
        <SkeletonCards />
      ) : applications.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          {all.length === 0 ? (
            <EmptyState title={t('purchases.empty.title')} hint={t('purchases.empty.hint')} />
          ) : (
            <EmptyState title={t('applications.empty.title')} hint={t('applications.empty.hint')} />
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {applications.map((application) => (
            <li key={application.id}>
              <Link
                to={customerPurchasePath(application.id)}
                className="flex flex-col gap-2 rounded-card border border-line bg-canvas p-4 active:bg-navy-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold">№ {groupDigits(application.id)}</p>
                    <p className="text-sm text-ink-muted">
                      {getStore(application.storeId ?? OWN_STORE_ID)?.name} ·{' '}
                      {formatDateTime(application.date)}
                    </p>
                  </div>
                  <StatusBadge tone={customerStatusTone[customerStatus(application)]}>
                    {t(`cstatus.${customerStatus(application)}`)}
                  </StatusBadge>
                </div>
                {application.details && (
                  <>
                    <p className="text-sm text-ink-muted">
                      {application.details.products
                        .map((item) => `${item.name} × ${item.quantity}`)
                        .join(', ')}
                    </p>
                    {application.details.fulfilment && (
                      <p className="text-sm text-ink-muted">
                        {t(`delivery.${application.details.fulfilment.method}`)}
                        {application.details.fulfilment.address &&
                          ` · ${application.details.fulfilment.address}`}
                      </p>
                    )}
                    <div className="flex items-baseline justify-between border-t border-line pt-2">
                      <p className="text-sm text-ink-muted">
                        {t('term.months', { count: String(application.details.term) })} ·{' '}
                        {formatSum(application.details.monthlyPayment)}
                      </p>
                      <p className="font-bold">{formatSum(application.installmentTotal)}</p>
                    </div>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
