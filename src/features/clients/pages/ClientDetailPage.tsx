import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { clientAddCardPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { formatPassport } from '@/shared/lib/passport'
import { formatAddress } from '@/entities/address/regions'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import { EmptyState } from '@/shared/ui/EmptyState'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { Section } from '@/shared/ui/Section'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import { ContactsSection } from '../components/ContactsSection'
import { LimitCard } from '../components/LimitCard'
import { PaymentCards } from '@/entities/clients/ui/PaymentCards'
import { ApplicationRow } from '@/entities/clients/ui/ApplicationRow'
import { isOwn } from '@/entities/clients/useApplications'
import { useClient } from '@/entities/clients/useClients'
import { fullName, initials } from '@/entities/clients/clientName'

export function ClientDetailPage() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const client = useClient(id)
  const [tab, setTab] = useState<'info' | 'cards' | 'applications'>('info')
  const ownApplications = client?.applications.filter(isOwn) ?? []

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-2 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="-ml-2 grid size-10 place-items-center rounded-full text-brand active:bg-navy-100"
        >
          <ArrowLeft size={24} />
        </button>
        <p className="text-lg font-bold">{t('client.title')}</p>
      </header>

      {!client ? (
        <EmptyState title={t('clients.empty.title')} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-3 pb-8">
          <div className="flex items-center gap-4">
            <Avatar initials={initials(client)} photoUrl={client.photoUrl} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="text-xl leading-tight font-bold">{fullName(client)}</h1>
              <p className="text-ink-muted">{formatPhone(client.phone)}</p>
            </div>
          </div>

          <SegmentedTabs
            label={t('client.title')}
            options={[
              { value: 'info', label: t('tab.info') },
              { value: 'cards', label: t('tab.cardsContacts') },
              { value: 'applications', label: t('client.applications') },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'info' && (
            <>
              <LimitCard client={client} />

              <Section title={t('client.personal')}>
                <InfoList>
                  <InfoRow label={t('client.passport')} value={formatPassport(client.passport)} />
                  <InfoRow
                    label={t('client.passportIssued')}
                    value={formatDate(client.passportIssuedOn)}
                  />
                  <InfoRow
                    label={t('client.passportExpires')}
                    value={formatDate(client.passportExpiresOn)}
                  />
                  <InfoRow label={t('field.birthDate')} value={formatDate(client.birthDate)} />
                  <InfoRow label={t('clients.pinfl')} value={client.pinfl} />
                  <InfoRow label={t('field.phone')} value={formatPhone(client.phone)} />
                  {client.homeAddress && (
                    <InfoRow
                      label={t('field.homeAddress')}
                      value={formatAddress(client.homeAddress, lang)}
                    />
                  )}
                </InfoList>
              </Section>

              <Section title={t('client.income')}>
                <InfoList>
                  <InfoRow
                    label={t('field.monthlyIncome')}
                    value={formatSum(client.monthlyIncome)}
                  />
                  <InfoRow
                    label={t('field.incomeSource')}
                    value={
                      client.incomeSource ? t(`income.${client.incomeSource}`) : t('common.none')
                    }
                  />
                  <InfoRow
                    label={t('field.maritalStatus')}
                    value={t(`marital.${client.maritalStatus}`)}
                  />
                </InfoList>
              </Section>
            </>
          )}

          {tab === 'cards' && (
            <>
              <Section title={t('client.cards')}>
                <PaymentCards client={client} addTo={clientAddCardPath(client.id)} />
              </Section>

              <ContactsSection client={client} />
            </>
          )}

          {tab === 'applications' &&
            (ownApplications.length === 0 ? (
              <p className="text-sm text-ink-muted">{t('client.applications.empty')}</p>
            ) : (
              <ul className="rounded-card border border-line bg-canvas px-4">
                {ownApplications.map((application) => (
                  <ApplicationRow key={application.id} application={application} />
                ))}
              </ul>
            ))}
        </div>
      )}
    </div>
  )
}
