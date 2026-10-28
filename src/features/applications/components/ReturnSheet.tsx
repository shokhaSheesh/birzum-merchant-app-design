import { Info } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { sendReturnCode, returnApplication } from '@/entities/clients/applicationsApi'
import {
  RETURN_REASONS,
  type Actor,
  type Application,
  type ReturnReason,
} from '@/entities/clients/clients'
import { CODE_LENGTH, RESEND_AFTER_SECONDS } from '@/shared/config/otp'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { toast } from '@/shared/lib/toast'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui/Button'
import { OtpField } from '@/shared/ui/OtpField'
import { ResendCode } from '@/shared/ui/ResendCode'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { TextAreaField } from '@/shared/ui/TextAreaField'

type Props = {
  application: Application
  /** The client's phone, nine digits after +998: the code goes there. */
  phone: string
  by: Actor
  onClose: () => void
}

/** "+998 90 *** ** 67": enough for the seller to check it is the client's number. */
const maskPhone = (phone: string) => `+998 ${phone.slice(0, 2)} *** ** ${phone.slice(-2)}`

/**
 * A handed-over contract taken back at the shop. First the reason (and a reminder that the shop
 * gives back the down payment itself); then the SMS code that went to the client, which the
 * client reads out and the seller types in. The right code cancels the contract.
 */
export function ReturnSheet({ application, phone, by, onClose }: Props) {
  const { t } = useI18n()
  const [step, setStep] = useState<'reason' | 'code'>('reason')
  const [reason, setReason] = useState<ReturnReason | null>(null)
  const [comment, setComment] = useState('')
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useCountdown(0)
  const downPayment = application.details?.downPayment ?? 0
  // "Other" says nothing on its own, so it needs the comment
  const commentMissing = reason === 'other' && comment.trim() === ''

  const sendCode = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!reason || commentMissing) return
    setLoading(true)
    await sendReturnCode(application.id)
    setLoading(false)
    setSecondsLeft(RESEND_AFTER_SECONDS)
    setStep('code')
  }

  const resend = async () => {
    setLoading(true)
    await sendReturnCode(application.id)
    setLoading(false)
    setCode('')
    setWrong(false)
    setSecondsLeft(RESEND_AFTER_SECONDS)
  }

  const confirm = async (e: FormEvent) => {
    e.preventDefault()
    if (!reason || code.length < CODE_LENGTH) return
    setLoading(true)
    try {
      await returnApplication(application.id, code, reason, comment.trim(), by)
    } catch {
      setWrong(true)
      setCode('')
      setLoading(false)
      return
    }
    toast(t('return.done'))
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t('return.title')}>
      {step === 'reason' ? (
        <form
          onSubmit={(e) => void sendCode(e)}
          noValidate
          className="flex flex-col gap-4 pt-1 pb-1"
        >
          <p className="text-sm text-ink-muted">{t('return.intro')}</p>
          <Select
            label={t('return.reason')}
            options={RETURN_REASONS.map((value) => ({
              value,
              label: t(`return.reason.${value}`),
            }))}
            value={reason}
            onChange={setReason}
            error={submitted && !reason ? t('error.required') : undefined}
          />
          <TextAreaField
            label={t('field.comment')}
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            error={submitted && commentMissing ? t('error.required') : undefined}
          />
          {downPayment > 0 && (
            <p className="flex gap-2.5 rounded-control bg-surface px-4 py-3 text-sm text-navy-700">
              <Info size={18} className="mt-0.5 shrink-0" />
              {t('return.downPayment', { amount: formatSum(downPayment) })}
            </p>
          )}
          <p className="text-sm text-ink-muted">
            {t('return.codeTo', { phone: maskPhone(phone) })}
          </p>
          <Button type="submit" block loading={loading} className="mt-1">
            {t('return.sendCode')}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => void confirm(e)}
          noValidate
          className="flex flex-col gap-4 pt-1 pb-1"
        >
          <p className="text-sm text-ink-muted">
            {t('return.askCode', { phone: maskPhone(phone) })}
          </p>
          <OtpField
            label={t('field.code')}
            value={code}
            onChange={(value) => {
              setCode(value)
              setWrong(false)
            }}
            error={wrong ? t('return.wrongCode') : undefined}
            autoFocus
          />
          <ResendCode secondsLeft={secondsLeft} onResend={() => void resend()} disabled={loading} />
          <Button
            type="submit"
            variant="danger"
            block
            loading={loading}
            disabled={code.length < CODE_LENGTH}
            className="mt-1"
          >
            {t('return.confirm')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
