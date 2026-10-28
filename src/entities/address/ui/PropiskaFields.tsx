import { useI18n } from '@/shared/i18n/useI18n'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'
import { TextField } from '@/shared/ui/TextField'
import { citiesOf, districtsOf, REGIONS, type Propiska } from '../regions'

type Props = {
  value: Partial<Propiska>
  onChange: (value: Partial<Propiska>) => void
  /** Set after a failed submit. */
  showErrors: boolean
  /** Whose address it is, for the hint: the shopper's own, or the client's in the shop. */
  whose: 'own' | 'client'
}

/**
 * The propiska address, step by step: viloyat, then shahar, then tuman, then the street and
 * house typed in. Each step opens once the one before it is picked; changing one clears the
 * steps after it. The same block in the shopper's sign-up and the merchant's new client.
 */
export function PropiskaFields({ value, onChange, showErrors, whose }: Props) {
  const { t, lang } = useI18n()
  const required = (filled: unknown) => (showErrors && !filled ? t('error.required') : undefined)
  const cities = citiesOf(value.regionId ?? null)
  const districts = districtsOf(value.regionId ?? null, value.cityId ?? null)

  return (
    <Section title={t('field.propiska')} hint={t(`field.propiska.hint.${whose}`)}>
      <Select
        label={t('field.region')}
        options={REGIONS.map((region) => ({ value: region.id, label: region.name[lang] }))}
        value={value.regionId ?? null}
        onChange={(regionId) => {
          const only = citiesOf(regionId)
          // A region with one city, like Toshkent shahri, picks it straight away
          onChange({
            regionId,
            cityId: only.length === 1 ? only[0].id : undefined,
            street: value.street,
          })
        }}
        error={required(value.regionId)}
      />
      {value.regionId && (
        <Select
          label={t('field.city')}
          options={cities.map((item) => ({ value: item.id, label: item.name[lang] }))}
          value={value.cityId ?? null}
          onChange={(cityId) => onChange({ ...value, cityId, districtId: undefined })}
          error={required(value.cityId)}
        />
      )}
      {value.cityId && (
        <Select
          label={t('field.district')}
          options={districts.map((item) => ({ value: item.id, label: item.name[lang] }))}
          value={value.districtId ?? null}
          onChange={(districtId) => onChange({ ...value, districtId })}
          error={required(value.districtId)}
        />
      )}
      {value.districtId && (
        <TextField
          label={t('field.street')}
          placeholder={t('field.street.placeholder')}
          autoComplete="street-address"
          value={value.street ?? ''}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
          error={required(value.street?.trim())}
        />
      )}
    </Section>
  )
}
