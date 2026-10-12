import { MessageSquareText, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CODE_LENGTH, RESEND_AFTER_SECONDS } from '@/shared/config/otp'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui/Button'
import { IconBadge } from '@/shared/ui/IconBadge'
import { OtpField } from '@/shared/ui/OtpField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ResendCode } from '@/shared/ui/ResendCode'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { sendLoginCode, verifyLoginCode } from '../api/mockAuth'
import { AuthLayout } from '../components/AuthLayout'

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
  const [secondsLeft, setSecondsLeft] = useCountdown()

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
        <ScreenIntro title={t('auth.confirm.title')} subtitle={t('auth.confirm.subtitle')} />
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
          {t('code.submit')}
        </Button>
      }
    >
      <IconBadge icon={MessageSquareText} />
      <ScreenIntro
        title={t('code.title')}
        subtitle={t('code.subtitle', { phone: formatPhone(phone) })}
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
    </AuthLayout>
  )
}
