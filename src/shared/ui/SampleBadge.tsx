import { useI18n } from '@/shared/i18n/useI18n'

/** Marks a screen whose data is invented because the backend has no endpoint for it yet. */
export function SampleBadge() {
  const { t } = useI18n()
  return (
    <span className="shrink-0 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
      {t('sample.badge')}
    </span>
  )
}
