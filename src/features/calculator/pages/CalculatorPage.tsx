import { useState, type FormEvent } from 'react'
import {
  allInstallmentTerms,
  MIN_APPLICATION_TOTAL,
  type InstallmentTerms,
} from '@/entities/clients/installment'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { NumberField } from '@/shared/ui/NumberField'
import { Section } from '@/shared/ui/Section'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Quick quote: amount and down payment in, the terms for every installment length out. */
export function CalculatorPage() {
  const { t } = useI18n()
  const [amount, setAmount] = useState<number | null>(null)
  const [downPayment, setDownPayment] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inputs: string; terms: InstallmentTerms[] } | null>(null)

  // Results are only shown for the numbers they were calculated from
  const inputs = `${amount}/${downPayment}`
  const terms = result?.inputs === inputs ? result.terms : null

  const amountError =
    (amount ?? 0) < MIN_APPLICATION_TOTAL
      ? t('error.minTotal', { amount: formatSum(MIN_APPLICATION_TOTAL) })
      : undefined
  const downPaymentError =
    !amountError && (downPayment ?? 0) >= (amount ?? 0) ? t('error.downPayment') : undefined

  const calculate = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (amountError || downPaymentError) return
    setLoading(true)
    await delay(500) // stands in for the request to the backend
    setResult({ inputs, terms: allInstallmentTerms((amount ?? 0) - (downPayment ?? 0)) })
    setLoading(false)
  }

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <form
        id="calculator"
        onSubmit={(e) => void calculate(e)}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('nav.calculator')}</h1>
          <p className="text-ink-muted">{t('calculator.hint')}</p>
        </div>
        <NumberField
          label={t('field.amount')}
          value={amount}
          onChange={setAmount}
          suffix={t('common.currency')}
          maxDigits={10}
          error={submitted ? amountError : undefined}
        />
        <NumberField
          label={t('field.downPayment')}
          value={downPayment}
          onChange={setDownPayment}
          suffix={t('common.currency')}
          maxDigits={10}
          error={submitted ? downPaymentError : undefined}
        />
      </form>

      {terms && (
        <Section title={t('contract.conditions')}>
          {terms.map((item) => (
            <InstallmentTermsCard key={item.term} terms={item} />
          ))}
        </Section>
      )}

      {/* Stays in view above the tab bar while the results scroll under it */}
      <div className="sticky bottom-0 -mx-5 mt-auto border-t border-line bg-canvas px-5 pt-3 pb-tabbar">
        <Button type="submit" form="calculator" block loading={loading}>
          {t('calculator.submit')}
        </Button>
      </div>
    </div>
  )
}
