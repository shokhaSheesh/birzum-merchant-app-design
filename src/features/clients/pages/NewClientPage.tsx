import { IdCard, MessageSquareText, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CODE_LENGTH, RESEND_AFTER_SECONDS } from '@/shared/config/otp'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { isPassport } from '@/shared/lib/passport'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui/Button'
import { DatePicker } from '@/shared/ui/DatePicker'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { NumberField } from '@/shared/ui/NumberField'
import { OtpField } from '@/shared/ui/OtpField'
import { PassportField } from '@/shared/ui/PassportField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ResendCode } from '@/shared/ui/ResendCode'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Select } from '@/shared/ui/Select'
import { createClient, sendClientCode, verifyClientCode } from '../api/mockClients'
import { MARITAL_STATUSES, type MaritalStatus } from '../data/clients'

const STEPS = ['phone', 'code', 'details'] as const
type Step = (typeof STEPS)[number]

const MIN_AGE = 18

/** Create a client: card-linked phone number, SMS code, then passport details. */
export function NewClientPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeRejected, setCodeRejected] = useState(false)
  const [secondsLeft, setSecondsLeft] = useCountdown()

  const [passport, setPassport] = useState('')
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null)
  const [latestBirthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate())
  })

  const progress = { step: STEPS.indexOf(step) + 1, total: STEPS.length }
  const backToList = () => navigate(ROUTES.clients)
  const goTo = (next: Step) => {
    setSubmitted(false)
    setStep(next)
  }

  const requestCode = async () => {
    setLoading(true)
    await sendClientCode(phone)
    setLoading(false)
    setCode('')
    setCodeRejected(false)
    setSecondsLeft(RESEND_AFTER_SECONDS)
    goTo('code')
  }

  const submitPhone = () => {
    setSubmitted(true)
    if (phone.length === PHONE_DIGITS) void requestCode()
  }

  const verify = async (value: string) => {
    if (value.length < CODE_LENGTH || loading) return
    setLoading(true)
    try {
      await verifyClientCode(phone, value)
      goTo('details')
    } catch {
      setCodeRejected(true)
      setCode('')
    }
    setLoading(false)
  }

  const submitDetails = async () => {
    setSubmitted(true)
    if (!isPassport(passport) || !birthDate || !maritalStatus || !monthlyIncome) return

    setLoading(true)
    await createClient({ phone, passport, birthDate, maritalStatus, monthlyIncome })
    navigate(ROUTES.clients, { replace: true })
  }

  if (step === 'phone') {
    return (
      <FormScreen
        onSubmit={submitPhone}
        onBack={backToList}
        progress={progress}
        footer={
          <Button type="submit" block loading={loading}>
            {t('auth.confirm.send')}
          </Button>
        }
      >
        <IconBadge icon={Smartphone} />
        <ScreenIntro
          title={t('clients.new.phone.title')}
          subtitle={t('clients.new.phone.subtitle')}
        />
        <PhoneField
          label={t('field.phone')}
          value={phone}
          onChange={setPhone}
          autoFocus
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
      </FormScreen>
    )
  }

  if (step === 'code') {
    return (
      <FormScreen
        onSubmit={() => void verify(code)}
        onBack={() => goTo('phone')}
        progress={progress}
        footer={
          <Button type="submit" block loading={loading} disabled={code.length < CODE_LENGTH}>
            {t('code.submit')}
          </Button>
        }
      >
        <IconBadge icon={MessageSquareText} />
        <ScreenIntro
          title={t('code.title')}
          subtitle={t('clients.new.code.subtitle', { phone: formatPhone(phone) })}
        />
        <OtpField
          label={t('field.code')}
          length={CODE_LENGTH}
          value={code}
          autoFocus
          disabled={loading}
          error={codeRejected ? t('code.error') : undefined}
          onChange={(value) => {
            setCode(value)
            setCodeRejected(false)
            void verify(value)
          }}
        />
        <ResendCode
          secondsLeft={secondsLeft}
          disabled={loading}
          onResend={() => void requestCode()}
        />
      </FormScreen>
    )
  }

  const required = (filled: boolean) => (submitted && !filled ? t('error.required') : undefined)

  return (
    <FormScreen
      onSubmit={() => void submitDetails()}
      onBack={backToList}
      progress={progress}
      footer={
        <Button type="submit" block loading={loading}>
          {t('clients.new.submit')}
        </Button>
      }
    >
      <IconBadge icon={IdCard} />
      <ScreenIntro
        title={t('clients.new.details.title')}
        subtitle={t('clients.new.details.subtitle')}
      />
      <div className="flex flex-col gap-4">
        <PassportField
          label={t('field.passport')}
          value={passport}
          onChange={setPassport}
          error={
            submitted && !isPassport(passport)
              ? t(passport === '' ? 'error.required' : 'error.passport')
              : undefined
          }
        />
        <DatePicker
          label={t('field.birthDate')}
          value={birthDate}
          onChange={setBirthDate}
          max={latestBirthDate}
          error={required(birthDate !== null)}
        />
        <Select
          label={t('field.maritalStatus')}
          options={MARITAL_STATUSES.map((value) => ({ value, label: t(`marital.${value}`) }))}
          value={maritalStatus}
          onChange={setMaritalStatus}
          error={required(maritalStatus !== null)}
        />
        <NumberField
          label={t('field.monthlyIncome')}
          value={monthlyIncome}
          onChange={setMonthlyIncome}
          suffix={t('common.currency')}
          error={required(!!monthlyIncome)}
        />
      </div>
    </FormScreen>
  )
}
