import { IdCard, Smartphone } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { isPassport } from '@/shared/lib/passport'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { DatePicker } from '@/shared/ui/DatePicker'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { NumberField } from '@/shared/ui/NumberField'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { PassportField } from '@/shared/ui/PassportField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Select } from '@/shared/ui/Select'
import {
  createClient,
  sendCardCode,
  sendClientCode,
  verifyCardCode,
  verifyClientCode,
} from '../api/mockClients'
import { CardForm } from '../components/CardForm'
import { MyIdStep } from '../components/MyIdStep'
import { MARITAL_STATUSES, type MaritalStatus } from '../data/clients'

const STEPS = ['phone', 'phoneCode', 'details', 'myid', 'card', 'cardCode'] as const
type Step = (typeof STEPS)[number]

const MIN_AGE = 18

/**
 * Create a client: card-linked phone and SMS code, passport details, MyID check,
 * then the bank card and its SMS code. The client is saved only after the last step.
 */
export function NewClientPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [phone, setPhone] = useState('')
  const [passport, setPassport] = useState('')
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [latestBirthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate())
  })

  const progress = { step: STEPS.indexOf(step) + 1, total: STEPS.length }
  const backToList = () => navigate(ROUTES.clients)
  const goTo = useCallback((next: Step) => {
    setSubmitted(false)
    setLoading(false)
    setStep(next)
  }, [])
  const goToCard = useCallback(() => goTo('card'), [goTo])

  const submitPhone = async () => {
    setSubmitted(true)
    if (phone.length < PHONE_DIGITS) return
    setLoading(true)
    await sendClientCode(phone)
    goTo('phoneCode')
  }

  const submitDetails = () => {
    setSubmitted(true)
    if (isPassport(passport) && birthDate && maritalStatus && monthlyIncome) goTo('myid')
  }

  const saveClient = async () => {
    if (!birthDate || !maritalStatus || !monthlyIncome) return
    const client = await createClient({
      phone,
      passport,
      birthDate,
      maritalStatus,
      monthlyIncome,
      cardNumber,
      cardExpiry,
    })
    navigate(clientPath(client.id), { replace: true })
  }

  if (step === 'phone') {
    return (
      <FormScreen
        onSubmit={() => void submitPhone()}
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

  if (step === 'phoneCode') {
    return (
      <OtpScreen
        subtitle={t('clients.new.code.subtitle', { phone: formatPhone(phone) })}
        onBack={() => goTo('phone')}
        progress={progress}
        resend={() => sendClientCode(phone)}
        verify={(code) => verifyClientCode(phone, code)}
        onVerified={() => goTo('details')}
      />
    )
  }

  if (step === 'myid') {
    return <MyIdStep progress={progress} onBack={() => goTo('details')} onDone={goToCard} />
  }

  if (step === 'card') {
    return (
      <CardForm
        progress={progress}
        onBack={() => goTo('details')}
        onCodeSent={(number, expiry) => {
          setCardNumber(number)
          setCardExpiry(expiry)
          goTo('cardCode')
        }}
      />
    )
  }

  if (step === 'cardCode') {
    return (
      <OtpScreen
        subtitle={t('card.code.subtitle', { phone: formatPhone(phone) })}
        onBack={() => goTo('card')}
        progress={progress}
        resend={() => sendCardCode(cardNumber, cardExpiry)}
        verify={(code) => verifyCardCode(cardNumber, code)}
        onVerified={saveClient}
      />
    )
  }

  const required = (filled: boolean) => (submitted && !filled ? t('error.required') : undefined)

  return (
    <FormScreen
      onSubmit={submitDetails}
      onBack={backToList}
      progress={progress}
      footer={
        <Button type="submit" block>
          {t('common.continue')}
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
