import { UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { locationsStore } from '@/entities/merchant/locations'
import { ROLE_IDS, type RoleId } from '@/entities/merchant/roles'
import { CURRENT_STAFF_ID, staffStore } from '@/entities/merchant/staff'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { newId } from '@/shared/lib/createStore'
import { PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'
import { TextField } from '@/shared/ui/TextField'
import { DeleteRecord } from '../components/DeleteRecord'

/** Create or edit a staff member: who they are, their role, and the shops they work in. */
export function StaffFormPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = staffStore.get(id)
  const locations = locationsStore.useAll()

  const [firstName, setFirstName] = useState(existing?.firstName ?? '')
  const [lastName, setLastName] = useState(existing?.lastName ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [login, setLogin] = useState(existing?.login ?? '')
  const [roleId, setRoleId] = useState<RoleId | null>(existing?.roleId ?? null)
  const [locationIds, setLocationIds] = useState<string[]>(existing?.locationIds ?? [])
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)

  const required = (value: string) =>
    submitted && value.trim() === '' ? t('error.required') : undefined
  const toggleLocation = (locationId: string, on: boolean) =>
    setLocationIds((list) => (on ? [...list, locationId] : list.filter((x) => x !== locationId)))

  const save = () => {
    setSubmitted(true)
    const filled = [firstName, lastName, login].every((value) => value.trim() !== '')
    if (!filled || phone.length < PHONE_DIGITS || !roleId || locationIds.length === 0) return
    staffStore.save({
      ...existing,
      id: existing?.id ?? newId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone,
      login: login.trim(),
      roleId,
      locationIds,
      active,
    })
    toast(t('toast.saved'))
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
      <IconBadge icon={UserRound} />
      <ScreenIntro title={t(existing ? 'staff.edit' : 'staff.new')} />
      <div className="flex flex-col gap-4">
        <TextField
          label={t('field.firstName')}
          autoComplete="off"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={required(firstName)}
        />
        <TextField
          label={t('field.lastName')}
          autoComplete="off"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={required(lastName)}
        />
        <PhoneField
          label={t('field.phone')}
          value={phone}
          onChange={setPhone}
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
        <TextField
          label={t('field.login')}
          autoComplete="off"
          autoCapitalize="none"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          error={required(login)}
        />
        <Select
          label={t('field.role')}
          options={ROLE_IDS.map((id) => ({ value: id, label: t(`staff.role.${id}`) }))}
          value={roleId}
          onChange={setRoleId}
          hint={t('staff.role.hint')}
          error={submitted && !roleId ? t('error.required') : undefined}
        />
      </div>

      <Section title={t('staff.locations')}>
        <div className="flex flex-col">
          {locations.map((location) => (
            <Checkbox
              key={location.id}
              label={tl(location.name)}
              description={tl(location.address)}
              checked={locationIds.includes(location.id)}
              onChange={(on) => toggleLocation(location.id, on)}
            />
          ))}
        </div>
        {submitted && locationIds.length === 0 && (
          <p role="alert" className="text-sm text-danger">
            {t('error.pickLocation')}
          </p>
        )}
      </Section>

      <Checkbox
        label={t('staff.active')}
        description={t('staff.active.hint')}
        checked={active}
        onChange={setActive}
      />
      {existing && (
        <DeleteRecord
          blocked={existing.id === CURRENT_STAFF_ID ? t('staff.self') : undefined}
          onDelete={() => {
            staffStore.remove(existing.id)
            navigate(-1)
          }}
        />
      )}
    </FormScreen>
  )
}
