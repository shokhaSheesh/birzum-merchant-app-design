import { ChevronRight, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge, type StatusTone } from '@/shared/ui/StatusBadge'

type ScreenProps = {
  title: string
  /** Where "Qoʻshish" leads. Leave out for a list nothing can be added to. */
  createTo?: string
  /** Shown between the header and the list, e.g. a search field or filter. */
  toolbar?: ReactNode
  empty: boolean
  children: ReactNode
}

/** The frame of every management list: back, title, "Qoʻshish" at the top right, then the rows. */
export function ListScreen({ title, createTo, toolbar, empty, children }: ScreenProps) {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={title}
        end={
          createTo && (
            <Button size="sm" className="mr-2" onClick={() => navigate(createTo)}>
              <Plus size={18} />
              {t('clients.create')}
            </Button>
          )
        }
      />
      {toolbar && <div className="flex shrink-0 flex-col gap-3 px-5 pb-3">{toolbar}</div>}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
        {empty ? (
          <EmptyState title={t('manage.empty.title')} hint={t('manage.empty.hint')} />
        ) : (
          children
        )}
      </div>
    </div>
  )
}

type RowProps = {
  to: string
  leading?: ReactNode
  title: string
  lines: string[]
  /** Marks a record that is switched off. */
  inactiveLabel?: string
  /** A status worth seeing in the list, e.g. a product waiting for the admin. */
  badge?: { label: string; tone: StatusTone }
}

/** One record in a management list. Opens its form. */
export function ListRow({ to, leading, title, lines, inactiveLabel, badge }: RowProps) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={to} className="flex items-center gap-3 py-3">
        {leading}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="min-w-0 truncate font-semibold">{title}</p>
            {badge && <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>}
            {inactiveLabel && <StatusBadge tone="neutral">{inactiveLabel}</StatusBadge>}
          </div>
          {lines.map((line) => (
            <p key={line} className="truncate text-sm text-ink-muted">
              {line}
            </p>
          ))}
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </Link>
    </li>
  )
}
