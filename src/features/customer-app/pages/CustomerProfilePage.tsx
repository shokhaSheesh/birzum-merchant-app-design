import { ArrowLeftRight, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Button } from '@/shared/ui/Button'

/** Shopper profile. For now it only holds the way back to the merchant app and sign-out. */
export function CustomerProfilePage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('nav.profile')}</h1>
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
