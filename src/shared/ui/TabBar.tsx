import { Calculator, FileText, House, UserRound, Users, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Tab = { to: string; label: TranslationKey; icon: LucideIcon; center?: boolean }

const tabs: Tab[] = [
  { to: ROUTES.home, label: 'nav.home', icon: House },
  { to: ROUTES.clients, label: 'nav.clients', icon: Users },
  { to: ROUTES.calculator, label: 'nav.calculator', icon: Calculator, center: true },
  { to: ROUTES.applications, label: 'nav.applications', icon: FileText },
  { to: ROUTES.profile, label: 'nav.profile', icon: UserRound },
]

/** Floating glass tab bar. The calculator sits in the middle as a raised round button. */
export function TabBar() {
  const { t } = useI18n()

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="glass pointer-events-auto flex h-16 items-center rounded-full px-2">
        {tabs.map(({ to, label, icon: Icon, center }) =>
          center ? (
            <NavLink key={to} to={to} aria-label={t(label)} className="flex flex-1 justify-center">
              <span className="grid size-14 -translate-y-3 place-items-center rounded-full bg-primary text-on-primary shadow-[0_8px_18px_-6px_rgb(7_42_60/0.55)] ring-4 ring-canvas transition-transform active:scale-95">
                <Icon size={26} />
              </span>
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  'flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors',
                  isActive ? 'bg-primary/10 font-semibold text-brand' : 'text-ink-muted',
                )
              }
            >
              <Icon size={22} strokeWidth={2} />
              <span className="max-w-full truncate px-1">{t(label)}</span>
            </NavLink>
          ),
        )}
      </div>
    </nav>
  )
}
