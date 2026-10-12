import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { unreadCount } from '@/entities/notifications/notifications'
import { currentUser } from '@/entities/session/user'
import { logout } from '@/features/auth/api/mockAuth'
import { ROUTES } from '@/shared/config/routes'
import { LANG_NAMES, LANGS } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { THEMES } from '@/shared/theme/context'
import { useTheme } from '@/shared/theme/useTheme'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'

export function ProfilePage() {
  const { t, lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const user = currentUser

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('nav.profile')}</h1>

      <div className="flex items-center gap-4">
        <Avatar
          initials={`${user.firstName[0]}${user.lastName[0]}`}
          photoUrl={user.photoUrl}
          size="lg"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xl leading-tight font-bold">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-ink-muted">{t('profile.role')}</p>
        </div>
      </div>

      <InfoList>
        <InfoRow label={t('field.login')} value={user.login} />
        <InfoRow label={t('field.phone')} value={formatPhone(user.phone)} />
        <InfoRow label={t('profile.store')} value={user.store} />
        <InfoRow label={t('profile.branch')} value={user.branch} />
      </InfoList>

      <ActionCard
        icon={Bell}
        title={t('notifications.title')}
        description={
          unreadCount > 0 ? t('notifications.unread', { count: String(unreadCount) }) : undefined
        }
        onClick={() => navigate(ROUTES.notifications)}
      />

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

      <Button variant="secondary" block className="mt-auto" onClick={handleLogout}>
        <LogOut size={20} />
        {t('profile.logout')}
      </Button>
    </div>
  )
}
