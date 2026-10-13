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
    <section className="flex flex-col gap-4 rounded-card bg-tile p-2 text-on-tile">
      <div
        role="radiogroup"
        aria-label={t('cart.term')}
        className="flex gap-1 rounded-[14px] bg-white/10 p-1"
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
                selected ? 'flex-[1.7] bg-green-500 text-navy-950' : 'flex-1 opacity-75',
              )}
            >
              {selected ? t('term.months', { count: String(value) }) : value}
            </button>
          )
        })}
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3">
        <p className="text-sm opacity-75">{t('climit.forTerm')}</p>
        <p className="text-3xl font-bold">{formatSum(limits[term])}</p>
        <p className="text-sm opacity-75">{t('climit.hint')}</p>
      </div>
    </section>
  )
}
