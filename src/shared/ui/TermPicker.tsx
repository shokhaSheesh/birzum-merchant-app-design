import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props<T extends number> = {
  /** The available lengths in months, shortest first. */
  terms: readonly T[]
  value: T
  onChange: (term: T) => void
}

/** Installment length as one compact strip. Only the chosen term spells out "oy". */
export function TermPicker<T extends number>({ terms, value, onChange }: Props<T>) {
  const { t } = useI18n()

  return (
    <div
      role="radiogroup"
      aria-label={t('cart.term')}
      className="flex gap-1 rounded-control bg-navy-100 p-1"
    >
      {terms.map((term) => {
        const selected = term === value
        return (
          <button
            key={term}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t('term.months', { count: String(term) })}
            onClick={() => onChange(term)}
            className={cn(
              'h-10 min-w-0 rounded-[10px] font-semibold transition-colors',
              selected ? 'flex-[1.7] bg-raised text-ink' : 'flex-1 text-ink-muted',
            )}
          >
            {selected ? t('term.months', { count: String(term) }) : term}
          </button>
        )
      })}
    </div>
  )
}
