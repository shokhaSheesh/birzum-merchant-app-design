import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  hint?: string
}

export function EmptyState({ icon: Icon, title, hint }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-surface text-ink-muted">
        <Icon size={26} />
      </span>
      <p className="text-lg font-bold">{title}</p>
      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </div>
  )
}
