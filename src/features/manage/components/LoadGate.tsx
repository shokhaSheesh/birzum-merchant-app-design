import type { ReactNode } from 'react'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SkeletonDetail } from '@/shared/ui/Skeleton'

type Props = {
  loading: boolean
  failed: 'offline' | 'server' | null
  onRetry: () => void
  children: ReactNode
}

/**
 * Holds a form back until the server has sent what it edits, so a record opened by its link
 * is never mistaken for a new one. Shows placeholders, or the error screen with a retry.
 */
export function LoadGate({ loading, failed, onRetry, children }: Props) {
  if (!loading && !failed) return children
  return (
    <div className="flex h-full flex-col">
      <PageHeader />
      {failed ? (
        <ErrorState kind={failed} onAction={onRetry} />
      ) : (
        <div className="px-5 pt-2">
          <SkeletonDetail />
        </div>
      )}
    </div>
  )
}
