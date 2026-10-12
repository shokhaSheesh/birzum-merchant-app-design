import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useId, useState } from 'react'
import { calendarNames } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { controlClass } from './control'
import { Field } from './Field'
import { Sheet } from './Sheet'

type Props = {
  label: string
  value: Date | null
  onChange: (value: Date) => void
  min?: Date
  max?: Date
  error?: string
  hint?: string
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()
const navButton = 'grid size-10 place-items-center rounded-full text-navy-900 active:bg-surface'

export function DatePicker({ label, value, onChange, min, max, error, hint }: Props) {
  const { t, lang } = useI18n()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => value ?? new Date())
  const [today] = useState(() => new Date())
  const { months, weekdays } = calendarNames[lang]

  const year = view.getFullYear()
  const month = view.getMonth()
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const isDisabled = (day: Date) =>
    (min !== undefined && day < startOfDay(min)) || (max !== undefined && day > startOfDay(max))

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setView(value ?? new Date())
          setOpen(true)
        }}
        className={controlClass(!!error)}
      >
        <span className={cn('min-w-0 flex-1', !value && 'text-ink-subtle')}>
          {value ? formatDate(value) : 'KK.OO.YYYY'}
        </span>
        <CalendarDays size={20} className="text-ink-subtle" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            aria-label={t('calendar.prev')}
            onClick={() => setView(new Date(year, month - 1, 1))}
            className={navButton}
          >
            <ChevronLeft size={22} />
          </button>
          <p className="text-base font-semibold" aria-live="polite">
            {months[month]} {year}
          </p>
          <button
            type="button"
            aria-label={t('calendar.next')}
            onClick={() => setView(new Date(year, month + 1, 1))}
            className={navButton}
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="grid grid-cols-7 justify-items-center gap-y-1 pb-1">
          {weekdays.map((name) => (
            <span key={name} className="py-1 text-xs font-semibold text-ink-subtle uppercase">
              {name}
            </span>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = new Date(year, month, i + 1)
            const selected = value !== null && sameDay(day, value)
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled(day)}
                aria-pressed={selected}
                onClick={() => {
                  onChange(day)
                  setOpen(false)
                }}
                className={cn(
                  'grid size-11 place-items-center rounded-full text-base disabled:text-navy-200',
                  selected
                    ? 'bg-navy-900 font-semibold text-white'
                    : sameDay(day, today)
                      ? 'font-semibold ring-[1.5px] ring-green-500 ring-inset active:bg-surface'
                      : 'active:bg-surface',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </Sheet>
    </Field>
  )
}
