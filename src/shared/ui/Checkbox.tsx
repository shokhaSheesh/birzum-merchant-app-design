import { Check } from 'lucide-react'
import { useId } from 'react'

type Props = {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ label, description, checked, onChange, disabled }: Props) {
  const id = useId()

  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 py-1">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-[1.5px] border-navy-400 text-transparent transition-colors peer-checked:border-navy-900 peer-checked:bg-navy-900 peer-checked:text-white peer-focus-visible:ring-3 peer-focus-visible:ring-green-200 peer-disabled:opacity-45">
        <Check size={16} strokeWidth={3} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 peer-disabled:opacity-45">
        <span className="text-base font-medium">{label}</span>
        {description && <span className="text-sm text-ink-muted">{description}</span>}
      </span>
    </label>
  )
}
