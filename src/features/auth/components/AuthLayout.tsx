import { ArrowLeft } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'

type Props = {
  onSubmit: () => void
  /** Shows a back arrow at the top left when set. */
  onBack?: () => void
  /** The primary button, pinned to the bottom of the screen. */
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({ onSubmit, onBack, footer, children }: Props) {
  const { t } = useI18n()
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col bg-canvas">
      <header className="flex shrink-0 items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('common.back')}
            className="-ml-2 grid size-10 place-items-center rounded-full text-navy-900 active:bg-surface"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <span />
        )}
        <LanguageSwitcher />
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-4">
        {children}
      </div>
      <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {footer}
      </footer>
    </form>
  )
}
