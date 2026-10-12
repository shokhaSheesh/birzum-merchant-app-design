import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { controlClass } from './control'
import { Field } from './Field'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

const stepButton =
  'grid size-10 shrink-0 place-items-center rounded-full text-navy-900 active:bg-surface disabled:text-navy-200'

/** A small count with minus and plus buttons. The number can also be typed. */
export function QuantityField({ label, value, onChange, min = 1, max = 99 }: Props) {
  const { t } = useI18n()
  const id = useId()
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <Field label={label} htmlFor={id}>
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
    </Field>
  )
}
