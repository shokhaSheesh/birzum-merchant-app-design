import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LANG_NAMES, LANGS } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { PageHeader } from '@/shared/ui/PageHeader'

/** The app's language, one row each. Tapping one switches the app at once and goes back. */
export function LanguagePage() {
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('profile.language')} />
      <ul
        role="radiogroup"
        aria-label={t('profile.language')}
        className="mx-5 mt-2 rounded-card bg-surface px-4"
      >
        {LANGS.map((value) => {
          const selected = value === lang
          return (
            <li key={value} className="border-b border-line last:border-b-0">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setLang(value)
                  navigate(-1)
                }}
                className="flex min-h-13 w-full items-center justify-between gap-3 py-2 text-left"
              >
                <span className={cn('font-medium', selected && 'font-semibold')}>
                  {LANG_NAMES[value]}
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
