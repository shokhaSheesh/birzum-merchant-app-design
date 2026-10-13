import { CircleAlert } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import type { Rejection } from '../clients'

type Props = {
  rejection: Rejection
  /** True in the client app: reasons about the client are worded as "you". */
  own?: boolean
}

/** Why an application was rejected. The merchant and the shopper read the same reason. */
export function RejectionNote({ rejection, own }: Props) {
  const { t } = useI18n()
  const { reason } = rejection
  const text =
    own && (reason === 'unverified' || reason === 'clientDeclined')
      ? t(`reject.reason.${reason}.you`)
      : t(`reject.reason.${reason}`)

  return (
    <div className="flex gap-2.5 rounded-control bg-danger-soft px-4 py-3 text-danger">
      <CircleAlert size={20} className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm">{t('reject.reason')}</p>
        <p className="font-semibold">{text}</p>
        {rejection.comment && <p className="text-sm break-words">{rejection.comment}</p>}
      </div>
    </div>
  )
}
