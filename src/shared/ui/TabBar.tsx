import { FileText, House, UserRound, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: ROUTES.home, label: 'Asosiy', icon: House },
  { to: ROUTES.applications, label: 'Arizalar', icon: FileText },
  { to: ROUTES.profile, label: 'Profil', icon: UserRound },
]

export function TabBar() {
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
          <Icon size={22} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
