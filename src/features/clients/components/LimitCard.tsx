import { Calculator } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { calculateLimit } from '../api/mockClients'
import type { Client } from '../data/clients'

/** The screen's one primary action lives here, so the card is tinted to stand out. */
export function LimitCard({ client }: { client: Client }) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  const calculate = async () => {
    setLoading(true)
    await calculateLimit(client.id)
    setLoading(false)
  }

  return (
    <section className="flex flex-col gap-4 rounded-card bg-green-200 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{t('client.limit')}</h2>
        {client.limit === null ? (
          <p className="text-sm text-navy-700">{t('client.limit.hint')}</p>
        ) : (
          <>
            <p className="text-sm text-navy-700">{t('client.limit.available')}</p>
            <p className="text-3xl font-bold">{formatSum(client.limit)}</p>
          </>
        )}
      </div>
      {client.limit === null ? (
        <Button block loading={loading} onClick={() => void calculate()}>
          <Calculator size={20} />
          {t('client.limit.calculate')}
        </Button>
      ) : (
        <Button variant="ghost" block loading={loading} onClick={() => void calculate()}>
          {t('client.limit.recalculate')}
        </Button>
      )}
    </section>
  )
}
