import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Sheet } from './Sheet'

export type Option<T extends string> = { value: T; label: string }

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
            <li key={option.value} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value)
                  onClose()
                }}
                className={cn(
                  'flex h-13 w-full items-center justify-between rounded-control px-4 text-left text-base',
                  selected ? 'bg-green-200 font-semibold' : 'active:bg-surface',
                )}
              >
                {option.label}
                {selected && <Check size={20} className="text-navy-900" />}
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
