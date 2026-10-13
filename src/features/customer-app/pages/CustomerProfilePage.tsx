import { ArrowLeftRight, LogOut, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fullName, initials } from '@/entities/clients/clientName'
import { PaymentCards } from '@/entities/clients/ui/PaymentCards'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { LANG_NAMES, LANGS } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate } from '@/shared/lib/format'
import { formatPassport } from '@/shared/lib/passport'
import { formatPhone } from '@/shared/lib/phone'
import { THEMES } from '@/shared/theme/context'
import { useTheme } from '@/shared/theme/useTheme'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'

/** Shopper profile: who they are, their cards, app settings, and the way back to the merchant app. */
export function CustomerProfilePage() {
  const { t, lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const customer = useCustomer()

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('nav.profile')}</h1>

      {customer && (
        <>
          <div className="flex items-center gap-4">
            <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-xl leading-tight font-bold">{fullName(customer)}</p>
              <p className="text-ink-muted">{formatPhone(customer.phone)}</p>
            </div>
          </div>

          <Section title={t('client.personal')}>
            <InfoList>
              <InfoRow label={t('client.passport')} value={formatPassport(customer.passport)} />
              <InfoRow label={t('clients.pinfl')} value={customer.pinfl} />
              <InfoRow label={t('field.birthDate')} value={formatDate(customer.birthDate)} />
            </InfoList>
          </Section>

          <Section title={t('client.cards')}>
            <PaymentCards client={customer} addTo={ROUTES.customerAddCard} />
            <MenuList>
              <MenuRow icon={Receipt} label={t('payhistory.title')} to={ROUTES.customerPayments} />
            </MenuList>
          </Section>
        </>
      )}

      <Section title={t('profile.settings')}>
        <Select
          label={t('profile.language')}
          options={LANGS.map((value) => ({ value, label: LANG_NAMES[value] }))}
          value={lang}
          onChange={setLang}
        />
        <ChoiceGrid
          label={t('profile.theme')}
          columns={3}
          options={THEMES.map((value) => ({ value, label: t(`theme.${value}`) }))}
          value={theme}
          onChange={setTheme}
        />
      </Section>

      <ActionCard
        icon={ArrowLeftRight}
        title={t('customerApp.back')}
        onClick={() => navigate(ROUTES.profile)}
      />
      <Button
        variant="secondary"
        block
        className="mt-auto"
        onClick={() => navigate(ROUTES.customerApp, { replace: true })}
      >
        <LogOut size={20} />
        {t('profile.logout')}
      </Button>
    </div>
  )
}
