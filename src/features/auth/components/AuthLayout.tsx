import type { FormEvent, ReactNode } from 'react'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'

type Props = {
  onSubmit: () => void
  /** The primary button, pinned to the bottom of the screen. */
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({ onSubmit, footer, children }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col bg-canvas">
      <header className="flex shrink-0 justify-end px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
