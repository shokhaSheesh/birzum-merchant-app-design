import { Check, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { controlClass } from '@/shared/ui/control'
import { Field } from '@/shared/ui/Field'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { TextField } from '@/shared/ui/TextField'
import { citiesOf, districtsOf, formatPlace, REGIONS, type HomeAddress } from '../regions'

type Props = {
  value: Partial<HomeAddress>
  onChange: (value: Partial<HomeAddress>) => void
  /** Set after a failed submit. */
  showErrors: boolean
  /** Whose address it is, for the hint: the shopper's own, or the client's in the shop. */
  whose: 'own' | 'client'
}

/**
 * Where the client lives now. Every field shows at once: viloyat, then shahar and tuman in one
 * list (one of each, or just one), then the MFY and the street typed in. Changing the viloyat
 * clears the shahar and tuman. The same block in the shopper's sign-up and the merchant's new client.
 */
export function HomeAddressFields({ value, onChange, showErrors, whose }: Props) {
  const { t, lang } = useI18n()
  const required = (filled: unknown) => (showErrors && !filled ? t('error.required') : undefined)

  return (
    <Section title={t('field.homeAddress')} hint={t(`field.homeAddress.hint.${whose}`)}>
      <Select
        label={t('field.region')}
        options={REGIONS.map((region) => ({ value: region.id, label: region.name[lang] }))}
        value={value.regionId ?? null}
        onChange={(regionId) => {
          const only = citiesOf(regionId)
          // A region with one city, like Toshkent shahri, picks it straight away
          onChange({
            ...value,
            regionId,
            cityId: only.length === 1 ? only[0].id : undefined,
            districtId: undefined,
          })
        }}
        error={required(value.regionId)}
      />
      <PlaceField
        value={value}
        onChange={(place) => onChange({ ...value, ...place })}
        error={required(value.cityId || value.districtId)}
      />
      <TextField
        label={t('field.mfy')}
        placeholder={t('field.mfy.placeholder')}
        value={value.mfy ?? ''}
        onChange={(e) => onChange({ ...value, mfy: e.target.value })}
        error={required(value.mfy?.trim())}
      />
      <TextField
        label={t('field.street')}
        placeholder={t('field.street.placeholder')}
        autoComplete="street-address"
        value={value.street ?? ''}
        onChange={(e) => onChange({ ...value, street: e.target.value })}
        error={required(value.street?.trim())}
      />
    </Section>
  )
}

type Place = Pick<HomeAddress, 'cityId' | 'districtId'>

/**
 * Shahar and tuman of the picked viloyat in one sheet. At most one of each: picking another
 * shahar swaps it, tapping the picked one clears it. Locked until a viloyat is chosen.
 */
function PlaceField({
  value,
  onChange,
  error,
}: {
  value: Partial<HomeAddress>
  onChange: (place: Place) => void
  error?: string
}) {
  const { t, lang } = useI18n()
  const id = useId()
  const [open, setOpen] = useState(false)
  const regionId = value.regionId ?? null
  const label = formatPlace(value, lang)

  const groups = [
    { key: 'cityId', title: t('field.city'), items: citiesOf(regionId) },
    { key: 'districtId', title: t('field.district'), items: districtsOf(regionId) },
  ] as const

  return (
    <Field
      label={t('field.cityDistrict')}
      htmlFor={id}
      error={error}
      hint={regionId ? t('field.cityDistrict.hint') : t('field.cityDistrict.needRegion')}
    >
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={!regionId}
        onClick={() => setOpen(true)}
        className={cn(controlClass(!!error), !regionId && 'cursor-not-allowed opacity-50')}
      >
        <span className={cn('min-w-0 flex-1 truncate', !label && 'text-ink-subtle')}>
          {label || t('common.select')}
        </span>
        <ChevronDown size={20} className="text-ink-subtle" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t('field.cityDistrict')}>
        <div className="flex flex-col gap-4 pb-1">
          {groups.map((group) =>
            group.items.length === 0 ? null : (
              <div key={group.key} className="flex flex-col gap-1">
                <p className="px-1 text-sm font-semibold text-ink-muted">{group.title}</p>
                <ul role="listbox" aria-label={group.title} className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const selected = value[group.key] === item.id
                    return (
                      <li key={item.id} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          onClick={() =>
                            onChange({
                              cityId: value.cityId,
                              districtId: value.districtId,
                              [group.key]: selected ? undefined : item.id,
                            })
                          }
                          className={cn(
                            'flex h-13 w-full items-center justify-between rounded-control px-4 text-left text-base',
                            selected ? 'bg-green-200 font-semibold' : 'active:bg-navy-100',
                          )}
                        >
                          {item.name[lang]}
                          {selected && <Check size={20} className="text-brand" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ),
          )}
          <Button
            block
            disabled={!value.cityId && !value.districtId}
            onClick={() => setOpen(false)}
          >
            {t('common.apply')}
          </Button>
        </div>
      </Sheet>
    </Field>
  )
}
