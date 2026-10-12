import { Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { IconBadge } from '@/shared/ui/IconBadge'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { sendLoginCode, verifyLoginCode } from '../api/mockAuth'
import { AuthLayout } from '../components/AuthLayout'

/** Daily login confirmation: phone number first, then the SMS code. */
export function ConfirmLoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const submitPhone = async () => {
    setSubmitted(true)
    if (phone.length < PHONE_DIGITS) return
    setLoading(true)
    await sendLoginCode(phone)
    setLoading(false)
    setStep('code')
  }

  if (step === 'code') {
    return (
      <OtpScreen
        subtitle={t('code.subtitle', { phone: formatPhone(phone) })}
        onBack={() => setStep('phone')}
        headerEnd={<LanguageSwitcher />}
        resend={() => sendLoginCode(phone)}
        verify={(code) => verifyLoginCode(phone, code)}
        onVerified={() => navigate(ROUTES.clients, { replace: true })}
      />
    )
  }

  return (
    <AuthLayout
      onSubmit={() => void submitPhone()}
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
