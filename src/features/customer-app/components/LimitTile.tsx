import { useState } from 'react'
import { TERMS, type Client, type Term } from '@/entities/clients/clients'
import { availableLimit, usedShare } from '@/entities/clients/limitUsage'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'

/**
 * The shopper's limit for each installment length: pick a term on top, read below what is
 * still available, how much of it open purchases use, and until when the limit is valid.
 */
export function LimitTile({ client, limits }: { client: Client; limits: Record<Term, number> }) {
  const { t } = useI18n()
  const [term, setTerm] = useState<Term>(12)
  const share = usedShare(client)
  const used = Math.round(limits[term] * share)

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
      <div className="flex flex-col gap-2 px-3 pb-3">
        <div className="flex flex-col">
          <p className="text-sm text-ink-muted">{t('climit.available')}</p>
          <p className="text-3xl font-bold">{formatSum(availableLimit(client, term))}</p>
        </div>
        <div
          role="progressbar"
          aria-label={t('climit.used')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(share * 100)}
          className="h-1.5 overflow-hidden rounded-full bg-white/70 dark:bg-canvas/40"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${share * 100}%` }} />
        </div>
        <div className="flex items-baseline justify-between gap-3 text-sm text-ink-muted">
          <p>
            {t('climit.used')}: <span className="font-semibold text-ink">{formatSum(used)}</span>
          </p>
          <p>{formatSum(limits[term])}</p>
        </div>
        {client.limitExpiresOn && (
          <p className="text-sm text-ink-muted">
            {t('climit.validUntil', { date: formatDate(client.limitExpiresOn) })}
          </p>
        )}
      </div>
    </section>
  )
}
