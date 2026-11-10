import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { locationsStore, type WorkDay } from '@/entities/merchant/locations'
import { loadLocations, removeLocation, saveLocation } from '@/entities/merchant/merchantApi'
import { toastError } from '@/shared/api/client'
import { useRemote } from '@/shared/api/useRemote'
import { calendarNames, type LocalizedText } from '@/shared/i18n/dictionaries'
import { emptyText, fillMissing, isComplete } from '@/shared/i18n/localized'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { LocalizedTextField } from '@/shared/ui/LocalizedTextField'
import { MapPicker } from '@/shared/ui/MapPicker'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Section } from '@/shared/ui/Section'
import { DeleteRecord } from '../components/DeleteRecord'
import { LoadGate } from '../components/LoadGate'

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7]
const DEFAULT_HOURS = { open: '09:00', close: '18:00' }
const timeInput =
  'h-10 w-[5.5rem] rounded-control border border-line bg-canvas px-2 text-center text-base outline-none focus:border-brand'

/** Create or edit one of the merchant's shops. Shoppers read its name and address, so both are per language. */
export function LocationFormPage() {
  const remote = useRemote(loadLocations)
  return (
    <LoadGate loading={remote.loading} failed={remote.failed} onRetry={remote.reload}>
      <LocationForm />
    </LoadGate>
  )
}

function LocationForm() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = locationsStore.get(id)

  const [name, setName] = useState<LocalizedText>(existing?.name ?? emptyText())
  const [address, setAddress] = useState<LocalizedText>(existing?.address ?? emptyText())
  const [schedule, setSchedule] = useState<WorkDay[]>(existing?.schedule ?? [])
  const [point, setPoint] = useState(existing?.point ?? null)
  const [mapOpen, setMapOpen] = useState(false)
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const dayOf = (weekday: number) => schedule.find((day) => day.weekday === weekday)
  const setDay = (weekday: number, patch: Partial<WorkDay> | null) =>
    setSchedule((list) => {
      const rest = list.filter((day) => day.weekday !== weekday)
      if (patch === null) return rest
      const current = list.find((day) => day.weekday === weekday) ?? { weekday, ...DEFAULT_HOURS }
      return [...rest, { ...current, ...patch }].sort((a, b) => a.weekday - b.weekday)
    })
  const scheduleInvalid = schedule.some((day) => !day.open || !day.close || day.open >= day.close)

  const save = async () => {
    setSubmitted(true)
    if (!isComplete(name) || !isComplete(address) || phone.length < PHONE_DIGITS || scheduleInvalid)
      return
    setSaving(true)
    try {
      await saveLocation(existing?.id, {
        name: fillMissing(name),
        address: fillMissing(address),
        phone,
        active,
        schedule,
        point,
      })
      toast(t('toast.saved'))
      navigate(-1)
    } catch (error) {
      toastError(error)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!existing) return
    await removeLocation(existing.id)
    navigate(-1)
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

      <Section title={t('location.point')}>
        <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-canvas p-4">
          <p className="min-w-0 truncate">
            {point ? `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}` : t('location.point.none')}
          </p>
          <div className="flex shrink-0 gap-2">
            {point && (
              <Button variant="ghost" onClick={() => setPoint(null)}>
                {t('location.point.clear')}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setMapOpen(true)}>
              {t('location.point.set')}
            </Button>
          </div>
        </div>
        <MapPicker
          open={mapOpen}
          title={t('location.point')}
          value={point ? { ...point, text: '' } : null}
          onClose={() => setMapOpen(false)}
          onPick={(place) => {
            setPoint({ lat: place.lat, lng: place.lng })
            setMapOpen(false)
          }}
        />
      </Section>

      <Section title={t('location.schedule')} hint="09:00–18:00">
        <ul className="rounded-card border border-line bg-canvas px-4">
          {WEEKDAYS.map((weekday) => {
            const day = dayOf(weekday)
            const bad = submitted && !!day && (!day.open || !day.close || day.open >= day.close)
            return (
              <li
                key={weekday}
                className="flex min-h-14 items-center gap-3 border-b border-line py-2 last:border-b-0"
              >
                <div className="w-24 shrink-0">
                  <Checkbox
                    label={calendarNames[lang].weekdays[weekday - 1]}
                    checked={!!day}
                    onChange={(on) => setDay(weekday, on ? {} : null)}
                  />
                </div>
                {day ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      aria-label={`${calendarNames[lang].weekdays[weekday - 1]} 1`}
                      value={day.open}
                      onChange={(e) => setDay(weekday, { open: e.target.value })}
                      className={timeInput}
                    />
                    <span aria-hidden>–</span>
                    <input
                      type="time"
                      aria-label={`${calendarNames[lang].weekdays[weekday - 1]} 2`}
                      value={day.close}
                      onChange={(e) => setDay(weekday, { close: e.target.value })}
                      className={timeInput}
                    />
                    {bad && <span className="text-sm text-danger">!</span>}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">{t('location.schedule.off')}</p>
                )}
              </li>
            )
          })}
        </ul>
      </Section>

      {existing && <DeleteRecord onDelete={remove} />}
    </FormScreen>
  )
}
