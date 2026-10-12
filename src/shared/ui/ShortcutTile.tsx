import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = {
  icon: LucideIcon
  label: string
  to: string
}

/** A compact shortcut to another screen: icon in a circle over a short label. Used in a grid. */
export function ShortcutTile({ icon: Icon, label, to }: Props) {
  return (
    <Link
      to={to}
      className="flex min-w-0 flex-col items-center gap-2 rounded-card bg-surface px-2 py-4 text-center transition-colors active:bg-navy-100"
    >
      <span className="grid size-12 place-items-center rounded-full bg-canvas text-brand">
        <Icon size={24} />
      </span>
      <span className="text-sm leading-tight font-semibold">{label}</span>
    </Link>
  )
}
