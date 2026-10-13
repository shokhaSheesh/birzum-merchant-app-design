import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { locationsStore } from '@/entities/merchant/locations'
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

/** Create or edit one of the merchant's shops. */
export function LocationFormPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = locationsStore.get(id)

  const [name, setName] = useState(existing?.name ?? '')
  const [address, setAddress] = useState(existing?.address ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [hours, setHours] = useState(existing?.hours ?? '')
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)

  const required = (value: string) =>
    submitted && value.trim() === '' ? t('error.required') : undefined

  const save = () => {
    setSubmitted(true)
    if (name.trim() === '' || address.trim() === '' || phone.length < PHONE_DIGITS) return
    locationsStore.save({
      id: existing?.id ?? newId(),
      name: name.trim(),
      address: address.trim(),
      phone,
      hours: hours.trim(),
      active,
    })
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
      <div className="flex flex-col gap-4">
        <TextField
          label={t('field.name')}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={required(name)}
        />
        <TextField
          label={t('field.address')}
          autoComplete="off"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={required(address)}
        />
        <PhoneField
          label={t('field.phone')}
          value={phone}
          onChange={setPhone}
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
        <TextField
          label={t('field.hours')}
          autoComplete="off"
          placeholder="09:00–20:00"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <Checkbox
          label={t('location.active')}
          description={t('location.active.hint')}
          checked={active}
          onChange={setActive}
        />
      </div>
    </FormScreen>
  )
}
