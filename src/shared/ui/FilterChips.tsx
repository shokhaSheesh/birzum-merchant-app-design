import { cn } from '@/shared/lib/cn'

type Props<T extends string> = {
  /** Read by screen readers. */
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** One-tap list filter. Scrolls sideways when the chips do not fit. */
export function FilterChips<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="-mx-5 flex scroll-px-5 gap-2 overflow-x-auto px-5"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors',
              selected ? 'bg-navy-900 text-white' : 'bg-surface text-navy-900 active:bg-navy-100',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
