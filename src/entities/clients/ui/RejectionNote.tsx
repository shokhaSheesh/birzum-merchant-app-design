import { CircleAlert } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import type { Rejection } from '../clients'

/** Why an application was rejected. The merchant and the shopper read the same text. */
export function RejectionNote({ rejection }: { rejection: Rejection }) {
  const { t } = useI18n()

  return (
    <div className="flex gap-2.5 rounded-control bg-danger-soft px-4 py-3 text-danger">
      <CircleAlert size={20} className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm">{t('reject.reason')}</p>
        <p className="font-semibold">{t(`reject.reason.${rejection.reason}`)}</p>
        {rejection.comment && <p className="text-sm break-words">{rejection.comment}</p>}
      </div>
    </div>
  )
}
