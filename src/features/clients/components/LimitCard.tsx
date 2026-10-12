import { Calculator, FileSignature } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientContractPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { calculateLimit } from '../api/mockClients'
import { TERMS, type Client, type Term } from '@/entities/clients/clients'

/** The screen's one primary action lives here, so the card is tinted to stand out. */
export function LimitCard({ client }: { client: Client }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [term, setTerm] = useState<Term>(12)

  const calculate = async () => {
    setLoading(true)
    await calculateLimit(client.id)
    setLoading(false)
  }

  if (client.limits === null) {
    return (
      <section className="flex flex-col gap-4 rounded-card bg-green-200 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">{t('client.limit')}</h2>
          <p className="text-sm text-navy-700">{t('client.limit.hint')}</p>
        </div>
        <Button block loading={loading} onClick={() => void calculate()}>
          <Calculator size={20} />
          {t('client.limit.calculate')}
        </Button>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 rounded-card bg-green-200 p-4">
      <h2 className="text-lg font-bold">{t('client.limit')}</h2>
      <ChoiceGrid
        label={t('client.limit.term')}
        columns={6}
        options={TERMS.map((value) => ({
          value,
          label: String(value),
          description: t('common.months'),
        }))}
        value={term}
        onChange={setTerm}
      />
      <div className="flex flex-col">
        <p className="text-sm text-navy-700">{t('client.limit.available')}</p>
        <p className="text-3xl font-bold">{formatSum(client.limits[term])}</p>
      </div>
      <div className="flex flex-col gap-1">
        <Button block onClick={() => navigate(clientContractPath(client.id, term))}>
          <FileSignature size={20} />
          {t('client.limit.start')}
        </Button>
        <Button variant="ghost" block loading={loading} onClick={() => void calculate()}>
          {t('client.limit.recalculate')}
        </Button>
      </div>
    </section>
  )
}
