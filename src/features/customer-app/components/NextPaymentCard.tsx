import { CalendarClock, ChevronRight, CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Client } from '@/entities/clients/clients'
import { upcomingPayments } from '@/entities/clients/upcoming'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'

/** One line on Asosiy: the next payment, or what is overdue. Opens the payments overview. */
export function NextPaymentCard({ client }: { client: Client }) {
  const { t } = useI18n()
  const { next, overdue } = upcomingPayments(client)
  if (!next) return null
  const late = overdue > 0

  return (
    <Link
      to={ROUTES.customerPayments}
      className={cn(
        '-mt-2 flex items-center gap-3 rounded-card p-4',
        late ? 'bg-danger-soft' : 'bg-surface active:bg-navy-100',
      )}
    >
      <span
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-full',
          late ? 'bg-danger text-white' : 'bg-canvas text-brand',
        )}
      >
        {late ? <CircleAlert size={20} /> : <CalendarClock size={20} />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className={cn('text-sm', late ? 'text-danger' : 'text-ink-muted')}>
          {late ? t('upcoming.overdue') : t('upcoming.next', { date: formatDate(next.dueDate) })}
        </p>
        <p className={cn('font-bold', late && 'text-danger')}>
          {formatSum(late ? overdue : next.amount)}
        </p>
      </div>
      <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
    </Link>
  )
}
