import { Calculator, FileSignature, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientContractPath, clientLimitPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { TermPicker } from '@/shared/ui/TermPicker'
import { TERMS, type Client, type Term } from '@/entities/clients/clients'

/**
 * The screen's one primary action lives here, so the card is tinted to stand out. «Limit
 * soʻrash» opens its own screen, where FlexSoft checks the client; while it checks, the card
 * says so. With a limit, the term's amount and how long it is valid.
 */
export function LimitCard({ client }: { client: Client }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [term, setTerm] = useState<Term>(12)
  const request = () => navigate(clientLimitPath(client.id))

  if (client.limitRequestedAt) {
    return (
      <section className="flex items-center gap-3 rounded-card bg-green-200 p-4">
        <LoaderCircle size={22} className="shrink-0 animate-spin text-navy-700" />
        <div className="flex flex-col gap-0.5">
          <h2 className="font-bold">{t('mlimit.pending.title')}</h2>
          <p className="text-sm text-navy-700">{t('mlimit.pending.hint')}</p>
        </div>
      </section>
    )
  }

  if (client.limits === null) {
    return (
      <section className="flex flex-col gap-4 rounded-card bg-green-200 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">{t('client.limit')}</h2>
          <p className="text-sm text-navy-700">{t('client.limit.hint')}</p>
        </div>
        <Button block onClick={request}>
          <Calculator size={20} />
          {t('mlimit.request')}
        </Button>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 rounded-card bg-green-200 p-4">
      <h2 className="text-lg font-bold">{t('client.limit')}</h2>
      <TermPicker terms={TERMS} value={term} onChange={setTerm} />
      <div className="flex flex-col">
        <p className="text-sm text-navy-700">{t('client.limit.available')}</p>
        <p className="text-3xl font-bold">{formatSum(client.limits[term])}</p>
        {client.limitExpiresOn && (
          <p className="text-sm text-navy-700">
            {t('climit.validUntil', { date: formatDate(client.limitExpiresOn) })}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Button block onClick={() => navigate(clientContractPath(client.id, term))}>
          <FileSignature size={20} />
          {t('client.limit.start')}
        </Button>
        <Button variant="ghost" block onClick={request}>
          {t('mlimit.again')}
        </Button>
      </div>
    </section>
  )
}
