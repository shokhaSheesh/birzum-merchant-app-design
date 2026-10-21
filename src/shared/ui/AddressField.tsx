import { Map as MapIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import type { Place } from '@/shared/lib/geocode'
import { controlClass, inputClass } from './control'
import { Field } from './Field'
import { MapPicker } from './MapPicker'

type Props = {
  label: string
  hint?: string
  error?: string
  placeholder?: string
  value: Place | null
  onChange: (value: Place | null) => void
}

/**
 * An address: typed, or picked on the map from the map button at the right of the box. A
 * typed address has no point on the map until it is picked there.
 */
export function AddressField({ label, hint, error, placeholder, value, onChange }: Props) {
  const { t } = useI18n()
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <div className={controlClass(!!error, 'pr-1.5')}>
        <input
          id={id}
          autoComplete="street-address"
          aria-invalid={!!error || undefined}
          placeholder={placeholder}
          value={value?.text ?? ''}
          onChange={(e) =>
            onChange(e.target.value ? { lat: NaN, lng: NaN, text: e.target.value } : null)
          }
          className={inputClass}
        />
        <button
          type="button"
          aria-label={t('map.open')}
          onClick={() => setOpen(true)}
          className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-green-200 text-brand active:bg-green-300"
        >
          <MapIcon size={20} />
        </button>
      </div>
      <MapPicker
        open={open}
        title={label}
        value={value && Number.isFinite(value.lat) ? value : null}
        onClose={() => setOpen(false)}
        onPick={(place) => {
          onChange(place)
          setOpen(false)
        }}
      />
    </Field>
  )
}
