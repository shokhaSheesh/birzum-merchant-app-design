import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { locationsStore } from '@/entities/merchant/locations'
import { staffStore } from '@/entities/merchant/staff'
import type { Lang, LocalizedText } from '@/shared/i18n/dictionaries'
import { emptyText, fillMissing, missingLang, withLang } from '@/shared/i18n/localized'
import { useI18n } from '@/shared/i18n/useI18n'
import { newId } from '@/shared/lib/createStore'
import { PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { TextField } from '@/shared/ui/TextField'
import { DeleteRecord } from '../components/DeleteRecord'
import { FormLanguage } from '../components/FormLanguage'

/** Create or edit one of the merchant's shops. Shoppers read its name and address, so both are per language. */
export function LocationFormPage() {
  const { t, lang: appLang } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = locationsStore.get(id)

  const [lang, setLang] = useState<Lang>(appLang)
  const [name, setName] = useState<LocalizedText>(existing?.name ?? emptyText())
  const [address, setAddress] = useState<LocalizedText>(existing?.address ?? emptyText())
  const [hours, setHours] = useState<LocalizedText>(existing?.hours ?? emptyText())
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)

  const bothLanguages = (text: LocalizedText) =>
    submitted && text[lang].trim() === '' ? t('error.bothLanguages') : undefined

  const save = () => {
    setSubmitted(true)
    const missing = missingLang([name, address])
    if (missing) setLang(missing)
    if (missing || phone.length < PHONE_DIGITS) return
    locationsStore.save({
      id: existing?.id ?? newId(),
      name: fillMissing(name),
      address: fillMissing(address),
      hours: fillMissing(hours),
      phone,
      active,
    })
    navigate(-1)
  }

  const remove = () => {
    if (!existing) return
    // Nobody stays assigned to a shop that no longer exists
    for (const member of staffStore.getAll()) {
      staffStore.update(member.id, {
        locationIds: member.locationIds.filter((locationId) => locationId !== existing.id),
      })
    }
    locationsStore.remove(existing.id)
    navigate(-1)
  }

  return (
    <FormScreen
      onSubmit={save}
      onBack={() => navigate(-1)}
      footer={
        <Button type="submit" block>
          {t('common.save')}
        </Button>
      }
    >
      <IconBadge icon={MapPin} />
      <ScreenIntro title={t(existing ? 'location.edit' : 'location.new')} />
      <FormLanguage
        value={lang}
        onChange={setLang}
        onFillEmpty={() => {
          setName(fillMissing(name))
          setAddress(fillMissing(address))
          setHours(fillMissing(hours))
        }}
      />
      <div className="flex flex-col gap-4">
        <TextField
          label={t('field.name')}
          autoComplete="off"
          value={name[lang]}
          onChange={(e) => setName(withLang(name, lang, e.target.value))}
          error={bothLanguages(name)}
        />
        <TextField
          label={t('field.address')}
          autoComplete="off"
          value={address[lang]}
          onChange={(e) => setAddress(withLang(address, lang, e.target.value))}
          error={bothLanguages(address)}
        />
        <TextField
          label={t('field.hours')}
          autoComplete="off"
          placeholder="09:00–20:00"
          value={hours[lang]}
          onChange={(e) => setHours(withLang(hours, lang, e.target.value))}
        />
        <PhoneField
          label={t('field.phone')}
          value={phone}
          onChange={setPhone}
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
        <Checkbox
          label={t('location.active')}
          description={t('location.active.hint')}
          checked={active}
          onChange={setActive}
        />
      </div>
      {existing && <DeleteRecord onDelete={remove} />}
    </FormScreen>
  )
}
