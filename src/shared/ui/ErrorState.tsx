import { Clock, Lock, SearchX, ServerCrash, WifiOff, type LucideIcon } from 'lucide-react'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from './Button'
import type { ErrorKind } from './errorKinds'

const icons: Record<ErrorKind, LucideIcon> = {
  offline: WifiOff,
  server: ServerCrash,
  session: Clock,
  notFound: SearchX,
  forbidden: Lock,
}

type Props = {
  kind: ErrorKind
  /** What the button does: retry the request, sign in again, go home or go back. */
  onAction: () => void
}

/**
 * A screen that could not be shown, and what to do about it. One layout for every kind:
 * an icon in a soft circle, a title, one sentence, and one button.
 */
export function ErrorState({ kind, onAction }: Props) {
  const { t } = useI18n()
  const Icon = icons[kind]
  const key = (part: 'title' | 'hint' | 'action') => `errorState.${kind}.${part}` as TranslationKey

  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center"
    >
      <span className="grid size-24 place-items-center rounded-full bg-surface text-brand">
        <Icon size={40} strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-xl font-bold">{t(key('title'))}</p>
        <p className="text-ink-muted">{t(key('hint'))}</p>
      </div>
      <Button onClick={onAction} className="min-w-44">
        {t(key('action'))}
      </Button>
    </div>
  )
}
