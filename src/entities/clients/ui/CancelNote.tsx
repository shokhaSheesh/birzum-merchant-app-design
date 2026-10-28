import { Ban, Undo2 } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime } from '@/shared/lib/format'
import type { Application } from '../clients'
import { historyOf } from '../history'

type Props = {
  application: Application
  /** True in the client app: "you" and "the shop" instead of "the client" and "the seller". */
  own?: boolean
}

/**
 * Who cancelled an application and why. Shown under the status, in both apps. A contract
 * cancelled after hand-over is a return: the goods went back to the shop and the client
 * confirmed it with the SMS code.
 */
export function CancelNote({ application, own }: Props) {
  const { t } = useI18n()
  const entry = historyOf(application).findLast((item) => item.status === 'cancelled')
  const by = entry?.by.kind

  if (application.returnReason) {
    return (
      <div className="flex gap-2.5 rounded-control border border-line bg-canvas px-4 py-3">
        <Undo2 size={20} className="mt-0.5 shrink-0 text-ink-muted" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-semibold">
            {t('return.note.title', { reason: t(`return.reason.${application.returnReason}`) })}
          </p>
          {application.cancelComment && (
            <p className="text-sm break-words">{application.cancelComment}</p>
          )}
          <p className="text-sm text-ink-muted">
            {entry && `${formatDateTime(entry.at)} · `}
            {own ? t('return.note.own') : t('return.note.staff', { name: entry?.by.name ?? '' })}
          </p>
        </div>
      </div>
    )
  }

  const who =
    by === 'customer'
      ? t(own ? 'cancel.by.you' : 'cancel.by.customer')
      : t(own ? 'cancel.by.shop' : 'cancel.by.staff')

  return (
    <div className="flex gap-2.5 rounded-control border border-line bg-canvas px-4 py-3">
      <Ban size={20} className="mt-0.5 shrink-0 text-ink-muted" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm text-ink-muted">{who}</p>
        {application.cancelComment && (
          <p className="font-semibold break-words">{application.cancelComment}</p>
        )}
      </div>
    </div>
  )
}
