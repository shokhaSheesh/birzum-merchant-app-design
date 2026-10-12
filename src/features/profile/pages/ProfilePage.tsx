import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/features/auth/api/mockAuth'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'

export function ProfilePage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col gap-6 px-5 pt-14 pb-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.profile')}</h1>
        <LanguageSwitcher />
      </header>
      <Button variant="secondary" block className="mt-auto" onClick={handleLogout}>
        <LogOut size={20} />
        {t('profile.logout')}
      </Button>
    </div>
  )
}
