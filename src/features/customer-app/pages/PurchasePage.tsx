import { Download, Star } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getStore, OWN_STORE_ID } from '@/entities/catalog/products'
import { reviewsStore, type Review } from '@/entities/catalog/reviews'
import { customerStatus, customerStatusTone } from '@/entities/clients/customerStatus'
import { cancelApplication } from '@/entities/clients/applicationsApi'
import { shortName } from '@/entities/clients/clientName'
import type { Application } from '@/entities/clients/clients'
import { clientsStore } from '@/entities/clients/clientsStore'
import { downloadContract } from '@/entities/clients/contractPdf'
import { hasSchedule, nextPayment } from '@/entities/clients/payments'
import { FulfilmentRows } from '@/entities/clients/ui/FulfilmentRows'
import { PaymentSchedule } from '@/entities/clients/ui/PaymentSchedule'
import { ProductsSummary } from '@/entities/clients/ui/ProductsSummary'
import { CancelNote } from '@/entities/clients/ui/CancelNote'
import { CancelSheet } from '@/entities/clients/ui/CancelSheet'
import { RejectionNote } from '@/entities/clients/ui/RejectionNote'
import { usePickupPoints } from '@/entities/merchant/usePickupPoints'
import { useCustomer } from '@/entities/session/customer'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { newId } from '@/shared/lib/createStore'
import { formatDateTime, formatSum, groupDigits } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { PaySheet } from '../components/PaySheet'
import { ReviewSheet } from '../components/ReviewSheet'

/** Publishes the review to the shop and marks the purchase as reviewed. */
function saveReview(
  application: Application,
  review: Pick<Review, 'storeId' | 'author' | 'rating' | 'text'>,
) {
  reviewsStore.save({
    ...review,
    id: newId(),
    date: new Date(),
    productName: application.details?.products[0]?.name ?? '',
  })
  clientsStore.updateApplication(application.id, { reviewed: true })
}

/**
 * One of the shopper's arizalar: where it stands, what was ordered and from which shop,
 * and, once the goods are handed over, the payments with a button to pay the next one.
 */
export function PurchasePage() {
  const { t } = useI18n()
  const { number } = useParams()
  const customer = useCustomer()
  const pickupPoints = usePickupPoints()
  const [tab, setTab] = useState<'info' | 'products' | 'payments'>('info')
  const [paying, setPaying] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const application = customer?.applications.find((item) => item.id === Number(number))
  if (!customer || !application) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title={t('purchase.title')} />
        <EmptyState title={t('purchases.empty.title')} />
      </div>
    )
  }

  const { details, status } = application
  const storeId = application.storeId ?? OWN_STORE_ID
  const store = getStore(storeId)
  const point = pickupPoints(storeId).find((item) => item.id === application.locationId)
  const payment = nextPayment(application)
  const received = status === 'handed' || status === 'closed'

  const sendReview = (rating: number, text: string) => {
    saveReview(application, {
      storeId,
      author: `${customer.firstName} ${customer.lastName[0]}.`,
      rating,
      text,
    })
    toast(t('toast.sent'))
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('purchase.title')} />

      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-3 pb-8">
        <div className="flex flex-col items-start gap-2">
          <StatusBadge tone={customerStatusTone[customerStatus(application)]}>
            {t(`cstatus.${customerStatus(application)}`)}
          </StatusBadge>
          <h1 className="text-2xl font-bold">
            {t('review.number', { number: groupDigits(application.id) })}
          </h1>
        </div>

        {application.rejection && (
          <div className="-mt-3">
            <RejectionNote rejection={application.rejection} own />
          </div>
        )}
        {status === 'cancelled' && (
          <div className="-mt-3">
            <CancelNote application={application} own />
          </div>
        )}

        <SegmentedTabs
          label={t('purchase.title')}
          options={[
            { value: 'info', label: t('tab.info') },
            { value: 'products', label: t('contract.products') },
            ...(hasSchedule(application)
              ? [{ value: 'payments' as const, label: t('tab.payments') }]
              : []),
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'info' && (
          <>
            <InfoList>
              <InfoRow label={t('application.date')} value={formatDateTime(application.date)} />
              {store && <InfoRow label={t('profile.store')} value={store.name} />}
              {details && <FulfilmentRows details={details} cards={customer.cards} />}
              {!!details?.downPayment && (
                <InfoRow label={t('field.downPayment')} value={formatSum(details.downPayment)} />
              )}
              {point && details?.fulfilment?.method !== 'delivery' && (
                <InfoRow label={t('delivery.point')} value={`${point.name}, ${point.address}`} />
              )}
            </InfoList>

            {received && (
              <div className="-mt-4 flex flex-col gap-2">
                {application.contractNumber && (
                  <Button
                    variant="secondary"
                    block
                    onClick={() => downloadContract({ application, client: customer }, point?.name)}
                  >
                    <Download size={20} />
                    {t('application.contract.download')}
                  </Button>
                )}
                {application.reviewed ? (
                  <p className="py-2 text-center text-sm text-ink-muted">{t('feedback.done')}</p>
                ) : (
                  <Button variant="secondary" block onClick={() => setReviewing(true)}>
                    <Star size={20} />
                    {t('feedback.leave')}
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'products' && details && (
          <>
            <ProductsSummary products={details.products} />
            <Section title={t('contract.conditions')}>
              <InstallmentTermsCard
                terms={{ ...details, installmentTotal: application.installmentTotal }}
                showMarkup={false}
              />
            </Section>
          </>
        )}

        {tab === 'payments' && hasSchedule(application) && (
          <PaymentSchedule application={application} />
        )}
      </div>

      {payment && (
        <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button block onClick={() => setPaying(true)}>
            {t('purchase.pay.button', { amount: formatSum(payment.amount) })}
          </Button>
        </footer>
      )}
      {(status === 'checking' || status === 'pending') && (
        <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button
            variant="ghost"
            block
            className="text-danger!"
            onClick={() => setCancelling(true)}
          >
            {t('purchase.cancel')}
          </Button>
        </footer>
      )}

      {paying && payment && (
        <PaySheet
          application={application}
          payment={payment}
          cards={customer.cards}
          onClose={() => setPaying(false)}
        />
      )}
      {reviewing && (
        <ReviewSheet
          shopName={store?.name ?? ''}
          onClose={() => setReviewing(false)}
          onSend={sendReview}
        />
      )}
      {cancelling && (
        <CancelSheet
          onClose={() => setCancelling(false)}
          onCancel={(comment) =>
            cancelApplication(application.id, comment, {
              kind: 'customer',
              name: shortName(customer),
            })
          }
        />
      )}
    </div>
  )
}
