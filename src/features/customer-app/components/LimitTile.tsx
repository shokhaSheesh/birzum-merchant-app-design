import { useState } from 'react'
import { TERMS, type Term } from '@/entities/clients/clients'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatSum } from '@/shared/lib/format'

/** The shopper's limit for each installment length: pick a term on top, read its limit below. */
export function LimitTile({ limits }: { limits: Record<Term, number> }) {
  const { t } = useI18n()
  const [term, setTerm] = useState<Term>(12)

  return (
    <section className="relative isolate flex flex-col gap-4 overflow-hidden rounded-card bg-linear-160 from-green-100 to-green-300 p-2 text-ink">
      {/* One soft shape low on the right, clear of the term strip */}
      <span
        aria-hidden
        className="absolute -right-10 -bottom-16 -z-10 size-40 rounded-full bg-white/35 dark:bg-white/5"
      />
      <div
        role="radiogroup"
        aria-label={t('cart.term')}
        className="flex gap-1 rounded-[14px] bg-white/70 p-1 dark:bg-canvas/40"
      >
        {TERMS.map((value) => {
          const selected = value === term
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t('term.months', { count: String(value) })}
              onClick={() => setTerm(value)}
              className={cn(
                'h-10 min-w-0 rounded-[10px] font-semibold transition-colors',
                selected ? 'flex-[1.7] bg-green-500 text-navy-950' : 'flex-1 text-ink-muted',
              )}
            >
              {selected ? t('term.months', { count: String(value) }) : value}
            </button>
          )
        })}
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3">
        <p className="text-sm text-ink-muted">{t('climit.forTerm')}</p>
        <p className="text-3xl font-bold">{formatSum(limits[term])}</p>
        <p className="text-sm text-ink-muted">{t('climit.hint')}</p>
      </div>
    </section>
  )
}
