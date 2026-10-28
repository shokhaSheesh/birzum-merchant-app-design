import { Check, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { TERMS } from '@/entities/clients/clients'
import { useClient } from '@/entities/clients/useClients'
import {
  ScoringIllustration,
  type ScoringState,
} from '@/features/customer-app/components/ScoringIllustration'
import { clientContractPath, clientPath, ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { calculateLimit } from '../api/mockClients'

// What FlexSoft checks before it answers with a limit for each term
const STEPS: TranslationKey[] = [
  'mlimit.step.card',
  'mlimit.step.mib',
  'mlimit.step.salary',
  'mlimit.step.katm',
  'mlimit.step.limit',
]
const STEP_MS = 850

/**
 * Asking FlexSoft for a client's limit, from the client's page in the shop: the checks run
 * one after another, then either the limit for every term or a refusal with FlexSoft's reason.
 * Leaving early is fine: the client's page shows the request as being checked until it answers.
 * `?result=declined` shows the refusal, which the mock never produces on its own.
 */
export function LimitRequestPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const client = useClient(id)
  const declined = useSearchParams()[0].get('result') === 'declined'
  const [step, setStep] = useState(0)
  const [state, setState] = useState<ScoringState>('checking')

  useEffect(() => {
    const ticker = setInterval(() => setStep((n) => Math.min(n + 1, STEPS.length)), STEP_MS)
    let alive = true
    const run = declined
      ? new Promise((resolve) => setTimeout(resolve, STEP_MS * STEPS.length))
      : calculateLimit(id)
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

  if (!client) return <Navigate to={ROUTES.clients} replace />
  const back = () => navigate(clientPath(client.id), { replace: true })

  return (
    <div className="flex h-full flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <ScoringIllustration state={state} className="w-full max-w-64" />

        {state === 'checking' && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-balance">{t('mlimit.title')}</h1>
              <p className="text-ink-muted">
                {t('mlimit.hint', { name: `${client.firstName} ${client.lastName}` })}
              </p>
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

        {state === 'approved' && client.limits && (
          <div className="flex w-full max-w-80 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">{t('mlimit.approved.title')}</h1>
              {client.limitExpiresOn && (
                <p className="text-ink-muted">
                  {t('climit.validUntil', { date: formatDate(client.limitExpiresOn) })}
                </p>
              )}
            </div>
            <ul className="rounded-card border border-line bg-canvas px-4 text-left">
              {TERMS.map((term) => (
                <li
                  key={term}
                  className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 last:border-b-0"
                >
                  <span className="text-ink-muted">
                    {t('term.months', { count: String(term) })}
                  </span>
                  <span className="font-bold">{formatSum(client.limits![term])}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {state === 'declined' && (
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-balance">{t('mlimit.declined.title')}</h1>
            <p className="text-ink-muted">{t('mlimit.declined.reason')}</p>
          </div>
        )}
      </div>

      {state === 'approved' && (
        <div className="flex flex-col gap-1">
          <Button
            block
            onClick={() => navigate(clientContractPath(client.id, 12), { replace: true })}
          >
            {t('client.limit.start')}
          </Button>
          <Button variant="ghost" block onClick={back}>
            {t('mlimit.back')}
          </Button>
        </div>
      )}
      {state === 'declined' && (
        <Button block onClick={back}>
          {t('mlimit.back')}
        </Button>
      )}
    </div>
  )
}
