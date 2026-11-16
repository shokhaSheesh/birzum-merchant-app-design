import { Check, X } from 'lucide-react'
import type { Application, ApplicationStatus } from '@/entities/clients/clients'
import { historyOf } from '@/entities/clients/history'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDateTime } from '@/shared/lib/format'

/** The road every ariza takes, in order. Each step is reached when its stage is logged. */
const STEPS = ['sent', 'confirmed', 'contract', 'received', 'active', 'closed'] as const
type Step = (typeof STEPS)[number]

/** The stage that marks each step as reached. «sent» is the ariza's own date. */
const STAGE: Record<Exclude<Step, 'sent'>, ApplicationStatus> = {
  confirmed: 'creating',
  contract: 'processing',
  received: 'received',
  active: 'handed',
  closed: 'closed',
}

/** How many steps the ariza has reached, worked out from its status. */
const REACHED: Record<ApplicationStatus, number> = {
  pending: 1,
  creating: 2,
  processing: 3,
  received: 4,
  handed: 5,
  closed: 6,
  rejected: 0,
  cancelled: 0,
}

/**
 * Where the ariza is on its way, step by step: what has happened (with the date), what is
 * happening now, and what comes next, so the shopper always knows what to expect. A rejected or
 * cancelled ariza ends with that step instead.
 */
export function StatusSteps({ application }: { application: Application }) {
  const { t } = useI18n()
  const history = historyOf(application)
  const dateOf = (step: Step) =>
    step === 'sent'
      ? application.date
      : history.findLast((entry) => entry.status === STAGE[step])?.at

  const stopped = application.status === 'rejected' || application.status === 'cancelled'
  const reached = stopped
    ? // Steps logged before it stopped; the ariza itself was always sent
      Math.max(1, STEPS.filter((step) => step !== 'sent' && dateOf(step)).length + 1)
    : REACHED[application.status]
  const shown = stopped ? STEPS.slice(0, reached) : STEPS
  const end = stopped
    ? history.findLast((entry) => entry.status === application.status)?.at
    : undefined

  return (
    <ol className="flex flex-col rounded-card border border-line bg-canvas p-4">
      {shown.map((step, index) => {
        const done = index < reached
        const now = index === reached && !stopped
        const date = done ? dateOf(step) : undefined
        const last = index === shown.length - 1 && !stopped
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border-2',
                  done && 'border-primary bg-primary text-white',
                  now && 'border-primary bg-canvas',
                  !done && !now && 'border-navy-200 bg-canvas',
                )}
              >
                {done && <Check size={14} strokeWidth={3} />}
                {now && <span className="size-2 rounded-full bg-primary" />}
              </span>
              {!last && (
                <span className={cn('my-1 w-0.5 flex-1', done ? 'bg-primary' : 'bg-navy-200')} />
              )}
            </div>
            <div className={cn('flex min-w-0 flex-col gap-0.5', !last && 'pb-4')}>
              <p className={cn('leading-6', done || now ? 'font-semibold' : 'text-ink-muted')}>
                {t(`steps.${step}`)}
              </p>
              {date && <p className="text-sm text-ink-muted">{formatDateTime(date)}</p>}
              {!done && (
                <p className={cn('text-sm', now ? 'text-navy-700' : 'text-ink-subtle')}>
                  {t(`steps.${step}.hint`)}
                </p>
              )}
            </div>
          </li>
        )
      })}
      {stopped && (
        <li className="flex gap-3">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-danger text-white">
            <X size={14} strokeWidth={3} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="leading-6 font-semibold text-danger">
              {t(application.status === 'rejected' ? 'cstatus.rejected' : 'cstatus.cancelled')}
            </p>
            {end && <p className="text-sm text-ink-muted">{formatDateTime(end)}</p>}
          </div>
        </li>
      )}
    </ol>
  )
}
