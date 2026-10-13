import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { locationsStore } from '@/entities/merchant/locations'
import { staffStore } from '@/entities/merchant/staff'
import type { LocalizedText } from '@/shared/i18n/dictionaries'
import { emptyText, fillMissing, isComplete } from '@/shared/i18n/localized'
import { useI18n } from '@/shared/i18n/useI18n'
import { newId } from '@/shared/lib/createStore'
import { PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { LocalizedTextField } from '@/shared/ui/LocalizedTextField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { TextField } from '@/shared/ui/TextField'
import { DeleteRecord } from '../components/DeleteRecord'

/** Create or edit one of the merchant's shops. Shoppers read its name and address, so both are per language. */
export function LocationFormPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = locationsStore.get(id)

  const [name, setName] = useState<LocalizedText>(existing?.name ?? emptyText())
  const [address, setAddress] = useState<LocalizedText>(existing?.address ?? emptyText())
  const [hours, setHours] = useState(existing?.hours ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)

  const save = () => {
    setSubmitted(true)
    if (!isComplete(name) || !isComplete(address) || phone.length < PHONE_DIGITS) return
    locationsStore.save({
      id: existing?.id ?? newId(),
      name: fillMissing(name),
      address: fillMissing(address),
      hours: hours.trim(),
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
      <div className="flex flex-col gap-4">
        <LocalizedTextField
          label={t('field.name')}
          value={name}
          onChange={setName}
          requireBoth={submitted}
        />
        <LocalizedTextField
          label={t('field.address')}
          value={address}
          onChange={setAddress}
          requireBoth={submitted}
        />
        <TextField
          label={t('field.hours')}
          autoComplete="off"
          placeholder="09:00–20:00"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
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
