import { ContactsSection } from '@/features/clients/components/ContactsSection'
import { useCustomer } from '@/entities/session/customer'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * Profil → Kontaktlar: the shopper's extra contacts (phone, who they are, a note). The same
 * list the merchant sees and edits on the client screen.
 */
export function CustomerContactsPage() {
  const { t } = useI18n()
  const customer = useCustomer()
  if (!customer) return null

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('contacts.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        <ContactsSection client={customer} untitled />
      </div>
    </div>
  )
}
