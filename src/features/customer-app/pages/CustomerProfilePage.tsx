import {
  ArrowLeftRight,
  ChevronRight,
  Contact,
  CreditCard,
  Globe,
  LifeBuoy,
  LogOut,
  MessageCircle,
  MonitorSmartphone,
  Palette,
  QrCode,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { fullName, initials } from '@/entities/clients/clientName'
import { useCustomer } from '@/entities/session/customer'
import { security } from '@/entities/session/security'
import { ROUTES } from '@/shared/config/routes'
import { LANG_NAMES } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { useTheme } from '@/shared/theme/useTheme'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { Section } from '@/shared/ui/Section'

/** Shopper profile: who they are, their cards, app settings, and the way back to the merchant app. */
export function CustomerProfilePage() {
  const { t, lang } = useI18n()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const customer = useCustomer()

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('nav.profile')}</h1>

      {customer && (
        <Link
          to={ROUTES.customerPersonal}
          className="flex items-center gap-4 rounded-card border border-line bg-canvas p-4 active:bg-navy-100"
        >
          <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-lg leading-tight font-bold">{fullName(customer)}</p>
            <p className="text-ink-muted">{formatPhone(customer.phone)}</p>
          </div>
          <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
        </Link>
      )}

      <Section title={t('profile.account')}>
        <MenuList>
          <MenuRow icon={QrCode} label={t('myqr.title')} to={ROUTES.customerQr} />
          <MenuRow icon={Receipt} label={t('payments.overview')} to={ROUTES.customerPayments} />
          <MenuRow icon={CreditCard} label={t('client.cards')} to={ROUTES.customerCards} />
          <MenuRow icon={Contact} label={t('contacts.title')} to={ROUTES.customerContacts} />
        </MenuList>
      </Section>

      <Section title={t('profile.settings')}>
        <MenuList>
          <MenuRow icon={ShieldCheck} label={t('pin.section')} to={ROUTES.customerSecurity} />
          <MenuRow
            icon={MonitorSmartphone}
            label={t('sessions.title')}
            to={ROUTES.customerSessions}
          />
          <MenuRow
            icon={Palette}
            label={t('profile.theme')}
            to={ROUTES.customerTheme}
            value={t(`theme.${theme}`)}
          />
          <MenuRow
            icon={Globe}
            label={t('profile.language')}
            to={ROUTES.customerLanguage}
            value={LANG_NAMES[lang]}
          />
        </MenuList>
      </Section>

      <Section title={t('support.title')}>
        <MenuList>
          <MenuRow icon={LifeBuoy} label={t('support.faq')} to={ROUTES.customerSupport} />
          <MenuRow icon={MessageCircle} label={t('support.chat.title')} to={ROUTES.customerChat} />
        </MenuList>
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
        onClick={() => {
          security.signOut()
          navigate(ROUTES.customerApp, { replace: true })
        }}
      >
        <LogOut size={20} />
        {t('profile.logout')}
      </Button>
    </div>
  )
}
