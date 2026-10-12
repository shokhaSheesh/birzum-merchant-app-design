import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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

type Mode = 'days' | 'years' | 'months'

const EARLIEST_YEAR = 1930
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()
const navButton =
  'grid size-10 place-items-center rounded-full text-navy-900 active:bg-surface disabled:text-navy-200'
const cell = 'grid place-items-center rounded-control text-base disabled:text-navy-200'
const cellSelected = 'bg-navy-900 font-semibold text-white'

export function DatePicker({ label, value, onChange, min, max, error, hint }: Props) {
  const { t, lang } = useI18n()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('days')
  const [today] = useState(() => new Date())
  const [view, setView] = useState(today)
  const { months, weekdays } = calendarNames[lang]

  const minDay = min && startOfDay(min)
  const maxDay = max && startOfDay(max)
  const firstYear = minDay?.getFullYear() ?? EARLIEST_YEAR
  const lastYear = maxDay?.getFullYear() ?? today.getFullYear() + 10

  const year = view.getFullYear()
  const month = view.getMonth()
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayDisabled = (day: Date) =>
    (minDay !== undefined && day < minDay) || (maxDay !== undefined && day > maxDay)
  const monthDisabled = (y: number, m: number) =>
    (minDay !== undefined && new Date(y, m + 1, 0) < minDay) ||
    (maxDay !== undefined && new Date(y, m, 1) > maxDay)

  const openSheet = () => {
    // Start on the chosen date, or the nearest allowed month to today
    const start =
      value ?? (maxDay && today > maxDay ? maxDay : minDay && today < minDay ? minDay : today)
    setView(start)
    setMode('days')
    setOpen(true)
  }

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openSheet}
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
            disabled={mode !== 'days' || monthDisabled(year, month - 1)}
            onClick={() => setView(new Date(year, month - 1, 1))}
            className={navButton}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label={t('calendar.pickYear')}
            aria-expanded={mode !== 'days'}
            onClick={() => setMode(mode === 'days' ? 'years' : 'days')}
            className="flex h-10 items-center gap-1 rounded-full px-3 text-base font-semibold active:bg-surface"
          >
            {mode === 'years' ? year : `${months[month]} ${year}`}
            <ChevronDown
              size={18}
              className={cn(
                'text-ink-subtle transition-transform',
                mode !== 'days' && 'rotate-180',
              )}
            />
          </button>
          <button
            type="button"
            aria-label={t('calendar.next')}
            disabled={mode !== 'days' || monthDisabled(year, month + 1)}
            onClick={() => setView(new Date(year, month + 1, 1))}
            className={navButton}
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {mode === 'years' && (
          <div className="grid max-h-72 grid-cols-4 gap-1.5 overflow-y-auto pb-1">
            {Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
              const y = firstYear + i
              return (
                <button
                  key={y}
                  type="button"
                  ref={y === year ? (el) => el?.scrollIntoView({ block: 'center' }) : undefined}
                  onClick={() => {
                    setView(new Date(y, month, 1))
                    setMode('months')
                  }}
                  className={cn(cell, 'h-11', y === year ? cellSelected : 'active:bg-surface')}
                >
                  {y}
                </button>
              )
            })}
          </div>
        )}

        {mode === 'months' && (
          <div className="grid grid-cols-3 gap-1.5 pb-1">
            {months.map((name, m) => (
              <button
                key={name}
                type="button"
                disabled={monthDisabled(year, m)}
                onClick={() => {
                  setView(new Date(year, m, 1))
                  setMode('days')
                }}
                className={cn(cell, 'h-13', m === month ? cellSelected : 'active:bg-surface')}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {mode === 'days' && (
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
                  disabled={dayDisabled(day)}
                  aria-pressed={selected}
                  onClick={() => {
                    onChange(day)
                    setOpen(false)
                  }}
                  className={cn(
                    'grid size-11 place-items-center rounded-full text-base disabled:text-navy-200',
                    selected
                      ? cellSelected
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
        )}
      </Sheet>
    </Field>
  )
}
