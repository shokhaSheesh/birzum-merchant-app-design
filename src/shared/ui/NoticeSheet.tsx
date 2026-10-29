import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Sheet } from './Sheet'

export type NoticeTone = 'info' | 'warning' | 'danger' | 'success'

const toneClass: Record<NoticeTone, string> = {
  info: 'bg-green-200 text-brand',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
}

type Props = {
  onClose: () => void
  /** The sheet's header, e.g. «Kirish». The big title sits under the icon. */
  sheetTitle: string
  icon: LucideIcon
  tone: NoticeTone
  title: string
  text: ReactNode
  /** The buttons, main one last. */
  actions: ReactNode
}

/** One state as the app shows it: an icon, a title, a line of text and what to do next. */
export function NoticeSheet({
  onClose,
  sheetTitle,
  icon: Icon,
  tone,
  title,
  text,
  actions,
}: Props) {
  return (
    <Sheet open onClose={onClose} title={sheetTitle}>
      <div className="flex flex-col gap-5 pt-2 pb-1">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className={cn('grid size-16 place-items-center rounded-full', toneClass[tone])}>
            <Icon size={30} />
          </span>
          <h2 className="text-xl font-bold text-balance">{title}</h2>
          <div className="text-ink-muted">{text}</div>
        </div>
        <div className="flex flex-col gap-1">{actions}</div>
      </div>
    </Sheet>
  )
}
