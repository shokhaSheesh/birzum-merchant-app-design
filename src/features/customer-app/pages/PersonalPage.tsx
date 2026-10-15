import { fullName, initials } from '@/entities/clients/clientName'
import { useCustomer } from '@/entities/session/customer'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate } from '@/shared/lib/format'
import { formatPassport } from '@/shared/lib/passport'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { PageHeader } from '@/shared/ui/PageHeader'

/** The shopper's own details, as MyID gave them. Read only. */
export function PersonalPage() {
  const { t } = useI18n()
  const customer = useCustomer()
  if (!customer) return null

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('client.personal')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} size="lg" />
          <p className="text-xl leading-tight font-bold text-balance">{fullName(customer)}</p>
        </div>
        <InfoList>
          <InfoRow label={t('field.phone')} value={formatPhone(customer.phone)} />
          <InfoRow label={t('client.passport')} value={formatPassport(customer.passport)} />
          <InfoRow label={t('clients.pinfl')} value={customer.pinfl} />
          <InfoRow label={t('field.birthDate')} value={formatDate(customer.birthDate)} />
          <InfoRow
            label={t('field.maritalStatus')}
            value={t(`marital.${customer.maritalStatus}`)}
          />
        </InfoList>
      </div>
    </div>
  )
}
