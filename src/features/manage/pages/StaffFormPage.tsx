import { UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { locationsStore } from '@/entities/merchant/locations'
import { loadLocations, loadStaff, removeStaff, saveStaff } from '@/entities/merchant/merchantApi'
import { ROLE_IDS, type RoleId } from '@/entities/merchant/roles'
import { currentStaffId, staffStore } from '@/entities/merchant/staff'
import { toastError } from '@/shared/api/client'
import { useRemote } from '@/shared/api/useRemote'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { PasswordField } from '@/shared/ui/PasswordField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'
import { TextField } from '@/shared/ui/TextField'
import { DeleteRecord } from '../components/DeleteRecord'
import { LoadGate } from '../components/LoadGate'

const PINFL_DIGITS = 14
const MIN_PASSWORD = 8
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

/**
 * Create or edit a staff member with the fields FlexSoft asks for (login, name, email, phone,
 * JSHSHIR, password), then the role and the shops they work in. When editing, an empty password
 * keeps the old one.
 */
export function StaffFormPage() {
  const remote = useRemote(() => Promise.all([loadStaff(), loadLocations()]))
  return (
    <LoadGate loading={remote.loading} failed={remote.failed} onRetry={remote.reload}>
      <StaffForm />
    </LoadGate>
  )
}

function StaffForm() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = staffStore.get(id)
  const locations = locationsStore.useAll()

  const [firstName, setFirstName] = useState(existing?.firstName ?? '')
  const [lastName, setLastName] = useState(existing?.lastName ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [login, setLogin] = useState(existing?.login ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  // The server returns the JSHSHIR masked, so an edit starts empty and empty keeps the stored one
  const [pinfl, setPinfl] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState(existing?.temporaryPassword ?? true)
  const [roleId, setRoleId] = useState<RoleId | null>(existing?.roleId ?? null)
  const [locationIds, setLocationIds] = useState<string[]>(existing?.locationIds ?? [])
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const required = (value: string) =>
    submitted && value.trim() === '' ? t('error.required') : undefined
  // A new account needs a password; an edit changes it only when one is typed
  const passwordError =
    (!existing || password !== '') && password.length < MIN_PASSWORD
      ? t('staff.password.short', { count: String(MIN_PASSWORD) })
      : undefined
  const repeatError = password !== passwordRepeat ? t('staff.password.mismatch') : undefined
  const pinflValid = pinfl.length === PINFL_DIGITS || (!!existing && pinfl === '')
  const toggleLocation = (locationId: string, on: boolean) =>
    setLocationIds((list) => (on ? [...list, locationId] : list.filter((x) => x !== locationId)))

  const save = async () => {
    setSubmitted(true)
    const filled = [firstName, lastName, login].every((value) => value.trim() !== '')
    if (
      !filled ||
      (email.trim() !== '' && !isEmail(email)) ||
      phone.length < PHONE_DIGITS ||
      !pinflValid ||
      passwordError ||
      repeatError ||
      !roleId ||
      locationIds.length === 0
    )
      return
    setSaving(true)
    try {
      await saveStaff(existing?.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        login: login.trim(),
        email: email.trim(),
        pinfl,
        password,
        temporaryPassword,
        roleId,
        locationIds,
        active,
      })
      toast(t('toast.saved'))
      navigate(-1)
    } catch (error) {
      toastError(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormScreen
      onSubmit={save}
      onBack={() => navigate(-1)}
      footer={
        <Button type="submit" block loading={saving}>
          {t('common.save')}
        </Button>
      }
    >
      <IconBadge icon={UserRound} />
      <ScreenIntro title={t(existing ? 'staff.edit' : 'staff.new')} />
      <div className="flex flex-col gap-4">
        <TextField
          label={t('field.login')}
          autoComplete="off"
          autoCapitalize="none"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          error={required(login)}
        />
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
        <TextField
          label={t('field.email')}
          type="email"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          placeholder="name@example.uz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={
            submitted && email.trim() !== '' && !isEmail(email)
              ? t('staff.email.invalid')
              : undefined
          }
        />
        <PhoneField
          label={t('field.phone')}
          value={phone}
          onChange={setPhone}
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
        <TextField
          label={t('clients.pinfl')}
          inputMode="numeric"
          autoComplete="off"
          placeholder={t('staff.pinfl.placeholder')}
          value={pinfl}
          onChange={(e) => setPinfl(e.target.value.replace(/\D/g, '').slice(0, PINFL_DIGITS))}
          hint={existing?.pinfl ? t('staff.pinfl.keep', { pinfl: existing.pinfl }) : undefined}
          error={submitted && !pinflValid ? t('staff.pinfl.invalid') : undefined}
        />
        <PasswordField
          label={t('field.password')}
          autoComplete="new-password"
          hint={existing ? t('staff.password.keep') : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted ? passwordError : undefined}
        />
        <PasswordField
          label={t('staff.password.repeat')}
          autoComplete="new-password"
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
          error={submitted ? repeatError : undefined}
        />
        <Checkbox
          label={t('staff.password.temporary')}
          description={t('staff.password.temporary.hint')}
          checked={temporaryPassword}
          onChange={setTemporaryPassword}
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
          blocked={existing.id === currentStaffId() ? t('staff.self') : undefined}
          onDelete={async () => {
            await removeStaff(existing.id)
            navigate(-1)
          }}
        />
      )}
    </FormScreen>
  )
}
