import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Sheet } from './Sheet'

export type Option<T extends string> = {
  value: T
  label: string
  /** Shown but not pickable, with `hint` saying why. */
  disabled?: boolean
  hint?: string
}

type Props<T extends string> = {
  open: boolean
  onClose: () => void
  title: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
}

/** The option list behind every dropdown. Picking an option closes the sheet. */
export function OptionSheet<T extends string>({
  open,
  onClose,
  title,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <ul role="listbox" aria-label={title} className="flex flex-col gap-1 pb-1">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <li
              key={option.value}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
            >
              <button
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value)
                  onClose()
                }}
                className={cn(
                  'flex min-h-13 w-full items-center justify-between gap-3 rounded-control px-4 py-2 text-left text-base',
                  selected ? 'bg-green-200 font-semibold' : 'active:bg-navy-100',
                  option.disabled && 'cursor-not-allowed active:bg-transparent',
                )}
              >
                <span className="flex flex-col gap-0.5">
                  <span className={cn(option.disabled && 'text-ink-subtle')}>{option.label}</span>
                  {option.hint && <span className="text-sm text-ink-muted">{option.hint}</span>}
                </span>
                {selected && <Check size={20} className="text-brand" />}
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
