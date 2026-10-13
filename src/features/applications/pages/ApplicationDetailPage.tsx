import { ArrowLeft, ChevronRight, Download, PencilLine, PackageCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { applicationStatusTone } from '@/entities/clients/applicationStatus'
import { NEXT_STATUSES, type ApplicationStatus, type Rejection } from '@/entities/clients/clients'
import {
  approveApplication,
  handOverApplication,
  rejectApplication,
} from '@/entities/clients/applicationsApi'
import { clientsStore } from '@/entities/clients/clientsStore'
import { fullName, initials } from '@/entities/clients/clientName'
import { hasSchedule } from '@/entities/clients/payments'
import { FulfilmentRows } from '@/entities/clients/ui/FulfilmentRows'
import { PaymentSchedule } from '@/entities/clients/ui/PaymentSchedule'
import { RejectionNote } from '@/entities/clients/ui/RejectionNote'
import { ProductsSummary } from '@/entities/clients/ui/ProductsSummary'
import { useApplication } from '@/entities/clients/useApplications'
import { locationsStore } from '@/entities/merchant/locations'
import { clientPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum, groupDigits } from '@/shared/lib/format'
import { formatPassport } from '@/shared/lib/passport'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { OptionSheet } from '@/shared/ui/OptionSheet'
import { Section } from '@/shared/ui/Section'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { RejectSheet } from '../components/RejectSheet'
import { downloadContract } from '@/entities/clients/contractPdf'

export function ApplicationDetailPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const { number } = useParams()
  const found = useApplication(Number(number))
  const [tab, setTab] = useState<'info' | 'products' | 'payments'>('info')
  const [statusOpen, setStatusOpen] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const locations = locationsStore.useAll()
  const [busy, setBusy] = useState<'approve' | 'handOver' | null>(null)

  const handOver = async () => {
    if (!found) return
    setBusy('handOver')
    await handOverApplication(found.application.id)
    setBusy(null)
  }

  const approve = async () => {
    if (!found) return
    setBusy('approve')
    await approveApplication(found.application.id)
    setBusy(null)
  }

  const reject = async (rejection: Rejection) => {
    if (found) await rejectApplication(found.application.id, rejection)
  }

  // Each move runs the same step as its own button, so stock and reasons are never skipped
  const changeStatus = (status: ApplicationStatus) => {
    if (!found) return
    if (status === 'rejected') setRejecting(true)
    else if (status === 'processing') void approve()
    else if (status === 'handed') void handOver()
    else clientsStore.updateApplication(found.application.id, { status })
  }

  const nextStatuses = found ? NEXT_STATUSES[found.application.status] : []
  const location = locations.find((item) => item.id === found?.application.locationId)

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
        <p className="text-lg font-bold">{t('application.title')}</p>
      </header>

      {!found ? (
        <EmptyState title={t('applications.empty.title')} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-3 pb-8">
          <div className="flex flex-col items-start gap-2">
            <StatusBadge tone={applicationStatusTone[found.application.status]}>
              {t(`application.status.${found.application.status}`)}
            </StatusBadge>
            <h1 className="text-2xl font-bold">
              {t('review.number', { number: groupDigits(found.application.id) })}
            </h1>
          </div>

          {found.application.rejection && (
            <div className="-mt-3">
              <RejectionNote rejection={found.application.rejection} />
            </div>
          )}

          <SegmentedTabs
            label={t('application.title')}
            options={[
              { value: 'info', label: t('tab.info') },
              { value: 'products', label: t('contract.products') },
              ...(hasSchedule(found.application)
                ? [{ value: 'payments' as const, label: t('tab.payments') }]
                : []),
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'info' && (
            <>
              <InfoList>
                <InfoRow label={t('application.date')} value={formatDate(found.application.date)} />
                {location && <InfoRow label={t('profile.branch')} value={tl(location.name)} />}
                <InfoRow
                  label={t('application.goodsTotal')}
                  value={formatSum(found.application.goodsTotal)}
                />
                <InfoRow
                  label={t('contract.installmentTotal')}
                  value={formatSum(found.application.installmentTotal)}
                />
              </InfoList>

              {nextStatuses.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    block
                    className="-mt-4"
                    disabled={busy !== null}
                    onClick={() => setStatusOpen(true)}
                  >
                    <PencilLine size={20} />
                    {t('application.changeStatus')}
                  </Button>
                  <OptionSheet
                    open={statusOpen}
                    onClose={() => setStatusOpen(false)}
                    title={t('application.changeStatus')}
                    options={nextStatuses.map((status) => ({
                      value: status,
                      label: t(`application.status.${status}`),
                    }))}
                    value={null}
                    onChange={changeStatus}
                  />
                </>
              )}

              <Section title={t('application.contract.section')}>
                {found.application.contractNumber ? (
                  <>
                    <InfoList>
                      <InfoRow
                        label={t('application.contractNumber')}
                        value={found.application.contractNumber}
                      />
                    </InfoList>
                    <Button
                      variant="secondary"
                      block
                      onClick={() => downloadContract(found, location && tl(location.name))}
                    >
                      <Download size={20} />
                      {t('application.contract.download')}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">{t('application.contract.none')}</p>
                )}
              </Section>

              <Section title={t('client.title')}>
                <Link
                  to={clientPath(found.client.id)}
                  className="flex items-center gap-3 rounded-card bg-surface p-4 active:bg-navy-100"
                >
                  <Avatar initials={initials(found.client)} photoUrl={found.client.photoUrl} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="font-semibold">{fullName(found.client)}</p>
                    <p className="text-sm text-ink-muted">{formatPhone(found.client.phone)}</p>
                  </div>
                  <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
                </Link>
                <InfoList>
                  <InfoRow
                    label={t('client.passport')}
                    value={formatPassport(found.client.passport)}
                  />
                  <InfoRow label={t('clients.pinfl')} value={found.client.pinfl} />
                </InfoList>
              </Section>

              {found.application.details && (
                <Section title={t('contract.payment')}>
                  <InfoList>
                    <FulfilmentRows
                      details={found.application.details}
                      cards={found.client.cards}
                    />
                    <InfoRow
                      label={t('field.downPayment')}
                      value={formatSum(found.application.details.downPayment)}
                    />
                    <InfoRow
                      label={t('field.paymentDay')}
                      value={String(found.application.details.paymentDay)}
                    />
                  </InfoList>
                </Section>
              )}
            </>
          )}

          {tab === 'products' &&
            (found.application.details ? (
              <>
                <Section title={t('contract.products')}>
                  <ProductsSummary products={found.application.details.products} />
                </Section>

                <Section title={t('contract.conditions')}>
                  <InstallmentTermsCard
                    terms={{
                      ...found.application.details,
                      installmentTotal: found.application.installmentTotal,
                    }}
                  />
                </Section>
              </>
            ) : (
              <p className="text-sm text-ink-muted">{t('application.noProducts')}</p>
            ))}

          {tab === 'payments' && hasSchedule(found.application) && (
            <PaymentSchedule application={found.application} />
          )}
        </div>
      )}

      {found?.application.status === 'pending' && (
        <footer className="flex shrink-0 flex-col gap-1 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button variant="ghost" block disabled={busy !== null} onClick={() => setRejecting(true)}>
            {t('application.reject')}
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

      {found?.application.status === 'processing' && (
        <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button block loading={busy === 'handOver'} onClick={() => void handOver()}>
            <PackageCheck size={20} />
            {t('application.handOver')}
          </Button>
        </footer>
      )}

      {rejecting && <RejectSheet onClose={() => setRejecting(false)} onReject={reject} />}
    </div>
  )
}
