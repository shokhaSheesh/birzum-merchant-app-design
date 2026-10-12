import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'

/** Placeholder until the create-client form is designed. */
export function NewClientPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col gap-4 px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={() => navigate(ROUTES.clients)}
        aria-label={t('common.back')}
        className="-ml-2 grid size-10 place-items-center rounded-full text-navy-900 active:bg-surface"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-2xl font-bold">{t('clients.new.title')}</h1>
      <p className="text-ink-muted">Dizayn tasdiqlangach shu yerda yigʻiladi.</p>
    </div>
  )
}
