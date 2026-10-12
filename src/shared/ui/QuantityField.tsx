import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { controlClass } from './control'
import { Field } from './Field'

type StepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  /** For screen readers, and the input's id when a visible label points at it. */
  label: string
  id?: string
}

const stepButton =
  'grid size-10 shrink-0 place-items-center rounded-full text-brand active:bg-surface disabled:text-navy-200'

/** Minus, number, plus in one control box. Use `QuantityField` when it needs a visible label. */
export function QuantityStepper({ value, onChange, min = 1, max = 99, label, id }: StepperProps) {
  const { t } = useI18n()
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div className={controlClass(false, 'px-1.5')}>
      <button
        type="button"
        aria-label={t('quantity.decrease')}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={stepButton}
      >
        <Minus size={20} />
      </button>
      <input
        id={id}
        aria-label={label}
        inputMode="numeric"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-center text-base font-semibold outline-none"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value.replace(/\D/g, '')) || min))}
      />
      <button
        type="button"
        aria-label={t('quantity.increase')}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={stepButton}
      >
        <Plus size={20} />
      </button>
    </div>
  )
}

type Props = Omit<StepperProps, 'id'>

/** A small count with minus and plus buttons under a visible label. The number can also be typed. */
export function QuantityField(props: Props) {
  const id = useId()

  return (
    <Field label={props.label} htmlFor={id}>
      <QuantityStepper {...props} id={id} />
    </Field>
  )
}
