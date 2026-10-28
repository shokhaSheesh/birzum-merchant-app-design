import { MapPin, TriangleAlert } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'

type Props = {
  /** The shop and, when known, the filial the goods came from. */
  shop: string
  address?: string
  downPayment: number
  onClose: () => void
}

/**
 * The client asks how to return goods. There is no return in the app: it is done at the shop,
 * where the seller starts it and the client confirms with the SMS code. The shop gives back the
 * down payment itself.
 */
export function ReturnInfoSheet({ shop, address, downPayment, onClose }: Props) {
  const { t } = useI18n()
  const steps = [
    t('returnInfo.step.go'),
    t('returnInfo.step.code'),
    t('returnInfo.step.done'),
    ...(downPayment > 0
      ? [t('returnInfo.step.downPayment', { amount: formatSum(downPayment) })]
      : []),
  ]

  return (
    <Sheet open onClose={onClose} title={t('returnInfo.title')}>
      <div className="flex flex-col gap-4 pt-1 pb-1">
        <p>{t('returnInfo.intro')}</p>
        <div className="flex items-center gap-3 rounded-control border border-line px-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-green-200 text-brand">
            <MapPin size={20} />
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="font-semibold">{shop}</p>
            {address && <p className="text-sm text-ink-muted">{address}</p>}
          </div>
        </div>
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-green-200 text-sm font-bold">
                {i + 1}
              </span>
              <span className="text-[15px] leading-snug">{step}</span>
            </li>
          ))}
        </ol>
        <p className="flex gap-2.5 rounded-control bg-warning-soft px-4 py-3 text-sm text-warning">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          {t('returnInfo.warning')}
        </p>
        <Button block onClick={onClose}>
          {t('returnInfo.ok')}
        </Button>
      </div>
    </Sheet>
  )
}
