import { ArrowLeft, ChevronRight, Download, PencilLine } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { applicationStatusTone } from '@/entities/clients/applicationStatus'
import { APPLICATION_STATUSES } from '@/entities/clients/clients'
import { approveApplication, rejectApplication } from '@/entities/clients/applicationsApi'
import { clientsStore } from '@/entities/clients/clientsStore'
import { fullName, initials } from '@/entities/clients/clientName'
import { ProductsSummary } from '@/entities/clients/ui/ProductsSummary'
import { useApplication } from '@/entities/clients/useApplications'
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
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { downloadContract } from '../lib/contractPdf'

export function ApplicationDetailPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { number } = useParams()
  const found = useApplication(Number(number))
  const [statusOpen, setStatusOpen] = useState(false)
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)

  const decide = async (decision: 'approve' | 'reject') => {
    if (!found) return
    setBusy(decision)
    await (decision === 'approve' ? approveApplication : rejectApplication)(found.application.id)
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

          <InfoList>
            <InfoRow label={t('application.date')} value={formatDate(found.application.date)} />
            <InfoRow
              label={t('application.goodsTotal')}
              value={formatSum(found.application.goodsTotal)}
            />
            <InfoRow
              label={t('contract.installmentTotal')}
              value={formatSum(found.application.installmentTotal)}
            />
          </InfoList>

          <Button variant="secondary" block className="-mt-4" onClick={() => setStatusOpen(true)}>
            <PencilLine size={20} />
            {t('application.changeStatus')}
          </Button>
          <OptionSheet
            open={statusOpen}
            onClose={() => setStatusOpen(false)}
            title={t('application.changeStatus')}
            options={APPLICATION_STATUSES.map((status) => ({
              value: status,
              label: t(`application.status.${status}`),
            }))}
            value={found.application.status}
            onChange={(status) => clientsStore.updateApplication(found.application.id, { status })}
          />

          <Section title={t('application.contract.section')}>
            {found.application.contractNumber ? (
              <>
                <InfoList>
                  <InfoRow
                    label={t('application.contractNumber')}
                    value={found.application.contractNumber}
                  />
                </InfoList>
                <Button block onClick={() => downloadContract(found)}>
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
              <InfoRow label={t('client.passport')} value={formatPassport(found.client.passport)} />
              <InfoRow label={t('clients.pinfl')} value={found.client.pinfl} />
            </InfoList>
          </Section>

          {found.application.details ? (
            <>
              <Section title={t('contract.products')}>
                <ProductsSummary products={found.application.details.products} />
              </Section>

              <Section title={t('contract.payment')}>
                <InfoList>
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
            <Section title={t('contract.products')}>
              <p className="text-sm text-ink-muted">{t('application.noProducts')}</p>
            </Section>
          )}
        </div>
      )}

      {found?.application.status === 'pending' && (
        <footer className="flex shrink-0 flex-col gap-1 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button
            variant="ghost"
            block
            loading={busy === 'reject'}
            disabled={busy !== null}
            onClick={() => void decide('reject')}
          >
            {t('application.reject')}
          </Button>
          <Button
            block
            loading={busy === 'approve'}
            disabled={busy !== null}
            onClick={() => void decide('approve')}
          >
            {t('code.submit')}
          </Button>
        </footer>
      )}
    </div>
  )
}
