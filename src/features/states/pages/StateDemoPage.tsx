import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { ERROR_KINDS, type ErrorKind } from '@/shared/ui/errorKinds'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SkeletonCards, SkeletonDetail, SkeletonGrid, SkeletonRows } from '@/shared/ui/Skeleton'

const isError = (kind: string | undefined): kind is ErrorKind =>
  ERROR_KINDS.includes(kind as ErrorKind)

/** One state from the gallery, drawn the way a real screen would show it. */
export function StateDemoPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { kind } = useParams()

  if (isError(kind)) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader />
        <ErrorState kind={kind} onAction={() => navigate(-1)} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={kind === 'empty' ? t('states.empty') : t('states.loading')} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-8">
        {kind === 'rows' && <SkeletonRows />}
        {kind === 'grid' && <SkeletonGrid count={6} />}
        {kind === 'cards' && <SkeletonCards count={4} />}
        {kind === 'detail' && <SkeletonDetail />}
        {kind === 'empty' && (
          <EmptyState title={t('applications.empty.title')} hint={t('applications.empty.hint')} />
        )}
      </div>
    </div>
  )
}

/** Shown for an address that leads nowhere. */
export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col">
      <ErrorState kind="notFound" onAction={() => navigate(ROUTES.home, { replace: true })} />
    </div>
  )
}
