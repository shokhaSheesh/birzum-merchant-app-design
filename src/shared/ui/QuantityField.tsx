import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
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
  /** `sm` is the compact one for rows, such as a cart line. */
  size?: 'md' | 'sm'
}

const stepButton =
  'grid shrink-0 place-items-center rounded-full text-brand active:bg-surface disabled:text-navy-200'

/** Minus, number, plus in one control box. Use `QuantityField` when it needs a visible label. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  id,
  size = 'md',
}: StepperProps) {
  const { t } = useI18n()
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const small = size === 'sm'
  const button = cn(stepButton, small ? 'size-8' : 'size-10')
  const icon = small ? 16 : 20

  return (
    <div
      className={controlClass(
        false,
        small ? 'h-10! w-28! shrink-0 gap-0! rounded-xl! px-1!' : 'px-1.5',
      )}
    >
      <button
        type="button"
        aria-label={t('quantity.decrease')}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={button}
      >
        <Minus size={icon} />
      </button>
      <input
        id={id}
        aria-label={label}
        inputMode="numeric"
        autoComplete="off"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-center font-semibold outline-none',
          small ? 'text-sm' : 'text-base',
        )}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value.replace(/\D/g, '')) || min))}
      />
      <button
        type="button"
        aria-label={t('quantity.increase')}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={button}
      >
        <Plus size={icon} />
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
