import { FileText, House, UserRound, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

const tabs: { to: string; label: TranslationKey; icon: LucideIcon }[] = [
  { to: ROUTES.home, label: 'nav.home', icon: House },
  { to: ROUTES.applications, label: 'nav.applications', icon: FileText },
  { to: ROUTES.profile, label: 'nav.profile', icon: UserRound },
]

export function TabBar() {
  const { t } = useI18n()

  return (
    <nav className="flex border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
              isActive ? 'text-navy-900' : 'text-ink-subtle',
            )
          }
        >
          <Icon size={24} strokeWidth={2} />
          {t(label)}
        </NavLink>
      ))}
    </nav>
  )
}
