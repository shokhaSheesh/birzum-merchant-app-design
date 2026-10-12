import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'

/** A shopper tab that is routed but not designed yet. */
export function CustomerStubPage({ title }: { title: TranslationKey }) {
  const { t } = useI18n()

  return (
    <div className="flex min-h-full flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">{t(title)}</h1>
      <div className="flex flex-1 flex-col justify-center">
        <EmptyState title={t('customerApp.soon.title')} hint={t('customerApp.soon.hint')} />
      </div>
    </div>
  )
}
