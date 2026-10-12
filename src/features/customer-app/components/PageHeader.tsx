import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/shared/i18n/useI18n'

/** Top bar of a pushed screen: back arrow and a short title. */
export function PageHeader({ title }: { title?: string }) {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <header className="flex shrink-0 items-center gap-2 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={t('common.back')}
        className="-ml-2 grid size-10 place-items-center rounded-full text-brand active:bg-surface"
      >
        <ArrowLeft size={24} />
      </button>
      {title && <h1 className="truncate text-lg font-bold">{title}</h1>}
    </header>
  )
}
