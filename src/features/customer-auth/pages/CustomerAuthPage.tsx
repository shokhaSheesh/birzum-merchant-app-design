import { Check, IdCard, LoaderCircle, ScanLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MARITAL_STATUSES, type MaritalStatus } from '@/entities/clients/clients'
import { LegalConsent } from '@/entities/legal/ui/LegalConsent'
import { setCustomerId } from '@/entities/session/customer'
import { afterSignIn, security } from '@/entities/session/security'
import logoOnDark from '@/shared/assets/logo-on-dark.svg'
import logo from '@/shared/assets/logo.svg'
import { useI18n } from '@/shared/i18n/useI18n'
import { isPassport } from '@/shared/lib/passport'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Button } from '@/shared/ui/Button'
import { CameraView } from '@/shared/ui/CameraView'
import type { Place } from '@/shared/lib/geocode'
import { AddressField } from '@/shared/ui/AddressField'
import { DatePicker } from '@/shared/ui/DatePicker'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { NumberField } from '@/shared/ui/NumberField'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { PassportField } from '@/shared/ui/PassportField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Select } from '@/shared/ui/Select'
import {
  QR_SCAN_MOCK_MS,
  registerCustomer,
  sendCustomerCode,
  verifyCustomerCode,
  verifyCustomerFace,
} from '../api/mockCustomerAuth'
import { PinLock } from '../components/PinLock'

/**
 * phone -> code -> home                      already registered
 * phone -> code -> details -> face -> done   signing up by themselves
 * phone -> qr -> face -> done                registered by a merchant, who showed a QR code
 * lock -> home                               returning, with a PIN set on this phone
 */
type Step = 'lock' | 'phone' | 'code' | 'details' | 'qr' | 'face' | 'done'

const MIN_AGE = 18

