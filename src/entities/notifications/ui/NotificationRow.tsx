import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { formatDateTime } from '@/shared/lib/format'

type Props = {
  icon: LucideIcon
  /** Classes for the round icon, e.g. "bg-danger-soft text-danger". */
  tone: string
  title: string
  body: string
  date: Date
  unread?: boolean
  /** Where tapping the row leads. */
  to: string
}

/** One notification: tinted round icon, title, a line of detail, the time, and a dot while unread. */
export function NotificationRow({ icon: Icon, tone, title, body, date, unread, to }: Props) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={to} className="flex items-start gap-3 py-3">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-full', tone)}>
          <Icon size={22} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-ink-muted">{body}</p>
          <p className="text-xs text-ink-subtle">{formatDateTime(date)}</p>
        </div>
        {unread && (
          <span className="mt-2 size-2.5 shrink-0 rounded-full bg-green-500" aria-hidden />
        )}
      </Link>
    </li>
  )
}
