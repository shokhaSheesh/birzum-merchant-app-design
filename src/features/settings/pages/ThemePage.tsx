import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { THEMES } from '@/shared/theme/context'
import { useTheme } from '@/shared/theme/useTheme'
import { PageHeader } from '@/shared/ui/PageHeader'

/** The app's theme, one row each, like the language screen. Tapping one applies it and goes back. */
export function ThemePage() {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('profile.theme')} />
      <ul
        role="radiogroup"
        aria-label={t('profile.theme')}
        className="mx-5 mt-2 rounded-card bg-surface px-4"
      >
        {THEMES.map((value) => {
          const selected = value === theme
          return (
            <li key={value} className="border-b border-line last:border-b-0">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(value)
                  navigate(-1)
                }}
                className="flex min-h-13 w-full items-center justify-between gap-3 py-2 text-left"
              >
                <span className="flex min-w-0 flex-col">
                  <span className={cn('font-medium', selected && 'font-semibold')}>
                    {t(`theme.${value}`)}
                  </span>
                  {value === 'system' && (
                    <span className="text-sm text-ink-muted">{t('theme.system.hint')}</span>
                  )}
                </span>
                {selected && <Check size={22} className="shrink-0 text-brand" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