/** The shopper's single entry: there is no separate sign-up, the phone number decides. */
export function CustomerAuthPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(() => (security.hasPin() ? 'lock' : 'phone'))
  const [agreed, setAgreed] = useState(false)
  const [consentError, setConsentError] = useState(false)
  /** Where the face step goes back to: the details form or the QR scanner. */
  const [cameFromQr, setCameFromQr] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [passport, setPassport] = useState('')
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null)
  const [address, setAddress] = useState<Place | null>(null)
  const [latestBirthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate())
  })

  const goTo = (next: Step) => {
    setSubmitted(false)
    setLoading(false)
    setStep(next)
  }
  // A first sign-in sets up the PIN and shows the intro; later ones go straight home
  const enterApp = () => navigate(afterSignIn(), { replace: true })

  useEffect(() => {
    if (step !== 'qr') return
    // Mock: the real screen moves on when the scanner reads the merchant's code
    const timer = setTimeout(() => setStep('face'), QR_SCAN_MOCK_MS)
    return () => clearTimeout(timer)
  }, [step])

  const submitPhone = async () => {
    setSubmitted(true)
    setConsentError(!agreed)
    if (phone.length < PHONE_DIGITS || !agreed) return
    setLoading(true)
    await sendCustomerCode(phone)
    goTo('code')
  }

  const submitDetails = async () => {
    setSubmitted(true)
    if (!isPassport(passport) || !birthDate || !address || !maritalStatus || !monthlyIncome) return
    setLoading(true)
    await registerCustomer(phone, { passport, birthDate, address, maritalStatus, monthlyIncome })
    setCameFromQr(false)
    goTo('face')
  }

  const captureFace = async () => {
    setLoading(true)
    const result = await verifyCustomerFace()
    setFullName(result.fullName)
    goTo('done')
  }

  if (step === 'lock') {
    return <PinLock onUnlock={enterApp} onSignIn={() => goTo('phone')} />
  }

  if (step === 'code') {
    return (
      <OtpScreen
        subtitle={t('code.subtitle', { phone: formatPhone(phone) })}
        onBack={() => goTo('phone')}
        headerEnd={<LanguageSwitcher />}
        resend={() => sendCustomerCode(phone)}
        verify={async (code) => {
          const { registered, clientId } = await verifyCustomerCode(phone, code)
          if (clientId) setCustomerId(clientId)
          if (registered) enterApp()
          else goTo('details')
        }}
        onVerified={() => {}}
      />
    )
  }

  if (step === 'details') {
    const required = (filled: boolean) => (submitted && !filled ? t('error.required') : undefined)
    return (
      <FormScreen
        onSubmit={() => void submitDetails()}
        onBack={() => goTo('phone')}
        progress={{ step: 1, total: 2 }}
        footer={
          <Button type="submit" block loading={loading}>
            {t('common.continue')}
          </Button>
        }
      >
        <IconBadge icon={IdCard} />
        <ScreenIntro
          title={t('customer.details.title')}
          subtitle={t('customer.details.subtitle')}
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
          <AddressField
            label={t('field.propiska')}
            hint={t('field.propiska.hint')}
            placeholder={t('field.propiska.placeholder')}
            value={address}
            onChange={setAddress}
            error={required(address !== null)}
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

  if (step === 'qr') {
    return (
      <FormScreen onSubmit={() => {}} onBack={() => goTo('phone')}>
        <ScreenIntro title={t('customer.qr.title')} subtitle={t('customer.qr.hint')} />
        <CameraView guide="qr" facing="environment" unavailableText={t('myid.scan.noCamera')} />
        <p
          role="status"
          className="flex items-center justify-center gap-2 text-sm font-medium text-ink-muted"
        >
          <LoaderCircle size={18} className="animate-spin" aria-hidden />
          {t('customer.qr.searching')}
        </p>
      </FormScreen>
    )
  }

  if (step === 'face') {
    return (
      <FormScreen
        onSubmit={() => void captureFace()}
        onBack={() => goTo(cameFromQr ? 'phone' : 'details')}
        progress={cameFromQr ? undefined : { step: 2, total: 2 }}
        footer={
          <Button type="submit" block loading={loading}>
            {t('myid.scan.capture')}
          </Button>
        }
      >
        <ScreenIntro title={t('customer.face.title')} subtitle={t('customer.face.hint')} />
        <CameraView guide="face" facing="user" unavailableText={t('myid.scan.noCamera')} />
      </FormScreen>
    )
  }

  if (step === 'done') {
    return (
      <FormScreen
        onSubmit={enterApp}
        footer={
          <Button type="submit" block>
            {t('customer.done.start')}
          </Button>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-green-500 text-navy-950">
            <Check size={40} strokeWidth={3} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-ink-muted">{t('customer.done.title')}</p>
            <h1 className="text-2xl leading-tight font-bold text-balance">{fullName}</h1>
          </div>
        </div>
      </FormScreen>
    )
  }

  return (
    <FormScreen
      onSubmit={() => void submitPhone()}
      headerEnd={<LanguageSwitcher />}
      footer={
        <div className="flex flex-col gap-4">
          <LegalConsent
            text="consent.signIn"
            documents={['terms', 'privacy']}
            checked={agreed}
            onChange={(on) => {
              setAgreed(on)
              if (on) setConsentError(false)
            }}
            error={consentError ? t('consent.required') : undefined}
          />
          <Button type="submit" block loading={loading}>
            {t('auth.confirm.send')}
          </Button>
        </div>
      }
    >
      <img src={logo} alt="Birzum nasiya" className="h-12 self-start dark:hidden" />
      <img src={logoOnDark} alt="Birzum nasiya" className="hidden h-12 self-start dark:block" />
      <ScreenIntro title={t('customer.login.title')} subtitle={t('customer.login.subtitle')} />
      <PhoneField
        label={t('field.phone')}
        value={phone}
        onChange={setPhone}
        error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
      />
      <div className="flex items-center gap-3 text-sm text-ink-subtle">
        <span className="h-px flex-1 bg-line" />
        {t('customer.login.or')}
        <span className="h-px flex-1 bg-line" />
      </div>
      <ActionCard
        icon={ScanLine}
        title={t('customer.qr.card.title')}
        description={t('customer.qr.card.hint')}
        onClick={() => {
          // The QR route skips the phone, but not the agreement
          if (!agreed) {
            setConsentError(true)
            return
          }
          setCameFromQr(true)
          goTo('qr')
        }}
      />
    </FormScreen>
  )
}
