import { useI18n } from '@/shared/i18n/useI18n'
import type { Application } from '../clients'
import { useConfirmTimeLeft } from '../useConfirmTimeLeft'

/** "21 soat 4 daq qoldi", in red for the last three hours. */
export function ConfirmCountdown({ application }: { application: Application }) {
  const { t } = useI18n()
  const { hours, text } = useConfirmTimeLeft(application)
  return (
    <span className={hours < 3 ? 'text-danger' : 'text-warning'}>
      {t('confirm.left', { time: text })}
    </span>
  )
}
