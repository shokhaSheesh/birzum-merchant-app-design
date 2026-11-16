import { useState } from 'react'
import type { Fulfilment } from '@/entities/clients/clients'
import { useI18n } from '@/shared/i18n/useI18n'
import { AddressField } from '@/shared/ui/AddressField'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/ui/PageHeader'
import { TextAreaField } from '@/shared/ui/TextAreaField'
import { TextField } from '@/shared/ui/TextField'

const NOTE_MAX = 200

type Props = {
  fulfilment: Fulfilment
  onSave: (fulfilment: Fulfilment) => void
  onClose: () => void
}

/**
 * Where to deliver, on its own page opened from checkout: the address (typed or picked on the
 * map, required), then house, apartment, entrance, floor and a note for the courier (optional).
 * «Saqlash» brings the shopper back to checkout with the address filled in.
 */
export function DeliveryAddressPage({ fulfilment, onSave, onClose }: Props) {
  const { t } = useI18n()
  const [draft, setDraft] = useState(fulfilment)
  const [submitted, setSubmitted] = useState(false)
  const set = (patch: Partial<Fulfilment>) => setDraft((current) => ({ ...current, ...patch }))
  const missing = draft.address.trim() === ''

  const save = () => {
    setSubmitted(true)
    if (missing) return
    onSave({ ...draft, address: draft.address.trim(), note: draft.note?.trim() })
    onClose()
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('delivery.address')} onBack={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-2 pb-6">
        <AddressField
          label={t('address.street')}
          value={
            draft.address
              ? { lat: draft.point?.lat ?? NaN, lng: draft.point?.lng ?? NaN, text: draft.address }
              : null
          }
          onChange={(place) =>
            set({
              address: place?.text ?? '',
              point:
                place && Number.isFinite(place.lat)
                  ? { lat: place.lat, lng: place.lng }
                  : undefined,
            })
          }
          error={submitted && missing ? t('error.required') : undefined}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t('address.house')}
            value={draft.house ?? ''}
            onChange={(e) => set({ house: e.target.value })}
          />
          <TextField
            label={t('address.apartment')}
            inputMode="numeric"
            value={draft.apartment ?? ''}
            onChange={(e) => set({ apartment: e.target.value })}
          />
          <TextField
            label={t('address.entrance')}
            inputMode="numeric"
            value={draft.entrance ?? ''}
            onChange={(e) => set({ entrance: e.target.value })}
          />
          <TextField
            label={t('address.floor')}
            inputMode="numeric"
            value={draft.floor ?? ''}
            onChange={(e) => set({ floor: e.target.value })}
          />
        </div>
        <TextAreaField
          label={t('address.note')}
          rows={2}
          maxLength={NOTE_MAX}
          value={draft.note ?? ''}
          onChange={(e) => set({ note: e.target.value })}
          labelEnd={
            <span className="text-sm text-ink-subtle tabular-nums">
              {(draft.note ?? '').length}/{NOTE_MAX}
            </span>
          }
        />
      </div>
      <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Button block onClick={save}>
          {t('common.save')}
        </Button>
      </footer>
    </div>
  )
}
