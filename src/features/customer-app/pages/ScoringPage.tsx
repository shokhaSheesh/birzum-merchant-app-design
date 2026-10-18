import { Check, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { calculateLimit } from '@/entities/clients/limitsApi'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { ScoringIllustration, type ScoringState } from '../components/ScoringIllustration'

const STEPS: TranslationKey[] = [
  'scoring.step.identity',
  'scoring.step.history',
  'scoring.step.limit',
]
const STEP_MS = 1300

/**
 * Getting a limit: the checks run one after another with a moving gauge, then the result.
 * `?result=declined` shows the refusal, which the mock never produces on its own.
 */
export function ScoringPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const customer = useCustomer()
  const declined = useSearchParams()[0].get('result') === 'declined'
  const [step, setStep] = useState(0)
  const [state, setState] = useState<ScoringState>('checking')

  useEffect(() => {
    const ticker = setInterval(() => setStep((n) => Math.min(n + 1, STEPS.length)), STEP_MS)
    let alive = true
    const run = declined
      ? new Promise((resolve) => setTimeout(resolve, STEP_MS * STEPS.length))
      : calculateLimit(customer?.id ?? '')
    void run.then(() => {
      if (!alive) return
      setStep(STEPS.length)
      setState(declined ? 'declined' : 'approved')
    })
    return () => {
      alive = false
      clearInterval(ticker)
    }
    // Runs once, when the screen opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const highest = customer?.limits ? Math.max(...Object.values(customer.limits)) : 0
  const retryOn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const home = () => navigate(ROUTES.customerHome, { replace: true })

  return (
    <div className="flex h-full flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <ScoringIllustration state={state} className="w-full max-w-72" />

        {state === 'checking' && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-balance">{t('scoring.title')}</h1>
              <p className="text-ink-muted">{t('scoring.hint')}</p>
            </div>
            <ol className="flex w-full max-w-80 flex-col gap-3 rounded-card border border-line bg-canvas p-4 text-left">
              {STEPS.map((key, i) => {
                const done = i < step
                const current = i === step
                return (
                  <li key={key} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-full transition-colors',
                        done ? 'bg-green-500 text-navy-950' : 'bg-navy-100 text-ink-muted',
                      )}
                    >
                      {done ? (
                        <Check size={16} strokeWidth={3} />
                      ) : current ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </span>
                    <span className={cn('font-medium', !done && !current && 'text-ink-muted')}>
                      {t(key)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </>
        )}

        {state === 'approved' && (
          <div className="flex flex-col gap-1.5">
            <p className="font-semibold text-ink-muted">{t('scoring.approved.title')}</p>
            <h1 className="text-3xl font-bold">
              {t('climit.upToAmount', { amount: formatSum(highest) })}
            </h1>
            {customer?.limitExpiresOn && (
              <p className="text-ink-muted">
                {t('climit.validUntil', { date: formatDate(customer.limitExpiresOn) })}
              </p>
            )}
          </div>
        )}

        {state === 'declined' && (
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-balance">{t('scoring.declined.title')}</h1>
            <p className="text-ink-muted">
              {t('scoring.declined.hint', { date: formatDate(retryOn) })}
            </p>
          </div>
        )}
      </div>

      {state !== 'checking' && (
        <Button block onClick={home}>
          {t(state === 'approved' ? 'scoring.approved.go' : 'scoring.declined.go')}
        </Button>
      )}
    </div>
  )
}
