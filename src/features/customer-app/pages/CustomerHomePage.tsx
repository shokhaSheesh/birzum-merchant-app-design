import { ArrowLeftRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logoOnDark from '@/shared/assets/logo-on-dark.svg'
import logo from '@/shared/assets/logo.svg'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'

/** Entry point of the shopper app. A placeholder until its screens are signed off. */
export function CustomerHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="flex flex-col gap-3">
        <img src={logo} alt="Birzum nasiya" className="h-10 self-start dark:hidden" />
        <img src={logoOnDark} alt="Birzum nasiya" className="hidden h-10 self-start dark:block" />
        <h1 className="text-2xl font-bold">{t('customerApp.title')}</h1>
      </header>
      <div className="flex flex-1 flex-col justify-center">
        <EmptyState title={t('customerApp.soon.title')} hint={t('customerApp.soon.hint')} />
      </div>
      <Button variant="secondary" block onClick={() => navigate(ROUTES.profile)}>
        <ArrowLeftRight size={20} />
        {t('customerApp.back')}
      </Button>
    </div>
  )
}
