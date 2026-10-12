import { MessageSquareText, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { OtpField } from '@/shared/ui/OtpField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { CODE_LENGTH, RESEND_AFTER_SECONDS, sendLoginCode, verifyLoginCode } from '../api/mockAuth'
import { AuthLayout } from '../components/AuthLayout'
import { IconBadge } from '../components/IconBadge'

const formatTimer = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Daily login confirmation: phone number first, then the SMS code. */
export function ConfirmLoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeRejected, setCodeRejected] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const requestCode = async () => {
    setLoading(true)
    await sendLoginCode(phone)
    setLoading(false)
    setCode('')
    setCodeRejected(false)
    setSecondsLeft(RESEND_AFTER_SECONDS)
    setStep('code')
  }

  const submitPhone = () => {
    setSubmitted(true)
    if (phone.length === PHONE_DIGITS) void requestCode()
  }

  const verify = async (value: string) => {
    if (value.length < CODE_LENGTH || loading) return
    setLoading(true)
    try {
      await verifyLoginCode(phone, value)
      navigate(ROUTES.clients, { replace: true })
    } catch {
      setCodeRejected(true)
      setCode('')
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <AuthLayout
        onSubmit={submitPhone}
        footer={
          <Button type="submit" block loading={loading}>
            {t('auth.confirm.send')}
          </Button>
        }
      >
        <IconBadge icon={Smartphone} />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold">{t('auth.confirm.title')}</h1>
          <p className="text-ink-muted">{t('auth.confirm.subtitle')}</p>
        </div>
        <PhoneField
          label={t('field.phone')}
          value={phone}
          onChange={setPhone}
          autoFocus
          error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
        />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      onSubmit={() => void verify(code)}
      onBack={() => setStep('phone')}
      footer={
        <Button type="submit" block loading={loading} disabled={code.length < CODE_LENGTH}>
          {t('auth.code.submit')}
        </Button>
      }
    >
      <IconBadge icon={MessageSquareText} />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold">{t('auth.code.title')}</h1>
        <p className="text-ink-muted">{t('auth.code.subtitle', { phone: formatPhone(phone) })}</p>
      </div>
      <OtpField
        label={t('field.code')}
        length={CODE_LENGTH}
        value={code}
        autoFocus
        disabled={loading}
        error={codeRejected ? t('auth.error.code') : undefined}
        onChange={(value) => {
          setCode(value)
          setCodeRejected(false)
          void verify(value)
        }}
      />
      {secondsLeft > 0 ? (
        <p className="text-center text-sm text-ink-muted">
          {t('auth.code.resendIn', { time: formatTimer(secondsLeft) })}
        </p>
      ) : (
        <Button variant="ghost" block disabled={loading} onClick={() => void requestCode()}>
          {t('auth.code.resend')}
        </Button>
      )}
    </AuthLayout>
  )
}
