import { SWATCH_PRESETS } from '@/entities/catalog/attributes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = { value: string | undefined; onChange: (swatch: string) => void }

/** A row of round color dots for giving a color value its color. */
export function SwatchPicker({ value, onChange }: Props) {
  const { t } = useI18n()

  return (
    <div role="radiogroup" aria-label={t('variation.swatch')} className="flex flex-wrap gap-2">
      {SWATCH_PRESETS.map((swatch) => (
        <button
          key={swatch}
          type="button"
          role="radio"
          aria-checked={value === swatch}
          aria-label={swatch}
          onClick={() => onChange(swatch)}
          className={cn(
            'size-9 rounded-full border-2 p-0.5',
            value === swatch ? 'border-primary' : 'border-transparent',
          )}
        >
          <span
            className="block size-full rounded-full border border-line"
            style={{ background: swatch }}
          />
        </button>
      ))}
    </div>
  )
}
