import { useI18n } from '@/shared/i18n/useI18n'
import { useNow } from '@/shared/lib/useNow'
import type { Application } from './clients'
import { confirmDeadline, timeLeft } from './confirmDeadline'

/** "21 soat 4 daq", the time the shop has left to confirm a `pending` order. */
export function useConfirmTimeLeft(application: Application) {
  const { t } = useI18n()
  const now = useNow()
  const { hours, minutes } = timeLeft(confirmDeadline(application), now)
  return {
    hours,
    text:
      hours > 0
        ? t('confirm.time', { hours: String(hours), minutes: String(minutes) })
        : t('confirm.time.minutes', { minutes: String(minutes) }),
  }
}
