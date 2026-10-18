import { Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  changeCustomerPhone,
  phoneTaken,
  sendCustomerCode,
  verifyCustomerCode,
} from '@/features/customer-auth/api/mockCustomerAuth'
import { useCustomer } from '@/entities/session/customer'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { OtpScreen } from '@/shared/ui/OtpScreen'
import { PhoneField } from '@/shared/ui/PhoneField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'

/** A new phone number for the shopper: the number, then the SMS code sent to it. */
export function ChangePhonePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const customer = useCustomer()
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  if (!customer) return null

  const problem =
    phone.length < PHONE_DIGITS
      ? t('auth.error.phone')
      : phone === customer.phone
        ? t('phone.error.same')
        : phoneTaken(phone)
          ? t('phone.error.taken')
          : undefined

  const submit = async () => {
    setSubmitted(true)
    if (problem) return
    setLoading(true)
    await sendCustomerCode(phone)
    setLoading(false)
    setStep('code')
  }

  if (step === 'code')
    return (
      <OtpScreen
        subtitle={t('code.subtitle', { phone: formatPhone(phone) })}
        onBack={() => setStep('phone')}
        resend={() => sendCustomerCode(phone)}
        verify={async (code) => {
          await verifyCustomerCode(phone, code)
        }}
        onVerified={async () => {
          await changeCustomerPhone(customer.id, phone)
          toast(t('phone.changed'))
          navigate(-1)
        }}
      />
    )

  return (
    <FormScreen
      onSubmit={() => void submit()}
      onBack={() => navigate(-1)}
      footer={
        <Button type="submit" block loading={loading}>
          {t('phone.send')}
        </Button>
      }
    >
      <IconBadge icon={Smartphone} />
      <ScreenIntro
        title={t('phone.title')}
        subtitle={t('phone.subtitle', { phone: formatPhone(customer.phone) })}
      />
      <PhoneField
        label={t('phone.new')}
        value={phone}
        onChange={setPhone}
        autoFocus
        error={submitted ? problem : undefined}
      />
    </FormScreen>
  )
}
