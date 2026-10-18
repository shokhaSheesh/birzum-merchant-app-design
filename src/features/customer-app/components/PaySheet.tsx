import { useState } from 'react'
import { payApplication, type PayChoice } from '@/entities/clients/applicationsApi'
import { cardLabel } from '@/entities/clients/cardBrand'
import type { Application, PaymentCard } from '@/entities/clients/clients'
import { remainingOf, type Payment } from '@/entities/clients/payments'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatSum } from '@/shared/lib/format'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { NumberField } from '@/shared/ui/NumberField'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'

type Props = {
  application: Application
  payment: Payment
  cards: PaymentCard[]
  onClose: () => void
}

type Kind = PayChoice['kind']

/**
 * Paying for a purchase: this month's payment, the whole remaining sum (closing the nasiya),
 * or any amount in between, which settles the last payments first so the nasiya ends sooner.
 */
export function PaySheet({ application, payment, cards, onClose }: Props) {
  const { t } = useI18n()
  const left = remainingOf(application)
  const [kind, setKind] = useState<Kind>('next')
  const [amount, setAmount] = useState<number | null>(null)
  const [cardId, setCardId] = useState<string | null>(
    cards.find((card) => card.id === application.details?.cardId)?.id ?? cards[0]?.id ?? null,
  )
  const [loading, setLoading] = useState(false)

  const sum = kind === 'next' ? payment.amount : kind === 'full' ? left : (amount ?? 0)
  const amountError =
    kind === 'amount' && amount !== null && amount > left
      ? t('pay.error.tooMuch', { amount: formatSum(left) })
      : undefined
  const ready = !!cardId && sum > 0 && !amountError

  const pay = async () => {
    setLoading(true)
    await payApplication(
      application.id,
      kind === 'amount' ? { kind, amount: sum } : ({ kind } as PayChoice),
    )
    toast(t(kind === 'full' || sum >= left ? 'pay.done.closed' : 'pay.done'))
    onClose()
  }

  const options: { kind: Kind; title: string; value?: string; hint: string }[] = [
    {
      kind: 'next',
      title: t('pay.next'),
      value: formatSum(payment.amount),
      hint:
        payment.state === 'overdue'
          ? t('pay.next.overdue')
          : t('pay.next.hint', { date: formatDate(payment.dueDate) }),
    },
    { kind: 'full', title: t('pay.full'), value: formatSum(left), hint: t('pay.full.hint') },
    { kind: 'amount', title: t('pay.amount'), hint: t('pay.amount.hint') },
  ]

  return (
    <Sheet open onClose={onClose} title={t('pay.title')}>
      <div className="flex flex-col gap-4 pt-1 pb-1">
        <div role="radiogroup" aria-label={t('pay.title')} className="flex flex-col gap-2">
          {options.map((option) => {
            const selected = option.kind === kind
            return (
              <button
                key={option.kind}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setKind(option.kind)}
                className={cn(
                  'flex items-start gap-3 rounded-control border-[1.5px] p-3.5 text-left transition-colors',
                  selected ? 'border-primary bg-green-200' : 'border-line active:bg-navy-100',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2',
                    selected ? 'border-primary' : 'border-navy-400',
                  )}
                >
                  {selected && <span className="size-2.5 rounded-full bg-primary" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{option.title}</span>
                    {option.value && <span className="shrink-0 font-bold">{option.value}</span>}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      option.kind === 'next' && payment.state === 'overdue'
                        ? 'text-danger'
                        : 'text-ink-muted',
                    )}
                  >
                    {option.hint}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {kind === 'amount' && (
          <NumberField
            label={t('pay.amount.field')}
            value={amount}
            onChange={setAmount}
            suffix={t('common.currency')}
            maxDigits={10}
            error={amountError}
          />
        )}

        <Select
          label={t('field.card')}
          options={cards.map((card) => ({ value: card.id, label: cardLabel(card) }))}
          value={cardId}
          onChange={setCardId}
        />
        <Button
          block
          loading={loading}
          disabled={!ready}
          className="mt-1"
          onClick={() => void pay()}
        >
          {sum > 0 ? t('purchase.pay.button', { amount: formatSum(sum) }) : t('pay.submit')}
        </Button>
      </div>
    </Sheet>
  )
}
