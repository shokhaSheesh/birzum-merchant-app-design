import { Delete, ScanFace } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  value: string
  onChange: (value: string) => void
  length: number
  /** Turns the dots red and shakes them, e.g. after a wrong PIN. */
  error?: boolean
  /** Shows the Face ID key at the bottom left. */
  onBiometric?: () => void
}

const key =
  'grid h-16 place-items-center rounded-full text-2xl font-semibold transition-colors active:bg-surface'

/** Dots for the digits typed so far, and a phone-style number pad. Works with a keyboard too. */
export function PinPad({ value, onChange, length, error, onBiometric }: Props) {
  const { t } = useI18n()
  // Keys can arrive faster than re-renders: track the latest value outside React state
  const latest = useRef(value)
  useEffect(() => {
    latest.current = value
  }, [value])
  const set = (next: string) => {
    latest.current = next
    onChange(next)
  }
  const press = (digit: string) => {
    if (latest.current.length < length) set(latest.current + digit)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        if (latest.current.length < length) set(latest.current + e.key)
      } else if (e.key === 'Backspace') set(latest.current.slice(0, -1))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  return (
    <div className="flex flex-col items-center gap-10">
      <div
        role="status"
        aria-label={t('pin.entered', { count: String(value.length), total: String(length) })}
        className={cn('flex gap-4', error && 'pin-shake')}
      >
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-4 rounded-full border-2 transition-colors',
              error
                ? 'border-danger bg-danger'
                : i < value.length
                  ? 'border-primary bg-primary'
                  : 'border-navy-400',
            )}
          />
        ))}
      </div>

      <div className="grid w-full max-w-72 grid-cols-3 gap-x-6 gap-y-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button key={digit} type="button" onClick={() => press(digit)} className={key}>
            {digit}
          </button>
        ))}
        {onBiometric ? (
          <button
            type="button"
            aria-label={t('pin.biometric')}
            onClick={onBiometric}
            className={cn(key, 'text-brand')}
          >
            <ScanFace size={30} />
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => press('0')} className={key}>
          0
        </button>
        <button
          type="button"
          aria-label={t('pin.delete')}
          onClick={() => set(latest.current.slice(0, -1))}
          className={cn(key, 'text-ink-muted')}
        >
          <Delete size={26} />
        </button>
      </div>
    </div>
  )
}
