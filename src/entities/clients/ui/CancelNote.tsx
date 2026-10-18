import { Ban } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import type { Application } from '../clients'
import { historyOf } from '../history'

type Props = {
  application: Application
  /** True in the client app: "you" and "the shop" instead of "the client" and "the seller". */
  own?: boolean
}

/** Who cancelled an application and why. Shown under the status, in both apps. */
export function CancelNote({ application, own }: Props) {
  const { t } = useI18n()
  const by = historyOf(application).findLast((entry) => entry.status === 'cancelled')?.by.kind
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
